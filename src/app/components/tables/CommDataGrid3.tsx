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
import {  useCallback, useEffect, useMemo, useState  } from 'react'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
} from '@/utils/fsms/common/util'
import Loading from '@/app/loading'
import CircularProgress from '@mui/material/CircularProgress'
import { telnoFormatter } from '@/utils/fsms/common/comm'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
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
  customHeader?: (
    handleSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ) => React.ReactNode
  split?: boolean
  srchUrl?:String

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
  customHeader,
  split,
  srchUrl,
}) => {
  /*
  * 최유수 추가
  * */
  const [srchFlag, setSrchFlag] = useState("N");
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [dataTotalCnt, setDataTotalCnt] = useState<any[]>([]);
  const [gridPageable, setGridPageable] = useState<{
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

  /**
   * 검색 이벤트
   */
  const handleKeyDown = useCallback((event:React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      getData();
    }
  }, [])

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((ev:object, page:number) => {
    setSrchFlag('Y');
    //페이지 이동시 setGridPageable로 데이터 수정하기 그런데 totalpages는 어떻게 해야할까요?
    setGridPageable((prev) => ({
      ...prev, // 기존 상태를 복사
      pageNumber: page, // pageSize만 변경
    }));
  }, [])

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setSrchFlag('N');
    setDataRows([]);
    setDataTotalCnt(0);
    setGridPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // 조회정보 가져오기
  const getData = async () => {
    setSrchFlag('N');
      try {
        srchUrl = srchUrl + "&page="+(gridPageable.pageNumber - 1)+"&size="+gridPageable.pageSize
        let endpoint = srchUrl;
        const response = await sendHttpRequest('GET', endpoint, null, true, {cache: 'no-store'})
        if (response && response.resultType === 'success' && response.data.content.length != 0) {
          // 데이터 조회 성공시
          setDataRows(response.data.content);
          setDataTotalCnt(response.data.totalElements || 0);
          setGridPageable({
            pageNumber: response.data.pageable.pageNumber + 1 || 1, // 1-based pagination
            pageSize: response.data.pageable.pageSize || 10,
            totalPages: response.data.totalPages || 0,
          });
          // click event 발생시키기
          if(onRowClick){
            onRowClick(response.data.content[0], 0);
          }
        } else {
          resetPageObject();
          //resetSearchResult();
        }
      } catch (error) {
        resetPageObject();
      }
  }

  useEffect(() => {
    if(srchUrl){
      resetPageObject();
      getData();
    }
  }, [srchUrl]);

  const [selected, setSelected] = React.useState<readonly string[]>([])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (oneCheck) {
      return
    }
    if (event.target.checked) {
      const newSelected = rows.map((row, index) => 'tr' + index)
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

  const handleSelect = (id: string) => {
    const selectedIndex = selected.indexOf(id)

    const newSelected =
      selectedIndex === -1
        ? oneCheck
          ? [id] // `oneCheck`이 true면 새로운 ID만 저장
          : [...selected, id] // 선택 추가
        : selected.filter((item) => item !== id) // 선택 해제

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
                  {oneCheck ? null : (
                    <CustomCheckbox
                      indeterminate={
                        selected.length > 0 && selected.length < dataRows.length
                      }
                      checked={selected.length === dataRows.length}
                      onChange={handleSelectAll}
                      tabIndex={-1}
                      inputProps={{
                        'aria-labelledby': 'select all desserts',
                      }}
                    />
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
    const [pageSize, setPageSize] = React.useState(gridPageable?.pageSize)

    //몇줄씩 보기 수정 이벤트
    const handleChangeSelect = (event: any) => {
      setSrchFlag('Y');
      setPageSize(Number(event.target.value));
      setGridPageable((prev) => ({
        ...prev, // 기존 상태를 복사
        pageSize: Number(event.target.value), // pageSize만 변경
      }));
    }
    useEffect(() => {
      if(srchFlag == 'Y'){
        getData();
      }
    }, [gridPageable]);

    return (
      <div className="data-grid-bottom-toolbar">
        <div className="data-grid-select-count">
          총 {getCommaNumber(dataTotalCnt ?? 0)}개
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

  function getColspan(dataRows: any, headCells: HeadCell[], index: number) {
    const colValue = dataRows[headCells[index].id]
    let count = 1
    if (
      colValue === '소계' ||
      colValue === '합계' ||
      colValue === '부정수급액' ||
      colValue === '환수대상금액'
    ) {
      for (let i = index + 1; i < headCells.length; i++) {
        if (!dataRows[headCells[i].id]) {
          count++
        } else {
          break
        }
      }
    }
    return count
  }

  function isColspan(dataRows: any, headCells: HeadCell[], index: number) {
    if (!dataRows[headCells[index].id]) {
      for (let i = index - 1; i > -1; i--) {
        if (dataRows[headCells[i].id]) {
          if (
            dataRows[headCells[i].id] === '소계' ||
            dataRows[headCells[i].id] === '합계' ||
            dataRows[headCells[i].id] === '부정수급액' ||
            dataRows[headCells[i].id] === '환수대상금액'
          )
            return true
          else return false
        }
      }
    }
    return false
  }

  function getCellValue(dataRows: any, headCell: any) {
    try {
      if (headCell.format === 'brno') {
        return brNoFormatter(dataRows[headCell.id])
      } else if (headCell.format === 'lit') {
        return Number(dataRows[headCell.id]).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      } else if (headCell.format === 'number') {
        return getCommaNumber(dataRows[headCell.id])
      } else if (headCell.format === 'yyyymm') {
        return getDateTimeString(dataRows[headCell.id], 'mon')?.dateString
      } else if (headCell.format === 'yyyymmdd') {
        return getDateTimeString(dataRows[headCell.id], 'date')?.dateString
      } else if (headCell.format === 'yyyymmddhh24miss') {
        return dateTimeFormatter(dataRows[headCell.id])
      } else if (headCell.format === 'hh24miss') {
        return getDateTimeString(dataRows[headCell.id], 'time')?.timeString
      } else if (headCell.format === 'yyyy년mm월') {
        if (isNaN(dataRows[headCell.id])) return dataRows[headCell.id]
        let dateString = getDateTimeString(dataRows[headCell.id], 'mon')?.dateString

        let year = dateString?.substring(0, 4)
        let month = dateString?.substring(5, 7)

        return year + '년 ' + month + '월'
      } else if (headCell.format === 'yyyy년') {
        if (isNaN(dataRows[headCell.id])) return dataRows[headCell.id]
        return dataRows[headCell.id] + '년'
      } else if (headCell.format === 'telno') {
        return telnoFormatter(dataRows[headCell.id])
      } else {
        return dataRows[headCell.id]
      }
    } catch (error) {
      console.error('Error get City Code data:', error)
    }
    return ''
  }

  useEffect(() => {
    const initialSelected = dataRows
      .map((dataRows, index) => (dataRows.chk === '1' ? 'tr' + index : null))
      .filter((id) => id !== null)
    setSelected(initialSelected)
  }, [dataRows])

  useEffect(() => {
    resetPageObject();
  }, [headCells])

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
            {customHeader ? (
              customHeader(handleSelectAll)
            ) : (
              <EnhancedTableHead headCells={headCells} />
            )}
            <TableBody>
              {!loading ? (
                dataRows.length > 0 ? (
                  dataRows.map((dataRows: any, index) => {
                    return (
                      <TableRow
                        hover
                        selected={selectedRowIndex == index}
                        key={'tr' + index}
                        sx={cursor ? { cursor: 'pointer' } : {}}
                      >
                        {headCells.map((headCell, i) => (
                          <React.Fragment key={'tr' + index + i + headCell.id}>
                            {headCell.format === 'button' ? (
                              <TableCell>
                                <Button
                                  onClick={() =>
                                    headCell.button?.onClick(dataRows, index)
                                  }
                                  variant="contained"
                                  color={
                                    headCell.button?.color
                                      ? headCell.button?.color
                                      : 'primary'
                                  }
                                >
                                  {headCell.button?.label}
                                </Button>
                              </TableCell>
                            ) : headCell.format === 'checkbox' ? (
                              <TableCell padding="checkbox">
                                <CustomCheckbox
                                  // id={headCell.id + index}
                                  id={'tr' + index}
                                  name={headCell.id}
                                  value={'tr' + index}
                                  checked={selected.includes('tr' + index)}
                                  onChange={() => handleSelect('tr' + index)}
                                />
                              </TableCell>
                            ) : (headCell.rowspan &&
                                isRowspan(index, headCell.id)) ||
                              isColspan(
                                dataRows,
                                headCells,
                                i,
                              ) ? null : onRowClick !== undefined ||
                              onRowDoubleClick !== undefined ? (
                              <TableCell
                                rowSpan={
                                  headCell.rowspan &&
                                  !isRowspan(index, headCell.id)
                                    ? getRowspan(index, headCell.id)
                                    : 1
                                }
                                colSpan={getColspan(dataRows, headCells, i)}
                                className={headCell.align}
                                style={{
                                  color: dataRows['color'] ?? 'black',
                                  whiteSpace: 'nowrap',
                                  ...headCell.style,
                                }}
                                onClick={() => onRowClick?.(dataRows, index, i)}
                                onDoubleClick={
                                  () => onRowDoubleClick?.(dataRows) // onRowDoubleClick가 있는 경우만 호출
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    onRowClick !== undefined
                                      ? onRowClick?.(dataRows, index, i)
                                      : onRowDoubleClick?.(dataRows)
                                  }
                                }}
                              >
                                {getCellValue(dataRows, headCell)}
                              </TableCell>
                            ) : (
                              <TableCell
                                rowSpan={
                                  headCell.rowspan &&
                                  !isRowspan(index, headCell.id)
                                    ? getRowspan(index, headCell.id)
                                    : 1
                                }
                                colSpan={getColspan(dataRows, headCells, i)}
                                className={headCell.align}
                                style={{
                                  color: dataRows['color'] ?? 'black',
                                  whiteSpace: 'nowrap',
                                  ...headCell.style,
                                }}
                              >
                                {getCellValue(dataRows, headCell)}
                              </TableCell>
                            )}
                          </React.Fragment>
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
            {gridPageable ? (
              <div className="pagination-wrapper">
                <Pagination
                  count={gridPageable?.totalPages}
                  variant="outlined"
                  showFirstButton
                  showLastButton
                  page={gridPageable?.pageNumber}
                  onChange={handlePaginationModelChange}
                />
              </div>
            ) : null}
            {dataTotalCnt ? <TableBottomToolbar /> : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  )
}

export default React.memo(TableDataGrid)
