import { useCallback, type ReactElement } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';

const GUTTER = 16;
const PAD = 20;

type Props = {
  products: Product[];
  layout?: 'grid' | 'rail';
  header?: ReactElement | null;
  empty?: ReactElement | null;
  footer?: ReactElement | null;
  onRefresh?: () => void;
  refreshing?: boolean;
};

// grid = 2-column vertical FlatList (Shop). rail = horizontal FlatList (Home, "You might also like").
export default function ProductGrid({ products, layout = 'grid', header, empty, footer, onRefresh, refreshing }: Props) {
  const { width } = useWindowDimensions();
  const keyExtractor = useCallback((p: Product) => p.slug, []);

  if (layout === 'rail') {
    const cardWidth = Math.min(210, (width - PAD * 2 - GUTTER) / 1.7);
    return (
      <FlatList
        horizontal
        data={products}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, gap: GUTTER }}
        snapToInterval={cardWidth + GUTTER}
        decelerationRate="fast"
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={{ gap: GUTTER, paddingHorizontal: PAD }}
      contentContainerStyle={{ paddingBottom: 32, gap: 28 }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      keyboardShouldPersistTaps="handled"
      onRefresh={onRefresh}
      refreshing={!!refreshing}
      initialNumToRender={6}
      windowSize={7}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}
