'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import { Pageable2 } from 'table'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getUserInfo } from '@/utils/fsms/utils'
import {
  bsTQAHeadCells,
  hisBsTQAHeadCells,
} from '@/utils/fsms/ilp/headCells'

import { useDispatch } from '@/store/hooks'
import { useSelector as useReduxSelector, shallowEqual } from 'react-redux'
import type { AppState } from '@/store/store'
import AnlsPrdModal from '@/app/components/ilp/popup/AnlsPrdModal'
import { openAnlsPrdModal, setAnlsInvalidDays, setScopeKey } from '@/store/popup/ilp/AnlsPrdSlice'

// ───────────────────────────── 타입 ─────────────────────────────
type ListSearch = {
  page: number
  size: number
  ctpvCd?: string
  locgovCd?: string
  vhclNo?: string
  vonrRrno?: string
}

interface Row {
  locgovCd?: string // 시도명+관할관청
  vhclNo?: string // 차량번호
  vonrRrno?: string // 주민등록번호
  vonrRrnoS?: string // 주민등록번호(별표)
  vonrNm?: string // 소유자명
  vhclPsnCdNm?: string // 소유구분
  vhclSttsCdNm?: string // 차량상태
  carRegDt?: string // 차량등록일자
  sttsCd?: string // 운수종사상태코드
  busQlfcNo?: string // 버스자격번호
  busQlfcSttsNm?: string // 자격보유여부(상태명)
  busQlfcSttsCdNm?: string // 자격보유여부(상태코드명)
  busQlfcAcqsYmd?: string // 버스자격취득일자(ACQ_DT)
  busQlfcRtrcnYmd?: string // 버스자격취소일자(RTR_DT)
  kotsaRgtrId?: string // 등록자아이디
  kotsaRegDt?: string // 등록일시
  kotsaMdfrId?: string // 수정자아이디
  kotsaMdfcnDt?: string // 수정일시
  hstrySn?: string // 순번
  sn?: number
  SRC?: 'M' | 'H' | string // 데이터 출처(메인/히스토리 표기 가능)
  chkVal?: 'R' | 'V' | string
  color?: string
  [key: string]: any
}

