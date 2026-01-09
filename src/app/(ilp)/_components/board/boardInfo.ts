/* type */
import { boardType, boardPath, bbsSnType, enableType, leadCnCdType, modalTitleType, returnType } from "./type";

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// 게시판 uri
export const boardPathObj: boardPath = {
  NOTICE: '/ilp/notice',
  FAQ: '/ilp/faq',
  QNA: '/ilp/qna',
  ISCS: '/ilp/iscs',
}

// 게시판일련번호
export const bbsSnObj: bbsSnType = {
  NOTICE: '1',
  FAQ: '2',
  QNA: '4',
  ISCS: '5',
}

// 지자체정보 사용여부
export const enableLocgovObj: enableType = {
  NOTICE: false,
  FAQ: false,
  QNA: true,
  ISCS: false,
}

// 팝업 사용여부
export const enablePopupObj: enableType = {
  NOTICE: true,
  FAQ: false,
  QNA: false,
  ISCS: false,
}

// 게시판 파일 사용여부
export const enableFileObj: enableType = {
  NOTICE: true,
  FAQ: true,
  QNA: true,
  ISCS: true,
}

// 게시판 댓글 사용여부
export const enableCommentObj: enableType = {
  NOTICE: false,
  FAQ: false,
  QNA: true,
  ISCS: true,
}

// 게시글 구분 정보
export const leadCnCdObj: leadCnCdType = {
  NOTICE: {
    leadCnNm: '공지구분',
    cdGroupNm: 'ILP112',
  },
  FAQ: {
    leadCnNm: 'FAQ 구분',
    cdGroupNm: 'ILP115',
  },
  QNA: {
    leadCnNm: 'QNA 구분',
    cdGroupNm: 'ILP115',
  },
  ISCS: {
    leadCnNm: '부정수급 사례 구분',
    cdGroupNm: 'ISCS',
  },
}

// 모달 명
export const modalTitleObj: modalTitleType = {
  NOTICE: '공지사항',
  FAQ: 'FAQ',
  QNA: 'Q&A',
  ISCS: '부정수급 사례',
}

// 조회수 올리기, 댓글 & 파일가져오기, 등록된 값 세팅
export const getBoardData = async (boardType: boardType, bbscttSn: string, bbsSn: string): Promise<returnType | null> => {

  try {

    const path = boardPathObj[boardType]
    const searchObj = {
      bbscttSn: bbscttSn,
      bbsSn: bbsSn,
      codeGrpCd: leadCnCdObj[boardType].cdGroupNm
    }

    const url = path + '/getAllBoardInfo' + toQueryParameter(searchObj)
    const response = await sendHttpRequest('GET', url, null, true, { cache: 'no-store' })

    // 데이터 조회 성공시
    if (response && response.resultType === 'success') {

      const result: returnType = {
        fileList: response.data.fileList,
        commentList: response.data.commentList,
        procData: response.data,
        noneProcData: response.data,
      }

      return result
    }
  } catch (error) {
    console.log('fetchData error : ' + error)
  }

  return null
}