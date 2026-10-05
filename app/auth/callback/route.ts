import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Google sends the customer back here (via Supabase) with a one-time code.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error('Auth code exchange failed:', error.message);
  }
  return NextResponse.redirect(`${origin}/`);
}
