import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PRODUCT_TABLE, toProducts, type Product } from './products';

export type Catalog = { products: Product[]; error: string | null };

// Reads the public catalogue straight from Supabase on the server.
// - Uses the anon key with NO cookies/session: products are public, and this keeps the query identical for everyone.
// - `cache: 'no-store'` + `dynamic = 'force-dynamic'` in the layout mean every request sees the current table.
// - React's cache() makes the layout, the page and generateMetadata share ONE query per request.
export const getCatalog = cache(async (): Promise<Catalog> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { products: [], error: 'Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).' };

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    });
    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      console.error('[products] Supabase error:', error.message);
      return { products: [], error: error.message };
    }
    return { products: toProducts(data, url, (m) => console.warn('[products]', m)), error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not reach Supabase.';
    console.error('[products] fetch failed:', message);
    return { products: [], error: message };
  }
});
