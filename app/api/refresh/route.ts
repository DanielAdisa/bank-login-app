// app/api/refresh/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, signAccessToken, signRefreshToken } from '../../../utils/jwt';

export async function POST(request: Request) {
  const refreshToken = (await cookies()).get('refreshToken')?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
  }

  const payload = verifyToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }

  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  const response = NextResponse.json({ accessToken: newAccessToken });
  response.cookies.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
