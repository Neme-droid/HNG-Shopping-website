import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import CartItem from '@/components/CartItem';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { authHref } from '@/lib/auth-redirect';
import { useCart } from '@/lib/cart';
import { useCatalog } from '@/lib/catalog';
import { formatPrice } from '@/lib/products';
import { colors, fonts, type } from '@/lib/theme';

export default function CartScreen() {
  const router = useRouter();
  const { user, ready: authReady } = useAuth();
  const { lines, subtotalCents, count, loading, hiddenCount, setQuantity, remove, clear } = useCart();
  const { refresh } = useCatalog();

  const body = () => {
    if (loading || !authReady) return <ActivityIndicator style={{ flex: 1 }} color={colors.fern} />;

    // The website keeps /cart behind sign-in; the mobile app does the same.
    if (!user)
      return (
        <EmptyState
          title="Sign in to see your cart"
          message="Create a free account to add products to your cart and check out."
          actionLabel="Sign in"
          onAction={() => router.push(authHref('/cart'))}
          secondaryLabel="Create an account"
          onSecondary={() => router.push(authHref('/cart', 'signup'))}
        />
      );

    if (lines.length === 0 && hiddenCount > 0)
      return (
        <EmptyState
          title="Your saved items aren’t available right now"
          message="They may have been removed from the store, or we can’t reach it. Try again, or clear your cart."
          actionLabel="Try again"
          onAction={refresh}
          secondaryLabel="Clear cart"
          onSecondary={clear}
        />
      );

    if (lines.length === 0)
      return (
        <EmptyState
          title="Your cart is empty"
          message="Add something from the shop and it will show up here."
          actionLabel="Browse products"
          onAction={() => router.navigate('/shop')}
        />
      );

    return (
      <FlatList
        data={lines}
        keyExtractor={(l) => l.slug}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        renderItem={({ item }) => <CartItem line={item} onQuantity={setQuantity} onRemove={remove} />}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order summary</Text>
            <View style={styles.row}>
              <Text style={styles.rowText}>Items ({count})</Text>
              <Text style={styles.rowText}>{formatPrice(subtotalCents)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowText}>Shipping</Text>
              <Text style={styles.rowText}>Calculated at checkout</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.total}>Subtotal</Text>
              <Text style={styles.total}>{formatPrice(subtotalCents)}</Text>
            </View>
            <Button label="Go to checkout" onPress={() => router.push('/checkout')} />
            <View style={styles.links}>
              <Button label="Continue shopping" variant="link" onPress={() => router.navigate('/shop')} />
              <Button
                label="Clear cart"
                variant="link"
                onPress={() =>
                  Alert.alert('Clear your cart?', `This removes all ${count} item${count === 1 ? '' : 's'}.`, [
                    { text: 'Keep items', style: 'cancel' },
                    { text: 'Clear cart', style: 'destructive', onPress: clear },
                  ])
                }
              />
            </View>
          </View>
        }
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Header title="Your cart" showCart={false} />
      {body()}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: colors.paper2, borderRadius: 16, padding: 22, gap: 12, marginTop: 8 },
  summaryTitle: { ...type.h3, fontSize: 22, color: colors.ink, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowText: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, marginBottom: 6 },
  total: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  links: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
