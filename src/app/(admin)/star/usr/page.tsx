'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';

import PageContainer from '@/components/container/PageContainer';
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports';
import ReportModal from './_components/ReportModal';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { listParamObj } from '@/types/fsms/fsm/listParamObj';
import { SelectItem } from 'select';
import { Pageable2 } from 'table';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop';
import { starUserHc } from '@/utils/fsms/headCells2';
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect';
import PivotPreviewModal, { PivotResponse as PivotData } from './_components/PivotPreviewModal';
import { getUserInfo } from '@/utils/fsms/utils';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '통계보고서' },
  { title: '통계보고서' },
  { to: '/star/usr', title: '비정형통계보고서' },
];

// ───────────────── Types ─────────────────
type AggAxis = { type: 'CODE' | 'YM'; code?: string };

export interface RptpRow {
  locgovCd: string;
  ctpvNm: string;
  locgovNm: string;
  rptpSn: string;
  rptpNm?: string;
  clsfCdNm?: string;
  x?: string | string[];
  y?: string | string[];
  m?: string | string[];
}

type listSearchObj = {
  sort: string;
  page: number;
  size: number;
  [key: string]: string | number;
};

const DataList = () => {
  const querys = useSearchParams();
  const allParams: listParamObj = Object.fromEntries(querys.entries());

  // 🔹 로그인 정보 한 번 읽어서 초기 파라미터에 반영
  const user: any = getUserInfo();
  console.log('getUserInfo user:', user);
  const [params, setParams] = useState<listSearchObj>(() => {
    // 조회조건에 실제로 쓰는 관할관청코드: URL 쿼리만 사용 (기본은 전체 = '')
    const locgovCd = String(
      (allParams as any).locgovCd ?? ''
    ).trim();

    // 시도코드: URL 우선, 없으면 (locgovCd 또는 로그인 관할관청코드) 앞 2자리
    let ctpvCd = String(
      (allParams as any).ctpvCd ?? ''
    ).trim();

    if (!ctpvCd) {
      const lg = locgovCd || String(
        user?.locgovCd ??
          user?.locgov_cd ??
          user?.locgov?.code ??
          ''
      ).trim();

      ctpvCd = lg ? lg.substring(0, 2) : '';
    }

    console.log('Initial params:', { locgovCd, ctpvCd });

    return {
      page: 1,
      size: 10,
      sort: allParams.sort ?? '',
      ctpvCd,
      locgovCd,
    };
  });

  // 데이터/상태
  const [open, setOpen] = useState(false);
  const [open_c, setOpen_c] = useState(false);
  const [rptpRows, setRptpRows] = useState<RptpRow[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [editingRow, setEditingRow] = useState<RptpRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]);
  const [flag, setFlag] = useState<boolean>(false); // 데이터 갱신 플래그

  // 기간 모달
  const [periodModalCallback, setPeriodModalCallback] = useState<null | ((p: any) => void)>(null);
  const [periodModalFlag, setPeriodModalFlag] = useState(false);
  const now = new Date();
  const defaultPeriod = {
    mode: 'MM' as 'MM' | 'YY',
    bgngDt: `${now.getFullYear()}-01`,
    endDt: `${now.getFullYear()}-12`,
  };
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);

  // 프리뷰 팝업
  const [pvOpen, setPvOpen] = useState(false);
  const [pvData, setPvData] = useState<PivotData | null>(null);
  const [pvParams, setPvParams] = useState<{
    title?: string;
    bgngDt?: string;
    endDt?: string;
    ctpvNm?: string;    
    locgovNm?: string;
  }>({});

  // ▶ 프리뷰 열기: 공통 진입점
  const openPivot = useCallback(
    (
      pivot: PivotData,
      params: { title?: string; bgngDt?: string; endDt?: string; locgovNm?: string },
    ) => {
      setOpen(false);
      setOpen_c(false);
      setPvData(pivot);
      setPvParams(params);
      setPvOpen(true);
    },
    [],
  );

  // ▶ 프리뷰 닫기: 창 닫고 리스트 다시 조회
  function handlePivotClose() {
    setPvOpen(false);
    fetchData();
  }

  // ─────────────── Helpers ───────────────
  const norm = (v: any) => String(v ?? '').trim();
  const toArrayAny = (v: any): string[] =>
    Array.isArray(v)
      ? v.map(norm)
      : v
      ? String(v)
          .split(',')
          .map(s => norm(s))
          .filter(Boolean)
      : [];

  const getLocgovCd = (prms?: any): string => String(prms?.locgovCd ?? '').trim();

  type CodeRow = { clsfCd: string; clsfCdNm: string; clsfPrntCd?: string | null };
  const codeCache = new Map<string, CodeRow | null>();

  const fetchCodeRow = async (code: string): Promise<CodeRow | null> => {
    const c = norm(code);
    if (!c) return null;
    if (codeCache.has(c)) return codeCache.get(c)!;

    const qs = new URLSearchParams();
    qs.set('clsfSeCd', 'A');
    qs.set('clsfCd', c);
    qs.set('page', '1');
    qs.set('size', '1');

    try {
      const endpoint = `/fsm/star/cm/cm/getAllStatsClsfCd?${qs.toString()}`;
      const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
      const row = (res?.data?.content ?? res?.data ?? [])[0];
      const obj: CodeRow | null = row
        ? {
            clsfCd: norm(row.clsfCd ?? row.CLSF_CD),
            clsfCdNm: norm(row.clsfCdNm ?? row.CLSF_CD_NM),
            clsfPrntCd: row.clsfPrntCd
              ? norm(row.clsfPrntCd)
              : row.CLSF_PRNT_CD
              ? norm(row.CLSF_PRNT_CD)
              : null,
          }
        : null;
      codeCache.set(c, obj);
      return obj;
    } catch {
      codeCache.set(c, null);
      return null;
    }
  };

  const VEH_RX = { TR: /(화물|트럭)/i, TX: /(택시)/i, BS: /(버스)/i };
  const labelToFlag = (token: string): 'TR' | 'TX' | 'BS' | null => {
    const s = norm(token);
    if (!s) return null;
    if (VEH_RX.TR.test(s)) return 'TR';
    if (VEH_RX.TX.test(s)) return 'TX';
    if (VEH_RX.BS.test(s)) return 'BS';
    return null;
  };

  const scanFlagsFromCodeOrLabel = async (token: string, flags: Set<'TR' | 'TX' | 'BS'>) => {
    const direct = labelToFlag(token);
    if (direct) {
      flags.add(direct);
      return;
    }
    let cur = norm(token);
    for (let i = 0; i < 8; i++) {
      const row = await fetchCodeRow(cur);
      if (!row) break;
      const byLabel = labelToFlag(row.clsfCdNm);
      if (byLabel) {
        flags.add(byLabel);
        return;
      }
      if (!row.clsfPrntCd) break;
      cur = norm(row.clsfPrntCd);
    }
  };

  const isPeriodToken = (v: any) => {
    const s = String(v ?? '').trim().toUpperCase();
    return s === '' || s === '1' || s === 'YM' || s === 'YY' || s === 'MM' || s.includes('기간');
  };

  const [nameToCode, setNameToCode] = useState<Record<string, string>>({});
  const normalizeKey = (s: string) => String(s ?? '').replace(/\s+/g, '').toUpperCase();

  const fetchDictBySe = async (se: 'A' | 'B'): Promise<Record<string, string>> => {
    const qs = new URLSearchParams();
    qs.set('clsfSeCd', se);
    qs.set('page', '1');
    qs.set('size', '5000');
    const endpoint = `/fsm/star/cm/cm/getAllStatsClsfCd?${qs.toString()}`;
    const res = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    const list = (res?.data?.content ?? res?.data ?? []) as any[];

    const map: Record<string, string> = {};
    for (const row of list) {
      const code = String(row?.clsfCd ?? row?.CLSF_CD ?? '').trim();
      const name = String(row?.clsfCdNm ?? row?.CLSF_CD_NM ?? '').trim();
      if (code && name) map[normalizeKey(name)] = code;
    }
    return map;
  };

  const ensureCodeDict = async (): Promise<Record<string, string>> => {
    if (Object.keys(nameToCode).length > 0) return nameToCode;
    const [dictA, dictB] = await Promise.all([fetchDictBySe('A'), fetchDictBySe('B')]);
    const merged: Record<string, string> = { ...dictA, ...dictB };
    setNameToCode(merged);
    return merged;
  };

  const tokensToAggAxesUsingDict = (input: any, dict: Record<string, string>): AggAxis[] => {
    const out: AggAxis[] = [];
    for (const raw of toArrayAny(input)) {
      const t = String(raw ?? '').trim();
      const key = normalizeKey(t);
      if (isPeriodToken(t)) {
        out.push({ type: 'YM' });
        continue;
      }
      const code = dict[key] || t;
      const up = code.toUpperCase();
      if (up === 'YM' || up === 'YY' || up === 'MM') out.push({ type: 'YM' });
      else out.push({ type: 'CODE', code });
    }
    return out;
  };

  const deriveVehicleScopeFromRow = async (
    row: RptpRow,
  ): Promise<'ALL' | 'TR' | 'TX' | 'BS' | 'TR|TX' | 'TR|BS' | 'TX|BS'> => {
    const tokens = [...toArrayAny(row.x), ...toArrayAny(row.y)].filter(
      t => !!t && !isPeriodToken(t),
    );
    if (tokens.length === 0) return 'ALL';

    const flags = new Set<'TR' | 'TX' | 'BS'>();
    for (const t of tokens) {
      await scanFlagsFromCodeOrLabel(t, flags);
      if (flags.size >= 3) break;
    }
    if (flags.size === 0) {
      const titleHit = labelToFlag(row.rptpNm ?? '');
      if (titleHit) flags.add(titleHit);
    }
    if (flags.size === 0 || flags.size === 3) return 'ALL';
    return Array.from(flags)
      .sort()
      .join('|') as any;
  };

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  });

  // ───────────── 목록 조회 ─────────────
  async function fetchData() {
    setLoading(true);
    try {
      const endpoint =
        `/fsm/star/usr/usr/getAllRptpLst?page=${params.page}&size=${params.size}` +
        `${(params as any).ctpvCd ? '&ctpvCd=' + (params as any).ctpvCd : ''}` +
        `${(params as any).locgovCd ? '&locgovCd=' + (params as any).locgovCd : ''}`;

      console.log('[rptp endpoint]', endpoint);

      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
      if (response && response.resultType === 'success' && response.data) {
        const content = (response.data?.content ?? []).map((r: any) => ({
          ...r,
        }));

        setRptpRows(content);
        setTotalRows(response.data.totalElements ?? content.length);
        setPageable({
          pageNumber: (response.data?.pageable?.pageNumber ?? 0) + 1,
          pageSize: response.data?.pageable?.pageSize ?? (params.size as number),
          totalPages: response.data?.totalPages ?? 1,
        });
        setSelectedRowIndex(content.length > 0 ? 0 : -1);
      } else {
        setRptpRows([]);
        setSelectedRowIndex(-1);
        setTotalRows(0);
        setPageable({
          pageNumber: 1,
          pageSize: params.size as number,
          totalPages: 1,
        });
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      setRptpRows([]);
      setSelectedRowIndex(-1);
      setTotalRows(0);
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [flag]);

  // ───────────── 삭제 ─────────────
  const deleteData = async (): Promise<void> => {
    if (selectedRowIndex === -1) {
      alert('선택된 행이 없습니다.');
      return;
    }

    const row = rptpRows[selectedRowIndex];
    const name = String(row?.rptpNm ?? row?.rptpSn ?? '');

    if (!confirm(`${name} 삭제하시겠습니까?`)) return;

    setLoadingBackdrop(true);
    try {
      const endpoint = `/fsm/star/usr/usr/deleteRptpAll`;

      const payload = {
        rptpSn: row.rptpSn,
        locgovCd: row.locgovCd,
      };

      const response = await sendHttpRequest('DELETE', endpoint, payload, true, {
        cache: 'no-store',
      });

      // 백엔드에서 data 에 "SUCCESS" | "NO_DATA" | "INVALID_AUTH" 내려옴
      const code =
        typeof response?.data === 'string'
          ? response.data
          : '';

      if (!response || response.resultType !== 'success') {
        alert('삭제에 실패했습니다.');
        return;
      }
      console.log('Delete response code:', code);
      if (code === 'SUCCESS') {
        alert('삭제 되었습니다.');
        // 실제로 삭제된 경우에만 목록 다시 조회
        fetchData();
      } else if (code === 'NO_DATA') {
        alert('삭제할 데이터가 없습니다.');
      } else if (code === 'INVALID_AUTH') {
        alert('로그인 아이디가 속한 관할관청 보고서가 아닙니다. 삭제 불가합니다.');
      } else {
        // 혹시 모를 예외 코드
        alert('삭제 처리 결과를 알 수 없습니다.');
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoadingBackdrop(false);
    }
  };


  // ───────────── 이벤트 핸들러 ─────────────
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(prev => ({ ...prev, page: 1, size: 10 }));
    setFlag(prev => !prev);
  };

  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    console.log('[pager]', { page, pageSize });
    setParams(prev => ({
      ...prev,
      page,
      size: pageSize,
    }));
    setFlag(prev => !prev);
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // sch-ctpv / sch-locgov → 실제 쿼리에서 쓰는 키로 매핑
    let key = name;
    if (name === 'sch-ctpv') key = 'ctpvCd';
    if (name === 'sch-locgov') key = 'locgovCd';

    setParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 기간 모달 열기/닫기
  const openPeriodModal = (callback: (p: any) => void) => {
    setParams(prev => ({
      ...prev,
      bgngDt: defaultPeriod.bgngDt,
      endDt: defaultPeriod.endDt,
    }));
    setSelectedPeriod(defaultPeriod);
    setPeriodModalCallback(() => callback);
    setPeriodModalFlag(true);
  };
  const closePeriodModal = () => setPeriodModalFlag(false);

  const handleModalSearch = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // 기존: 조회용 params 업데이트
    setParams(prev => ({ ...prev, [name]: value }));

    // ✅ 추가: 기간 모달에서 선택한 값도 selectedPeriod에 반영
    if (name === 'bgngDt' || name === 'endDt') {
      setSelectedPeriod(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSelectedPeriod(prev => ({ ...prev, mode: value as 'MM' | 'YY' }));
  };

  const handleRowClick = React.useCallback((row: RptpRow, index?: number) => {
    setSelectedRowIndex(typeof index === 'number' ? index : -1);
  }, []);

  // 액션: 수정/출력
  const handleActionClick = (row: RptpRow, id: string) => {
    if (id === 'edit') {
      const sn = String((row as any).rptpSn ?? '');
      const orig = rptpRows.find(r => String(r.rptpSn) === sn) || null;
      setEditingRow(orig);
      const idx = rptpRows.findIndex(r => String(r.rptpSn) === sn);
      if (idx >= 0) setSelectedRowIndex(idx);

      openPeriodModal(() => {
        setOpen_c(true);
      });
      return;
    }

    if (id === 'print') {
      openPeriodModal(async periodParams => {
        try {
          setLoadingBackdrop(true);
          const dict = await ensureCodeDict();
          const x = tokensToAggAxesUsingDict(row.x, dict);
          const y = tokensToAggAxesUsingDict(row.y, dict);
          const m = tokensToAggAxesUsingDict(row.m, dict);
          const mode = (periodParams.mode as 'MM' | 'YY') ?? 'MM';
          const fromYm = String(periodParams.bgngDt ?? '');
          const toYm = String(periodParams.endDt ?? '');
          const vehicleScope = await deriveVehicleScopeFromRow(row);

          // 🔹 수정 포인트: 검색조건 기준으로 관할관청 사용
          const searchLocgovCd = String((params as any).locgovCd ?? '').trim();

          // 필요하다면 로그인 정보로 fallback
          const userInfo = user || getUserInfo?.();
          const fallbackLocgovCd = String(
            userInfo?.locgovCd ??
              userInfo?.locgov_cd ??
              userInfo?.locgov?.code ??
              '',
          ).trim();

          // 최종 사용할 관할관청 코드: 검색조건 우선, 없으면 로그인 값
          const locgovCd = searchLocgovCd || fallbackLocgovCd;
          console.log('Using locgovCd for print:', { searchLocgovCd, fallbackLocgovCd, locgovCd });
          if (!locgovCd) {
            alert('관할관청을 선택하세요.');
            return;
          }

          const payload = {
            rptpSn: String(row.rptpSn ?? '').trim(),
            rptpNm: String(row.rptpNm ?? '').trim(),
            vehicleScope,
            x,
            y,
            m,
            fromYm,
            toYm,
            mode,
            skeletonOnly: false,
            noCodeUpdate: true,
            locgovCd,
          };

          const res = await sendHttpRequest(
            'POST',
            '/fsm/star/usr/usr/updateReportAndPrint',
            payload,
            true,
            { cache: 'no-store' },
          );
          const dataAny = (res as any)?.data ?? res;

          const pivot: PivotData = {
            title: dataAny?.title ?? '',
            headerRows: Array.isArray(dataAny?.headerRows)
              ? dataAny.headerRows
              : Array.isArray(dataAny?.columnHeaders)
              ? dataAny.columnHeaders.map((r: any[]) =>
                  r.map((t: any) => ({ text: t, isHeader: true })),
                )
              : [],
            bodyRows: Array.isArray(dataAny?.bodyRows)
              ? dataAny.bodyRows
              : Array.isArray(dataAny?.rows)
              ? dataAny.rows.map((r: any[]) =>
                  r.map((t: any) => ({ text: t })),
                )
              : [],
          };

          const ctpvNm  = (row.ctpvNm  && String(row.ctpvNm).trim())  || '';
          const locgovNm = (row.locgovNm && String(row.locgovNm).trim()) || '';
          setPvParams({
            title: payload.rptpNm,
            bgngDt: payload.fromYm,
            endDt: payload.toYm,
            ctpvNm,
            locgovNm,
          });

          setPvData(pivot);
          setPvOpen(true);
        } catch (e) {
          console.error(e);
          alert('출력 중 오류가 발생했습니다.');
        } finally {
          setLoadingBackdrop(false);
        }
      });
    }
  };

  // ───────────── Render ─────────────
  const displayRows = React.useMemo(
    () =>
      (rptpRows ?? []).map(r => ({
        ...r,
        x: Array.isArray(r.x) ? r.x.join(', ') : r.x ?? '',
        y: Array.isArray(r.y) ? r.y.join(', ') : r.y ?? '',
        m: Array.isArray(r.m) ? r.m.join(', ') : r.m ?? '',
      })),
    [rptpRows],
  );

  return (
    <PageContainer
      title="비정형통계보고서"
      description="비정형통계보고서 조회 페이지"
    >
      <Breadcrumb title="비정형통계보고서" items={BCrumb} />

      {/* 검색영역 */}
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
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                <span className="text"></span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={deleteData}
            >
              삭제
            </Button>
            <Button
              onClick={() => {
                openPeriodModal(() => {
                  setOpen(true);
                });
              }}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
          </div>
        </Box>
      </Box>

      {/* 목록 */}
      <Box>
        <TableDataGrid
          headCells={starUserHc}
          rows={displayRows}
          totalRows={totalRows}
          selectedRowIndex={selectedRowIndex}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          paging={true}
          cursor={true}
          onActionClick={handleActionClick}
          onRowClick={handleRowClick}
        />
      </Box>

      {/* 기간선택 팝업 */}
      <Dialog
        fullWidth
        maxWidth="md"
        PaperProps={{ style: { width: '650px' } }}
        open={periodModalFlag}
        onClose={closePeriodModal}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>기간선택</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                onClick={() => {
                  if (!params.bgngDt || !params.endDt) {
                    alert('시작월과 종료월을 모두 선택하세요.');
                    return;
                  }
                  if (params.bgngDt > params.endDt) {
                    alert('시작월은 종료월보다 같거나 이전이어야 합니다.');
                    return;
                  }
                  if (periodModalCallback) {
                    periodModalCallback({
                      mode: selectedPeriod.mode === 'YY' ? 'YY' : 'MM',
                      bgngDt: String(params.bgngDt ?? ''),
                      endDt: String(params.endDt ?? ''),
                    });
                  }
                  setPeriodModalFlag(false);
                }}
                color="primary"
              >
                다음
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={closePeriodModal}
              >
                취소
              </Button>
            </div>
          </Box>

          <Box
            id="form-modal"
            component="form"
            onSubmit={e => e.preventDefault()}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'auto',
            }}
          >
            <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
              <TableContainer style={{ margin: '16px 0 0 0' }}>
                <Table
                  className="table table-bordered"
                  aria-labelledby="tableTitle"
                  style={{ tableLayout: 'fixed', width: '100%' }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{
                          width: '100px',
                          textAlign: 'left',
                          paddingLeft: '10px',
                        }}
                      >
                        <span className="required-text">*</span> 기간구분
                      </TableCell>
                      <TableCell colSpan={3}>
                        <div
                          className="form-group"
                          style={{ width: 'inherit' }}
                        >
                          <RadioGroup
                            name="type"
                            onChange={handleRadio}
                            value={selectedPeriod.mode}
                            className="mui-custom-radio-group"
                            row
                          >
                            <FormControlLabel
                              value="MM"
                              control={
                                <CustomRadio
                                  id="mon"
                                  name="mon"
                                  value="MM"
                                />
                              }
                              label="월별"
                            />
                            <FormControlLabel
                              value="YY"
                              control={
                                <CustomRadio
                                  id="year"
                                  name="year"
                                  value="YY"
                                />
                              }
                              label="년도별"
                            />
                          </RadioGroup>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{
                          width: '100px',
                          textAlign: 'left',
                          paddingLeft: '10px',
                        }}
                      >
                        <span className="required-text">*</span> 대상기간
                      </TableCell>
                      <TableCell
                        colSpan={3}
                        style={{ textAlign: 'center' }}
                      >
                        <div className="form-group">
                          <CustomTextField
                            type="month"
                            id="ft-date-start"
                            name="bgngDt"
                            value={params.bgngDt as any}
                            onChange={handleModalSearch}
                            style={{
                              width: '192px',
                              marginRight: '5px',
                            }}
                          />
                          ~
                          <CustomTextField
                            type="month"
                            id="ft-date-end"
                            name="endDt"
                            value={params.endDt as any}
                            onChange={handleModalSearch}
                            style={{
                              width: '192px',
                              marginLeft: '5px',
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 출력 프리뷰 팝업 */}
      <PivotPreviewModal
        open={pvOpen}
        handleClickClose={handlePivotClose}
        params={pvParams}
        pivot={pvData}
      />

      {/* 신규/수정 모달 */}
      <ReportModal
        isOpen={open}
        setClose={() => setOpen(false)}
        selectedRow={null}
        periodParams={{
          bgngDt: selectedPeriod.bgngDt,
          endDt: selectedPeriod.endDt,
          mode: selectedPeriod.mode,
        }}
        mode="create"
        onPreview={openPivot}
      />
      <ReportModal
        isOpen={open_c}
        setClose={() => setOpen_c(false)}
        selectedRow={editingRow as any}
        periodParams={{
          bgngDt: selectedPeriod.bgngDt,
          endDt: selectedPeriod.endDt,
          mode: selectedPeriod.mode,
        }}
        mode="update"
        onPreview={openPivot}
      />
    </PageContainer>
  );
};

export default DataList;
