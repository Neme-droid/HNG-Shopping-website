'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';
import QuantityStepper from './QuantityStepper';

export default function PurchasePanel({ slug, name, outOfStock = false, maxQty }: { slug: string; name: string; outOfStock?: boolean; maxQty?: number }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="pd-buy">
      {!outOfStock && <QuantityStepper value={qty} onChange={setQty} label={`Quantity of ${name}`} max={maxQty} />}
      <AddToCartButton slug={slug} quantity={qty} disabled={outOfStock} />
    </div>
  );
}
