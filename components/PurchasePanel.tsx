'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';
import QuantityStepper from './QuantityStepper';

export default function PurchasePanel({ slug, name }: { slug: string; name: string }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="pd-buy">
      <QuantityStepper value={qty} onChange={setQty} label={`Quantity of ${name}`} />
      <AddToCartButton slug={slug} quantity={qty} />
    </div>
  );
}
