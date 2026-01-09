import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { useEffect, useState } from 'react'
import { SuccessionPopupHC } from '@/utils/fsms/headCells'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { closeSuccessionModal } from '@/store/popup/SuccessionSlice'

interface SuccessionSearchRow {
  aplcnYmd: string
  vhclNo: string
  hstrySn: string
  crnoDe: string
  vonrNm: string
  vonrBrno: string
  bgngYmd: string
  endYmd: string
  chgSeCd: string
  chgRsnCn: string
  delYn: string
  rgtrId: string
  regDt: string
  locgovNm: string
  chgSeNm: string
}
type listSearchObj = {
  vhclNo: string
  [key: string]: string | number
}

const SuccessionInfoModal = () => {
  const [rows, setRows] = useState<SuccessionSearchRow[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  const [params, setParams] = useState<listSearchObj>({
    vhclNo: '경기82바9003',
  })

  const dispatch = useDispatch()
  const successionInfo = useSelector((state: AppState) => state.successionInfo)

  useEffect(() => {
    if (successionInfo.sucModalOpen) {
      fetchData()
    }
  }, [successionInfo.sucModalOpen])

  const setInitialState = () => {
    setRows([])
  }

  const handleClose = () => {
    dispatch(closeSuccessionModal())
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {
      if (!params.vhclNo) {
        alert('차량번호가 없습니다.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/esh/tr/popup/getAllSucHis?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setInitialState()
      }
    } catch (error) {
      // 에러시
      alert(error)
      setInitialState()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={successionInfo.sucModalOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>보조금 지급정지이력</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box>
            <TableDataGrid
              headCells={SuccessionPopupHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              paging={false}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default SuccessionInfoModal
