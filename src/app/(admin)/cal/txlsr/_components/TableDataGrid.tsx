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
import { formatDate } from '@/utils/fsms/common/convert'
import { brNoFormatter } from '@/utils/fsms/common/util'
type SupportedLocales = keyof typeof locales;

// 페이지 정보
type pageable = {
  pageNumber : number,
  pageSize : number,
  sort : string
}

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void;
  order: order;
  orderBy: string;
}

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
  headCells: HeadCell[]
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
    headCells,
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
        <div className="table-scrollable">
          <table className="table table-bordered">
          <TableHead>
            <TableRow>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>청구년월</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>카드사</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>지자체</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>대표자명</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>사업자등록번호</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>차량번호</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>면허종류</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>유종</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} colSpan={6}>정상거래</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}} colSpan={6}>취소거래</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{whiteSpace:'nowrap'}}>매출건수</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>국토부사용량</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>매출금</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>개인부담금</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>국토부보조금</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>단위</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>매출건수</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>국토부사용량</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>매출금</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>개인부담금</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>국토부보조금</TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>단위</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow key={'tr'+index}>
                      <TableCell style={{whiteSpace:'nowrap'}}>{formatDate(row.clclnYm)}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.crdcoNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.locgovNm}</TableCell>
                      <TableCell className={'td-left'} style={{whiteSpace:'nowrap'}}>{row.flnm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{brNoFormatter(row.brno)}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.vhclNo}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.vhclSeNm}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.koiNm}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{row.gnrlDlngNocs}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.gnrlUseLiter).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.gnrlSlsAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.gnrlIndvBrdnAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.gnrlMoliatAsstAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.usageUnit}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{row.rtrcnDlngNocs}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.rtrcnUseLiter).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.rtrcnSlsAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.rtrcnIndvClmAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell className={'td-right'} style={{whiteSpace:'nowrap'}}>{Number(row.rtrcnMoliatAsstAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>{row.usageUnit}</TableCell>
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={20} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={20} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </table>
        </div>        
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
