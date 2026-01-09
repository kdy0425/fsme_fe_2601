import React from 'react'

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Button
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
// MUI 그리드 한글화 import
import * as locales from '@mui/material/locale'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import { HeadCell } from 'table';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import { useState } from 'react';
import { dateTimeFormatter, getDateTimeString, brNoFormatter, getCommaNumber} from '@/utils/fsms/common/util';
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import CircularProgress from '@mui/material/CircularProgress'

type SupportedLocales = keyof typeof locales

// 페이지 정보
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[]
  subHeadCells?: HeadCell[]
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void
  order: order
  orderBy: string
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  subHeadCells?: HeadCell[]
  title?: string
  rows: any[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  selectedRowIndex?: number
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  onRowClick: (row: any) => void // 행 클릭 핸들러 추가
  paging: boolean // 페이징여부
  pageable: pageable // 페이지 정보
  reloadFunc?: () => void
  onCheckChange?: (selected : any[]) => void
  cursor?: boolean
  emptyMessage?: string
}

type order = 'asc' | 'desc'

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
  headCells,
  subHeadCells,
  title,
  rows,
  totalRows,
  loading,
  selectedRowIndex,
  onPaginationModelChange,
  onSortModelChange,
  onRowClick,
  paging,
  pageable,
  reloadFunc,
  onCheckChange,
  cursor,
  emptyMessage,
}) => {
  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  let order: order = 'desc'
  let orderBy: string = ''
  if (pageable.sort !== '') {
    let sort = pageable.sort.split(',')
    orderBy = sort[0]
    order = sort[1] == 'desc' ? 'desc' : 'asc'
  }
  const [selected, setSelected] = React.useState<readonly Row[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row, index) => row);
      setSelected(newSelected);
      onCheckChange?.(newSelected);
      return;
    }
    setSelected([]);
    onCheckChange?.([]);
  };

  const handleSelect = (row:Row) => {
    const selectedIndex = selected.indexOf(row);

    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter(item => item !== row);
    }
    setSelected(newSelected);
    onCheckChange?.(newSelected);
  };

  // 테이블 th 정의 기능
  function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
    const { headCells, subHeadCells, order, orderBy, onRequestSort } = props
    const createSortHandler =
      (property: keyof []) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property)
      }
  
  //checkbox
  
  return (
    <TableHead>
      <TableRow key={'thRow'}>   
        {headCells.map((headCell) => (                     
          <React.Fragment key={'th' + headCell.id}>
            {
              headCell.format === 'checkbox' ? (
              <TableCell padding="checkbox">
                <CustomCheckbox
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  checked={selected.length === rows.length}
                  onChange={handleSelectAll}
                  tabIndex={-1}
                  inputProps={{
                    'aria-labelledby': 'select all desserts',
                  }}
                />
              </TableCell>  
              ) : (
                headCell.sortAt ? (
                  <TableCell
                    align={'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === headCell.id ? order : false}
                    style={{whiteSpace:'nowrap'}}
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
                    align={'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                    style={{whiteSpace:'nowrap'}}
                    rowSpan={subHeadCells && !headCell.groupHeader ? 2 : 1}
                    colSpan={headCell.groupHeader ? subHeadCells?.length : 1}
                  >
                    <div className="table-head-text">{headCell.label}</div>
                  </TableCell>
              )
              )
            }
          </React.Fragment>
        ))}
      </TableRow>
      {subHeadCells ? 
        <TableRow>
          {subHeadCells.map((subHeadCell) => (
            <React.Fragment key={'th' + subHeadCell.id}>
              <TableCell
               align={'left'}
               padding={subHeadCell.disablePadding ? 'none' : 'normal'}
               style={{whiteSpace:'nowrap'}}
              >
                <div className="table-head-text">{subHeadCell.label}</div>
              </TableCell>
            </React.Fragment>
          ))}
        </TableRow>
        :
        ''
      }
    </TableHead>
  )
}

// 검색 결과 건수 툴바
function TableTopToolbar(props: Readonly<{ totalRows: number }>) {
  return (
    totalRows != -1 ?
      <div className="data-grid-top-toolbar">
        <div className="data-grid-search-count">
          검색 결과 <span className="search-count">{props.totalRows}</span>건
        </div>
      </div>
      :
    ''
  )
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

  function getRowspan(index:number, colNm:string) {
    let count = 1;
    const colValue = rows[index][colNm];
    
    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i][colNm] === colValue) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  function isRowspan(index:number, colNm:string) {
    if (index > 0 && rows[index - 1][colNm] === rows[index][colNm]) {
      return true;
    }else{
      return false;
    }
  }

  function getColspan(row:any, headCells:HeadCell[], index:number) {
    const colValue = row[headCells[index].id];
    let count = 1;
    if(colValue === '소계' || colValue === '합계'){
      for (let i = index + 1; i < headCells.length; i++) {
        if (!row[headCells[i].id]) {
          count++;
        } else {
          break;
        }
      }
    }
    return count;
  }

  function isColspan(row:any, headCells:HeadCell[], index:number) {
      if(!row[headCells[index].id]){
        for (let i = index - 1; i > -1; i++) {
          if(row[headCells[i].id]){
            if(row[headCells[i].id] === '소계' || row[headCells[index].id] ==='합계')
              return true;
            else 
              return false;
          }else {
            return false;
          }
        }
      }
      return false;
  }

  function getCellValue(row:any, headCell:any) {
    try{
      if(headCell.format === 'brno'){
        return brNoFormatter(row[headCell.id])
      }else if(headCell.format === 'lit'){
        return Number(row[headCell.id]).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          })
      }else if(headCell.format === 'number'){
        return getCommaNumber(row[headCell.id])
      }else if(headCell.format === 'yyyymm'){
        return getDateTimeString(row[headCell.id], 'mon')?.dateString  
      }else if(headCell.format === 'yyyymmdd'){
        return getDateTimeString(row[headCell.id], 'date')?.dateString
      }else if(headCell.format === 'yyyymmddhh24miss'){
        return dateTimeFormatter(row[headCell.id])
      }else if(headCell.format === 'yyyy년mm월'){
        let dateString = getDateTimeString(row[headCell.id], 'mon')?.dateString

        let year = dateString?.substring(0,4);
        let month = dateString?.substring(5,7);

        return year+'년 '+month+'월'
      }else{
        return row[headCell.id]
      }
    }catch(error) {
      console.error('Error get City Code data:', error);
    }
    return '';
  }

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <div className="data-grid-wrapper">
      {title ? 
        <CustomFormLabel className="input-label-display">
          <h3>{title}</h3>
        </CustomFormLabel>
        :
        ''
      }
        <TableTopToolbar  totalRows={totalRows} />
        <TableContainer sx={{ maxHeight: 750}}>
          <Table
            sx={{ minWidth: 750,}}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <EnhancedTableHead
              headCells={headCells}
              subHeadCells={subHeadCells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
            {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow
                    hover
                    selected={selectedRowIndex == index}
                    key={'tr' + index}
                    onClick={() => onRowClick(index)}
                    sx={(cursor ? { cursor: 'pointer' } : {})}
                    >

                      {headCells.map((headCell, i) => (
                        <React.Fragment key={'tr' + index+headCell.id}>
                          { 
                            headCell.format ==='button' ?
                            <TableCell>
                              <Button onClick={() => headCell.button?.onClick(row)} variant="contained" color={headCell.button?.color ? headCell.button?.color : "primary"}>
                                {headCell.button?.label}
                              </Button>
                            </TableCell>
                            :
                            (
                              headCell.format === 'checkbox' ?
                                <TableCell padding="checkbox">
                                  <CustomCheckbox 
                                    name={headCell.id} 
                                    value={'tr' + index} 
                                    checked={selected.includes(rows[index])}
                                    onChange={() => handleSelect(rows[index])}
                                  />
                                </TableCell>
                              :
                               headCell.groupHeader ?
                                (subHeadCells?.map((headCell, i) => (
                                  <TableCell rowSpan = {(headCell.rowspan && !isRowspan(index, headCell.id) ? getRowspan(index, headCell.id) : 1)}
                                    colSpan = {getColspan(row, headCells, i)}
                                    className={headCell.align} 
                                    style={{color: (headCell.color ? row['color'] : 'black'), whiteSpace:'nowrap'}}>
                                    {getCellValue(row, headCell)}
                                  </TableCell>
                                )))
                              :
                              (
                                (headCell.rowspan && isRowspan(index, headCell.id)) || isColspan(row, headCells, i) ? 
                                  null
                                  : 
                                  <TableCell 
                                    rowSpan = {(headCell.rowspan && !isRowspan(index, headCell.id) ? getRowspan(index, headCell.id) : 1)}
                                    colSpan = {getColspan(row, headCells, i)}
                                    className={headCell.align} 
                                    style={{color: (headCell.color ? row['color'] : 'black'), whiteSpace:'nowrap'}}>
                                    {getCellValue(row, headCell)}
                                  </TableCell>
                              )
                            )
                          }
                        </React.Fragment>  
                        
                      ))}
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={headCells.length} className="td-center">
                    <p>
                      {emptyMessage ? emptyMessage : '검색된 데이터가 없습니다.'}
                    </p>
                  </TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={headCells.length} className="td-center">
                  <p>
                    <CircularProgress />
                  </p>
                </TableCell>
              </TableRow>
            }
            </TableBody>
          </Table>
        </TableContainer>

        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        {!loading && paging? 
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalRows}
              rowsPerPage={pageable.pageSize}
              page={pageable.pageNumber}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            : ''}
      </div>
    </ThemeProvider>
  )
}

export default TableDataGrid
