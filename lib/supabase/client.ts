import { createBrowserClient } from '@supabase/ssr';

// Browser client. Uses cookies (via @supabase/ssr) so the server can read the same session.
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
