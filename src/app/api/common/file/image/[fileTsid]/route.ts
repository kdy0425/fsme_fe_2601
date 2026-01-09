import { getJwtToken } from '@/utils/fsms/common/user/jwtTokenUtils'
import { NextRequest, NextResponse } from 'next/server';

// 이미지 URL은 /image/[fileTsid]  구조로 끝나야함.
export async function GET(request: NextRequest,{ params }: { params: { fileTsid: string }}) {
  const fileTsid = params.fileTsid;
  // nextUrl을 통해 쿼리 매개변수에 접근
  const url = request.nextUrl;
  const endpoint = url.searchParams.get('endpoint'); // 쿼리 매개변수에서 endpoint 가져오기
  const jwtToken = getJwtToken()
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}${endpoint}/image/${fileTsid}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Invalid content type');
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType
      }
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}