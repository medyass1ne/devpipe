import { NextResponse } from 'next/server';

export async function GET(request) {
  const clientId = process.env.REDDIT_CLIENT_ID;
  
  if (!clientId) {
    return new Response("Missing Reddit Client ID", { status: 500 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/reddit`;
  const scopes = 'identity submit read';
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL('https://www.reddit.com/api/v1/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('duration', 'permanent');
  authUrl.searchParams.set('scope', scopes);

  return NextResponse.redirect(authUrl.toString());
}
