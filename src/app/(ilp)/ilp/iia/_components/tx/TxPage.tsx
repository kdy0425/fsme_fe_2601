'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import { Pageable2 } from 'table'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getUserInfo } from '@/utils/fsms/utils'
import {
  iiaCmHc,
  iiaHisCmHc,
} from '@/utils/fsms/ilp/headCells'

import { useDispatch } from '@/store/hooks'
import { useSelector as useReduxSelector, shallowEqual } from 'react-redux'
import type { AppState } from '@/store/store'
import AnlsPrdModal from '@/app/components/ilp/popup/AnlsPrdModal'
import { openAnlsPrdModal, setAnlsInvalidDays, setScopeKey } from '@/store/popup/ilp/AnlsPrdSlice'

/* ───────── 공통 유틸/엔진(공식 모듈만 사용) ───────── */
import { toYmd8, listDays } from '@/utils/fsms/ilp/validity/dateUtils'
import {
  evaluateInsuranceOnDate,
  markInsuranceFlagsForRow,
  type DateMode,
} from '@/utils/fsms/ilp/validity/checkers'
import { calcInvalidByDateComposed } from '@/utils/fsms/ilp/validity/engine'

/* ───────── 타입 ───────── */
type ListSearch = {
  page: number
  size: number
  ctpvCd?: string
  locgovCd?: string
  vhclNo?: string
}

interface Row {
  sn?: string
  locgovCd?: string
  vhclNo?: string
  vonrRrno?: string
  vonrNm?: string
  carSts?: string
  carRegDt?: string
  carOwnNm?: string
  twdpsn1SeNm?: string
  twdpsn1EraYmd?: string
  twdpsn1EotYmd?: string | null
  twdpsn2SeNm?: string
  twdpsn2EraYmd?: string
  twdpsn2EotYmd?: string | null
  sbsttNm?: string
  sbsttEraYmd?: string
  sbsttEotYmd?: string | null
  insrncCoNm?: string
  insrncClsSetuNm?: string
  insrncCtrtNo?: string
  etcCn?: string
  rgtrId?: string
  regDt?: string
  mdfcnDt?: string
  insrncSttsCd?: string
  chkVal?: 'R' | 'V' | string
  color?: string
  [key: string]: any
}

/* ───────── 상수 ───────── */
const PAGE_SCOPE = 'iiaTxPage'
const INS_MODE: { insurance: DateMode } = { insurance: 'START_TO_REG' } // (기간 포함 + regDt 게이트)

/* ───────── 보조(공통 util에 의존) ───────── */
// YYYYMMDD 문자열끼리 비교(동일 포맷 전제)
const le = (a: string, b: string) => a <= b

// 번호판 정규화(공백/하이픈 제거, 대문자)
const normPlate = (v?: string | null) =>
  (!v ? '' : String(v).replace(/[\s-]/g, '').toUpperCase())

// 기간 겹침 여부(공통 toYmd8 사용)
const overlaps = (a1?: string, a2?: string | null, b1?: string, b2?: string) => {
  const A1 = toYmd8(a1) ?? '00000101'
  const A2 = toYmd8(a2) ?? '99991231'
  const B1 = toYmd8(b1) ?? '00000101'
  const B2 = toYmd8(b2) ?? '99991231'
  return le(A1, B2) && le(B1, A2)
}

// 메인: regDt ≤ d8 인 것 중 최신(sn 최대)
const pickMainForDate = (pairs: Array<{row: Row; idx: number}>, d8: string) => {
  const cand = pairs
    .filter(({row}) => {
      const reg8 = toYmd8(row.regDt)
      return !!reg8 && le(reg8, d8)
    })
    .sort((a,b) => Number(a.row.sn ?? 0) - Number(b.row.sn ?? 0))
  return cand.length ? cand[cand.length-1] : null
}

// 히스토리: regDt ≤ d8 ≤ mdfcnDt(없으면 ∞) 중 최신
const pickHistForDate = (pairs: Array<{row: Row; idx: number}>, d8: string) => {
  const cand = pairs
    .filter(({row}) => {
      const reg8 = toYmd8(row.regDt)
      const mdf8 = toYmd8(row.mdfcnDt) ?? '99991231'
      return !!reg8 && le(reg8, d8) && le(d8, mdf8)
    })
    .sort((a,b) => Number(a.row.sn ?? 0) - Number(b.row.sn ?? 0))
  return cand.length ? cand[cand.length-1] : null
}

