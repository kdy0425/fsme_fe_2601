import React, { useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  Grow,
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
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
import { HeadCell, Pageable2 } from 'table'
import { Row } from '../page'
import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
} from '@/utils/fsms/common/convert'
import { getCommaNumber } from '@/utils/fsms/common/util'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

type SupportedLocales = keyof typeof locales

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick: (row: any, rowIndex?: number, colIndex?: number) => void // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean // 페이징여부
  selectedRowIndex: number
  cursor?: boolean
  customHeader?: () => React.ReactNode
  caption: string
}

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
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
  customHeader,
  caption,
}) => {
  const [selected, setSelected] = React.useState<readonly string[]>([])

  // 테이블 th 정의 기능
  function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
    const { headCells } = props

    return (
      <TableHead>
        <TableRow key={'thRow'}>
          {headCells.map((headCell, i) => (
            <React.Fragment key={'th' + i}>
              <TableCell
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
                style={{ whiteSpace: 'nowrap' }}
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
      rows[index - 1]['crdcoNm'] === rows[index]['crdcoNm'] &&
      rows[index]['bzmnSeNm'] &&
      rows[index - 1]['bzmnSeNm'] === rows[index]['bzmnSeNm'] &&
      rows[index]['koiNm'] &&
      rows[index - 1]['koiNm'] === rows[index]['koiNm'] &&
      rows[index]['ddlnNm'] &&
      rows[index - 1]['ddlnNm'] === rows[index]['ddlnNm']
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
    const bzmnSeNm = rows[index]['bzmnSeNm']
    const koiNm = rows[index]['koiNm']
    const ddlnNm = rows[index]['ddlnNm']

    if (!rows[index]) return count

    for (let i = index + 1; i < rows.length; i++) {
      if (
        rows[i]['clclnYm'] === clclnYm &&
        rows[i]['crdcoNm'] === crdcoNm &&
        rows[i]['bzmnSeNm'] === bzmnSeNm &&
        rows[i]['koiNm'] === koiNm &&
        rows[i]['ddlnNm'] === ddlnNm
      ) {
        count++
      } else {
        break
      }
    }

    return count
  }

  return (
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <caption>{caption}</caption>
            {customHeader ? (
              customHeader()
            ) : (
              <EnhancedTableHead headCells={headCells} />
            )}

            <TableBody>
              {!loading ? (
                rows.length > 0 ? (
                  rows.map((row: any, index) => {
                    return (
                      <TableRow
                        key={`tr${index}`}
                        hover
                        onClick={() => onRowClick(row, index)}
                        selected={selectedRowIndex == index}
                        sx={cursor ? { cursor: 'pointer' } : {}}
                      >
                        {!isRowspan(index) ? (
                          <>
                            <TableCell rowSpan={getRowspan(index)}>
                              {formatDate(row.clclnYm)}
                            </TableCell>
                            <TableCell rowSpan={getRowspan(index)}>
                              {row.crdcoNm}
                            </TableCell>
                            <TableCell rowSpan={getRowspan(index)}>
                              {row.bzmnSeNm}
                            </TableCell>
                            <TableCell rowSpan={getRowspan(index)}>
                              {row.koiNm}
                            </TableCell>
                            <TableCell rowSpan={getRowspan(index)}>
                              {row.ddlnNm}
                            </TableCell>
                          </>
                        ) : (
                          <></>
                        )}
                        <TableCell>
                          {row.ddlnYmd ? formatDate(row.ddlnYmd.trim()) : ''}
                        </TableCell>
                        <TableCell>{row.clmAprvNm}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {getNumtoWon(row.dlngNocs)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {row.userCnt}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {row.useLiter}
                        </TableCell>
                        <TableCell>{row.usageUnit}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {getNumtoWon(row.slsAmt)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {getNumtoWon(row.indvBrdnAmt)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {getNumtoWon(row.moliatAsstAmt)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow key={'tr0'}>
                    <TableCell colSpan={14} className="td-center">
                      <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow key={'tr0'}>
                  <TableCell colSpan={14} className="td-center">
                    <p>
                      <CircularProgress />
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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

export default TableDataGrid
