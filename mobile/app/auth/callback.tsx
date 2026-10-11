import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';

// Google sign-in returns to terraverde://auth/callback?code=…  Android can open the app on this screen instead of
// handing the link back to the browser session, so we finish the sign-in here too, then go home.
export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();
  const { completeOAuthFromUrl } = useAuth();

  useEffect(() => {
    let alive = true;
    const go = () => alive && router.replace('/');
    if (url) completeOAuthFromUrl(url).finally(go);
    else {
      const t = setTimeout(go, 2500); // opened without a link: nothing to finish
      return () => {
        alive = false;
        clearTimeout(t);
      };
    }
    return () => {
      alive = false;
    };
  }, [url, completeOAuthFromUrl, router]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.fern} />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.paper },
  text: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.inkSoft },
});
