import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { HeadCell, Pageable2 } from 'table'
import { trListHC } from '@/utils/fsms/ilp/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { Row } from '../page'
import { toQueryParameter } from '@/utils/fsms/utils'

interface TransactionListModalProps {
  row: Row
  detailOpen: boolean
  setDetailOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface DetailRows {
  exmnNo: string
  vhclNo: string
  dlngYmd: string
  dlngTm: string
  cnptSeCd: string
  dlngSeCd: string
  dlngMnsNo: string
  brno: string
  bzentyNm: string
  aprvAmt: string
  fuelQty: string
  asstAmt: string
  frcsNm: string
  cnptSeNm: string
  dlngSeNm: string
  koiNm: string
}

type ListSearchObj = {
  page: number
  size: number
  [key: string]: string | number
}

const TransactionListModalForm = ({
  row,
  detailOpen,
  setDetailOpen,
}: TransactionListModalProps) => {
  const [rows, setRows] = useState<DetailRows[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)

  const [params, setParams] = useState<ListSearchObj>({
    page: 1,
    size: 10,
    exmnNo: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })

  // 모달이 열릴 때 exmnNo 세팅 (초기 1페이지로 리셋)
  useEffect(() => {
    if (detailOpen) {
      setParams({ page: 1, size: 10, exmnNo: row.exmnNo })
    }
  }, [detailOpen, row.exmnNo])

  const fetchData = useCallback(async () => {
    if (!detailOpen || !params.exmnNo) return
    setLoading(true)
    try {
      const endpoint =
        '/ilp/ddpp/bs/getTransactionList' + toQueryParameter(params)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (
        response?.resultType === 'success' &&
        Array.isArray(response?.data?.content) &&
        response.data.content.length > 0
      ) {
        setRows(response.data.content)
        setTotalRows(response.data.totalElements ?? 0)
        setPageable({
          pageNumber: (response.data.pageable?.pageNumber ?? 0) + 1,
          pageSize: response.data.pageable?.pageSize ?? params.size,
          totalPages: response.data.totalPages ?? 1,
        })
      } else {
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: params.size as number,
          totalPages: 1,
        })
      }
    } catch (e) {
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: params.size as number,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }, [detailOpen, params])

  // detailOpen 또는 params 변경 시 조회
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 페이징 변경
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page, size: pageSize }))
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth="xl"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>의심거래내역 상세 조회</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="dark"
                onClick={() => setDetailOpen(false)}
              >
                닫기
              </Button>
            </div>
          </Box>

          <Box>
            <TableDataGrid
              headCells={trListHC as HeadCell[]}
              rows={rows}
              totalRows={totalRows}
              loading={loading}
              onPaginationModelChange={handlePaginationModelChange}
              pageable={pageable}
              paging={true}
              caption="의심거래내역 상세 조회"
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TransactionListModalForm
