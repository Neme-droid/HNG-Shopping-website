// Pure cart logic (no React, no storage) so it is easy to test.
// Same rules as the website's lib/cart.tsx: the cart stores only { slug, quantity };
// names and prices are always looked up from the catalogue.
import type { Product } from './products';

export type CartLine = { slug: string; quantity: number };
export type ResolvedLine = CartLine & { product: Product; lineTotalCents: number };

export const STORAGE_KEY = 'terraverde-cart-v1'; // same key name as the website
export const MAX_QTY = 20;
export const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1));

export type Action =
  | { type: 'hydrate'; lines: CartLine[] }
  | { type: 'add'; slug: string; quantity: number }
  | { type: 'set'; slug: string; quantity: number }
  | { type: 'remove'; slug: string }
  | { type: 'clear' };

export type State = { lines: CartLine[]; ready: boolean }; // ready = AsyncStorage has been read

export function linesReducer(lines: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'hydrate': {
      if (lines.length === 0) return a.lines;
      // Something was added before storage finished loading: merge instead of losing either side.
      const merged = new Map(a.lines.map((l) => [l.slug, l.quantity]));
      for (const l of lines) merged.set(l.slug, clamp((merged.get(l.slug) ?? 0) + l.quantity));
      return [...merged].map(([slug, quantity]) => ({ slug, quantity }));
    }
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

export function reducer(state: State, a: Action): State {
  return { lines: linesReducer(state.lines, a), ready: state.ready || a.type === 'hydrate' };
}

/** Parse what AsyncStorage returned. Drops corrupt entries only. */
export function parseStoredCart(raw: string | null): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const out: CartLine[] = [];
    for (const l of parsed) {
      // Unknown slugs are KEPT: the catalogue may not have loaded yet (offline start), and dropping them would wipe the cart.
      if (!l || typeof l.slug !== 'string' || seen.has(l.slug)) continue;
      seen.add(l.slug);
      out.push({ slug: l.slug, quantity: clamp(Number(l.quantity)) });
    }
    return out;
  } catch {
    return [];
  }
}

/** Joins cart lines with the live catalogue. Lines whose product is not (or no longer) in Supabase are left out. */
export function resolveLines(stored: CartLine[], findProduct: (slug: string) => Product | undefined): ResolvedLine[] {
  return stored.flatMap((l) => {
    const product = findProduct(l.slug);
    return product ? [{ ...l, product, lineTotalCents: product.priceCents * l.quantity }] : [];
  });
}

export const countItems = (lines: ResolvedLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const subtotal = (lines: ResolvedLine[]) => lines.reduce((n, l) => n + l.lineTotalCents, 0);
