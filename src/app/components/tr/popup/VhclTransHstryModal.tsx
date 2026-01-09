import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Pageable2 } from 'table'
import { vhclTransPopupHC } from '@/utils/fsms/headCells'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

interface TransHstryRow {
  hstrySn: string
  aplcnYmd: string
  vonrRrnoDe: string
  vonrNm: string
  crnoDe: string
  exsLocgovNm: string
  chgLocgovNm: string
}

type listSearchObj = {
  vhclNo: string
}

const VhclTransHstryModal = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<TransHstryRow[]>([]) // 가져온 로우 데이터

  const [loading, setLoading] = useState(false) // 로딩여부
  const pathname = usePathname()

  const [params, setParams] = useState<listSearchObj>({
    vhclNo: '강원89바2840',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    setInitialState()
  }, [])

  useEffect(() => {
    if (params.vhclNo) {
      fetchData()
    }
  }, [flag])

  const setInitialState = () => {
    setRows([])
    // setParams({
    //     vhclNo: '',
    // })
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
        `/fsm${pathname}/tr/pop/getVhclTransInfo?` +
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
      <Dialog maxWidth={'xl'} open={false} onClose={() => {}}>
        <DialogContent>
          {/* 모달 상단부분 시작 */}
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량이관이력</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="dark" onClick={() => {}}>
                취소
              </Button>
            </div>
          </Box>
          {/* 모달 상단부분 종료 */}
          {/* 모달 조회조건 시작 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 지자체명 조회조건 */}
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                  >
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    name="vhclNo"
                    value={'강원88바1234'}
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 모달 조회조건 종료 */}
          <Box>
            <TableDataGrid
              headCells={vhclTransPopupHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={rows.length} // 총 로우 수
              loading={loading} // 로딩여부
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default VhclTransHstryModal