// ───────────────────────────── utils ─────────────────────────────
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
const overlap = (a1?: unknown, a2?: unknown, b1?: unknown, b2?: unknown) => {
  const A1 = toYmd8(a1) ?? '00000101'
  const A2 = toYmd8(a2) ?? '99991231'
  const B1 = toYmd8(b1) ?? '00000101'
  const B2 = toYmd8(b2) ?? '99991231'
  return cmp(A1, B2) <= 0 && cmp(B1, A2) <= 0
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

// ───── 메인그리드 전용(날짜): kotsaRegDt 이상(하한)만 만족하도록 선택 (M 로직과 합치)
const pickRowForDateMain = (cands: Array<{ row: Row; idx: number }>, d8: string) => {
  const fits = cands.filter(({ row }) => {
    const reg8 = toYmd8(row.kotsaRegDt) ?? '00000101'
    return cmp(reg8, d8) <= 0
  })
  if (!fits.length) return null
  fits.sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits[fits.length - 1]
}

// ───────── 표시/선택 utils: 데코레이션/피킹/정렬키 ─────────
type FlagPack = {
  t1?: boolean
  t2?: boolean
  s?: boolean
  s1?: boolean
  s2?: boolean
  ql?: { sts?: boolean; acq?: boolean; rtr?: boolean } // [ADD] 원인 마커
}

const decorateRows = (
  rows: Row[],
  highlightIdx: number,
  flags?: FlagPack
) =>
  rows.map((r, i) =>
    i !== highlightIdx
      ? {
          ...r,
          color: undefined,
          __mark_t1: false, __mark_t2: false, __mark_s: false, __mark_s1: false, __mark_s2: false,
          __ql_sts: false, __ql_acq: false, __ql_rtr: false, // [ADD] reset
        }
      : {
          ...r,
          color: '#1976d2',
          __mark_t1: !!flags?.t1, __mark_t2: !!flags?.t2, __mark_s: !!flags?.s, __mark_s1: !!flags?.s1, __mark_s2: !!flags?.s2,
          __ql_sts: !!flags?.ql?.sts,
          __ql_acq: !!flags?.ql?.acq,
          __ql_rtr: !!flags?.ql?.rtr,
        },
  )

// 순번 정렬키: hstrySn 우선, 없으면 sn, 없으면 0
const getOrderSn = (r: Row) => Number((r.hstrySn ?? r.sn ?? 0) as any)

/* === [ADD] 서비스 규칙 유틸 (M/H 윈도우 + 취득/철회) === */

// SRC 판별: 기본값 M
const getSrc = (r: Row): 'M' | 'H' => {
  const v = (r.SRC ?? r.src ?? r.source ?? '').toString().toUpperCase()
  return v === 'H' ? 'H' : 'M'
}

// YYYYMMDD 문자열화
const to8 = (v?: unknown): string | null => toYmd8(v)

// 행 유효구간(Window) 계산
// H: reg~mdf 모두 있어야 함 / M: reg~+∞
const rowWindowForDate = (r: Row): { from8: string; to8: string } | null => {
  const src = getSrc(r)
  const reg8 = to8(r.kotsaRegDt)
  const mdf8 = to8(r.kotsaMdfcnDt)

  if (src === 'H') {
    if (!reg8 || !mdf8) return null
    return { from8: reg8, to8: mdf8 }
  }
  if (!reg8) return null
  return { from8: reg8, to8: '99991231' }
}

// 날짜가 행 유효구간에 포함되는가?
const rowIncludesDate = (r: Row, d8: string) => {
  const win = rowWindowForDate(r)
  return !!win && cmp(win.from8, d8) <= 0 && cmp(d8, win.to8) <= 0
}

// 기간이 행 유효구간과 겹치는가?
const rowOverlapsPeriod = (r: Row, from8: string, to8: string) => {
  const win = rowWindowForDate(r)
  if (!win) return false
  return !(cmp(win.from8, to8) > 0 || cmp(from8, win.to8) > 0)
}

// 날짜 기준 자격 유효(서비스 qlfOK 규칙): STATUS_NM=='취득' && (d>=취득일) && (d<=철회일(or +∞))
const isQlfValidOnDate = (r: Row, d8: string) => {
  const st = String(r.busQlfcSttsNm ?? r.STATUS_NM ?? '').trim()
  if (st !== '취득') return false

  const acq8 = to8(r.busQlfcAcqsYmd ?? r.ACQ_DT)
  const rtr8 = to8(r.busQlfcRtrcnYmd ?? r.RTR_DT) ?? '99991231'

  const afterAcq = !acq8 || cmp(acq8, d8) <= 0 // null이면 하한 없음
  const beforeRtr = cmp(d8, rtr8) <= 0

  return afterAcq && beforeRtr
}

// (기존 간이판정) 상태명만으로 invalid 여부
const isPsnInvalid = (r: Row) => (r.busQlfcSttsNm ?? '').trim() !== '취득'

// [ADD] 날짜(d8) 기준 비유효 원인 마커 계산 (상태/취득/철회)
const getQlfInvalidMarkers = (r: Row, d8: string) => {
  const st = String(r.busQlfcSttsNm ?? r.STATUS_NM ?? '').trim()
  const acq8 = toYmd8(r.busQlfcAcqsYmd ?? r.ACQ_DT)
  const rtr8 = toYmd8(r.busQlfcRtrcnYmd ?? r.RTR_DT)

  const markers = { sts: false, acq: false, rtr: false }
  if (st !== '취득') { markers.sts = true; return markers }
  if (acq8 && cmp(d8, acq8) < 0) markers.acq = true  // d < 취득일 → 취득일만 붉게
  if (rtr8 && cmp(d8, rtr8) > 0) markers.rtr = true  // d > 철회일 → 철회일만 붉게
  return markers
}

// ───────── kotsaRegDt/kotsaMdfcnDt + 서비스 규칙 기반 포함/겹침 판단(픽커) ─────────

// 날짜 기준: 행 유효구간에 "포함"되는 후보 중 순번 최댓값
const pickRowForDate = (cands: Array<{ row: Row; idx: number }>, d8: string) => {
  const fits = cands.filter(({ row }) => rowIncludesDate(row, d8))
  if (!fits.length) return null
  fits.sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits[fits.length - 1]
}

// 기간 기준: 행 유효구간이 기간과 "겹치는" 후보 중 순번 최댓값
const pickRowForPeriod = (cands: Array<{ row: Row; idx: number }>, from8: string, to8: string) => {
  const fits = cands.filter(({ row }) => rowOverlapsPeriod(row, from8, to8))
  if (!fits.length) return null
  fits.sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits[fits.length - 1]
}

// [REPLACE] 날짜 기준 강조/경고: 서비스 규칙 + 원인 마커(상태/취득/철회)
const calcFlagsForDate = (r: Row, d8: string): FlagPack => {
  //const bad = !isQlfValidOnDate(r, d8)
  const ql = getQlfInvalidMarkers(r, d8) // { sts, acq, rtr }
  const s2 = !!(ql.sts || ql.rtr);
  return { t1: false, t2: false, s: false, s1: false, s2, ql }
}

// 기간 내 각 날짜별로, (메인+히스토리)의 "어떤 행"이라도 유효하면 OK → 나머지는 invalidDays
const calcInvalidDaysForPeriodByRows = (rowsAll: Row[], from8: string, to8: string) => {
  const days = listDays(from8, to8) // 'YYYY-MM-DD'
  const invalid: string[] = []
  for (const d of days) {
    const d8 = d.replace(/-/g, '')
    const ok = rowsAll.some(r => rowIncludesDate(r, d8) && isQlfValidOnDate(r, d8))
    if (!ok) invalid.push(d)
  }
  return invalid
}

// 히스토리 "모든 페이지" 수집 (현재 API 모양에 맞춘 단순 반복)
const collectAllHistoryRows = async (vonrRrno: string, totalPages: number): Promise<Row[]> => {
  const acc: Row[] = []
  for (let p = 1; p <= (totalPages || 1); p++) {
    const endpoint = `/ilp/tqa/bs/getAllDdpsQualfHstInfo?${vonrRrno ? '&vonrRrno=' + vonrRrno : ''}`
    try {
      const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      if (res?.resultType === 'success' && res.data) acc.push(...(res.data.content ?? []))
    } catch (e) {
      console.error('collect history page fail:', e)
    }
  }
  return acc
}

// ──────────────────────────── 페이지 컴포넌트 ────────────────────────────
function DataList() {
  const dispatch = useDispatch()
  const userInfoRef = useRef(getUserInfo())
  const isLogv = userInfoRef.current?.roles?.[0] === 'LOGV'

  const {
    applyFilterTrigger,
    selectedVhclNo,
    selectedRrno,
    analysisDate,
    anpModalOpen,
    messageConfig,
    analysisMode,
    analysisFrom,
    analysisTo,
    invalidDays,
    scopeKey,             //추가
  } = useReduxSelector(
    (s: AppState) => ({
      applyFilterTrigger: s.anlsPrdInfo.applyFilterTrigger,
      selectedVhclNo: s.anlsPrdInfo.selectedVhclNo,
      selectedRrno: s.anlsPrdInfo.selectedRrno,
      analysisDate: s.anlsPrdInfo.analysisDate,
      anpModalOpen: s.anlsPrdInfo.anpModalOpen,
      messageConfig: s.anlsPrdInfo.messageConfig,
      analysisMode: s.anlsPrdInfo.analysisMode,
      analysisFrom: s.anlsPrdInfo.analysisFrom,
      analysisTo: s.anlsPrdInfo.analysisTo,
      invalidDays: s.anlsPrdInfo.invalidDays,
      scopeKey: s.anlsPrdInfo.scopeKey,        // 추가
    }),
    shallowEqual,
  )

  // 면허 정보 분석 화면
  const PAGE_SCOPE = 'tqaBsPage';

  const searchParams = useSearchParams()
  const initial = Object.fromEntries(searchParams.entries()) as Record<string, string>

  // 검색 폼 상태
  const [formParams, setFormParams] = useState<ListSearch>({
    page: Number(initial.page ?? 1),
    size: Number(initial.size ?? 10),
    ctpvCd: initial.ctpvCd,
    locgovCd: initial.locgovCd,
    vhclNo: initial.vhclNo,
  })
  const [queryParams, setQueryParams] = useState<ListSearch | null>(null)

  // 메인 그리드 상태
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const selectedRow = rows[selectedIndex]
  const [mainHighlightIndex, setMainHighlightIndex] = useState(-1)

  // 히스토리 그리드 상태
  const [historyRows, setHistoryRows] = useState<Row[]>([])
  const [historyTotalRows, setHistoryTotalRows] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detailPageable, setDetailPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(-1)

  // 체크박스 선택 키
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 알림 1회 보장 플래그
  const invalidAlertShownRef = useRef(0)
  const noTargetShownRef = useRef(0)
  const validAlertShownRef = useRef(0)

  // 붉은 표시 플래그 (타입 확장)
  const [mainFlags, setMainFlags] = useState<FlagPack>({})
  const [histFlags, setHistFlags] = useState<FlagPack>({})

  const comingFromSearchRef = useRef(false)
  const lastHistoryFetchRef = useRef<any>(null)

  // 공통 초기화
  const resetDetail = useCallback(() => {
    setMainHighlightIndex(-1)
    setHistoryHighlightIndex(-1)
    setMainFlags({})
    setHistFlags({})
    invalidAlertShownRef.current = 0
    noTargetShownRef.current = 0
    validAlertShownRef.current = 0

    setSelectedIndex(-1)
    setSelectedKeys([])
    setHistoryRows([])
    setHistoryTotalRows(0)
    setDetailPageable((p) => ({ ...p, pageNumber: 1, totalPages: 1 }))
  }, [])
  const clearHighlights = useCallback(() => {
    setMainHighlightIndex(-1)
    setHistoryHighlightIndex(-1)
    setMainFlags({})
    setHistFlags({})
    invalidAlertShownRef.current = 0
    noTargetShownRef.current = 0
    validAlertShownRef.current = 0
  }, [])

  // 현재 분석 타깃 구성
  type AnalysisTarget =
    | { kind: 'date'; ymd8: string }
    | { kind: 'period'; from8: string; to8: string }
  const getCurrentTarget = (): AnalysisTarget | null => {
    if (analysisMode === 'date') {
      const d8 = toYmd8(analysisDate)
      return d8 ? { kind: 'date', ymd8: d8 } : null
    }
    if (analysisMode === 'period') {
      const f8 = toYmd8(analysisFrom)
      const t8 = toYmd8(analysisTo)
      return f8 && t8 ? { kind: 'period', from8: f8, to8: t8 } : null
    }
    const d8 = toYmd8(analysisDate)
    return d8 ? { kind: 'date', ymd8: d8 } : null
  }

  // 메인 목록 조회
  const fetchMain = useCallback(
    async (qp: ListSearch) => {
      clearHighlights()
      if (isLogv) {
        if (!qp.ctpvCd) return alert('시도를 선택해주세요.')
        if (!qp.locgovCd) return alert('관할관청을 선택해주세요.')
      }
      setLoading(true)
      try {
        const endpoint =
          `/ilp/tqa/bs/getAllDdpsQualfInfo?page=${qp.page}&size=${qp.size}` +
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
          setRows([])
          setTotalRows(0)
          setPageable({ pageNumber: 1, pageSize: qp.size, totalPages: 1 })
        }
      } catch (e) {
        console.error(e)
        setRows([])
        setTotalRows(0)
        setPageable({ pageNumber: 1, pageSize: qp.size, totalPages: 1 })
      } finally {
        setLoading(false)
      }
    },
    [clearHighlights, isLogv],
  )

  const historyInFlightRef = useRef<string | null>(null);
  const lastHistoryKeyRef   = useRef<string | null>(null);
  // 히스토리 조회
  const fetchHistory = useCallback(
    async (page: number, size: number, row?: Row, qp?: ListSearch | null, opts?: { keepHighlight?: boolean }) => {
      if (!row || !qp) return

      if (!opts?.keepHighlight) clearHighlights()

      const effectiveRrno = row.driverVonrRrno || row.vonrRrno || '';
      const key = JSON.stringify({ page, size, vonrRrno: effectiveRrno });

      // 진행 중 중복 방지
      if (historyInFlightRef.current === key) return;

      // 직전 완료와 동일 요청은 스킵
      if (lastHistoryKeyRef.current === key) return;

      historyInFlightRef.current = key;
      
      setHistoryLoading(true)
      try {
        
        const endpoint =
          `/ilp/tqa/bs/getAllDdpsQualfHstInfo?` +
          `${row.vonrRrno ? '&vonrRrno=' + row.vonrRrno : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
        if (response?.resultType === 'success' && response.data) {
          setHistoryRows(response.data.content ?? [])
          setHistoryTotalRows(response.data.totalElements ?? 0)
          setDetailPageable({
            pageNumber: (response.data.pageable?.pageNumber ?? 0) + 1,
            pageSize: response.data.pageable?.pageSize ?? size,
            totalPages: response.data.totalPages ?? 1,
          })
        } else {
          setHistoryRows([])
          setHistoryTotalRows(0)
          setDetailPageable({ pageNumber: 1, pageSize: size, totalPages: 1 })
        }
        lastHistoryFetchRef.current = key
        lastHistoryKeyRef.current = key;       // ✅ 이번 요청을 완료 키로 기록
      } catch (e) {
        console.error(e)
        setHistoryRows([])
        setHistoryTotalRows(0)
        setDetailPageable({ pageNumber: 1, pageSize: size, totalPages: 1 })
      } finally {
        historyInFlightRef.current = null;     // ✅ in-flight 해제
        setHistoryLoading(false)
      }
    },
    [clearHighlights],
  )

  // 검색/페이지 전환/선택 핸들러
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault()
    resetDetail()

    // 검색할 때 선택 인덱스 초기화만
    setSelectedIndex(-1);

    // 히스토리 중복방지 가드도 초기화
    historyInFlightRef.current = null;
    lastHistoryKeyRef.current = null;

    const qp: ListSearch = { ...formParams, page: 1, size: formParams.size || 10 }
    setQueryParams(qp)
    comingFromSearchRef.current = true
    fetchMain(qp)
  }

  useEffect(() => {
    if (rows.length === 0) { resetDetail(); return }

    // 검색에서 온 직후에만 첫행 자동 선택
    if (comingFromSearchRef.current && selectedIndex === -1) {
      setSelectedIndex(0)
      setSelectedKeys(['tr0'])   // 첫 행 체크까지 맞춤
    }
    comingFromSearchRef.current = false
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  useEffect(() => {
    // 체크 해제만 된 경우: 선택은 유지
    if (!selectedKeys?.length) return

    // 체크된(마지막) 행 인덱스 계산
    const lastKey = selectedKeys[selectedKeys.length - 1]
    const idx = Number(String(lastKey).replace('tr', ''))
    if (!Number.isFinite(idx) || !rows[idx]) return

    if (selectedIndex !== idx) {
      // 다른 행을 체크 → 선택 행 변경
      setSelectedIndex(idx)
      // 체크박스도 해당 행 1건으로 고정(해제되는 현상 방지)
      const targetKey = `tr${idx}`
      if (selectedKeys.length !== 1 || selectedKeys[0] !== targetKey) {
        setSelectedKeys([targetKey])
      }
    }
  }, [selectedKeys, rows, selectedIndex])

  const handlePaginationModelChange = (page: number, pageSize: number) => {
    if (!queryParams) return alert('검색 후 페이지를 이동할 수 있습니다.')
    resetDetail()
    const next = { ...queryParams, page, size: pageSize }
    setQueryParams(next)
    fetchMain(next)
  }
  const handleDetailPaginationModelChange = (page: number, pageSize: number) => {
    clearHighlights()
    setDetailPageable((p) => ({ ...p, pageNumber: page, pageSize }))
    fetchHistory(page, pageSize, selectedRow, queryParams)
  }

  const handleAnlsPrdModal = () => {
    dispatch(setScopeKey(''))
    clearHighlights()
    if (!queryParams) return alert('먼저 검색을 수행해주세요.')
    if (!selectedKeys || selectedKeys.length !== 1) return alert('분석할 차량을 1건 선택해주세요.')
    const idx = Number(String(selectedKeys[0]).replace('tr', ''))
    const row = rows[idx]
    if (!row?.vhclNo) return alert('선택한 행의 차량번호를 확인할 수 없습니다.')
    setSelectedIndex(idx)
    
    dispatch(openAnlsPrdModal({ selectedVhclNo: row.vhclNo, selectedRrno: (row.vonrRrno || ''), showModes: ['date', 'period'], scopeKey: PAGE_SCOPE }))
  }

  // 히스토리 다른 페이지 하이라이트 유틸
  const goHistPageAndHighlight = async (
    best: { idx: number; page: number; row: Row },
    apply: (r: Row) => void
  ) => {
    if (best.page !== detailPageable.pageNumber) {
      setDetailPageable((p) => ({ ...p, pageNumber: best.page }))
      await fetchHistory(best.page, detailPageable.pageSize, selectedRow, queryParams, { keepHighlight: true })
    }
    setHistoryHighlightIndex(best.idx)
    apply(best.row)
  }

  // ───────────── 모달 적용 트리거
  const lastAppliedRef = useRef(0)
  useEffect(() => {
    if (scopeKey !== PAGE_SCOPE) return // 내 스코프가 아니면 무시

    const t = applyFilterTrigger
    type PickedHit = { row: Row; idx: number; page: number }
    if (!queryParams || t <= 0 || lastAppliedRef.current === t) return
    lastAppliedRef.current = t

    const target = getCurrentTarget()
    if (!selectedVhclNo || !target) return
    clearHighlights()

    const vh = normPlate(selectedVhclNo)
    const mainPairs = rows.map((r, i) => ({ row: r, idx: i })).filter(({ row }) => normPlate(row.vhclNo) === vh)
    const histPairsLocal = historyRows.map((r, i) => ({ row: r, idx: i }))

    const chooseFromHistoryAllPages = async (
      forDate: boolean,
      d8?: string,
      from8?: string,
      to8?: string,
    ): Promise<PickedHit | null> => {
      let best: PickedHit | null = null

      const check = (list: Row[], page: number) => {
        const cands = list.map((r, i) => ({ row: r, idx: i })).filter(({ row }) => normPlate(row.vhclNo) === vh)
        const picked = forDate ? pickRowForDate(cands, d8!) : pickRowForPeriod(cands, from8!, to8!)
        if (picked) {
          const cand = { ...picked, page }
          if (!best || getOrderSn(cand.row) > getOrderSn(best.row)) best = cand
        }
      }

      const totalPages = detailPageable.totalPages || 1
      for (let p = 1; p <= totalPages; p++) {
        const endpoint =
          `/ilp/tqa/bs/getAllDdpsQualfHstInfo?` +
          `${selectedRow?.vonrRrno ? '&vonrRrno=' + selectedRow.vonrRrno : ''}`

        try {
          const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
          if (response?.resultType === 'success' && response.data) {
            const list: Row[] = response.data.content ?? []
            check(list, p)
          }
        } catch (e) {
          console.error('scan history error:', e)
        }
      }
      return best
    }

    // 기간 invalidDays 계산 적용 헬퍼
    const applyInvalidDaysForPeriod = async (from8: string, to8: string) => {
      const vh = normPlate(selectedVhclNo)
      const mainAll = rows.filter(r => normPlate(r.vhclNo) === vh)
      const histAll = await collectAllHistoryRows(selectedRow?.vonrRrno || '', detailPageable.totalPages || 1)
      const histSame = histAll.filter(r => normPlate(r.vhclNo) === vh)
      const all = [...mainAll, ...histSame]
      const days = calcInvalidDaysForPeriodByRows(all, from8, to8)
      dispatch(setAnlsInvalidDays(days))
    }

    // ───────── 1) 날짜 분석: M은 reg<=d 기준, H는 윈도우 포함 기준
    if (target.kind === 'date') {
      const d8 = target.ymd8

      // 1) 메인 그리드
      const pickedMain = pickRowForDateMain(mainPairs, d8)
      if (pickedMain) {
        setSelectedIndex(pickedMain.idx)
        setMainHighlightIndex(pickedMain.idx)
        const flags = calcFlagsForDate(pickedMain.row, d8)
        setMainFlags(flags)
        if (!isQlfValidOnDate(pickedMain.row, d8)) {
          invalidAlertShownRef.current || alert((invalidAlertShownRef.current = 1, messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.'))
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}는 운수종사자격이 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
        return
      }

      // 2) 히스토리(현재 페이지)
      const pickedLocal = pickRowForDate(histPairsLocal, d8)
      if (pickedLocal) {
        setHistoryHighlightIndex(pickedLocal.idx)
        const flags = calcFlagsForDate(pickedLocal.row, d8)
        setHistFlags(flags)
        if (!isQlfValidOnDate(pickedLocal.row, d8)) {
          invalidAlertShownRef.current || alert((invalidAlertShownRef.current = 1, messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.'))
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}는 운수종사자격이 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
        return
      }

      // 3) 히스토리(모든 페이지): 순번 최대 선택 → 페이지 이동 후 하이라이트
      ;(async () => {
        const best = await chooseFromHistoryAllPages(true, d8)
        if (best) {
          await goHistPageAndHighlight(best, (row) => {
            const flags = calcFlagsForDate(row, d8)
            setHistFlags(flags)
            if (!isQlfValidOnDate(row, d8)) {
              invalidAlertShownRef.current || alert((invalidAlertShownRef.current = 1, messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.'))
            } else {
              if (!validAlertShownRef.current) {
                validAlertShownRef.current = 1
                alert(`입력일자 ${analysisDate}는 운수종사자격이 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
              }
            }
          })
        } else {
          noTargetShownRef.current || alert((noTargetShownRef.current = 1, messageConfig?.noTargetMsg ?? '입력하신 기준으로 분석 가능한 대상이 없습니다.'))
        }
      })()

      return
    }

    // ───────── 2) 기간 분석: kotsaRegDt~kotsaMdfcnDt 겹침 우선 + invalidDays 산출
    if (target.kind === 'period') {
      const { from8, to8 } = target

      // 1) 메인 그리드
      const pickedMain = pickRowForPeriod(mainPairs, from8, to8)
      if (pickedMain) {
        setSelectedIndex(pickedMain.idx)
        setMainHighlightIndex(pickedMain.idx)
        ;(async () => { await applyInvalidDaysForPeriod(from8, to8) })()
        if (isPsnInvalid(pickedMain.row)) {
          invalidAlertShownRef.current || alert((invalidAlertShownRef.current = 1, messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.'))
        }
        return
      }

      // 2) 히스토리(현재 페이지)
      const pickedLocal = pickRowForPeriod(histPairsLocal, from8, to8)
      if (pickedLocal) {
        setHistoryHighlightIndex(pickedLocal.idx)
        ;(async () => { await applyInvalidDaysForPeriod(from8, to8) })()
        if (isPsnInvalid(pickedLocal.row)) {
          invalidAlertShownRef.current || alert((invalidAlertShownRef.current = 1, messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.'))
        }
        return
      }

      // 3) 히스토리(모든 페이지)
      ;(async () => {
        const best = await chooseFromHistoryAllPages(false, undefined, from8, to8)
        if (best) {
          await goHistPageAndHighlight(best, (_row) => {})
          await applyInvalidDaysForPeriod(from8, to8)
        } else {
          // 겹치는 레코드 자체가 없으면 invalidDays는 빈값 → 모달 그래프 미표시
          dispatch(setAnlsInvalidDays([]))
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilterTrigger, scopeKey])

  // 표시용 데코 데이터
  const mainRowsDecorated = useMemo(
    () => decorateRows(rows, mainHighlightIndex, mainFlags),
    [rows, mainHighlightIndex, mainFlags]
  )
  const historyRowsDecorated = useMemo(
    () => decorateRows(historyRows, historyHighlightIndex, histFlags),
    [historyRows, historyHighlightIndex, histFlags]
  )

  // 폼/테이블 핸들러
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
    // 하이라이트 제거 요구사항이 있으므로 선택 시 하이라이트도 제거
    clearHighlights()
    setSelectedIndex(index)   // 행 선택
   
    // 변경: 클릭한 행을 체크 상태로 동기화(단일 선택)
    const key = `tr${index}`
    setSelectedKeys((prev) =>
      prev.length === 1 && prev[0] === key ? prev : [key]
    )
  }

  useEffect(() => {
    if (selectedIndex < 0 || !queryParams) return
    const row = rows[selectedIndex]
    if (!row) return
    
    fetchHistory(
      detailPageable.pageNumber,
      detailPageable.pageSize,
      row,
      queryParams,
      { keepHighlight: false }   // 선택 시 하이라이트 제거
    )
  }, [selectedIndex]) // eslint-disable-line react-hooks-exhaustive-deps

  useEffect(() => {
    // 페이지 진입 시 내 스코프로 맞춰둠(필수는 아님)
    dispatch(setScopeKey(PAGE_SCOPE))
    return () => {
      dispatch(setScopeKey(null))
    }
  }, []) // eslint-disable-line react-hooks-exhaustive-deps

  return (
    <PageContainer title="운수종사자격 분석" description="운수종사자격 분석 페이지">
      {/* 검색영역 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                width="70%"
                pValue={formParams.ctpvCd ?? ''}
                htmlFor="sch-ctpv"
                handleChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov">
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                width="70%"
                ctpvCd={formParams.ctpvCd ?? ''}
                pValue={formParams.locgovCd ?? ''}
                handleChange={handleSearchChange}
                htmlFor="sch-locgov"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                value={(formParams.vhclNo as string) ?? ''}
                onChange={handleSearchChange}
                type="text"
                id="ft-vhclNo"
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vonrRrno"
              >
                주민등록번호
              </CustomFormLabel>
              <CustomTextField
                name="vonrRrno"
                value={formParams.vonrRrno ?? ''}
                onChange={handleSearchChange}
                type="text"
                id="ft-vonrRrno"
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button type="button" onClick={handleAnlsPrdModal} variant="contained" color="secondary">
              분석
            </Button>
          </div>
        </Box>
      </Box>

      {/* 메인 테이블 */}
      <Box>
        <TableDataGrid
          headCells={bsTQAHeadCells}
          selectedRowIndex={selectedIndex}
          rows={mainRowsDecorated}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging={true}
          cursor={true}
          caption="버스-운수종사자격 분석 조회 목록"
          oneCheck={true}
          onSelectedKeysChange={(keys: string[]) => setSelectedKeys(keys)}
          selectedKeys={selectedKeys}
        />
      </Box>

      {/* 상세(이력) 영역 */}
      {selectedRow ? (
        <BlankCard title="운수종사자격 정보 이력" className="contents-card">
          <TableDataGrid
            headCells={hisBsTQAHeadCells}
            rows={historyRowsDecorated}
            totalRows={historyTotalRows}
            loading={historyLoading}
            onRowClick={() => {}}
            onPaginationModelChange={handleDetailPaginationModelChange}
            pageable={detailPageable}
            paging={true}
            caption="운수종사자격 정보 이력 목록 조회"
            selectedRowIndex={historyHighlightIndex}
            cursor={true}
          />
        </BlankCard>
      ) : (
        <></>
      )}

      {/* 분석기간 모달 */}
      {anpModalOpen ? <AnlsPrdModal /> : <></>}
    </PageContainer>
  )
}

export default function BsPage() {
  return <DataList />
}
