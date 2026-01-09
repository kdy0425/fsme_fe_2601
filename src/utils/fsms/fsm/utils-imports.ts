// 커스텀 함수 및 타입 사용을 위한 import문을 모아둔 파일
// 1. export 할 함수 및 타입 등을 각 자리에 추가한다.
// 2. 맨 밑의 import 문에도 추가한다.
// 3. import 문을 복사하여 필요한 곳에 붙여넣은 후 사용하지 않는 export를 지운다.

// Custom API
export { useForm } from '@/store/useForm'
export { getAuthInfo } from '@/utils/fsms/common/user/authUtils'
export { getJwtToken } from '@/utils/fsms/common/user/jwtTokenUtils'
export {
  delay,
  toQueryString,
  isProduction,
  isDevelopment,
  isTest,
  decodeUriString,
} from '@/utils/fsms/utils'
export { useMessageActions } from '@/store/MessageContext'
export { getMessage } from '@/utils/fsms/common/messageUtils'
export {
  sendHttpRequest,
  sendFormDataWithJwt,
} from '@/utils/fsms/common/apiUtils'

// Types
export type {
  FieldType,
  ValidationRule,
  FieldConfig,
  FormErrors,
  FormSubmitButtonProps,
} from '@/types/form'
export type {
  CreatePageProps,
  UpdatePageProps,
  ViewPageProps,
  ListPageProps,
} from '@/types/fsms/fsm/pageTypes'
export type { AuthInfo } from '@/types/fsms/admin/authTypes'
export type {
  PostData,
  PostObj,
  FileInfo,
  FetchOneData,
  FileSearchObj,
} from '@/types/fsms/fsm/fetchData'

// 복사 붙여넣기용 import
import {
  useForm,
  getAuthInfo,
  getJwtToken,
  delay,
  toQueryString,
  isProduction,
  isDevelopment,
  isTest,
  decodeUriString,
  useMessageActions,
  getMessage,
  sendHttpRequest,
  sendFormDataWithJwt,
  FieldType,
  ValidationRule,
  FieldConfig,
  FormErrors,
  FormSubmitButtonProps,
  CreatePageProps,
  UpdatePageProps,
  ViewPageProps,
  ListPageProps,
  AuthInfo,
  PostData,
  PostObj,
  FileInfo,
  FetchOneData,
  FileSearchObj,
} from '@/utils/fsms/fsm/utils-imports'
