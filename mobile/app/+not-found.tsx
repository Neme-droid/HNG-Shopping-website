import { useRouter } from 'expo-router';
import EmptyState from '@/components/EmptyState';

export default function NotFound() {
  const router = useRouter();
  return (
    <EmptyState
      title="We couldn’t find that page"
      message="The product may have been removed, or the link is mistyped."
      actionLabel="Browse products"
      onAction={() => router.replace('/shop')}
    />
  );
}
