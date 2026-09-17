import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${error}`, request.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/accounts?error=missing_code', request.url));
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.redirect(new URL('/dashboard/accounts?error=unauthorized', request.url));
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/reddit`;

  const tokenUrl = 'https://www.reddit.com/api/v1/access_token';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });
    
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Reddit Token Error:', tokenData);
      return NextResponse.redirect(new URL('/dashboard/accounts?error=token_exchange_failed', request.url));
    }

    const { access_token, refresh_token } = tokenData;

    const userRes = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'DevPipe-MVP/0.1.0'
      }
    });

    const userData = await userRes.json();
    const redditUsername = userData.name;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    await User.findByIdAndUpdate(session.user.id, {
      'tokens.redditConnected': true,
      'tokens.redditUsername': redditUsername,
      'tokens.redditAccessToken': access_token,
      'tokens.redditRefreshToken': refresh_token || null
    });

    return NextResponse.redirect(new URL('/dashboard/accounts?status=reddit_connected', request.url));
  } catch (err) {
    console.error('Reddit Callback Exception:', err);
    return NextResponse.redirect(new URL('/dashboard/accounts?error=internal_error', request.url));
  }
}