// 메인/히스토리: 기간 겹치는 것 중 최신
const pickForPeriod = (pairs: Array<{row: Row; idx: number}>, from8: string, to8: string) => {
  const cand = pairs
    .filter(({row}) => overlaps(row.regDt, row.mdfcnDt, from8, to8))
    .sort((a,b) => Number(a.row.sn ?? 0) - Number(b.row.sn ?? 0))
  return cand.length ? cand[cand.length-1] : null
}

// 메인 행에 붙일 빨간 표시(CommDataGrid가 __mark_* 읽음)
const toMainMarkFromRow = (d8: string, r: Row) => {
  const flagged = markInsuranceFlagsForRow(d8, r, INS_MODE.insurance)
  return {
    t1: !!flagged.__ins_t1,
    t2: !!flagged.__ins_t2,
    s:  !!flagged.__ins_s,
  }
}

// 하이라이트/컬러 데코
const decorateRows = (
  rows: Row[],
  highlightIdx: number,
  flags?: { t1?: boolean; t2?: boolean; s?: boolean }
) =>
  rows.map((r,i) =>
    i === highlightIdx
      ? { ...r, color: '#1976d2', __mark_t1: !!flags?.t1, __mark_t2: !!flags?.t2, __mark_s: !!flags?.s }
      : { ...r, color: undefined, __mark_t1: false, __mark_t2: false, __mark_s: false }
  )

