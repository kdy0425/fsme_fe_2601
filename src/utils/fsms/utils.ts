// 일반적인 유틸리티 함수

import { trim } from 'lodash'

/* Type */
import UserAuthContext from '@/app/components/context/UserAuthContext'

/* React */
import { useContext } from 'react'

import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// milliseconds를 매개변수로 받아서 코드 실행을 지연시키는 함수
// 제출 버튼 비활성화 테스트용
// 1000 ms = 1 seconds
// 사용법: await delay(3000)
export const delay = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// object를 queryString(string)으로 변환
export function toQueryString(obj: object): string {
  let query: string = '?'
  // object key 배열로 저장
  let objKeys: Array<string> = Object.keys(obj)

  // 반복문으로 쿼리스트링 생성
  for (const [key, value] of Object.entries(obj)) {
    query += key.toString() + '=' + value
    // 마지막 값에는 "&" 제거
    if (objKeys[objKeys.length - 1] != key) {
      query += '&'
    }
  }

  return query
}

// object를 toQueryParameter(string)으로 변환
export function toQueryParameter(obj: object): string {
  let query: string = '?'

  // 반복문으로 쿼리파라미터 생성
  for (const [key, value] of Object.entries(obj)) {
    if (trim(value) != '' && value != undefined && value != null) {
      query += key.toString() + '=' + value + '&'
    }
  }

  // 아무데이터가 없을 시 최초 '?' 제거 혹은 마지막 값 '&' 제거
  query = query.substring(0, query.length - 1)
  return query
}

// Node 환경변수를 이용하여 Next.js의 실행 환경을 구분하는 변수들
// npm run dev => development
// npm start => production
export const isProduction: boolean = process.env.NODE_ENV === 'production' // 운영 및 배포
export const isDevelopment: boolean = process.env.NODE_ENV === 'development' // 개발
export const isTest: boolean = process.env.NODE_ENV === 'test' // 테스트

// 인코딩된 URI를 디코딩하는 함수
// 파일 이름, URI에 한글이 포함되어 디코딩이 필요할 때 사용 가능
export const decodeUriString = (str: string): string => {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

export const getUserInfo = () => {
  // console.log('getUserInfo')
  const { authInfo } = useContext(UserAuthContext)

  const userInfo = Object.assign(
    {
      iss: '',
      userNm: '',
      auths: [],
      roles: [],
      lgnId: '',
      locgovCd: '',
      iat: 0,
      exp: 0,
      rollYn: '',
      authLocgovNm: '',
      taskSeCd: [],
    },
    authInfo,
  )

  return userInfo
}
