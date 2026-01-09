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
  headCells: HeadCell[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void;
  order: order;
  orderBy: string;
}

// 테이블 th 정의 기능
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { headCells, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof []) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  loading: boolean // 로딩 여부
  onRowClick: (postTsid: string) => void // 행 클릭 핸들러 추가
  parentRow: Row | undefined
  pageable: pageable  // 페이지 정보
  caption: string
}

type order = 'asc' | 'desc';

const DetailTableDataGrid: React.FC<ServerPaginationGridProps> = ({
    headCells,
    rows,
    loading,
    onRowClick,
    parentRow,
    pageable,
    caption
}) => {

  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  let order : order = 'desc'; 
  let orderBy : string = '';
  if (pageable.sort !== ''){
    let sort = pageable.sort.split(','); 
    orderBy = sort[0];
    order = sort[1] == 'desc'? 'desc' : 'asc';
  }

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
        <div className="table-scrollable">
            <table className="table table-bordered">
            <caption>{caption}</caption>
            <TableHead>
            <TableRow>
              <TableCell style={{whiteSpace:'nowrap'}} rowSpan={2}>카드사</TableCell>
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
                    <TableRow key={'tr'+index}>
                      <TableCell style={{whiteSpace:'nowrap', textAlign: 'center'}}>{row.crdcoNm}</TableCell>
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

export default DetailTableDataGrid;
