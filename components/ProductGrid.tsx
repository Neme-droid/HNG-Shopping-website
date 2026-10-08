'use client';

import { useState } from 'react';
import { categories, type CategoryId } from '@/lib/products';
import { useProducts } from '@/lib/products-context';
import ProductCard from './ProductCard';

// Reads the live catalogue from Supabase (via the provider), so it updates when the table changes.
export default function ProductGrid({ initialFilter = 'all' }: { initialFilter?: CategoryId | 'all' }) {
  const { products, error, refresh } = useProducts();
  const [filter, setFilter] = useState<CategoryId | 'all'>(initialFilter);
  const options = [{ id: 'all' as const, name: 'All' }, ...categories];
  const visible = filter === 'all' ? products : products.filter((p) => p.category === filter);

  if (error && products.length === 0) {
    return (
      <div className="catalog-note" role="alert">
        <p>We couldn’t load the products right now. Please check your connection and try again.</p>
        <button type="button" className="cta-button primary" onClick={refresh}>Try again</button>
      </div>
    );
  }

  return (
    <>
      <div className="product-filter" role="group" aria-label="Filter products">
        {options.map((o) => (
          <button
            key={o.id} type="button"
            className={`filter-btn${filter === o.id ? ' active' : ''}`}
            aria-pressed={filter === o.id}
            onClick={() => setFilter(o.id)}
          >
            {o.name}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="catalog-note">{products.length === 0 ? 'No products are available yet. Check back soon.' : 'There are no products in this category right now.'}</p>
      ) : (
        <div className="products-grid">
          {visible.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </>
  );
}
