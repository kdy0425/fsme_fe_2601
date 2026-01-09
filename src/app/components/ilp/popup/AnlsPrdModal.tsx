'use client';

import {
  Box, Dialog, DialogContent, FormControl, FormControlLabel, Radio, RadioGroup, Grid,
  Button, Paper, Stack, Typography, Chip, Divider, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../forms/theme-elements/CustomTextField';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import type { AppState } from '@/store/store';
import { closeAnlsPrdModal, setAnlsPrdResult } from '@/store/popup/ilp/AnlsPrdSlice';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* 분석 API 호출시 */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

import { Backdrop, CircularProgress } from '@mui/material';
import { useLayoutEffect } from 'react';

/* ---------------------------------- utils ---------------------------------- */
const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};
const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};
const inclusiveDays = (from: string, to: string) => {
  const ms = parse(to).getTime() - parse(from).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
};
const listDays = (from: string, to: string) => {
  const out: string[] = [];
  for (let d = parse(from); d <= parse(to); d = addDays(d, 1)) out.push(fmt(d));
  return out;
};
const toYmd8 = (iso: string) => (iso ? iso.replaceAll('-', '') : '');
const d8toIso = (d8: string) =>
  d8 && d8.length === 8 ? `${d8.slice(0, 4)}-${d8.slice(4, 6)}-${d8.slice(6, 8)}` : d8;

/* ------------------------------ API 타입 ------------------------------ */
type AnalyzeRes = {
  highlight: boolean;
  invalidDays: string[];
  segments: { from: string; to: string; valid: boolean; reasons: string[] }[];
  insurance: Record<string, any>[];
  qualf: Record<string, any>[];
  business?: Record<string, any>[];
  driverLicense?: Record<string, any>[];
};

/* ------------------------------ API 호출기 (페이지별) ------------------------------ */
const callAnalyzeSqa = async (params: {
  scope: 'sqaTrPage' | 'sqaTxPage' | 'sqaBsPage';
  mode: 'DATE' | 'PERIOD';
  vhclNo: string;
  ctpvCd?: string;
  locgovCd?: string;
  vonrRrno?: string;
  brno: string;
  dateYmd?: string;
  fromYmd?: string;
  toYmd?: string;
}): Promise<AnalyzeRes | null> => {
  const { scope, ...rest } = params;

  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

 // scope 별 엔드포인트 분기
  let endpoint = '';
  switch (scope) {
    case 'sqaTrPage':
      endpoint = `/ilp/sqa/tr/getAllSpldmdQlfcAnlsTr?${qs}`;
      break;
    case 'sqaTxPage':
      endpoint = `/ilp/sqa/tx/getAllSpldmdQlfcAnlsTx?${qs}`;
      break;
    case 'sqaBsPage':
      endpoint = `/ilp/sqa/bs/getAllSpldmdQlfcAnlsBs?${qs}`;
      break;
    default:
      throw new Error(`Unsupported scope for SQA analysis: ${scope}`);
  }

  try {
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    if (res?.resultType === 'success' && res?.data) return res.data as AnalyzeRes;
    if (res && !res?.resultType) return res as unknown as AnalyzeRes;
    return null;
  } catch (e) {
    console.error('Analyze API error:', e);
    return null;
  }
};

/** ★ 통합 호출기: 의무보험정보 (화물/택시/버스) 기간 분석 */
const callAnalyzeIia = async (params: {
  scope: 'iiaTrPage' | 'iiaTxPage' | 'iiaBsPage';
  mode: 'PERIOD'; 
  vhclNo: string;
  fromYmd: string;   // yyyymmdd
  toYmd: string;     // yyyymmdd
}): Promise<AnalyzeRes | null> => {
  const { scope, ...rest } = params;

  const qs = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  // scope 별 엔드포인트 분기
  let endpoint = '';
  switch (scope) {
    case 'iiaTrPage':
      endpoint = `/ilp/iia/tr/getInsrAnlsTr?${qs}`;
      break;
    case 'iiaTxPage':
      endpoint = `/ilp/iia/tx/getInsrAnlsTx?${qs}`;
      break;
    case 'iiaBsPage':
      endpoint = `/ilp/iia/bs/getInsrAnlsBs?${qs}`;
      break;
    default:
      throw new Error(`Unsupported scope for IIA analysis: ${scope}`);
  }

  try {
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    if (res?.resultType === 'success' && res?.data) return res.data as AnalyzeRes;
    if (res && !res?.resultType) return res as unknown as AnalyzeRes;
    return null;
  } catch (e) {
    console.error('Analyze IIA API error:', e);
    return null;
  }
};

