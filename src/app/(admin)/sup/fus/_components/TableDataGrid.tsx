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
import {
  getLabelFromCode,       
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint,
  formatDateDecimal
} from '@/utils/fsms/common/convert'


type SupportedLocales = keyof typeof locales;

// 페이지 정보
type pageable = {
  pageNumber : number,
  pageSize : number,
  sort : string
}

// 테이블 caption
const tableCaption :string = ''

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void;
  order: order;
  orderBy: string;
}

// 테이블 th 정의 기능

// 검색 결과 건수 툴바
function TableTopToolbar(props:Readonly<{totalRows:number}>) {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        검색 결과 <span className="search-count">{props.totalRows}</span>건
      </div>
    </div>
  );
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  onRowClick: (postTsid: string) => void // 행 클릭 핸들러 추가
  pageable: pageable  // 페이지 정보
}

type order = 'asc' | 'desc';

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    rows,
    totalRows,
    loading,
    onPaginationModelChange,
    onSortModelChange,
    onRowClick,
    pageable,
}) => {

  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  let order : order = 'desc'; 
  let orderBy : string = '';
  if (pageable.sort !== ''){
    let sort = pageable.sort.split(','); 
    orderBy = sort[0];
    order = sort[1] == 'desc'? 'desc' : 'asc';
  }

  // sort 정렬 변경시 정렬 기준으로 데이터 다시 로드
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof []) => {
    const isAsc = orderBy === property && order === 'asc';
    onSortModelChange(String(property)+','+ (isAsc ? 'desc' : 'asc'))
  };

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange(newPage,pageable.pageSize)
  };

  //페이지 사이즈 변경시 0 페이지로 이동
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPaginationModelChange(0,Number(event.target.value))
  };

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
        <TableTopToolbar totalRows={totalRows} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
          <caption>
            {'tableCaption'}
          </caption>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2}> 기준년월  </TableCell>
              <TableCell colSpan={2}>연간</TableCell> {/* 연간 집계 */}
              <TableCell rowSpan={2}>월세입액</TableCell>
              <TableCell colSpan={2}>지자체 집행금액</TableCell> {/* 지자체 집행 */}
              <TableCell colSpan={6}>집행상세내역</TableCell> {/* 집행상세 */}
            </TableRow>
            <TableRow>
              {/* 하위 열 정의 */}
              <TableCell>예산액</TableCell>
              <TableCell>안분비율</TableCell>
              <TableCell>연 누적집행금액 </TableCell>
              <TableCell>월 집행금액</TableCell>
              <TableCell>택시카드</TableCell>
              <TableCell>택시서면</TableCell>
              <TableCell>버스카드</TableCell>
              <TableCell>버스서면</TableCell>
              <TableCell>화물카드</TableCell>
              <TableCell>화물서면</TableCell>
            </TableRow>
          </TableHead>

              <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow key={'tr'+index}>
                      <TableCell>
                        {formatDate(row.crtrYm)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.bgtFrmtAmt)}
                      </TableCell>
                      <TableCell>
                        {row.bgtRt}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.sumPayAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.payAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.txCardAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.txPaperAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.bsCardAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.bsPaperAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.frCardAmt)}
                      </TableCell>
                      <TableCell>
                        {getNumtoWon(row.frPaperAmt)}
                      </TableCell>
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={12} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={12} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={pageable.pageSize}
          page={pageable.pageNumber}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </ThemeProvider>
  );
};

export default TableDataGrid;
