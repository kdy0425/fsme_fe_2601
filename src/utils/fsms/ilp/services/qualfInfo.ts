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

export interface QualfInfoRow {
  //운수종사자 정보
  driverVonrRrnoS?: string // 운전자주민등록번호(별표)
  driverRegDt?: string // 운전자등록일자
  sttsCd?: string // 운수종사상태코드
  frghtQlfcNo?: string // 화물자격번호
  frghtQlfcSttsNm?: string // 자격보유여부
  frghtQlfcSttsCdNm?: string // 자격보유여부
  frghtQlfcAcqsYmd?: string // 화물자격취득일자
  frghtQlfcRtrcnYmd?: string // 화물자격취소일자
  kotsaRgtrId?: string // 등록자아이디
  kotsaRegDt?: string // 등록일시
  kotsaMdfrId?: string // 수정자아이디
  kotsaMdfcnDt?: string // 수정일시
}

export type QualfInfoParams = {
  /** 필요 시 화면에서 바꿔치기할 수 있게 옵션으로 제공 */
  endpoint?: string
  vonrRrno?: string
  vhclNo?: string
  ctpvCd?: string
  locgovCd?: string
  page?: number
  size?: number
}

export async function fetchQualfInfo({
  endpoint = '/fsm/stn/disi/tr/dutyInsrSbscInfo',
  vonrRrno,
  vhclNo,
  ctpvCd,
  locgovCd,
  page = 1,
  size = 10,
}: QualfInfoParams): Promise<{ rows: QualfInfoRow[]; total: number }> {
  if (!vonrRrno) return { rows: [], total: 0 }

  const qs = new URLSearchParams()
  qs.set('vonrRrno', vonrRrno)
  if (vhclNo) qs.set('vhclNo', vhclNo)
  if (ctpvCd) qs.set('ctpvCd', ctpvCd)
  if (locgovCd) qs.set('locgovCd', locgovCd)
  qs.set('page', String(page))
  qs.set('size', String(size))

  const url = `${endpoint}?${qs.toString()}`

  // sendHttpRequest는 수정하지 않음
  const res: PageResponse<QualfInfoRow> = await sendHttpRequest(
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
