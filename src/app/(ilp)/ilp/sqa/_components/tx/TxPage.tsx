'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import { Pageable2 } from 'table'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getUserInfo } from '@/utils/fsms/utils'
import { sqaTxHc, sqaInsrncCmHC, sqaTransprtTxHc } from '@/utils/fsms/ilp/headCells'
import { BlankCard } from '@/utils/fsms/fsm/mui-imports'

import { useInsrncJoinInfo } from '@/utils/fsms/ilp/hooks/useInsrncJoinInfo'
import { useQualfInfo } from '@/utils/fsms/ilp/hooks/useQualfInfo'

import { useDispatch } from '@/store/hooks'
import { useSelector as useReduxSelector, shallowEqual } from 'react-redux'
import type { AppState } from '@/store/store'
import AnlsPrdModal from '@/app/components/ilp/popup/AnlsPrdModal'
import { openAnlsPrdModal, setAnlsInvalidDays, setScopeKey, closeAnlsPrdModal } from '@/store/popup/ilp/AnlsPrdSlice'

import { exportGridToXlsx } from '@/utils/fsms/ilp/excel/exportGrid'
import { excelRsnModalOpen } from '@/app/app'

/* ───────────────────────────── 타입 ───────────────────────────── */
type ListSearch = {
  page: number
  size: number
  ctpvCd?: string
  locgovCd?: string
  vhclNo?: string
  vonrRrno?: string
}

interface Row {
  locgovCd?: string
  vhclNo?: string
  vonrRrno?: string
  vonrRrnoS?: string
  vonrNm?: string
  vhclPsnCdNm?: string
  vhclSttsCdNm?: string
  vhclSttsNm?: string
  carRegDt?: string
  sttsCd?: string
  taxiQlfcNo?: string
  taxiQlfcSttsNm?: string
  taxiQlfcAcqsYmd?: string
  taxiQlfcRtrcnYmd?: string | null
  kotsaRgtrId?: string
  kotsaRegDt?: string
  kotsaMdfrId?: string
  kotsaMdfcnDt?: string

  // 보험(대인1/대인2/대물)
  twdpsn1SeNm?: string
  twdpsn1EraYmd?: string
  twdpsn1EotYmd?: string | null
  twdpsn2SeNm?: string
  twdpsn2EraYmd?: string
  twdpsn2EotYmd?: string | null
  sbsttNm?: string
  sbsttEraYmd?: string
  sbsttEotYmd?: string | null

  // KIDI reg/mdfcn
  regDt?: string
  mdfcnDt?: string

  //유효판정
  twdpsn1SeNmAnls?: string | null
  twdpsn2SeNmAnls?: string | null
  sbsttNmAnls?: string | null
  taxiQlfcSttsNmAnls?: string | null

  chkVal?: 'R' | 'V' | string
  color?: string

  [key: string]: any
}

/* ─ 분석 응답 ─ */
type AnalyzeRes = {
  highlight: boolean
  invalidDays: string[]                   // 'YYYY-MM-DD'
  segments: { from: string; to: string; valid: boolean; reasons: string[] }[]
  insurance: AnyRow[]                     // 의무보험 상세 (화면 헤더 키 그대로)
  qualf: AnyRow[]                         // 운수종사자 상세 (화면 헤더 키 그대로)
  business?: AnyRow[]                     // (TR만)
  driverLicense?: AnyRow[]                // (TR만)
}

/* ───────────────────────────── utils ───────────────────────────── */
type AnyRow = Record<string, any>

