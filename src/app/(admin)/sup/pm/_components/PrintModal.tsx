/* react */
import React, { Dispatch, SetStateAction, useMemo } from 'react'

/* mui component */
import { Button, Dialog, DialogContent, Box } from '@mui/material'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* type */
import { Row, DetailRow } from '../page'
import { HeadCell } from 'table'

/* _components */
import { FirstHalfHeader, SecondHalfHeader } from './CustomHeaders'

/* prdvJs */
import { getHeadCell } from '../prdvJs'

type propsType = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  detailRows: DetailRow[]
  selectedData: Row
}

const PrintModal = (props: propsType) => {

  const { open, setOpen, detailRows, selectedData } = props

  // 헤드셀
  const headCell: HeadCell[] = useMemo(() => {
    return getHeadCell(selectedData.halfYear)
  }, [selectedData])

  // 커스텀 헤더
  const customHeader = useMemo(() => {
    return selectedData.halfYear === '1' ? () => FirstHalfHeader('view') : () => SecondHalfHeader('view')
  }, [selectedData])

  return (
    <>
      <style jsx global>{`
        @media print {
          * {
            page-break-before: auto !important;
            page-break-after: auto !important;
            page-break-inside: auto !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print_area,
          .print_area * {
            visibility: visible !important;
          }

          .print_area {
            position: relative !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            zoom: 95%;
          }

          html, body {
            overflow: visible !important;
            height: auto !important;
          }

          @page {
            size: A4 landscape;
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
                  color="dark"
                  onClick={() => setOpen(false)}
                >
                  닫기
                </Button>
              </div>
            </Box>

            <div className="popup_inner_scroll print_area">
              <Box mt={2}>
                <TableDataGrid
                  customHeader={customHeader}
                  headCells={headCell} // 테이블 헤더 값
                  rows={detailRows} // 목록 데이터
                  loading={false} // 로딩여부
                  caption={'안분관리 상세 조회 목록'}
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
