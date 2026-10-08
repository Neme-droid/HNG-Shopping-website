import type { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import { useCatalog } from '@/lib/catalog';
import { colors } from '@/lib/theme';
import EmptyState from './EmptyState';

// Shows loading / error / empty states until there are products to display, then renders its children.
export default function CatalogGate({ children }: { children: ReactNode }) {
  const { products, status, error, refresh } = useCatalog();
  if (products.length > 0) return <>{children}</>;
  if (status === 'loading') return <ActivityIndicator style={{ flex: 1 }} color={colors.fern} accessibilityLabel="Loading products" />;
  if (status === 'error')
    return <EmptyState title="We couldn’t load the products" message={error ?? 'Something went wrong. Please try again.'} actionLabel="Try again" onAction={refresh} />;
  return <EmptyState title="No products yet" message="New products will appear here as soon as they’re added." actionLabel="Refresh" onAction={refresh} />;
}
