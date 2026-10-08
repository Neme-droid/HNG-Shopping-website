# TerraVerde mobile

Native iOS/Android app (Expo + React Native + Expo Router) for the TerraVerde shop. It lives beside the Next.js website and reuses its catalogue, Zod schemas and Supabase project. It is **not** a WebView.

## Run it

```bash
cd mobile
npm install
cp .env.example .env     # then fill in the two values (see below)
npx expo start
```

Scan the QR code with **Expo Go** (SDK 57) on your phone. Phone and computer must be on the same Wi-Fi, or run `npx expo start --tunnel`.

## Environment

Copy these from the website's `.env.local`, renaming the prefix:

| Website (`../.env.local`)        | Mobile (`mobile/.env`)            |
| -------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | `EXPO_PUBLIC_SUPABASE_URL`        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `EXPO_PUBLIC_SUPABASE_ANON_KEY`   |

Do **not** copy `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` or anything else: `EXPO_PUBLIC_*` values are bundled into the app. `.env` is git-ignored.

## What is shared with the website

`lib/products.ts`, `lib/checkout-schema.ts`, `lib/auth-schema.ts` and `safeNext` from `lib/auth-redirect.ts` re-export the website's own files from `../lib` (see `metro.config.js`). Change the catalogue or a validation rule once and both apps follow. The cart, auth provider, Supabase client and all UI are React Native rewrites.

## Behaviour (mirrors the website)

- Adding to cart, the cart and checkout need a signed-in account.
- Checkout validates the form but does not place an order yet. The website has no order backend either.
- Product tiles are the website's category-tinted leaf tile because the catalogue has no photos yet.

## Checks

```bash
npm run typecheck   # tsc
npm test            # cart rules, persistence parsing, checkout/auth schemas
```

## Build an Android APK

```bash
cd mobile
npx eas-cli login          # free Expo account: https://expo.dev/signup
npx eas-cli init           # once: links the project
npm run build:apk          # copies the Supabase URL + anon key from .env into eas.json, checks them, then builds
```

`npm run build:apk` refuses to build if the key in `.env` is cut off or is not the `anon` key, so a mistyped key can no longer end up inside the APK ("Invalid API key"). **Edit `.env`, never `eas.json` by hand.** When the build finishes it prints a download link and QR code for the `.apk`.

If you change `.env`, restart with `npx expo start --clear` so the new values are picked up.

## Google sign-in

"Continue with Google" opens the system browser through Supabase OAuth. In Supabase go to **Authentication > URL Configuration > Redirect URLs** and add:

- `terraverde://**` (the installed APK)
- `exp://**` (Expo Go while developing)

The Google provider must be enabled (it already is if the website's Google button works). No change is needed in Google Cloud: it keeps using Supabase's own callback URL.

## Products come from Supabase

Both the website and this app read the `products` table in Supabase. Nothing is hard-coded.

- `product_price` is in dollars (28 = $28.00) and is always shown with the `$` first.
- Only rows with `active = true` are shown. `is_featured` picks the products on the app's home screen. `stock = 0` shows "Out of stock".
- `image_url` may be a file name in the `product_images` bucket, a public/signed link, or a Supabase dashboard link; all are handled. The bucket must be public.
- Changes in Supabase appear in the app within about a second (Realtime), and at the latest when you reopen the app, after 15 seconds in the foreground, or on pull-to-refresh.
- Run `supabase/products-setup.sql` (in the project root) once in the Supabase SQL Editor to allow public reads, switch on Realtime and make the bucket public.
