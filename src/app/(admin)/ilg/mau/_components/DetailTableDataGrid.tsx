import React, { useEffect, useState } from 'react'

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
import { HeadCell } from 'table'
import { Row } from '../page'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { brNoFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { uniqueId } from 'lodash'
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
      <TableRow key={'thRow'}>
        {headCells.map((headCell) => (
          <React.Fragment key={'th' + headCell.id + uniqueId()}>
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
  onRowClick: (row: Row) => void // 행 클릭 핸들러 추가
  pageable: pageable // 페이지 정보
}

type order = 'asc' | 'desc'

const DetailTableDataGrid: React.FC<ServerPaginationGridProps> = ({
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
  if (pageable.sort !== '') {
    let sort = pageable.sort.split(',')
    orderBy = sort[0]
    order = sort[1] == 'desc' ? 'desc' : 'asc'
  }

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
        <Box
          className="table-bottom-button-group"
          style={{ padding: '10px 0', marginTop: '10' }}
        >
          <CustomFormLabel className="input-label-display">
            <h3>차량별 거래내역 상세</h3>
          </CustomFormLabel>
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
                      <TableRow key={'detailTr' + index}>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.crdcoNm}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {getDateTimeString(row.dealDt)?.dateString +
                            ' ' +
                            getDateTimeString(row.dealDt)?.timeString}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.vhclNo}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {brNoFormatter(row.brno)}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.dlngSeNm}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.dailUseAcmlNmtm}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {Number(row.aprvAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {Number(row.useLiter).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: 'nowrap', textAlign: 'right' }}
                        >
                          {Number(row.moliatAsstAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.koiNm}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.bzentyNm}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.frcsNm}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {row.cardNo}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>
                          {getDateTimeString(row.rtrcnDlngDt)?.dateString ==
                          undefined
                            ? ''
                            : getDateTimeString(row.rtrcnDlngDt)?.dateString +
                              ' ' +
                              getDateTimeString(row.rtrcnDlngDt)?.timeString}
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

export default DetailTableDataGrid
