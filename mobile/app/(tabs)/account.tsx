import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Header from '@/components/Header';
import HeroLeaves from '@/components/HeroLeaves';
import { useAuth } from '@/lib/auth';
import { authHref } from '@/lib/auth-redirect';
import { colors, fonts, type } from '@/lib/theme';

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

export default function Account() {
  const router = useRouter();
  const { user, ready, configured, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    const error = await signOut();
    setBusy(false);
    if (error) Alert.alert('Couldn’t sign out', error);
  };

  const name = typeof user?.user_metadata?.full_name === 'string' ? (user.user_metadata.full_name as string) : '';
  const display = name || user?.email || '';
  const since = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Header title="Account" showCart={false} />
      {!ready ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.fern} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!configured && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>Sign in is unavailable because the app is missing its Supabase settings. Add them to mobile/.env, then restart Expo.</Text>
            </View>
          )}

          {user ? (
            <>
              <View style={styles.profile}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{display[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {display}
                  </Text>
                  {name ? (
                    <Text style={styles.email} numberOfLines={1}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.status} accessibilityLabel="Authentication state: signed in">
                <View style={styles.dot} />
                <Text style={styles.statusText}>Signed in</Text>
              </View>

              <View style={styles.card}>
                <Row label="Email" value={user.email ?? '—'} />
                <Row label="Email status" value={user.email_confirmed_at ? 'Confirmed' : 'Not confirmed yet'} />
                <Row label="Member since" value={since} />
              </View>

              <Button label="Sign out" variant="outline" loading={busy} onPress={handleSignOut} />
              <Button label="Continue shopping" variant="link" onPress={() => router.navigate('/shop')} />
            </>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Sign in to start shopping.</Text>
                <Text style={styles.panelCopy}>Create a free account to add products to your cart and check out. It takes under a minute.</Text>
                <View style={{ gap: 12, marginTop: 8, zIndex: 1 }}>
                  <Button label="Sign in" onPress={() => router.push(authHref())} />
                  <Button label="Create account" variant="outlineLight" onPress={() => router.push(authHref(undefined, 'signup'))} />
                </View>
                <View style={styles.panelLeaves}>
                  <HeroLeaves width={110} />
                </View>
              </View>
              <View style={styles.status} accessibilityLabel="Authentication state: signed out">
                <View style={[styles.dot, { backgroundColor: colors.line }]} />
                <Text style={styles.statusText}>Signed out</Text>
              </View>
            </>
          )}

          <Text style={styles.disclaimer}>
            Statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18, paddingBottom: 40 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontSize: 26, color: colors.paper },
  name: { ...type.h2, fontSize: 24, lineHeight: 28, color: colors.ink },
  email: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.paper2, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  dot: { width: 10, height: 10, backgroundColor: colors.fern, borderTopRightRadius: 10, borderBottomLeftRadius: 10 },
  statusText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  card: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink, borderRadius: 16, paddingHorizontal: 18 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  detailLabel: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft },
  detailValue: { flex: 1, textAlign: 'right', fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.ink },
  panel: { backgroundColor: colors.forest, borderRadius: 16, padding: 24, gap: 12, overflow: 'hidden', minHeight: 300 },
  panelTitle: { fontFamily: fonts.displayMedium, fontSize: 34, lineHeight: 36, letterSpacing: -1.1, color: colors.paper, maxWidth: 260 },
  panelCopy: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.onForestSoft, maxWidth: 300 },
  panelLeaves: { position: 'absolute', right: -14, top: 8, opacity: 0.9 },
  notice: { backgroundColor: '#F4E0A0', padding: 16, borderRadius: 8 },
  noticeText: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.ink },
  disclaimer: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.inkSoft, marginTop: 12 },
});
