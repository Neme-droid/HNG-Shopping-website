'use client';

import Link from 'next/link';
import QuantityStepper from '@/components/QuantityStepper';
import { useCart } from '@/lib/cart';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/lib/products';

export default function CartPage() {
  const { lines, subtotalCents, count, ready, setQuantity, remove } = useCart();

  if (!ready) return <div className="page container"><h1 className="page-title">Your cart</h1></div>;

  if (lines.length === 0) {
    return (
      <div className="page container empty">
        <h1 className="page-title">Your cart is empty</h1>
        <p>Add something from the shop and it will show up here.</p>
        <Link href="/#featured" className="cta-button primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1 className="page-title">Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-lines">
          {lines.map(({ product, quantity, lineTotalCents }) => (
            <li className="cart-line" key={product.slug}>
              <Link href={`/products/${product.slug}`} aria-hidden="true" tabIndex={-1}>
                <ProductImage product={product} className="cart-thumb" />
              </Link>
              <div>
                <Link href={`/products/${product.slug}`} className="cart-line-name">{product.name}</Link>
                <p className="cart-line-meta">{formatPrice(product.priceCents)} each</p>
                <QuantityStepper value={quantity} onChange={(n) => setQuantity(product.slug, n)} label={`Quantity of ${product.name}`} />
              </div>
              <div className="cart-line-end">
                <strong>{formatPrice(lineTotalCents)}</strong>
                <button type="button" className="link-button" onClick={() => remove(product.slug)} aria-label={`Remove ${product.name}`}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        <aside className="summary" aria-label="Order summary">
          <h2 className="summary-title">Order summary</h2>
          <div className="summary-row"><span>Items ({count})</span><span>{formatPrice(subtotalCents)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
          <div className="summary-row summary-total"><span>Subtotal</span><span>{formatPrice(subtotalCents)}</span></div>
          <Link href="/checkout" className="cta-button primary">Go to checkout</Link>
          <Link href="/#featured" className="link-button">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
