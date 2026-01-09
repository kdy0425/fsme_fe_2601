'use client'

import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import {
  Dialog, DialogContent, DialogActions, DialogProps,
  FormGroup, FormControlLabel, Button, Box,
  Accordion, AccordionSummary, AccordionDetails, RadioGroup,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import {
  loadStatsClsfForModal, getStatsClsfHasChildrenSet, getStatsClsfChildren, type CodeOption,
} from '@/utils/fsms/common/code/getCode'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import Skeleton from '@mui/material/Skeleton'


interface FormModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  isOpen: boolean
  setClose: () => void
  selectedRow: { x?: string | string[]; y?: string | string[]; m?: string | string[]; rptpNm?: string; rptpSn?: string; ctpvNm?: string } | null
  periodParams: { bgngDt: string; endDt: string; mode: 'MM' | 'YY' }
  mode?: 'create' | 'update'
  // 프리뷰를 부모(DataList)에서 열도록 요청하는 콜백 (옵션)
  onPreview?: (
    pivot: PivotResponse,
    params: { title?: string; bgngDt?: string; endDt?: string; locgovNm?: string }
  ) => void;
}

const MEASURES_CHIP_CODE = '__MEASURES__' as const

type PivotCell = {
  text: string | number | null;
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
};

type PivotResponse = {
  headerRows?: PivotCell[][];
  bodyRows: PivotCell[][];
  title?: string;
};

type AggAxis = { type: 'CODE' | 'YM'; code?: string };

/* ---------- 측정값 리스트 ---------- */
function MeasureOptionsList({
  measureOptions,
  selectedMeasures,
  toggleMeasure,
  readOnly = false,   
}: {
  measureOptions: CodeOption[];
  selectedMeasures: Set<string>;
  toggleMeasure: (code: string, checked: boolean) => void;
   readOnly?: boolean;
}) {
  if (!measureOptions.length) {
    return <span style={{ color: '#999' }}>측정값을 불러오는 중이거나 없습니다.</span>;
  }
  return (
    <>
      {measureOptions.map((m) => {
        const mCode = String(m.code ?? '').trim();
        return (
          <FormControlLabel
            key={`m:${mCode}`}
            control={
              <CustomCheckbox
                checked={selectedMeasures.has(mCode)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (readOnly) return;
                  toggleMeasure(mCode, e.target.checked);
                }}
              />
            }
            label={m.label}
            style={{ color: readOnly ? '#bbb' : '#555' }} 
          />
        );
      })}
    </>
  );
}

