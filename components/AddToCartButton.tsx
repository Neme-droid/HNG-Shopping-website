'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { authHref } from '@/lib/auth-redirect';

export default function AddToCartButton({ slug, quantity = 1, className = '', disabled = false }: { slug: string; quantity?: number; className?: string; disabled?: boolean }) {
  const { add } = useCart();
  const { user, ready, requireUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={`product-button${added ? ' added' : ''} ${className}`.trim()}
      disabled={disabled}
      onClick={async () => {
        // If the page has only just loaded, ask Supabase directly rather than guessing.
        const signedIn = ready ? user : await requireUser();
        if (!signedIn) {
          router.push(authHref(pathname));
          return;
        }
        add(slug, quantity);
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1400);
      }}
    >
      {disabled ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
