import React from 'react'

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Button,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import * as locales from '@mui/material/locale'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import { HeadCell, Pageable2 } from 'table'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { useState, useEffect } from 'react'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
  rrNoFormatter,
  cardNoFormatter,
} from '@/utils/fsms/common/util'
import Loading from '@/app/loading'
import CircularProgress from '@mui/material/CircularProgress'
import { formatDate } from '@/utils/fsms/common/convert'
import { SelectItem } from 'select'
import { Row } from '../page'
type SupportedLocales = keyof typeof locales

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: any[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick: (row: any, index?: number) => void // 행 클릭 핸들러 추가
  pageable: Pageable2 // 페이지 정보
  paging: boolean // 페이징여부
  selectedRowIndex?: number
  onCheckChange?: (selected: any[]) => void
  cursor?: boolean
  customHeader?: () => React.ReactNode
  caption: string
}

type order = 'asc' | 'desc'

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
  onCheckChange,
  cursor,
  customHeader,
  caption
}) => {
  const [selected, setSelected] = React.useState<readonly Row[]>([])

  useEffect(() => {
    const initialSelected = rows
      .map((row, index) => (row.chk === '1' ? row : null))
      .filter((id) => id !== null)
    setSelected(initialSelected)
  }, [rows])

  const handleSelect = (row: Row) => {
    const selectedIndex = selected.indexOf(row)
    // console.log('selectedIndex :', selectedIndex)

    const newSelected =
      selectedIndex === -1
        ? [...selected, row] // 선택 추가
        : selected.filter((item) => item !== row) // 선택 해제

    setSelected(newSelected)
    onCheckChange?.(newSelected)
  }

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

  function TableBottomToolbar() {
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
    const [pageSize, setPageSize] = React.useState(pageable.pageSize)
    const handleChangeSelect = (event: any) => {
      onPaginationModelChange?.(0, event.target.value)
    }

    return (
      <div className="data-grid-bottom-toolbar">
        <div className="data-grid-select-count">
          총 {getCommaNumber(totalRows)}개
        </div>
        <CustomFormLabel
          className="input-label-none"
          htmlFor="data-grid-row-count-select"
        >
          테이블 데이터 갯수
        </CustomFormLabel>
        {paging ? (
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
    onPaginationModelChange?.(newPage, pageable.pageSize)
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  function aprvDtFormatter(aprvDt: string, type: string) {
    let dateString: string = ''

    let rtnDate: string = ''

    if (type === 'ymd') {
      dateString = aprvDt.substring(0, 8)
      rtnDate = formatDate(dateString)
    } else if (type === 'tm') {
      dateString = aprvDt.substring(8)
      rtnDate = `${dateString.slice(0, 2)}:${dateString.slice(2, 4)}:${dateString.slice(4, 6)}`
    }

    return rtnDate
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
                        hover
                        selected={selectedRowIndex == index}
                        key={'tr' + index}
                        onClick={() => onRowClick(index)}
                        sx={cursor ? { cursor: 'pointer' } : {}}
                        style={
                          rows[index].clmAprvNm === '탈락'
                            ? { color: 'red' }
                            : {}
                        }
                      >
                        <TableCell padding="checkbox">
                          <CustomCheckbox
                            name={'chk' + index}
                            value={'tr' + index}
                            checked={selected.includes(rows[index])}
                            onChange={() => handleSelect(rows[index])}
                            style={{ height: '23px' }}
                          />
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.clmAprvNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.clmAprvYn === 'Y'
                            ? formatDate(row.clmAprvDt)
                            : ''}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.ddlnNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {formatDate(row.clclnYm)}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.bzmnSeNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.vhclNo}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.custSeNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.flnm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {rrNoFormatter(row.rrnoS)}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {brNoFormatter(row.brno)}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.crdcoNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {cardNoFormatter(row.cardNoS)}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {aprvDtFormatter(row.aprvDt, 'ymd')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {aprvDtFormatter(row.aprvDt, 'tm')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.clclnSeNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.koiNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.literUntprcNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.literAcctoUntprc).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.moliatUseLiter).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.usageUnit}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.aprvAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.pbillAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.vhclPorgnUntprc).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.literAcctoOpisAmt).toLocaleString(
                            'ko-KR',
                          )}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.exsMoliatAsstAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.opisAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'right',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'right' }
                          }
                        >
                          {Number(row.moliatAsstAmt).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.frcsNm}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.frcsAddr}
                        </TableCell>
                        <TableCell
                          style={
                            row.clmAprvNm === '탈락'
                              ? {
                                  color: 'red',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }
                              : { whiteSpace: 'nowrap', textAlign: 'center' }
                          }
                        >
                          {row.flRsnCn}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow key={'tr0'}>
                    <TableCell colSpan={33} className="td-center">
                      <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow key={'tr0'}>
                  <TableCell colSpan={33} className="td-center">
                    <p>
                      <CircularProgress />
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        {!loading ? (
          <>
            <div className="pagination-wrapper">
              {paging ? (
                <Pagination
                  count={pageable.totalPages}
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  page={pageable.pageNumber}
                  onChange={handleChangePage}
                />
              ) : (
                <></>
              )}
            </div>
            <TableBottomToolbar />
          </>
        ) : (
          <></>
        )}
      </div>
    </ThemeProvider>
  )
}

export default React.memo(TableDataGrid)
