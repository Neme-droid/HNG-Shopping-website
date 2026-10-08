import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CatalogGate from '@/components/CatalogGate';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import { useCatalog } from '@/lib/catalog';
import { colors, fonts, type } from '@/lib/theme';

// Landing page = the product section only. Shows the products marked is_featured in Supabase
// (or every product if none are marked), and updates live when the table changes.
export default function Home() {
  const { products, refresh, refreshing } = useCatalog();
  const shown = useMemo(() => {
    const featured = products.filter((p) => p.featured);
    return featured.length > 0 ? featured : products;
  }, [products]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Header />
      <CatalogGate>
        <ProductGrid
          products={shown}
          onRefresh={refresh}
          refreshing={refreshing}
          header={
            <View style={styles.intro}>
              <Text accessibilityRole="header" style={styles.title}>
                Customer favorites
              </Text>
              <Text style={styles.sub}>Hand-selected for quality and purity.</Text>
            </View>
          }
        />
      </CatalogGate>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, gap: 6 },
  title: { ...type.h2, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.inkSoft },
});
