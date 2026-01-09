'use server'

import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

/** 회원가입정보 인터페이스 정의 */
export interface Signup {
  userNm: string
  lgnId: string
  pswd: string
  bzentyMngrYn: string
  userTypeCds: string[]
}

/** 회원가입 서버 액션 */
export async function userSignup(prevState: any, formData: any): Promise<any> {
  const signup: Signup = {
    userNm: formData.get('userNm') as string,
    lgnId: formData.get('lgnId') as string,
    pswd: formData.get('pswd') as string,
    bzentyMngrYn: formData.get('bzentyMngrYn') as string,
    userTypeCds: formData.getAll('userTypeCds') as string[]
  }

  try {
    const response = await sendHttpRequest(
      'POST',
      `/user/signup`,
      signup,
      false // JWT 토큰 사용 여부
    );
    
    if (response.resultType === 'success') {
      return { success: true };
    } else {
      return { error: response || 'An error occurred while creating the menu.' };
    }
  } catch (error) {
    console.error('Error In signup/action.ts: ', error);
    return { error: 'An unexpected error occurred.' };
  }
}