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
  liaDrliInfoHeadCells,
  liaHisDrliHeadCells,
} from '@/utils/fsms/ilp/headCells'

import { useDispatch } from '@/store/hooks'
import { useSelector as useReduxSelector, shallowEqual } from 'react-redux'
import type { AppState } from '@/store/store'
import AnlsPrdModal from '@/app/components/ilp/popup/AnlsPrdModal'
import { openAnlsPrdModal, setAnlsInvalidDays, setScopeKey } from '@/store/popup/ilp/AnlsPrdSlice'

/* ───────── 공통 유틸/엔진 ───────── */
import { toYmd8, listDays } from '@/utils/fsms/ilp/validity/dateUtils' // ★ listDays 추가
import { markLicenseFlagsForRow, evaluateLicenseOnDate } from '@/utils/fsms/ilp/validity/checkers'
import { calcInvalidByDateComposed } from '@/utils/fsms/ilp/validity/engine'

// ───────────────────────────── 내비게이션 ─────────────────────────────
const BCrumb = [
  { to: '/', title: 'Home' },
  {
    title: '부정수급분석',
  },
  {
    title: '자격정보분석',
  },
  { to: '/ilp/lia', title: '화물 면허 정보 분석' },
]

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
  locgovCd?: string
  vhclNo?: string
  vonrRrno?: string
  vonrRrnoSecure?: string
  knpaVonrRrno?: string
  knpaVonrRrnoS?: string
  vonrNm?: string
  vhclPsnNm: string
  vhclSttsCdNm?: string
  carRegDt?: string
  driverVonrNm?: string
  driverVonrRrno?: string
  driverVonrRrnoSecure?: string
  ctrtBgngYmd?: string
  ctrtEndYmd?: string
  telno?: string
  driverRegDt?: string
  psnSeNm?: string
  stopBgngYmd?: string
  stopEndYmd?: string
  rtrcnYmd?: string
  knpaRgtrId?: string
  knpaRegDt?: string
  knpaMdfrId?: string
  knpaMdfcnDt?: string
  hstrySn?: string
  chkVal?: 'R' | 'V' | string
  color?: string
  [key: string]: any
}

/* ───────── 헬퍼 ───────── */
const normPlate = (v?: string | null): string =>
  (!v ? '' : String(v).replace(/[\s-]/g, '').toUpperCase())

const le = (a: string, b: string) => a <= b

// 기간 겹침
const overlaps = (a1?: string, a2?: string | null, b1?: string, b2?: string) => {
  const A1 = toYmd8(a1) ?? '00000101'
  const A2 = toYmd8(a2) ?? '99991231'
  const B1 = toYmd8(b1) ?? '00000101'
  const B2 = toYmd8(b2) ?? '99991231'
  return le(A1, B2) && le(B1, A2)
}

// 정렬키
const getOrderSn = (r: Row) => Number((r.hstrySn ?? (r as any).sn ?? 0) as any)

/** ★ 메인 그리드: 등록일(=knpaRegDt) 이상인 것만 선택 (수정일 무시) */
const pickMainForDate = (cands: Array<{ row: Row; idx: number }>, d8: string) => {
  const fits = cands
    .filter(({ row }) => {
      const reg8 = toYmd8(row.knpaRegDt)
      return !!reg8 && le(reg8, d8)
    })
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}

/** ★ 히스토리 그리드: knpaRegDt ≤ d8 ≤ knpaMdfcnDt */
const pickHistForDate = (cands: Array<{ row: Row; idx: number }>, d8: string) => {
  const fits = cands
    .filter(({ row }) => {
      const reg8 = toYmd8(row.knpaRegDt)
      const mdf8 = toYmd8(row.knpaMdfcnDt) ?? '99991231'
      return !!reg8 && le(reg8, d8) && le(d8, mdf8)
    })
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}

/** 메인/히스토리 공통: 기간 겹침 */
const pickForPeriod = (cands: Array<{ row: Row; idx: number }>, from8: string, to8: string) => {
  const fits = cands
    .filter(({ row }) => overlaps(row.knpaRegDt, row.knpaMdfcnDt, from8, to8))
    .sort((a, b) => getOrderSn(a.row) - getOrderSn(b.row))
  return fits.length ? fits[fits.length - 1] : null
}

/** 그리드 요구에 맞춘 플래그 생성: __lc_sts / __lc_reg / __lc_stop */
const calcLcFlagsForDate = (r: Row, d8: string) => {
  const flagged = markLicenseFlagsForRow(d8, r) as any
  return {
    sts: !!flagged.__lc_sts,
    reg: !!flagged.__lc_reg,
    stop: !!flagged.__lc_stop,
  }
}

