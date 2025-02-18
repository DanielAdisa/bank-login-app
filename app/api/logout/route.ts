// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete('refreshToken');
  return response;
}
