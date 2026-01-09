import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { useEffect, useState } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { maiMainIlligalHC } from '@/utils/fsms/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { closeIllegalModal } from '@/store/popup/MainPageIllegalitySlice'

interface IlletalitySearchRow {
  handleNm: string
  administrationGb: string
  exmnNo: string
  locgovNm: string
  vhclNo: string
  vonrNm: string
  instcSpldmdAmt: string
  rdmAmt: string
  rlRdmAmt: string
  instcSpldmdTypeCd: string
}

type listSearchObj = {
  locgovCd: string
  vhclNo: string
  [key: string]: string | number
}

const MainIllegalityModal = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<IlletalitySearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [params, setParams] = useState<listSearchObj>({
    locgovCd: '',
    vhclNo: '',
  })

  const mainIllegality = useSelector(
    (state: AppState) => state.mainIlligalityInfo,
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if (mainIllegality.MpiModalOpen) {
      fetchData()
    }
  }, [mainIllegality.MpiModalOpen])

  const setInitialState = () => {
    setRows([])
  }

  const handleClose = () => {
    dispatch(closeIllegalModal())
  }

  /**
   * 조회조건 값 변경시 호출되는 함수
   * @param event
   */
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        // `/fsm/apv/fdd/tr/getAllSetleCardDtls?page=${params.page}&size=${params.size}` +
        `/fsm/mai/main/getIllegalityList?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        setTotalRows(response.data.totalElements)
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
        open={mainIllegality.MpiModalOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box
            className="table-bottom-button-group"
            style={{ marginTop: 0, marginBottom: '16px' }}
          >
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>

          <Box component="form" onSubmit={() => {}} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 지자체명 조회조건 */}
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                    htmlFor="vhclNo"
                  >
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </Box>
          </Box>

          <Box>
            <TableDataGrid
              headCells={maiMainIlligalHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              paging={false}
              caption='차량검색'
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default MainIllegalityModal
