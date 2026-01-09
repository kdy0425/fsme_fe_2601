import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { memo, useCallback, useEffect, useState } from 'react'
import { Pageable2 } from 'table'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { localSearchHC } from '@/utils/fsms/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import {
  clearLocgovInfo,
  closeLocgovModal,
  setLocgovInfo,
} from '@/store/popup/LocgovInfoSlice'
import { usePathname } from 'next/navigation'

interface LocalSearchRow {
  ctpvCd: string
  sggCd: string
  ctpvNm: string
  locgovNm: string
  locgovCd: string
}

type listSearchObj = {
  page: number
  size: number
  locgovNm: string
  [key: string]: string | number
}

const LocalSearchModal = memo(() => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<LocalSearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const locgovInfo = useSelector((state: AppState) => state.locgovInfo)
  const dispatch = useDispatch()

  const reduxString = 'ctpvCd$sggCd$ctpvNm$locgovNm$locgovCd'

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovNm: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
      locgovNm: '',
    })
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  useEffect(() => {
    if (locgovInfo.LgmModalOpen) {
      setInitialState() // 초기 상태 설정
      dispatch(clearLocgovInfo())
      fetchData()
    }
  }, [locgovInfo.LgmModalOpen])

  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  const handleReturnData = (row: any) => {
    const obj: { [key: string]: string } = {}
    reduxString.split('$').forEach((value: string, index: number) => {
      obj[`${value}LGM`] = row[`${value}`]
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
    dispatch(setLocgovInfo(obj))
  }

  const handleReturnDataAndClose = (row: any) => {
    handleReturnData(row)
    dispatch(closeLocgovModal())
  }

  const handleClickClose = () => {
    setInitialState()
    dispatch(closeLocgovModal())
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/ltmm/tr/pop/getLocgovInfo?page=${params.page}&size=${params.size}` +
        `${params.locgovNm ? '&locgovNm=' + params.locgovNm : ''}`

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
      setFlag(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
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
        fullWidth={true}
        maxWidth={'md'}
        open={locgovInfo.LgmModalOpen}
        onClose={() => handleClickClose()}
      >
        {/* 모달 상단부분 시작 */}
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지자체 조회</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation() // 이벤트 버블링 방지
                  event.preventDefault()
                  fetchData()
                }}
              >
                검색
              </Button>

              <Button
                variant="contained"
                color="dark"
                onClick={() => handleClickClose()}
              >
                취소
              </Button>
            </div>
          </Box>

          {/* 모달 상단부분 종료 */}
          {/* 모달 조회조건 시작 */}
          <Box component="form" onSubmit={() => {}} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 지자체명 조회조건 */}
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                    htmlFor="ft-locgovNm"
                  >
                    지자체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-locgovNm"
                    name="locgovNm"
                    value={params.locgovNm}
                    onChange={handleSearchChange}
                    onKeyDown={(
                      event: React.KeyboardEvent<HTMLInputElement>,
                    ) => {
                      if (event.key === 'Enter') {
                        event.stopPropagation() // 이벤트 버블링 방지
                        event.preventDefault()
                        fetchData()
                      }
                    }}
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 모달 조회조건 종료 */}
          <Box>
            <TableDataGrid
              headCells={localSearchHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={(row) => handleReturnDataAndClose(row)} // 행 클릭 핸들러 추가
              onRowDoubleClick={(row) => handleReturnDataAndClose(row)}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              caption={"관할관청 목록 조회"}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
})

export { LocalSearchModal }
