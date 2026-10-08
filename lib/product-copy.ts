// Long-form copy for the product page ("about" and "details").
// The Supabase `products` table does not have these columns yet, so until you add them (see
// supabase/products-setup.sql) we keep this copy here, keyed by slug. If a row DOES have `about`/`details`,
// the database value always wins. Everything else (name, price, image, stock...) comes only from Supabase.
export const productCopy: Record<string, { about: string; details: string[] }> = {
  'lavender-facial-serum': {
    about: 'A light serum that sinks in fast and leaves skin soft, not greasy. Gentle enough for sensitive skin.',
    details: ['30 ml glass bottle with dropper', 'Organic lavender, jojoba and vitamin E', 'No synthetic fragrance'],
  },
  'wildflower-honey': {
    about: 'Harvested in small batches and jarred without heating, so the flavour changes with the season.',
    details: ['350 g glass jar', 'Raw and unfiltered', 'May crystallise naturally; warm gently to loosen'],
  },
  'echinacea-tincture': {
    about: 'Made from the root and flowering tops of organically grown echinacea, extracted in small batches.',
    details: ['50 ml amber bottle with dropper', 'Organic echinacea in an alcohol base', 'Check with your doctor if you are pregnant or on medication'],
  },
  'cork-wanderer-sandals': {
    about: 'A contoured cork footbed that moulds to your foot over the first few weeks, on a flexible natural rubber sole.',
    details: ['Cork footbed, natural rubber sole', 'Adjustable hemp straps', 'Sizes EU 36 to 46'],
  },
  'linen-summer-tunic': {
    about: 'A loose, breathable tunic that softens with every wash. Cut long enough to wear over trousers or alone.',
    details: ['100% organic linen', 'Machine wash cold', 'Sizes XS to XL'],
  },
  'heirloom-tomato-mix': {
    about: 'Open-pollinated seeds you can save year after year. Sow indoors six weeks before the last frost.',
    details: ['About 40 seeds per packet', 'Open-pollinated heirloom varieties', 'Paper packet, plastic-free'],
  },
  'shea-butter-body-cream': {
    about: 'A thick, slow-absorbing cream for dry skin. A little goes a long way.',
    details: ['150 ml tin', 'Organic shea butter and coconut oil', 'Lightly scented with essential oils'],
  },
  'organic-quinoa': {
    about: 'Pre-rinsed white quinoa that cooks in fifteen minutes. Good in salads, bowls and porridge.',
    details: ['500 g paper bag', 'Certified organic', 'Gluten-free'],
  },
};
