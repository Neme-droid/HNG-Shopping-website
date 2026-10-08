// Catalogue types + pure helpers shared by the website AND the mobile app.
// The products themselves live in the Supabase `products` table: nothing here is a hard-coded product list.
// This file has no framework imports so Next.js and React Native can both use it.
import { productCopy } from './product-copy';

export type CategoryId = 'cosmetics' | 'edibles' | 'medicine' | 'shoes' | 'clothes' | 'seeds';
export type Category = { id: CategoryId; name: string; description: string };

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: CategoryId;
  badge?: string;
  description: string;
  about: string;
  details: string[];
  priceCents: number; // Supabase stores dollars (product_price = 28); we keep integer cents in memory to avoid float errors
  imageUrl?: string; // best image URL (public storage URL)
  imageFallbackUrl?: string; // tried if imageUrl fails to load (e.g. an original signed URL)
  stock?: number; // undefined = not tracked
  featured: boolean;
  sku?: string;
};

export const categories: Category[] = [
  { id: 'cosmetics', name: 'Cosmetics', description: 'Skincare, balms and soaps made from botanical ingredients.' },
  { id: 'edibles', name: 'Edibles', description: 'Honey, teas, oils, grains and spices, straight from the grower.' },
  { id: 'medicine', name: 'Medicine', description: 'Herbal remedies and tinctures rooted in traditional use.' },
  { id: 'shoes', name: 'Shoes', description: 'Cork, hemp and natural rubber footwear built to last.' },
  { id: 'clothes', name: 'Clothes', description: 'Organic cotton, linen and hemp for everyday comfort.' },
  { id: 'seeds', name: 'Seeds', description: 'Heirloom vegetable, herb and flower seeds to grow your own.' },
];

export const isCategory = (v: string | undefined | null): v is CategoryId => categories.some((c) => c.id === v);
export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;

/** Columns of the Supabase `products` table that we read. `about` / `details` are optional extras. */
export const PRODUCT_TABLE = 'products';
export const PRODUCT_BUCKET = 'product_images';

// ---------- price ----------
/** The dollar sign ALWAYS comes first: 2800 -> "$28.00", 123456 -> "$1,234.56". Same output on web and mobile. */
export function formatPrice(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  const abs = Math.abs(safe);
  const dollars = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rest = String(abs % 100).padStart(2, '0');
  return `${safe < 0 ? '-' : ''}$${dollars}.${rest}`;
}

/** product_price from Supabase (number, "28", "28.50" or even "$28") -> integer cents. null if unusable. */
export function priceToCents(value: unknown): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(/[^0-9.\-]/g, ''));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

// ---------- images ----------
const enc = (path: string) => path.split('/').map((s) => encodeURIComponent(decodeSafe(s))).join('/');
function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
const publicUrl = (origin: string, bucket: string, path: string) => `${origin}/storage/v1/object/public/${bucket}/${enc(path)}`;

/**
 * The `image_url` values in the table are not all real image links. This turns each kind into a URL that
 * actually shows a picture (the bucket must be public, see supabase/products-setup.sql):
 *  - a Supabase DASHBOARD link  (https://supabase.com/dashboard/project/<ref>/storage/files/buckets/<bucket>?preview=<file>)
 *  - a SIGNED link (…/object/sign/<bucket>/<file>?token=…): becomes the public link, the signed one is kept as fallback
 *  - a normal https image link: used as is
 *  - a bare file name or path ("Lavender Facial Serum.jpeg"): looked up in the `product_images` bucket
 */
export function resolveImage(raw: unknown, supabaseUrl?: string): { url?: string; fallback?: string } {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return {};
  const base = (supabaseUrl ?? '').replace(/\/+$/, '');

  const dash = value.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)\/storage\/files\/buckets\/([^/?#]+)\?(?:[^#]*&)?preview=([^&#]+)/i);
  if (dash) {
    const [, ref, bucket, file] = dash;
    return { url: publicUrl(`https://${ref}.supabase.co`, bucket, decodeSafe(file.replace(/\+/g, ' '))) };
  }

  const signed = value.match(/^(https?:\/\/[^/]+)\/storage\/v1\/object\/sign\/([^/]+)\/([^?#]+)/i);
  if (signed) return { url: publicUrl(signed[1], signed[2], signed[3]), fallback: value };

  if (/^https?:\/\//i.test(value)) return { url: value };

  return base ? { url: publicUrl(base, PRODUCT_BUCKET, value.replace(/^\/+/, '')) } : {};
}

// ---------- rows -> products ----------
const truthy = (v: unknown, whenMissing: boolean) => {
  if (v === null || v === undefined || v === '') return whenMissing;
  if (typeof v === 'string') return v.trim().toLowerCase() === 'true' || v.trim() === '1' || v.trim().toLowerCase() === 't';
  return Boolean(v);
};
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function toDetails(v: unknown): string[] | null {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed: unknown = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      /* not JSON: treat as one detail per line */
    }
    return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

/** One Supabase row -> Product. Returns null (and says why in `warn`) when the row can't be shown. */
export function toProduct(row: Record<string, unknown>, supabaseUrl?: string, warn: (m: string) => void = () => {}): Product | null {
  const slug = text(row.slug);
  const name = text(row.name);
  if (!slug || !name) return (warn(`skipped a product without slug/name`), null);
  if (!truthy(row.active, true)) return null; // hidden in Supabase

  const category = text(row.product_categories).toLowerCase();
  if (!isCategory(category)) return (warn(`skipped "${slug}": unknown category "${row.product_categories}"`), null);

  const priceCents = priceToCents(row.product_price);
  if (priceCents === null) return (warn(`skipped "${slug}": invalid product_price "${row.product_price}"`), null);

  const copy = productCopy[slug];
  const image = resolveImage(row.image_url, supabaseUrl);
  const stockNum = row.stock === null || row.stock === undefined || row.stock === '' ? NaN : Number(row.stock);

  return {
    id: typeof row.id === 'string' ? row.id : undefined,
    slug,
    name,
    category,
    badge: text(row.badge) || undefined,
    description: text(row.description),
    about: text(row.about) || copy?.about || '',
    details: toDetails(row.details) ?? copy?.details ?? [],
    priceCents,
    imageUrl: image.url,
    imageFallbackUrl: image.fallback,
    stock: Number.isFinite(stockNum) ? Math.max(0, Math.floor(stockNum)) : undefined,
    featured: truthy(row.is_featured, false),
    sku: text(row.sku) || undefined,
  };
}

export function toProducts(rows: unknown, supabaseUrl?: string, warn?: (m: string) => void): Product[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((r) => {
    const p = r && typeof r === 'object' ? toProduct(r as Record<string, unknown>, supabaseUrl, warn) : null;
    return p ? [p] : [];
  });
}

// ---------- lookups (always take the current list, which comes from Supabase) ----------
export const findProduct = (list: Product[], slug: string) => list.find((p) => p.slug === slug);
export const getRelated = (list: Product[], p: Product, n = 4) =>
  [...list.filter((x) => x.category === p.category && x.slug !== p.slug), ...list.filter((x) => x.category !== p.category)].slice(0, n);
export const inStock = (p: Product) => p.stock === undefined || p.stock > 0;
