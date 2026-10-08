import type { Metadata } from 'next';
import { Fraunces, Hanken_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { ProductsProvider } from '@/lib/products-context';
import { getCatalog } from '@/lib/products-server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'WONK', 'opsz'], variable: '--font-fraunces', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'TerraVerde - Natural Products Store', template: '%s | TerraVerde' },
  description: "Discover TerraVerde's natural products, from organic skincare to sustainable clothing, rooted in nature and crafted with care.",
};

// Products come from Supabase on every request, so no page may be prerendered with stale data.
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { products, error } = await getCatalog();
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable}`}>
      <body>
        <AuthProvider>
          <ProductsProvider products={products} error={error}>
          <CartProvider>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