/* ───────── 페이지 ───────── */
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
      selectedVhclNo:     s.anlsPrdInfo.selectedVhclNo,
      analysisDate:       s.anlsPrdInfo.analysisDate,
      anpModalOpen:       s.anlsPrdInfo.anpModalOpen,
      messageConfig:      s.anlsPrdInfo.messageConfig,
      analysisMode:       s.anlsPrdInfo.analysisMode,
      analysisFrom:       s.anlsPrdInfo.analysisFrom,
      analysisTo:         s.anlsPrdInfo.analysisTo,
      scopeKey:           s.anlsPrdInfo.scopeKey,
    }),
    shallowEqual
  )

  const searchParams = useSearchParams()
  const initial = Object.fromEntries(searchParams.entries()) as Record<string,string>

  /* 검색 폼 */
  const [formParams, setFormParams] = useState<ListSearch>({
    page: Number(initial.page ?? 1),
    size: Number(initial.size ?? 10),
    ctpvCd: initial.ctpvCd,
    locgovCd: initial.locgovCd,
    vhclNo: initial.vhclNo,
  })
  const [queryParams, setQueryParams] = useState<ListSearch|null>(null)

  /* 메인 그리드 */
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageable, setPageable] = useState<Pageable2>({pageNumber:1, pageSize:10, totalPages:1})
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [mainHighlightIndex, setMainHighlightIndex] = useState(-1)
  const [mainFlags, setMainFlags] = useState<{t1?:boolean; t2?:boolean; s?:boolean}>({})
  const selectedRow = rows[selectedIndex]

  /* 히스토리 그리드 */
  const [historyRows, setHistoryRows] = useState<Row[]>([])
  const [historyTotalRows, setHistoryTotalRows] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [detailPageable, setDetailPageable] = useState<Pageable2>({pageNumber:1, pageSize:50, totalPages:1})
  const [historyHighlightIndex, setHistoryHighlightIndex] = useState(-1)

  /* 체크키 */
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  /* 알림 1회 */
  const invalidAlertShownRef = useRef(0)
  const noTargetShownRef = useRef(0)
  const validAlertShownRef = useRef(0)

  const resetDetail = useCallback(() => {
    setMainHighlightIndex(-1)
    setHistoryHighlightIndex(-1)
    setMainFlags({})
    invalidAlertShownRef.current = 0
    noTargetShownRef.current = 0
    validAlertShownRef.current = 0

    setSelectedIndex(-1)
    setSelectedKeys([])
    setHistoryRows([])
    setHistoryTotalRows(0)
    setDetailPageable(p => ({...p, pageNumber:1, totalPages:1}))
  }, [])
  const clearHighlights = useCallback(() => {
    setMainHighlightIndex(-1)
    setHistoryHighlightIndex(-1)
    setMainFlags({})
    invalidAlertShownRef.current = 0
    noTargetShownRef.current = 0
    validAlertShownRef.current = 0
  }, [])

  /* 메인 조회 */
  const fetchMain = useCallback(async (qp: ListSearch) => {
    clearHighlights()
    if (isLogv) {
      if (!qp.ctpvCd) return alert('시도를 선택해주세요.')
      if (!qp.locgovCd) return alert('관할관청을 선택해주세요.')
    }
    setLoading(true)
    try {
      const endpoint =
        `/ilp/iia/tx/getAllDutyInsrSbscInfo?page=${qp.page}&size=${qp.size}` +
        `${qp.ctpvCd ? `&ctpvCd=${qp.ctpvCd}` : ''}` +
        `${qp.locgovCd ? `&locgovCd=${qp.locgovCd}` : ''}` +
        `${qp.vhclNo ? `&vhclNo=${qp.vhclNo}` : ''}`
      const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      if (res?.resultType === 'success' && res.data) {
        setRows(res.data.content ?? [])
        setTotalRows(res.data.totalElements ?? 0)
        setPageable({
          pageNumber: (res.data.pageable?.pageNumber ?? 0) + 1,
          pageSize: res.data.pageable?.pageSize ?? qp.size,
          totalPages: res.data.totalPages ?? 1,
        })
      } else {
        setRows([]); setTotalRows(0); setPageable({pageNumber:1, pageSize:qp.size, totalPages:1})
      }
    } catch (e) {
      console.error(e)
      setRows([]); setTotalRows(0); setPageable({pageNumber:1, pageSize:qp.size, totalPages:1})
    } finally {
      setLoading(false)
    }
  }, [clearHighlights, isLogv])

  /* 히스토리 조회 */
  const fetchHistory = useCallback(async (page: number, size: number, row?: Row, qp?: ListSearch|null) => {
    if (!row || !qp) return
    clearHighlights()
    setHistoryLoading(true)
    try {
      const endpoint =
        `/ilp/iia/tx/getAllDutyInsrSbscHst?page=${page}&size=${size}` +
        `${qp.ctpvCd ? `&ctpvCd=${qp.ctpvCd}` : ''}` +
        `${row.locgovCd ? `&locgovCd=${row.locgovCd}` : ''}` +
        `${row.vhclNo ? `&vhclNo=${row.vhclNo}` : ''}`
      const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      if (res?.resultType === 'success' && res.data) {
        setHistoryRows(res.data.content ?? [])
        setHistoryTotalRows(res.data.totalElements ?? 0)
        setDetailPageable({
          pageNumber: (res.data.pageable?.pageNumber ?? 0) + 1,
          pageSize: res.data.pageable?.pageSize ?? size,
          totalPages: res.data.totalPages ?? 1,
        })
      } else {
        setHistoryRows([]); setHistoryTotalRows(0); setDetailPageable({pageNumber:1, pageSize:size, totalPages:1})
      }
    } catch (e) {
      console.error(e)
      setHistoryRows([]); setHistoryTotalRows(0); setDetailPageable({pageNumber:1, pageSize:size, totalPages:1})
    } finally {
      setHistoryLoading(false)
    }
  }, [clearHighlights])

  /* 검색/선택/페이징 핸들러 */
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault()
    resetDetail()
    const qp: ListSearch = { ...formParams, page: 1, size: formParams.size || 10 }
    setQueryParams(qp)
    fetchMain(qp)
  }

  useEffect(() => {
    if (rows.length > 0) {
      if (selectedIndex !== 0) setSelectedIndex(0)
    } else {
      resetDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  useEffect(() => {
    if (!selectedRow || !queryParams) return
    fetchHistory(detailPageable.pageNumber, detailPageable.pageSize, selectedRow, queryParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRow])

  useEffect(() => {
    if (!selectedKeys?.length) return
    const lastKey = selectedKeys[selectedKeys.length - 1]
    const idx = Number(String(lastKey).replace('tr',''))
    if (!Number.isFinite(idx) || !rows[idx]) return
    if (selectedIndex !== idx) setSelectedIndex(idx)
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
    setDetailPageable(p => ({ ...p, pageNumber: page, pageSize }))
    fetchHistory(page, pageSize, selectedRow, queryParams)
  }

  const handleAnlsPrdModal = () => {
    clearHighlights()
    if (!queryParams) return alert('먼저 검색을 수행해주세요.')
    if (!selectedKeys || selectedKeys.length !== 1) return alert('분석할 차량을 1건 선택해주세요.')
    const idx = Number(String(selectedKeys[0]).replace('tr',''))
    const row = rows[idx]
    if (!row?.vhclNo) return alert('선택한 행의 차량번호를 확인할 수 없습니다.')
    setSelectedIndex(idx)
    dispatch(openAnlsPrdModal({ selectedVhclNo: row.vhclNo, showModes: ['date','period'], scopeKey: PAGE_SCOPE }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormParams(prev => ({ ...prev, [name]: value }))
  }
  const handleRowClick = (_row: Row, index?: number) => {
    if (typeof index !== 'number') return
    setSelectedIndex(index)
    setSelectedKeys([`tr${index}`])
  }

  /* ───────── 분석 적용 ───────── */
  const lastAppliedRef = useRef(0)
  useEffect(() => {
    if (scopeKey !== PAGE_SCOPE) return
    const trig = applyFilterTrigger
    if (!queryParams || trig <= 0 || lastAppliedRef.current === trig) return
    lastAppliedRef.current = trig

    const d8 = toYmd8(analysisDate)
    const f8 = toYmd8(analysisFrom)
    const t8 = toYmd8(analysisTo)
    const plate = normPlate(selectedVhclNo)
    if (!plate) return

    const mainPairs = rows.map((r,i) => ({row:r, idx:i})).filter(({row}) => normPlate(row.vhclNo) === plate)
    const histPairs = historyRows.map((r,i) => ({row:r, idx:i})).filter(({row}) => normPlate(row.vhclNo) === plate)

    clearHighlights()

    // 단일 날짜
    if (analysisMode === 'date' && d8) {
      // 메인 선택: regDt ≤ d8
      const pm = pickMainForDate(mainPairs, d8)
      if (pm) {
        setSelectedIndex(pm.idx)
        setMainHighlightIndex(pm.idx)

        // 메인 빨간 표시(__mark_*)
        const mf = toMainMarkFromRow(d8, pm.row)
        setMainFlags(mf)

        // 그 날의 보험 유효성(Alert 1회)
        const insAgg = evaluateInsuranceOnDate(d8, [pm.row], INS_MODE.insurance)
        if (!(insAgg.t1OK && insAgg.t2OK && insAgg.sOK)) {
          if (!invalidAlertShownRef.current) {
            invalidAlertShownRef.current = 1
            alert(messageConfig?.invalidInsrMsg ?? '입력하신 날짜 기준으로 유효한 의무보험 정보가 존재하지 않습니다.')
          }
        } else {
          if (!validAlertShownRef.current) {
            validAlertShownRef.current = 1
            alert(`입력일자 ${analysisDate}일은 보험가입 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
          }
        }
      } else {
        // 메인에 없으면 히스토리: regDt ≤ d8 ≤ mdfcnDt
        const ph = pickHistForDate(histPairs, d8)
        if (ph) {
          setHistoryHighlightIndex(ph.idx)
          // 상세 그리드는 각 행에 __ins_* 플래그 부여
          // (historyRowsDecorated에서 markInsuranceFlagsForRow 적용)
          const insAgg = evaluateInsuranceOnDate(d8, [ph.row], INS_MODE.insurance)
          if (!(insAgg.t1OK && insAgg.t2OK && insAgg.sOK)) {
            if (!invalidAlertShownRef.current) {
              invalidAlertShownRef.current = 1
              alert(messageConfig?.invalidInsrMsg ?? '입력하신 날짜 기준으로 유효한 의무보험 정보가 존재하지 않습니다.')
            }
          } else {
            // 유효 시 알림
            if (!validAlertShownRef.current) {
              validAlertShownRef.current = 1
              alert(`입력일자 ${d8}는 보험가입 정보가 유효합니다.\n파란색 정보를 참고하시기 바랍니다.`)
            }
          }
        } else {
          if (!noTargetShownRef.current) {
            noTargetShownRef.current = 1
            alert(messageConfig?.noTargetMsg ?? '입력하신 날짜 기준으로 분석 가능한 대상이 없습니다.')
          }
        }
      }
      return
    }

    // 기간
    if (analysisMode === 'period' && f8 && t8) {
      // 메인에서 겹치면 메인 강조, 아니면 히스토리 강조
      const pm = pickForPeriod(mainPairs, f8, t8)
      if (pm) {
        setSelectedIndex(pm.idx)
        setMainHighlightIndex(pm.idx)
      } else {
        const ph = pickForPeriod(histPairs, f8, t8)
        if (ph) setHistoryHighlightIndex(ph.idx)
      }

      // 공통 엔진으로 보험만 미유효 날짜 계산
      const insDetail = pm ? [pm.row] : histPairs.map(h => h.row)
      const { invalidDays } = calcInvalidByDateComposed(
        f8,
        t8,
        // 보험만 보는 페이지이므로 차량상태 영향 없게 기본값 가정
        { vhclSttsNm: '정상' } as any,
        { ins: insDetail },
        { insurance: true, biz: false, license: false, qual: false },
        INS_MODE,
        // 자격은 안 쓰므로 dummy
        // @ts-ignore
        undefined
      )

      // 겹치는 데이터 자체가 전혀 없으면 전체 미유효 처리
      dispatch(setAnlsInvalidDays([]))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFilterTrigger])

  /* ───────── 데코 & 상세 플래그 주입 ───────── */
  // 메인 행: __mark_* 만 사용
  const mainRowsDecorated = useMemo(
    () => decorateRows(rows, mainHighlightIndex, mainFlags),
    [rows, mainHighlightIndex, mainFlags]
  )

  // 히스토리 행: 날짜 모드일 때 각 행에 __ins_* 세팅(그리드가 컬럼별로 붉게 표시)
  const historyRowsDecorated = useMemo(() => {
    const d8 = toYmd8(analysisDate)

    // 하이라이트가 없거나 날짜모드가 아니면: 아무 행도 붉게 표시하지 않음
    if (!(analysisMode === 'date' && d8) || historyHighlightIndex < 0) {
      return decorateRows(historyRows, historyHighlightIndex)
    }

    // 날짜모드 + 하이라이트된 행만 __ins_* 플래그를 부여
    const onlyHighlightedFlagged = historyRows.map((r, i) =>
      i === historyHighlightIndex
        ? markInsuranceFlagsForRow(d8, r, INS_MODE.insurance)
        : { ...r, __ins_reg: false, __ins_t1: false, __ins_t2: false, __ins_s: false }
    )

    return decorateRows(onlyHighlightedFlagged as any, historyHighlightIndex)
  }, [historyRows, historyHighlightIndex, analysisMode, analysisDate])

  /* 첫 행 자동선택 + 체크 동기화 */
  useEffect(() => {
    if (rows.length > 0) {
      if (selectedIndex !== 0) setSelectedIndex(0)
      setSelectedKeys(['tr0'])
    } else {
      resetDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  useEffect(() => {
    dispatch(setScopeKey(PAGE_SCOPE))
    return () => { dispatch(setScopeKey(null)) }
  }, [dispatch])

  return (
    <PageContainer title="보험가입 정보 분석" description="보험가입 정보 분석 페이지">
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
          headCells={iiaCmHc}
          selectedRowIndex={selectedIndex}
          rows={mainRowsDecorated}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging={true}
          cursor={true}
          caption="택시-보험가입 정보 분석 조회 목록"
          oneCheck={true}
          onSelectedKeysChange={(keys: string[]) => setSelectedKeys(keys)}
          selectedKeys={selectedKeys}
        />
      </Box>

      {/* 상세(이력) 영역 */}
      {selectedRow ? (
        <BlankCard title="의무보험가입 정보 이력" className="contents-card">
          <TableDataGrid
            headCells={iiaHisCmHc}
            rows={historyRowsDecorated}
            totalRows={historyTotalRows}
            loading={historyLoading}
            onRowClick={() => {}}
            onPaginationModelChange={handleDetailPaginationModelChange}
            //pageable={detailPageable}
            //paging={true}
            caption="의무보험가입 정보 이력 목록 조회"
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

export default function TxPage() {
  return <DataList />
}
