import { ApiError, ApiResponse } from '@/types/message'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { authHeaderBuilder } from './user/authUtils'
import { deleteJwtToken, getJwtToken } from './user/jwtTokenUtils'

interface ApiHandlerOptions {
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  errorMessage?: string
  setCookie?: boolean
  cookieName?: string
  cookieOptions?: {
    maxAge?: number
    path?: string
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }
}

interface ApiClientOptions {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
}

//json post, get, put, delete
export async function sendHttpRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpointPath: string,
  body?: any,
  useJwt: boolean = false, // JWT 사용 여부
  customHeaders?: Record<string, string>,//
//): Promise<ApiResponse> {
  ): Promise<any> {
  try {
    const headers: Record<string, string> = {
      // Header에 문자열 키 사용 가능
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Origin': 'http://localhost:3000',
      // 'credentials': 'include',
      ...customHeaders,
    }

    if (useJwt) {
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`
    }
    let newUrl = ''
    if (method === 'GET') {
      // URL에서 쿼리 문자열 부분만 추출

      let urlObj = new URL(
        `${process.env.NEXT_PUBLIC_API_DOMAIN}${endpointPath}`,
      )

      let params = new URLSearchParams(urlObj.search.replace(/\+/g, '%2B')) // +를 %2B로 변환
      // 새로운 URL을 생성하기 위해 URL을 기본으로 설정
      newUrl = urlObj.origin + urlObj.pathname + '?'

      // 각 파라미터 키와 값을 인코딩하여 새로운 URL을 조립
      let encodedParams = []
      params.forEach((value, key) => {
        // 키와 값을 인코딩
        let encodedKey = encodeURIComponent(key)
        let encodedValue = encodeURIComponent(value)
        // 디코딩 후 다시 인코딩 (여기서 +를 %2B로 처리)
        encodedParams.push(`${encodedKey}=${encodedValue}`)
      })
      // 새로운 URL에 인코딩된 파라미터들을 추가
      newUrl += encodedParams.join('&')
    } else {
      newUrl = `${process.env.NEXT_PUBLIC_API_DOMAIN}${endpointPath}`
    }

    const endpoint = newUrl
    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }
    /* 피벗테이블 처리 위해서 주석처리 
    const response = await fetch(endpoint, options)
    // response.headers.set('Access-Control-Allow-Origin', 'http://211.43.198.100:3000');
    // response.headers.append("Access-Control-Allow-Origin", "http://localhost:3000");
    const responseData: ApiResponse = await response.json()

    if (responseData.resultType !== 'success') {
      if (responseData.status === 401) {
        await deleteJwtToken()
        location.href = '/user/login'
      } else if (responseData.status === 413) {
        if (responseData.errors) {
          responseData.message = responseData.errors[0].reason
          return responseData
        }
      } else {
        if (responseData.errors) {
          responseData.message = responseData.errors[0].reason
          return responseData
        }
      }

      throw new ApiError(
        responseData.resultType,
        responseData.status,
        responseData.message,
        responseData.errors,
      )
    }
    return responseData
  */
    const response = await fetch(endpoint, options)
    const contentType = response.headers.get('content-type') || ''
    const rawText = await response.text() // 본문은 한 번만 읽기

    let parsed: any = null
    if (contentType.includes('application/json') && rawText) {
      try { parsed = JSON.parse(rawText) } catch { /* 무시 */ }
    }

    // 2xx 아님 → 풍부한 정보 포함해 에러
    if (!response.ok) {
      console.error('[HTTP ERROR]', method, endpoint, response.status, response.statusText, {
        headers: Object.fromEntries(response.headers.entries?.() ?? []),
        bodySnippet: String(rawText).slice(0, 2000),
      })
      const err: any = new ApiError(
        'error',
        response.status,
        (parsed?.message ?? response.statusText ?? 'HTTP error'),
        parsed?.errors,
      )
      err.data = parsed ?? rawText
      throw err
    }

    // 2xx 정상 → ① 표준 ApiResponse면 기존 로직 유지
    if (parsed && typeof parsed === 'object' && 'resultType' in parsed && 'status' in parsed) {
      const responseData = parsed as ApiResponse

      if (responseData.resultType !== 'success') {
        if (responseData.status === 401) {
          await deleteJwtToken()
          location.href = '/user/login'
        } else if (responseData.status === 413) {
          if (responseData.errors) {
            responseData.message = responseData.errors[0].reason
            return responseData
          }
        } else {
          if (responseData.errors) {
            responseData.message = responseData.errors[0].reason
            return responseData
          }
        }

        throw new ApiError(
          responseData.resultType,
         responseData.status,
         responseData.message,
         responseData.errors,
       )
      }   return responseData
     }
   // ② 비래핑 JSON(PivotResponse 등) → 그대로 반환
    if (parsed !== null) return parsed

    // ③ JSON이 아니면 text 반환
    return rawText ?? null
  } catch (error) {
    console.error('Error in sendHttpRequest:', error)
    throw error
  }
}

export async function sendHttpFileRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpointPath: string,
  body?: any,
  useJwt: boolean = false, // JWT 사용 여부
  customHeaders?: Record<string, string>,
) {
  try {
    const headers: Record<string, string> = {
      // Header에 문자열 키 사용 가능
      'Content-Type': 'multipart/form-data',
      // 'credentials': 'include',
      ...customHeaders,
    }

    if (useJwt) {
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`
    }

    const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}${endpointPath}`

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(endpoint, options)
    const responseData = await response.blob()
    // console.log(response)

    return responseData
  } catch (error) {
    console.error('Error in sendHttpRequest:', error)
    throw error
  }
}

//formData post, put, get, delete
export async function sendFormDataWithJwt(
  method: 'POST' | 'PUT' | 'DELETE' | 'GET',
  endpointPath: string,
  formData: FormData,
  useJwt: boolean = false, // JWT 사용 여부
): Promise<ApiResponse> {
  try {
    const headers: Record<string, string> = {}

    if (useJwt) {
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`
    }

    const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}${endpointPath}`

    const options: RequestInit = {
      method,
      headers,
      body: formData,
    }

    // GET 요청에서는 body를 포함하지 않도록 분기 처리
    if (method === 'GET') {
      delete options.body
    }

    const response = await fetch(endpoint, options)
    const responseData: ApiResponse = await response.json()

    if (responseData.resultType !== 'success') {
      throw new ApiError(
        responseData.resultType,
        responseData.status,
        responseData.message,
        responseData.errors,
      )
    }

    return responseData
  } catch (error) {
    console.error('Error in sendFormDataWithJwt:', error)
    throw error
  }
}

//nextjs로 요청
export async function sendNextjs(
  request: NextRequest,
  options: ApiHandlerOptions,
) {
  console.log('sendNextjs start')
  const {
    endpoint,
    method,
    setCookie = false,
    cookieName = 'JWT',
    cookieOptions = {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
    },
  } = options

  const targetUrl = `${process.env.NEXT_PUBLIC_API_IP}${endpoint}`
  console.log('sendNextjs targetUrl : ', targetUrl)
  try {
    const body = method !== 'GET' ? await request.json() : undefined

    const svrResponse = await fetch(targetUrl, {
      method,
      headers: authHeaderBuilder(request, {
        'Content-Type': 'application/json',
      }),
      body: body ? JSON.stringify(body) : undefined,
    })
    const jsonSvrRes: ApiResponse = await svrResponse.json()

    if (jsonSvrRes.resultType === 'success') {
      const clientResponse = NextResponse.json(jsonSvrRes)
      // console.log(clientResponse);
      if (setCookie && jsonSvrRes.data?.accessToken) {
        clientResponse.cookies.set(
          cookieName,
          jsonSvrRes.data.accessToken,
          cookieOptions,
        )
      }
      return clientResponse
    } else {
      // 'fail' 또는 'error' 상태 처리
      const errorResponse = {
        resultType: jsonSvrRes.resultType,
        status: jsonSvrRes.status,
        message: jsonSvrRes.message,
        errors: jsonSvrRes.errors,
      }

      // 서버에서 받은 상태 코드 사용
      return NextResponse.json(errorResponse, { status: jsonSvrRes.status })
    }
  } catch (error) {
    return NextResponse.json(error)
  }
}

export async function sendMultipartFormDataRequest(
  method: 'POST' | 'PUT',
  endpointPath: string,
  data: Record<string, any>, // JSON 데이터
  files: File[], // 첨부파일 배열
  useJwt: boolean = false, // JWT 사용 여부
  customHeaders?: Record<string, string>,
): Promise<ApiResponse> {
  try {
    const formData = new FormData()

    // JSON 데이터를 FormData에 추가
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString()) // 값이 객체나 숫자인 경우 문자열로 변환
      }
    })

    // 파일 데이터를 FormData에 추가
    if (files.length > 1) {
      files.forEach((file) => {
        if (file instanceof File) {
          formData.append('files', file) // 'files'는 서버에서 기대하는 필드 이름
        } else {
          console.error('Invalid file detected:', file)
        }
      })
    } else if (files.length == 1) {
      if (files[0] instanceof File) {
        formData.append('files', files[0]) // 'files'는 서버에서 기대하는 필드 이름
      } else {
        console.error('Invalid file detected:', files[0])
      }
    } else {
      formData.append('files', '')
      console.log('No files attached.')
    }

    // 헤더 설정
    const headers: Record<string, string> = { ...customHeaders }
    // const headers: Record<string, string> = { // Header에 문자열 키 사용 가능
    //   'Content-Type': 'multipart/form-data',
    //   ...customHeaders,
    // };

    // JWT 토큰 추가
    if (useJwt) {
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`
    }

    const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}${endpointPath}`

    const options: RequestInit = {
      method,
      headers, // Content-Type은 자동 설정됨
      body: formData,
    }

    const response = await fetch(endpoint, options)
    // 응답 처리
    if (!response.ok) {
      const textResponse = await response.text()

      console.error('Server error response:', textResponse)

      throw new Error(
        `Request failed with status ${response.status}: ${textResponse}`,
      )
    }

    // JSON 응답 처리
    let responseData: ApiResponse
    try {
      responseData = await response.json()
    } catch {
      const textResponse = await response.text()
      console.error('Non-JSON Response:', textResponse)
      throw new Error(`Unexpected response format: ${textResponse}`)
    }

    // API 응답 데이터 검증
    if (responseData.resultType !== 'success') {
      if (responseData.status === 401) {
        await deleteJwtToken()
        location.href = '/user/login'
      }
      throw new ApiError(
        responseData.resultType,
        responseData.status,
        responseData.message,
        responseData.errors,
      )
    }

    return responseData
  } catch (error) {
    console.error('Error in sendMultipartFormDataRequest:', error)
    throw error
  }
}

export async function sendSingleMultipartFormDataRequest(
  method: 'POST' | 'PUT',
  endpointPath: string,
  data: Record<string, any>, // JSON 데이터
  file: File | undefined, //
  useJwt: boolean = false, // JWT 사용 여부
  customHeaders?: Record<string, string>,
): Promise<ApiResponse> {
  try {
    const formData = new FormData()

    // JSON 데이터를 FormData에 추가
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString()) // 값이 객체나 숫자인 경우 문자열로 변환
      }
    })

    // 파일 데이터를 FormData에 추가
    if (file) {
      if (file instanceof File) {
        console.log(' 첨부파일 API 요청에 등록 ')
        formData.append('file', file) // 'files'는 서버에서 기대하는 필드 이름
      } else {
        console.error('Invalid file detected:', file)
      }
    } else {
      //파일이 없을 경우 안 보냄.
      //formData.append('file', '');
      console.log('No files attached.')
    }

    // 헤더 설정
    const headers: Record<string, string> = { ...customHeaders }

    // JWT 토큰 추가
    if (useJwt) {
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`
    }

    const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}${endpointPath}`

    const options: RequestInit = {
      method,
      headers, // Content-Type은 자동 설정됨
      body: formData,
    }

    const response = await fetch(endpoint, options)
    // 응답 처리
    if (!response.ok) {
      const textResponse = await response.text()

      console.error('Server error response:', textResponse)

      throw new Error(
        `Request failed with status ${response.status}: ${textResponse}`,
      )
    }

    // JSON 응답 처리
    let responseData: ApiResponse
    try {
      responseData = await response.json()
    } catch {
      const textResponse = await response.text()
      console.error('Non-JSON Response:', textResponse)
      throw new Error(`Unexpected response format: ${textResponse}`)
    }

    // API 응답 데이터 검증
    if (responseData.resultType !== 'success') {
      if (responseData.status === 401) {
        await deleteJwtToken()
        location.href = '/user/login'
      }
      throw new ApiError(
        responseData.resultType,
        responseData.status,
        responseData.message,
        responseData.errors,
      )
    }

    return responseData
  } catch (error) {
    console.error('Error in sendMultipartFormDataRequest:', error)
    throw error
  }
}

//
export const apiClient = async <T>({
  endpoint,
  method,
  body,
}: ApiClientOptions): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const responseData: ApiResponse<T> = await response.json()
    if (responseData.resultType !== 'success') {
      throw new ApiError(
        responseData.resultType,
        responseData.status,
        responseData.message,
        responseData.errors,
      )
    }
    return responseData
  } catch (error) {
    console.error(error)

    throw error
  }
}

//json post, get, put, delete
export async function sendSearchHttpRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpointPath: string,
  body?: any,
  customHeaders?: Record<string, string>,
): Promise<ApiResponse> {
  try {
    const headers: Record<string, string> = {
      // Header에 문자열 키 사용 가능
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Origin': 'http://localhost:3000',
      // 'credentials': 'include',
      ...customHeaders,
    }

    const endpoint = `/api-search${endpointPath}`

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(endpoint, options)

    const responseData: ApiResponse | any = await response.json()

    if (responseData.status === 400) {
      throw new ApiError(
        'error',
        responseData.status,
        '검색 서버에 잘못된 요청이 들어왔습니다.\n확인하세요.',
        responseData.errors,
      )
    } else if (responseData.status === 408) {
      throw new ApiError(
        'error',
        responseData.status,
        '요청시간이 초과되었습니다.\n확인하세요.',
        responseData.errors,
      )
    } else if (responseData.status === 500) {
      let errorMesage = ''
      responseData.returnCode = -1
      switch (responseData.returnCode) {
        case -1:
          errorMesage =
            '검색 API에 오류가 발생했습니다.\n관리자에게 문의하세요.'
          break
        case -60000:
          errorMesage = '네트워크 에러가 발생했습니다.\n관리자에게 문의하세요.'
          break
        case -60003:
          errorMesage =
            '검색엔진 연결에 실패히였습니다.\n관리자에게 문의하세요.'
          break
        case -60004:
          errorMesage = '검색 소요시간이 지났습니다.\n관리자에게 문의하세요.'
          break
      }
      throw new ApiError(
        'error',
        responseData.status,
        errorMesage,
        responseData.errors,
      )
    }

    return responseData
  } catch (error) {
    console.error('Error in sendHttpRequest:', error)
    throw error
  }
}