export default function SearchRadioModal(props: FormModalProps) {
  const { size, isOpen, setClose, selectedRow, periodParams } = props
  const mode = props.mode ?? 'create'
  const isUpdate = mode === 'update'

  /* --------------------- state --------------------- */
  const [reportName, setReportName] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  // A군(분류) 트리
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())
  const [allOptions, setAllOptions] = useState<CodeOption[]>([])
  const [parentOptions, setParentOptions] = useState<CodeOption[]>([])
  const [childrenByParent, setChildrenByParent] = useState<Record<string, CodeOption[]>>({})
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const [parentsWithChildren, setParentsWithChildren] = useState<Set<string>>(new Set())
  const [flatMode, setFlatMode] = useState(false)
  const [loadingParents, setLoadingParents] = useState<Set<string>>(new Set())

  const [parentsOfSelectedChildren, setParentsOfSelectedChildren] = useState<Set<string>>(new Set())
  const [vehicleParentsOfSelectedChildren, setVehicleParentsOfSelectedChildren] = useState<Set<string>>(new Set())

  // 측정값
  const [measureOptions, setMeasureOptions] = useState<CodeOption[]>([])
  const [selectedMeasures, setSelectedMeasures] = useState<Set<string>>(new Set())

  // 칩/행/열
  const [criteriaItems, setCriteriaItems] = useState<CodeOption[]>([])
  const [rowItems, setRowItems] = useState<CodeOption[]>([])
  const [colItems, setColItems] = useState<CodeOption[]>([])
  const [saving, setSaving] = useState(false)

  const codesReady = allOptions.length > 0

  // 수정모드에서 자동동기화 차단
  const [criteriaTouched, setCriteriaTouched] = useState(false)

 
  // 카드 청구 방식 코드
  const CLAIM_CARD_ONLY = '40';
  const CLAIM_CARD_PLUS_PAPER = '41';
  
  const [claimType, setClaimType] = useState<'40' | '41' | ''>('');

  const anyVehicleIn = (arr: CodeOption[]) => arr.some(it => isVehicleAxisCached(String(it.code)))

  useEffect(() => {
    if (!isOpen) return;

    const toArr = (v: any) =>
      Array.isArray(v)
        ? v
        : String(v ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

    const tokens = [...toArr(selectedRow?.x), ...toArr(selectedRow?.y)]
      .map((t) => String(t).trim().toUpperCase());

    const init: '40' | '41' | '' =
      tokens.includes('41') ? '41' : tokens.includes('40') ? '40' : '';

    setClaimType(init);

    setSelectedCodes((prev) => {
      const next = new Set(prev);
      next.delete('40');
      next.delete('41');
      if (init) next.add(init);
      return next;
    });
  }, [isOpen, selectedRow]);
 
  useEffect(() => {
    if (!isOpen) return
    setCriteriaTouched(false)
  }, [isOpen])

  /* --------------------- utils --------------------- */
  const norm = (v: any) => String(v ?? '').trim()

  // ‘유종/유종별’ 판정
  const isKoiCdLike = (label?: string) => {
    const s = String(label ?? '').replace(/\s+/g, '').toLowerCase();
    return s.includes('유종') || s.includes('유종별');
  };

  // “차종 3부모(화물/택시/버스)” 라벨 판정
  const isVehicleLabel = (label?: string) => /(화물|택시|버스)/.test(String(label ?? ''))

  // 기간 판별
  const isPeriodCode = (o: CodeOption | string) => {
    const code = typeof o === 'string' ? o : o.code
    const label = typeof o === 'string' ? o : o.label
    const c = String(code ?? '').trim().toUpperCase()
    const l = String(label ?? '').trim()
    return c.startsWith('PERIOD') || c === 'YM' || c === 'YY' || c === 'MM' || l.includes('기간')
  }

  const codeLabel = (code: string) => {
    const hit =
      allOptions.find((o) => norm(o.code) === norm(code)) ||
      measureOptions.find((o) => norm(o.code) === norm(code))
    return hit?.label ?? code
  }

  const toArray = (v: unknown): string[] => {
    if (!v) return []
    if (Array.isArray(v)) return v.map((x) => norm(x))
    if (typeof v === 'string') return v.split(',').map((s) => norm(s)).filter(Boolean)
    return []
  }

  const orderMap = useMemo(() => new Map(allOptions.map((o, i) => [norm(o.code), i])), [allOptions])
  const measureOrderMap = useMemo(() => new Map(measureOptions.map((m, i) => [norm(m.code), i])), [measureOptions])

  const toggleCode = (code: string, checked: boolean) => {
    const c = norm(code)
    setCriteriaTouched(true)
    setSelectedCodes((prev) => {
        // ✅ [하드가드] 유종(부모)이 이미 선택돼 있으면 그 부모의 '자식'은 어떤 경로로도 체크 불가
        if (checked) {
          const parent = parentCacheRef.current.get(c) // leaf → 부모
        // NEW (전역 가드): koiCd(유종) 하나라도 선택 시, 차량부모(화물/택시/버스)의 '자식' 선택 차단
          if (koiCdAnySelected && parent && vehicleParentCodes.has(norm(parent))) {
            alert('유종이 선택된 상태에서는 화물/택시/버스의 하위 항목(예: 톤별)을 선택할 수 없습니다.');
            return prev;
          }
          // 안전망: 부모가 koiCd(유종)로 체크된 경우 해당 자식 금지
          if (parent && prev.has(norm(parent)) && isKoiCdLike(codeLabel(parent))) {
            alert('유종(부모)이 선택되어 있어 해당 자식은 선택할 수 없습니다.');
            return prev;
          }
      }

      const next = new Set(prev)
      if (checked) next.add(c)
      else next.delete(c)
      return next
    })
  }

  const toggleMeasure = (code: string, checked: boolean) => {
    const c = norm(code)
    setCriteriaTouched(true)
    setSelectedMeasures((prev) => {
      const next = new Set(prev)
      if (checked) next.add(c)
      else next.delete(c)
      return next
    })
  }

  const loadChildrenIfNeeded = async (parentCode: string) => {
    const p = norm(parentCode)
    if (childrenByParent[p]) return
    const kids = await getStatsClsfChildren('A', p)
    setChildrenByParent((prev) => ({ ...prev, [p]: kids }))
  }

  const fetchParentCodeOf = async (code: string): Promise<string | null> => {
    const qs = new URLSearchParams()
    qs.set('clsfSeCd', 'A')
    qs.set('clsfCd', norm(code))
    qs.set('page', '1')
    qs.set('size', '1')

    const endpoint = `/fsm/star/cm/cm/getAllStatsClsfCd?${qs.toString()}`
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
    const row = (res?.data?.content ?? res?.data ?? [])[0]
    const parent = row?.clsfPrntCd ?? row?.CLSF_PRNT_CD ?? null
    return parent ? norm(parent) : null
  }

  const handlePeriodRequired = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    alert('기간은 비정형 통계리포트 생성시 필수입니다.')
  }, [])

  const guardPeriodChange =
    (isPeriod: boolean, code: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isPeriod) {
        handlePeriodRequired(e)
        return
      }
      toggleCode(code, e.target.checked)
    }

  // 월 리스트
  const monthRange = (bg: string, ed: string): string[] => {
    if (!bg || !ed) return []
    const s = bg.slice(0, 7).split('-').map((n) => parseInt(n, 10))
    const e = ed.slice(0, 7).split('-').map((n) => parseInt(n, 10))
    if (s.length < 2 || e.length < 2 || s.some(Number.isNaN) || e.some(Number.isNaN)) return []
    let [y, m] = [s[0], s[1]]
    const [ey, em] = [e[0], e[1]]
    const out: string[] = []
    while (y < ey || (y === ey && m <= em)) {
      out.push(`${y}-${String(m).padStart(2, '0')}`)
      m++
      if (m > 12) {
        y++
        m = 1
      }
    }
    return out
  }

  // 년 리스트
  const yearRange = (bg: string, ed: string): string[] => {
    if (!bg || !ed) return []
    const y1 = parseInt(bg.slice(0, 4), 10)
    const y2 = parseInt(ed.slice(0, 4), 10)
    if (Number.isNaN(y1) || Number.isNaN(y2)) return []
    const [a, b] = y1 <= y2 ? [y1, y2] : [y2, y1]
    const out: string[] = []
    for (let y = a; y <= b; y++) out.push(String(y))
    return out
  }

  const getPeriods = (params?: { bgngDt: string; endDt: string; mode: 'MM' | 'YY' }): string[] => {
    if (!params) return []
    const { bgngDt, endDt, mode } = params
    return mode === 'YY' ? yearRange(bgngDt, endDt) : monthRange(bgngDt, endDt)
  }

  // ───────── 부모 체인 추적 & 스코프 판정 ─────────
  const parentCacheRef = React.useRef(new Map<string, string | null>())

  const getParentCode = async (code: string): Promise<string | null> => {
    const c = norm(code)
    if (parentCacheRef.current.has(c)) return parentCacheRef.current.get(c)!
    const p = await fetchParentCodeOf(c)
    parentCacheRef.current.set(c, p)
    return p
  }

  const getRootInfo = async (code: string): Promise<{ rootCode: string; rootLabel: string }> => {
    let cur = norm(code)
    let lastLabel = codeLabel(cur)
    for (let i = 0; i < 6; i++) {
      const p = await getParentCode(cur)
      if (!p) break
      cur = norm(p)
      lastLabel = codeLabel(cur)
    }
    return { rootCode: cur, rootLabel: String(lastLabel ?? '').trim() }
  }

  const deriveVehicleScopeFromPlaced = async (): Promise<string> => {
    const items = [...rowItems, ...colItems]
    if (!items.length) return 'ALL'

    const hasAll = items.some((it) => /^(전체|ALL)$/i.test(String(it?.label ?? '').trim()))
    if (hasAll) return 'ALL'

    const flags = new Set<string>()
    for (const it of items) {
      const c = String(it?.code ?? '').trim()
      const l = String(it?.label ?? '').trim()
      if (!c || c === MEASURES_CHIP_CODE) continue
      if (isPeriodCode(it)) continue

      if (l.includes('화물')) flags.add('TR')
      if (l.includes('택시')) flags.add('TX')
      if (l.includes('버스')) flags.add('BS')
      if (flags.size === 3) return 'ALL'

      const { rootLabel } = await getRootInfo(c)
      if (rootLabel.includes('화물')) flags.add('TR')
      if (rootLabel.includes('택시')) flags.add('TX')
      if (rootLabel.includes('버스')) flags.add('BS')
      if (flags.size === 3) return 'ALL'
    }

    if (flags.size === 0 || flags.size === 3) return 'ALL'
    return Array.from(flags).join('|')
  }

  const toAggAxesFromPlaced = React.useCallback((arr: Array<{ code: string; label: string }>): AggAxis[] => {
    const out: AggAxis[] = []
    for (const it of arr || []) {
      const c = String(it.code ?? '').trim()
      if (!c || c === MEASURES_CHIP_CODE) continue
      if (isPeriodCode(it)) out.push({ type: 'YM' })
      else out.push({ type: 'CODE', code: c })
    }
    return out
  }, [])



  // 한 축 안에서 화물/택시/버스가 연속(붙어) 배치되어 있는지 검사
  const hasVehicleGapOnAxis = (items: CodeOption[]): boolean => {
    const vehicleIdx: number[] = []

    items.forEach((it, idx) => {
      if (isVehicleAxisCached(String(it.code))) {
        vehicleIdx.push(idx)
      }
    })

    // 차량축이 0개나 1개면 문제 없음
    if (vehicleIdx.length <= 1) return false

    const min = Math.min(...vehicleIdx)
    const max = Math.max(...vehicleIdx)
    const blockLen = max - min + 1

    // min~max 구간 길이와 차량축 개수가 다르면
    // → 차량축 사이에 다른 분류값이 끼어 있다는 뜻
    return blockLen !== vehicleIdx.length
  }
  
  const resetAxisForVehicleGap = (axis: 'row' | 'col') => {
    if (axis === 'row') {
      setRowItems(prev => {
        prev.forEach(it => addToCriteriaSorted(it))  // 칩 영역으로 복귀
        return []
      })
    } else {
      setColItems(prev => {
        prev.forEach(it => addToCriteriaSorted(it))
        return []
      })
    }
  }
  // ────────────────────────────────────────────
  // 출력: 현재 배치(행/열/측정값) → 서버 호출 → 프리뷰 모달 오픈
  // ────────────────────────────────────────────
  const onPrintReport = async () => {

    if(String(reportName ?? '').trim() === '') {
      alert('보고서 이름을 입력하세요.');
      return;
    }

    const totalPlaced = (rowItems?.length || 0) + (colItems?.length || 0);
    if (totalPlaced === 0) {
      alert('가로/세로 드래그 영역이 비어 있습니다. 분류기준을 모두 배치하세요.');
      return;
    }

    // 분류기준(Criteria)에 남아있는 분류 금지 (기간/측정값 칩 제외)
    const hasLeftInCriteria = (criteriaItems || []).some((it) => {
      const c = String(it?.code ?? '').trim();
      if (!c) return false;
      if (c === MEASURES_CHIP_CODE) return false;
      return !isPeriodCode(it);
    });
    if (hasLeftInCriteria) {
      alert('분류기준 영역에 남은 분류가 있습니다. 모든 분류를 행 또는 열로 배치해 주세요.');
      return;
    }
    //측정값 최소 1개 선택 가드
    const selectedMeasuresArr = getSelectedMeasures();
    if (selectedMeasuresArr.length === 0) {
      alert('측정값을 한 개 이상 선택하세요.');
      return;
    }

    // 최종 가드: 차량 축이 양쪽에 동시에 배치되었는지 검사
    if (anyVehicleIn(rowItems) && anyVehicleIn(colItems)) {
      alert('화물/택시/버스 축은 가로/세로 중 한쪽에만 배치해야 합니다. 배치를 수정해 주세요.')
      return
    }
    // 새로 추가: 한 축 안에서 차량축 사이에 다른 분류값이 끼었는지 검사
    if (hasVehicleGapOnAxis(rowItems)) {
      alert('가로축에서 화물/택시/버스 축은 서로 붙어서 배치해야 합니다.\n중간에 기간 등 다른 분류값을 끼울 수 없습니다.');
      resetAxisForVehicleGap('row');
      return;
    }
    if (hasVehicleGapOnAxis(colItems)) {
      alert('세로축에서 화물/택시/버스 축은 서로 붙어서 배치해야 합니다.\n중간에 기간 등 다른 분류값을 끼울 수 없습니다.');
      resetAxisForVehicleGap('col');
      return;
    }

    setReportLoading(true);
    try {
      // 1) 현재 배치에서 축/스코프 구성
      const vehicleScope = await deriveVehicleScopeFromPlaced();
      const x = toAggAxesFromPlaced(rowItems);
      const y = toAggAxesFromPlaced(colItems);
      // 교체 (서버가 기대하는 AggAxis 객체 배열)
      const m: AggAxis[] = getSelectedMeasures().map((mm) => ({
        type: 'CODE',
        code: String(mm.code ?? '').trim(),
      }))

      // 2) 기간/리포트 기본 파라미터
      const mode = periodParams?.mode === 'YY' ? 'YY' : 'MM';
      const fromYm = String(periodParams?.bgngDt ?? '').trim();
      const toYm = String(periodParams?.endDt ?? '').trim();
      
      // YM/기간 축은 모두 '1' 코드로 치환
      const toPeriodCode1 = (axes: AggAxis[]) =>
        axes.map(a => {
          if (a.type === 'YM') return { type: 'CODE', code: '1' };
          if (a.type === 'CODE' && a.code && isPeriodCode(a.code)) return { type: 'CODE', code: '1' };
          return a;
        });

      const x2 = toPeriodCode1(x);
      const y2 = toPeriodCode1(y);

      // 3) 페이로드
      const payload = {
        rptpSn: String((selectedRow as any)?.rptpSn ?? '').trim(),
        rptpNm: String(reportName ?? '').trim(),
        vehicleScope,
        x: x2,
        y: y2,
        m: m,
        fromYm,
        toYm,
        mode,
        skeletonOnly: false,
        noCodeUpdate: false,
      };

      // 4) 호출
      const res = await sendHttpRequest(
        'POST',
        '/fsm/star/usr/usr/updateReportAndPrint',
        payload,
        true,
        { cache: 'no-store' },
      );
      const dataAny = (res as any)?.data ?? res;

      // 5) 백엔드 응답 포맷 호환 처리 → PivotResponse
      const toPivotResponse = (raw: any): PivotResponse => {
        const headerRows: PivotCell[][] =
          Array.isArray(raw?.headerRows)
            ? raw.headerRows
            : Array.isArray(raw?.columnHeaders)
              ? raw.columnHeaders.map((r: any[]) =>
                  r.map((t: any) => ({ text: t, isHeader: true } as PivotCell)),
                )
              : [];

        const bodyRows: PivotCell[][] =
          Array.isArray(raw?.bodyRows)
            ? raw.bodyRows
            : Array.isArray(raw?.rows)
              ? raw.rows.map((r: any[]) =>
                  r.map((t: any) => ({ text: t } as PivotCell)),
                )
              : [];

        return {
          title: raw?.title ?? '',
          headerRows,
          bodyRows,
        };
      };

    // 6) 프리뷰 모달 열기
    const pivot = toPivotResponse(dataAny);
    const locgovNm = (selectedRow?.ctpvNm ?? '').trim() || '';
    // ✅ 부모에게 프리뷰 띄워달라고 요청하고, 모달은 닫기

    props.onPreview?.(pivot, { title: payload.rptpNm, bgngDt: payload.fromYm, endDt: payload.toYm, locgovNm });
    props.setClose();
    } catch (e) {
      console.error(e);
      alert('출력 중 오류가 발생했습니다.');
    } finally {
      setReportLoading(false);
    }
  };

  /* -------- 분류기준 칩 구성(기간 칩 포함) -------- */

  const measuresGroupLabel = useMemo(() => {
    if (selectedMeasures.size === 0) return '측정값'
    const order = new Map(measureOptions.map((m, i) => [norm(m.code), i]))
    const chosen = Array.from(selectedMeasures).map(norm)
    chosen.sort((a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9))
    const names = chosen.map((c) => measureOptions.find((m) => norm(m.code) === c)?.label ?? codeLabel(c))
    return `측정값(${names.join(', ')})`
  }, [selectedMeasures, measureOptions])

  const buildCriteriaItems = React.useCallback((): CodeOption[] => {
    const sel = new Set(Array.from(selectedCodes).map(norm))
    const dropParents = new Set<string>(parentsOfSelectedChildren)
    const claimCd = (typeof (claimType as any) === 'string' ? (claimType as string).trim() : '')
    //claimCd가 ''(전체)이면 40/41은 절대 칩으로 내리지 않음 (선택셋에서도 제거)
    if (!claimCd) {
      sel.delete('40');
      sel.delete('41');
    } else if (claimCd === '40' || claimCd === '41') {
      // ② 값이 있으면 상호배타 정리: 선택셋에는 해당 값만 남김
      sel.delete('40');
      sel.delete('41');
      sel.add(claimCd);
      if (mode !== 'update' && !selectedCodes.has(claimCd)) {
        setSelectedCodes(prev => {
          const next = new Set(prev);
          next.add(claimCd);
          return next;
        });
      }
    }

    //라디오 버튼 값 추가해줌
    if (claimCd === '40' || claimCd === '41') {
      sel.add(claimCd);
      if (mode !== 'update' && !selectedCodes.has(claimCd)) {
        setSelectedCodes(prev => {
          const next = new Set(prev);
          next.add(claimCd);
          return next;
        });
      }
    }

    parentOptions.forEach((p) => {
      const pCode = norm(p.code)
      const kids = (childrenByParent[pCode] || []).map((k) => norm(k.code))
      if (kids.some((k) => sel.has(k))) dropParents.add(pCode)
    })

    const filtered = Array.from(sel).filter((c) => !dropParents.has(c))
    filtered.sort((a, b) => (orderMap.get(a) ?? 1e9) - (orderMap.get(b) ?? 1e9))

    const base: CodeOption[] = filtered.map((code) => ({ code, label: codeLabel(code) }))

    const periodOpt = allOptions.find(isPeriodCode as any)
    if (periodOpt) {
      const pCode = norm(periodOpt.code)
      const alreadyPlaced =
        rowItems.some((r) => norm(r.code) === pCode) || colItems.some((c) => norm(c.code) === pCode)
      const alreadyInChips = base.some((b) => norm(b.code) === pCode)
      if (!alreadyPlaced && !alreadyInChips) {
        base.unshift({ code: pCode, label: codeLabel(pCode) })
      }
    }
    return base
  }, [
    selectedCodes,
    selectedMeasures,
    measuresGroupLabel,
    parentOptions,
    childrenByParent,
    orderMap,
    parentsOfSelectedChildren,
    allOptions,
    rowItems,
    colItems,
  ])

  /* --------------------- save --------------------- */
  const saveCriteria = async () => {
    // 신규 입력(create)에서만 동작 보장
    if (mode !== 'create') return;

    // 1) 현재 선택 상태로 "완전히 새로" 칩을 구성
    const fresh = buildCriteriaItems();

    // 2) 혹시 모를 중복 방지(코드 기준 고유화)
    const seen = new Set<string>();
    const deduped = fresh.filter((it) => {
      const c = norm(it.code);
      if (seen.has(c)) return false;
      seen.add(c);
      return true;
    });

    // 3) 이전 배치(행/열/칩) 초기화 후, 새 칩만 반영
    setCriteriaTouched(false);
    setRowItems([]);
    setColItems([]);
    setCriteriaItems(deduped);

    // 4) 선택 유효성(선택 아무것도 없는 경우 안내)
    const pickedCount = deduped.filter((it) => it.code !== MEASURES_CHIP_CODE && !isPeriodCode(it)).length;
    if (pickedCount === 0 && selectedMeasures.size === 0) {
      alert('분류 코드나 측정값을 한 개 이상 선택하세요.');
    }
  };


  // 선택한 측정값만 + 옵션 정의 순서
  const getSelectedMeasures = React.useCallback((): Array<{ code: string; label: string }> => {
    const order = new Map(measureOptions.map((m, i) => [norm(m.code), i]))
    const picked = Array.from(selectedMeasures).map(norm)
    picked.sort((a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9))
    return picked.map((c) => ({ code: c, label: codeLabel(c) }))
  }, [selectedMeasures, measureOptions])

  // ────────────────────────────────────────────
  // PREVIEW: 피벗 테이블
  // ────────────────────────────────────────────
  const renderPreviewTable = (): JSX.Element => {
    type Lbl = { code: string; label: string }

    const periods = getPeriods(periodParams)
    const measures: Lbl[] = getSelectedMeasures()

    const isMeasChip = (c: string) => String(c ?? '').trim() === MEASURES_CHIP_CODE
    const isPeriodChip = (c: string) => {
      const opt = optionForCode(String(c ?? '').trim())
      return isPeriodCode(opt)
    }

    const periodOnRows = rowItems.some((it) => isPeriodChip(it.code))
    const periodOnCols = colItems.some((it) => isPeriodChip(it.code))
    const useCols = periodOnCols || (!periodOnRows && !periodOnCols)

    const measuresOnRows = rowItems.some((it) => isMeasChip(it.code))
    const measuresOnCols = !measuresOnRows && colItems.some((it) => isMeasChip(it.code))

    const rowDims: Lbl[] = rowItems
      .filter((it) => !isMeasChip(it.code) && !isPeriodChip(it.code))
      .map((it) => ({ code: String(it.code), label: it.label }))
    const colDims: Lbl[] = colItems
      .filter((it) => !isMeasChip(it.code) && !isPeriodChip(it.code))
      .map((it) => ({ code: String(it.code), label: it.label }))

    const th: React.CSSProperties = {
      border: '1px solid #ddd',
      padding: '6px 8px',
      whiteSpace: 'nowrap',
      textAlign: 'center',
      fontWeight: 600,
      background: '#f6f8fb',
    }
    const td: React.CSSProperties = { border: '1px solid #eee', padding: '6px 8px', whiteSpace: 'nowrap', textAlign: 'center' }
    const tdHead: React.CSSProperties = { ...td, fontWeight: 700, textAlign: 'left', background: '#fff' }
    const rowHeaderTitle = rowDims.length ? rowDims.map((d) => d.label).join(' · ') : '행'

    if (useCols) {
      return (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 900, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>{rowHeaderTitle}</th>
                {measuresOnRows && <th style={th}>측정값</th>}
                {(colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).map((cd) => (
                  <th
                    key={`h-colDim-${cd.code}`}
                    style={th}
                    colSpan={(periods.length ? periods.length : 1) * (measuresOnCols ? Math.max(1, measures.length) : 1)}
                  >
                    {cd.label || ' '}
                  </th>
                ))}
              </tr>
              {periods.length > 0 && (
                <tr>
                  <th style={{ ...th, background: '#fff' }} />
                  {measuresOnRows && <th style={{ ...th, background: '#fff' }} />}
                  {(colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) =>
                    (periods.length ? periods : ['_']).map((p) => (
                      <th key={`h-colDim-${cd.code}-p-${p}`} style={th} colSpan={measuresOnCols ? Math.max(1, measures.length) : 1}>
                        {p}
                      </th>
                    )),
                  )}
                </tr>
              )}
              {measuresOnCols && (
                <tr>
                  <th style={{ ...th, background: '#fff' }} />
                  {measuresOnRows && <th style={{ ...th, background: '#fff' }} />}
                  {(colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) =>
                    (periods.length ? periods : ['_']).flatMap((p) => measures.map((m) => <th key={`h-${cd.code}-${p}-${m.code}`} style={th}>{m.label}</th>)),
                  )}
                </tr>
              )}
            </thead>
            <tbody>
              {(rowDims.length ? rowDims : [{ code: '_TOTAL_', label: '합계' }]).map((r) => {
                if (measuresOnRows) {
                  return measures.map((m, i) => (
                    <tr key={`r-${r.code}-${m.code}`}>
                      {i === 0 && <td style={tdHead} rowSpan={Math.max(1, measures.length)}>{r.label}</td>}
                      <td style={td}>{m.label}</td>
                      {(colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) =>
                        (periods.length ? periods : ['_']).map((p) => <td key={`v-${r.code}-${m.code}-${cd.code}-${p}`} style={td}>—</td>),
                      )}
                    </tr>
                  ))
                }
                return (
                  <tr key={`r-${r.code}`}>
                    <td style={tdHead}>{r.label}</td>
                    {measuresOnCols
                      ? (colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) =>
                          (periods.length ? periods : ['_']).flatMap((p) => measures.map((m) => <td key={`v-${r.code}-${cd.code}-${p}-${m.code}`} style={td}>—</td>)),
                        )
                      : (colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) =>
                          (periods.length ? periods : ['_']).map((p) => <td key={`v-${r.code}-${cd.code}-${p}`} style={td}>—</td>),
                        )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }

    const bodyRows: JSX.Element[] = []
    const per = periods.length ? periods : ['_']
    const rows = rowDims.length ? rowDims : [{ code: '_TOTAL_', label: '합계' }]

    for (const p of per) {
      for (const r of rows) {
        if (measuresOnRows) {
          measures.forEach((m, i) => {
            bodyRows.push(
              <tr key={`r-${p}-${r.code}-${m.code}`}>
                {i === 0 && <td style={tdHead} rowSpan={Math.max(1, measures.length)}>{p}</td>}
                <td style={td}>{m.label}</td>
                {i === 0 && <td style={tdHead} rowSpan={Math.max(1, measures.length)}>{r.label}</td>}
                {measuresOnCols
                  ? (colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) => measures.map((mm) => <td key={`v-${p}-${r.code}-${m.code}-${cd.code}-${mm.code}`} style={td}>—</td>))
                  : (colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).map((cd) => <td key={`v-${p}-${r.code}-${cd.code}`} style={td}>—</td>)}
              </tr>,
            )
          })
        } else {
          bodyRows.push(
            <tr key={`r-${p}-${r.code}`}>
              <td style={tdHead}>{p}</td>
              <td style={tdHead}>{r.label}</td>
              {measuresOnCols
                ? (colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) => measures.map((m) => <td key={`v-${p}-${r.code}-${cd.code}-${m.code}`} style={td}>—</td>))
                : (colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).map((cd) => <td key={`v-${p}-${r.code}-${cd.code}`} style={td}>—</td>)}
            </tr>,
          )
        }
      }
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 900, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>기간</th>
              {measuresOnRows && <th style={th}>측정값</th>}
              <th style={th}>{rowHeaderTitle}</th>
              {(colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).map((cd) => (
                <th key={`h-colDim-${cd.code}`} style={th} colSpan={measuresOnCols ? Math.max(1, measures.length) : 1}>
                  {cd.label || ' '}
                </th>
              ))}
            </tr>
            {measuresOnCols && (
              <tr>
                <th style={{ ...th, background: '#fff' }} />
                {measuresOnRows && <th style={{ ...th, background: '#fff' }} />}
                <th style={{ ...th, background: '#fff' }} />
                {(colDims.length ? colDims : [{ code: '_ONE_', label: '' }]).flatMap((cd) =>
                  measures.map((m) => <th key={`h-${cd.code}-${m.code}`} style={th}>{m.label}</th>),
                )}
              </tr>
            )}
          </thead>
          <tbody>
            {bodyRows.length ? (
              bodyRows
            ) : (
              <tr>
                <td
                  colSpan={3 + (colDims.length ? colDims.length : 1) * (measuresOnCols ? Math.max(1, measures.length) : 1)}
                  style={td}
                >
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const renderServerPivotTable = (p: PivotResponse): JSX.Element => {
    const thCss: React.CSSProperties = { border: '1px solid #ddd', padding: '6px 8px', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 600, background: '#f6f8fb' }
    const tdCss: React.CSSProperties = { border: '1px solid #eee', padding: '6px 8px', whiteSpace: 'nowrap', textAlign: 'center' }

    const renderCell = (cell: PivotCell, idx: number, asHeader: boolean) => {
      const colSpan = cell.colSpan && cell.colSpan > 1 ? cell.colSpan : 1
      const rowSpan = cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : 1
      const text = cell.text ?? ''
      if (asHeader || cell.isHeader) return <th key={idx} style={thCss} colSpan={colSpan} rowSpan={rowSpan}>{text}</th>
      return <td key={idx} style={tdCss} colSpan={colSpan} rowSpan={rowSpan}>{text}</td>
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 900, borderCollapse: 'collapse' }}>
          <thead>
            {(p.headerRows ?? []).map((row, rIdx) => (
              <tr key={`h-${rIdx}`}>{row.map((cell, cIdx) => renderCell(cell, cIdx, true))}</tr>
            ))}
          </thead>
          <tbody>
            {(p.bodyRows ?? []).map((row, rIdx) => (
              <tr key={`b-${rIdx}`}>{row.map((cell, cIdx) => renderCell(cell, cIdx, false))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

/*
  // 미리보기에서 "엑셀 다운로드" 버튼
  const onDownloadPreviewExcel = async () => {
    if (!pivotData) return
    const toAOA = (p: PivotResponse): (string | number)[][] => {
      const aoa: (string | number)[][] = []
      if (p.headerRows?.length) for (const row of p.headerRows) aoa.push(row.map((c) => (c?.text ?? '') as any))
      for (const row of p.bodyRows || []) aoa.push(row.map((c) => (c?.text ?? '') as any))
      return aoa
    }
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(toAOA(pivotData))
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const fileName = `${String(reportName ?? 'report').trim()}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
*/
  /* --------------------- load & init --------------------- */
  useEffect(() => {
    setReportName(selectedRow?.rptpNm ?? '')
  }, [selectedRow, isOpen])

  useEffect(() => {
    if (!isOpen) return
    let alive = true
    ;(async () => {
      try {
        const { parents, all, flatMode } = await loadStatsClsfForModal('A')
        const withChildren = await getStatsClsfHasChildrenSet('A')
        if (!alive) return
        setParentOptions(parents)
        setAllOptions(all)
        setParentsWithChildren(withChildren)
        setFlatMode(flatMode)
        setExpandedParents(new Set())
      } catch {
        if (!alive) return
        setParentOptions([])
        setAllOptions([])
        setParentsWithChildren(new Set())
        setFlatMode(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      try {
        const { all } = await loadStatsClsfForModal('B')
        setMeasureOptions(all || [])
      } catch {
        setMeasureOptions([])
      }
    })()
  }, [isOpen])

  // x/y 자동선택
  useEffect(() => {
    if (!isOpen || !allOptions.length) return
    const toSet = new Set<string>()
    const want = new Set([...toArray(selectedRow?.x), ...toArray(selectedRow?.y)])
    const codeSet = new Set(allOptions.map((o) => norm(o.code)))
    const labelToCode = new Map(allOptions.map((o) => [o.label, norm(o.code)]))
    want.forEach((v) => {
      const vNorm = norm(v)
      if (vNorm === '40' || vNorm === '41') return;
      if (codeSet.has(vNorm)) toSet.add(vNorm)
      const byLabel = labelToCode.get(vNorm) ?? labelToCode.get(v)
      if (byLabel) toSet.add(byLabel)
    })

    setSelectedCodes(toSet)
  }, [isOpen, selectedRow, allOptions])

  // ✅ selectedCodes → 라디오 값 동기화 (항상 마지막에 이긴다)
  useEffect(() => {
    if (!isOpen) return;
    const v =
      selectedCodes.has('41') ? '41' :
      selectedCodes.has('40') ? '40' : '';
    if (v !== claimType) setClaimType(v as '40' | '41' | '');
  }, [isOpen, selectedCodes]);

  // 기간코드 항상 체크
  useEffect(() => {
    if (!isOpen || !allOptions.length) return
    const periodOpt = allOptions.find(isPeriodCode as any)
    if (!periodOpt) return
    const p = norm(periodOpt.code)
    setSelectedCodes((prev) => {
      if (prev.has(p)) return prev
      const next = new Set(prev)
      next.add(p)
      return next
    })
  }, [isOpen, allOptions])

  // “차종 3부모” 코드 집합
  const vehicleParentCodes = useMemo(
    () => new Set(parentOptions.filter((p) => isVehicleLabel(p.label)).map((p) => norm(p.code))),
    [parentOptions]
  )
  /** 차량 축(화물/택시/버스)에 속하는 코드인지 캐시 기반으로 판정 */
  const isVehicleAxisCached = (code: string): boolean => {
    const c0 = norm(code)
    if (!c0) return false
    if (vehicleParentCodes.has(c0)) return true // 부모 자체
    // 부모 체인 타고 올라가며 판정 (캐시 내에서만)
    let cur = c0
    let hop = 0
    while (parentCacheRef.current.has(cur) && parentCacheRef.current.get(cur) && hop < 6) {
      const p = norm(parentCacheRef.current.get(cur)!)
      if (vehicleParentCodes.has(p)) return true
      cur = p
      hop++
    }
    // 라벨 힌트(보수적)
    if (isVehicleLabel(codeLabel(c0))) return true
    return false
  }

  // 자식 선택 시 부모 자동 체크
  useEffect(() => {
    if (!isOpen || !parentOptions.length || selectedCodes.size === 0) return
    const parentSet = new Set(parentOptions.map((p) => norm(p.code)))
    const childrenOnly = Array.from(selectedCodes).filter((c) => !parentSet.has(c) && !isPeriodCode(c))
    if (childrenOnly.length === 0) return
    ;(async () => {
      const parents = await Promise.all(childrenOnly.map(fetchParentCodeOf))
      const toAdd = parents
        .map((p) => (p ? norm(p) : null))
        .filter((p): p is string => !!p)
        .filter((p) => !selectedCodes.has(p))
        // ✅ 유종 부모는 자동추가 금지 (부모는 직접 선택해야 함)
        .filter((p) => !isKoiCdLike(codeLabel(p)))

      if (toAdd.length === 0) return
      setSelectedCodes((prev) => {
        const next = new Set(prev)
        toAdd.forEach((p) => next.add(p))
        return next
      })
    })()
  }, [isOpen, parentOptions, selectedCodes])


  // 부모 제외 목록(칩 영역) + “자식이 선택된 부모 집합(전체/차종)” 추적
  useEffect(() => {
    if (!isOpen || !parentOptions.length) {
      setParentsOfSelectedChildren(new Set())
      setVehicleParentsOfSelectedChildren(new Set())
      return
    }
    const parentSet = new Set(parentOptions.map((p) => norm(p.code)))
    const childrenOnly = Array.from(selectedCodes).filter((c) => !parentSet.has(c) && !isPeriodCode(c))
    if (childrenOnly.length === 0) {
      setParentsOfSelectedChildren(new Set())
      setVehicleParentsOfSelectedChildren(new Set())
      return
    }
    ;(async () => {
      const parents = await Promise.all(childrenOnly.map(fetchParentCodeOf))
      const allParentsSet = new Set(parents.filter((p): p is string => !!p).map(norm))
      setParentsOfSelectedChildren(allParentsSet)

      const vehicleOnly = new Set<string>()
      allParentsSet.forEach((p) => {
        if (vehicleParentCodes.has(norm(p))) vehicleOnly.add(norm(p))
      })
      setVehicleParentsOfSelectedChildren(vehicleOnly)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, parentOptions, selectedCodes, vehicleParentCodes.size])

  // flatMode에서 leaf의 부모정보 미리 캐싱(비활성화 계산용)
  useEffect(() => {
    if (!isOpen || !allOptions.length) return
    const leafs = allOptions.filter((o) => !parentsWithChildren.has(norm(o.code)) && !isPeriodCode(o))
    ;(async () => {
      await Promise.all(leafs.map((o) => getParentCode(norm(o.code))))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, allOptions, parentsWithChildren])

  // 수정모드: 자동 반영
  useEffect(() => {
    if (!isOpen || mode !== 'update' || criteriaTouched) return
    if (allOptions.length === 0) return
    if ((selectedRow as any)?.m && measureOptions.length === 0) return
    setCriteriaItems(buildCriteriaItems())
  }, [isOpen, mode, criteriaTouched, allOptions.length, measureOptions.length, selectedCodes, selectedMeasures, buildCriteriaItems, selectedRow])

  // 수정모드: m 체크
  useEffect(() => {
    if (!isOpen || measureOptions.length === 0) return
    const incoming = toArray((selectedRow as any)?.m)
    if (incoming.length === 0) return
    const normed = incoming.map((v) => norm(v))
    const codeSet = new Set(measureOptions.map((m) => norm(m.code)))
    const labelToCode = new Map(measureOptions.map((m) => [norm(m.label), norm(m.code)]))
    const picked = new Set<string>()
    normed.forEach((v) => {
      if (codeSet.has(v)) picked.add(v)
      else {
        const byLabel = labelToCode.get(v)
        if (byLabel) picked.add(byLabel)
      }
    })
    if (picked.size > 0) setSelectedMeasures(picked)
  }, [isOpen, selectedRow, measureOptions])

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) return
    setRowItems([])
    setColItems([])
    setCriteriaTouched(false)
    if (mode === 'create') setCriteriaItems([])
  }, [isOpen, mode])

  /* --------------------- DnD helpers --------------------- */
  const optionForCode = React.useCallback(
    (code: string): CodeOption => {
      const c = norm(code)
      if (c === MEASURES_CHIP_CODE) return { code: MEASURES_CHIP_CODE, label: measuresGroupLabel }
      return (
        allOptions.find((o) => norm(o.code) === c) ??
        measureOptions.find((o) => norm(o.code) === c) ?? { code: c, label: codeLabel(c) }
      )
    },
    [allOptions, measureOptions, measuresGroupLabel],
  )

  const ensureAddUnique = (arr: CodeOption[], item: CodeOption) => {
    const c = norm(item.code)
    if (arr.some((it) => norm(it.code) === c)) return arr
    return [...arr, item]
  }

  const addToCriteriaSorted = React.useCallback(
    (item: CodeOption) => {
      const c = norm(item.code)
      setCriteriaItems((prev) => {
        if (prev.some((it) => norm(it.code) === c)) return prev
        const next = [...prev, { code: c, label: item.label }]
        next.sort((a, b) => {
          const ra = orderMap.get(norm(a.code)) ?? measureOrderMap.get(norm(a.code)) ?? 1e9
          const rb = orderMap.get(norm(b.code)) ?? measureOrderMap.get(norm(b.code)) ?? 1e9
          return ra - rb
        })
        return next
      })
    },
    [orderMap, measureOrderMap],
  )

  const removeFromCriteria = (code: string) => {
    const c = norm(code)
    setCriteriaTouched(true)
    setCriteriaItems((prev) => prev.filter((it) => norm(it.code) !== c))
  }

  const moveBetweenLists = (from: 'row' | 'col', to: 'row' | 'col', code: string) => {
    const c = norm(code)
    const item = optionForCode(c)
    if (from === 'row' && to === 'col') {
      setRowItems((prev) => prev.filter((it) => norm(it.code) !== c))
      setColItems((prev) => ensureAddUnique(prev, item))
    } else if (from === 'col' && to === 'row') {
      setColItems((prev) => prev.filter((it) => norm(it.code) !== c))
      setRowItems((prev) => ensureAddUnique(prev, item))
    }
  }

  const onDragStart =
    (source: 'criteria' | 'row' | 'col', code: string) =>
    (e: React.DragEvent<HTMLElement>) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ source, code: norm(code) }))
      e.dataTransfer.effectAllowed = 'move'
    }

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

const onDropTo =
  (target: 'row' | 'col') =>
  async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();

    let payload: any = {};
    try {
      payload = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
    } catch {}

    const src: 'criteria' | 'row' | 'col' | undefined = payload.source;
    const code: string | undefined = payload.code;
    if (!code || !src) return;

    const cNorm = norm(code);
    const item = optionForCode(cNorm);

    // 부모 캐시 보강 (차량축 판정용)
    if (!parentCacheRef.current.has(cNorm)) {
      await getParentCode(cNorm);
    }

    // 🔍 드롭 후 상태를 미리 시뮬레이션
    let nextRow = rowItems;
    let nextCol = colItems;

    if (src === 'criteria') {
      if (target === 'row') {
        nextRow = ensureAddUnique(rowItems, item);
      } else {
        nextCol = ensureAddUnique(colItems, item);
      }
    } else if (src === 'row' && target === 'col') {
      nextRow = rowItems.filter((it) => norm(it.code) !== cNorm);
      nextCol = ensureAddUnique(colItems, item);
    } else if (src === 'col' && target === 'row') {
      nextCol = colItems.filter((it) => norm(it.code) !== cNorm);
      nextRow = ensureAddUnique(rowItems, item);
    }

    const rowHasVehicleNext = anyVehicleIn(nextRow);
    const colHasVehicleNext = anyVehicleIn(nextCol);

    // 1) 차량 축은 가로/세로 둘 다에 동시에 있으면 안됨
    if (rowHasVehicleNext && colHasVehicleNext) {
      alert('화물/택시/버스 축은 가로/세로 중 한쪽에만 배치할 수 있습니다.');
      return;
    }

    // 2) 한 축 안에서 차량축 사이에 다른 분류값이 끼었는지 검사
    if (hasVehicleGapOnAxis(nextRow)) {
      alert(
        '가로축에서 화물/택시/버스 축은 서로 붙어서 배치해야 합니다.\n' +
        '중간에 기간 등 다른 분류값을 끼울 수 없습니다.'
      );
       resetAxisForVehicleGap('row');
      return;
    }
    if (hasVehicleGapOnAxis(nextCol)) {
      alert(
        '세로축에서 화물/택시/버스 축은 서로 붙어서 배치해야 합니다.\n' +
        '중간에 기간 등 다른 분류값을 끼울 수 없습니다.'
      );
       resetAxisForVehicleGap('col');
      return;
    }

    // ✅ 여기까지 통과하면 실제 state 반영
    if (src === 'criteria') {
      setCriteriaTouched(true);
      removeFromCriteria(cNorm);
      if (target === 'row') {
        setRowItems((prev) => ensureAddUnique(prev, item));
      } else {
        setColItems((prev) => ensureAddUnique(prev, item));
      }
    } else if (src !== target) {
      // 기존 이동 로직 그대로 재사용
      moveBetweenLists(src, target, cNorm);
    }
  };

  // 가로/세로 분류값 뒤집기
  const handleSwapRowCol = () => {
    // 둘 다 비어 있으면 할 일 없음
    if (rowItems.length === 0 && colItems.length === 0) return

    // 현재 상태 기준으로 단순 스왑
    const nextRow = colItems
    const nextCol = rowItems

    setRowItems(nextRow)
    setColItems(nextCol)
  }

  const removeRowItem = (code: string) => {
    const c = norm(code)
    setRowItems((prev) => prev.filter((it) => norm(it.code) !== c))
    addToCriteriaSorted(optionForCode(c))
  }

  const removeColItem = (code: string) => {
    const c = norm(code)
    setColItems((prev) => prev.filter((it) => norm(it.code) !== c))
    addToCriteriaSorted(optionForCode(c))
  }

  /* --------------------- disabled rules --------------------- */
  const hasAnyVehicleChildSelected = vehicleParentsOfSelectedChildren.size > 0

  // 유종(koiCd) 계열이 하나라도 선택되어 있는지
  const koiCdAnySelected = useMemo(
    () => Array.from(selectedCodes).some((c) => isKoiCdLike(codeLabel(c))),
    [selectedCodes, allOptions],
  );
  // 선택된 “차종” 자식의 부모 외의 차종 부모는 비활성화
  const isParentBlocked = (parentCode: string) => {
    const p = norm(parentCode)
    if (!hasAnyVehicleChildSelected) return false
    if (!vehicleParentCodes.has(p)) return false
    return !vehicleParentsOfSelectedChildren.has(p)
  }

  // flatMode leaf: 부모가 차종이고, 선택된 차종 부모가 아니라면 비활성화
  const isChildBlockedByOtherParent = (childCode: string) => {
    if (!hasAnyVehicleChildSelected) return false
    const c = norm(childCode)
    const parent = parentCacheRef.current.get(c)
    if (!parent) return false
    const pNorm = norm(parent)
    if (!vehicleParentCodes.has(pNorm)) return false
    return !vehicleParentsOfSelectedChildren.has(pNorm)
  }

  // ★ 유종/유종별 부모가 선택된 경우, 그 부모의 자식(레벨) 전부 비활성화
  const isLeafBlockedByKoiCdParentSelected = (leafCode: string) => {
    const parent = parentCacheRef.current.get(norm(leafCode));
    if (!parent) return false;
    const parentSelected = selectedCodes.has(norm(parent));
    const parentIsKoi = isKoiCdLike(codeLabel(parent));
    return parentSelected && parentIsKoi;
  };

  // 라디오 변경 시: selectedCodes에서 40/41을 싹 지우고, 선택한 하나만 넣어줌
  const handleClaimTypeChange = (_e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setClaimType(value as '40' | '41'|'' );
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      next.delete(CLAIM_CARD_ONLY);
      next.delete(CLAIM_CARD_PLUS_PAPER);
      if (value) next.add(value as '40' | '41');
      return next;
    });
  };
  /* --------------------- picker UI --------------------- */
  const renderCodePicker = () => {
    if (!codesReady) {
      return (
        <Box sx={{ p: 1, minHeight: 160 }}>
          <FormGroup row sx={{ gap: '8px' }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={160} height={32} />
            <Skeleton variant="rounded" width={110} height={32} />
          </FormGroup>
          <Box sx={{ mt: 1.5 }}>
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="rounded" width="100%" height={64} />
          </Box>
        </Box>
      )
    }

    if (flatMode) {
      return (
        <>
          <FormGroup row sx={{ gap: '8px', p: 0.5 }}>
            {allOptions.map((o) => {
              const isPeriod = isPeriodCode(o)
              const code = norm(o.code)
              if (code === '40' || code === '41') return null; // Skip 40/41 codes
              const checked = isPeriod ? true : selectedCodes.has(code)
              const isParentNode = parentsWithChildren.has(code)

              const disabledByParentRule = isParentNode ? isParentBlocked(code) : isChildBlockedByOtherParent(code)
              const disabledByKoiCdLeaf = !isParentNode && isKoiCdLike(o.label) // leaf ‘유종/유종별’ 금지
              const disabledByKoiCdParentSelected = !isParentNode && isLeafBlockedByKoiCdParentSelected(code)
              // NEW: 유종이 하나라도 선택된 상태라면, 화물/택시/버스 '부모의 자식'은 전역적으로 금지
              const parentOfLeaf = parentCacheRef.current.get(code) || null;
              const disabledByKoiCdGlobal =
                !isParentNode && koiCdAnySelected && parentOfLeaf && vehicleParentCodes.has(norm(parentOfLeaf));

              const disabled =
                !!disabledByParentRule ||
                !!disabledByKoiCdLeaf ||
                !!disabledByKoiCdParentSelected ||
                !!disabledByKoiCdGlobal;

              const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (disabled) return
                if (isPeriod) { handlePeriodRequired(e as any); return }
                toggleCode(code, e.target.checked)
              }

              return (
                <FormControlLabel
                  key={`flat:${code}`}
                  disabled={disabled}
                  control={
                    <CustomCheckbox
                      name="reportTypesFlat"
                      value={code}
                      checked={checked}
                      disabled={disabled}
                      onClick={isPeriod ? handlePeriodRequired : undefined}
                      onChange={onChange}
                    />
                  }
                  label={o.label}
                  style={{ color: disabled ? '#bbb' : '#555' }}
                />
              )
            })}
          </FormGroup>
        </>
      )
    }

    // 아코디언
    return (
      <>
        {parentOptions.map((p, idx) => {
          const pCode = norm(p.code)
          if (pCode === '40' || pCode === '41') return null;
          const loadedChildren = childrenByParent[pCode] ?? []
          const knownHasChildren = parentsWithChildren?.has?.(pCode) || loadedChildren.length > 0

          const isPeriodP = isPeriodCode(p)
          const parentChecked =
            isPeriodP
              ? true
              : selectedCodes.has(pCode) ||
                (childrenByParent[pCode]?.some((c) => selectedCodes.has(norm(c.code))) ?? false)

          const parentDisabled = knownHasChildren && isParentBlocked(pCode)

          const koiCdParentSelected = isKoiCdLike(p.label) && selectedCodes.has(pCode)

          return (
            <Accordion
              key={`parent:${pCode}`} disableGutters elevation={0} square
              expanded={knownHasChildren && (expandedParents.has(pCode) || parentsOfSelectedChildren.has(pCode))} // ⬅ 추가
              onChange={async (_e, expanded) => {
                if (!knownHasChildren) return
                if (expanded) {
                  setLoadingParents((prev) => new Set(prev).add(pCode))
                  await loadChildrenIfNeeded(pCode)
                  setLoadingParents((prev) => { const next = new Set(prev); next.delete(pCode); return next })
                  setExpandedParents((prev) => { const next = new Set<string>(Array.from(prev)); next.add(pCode); return next })
                } else {
                  setExpandedParents((prev) => { const next = new Set<string>(Array.from(prev)); next.delete(pCode); return next })
                }
              }}
              sx={{ boxShadow: 'none', bgcolor: 'transparent', m: 0, borderRadius: 0, '&:before': { display: 'none' },
                    borderTop: idx === 0 ? 'none' : '1px solid #EDEFF2' }}
            >
              <AccordionSummary expandIcon={knownHasChildren ? <ExpandMoreIcon /> : null}
                                sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <div onClick={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()}>
                  <FormControlLabel
                    key={`parentChk:${pCode}`}
                    disabled={parentDisabled}
                    control={
                      <CustomCheckbox
                        name="reportTypesParent"
                        value={pCode}
                        checked={parentChecked}
                        disabled={parentDisabled}
                        onClick={isPeriodP ? handlePeriodRequired : undefined}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (parentDisabled) return
                          if (isPeriodP) { handlePeriodRequired(e as any); return }
                          toggleCode(pCode, e.target.checked)
                        }}
                      />
                    }
                    label={p.label}
                    style={{ color: parentDisabled ? '#bbb' : '#555', userSelect: 'none' }}
                  />
                </div>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0, pl: 5, pb: 1 }}>
                {loadingParents.has(pCode) && (!childrenByParent[pCode] || childrenByParent[pCode].length === 0) ? (
                  <Box sx={{ py: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rounded" width="100%" height={36} />
                  </Box>
                ) : (
                  (childrenByParent[pCode] ?? []).map((c) => {
                    const isPeriodC = isPeriodCode(c)
                    const cCode = norm(c.code)
                    const childChecked = isPeriodC ? true : selectedCodes.has(cCode)

                    // 선택된 “차종” 부모가 있고, 이 부모가 그게 아니면 차단
                    const childBlockedByOtherParent =
                      hasAnyVehicleChildSelected && !vehicleParentsOfSelectedChildren.has(pCode) && vehicleParentCodes.has(pCode)

                    // leaf 중 유종/유종별은 금지
                    const childDisabledByKoiCdLeaf = isKoiCdLike(c.label)

                    // ★ 유종/유종별 부모가 선택되어 있으면 해당 부모의 모든 자식은 차단
                    const childDisabledByKoiCdParent = koiCdParentSelected
                    
                    // NEW: 유종 선택 시, 화물/택시/버스 '부모의 자식' 전체 금지
                    const childDisabledByKoiCdGlobal = koiCdAnySelected && vehicleParentCodes.has(pCode);

                    const childDisabled = (!!childBlockedByOtherParent) || (!!childDisabledByKoiCdLeaf) || (!!childDisabledByKoiCdParent) || (!!childDisabledByKoiCdGlobal)
                    return (
                      <FormControlLabel
                        key={`child:${pCode}:${cCode}`}
                        disabled={childDisabled}
                        control={
                          <CustomCheckbox
                            name="reportTypesChild"
                            value={cCode}
                            checked={childChecked}
                            disabled={childDisabled}
                            onClick={isPeriodC ? handlePeriodRequired : undefined}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (childDisabled) return
                              if (isPeriodC) { handlePeriodRequired(e as any); return }

                                // NEW: 유종 선택 상태에서는 화물/택시/버스 자식 선택 금지
                              if (koiCdAnySelected && vehicleParentCodes.has(pCode)) {
                                alert('유종이 선택된 상태에서는 화물/택시/버스의 하위 항목(예: 톤별)을 선택할 수 없습니다.');
                                return;
                              }
                              const checked = e.target.checked
                              setSelectedCodes((prev) => {
                                const next = new Set(prev);
                                if (checked) { next.add(cCode); next.add(pCode); } else { next.delete(cCode); }
                                return next;
                              });
                            }}

                          />
                        }
                        label={c.label}
                        style={{ color: childDisabled ? '#bbb' : '#555', marginRight: 16 }}
                      />
                    )
                  })
                )}
              </AccordionDetails>
            </Accordion>
          )
        })}
      </>
    )
  }

  /* --------------------- render --------------------- */
  return (
    <Box>
      <Dialog fullWidth={false} open={isOpen} maxWidth={size || 'md'} onClose={setClose}>
        <DialogContent style={{ width: 800 }}>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display input-label-display-16"><h2>보고서 생성</h2></CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={onPrintReport} disabled={reportLoading}>
                {reportLoading ? '생성중…' : '출력'}
              </Button>
              <Button variant="contained" color="dark" onClick={setClose}>취소</Button>
            </div>
          </Box>
          <Box
            sx={{
              border: '1px solid #D2D8DD',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '8px',
            }}
          >
            <table className="table">
              {/* 👇 보이지 않는 caption 추가 (레이블용) */}
              <caption
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
              >
                비정형 통계 보고서 생성을 위한 기본 정보
                (보고서명, 기간, 분류 코드 선택, 청구 방식, 측정값)을 입력하는 표입니다.
              </caption>

              <colgroup>
                <col style={{ width: '130px' }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  {/* 👇 scope="row" 추가 */}
                  <th
                    scope="row"
                    style={{ textAlign: 'left', padding: '8px 0' }}
                  >
                    <CustomFormLabel
                      className="input-label-display input-label-display-16"
                      htmlFor="input-01"
                    >
                      <strong>보고서명</strong>
                    </CustomFormLabel>
                  </th>
                  <td style={{ padding: '8px 0' }}>
                    <CustomTextField
                      type="text"
                      id="input-01"
                      fullWidth
                      value={reportName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setReportName(e.target.value)
                      }
                    />
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    style={{ textAlign: 'left', padding: '8px 0' }}
                  >
                    <CustomFormLabel className="input-label-display input-label-display-16">
                      <strong>기간</strong>
                    </CustomFormLabel>
                  </th>
                  <td style={{ padding: '8px 0', color: '#666' }}>
                    {(() => {
                      const bg = periodParams?.bgngDt ?? ''
                      const ed = periodParams?.endDt ?? ''
                      const md =
                        periodParams?.mode === 'YY' ? '년도별' : '월별'
                      return bg && ed ? `${bg} ~ ${ed} (${md})` : '-'
                    })()}
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    style={{ textAlign: 'left', padding: '8px 0' }}
                  >
                    <CustomFormLabel className="input-label-display input-label-display-16">
                      <strong>분류 코드 선택</strong>
                    </CustomFormLabel>
                  </th>
                  <td style={{ padding: '8px 0' }}>
                    <Box
                      sx={{
                        border: '1px solid #E5E8EB',
                        borderRadius: '8px',
                        p: 1.5,
                        bgcolor: '#F7F9FA',
                        opacity: isUpdate ? 0.6 : 1,
                        pointerEvents: isUpdate ? 'none' : 'auto',
                        userSelect: isUpdate ? 'none' : 'auto',
                      }}
                    >
                      {renderCodePicker()}
                    </Box>
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    style={{ textAlign: 'left', padding: '8px 0' }}
                  >
                    <CustomFormLabel className="input-label-display input-label-display-16">
                      <strong>청구 방식</strong>
                    </CustomFormLabel>
                  </th>
                  <td style={{ padding: '8px 0' }}>
                    <Box
                      sx={{
                        border: '1px solid #E5E8EB',
                        borderRadius: '8px',
                        p: 1.5,
                        bgcolor: '#F7F9FA',
                        opacity: isUpdate ? 0.6 : 1,
                        pointerEvents: isUpdate ? 'none' : 'auto',
                        userSelect: isUpdate ? 'none' : 'auto',
                      }}
                    >
                      <div
                        className="mui-custom-radio-group"
                        style={{ width: 'inherit' }}
                      >
                        <RadioGroup
                          name="claimType"
                          value={claimType}
                          onChange={handleClaimTypeChange}
                          className="mui-custom-radio-group"
                          row
                        >
                          <FormControlLabel
                            value=""
                            control={
                              <CustomRadio
                                id="claim-all"
                                name="claim-all"
                                size="small"
                              />
                            }
                            label="전체"
                          />
                          <FormControlLabel
                            value={CLAIM_CARD_ONLY}
                            control={
                              <CustomRadio
                                id="claim-card"
                                name="claim-card"
                                size="small"
                              />
                            }
                            label="카드사별 청구"
                          />
                          <FormControlLabel
                            value={CLAIM_CARD_PLUS_PAPER}
                            control={
                              <CustomRadio
                                id="claim-card-paper"
                                name="claim-card-paper"
                                size="small"
                              />
                            }
                            label="카드청구 + 서면청구"
                          />
                        </RadioGroup>
                      </div>
                    </Box>
                  </td>
                </tr>

                <tr>
                  <th
                    scope="row"
                    style={{ textAlign: 'left', padding: '8px 0' }}
                  >
                    <CustomFormLabel className="input-label-display input-label-display-16">
                      <strong>측정값</strong>
                    </CustomFormLabel>
                  </th>
                  <td style={{ padding: '8px 0' }}>
                    <Box
                      sx={{
                        border: '1px solid #E5E8EB',
                        borderRadius: '8px',
                        p: 1.5,
                        bgcolor: '#F7F9FA',
                      }}
                    >
                      <FormGroup
                        row
                        sx={{ gap: '8px', p: 0.5, flexWrap: 'wrap' }}
                      >
                        <MeasureOptionsList
                          measureOptions={measureOptions}
                          selectedMeasures={selectedMeasures}
                          toggleMeasure={toggleMeasure}
                          readOnly={isUpdate}
                        />
                      </FormGroup>
                    </Box>
                    {isUpdate && (
                      <div
                        style={{
                          color: '#888',
                          fontSize: 12,
                          marginTop: 6,
                        }}
                      >
                        수정화면에서는 분류 선택/해제가 불가합니다. (행, 배치만
                        변경 가능)
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={mode === 'create' ? saveCriteria : undefined}
                disabled={saving || mode === 'update'}
                title={
                  mode === 'update'
                    ? '수정 모드에서는 분류기준 선택을 변경할 수 없습니다.'
                    : ''
                }
              >
                {saving ? '저장중...' : '분류기준 선택'}
              </Button>
            </DialogActions>
          </Box>

          {/* 분류기준(칩) */}
          <Box sx={{ marginTop: '20px' }}>
            <CustomFormLabel className="input-label-display input-label-display-16" style={{ marginLeft: 0 }}>
              <strong>분류기준</strong>
            </CustomFormLabel>
            <FormGroup row sx={{ gap: '8px', background: '#F7F9FA', padding: '12px', borderRadius: '8px' }}>
              {criteriaItems.length === 0 ? (
                <span style={{ color: '#999' }}>선택된 분류기준이 없습니다.</span>
              ) : (
                criteriaItems.map((it) => (
                  <span
                    key={it.code}
                    className="dropdown-button"
                    title={it.code}
                    draggable
                    onDragStart={onDragStart('criteria', it.code)}
                    style={{ cursor: 'grab' }}
                  >
                    {it.label}
                  </span>
                ))
              )}
            </FormGroup>
          </Box>

          {/* 행/열 */}
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomFormLabel className="input-label-display input-label-display-16" style={{ marginLeft: 0 }}><strong>가로</strong></CustomFormLabel>
                {/* 행 */}
                <FormGroup
                  onDragOver={onDragOver}
                  onDrop={onDropTo('row')}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',   // ⬅ 세로로 쌓이게
                    gap: '8px',
                    background: '#F7F9FA',
                    padding: '12px',
                    borderRadius: '8px',
                    minHeight: 150,
                    alignItems: 'flex-start',  // ⬅ 왼쪽 정렬
                  }}
                >
                  {rowItems.length === 0 ? (
                    <span style={{ color: '#999' }}>여기로 드래그하세요</span>
                  ) : (
                    rowItems.map((it) => (
                      <span
                        key={it.code}
                        className="dropdown-button"
                        title={it.code}
                        draggable
                        onDragStart={onDragStart('row', it.code)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'grab' }}
                      >
                        {it.label}
                        <button
                          type="button"
                          onClick={() => removeRowItem(it.code)}
                          style={{ border: 0, background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                          aria-label="행에서 제거"
                          title="행에서 제거"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </FormGroup>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CustomFormLabel className="input-label-display input-label-display-16" style={{ marginLeft: 0 }}><strong>세로</strong></CustomFormLabel>
                {/* 열 */}
                <FormGroup
                  onDragOver={onDragOver}
                  onDrop={onDropTo('col')}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',   // ⬅ 세로로 쌓이게
                    gap: '8px',
                    background: '#F7F9FA',
                    padding: '12px',
                    borderRadius: '8px',
                    minHeight: 150,
                    alignItems: 'flex-start',  // ⬅ 왼쪽 정렬
                  }}
                >
                  {colItems.length === 0 ? (
                    <span style={{ color: '#999' }}>여기로 드래그하세요</span>
                  ) : (
                    colItems.map((it) => (
                      <span
                        key={it.code}
                        className="dropdown-button"
                        title={it.code}
                        draggable
                        onDragStart={onDragStart('col', it.code)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'grab' }}
                      >
                        {it.label}
                        <button
                          type="button"
                          onClick={() => removeColItem(it.code)}
                          style={{ border: 0, background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                          aria-label="열에서 제거"
                          title="열에서 제거"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </FormGroup>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
