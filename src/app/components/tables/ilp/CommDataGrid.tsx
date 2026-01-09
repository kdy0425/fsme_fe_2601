import React from 'react'

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Button,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import * as locales from '@mui/material/locale'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import { HeadCell, Pageable2 } from 'table'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { useState, useEffect } from 'react'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
} from '@/utils/fsms/common/util'
import Loading from '@/app/loading'
import CircularProgress from '@mui/material/CircularProgress'
import { telnoFormatter } from '@/utils/fsms/common/comm'
type SupportedLocales = keyof typeof locales

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: any[] // 목록 데이터
  totalRows?: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: (row: any, rowIndex?: number, colIndex?: number) => void // 행 클릭 핸들러 추가
  onRowDoubleClick?: (row: any, index?: number) => void // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean // 페이징여부
  selectedRowIndex?: number
  onCheckChange?: (selected: string[]) => void
  cursor?: boolean
  oneCheck?: boolean // 한개의 데이터만
  disableAllCheck?: boolean // 전체체크 제거
  validMsg?: string // 유효성검사 메시지
  validFlag?: boolean // 유효성검사 플래그
  customHeader?: (
    handleSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ) => React.ReactNode
  split?: boolean
  checkAndRowClick?: boolean
  emptyMessage?: string
  caption?: string
  handleSelectAllInterceptor?: (rows: any[]) => any[] | false
  handleSelectInterceptor?: (rows: any) => boolean
  onSelectedKeysChange?: (selectedKeys: string[]) => void;
  beforeToggle?: (row: any, index: number) => Promise<boolean>; // 분석 체크처리를 위해서 추가
  selectedKeys?: string[];                    // ✅ 추가
}

type order = 'asc' | 'desc'

