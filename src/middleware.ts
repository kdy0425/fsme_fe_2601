import { NextResponse, NextRequest } from 'next/server'

/** Middleware-Main */
export async function middleware(request: NextRequest) {
  const isAuthenticated = checkAuthentication(request)
  if(request.url.indexOf('/user/login') < 0){
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
        const url = request.nextUrl.clone()
        url.pathname = '/user/login'
        url.searchParams.set('redirected', 'true')
        return NextResponse.redirect(url)
      
    }
  }else{
    if (isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  let response = NextResponse.next()
  // 각 미들웨어 함수 실행
  response = addPathToHeader(request)

  return response
}

/** JWT 보유여부 체크 */
function checkAuthentication(req: NextRequest) {
  const token = req.cookies.get('JWT')

  if (token && typeof token === 'object' && 'value' in token) {
    // JWT 토큰이 존재할 경우,
    return true
  }

  return false
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
