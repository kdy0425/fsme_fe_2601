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
import { getUserInfo } from '@/utils/fsms/utils'
import { biaheadCells, hisBiaheadCells } from '@/utils/fsms/ilp/headCells'

import { useDispatch } from '@/store/hooks'
import { useSelector as useReduxSelector, shallowEqual } from 'react-redux'
import type { AppState } from '@/store/store'
import AnlsPrdModal from '@/app/components/ilp/popup/AnlsPrdModal'
import { openAnlsPrdModal, setAnlsInvalidDays, setScopeKey } from '@/store/popup/ilp/AnlsPrdSlice'

/* 공통 모듈 */
import { toYmd8, listDays } from '@/utils/fsms/ilp/validity/dateUtils'
import { evaluateBizOnDate, markBizFlagsForRow, type DateMode } from '@/utils/fsms/ilp/validity/checkers'
import { calcInvalidByDateComposed } from '@/utils/fsms/ilp/validity/engine'

/* ───────────────────────────── 내비게이션 ───────────────────────────── */
const BCrumb = [
  { to: '/', title: 'Home' },
  {
    title: '부정수급분석',
  },
  {
    title: '자격정보분석',
  },
  { to: '/ilp/bia', title: '화물 사업자 정보 분석' },
]

/* ───────────────────────────── 타입 ───────────────────────────── */
type ListSearch = {
  page: number
  size: number
  brno?: string
}

interface Row {
  brno?: string
  vonrBrno?: string
  bzmnSeCdNm?: string
  bzmnSttsCdNm?: string
  prcsYmd?: string
  opbizYmd?: string
  tcbizBgngYmd?: string
  tcbizEndYmd?: string
  clsbizYmd?: string
  bzstatNm?: string
  maiyTpbizNm?: string
  regDt?: string
  mdfcnDt?: string
  hstrySn?: string
  locgovCd?: string
  chkVal?: 'R' | 'V' | string
  color?: string

  // 그리드 붉은표시 플래그
  __bz_sts?: boolean
  __bz_reg?: boolean
  __bz_open?: boolean
  __bz_rest?: boolean

  [key: string]: any
}

/* ───────────────────────────── utils ───────────────────────────── */
const d8toIso = (d8: string) =>
  d8 && d8.length === 8 ? `${d8.slice(0, 4)}-${d8.slice(4, 6)}-${d8.slice(6, 8)}` : d8
