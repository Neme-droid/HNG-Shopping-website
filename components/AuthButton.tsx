'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function AuthButton() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (user) {
    return (
      <button className="link-button" onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
    );
  }

  return (
    <button
      className="link-button"
      onClick={() =>
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${location.origin}/auth/callback` },
        })
      }
    >
      Sign in with Google
    </button>
  );
}