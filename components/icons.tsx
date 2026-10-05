import type { ReactNode } from 'react';
import type { CategoryId } from '@/lib/products';

const stroke = {
  viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
} as const;

export const Icon = ({ children }: { children: ReactNode }) => <svg {...stroke}>{children}</svg>;

export const LeafLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16Z" fill="currentColor" />
    <path d="M4 20 14 10" stroke="#F6F7F1" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const categoryIcons: Record<CategoryId, ReactNode> = {
  cosmetics: <path d="M14 6h12v8H14zM12 14h16v20H12z" />,
  edibles: <path d="M8 20h24a12 12 0 0 1-24 0ZM14 14c0-4 4-4 4-8M22 14c0-4 4-4 4-8" />,
  medicine: (<><rect x="6" y="14" width="28" height="12" rx="6" transform="rotate(-35 20 20)" /><path d="m15 25 10-10" /></>),
  shoes: <path d="M6 28V12l8 6 6 4h14v6H6ZM6 34h28" />,
  clothes: <path d="m14 6-8 6 4 6 4-2v18h12V16l4 2 4-6-8-6c-1 3-3 5-6 5s-5-2-6-5Z" />,
  seeds: <path d="M20 34V18M20 18c0-6-4-9-10-9 0 6 4 9 10 9ZM20 22c0-5 4-8 10-8 0 5-4 8-10 8Z" />,
};

export const valueIcons: ReactNode[] = [
  <path key="a" d="M20 34V16M20 16c0-6-4-9-10-9 0 6 4 9 10 9ZM20 22c0-5 4-8 10-8 0 5-4 8-10 8Z" />,
  <path key="b" d="M6 30c6-12 14-12 20 0M26 30c2-5 5-8 8-9M6 34h28" />,
  <g key="c"><rect x="8" y="6" width="24" height="28" rx="3" /><path d="M14 14h12M14 20h12M14 26h7" /></g>,
  <g key="d"><circle cx="14" cy="15" r="5" /><circle cx="27" cy="17" r="4" /><path d="M5 32c1-6 5-8 9-8s8 2 9 8M24 25c5-1 9 1 10 7" /></g>,
];
