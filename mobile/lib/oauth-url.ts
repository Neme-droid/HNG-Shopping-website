// Reads what Supabase put on the link it returned to after Google sign-in.
// PKCE returns  terraverde://auth/callback?code=…   ; the older implicit flow returns  …#access_token=…&refresh_token=…
export type OAuthLink = { error?: string; code?: string; access_token?: string; refresh_token?: string };

export function parseOAuthUrl(url: string): OAuthLink {
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  const params = new URLSearchParams([query, hash].filter(Boolean).join('&'));
  const failure = params.get('error_description') ?? params.get('error');
  return {
    error: failure ? failure.replace(/\+/g, ' ') : undefined,
    code: params.get('code') ?? undefined,
    access_token: params.get('access_token') ?? undefined,
    refresh_token: params.get('refresh_token') ?? undefined,
  };
}
