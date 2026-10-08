import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '@/components/Toast';
import { useCatalog } from './catalog';
import { MAX_QTY, STORAGE_KEY, countItems, parseStoredCart, reducer, resolveLines, subtotal, type ResolvedLine } from './cart-logic';

export { MAX_QTY };
export type { ResolvedLine };

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotalCents: number;
  ready: boolean; // false until AsyncStorage has been read
  loading: boolean; // saved items exist but the catalogue hasn't loaded yet
  hiddenCount: number; // saved lines whose product isn't in Supabase right now
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct, status } = useCatalog();
  const [{ lines: stored, ready }, dispatch] = useReducer(reducer, { lines: [], ready: false });
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  // Read the saved cart once on launch.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => alive && dispatch({ type: 'hydrate', lines: parseStoredCart(raw) }))
      .catch(() => alive && dispatch({ type: 'hydrate', lines: [] })); // unreadable storage: start empty, keep working
    return () => {
      alive = false;
    };
  }, []);

  // Write after every change, but only once we've read, or we'd overwrite the saved cart with [].
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {
      /* storage full or unavailable: the cart still works for this session */
    });
  }, [stored, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    const product = getProduct(slug);
    if (!product) return;
    dispatch({ type: 'add', slug, quantity });
    setToast({ id: Date.now(), message: `Added ${product.name} to your cart` });
  }, [getProduct]);
  const setQuantity = useCallback((slug: string, quantity: number) => dispatch({ type: 'set', slug, quantity }), []);
  const remove = useCallback((slug: string) => dispatch({ type: 'remove', slug }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  // One centralised, memoised value: consumers only re-render when the cart really changes.
  const value = useMemo<CartContextValue>(() => {
    const lines = resolveLines(stored, getProduct);
    const loading = !ready || (status === 'loading' && stored.length > 0 && lines.length === 0);
    return { lines, count: countItems(lines), subtotalCents: subtotal(lines), ready, loading, hiddenCount: stored.length - lines.length, add, setQuantity, remove, clear };
  }, [stored, ready, status, getProduct, add, setQuantity, remove, clear]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast toast={toast} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
