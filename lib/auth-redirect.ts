// Where to send the customer after they sign in. Only same-site paths are allowed,
// so a crafted link can't bounce someone to another website after login.
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/';
  return next;
}

// Link to the sign in/up page that returns the customer to `next` afterwards.
export const authHref = (next: string, mode?: 'signin' | 'signup') =>
  `/auth?next=${encodeURIComponent(next)}${mode ? `&mode=${mode}` : ''}`;

// Pages that need an account. proxy.ts enforces this on the server.
export const PROTECTED_PATHS = ['/cart', '/checkout'];

// Short-lived cookie that carries "where to go next" through Google sign-in and email
// confirmation, so the callback URL stays exactly `/auth/callback` (already allow-listed in Supabase).
export const NEXT_COOKIE = 'tv_next';
