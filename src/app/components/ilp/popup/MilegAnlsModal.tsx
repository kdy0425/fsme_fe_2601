/* React */
import React, { useEffect, useState } from 'react'

/* 공통 component */
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* mui */
import { Box, Button, Dialog, DialogContent } from '@mui/material'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* 공통 type, interface */
import { HeadCell, Pageable2 } from 'table'
import {
  maTrHc,
  maBsHc,
  maBsKoiHc,
  maBsLcnsHc,
} from '@/utils/fsms/ilp/headCells'

//import VhclSearchModal from '@/app/components/ilp/popup/VhclSearchModal'
import dynamic from 'next/dynamic'

// 각 업종별 차량검색 모달: 클라이언트에서만 사용 (ssr:false)
const VhclSearchModalTR = dynamic(
  () => import('@/app/components/tr/popup/VhclSearchModal'),
  { ssr: false },
)
const VhclSearchModalTX = dynamic(
  () => import('@/app/components/tx/popup/VhclSearchModal'),
  { ssr: false },
)
const VhclSearchModalBS = dynamic(
  () => import('@/app/components/bs/popup/VhclSearchModal'),
  { ssr: false },
)

type GroupBy = 'BOTH' | 'KOI' | 'VHCL' | 'LCNS' | 'TON'
type RefGroup = 'BOTH' | 'KOI' | 'SECOND'

/** 모달 동작 설정 (BS/TX 공통화) */
type SecondGb = 'LCNS' | 'VHCL' | 'TON'
interface ModalConfig {
  /** 분석 API 엔드포인트 */
  endpoint: string
  /** 두 번째 그룹 구분(면허업종 or 차종) */
  secondGb: SecondGb
  /** 배너/라벨 표시명 (예: '면허업종', '차종') */
  secondLabel: string
  /** 부모에서 넘겨온 조건 중 전달할 2차 그룹 파라미터 키 (예: 'lcnsTpbizCd' | 'dtaRegSttsCd') */
  secondParamKey: string
  /** 분석/부모 rows에서 2차 그룹 '이름' 필드 키 (예: 'lcnsTpbizNm' | 'dtaRegSttsNm') */
  secondNameKey: string
  /** 결과 그리드 헤더(기준 그룹별) — 미지정 시 BS 기본 헤더 사용 */
  headCells?: {
    BOTH: HeadCell[]
    KOI: HeadCell[]
    SECOND: HeadCell[]
  }
}

/* interface, type 선언 */
interface MilegAnlsModalProps {
  title?: string
  open: boolean
  onRowClick: (row: any) => void
  onCloseClick: (row: any) => void
  RowClickClose?: boolean
  baseParams?: any // 부모 조건
  baseGb?: GroupBy // KOI | LCNS | VHCL | BOTH
  baseRows?: Array<{
    koiCd?: string
    koiNm?: string
    lcnsTpbizCd?: string
    lcnsTpbizNm?: string
    dtaRegSttsCd?: string
    dtaRegSttsNm?: string
    mileg: number
  }>
  /** BS/TX 구분용 설정 (TX에서만 필수) */
  config?: ModalConfig
}

const headCellsSelectModal: HeadCell[] = [
  { id: 'vhclNo', numeric: false, disablePadding: false, label: '차량번호' },
  { id: 'vonrNm', numeric: false, disablePadding: false, label: '소유자명' },
  {
    id: 'vonrRrnoSecure',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
  },
]

export interface VhclRow {
  vhclNo: string
  locgovCd: string
  koiCd: string
  koiNm: string
  vhclTonCd: string
  vhclTonNm: string
  crno: string
  crnoS: string
  crnoSecure: string
  vonrRrno: string
  vonrRrnoS: string
  vonrRrnoSecure: string
  lcnsTpbizCd: string
  vhclSeCd: string
  vhclRegYmd: string
  yridnw: string
  len: string
  bt: string
  maxLoadQty: string
  vhclSttsCd: string
  vonrNm: string
  vonrBrno: string
  vhclPsnCd: string
  vhclPsnNm: string
  delYn: string
  dscntYn: string
  souSourcSeCd: string
  bscInfoChgYn: string
  locgovAprvYn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  locgovNm: string
  prcsSttsCd: string
  isTodayStopCancel: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number
}

