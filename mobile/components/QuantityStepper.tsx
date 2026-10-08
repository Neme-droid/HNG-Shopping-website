import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_QTY } from '@/lib/cart-logic';
import { colors, fonts, radius } from '@/lib/theme';

// Pill stepper like the website's .qty control. 44pt touch targets.
export default function QuantityStepper({ value, onChange, label, compact, max = MAX_QTY }: { value: number; onChange: (n: number) => void; label: string; compact?: boolean; max?: number }) {
  const size = compact ? 38 : 46;
  const btn = (glyph: string, a11y: string, disabled: boolean, next: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={compact ? 4 : 0}
      onPress={() => onChange(next)}
      style={({ pressed }) => [styles.btn, { width: size, height: size }, pressed && { backgroundColor: colors.paper2 }, disabled && { opacity: 0.35 }]}
    >
      <Text style={styles.glyph}>{glyph}</Text>
    </Pressable>
  );
  return (
    <View style={styles.wrap} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ text: String(value) }}>
      {btn('−', 'Decrease quantity', value <= 1, value - 1)}
      <Text style={[styles.value, { minWidth: compact ? 28 : 36 }]}>{value}</Text>
      {btn('+', 'Increase quantity', value >= Math.min(max, MAX_QTY), value + 1)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.pill, padding: 1 },
  btn: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.body, fontSize: 22, lineHeight: 26, color: colors.ink },
  value: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink, textAlign: 'center' },
});
