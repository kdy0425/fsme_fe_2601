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
  Paper,
  CircularProgress,
} from '@mui/material'
import { HeadCell, Pageable2 } from 'table'

// TableDataGrid의 props 정의
interface TableDataGridProps {
  headCells: HeadCell[]
  rows: any[] // 목록 데이터
  totalRows?: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange?: (page: number, pageSize: number) => void // 페이지 변경 핸들러
  onRowClick?: (row: any, rowIndex?: number) => void // 행 클릭 핸들러
  pageable?: Pageable2 // 페이지 정보
  selectedRowIndex?: number // 선택된 행 인덱스
  caption?: string // 테이블 캡션
  customHeader?: () => React.ReactNode // 커스텀 헤더
}

const TableDataGrid: React.FC<TableDataGridProps> = ({
  headCells,
  rows,
  totalRows = 0,
  loading,
  onPaginationModelChange,
  onRowClick,
  pageable,
  selectedRowIndex = -1,
  caption,
  customHeader,
}) => {
  // 페이지 변경 핸들러
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    if (onPaginationModelChange && pageable) {
      onPaginationModelChange(page, pageable.pageSize)
    }
  }

  // 행 클릭 핸들러
  const handleRowClick = (row: any, index: number) => {
    if (onRowClick) {
      onRowClick(row, index)
    }
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          {caption && <caption>{caption}</caption>}
          
          {/* 커스텀 헤더가 있으면 사용, 없으면 기본 헤더 */}
          {customHeader ? (
            customHeader()
          ) : (
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'}>
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" style={{ padding: '40px' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" style={{ padding: '40px' }}>
                  검색된 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(row, index)}
                  selected={selectedRowIndex === index}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': onRowClick ? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {}
                  }}
                >
                  {headCells.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'}>
                      {headCell.id === 'userAcntSttsNm'
                        ? row[headCell.id] || '-'
                        : headCell.id === 'lastLgnDt' && row[headCell.id]
                        ? new Date(row[headCell.id]).toLocaleString('ko-KR')
                        : row[headCell.id] || '-'
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {pageable && pageable.totalPages > 1 && (
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mt={2} 
          px={2}
        >
          <Box>
            총 {totalRows.toLocaleString()}건 (페이지 {pageable.pageNumber}/{pageable.totalPages})
          </Box>
          <Pagination
            count={pageable.totalPages}
            page={pageable.pageNumber}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  )
}

export default TableDataGrid