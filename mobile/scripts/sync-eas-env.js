// Copies the two PUBLIC Supabase values from .env into eas.json, so the APK build gets exactly the same
// values as `expo start` and nobody has to copy a long key by hand (a missing character = "Invalid API key").
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const easPath = path.join(__dirname, '..', 'eas.json');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!/^https:\/\/[\w-]+\.supabase\.co\/?$/.test(url || '')) fail('EXPO_PUBLIC_SUPABASE_URL in .env is missing or not like https://xxxx.supabase.co');
if (!/^(eyJ[\w-]+\.[\w-]+\.[\w-]+|sb_publishable_[\w-]+)$/.test(key || '')) fail('EXPO_PUBLIC_SUPABASE_ANON_KEY in .env is missing, cut off, or has extra characters. It should be one line starting with eyJ');
try {
  const role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role;
  if (role && role !== 'anon') fail(`That key has role "${role}". Only the "anon" key may go in the mobile app.`);
} catch {}

const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));
for (const profile of ['preview', 'production']) {
  eas.build[profile].env = { EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_ANON_KEY: key };
}
fs.writeFileSync(easPath, JSON.stringify(eas, null, 2) + '\n');
console.log('eas.json updated from .env (Supabase URL + anon key checked).');

function fail(msg) {
  console.error('\nERROR: ' + msg + '\n');
  process.exit(1);
}
