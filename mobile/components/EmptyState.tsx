import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { LeafLogo } from './icons';
import { colors, fonts, type } from '@/lib/theme';

type Props = { title: string; message?: string; actionLabel?: string; onAction?: () => void; secondaryLabel?: string; onSecondary?: () => void };

// Empty / error / not-found screens: say what happened and offer the next step.
export default function EmptyState({ title, message, actionLabel, onAction, secondaryLabel, onSecondary }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.mark}>
        <LeafLogo size={30} color={colors.fern} vein={colors.paper2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} style={{ marginTop: 8 }} /> : null}
      {secondaryLabel && onSecondary ? <Button label={secondaryLabel} variant="link" onPress={onSecondary} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: colors.paper },
  mark: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.paper2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { ...type.h1, color: colors.ink },
  message: { ...type.body, color: colors.inkSoft, maxWidth: 340 },
});
