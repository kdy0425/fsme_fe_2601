/* React */
import React, { useEffect, useState, useCallback, SetStateAction } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통 type, interface */
import { Pageable2, HeadCell } from 'table'

/* 공통js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

interface TxSalesInfoModalProps {
  vhclNo:string
  open:boolean
  setOpen:React.Dispatch<SetStateAction<boolean>>
}

/* type 선언 */
const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'aplcnYmd',
    numeric: false,
    disablePadding: false,
    label: '운행일자',
    format: 'yyyymmdd'
  },
  {
    id: 'useNmtm',
    numeric: false,
    disablePadding: false,
    label: '운행횟수',
  },
  {
    id: 'aplySeNm',
    numeric: false,
    disablePadding: false,
    label: '수신정보',
  },
]

/* 검색조건 */
interface listSearchObj {
  page: number
  size: number
  vhclNo: string
}

interface Row {
  vhclNo:string
  aplcnYmd:string
  useNmtm:string
  aplySeNm:string
}

const TxSalesInfoModal = (props:TxSalesInfoModalProps) => {
  
  const { vhclNo, open, setOpen } = props

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  const [params, setParams] = useState<listSearchObj>({ page:1, size:10, vhclNo:vhclNo}) // 검색조건
  const [rows, setRows] = useState<Row[]>([]) // 조회결과
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부

  useEffect(() => {
    if(open) {
      setSearchFlag(prev => !prev)
    }      
  }, [open])

  useEffect(() => {
    if (searchFlag != null) {
      fetchData()
    }
  }, [searchFlag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber:1, pageSize:10, totalPages:1 })
    setLoading(true)

    try {

      const endpoint = '/fsm/stn/vm/tx/getAllSalesInfo' + toQueryParameter(params)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      }
    } catch (error) {
      console.log('error', error)
    } finally {
      setLoading(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page:page, size:pageSize }));
    setSearchFlag((prev) => !prev)
  }, []);

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        >
          <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>택시 운행정보시스템 목록조회</h2>
            </CustomFormLabel>   
            <div className=" button-right-align">
              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                취소
              </Button>
            </div>
          </Box>
          <Box>
            <TableDataGrid
              headCells={headCells}
              rows={rows}
              totalRows={totalRows}
              loading={loading}
              onPaginationModelChange={handlePaginationModelChange}
              pageable={pageable}
              caption={"택시 운행정보시스템 목록조회"}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TxSalesInfoModal
