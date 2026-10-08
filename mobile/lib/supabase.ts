import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Same Supabase project as the website. Only the PUBLIC url + anon key belong in the app.
// Never add the service-role key here: EXPO_PUBLIC_* values are bundled into the app.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// A real key is a JWT ("eyJ...") or a newer "sb_publishable_..." key. Anything else (blank, a pasted
// placeholder, stray quotes or spaces) would make Supabase answer "Invalid API key", so we catch it up front.
const keyLooksValid = /^(eyJ[\w-]+\.[\w-]+\.[\w-]+|sb_publishable_[\w-]+)$/.test(anonKey);
const urlLooksValid = /^https:\/\/[\w-]+\.supabase\.(co|in)\/?$/.test(url) || /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+)(:\d+)?\/?$/.test(url); // last one = local `supabase start`
export const isSupabaseConfigured = urlLooksValid && keyLooksValid;
export const supabaseUrl = url.replace(/\/+$/, '');

if (!isSupabaseConfigured) {
  console.warn('[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing or malformed. Check mobile/.env (or eas.json for APK builds).');
}

// Placeholder values keep the app booting (browsing still works) if the env file is missing;
// every auth call is guarded by isSupabaseConfigured and shows a clear message instead.
export const supabase = createClient(isSupabaseConfigured ? url : 'https://placeholder.invalid', isSupabaseConfigured ? anonKey : 'placeholder-anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// React Native has no tab-visibility events, so tell Supabase when to refresh tokens:
// only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
