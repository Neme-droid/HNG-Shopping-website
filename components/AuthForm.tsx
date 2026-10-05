'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NEXT_COOKIE } from '@/lib/auth-redirect';
import { signInSchema, signUpSchema } from '@/lib/auth-schema';

type Mode = 'signin' | 'signup';
type Errors = Partial<Record<'fullName' | 'email' | 'password', string>>;

const GoogleG = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
  </svg>
);

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don’t match. Check them and try again.';
  if (m.includes('email not confirmed')) return 'Confirm your email first. We sent you a link when you signed up.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a few minutes and try again.';
  return message;
}

// Remember where to go after Google sign-in or email confirmation.
function rememberNext(next: string) {
  document.cookie = `${NEXT_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax`;
}

export default function AuthForm({ next, initialMode, initialError }: { next: string; initialMode: Mode; initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState(initialError ?? '');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const signup = mode === 'signup';

  function switchMode(m: Mode) {
    setMode(m);
    setErrors({});
    setFormError('');
    setShowPassword(false);
  }

  async function google() {
    setBusy(true);
    setFormError('');
    rememberNext(next);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setFormError(friendlyError(error.message));
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const result = (signup ? signUpSchema : signInSchema).safeParse(data);

    if (!result.success) {
      const fieldErrors: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors;
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      setFormError('');
      document.getElementById(`auth-${Object.keys(fieldErrors)[0]}`)?.focus();
      return;
    }

    setErrors({});
    setFormError('');
    setBusy(true);
    const supabase = createClient();

    if (signup) {
      const v = result.data as { fullName: string; email: string; password: string };
      rememberNext(next);
      const { data: res, error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: { data: { full_name: v.fullName }, emailRedirectTo: `${location.origin}/auth/callback` },
      });
      setBusy(false);
      if (error) return setFormError(friendlyError(error.message));
      // Supabase hides whether an email is registered; an empty identities list is how it shows up.
      if (res.user && res.user.identities?.length === 0) {
        switchMode('signin');
        return setFormError('An account with that email already exists. Sign in instead.');
      }
      if (res.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      setConfirmEmail(v.email); // email confirmation is switched on in Supabase
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: data.email.trim(), password: data.password });
    if (error) {
      setBusy(false);
      return setFormError(friendlyError(error.message));
    }
    router.replace(next);
    router.refresh();
  }

  if (confirmEmail) {
    return (
      <div className="auth-card">
        <h2 className="auth-heading">Check your email</h2>
        <p className="auth-lede">We sent a confirmation link to <strong>{confirmEmail}</strong>. Open it to finish creating your account, then you can start shopping.</p>
        <button type="button" className="link-button" onClick={() => { setConfirmEmail(null); switchMode('signin'); }}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-switch" role="group" aria-label="Choose sign in or sign up">
        <button type="button" aria-pressed={!signup} className={!signup ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
        <button type="button" aria-pressed={signup} className={signup ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
      </div>

      <h2 className="auth-heading">{signup ? 'Create your account' : 'Welcome back'}</h2>

      <button type="button" className="oauth-button" onClick={google} disabled={busy}>
        <GoogleG /> Continue with Google
      </button>

      <div className="auth-divider"><span>or use your email</span></div>

      <form noValidate onSubmit={submit} className="auth-form">
        {signup && (
          <div className="field">
            <label htmlFor="auth-fullName">Full name</label>
            <input id="auth-fullName" name="fullName" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'auth-fullName-error' : undefined} />
            {errors.fullName && <p className="field-error" id="auth-fullName-error">{errors.fullName}</p>}
          </div>
        )}
        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input id="auth-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'auth-email-error' : undefined} />
          {errors.email && <p className="field-error" id="auth-email-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <div className="password-wrap">
            <input
              id="auth-password" name="password" type={showPassword ? 'text' : 'password'}
              autoComplete={signup ? 'new-password' : 'current-password'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'auth-password-error' : signup ? 'auth-password-hint' : undefined}
            />
            <button type="button" className="password-toggle" aria-pressed={showPassword} onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password ? <p className="field-error" id="auth-password-error">{errors.password}</p>
            : signup && <p className="field-hint" id="auth-password-hint">At least 8 characters.</p>}
        </div>

        <p className="auth-error" role="alert">{formError}</p>

        <button type="submit" className="cta-button primary" disabled={busy}>
          {busy ? (signup ? 'Creating account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
