'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';
import { LeafLogo } from './icons';
import AuthButton from './AuthButton';

const links = [
  { href: '/#categories', label: 'Categories' },
  { href: '/#featured', label: 'Featured' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link href="/" className="logo"><LeafLogo /><span>TerraVerde</span></Link>
        <nav className="nav-menu" id="primary-menu" aria-label="Primary">
          <button
            className={`nav-toggle${open ? ' active' : ''}`}
            aria-controls="primary-menu" aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="hamburger" />
          </button>
          <ul className={`nav-list${open ? ' active' : ''}`}>
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <AuthButton />
        <Link
          href="/cart"
          className={`cart-link${count > 0 ? ' has-items' : ''}`}
          aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 11h10.2L20 8H6.2" /><circle cx="9" cy="19.5" r="1.2" /><circle cx="17" cy="19.5" r="1.2" />
          </svg>
          <span className="cart-count" aria-hidden="true">{count}</span>
        </Link>
        <Link href="/#featured" className="cta-button secondary">Shop now</Link>
      </div>
    </header>
  );
}
