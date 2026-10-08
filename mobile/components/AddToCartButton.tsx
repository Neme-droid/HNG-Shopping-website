import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { authHref } from '@/lib/auth-redirect';
import { useCart } from '@/lib/cart';
import Button from './Button';
import type { StyleProp, ViewStyle } from 'react-native';

// Same rule as the website: you need an account to add to the cart, so signed-out
// customers are sent to sign in and come back to this screen afterwards.
export default function AddToCartButton({ slug, quantity = 1, small, disabled, style }: { slug: string; quantity?: number; small?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const { add } = useCart();
  const { user, ready, requireUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Button
      label={disabled ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
      disabled={disabled}
      variant="dark"
      small={small}
      style={[added && { backgroundColor: '#2F6B3F' }, style]}
      onPress={async () => {
        // If the app has only just opened, ask Supabase directly rather than guessing.
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
    />
  );
}
