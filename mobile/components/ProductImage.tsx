import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { categoryTint, colors } from '@/lib/theme';
import type { Product } from '@/lib/products';

type Props = { product: Pick<Product, 'category' | 'imageUrl' | 'imageFallbackUrl'>; label?: string; style?: StyleProp<ViewStyle> };

// The product photo from Supabase Storage, drawn over the website's category-tinted leaf tile.
// The tile is what shows while the photo loads, and if every image URL fails.
export default function ProductImage({ product, label, style }: Props) {
  const urls = [product.imageUrl, product.imageFallbackUrl].filter((u): u is string => !!u);
  const key = urls.join('|');
  const [state, setState] = useState({ key: '', failed: 0, loaded: false });
  const fresh = state.key === key ? state : { key, failed: 0, loaded: false }; // reset if the image URL changes in Supabase
  const src = urls[fresh.failed];

  return (
    <View accessible={!!label} accessibilityRole="image" accessibilityLabel={label} style={[styles.tile, { backgroundColor: categoryTint[product.category] }, style]}>
      {!(src && fresh.loaded) && <View style={styles.leaf} />}
      {src ? (
        <Image
          key={src}
          source={{ uri: src }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onLoad={() => setState({ ...fresh, loaded: true })}
          onError={() => setState({ key, failed: fresh.failed + 1, loaded: false })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { aspectRatio: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  leaf: { width: '42%', aspectRatio: 1, backgroundColor: colors.forest, borderTopLeftRadius: 0, borderTopRightRadius: 999, borderBottomRightRadius: 0, borderBottomLeftRadius: 999, transform: [{ rotate: '-8deg' }] },
});
