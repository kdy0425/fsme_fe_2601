// src/utils/fsms/ilp/services/insrncJoinInfo.ts
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

export type PageResponse<T = any> = {
  resultType: 'success' | 'fail' | string
  status: number
  message?: string
  data?: {
    content: T[]
    length?: number
    totalElements?: number
    pageable?: any
  }
}

export interface BsnInfoRow {
   //사업자정보
  brno?: string // 사업자등록번호
  vonrBrno?: string // 원사업자등록번호
  bzmnSeCdNm?: string // 사업자구분
  bzmnSttsCdNm?: string // 사업자상태
  prcsYmd?: string // 처리일자
  opbizYmd?: string // 개업일자
  tcbizBgngYmd?: string // 휴업시작일자
  tcbizEndYmd?: string // 휴업종료일자
  clsbizYmd?: string // 폐업일자
  bzstatNm?: string // 업태
  maiyTpbizNm?: string // 종목
  regDt?: string // 등록일자
  mdfcnDt?: string // 수정일자
  hstrySn?: string // 순번
  locgovCd?: string // 시도명+관할관청
}

export type BsnInfoParams = {
  /** 필요 시 화면에서 바꿔치기할 수 있게 옵션으로 제공 */
  endpoint?: string
  brno: string
  ctpvCd?: string
  locgovCd?: string
  page?: number
  size?: number
}

export async function fetchBsnInfo({
  endpoint = '/ilp/vqi/tr/BsniInfo',
  brno,
  ctpvCd,
  locgovCd,
  page = 0,
  size = 10,
}: BsnInfoParams): Promise<{ rows: BsnInfoRow[]; total: number }> {
  if (!brno) return { rows: [], total: 0 }

  const qs = new URLSearchParams()
  qs.set('brno', brno)
  if (ctpvCd) qs.set('ctpvCd', ctpvCd)
  if (locgovCd) qs.set('locgovCd', locgovCd)
  qs.set('page', String(page))
  qs.set('size', String(size))

  const url = `${endpoint}?${qs.toString()}`

  // sendHttpRequest는 수정하지 않음
  const res: PageResponse<BsnInfoRow> = await sendHttpRequest(
    'GET',
    url,
    null,
    true,
    { cache: 'no-store' }
  )

  if (res?.resultType === 'success' && res?.data) {
    const rows = res.data.content ?? []
    // 페이징 총건수는 totalElements가 있으면 그 값을 우선 사용
    const total =
      (res.data.totalElements ??
        res.data.length ??
        rows.length) as number
    return { rows, total }
  }
  return { rows: [], total: 0 }
}
