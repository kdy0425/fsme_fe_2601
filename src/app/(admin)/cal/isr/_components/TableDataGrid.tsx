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
import { useState } from 'react'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
} from '@/utils/fsms/common/util'
import Loading from '@/app/loading'
import CircularProgress from '@mui/material/CircularProgress'
import { formatDate } from '@/utils/fsms/common/convert'
type SupportedLocales = keyof typeof locales

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: any[] // 목록 데이터
  totalRows?: number // 총 검색 결과 수
  loading?: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: (row: any, index?: number) => void // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean // 페이징여부
  selectedRowIndex?: number
  onCheckChange?: (selected: string[]) => void
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
  const [selected, setSelected] = React.useState<readonly string[]>([])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row, index) => 'tr' + index)
      setSelected(newSelected)
      onCheckChange?.(newSelected)
      return
    }
    setSelected([])
    onCheckChange?.([])
  }

  const handleSelect = (id: string) => {
    const selectedIndex = selected.indexOf(id)

    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = [...selected, id]
    } else {
      newSelected = selected.filter((item) => item !== id)
    }
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
              {headCell.format === 'checkbox' ? (
                <TableCell padding="checkbox">
                  <CustomCheckbox
                    indeterminate={
                      selected.length > 0 && selected.length < rows.length
                    }
                    checked={selected.length === rows.length}
                    onChange={handleSelectAll}
                    tabIndex={-1}
                    inputProps={{
                      'aria-labelledby': 'select all desserts',
                    }}
                  />
                </TableCell>
              ) : (
                <TableCell
                  align={'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  style={{ whiteSpace: 'nowrap' }}
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
    if(pageable?.totalPages === 0) return
    onPaginationModelChange?.(newPage, pageable?.pageSize ?? 10)
  }

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  function isRowspan(index: number) {
    if (index > 0 && 
        rows[index]['clclnYm'] && (rows[index - 1]['clclnYm'] === rows[index]['clclnYm']) && 
        rows[index]['carDivNm'] && (rows[index - 1]['carDivNm'] === rows[index]['carDivNm'])
    ) {
      return true
    } else {
      return false
    }
  }

  function getRowspan(index: number) {
    let count = 1
    const clclnYm = rows[index]['clclnYm']
    const carDivNm = rows[index]['carDivNm']

    if (!rows[index]) return count

    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i]['clclnYm'] === clclnYm && 
          rows[i]['carDivNm'] === carDivNm
      ) {
        count++
      } else {
        break
      }
    }

    return count
  }

  function getTotalValue(rows: any[], column: string) {
    let totalAmt = 0;
    try {
      for (let i = 0; i < rows.length; i++) {
        console.log(rows[i].koiNm)
        if (rows[i].koiNm === '합계') { // 소계인 것만 해당 컬럼 빼와서 합계 계산
          if (column === 'prttnUseLiter') { // 주유·충전량 
            totalAmt += rows[i].prttnUseLiter
          } else if (column === 'prtstleAmt') { // 거래금액
            totalAmt += rows[i].prtstleAmt
          } else if (column === 'prttnBzentyBrdnAmt') { // 업체부담금
            totalAmt += rows[i].prttnBzentyBrdnAmt
          } else if (column === 'prttnAsstAmt') { // 유가보조금
            totalAmt += rows[i].prttnAsstAmt
          } else if (column === 'ftxIntrlckAsstAmt') { // 유류세연동보조금
            totalAmt += rows[i].ftxIntrlckAsstAmt
          } else if (column === 'opisAmt') {  // 유가연동보조금
            totalAmt += rows[i].opisAmt
          }
        }
      }
      return totalAmt;
    } catch (error) {
      console.error("Error Total Data : ", error);
      return 0;
    }
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
                <>
                  {rows.map((row: any, index) => (
                    <TableRow key={'tr' + index}>
                      {!isRowspan(index) ? (
                      <>
                        <TableCell rowSpan={getRowspan(index)}>{formatDate(row.clclnYm)}</TableCell>
                        <TableCell rowSpan={getRowspan(index)}>{row.carDivNm}</TableCell>
                      </>
                      ) : (
                      <></>
                      )}
                      <TableCell>{row.koiNm}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{getCommaNumber(row.prttnUseLiter)}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{getCommaNumber(row.prtstleAmt)}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{getCommaNumber(row.prttnBzentyBrdnAmt)}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{getCommaNumber(row.prttnAsstAmt)}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{getCommaNumber(row.ftxIntrlckAsstAmt)}</TableCell>
                      <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{getCommaNumber(row.opisAmt)}</TableCell>
                    </TableRow>
                  ))}
                  {/* 합계 행 추가 */}
                  <TableRow>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'center'}} colSpan={3}>합계</TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{getCommaNumber(getTotalValue(rows, 'prttnUseLiter'))}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{getCommaNumber(getTotalValue(rows, 'prtstleAmt'))}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{getCommaNumber(getTotalValue(rows, 'prttnBzentyBrdnAmt'))}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{getCommaNumber(getTotalValue(rows, 'prttnAsstAmt'))}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{getCommaNumber(getTotalValue(rows, 'ftxIntrlckAsstAmt'))}</TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{getCommaNumber(getTotalValue(rows, 'opisAmt'))}</TableCell>
                  </TableRow>
                  {/* 합계 행 추가 */}
                </>
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
                  count={pageable?.totalPages === 0 ? 1 : pageable?.totalPages}
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  page={pageable?.pageNumber}
                  onChange={handleChangePage}
                />
              ) : (
                <></>
              )}
            </div>
            {totalRows !== 0 ? (<><TableBottomToolbar /></>) : null}
          </>
        ) : (
          <></>
        )}
      </div>
    </ThemeProvider>
  )
}

export default React.memo(TableDataGrid);
