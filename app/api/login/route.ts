// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { findUser } from '../../../utils/auth';
import { signAccessToken, signRefreshToken } from '../../../utils/jwt';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const user = findUser(username, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create payload (you might include more info as needed)
  const payload = { id: user.id, role: user.role, username: user.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Set refresh token in an HTTP-only cookie
  const response = NextResponse.json({ accessToken });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
  return response;
}
