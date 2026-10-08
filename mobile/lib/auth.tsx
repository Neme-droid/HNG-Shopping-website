import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';

type SignUpResult = { error?: string; signedIn?: boolean; alreadyRegistered?: boolean };

type AuthContextValue = {
  user: User | null;
  ready: boolean; // false until the saved session has been read from AsyncStorage
  configured: boolean; // false if the Supabase env vars are missing
  requireUser: () => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<string | null>; // returns an error message or null
  signUp: (fullName: string, email: string, password: string) => Promise<SignUpResult>;
  signInWithGoogle: () => Promise<string | null>; // returns an error message, or null on success / if the customer cancelled
  signOut: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED = 'Sign in is unavailable: the app’s Supabase URL or key is missing or invalid. Fix EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env (or eas.json for an APK) and restart or rebuild.';

WebBrowser.maybeCompleteAuthSession();

// Mirrors the website's friendlyError(), plus network failures, which only happen on mobile.
export function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don’t match. Check them and try again.';
  if (m.includes('email not confirmed')) return 'Confirm your email first. We sent you a link when you signed up.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a few minutes and try again.';
  if (m.includes('network request failed') || m.includes('failed to fetch') || m.includes('fetch failed') || m.includes('timeout'))
    return 'Can’t reach the server. Check your internet connection and try again.';
  if (m.includes('invalid api key') || m.includes('apikey')) return 'The app’s Supabase key was rejected. Check EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile/.env, or eas.json for an APK) and restart or rebuild.';
  if (m.includes('already registered')) return 'An account with that email already exists. Sign in instead.';
  return message;
}

const toMessage = (e: unknown) => friendlyError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    let alive = true;
    // getSession reads the persisted session from AsyncStorage, so the app opens signed in even offline.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setUser(data.session?.user ?? null);
        setReady(true);
      })
      .catch(() => alive && setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const requireUser = useCallback(async () => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user ?? null;
    } catch {
      return null;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return NOT_CONFIGURED;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? friendlyError(error.message) : null;
    } catch (e) {
      return toMessage(e);
    }
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string): Promise<SignUpResult> => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    try {
      // Same metadata key as the website (full_name). No emailRedirectTo: the confirmation link opens
      // the Site URL set in Supabase, then the customer returns here and signs in.
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() } } });
      if (error) return { error: friendlyError(error.message) };
      // Supabase hides whether an email is registered; an empty identities list is how it shows up.
      if (data.user && data.user.identities?.length === 0) return { alreadyRegistered: true };
      return { signedIn: !!data.session };
    } catch (e) {
      return { error: toMessage(e) };
    }
  }, []);

  // Google via Supabase OAuth in the system browser. The redirect URL must be allowed in Supabase
  // (Authentication > URL Configuration): terraverde://** for the APK, exp://** for Expo Go.
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return NOT_CONFIGURED;
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
      if (error || !data.url) return friendlyError(error?.message ?? 'Couldn’t start Google sign-in.');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return null; // closed or cancelled: not an error
      const query = result.url.split('#')[1] ?? result.url.split('?')[1] ?? '';
      const params = new URLSearchParams(query);
      const failure = params.get('error_description') ?? params.get('error');
      if (failure) return friendlyError(failure.replace(/\+/g, ' '));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) return 'Google sign-in didn’t complete. Make sure the redirect URL is allowed in Supabase, then try again.';
      const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
      return sessionError ? friendlyError(sessionError.message) : null;
    } catch (e) {
      return toMessage(e);
    }
  }, []);

  // Signing out must always work, even offline or with a stale session. Try the server first (revokes the
  // refresh token), and if that fails still clear the session on this device.
  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) await supabase.auth.signOut({ scope: 'local' });
      }
    } catch {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        /* nothing more to clear */
      }
    }
    setUser(null);
    return null;
  }, []);

  const value = useMemo(
    () => ({ user, ready, configured: isSupabaseConfigured, requireUser, signIn, signUp, signInWithGoogle, signOut }),
    [user, ready, requireUser, signIn, signUp, signInWithGoogle, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
