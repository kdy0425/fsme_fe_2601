import { MessageType, MessageTemplate, StatusType } from '@/types/message'

export enum SuccessReason {
  OK = '성공입니다.',
  CREATED = '정상적으로 등록되었습니다.',
  UPDATED = '정상적으로 수정되었습니다.',
  DELETED = '정상적으로 삭제되었습니다.',
  NO_CONTENT = '정보가 존재하지 않습니다.',
  ACCEPTED = '요청이 접수되어 처리 중입니다.',
}

export const messageTemplates: MessageTemplate = {
  'create.success': SuccessReason.CREATED,
  'create.inProgress': '등록 요청이 접수되어 처리 중입니다.',
  'create.error': '잘못된 요청입니다.',
  'update.success': SuccessReason.UPDATED,
  'update.inProgress': '수정 요청이 접수되어 처리 중입니다.',
  'update.error': '잘못된 요청입니다.',
  'delete.success': SuccessReason.DELETED,
  'delete.inProgress': '삭제 요청이 접수되어 처리 중입니다.',
  'delete.error': '잘못된 요청입니다.',
  'validation.failed': '잘못된 요청입니다.',
}

//message 생성 함수
export const getMessage = (
  key: string | number,
  context?: Record<string, string>,
): StatusType => {
  let status: StatusType

  if (typeof key === 'string') {
    if (key in messageTemplates) {
      const message = messageTemplates[key]
      status = {
        resultType: key.includes('error')
          ? MessageType.ERROR
          : MessageType.SUCCESS,
        status: key.includes('error') ? 400 : 200,
        message: message,
      }
    } else if (key in SuccessReason) {
      status = {
        resultType: MessageType.SUCCESS,
        status: 200,
        message: SuccessReason[key as keyof typeof SuccessReason],
      }
    } else {
      status = {
        resultType: key.includes('error')
          ? MessageType.ERROR
          : MessageType.SUCCESS,
        status: key.includes('error') ? 400 : 200,
        message: key,
      }
    }
  } else {
    // 숫자 키(HTTP 상태 코드)에 대한 기본 처리
    status = {
      resultType: key >= 400 ? MessageType.ERROR : MessageType.SUCCESS,
      status: key as number,
      message: key >= 400 ? '오류가 발생했습니다.' : '성공적으로 처리되었습니다.',
    }
  }

  let message = status.message

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value)
    })
  }

  return { ...status, message }
}