import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import type { CategoryId } from '@/lib/products';

type IconProps = { size?: number; color?: ColorValue };

// Brand mark, same paths as the website's LeafLogo.
export const LeafLogo = ({ size = 26, color = '#17402A', vein = '#F6F7F1' }: { size?: number; color?: string; vein?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16Z" fill={color} />
    <Path d="M4 20 14 10" stroke={vein} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

const Stroke = ({ size = 24, color = '#12261A', children, width = 2 }: IconProps & { children: ReactNode; width?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const HomeIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />
  </Stroke>
);
// Shop = a basket of leaves-and-handles feel: a simple tote
export const ShopIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M5 8h14l-1 12H6L5 8Z" />
    <Path d="M9 8V7a3 3 0 0 1 6 0v1" />
  </Stroke>
);
// Same cart glyph as the website header
export const CartIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M3 4h2l2.4 11h10.2L20 8H6.2" />
    <Circle cx={9} cy={19.5} r={1.2} />
    <Circle cx={17} cy={19.5} r={1.2} />
  </Stroke>
);
export const UserIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4.5 20c.8-4 4-6 7.5-6s6.7 2 7.5 6" />
  </Stroke>
);
export const CheckIcon = (p: IconProps) => (
  <Stroke {...p} width={2.5}>
    <Path d="m5 12.5 4.5 4.5L19 7.5" />
  </Stroke>
);
export const TrashIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </Stroke>
);

// 40x40 outline icons from the website (components/icons.tsx), re-drawn with react-native-svg.
export function CategoryIcon({ id, size = 40, color = '#17402A' }: { id: CategoryId; size?: number; color?: string }) {
  const content: Record<CategoryId, ReactNode> = {
    cosmetics: <Path d="M14 6h12v8H14zM12 14h16v20H12z" />,
    edibles: <Path d="M8 20h24a12 12 0 0 1-24 0ZM14 14c0-4 4-4 4-8M22 14c0-4 4-4 4-8" />,
    medicine: (
      <>
        <Rect x={6} y={14} width={28} height={12} rx={6} transform="rotate(-35 20 20)" />
        <Path d="m15 25 10-10" />
      </>
    ),
    shoes: <Path d="M6 28V12l8 6 6 4h14v6H6ZM6 34h28" />,
    clothes: <Path d="m14 6-8 6 4 6 4-2v18h12V16l4 2 4-6-8-6c-1 3-3 5-6 5s-5-2-6-5Z" />,
    seeds: <Path d="M20 34V18M20 18c0-6-4-9-10-9 0 6 4 9 10 9ZM20 22c0-5 4-8 10-8 0 5-4 8-10 8Z" />,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {content[id]}
    </Svg>
  );
}

export function ValueIcon({ index, size = 28, color = '#F6F7F1' }: { index: number; size?: number; color?: string }) {
  const icons: ReactNode[] = [
    <Path key="a" d="M20 34V16M20 16c0-6-4-9-10-9 0 6 4 9 10 9ZM20 22c0-5 4-8 10-8 0 5-4 8-10 8Z" />,
    <Path key="b" d="M6 30c6-12 14-12 20 0M26 30c2-5 5-8 8-9M6 34h28" />,
    <G key="c">
      <Rect x={8} y={6} width={24} height={28} rx={3} />
      <Path d="M14 14h12M14 20h12M14 26h7" />
    </G>,
    <G key="d">
      <Circle cx={14} cy={15} r={5} />
      <Circle cx={27} cy={17} r={4} />
      <Path d="M5 32c1-6 5-8 9-8s8 2 9 8M24 25c5-1 9 1 10 7" />
    </G>,
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {icons[index % icons.length]}
    </Svg>
  );
}
