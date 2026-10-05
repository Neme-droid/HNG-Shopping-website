import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';
import { safeNext } from '@/lib/auth-redirect';

export const metadata: Metadata = { title: 'Sign in or create an account' };

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);

  return (
    <section className="auth">
      <div className="container auth-grid">
        <div className="auth-panel">
          <h1 className="auth-title">Sign in to start shopping.</h1>
          <p className="auth-copy">Create a free account to add products to your cart and check out. It takes under a minute.</p>
          <svg className="auth-leaves" viewBox="0 0 320 200" aria-hidden="true">
            <circle cx="236" cy="62" r="34" fill="#F0BE3C" />
            <path d="M120 200C40 186 26 106 56 62c46 6 72 58 64 138Z" fill="#2F6B3F" />
            <path d="M120 200c-6-84 18-136 70-150 26 56-6 124-70 150Z" fill="#4C8B5A" />
            <path d="M120 200c-24-38-18-76 0-108 24 32 24 70 0 108Z" fill="#A9CF8A" />
          </svg>
        </div>
        <AuthForm
          next={next}
          initialMode={params.mode === 'signup' ? 'signup' : 'signin'}
          initialError={params.error ? 'We couldn’t finish signing you in. Please try again.' : undefined}
        />
      </div>
    </section>
  );
}
