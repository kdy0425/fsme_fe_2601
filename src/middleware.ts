import { NextResponse, NextRequest } from 'next/server'

/** Middleware-Main */
export async function middleware(request: NextRequest) {
  return addPathToHeader(request)
}

// URL의 Path를 헤더에 추가하는 함수
function addPathToHeader(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = `${url.pathname}${url.search}`

  const response = NextResponse.next()
  response.headers.set('x-full-path', path)

  return response
}

// 미들웨어 설정
export const config = {
  // '/guide' 경로와 그 하위 경로에 대해 미들웨어 실행
  // 미들웨어를 적용할 요청을 URL path로 지정
  // - '/': 루트 경로
  // - ':path': 동적 세그먼트. path는 변수명으로, 실제 URL의 이 위치의 값이 매칭됨
  // - '*': 와일드카드. 0개 이상의 추가 세그먼트
  // - '/:path*' => 모든 경로
  // user/pub_login 은 임시 작업용, 추후 삭제
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|user/signup*|user/pub_login).*)',
  ],
}
