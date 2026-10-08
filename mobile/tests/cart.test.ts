import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_QTY, countItems, linesReducer, parseStoredCart, reducer, resolveLines, subtotal } from '../lib/cart-logic';
import { checkoutSchema } from '../lib/checkout-schema';
import { signInSchema, signUpSchema } from '../lib/auth-schema';
import { findProduct, formatPrice, toProducts } from '../lib/products';
import { readFileSync } from 'node:fs';

// The catalogue now comes from Supabase; tests use the real exported rows as the "table".
const products = toProducts(JSON.parse(readFileSync(`${__dirname}/fixtures/products-rows.json`, 'utf8')), 'https://x.supabase.co');
const find = (slug: string) => findProduct(products, slug);

const A = 'lavender-facial-serum'; // 2800
const B = 'wildflower-honey'; // 1600

test('add / increase / decrease / remove / clear', () => {
  let l = linesReducer([], { type: 'add', slug: A, quantity: 1 });
  assert.deepEqual(l, [{ slug: A, quantity: 1 }]);
  l = linesReducer(l, { type: 'add', slug: A, quantity: 2 }); // adding again increases
  assert.equal(l[0].quantity, 3);
  l = linesReducer(l, { type: 'set', slug: A, quantity: 2 }); // decrease
  assert.equal(l[0].quantity, 2);
  l = linesReducer(l, { type: 'set', slug: A, quantity: 0 }); // never below 1
  assert.equal(l[0].quantity, 1);
  l = linesReducer(l, { type: 'add', slug: B, quantity: 1 });
  l = linesReducer(l, { type: 'remove', slug: A });
  assert.deepEqual(l, [{ slug: B, quantity: 1 }]);
  assert.deepEqual(linesReducer(l, { type: 'clear' }), []);
});

test('quantity is capped', () => {
  const l = linesReducer([], { type: 'add', slug: A, quantity: 999 });
  assert.equal(l[0].quantity, MAX_QTY);
});

test('products missing from Supabase are hidden from the cart but not deleted from storage', () => {
  const stored = [{ slug: A, quantity: 2 }, { slug: 'removed-product', quantity: 1 }];
  assert.equal(resolveLines(stored, find).length, 1);
  assert.equal(stored.length, 2);
  assert.equal(resolveLines(stored, () => undefined).length, 0); // catalogue not loaded yet: nothing resolves, nothing is lost
});

test('prices in the cart follow the live catalogue', () => {
  const stored = [{ slug: A, quantity: 2 }];
  const before = resolveLines(stored, find);
  const raised = products.map((p) => (p.slug === A ? { ...p, priceCents: 3000 } : p));
  const after = resolveLines(stored, (slug) => findProduct(raised, slug));
  assert.equal(before[0].lineTotalCents, 5600);
  assert.equal(after[0].lineTotalCents, 6000);
});

test('count and subtotal', () => {
  const lines = resolveLines([{ slug: A, quantity: 2 }, { slug: B, quantity: 3 }], find);
  assert.equal(countItems(lines), 5);
  assert.equal(subtotal(lines), 2 * 2800 + 3 * 1600);
  assert.equal(formatPrice(subtotal(lines)), '$104.00');
});

test('persistence round trip (what AsyncStorage stores and reads back)', () => {
  const saved = JSON.stringify([{ slug: A, quantity: 2 }, { slug: B, quantity: 1 }]);
  assert.deepEqual(parseStoredCart(saved), [{ slug: A, quantity: 2 }, { slug: B, quantity: 1 }]);
});

test('corrupt or stale storage never crashes the cart', () => {
  assert.deepEqual(parseStoredCart(null), []);
  assert.deepEqual(parseStoredCart('{not json'), []);
  assert.deepEqual(parseStoredCart('{"a":1}'), []);
  const messy = JSON.stringify([{ slug: 'removed-product', quantity: 2 }, { slug: A, quantity: 'x' }, { slug: A, quantity: 5 }, null, { slug: B, quantity: 500 }]);
  assert.deepEqual(parseStoredCart(messy), [{ slug: 'removed-product', quantity: 2 }, { slug: A, quantity: 1 }, { slug: B, quantity: MAX_QTY }]);
});

test('hydrate merges instead of losing items added before storage loaded', () => {
  const s = reducer({ lines: [{ slug: A, quantity: 1 }], ready: false }, { type: 'hydrate', lines: [{ slug: A, quantity: 2 }, { slug: B, quantity: 1 }] });
  assert.equal(s.ready, true);
  assert.deepEqual(Object.fromEntries(s.lines.map((l) => [l.slug, l.quantity])), { [A]: 3, [B]: 1 });
});

test('catalogue comes from the Supabase rows', () => {
  assert.equal(products.length, 8);
});

const good = { fullName: 'Ada Obi', email: 'ada@example.com', phone: '08012345678', address: '12 Aminu Kano Crescent', city: 'Abuja', state: 'FCT', country: 'Nigeria' };

test('checkout schema accepts a valid form', () => {
  assert.equal(checkoutSchema.safeParse(good).success, true);
});

test('checkout schema blocks every invalid field with the website messages', () => {
  const r = checkoutSchema.safeParse({ fullName: '', email: 'nope', phone: '123', address: 'abc', city: '', state: '', country: '' });
  assert.equal(r.success, false);
  if (r.success) return;
  const msg = Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]));
  assert.equal(msg.fullName, 'Enter your full name');
  assert.equal(msg.email, 'Enter a valid email address');
  assert.equal(msg.phone, 'Enter a phone number we can reach you on');
  assert.equal(msg.address, 'Enter your street address');
  assert.equal(msg.city, 'Enter your city');
  assert.equal(msg.state, 'Enter your state or region');
  assert.equal(msg.country, 'Enter your country');
});

test('auth schemas', () => {
  assert.equal(signInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success, true);
  assert.equal(signInSchema.safeParse({ email: 'bad', password: '' }).success, false);
  assert.equal(signUpSchema.safeParse({ fullName: 'Ada', email: 'a@b.co', password: 'short' }).success, false);
  assert.equal(signUpSchema.safeParse({ fullName: 'Ada', email: 'a@b.co', password: 'longenough' }).success, true);
});
