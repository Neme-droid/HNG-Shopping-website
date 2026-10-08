import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';
import Button from './Button';

// "Continue with Google" + an "or" divider. Reports failures through onError; success is picked up by the auth state.
export default function GoogleButton({ onError }: { onError: (message: string) => void }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  return (
    <View style={{ gap: 14 }}>
      <Button
        label="Continue with Google"
        variant="outline"
        loading={busy}
        onPress={async () => {
          setBusy(true);
          const error = await signInWithGoogle();
          setBusy(false);
          if (error) onError(error);
        }}
      />
      <View style={styles.divider}>
        <View style={styles.rule} />
        <Text style={styles.or}>or</Text>
        <View style={styles.rule} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  or: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
});