const toYmd8 = (d?: unknown): string | null => {
  if (d == null) return null
  const digits = String(d).replace(/[^\d]/g, '')
  return digits.length >= 8 ? digits.slice(0, 8) : null
}
const normPlate = (v?: string | null): string => (!v ? '' : String(v).replace(/[\s-]/g, '').toUpperCase())
const cmp = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1)
const within = (d8: string, from8?: unknown, to8?: unknown) => {
  if (!d8) return false
  const f = toYmd8(from8) ?? '00000101'
  const t = toYmd8(to8) ?? '99991231'
  return cmp(f, d8) <= 0 && cmp(d8, t) <= 0
}
const listDays = (from8: string, to8: string) => {
  const s = new Date(+from8.slice(0, 4), +from8.slice(4, 6) - 1, +from8.slice(6, 8))
  const e = new Date(+to8.slice(0, 4), +to8.slice(4, 6) - 1, +to8.slice(6, 8))
  const out: string[] = []
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${day}`)
  }
  return out
}
const firstDefined = (obj: AnyRow | undefined, keys: string[]) => {
  if (!obj) return undefined
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}
const toYmd8LooseFromKeys = (obj: AnyRow, keys: string[]) => toYmd8(firstDefined(obj, keys))
const decorateRows = (rows: Row[], highlightIdx: number) =>
  rows.map((r, i) => (i === highlightIdx ? { ...r, color: '#1976d2' } : { ...r, color: undefined }))

const overlapEitherPeriod = (r: Row, _from8: string, to8: string) => {
  const kReg = toYmd8(r.kotsaRegDt)
  const iReg = toYmd8(r.regDt)
  const gte = (a: string, b: string) => cmp(a, b) >= 0
  const okKotsa = !!kReg && gte(to8, kReg)
  const okInsur = !!iReg && gte(to8, iReg)
  return okKotsa || okInsur
}
const getOrderSn = (r: Row) => Number((r.hstrySn ?? r.sn ?? 0) as any)

const calcInvalidDaysForPeriodStrict = (r: Row, from8: string, to8: string) => {
  const days = listDays(from8, to8)
  const badVhcl = (r.vhclSttsCdNm ?? r.vhclSttsNm ?? '').trim() !== '정상'
  const badTaxi = (r.taxiQlfcSttsNm ?? '').trim() !== '취득'
  if (badVhcl || badTaxi) return days
  const kReg = toYmd8(r.kotsaRegDt)
  const iReg = toYmd8(r.regDt)
  return days.filter((ymd) => {
    const d8 = ymd.replace(/-/g, '')
    const earlyK = !!kReg && cmp(d8, kReg) < 0
    const earlyI = !!iReg && cmp(d8, iReg) < 0
    if (earlyK || earlyI) return true
    const okT1 = within(d8, r.twdpsn1EraYmd ?? '00000101', r.twdpsn1EotYmd ?? '99991231')
    const okT2 = within(d8, r.twdpsn2EraYmd ?? '00000101', r.twdpsn2EotYmd ?? '99991231')
    const okS  = within(d8, r.sbsttEraYmd   ?? '00000101', r.sbsttEotYmd   ?? '99991231')
    return !(okT1 && okT2 && okS)
  })
}

// 시작일 없으면 포함 아님(false), 종료일 없으면 오픈엔드
const inPeriodStrict = (d8: string, from8?: unknown, to8?: unknown) => {
  const f = toYmd8(from8)
  if (!f) return false
  const t = toYmd8(to8) ?? '99991231'
  return cmp(f, d8) <= 0 && cmp(d8, t) <= 0
}

// [ADD] SRC/ FH 헬퍼
const getSrc = (r: AnyRow) => String((r?.src ?? r?.SRC) ?? '').toUpperCase();
const isFH = (r: AnyRow) => getSrc(r) === 'FH';

// 날짜 기준 의무보험 "상세행 전체"로 유효성 판단
const isInsuranceValidOnDate = (d8: string, insRows: AnyRow[]) => {
  // 후보: regDt ≤ d8 이면서 FH가 아닌 행만
  const eligible = (insRows ?? []).filter(r => {
    if (isFH(r)) return false;  //  FH는 후보 제외 = 미유효
    const reg8 = toYmd8LooseFromKeys(r, ['regDt','REG_DT','REG_DT_ORG']);
    return !!reg8 && cmp(reg8, d8) <= 0;
  });
  if (eligible.length === 0) return false;


  const t1OK = eligible.some(r => inPeriodStrict(d8, r.twdpsn1EraYmd, r.twdpsn1EotYmd))
  const t2OK = eligible.some(r => inPeriodStrict(d8, r.twdpsn2EraYmd, r.twdpsn2EotYmd))
  const sOK  = eligible.some(r => inPeriodStrict(d8, r.sbsttEraYmd,   r.sbsttEotYmd))

  // 세 가지 모두 해당 날짜에 포함되어야 "유효"
  return t1OK && t2OK && sOK
}

// 날짜 기준 운수종사자 "상세행 전체"로 유효성 판단
const istaxiValidOnDate = (d8: string, qRows: AnyRow[]) => {
  return (qRows ?? []).some(r => {
    if (isFH(r)) return false;
    const k8   = toYmd8LooseFromKeys(r, ['kotsaRegDt'])
    const acq8 = toYmd8LooseFromKeys(r, ['taxiQlfcAcqsYmd'])
    const rtr8 = toYmd8LooseFromKeys(r, ['taxiQlfcRtrcnYmd']) ?? '99991231'
    const acquired = String(r?.taxiQlfcSttsNm ?? '').trim() === '취득'
    return !!k8 && cmp(k8, d8) <= 0 && !!acq8 && cmp(acq8, d8) <= 0 && cmp(d8, rtr8) <= 0 && acquired
  })
}

// 상세행 기반 기간-미유효일 계산 (하루라도 미유효면 해당 날짜를 수집)
const calcInvalidDaysForPeriodDetailed = (
  r: Row,
  insRows: AnyRow[],
  qRows: AnyRow[],
  from8: string,
  to8: string
) => {
  const days = listDays(from8, to8)
  const vehOK = String(r.vhclSttsCdNm ?? r.vhclSttsNm ?? '').trim() === '정상'

  return days.filter(ymd => {
    const d8 = ymd.replace(/-/g, '')
    if (!vehOK) return true // 차량상태가 비정상이면 전체 기간 미유효
    const insOK  = isInsuranceValidOnDate(d8, insRows)
    const taxiOK = istaxiValidOnDate(d8, qRows)
    return !(insOK && taxiOK) // 둘 다 충족해야 유효
  })
}

// 상세가 비어있으면 기존(strict) 로직으로 폴백
const calcInvalidDaysForPeriod = (
  r: Row,
  insRows: AnyRow[],
  qRows: AnyRow[],
  from8: string,
  to8: string
) => {
  if ((insRows?.length ?? 0) + (qRows?.length ?? 0) === 0) {
    return calcInvalidDaysForPeriodStrict(r, from8, to8)
  }
  return calcInvalidDaysForPeriodDetailed(r, insRows, qRows, from8, to8)
}

/* ─ 분석 API 호출 ─ */
const callAnalyzeBs = async (params: {
  mode: 'DATE'
  vhclNo: string
  ctpvCd?: string
  locgovCd?: string
  vonrRrno?: string
  dateYmd?: string     // mode=DATE일 때
  fromYmd?: string     // mode=PERIOD일 때
  toYmd?: string       // mode=PERIOD일 때
}): Promise<AnalyzeRes | null> => {
  // GET 쿼리 스트링 구성
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')

  const endpoint = `/ilp/sqa/tx/getAllSpldmdQlfcAnlsTx?${qs}`

  try {
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
    // 공통 응답 래퍼 사용 중이면 아래 형태가 일반적 (resultType/data)
    if (res?.resultType === 'success' && res?.data) {
      return res.data as AnalyzeRes
    }
    // 바로 객체가 오는 경우엔 그대로 반환
    if (res && !res?.resultType) return res as unknown as AnalyzeRes
    return null
  } catch (e) {
    console.error('Analyze API error:', e)
    return null
  }
}

const normalizeInsRow = (r: AnyRow) => ({
  ...r,
  
  // 컬럼들이 바라보는 표준 키들을 채워준다 (없으면 대문자/별칭에서 끌어옴)
  regDt:            r.regDt            ?? r.REG_DT ?? r.REG_DT_ORG,
  mdfcnDt:          r.mdfcnDt          ?? r.MDFCN_DT ?? r.MDFCN_DT_ORG,
  twdpsn1EraYmd:    r.twdpsn1EraYmd    ?? r.TWDPSN_1_ERA_YMD ?? r.T1_FROM,
  twdpsn1EotYmd:    r.twdpsn1EotYmd    ?? r.TWDPSN_1_EOT_YMD ?? r.T1_TO,
  twdpsn2EraYmd:    r.twdpsn2EraYmd    ?? r.TWDPSN_2_ERA_YMD ?? r.T2_FROM,
  twdpsn2EotYmd:    r.twdpsn2EotYmd    ?? r.TWDPSN_2_EOT_YMD ?? r.T2_TO,
  sbsttEraYmd:      r.sbsttEraYmd      ?? r.SBSTT_ERA_YMD    ?? r.S_FROM,
  sbsttEotYmd:      r.sbsttEotYmd      ?? r.SBSTT_EOT_YMD    ?? r.S_TO,
  insrncCtrtNo:     r.insrncCtrtNo     ?? r.INSRNC_CTRT_NO,
  insrncCoNm:       r.insrncCoNm       ?? r.INSRNC_CO_NM , 
  insrncClsSetuNm:  r.insrncClsSetuNm  ?? r.INSRNC_CLS_SETU_NM , 
  twdpsn1SeNm:      r.twdpsn1SeNm      ?? r.TWDPSN_1_SE_NM,
  twdpsn2SeNm:      r.twdpsn2SeNm      ?? r.TWDPSN_2_SE_NM,
  sbsttNm:          r.sbsttNm          ?? r.SBSTT_NM,

});

const normalizeQualfRow = (r: AnyRow, mainRow?: Row) => ({
  ...r,

  // 차량정보
  vhclNo:     r.vhclNo     ?? r.VHCL_NO        ?? null,
  vonrRrnoS:  r.vonrRrnoS  ?? r.VONR_RRNO_S    ?? mainRow?.vonrRrnoS,
  vonrNm:     r.vonrNm     ?? r.VONR_NM        ?? mainRow?.vonrNm,        // 소유자명 fallback
  vhclPsnNm:  r.vhclPsnNm  ?? r.VHCL_PSN_NM    ?? mainRow?.vhclPsnNm,    // 소유구분 fallback
  vhclSttsNm: r.vhclSttsNm ?? r.VHCL_STTS_NM   ?? r.STATUS_NM ?? mainRow?.vhclSttsNm,
  carRegDt:   r.carRegDt   ?? r.CAR_REG_DT     ?? mainRow?.carRegDt,     // 차량등록일자 fallback


  // 운수종사자격정보 (그리드 headCells 기준)
  taxiQlfcNo:       r.taxiQlfcNo       ?? r.TAXI_QLFC_NO,
  taxiQlfcSttsNm:   r.taxiQlfcSttsNm   ?? r.TAXI_QLFC_STTS_NM ?? r.STATUS_NM,
  taxiQlfcAcqsYmd:  r.taxiQlfcAcqsYmd  ?? r.TAXI_QLFC_ACQS_YMD ?? r.ACQ_DT,
  taxiQlfcRtrcnYmd: r.taxiQlfcRtrcnYmd ?? r.TAXI_QLFC_RTRCN_YMD,
  kotsaRegDt:      r.kotsaRegDt      ?? r.KOTSA_REG_DT ?? r.KOTSA_REG_DT_N,
  kotsaMdfcnDt:    r.kotsaMdfcnDt    ?? r.KOTSA_MDFCN_DT,

  // 기타 보조필드(사용처 대비 보존)
  kotsaRgtrId:   r.kotsaRgtrId   ?? r.KOTSA_RGTR_ID,
  kotsaMdfrId:   r.kotsaMdfrId   ?? r.KOTSA_MDFR_ID,
  hstrySn:       r.hstrySn       ?? r.HSTRY_SN,
  sttsCd:        r.sttsCd        ?? r.TAXI_QLFC_STTS_CD,
});

/* ───────────────────────────── 공통 유효판정 헬퍼 (날짜 모드) ───────────────────────────── */

// 메인 행 유효 여부(알럿 판정용)
function isMainInvalidForDate(r: Row, d8: string) {
  const badVhcl = String(r.vhclSttsNm ?? r.vhclSttsCdNm ?? '').trim() !== '정상'
  const okT1 = within(d8, r.twdpsn1EraYmd, r.twdpsn1EotYmd)
  const okT2 = within(d8, r.twdpsn2EraYmd, r.twdpsn2EotYmd)
  const okS  = within(d8, r.sbsttEraYmd,   r.sbsttEotYmd)
  const badIns = !(okT1 && okT2 && okS)

  const k8   = toYmd8(r.kotsaRegDt) ?? '99991231'
  const kOk  = cmp(k8, d8) <= 0

  const acq8 = toYmd8(r.taxiQlfcAcqsYmd) ?? '99991231'
  const rtr8 = toYmd8(r.taxiQlfcRtrcnYmd) ?? '99991231'
  const inTaxiRange = cmp(acq8, d8) <= 0 && cmp(d8, rtr8) <= 0
  const acquired = String(r.taxiQlfcSttsNm ?? '').trim() === '취득'

  const badTaxi = !(kOk && acquired && inTaxiRange)
  return badVhcl || badIns || badTaxi
}

// “분석 가능한 대상 없음” 판정: 보험(regDt≤d8)이나 운수(kotsaRegDt≤d8) 중 하나라도 있어야 함
function hasAnyAnalyzableDetail(insRows: AnyRow[], qRows: AnyRow[], d8: string) {
  const anyInsRegOK = (insRows ?? []).some(r => {
    const reg8 = toYmd8LooseFromKeys(r, ['regDt'])
    return !!reg8 && cmp(reg8, d8) <= 0
  })
  const anyQlfKOk = (qRows ?? []).some(r => {
    const k8 = toYmd8LooseFromKeys(r, ['kotsaRegDt'])
    return !!k8 && cmp(k8, d8) <= 0
  })
  return anyInsRegOK || anyQlfKOk
}

// 메인 하이라이트(파란색) 여부: 상세에서 “유효한 것”이 하나라도 있으면 true
export function anyDetailValidForDate(insRows: AnyRow[], qRows: AnyRow[], d8: string) {
  const ins = (insRows ?? []).filter(r => !isFH(r));
  const qlf = (qRows  ?? []).filter(r => !isFH(r));

  const okIns = ins.some((r) => {
    const reg8 = toYmd8LooseFromKeys(r, ['regDt'])
    if (!(reg8 && cmp(reg8, d8) <= 0)) return false
    const t1 = within(d8, r?.twdpsn1EraYmd, r?.twdpsn1EotYmd)
    const t2 = within(d8, r?.twdpsn2EraYmd, r?.twdpsn2EotYmd)
    const s  = within(d8, r?.sbsttEraYmd,   r?.sbsttEotYmd)
    return t1 || t2 || s
  })

  const okQ = qlf.some((r) => {
    const k8   = toYmd8LooseFromKeys(r, ['kotsaRegDt'])
    if (!(k8 && cmp(k8, d8) <= 0)) return false
    const acq8 = toYmd8LooseFromKeys(r, ['taxiQlfcAcqsYmd'])
    const rtr8 = toYmd8LooseFromKeys(r, ['taxiQlfcRtrcnYmd']) ?? '99991231'
    const inRange  = !!acq8 && cmp(acq8, d8) <= 0 && cmp(d8, rtr8) <= 0
    const acquired = String(r?.taxiQlfcSttsNm ?? '').trim() === '취득'
    return inRange && acquired
  })

  return okIns || okQ
}

// 헬퍼: 날짜 기준 사유별 분리 (메인 표기용)
function splitInvalidReasons(r: Row, d8: string) {
  const badVhcl = String(r.vhclSttsNm ?? r.vhclSttsCdNm ?? '').trim() !== '정상'

  const okT1 = within(d8, r.twdpsn1EraYmd, r.twdpsn1EotYmd)
  const okT2 = within(d8, r.twdpsn2EraYmd, r.twdpsn2EotYmd)
  const okS  = within(d8, r.sbsttEraYmd,   r.sbsttEotYmd)
  const badIns = !(okT1 && okT2 && okS)

  const k8  = toYmd8(r.kotsaRegDt) ?? '99991231'
  const kOk = cmp(k8, d8) <= 0
  const acq8 = toYmd8(r.taxiQlfcAcqsYmd) ?? '99991231'
  const rtr8 = toYmd8(r.taxiQlfcRtrcnYmd) ?? '99991231'
  const inTaxiRange = cmp(acq8, d8) <= 0 && cmp(d8, rtr8) <= 0
  const acquired = String(r.taxiQlfcSttsNm ?? '').trim() === '취득'
  const badTaxi = !(kOk && acquired && inTaxiRange)

  return { badVhcl, badIns, badTaxi }
}

/* ──────────────────────────── 페이지 컴포넌트 ──────────────────────────── */
function DataList() {
  const dispatch = useDispatch()
  const userInfoRef = useRef(getUserInfo())
  const isLogv = userInfoRef.current?.roles?.[0] === 'LOGV'

  const {
    applyFilterTrigger,
    selectedVhclNo,
    analysisDate,
    anpModalOpen,
    messageConfig,
    analysisMode,
    analysisFrom,
    analysisTo,
    scopeKey,
  } = useReduxSelector(
    (s: AppState) => ({
      applyFilterTrigger: s.anlsPrdInfo.applyFilterTrigger,
      selectedVhclNo: s.anlsPrdInfo.selectedVhclNo,
      analysisDate: s.anlsPrdInfo.analysisDate,
      anpModalOpen: s.anlsPrdInfo.anpModalOpen,
      messageConfig: s.anlsPrdInfo.messageConfig,
      analysisMode: s.anlsPrdInfo.analysisMode,
      analysisFrom: s.anlsPrdInfo.analysisFrom,
      analysisTo: s.anlsPrdInfo.analysisTo,
      scopeKey: s.anlsPrdInfo.scopeKey,
    }),
    shallowEqual,
  )

  const PAGE_SCOPE = 'sqaTxPage'
  const searchParams = useSearchParams()
  const initial = Object.fromEntries(searchParams.entries()) as Record<string, string>

  // 검색 폼
  const [formParams, setFormParams] = useState<ListSearch>({
    page: Number(initial.page ?? 1),
    size: Number(initial.size ?? 10),
    ctpvCd: initial.ctpvCd,
    locgovCd: initial.locgovCd,
    vhclNo: initial.vhclNo,
  })
  const [queryParams, setQueryParams] = useState<ListSearch | null>(null)

  // 메인 그리드
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [mainHighlightIndex, setMainHighlightIndex] = useState(-1) // 메인 하이라이트
  const [analysisD8, setAnalysisD8] = useState<string | null>(null)
  const selectedRow = rows[selectedIndex]

  // 체크박스 키
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 상세 그리드 데이터(+표시용)
  const insrncParams = useMemo(() => {
    if (!selectedRow) return undefined
    return {
      endpoint: '/ilp/sqa/tx/getAllDutyInsrSbscInfo',
      vhclNo: selectedRow.vhclNo,
      ctpvCd: formParams.ctpvCd,
      locgovCd: formParams.locgovCd,
      page: 0,
      size: 10,
    }
  }, [selectedRow?.vhclNo, formParams.ctpvCd, formParams.locgovCd])

  const qualfParams = useMemo(() => {
    if (!selectedRow) return undefined
    return {
      endpoint: '/ilp/sqa/tx/getAllDdpsQualfInfo',
      vonrRrno: selectedRow.vonrRrno,
      vhclNo: selectedRow.vhclNo,
      page: 1,
      size: 10,
    }
  }, [selectedRow?.vonrRrno, selectedRow?.vhclNo])

  const { rows: insrncRows, loading: insrncLoading } = useInsrncJoinInfo(insrncParams, { enabled: !!insrncParams })
  const { rows: qualfRows,  loading: qualfLoading  } = useQualfInfo(qualfParams,    { enabled: !!qualfParams })

  const [insrncViewRows, setInsrncViewRows] = useState<any[]>([])
  const [qualfViewRows,  setQualfViewRows]  = useState<any[]>([])

  useEffect(() => {
  // 날짜 분석이 적용된 동안에는 훅 리페치가 와도 덮어쓰지 않음
    if (!analysisD8) setInsrncViewRows(insrncRows ?? []);
  }, [insrncRows, analysisD8]);

  useEffect(() => {
    if (!analysisD8) setQualfViewRows(qualfRows ?? []);
  }, [qualfRows, analysisD8]);

  // 공통 초기화
  const resetDetail = useCallback(() => {
    setSelectedIndex(-1)
    setSelectedKeys([])
    setInsrncViewRows([])
    setQualfViewRows([])
    setMainHighlightIndex(-1)
    setAnalysisD8(null)
  }, [])
  const clearDetailMarks = useCallback(() => {
    setInsrncViewRows(insrncRows ?? [])
    setQualfViewRows(qualfRows ?? [])
    setMainHighlightIndex(-1)
  }, [insrncRows, qualfRows])

  // 메인 목록 조회
  const fetchMain = useCallback(
    async (qp: ListSearch) => {
      clearDetailMarks()
      
      if (isLogv) {
        if (!qp.ctpvCd) return alert('시도를 선택해주세요.')
        if (!qp.locgovCd) return alert('관할관청을 선택해주세요.')
      }
      if (!qp.vhclNo) return alert('차량번호를 입력해주세요')

      setLoading(true)
      try {
        const endpoint =
          `/ilp/sqa/tx/getAllDdpsQualfInfo?page=${qp.page}&size=${qp.size}` +
          `${qp.ctpvCd ? `&ctpvCd=${qp.ctpvCd}` : ''}` +
          `${qp.locgovCd ? `&locgovCd=${qp.locgovCd}` : ''}` +
          `${qp.vhclNo ? `&vhclNo=${qp.vhclNo}` : ''}` +
          `${qp.vonrRrno ? '&vonrRrno=' + qp.vonrRrno : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
        if (response?.resultType === 'success' && response.data) {
          setRows(response.data.content ?? [])
          setTotalRows(response.data.totalElements ?? 0)
          setPageable({
            pageNumber: (response.data.pageable?.pageNumber ?? 0) + 1,
            pageSize: response.data.pageable?.pageSize ?? qp.size,
            totalPages: response.data.totalPages ?? 1,
          })
        } else {
          setRows([]); setTotalRows(0); setPageable({ pageNumber: 1, pageSize: qp.size, totalPages: 1 })
        }
      } catch (e) {
        console.error(e)
        setRows([]); setTotalRows(0); setPageable({ pageNumber: 1, pageSize: qp.size, totalPages: 1 })
      } finally {
        setLoading(false)
      }
    },
    [clearDetailMarks],
  )

  // 검색 실행
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault()
    resetDetail()
    const qp: ListSearch = { ...formParams, page: 1, size: formParams.size || 10 }
    setQueryParams(qp)
    fetchMain(qp)
  }

  // 검색 후 첫 행 자동 선택
  useEffect(() => {
    if (rows.length === 0) { resetDetail(); return }
    if (selectedIndex === -1) {
      setSelectedIndex(0)
      setSelectedKeys(['tr0'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  // 체크 → 단일 선택 동기화
  useEffect(() => {
    if (!selectedKeys?.length) return
    const lastKey = selectedKeys[selectedKeys.length - 1]
    const idx = Number(String(lastKey).replace('tr', ''))
    if (!Number.isFinite(idx) || !rows[idx]) return
    if (selectedIndex !== idx) {
      setSelectedIndex(idx)
      const targetKey = `tr${idx}`
      if (selectedKeys.length !== 1 || selectedKeys[0] !== targetKey) setSelectedKeys([targetKey])
    }
  }, [selectedKeys, rows, selectedIndex])

  // 메인 페이징
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    if (!queryParams) return alert('검색 후 페이지를 이동할 수 있습니다.')
    resetDetail()
    const next = { ...queryParams, page, size: pageSize }
    setQueryParams(next)
    fetchMain(next)
  }

  // 분석 기간 모달 열기
  const handleAnlsPrdModal = () => {
    dispatch(setScopeKey(''))

    if (!queryParams) return alert('먼저 검색을 수행해주세요.')
    if (!selectedKeys || selectedKeys.length !== 1) return alert('분석할 차량을 1건 선택해주세요.')
    const idx = Number(String(selectedKeys[0]).replace('tr', ''))
    const row = rows[idx]
    if (!row?.vhclNo) return alert('선택한 행의 차량번호를 확인할 수 없습니다.')
    setSelectedIndex(idx)
    dispatch(openAnlsPrdModal({ selectedVhclNo: row.vhclNo, selectedRrno: (row.vonrRrno || ''), showModes: ['date', 'period'], scopeKey: PAGE_SCOPE }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    const nextValue =
      name === 'vonrRrno'
        ? String(value).replace(/\D/g, '') // 주민번호는 숫자만
        : value

    setFormParams((prev) => ({ ...prev, [name]: nextValue }))
  }

  const handleRowClick = (_row: Row, index?: number) => {
    if (typeof index !== 'number') return
    if (selectedIndex === index) return
    clearDetailMarks()
    setSelectedIndex(index)
    const key = `tr${index}`
    setSelectedKeys((prev) => (prev.length === 1 && prev[0] === key ? prev : [key]))
  }

  /* ───────── 분석 적용 (상세 그리드 마킹 + 메인 하이라이트 조건) ───────── */
  const lastAppliedRef = useRef(0)
  useEffect(() => {
    if (scopeKey !== PAGE_SCOPE) return
    const t = applyFilterTrigger
    if (!queryParams || t <= 0 || lastAppliedRef.current === t) return
    lastAppliedRef.current = t

    if (!selectedVhclNo) return

    const plate = normPlate(selectedVhclNo)
    const mains = rows.map((r, i) => ({ row: r, idx: i })).filter(({ row }) => normPlate(row.vhclNo) === plate)
    if (!mains.length) {
      alert(messageConfig?.noTargetMsg ?? '입력하신 기준으로 분석 가능한 대상이 없습니다.')
      dispatch(closeAnlsPrdModal())
      return
    }

    if (analysisMode === 'date') {
      const d8 = toYmd8(analysisDate)
      if (!d8) { dispatch(closeAnlsPrdModal()); return }

      // 동일 차량 중 가장 최신 행 선택(기존 유지)
      const picked = (() => {
        const all = mains.slice().sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
        return all[all.length - 1]!
      })()
      setSelectedIndex(picked.idx);

      // 훅 덮어쓰기 방지: 날짜 분석 시작 표시를 먼저 켠다
      setAnalysisD8(d8);

      // 날짜 모드일 때만: 분석 API 응답으로 상세 그리드를 덮어쓰기 시도
      (async () => {
        try {
            const res = await callAnalyzeBs({
              mode: 'DATE',
              vhclNo: picked.row.vhclNo!,
              ctpvCd: formParams.ctpvCd,
              locgovCd: formParams.locgovCd,
              vonrRrno: picked.row.vonrRrno ?? undefined,
              dateYmd: d8,
            });

            // ───────────────────────── res가 온 경우 ─────────────────────────
            if (res) {
              // 1) 조회 결과가 아예 없는 경우 → 즉시 알림 후 종료
              const totalRes = (res.insurance?.length ?? 0) + (res.qualf?.length ?? 0);
              if (totalRes === 0) {
                dispatch(closeAnlsPrdModal());
                alert(messageConfig?.noTargetMsg ?? '입력하신 기준으로 분석 가능한 대상이 없습니다.');
                return;
              }

              // 2) 뷰 데이터 만들기 (의무/자격)
              const insRows = (res.insurance ?? []).map((raw, i) => {
                const r = normalizeInsRow(raw);
                const src = getSrc(raw);
                const isFH = src === 'FH';
                const reg8 = toYmd8(r.regDt);
                const t1OK = inPeriodStrict(d8, r.twdpsn1EraYmd, r.twdpsn1EotYmd);
                const t2OK = inPeriodStrict(d8, r.twdpsn2EraYmd, r.twdpsn2EotYmd);
                const sOK  = inPeriodStrict(d8, r.sbsttEraYmd,   r.sbsttEotYmd);
                return {
                  id: raw.id ?? raw.SN ?? raw.sn ?? r.insrncCtrtNo ?? raw.INSRNC_CTRT_NO ?? i,
                  ...r,
                  __ins_fh: isFH,
                  __ins_reg: isFH || !(reg8 && cmp(reg8, d8) <= 0),
                  __ins_mdf: isFH,
                  __ins_t1: !t1OK,
                  __ins_t2: !t2OK,
                  __ins_s:  !sOK,
                };
              });

              const main = picked?.row ?? selectedRow;
              const qRows = (res.qualf ?? []).map((raw, i) => {
                const r = normalizeQualfRow(raw, main);
                const src = getSrc(r);
                const isFH = src === 'FH';
                const k8   = toYmd8(r.kotsaRegDt)        ?? '99991231';
                const acq8 = toYmd8(r.taxiQlfcAcqsYmd)    ?? '99991231';
                const rtr8 = toYmd8(r.taxiQlfcRtrcnYmd)   ?? '99991231';
                const acquired = String(r?.taxiQlfcSttsNm ?? '').trim() === '취득';
                return {
                  id: raw.id ?? r.taxiQlfcNo ?? r.hstrySn ?? i,
                  ...r,
                  __ql_fh:   isFH,
                  __ql_kotsa: isFH || cmp(k8, d8) > 0,     // regDt가 d8 이후면 미유효
                  __ql_sts:   isFH || !acquired,           // 상태 '취득' 아니면 미유효
                  __ql_acq:   isFH || cmp(d8, acq8) < 0,   // 취득 전이면 미유효
                  __ql_rtr:   isFH || cmp(d8, rtr8) > 0,   // 취소 이후면 미유효
                  __ql_mdf:   isFH,                        // (셀 강조용) mdfcnDt 빨강
                };
              });

              // 3) 먼저 뷰 교체
              setInsrncViewRows(insRows);
              setQualfViewRows(qRows);

              // 4) 메인 하이라이트 계산
              const okIns = (res.insurance ?? []).some((r) => {
                if (getSrc(r) === 'FH') return false;
                const reg8 = toYmd8LooseFromKeys(r, ['regDt','REG_DT']);
                if (!(reg8 && cmp(reg8, d8) <= 0)) return false;
                const t1OK = inPeriodStrict(d8, firstDefined(r,['twdpsn1EraYmd','TWDPSN_1_ERA_YMD','T1_FROM']),
                                                firstDefined(r,['twdpsn1EotYmd','TWDPSN_1_EOT_YMD','T1_TO']));
                const t2OK = inPeriodStrict(d8, firstDefined(r,['twdpsn2EraYmd','TWDPSN_2_ERA_YMD','T2_FROM']),
                                                firstDefined(r,['twdpsn2EotYmd','TWDPSN_2_EOT_YMD','T2_TO']));
                const sOK  = inPeriodStrict(d8, firstDefined(r,['sbsttEraYmd','SBSTT_ERA_YMD','S_FROM']),
                                                firstDefined(r,['sbsttEotYmd','SBSTT_EOT_YMD','S_TO']));
                return t1OK || t2OK || sOK;
              });

              const okQ = (res.qualf ?? []).some((r) => {
                // FH 행은 유효 후보에서 제외
                if (getSrc(r) === 'FH') return false;
                const k8   = toYmd8LooseFromKeys(r, ['kotsaRegDt','KOTSA_REG_DT','KOTSA_REG_DT_N']);
                if (!(k8 && cmp(k8, d8) <= 0)) return false; // KOTSA 등록일 선행조건
                const acq8 = toYmd8LooseFromKeys(r, ['taxiQlfcAcqsYmd','TAXI_QLFC_ACQS_YMD','ACQ_DT']);
                const rtr8 = toYmd8LooseFromKeys(r, ['taxiQlfcRtrcnYmd','TAXI_QLFC_RTRCN_YMD','RTR_DT']) ?? '99991231';
                const inRangeQ = !!acq8 && cmp(acq8, d8) <= 0 && cmp(d8, rtr8) <= 0;
                const acquired = String(r?.taxiQlfcSttsNm ?? r?.TAXI_QLFC_STTS_NM ?? '').trim() === '취득';
                return inRangeQ && acquired;
              });

              setMainHighlightIndex(okIns || okQ ? picked.idx : -1);
              setAnalysisD8(d8);
              dispatch(closeAnlsPrdModal());

              return;
            }

            // ───────────────────────── res가 없어서 폴백(훅 데이터) ─────────────────────────
            const analyzable = hasAnyAnalyzableDetail(insrncRows ?? [], qualfRows ?? [], d8);

            // A) 훅 데이터도 없음 → 즉시 알림 후 종료
            if (!analyzable) {
              dispatch(closeAnlsPrdModal());
              alert(messageConfig?.noTargetMsg ?? '입력하신 기준으로 분석 가능한 대상이 없습니다.');
              return;
            }

            // B) 훅 데이터 있음 → 뷰 먼저 교체하고, 마지막에 유효여부 알림
            const newIns = (insrncRows ?? []).map((r: AnyRow) => {
              const reg8 = toYmd8LooseFromKeys(r, ['regDt']);
              const t1OK = within(d8, r?.twdpsn1EraYmd, r?.twdpsn1EotYmd);
              const t2OK = within(d8, r?.twdpsn2EraYmd, r?.twdpsn2EotYmd);
              const sOK  = within(d8, r?.sbsttEraYmd,   r?.sbsttEotYmd);
              return { ...r, __ins_reg: !(reg8 && cmp(reg8, d8) <= 0), __ins_t1: !t1OK, __ins_t2: !t2OK, __ins_s: !sOK };
            });
            const newQlf = (qualfRows ?? []).map((r: AnyRow) => {
              const acquired = String(r?.taxiQlfcSttsNm ?? '').trim() === '취득';
              const k8   = toYmd8LooseFromKeys(r, ['kotsaRegDt'])      ?? '99991231';
              const acq8 = toYmd8LooseFromKeys(r, ['taxiQlfcAcqsYmd'])  ?? '99991231';
              const rtr8 = toYmd8LooseFromKeys(r, ['taxiQlfcRtrcnYmd']) ?? '99991231';
              return { ...r,
                __ql_kotsa: cmp(k8,  d8) > 0,
                __ql_sts:   !acquired,
                __ql_acq:   cmp(d8,  acq8) < 0,
                __ql_rtr:   cmp(d8,  rtr8) > 0,
              };
            });

            setInsrncViewRows(newIns);
            setQualfViewRows(newQlf);

            const highlight = anyDetailValidForDate(insrncRows ?? [], qualfRows ?? [], d8);
            setMainHighlightIndex(highlight ? picked.idx : -1);
            setAnalysisD8(d8);
            dispatch(closeAnlsPrdModal());

            if (isMainInvalidForDate(picked.row, d8)) {
              setTimeout(() => alert('입력하신 기준으로 유효한 수급자격 상태가 아닙니다.'), 0);
            }
          } catch (e) {
            console.error(e);
            dispatch(closeAnlsPrdModal());
          }
        })();

      return
    }

    // PERIOD
    if (analysisMode === 'period') {
      const f8 = toYmd8(analysisFrom)
      const t8 = toYmd8(analysisTo)
      if (!f8 || !t8) return

      dispatch(setAnlsInvalidDays([]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilterTrigger, scopeKey])

  const mainRowsDecorated = useMemo(() => {
    const Blue = (txt: string) => <span style={{ color: '#1976d2', fontWeight: 600 }}>{txt}</span>
    const Red  = (txt: string) => <span style={{ color: '#d32f2f', fontWeight: 600 }}>{txt}</span>

    const withFlags = rows.map((r, i) => {
      const base: any = { ...r }

      // 1) 기본(분석일 없음): 차량상태만 빨간표시
      let markRed = String(r.vhclSttsNm ?? r.vhclSttsCdNm ?? '').trim() !== '정상'

      // 2) 분석일 있을 때: 차량상태만 반영(요구사항) 유지
      if (analysisD8) {
        const { badVhcl } = splitInvalidReasons(r, analysisD8)
        markRed = badVhcl
      }
      base.__mark_s1 = markRed

      if (analysisD8) {
        // 보험 유효/미유효는 상세행 기반(분석으로 갈아낀 뷰가 있으면 그걸 우선)
        const insSrc = (insrncViewRows?.length ? insrncViewRows : insrncRows) ?? []
        const qlfSrc = (qualfViewRows?.length  ? qualfViewRows  : qualfRows)  ?? []

        if (i === selectedIndex) {
          // 보험: regDt ≤ d8 후보 중 하나라도 각 담보 포함되면 "유효"
          const eligibleIns = insSrc.filter(ir => {
            if (isFH(ir)) return false;  // FH 제외
            const reg8 = toYmd8(ir.regDt)
            return !!reg8 && cmp(reg8, analysisD8) <= 0
          })
          const t1OK = eligibleIns.some(ir => inPeriodStrict(analysisD8, ir.twdpsn1EraYmd, ir.twdpsn1EotYmd))
          const t2OK = eligibleIns.some(ir => inPeriodStrict(analysisD8, ir.twdpsn2EraYmd, ir.twdpsn2EotYmd))
          const sOK  = eligibleIns.some(ir => inPeriodStrict(analysisD8, ir.sbsttEraYmd,   ir.sbsttEotYmd))

          base.twdpsn1SeNmAnls = t1OK ? Blue('유효') : Red('미유효')
          base.twdpsn2SeNmAnls = t2OK ? Blue('유효') : Red('미유효')
          base.sbsttNmAnls     = sOK  ? Blue('유효') : Red('미유효')
          
          // 운수종사자: 상세행 전체로 유효 판단 (KOTSA_REG_DT ≤ d8 AND ACQS ≤ d8 ≤ RTR AND 상태=취득)
          const taxiOK = istaxiValidOnDate(analysisD8, qlfSrc)
          base.taxiQlfcSttsNmAnls = taxiOK ? Blue('유효') : Red('미유효')

        } else {
          base.twdpsn1SeNmAnls = base.twdpsn2SeNmAnls = base.sbsttNmAnls = base.taxiQlfcSttsNmAnls = null
        }

      }

      return base
    })

    return withFlags
    //  상세배열/선택 인덱스도 의존성에 포함해야 최신 반영됨
  }, [rows, mainHighlightIndex, analysisD8, selectedIndex, insrncRows, qualfRows, insrncViewRows, qualfViewRows])

  useEffect(() => {
    if (!analysisD8) setInsrncViewRows(insrncRows ?? []);
  }, [insrncRows, analysisD8]);

  // 엑셀 생성만 담당하는 함수
  const doExportExcel = useCallback(() => {
    // 1) 체크열 제외
    const exportHeads = (sqaTxHc as any).filter((h: any) => h.id !== 'check') // chk 제외

    // 2) sqaTrHc의 group 값을 그대로 사용 (없으면 단독 컬럼 → 세로 병합)
    const groupHeaders = exportHeads.map((h: any) => h.group ?? null)

    // 3) 내보내기
    exportGridToXlsx({
      headCells: exportHeads,
      rows: mainRowsDecorated,                   // 상단 그리드 데이터만
      filename: '수급자격_종합분석_택시.xlsx',      // 고정 파일명
      sheetName: '택시-수급자격',
      groupHeaders,  //2행 그리드 옵션 
    })
  }, [mainRowsDecorated])

  //엑셀저장
  const handleExcel = useCallback(() => {
    if (!mainRowsDecorated?.length) {
      alert('엑셀로 내보낼 데이터가 없습니다. 먼저 검색을 수행하세요.');
      return;
    }

    // 분석 여부 확인
    if (!analysisD8) {
      const ok = confirm('분석 결과가 적용되지 않았습니다. 현재 조회 데이터로 내보낼까요?');
      if (!ok) return;
    }

    // 여기서 바로 export 하지 않고, "사유 모달"만 오픈
    excelRsnModalOpen({
      endpoint: '', // 서버 호출이 필요 없으면 빈 문자열이거나 dummy
      name: '수급자격_종합분석_택시',
      mode: 'client',
      privacyObj: {
        rrnoInclYn: 'Y',      // 주민번호 포함
        cardNoInclYn: 'N',
        vhclNoInclYn: 'Y',    // 차량번호 포함
        flnmInclYn: 'N',
        actnoInclYn: 'N',
        brnoInclYn: 'N',      
        telnoInclYn: 'N',
        addrInclYn: 'N',
        emlAddrInclYn: 'N',
        ipAddrInclYn: 'N',
      },
      onConfirm: () => {
        // 모달에서 확인 눌렀을 때 진짜 엑셀 생성
        doExportExcel()
      },
    })
  }, [mainRowsDecorated, analysisD8, doExportExcel])
  

  return (
    <PageContainer title="수급자격 종합분석" description="수급자격 종합분석 페이지">
      {/* 검색영역 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect width="70%" pValue={formParams.ctpvCd ?? ''} htmlFor="sch-ctpv" handleChange={handleSearchChange} />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov">
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect width="70%" ctpvCd={formParams.ctpvCd ?? ''} pValue={formParams.locgovCd ?? ''} handleChange={handleSearchChange} htmlFor="sch-locgov" />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                <span className="required-text">*</span>차량번호
              </CustomFormLabel>
              <CustomTextField name="vhclNo" value={(formParams.vhclNo as string) ?? ''} onChange={handleSearchChange} type="text" id="ft-vhclNo" fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vonrRrno">
                주민등록번호
              </CustomFormLabel>
              <CustomTextField name="vonrRrno" value={formParams.vonrRrno ?? ''} onChange={handleSearchChange} type="text" id="ft-vonrRrno" fullWidth />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">검색</Button>
            <Button type="button" onClick={handleAnlsPrdModal} variant="contained" color="secondary">분석</Button>
            <Button type="button" onClick={handleExcel} variant="contained" color="success">엑셀</Button>
          </div>
        </Box>
      </Box>

      {/* 메인 테이블 */}
      <Box>
        <TableDataGrid
          headCells={sqaTxHc}
          selectedRowIndex={selectedIndex}
          rows={mainRowsDecorated}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging
          cursor
          caption="택시-수급자격 종합분석 조회 목록"
          oneCheck
          onSelectedKeysChange={(keys: string[]) => setSelectedKeys(keys)}
          selectedKeys={selectedKeys}
        />
      </Box>

      {/* 상세 영역 시작 - 의무보험 가입 정보 */}
      <>
        {selectedRow && selectedIndex > -1 && (
          <BlankCard className="contents-card" title="의무보험 가입 정보">
            <TableDataGrid
              key={`ins-${analysisD8 ?? 'none'}`}             // 분석 모드 전환시 강제 리렌더
              headCells={sqaInsrncCmHC}
              rows={insrncViewRows}
              loading={analysisD8 ? false : insrncLoading}     // 분석 결과 표시 중엔 로딩 끔
              caption="의무보험 가입 정보 조회"
            />
          </BlankCard>
        )}
      </>
      {/* 상세 영역 시작 - 운수종사자정보 */}
      <>
        {selectedRow && selectedIndex > -1 && (
          <BlankCard className="contents-card" title="운수종사자정보">
            <TableDataGrid
              key={`qlf-${analysisD8 ?? 'none'}`}             // 강제 리렌더
              headCells={sqaTransprtTxHc}
              rows={qualfViewRows}
              loading={analysisD8 ? false : qualfLoading}
              caption="운수종사자정보 조회"
            />
          </BlankCard>
        )}
      </>
      {/* 상세 영역 끝 */}

      {/* 분석기간 모달 */}
      {anpModalOpen ? <AnlsPrdModal /> : <></>}
    </PageContainer>
  )
}

export default function TxPage() {
  return <DataList />
}
