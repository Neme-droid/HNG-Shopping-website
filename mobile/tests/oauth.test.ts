import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOAuthUrl } from '../lib/oauth-url';

test('PKCE return link (APK)', () => {
  assert.deepEqual(parseOAuthUrl('terraverde://auth/callback?code=abc-123'), { error: undefined, code: 'abc-123', access_token: undefined, refresh_token: undefined });
});
test('PKCE return link (Expo Go)', () => {
  assert.equal(parseOAuthUrl('exp://192.168.1.5:8081/--/auth/callback?code=xyz').code, 'xyz');
});
test('implicit return link with tokens in the #fragment', () => {
  const r = parseOAuthUrl('terraverde://auth/callback#access_token=AT&refresh_token=RT&expires_in=3600&token_type=bearer');
  assert.equal(r.access_token, 'AT');
  assert.equal(r.refresh_token, 'RT');
  assert.equal(r.code, undefined);
});
test('error returned by Supabase/Google, in query or fragment', () => {
  assert.equal(parseOAuthUrl('terraverde://auth/callback?error=access_denied&error_description=User+cancelled').error, 'User cancelled');
  assert.equal(parseOAuthUrl('terraverde://auth/callback#error=server_error&error_description=Unable+to+exchange').error, 'Unable to exchange');
});
test('a link with nothing useful is not mistaken for a sign-in', () => {
  const r = parseOAuthUrl('terraverde://auth/callback');
  assert.equal(r.code, undefined);
  assert.equal(r.access_token, undefined);
  assert.equal(r.error, undefined);
});
