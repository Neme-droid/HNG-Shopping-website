'use client';

import { useState } from 'react';
import { categories, type CategoryId, type Product } from '@/lib/products';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, initialFilter = 'all' }: { products: Product[]; initialFilter?: CategoryId | 'all' }) {
  const [filter, setFilter] = useState<CategoryId | 'all'>(initialFilter);
  const options = [{ id: 'all' as const, name: 'All' }, ...categories];
  const visible = filter === 'all' ? products : products.filter((p) => p.category === filter);

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
      <div className="products-grid">
        {visible.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </>
  );
}
