import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import GoogleButton from '@/components/GoogleButton';
import Input from '@/components/Input';
import { useAuth } from '@/lib/auth';
import { authHref, safeNext } from '@/lib/auth-redirect';
import { signUpSchema } from '@/lib/auth-schema';
import { colors, fonts, type } from '@/lib/theme';

type Errors = Partial<Record<'fullName' | 'email' | 'password', string>>;

export default function Signup() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const next = safeNext(params.next);
  const { user, ready, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const leaving = useRef(false);

  useEffect(() => {
    if (ready && user && !leaving.current) {
      leaving.current = true;
      router.dismissTo(next);
    }
  }, [ready, user, next, router]);

  const clear = (k: keyof Errors) => errors[k] && setErrors((e) => ({ ...e, [k]: undefined }));
  const goLogin = () => router.replace(authHref(params.next ? next : undefined, 'login'));

  const submit = async () => {
    const result = signUpSchema.safeParse({ fullName, email, password });
    if (!result.success) {
      const e: Errors = {};
      for (const issue of result.error.issues) e[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(e);
      setFormError('');
      return;
    }
    setErrors({});
    setFormError('');
    setBusy(true);
    const res = await signUp(result.data.fullName, result.data.email, password);
    setBusy(false);
    if (res.error) return setFormError(res.error);
    if (res.alreadyRegistered) {
      setFormError('An account with that email already exists. Sign in instead.');
      return;
    }
    if (res.signedIn) {
      leaving.current = true;
      router.dismissTo(next);
      return;
    }
    setConfirmEmail(result.data.email); // email confirmation is switched on in Supabase
  };

  if (confirmEmail)
    return (
      <AuthLayout>
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.lede}>
          We sent a confirmation link to <Text style={{ fontFamily: fonts.bodyBold }}>{confirmEmail}</Text>. Open it to finish creating your account, then come back here and sign in.
        </Text>
        <Button label="Back to sign in" onPress={goLogin} />
      </AuthLayout>
    );

  return (
    <AuthLayout>
      <Text style={styles.heading}>Create your account</Text>
      <GoogleButton onError={setFormError} />
      <Input
        label="Full name"
        value={fullName}
        onChangeText={(t) => {
          setFullName(t);
          clear('fullName');
        }}
        error={errors.fullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
      />
      <Input
        ref={emailRef}
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clear('email');
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />
      <Input
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clear('password');
        }}
        error={errors.password}
        hint="At least 8 characters."
        secureToggle
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {formError ? (
        <Text accessibilityRole="alert" style={styles.formError}>
          {formError}
        </Text>
      ) : null}
      <Button label="Create account" loading={busy} onPress={submit} />
      <View>
        <Text style={styles.switchText}>Already have an account?</Text>
        <Button label="Sign in" variant="link" onPress={goLogin} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: { ...type.h1, fontSize: 28, color: colors.ink },
  lede: { ...type.body, color: colors.inkSoft },
  formError: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.error },
  switchText: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft },
});
