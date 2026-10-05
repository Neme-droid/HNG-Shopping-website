import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { NEXT_COOKIE, safeNext } from '@/lib/auth-redirect';

// Google (or the email confirmation link) sends the customer back here with a one-time code.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  const cookieStore = await cookies();
  let next = '/';
  try {
    next = safeNext(decodeURIComponent(cookieStore.get(NEXT_COOKIE)?.value ?? ''));
  } catch {
    /* malformed cookie: fall back to the home page */
  }
  cookieStore.delete(NEXT_COOKIE);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error('Auth code exchange failed:', error.message);
  }
  return NextResponse.redirect(`${origin}/auth?error=callback`);
}
