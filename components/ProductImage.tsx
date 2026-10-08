'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';

// Shows the product photo from Supabase Storage on top of the category-tinted leaf tile.
// While loading, or if every image URL fails, the tile with the leaf is what the customer sees.
export default function ProductImage({ product, label, className = '' }: { product: Pick<Product, 'category' | 'imageUrl' | 'imageFallbackUrl'>; label?: string; className?: string }) {
  const urls = [product.imageUrl, product.imageFallbackUrl].filter((u): u is string => !!u);
  // Reset the failure count if the product's image changes (e.g. edited in Supabase).
  const [failed, setFailed] = useState<{ key: string; count: number }>({ key: '', count: 0 });
  const key = urls.join('|');
  const count = failed.key === key ? failed.count : 0;
  const src = urls[count];

  return (
    <div
      className={`product-image${src ? ' has-photo' : ''} ${className}`.trim()}
      style={{ background: `var(--c-${product.category})` }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL, tint tile is the placeholder
        <img key={src} className="product-photo" src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed({ key, count: count + 1 })} />
      )}
    </div>
  );
}
