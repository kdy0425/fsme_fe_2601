'use server'

import { NextRequest, NextResponse } from 'next/server';
import { authHeaderBuilder } from '@/utils/fsms/common/user/authUtils'
import { sendNextjs } from '@/utils/fsms/common/apiUtils';

/**
 * 유가보조금포털시스템 로그인 처리 API
 * 
 * @param request 
 * @returns 
 */

  export async function POST(request: NextRequest) {
    return sendNextjs(request, {
      endpoint: '/user/login',
      method: 'POST',
      setCookie: true,
      cookieName: 'JWT',
      cookieOptions: {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        // secure: process.env.NODE_ENV !== 'development',
        // sameSite: 'strict'
      }
    });
  }

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only supports POST requests' },
    { status: 405 }
  );
}