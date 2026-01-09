'use server'

import { NextRequest, NextResponse } from "next/server";

/**
 * 코드 조회
 * 
 * @param request - cdGroupNm : 그룹코드명(필수)
 * @param request - upCdNms : 상위코드명
 * @param request - cdNm : 코드명
 * @returns response
 */
export async function POST(request: NextRequest) {
  try {
    const jsonData = await request.json();
    const cdGroupNm = jsonData.cdGroupNm;
    const upCdNms = jsonData.upCdNms;
    const cdNm = jsonData.cdNm;

    /* 코드조회 기본 URL */
    let targetUrl = `${process.env.NEXT_PUBLIC_API_DOMAIN}/common/code/cds/` + cdGroupNm;

    // 1. 그룹코드에 대한 하위코드 전체조회
    // if (!upCdNms && !cdNm)
  
    // 2. 그룹코드+상위코드에 대한 하위코드 전체조회
    if (upCdNms && !cdNm) targetUrl = targetUrl + `/upCdNms/` + upCdNms;
  
    // 3. 그룹코드에 대한 특정코드 조회
    if (!upCdNms && cdNm) targetUrl = targetUrl + `/` + cdNm;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Code Information Call Failed.');
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Code Information Call Failed.' }, { status: 401 });
  }
}