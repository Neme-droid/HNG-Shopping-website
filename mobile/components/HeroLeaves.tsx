import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// The hero illustration from the website (sun + three leaves), drawn natively.
// The one orchestrated motion on the home screen: the leaves sway in once, staggered. Skipped if Reduce Motion is on.
const W = 320;
const H = 360;

export default function HeroLeaves({ width = 170 }: { width?: number }) {
  const height = (width * H) / W;
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) return anims.forEach((a) => a.setValue(1));
      Animated.stagger(
        120,
        anims.map((a) => Animated.timing(a, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true })),
      ).start();
    });
    return () => {
      cancelled = true;
    };
  }, [anims]);

  const leaves = [
    <>
      <Path d="M160 340C40 320 20 190 70 120c70 10 110 90 90 220Z" fill="#2F6B3F" />
      <Path d="M160 340C110 250 90 190 70 120" stroke="#17402A" strokeWidth={4} fill="none" />
    </>,
    <>
      <Path d="M160 340c-10-130 30-210 110-230 40 90-10 200-110 230Z" fill="#4C8B5A" />
      <Path d="M160 340C200 250 240 190 270 110" stroke="#17402A" strokeWidth={4} fill="none" />
    </>,
    <Path d="M160 340c-40-60-30-120 0-170 40 50 40 110 0 170Z" fill="#A9CF8A" />,
  ];

  return (
    <View style={{ width, height }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <Circle cx={220} cy={90} r={56} fill="#F0BE3C" />
      </Svg>
      {leaves.map((leaf, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width,
            height,
            opacity: anims[i],
            transformOrigin: '50% 100%',
            transform: [
              { rotate: anims[i].interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '0deg'] }) },
              { scale: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
            ],
          }}
        >
          <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
            {leaf}
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}
