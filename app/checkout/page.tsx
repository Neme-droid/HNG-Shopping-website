'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { checkoutSchema, type CheckoutInput } from '@/lib/checkout-schema';
import { formatPrice } from '@/lib/products';

type Errors = Partial<Record<keyof CheckoutInput, string>>;

const fields: { name: keyof CheckoutInput; label: string; type?: string; autoComplete: string; wide?: boolean }[] = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', wide: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { name: 'address', label: 'Street address', autoComplete: 'street-address', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State or region', autoComplete: 'address-level1' },
  { name: 'country', label: 'Country', autoComplete: 'country-name', wide: true },
];

export default function CheckoutPage() {
  const { lines, subtotalCents, ready } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [validated, setValidated] = useState(false);

  if (!ready) return <div className="page container"><h1 className="page-title">Checkout</h1></div>;

  if (lines.length === 0) {
    return (
      <div className="page container empty">
        <h1 className="page-title">Nothing to check out yet</h1>
        <p>Your cart is empty.</p>
        <Link href="/#featured" className="cta-button primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1 className="page-title">Checkout</h1>
      <div className="cart-layout">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
            const result = checkoutSchema.safeParse(data);
            if (result.success) {
              setErrors({});
              setValidated(true);
              // TODO (next step): call the createOrder server action with
              // { items: lines.map(({ slug, quantity }) => ({ slug, quantity })), ...result.data }
              // The server re-prices from the database; prices from this page are display-only.
              return;
            }
            const next: Errors = {};
            for (const issue of result.error.issues) {
              const key = issue.path[0] as keyof CheckoutInput;
              next[key] ??= issue.message;
            }
            setErrors(next);
            setValidated(false);
            document.getElementById(Object.keys(next)[0])?.focus();
          }}
        >
          <h2 className="summary-title">Contact and delivery</h2>
          <div className="form-grid">
            {fields.map((f) => (
              <div className={`field${f.wide ? ' wide' : ''}`} key={f.name}>
                <label htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name} name={f.name} type={f.type ?? 'text'} autoComplete={f.autoComplete}
                  aria-invalid={!!errors[f.name]} aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                />
                {errors[f.name] && <p className="field-error" id={`${f.name}-error`}>{errors[f.name]}</p>}
              </div>
            ))}
          </div>
          {validated && (
            <p className="notice" role="status">
              Your details look good. Saving orders, payment and the confirmation email are the next steps, so nothing has been placed yet.
            </p>
          )}
          <button type="submit" className="cta-button primary checkout-submit">Place order</button>
        </form>

        <aside className="summary" aria-label="Order summary">
          <h2 className="summary-title">Order summary</h2>
          <ul className="summary-lines">
            {lines.map(({ product, quantity, lineTotalCents }) => (
              <li className="summary-row" key={product.slug}>
                <span>{product.name} × {quantity}</span><span>{formatPrice(lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
          <div className="summary-row summary-total"><span>Subtotal</span><span>{formatPrice(subtotalCents)}</span></div>
          <Link href="/cart" className="link-button">Edit cart</Link>
        </aside>
      </div>
    </div>
  );
}