/** BS 기본 설정 (TX는 부모에서 config로 덮어쓰기) */
const defaultConfig: ModalConfig = {
  endpoint: '/ilp/ma/bs/getMilegAnlsBs',
  secondGb: 'LCNS',
  secondLabel: '면허업종',
  secondParamKey: 'lcnsTpbizCd',
  secondNameKey: 'lcnsTpbizNm',
  headCells: {
    BOTH: maBsHc,
    KOI: maBsKoiHc,
    SECOND: maBsLcnsHc,
  },
}

// ---- helpers ----
function toQuery(obj: Record<string, any>) {
  const qs = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    qs.set(k, String(v))
  })
  return `?${qs.toString()}`
}

export const MilegAnlsModal = (props: MilegAnlsModalProps) => {
  const cfg = { ...defaultConfig, ...(props.config || {}) }

  const [flag, setFlag] = useState<boolean>(false)
  const [rows, setRows] = useState<VhclRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)

  // TR 여부/불리언 파서/플래그 스냅샷
  const isTR = React.useMemo(
    () => (cfg.endpoint || '').includes('/tr/'),
    [cfg.endpoint],
  )
  const toBool = (v: any) => v === true || v === 'true' || v === 1 || v === '1'

  const trFlags = React.useMemo(
    () => ({
      grpKoi: toBool(props.baseParams?.grpKoi),
      grpVhcl: toBool(props.baseParams?.grpVhcl),
      grpTon: toBool(props.baseParams?.grpTon),
    }),
    [props.baseParams],
  )

  // 차량검색 모달
  const [vhclModalOpen, setVhclModalOpen] = useState(false)
  const openVhclModal = () => setVhclModalOpen(true)
  const closeVhclModal = () => setVhclModalOpen(false)
  const handlePickVhcl = (row: any) => {
    if (row?.vhclNo) setParams((prev) => ({ ...prev, vhclNo: row.vhclNo }))
    setVhclModalOpen(false)
  }

  const { title, open, onRowClick, onCloseClick, RowClickClose, baseParams } =
    props

  const [params, setParams] = useState<listSearchObj>({ page: 1, size: 10 })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })

  useEffect(() => {
    if (flag) fetchData()
  }, [flag])
  useEffect(() => {
    if (!open) setRows([])
  }, [open])

  // 선택 모달 목록 조회
  const fetchData = async () => {
    setLoading(true)
    try {
      const searchObj = { ...params, page: params.page, size: params.size }
      const endpoint = '/fsm/stn/vm/tr/getAllVhcleMng' + toQuery(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        setRows([])
        setTotalRows(0)
        setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      }
    } catch {
      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  const handleRowClick = (row: any) => {
    onRowClick(row)
    if (RowClickClose) onCloseClick({})
  }

  // 분석 실행 (Enter 포함)
  const handleAdvancedSearch = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!params.vhclNo || String(params.vhclNo).trim() === '') {
      alert('차량번호를 입력(또는 선택)하세요.')
      return
    }

    const p = baseParams ?? {}
    const qs = new URLSearchParams()
    qs.set('page', String(p.page ?? 1))
    qs.set('size', String(p.size ?? 10))
    if (p.bgngDt) qs.set('bgngDt', String(p.bgngDt).replaceAll('-', ''))
    if (p.endDt) qs.set('endDt', String(p.endDt).replaceAll('-', ''))
    if (p.ctpvCd) qs.set('ctpvCd', String(p.ctpvCd))
    if (p.locgovCd) qs.set('locgovCd', String(p.locgovCd))
    if (p.koiCd) qs.set('koiCd', String(p.koiCd))

    // 두 번째 축 파라미터 (차종/톤수 등)
    if (p[cfg.secondParamKey] != null) {
      qs.set(cfg.secondParamKey, String(p[cfg.secondParamKey]))
    }

    // (선택) 기존 GB 필요시
    if (p.srchDtGb) qs.set('srchDtGb', String(p.srchDtGb))

    // 차량번호
    qs.set('vhclNo', String(params.vhclNo))

    const toBool = (v: any) =>
      v === true || v === 'true' || v === 1 || v === '1'

    const isTR = (cfg.endpoint || '').includes('/tr/')
    if (isTR) {
      const p = baseParams ?? {}
      // typeof 검사 제거, 항상 세 플래그 모두 보냄(문자열도 처리)
      qs.set('grpKoi', String(toBool(p.grpKoi)))
      qs.set('grpVhcl', String(toBool(p.grpVhcl)))
      qs.set('grpTon', String(toBool(p.grpTon)))
    }

    setAnlsLoading(true)
    try {
      const endpoint = `${cfg.endpoint}?${qs.toString()}`
      const resp = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const list = Array.isArray(resp?.data?.content)
        ? resp.data.content
        : Array.isArray(resp?.data?.list)
          ? resp.data.list
          : Array.isArray(resp?.data)
            ? resp.data
            : []
      setAnlsRows(list)

      // 차량 연비 (응답 최상위 mileg → 없으면 목록에서 해당 차량 찾아 사용)
      const raw = resp?.data?.mileg
      const v = raw == null ? NaN : Number(String(raw).replace(/,/g, ''))
      if (Number.isFinite(v)) setVehicleMileg(v)
      else {
        const selected = list.find(
          (r: any) => String(r?.vhclNo) === String(params.vhclNo),
        )
        const vv = selected
          ? Number(String(selected.mileg).replace(/,/g, ''))
          : NaN
        setVehicleMileg(Number.isFinite(vv) ? vv : null)
      }
    } catch (e) {
      console.error(e)
      setAnlsRows([])
      setVehicleMileg(null)
    } finally {
      setAnlsLoading(false)
    }
  }

  const onVhclKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key !== 'Enter') return
    const composing =
      (e.nativeEvent as any).isComposing ||
      (e.nativeEvent as any).keyCode === 229
    if (composing) return
    e.preventDefault()
    handleAdvancedSearch()
  }

  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page, size: pageSize }))
    setFlag(true)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  interface AnlsRow {
    [key: string]: any
    koiCd: string
    koiNm: string
    bgngYm: string
    endYm: string
    drvngDstnc: number
    useLiter: number
    mileg: number
  }
  const [anlsRows, setAnlsRows] = useState<AnlsRow[]>([])
  const [anlsLoading, setAnlsLoading] = useState(false)
  const [vehicleMileg, setVehicleMileg] = useState<number | null>(null)

  // 모달 닫히면 결과 초기화
  useEffect(() => {
    if (!open) {
      setParams((prev) => ({ ...prev, vhclNo: '' }))
      setAnlsRows([])
      setVehicleMileg(null)
    }
  }, [open])

  // ── 유틸 ───────────────────────────────
  const norm = (s?: string) =>
    String(s ?? '')
      .replace(/\s+/g, ' ')
      .trim()
  const toNum = (v: any) =>
    v == null ? NaN : Number(String(v).replace(/[^\d.\-]/g, ''))
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const r2 = (n: number) => Math.round(n * 100) / 100

  // 부모가 보낸 그룹(KOI/BOTH/LCNS/VHCL)을 모달 내부 기준으로 정규화
  const appliedFromParent: GroupBy = isTR
    ? trFlags.grpKoi && (trFlags.grpVhcl || trFlags.grpTon)
      ? 'BOTH'
      : trFlags.grpKoi
        ? 'KOI'
        : 'VHCL' /* SECOND 대용 */
    : (props.baseParams?.srchDtGb as GroupBy) || 'KOI'

  const refGb: RefGroup =
    appliedFromParent === 'KOI' || appliedFromParent === 'BOTH'
      ? appliedFromParent
      : 'SECOND'

  // 기준용 부모 리스트
  const baseList = Array.isArray(props.baseRows) ? props.baseRows! : []

  // 부모 rows 기반 평균 맵 (이름 매칭)
  const baseMaps = React.useMemo(() => {
    const koiMap = new Map<string, number>() // koiNm -> avg
    const secondMap = new Map<string, number>() // SECOND 이름 -> avg
    const pairMap = new Map<string, number>() // "koiNm|SECOND" -> avg

    const sName = cfg.secondNameKey

    // KOI
    {
      const buckets = new Map<string, number[]>()
      baseList.forEach((r) => {
        const k = norm((r as any).koiNm)
        const m = toNum((r as any).mileg)
        if (!Number.isFinite(m)) return
        if (!buckets.has(k)) buckets.set(k, [])
        buckets.get(k)!.push(m)
      })
      buckets.forEach((arr, k) => koiMap.set(k, avg(arr)))
    }

    // SECOND (면허업종/차종)
    {
      const buckets = new Map<string, number[]>()
      baseList.forEach((r) => {
        const k = norm((r as any)[sName])
        const m = toNum((r as any).mileg)
        if (!Number.isFinite(m)) return
        if (!buckets.has(k)) buckets.set(k, [])
        buckets.get(k)!.push(m)
      })
      buckets.forEach((arr, k) => secondMap.set(k, avg(arr)))
    }

    // BOTH
    {
      const buckets = new Map<string, number[]>()
      baseList.forEach((r) => {
        const k = `${norm((r as any).koiNm)}|${norm((r as any)[sName])}`
        const m = toNum((r as any).mileg)
        if (!Number.isFinite(m)) return
        if (!buckets.has(k)) buckets.set(k, [])
        buckets.get(k)!.push(m)
      })
      buckets.forEach((arr, k) => pairMap.set(k, avg(arr)))
    }

    const overall = avg(
      baseList
        .map((r: any) => toNum(r.mileg))
        .filter(Number.isFinite) as number[],
    )
    return { koiMap, secondMap, pairMap, overall }
  }, [baseList, cfg.secondNameKey])

  // 그리드용 비교 컬럼 추가
  // 그리드용 비교 컬럼 추가
  const compareRows = React.useMemo(() => {
    if (!anlsRows.length || !baseList.length) return anlsRows
    const sName = cfg.secondNameKey
    const eq = (x: number, y: number, tol = 0.005) => Math.abs(x - y) < tol

    return anlsRows.map((r) => {
      const kNm = norm((r as any).koiNm)
      const sNm = norm((r as any)[sName])

      let base = NaN
      if (refGb === 'KOI') base = baseMaps.koiMap.get(kNm) ?? NaN
      else if (refGb === 'SECOND') base = baseMaps.secondMap.get(sNm) ?? NaN
      else
        base = baseMaps.pairMap.get(`${kNm}|${sNm}`) ?? baseMaps.overall ?? NaN

      const m = toNum((r as any).mileg)
      const ratioRaw =
        Number.isFinite(m) && Number.isFinite(base) && base !== 0
          ? m / base
          : NaN
      const ratio = Number.isFinite(ratioRaw) ? r2(ratioRaw) : NaN

      let judge: string | null = null
      if (Number.isFinite(ratio)) {
        // 동일도 ‘이상’으로 본다
        judge = ratio > 1 || eq(ratio, 1) ? '이상' : '미만'
      }

      return {
        ...r,
        baseAvg: Number.isFinite(base) ? r2(base) : null,
        ratio: Number.isFinite(ratio) ? ratio : null,
        judge: judge ?? '-',
      }
    })
  }, [anlsRows, baseList, refGb, baseMaps, cfg.secondNameKey])

  // 결과 그리드 헤더 (기존 + 기준평균)
  const resultHeadCells: HeadCell[] = React.useMemo(() => {
    const isTR = (cfg.endpoint || '').includes('/tr/')

    if (isTR) {
      // 1) TR: maTrHc 기반
      const override = cfg.headCells?.BOTH
      if (override && override.length) {
        const baseLabel =
          refGb === 'KOI'
            ? '유종 평균'
            : refGb === 'SECOND'
              ? `${cfg.secondLabel ?? ''} 평균`
              : '기준 평균'
        return [
          ...override,
          {
            id: 'baseAvg',
            numeric: true,
            disablePadding: false,
            label: baseLabel,
          },
        ]
      }

      // (fallback) override가 없으면 maTrHc + 동적 삽입
      const base = maTrHc.filter(
        (c) => c.id !== 'dtaRegSttsNm' && c.id !== 'vhclTonNm',
      )
      const dynamic: HeadCell[] = []
      if (cfg.secondGb === 'VHCL') {
        dynamic.push({
          id: 'dtaRegSttsNm',
          numeric: false,
          disablePadding: false,
          label: '차종',
        })
      } else if (cfg.secondGb === 'TON') {
        dynamic.push({
          id: 'vhclTonNm',
          numeric: false,
          disablePadding: false,
          label: '톤수',
        })
      }
      const idx = base.findIndex((col) => col.id === 'regYmd')
      const merged =
        idx === -1
          ? [...base, ...dynamic]
          : [...base.slice(0, idx), ...dynamic, ...base.slice(idx)]

      const baseLabel =
        refGb === 'KOI'
          ? '유종 평균'
          : refGb === 'SECOND'
            ? `${cfg.secondLabel ?? ''} 평균`
            : '기준 평균'

      return [
        ...merged,
        {
          id: 'baseAvg',
          numeric: true,
          disablePadding: false,
          label: baseLabel,
        },
      ]
    }

    // ─────────────────────────────────────────────
    // BS/TX: 기존 로직 유지
    const baseCols =
      (cfg.headCells?.[refGb] as HeadCell[] | undefined) ??
      (refGb === 'KOI' ? maBsKoiHc : refGb === 'SECOND' ? maBsLcnsHc : maBsHc)

    const baseLabel =
      refGb === 'KOI'
        ? '유종 평균'
        : refGb === 'SECOND'
          ? `${cfg.secondLabel} 평균`
          : '기준 평균'

    return [
      ...baseCols,
      { id: 'baseAvg', numeric: true, disablePadding: false, label: baseLabel },
    ]
  }, [cfg.endpoint, cfg.secondGb, cfg.secondLabel, cfg.headCells, refGb])

  // 배너 (그리드 판정과 동일 로직 사용)
  const banner = React.useMemo(() => {
    if (!compareRows.length) return null

    const t: any =
      (compareRows as any[]).find(
        (r) => String(r?.vhclNo) === String((params as any).vhclNo),
      ) ?? compareRows[0]

    const ratio =
      typeof t?.ratio === 'number' ? Number(t.ratio.toFixed(2)) : NaN
    if (!Number.isFinite(ratio)) return null

    // 동일은 이상으로
    const isEqual = Math.abs(ratio - 1) < 0.005
    const judge = ratio > 1 || isEqual ? '이상' : '미만'
    // 색상: 미만=붉은색 / 이상=파란색
    const color = judge === '미만' ? '#d32f2f' : '#2F66F5'

    if (isTR) {
      const sel: string[] = []
      if (trFlags.grpKoi) sel.push('유종')
      if (trFlags.grpVhcl) sel.push('차종')
      if (trFlags.grpTon) sel.push('톤수')

      let title = ''
      let label = ''
      if (sel.length === 3) {
        title = '전체 평균 대비'
        label = '전체 평균 대비 '
      } else {
        const joined = sel.join('/')
        title = `${joined} 평균 대비`
        label = `${joined} 평균 대비 `
      }

      return { title, label, ratio, judge, color }
    }

    // ── BS/TX 라벨 유지 ──
    const sName = cfg.secondNameKey
    const kNm = norm(t?.koiNm)
    const sNm = norm(t?.[sName])

    let title = ''
    let label = ''
    if (refGb === 'KOI') {
      title = '동일 유종 평균 대비'
      label = `${kNm || '유종'} 평균 대비 `
    } else if (refGb === 'SECOND') {
      title = `동일 ${cfg.secondLabel} 평균 대비`
      label = `${sNm || cfg.secondLabel} 평균 대비 `
    } else {
      title = '전체 평균 대비'
      label = `${[kNm, sNm].filter(Boolean).join(' / ') || '전체'} 평균 대비 `
    }

    return { title, label, ratio, judge, color }
  }, [compareRows, params, isTR, trFlags, cfg.secondLabel, cfg.secondNameKey])

  // TR/BS/TX 구분
  const apiScope = React.useMemo<'tr' | 'tx' | 'bs'>(() => {
    const ep = cfg.endpoint || ''
    if (ep.includes('/tr/')) return 'tr'
    if (ep.includes('/tx/')) return 'tx'
    return 'bs'
  }, [cfg.endpoint])

  // 업종별 모달 컴포넌트 선택
  const VhclModal = React.useMemo(() => {
    if (apiScope === 'tr') return VhclSearchModalTR
    if (apiScope === 'tx') return VhclSearchModalTX
    return VhclSearchModalBS
  }, [apiScope])

  const vhclSearchUrl =
    apiScope === 'tr'
      ? '/fsm/stn/vm/tr/getAllVhcleMng'
      : apiScope === 'tx'
        ? '/fsm/stn/vm/tx/getAllVhcleMng'
        : '/fsm/stn/vm/bs/getAllVhcleMng'

  return (
    <Box>
      <Dialog fullWidth maxWidth="lg" open={open} onClose={onCloseClick}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title ?? '차량번호 조회'}</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAdvancedSearch}
              >
                분석
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                닫기
              </Button>
            </div>
          </Box>

          {/* 검색영역 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group" style={{ width: 'initial' }}>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={(params as any).vhclNo ?? ''}
                    onChange={handleSearchChange}
                    onKeyDown={onVhclKeyDown}
                  />
                </div>
                <div className="button-right-align">
                  <Button
                    onClick={openVhclModal}
                    variant="contained"
                    color="dark"
                  >
                    선택
                  </Button>
                </div>
              </div>
            </Box>
          </Box>

          {/* 분석 요약 배너 (그리드 판정과 동일 기준/색상) */}
          {!!banner && (
            <Box
              sx={{
                mb: 1,
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  background: banner.color,
                  borderRadius: 4,
                  marginRight: 8,
                }}
              >
                {banner.title}
              </span>
              <span style={{ fontWeight: 500 }}>{banner.label}</span>
              <span
                style={{ fontWeight: 700, marginLeft: 2, color: banner.color }}
              >
                {banner.ratio.toFixed(2)}배 {banner.judge}
              </span>
            </Box>
          )}

          {/* 분석 결과 그리드 */}
          <Box sx={{ mt: 2 }}>
            <TableDataGrid
              headCells={resultHeadCells}
              rows={compareRows}
              loading={anlsLoading}
              paging={false}
            />
          </Box>
          <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
            <span style={{ color: '#1976d2' }}>■ 평균이상</span>
            <span style={{ color: '#d32f2f' }}>■ 평균미만</span>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 차량 검색 모달 */}
      <VhclModal
        title="차량번호 검색"
        open={vhclModalOpen}
        onRowClick={handlePickVhcl}
        onCloseClick={() => closeVhclModal()}
        RowClickClose={true}
        ctpvAllVisable={false}
        locgovAllVisable={false}
        url={vhclSearchUrl}
        //apiScope={apiScope}  //API 스코프로 조회
        // preset={{
        //   ctpvCd: baseParams?.ctpvCd,
        //   locgovCd: baseParams?.locgovCd  //시도/관할관청 기본값 프리셋
        // }}
      />
    </Box>
  )
}

export default MilegAnlsModal
