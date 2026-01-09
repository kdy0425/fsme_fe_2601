// DetailTable.tsx
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { HeadCell } from 'table'

interface DetailTableProps {
  selectedRowData: any // 선택된 행 데이터
  detailHeadCells: HeadCell[] // 테이블 헤더 셀
  loading: boolean // 로딩 여부
}

const DetailTableDataList: React.FC<DetailTableProps> = ({
  selectedRowData,
  detailHeadCells,
  loading,
}) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'small'}>
        <TableHead>
          <TableRow>
            {detailHeadCells.map((headCell) => (
              <TableCell key={headCell.id} align={'left'}>
                {headCell.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            <TableRow>
              <TableCell>{selectedRowData.usageSeCd}</TableCell>
              <TableCell>{selectedRowData.vhclNo}</TableCell>
              <TableCell>{selectedRowData.crdcoCd}</TableCell>
              <TableCell>{selectedRowData.cardNo}</TableCell>
              <TableCell>{selectedRowData.onrNm}</TableCell>
              <TableCell>{selectedRowData.brno}</TableCell>
              <TableCell>{selectedRowData.rrno}</TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={detailHeadCells.length} className="td-center">
                <p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DetailTableDataList