// 어떤 셀이 '빨강표시 대상'인지 판단
const isMarkedRed = (row: any, colId: string) => {
  if (!row) return false;

  // ───────── 메인 그리드 표시(요청: vhclSttsNm '정상' 아님은 붉게) ─────────
  if (row.__mark_s1 && colId === 'vhclSttsNm') return true; // 차량상태
  if (row.__mark_s2 && (
        colId === 'frghtQlfcSttsNm' ||
        colId === 'taxiQlfcSttsNm'  ||
        colId === 'busQlfcSttsNm'
      )) return true;

  // (옵션) 메인에서 보험구간 빨강 표시 플래그를 쓴다면 유지
  if (row.__mark_t1 && (colId === 'twdpsn1EraYmd' || colId === 'twdpsn1EotYmd')) return true;
  if (row.__mark_t2 && (colId === 'twdpsn2EraYmd' || colId === 'twdpsn2EotYmd')) return true;
  if (row.__mark_s  && (
        colId === 'sbsttEraYmd' || colId === 'sbsttEotYmd' ||
        colId === 'psnSeNm'     ||  // 여기에 추가s
        colId === 'bzmnSttsCdNm'
        //colId === 'sbsttNm'     || // 대물명
        //colId === 'twdpsn1SeNm' || // 필요 시
        //colId === 'twdpsn2SeNm'    // 필요 시
      )) return true;
   
  // ───────── 메인 그리드 ─────────
  //if (row.__mark_s1 && colId === 'vhclSttsNm') return true;
  if (row.__mark_s2 && (
        colId === 'frghtQlfcSttsNm' ||
        colId === 'taxiQlfcSttsNm'  ||
        colId === 'busQlfcSttsNm'
      )) return true;

  // ───────── 의무보험 상세 ─────────
  if (row.__ins_unrecv) {
    if (colId === 'insrncSttsCd' /* || colId === 'insrncCoNm' */) return true;
    // 미수신일 땐 등록/수정일, 담보기간 컬럼은 여기서 끝
    return false;
  }
  if (row.__ins_reg && colId === 'regDt') return true;
  if (row.__ins_unrecv && colId === 'insrncSttsCd') return true;
  if (row.__ins_fh && (colId === 'regDt' || colId === 'REG_DT' || colId === 'REG_DT_ORG')) return true;
  if (row.__ins_mdf && (colId === 'mdfcnDt' || colId === 'MDFCN_DT' || colId === 'MDFCN_DT_ORG')) return true;
  if (row.__ins_t1 && (colId === 'twdpsn1EraYmd' || colId === 'twdpsn1EotYmd')) return true;
  if (row.__ins_t2 && (colId === 'twdpsn2EraYmd' || colId === 'twdpsn2EotYmd')) return true;
  if (row.__ins_s  && (colId === 'sbsttEraYmd'   || colId === 'sbsttEotYmd')) return true;

  // ───────── 운수종사자 상세 (컬럼별) ─────────
  // "해당 항목만" 붉게를 위한 확장점
  if (row.__ql_fh && (colId === 'kotsaRegDt' || colId === 'KOTSA_REG_DT' || colId === 'KOTSA_REG_DT_N')) return true;
  if (row.__ql_mdf && (colId === 'kotsaMdfcnDt' || colId === 'KOTSA_MDFCN_DT')) return true;
  if (row.__ql_kotsa && colId === 'kotsaRegDt') return true;
  if (row.__ql_sts && (colId === 'taxiQlfcSttsNm' || colId === 'busQlfcSttsNm')) return true;     // '취득'이 아니면 상태만
  if (row.__ql_acq && (colId === 'taxiQlfcAcqsYmd' || colId === 'busQlfcAcqsYmd')) return true;     // d8 < 취득일이면 취득일만
  if (row.__ql_rtr && (colId === 'taxiQlfcRtrcnYmd' || colId === 'busQlfcAcqsYmd')) return true;    // d8 > 말소일이면 말소일만

  // ───────── 사업자정보 상세 (컬럼별) ─────────
  if (row.__bz_fh  && (colId === 'regDt' || colId === 'REG_DT' || colId === 'mdfcnDt' || colId === 'MDFCN_DT')) return true;
  if (row.__bz_mdf && (colId === 'mdfcnDt' || colId === 'MDFCN_DT')) return true;
  if (row.__bz_sts && colId === 'bzmnSttsCdNm') return true;
  if (row.__bz_reg && colId === 'regDt') return true;     
  if (row.__bz_open && colId === 'opbizYmd') return true;     
  if (row.__bz_rest && (colId === 'tcbizBgngYmd'|| colId === 'tcbizEndYmd')) return true;    

  // ───────── 면허정보 상세 (컬럼별) ─────────
  if (row.__lc_fh  && (colId === 'knpaRegDt' || colId === 'KNPA_REG_DT' || colId === 'knpaMdfcnDt' || colId === 'KNPA_MDFCN_DT')) return true;
  if (row.__lc_mdf && (colId === 'knpaMdfcnDt' || colId === 'KNPA_MDFCN_DT')) return true;
  if (row.__lc_sts && colId === 'psnSeNm') return true;
  if (row.__lc_reg && colId === 'knpaRegDt') return true;     
  if (row.__lc_stop && (colId === 'stopBgngYmd'|| colId === 'stopEndYmd')) return true; 

  return false;

  // if (!row) return false;
  // if (row.__mark_t1 && (colId === 'twdpsn1EraYmd' || colId === 'twdpsn1EotYmd')) return true;
  // if (row.__mark_t2 && (colId === 'twdpsn2EraYmd' || colId === 'twdpsn2EotYmd')) return true;
  // // 👉 s 플래그일 때 sbstt* + psnSeNm 도 빨갛게
  // if (row.__mark_s && (
  //       colId === 'sbsttEraYmd' || 
  //       colId === 'sbsttEotYmd' || 
  //       colId === 'psnSeNm'     ||  // 여기에 추가
  //       colId === 'bzmnSttsCdNm'
  //       //colId === 'frghtQlfcSttsNm' ||
  //       //colId === 'taxiQlfcSttsNm'  ||  
  //       //colId === 'busQlfcSttsNm' 
  //     )) return true;
  // if (row.__mark_s1 && (
  //       colId === 'vhclSttsNm' 
  //     )) return true;
  // if (row.__mark_s2 && (
  //       colId === 'frghtQlfcSttsNm' ||
  //       colId === 'taxiQlfcSttsNm'  ||  
  //       colId === 'busQlfcSttsNm' 
  //     )) return true;
  // return false;
};

const redColor = '#d32f2f';

