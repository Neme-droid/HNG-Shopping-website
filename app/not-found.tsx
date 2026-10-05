export default function NotFound() {
  return (
    <div className="page container empty">
      <h1 className="page-title">We couldn’t find that page</h1>
      <p>The product may have been removed, or the link is mistyped.</p>
      <a href="/#featured" className="cta-button primary">Browse products</a>
    </div>
  );
}
