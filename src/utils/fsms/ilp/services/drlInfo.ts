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

export interface DrlInfoRow {
   //운전면허정보
  driverVonrNm?: string // 운전자명
  driverVonrRrno?: string // 운전자주민등록번호(원본)
  driverVonrRrnoSecure?: string // 운전자주민등록번호(별표)
  psnSeCdNm?: string // 면허보유여부
  stopBgngYmd?: string // 정지시작일자
  stopEndYmd?: string // 정지종료일자
  rtrcnYmd?: string // 취소일자
  knpaRgtrId?: string // 등록자아이디
  knpaRegDt?: string // 등록일자
  knpaMdfrId?: string // 수정자아이디
  knpaMdfcnDt?: string // 수정일자
}

export type DrlInfoParams = {
  /** 필요 시 화면에서 바꿔치기할 수 있게 옵션으로 제공 */
  endpoint?: string
  vonrRrno: string
  ctpvCd?: string
  locgovCd?: string
  page?: number
  size?: number
}

export async function fetchDrlInfo({
  endpoint = '/ilp/fdqi/tr/drliInfo',
  vonrRrno,
  ctpvCd,
  locgovCd,
  page = 0,
  size = 10,
}: DrlInfoParams): Promise<{ rows: DrlInfoRow[]; total: number }> {
  if (!vonrRrno) return { rows: [], total: 0 }

  const qs = new URLSearchParams()
  qs.set('vonrRrno', vonrRrno)
  if (ctpvCd) qs.set('ctpvCd', ctpvCd)
  if (locgovCd) qs.set('locgovCd', locgovCd)
  qs.set('page', String(page))
  qs.set('size', String(size))

  const url = `${endpoint}?${qs.toString()}`

  // sendHttpRequest는 수정하지 않음
  const res: PageResponse<DrlInfoRow> = await sendHttpRequest(
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
