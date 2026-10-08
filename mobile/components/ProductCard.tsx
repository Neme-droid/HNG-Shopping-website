import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatPrice, categoryName, inStock, type Product } from '@/lib/products';
import { colors, fonts, type } from '@/lib/theme';
import AddToCartButton from './AddToCartButton';
import ProductImage from './ProductImage';

type Props = { product: Product; width?: number };

// Memoised so a cart change doesn't re-render every card in the list.
function ProductCard({ product, width }: Props) {
  const router = useRouter();
  const open = () => router.push(`/products/${product.slug}`);
  return (
    <View style={[styles.card, width ? { width } : { flex: 1 }]}>
      <Pressable
        onPress={open}
        accessibilityRole="link"
        accessibilityLabel={`${product.name}, ${formatPrice(product.priceCents)}${product.badge ? `, ${product.badge}` : ''}`}
        style={({ pressed }) => [{ gap: 8 }, pressed && { opacity: 0.85 }]}
      >
        <View>
          <ProductImage product={product} />
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.category}>{categoryName(product.category)}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.price}>{formatPrice(product.priceCents)}</Text>
      </Pressable>
      <AddToCartButton slug={product.slug} small disabled={!inStock(product)} />
    </View>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: { gap: 10, justifyContent: 'space-between' },
  badge: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.paper, paddingHorizontal: 11, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  category: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  name: { ...type.h3, color: colors.ink, marginTop: -4 },
  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  price: { ...type.price, color: colors.ink, fontSize: 19 },
});
