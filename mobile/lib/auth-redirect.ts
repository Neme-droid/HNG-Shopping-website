// safeNext is the website's own helper (same-site paths only), reused unchanged.
export { safeNext } from '../../lib/auth-redirect';

// Mobile sign-in routes. `next` is where to go once the customer is signed in.
export const authHref = (next?: string, mode: 'login' | 'signup' = 'login') =>
  `/auth/${mode}${next ? `?next=${encodeURIComponent(next)}` : ''}`;
