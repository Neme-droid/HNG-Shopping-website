import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import PurchasePanel from '@/components/PurchasePanel';
import { categoryName, formatPrice, getProduct, getRelated, products } from '@/lib/products';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  return (
    <>
      <div className="page container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/#featured">Shop</Link> / <Link href={`/?category=${product.category}#featured`}>{categoryName(product.category)}</Link> / {product.name}
        </nav>
        <div className="pd">
          <div className="product-image" style={{ background: `var(--c-${product.category})` }} role="img" aria-label={product.name} />
          <div className="pd-info">
            <p className="pd-category">{categoryName(product.category)}{product.badge ? `, ${product.badge.toLowerCase()}` : ''}</p>
            <h1 className="pd-title">{product.name}</h1>
            <p className="pd-price">{formatPrice(product.priceCents)}</p>
            <p className="pd-about">{product.about}</p>
            <PurchasePanel slug={product.slug} name={product.name} />
            <ul className="pd-details">
              {product.details.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </div>
      </div>
      <section className="featured-products">
        <div className="container">
          <header className="section-header"><h2 className="section-title">You might also like</h2></header>
          <div className="products-grid">
            {getRelated(product).map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
