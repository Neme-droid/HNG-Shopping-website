// Single source of truth: the website's catalogue (types, products, categories, helpers, price formatting).
// metro.config.js + tsconfig.json let the mobile app import it straight from ../lib so the two never drift.
// When the website swaps this file for a Supabase query, the mobile app gets the same change.
export * from '../../lib/products';
