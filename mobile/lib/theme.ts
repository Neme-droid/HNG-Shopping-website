import type { CategoryId } from './products';

// Design tokens ported 1:1 from the website's app/globals.css (:root).
export const colors = {
  ink: '#12261A',
  inkSoft: '#3B4A40',
  forest: '#17402A',
  forestDeep: '#0F2C1D',
  fern: '#2F6B3F',
  paper: '#F6F7F1',
  paper2: '#ECEFE4',
  surface: '#FBFCF8', // form/card surface used by the site's inputs and value cards
  line: '#D3D9C8',
  sun: '#F0BE3C',
  sunSoft: '#F7D065',
  error: '#A6341F',
  onForestSoft: '#CFDDCF',
  onForestMuted: '#B7CBB9',
} as const;

export const categoryTint: Record<CategoryId, string> = {
  cosmetics: '#F2D3CF',
  edibles: '#F4E0A0',
  medicine: '#CBE0CF',
  shoes: '#E3D0B6',
  clothes: '#D3DDEA',
  seeds: '#DCE8A6',
};

export const fonts = {
  displayRegular: 'Fraunces_400Regular',
  display: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  displayBold: 'Fraunces_700Bold',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
} as const;

// 4pt scale (website: --s1 .25rem ... --s12 6rem)
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 10: 64, 12: 96 } as const;
export const radius = { sm: 8, md: 16, pill: 999 } as const;

// Type scale. Display = Fraunces, body = Hanken Grotesk. Tight tracking on headings like the site.
export const type = {
  hero: { fontFamily: fonts.displayMedium, fontSize: 42, lineHeight: 44, letterSpacing: -1.6 },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 35, letterSpacing: -0.9 },
  h2: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.7 },
  h3: { fontFamily: fonts.display, fontSize: 19, lineHeight: 22, letterSpacing: -0.3 },
  price: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 18 },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
