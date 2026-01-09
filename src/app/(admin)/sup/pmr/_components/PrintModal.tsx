/* react */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

/* mui component */
import { Button, Dialog, DialogContent, Box, TableCell, TableHead, TableRow } from '@mui/material'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통 js */
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getToday } from '@/utils/fsms/common/dateUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'

/* type */
import { supPmrHC } from '@/utils/fsms/headCells'
import { Row, listSearchObj } from '../page'
import { CdData } from '@/types/fsms/admin/menuListData'

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2}>기준년월</TableCell>
        <TableCell rowSpan={2}>월세입액</TableCell>
        <TableCell rowSpan={2}>업무구분</TableCell>
        <TableCell colSpan={3}>카드사 지급</TableCell>
        <TableCell colSpan={3}>서면신청 지급</TableCell>
        <TableCell rowSpan={2}>총 유류사용량</TableCell>
        <TableCell rowSpan={2}>총 지급금액</TableCell>
        <TableCell rowSpan={2}>과,부족액</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>지급대수</TableCell>
        <TableCell>유류사용량</TableCell>
        <TableCell>지급금액</TableCell>
        <TableCell>지급대수</TableCell>
        <TableCell>유류사용량</TableCell>
        <TableCell>지급금액</TableCell>
      </TableRow>
    </TableHead>
  )
}

const reSupPmrHC = supPmrHC.filter(item => item.id !== 'print')

type StrctStatsRptpModalProps = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  rows: Row[]
}

const PrintModal = (props: StrctStatsRptpModalProps) => {

  const { open, setOpen, rows } = props

  const [carmdlNm, setCarmdlNm] = useState<string>('') // 업무구분

  useEffect(() => {
    if (open) {
      getCode()
    }
  }, [open])

  // 업무구분 가져오기
  const getCode = async (): Promise<void> => {
    const codeList: CdData[] = await getCodesByGroupNm('92H')
    const result = codeList.filter(item => item.cdNm === rows[0].carmdlCd)[0].cdKornNm
    setCarmdlNm(result)
  }

  // 액셀 다운로드
  const excelDownload = async () => {
    const params = rows[0]
    const searchObj: listSearchObj = {
      page: 1,
      size: 10,
      ctpvCd: params.ctpvCd,
      locgovCd: params.locgovCd,
      carmdlCd: params.carmdlCd,
      startAplcnYmd: params.crtrYm.replaceAll('-', ''),
      endAplcnYmd: params.crtrYm.replaceAll('-', ''),
    }
    const endpoint = '/fsm/sup/pmr/cm/perfMngExcel' + toQueryParameter(searchObj)
    await getExcelFile(endpoint, '지급실적관리_' + getToday() + '.xlsx')
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print_area {
            overflow: visible !important;
          }
          .print_area,
          .print_area * {
            visibility: visible !important;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
      <Box>
        <Dialog
          fullWidth={false}
          open={open}
          maxWidth={'xl'}
        >
          <DialogContent>
            <Box className="table-bottom-button-group">
              <div className=" button-right-align">
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => window.print()} // ← 추가
                >
                  출력
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={excelDownload}
                >
                  엑셀
                </Button>
                <Button
                  variant="contained"
                  color="dark"
                  onClick={() => setOpen(false)}
                >
                  닫기
                </Button>
              </div>
            </Box>

            <div className="popup_inner_scroll print_area">
              <h2 style={{ marginTop: 10, textAlign: 'center' }}>
                {carmdlNm} 지급확정
              </h2>
              <table
                className="border-collapse"
                style={{ textAlign: 'left', fontWeight: 'bold' }}
              >
              <caption className="sr-only">
                {carmdlNm} 지급확정
              </caption>
                <tbody>
                  <tr>
                    <th className="pr-6" scope="row">기간</th>
                    <td>
                      : {rows[0].crtrYm.substring(0, 4)}년 {rows[0].crtrYm.substring(4, 6)}월
                    </td>
                  </tr>
                  <tr>
                    <th className="pr-6" scope="row">관할관청</th>
                    <td>: {rows[0].ctpvNm} {rows[0].locgovNm}</td>
                  </tr>
                </tbody>
              </table>
              <Box style={{ marginTop: 20 }}>
                <TableDataGrid
                  headCells={reSupPmrHC}
                  rows={rows}
                  loading={false}
                  customHeader={customHeader}
                />
              </Box>
            </div>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  )
}
export default PrintModal
