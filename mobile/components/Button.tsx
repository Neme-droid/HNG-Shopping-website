import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/lib/theme';

type Variant = 'primary' | 'dark' | 'outline' | 'outlineLight' | 'link';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Pill buttons that match the website's .cta-button (sun) and .product-button (ink).
export default function Button({ label, variant = 'primary', loading, small, fullWidth, disabled, style, ...rest }: Props) {
  const off = disabled || loading;
  if (variant === 'link') {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={off} hitSlop={10} style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }, off && { opacity: 0.5 }, style]} {...rest}>
        <Text style={styles.linkText}>{label}</Text>
      </Pressable>
    );
  }
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        fullWidth && { alignSelf: 'stretch' },
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { transform: [{ scale: 0.98 }], backgroundColor: v.pressed },
        off && { opacity: 0.6 },
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={[styles.text, small && styles.textSmall, { color: v.fg }]}>{label}</Text>}
    </Pressable>
  );
}

const variants: Record<Exclude<Variant, 'link'>, { bg: string; fg: string; border: string; pressed: string }> = {
  primary: { bg: colors.sun, fg: colors.ink, border: 'transparent', pressed: colors.sunSoft },
  dark: { bg: colors.ink, fg: colors.paper, border: 'transparent', pressed: colors.fern },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.ink, pressed: colors.paper2 },
  outlineLight: { bg: 'transparent', fg: colors.paper, border: colors.paper, pressed: 'rgba(246,247,241,0.14)' },
};

const styles = StyleSheet.create({
  base: { minHeight: 50, paddingHorizontal: 24, borderRadius: radius.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  small: { minHeight: 42, paddingHorizontal: 16 },
  text: { fontFamily: fonts.bodyBold, fontSize: 16 },
  textSmall: { fontSize: 14 },
  link: { alignSelf: 'flex-start', paddingVertical: 6 },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSoft, textDecorationLine: 'underline' },
});
