import React, { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import * as locales from '@mui/material/locale'
import { HeadCell, Pageable2 } from 'table'
import { Row } from '../page'
import DetailDataGrid from './DetailDataGrid'
import {
  brNoFormatter,
  dateTimeFormatter,
  getCommaNumber,
  getDateTimeString,
} from '@/utils/fsms/common/util'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import { telnoFormatter } from '@/utils/fsms/common/comm'
type SupportedLocales = keyof typeof locales

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

// DetailDataGrid 상단에 있는 버튼 액션들
export interface DetailViewTopButtonActions {
  onClickApproveBtn: () => void
  onClickDeclineBtn: () => void
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: () => void // 행 클릭 핸들러 추가
  pageable: Pageable2 // 페이지 정보
}

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  // onRowClick,
  pageable,
}) => {
  const [isDetailOn, setIsDetailOn] = useState<boolean>(false)
  const [rowIndex, setRowIndex] = useState<number>(-1)

  useEffect(() => {
    setRowIndex(-1)
  }, [loading])

  const onRowClick = (index: number) => {
    setRowIndex(index)
    if (rowIndex === index) {
      setIsDetailOn(!isDetailOn)
      setRowIndex(-1)
    } else {
      setIsDetailOn(true)
    }
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

    const [pageSize, setPageSize] = React.useState(pageable?.pageSize)
    const handleChangeSelect = (event: any) => {
      onPaginationModelChange?.(0, event.target.value)
    }

    return (
      <div className="data-grid-bottom-toolbar" style={{ top: 0, left: 0 }}>
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
    onPaginationModelChange(newPage, pageable.pageSize)
  }

  //페이지 사이즈 변경시 0 페이지로 이동
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onPaginationModelChange(0, Number(event.target.value))
  }

  function getCellValue(row: any, headCell: any) {
    try {
      if (headCell.format === 'brno') {
        return brNoFormatter(row[headCell.id])
      } else if (headCell.format === 'lit') {
        return Number(row[headCell.id]).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      } else if (headCell.format === 'number') {
        return getCommaNumber(row[headCell.id])
      } else if (headCell.format === 'yyyymm') {
        return getDateTimeString(row[headCell.id], 'mon')?.dateString
      } else if (headCell.format === 'yyyymmdd') {
        return getDateTimeString(row[headCell.id], 'date')?.dateString
      } else if (headCell.format === 'yyyymmddhh24miss') {
        return dateTimeFormatter(row[headCell.id])
      } else if (headCell.format === 'hh24miss') {
        return getDateTimeString(row[headCell.id], 'time')?.timeString
      } else if (headCell.format === 'yyyy년mm월') {
        if (isNaN(row[headCell.id])) return row[headCell.id]
        let dateString = getDateTimeString(row[headCell.id], 'mon')?.dateString

        let year = dateString?.substring(0, 4)
        let month = dateString?.substring(5, 7)

        return year + '년 ' + month + '월'
      } else if (headCell.format === 'yyyy년') {
        if (isNaN(row[headCell.id])) return row[headCell.id]
        return row[headCell.id] + '년'
      } else if (headCell.format === 'telno') {
        return telnoFormatter(row[headCell.id])
      } else {
        return row[headCell.id]
      }
    } catch (error) {
      console.error('Error get City Code data:', error)
    }
    return ''
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
        <TableContainer>
          <Table
            // sx={{ minWidth: 750 }}
            aria-label="sticky table"
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead headCells={headCells} />
            <TableBody>
              {!loading ? (
                rows.length > 0 ? (
                  rows.map((row: any, index) => {
                    return (
                      <TableRow
                        hover
                        key={'tr' + index}
                        onClick={() => onRowClick(index)}
                        selected={rowIndex === index}
                      >
                        {headCells.map((headCell, i) => (
                          <TableCell style={{ whiteSpace: 'nowrap' }}>
                            {getCellValue(row, headCell)}
                          </TableCell>
                        ))}
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
              <div
                className="pagination-wrapper"
                style={{ position: 'relative' }}
              >
                {totalRows ? <TableBottomToolBar /> : null}
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
          </>
        ) : null}
        {/* 상세 영역 시작 */}
        <Box style={{ display: isDetailOn ? 'block' : 'none' }}>
          {!loading && rows.length > 0 && rowIndex >= 0 ? (
            <Grid item xs={4} sm={4} md={4}>
              <DetailDataGrid detail={rows[rowIndex]} reload={() => {}}/>
            </Grid>
          ) : (
            ''
          )}
        </Box>
        {/* 상세 영역 끝 */}
      </div>
    </ThemeProvider>
  )
}

export default TableDataGrid
