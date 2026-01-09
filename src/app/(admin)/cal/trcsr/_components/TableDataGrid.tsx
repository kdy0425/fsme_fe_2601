import React, { useEffect } from 'react';

import {
  Box,
  Pagination,
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
import { HeadCell, Pageable2 } from 'table';
import { Row } from '../page';
import { formatDate } from '@/utils/fsms/common/convert';
import { getCommaNumber } from '@/utils/fsms/common/util';
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
type SupportedLocales = keyof typeof locales;

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[];
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick: (postTsid: string) => void // 행 클릭 핸들러 추가
  pageable: Pageable2  // 페이지 정보
  paging: boolean // 페이징 여부
  caption: string
}

type order = 'asc' | 'desc';

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    headCells,
    rows,
    totalRows,
    loading,
    onPaginationModelChange,
    onRowClick,
    pageable,
    paging,
    caption
}) => {

  // MUI 그리드 한글화
  const locale : SupportedLocales ='koKR';
  const theme = useTheme();
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  function getAprvYmd(dateString: string) {
    return formatDate(dateString);
  }

  function getAprvTm(timeString: string) {
    return `${timeString.slice(0, 2)}:${timeString.slice(2, 4)}:${timeString.slice(4, 6)}`;
  }

  function TableBottomToolBar() {
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
      }
    ];

    const [pageSize, setPageSize] = React.useState(pageable.pageSize);
    const handleChangeSelect = (event: any) => {
      onPaginationModelChange(pageable.pageNumber, event.target.value);
    };

    return (
      <div className="data-grid-bottom-toolbar">
        <div className="data-grid-select-count">총 {getCommaNumber(totalRows)}개</div>
        <CustomFormLabel className="input-label-none" htmlFor="data-grid-row-count-select">테이블 데이터 갯수</CustomFormLabel>
        {paging ?
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
          :<></>
        }
      </div>
    );
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    if(pageable?.totalPages === 0) return
    onPaginationModelChange(newPage, pageable.pageSize);
  }
  
  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}> 
      <div className="data-grid-wrapper">
        <div className="table-scrollable">
          <table className="table table-bordered">
            <caption>{caption}</caption>
            <TableHead>
              <TableRow>
                <TableCell style={{whiteSpace:'nowrap'}}>청구월</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>면허업종</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>차량번호</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>소유자명</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>주민등록번호</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>카드사</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>카드번호</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} colSpan={2}>거래일시</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>거래구분</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>유종</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>사용리터</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>매출액</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>국토부보조금</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>국토부보조리터</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>가맹점명</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>가맹점주소</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow key={'tr'+index}>
                      <TableCell style={{whiteSpace:'nowrap'}}>{formatDate(row.clclnYm)}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.lcnsTpbizNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.vhclNo}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.vonrNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.rrnoSecure}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.crdcoNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.cardNoSecure}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{getAprvYmd(row.aprvYmd)}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{getAprvTm(row.aprvTm)}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.clclnSeNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.koiNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.useLiter).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.slsAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.asstAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}} className={'td-right'}>{Number(row.asstAmtLiter).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.frcsNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.daddr}</TableCell>
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={17} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={17} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </table>
        </div>
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
                <TableBottomToolBar />
              </Box>
            ) : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  );
};

export default TableDataGrid;
