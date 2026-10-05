'use client';

import { MAX_QTY } from '@/lib/cart';

export default function QuantityStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Increase quantity" disabled={value >= MAX_QTY} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
