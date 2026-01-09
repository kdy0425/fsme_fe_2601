/**********************************************
 * dto interface
 **********************************************/
// 게시물
export interface dwBoardDtl {
  popupNtcYn: 'N' | 'Y'
  popupBgngYmd: string
  ttl: string
  originTtl?: string
  leadCnCd: string
  relateTaskSeCd: string
  bbscttSn: string
  bbsSn: string
  cn: string
  popupEndYmd: string
}

// 첨부파일
export interface dwBoardAtt {
  atchSn: string
  bbscttSn: string
  physFileNm: string
  lgcFileNm: string
  fileSize: string
}

// 게시물댓글
export interface dwBoardReply {
  cmntSn: string
  bbscttSn: string
  cn: string
  cmntCn: string
  userNm: string
  rgtrId: string
  regDt: string
}

// 프로세스에는 사용되지 않으나, 데이터 노출여부로 사용하는 컬럼
export interface otherData {
  locgovNm: string,
  rgtrId: string,
  originTtl: string,
  leadCnNm: string
  relateTaskSeNm: string
}

/**********************************************
 * type
 **********************************************/
// NOTICE: 공지사항 / FAQ: FAQ / QNA: Q&A / ISCS: 부정수급 사례 공유
export type boardType = 'NOTICE' | 'FAQ' | 'QNA' | 'ISCS'

// 모달 열람 로직
export type openType = 'VIEW' | 'CREATE' | 'UPDATE'

// 게시판 path
export type boardPath = Record<boardType, string>

// 게시판일련번호 타입
export type bbsSnType = Record<boardType, string>

// 지자체정보, 팝업, 게시판파일, 게시판댓글 사용여부
export type enableType = Record<boardType, boolean>

// select box 구분명 및 cdGroupNm 정보
type leadCnCd = {
  leadCnNm: string
  cdGroupNm: string
}

// 게시글 input 정보
export type leadCnCdType = Record<boardType, leadCnCd>

export type modalTitleType = Record<boardType, string>

// 게시글 정보 타입
export type returnType = {
  fileList: dwBoardAtt[]
  commentList: dwBoardReply[]
  procData: dwBoardDtl
  noneProcData: otherData
}