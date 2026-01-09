import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import { Row } from './page';
import { formatDate } from '@/utils/fsms/common/convert';
type SupportedLocales = keyof typeof locales;

// 검색 결과 건수 툴바
function TableTopToolbar(props:Readonly<{totalRows?:number}>) {
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
  totalRows?: number
  loading: boolean // 로딩 여부
  selectedRowIndex?: number,
}

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    rows,
    totalRows,
    loading,
    selectedRowIndex,
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
        <TableTopToolbar totalRows={totalRows} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <caption>부정수급 행정처리 조치내역 테이블</caption>
            <TableHead>
                <TableRow>
                    <TableCell style={{ whiteSpace:'nowrap' }}>No</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>차량</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>관할관청</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>환수금액</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>등록일</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>삭제가능</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>SUB존재</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>지급정지존재</TableCell>
                    <TableCell style={{ whiteSpace:'nowrap' }}>한도삭제필요</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow hover selected={selectedRowIndex == index} key={'tr'+index}>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{index + 1}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{row.vhclNo}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{row.locgovNm}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{Number(row.rdmActnAmt).toLocaleString('ko-KR')}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{formatDate(row.regDt.substring(0, 8))}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{row.delAvail === 'Y' ? '삭제가능' : '삭제불가'}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{row.subExist === 'Y' ? 'SUB있음' : 'SUB없음' }</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{row.stopExist === 'Y' ? '있음' : '없음'}</TableCell>
                      <TableCell style={{ whiteSpace:'nowrap' }}>{row.handoDelYn === 'Y' ? '있음' : '없음'}</TableCell>
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={9} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={9} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </ThemeProvider>
  );
};

export default TableDataGrid;
