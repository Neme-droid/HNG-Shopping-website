import Link from 'next/link';
import { LeafLogo } from './icons';

const columns = [
  { title: 'Shop', links: [['All categories', '/#categories'], ['Featured products', '/#featured'], ['Our story', '/#about'], ['Your cart', '/cart']] },
  { title: 'Learn', links: [['Natural living blog', '#'], ['Ingredient glossary', '#'], ['Sustainability report', '#']] },
  { title: 'Connect', links: [['Instagram', '#'], ['Facebook', '#'], ['Pinterest', '#']] },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-logo"><LeafLogo /><span>TerraVerde</span></div>
        <div className="footer-links">
          {columns.map((c) => (
            <div className="footer-column" key={c.title}>
              <h4 className="footer-title">{c.title}</h4>
              <ul className="footer-menu">
                {c.links.map(([label, href]) => (
                  <li key={label}><Link href={href}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p className="medical-disclaimer">Statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} TerraVerde. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
