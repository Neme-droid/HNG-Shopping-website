import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddToCartButton from '@/components/AddToCartButton';
import EmptyState from '@/components/EmptyState';
import { CartButton } from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import ProductImage from '@/components/ProductImage';
import QuantityStepper from '@/components/QuantityStepper';
import { useCatalog } from '@/lib/catalog';
import { categoryName, formatPrice, getRelated, inStock } from '@/lib/products';
import { colors, fonts, type } from '@/lib/theme';

export default function ProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { products, getProduct, status, error, refresh } = useCatalog();
  const product = slug ? getProduct(slug) : undefined;
  const [qty, setQty] = useState(1);
  const related = useMemo(() => (product ? getRelated(products, product) : []), [products, product]);

  if (!product && status === 'loading') return <ActivityIndicator style={{ flex: 1 }} color={colors.fern} accessibilityLabel="Loading product" />;

  if (!product && status === 'error')
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <EmptyState title="We couldn’t load this product" message={error ?? 'Please try again.'} actionLabel="Try again" onAction={refresh} />
      </>
    );

  if (!product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState
          title="We couldn’t find that product"
          message="It may have been removed, or the link is mistyped."
          actionLabel="Browse products"
          onAction={() => router.replace('/shop')}
        />
      </>
    );
  }

  const available = inStock(product);
  const low = available && product.stock !== undefined && product.stock <= 5;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Stack.Screen options={{ title: '', headerRight: () => <CartButton /> }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
          <View>
            <ProductImage product={product} label={product.name} />
            {product.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.category}>{categoryName(product.category)}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {product.name}
          </Text>
          <Text style={styles.price}>{formatPrice(product.priceCents)}</Text>
          <Text style={styles.lede}>{product.description}</Text>
          {low && <Text style={styles.stock}>Only {product.stock} left</Text>}

          {product.about ? (
            <>
              <Text style={styles.heading}>About</Text>
              <Text style={styles.about}>{product.about}</Text>
            </>
          ) : null}

          {product.details.length > 0 && (
            <>
              <Text style={styles.heading}>Details</Text>
              <View style={styles.details}>
                {product.details.map((d) => (
                  <View key={d} style={styles.detailRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.detailText}>{d}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.relatedWrap}>
          <Text style={[type.h2, { color: colors.ink, paddingHorizontal: 20, marginBottom: 20 }]}>You might also like</Text>
          <ProductGrid layout="rail" products={related} />
        </View>
      </ScrollView>

      {/* Sticky purchase bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        {available && <QuantityStepper value={qty} onChange={setQty} label={`Quantity of ${product.name}`} max={product.stock} />}
        <AddToCartButton slug={product.slug} quantity={qty} disabled={!available} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: 14, left: 14, backgroundColor: colors.paper, paddingHorizontal: 13, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  info: { paddingHorizontal: 20, paddingTop: 22, gap: 8 },
  category: { fontFamily: fonts.body, fontSize: 14.5, color: colors.inkSoft },
  title: { ...type.h1, fontSize: 34, lineHeight: 37, color: colors.ink },
  price: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: 6 },
  stock: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.inkSoft },
  lede: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 26, color: colors.ink },
  heading: { ...type.h3, fontSize: 21, color: colors.ink, marginTop: 20 },
  about: { ...type.body, color: colors.inkSoft },
  details: { gap: 12, paddingTop: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bullet: { width: 10, height: 10, marginTop: 7, backgroundColor: colors.fern, borderTopRightRadius: 10, borderBottomLeftRadius: 10 },
  detailText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  relatedWrap: { backgroundColor: colors.paper2, marginTop: 36, paddingVertical: 40 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: colors.line },
});
