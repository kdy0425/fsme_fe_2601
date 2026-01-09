import React, { useEffect } from 'react';

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
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
// MUI 그리드 한글화 import
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import { HeadCell } from 'table';
import { Row } from './page';
import { brNoFormatter, dateTimeFormatter, getCommaNumber, getDateTimeString } from '@/utils/fsms/common/util';
import { telnoFormatter } from '@/utils/fsms/common/comm';
type SupportedLocales = keyof typeof locales;

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[];
}

// 테이블 th 정의 기능
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { headCells } = props;


  return (
    <TableHead>
      <TableRow key={'thRow'}>
        {headCells.map((headCell) => (
          <React.Fragment key={'th'+headCell.id}>
            <TableCell
                align={'left'}
                padding={headCell.disablePadding ? 'none' : 'normal'}
            >
            <div className="table-head-text">
                    {headCell.label}
            </div>
            </TableCell>
          </React.Fragment>
          ))}
      </TableRow>
    </TableHead>
  );
}

// 검색 결과 건수 툴바
function TableTopToolbar(props:Readonly<{totalRows?:number}>) {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        검색 결과 <span className="search-count">{props.totalRows}</span>건
      </div>
    </div>
  );
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows?: number
  onRowDoubleClick?: (row: any, index?: number) => void
  loading: boolean // 로딩 여부
  cursor?: boolean
  selectedRowIndex?: number
}

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    headCells,
    rows,
    totalRows,
    onRowDoubleClick,
    loading,
    cursor,
    selectedRowIndex,
}) => {

  // MUI 그리드 한글화
  const locale : SupportedLocales ='koKR';
  const theme = useTheme();
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

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
        return telnoFormatter(row[headCell.id]);
      } else {
        return row[headCell.id]
      }
    } catch (error) {
      console.error('Error get City Code data:', error)
    }
    return ''
  }
  
  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}> 
      <div className="data-grid-wrapper">
        <TableTopToolbar totalRows={totalRows} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
            <EnhancedTableHead
              headCells={headCells}
            />
            <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow 
                      hover
                      selected={selectedRowIndex == index}
                      key={'tr'+index}
                      onDoubleClick={onRowDoubleClick}
                      sx={cursor ? { cursor:'pointer' } : {}}
                    >
                      {headCells.map((headCell, i) => (
                        <React.Fragment key={'tr' + index + i + headCell.id}>
                          <TableCell 
                            className={headCell.align}
                            style={{ whiteSpace:'nowrap' }}>
                              {getCellValue(row, headCell)}
                          </TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={headCells.length} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={headCells.length} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </ThemeProvider>
  );
};

export default TableDataGrid;
