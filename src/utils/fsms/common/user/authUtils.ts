/**
 * 로그인 사용자정보 호출
 *
 * @returns 로그인 사용자정보
 */
const getAuthInfo = async () => {
  let res = null

  try {
    const response = await fetch (`/api/common/user/auth-sttus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.isLoggedIn) {
      res = data
    } else {
      console.log('Login Token Create Fail.')
      res = { isLoggedIn: false }
    }
  } catch (error) {
    console.log('Error checking authentication status.', error)
  }

  return res
}

/**
 * JWT포함 헤더 생성
 *
 * @param {*} request
 * @param {*} headers
 * @returns 헤더객체
 */
const authHeaderBuilder = (request:any, headers:any) => {
  const jwtCookie = request.cookies.get('JWT')?.value

  if (jwtCookie !== undefined) {
    headers.Authorization = 'Bearer ' + request.cookies.get('JWT')?.value
  }

  return headers
}

export { getAuthInfo, authHeaderBuilder }