const cmp = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1)
const within = (d8: string, from8?: unknown, to8?: unknown) => {
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
const normKey = (v?: string | null): string =>
  (!v ? '' : String(v).replace(/[\s-]/g, '').toUpperCase())

// 휴업 필드 → 공통체커가 기대하는 키로 노멀라이즈
const normalizeBiz = (r: Row) =>
  ({ ...r, restBgngYmd: r.tcbizBgngYmd, restEndYmd: r.tcbizEndYmd })

// 순번 정렬키
const getOrderSn = (r: Row) => Number((r.hstrySn ?? (r as any).sn ?? 0) as any)

/* ───────── 데코레이션 ───────── */
const decorateRows = (
  rows: Row[],
  highlightIdx: number,
  flags?: { bz_sts?: boolean; bz_reg?: boolean; bz_open?: boolean; bz_rest?: boolean },
) =>
  rows.map((r, i) =>
    i !== highlightIdx
      ? { ...r, color: undefined, __bz_sts: false, __bz_reg: false, __bz_open: false, __bz_rest: false }
      : {
          ...r,
          color: '#1976d2',
          __bz_sts: !!flags?.bz_sts,
          __bz_reg: !!flags?.bz_reg,
          __bz_open: !!flags?.bz_open,
          __bz_rest: !!flags?.bz_rest,
        },
  )

/* ───────── 피킹 규칙 ───────── */
// 메인(날짜): regDt ≤ d8 (mdfcnDt 무시)
const pickMainForDate = (cands: Array<{ row: Row; idx: number }>, d8: string) => {
  const fits = cands
    .filter(({ row }) => {
      const reg8 = toYmd8(row.regDt)
      return !!reg8 && cmp(reg8, d8) <= 0
    })
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}
// 히스토리(날짜): regDt ≤ d8 ≤ mdfcnDt
const pickHistForDate = (cands: Array<{ row: Row; idx: number }>, d8: string) => {
  const fits = cands
    .filter(({ row }) => within(d8, row.regDt, row.mdfcnDt))
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}
// 메인(기간): regDt ≤ to8
const pickMainForPeriod = (cands: Array<{ row: Row; idx: number }>, _from8: string, to8: string) => {
  const fits = cands
    .filter(({ row }) => {
      const reg8 = toYmd8(row.regDt)
      return !!reg8 && cmp(reg8, to8) <= 0
    })
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}
// 히스토리(기간): regDt~mdfcnDt 와 겹침
const pickHistForPeriod = (cands: Array<{ row: Row; idx: number }>, from8: string, to8: string) => {
  const fits = cands
    .filter(({ row }) => overlap(row.regDt, row.mdfcnDt, from8, to8))
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}

/* ───────── 단일행 컬럼 붉은표시: markBizFlagsForRow 사용 ───────── */
const BIZ_MODE: DateMode = 'START_TO_REG'
const calcBizFlagsForDate = (r: Row, d8: string) => {
  const flagged = markBizFlagsForRow(d8, normalizeBiz(r), BIZ_MODE) as any
  return {
    bz_sts: !!flagged.__bz_sts,
    bz_reg: !!flagged.__bz_reg,
    bz_open: !!flagged.__bz_open,
    bz_rest: !!flagged.__bz_rest,
  }
}

/* ★ 전체 이력 로딩 */
async function fetchAllHistoryRowsForBrno(
  brno: string,
  pageSize: number,
  totalPages: number,
): Promise<Row[]> {
  const all: Row[] = []
  for (let p = 1; p <= (totalPages || 1); p++) {
    const endpoint = `/ilp/bia/tr/bsnmesntlHst?page=${p}&size=${pageSize}&brno=${brno}`
    try {
      const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      if (res?.resultType === 'success' && res.data?.content) {
        all.push(...(res.data.content as Row[]))
      }
    } catch {}
  }
  return all
}

/* ──────────────────────────── 페이지 컴포넌트 ──────────────────────────── */
function DataList() {
  const dispatch = useDispatch()
  const userInfoRef = useRef(getUserInfo())
  const isLogv = userInfoRef.current?.roles?.[0] === 'LOGV'

  const {
    applyFilterTrigger,
    selectedBrno,
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
      selectedBrno: s.anlsPrdInfo.selectedBrno,
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

  const PAGE_SCOPE = 'biaPage'

  const searchParams = useSearchParams()
  const initial = Object.fromEntries(searchParams.entries()) as Record<string, string>

  // 검색 폼
  const [formParams, setFormParams] = useState<ListSearch>({
    page: Number(initial.page ?? 1),
    size: Number(initial.size ?? 10),
    brno: initial.brno,
  })
  const [queryParams, setQueryParams] = useState<ListSearch | null>(null)

  // 메인 그리드
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const selectedRow = rows[selectedIndex]
  const [mainHighlightIndex, setMainHighlightIndex] = useState(-1)

  // 히스토리 그리드
  const [historyRows, setHistoryRows] = useState<Row[]>([])
  const [historyTotalRows, setHistoryTotalRows] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detailPageable, setDetailPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 50, totalPages: 1 })
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(-1)

  // 체크박스
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 알림 1회
  const invalidAlertShownRef = useRef(0)
  const noTargetShownRef = useRef(0)
  const validAlertShownRef = useRef(0)

  // 붉은표시 플래그
  const [mainFlags, setMainFlags] = useState<{ bz_sts?: boolean; bz_reg?: boolean; bz_open?: boolean; bz_rest?: boolean }>({})
  const [histFlags, setHistFlags] = useState<{ bz_sts?: boolean; bz_reg?: boolean; bz_open?: boolean; bz_rest?: boolean }>({})

  const comingFromSearchRef = useRef(false)

  // 초기화
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

  // 현재 분석 타깃
  type AnalysisTarget = { kind: 'date'; ymd8: string } | { kind: 'period'; from8: string; to8: string }
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

  // 메인 조회
  const fetchMain = useCallback(
    async (qp: ListSearch) => {
      clearHighlights()
      if (!qp.brno) {
        alert('사업자등록번호는 필수 입력값입니다.')
        return
      }
      setLoading(true)
      try {
        const endpoint = `/ilp/bia/tr/bsnmesntlInfo?page=${qp.page}&size=${qp.size}${qp.brno ? '&brno=' + qp.brno : ''}`
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
    [clearHighlights],
  )

  // 히스토리 조회
  const historyInFlightRef = useRef<string | null>(null)
  const lastHistoryKeyRef = useRef<string | null>(null)

  const fetchHistory = useCallback(
    async (page: number, size: number, row?: Row, qp?: ListSearch | null, opts?: { keepHighlight?: boolean }) => {
      if (!row || !qp) return
      if (!opts?.keepHighlight) clearHighlights()

      const key = JSON.stringify({ page, size, brno: row.vonrBrno || row.brno || '' })
      if (historyInFlightRef.current === key) return
      if (lastHistoryKeyRef.current === key) return
      historyInFlightRef.current = key

      setHistoryLoading(true)
      try {
        const endpoint =
          `/ilp/bia/tr/bsnmesntlHst?page=${page}&size=${size}` +
          `${row.vonrBrno ? '&brno=' + row.vonrBrno : row.brno ? '&brno=' + row.brno : ''}`

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
        lastHistoryKeyRef.current = key
      } catch (e) {
        console.error(e)
        setHistoryRows([])
        setHistoryTotalRows(0)
        setDetailPageable({ pageNumber: 1, pageSize: size, totalPages: 1 })
      } finally {
        historyInFlightRef.current = null
        setHistoryLoading(false)
      }
    },
    [clearHighlights],
  )

  // 검색
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault()
    resetDetail()
    setSelectedIndex(-1)
    historyInFlightRef.current = null
    lastHistoryKeyRef.current = null

    const qp: ListSearch = { ...formParams, page: 1, size: formParams.size || 10 }
    setQueryParams(qp)
    comingFromSearchRef.current = true
    fetchMain(qp)
  }

  useEffect(() => {
    if (rows.length === 0) { resetDetail(); return }
    if (comingFromSearchRef.current && selectedIndex === -1) {
      setSelectedIndex(0)
      setSelectedKeys(['tr0'])
    }
    comingFromSearchRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

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
    clearHighlights()
    if (!queryParams) return alert('먼저 검색을 수행해주세요.')
    if (!selectedKeys || selectedKeys.length !== 1) return alert('분석할 대상을 1건 선택해주세요.')
    const idx = Number(String(selectedKeys[0]).replace('tr', ''))
    const row = rows[idx]
    if (!row?.vonrBrno && !row?.brno) return alert('선택한 행의 사업자번호를 확인할 수 없습니다.')
    setSelectedIndex(idx)
    const keyBrno = row.vonrBrno || row.brno!
    dispatch(openAnlsPrdModal({ selectedBrno: keyBrno, showModes: ['date', 'period'], scopeKey: PAGE_SCOPE }))
  }

  // 히스토리 페이지 이동 후 하이라이트
  const goHistPageAndHighlight = async (best: { idx: number; page: number; row: Row }, apply: (r: Row) => void) => {
    if (best.page !== detailPageable.pageNumber) {
      setDetailPageable((p) => ({ ...p, pageNumber: best.page }))
      await fetchHistory(best.page, detailPageable.pageSize, selectedRow, queryParams, { keepHighlight: true })
    }
    setHistoryHighlightIndex(best.idx)
    apply(best.row)
  }

  /* ───────────── 모달 적용 트리거 ───────────── */
  const lastAppliedRef = useRef(0)
  useEffect(() => {
    if (scopeKey !== PAGE_SCOPE) return

    const t = applyFilterTrigger
    type PickedHit = { row: Row; idx: number; page: number }
    if (!queryParams || t <= 0 || lastAppliedRef.current === t) return
    lastAppliedRef.current = t

    const target = getCurrentTarget()
    if (!selectedBrno || !target) return
    clearHighlights()

    const key = normKey(selectedBrno)
    const mainPairs = rows.map((r, i) => ({ row: r, idx: i })).filter(({ row }) => normKey(row.vonrBrno || row.brno) === key)
    const histPairsLocal = historyRows.map((r, i) => ({ row: r, idx: i }))

    const chooseFromHistoryAllPages = async (
      forDate: boolean,
      d8?: string,
      from8?: string,
      to8?: string,
    ): Promise<PickedHit | null> => {
      let best: PickedHit | null = null

      const check = (list: Row[], page: number) => {
        const cands = list.map((r, i) => ({ row: r, idx: i })).filter(({ row }) => normKey(row.vonrBrno || row.brno) === key)
        const picked = forDate ? pickHistForDate(cands, d8!) : pickHistForPeriod(cands, from8!, to8!)
        if (picked) {
          const cand = { ...picked, page }
          if (!best || getOrderSn(cand.row) > getOrderSn(best.row)) best = cand
        }
      }

      const totalPages = detailPageable.totalPages || 1
      const brno = (selectedRow?.vonrBrno || selectedRow?.brno || selectedBrno)
      for (let p = 1; p <= totalPages; p++) {
        const endpoint = `/ilp/bia/tr/bsnmesntlHst?page=${p}&size=${detailPageable.pageSize}${brno ? '&brno=' + brno : ''}`
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

    // 1) 날짜 분석
    if (target.kind === 'date') {
      const d8 = target.ymd8

      const pickedMain = pickMainForDate(mainPairs, d8)
      if (pickedMain) {
        setSelectedIndex(pickedMain.idx)
        setMainHighlightIndex(pickedMain.idx)
        setMainFlags(calcBizFlagsForDate(pickedMain.row, d8))

        const ok = evaluateBizOnDate(d8, [normalizeBiz(pickedMain.row)], BIZ_MODE)
        if (!ok && !invalidAlertShownRef.current) {
          invalidAlertShownRef.current = 1
          alert(messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 상태가 아닙니다.')
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}일은 사업자 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
        return
      }

      const pickedLocal = pickHistForDate(histPairsLocal, d8)
      if (pickedLocal) {
        setHistoryHighlightIndex(pickedLocal.idx)
        setHistFlags(calcBizFlagsForDate(pickedLocal.row, d8))

        const ok = evaluateBizOnDate(d8, [normalizeBiz(pickedLocal.row)], BIZ_MODE)
        if (!ok && !invalidAlertShownRef.current) {
          invalidAlertShownRef.current = 1
          alert(messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 상태가 아닙니다.')
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}일은 사업자 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
        return
      }

      ;(async () => {
        const best = await chooseFromHistoryAllPages(true, d8)
        if (best) {
          await goHistPageAndHighlight(best, (row) => {
            setHistFlags(calcBizFlagsForDate(row, d8))
            const ok = evaluateBizOnDate(d8, [normalizeBiz(row)], BIZ_MODE)
            if (!ok && !invalidAlertShownRef.current) {
              invalidAlertShownRef.current = 1
              alert(messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 상태가 아닙니다.')
            } else {
              if (!validAlertShownRef.current) {
                validAlertShownRef.current = 1
                alert(`입력일자 ${analysisDate}일은 사업자 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
              }
            }
          })
        } else {
          if (!noTargetShownRef.current) {
            noTargetShownRef.current = 1
            alert(messageConfig?.noTargetMsg ?? '입력하신 기준으로 분석 가능한 대상이 없습니다.')
          }
        }
      })()

      return
    }

    // 2) 기간 분석 (정밀 일자별 판정: d8 변환 + 개업일자 게이트 + 공통체커)
    if (target.kind === 'period') {
      const { from8, to8 } = target

      // 하이라이트는 기존 방식 유지(표시 전용)
      const pickedMain = pickMainForPeriod(mainPairs, from8, to8)
      if (pickedMain) {
        setSelectedIndex(pickedMain.idx)
        setMainHighlightIndex(pickedMain.idx)
      } else {
        const pickedLocal = pickHistForPeriod(histPairsLocal, from8, to8)
        if (pickedLocal) setHistoryHighlightIndex(pickedLocal.idx)
      }

      // ★ 전체 이력(모든 페이지) 수집 후 동일 사업자만 사용 → 매일 판정
      // ;(async () => {
      //   const rawKey  = (selectedRow?.vonrBrno || selectedRow?.brno || selectedBrno)!
      //   const keyNorm = normKey(rawKey)

      //   const allH = await fetchAllHistoryRowsForBrno(
      //     rawKey,
      //     detailPageable.pageSize,
      //     detailPageable.totalPages
      //   )

      //   // 메인 + 히스토리 합치고 휴업키 노멀라이즈(restBgngYmd/restEndYmd)
      //   const allRows = [
      //     ...rows.filter(r => normKey(r.vonrBrno || r.brno) === keyNorm),
      //     ...allH.filter(r => normKey(r.vonrBrno || r.brno) === keyNorm),
      //   ].map(normalizeBiz)

      //   // 기간을 일자 리스트(ISO)로 전개
      //   const daysIso = listDays(from8, to8)

      //   // 매일 스냅샷(regDt ≤ d8 ≤ mdfcnDt) + opbizYmd 게이트 후 공통체커 호출
      //   const invalidIso = daysIso.filter((iso) => {
      //     const d8 = toYmd8(iso)!
      //     const effectiveRows = allRows.filter(r => {
      //       const reg8 = toYmd8(r.regDt)
      //       const mdf8 = toYmd8(r.mdfcnDt) ?? '99991231'
      //       const op8  = toYmd8(r.opbizYmd)
      //       return (!!reg8 && cmp(reg8, d8) <= 0 && cmp(d8, mdf8) <= 0) // 스냅샷: regDt ≤ d8 ≤ mdfcnDt
      //             && (!op8 || cmp(op8, d8) <= 0)                       // 개업일자 ≤ d8
      //     })

      //     // 상태=정상 && 휴업기간 아님(notWithin) 등은 공통체커가 처리
      //     return !evaluateBizOnDate(d8, effectiveRows, 'REG_ONLY')
      //   })

      //   // 모달에서 사용할 무효일 목록(ISO)
      //   //dispatch(setAnlsInvalidDays(invalidIso))
      //   dispatch(setAnlsInvalidDays([]))
      // })()

      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilterTrigger, scopeKey])

  // 표시용 데코 데이터
  const mainRowsDecorated = useMemo(
    () => decorateRows(rows, mainHighlightIndex, mainFlags),
    [rows, mainHighlightIndex, mainFlags],
  )
  const historyRowsDecorated = useMemo(
    () => decorateRows(historyRows, historyHighlightIndex, histFlags),
    [historyRows, historyHighlightIndex, histFlags],
  )

  // 폼/테이블 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormParams((prev) => ({ ...prev, [name]: value }))
  }
  const handleRowClick = (_row: Row, index?: number) => {
    if (typeof index !== 'number') return
    if (selectedIndex === index) return
    clearHighlights()
    setSelectedIndex(index)
    const key = `tr${index}`
    setSelectedKeys((prev) => (prev.length === 1 && prev[0] === key ? prev : [key]))
  }

  useEffect(() => {
    if (selectedIndex < 0 || !queryParams) return
    const row = rows[selectedIndex]
    if (!row) return
    fetchHistory(detailPageable.pageNumber, detailPageable.pageSize, row, queryParams, { keepHighlight: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex])

  useEffect(() => {
    dispatch(setScopeKey(PAGE_SCOPE))
    return () => {
      dispatch(setScopeKey(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageContainer title="화물 사업자정보조회" description="화물 사업자정보조회 페이지">
      {/* breadcrumb */}
      <Breadcrumb title="화물 사업자정보조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
              >
                <span className="required-text">*</span>사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                name="brno"
                value={formParams.brno ?? ''}
                onChange={handleSearchChange}
                type="number"
                id="ft-brno"
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            {/* <LoadingBackdrop open={loadingBackdrop} /> */}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAnlsPrdModal} 
            >
              분석
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={biaheadCells}
          selectedRowIndex={selectedIndex}
          rows={mainRowsDecorated}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging={true}
          cursor={true}
          caption="사업자 정보 분석 조회 목록"
          oneCheck={true}
          onSelectedKeysChange={(keys: string[]) => setSelectedKeys(keys)}
          selectedKeys={selectedKeys}   // ✅ 부모 단일 소스
          beforeToggle={async (_row, idx) => {
            if (!queryParams || !rows[idx]) return false
            if (selectedIndex === idx) return true  // ✅ 이미 선택된 경우 재설정 X
            setSelectedIndex(idx)                   // ✅ 선택만, 조회는 useEffect가 1회 수행
            return true
          }}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <>
        {selectedRow ? (
          <>
            <BlankCard title="사업자등록정보 이력">
              <TableDataGrid
                headCells={hisBiaheadCells}
                rows={historyRowsDecorated}
                totalRows={historyTotalRows}
                loading={historyLoading}
                onRowClick={() => {}}
                onPaginationModelChange={handleDetailPaginationModelChange}
                //pageable={detailPageable}
                //paging={true}
                caption="사업자 정보 이력 목록 조회"
                selectedRowIndex={historyHighlightIndex}
                cursor={true}
              />
            </BlankCard>
          </>
        ) : null}
      </>
      {/* 상세 영역 끝 */}
      {/* 분석기간 모달 */}
      {anpModalOpen ? <AnlsPrdModal /> : <></>}
      <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
        <span style={{ color: '#1976d2' }}>■ 유효</span>
        <span style={{ color: '#d32f2f' }}>■ 미유효</span>
      </Box>
    </PageContainer>
  )
}

export default DataList
