'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { PROTECTED_PATHS } from '@/lib/auth-redirect';

// Header control. Google sign-in now lives on the /auth page, not here.
export default function AuthButton() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!ready) return <span className="auth-slot" aria-hidden="true" />;

  if (user) {
    return (
      <button
        type="button"
        className="link-button"
        onClick={async () => {
          await signOut();
          // Leave pages that need an account; otherwise just refresh what's on screen.
          if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) router.replace('/');
          router.refresh();
        }}
      >
        Sign out
      </button>
    );
  }

  return <Link href="/auth" className="link-button">Sign in</Link>;
}
