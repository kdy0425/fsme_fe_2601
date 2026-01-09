import React, { useEffect } from 'react'

import {
  Box,
  Button,
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
import { HeadCell, Pageable2 } from 'table'
import { Row } from '../page'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { brNoFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import ColspanTableComponent from '../../../stn/disi/_components/ColspanGridTable'
type SupportedLocales = keyof typeof locales

// 페이지 정보
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

// 테이블 caption
const tableCaption: string = '전국표준한도관리 목록'

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void
  order: order
  orderBy: string
}

// 테이블 th 정의 기능
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { headCells, order, orderBy, onRequestSort } = props
  const createSortHandler =
    (property: keyof []) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow key={'thRow1'}>
        {headCells.map((headCell) => (
          <React.Fragment key={'th' + headCell.id}>
            {headCell.sortAt ? (
              <TableCell
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  <div className="table-head-text">{headCell.label}</div>
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ) : (
              <TableCell
                rowSpan={
                  headCell.id == 'admin' || headCell.id == 'localCnt' ? 1 : 2
                }
                colSpan={
                  headCell.id == 'admin' ? 6 : headCell.id == 'localCnt' ? 4 : 1
                }
                style={{ whiteSpace: 'nowrap' }}
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
              >
                <div className="table-head-text">{headCell.label}</div>
              </TableCell>
            )}
          </React.Fragment>
        ))}
      </TableRow>
      <TableRow key={'thRow2'}>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">혐의없음</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">경고</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">지급정지6月</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">지급정지12月</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">감차</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">합계</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">요청</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">검토</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">승인</div>
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} align={'left'}>
          <div className="table-head-text">반려</div>
        </TableCell>
      </TableRow>
    </TableHead>
  )
}

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

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  onRowClick: (postTsid: string) => void // 행 클릭 핸들러 추가
  pageable: pageable | Pageable2 // 페이지 정보
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
}) => {
  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  let order: order = 'desc'
  let orderBy: string = ''
  // if (pageable.sort !== '') {
  //   let sort = pageable.sort.split(',')
  //   orderBy = sort[0]
  //   order = sort[1] == 'desc' ? 'desc' : 'asc'
  // }

  // sort 정렬 변경시 정렬 기준으로 데이터 다시 로드
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof [],
  ) => {
    const isAsc = 'asc'
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
        <Box
          className="table-bottom-button-group"
          style={{ padding: '10px 0', marginTop: '0' }}
        >
          <TableTopToolbar totalRows={totalRows} />
        </Box>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={'medium'}>
            <caption>{tableCaption}</caption>
            <EnhancedTableHead
              headCells={headCells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {!loading ? (
                rows.length > 0 ? (
                  rows.map((row: any, index) => {
                    return (
                      <TableRow key={'tr' + index}>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.patternName}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.dtlCnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.investCnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.noSuspectCnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.warnCnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.stop6Cnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.stop12Cnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.gamchaCnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.adminCnt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.localCntR.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.localCntV.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.localCntA.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.localCntD.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.rdmTrgtNocs}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.totlAprvAmt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.totlAsstAmt.toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {row.totlActnAmt.toLocaleString('ko-KR')}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow key={'tr0'}>
                    <TableCell colSpan={headCells.length} className="td-center">
                      <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow key={'tr0'}>
                  <TableCell colSpan={headCells.length} className="td-center">
                    <p> </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        {/* <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={pageable.pageSize}
          page={pageable.pageNumber}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
      </div>
    </ThemeProvider>
  )
}

export default TableDataGrid
