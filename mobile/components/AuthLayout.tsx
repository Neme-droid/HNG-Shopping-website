import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeroLeaves from './HeroLeaves';
import { colors, fonts } from '@/lib/theme';

// Shared shell for login / signup: forest panel (the website's .auth-panel) above a form card.
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={[styles.panel, { paddingTop: Platform.OS === 'ios' ? 28 : insets.top + 20 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>
            Sign in to start shopping.
          </Text>
          <Text style={styles.copy}>Create a free account to add products to your cart and check out. It takes under a minute.</Text>
          <View style={styles.leaves}>
            <HeroLeaves width={96} />
          </View>
        </View>
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.forest, paddingHorizontal: 24, paddingBottom: 32, gap: 12, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  close: { alignSelf: 'flex-end', paddingVertical: 4 },
  closeText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.onForestSoft },
  title: { fontFamily: fonts.displayMedium, fontSize: 36, lineHeight: 37, letterSpacing: -1.2, color: colors.paper, maxWidth: 270 },
  copy: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.onForestSoft, maxWidth: 290 },
  leaves: { position: 'absolute', right: -10, bottom: -8, opacity: 0.85 },
  card: { margin: 20, marginTop: 24, padding: 22, gap: 18, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink, borderRadius: 16 },
});
