import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { CartIcon, HomeIcon, ShopIcon, UserIcon } from '@/components/icons';
import { useCart } from '@/lib/cart';
import { colors, fonts } from '@/lib/theme';

export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: '#6B796F',
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16 },
        tabBarItemStyle: { paddingTop: 4, paddingBottom: 4 },
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          ...(Platform.OS === 'web' ? { height: 64 } : null), // web preview only: native sizes the bar itself
        },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ color }) => <ShopIcon color={color} /> }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.sun, color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 11 },
        }}
      />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ color }) => <UserIcon color={color} /> }} />
    </Tabs>
  );
}
