// Placeholder catalogue. Step 2 replaces this with a Supabase query
// (select from `products` where active = true) behind the same function names.

export type CategoryId = 'cosmetics' | 'edibles' | 'medicine' | 'shoes' | 'clothes' | 'seeds';

export type Category = { id: CategoryId; name: string; description: string };

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  badge?: 'New' | 'Best seller';
  description: string;
  about: string;
  details: string[];
  priceCents: number;
};

export const categories: Category[] = [
  { id: 'cosmetics', name: 'Cosmetics', description: 'Skincare, balms and soaps made from botanical ingredients.' },
  { id: 'edibles', name: 'Edibles', description: 'Honey, teas, oils, grains and spices, straight from the grower.' },
  { id: 'medicine', name: 'Medicine', description: 'Herbal remedies and tinctures rooted in traditional use.' },
  { id: 'shoes', name: 'Shoes', description: 'Cork, hemp and natural rubber footwear built to last.' },
  { id: 'clothes', name: 'Clothes', description: 'Organic cotton, linen and hemp for everyday comfort.' },
  { id: 'seeds', name: 'Seeds', description: 'Heirloom vegetable, herb and flower seeds to grow your own.' },
];

export const products: Product[] = [
  {
    slug: 'lavender-facial-serum', name: 'Lavender Facial Serum', category: 'cosmetics', badge: 'New', priceCents: 2800,
    description: 'Hydrating serum with organic lavender and jojoba oil.',
    about: 'A light serum that sinks in fast and leaves skin soft, not greasy. Gentle enough for sensitive skin.',
    details: ['30 ml glass bottle with dropper', 'Organic lavender, jojoba and vitamin E', 'No synthetic fragrance'],
  },
  {
    slug: 'wildflower-honey', name: 'Wildflower Honey', category: 'edibles', badge: 'Best seller', priceCents: 1600,
    description: 'Raw, unfiltered honey from mountain meadows.',
    about: 'Harvested in small batches and jarred without heating, so the flavour changes with the season.',
    details: ['350 g glass jar', 'Raw and unfiltered', 'May crystallise naturally; warm gently to loosen'],
  },
  {
    slug: 'echinacea-tincture', name: 'Echinacea Tincture', category: 'medicine', badge: 'New', priceCents: 2200,
    description: 'Herbal extract for immune support, in an alcohol base.',
    about: 'Made from the root and flowering tops of organically grown echinacea, extracted in small batches.',
    details: ['50 ml amber bottle with dropper', 'Organic echinacea in an alcohol base', 'Check with your doctor if you are pregnant or on medication'],
  },
  {
    slug: 'cork-wanderer-sandals', name: 'Cork Wanderer Sandals', category: 'shoes', badge: 'Best seller', priceCents: 4800,
    description: 'Cork footbed with a natural rubber sole.',
    about: 'A contoured cork footbed that moulds to your foot over the first few weeks, on a flexible natural rubber sole.',
    details: ['Cork footbed, natural rubber sole', 'Adjustable hemp straps', 'Sizes EU 36 to 46'],
  },
  {
    slug: 'linen-summer-tunic', name: 'Linen Summer Tunic', category: 'clothes', badge: 'New', priceCents: 3600,
    description: 'Lightweight organic linen for warm days.',
    about: 'A loose, breathable tunic that softens with every wash. Cut long enough to wear over trousers or alone.',
    details: ['100% organic linen', 'Machine wash cold', 'Sizes XS to XL'],
  },
  {
    slug: 'heirloom-tomato-mix', name: 'Heirloom Tomato Mix', category: 'seeds', badge: 'Best seller', priceCents: 500,
    description: 'Cherry, beefsteak and plum varieties in one packet.',
    about: 'Open-pollinated seeds you can save year after year. Sow indoors six weeks before the last frost.',
    details: ['About 40 seeds per packet', 'Open-pollinated heirloom varieties', 'Paper packet, plastic-free'],
  },
  {
    slug: 'shea-butter-body-cream', name: 'Shea Butter Body Cream', category: 'cosmetics', badge: 'Best seller', priceCents: 2400,
    description: 'Rich moisturizer with organic shea and coconut oil.',
    about: 'A thick, slow-absorbing cream for dry skin. A little goes a long way.',
    details: ['150 ml tin', 'Organic shea butter and coconut oil', 'Lightly scented with essential oils'],
  },
  {
    slug: 'organic-quinoa', name: 'Organic Quinoa', category: 'edibles', badge: 'New', priceCents: 800,
    description: 'White quinoa, high in protein and gluten-free.',
    about: 'Pre-rinsed white quinoa that cooks in fifteen minutes. Good in salads, bowls and porridge.',
    details: ['500 g paper bag', 'Certified organic', 'Gluten-free'],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getRelated = (p: Product, n = 4) =>
  [...products.filter((x) => x.category === p.category && x.slug !== p.slug),
   ...products.filter((x) => x.category !== p.category)].slice(0, n);
export const isCategory = (v: string | undefined): v is CategoryId => categories.some((c) => c.id === v);
export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)!.name;

// One place to change currency. Store minor units (cents/kobo) as integers.
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = (cents: number) => money.format(cents / 100);
