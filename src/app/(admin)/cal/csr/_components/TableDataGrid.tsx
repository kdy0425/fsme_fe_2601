import React, { useEffect } from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import { HeadCell } from 'table';
import { Row } from '../page';
import { formatDate } from '@/utils/fsms/common/convert';
type SupportedLocales = keyof typeof locales;

// 페이지 정보
type pageable = {
  pageNumber : number,
  pageSize : number,
  sort : string
}

// 검색 결과 건수 툴바
function TableTopToolbar() {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        
      </div>
    </div>
  );
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  loading: boolean // 로딩 여부
  onRowClick: (row: any, index?: number) => void // 행 클릭 핸들러 추가
  selectedRowIndex?: number
  pageable: pageable  // 페이지 정보
  caption: string
}

type order = 'asc' | 'desc';

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    headCells,
    rows,
    loading,
    onRowClick,
    selectedRowIndex,
    pageable,
    caption
}) => {

  // MUI 그리드 한글화
  const locale : SupportedLocales ='koKR';
  const theme = useTheme();
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );
  
  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}> 
      <div className="data-grid-wrapper">
        <TableTopToolbar />
        <div className="table-scrollable">
          <table className="table table-bordered">
          <caption>{caption}</caption>
          <TableHead>
            <TableRow>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>청구월</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>거래건수</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>거래실인원</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>사용리터(ℓ)</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>보조리터(ℓ)</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>총거래금액</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>본인정산액</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} colSpan={3}>유가보조금</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{whiteSpace:'nowrap'}}>합계</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>유류세연동</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>유가연동</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow 
                      key={'tr'+index} 
                      hover
                      selected={selectedRowIndex == index}
                      onClick={() => onRowClick(row, index)}
                    >
                      <TableCell style={{whiteSpace:'nowrap', textAlign: 'center'}}>{formatDate(row.clclnYm)}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.slsNocs).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.rlDlngNmprCnt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.useLiter).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.asstAmtLiter).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.slsAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.indvClmAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.asstAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.ftxAsstAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.opisAmt).toLocaleString('ko-KR')}</TableCell>
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={10} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={10} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </table>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TableDataGrid;
