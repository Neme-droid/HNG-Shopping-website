import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import CatalogGate from '@/components/CatalogGate';
import { useCatalog } from '@/lib/catalog';
import { categories, categoryName, isCategory, type CategoryId } from '@/lib/products';
import { colors, fonts } from '@/lib/theme';

type Filter = CategoryId | 'all';
const options: { id: Filter; name: string }[] = [{ id: 'all', name: 'All' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

export default function Shop() {
  const router = useRouter();
  const { products, refresh, refreshing } = useCatalog();
  // The Home category tiles navigate here with ?category=...; `t` makes repeat taps re-apply the filter.
  const { category, t } = useLocalSearchParams<{ category?: string; t?: string }>();
  const [filter, setFilter] = useState<Filter>(isCategory(category) ? category : 'all');

  useEffect(() => {
    setFilter(isCategory(category) ? category : 'all');
  }, [category, t]);

  const visible = useMemo(() => (filter === 'all' ? products : products.filter((p) => p.category === filter)), [filter, products]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Header title="Shop" subtitle="Natural products from growers and makers we know by name." />
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityRole="tablist">
          {options.map((o) => {
            const active = filter === o.id;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(o.id)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && !active && { backgroundColor: colors.paper2 }]}
              >
                <Text style={[styles.chipText, active && { color: colors.paper }]}>{o.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <CatalogGate>
      <ProductGrid
        products={visible}
        onRefresh={refresh}
        refreshing={refreshing}
        header={
          <Text style={styles.count} accessibilityLiveRegion="polite">
            {visible.length} {visible.length === 1 ? 'product' : 'products'}
            {filter !== 'all' ? ` in ${categoryName(filter)}` : ''}
          </Text>
        }
        empty={<EmptyState title="Nothing here yet" message="There are no products in this category right now." actionLabel="Show all products" onAction={() => setFilter('all')} />}
      />
      </CatalogGate>
    </View>
  );
}

const styles = StyleSheet.create({
  chipsWrap: { backgroundColor: colors.paper },
  chips: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  chip: { paddingHorizontal: 18, minHeight: 40, justifyContent: 'center', borderRadius: 999, borderWidth: 1.5, borderColor: colors.ink },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 14.5, color: colors.ink },
  count: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, paddingHorizontal: 20, paddingBottom: 16 },
});
