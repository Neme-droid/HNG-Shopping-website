import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius } from '@/lib/theme';

type Props = TextInputProps & { label: string; error?: string; hint?: string; secureToggle?: boolean };

// Labelled field with the website's input look: 1.5px ink border, surface fill, red border + message on error.
const Input = forwardRef<TextInput, Props>(function Input({ label, error, hint, secureToggle, secureTextEntry, style, onFocus, onBlur, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isSecure = !!secureToggle && hidden;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor="#7D8A80"
          selectionColor={colors.fern}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          style={[styles.input, focused && styles.focused, !!error && styles.invalid, secureToggle && { paddingRight: 76 }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {secureToggle && (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} hitSlop={8} onPress={() => setHidden((h) => !h)} style={styles.toggle}>
            <Text style={styles.toggleText}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        )}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  input: { minHeight: 50, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.sm, backgroundColor: colors.surface, fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  focused: { borderColor: colors.fern, borderWidth: 2 },
  invalid: { borderColor: colors.error, borderWidth: 2 },
  error: { fontFamily: fonts.body, fontSize: 14, color: colors.error },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  toggle: { position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 12 },
  toggleText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.inkSoft },
});