/* ★ 전체 이력 로딩: 선택한 운전자에 대해 모든 페이지를 모은다 */
async function fetchAllHistoryRowsForRrno(
  rrno: string,
  pageSize: number,
  totalPages: number,
): Promise<Row[]> {
  const all: Row[] = []
  for (let p = 1; p <= (totalPages || 1); p++) {
    const endpoint = `/ilp/lia/tr/drliHst?page=${p}&size=${pageSize}&vonrRrno=${rrno}`
    try {
      const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      if (res?.resultType === 'success' && res.data?.content) {
        all.push(...(res.data.content as Row[]))
      }
    } catch {}
  }
  return all
}

/* ★ 유니크(히스토리 중복 제거용) */
const uniqBy = <T, K extends string | number>(arr: T[], keyFn: (x: T) => K) => {
  const seen = new Set<K>()
  const out: T[] = []
  for (const x of arr) {
    const k = keyFn(x)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(x)
    }
  }
  return out
}

/* ──────────────────────────── 페이지 ──────────────────────────── */
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
    invalidDays,
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
      invalidDays: s.anlsPrdInfo.invalidDays,
      scopeKey: s.anlsPrdInfo.scopeKey,
    }),
    shallowEqual,
  )

  // 면허 정보 분석 화면
  const PAGE_SCOPE = 'liaPage'

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

  // ── ★ 그리드 컬럼용 플래그 상태(__lc_*) ──
  const [mainLcFlags, setMainLcFlags] = useState<{ sts?: boolean; reg?: boolean; stop?: boolean }>({})
  const [histLcFlags, setHistLcFlags] = useState<{ sts?: boolean; reg?: boolean; stop?: boolean }>({})

  const comingFromSearchRef = useRef(false)
  const lastHistoryFetchRef = useRef<any>(null)

  // 초기화
  const resetDetail = useCallback(() => {
    setMainHighlightIndex(-1)
    setHistoryHighlightIndex(-1)
    setMainLcFlags({})
    setHistLcFlags({})
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
    setMainLcFlags({})
    setHistLcFlags({})
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
      if (isLogv) {
        if (!qp.ctpvCd) return alert('시도를 선택해주세요.')
        if (!qp.locgovCd) return alert('관할관청을 선택해주세요.')
      }
      setLoading(true)
      try {
        const endpoint =
          `/ilp/lia/tr/drliInfo?page=${qp.page}&size=${qp.size}` +
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

  const historyInFlightRef = useRef<string | null>(null)
  const lastHistoryKeyRef = useRef<string | null>(null)

  // 히스토리 조회
  const fetchHistory = useCallback(
    async (page: number, size: number, row?: Row, qp?: ListSearch | null, opts?: { keepHighlight?: boolean }) => {
      if (!row || !qp) return
      if (!opts?.keepHighlight) clearHighlights()

      const effectiveRrno = row.driverVonrRrno || row.vonrRrno || ''
      const key = JSON.stringify({ page, size, vonrRrno: effectiveRrno })
      if (historyInFlightRef.current === key) return
      if (lastHistoryKeyRef.current === key) return
      historyInFlightRef.current = key

      setHistoryLoading(true)
      try {
        const endpoint =
          `/ilp/lia/tr/drliHst?page=${page}&size=${size}` +
          `${row.driverVonrRrno ? '&vonrRrno=' + row.driverVonrRrno : '&vonrRrno=' + row.vonrRrno}`

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

  // 검색/페이지/선택 핸들러
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
    if (rows.length === 0) {
      resetDetail()
      return
    }
    if (comingFromSearchRef.current && selectedIndex === -1) {
      setSelectedIndex(0)
      setSelectedKeys(['tr0'])
    }
    comingFromSearchRef.current = false
  }, [rows]) // eslint-disable-line

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
    //dispatch(setScopeKey(''))
    clearHighlights()
    if (!queryParams) return alert('먼저 검색을 수행해주세요.')
    if (!selectedKeys || selectedKeys.length !== 1) return alert('분석할 차량을 1건 선택해주세요.')
    const idx = Number(String(selectedKeys[0]).replace('tr', ''))
    const row = rows[idx]
    if (!row?.vhclNo) return alert('선택한 행의 차량번호를 확인할 수 없습니다.')
    setSelectedIndex(idx)
    dispatch(openAnlsPrdModal({ selectedVhclNo: row.vhclNo, selectedRrno: (row.driverVonrRrno || row.vonrRrno || ''), showModes: ['date', 'period'], scopeKey: PAGE_SCOPE }))
  }

  // 다른 페이지로 이동 후 하이라이트
  const goHistPageAndHighlight = async (best: { idx: number; page: number; row: Row }, apply: (r: Row) => void) => {
    if (best.page !== detailPageable.pageNumber) {
      setDetailPageable((p) => ({ ...p, pageNumber: best.page }))
      await fetchHistory(best.page, detailPageable.pageSize, selectedRow, queryParams, { keepHighlight: true })
    }
    setHistoryHighlightIndex(best.idx)
    apply(best.row)
  }

  // ───────────── 분석 적용 트리거 ─────────────
  const lastAppliedRef = useRef(0)
  useEffect(() => {
    if (scopeKey !== PAGE_SCOPE) return

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
        const picked = forDate ? pickHistForDate(cands, d8!) : pickForPeriod(cands, from8!, to8!)
        if (picked) {
          const cand = { ...picked, page }
          if (!best || getOrderSn(cand.row) > getOrderSn(best.row)) best = cand
        }
      }

      const totalPages = detailPageable.totalPages || 1
      for (let p = 1; p <= totalPages; p++) {
        const endpoint =
          `/ilp/lia/tr/drliHst?page=${p}&size=${detailPageable.pageSize}` +
          `${selectedRow?.driverVonrRrno ? '&vonrRrno=' + selectedRow.driverVonrRrno : '&vonrRrno=' + selectedRow?.vonrRrno}`

        try {
          const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
          if (response?.resultType === 'success' && response.data) {
            const list: Row[] = response.data.content ?? []
            check(list, p)
          }
        } catch (e) {}
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
        setMainLcFlags(calcLcFlagsForDate(pickedMain.row, d8))

        const ok = evaluateLicenseOnDate(d8, [pickedMain.row])
        if (!ok && !invalidAlertShownRef.current) {
          invalidAlertShownRef.current = 1
          alert(messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.')
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}일은 면허 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
        return
      }

      const pickedLocal = pickHistForDate(histPairsLocal, d8)
      if (pickedLocal) {
        setHistoryHighlightIndex(pickedLocal.idx)
        setHistLcFlags(calcLcFlagsForDate(pickedLocal.row, d8))

        const ok = evaluateLicenseOnDate(d8, [pickedLocal.row])
        if (!ok && !invalidAlertShownRef.current) {
          invalidAlertShownRef.current = 1
          alert(messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.')
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}일은 면허 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
        return
      }

      ;(async () => {
        const best = await chooseFromHistoryAllPages(true, d8)
        if (best) {
          await goHistPageAndHighlight(best, (row) => {
            setHistLcFlags(calcLcFlagsForDate(row, d8))
            const ok = evaluateLicenseOnDate(d8, [row])
            if (!ok) {
              if (!invalidAlertShownRef.current) {
                invalidAlertShownRef.current = 1;
                alert(messageConfig?.invalidInsrMsg ?? '입력하신 기준으로 유효한 면허 상태가 아닙니다.');
              }
            } else {
              if (!validAlertShownRef.current) {
                validAlertShownRef.current = 1;
                alert(`입력일자 ${analysisDate}일은 면허 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`);
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

    // 2) 기간 분석  (★ 일자별로 evaluateLicenseOnDate 적용)
    if (target.kind === 'period') {
      const { from8, to8 } = target

      // 하이라이트는 기존 방식 유지
      const pickedMain = pickForPeriod(mainPairs, from8, to8)
      if (pickedMain) {
        setSelectedIndex(pickedMain.idx)
        setMainHighlightIndex(pickedMain.idx)
      } else {
        const pickedLocal = pickForPeriod(histPairsLocal, from8, to8)
        if (pickedLocal) {
          setHistoryHighlightIndex(pickedLocal.idx)
        }
      }

      // ★ 전체 이력(모든 페이지) 수집 후, 차량번호 일치 행만 사용
      // ;(async () => {
      //   const rrno = (selectedRow?.driverVonrRrno || selectedRow?.vonrRrno || '') as string
      //   const allH = await fetchAllHistoryRowsForRrno(rrno, detailPageable.pageSize, detailPageable.totalPages)
      //   const licRowsAll = uniqBy(
      //     // 메인페이지의 동일 차량 행 + 전체 이력 중 동일 차량 행
      //     [
      //       ...rows.filter(r => normPlate(r.vhclNo) === normPlate(selectedVhclNo)),
      //       ...allH.filter(r => normPlate(r.vhclNo) === normPlate(selectedVhclNo)),
      //     ],
      //     r => `${toYmd8(r.knpaRegDt) ?? ''}|${toYmd8(r.knpaMdfcnDt) ?? ''}|${(r.psnSeNm ?? '').trim()}|${toYmd8(r.stopBgngYmd) ?? ''}|${toYmd8(r.stopEndYmd) ?? ''}`
      //   )

      //   // ★ 일자 전개 → 매일 evaluateLicenseOnDate 로 판정
      //   const days = listDays(from8, to8)
      //   const invalid = days.filter(d => !evaluateLicenseOnDate(d, licRowsAll))

      //   // 참고) 엔진을 사용하고 싶다면 아래 한 줄로 대체할 수도 있음:
      //   // const { invalidDays: invalid } = calcInvalidByDateComposed(from8, to8, { vhclSttsNm: '정상' } as any, { lic: licRowsAll }, { license: true, insurance: false, biz: false, qual: false }, {} as any, undefined as any)

      //   dispatch(setAnlsInvalidDays(invalid))
      // })()
      return
    }
  }, [applyFilterTrigger, scopeKey]) // eslint-disable-line

  // ───────── 표시용 데코: __lc_* 플래그를 그리드가 읽도록 주입 ─────────
  const mainRowsDecorated = useMemo(
    () =>
      rows.map((r, i) =>
        i === mainHighlightIndex
          ? { ...r, color: '#1976d2', __lc_sts: !!mainLcFlags.sts, __lc_reg: !!mainLcFlags.reg, __lc_stop: !!mainLcFlags.stop }
          : { ...r, color: undefined, __lc_sts: false, __lc_reg: false, __lc_stop: false },
      ),
    [rows, mainHighlightIndex, mainLcFlags],
  )

  const historyRowsDecorated = useMemo(
    () =>
      historyRows.map((r, i) =>
        i === historyHighlightIndex
          ? { ...r, color: '#1976d2', __lc_sts: !!histLcFlags.sts, __lc_reg: !!histLcFlags.reg, __lc_stop: !!histLcFlags.stop }
          : { ...r, color: undefined, __lc_sts: false, __lc_reg: false, __lc_stop: false },
      ),
    [historyRows, historyHighlightIndex, histLcFlags],
  )

  // 핸들러들
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    const nextValue =
      name === 'vonrRrno'
        ? String(value).replace(/\D/g, '')
        : value

    setFormParams((prev) => ({ ...prev, [name]: nextValue }))
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
  }, [selectedIndex]) // eslint-disable-line

  useEffect(() => {
    dispatch(setScopeKey(PAGE_SCOPE))
    return () => {
      dispatch(setScopeKey(null))
    }
  }, []) // eslint-disable-line

  return (
    <PageContainer title="면허 정보 분석" description="면허 정보 분석 페이지">
      {/* breadcrumb */}
      <Breadcrumb title="면허 정보 분석" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                width="70%"
                pValue={formParams.ctpvCd ?? ''}
                htmlFor={'sch-ctpv'}
                handleChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                width="70%"
                ctpvCd={formParams.ctpvCd}
                pValue={formParams.locgovCd ?? ''}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                value={formParams.vhclNo ?? ''}
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
            {/* <LoadingBackdrop open={loadingBackdrop} /> */}
            <Button type="submit" variant="contained" color="primary">
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
          headCells={liaDrliInfoHeadCells}
          selectedRowIndex={selectedIndex}
          rows={mainRowsDecorated}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging={true}
          cursor={true}
          caption="면허 정보 분석 조회 목록"
          oneCheck={true}
          onSelectedKeysChange={(keys: string[]) => setSelectedKeys(keys)}
          selectedKeys={selectedKeys}   //  부모 단일 소스
          beforeToggle={async (_row, idx) => {
            if (!queryParams || !rows[idx]) return false
            if (selectedIndex === idx) return true  //  이미 선택된 경우 재설정 X
            setSelectedIndex(idx)                   //  선택만, 조회는 useEffect가 1회 수행
            return true
          }}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {/* 상세 영역 시작 */}
      <>
        {selectedRow ? (
          <>
            <BlankCard title="면허 정보 이력"
            className="contents-card" 
            >
              <TableDataGrid
                headCells={liaHisDrliHeadCells}
                rows={historyRowsDecorated}
                totalRows={historyTotalRows}
                loading={historyLoading}
                onRowClick={() => {}}
                onPaginationModelChange={handleDetailPaginationModelChange}
                //pageable={detailPageable}
                //paging={true}
                caption="면허 정보 이력 목록 조회"
                selectedRowIndex={historyHighlightIndex}
                cursor={true}
              />
            </BlankCard>
          </>
        ) : (
          <></>
        )}
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
