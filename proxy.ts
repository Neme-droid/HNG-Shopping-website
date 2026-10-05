import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PROTECTED_PATHS, authHref, safeNext } from '@/lib/auth-redirect';

// Runs before every page request. It refreshes the Supabase login session and
// keeps signed-out visitors out of the cart and checkout.
// (Next.js 16 calls this file "proxy"; on Next 15 or older it is middleware.ts.)
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser(); // also what refreshes the session

  const { pathname, search } = request.nextUrl;
  let redirectTo: string | null = null;

  if (!user && PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    redirectTo = authHref(pathname + search); // signed out: go and sign in first
  } else if (user && pathname === '/auth') {
    redirectTo = safeNext(request.nextUrl.searchParams.get('next')); // already signed in: nothing to do here
  }

  if (redirectTo) {
    const redirect = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c)); // keep any refreshed session cookies
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
