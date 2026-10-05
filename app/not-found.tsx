import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page container empty">
      <h1 className="page-title">We couldn’t find that page</h1>
      <p>The product may have been removed, or the link is mistyped.</p>
      <Link href="/#featured" className="cta-button primary">Browse products</Link>
    </div>
  );
}
