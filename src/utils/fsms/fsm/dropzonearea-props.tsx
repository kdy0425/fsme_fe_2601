// DropzoneArea 컴포넌트에 필요한 Props를 정의해놓은 파일

// Custom API
import { decodeUriString } from '@/utils/fsms/fsm/utils-imports'
// MUI
import { AlertType } from 'mui-file-dropzone'

// 파일 DropzoneArea에 표시할 텍스트
export const dropzoneText: string = `여기를 클릭하거나 파일을 드래그 앤 드롭하세요.`
// 미리보기 영역에 표시할 텍스트
export const previewText: string = `Preview: `

// DropzoneArea의 컨텐츠 설명 prop에 전달할 JSX Element
export const ContentsExplanationText: JSX.Element = (
  <p>
    입력 테이블 제목에 <span className="required-text">*</span> 이 있으면 필수
    입력 항목 입니다.
  </p>
)

// 제출된 게시글의 수정 페이지에 접근했을 경우
export const ContentsExplanationRejectText: JSX.Element = (
  <p>제출된 게시글은 수정 및 삭제할 수 없습니다.</p>
)

// 최대 파일 개수
export const filesLimit: number = 6

// 최대 파일 사이즈: 10MB
export const maxFileSize: number = 10000000

// 알림 메시지를 출력할 범위
// 'success'를 추가하면 파일을 추가했을 때 성공 메시지를 보여줄 수 있으나
// 줄바꿈이 적용되어있지 않아. 여러개의 파일을 한 번에 추가하면 한 줄로 출력되는 문제가 있음
export const showAlerts: AlertType[] = ['error', 'info']

// 파일 DropzoneArea의 에러 메시지 정의 함수
// rejectedFile: 거부된 파일
// acceptedFiles: 허용된 확장자의 배열
// maxFileSize: 업로드 가능한 파일 사이즈(Byte)
export const getDropRejectMessage = (
  rejectedFile: File,
  acceptedFiles: string[],
  maxFileSize: number,
): string => {
  if (rejectedFile.size > maxFileSize) {
    return `"${rejectedFile.name}"은(는) 너무 큽니다. 최대 ${maxFileSize / 1000000}MB까지 허용됩니다.`
  }

  if (!acceptedFiles.includes(rejectedFile.type)) {
    return `"${rejectedFile.name}" 파일 형식은 지원되지 않습니다. ${acceptedFiles.join(', ')} 형식만 허용됩니다.`
  }

  return '파일이 거부되었습니다. 허용된 파일 형식과 크기를 확인해주세요.'
}

// 파일 DropzoneArea의 파일 개수 제한 메시지 정의 함수
export const getFileLimitExceedMessage = (filesLimit: number): string =>
  `최대 ${filesLimit}개의 파일만 업로드할 수 있습니다.`

// 파일 DropzoneArea의 파일 추가 성공 메시지 정의 함수
export const getFileAddedMessage = (fileName: string): string => {
  const decodedFileName = decodeUriString(fileName)
  return `${decodedFileName} 파일이 성공적으로 추가되었습니다.`
}

// 파일 DropzoneArea의 파일 제거 성공 메시지 정의 함수
export const getFileRemovedMessage = (fileName: string): string =>
  `${fileName} 파일이 제거되었습니다.`

// 첨부 허용할 파일 타입 배열
export const acceptedFileTypes: string[] = [
  'application/zip', // zip
  'application/pdf', // pdf
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'image/gif', // gif
  'image/jpeg', // jpg, jpeg
  'image/png', // png
]

// 첨부 허용할 파일 확장자 배열
export const acceptedFileExtensions: string[] = [
  '.zip',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.gif',
  '.jpg',
  '.jpeg',
  '.png',
]