/** ★ 통합 호출기: 운수종사자정보 (화물/택시/버스) 기간 분석 */
const callAnalyzeTqa = async (params: {
  scope: 'tqaTrPage' | 'tqaTxPage' | 'tqaBsPage';
  mode: 'PERIOD';
  vhclNo: string;
  vonrRrno: string;
  fromYmd: string;   // yyyymmdd
  toYmd: string;     // yyyymmdd
}): Promise<AnalyzeRes | null> => {
  const { scope, ...rest } = params;

  const qs = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  let endpoint = '';
  switch (scope) {
    case 'tqaTrPage':
      endpoint = `/ilp/tqa/tr/getQualfTr?${qs}`;
      break;
    case 'tqaTxPage':
      endpoint = `/ilp/tqa/tx/getQualfTx?${qs}`;
      break;
    case 'tqaBsPage':
      endpoint = `/ilp/tqa/bs/getQualfBs?${qs}`;
      break;
    default:
      throw new Error(`Unsupported scope for TQA analysis: ${scope}`);
  }

  try {
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    if (res?.resultType === 'success' && res?.data) return res.data as AnalyzeRes;
    if (res && !res?.resultType) return res as unknown as AnalyzeRes;
    return null;
  } catch (e) {
    console.error('Analyze TQA API error:', e);
    return null;
  }
};

/** ★ 통합 호출기: 사업자정보 (화물) 기간 분석 */
const callAnalyzeBia = async (params: {
  scope: 'biaPage';          // 필요 시 'biaTxPage' | 'biaBsPage'로 확장 가능
  mode: 'PERIOD';
  vhclNo: string;
  brno: string;
  fromYmd: string;             // yyyymmdd
  toYmd: string;               // yyyymmdd
}): Promise<AnalyzeRes | null> => {
  const { scope, ...rest } = params;
  const qs = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  let endpoint = '';
  switch (scope) {
    case 'biaPage':
      endpoint = `/ilp/bia/tr/getBusinessTr?${qs}`;
      break;
    default:
      throw new Error(`Unsupported scope for BIA analysis: ${scope}`);
  }

  try {
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    if (res?.resultType === 'success' && res?.data) return res.data as AnalyzeRes;
    if (res && !res?.resultType) return res as unknown as AnalyzeRes;
    return null;
  } catch (e) {
    console.error('Analyze BIA API error:', e);
    return null;
  }
};

/** ★ 통합 호출기: 운전면허정보 (화물) 기간 분석 */
const callAnalyzeLia = async (params: {
  scope: 'liaPage';          
  mode: 'PERIOD';
  vhclNo: string;
  vonrRrno: string;
  fromYmd: string;             // yyyymmdd
  toYmd: string;               // yyyymmdd
}): Promise<AnalyzeRes | null> => {
  const { scope, ...rest } = params;
  const qs = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  let endpoint = '';
  switch (scope) {
    case 'liaPage':
      endpoint = `/ilp/lia/tr/getDriverLicenseTr?${qs}`;
      break;
    default:
      throw new Error(`Unsupported scope for LIA analysis: ${scope}`);
  }

  try {
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    if (res?.resultType === 'success' && res?.data) return res.data as AnalyzeRes;
    if (res && !res?.resultType) return res as unknown as AnalyzeRes;
    return null;
  } catch (e) {
    console.error('Analyze LIA API error:', e);
    return null;
  }
};

/* 사유 코드 → 라벨 */
const reasonLabel = (code: string) => {
  switch (String(code).trim()) {
    case 'INS_MISS':  return '의무보험 미유효';
    case 'QLF_MISS':  return '운수종사자 미유효';
    case 'BIZ_MISS':  return '사업자 미유효';
    case 'DLIC_MISS': return '운전면허 미유효';
    default:          return code || '미유효1';
  }
};
/* segments → 날짜별 사유 매핑 */
const expandSegmentsToReasons = (segments: AnalyzeRes['segments']) => {
  const map: Record<string, string[]> = {};
  (segments ?? []).forEach(seg => {
    if (seg.valid) return;
    const reasons = (seg.reasons ?? []).map(reasonLabel);
    for (let d = parse(seg.from); d <= parse(seg.to); d = addDays(d, 1)) {
      map[fmt(d)] = reasons.length ? reasons : ['미유효'];
    }
  });
  return map;
};

/* ------------------------------ sub components ----------------------------- */
// fix
const DAY_W = 20;   // 칸 가로 고정(px)
const DAY_H = 20;
const DAY_GAP = 4;
const DAY_ROW_GAP = 6;       // 줄 간격
const MIN_BOXES = 30;        // 최소 표시 칸
const COLS_PER_ROW = 30;     // wrap 시 1줄 = 30칸

