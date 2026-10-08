import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCT_TABLE, findProduct, toProducts, type Product } from './products';
import { isSupabaseConfigured, supabase, supabaseUrl } from './supabase';

// The live product catalogue, read from the Supabase `products` table.
//  - cached in AsyncStorage so the app opens instantly (and offline) with the last known products
//  - re-fetched on launch, whenever the app returns to the foreground, every minute, on pull-to-refresh,
//    and immediately when anything in the table changes (Supabase Realtime)
const CACHE_KEY = 'terraverde-catalog-v1';
const POLL_MS = 60_000;
const FOREGROUND_MIN_MS = 15_000;

type Status = 'loading' | 'ready' | 'error';
type CatalogValue = {
  products: Product[];
  status: Status; // 'error' only when there is nothing to show
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  getProduct: (slug: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const signature = useRef('');
  const hasData = useRef(false);
  const inflight = useRef<Promise<void> | null>(null);
  const lastFetch = useRef(0);

  const apply = useCallback((list: Product[]) => {
    const sig = JSON.stringify(list);
    hasData.current = true;
    if (sig !== signature.current) {
      signature.current = sig; // skip re-rendering the whole app when nothing actually changed
      setProducts(list);
    }
    setStatus('ready');
    setError(null);
  }, []);

  const fetchNow = useCallback((): Promise<void> => {
    if (inflight.current) return inflight.current;
    const run = (async () => {
      lastFetch.current = Date.now();
      if (!isSupabaseConfigured) {
        if (!hasData.current) {
          setStatus('error');
          setError('The app’s Supabase URL or key is missing or invalid. Check EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.');
        }
        return;
      }
      try {
        const { data, error: dbError } = await supabase
          .from(PRODUCT_TABLE)
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true })
          .order('name', { ascending: true });
        if (dbError) throw new Error(dbError.message);
        const list = toProducts(data, supabaseUrl, (m) => console.warn('[catalog]', m));
        apply(list);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list)).catch(() => {});
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not load products.';
        // Keep showing what we already have (cache or earlier fetch); only surface an error when there is nothing.
        if (!hasData.current) {
          setStatus('error');
          setError(/network request failed|failed to fetch|fetch failed|timeout/i.test(message) ? 'Can’t reach the server. Check your internet connection and try again.' : message);
        }
      }
    })().finally(() => {
      inflight.current = null;
    });
    inflight.current = run;
    return run;
  }, [apply]);

  // 1) show the cached catalogue immediately, 2) fetch fresh data
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        const cached: unknown = raw ? JSON.parse(raw) : null;
        if (alive && !hasData.current && Array.isArray(cached) && cached.length > 0) apply(cached as Product[]);
      } catch {
        /* no usable cache */
      }
      if (alive) fetchNow();
    })();
    return () => {
      alive = false;
    };
  }, [apply, fetchNow]);

  // Live updates: any insert/update/delete on the table triggers a (debounced) re-fetch.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase
      .channel('products-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: PRODUCT_TABLE }, () => {
        clearTimeout(timer);
        timer = setTimeout(fetchNow, 400);
      })
      .subscribe();

    // Safety nets in case Realtime isn't enabled on the table: foreground + a minute timer.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && Date.now() - lastFetch.current > FOREGROUND_MIN_MS) fetchNow();
    });
    const poll = setInterval(() => {
      if (AppState.currentState === 'active') fetchNow();
    }, POLL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      sub.remove();
      supabase.removeChannel(channel);
    };
  }, [fetchNow]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (!hasData.current) setStatus('loading');
    await fetchNow();
    setRefreshing(false);
  }, [fetchNow]);

  const value = useMemo<CatalogValue>(
    () => ({ products, status, error, refreshing, refresh, getProduct: (slug) => findProduct(products, slug) }),
    [products, status, error, refreshing, refresh],
  );
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return ctx;
}
