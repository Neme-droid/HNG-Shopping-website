import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import Input from '@/components/Input';
import { useAuth } from '@/lib/auth';
import { authHref } from '@/lib/auth-redirect';
import { useCart } from '@/lib/cart';
import { checkoutSchema, type CheckoutInput } from '@/lib/checkout-schema';
import { formatPrice } from '@/lib/products';
import { colors, fonts, type } from '@/lib/theme';

type Errors = Partial<Record<keyof CheckoutInput, string>>;

// Same fields, order and labels as the website's checkout.
const fields: { name: keyof CheckoutInput; label: string; keyboardType?: TextInputProps['keyboardType']; autoComplete: TextInputProps['autoComplete']; autoCapitalize?: TextInputProps['autoCapitalize'] }[] = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', autoCapitalize: 'words' },
  { name: 'email', label: 'Email', keyboardType: 'email-address', autoComplete: 'email', autoCapitalize: 'none' },
  { name: 'phone', label: 'Phone', keyboardType: 'phone-pad', autoComplete: 'tel' },
  { name: 'address', label: 'Street address', autoComplete: 'street-address', autoCapitalize: 'words' },
  { name: 'city', label: 'City', autoComplete: 'postal-address-locality', autoCapitalize: 'words' },
  { name: 'state', label: 'State or region', autoComplete: 'postal-address-region', autoCapitalize: 'words' },
  { name: 'country', label: 'Country', autoComplete: 'country', autoCapitalize: 'words' },
];

const empty: CheckoutInput = { fullName: '', email: '', phone: '', address: '', city: '', state: '', country: '' };

export default function Checkout() {
  const router = useRouter();
  const { user, ready: authReady } = useAuth();
  const { lines, subtotalCents, loading } = useCart();
  const [values, setValues] = useState<CheckoutInput>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [validated, setValidated] = useState(false);
  const refs = useRef<Partial<Record<keyof CheckoutInput, TextInput | null>>>({});
  const scroller = useRef<ScrollView>(null);

  // Pre-fill what we already know about the signed-in customer (only into empty fields).
  useEffect(() => {
    if (!user) return;
    const name = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';
    setValues((v) => ({ ...v, fullName: v.fullName || name, email: v.email || user.email || '' }));
  }, [user]);

  if (loading || !authReady) return <ActivityIndicator style={{ flex: 1 }} color={colors.fern} />;

  // Checkout needs an account, same as the website.
  if (!user) return <Redirect href={authHref('/checkout')} />;

  if (lines.length === 0)
    return (
      <EmptyState title="Nothing to check out yet" message="Your cart is empty." actionLabel="Browse products" onAction={() => router.replace('/shop')} />
    );

  const change = (name: keyof CheckoutInput, text: string) => {
    setValues((v) => ({ ...v, [name]: text }));
    setValidated(false);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined })); // clear the message as soon as they fix it
  };

  const submit = () => {
    const result = checkoutSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      setValidated(true);
      // TODO (matches the website): send { items: lines.map(({ slug, quantity }) => ({ slug, quantity })), ...result.data }
      // to the createOrder backend once it exists. The server must re-price from the database.
      scroller.current?.scrollToEnd({ animated: true });
      return;
    }
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof CheckoutInput;
      next[key] ??= issue.message;
    }
    setErrors(next);
    setValidated(false);
    const first = fields.find((f) => next[f.name]);
    if (first) refs.current[first.name]?.focus();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView ref={scroller} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
        <View style={styles.summary} accessibilityLabel="Order summary">
          <Text style={styles.sectionTitle}>Order summary</Text>
          {lines.map(({ product, quantity, lineTotalCents }) => (
            <View style={styles.row} key={product.slug}>
              <Text style={[styles.rowText, { flex: 1 }]}>
                {product.name} × {quantity}
              </Text>
              <Text style={styles.rowText}>{formatPrice(lineTotalCents)}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.rowText}>Shipping</Text>
            <Text style={styles.rowText}>Calculated at checkout</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.total}>Subtotal</Text>
            <Text style={styles.total}>{formatPrice(subtotalCents)}</Text>
          </View>
          <Button label="Edit cart" variant="link" onPress={() => router.back()} />
        </View>

        <Text style={styles.sectionTitle}>Contact and delivery</Text>
        <View style={{ gap: 16 }}>
          {fields.map((f, i) => {
            const last = i === fields.length - 1;
            return (
              <Input
                key={f.name}
                ref={(el) => {
                  refs.current[f.name] = el;
                }}
                label={f.label}
                value={values[f.name]}
                onChangeText={(t) => change(f.name, t)}
                error={errors[f.name]}
                keyboardType={f.keyboardType}
                autoComplete={f.autoComplete}
                autoCapitalize={f.autoCapitalize ?? 'sentences'}
                autoCorrect={f.name === 'email' || f.name === 'phone' ? false : undefined}
                returnKeyType={last ? 'done' : 'next'}
                onSubmitEditing={() => (last ? submit() : refs.current[fields[i + 1].name]?.focus())}
                submitBehavior={last ? 'blurAndSubmit' : 'submit'}
              />
            );
          })}
        </View>

        {validated && (
          <View style={styles.notice} accessibilityRole="alert">
            <Text style={styles.noticeText}>Your details look good. Saving orders, payment and the confirmation email are the next steps, so nothing has been placed yet.</Text>
          </View>
        )}
        <Button label="Place order" onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  sectionTitle: { ...type.h3, fontSize: 22, color: colors.ink },
  summary: { backgroundColor: colors.paper2, borderRadius: 16, padding: 20, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowText: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
  total: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  notice: { backgroundColor: '#F4E0A0', padding: 16, borderRadius: 8 },
  noticeText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
});
