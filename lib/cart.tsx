'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { getProduct, type Product } from './products';

// The cart stores only { slug, quantity }. Names and prices are looked up from the
// catalogue on every render, and the server must re-price at checkout anyway.
export type CartLine = { slug: string; quantity: number };
export type ResolvedLine = CartLine & { product: Product; lineTotalCents: number };

const STORAGE_KEY = 'terraverde-cart-v1';
const MAX_QTY = 20;
const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1));

type Action =
  | { type: 'hydrate'; lines: CartLine[] }
  | { type: 'add'; slug: string; quantity: number }
  | { type: 'set'; slug: string; quantity: number }
  | { type: 'remove'; slug: string }
  | { type: 'clear' };

type State = { lines: CartLine[]; ready: boolean }; // ready = localStorage has been read

function linesReducer(lines: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'hydrate':
      return a.lines;
    case 'add': {
      if (!lines.some((l) => l.slug === a.slug)) return [...lines, { slug: a.slug, quantity: clamp(a.quantity) }];
      return lines.map((l) => (l.slug === a.slug ? { ...l, quantity: clamp(l.quantity + a.quantity) } : l));
    }
    case 'set':
      return lines.map((l) => (l.slug === a.slug ? { ...l, quantity: clamp(a.quantity) } : l));
    case 'remove':
      return lines.filter((l) => l.slug !== a.slug);
    case 'clear':
      return [];
  }
}

function reducer(state: State, a: Action): State {
  return { lines: linesReducer(state.lines, a), ready: state.ready || a.type === 'hydrate' };
}

function readStorage(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => l && typeof l.slug === 'string' && getProduct(l.slug)) // drop unknown/removed products
      .map((l) => ({ slug: l.slug as string, quantity: clamp(Number(l.quantity)) }));
  } catch {
    return [];
  }
}

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotalCents: number;
  ready: boolean; // false until localStorage has been read (avoids hydration mismatch)
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [{ lines: stored, ready }, dispatch] = useReducer(reducer, { lines: [], ready: false });
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({ msg: '', show: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Read once on mount, then keep other tabs in sync.
  useEffect(() => {
    dispatch({ type: 'hydrate', lines: readStorage() });
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: 'hydrate', lines: readStorage() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Write after every change, but only once we've read, or we'd overwrite the saved cart with [].
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* private mode or storage full: the cart still works for this session */
    }
  }, [stored, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    const product = getProduct(slug);
    if (!product) return;
    dispatch({ type: 'add', slug, quantity });
    setToast({ msg: `Added ${product.name} to your cart`, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const lines = stored.flatMap((l) => {
      const product = getProduct(l.slug);
      return product ? [{ ...l, product, lineTotalCents: product.priceCents * l.quantity }] : [];
    });
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.lineTotalCents, 0),
      ready,
      add,
      setQuantity: (slug, quantity) => dispatch({ type: 'set', slug, quantity }),
      remove: (slug) => dispatch({ type: 'remove', slug }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [stored, ready, add]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className={`toast${toast.show ? ' show' : ''}`} role="status">{toast.msg}</div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export { MAX_QTY };
