import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import GoogleButton from '@/components/GoogleButton';
import Input from '@/components/Input';
import { useAuth } from '@/lib/auth';
import { authHref, safeNext } from '@/lib/auth-redirect';
import { signInSchema } from '@/lib/auth-schema';
import { colors, fonts, type } from '@/lib/theme';

type Errors = Partial<Record<'email' | 'password', string>>;

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const next = safeNext(params.next); // same-site paths only
  const { user, ready, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const leaving = useRef(false);

  // Opened while already signed in: nothing to do here.
  useEffect(() => {
    if (ready && user && !leaving.current) {
      leaving.current = true;
      router.dismissTo(next);
    }
  }, [ready, user, next, router]);

  const submit = async () => {
    const result = signInSchema.safeParse({ email, password });
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
    const error = await signIn(result.data.email, password);
    setBusy(false);
    if (error) return setFormError(error);
    leaving.current = true;
    router.dismissTo(next);
  };

  return (
    <AuthLayout>
      <Text style={styles.heading}>Welcome back</Text>
      <GoogleButton onError={setFormError} />
      <Input
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
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
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        error={errors.password}
        secureToggle
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {formError ? (
        <Text accessibilityRole="alert" style={styles.formError}>
          {formError}
        </Text>
      ) : null}
      <Button label="Sign in" loading={busy} onPress={submit} />
      <View style={styles.switch}>
        <Text style={styles.switchText}>New to TerraVerde?</Text>
        <Button label="Create an account" variant="link" onPress={() => router.replace(authHref(params.next ? next : undefined, 'signup'))} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: { ...type.h1, fontSize: 28, color: colors.ink },
  formError: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.error },
  switch: { alignItems: 'flex-start', gap: 0 },
  switchText: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft },
});
