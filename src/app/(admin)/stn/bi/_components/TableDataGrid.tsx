import React, { useEffect,useState } from 'react'

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
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
import { HeadCell } from 'table'
import { Row } from '../page'


import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint
} from '@/utils/fsms/common/convert'

type SupportedLocales = keyof typeof locales

// 페이지 정보
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

// 테이블 caption
const tableCaption: string = '업체별거래현황 목록'


// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void
  order: order
  orderBy: string
}



// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  onRowClick: (row :Row) => void //  행 클릭 핸들러 추가
  pageable: pageable // 페이지 정보
}


type order = 'asc' | 'desc'

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  onSortModelChange,
  onRowClick,
  pageable,
})=> {
  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  const [selectedIndex, setSelectedIndex] = useState<number | null>();

// 검색 결과 건수 툴바
function TableTopToolbar(props: Readonly<{ totalRows: number }>) {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        검색 결과 <span className="search-count">{props.totalRows}</span>건
      </div>
    </div>
  )
}


  let order: order = 'desc'
  let orderBy: string = ''
  if (pageable.sort !== '') {
    let sort = pageable.sort.split(',')
    orderBy = sort[0]
    order = sort[1] == 'desc' ? 'desc' : 'asc'
  }


  const handleRowClick = (index: number, row: Row) => {
    setSelectedIndex(index);
    onRowClick(row);
  };

  // sort 정렬 변경시 정렬 기준으로 데이터 다시 로드
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof [],
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    onSortModelChange(String(property) + ',' + (isAsc ? 'desc' : 'asc'))
  }

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange(newPage, pageable.pageSize)
  }

  //페이지 사이즈 변경시 0 페이지로 이동
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onPaginationModelChange(0, Number(event.target.value))
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <TableTopToolbar totalRows={totalRows} />
        <div className="table-scrollable">
          <table className="table table-bordered">
          <TableHead>
              <TableRow>
                <TableCell style={{whiteSpace:'nowrap'}} colSpan={11}>사업자등록정보</TableCell>{/* 합계 헤더 */}
              </TableRow>
              <TableRow>
                <TableCell style={{whiteSpace:'nowrap'}} >사업자등록번호</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >사업자상태</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >수업자구분</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >개업일자</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >휴업시작일자</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >휴업종료일자</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >폐업일자</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >업태</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >종목</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >등록일자</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}} >수정일자</TableCell>
          
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell style={{whiteSpace:'nowrap'}} colSpan={11} className="td-center">
                    <p>로딩 중입니다...</p>
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow
                    hover
                    key={`tr${index}`}
                    onClick={() => handleRowClick(index, row)}
                    selected={index === selectedIndex}
                  >
                    <TableCell className='td-center'>{formBrno(row.vonrBrno ?? '')}</TableCell>
                    <TableCell className='td-center'>{row.bzmnSttsCdNm ?? ''}</TableCell>
                    <TableCell className='td-center'>{row.bzmnSeCdNm ?? ''}</TableCell>
                    <TableCell className='td-center'>{formatDate(row.opbizYmd ?? '')}</TableCell>
                    <TableCell className='td-center'>{formatDate(row.tcbizBgngYmd ?? '')}</TableCell>
                    <TableCell className='td-center'>{formatDate(row.tcbizEndYmd ?? '')}</TableCell>
                    <TableCell className='td-center'>{formatDate(row.clsbizYmd ?? '' )}</TableCell>
                    <TableCell className='td-center'>{row.bzstatNm ?? ''}</TableCell>
                    <TableCell className='td-center'>{row.maiyTpbizNm ?? ''}</TableCell>
                    <TableCell className='td-center'>{formatDate(row.regDt ?? '')}</TableCell>
                    <TableCell className='td-center'>{formatDate(row.mdfcnDt ?? '')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell style={{whiteSpace:'nowrap'}} colSpan={11} className="td-center">
                    <p>  자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
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
  )
}

export default TableDataGrid
