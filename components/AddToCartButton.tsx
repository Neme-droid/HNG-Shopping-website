'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/cart';

export default function AddToCartButton({ slug, quantity = 1, className = '' }: { slug: string; quantity?: number; className?: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={`product-button${added ? ' added' : ''} ${className}`.trim()}
      onClick={() => {
        add(slug, quantity);
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
