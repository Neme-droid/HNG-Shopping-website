import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatPrice, getRelated, priceToCents, resolveImage, toProduct, toProducts } from '../lib/products';

const URL = 'https://bhmtxihhkjmgvozlozqd.supabase.co';
const rows = JSON.parse(readFileSync(new URL_('fixtures/products-rows.json'), 'utf8'));
function URL_(p: string) { return new globalThis.URL(p, `file://${__dirname}/`); }

test('the real CSV rows all become products', () => {
  const warnings: string[] = [];
  const list = toProducts(rows, URL, (m) => warnings.push(m));
  assert.equal(list.length, 8);
  assert.deepEqual(warnings, []);
  const lav = list.find((p) => p.slug === 'lavender-facial-serum')!;
  assert.equal(lav.priceCents, 2800); // product_price 28 (dollars) -> 2800 cents
  assert.equal(lav.category, 'cosmetics');
  assert.equal(lav.badge, 'Best seller');
  assert.equal(lav.stock, 50);
  assert.equal(lav.featured, true);
  assert.equal(list.find((p) => p.slug === 'heirloom-tomato-mix')!.priceCents, 500);
});

test('the dollar sign is ALWAYS before the price', () => {
  for (const p of toProducts(rows, URL)) assert.match(formatPrice(p.priceCents), /^\$\d/);
  assert.equal(formatPrice(2800), '$28.00');
  assert.equal(formatPrice(500), '$5.00');
  assert.equal(formatPrice(5), '$0.05');
  assert.equal(formatPrice(0), '$0.00');
  assert.equal(formatPrice(123456), '$1,234.56');
  assert.equal(formatPrice(100000000), '$1,000,000.00');
  assert.equal(formatPrice(NaN), '$0.00');
});

test('product_price formats from Supabase', () => {
  assert.equal(priceToCents(28), 2800);
  assert.equal(priceToCents('28'), 2800);
  assert.equal(priceToCents('28.5'), 2850);
  assert.equal(priceToCents('$19.99'), 1999);
  assert.equal(priceToCents(0.1 + 0.2), 30); // no float drift
  assert.equal(priceToCents(null), null);
  assert.equal(priceToCents('abc'), null);
  assert.equal(priceToCents(-4), null);
});

test('dashboard links in image_url become real public image URLs', () => {
  const r = resolveImage('https://supabase.com/dashboard/project/bhmtxihhkjmgvozlozqd/storage/files/buckets/product_images?preview=Wildflower+honey.png');
  assert.equal(r.url, `${URL}/storage/v1/object/public/product_images/Wildflower%20honey.png`);
  assert.equal(r.fallback, undefined);
  const s = resolveImage('https://supabase.com/dashboard/project/bhmtxihhkjmgvozlozqd/storage/files/buckets/product_images?preview=Tomato+mix.png');
  assert.equal(s.url, `${URL}/storage/v1/object/public/product_images/Tomato%20mix.png`);
});

test('signed links become public links with the signed one kept as fallback', () => {
  const raw = `${URL}/storage/v1/object/sign/product_images/Lavender%20Facial%20Serum.jpeg?token=abc`;
  const r = resolveImage(raw);
  assert.equal(r.url, `${URL}/storage/v1/object/public/product_images/Lavender%20Facial%20Serum.jpeg`);
  assert.equal(r.fallback, raw);
});

test('plain file names and normal URLs', () => {
  assert.equal(resolveImage('Lavender Facial Serum.jpeg', URL).url, `${URL}/storage/v1/object/public/product_images/Lavender%20Facial%20Serum.jpeg`);
  assert.equal(resolveImage('https://cdn.example.com/a.png').url, 'https://cdn.example.com/a.png');
  assert.deepEqual(resolveImage('', URL), {});
  assert.deepEqual(resolveImage(null, URL), {});
  assert.deepEqual(resolveImage('file.png'), {}); // no base url known
});

test('hidden / broken rows are skipped with a reason, good rows survive', () => {
  const warnings: string[] = [];
  const list = toProducts(
    [
      { slug: 'a', name: 'A', product_categories: 'seeds', product_price: 5, active: true },
      { slug: 'b', name: 'B', product_categories: 'seeds', product_price: 5, active: false },
      { slug: 'c', name: 'C', product_categories: 'seeds', product_price: 5, active: 'FALSE' },
      { slug: 'd', name: 'D', product_categories: 'gadgets', product_price: 5 },
      { slug: 'e', name: 'E', product_categories: 'seeds', product_price: 'free' },
      { name: 'no slug', product_categories: 'seeds', product_price: 5 },
      { slug: 'f', name: 'F', product_categories: ' Seeds ', product_price: '7', stock: 0, is_featured: 'TRUE', badge: '' },
    ],
    URL,
    (m) => warnings.push(m),
  );
  assert.deepEqual(list.map((p) => p.slug), ['a', 'f']);
  assert.equal(warnings.length, 3); // unknown category, bad price, no slug (inactive rows are skipped silently)
  const f = list[1];
  assert.equal(f.category, 'seeds');
  assert.equal(f.stock, 0);
  assert.equal(f.badge, undefined);
  assert.equal(f.featured, true);
  assert.deepEqual(toProducts(null), []);
});

test('about/details: database wins, else bundled copy, else empty', () => {
  const base = { name: 'X', product_categories: 'seeds', product_price: 1 };
  assert.equal(toProduct({ ...base, slug: 'organic-quinoa' })!.details.length, 3); // bundled copy
  assert.equal(toProduct({ ...base, slug: 'organic-quinoa', about: 'From DB', details: ['one', 'two'] })!.about, 'From DB');
  assert.deepEqual(toProduct({ ...base, slug: 'organic-quinoa', details: ['one', 'two'] })!.details, ['one', 'two']);
  assert.deepEqual(toProduct({ ...base, slug: 'organic-quinoa', details: 'a\nb' })!.details, ['a', 'b']);
  assert.deepEqual(toProduct({ ...base, slug: 'brand-new' })!.details, []);
  assert.equal(toProduct({ ...base, slug: 'brand-new' })!.about, '');
});

test('related products', () => {
  const list = toProducts(rows, URL);
  const lav = list.find((p) => p.slug === 'lavender-facial-serum')!;
  const rel = getRelated(list, lav);
  assert.equal(rel.length, 4);
  assert.equal(rel[0].slug, 'shea-butter-body-cream'); // same category first
  assert.ok(!rel.some((p) => p.slug === lav.slug));
});