// 셀 스타일 계산(빨강 > 유효성검사R > 행색)
const getCellStyle = (row: any, headCell: HeadCell): React.CSSProperties => {
  const redMark = isMarkedRed(row, headCell.id as string);
  const color =
    redMark ? redColor :
    row?.chkVal === 'R' ? redColor :
    (row?.color ?? 'black');

  return {
    color,
    fontWeight: (redMark || row?.chkVal === 'R') ? 600 : undefined,
    whiteSpace: 'nowrap',
    ...(headCell.style ?? {}),
  };
};

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  onRowClick,
  onRowDoubleClick,
  pageable,
  paging,
  selectedRowIndex,
  onCheckChange,
  cursor,
  oneCheck,
  disableAllCheck,
  validMsg,
  validFlag,
  customHeader,
  split,
  checkAndRowClick,
  emptyMessage,
  caption,
  handleSelectAllInterceptor,
  handleSelectInterceptor,
  onSelectedKeysChange,
  beforeToggle,
  selectedKeys,               // ✅ 추가
}) => {
  const [selected, setSelected] = React.useState<readonly string[]>([])
  const [allCheck, setAllCheck] = React.useState<boolean>(false)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (oneCheck || disableAllCheck) {
      return
    }

    let isChecked = false
    let resultArray: any[] | false = []

    if (handleSelectAllInterceptor) {
      isChecked = selected.length === 0 ? true : false
      if (rows.length !== 0) {
        const pRows = rows.map((item, index) => ({ ...item, '@key@': index }))
        resultArray = handleSelectAllInterceptor?.(pRows)
      }      
    } else {
      isChecked = event.target.checked
      resultArray = rows.slice()
    }

    if (typeof resultArray === 'boolean' && !resultArray) {
      return
    }

    if (isChecked) {
      let checkFlag = false

      // const newSelected = rows.map((row, index) => 'tr' + index)
      // 일반 유효성 검사 및 유효성 검사 + 글자 색상 빨강인 경우 처리 추가
      const newSelected = resultArray.map((row, index) => {
        if (row.chkVal !== 'V' && row.chkVal !== 'R') {
          if (handleSelectAllInterceptor) {
            return 'tr' + row[`@key@`]
          } else {
            return 'tr' + index
          }          
        } else {
          if (!checkFlag) {
            alert(validMsg)
            checkFlag = true
          }
          return ''
        }
      })

      const uniq = Array.from(new Set(newSelected.filter(Boolean))); // ✅ 빈값 제거 + 중복 제거

      setSelected(uniq)
      onCheckChange?.(uniq)
      return
    }
    setSelected([])
    onCheckChange?.([])
  }

  const handleCheckboxChange = (index: number) => {
    const id = 'tr' + index
    setSelected(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id) // 선택 해제
          : [...prev, id], // 선택 추가
    )
  }

  //const handleSelect = (id: string, row: any, index?: number) => {
  const handleSelect = async (id: string, row: any, index?: number) => {
    //  분석 체크처리를 위해서 추가: 토글 전에 부모 확인
    if (beforeToggle) {
      const ok = await beforeToggle(row, index ?? -1);
      if (!ok) return; // 실패/거부 시 토글 중단
    }

    const selectedIndex = selected.indexOf(id)

    let result: boolean = true

    if (handleSelectInterceptor) {
      result = handleSelectInterceptor?.(row)
    }

    if (!result) {
      return
    }

    const newSelected =
      selectedIndex === -1
        ? row.chkVal === 'V' || row.chkVal === 'R' // 체크 유효성 검사에 걸리면 (V: 유효성검사 일반, R: 유효성검사 + 글자색상 빨강)
          ? (alert(validMsg), [...selected]) // 유효성검사 메시지 출력, 선택은 기존 그대로
          : oneCheck
            ? [id] // `oneCheck`이 true면 새로운 ID만 저장
            : [...selected, id] // 선택 추가
        : selected.filter((item) => item !== id) // 선택 해제

    setSelected(newSelected)
    onCheckChange?.(newSelected)
    // `checkAndRowClick`이 true일 때, 행 클릭 이벤트 호출
    if (checkAndRowClick && onRowClick) {
      onRowClick(row, index)
    }
  }

  const handleRowOrCheckboxClick = (row: any, index: number) => {
    const id = 'tr' + index
    handleSelect(id, row, index)
  }

