import React, { useEffect } from 'react'

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
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
import { HeadCell, Pageable2 } from 'table'
import { Row } from '../page'
import { getCommaNumber } from '@/utils/fsms/common/util'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { order } from '@amcharts/amcharts4/.internal/core/utils/Number'
import { orderBy } from 'lodash'
import { formatDate, getNumtoWon } from '@/utils/fsms/common/convert'
type SupportedLocales = keyof typeof locales

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows?: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: (row: any, rowIndex?: number, colIndex?: number) => void // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean
  selectedRowIndex?: number
  cursor?: boolean
  caption: string
}

type order = 'asc' | 'desc'

const MainTableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  onRowClick,
  pageable,
  paging,
  selectedRowIndex,
  cursor,
  caption
}) => {
  // 테이블 th 정의 기능에 사용하는 props 정의
  interface EnhancedTableProps {
    headCells: HeadCell[]
  }

  // 테이블 th 정의 기능
  function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
    const { headCells } = props
    return (
      <TableHead>
        <TableRow key={'thRow'}>
          {headCells.map((headCell) => (
            <React.Fragment key={'th' + headCell.id}>
              <TableCell
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
              >
                <div className="table-head-text">{headCell.label}</div>
              </TableCell>
            </React.Fragment>
          ))}
        </TableRow>
      </TableHead>
    )
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
      },
    ]

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
    if(pageable?.totalPages === 0) return
    onPaginationModelChange?.(newPage, pageable?.pageSize ?? 0)
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  function isRowspan(index: number) {
    if (
      index > 0 &&
      rows[index]['clclnYm'] &&
      rows[index - 1]['clclnYm'] === rows[index]['clclnYm'] &&
      rows[index]['crdcoNm'] &&
      rows[index - 1]['crdcoNm'] === rows[index]['crdcoNm']
    ) {
      return true
    } else {
      return false
    }
  }

  function getRowspan(index: number) {
    let count = 1
    const clclnYm = rows[index]['clclnYm']
    const crdcoNm = rows[index]['crdcoNm']

    if (!rows[index]) return count

    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i]['clclnYm'] === clclnYm && rows[i]['crdcoNm'] === crdcoNm) {
        count++
      } else {
        break
      }
    }
    return count
  }

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <caption>{caption}</caption>
            <EnhancedTableHead headCells={headCells} />
            <TableBody>
              {!loading ? (
                rows.length > 0 ? (
                  rows.map((row: any, index) => {
                    return (
                      <TableRow
                        key={'tr' + index}
                        hover
                        selected={selectedRowIndex == index}
                        sx={cursor ? { cursor: 'pointer' } : {}}
                        onClick={() => onRowClick?.(row)}
                      >
                        {!isRowspan(index) ? (
                          <>
                            <TableCell rowSpan={getRowspan(index)}>
                              {formatDate(row.clclnYm)}
                            </TableCell>
                            <TableCell rowSpan={getRowspan(index)}>
                              {row.crdcoNm}
                            </TableCell>
                          </>
                        ) : (
                          <></>
                        )}
                        <TableCell>{row.bzmnSeNm}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {getCommaNumber(row.userCnt)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {getCommaNumber(row.dlngNocs)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {row.useLiter}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {row.slsAmt}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {row.indvBrdnAmt}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {row.moliatAsstAmt}
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
            {totalRows ? <TableBottomToolBar /> : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  )
}

export default MainTableDataGrid
