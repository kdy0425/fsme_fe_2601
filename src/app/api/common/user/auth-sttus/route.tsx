'use server'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Http-Only Cookie 접근 및 조회
 * 
 * @param request 
 * @returns response
 */
export async function POST(request: NextRequest) {
  let response = null;

  try {
    const token = request.cookies?.get('JWT') ?? '';

    if (token && typeof token === 'object' && 'value' in token) { // JWT 토큰이 존재하는 경우,
      const authSttus = decodeJwt(token.value);

      response = NextResponse.json(
        { 
          isLoggedIn: true,
          authSttus: authSttus
        },
        { status: 200 }
      );

    } else { // JWT 토큰이 존재하지 않는 경우,
      response = NextResponse.json(
        { message: 'JWT Does Not Exist' },
        { status: 200 }
      );
    }

  } catch (error) { // Error
    response = NextResponse.json(
      { message: 'Login Fail' },
      { status: 401 }
    );
  }

  return response;
}

/** 
 * JWT Decode
 * 
 * @param token - JWT
 * @returns JSON
 */
const decodeJwt = (token:any) => {
  try {
    const [, base64Url] = token.split('.');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch(error) {
    return error;
  }
}