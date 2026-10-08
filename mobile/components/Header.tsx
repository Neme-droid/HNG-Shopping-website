import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/lib/cart';
import { colors, fonts, type } from '@/lib/theme';
import { CartIcon, LeafLogo } from './icons';

// Cart shortcut with the item-count bubble (sun when the cart has items), like the website header.
export function CartButton() {
  const router = useRouter();
  const { count } = useCart();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      hitSlop={8}
      onPress={() => router.navigate('/cart')}
      style={({ pressed }) => [styles.cart, pressed && { opacity: 0.7 }]}
    >
      <CartIcon size={24} color={colors.forest} />
      <View style={[styles.count, count > 0 && { backgroundColor: colors.sun }]}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </Pressable>
  );
}

type Props = { title?: string; subtitle?: string; showCart?: boolean };

// No title = brand header (logo + name). With a title = large screen title for the other tabs.
export default function Header({ title, subtitle, showCart = true }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {title ? (
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        ) : (
          <View style={styles.logo} accessibilityRole="header" accessibilityLabel="TerraVerde">
            <LeafLogo size={26} color={colors.forest} />
            <Text style={styles.logoText}>TerraVerde</Text>
          </View>
        )}
        {showCart && <CartButton />}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.paper, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontFamily: fonts.displayBold, fontSize: 24, letterSpacing: -0.7, color: colors.forest },
  title: { ...type.h1, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft, marginTop: 2 },
  cart: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6 },
  count: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: colors.paper2, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
});