type DayBarProps = {
  dates: string[];  // 표시용(패딩 포함) 날짜/슬롯
  invalidSet: Set<string>;
  reasonsByDate?: Record<string, string[]>;
  validPalette?: 'success' | 'secondary' | 'info';
  activeLength?: number;           // 실제 기간 길이(여기까지만 유효/미유효 계산)
  colsPerRow?: number;  
};

const DayBar = memo(({ dates, invalidSet, reasonsByDate = {}, validPalette = 'success', activeLength, colsPerRow = dates.length,}: DayBarProps) => (
  // <Box sx={{ display: 'flex', gap: 0.5, p: 0.75, bgcolor: 'grey.100', borderRadius: 2 }}>
    <Box
      sx={{
          // flex 대신 grid로 칸 폭을 완전 고정
          display: 'grid',
          gridTemplateColumns: `repeat(${colsPerRow}, ${DAY_W}px)`,
          columnGap: `${DAY_GAP}px`,
          rowGap: `${DAY_ROW_GAP}px`,
          p: 0.75,
          bgcolor: 'grey.100',
          borderRadius: 2,
          width: 'fit-content',     // DayBar 자체가 내용 너비만큼만 차지
        }}
    >
    {dates.map((d, idx) => {
      const activeLen = activeLength ?? dates.length;
      const isPad = String(d).startsWith('__pad_');  
      const inactive = idx >= activeLen || isPad;     
      const bad = !inactive && invalidSet.has(d);     
      const reasons = reasonsByDate[d] ?? [];

      const Title = !inactive ? (
        <Box sx={{ lineHeight: 1.25 }}>
          <Box component="div" sx={{ fontSize: 12, fontWeight: 700, color: 'common.white', mb: 0.25 }}>{d}</Box>
            {bad
              ? (reasons.length ? reasons : ['미유효']).map((r, i) => (
                  <Box key={i} component="div" sx={{ fontSize: 12, color: 'error.main', fontWeight: 700 }}>{r}</Box>
                ))
              : <Box component="div" sx={{ fontSize: 12, color: 'common.white' }}>유효</Box>}
          </Box>
      ) : null;

      const cell = (
        <Box
          sx={{
            height: DAY_H,
            width: DAY_W,
            borderRadius: 1,
            border: 1,
            ...(inactive
              ? { borderStyle: 'solid',
                  borderColor: (t) => alpha(t.palette.secondary.main, 0.28),
                  bgcolor: 'transparent',
                  backgroundImage: (t) =>
                    `repeating-linear-gradient(45deg,
                      ${alpha(t.palette.secondary.main, 0.12)} 0 6px,
                      transparent 6px 12px)`,
                 }
              : { borderColor: bad ? 'error.dark' : `${validPalette}.dark`,
                  bgcolor: bad ? 'error.main' : `${validPalette}.main` }),
          }}
        />
      );

      // 비활성 칸은 툴팁 없이 그냥 박스 렌더
      return !inactive ? (
        <Tooltip key={`d-${idx}-${d}`} arrow title={Title}
          slotProps={{ tooltip: { sx: { bgcolor: 'grey.900' } }, arrow: { sx: { color: 'grey.900' } } }}
        >
          {cell}
        </Tooltip>
      ) : (
        <Box key={`pad-${idx}`}>{cell}</Box>
      );
    })}
  </Box>
));
DayBar.displayName = 'DayBar';

