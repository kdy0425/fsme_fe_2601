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
} from '@/utils/fsms/common/util'
import Loading from '@/app/loading'
import CircularProgress from '@mui/material/CircularProgress'
import { telnoFormatter } from '@/utils/fsms/common/comm'
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
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: (row: any, rowIndex?: number, colIndex?: number) => void // 행 클릭 핸들러 추가
  onRowDoubleClick?: (row: any, index?: number) => void // 행 클릭 핸들러 추가
  pageable?: Pageable2 // 페이지 정보
  paging?: boolean // 페이징여부
  selectedRowIndex?: number
  onCheckChange?: (selected: string[]) => void
  cursor?: boolean
  oneCheck?: boolean // 한개의 데이터만
  disableAllCheck?: boolean // 전체체크 제거
  validMsg?: string // 유효성검사 메시지
  validFlag?: boolean // 유효성검사 플래그
  customHeader?: (
    handleSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ) => React.ReactNode
  split?: boolean
  checkAndRowClick?: boolean
  emptyMessage?: string
  caption?: string
}

type order = 'asc' | 'desc'

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  onRowClick,
  onRowDoubleClick,
  pageable,
  paging,
  selectedRowIndex,
  onCheckChange,
  cursor,
  oneCheck,
  disableAllCheck,
  validMsg,
  validFlag,
  customHeader,
  split,
  checkAndRowClick,
  emptyMessage,
  caption,
}) => {
  const [selected, setSelected] = React.useState<readonly string[]>([])
  const [allCheck, setAllCheck] = React.useState<boolean>(false)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (oneCheck || disableAllCheck) {
      return
    }

    if (event.target.checked) {
      let checkFlag = false

      // const newSelected = rows.map((row, index) => 'tr' + index)
      // 일반 유효성 검사 및 유효성 검사 + 글자 색상 빨강인 경우 처리 추가
      const newSelected = rows.map((row, index) => {
        if (row.chkVal !== 'V' && row.chkVal !== 'R') {
          return 'tr' + index
        } else {
          if (!checkFlag) {
            alert(validMsg)
            checkFlag = true
          }
          return ''
        }
      })

      setSelected(newSelected)
      onCheckChange?.(newSelected)
      return
    }
    setSelected([])
    onCheckChange?.([])
  }

  const handleCheckboxChange = (index: number) => {
    const id = 'tr' + index
    setSelected(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id) // 선택 해제
          : [...prev, id], // 선택 추가
    )
  }

  const handleSelect = (id: string, row: any, index?: number) => {
    const selectedIndex = selected.indexOf(id)

    const newSelected =
      selectedIndex === -1
        ? row.chkVal === 'V' || row.chkVal === 'R'// 체크 유효성 검사에 걸리면 (V: 유효성검사 일반, R: 유효성검사 + 글자색상 빨강)
          ? (alert(validMsg), [...selected]) // 유효성검사 메시지 출력, 선택은 기존 그대로
          : oneCheck
            ? [id] // `oneCheck`이 true면 새로운 ID만 저장
            : [...selected, id] // 선택 추가
        : selected.filter((item) => item !== id) // 선택 해제

    setSelected(newSelected)
    onCheckChange?.(newSelected)
    // `checkAndRowClick`이 true일 때, 행 클릭 이벤트 호출
    if (checkAndRowClick && onRowClick) {
      onRowClick(row, index)
    }
  }

  const handleRowOrCheckboxClick = (row: any, index: number) => {
    const id = 'tr' + index
    handleSelect(id, row, index)
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
                <TableCell
                  style={
                    disableAllCheck
                      ? { whiteSpace: 'nowrap', ...headCell.style }
                      : { ...headCell.style }
                  }
                  padding={disableAllCheck ? 'normal' : 'checkbox'}
                >
                  {oneCheck ? null : disableAllCheck ? (
                    <div className="table-head-text">{headCell.label}</div>
                  ) : (
                    <>
                      <CustomFormLabel className="input-label-none" htmlFor="all">전체선택</CustomFormLabel>
                      <CustomCheckbox
                        id="all"
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < rows.length &&
                          !validFlag
                        }
                        checked={
                          rows.length != 0 &&
                          selected.length === rows.length &&
                          !validFlag
                        }
                        onChange={handleSelectAll}
                        tabIndex={-1}
                        inputProps={{
                          'aria-labelledby': 'select all desserts',
                        }}
                      />
                    </>
                  )}
                </TableCell>
              ) : (
                <TableCell
                  align={'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  style={{ whiteSpace: 'nowrap', ...headCell.style }}
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

  function getRowspan(index: number, colNm: string) {
    let count = 1
    const colValue = rows[index][colNm]

    if (!colValue) return count

    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i][colNm] === colValue) {
        count++
      } else {
        break
      }
    }
    return count
  }

  function isRowspan(index: number, colNm: string) {
    if (
      index > 0 &&
      rows[index][colNm] &&
      rows[index - 1][colNm] === rows[index][colNm]
    ) {
      return true
    } else {
      return false
    }
  }

  function getColspan(row: any, headCells: HeadCell[], index: number) {
    const colValue = row[headCells[index].id]
    let count = 1
    if (
      colValue === '소계' ||
      colValue === '합계' ||
      colValue === '부정수급액' ||
      colValue === '환수대상금액'
    ) {
      for (let i = index + 1; i < headCells.length; i++) {
        if (!row[headCells[i].id]) {
          count++
        } else {
          break
        }
      }
    }
    return count
  }

  function isColspan(row: any, headCells: HeadCell[], index: number) {
    if (!row[headCells[index].id]) {
      for (let i = index - 1; i > -1; i--) {
        if (row[headCells[i].id]) {
          if (
            row[headCells[i].id] === '소계' ||
            row[headCells[i].id] === '합계' ||
            row[headCells[i].id] === '부정수급액' ||
            row[headCells[i].id] === '환수대상금액'
          )
            return true
          else return false
        }
      }
    }
    return false
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
      } else if (headCell.format === 'cardNo') {
        let cardNo = row[headCell.id]
        if (!cardNo) return ''
        return (
          cardNo.substring(0, 4) +
          '-' +
          cardNo.substring(4, 8) +
          '-' +
          cardNo.substring(8, 12) +
          '-' +
          cardNo.substring(12, 16)
        )
      } else if (headCell.format === 'rrno') {
        let rrno = row[headCell.id]
        if (!rrno) return ''
        return rrno.substring(0, 6) + '-' + rrno.substring(6, 13)
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
      } else if (headCell.format === 'ymdsubstr') {
        if (isNaN(row[headCell.id]) && row[headCell.id].length < 10)
          return row[headCell.id]
        let dateString = row[headCell.id]
        let ymd = dateString?.substring(0, 10)

        return ymd
      } else {
        return row[headCell.id]
      }
    } catch (error) {
      console.error('Error get City Code data:', error)
    }
    return ''
  }

  const compareVal = (bfVal?: string, afVal?: string) => {
    if (afVal != null) {
      if (afVal == '') return true
      else if (bfVal != afVal) return false
      else return true
    } else {
      return true
    }
  }

  useEffect(() => {
    const initialSelected = rows
      .map((row, index) => (row.chk === '1' ? 'tr' + index : null))
      .filter((id) => id !== null)
    setSelected(initialSelected)
  }, [rows])

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <TableContainer>
          <Table
            sx={split || split == null ? { minWidth: '750' } : {}}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            {caption ? (
            <>
              <caption>{caption}</caption>
            </>
            ) : (
            <><caption>테이블 내용</caption></>
            )}
            {customHeader ? (
              customHeader(handleSelectAll)
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
                        sx={
                          onRowClick !== undefined ? { cursor: 'pointer' } : {}
                        }
                        onClick={() => {
                          if (checkAndRowClick) {
                            handleSelect('tr' + index, row, index) // Row 클릭 시 handleSelect 호출
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <CustomFormLabel className="input-label-none" htmlFor={'tr' + index}></CustomFormLabel>
                          <CustomCheckbox
                            // id={headCell.id + index}
                            id={'tr' + index}
                            name='check'
                            value={'tr' + index}
                            checked={selected.includes('tr' + index)}
                            onChange={() =>
                              handleSelect('tr' + index, row, index)
                            } // row와 index 추가
                          />
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.carBrno, row.netBrno) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {brNoFormatter(row.carBrno) ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.vonrNm, row.netReowNm) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.vonrNm ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.vhclNo, row.netVhclNo) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.vhclNo ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.carRrnoHid, row.netRrno) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {rrNoFormatter(row.carRrnoHid) ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.koiNm, row.netKoiNm) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.koiNm ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.bzmnSeNm ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.carLocgovNm, row.newLocgovNm) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.carLocgovNm ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                            color: !compareVal(row.vhclSttsNm, row.netVhclSttsNm) ? 'red' : 'black'
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.vhclSttsNm ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.carReowNmChangeYn ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.carBrnoChangeYn ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.carRrnoChangeYn ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.koiCdChangeYn ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.locgovCdChangeYn ?? ''}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {row.vhclSttsCdChangeYn ?? ''}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow key={'tr0'}>
                    <TableCell colSpan={headCells.length} className="td-center">
                      <p>
                        {emptyMessage
                          ? emptyMessage
                          : '검색된 데이터가 없습니다.'}
                      </p>
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
            {totalRows ? (
              <Box
                style={
                  !pageable
                    ? { display: 'inline-flex', marginTop: '20px' }
                    : undefined
                }
              >
                <TableBottomToolbar />
              </Box>
            ) : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  )
}

export default React.memo(TableDataGrid)
