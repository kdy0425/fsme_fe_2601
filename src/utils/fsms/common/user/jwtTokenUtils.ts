'use server';

import { cookies } from 'next/headers';

/**
 * 로그인 사용자토큰 호출
 * 
 * @returns 로그인 사용자토큰
 */
function getJwtToken() {
  const Authorization = cookies()
  const jwtToken = Authorization.get('JWT')
  
  return jwtToken?.value
}


function deleteJwtToken() {
  const Authorization = cookies()

  Authorization.delete('JWT')
}
export { getJwtToken, deleteJwtToken }