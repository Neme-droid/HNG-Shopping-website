import Link from 'next/link';
import { formatPrice, type Product } from '@/lib/products';
import AddToCartButton from './AddToCartButton';

export default function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;
  return (
    <article className="product-card" data-category={product.category}>
      {product.badge && <div className="product-badge">{product.badge}</div>}
      <Link href={href} className="product-media" tabIndex={-1} aria-hidden="true">
        <div className="product-image" />
      </Link>
      <h3 className="product-name"><Link href={href}>{product.name}</Link></h3>
      <p className="product-description">{product.description}</p>
      <div className="product-price">{formatPrice(product.priceCents)}</div>
      <AddToCartButton slug={product.slug} />
    </article>
  );
}
