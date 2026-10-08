import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatPrice } from '@/lib/products';
import type { ResolvedLine } from '@/lib/cart-logic';
import { colors, fonts, type } from '@/lib/theme';
import ProductImage from './ProductImage';
import QuantityStepper from './QuantityStepper';

type Props = { line: ResolvedLine; onQuantity: (slug: string, qty: number) => void; onRemove: (slug: string) => void };

function CartItem({ line, onQuantity, onRemove }: Props) {
  const router = useRouter();
  const { product, quantity, lineTotalCents } = line;
  const open = () => router.push(`/products/${product.slug}`);
  return (
    <View style={styles.row}>
      <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={`View ${product.name}`}>
        <ProductImage product={product} style={styles.thumb} />
      </Pressable>
      <View style={styles.middle}>
        <Pressable onPress={open} accessibilityRole="link">
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
        </Pressable>
        <Text style={styles.meta}>{formatPrice(product.priceCents)} each</Text>
        <QuantityStepper compact value={quantity} onChange={(n) => onQuantity(product.slug, n)} label={`Quantity of ${product.name}`} />
      </View>
      <View style={styles.end}>
        <Text style={styles.total}>{formatPrice(lineTotalCents)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${product.name}`} hitSlop={10} onPress={() => onRemove(product.slug)}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default memo(CartItem);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.line, alignItems: 'flex-start' },
  thumb: { width: 76, borderRadius: 8 },
  middle: { flex: 1, gap: 6 },
  name: { ...type.h3, color: colors.ink },
  meta: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  end: { alignItems: 'flex-end', gap: 14, minHeight: 76 },
  total: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  remove: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSoft, textDecorationLine: 'underline' },
});
