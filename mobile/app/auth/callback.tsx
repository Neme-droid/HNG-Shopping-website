import { Redirect } from 'expo-router';

// Google sign-in returns to terraverde://auth/callback. The session is read from that URL in lib/auth.tsx;
// this route only makes sure the deep link never lands on a "not found" screen.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
