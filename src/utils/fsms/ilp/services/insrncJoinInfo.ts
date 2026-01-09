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

export interface InsrncJoinInfoRow {
  twdpsn1SeNm?: string
  twdpsn1EraYmd?: string
  twdpsn1EotYmd?: string | null
  twdpsn2SeNm?: string
  twdpsn2EraYmd?: string
  twdpsn2EotYmd?: string | null
  sbsttNm?: string
  sbsttEraYmd?: string
  sbsttEotYmd?: string
  insrncCoNm?: string
  insrncClsSetuNm?: string
  insrncCtrtNo?: string
  etcCn?: string
  regDt?: string
  mdfcnDt?: string
}

export type InsrncJoinInfoParams = {
  /** 필요 시 화면에서 바꿔치기할 수 있게 옵션으로 제공 */
  endpoint?: string
  vhclNo: string
  ctpvCd?: string
  locgovCd?: string
  page?: number
  size?: number
}

export async function fetchInsrncJoinInfo({
  endpoint = '/fsm/stn/disi/tr/dutyInsrSbscInfo',
  vhclNo,
  ctpvCd,
  locgovCd,
  page = 1,
  size = 10,
}: InsrncJoinInfoParams): Promise<{ rows: InsrncJoinInfoRow[]; total: number }> {
  if (!vhclNo) return { rows: [], total: 0 }

  const qs = new URLSearchParams()
  qs.set('vhclNo', vhclNo)
  if (ctpvCd) qs.set('ctpvCd', ctpvCd)
  if (locgovCd) qs.set('locgovCd', locgovCd)
  qs.set('page', String(page))
  qs.set('size', String(size))

  const url = `${endpoint}?${qs.toString()}`

  // sendHttpRequest는 수정하지 않음
  const res: PageResponse<InsrncJoinInfoRow> = await sendHttpRequest(
    'GET',
    url,
    null,
    true,
    { cache: 'no-store' }
  )

  if (res?.resultType === 'success' && res?.data) {
    const rows = res.data.content ?? []
    // ✅ 페이징 총건수는 totalElements가 있으면 그 값을 우선 사용
    const total =
      (res.data.totalElements ??
        res.data.length ??
        rows.length) as number
    return { rows, total }
  }
  return { rows: [], total: 0 }
}
