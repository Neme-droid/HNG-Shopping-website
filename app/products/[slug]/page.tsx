import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';
import PurchasePanel from '@/components/PurchasePanel';
import { categoryName, findProduct, formatPrice, getRelated, inStock } from '@/lib/products';
import { getCatalog } from '@/lib/products-server';

type Props = { params: Promise<{ slug: string }> };

// Product pages are rendered per request from Supabase (see the root layout's `dynamic = 'force-dynamic'`).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { products } = await getCatalog();
  const product = findProduct(products, (await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const { products, error } = await getCatalog();
  const product = findProduct(products, (await params).slug);

  if (!product) {
    if (!error) notFound();
    return (
      <div className="page container empty">
        <h1 className="page-title">We couldn’t load this product</h1>
        <p>Something went wrong reaching the store. Please try again in a moment.</p>
        <Link href="/#featured" className="cta-button primary">Browse products</Link>
      </div>
    );
  }

  const available = inStock(product);
  const low = available && product.stock !== undefined && product.stock <= 5;

  return (
    <>
      <div className="page container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/#featured">Shop</Link> / <Link href={`/?category=${product.category}#featured`}>{categoryName(product.category)}</Link> / {product.name}
        </nav>
        <div className="pd">
          <ProductImage product={product} label={product.name} />
          <div className="pd-info">
            <p className="pd-category">{categoryName(product.category)}{product.badge ? `, ${product.badge.toLowerCase()}` : ''}</p>
            <h1 className="pd-title">{product.name}</h1>
            <p className="pd-price">{formatPrice(product.priceCents)}</p>
            <p className="pd-about">{product.about || product.description}</p>
            {low && <p className="pd-stock">Only {product.stock} left</p>}
            <PurchasePanel slug={product.slug} name={product.name} outOfStock={!available} maxQty={product.stock} />
            {product.details.length > 0 && (
              <ul className="pd-details">
                {product.details.map((d) => <li key={d}>{d}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
      <section className="featured-products">
        <div className="container">
          <header className="section-header"><h2 className="section-title">You might also like</h2></header>
          <div className="products-grid">
            {getRelated(products, product).map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
