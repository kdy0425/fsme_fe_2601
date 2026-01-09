import React, { useEffect, useState } from 'react'

import {
  Box,
  Button,
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
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import {
  brNoFormatter,
  dateTimeFormatter,
  getCommaNumber,
  getDateTimeString,
} from '@/utils/fsms/common/util'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { usePathname } from 'next/navigation'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
  DoubtDelngButtonGroup,
  ExaathrButtonGroup,
  ExamResultButtonGroup,
  ExamTrgetButtonGroup,
  LgovTrfCfmButtonGroup,
  LgovTrfntfReqButtonGroup,
} from '@/app/components/tr/button/ilgButton'
import { telnoFormatter } from '@/utils/fsms/common/comm'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { callRefetch } from '@/types/fsms/common/ilgData'
import { openExamResultModal } from '@/store/popup/ExamResultSlice'
import { clearNextProp, openExaathrModal } from '@/store/popup/ExaathrSlice'
import { openLgovTrfntfModal } from '@/store/popup/LgovTrfntfSlice'
type SupportedLocales = keyof typeof locales

// 테이블 caption
const tableCaption: string = ''

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  numSelected?: number
  headCells: HeadCell[]
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void
  rowCount: number
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
  tabIndex: string //화면의 선택한 탭의 인덱스
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onRowClick?: (id: number) => void // 행 클릭 핸들러 추가
  excelDownload: () => void
  pageable: Pageable2 // 페이지 정보
  selectedRowIndex?: number
  checkBoxClick?: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleRadioChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  tabIndex,
  rows,
  totalRows,
  loading,
  onPaginationModelChange,
  onRowClick,
  excelDownload,
  pageable,
  selectedRowIndex,
  checkBoxClick,
  handleSelectAllClick,
  handleRadioChange,
}) => {
  const ddalInfo = useSelector((state: AppState) => state.ddalInfo)
  const dispatch = useDispatch()

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const pathname = usePathname()
  const pageUrl = pathname.split('/')[2]

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    if (pageable?.totalPages === 0) return
    onPaginationModelChange(newPage, pageable.pageSize)
  }

  //페이지 사이즈 변경시 0 페이지로 이동
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onPaginationModelChange(1, Number(event.target.value))
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

  /** 의심거래내역 이동 */
  const handleCancelExamTrget = async (rows: Row[]) => {
    // console.log(rows)
    if (!rows.length) {
      alert('의심거래내역으로 이동시킬 항목을 선택해주세요')
      return
    }

    if (!confirm('의심거래내역으로 이동 하시겠습니까?')) {
      return
    }
    try {
      let body = rows.map((value: Row, index: number) => {
        return {
          exmnNo: value.exmnNo,
          vhclNo: value.vhclNo,
          sn: value.seqNo,
        }
      })
      setIsDataProcessing(true)

      let endpoint: string = `/fsm${pathname}/tr/cancelBypeExamTrget`

      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        { list: body },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        callRefetch(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  /** 건별조사대상확정 */
  const handleBypeExamTrgetEach = async (rows: Row[]) => {
    if (rows.length === 0) {
      alert('조사대상 확정 할 행의 체크박스를 선택해주세요')
      return
    }

    if (!confirm('건별로 조사대상 확정하시겠습니까?')) {
      return
    }

    try {
      let body = rows.map((value: Row, index: number) => {
        return {
          locgovCd: value.locgovCd,
          vhclNo: value.vhclNo,
          aprvYmd: value.aprvYmd,
          sn: value.seqNo,
        }
      })

      setIsDataProcessing(true)
      let endpoint: string = `/fsm${pathname}/tr/decisionBypeExamTrgetEach`

      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        { list: body },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        callRefetch(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  /** 조사결과 등록 */
  const handleCreateExamResult = (rows: Row[]) => {
    if (!rows.length) {
      alert('처리할 목록을 선택하세요')
      return
    }

    dispatch(openExamResultModal())
  }

  const handleCancelExamResult = async (rows: Row[]) => {
    if (!rows.length) {
      alert('처리할 목록을 선택하세요')
      return
    }

    let body = rows.map((value: Row, index: number) => {
      return {
        exmnNo: value.exmnNo,
        exmnRegYn: value.exmnRegYn,
        pbadmsPrcsYn: value.pbadmsPrcsYn,
      }
    })

    for (let index = 0; index < body.length; index++) {
      const { exmnRegYn, pbadmsPrcsYn } = body[index]
      if (exmnRegYn === 'Y') {
        if (pbadmsPrcsYn == 'Y') {
          alert('행정처분 등록건은 취소할 수 없습니다.')
          return
        }
      } else {
        alert('조사결과 등록대기건은 취소할 수 없습니다.')
        return
      }
    }

    if (!confirm('등록된 조사결과를 취소하시겠습니까?')) {
      return
    }

    try {
      let exmnArr = body.map((value: any, index: number) => {
        return {
          exmnNo: value.exmnNo,
        }
      })

      let endpoint: string = `/fsm${pathname}/tr/cancelExamResult`

      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        { list: exmnArr },
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        callRefetch(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
    } finally {
    }
  }

  /** 행정처분 등록 */
  const handleCreateExaathr = (rows: Row[]) => {
    if (!rows.length) {
      alert('처리할 목록을 선택하세요')
      return
    }
    dispatch(openExaathrModal())
    dispatch(clearNextProp())
  }

  const handleCancelExaathr = async (rows: Row[]) => {
    if (!rows.length) {
      alert('처리할 목록을 선택하세요')
      return
    }

    let body = rows.map((value: Row, index: number) => {
      return {
        exmnNo: value.exmnNo,
        exmnRegYn: value.exmnRegYn,
        pbadmsPrcsYn: value.pbadmsPrcsYn,
      }
    })

    for (let index = 0; index < body.length; index++) {
      const { exmnRegYn, pbadmsPrcsYn } = body[index]
      if (exmnRegYn !== 'Y') {
        alert('조사대기 등록건은 취소할 수 없습니다.')
        return
      } else {
        if (pbadmsPrcsYn !== 'Y') {
          alert('행정처분 등록대기건은 취소할 수 없습니다.')
          return
        }
      }
    }

    if (!confirm('등록된 행정처분 결과를 취소하시겠습니까?')) {
      return
    }

    try {
      let exmnArr = body.map((value: any, index: number) => {
        return {
          exmnNo: value.exmnNo,
        }
      })
      let endpoint: string = `/fsm${pathname}/tr/cancelExaathr`
      setIsDataProcessing(true)
      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        { list: exmnArr },
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        callRefetch(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  /** 지자체이첩요청 신규등록 */
  const handleCreateLgovTr = (rows: Row[]) => {
    if (!rows.length) {
      alert('처리할 목록을 선택하세요')
      return
    }

    dispatch(openLgovTrfntfModal())
  }

  /** 지자체이첩요청 승인, 반려, 취소처리 */
  const handleUpdateLgovTrf = async (rows: Row[], status: string) => {
    const statusText =
      status === 'A' ? '승인' : status === 'C' ? '취소' : '반려'
    const statusEndpoint =
      status === 'A'
        ? '/tr/approveLgovTrfntf'
        : status === 'C'
          ? '/tr/cancelLgovTrfntfReq'
          : '/tr/rejectLgovTrfntf'
    if (!rows.length) {
      alert('처리할 목록을 선택하세요')
      return
    }

    if (!confirm(`지자체이첩요청을 ${statusText}하시겠습니까?`)) {
      return
    }

    for (let i = 0; i < rows.length; i++) {
      const value = rows[i]
      if (value.sttsCd !== 'R') {
        alert(`이미 처리된 건이 있습니다. ${value.exmnNo}`)
        return
      }
    }

    try {
      let body = rows.map((value: Row, index: number) => {
        let obj = {
          exmnNo: value.exmnNo,
          seqSn: value.seqSn,
        }
        return status !== 'A'
          ? { ...obj, mvoutLocgovCd: value.mvoutLocgovCd }
          : { ...obj, mvinLocgovCd: value.mvinLocgovCd }
      })
      setIsDataProcessing(true)

      let endpoint: string = `/fsm${pathname}${statusEndpoint}`

      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        { list: body },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        callRefetch(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  // 테이블 th 정의 기능
  function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
    const { onSelectAllClick, headCells, numSelected, rowCount } = props
    const { ddalSelectedData } = ddalInfo

    return (
      <TableHead>
        <TableRow key={'thRow'}>
          {headCells.map((headCell) => {
            return (
              <React.Fragment key={'th' + headCell.id}>
                {headCell.format === 'checkbox' ? (
                  <TableCell padding="checkbox">
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="chkAll"
                    >
                      전체선택
                    </CustomFormLabel>
                    <CustomCheckbox
                      id="chkAll"
                      indeterminate={
                        ddalSelectedData.length > 0 &&
                        ddalSelectedData.length < rows.length
                      }
                      checked={rows.every((value: Row, index: number) => {
                        return value.chk === '1'
                      })}
                      onChange={onSelectAllClick}
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
                    style={{ whiteSpace: 'nowrap', ...headCell.style }}
                  >
                    <div className="table-head-text">{headCell.label}</div>
                  </TableCell>
                )}
              </React.Fragment>
            )
          })}
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

  // MUI 그리드 한글화
  const locale: SupportedLocales = 'koKR'
  const theme = useTheme()
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  )

  const { ddalSelectedData, ddalExamResultData } = ddalInfo

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
        <Box
          className="table-bottom-button-group"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '-6px',
            paddingBottom: '14px',
          }}
        >
          <TableTopToolbar totalRows={totalRows} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {tabIndex === '1' ? (
              <DoubtDelngButtonGroup
                dwNo="07"
                handleBypeExamTrgetEach={() =>
                  handleBypeExamTrgetEach(ddalSelectedData)
                }
              />
            ) : null}
            {tabIndex === '2' ? (
              <ExamTrgetButtonGroup
                handleCreateExamResult={() =>
                  handleCreateExamResult(ddalSelectedData)
                }
                handleCreateLgovTr={() => handleCreateLgovTr(ddalSelectedData)}
                handleCancelExamTrget={() =>
                  handleCancelExamTrget(ddalSelectedData)
                }
              />
            ) : null}
            {tabIndex === '3' ? (
              <ExamResultButtonGroup
                handleCreateExaathr={() =>
                  handleCreateExaathr(ddalExamResultData)
                }
                handleCancelExamResult={() =>
                  handleCancelExamResult(ddalExamResultData)
                }
                handleChange={handleRadioChange}
              />
            ) : null}
            {tabIndex === '4' ? (
              <ExaathrButtonGroup
                handleCancelExaathr={() =>
                  handleCancelExaathr(ddalSelectedData)
                }
                handleChange={handleRadioChange}
              />
            ) : null}
            {tabIndex === '5' ? (
              <LgovTrfCfmButtonGroup
                handleLgovTrfConfirm={() =>
                  handleUpdateLgovTrf(ddalSelectedData, 'A')
                }
                handleLgovTrfDeny={() =>
                  handleUpdateLgovTrf(ddalSelectedData, 'D')
                }
                handleChange={handleRadioChange}
              />
            ) : null}
            {tabIndex === '6' ? (
              <LgovTrfntfReqButtonGroup
                handleLgovTrfCancel={() =>
                  handleUpdateLgovTrf(ddalSelectedData, 'C')
                }
                handleChange={handleRadioChange}
              />
            ) : null}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button variant="contained" onClick={excelDownload} color="success">
              엑셀
            </Button>
          </div>
        </Box>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={'medium'}>
            <caption>{tableCaption}</caption>
            <EnhancedTableHead
              headCells={headCells}
              rowCount={pageable?.pageSize}
              onSelectAllClick={handleSelectAllClick}
              numSelected={ddalSelectedData.length}
            />
            <TableBody>
              {!loading ? (
                rows.length > 0 ? (
                  rows.map((row: any, index) => {
                    return (
                      <TableRow
                        key={'row' + index}
                        selected={selectedRowIndex == index}
                      >
                        {headCells.map((headCell, rowId) => {
                          return headCell.format === 'checkbox' ? (
                            <TableCell
                              key={headCell?.id + index}
                              padding="checkbox"
                            >
                              <CustomFormLabel
                                className="input-label-none"
                                htmlFor={'tr' + index}
                              >
                                선택
                              </CustomFormLabel>
                              <CustomCheckbox
                                id={'tr' + index}
                                name={'chk' + index}
                                checked={row['chk'] === '1'}
                                onChange={checkBoxClick}
                              />
                            </TableCell>
                          ) : (
                            <TableCell
                              key={headCell?.id + index}
                              style={{ whiteSpace: 'nowrap' }}
                              className={headCell.align}
                              onClick={() => onRowClick?.(index)}
                            >
                              {getCellValue(row, headCell)}
                            </TableCell>
                          )
                        })}
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
            {totalRows ? <TableBottomToolbar /> : null}
          </>
        ) : null}
      </div>
      <LoadingBackdrop open={isDataProcessing} />
    </ThemeProvider>
  )
}

export default TableDataGrid
