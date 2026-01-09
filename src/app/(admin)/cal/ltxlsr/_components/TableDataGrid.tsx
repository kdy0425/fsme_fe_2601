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

import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
} from '@/utils/fsms/common/convert'
import { NumberFormatter } from '@amcharts/amcharts4/core'
import { getCommaNumber } from '@/utils/fsms/common/util'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

type SupportedLocales = keyof typeof locales

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange?: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  onRowClick: (procNm: string) => any // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean
  tabIndex: string
  caption: string
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
  paging,
  tabIndex,
  caption,
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
    if (pageable?.totalPages === 0) return
    onPaginationModelChange?.(newPage, pageable?.pageSize ?? 0)
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  const getClmAprvYn = (aprvCode: string): string => {
    let result = aprvCode

    switch (aprvCode) {
      case '1':
        result = '청구부문'
        break
      case '2':
        result = '승인부문'
        break
      case '3':
        result = '거절부문'
        break
    }

    return result
  }

  function isRowspan(index: number, tabIndex: number) {
    if (tabIndex === 0) {
      // 법인
      if (
        index > 0 &&
        rows[index]['clclnYm'] &&
        rows[index - 1]['clclnYm'] === rows[index]['clclnYm'] &&
        rows[index]['crdcoNm'] &&
        rows[index - 1]['crdcoNm'] === rows[index]['crdcoNm'] &&
        rows[index]['locgovNm'] &&
        rows[index - 1]['locgovNm'] === rows[index]['locgovNm'] &&
        rows[index]['bzmnSeNm'] &&
        rows[index - 1]['bzmnSeNm'] === rows[index]['bzmnSeNm']
      ) {
        return true
      } else {
        return false
      }
    } else {
      if (
        index > 0 &&
        rows[index]['clclnYm'] &&
        rows[index - 1]['clclnYm'] === rows[index]['clclnYm'] &&
        rows[index]['crdcoNm'] &&
        rows[index - 1]['crdcoNm'] === rows[index]['crdcoNm'] &&
        rows[index]['locgovNm'] &&
        rows[index - 1]['locgovNm'] === rows[index]['locgovNm'] &&
        rows[index]['bzmnSeNm'] &&
        rows[index - 1]['bzmnSeNm'] === rows[index]['bzmnSeNm'] &&
        rows[index]['koiNm'] &&
        rows[index - 1]['koiNm'] === rows[index]['koiNm']
      ) {
        return true
      } else {
        return false
      }
    }
  }

  function getRowspan(index: number, tabIndex: number) {
    let count = 1
    const clclnYm = rows[index]['clclnYm']
    const crdcoNm = rows[index]['crdcoNm']
    const locgovNm = rows[index]['locgovNm']
    const bzmnSeNm = rows[index]['bzmnSeNm']
    const koiNm = rows[index]['koiNm']

    if (!rows[index]) return count

    if (tabIndex === 0) {
      for (let i = index + 1; i < rows.length; i++) {
        if (
          rows[i]['clclnYm'] === clclnYm &&
          rows[i]['crdcoNm'] === crdcoNm &&
          rows[i]['locgovNm'] === locgovNm &&
          rows[i]['bzmnSeNm'] === bzmnSeNm
        ) {
          count++
        } else {
          break
        }
      }
    } else {
      for (let i = index + 1; i < rows.length; i++) {
        if (
          rows[i]['clclnYm'] === clclnYm &&
          rows[i]['crdcoNm'] === crdcoNm &&
          rows[i]['locgovNm'] === locgovNm &&
          rows[i]['bzmnSeNm'] === bzmnSeNm &&
          rows[i]['koiNm'] === koiNm
        ) {
          count++
        } else {
          break
        }
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
                      <>
                        {tabIndex === '0' ? (
                          <TableRow key={'tr' + index}>
                            {!isRowspan(index, Number(tabIndex)) ? (
                              <>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={getRowspan(index, Number(tabIndex))}
                                >
                                  {formatDate(row.clclnYm)}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={getRowspan(index, Number(tabIndex))}
                                >
                                  {row.crdcoNm}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={getRowspan(index, Number(tabIndex))}
                                >
                                  {row.locgovNm}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={getRowspan(index, Number(tabIndex))}
                                >
                                  {row.bzmnSeNm}
                                </TableCell>
                              </>
                            ) : (
                              <></>
                            )}
                            <TableCell style={{ whiteSpace: 'nowrap' }}>
                              {/* 1 : 미승인 -> 청부부문 2: 승인 -> 승인부문 3: 거절 -> 거절부문 */}
                              {getClmAprvYn(row.clmAprvYn)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.dlngNocs)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {Number(row.useLiter).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.slsAmt)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.indvBrdnAmt)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.moliatAsstAmt)}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={'tr' + index}>
                            {!isRowspan(index, Number(tabIndex)) ? (
                              <>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={
                                    !isRowspan(index, Number(tabIndex))
                                      ? getRowspan(index, Number(tabIndex))
                                      : 1
                                  }
                                >
                                  {formatDate(row.clclnYm)}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={
                                    !isRowspan(index, Number(tabIndex))
                                      ? getRowspan(index, Number(tabIndex))
                                      : 1
                                  }
                                >
                                  {row.crdcoNm}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={
                                    !isRowspan(index, Number(tabIndex))
                                      ? getRowspan(index, Number(tabIndex))
                                      : 1
                                  }
                                >
                                  {row.locgovNm}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={
                                    !isRowspan(index, Number(tabIndex))
                                      ? getRowspan(index, Number(tabIndex))
                                      : 1
                                  }
                                >
                                  {row.bzmnSeNm}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: 'nowrap' }}
                                  rowSpan={
                                    !isRowspan(index, Number(tabIndex))
                                      ? getRowspan(index, Number(tabIndex))
                                      : 1
                                  }
                                >
                                  {row.koiNm}
                                </TableCell>
                              </>
                            ) : (
                              <></>
                            )}
                            <TableCell style={{ whiteSpace: 'nowrap' }}>
                              {/* 1 : 미승인 -> 청부부문 2: 승인 -> 승인부문 3: 거절 -> 거절부문 */}
                              {getClmAprvYn(row.clmAprvYn)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.dlngNocs)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {row.userCnt}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {Number(row.useLiter).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>
                              {row.usageUnit}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.slsAmt)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.indvBrdnAmt)}
                            </TableCell>
                            <TableCell
                              style={{
                                textAlign: 'right',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getNumtoWon(row.moliatAsstAmt)}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
                    <p> </p>
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
