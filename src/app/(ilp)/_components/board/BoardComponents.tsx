'use client'

/* React */
import React from 'react'

/* mui component */
import { Box, Table, TableBody, TableContainer, TableCell } from '@mui/material'

export const BoardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
      <TableContainer style={{ margin: '16px 0 4em 0' }}>
        <Table
          className="table table-bordered"
          aria-labelledby="tableTitle"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export const LeftCell = ({ isRequire, title }: { isRequire: boolean, title: string }) => {
  return (
    <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
      {isRequire && (<span className="required-text">*</span>)}
      {title}
    </TableCell>
  )
}

export const RightCell = ({ children, colSpan }: { children: React.ReactNode, colSpan?: number }) => {
  return (
    <TableCell style={{ textAlign: 'left' }} colSpan={colSpan}>
      {children}
    </TableCell>
  )
}

export const CustomTextArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        whiteSpace: 'pre-line', // 줄바꿈 유지
        width: '100%', // CustomTextField와 동일한 폭
        minHeight: '400px', // CustomTextField와 동일한 높이
        border: '1px solid #ccc', // 일관된 테두리
        borderRadius: '4px', // CustomTextField와 같은 테두리
        padding: '8px', // CustomTextField와 같은 내부 여백
        boxSizing: 'border-box', // 패딩 포함
      }}
    >
      {children}
    </div>
  )
}