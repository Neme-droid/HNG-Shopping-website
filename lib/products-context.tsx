'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PRODUCT_TABLE, findProduct, type Product } from './products';

type ProductsContextValue = { products: Product[]; error: string | null; getProduct: (slug: string) => Product | undefined; refresh: () => void };

const ProductsContext = createContext<ProductsContextValue | null>(null);

const POLL_MS = 60_000; // safety net if Realtime isn't enabled on the table
const FOCUS_MIN_MS = 15_000;

// The server layout fetches the catalogue from Supabase and hands it to this provider. When ANYTHING changes in the
// `products` table (Realtime), when the tab regains focus, or every minute, we call router.refresh(): Next re-runs the
// server components, the layout fetches again, and every page below (including server-rendered ones) updates in place.
export function ProductsProvider({ products, error, children }: { products: Product[]; error: string | null; children: ReactNode }) {
  const router = useRouter();
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const refresh = useCallback(() => {
    last.current = Date.now();
    router.refresh();
  }, [router]);

  useEffect(() => {
    const schedule = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(refresh, 400); // merge a burst of edits into one refresh
    };

    const supabase = createClient();
    const channel = supabase
      .channel('products-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: PRODUCT_TABLE }, schedule)
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - last.current > FOCUS_MIN_MS) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', refresh);
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);

    return () => {
      clearTimeout(timer.current);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', refresh);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const value = useMemo<ProductsContextValue>(() => ({ products, error, getProduct: (slug) => findProduct(products, slug), refresh }), [products, error, refresh]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside <ProductsProvider>');
  return ctx;
}
