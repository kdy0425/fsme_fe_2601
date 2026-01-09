import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Pageable2 } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { oilStationPopSearchHC } from '@/utils/fsms/headCells'
import {
  closeOilStationModal,
  clearOilStationInfo,
  setOilStationInfo,
} from '@/store/popup/OilStationSlice'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'

interface OilStationSearchRow {
  frcsBrno: string
  frcsNm: string
  telno: string
  daddr: string
}

type listSearchObj = {
  page: number
  size: number
  frcsBrno: string
  [key: string]: string | number
}

const OilStationModal = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<OilStationSearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 총 수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const pathname = usePathname()

  const dispatch = useDispatch()
  const oilStationInfo = useSelector((state: AppState) => state.oilStationInfo)

  const reduxString = 'frcsBrno$frcsNm$telno$daddr'

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    frcsBrno: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setParams((prev) => ({
      ...prev,
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
    }))
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  useEffect(() => {
    if (oilStationInfo.osmModalOpen) {
      dispatch(clearOilStationInfo())
      setParams((prev) => ({ ...prev, frcsBrno: '' }))
      setRows([])
    }
  }, [oilStationInfo.osmModalOpen])

  const handleReturnData = (row: any) => {
    const obj: { [key: string]: string } = {}
    reduxString.split('$').forEach((value: string, index: number) => {
      obj[`${value}OSM`] = row[`${value}`]
    })
    /**
     * {
     *  vhclNoCM: '',
     *  locgovCdCM: '',
     *  crnoDeCM: '',
     *  ...
     *  }
     *  방식으로 객체가 생성됨
     */
    dispatch(setOilStationInfo(obj))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    let { key } = event
    if (key === 'Enter') {
      fetchData()
    }
  }

  const handleReturnDataAndClose = (row: any) => {
    handleReturnData(row)
    dispatch(closeOilStationModal())
  }

  const handleClickClose = () => {
    setInitialState()
    dispatch(closeOilStationModal())
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {
      if (!params.frcsBrno) {
        alert('사업자등록번호를 입력해주세요')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm${pathname}/tr/getAllChainInfo?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
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

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
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

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={oilStationInfo.osmModalOpen}
        onClose={handleClickClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>주유소 조회</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>

          {/* 모달 조회조건 시작 */}
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault()
            }}
            sx={{ mb: 2 }}
          >
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 지자체명 조회조건 */}
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                  >
                    사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    name="frcsBrno"
                    value={params.frcsBrno}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 모달 조회조건 종료 */}

          <Box width={1000}>
            <TableDataGrid
              headCells={oilStationPopSearchHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={(row: any) => {
                handleReturnDataAndClose(row)
              }} 
              onPaginationModelChange={
                handlePaginationModelChange
              } // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default OilStationModal