type RangeLabelsProps = { dates: string[]; labels: Map<number, string> };
const RangeLabels = memo(({ dates, labels }: RangeLabelsProps) => (
  <Box sx={{ display: 'flex', gap: 0.5, px: 0.75, mt: 0.5 }}>
    {dates.map((_, idx) => (
      <Box key={`label-${idx}`} sx={{ flex: '1 1 0', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap', fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }}>
          {labels.get(idx) ?? ''}
        </Typography>
      </Box>
    ))}
  </Box>
));
RangeLabels.displayName = 'RangeLabels';

/* -------------------------------- main modal ------------------------------- */
const AnlsPrdModal = () => {
  const dispatch = useDispatch();

  const {
    anpModalOpen,
    mode: modeFromStore,
    dateYmd: dateFromStore,
    bgngAprvYmd: startFromStore,
    endAprvYmd: endFromStore,
    selectedVhclNo,
    selectedBrno,
    selectedRrno,
    showModes,
    analysisMode,
    analysisFrom,
    analysisTo,
    invalidDays,
    invalidReasons,
    scopeKey,
    applyFilterTrigger,
  } = useSelector(
    (s: AppState) => ({
      anpModalOpen: s.anlsPrdInfo.anpModalOpen,
      mode: s.anlsPrdInfo.mode,
      dateYmd: s.anlsPrdInfo.dateYmd,
      bgngAprvYmd: s.anlsPrdInfo.bgngAprvYmd,
      endAprvYmd: s.anlsPrdInfo.endAprvYmd,
      selectedVhclNo: s.anlsPrdInfo.selectedVhclNo,
      selectedBrno: s.anlsPrdInfo.selectedBrno,
      selectedRrno: s.anlsPrdInfo.selectedRrno,
      showModes: s.anlsPrdInfo.showModes ?? ['date', 'period'],
      analysisMode: s.anlsPrdInfo.analysisMode,
      analysisFrom: s.anlsPrdInfo.analysisFrom,
      analysisTo: s.anlsPrdInfo.analysisTo,
      invalidDays: s.anlsPrdInfo.invalidDays ?? [],
      invalidReasons: s.anlsPrdInfo.invalidReasons ?? {},
      scopeKey: s.anlsPrdInfo.scopeKey,
      applyFilterTrigger: s.anlsPrdInfo.applyFilterTrigger ?? 0,
    }),
    shallowEqual,
  );

  const submittingRef = useRef(false);
  const prevOpenRef = useRef(false);

  const barWrapRef = useRef<HTMLDivElement | null>(null);
  const [shouldWrap, setShouldWrap] = useState(false);

  // local inputs
  const [mode, setMode] = useState<'date' | 'period'>(modeFromStore ?? 'date');
  const [dateYmd, setDateYmd] = useState<string>(dateFromStore ?? '');
  const [params, setParams] = useState<{ bgngAprvYmd: string; endAprvYmd: string }>({
    bgngAprvYmd: startFromStore ?? '',
    endAprvYmd: endFromStore ?? '',
  });

  // 모달 로컬 결과(기간 분석)
  const [localInvalidDays, setLocalInvalidDays] = useState<string[]>([]);
  const [localInvalidReasons, setLocalInvalidReasons] = useState<Record<string, string[]>>({});

  const reasonsByDateFromStore = useMemo(() => invalidReasons, [invalidReasons]);

  // 차트 표시/부모 대기 플래그
  const [chartVisible, setChartVisible] = useState(false);
  const [waitingStoreResult, setWaitingStoreResult] = useState(false);
  const prevTriggerRef = useRef<number | null>(null);
  const prevInvalidRef = useRef<string[] | null>(null);

  const [loading, setLoading] = useState(false);          // API 호출/대기 공통 로딩

  // 초기화
  useEffect(() => {
    if (anpModalOpen && !prevOpenRef.current) {
      setMode(modeFromStore ?? 'date');
      setDateYmd(dateFromStore ?? '');
      setParams({ bgngAprvYmd: startFromStore ?? '', endAprvYmd: endFromStore ?? '' });
      setLocalInvalidDays([]);
      setLocalInvalidReasons({});
      setChartVisible(false);
      setWaitingStoreResult(false);
      prevTriggerRef.current = applyFilterTrigger;
      prevInvalidRef.current = invalidDays;
    }
    prevOpenRef.current = anpModalOpen;
  }, [anpModalOpen, modeFromStore, dateFromStore, startFromStore, endFromStore, applyFilterTrigger]); // eslint-disable-line

  // 입력/모드/모달 변경 시 차트 숨김
  useEffect(() => {
    setChartVisible(false);
    setWaitingStoreResult(false);
  }, [mode, params.bgngAprvYmd, params.endAprvYmd, anpModalOpen]);

  const handleModalClose = useCallback(() => {
    dispatch(closeAnlsPrdModal());
  }, [dispatch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setParams((prev) => ({ ...prev, [name]: value || '' }));
      setChartVisible(false);
      setWaitingStoreResult(false);
    },
    [],
  );

  const onClickAnalyze = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setLoading(true);

    try {
      /* ────────────────────── 날짜 모드 ────────────────────── */
      if (mode === 'date') {
        if (!dateYmd) {
          alert('일자를 선택해주세요');
          submittingRef.current = false;
          return;
        }

        dispatch(setAnlsPrdResult({
          analysisMode: 'date',
          selectedVhclNo: selectedVhclNo ?? '',
          analysisDate: dateYmd,
        }));
        dispatch(closeAnlsPrdModal());
        submittingRef.current = false;
        return;
      }

      /* ────────────────────── 기간 모드 ────────────────────── */
      const { bgngAprvYmd, endAprvYmd } = params;
      if (!bgngAprvYmd) { alert('시작일자를 입력해주세요'); submittingRef.current = false; return; }
      if (!endAprvYmd)   { alert('종료일자를 입력해주세요'); submittingRef.current = false; return; }
      if (parse(bgngAprvYmd) > parse(endAprvYmd)) {
        alert('시작일자는 종료일자보다 클 수 없습니다.');
        submittingRef.current = false; return;
      }
      const days = inclusiveDays(bgngAprvYmd, endAprvYmd);
      if (days < 7) {   alert(`선택 기간은 최소 7일 이상이어야 합니다. (현재 ${days}일)`); submittingRef.current = false; return; }
      if (days > 90) { alert(`선택 기간은 최대 90일까지만 가능합니다. (현재 ${days}일)`); submittingRef.current = false; return; }

      // 스토어 반영
      dispatch(setAnlsPrdResult({
        analysisMode: 'period',
        selectedVhclNo: selectedVhclNo ?? '',
        selectedRrno: selectedRrno ?? '',
        analysisFrom: bgngAprvYmd,
        analysisTo: endAprvYmd,
      }));

      // 페이지별 스위치
      switch (scopeKey) {
        case 'sqaTrPage':
        case 'sqaTxPage':
        case 'sqaBsPage': { // 수급자격종합분석 - 버스
          if (selectedVhclNo) {
            const res = await callAnalyzeSqa({
              scope: scopeKey as 'sqaTrPage' | 'sqaTxPage' | 'sqaBsPage',
              mode: 'PERIOD',
              vhclNo: selectedVhclNo,
              vonrRrno: selectedRrno,
              brno: (selectedBrno ?? '').replace(/[^\d]/g, ''), 
              fromYmd: toYmd8(bgngAprvYmd),
              toYmd: toYmd8(endAprvYmd),
            });
            if (!res) { alert('분석 요청 중 오류가 발생했습니다.'); submittingRef.current = false; return; }
            setLocalInvalidDays(res.invalidDays ?? []);
            setLocalInvalidReasons(expandSegmentsToReasons(res.segments ?? []));
            setChartVisible(true);
            setWaitingStoreResult(false);
          }
          break;
        }
        case 'iiaTrPage':
        case 'iiaTxPage':
        case 'iiaBsPage': { // 보험가입정보분석 - 화물/택시/버스 (기간만 서비스 호출)
          if (selectedVhclNo) {
            const res = await callAnalyzeIia({
              scope: scopeKey as 'iiaTrPage' | 'iiaTxPage' | 'iiaBsPage',
              mode: 'PERIOD',
              vhclNo: selectedVhclNo,
              fromYmd: toYmd8(bgngAprvYmd),
              toYmd: toYmd8(endAprvYmd),
            });
            if (!res) { alert('분석 요청 중 오류가 발생했습니다.'); submittingRef.current = false; return; }

            const reasons =
              (res.segments?.length ?? 0) > 0
                ? expandSegmentsToReasons(res.segments!)
                : Object.fromEntries((res.invalidDays ?? []).map((d: string) => [
                    d.length === 8 ? d8toIso(d) : d,
                    ['의무보험 미유효'],
                  ]));
            setLocalInvalidDays(res.invalidDays ?? []);
            setLocalInvalidReasons(reasons);
            setChartVisible(true);
            setWaitingStoreResult(false);
          }
          break;
        }
        case 'tqaTrPage':
        case 'tqaTxPage':
        case 'tqaBsPage': { // 운수종사자 자격(TQA) - 화물/택시/버스 (기간만 서비스 호출)
          if (selectedVhclNo) {
            const res = await callAnalyzeTqa({
              scope: scopeKey as 'tqaTrPage' | 'tqaTxPage' | 'tqaBsPage',
              mode: 'PERIOD',
              vhclNo: selectedVhclNo,
              vonrRrno: selectedRrno,
              fromYmd: toYmd8(bgngAprvYmd),
              toYmd: toYmd8(endAprvYmd),
            });
            if (!res) { alert('분석 요청 중 오류가 발생했습니다.'); submittingRef.current = false; return; }

            // segments가 없을 수도 있으므로 기본 사유: '운수종사자 미유효'
            const reasons =
              (res.segments?.length ?? 0) > 0
                ? expandSegmentsToReasons(res.segments!)
                : Object.fromEntries((res.invalidDays ?? []).map((d: string) => [
                    d.length === 8 ? d8toIso(d) : d,
                    ['운수종사자 미유효'],
                  ]));

            setLocalInvalidDays(res.invalidDays ?? []);
            setLocalInvalidReasons(reasons);
            setChartVisible(true);
            setWaitingStoreResult(false);
          }
          break;
        }
        case 'biaPage': { // 사업자(BIA) - 화물(Tr)
          
          if (selectedBrno) {
            const res = await callAnalyzeBia({
              scope: 'biaPage',
              mode: 'PERIOD',
              vhclNo: selectedBrno,
              brno: (selectedBrno ?? '').replace(/[^\d]/g, ''), 
              fromYmd: toYmd8(bgngAprvYmd),
              toYmd: toYmd8(endAprvYmd),
            });
            if (!res) { alert('분석 요청 중 오류가 발생했습니다.'); submittingRef.current = false; return; }

            const reasons =
              (res.segments?.length ?? 0) > 0
                ? expandSegmentsToReasons(res.segments!)
                : Object.fromEntries((res.invalidDays ?? []).map((d: string) => [
                    d.length === 8 ? d8toIso(d) : d,
                    ['사업자 미유효'],
                  ]));

            setLocalInvalidDays(res.invalidDays ?? []);
            setLocalInvalidReasons(reasons);
            setChartVisible(true);
            setWaitingStoreResult(false);
          }
          break;
        }
        case 'liaPage': { // 면허정보(ㅣIA) - 화물(Tr)
          
          if (selectedVhclNo) {
            const res = await callAnalyzeLia({
              scope: 'liaPage',
              mode: 'PERIOD',
              vhclNo: selectedVhclNo,
              vonrRrno: selectedRrno,
              fromYmd: toYmd8(bgngAprvYmd),
              toYmd: toYmd8(endAprvYmd),
            });
            if (!res) { alert('분석 요청 중 오류가 발생했습니다.'); submittingRef.current = false; return; }

            const reasons =
              (res.segments?.length ?? 0) > 0
                ? expandSegmentsToReasons(res.segments!)
                : Object.fromEntries((res.invalidDays ?? []).map((d: string) => [
                    d.length === 8 ? d8toIso(d) : d,
                    ['운전면허 미유효'],
                  ]));

            setLocalInvalidDays(res.invalidDays ?? []);
            setLocalInvalidReasons(reasons);
            setChartVisible(true);
            setWaitingStoreResult(false);
          }
          break;
        }
        default: {
          // 그 외 페이지: 부모(DataList) 계산 완료 트리거를 기다렸다가 표시
          prevTriggerRef.current = applyFilterTrigger;
          prevInvalidRef.current = invalidDays;
          setWaitingStoreResult(true);
          setChartVisible(false);
          setLocalInvalidDays([]);
          setLocalInvalidReasons({});
        }
      }
    } finally {
      if (!waitingStoreResult) setLoading(false);
      submittingRef.current = false;
    }
  }, [mode, dateYmd, params, dispatch, selectedVhclNo, scopeKey, applyFilterTrigger, invalidDays]);

  /* 부모 계산 완료 신호 + invalidDays 레퍼런스 변경을 "둘 다" 만족할 때만 렌더 ON */
  useEffect(() => {
    if (!waitingStoreResult) return;
    if (prevTriggerRef.current === null) return;

    const triggerChanged = applyFilterTrigger !== prevTriggerRef.current;
    const invalidRefChanged = invalidDays !== prevInvalidRef.current;
    const paramsReady = analysisMode === 'period' && !!analysisFrom && !!analysisTo;

    if (triggerChanged && invalidRefChanged && paramsReady) {
      setChartVisible(true);
      setWaitingStoreResult(false);
      prevTriggerRef.current = applyFilterTrigger;
      prevInvalidRef.current = invalidDays;
      setLoading(false); // 부모 계산 끝났으니 로딩 종료
    }
  }, [applyFilterTrigger, invalidDays, waitingStoreResult, analysisMode, analysisFrom, analysisTo]);

  /* ----------------------------- values ---------------------------- */
  const showChart =
    chartVisible && analysisMode === 'period' && !!analysisFrom && !!analysisTo;

  const dateList = useMemo(
    () => (showChart ? listDays(analysisFrom!, analysisTo!) : []),
    [showChart, analysisFrom, analysisTo],
  );

  // 1줄로 표시할 때 필요한 슬롯 수(최소 30은 유지)
  const oneLineSlots = Math.max(dateList.length, MIN_BOXES);

  // 한 줄 폭(px) 계산
  const oneLineWidth = oneLineSlots * DAY_W + (oneLineSlots - 1) * DAY_GAP + 12; // +내부 여유

  // 래퍼 폭과 비교해서 wrap 여부 결정
  useLayoutEffect(() => {
    const el = barWrapRef.current;
    if (!el) return;

    const compute = () => {
      const available = el.clientWidth;
      setShouldWrap(oneLineWidth > available);
    };

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();
    return () => ro.disconnect();
  }, [oneLineWidth]);

// 표시용 슬롯 생성
const displayDates = useMemo(() => {
  const base: string[] = [];

  // 최소 30칸은 항상 보여줌(요구사항 유지)
  const target = Math.max(dateList.length, MIN_BOXES);
  for (let i = 0; i < target; i++) {
    base.push(dateList[i] ?? `__pad_${i}`);
  }

  // 줄바꿈 모드일 때만 30의 배수로 패딩
  if (shouldWrap) {
    const rem = base.length % COLS_PER_ROW;
    if (rem !== 0) {
      const need = COLS_PER_ROW - rem;
      const start = base.length;
      for (let i = 0; i < need; i++) base.push(`__pad_${start + i}`);
    }
  }
  return base;
}, [dateList, shouldWrap]);

//   // 표시용: 최소 30칸으로 패딩
// const displayDates = useMemo(() => {
//   const base = dateList;
//   if (base.length >= MIN_BOXES) return base;
//   const padded = base.slice();
//   for (let i = base.length; i < MIN_BOXES; i++) padded.push(`__pad_${i}`); // 키 충돌 방지용
//   return padded;
// }, [dateList]);

  /* sqaBsPage / iiaTrPage / iiaTxPage / iiaBsPage 는 모달 로컬 분석 결과 우선 */
  const useLocalFirst =
    scopeKey === 'sqaBsPage' || scopeKey === 'sqaTxPage' || scopeKey === 'sqaTrPage'||
    scopeKey === 'iiaTrPage' || scopeKey === 'iiaTxPage' || scopeKey === 'iiaBsPage'||
    scopeKey === 'tqaTrPage' || scopeKey === 'tqaTxPage' || scopeKey === 'tqaBsPage'||
    scopeKey === 'biaPage' ||
    scopeKey === 'liaPage';

  const invalidDaysEffectiveRaw = useMemo(
    () => (useLocalFirst && (localInvalidDays?.length ?? 0) > 0 ? localInvalidDays : (invalidDays ?? [])),
    [useLocalFirst, localInvalidDays, invalidDays]
  );
  const reasonsEffectiveRaw = useMemo(
    () => (useLocalFirst && Object.keys(localInvalidReasons ?? {}).length > 0
            ? localInvalidReasons
            : reasonsByDateFromStore),
    [useLocalFirst, localInvalidReasons, reasonsByDateFromStore]
  );

  const invalidDaysEffective = useMemo(
    () => (invalidDaysEffectiveRaw ?? []).map(d => (d?.length === 8 ? d8toIso(d) : d)),
    [invalidDaysEffectiveRaw]
  );
  const reasonsEffective = useMemo(() => {
    const out: Record<string, string[]> = {};
    Object.entries(reasonsEffectiveRaw ?? {}).forEach(([k, v]) => {
      const iso = k?.length === 8 ? d8toIso(k) : k;
      out[iso] = v;
    });
    return out;
  }, [reasonsEffectiveRaw]);

  const invalidSet = useMemo(() => new Set(invalidDaysEffective), [invalidDaysEffective]);
  const validCount = useMemo(
    () => dateList.filter((d) => !invalidSet.has(d)).length,
    [dateList, invalidSet],
  );
  const invalidCount = useMemo(() => dateList.length - validCount, [dateList, validCount]);

  // 연속 미유효 구간 라벨
  const badLabels = useMemo(() => {
    type BadRange = { startIdx: number; endIdx: number; startDate: string; endDate: string };
    const ranges: BadRange[] = [];
    const n = dateList.length;
    for (let i = 0; i < n; i++) {
      if (!invalidSet.has(dateList[i])) continue;
      const s = i;
      while (i + 1 < n && invalidSet.has(dateList[i + 1])) i++;
      const e = i;
      ranges.push({ startIdx: s, endIdx: e, startDate: dateList[s], endDate: dateList[e] });
    }
    const m = new Map<number, string>();
    for (const r of ranges) {
      if (r.startIdx === r.endIdx) m.set(r.startIdx, r.startDate);
      else {
        m.set(r.startIdx, r.startDate.slice(5));
        m.set(r.endIdx, r.endDate.slice(5));
      }
    }
    return m;
  }, [dateList, invalidSet]);

  // 엣지 라벨
  // const labelsForChart = useMemo(() => {
  //   const m = new Map(badLabels);
  //   if (dateList.length > 0) {
  //     m.set(0, dateList[0]);
  //     m.set(dateList.length - 1, dateList[dateList.length - 1]);
  //   }
  //   return m;
  // }, [badLabels, dateList]);
  //const labelsForChart = useMemo(() => badLabels, [badLabels]);

  return (
    <Box>
      <Dialog
        //fullWidth
        //maxWidth="md"
        fullWidth={false}
        maxWidth={false}
        open={anpModalOpen}
        disableEscapeKeyDown
        onClose={(_, r) => {
          if (r === 'backdropClick') return;
        }}
        PaperProps={{
          sx: {
            width: 'fit-content',             // 내용 너비만큼 Dialog Paper가 늘어남
            maxWidth: 'calc(100vw - 48px)',   // 뷰포트보다 커지면 여기서 클램프
          },
        }}
      >
        <DialogContent>
          <Backdrop open={loading} sx={{ color: '#fff', zIndex: (t) => t.zIndex.modal + 1 }}>
            <Stack alignItems="center" spacing={1}>
              <CircularProgress color="inherit" />
              {/* <Typography variant="body2">{loadingMsg}</Typography> */}
            </Stack>
          </Backdrop>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>분석기간</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button type="button" variant="contained" color="secondary" onClick={onClickAnalyze}>
                분석
              </Button>
              <Button type="button" variant="contained" color="dark" onClick={handleModalClose}>
                닫기
              </Button>
            </div>
          </Box>

          {/* 입력 폼 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl>
                    <CustomFormLabel className="input-label-none">분석기준</CustomFormLabel>
                    <RadioGroup
                      row
                      name="anp-mode"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'date' | 'period')}
                      sx={{
                        gap: 2,
                        '& .MuiFormControlLabel-root, & .MuiFormControlLabel-root *': {
                          border: 'none !important',
                          outline: 'none !important',
                          boxShadow: 'none !important',
                          background: 'transparent !important',
                        },
                        '& .MuiFormControlLabel-root': { m: 0, px: 0.5 },
                        '& .MuiRadio-root': {
                          p: 0.25,
                          color: 'text.secondary',
                          '&.Mui-checked': { color: 'primary.main' },
                        },
                        '& .MuiRadio-root .MuiTouchRipple-root': { display: 'none' },
                      }}
                    >
                      {showModes.includes('date') && (
                        <FormControlLabel value="date" control={<Radio />} label="일자" />
                      )}
                      {showModes.includes('period') && (
                        <FormControlLabel value="period" control={<Radio />} label="기간" />
                      )}
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} key={`mode-${mode}`}>
                  <div
                    className="form-group"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      columnGap: 12,
                      alignItems: 'center',
                    }}
                  >
                    {mode === 'date' ? (
                      <>
                        <CustomFormLabel className="input-label-display" required>
                          대상일자
                        </CustomFormLabel>
                        <div style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CustomFormLabel className="input-label-none" htmlFor="ft-date-only">
                            일자
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-date-only"
                            name="dateYmd"
                            type="date"
                            value={dateYmd || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setDateYmd(e.target.value || '')
                            }
                            sx={{ width: 180 }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <CustomFormLabel className="input-label-display" required>
                          대상기간
                        </CustomFormLabel>
                        <div style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">
                            시작일자
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-date-start"
                            name="bgngAprvYmd"
                            type="date"
                            value={params.bgngAprvYmd || ''}
                            onChange={handleSearchChange}
                            sx={{ width: 160 }}
                          />
                          <div>~</div>
                          <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">
                            종료일자
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-date-end"
                            name="endAprvYmd"
                            type="date"
                            value={params.endAprvYmd || ''}
                            onChange={handleSearchChange}
                            sx={{ width: 160 }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* 결과 요약 + 가로 차트 */}
          {showChart && (
            <Paper variant="outlined" sx={{ p: 2, overflow: 'hidden' }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={700} component="h2">
                  {analysisFrom} ~ {analysisTo} · 자격 분석
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span">
                  (일자 단위)
                </Typography>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip color="secondary" variant="outlined" label={`유효 ${validCount}일`} />
                <Chip color="error" variant="outlined" label={`미유효 ${invalidCount}일`} />
                <Box sx={{ width: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  총 {dateList.length}일
                </Typography>
              </Stack>

              <Box ref={barWrapRef} sx={{ width: '100%', overflow: 'hidden', px: 1, pb: 1 }}>
                <DayBar
                  dates={displayDates}
                  activeLength={dateList.length}
                  invalidSet={invalidSet}
                  reasonsByDate={reasonsEffective}
                  validPalette="secondary"
                  colsPerRow={shouldWrap ? COLS_PER_ROW : displayDates.length}  // ✅ wrap이면 30열, 아니면 1줄
                />
              </Box>
            </Paper>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default memo(AnlsPrdModal);