// group 헤더 적용 (그룹이 하나라도 있으면, 그룹 없는 컬럼은 rowSpan=2)
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { headCells } = props;

  const hasGroup = headCells.some((h: any) => !!(h as any).group);

  // 공통: 한 칸 헤더 셀 렌더(기존 1줄 헤더용)
  const renderHeaderCell = (headCell: HeadCell, i: number) => {
    if (headCell.format === 'checkbox') {
      return (
        <TableCell
          key={'th' + i}
          style={
            disableAllCheck
              ? { whiteSpace: 'nowrap', ...(headCell.style ?? {}) }
              : { ...(headCell.style ?? {}) }
          }
          padding={disableAllCheck ? 'normal' : 'checkbox'}
        >
          {oneCheck ? null : disableAllCheck ? (
            <div className="table-head-text">{headCell.label}</div>
          ) : (
            <>
              <CustomFormLabel className="input-label-none" htmlFor="all">
                전체선택
              </CustomFormLabel>
              <CustomCheckbox
                id="all"
                indeterminate={
                  selected.length > 0 && selected.length < rows.length && !validFlag
                }
                checked={
                  rows.length !== 0 && selected.length === rows.length && !validFlag
                }
                onChange={handleSelectAll}
                tabIndex={-1}
                inputProps={{ 'aria-labelledby': 'select all rows' }}
              />
            </>
          )}
        </TableCell>
      );
    }
    return (
      <TableCell
        key={'th' + i}
        align="left"
        padding={headCell.disablePadding ? 'none' : 'normal'}
        style={{ whiteSpace: 'nowrap', ...(headCell.style ?? {}) }}
      >
        <div className="table-head-text">{headCell.label}</div>
      </TableCell>
    );
  };

  if (!hasGroup) {
    // 기존 1줄 헤더
    return (
      <TableHead>
        <TableRow key={'thRow'}>
          {headCells.map((h, i) => renderHeaderCell(h, i))}
        </TableRow>
      </TableHead>
    );
  }

  // 1행 구성: group 연속 구간은 colSpan, group 없는 컬럼은 rowSpan=2로 표시
  type FirstRowCell =
    | { kind: 'group'; label: string; span: number }
    | { kind: 'single'; headCell: HeadCell };

  const firstRow: FirstRowCell[] = [];
  for (let i = 0; i < headCells.length; ) {
    const hc: any = headCells[i];
    const g = hc.group;
    if (g) {
      let span = 1;
      let j = i + 1;
      while (j < headCells.length && (headCells[j] as any).group === g) {
        span++;
        j++;
      }
      firstRow.push({ kind: 'group', label: g, span });
      i = j;
    } else {
      firstRow.push({ kind: 'single', headCell: headCells[i] });
      i++;
    }
  }

  const groupedCols = headCells.filter((h: any) => !!h.group);

  return (
    <TableHead>
      {/* 1행: 그룹 라벨 / 단일 컬럼(rowSpan=2) */}
      <TableRow>
        {firstRow.map((c, idx) => {
          if (c.kind === 'single') {
            const hc = c.headCell as any;
            // 체크박스/일반 모두 rowSpan=2로 렌더
            if (hc.format === 'checkbox') {
              return (
                <TableCell
                  key={'single-cb-' + idx}
                  rowSpan={2}
                  padding={disableAllCheck ? 'normal' : 'checkbox'}
                  style={
                    disableAllCheck
                      ? { whiteSpace: 'nowrap', ...(hc.style ?? {}) }
                      : { ...(hc.style ?? {}) }
                  }
                >
                  {oneCheck ? null : disableAllCheck ? (
                    <div className="table-head-text">{hc.label}</div>
                  ) : (
                    <>
                      <CustomFormLabel className="input-label-none" htmlFor="all">
                        전체선택
                      </CustomFormLabel>
                      <CustomCheckbox
                        id="all"
                        indeterminate={
                          selected.length > 0 && selected.length < rows.length && !validFlag
                        }
                        checked={
                          rows.length !== 0 && selected.length === rows.length && !validFlag
                        }
                        onChange={handleSelectAll}
                        tabIndex={-1}
                        inputProps={{ 'aria-labelledby': 'select all rows' }}
                      />
                    </>
                  )}
                </TableCell>
              );
            }
            return (
              <TableCell
                key={'single-' + idx}
                rowSpan={2}
                align="left"
                padding={hc.disablePadding ? 'none' : 'normal'}
                style={{ whiteSpace: 'nowrap', ...(hc.style ?? {}) }}
              >
                <div className="table-head-text">{hc.label}</div>
              </TableCell>
            );
          }
          // 그룹 라벨 셀 (가운데 정렬 + 굵게)
          return (
            <TableCell key={'group-' + idx} colSpan={c.span} style={{ whiteSpace: 'nowrap' }}>
              <div className="table-head-text" style={{ fontWeight: 600, textAlign: 'center' }}>
                {c.label}
              </div>
            </TableCell>
          );
        })}
      </TableRow>

      {/* 2행: 그룹에 속한 컬럼 라벨만 렌더 */}
      <TableRow key={'thRow'}>
        {groupedCols.map((h, i) => renderHeaderCell(h as HeadCell, i))}
      </TableRow>
    </TableHead>
  );
}

  function TableBottomToolbar() {
    const pageSizes = [
      {
        value: '10',
        label: '10',
      },
      {
        value: '20',
        label: '20',
      },
      {
        value: '50',
        label: '50',
      },
    ]

    if (caption === 'commonPagingBs') {
      pageSizes.push({ value: '100', label: '100' })
      pageSizes.push({ value: '5000', label: '5000' })
    }

    // Select
    const [pageSize, setPageSize] = React.useState(pageable?.pageSize)
    const handleChangeSelect = (event: any) => {
      onPaginationModelChange?.(0, event.target.value)
    }

    return (
      <div className="data-grid-bottom-toolbar">
        <div className="data-grid-select-count">
          총 {getCommaNumber(totalRows ?? 0)}개
        </div>
        <CustomFormLabel
          className="input-label-none"
          htmlFor="data-grid-row-count-select"
        >
          테이블 데이터 갯수
        </CustomFormLabel>
        {pageable ? (
          <>
            <select
              id="data-grid-row-count-select"
              className="custom-default-select"
              value={pageSize}
              onChange={handleChangeSelect}
            >
              {pageSizes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="data-grid-row-count-select">줄씩보기</div>
          </>
        ) : (
          <></>
        )}
      </div>
    )
  }

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    if (pageable?.totalPages === 0) return
    onPaginationModelChange?.(newPage, pageable?.pageSize ?? 0)
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  function getRowspan(index: number, colNm: string) {
    let count = 1
    const colValue = rows[index][colNm]

    if (!colValue) return count

    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i][colNm] === colValue) {
        count++
      } else {
        break
      }
    }
    return count
  }

  function isRowspan(index: number, colNm: string) {
    if (
      index > 0 &&
      rows[index][colNm] &&
      rows[index - 1][colNm] === rows[index][colNm]
    ) {
      return true
    } else {
      return false
    }
  }

  function getColspan(row: any, headCells: HeadCell[], index: number) {
    const colValue = row[headCells[index].id]
    let count = 1
    if (
      colValue === '소계' ||
      colValue === '합계' ||
      colValue === '부정수급액' ||
      colValue === '환수대상금액'
    ) {
      for (let i = index + 1; i < headCells.length; i++) {
        if (!row[headCells[i].id]) {
          count++
        } else {
          break
        }
      }
    }
    return count
  }

  function isColspan(row: any, headCells: HeadCell[], index: number) {
    if (!row[headCells[index].id]) {
      for (let i = index - 1; i > -1; i--) {
        if (row[headCells[i].id]) {
          if (
            row[headCells[i].id] === '소계' ||
            row[headCells[i].id] === '합계' ||
            row[headCells[i].id] === '부정수급액' ||
            row[headCells[i].id] === '환수대상금액'
          )
            return true
          else return false
        }
      }
    }
    return false
  }

  function getCellValue(row: any, headCell: any) {
    try {
      //커스텀 렌더링 추가
      if (headCell.format === 'custom' && typeof headCell.customRender === 'function') {
        return headCell.customRender(row);
      }
      // if (typeof headCell.customRender === 'function') {
      //   return headCell.customRender(row);
      // }

      if (headCell.format === 'brno') {
        return brNoFormatter(row[headCell.id])
      } else if (headCell.format === 'lit') {
        return Number(row[headCell.id]).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      } else if (headCell.format === 'number') {
        return getCommaNumber(row[headCell.id])
      } else if (headCell.format === 'cardNo') {
        let cardNo = row[headCell.id]
        if (!cardNo) return ''
        return (
          cardNo.substring(0, 4) +
          '-' +
          cardNo.substring(4, 8) +
          '-' +
          cardNo.substring(8, 12) +
          '-' +
          cardNo.substring(12, 16)
        )
      } else if (headCell.format === 'rrno') {
        let rrno = row[headCell.id]
        if (!rrno) return ''
        return rrno.substring(0, 6) + '-' + rrno.substring(6, 13)
      } else if (headCell.format === 'yyyymm') {
        return getDateTimeString(row[headCell.id], 'mon')?.dateString
      } else if (headCell.format === 'yyyymmdd') {
        return getDateTimeString(row[headCell.id], 'date')?.dateString
      } else if (headCell.format === 'yyyymmddhh24miss') {
        return dateTimeFormatter(row[headCell.id])
      } else if (headCell.format === 'hh24miss') {
        return getDateTimeString(row[headCell.id], 'time')?.timeString
      } else if (headCell.format === 'yyyy년mm월') {
        if (isNaN(row[headCell.id])) return row[headCell.id]
        let dateString = getDateTimeString(row[headCell.id], 'mon')?.dateString

        let year = dateString?.substring(0, 4)
        let month = dateString?.substring(5, 7)

        return year + '년 ' + month + '월'
      } else if (headCell.format === 'yyyy년') {
        if (isNaN(row[headCell.id])) return row[headCell.id]
        return row[headCell.id] + '년'
      } else if (headCell.format === 'telno') {
        return telnoFormatter(row[headCell.id])
      } else if (headCell.format === 'ymdsubstr') {
        if (isNaN(row[headCell.id]) && row[headCell.id].length < 10)
          return row[headCell.id]
        let dateString = row[headCell.id]
        let ymd = dateString?.substring(0, 10)

        return ymd
      } else {
        return row[headCell.id]
      }
    } catch (error) {
      console.error('Error get City Code data:', error)
    }
    return ''
  }

  // 작은 유틸: 배열 비교
  const arraysEqual = (a: readonly string[], b: readonly string[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // (A) 부모 → 자식 동기화 (부모가 내려주면 그대로 맞춤)
  useEffect(() => {
    if (!Array.isArray(selectedKeys)) return;
    if (!arraysEqual(selected, selectedKeys)) {
      setSelected(selectedKeys);
    }
  }, [selectedKeys]);

  useEffect(() => {
    if (Array.isArray(selectedKeys)) return; // 부모 제어 중이면 skip

    const data = Array.isArray(rows) ? rows : [];
    const initialSelected = data
    .map((row: any, index: number) => (row?.chk === '1' ? 'tr' + index : null))
    .filter((id: string | null): id is string => id !== null);
      // .map((row, index) => (row.chk === '1' ? 'tr' + index : null))
      // .filter((id): id is string => id !== null);

    if (initialSelected.length > 0 && !arraysEqual(selected, initialSelected)) {
      setSelected(initialSelected);
      onSelectedKeysChange?.(initialSelected);
    }
    // 부모 제어가 아닌 경우에만 rows로 초기화
  }, [rows])

  useEffect(() => {
    if (typeof onSelectedKeysChange === 'function') {
      onSelectedKeysChange?.([...selected]);
     }
  }, [selected]);

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <TableContainer>
          <Table
            sx={split || split == null ? { minWidth: '750' } : {}}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            {caption ? (
              <>
                <caption>{caption}</caption>
              </>
            ) : (
              <>
                <caption>테이블 내용</caption>
              </>
            )}
            {customHeader ? (
              customHeader(handleSelectAll)
            ) : (
              <EnhancedTableHead headCells={headCells} />
            )}
            <TableBody>
              {!loading ? (
                rows.length > 0 ? (
                  rows.map((row: any, index) => {
                    return (
                      <TableRow
                        hover
                        selected={selectedRowIndex == index}
                        key={'tr' + index}
                        sx={
                          onRowClick !== undefined ? { cursor: 'pointer' } : {}
                        }
                        onClick={() => {
                          if (checkAndRowClick) {
                            handleSelect('tr' + index, row, index) // Row 클릭 시 handleSelect 호출
                          }
                        }}
                      >
                        {headCells.map((headCell, i) => (
                          <React.Fragment key={'tr' + index + i + headCell.id}>
                            {headCell.format === 'button' ? (
                              <TableCell>
                                <Button
                                  onClick={() =>
                                    headCell.button?.onClick(row, index)
                                  }
                                  variant="contained"
                                  color={
                                    headCell.button?.color
                                      ? headCell.button?.color
                                      : 'primary'
                                  }
                                >
                                  {headCell.button?.label}
                                </Button>
                              </TableCell>
                            ) : headCell.format === 'checkbox' ? (
                              <TableCell padding="checkbox">
                                <CustomFormLabel
                                  className="input-label-none"
                                  htmlFor={'tr' + index}
                                ></CustomFormLabel>
                                <CustomCheckbox
                                  // id={headCell.id + index}
                                  id={'tr' + index}
                                  name={headCell.id}
                                  value={'tr' + index}
                                  checked={selected.includes('tr' + index)}
                                  onClick={(e: any) => e.stopPropagation()}       // ✅ 전파 차단
                                  onMouseDown={(e: any) => e.stopPropagation()}   // ✅ 전파 차단
                                  onChange={() =>
                                    handleSelect('tr' + index, row, index)
                                  } // row와 index 추가
                                />
                              </TableCell>
                            ) : (headCell.rowspan &&
                                isRowspan(index, headCell.id)) ||
                              isColspan(
                                row,
                                headCells,
                                i,
                              ) ? null : onRowClick !== undefined ||
                              onRowDoubleClick !== undefined ? (
                              <TableCell
                                rowSpan={
                                  headCell.rowspan &&
                                  !isRowspan(index, headCell.id)
                                    ? getRowspan(index, headCell.id)
                                    : 1
                                }
                                colSpan={getColspan(row, headCells, i)}
                                className={headCell.align}
                                /* style={{
                                  // 유효성 검사 처리 + 폰트 색상을 빨간색으로 처리해야 할 경우 콜론 앞부분을 실행
                                  color:
                                    row.chkVal === 'R'
                                      ? (row['color'] ?? 'red')
                                      : (row['color'] ?? 'black'),
                                  whiteSpace: 'nowrap',
                                  ...headCell.style,
                                }} */
                                style={getCellStyle(row, headCell)}
                                onClick={() => onRowClick?.(row, index, i)}
                                onDoubleClick={
                                  () => onRowDoubleClick?.(row) // onRowDoubleClick가 있는 경우만 호출
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    onRowClick !== undefined
                                      ? onRowClick?.(row, index, i)
                                      : onRowDoubleClick?.(row)
                                  }
                                }}
                              >
                                {getCellValue(row, headCell)}
                              </TableCell>
                            ) : (
                              <TableCell
                                rowSpan={
                                  headCell.rowspan &&
                                  !isRowspan(index, headCell.id)
                                    ? getRowspan(index, headCell.id)
                                    : 1
                                }
                                colSpan={getColspan(row, headCells, i)}
                                className={headCell.align}
                                /* style={{
                                  color: row['color'] ?? 'black',
                                  whiteSpace: 'nowrap',
                                  ...headCell.style,
                                }} */
                                style={getCellStyle(row, headCell)}
                              >
                                {getCellValue(row, headCell)}
                              </TableCell>
                            )}
                          </React.Fragment>
                        ))}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow key={'tr0'}>
                    <TableCell colSpan={headCells.length} className="td-center">
                      <p>
                        {emptyMessage
                          ? emptyMessage
                          : '검색된 데이터가 없습니다.'}
                      </p>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow key={'tr0'}>
                  <TableCell colSpan={headCells.length} className="td-center">
                    <p>
                      <CircularProgress />
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        {!loading ? (
          <>
            {pageable ? (
              <div className="pagination-wrapper">
                <Pagination
                  count={pageable?.totalPages === 0 ? 1 : pageable?.totalPages}
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  page={pageable?.pageNumber}
                  onChange={handleChangePage}
                />
              </div>
            ) : null}
            {totalRows ? (
              <Box
                style={
                  !pageable
                    ? { display: 'inline-flex', marginTop: '20px' }
                    : undefined
                }
              >
                <TableBottomToolbar />
              </Box>
            ) : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  )
}

export default React.memo(TableDataGrid)