-- TerraVerde: one-time Supabase setup so the website and the mobile app can read the `products` table live.
-- Run this in the Supabase dashboard: SQL Editor > New query > paste > Run. It is safe to run more than once.

-- 1) Let the public (anon key) READ active products. Nobody can change them from the website/app.
alter table public.products enable row level security;
grant select on public.products to anon, authenticated;
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select to anon, authenticated
  using (active = true);

-- 2) Turn on LIVE updates (Realtime) for the table, so changes you make in Supabase show up in the
--    website and app within a second or so. (Without this they still refresh every minute and when reopened.)
do $$
begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then
  null; -- already enabled
end $$;

-- 3) Product photos: the bucket must be PUBLIC so the website and app can show the images.
update storage.buckets set public = true where id = 'product_images';

-- 4) OPTIONAL: columns for the long text on the product page, so you can edit it in Supabase too.
--    Until you fill these in, the page uses the built-in text for the original 8 products.
--    details = a list, e.g.  ["30 ml glass bottle", "No synthetic fragrance"]
alter table public.products add column if not exists about text;
alter table public.products add column if not exists details jsonb;

-- 5) OPTIONAL clean-up of image_url. The app already understands every format below, so you can skip this.
--    Dashboard links and signed links are converted to just the file name inside the product_images bucket.
update public.products
set image_url = replace(substring(image_url from 'preview=([^&]+)'), '+', ' ')
where image_url like '%/dashboard/project/%preview=%';

update public.products
set image_url = replace(substring(image_url from '/object/sign/product_images/([^?]+)'), '%20', ' ')
where image_url like '%/object/sign/product_images/%';

-- After this, image_url can simply be the file name, e.g.  Wildflower honey.png
-- (the file must be uploaded to Storage > product_images).
