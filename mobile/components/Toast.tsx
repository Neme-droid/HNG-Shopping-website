import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '@/lib/theme';

// Small confirmation pill, like the website's .toast. Announced to screen readers.
export default function Toast({ toast }: { toast: { id: number; message: string } | null }) {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    AccessibilityInfo.announceForAccessibility(toast.message);
    anim.setValue(0);
    const run = Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.delay(1900),
      Animated.timing(anim, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]);
    run.start();
    return () => run.stop();
  }, [toast, anim]);

  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { bottom: insets.bottom + 96, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', alignSelf: 'center', maxWidth: '90%', backgroundColor: colors.ink, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill, elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  text: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.paper, textAlign: 'center' },
});
