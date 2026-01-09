import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { Pageable2 } from 'table'
import { useCallback, useEffect, useState } from 'react'
import { localSearchHC } from '@/utils/fsms/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useDispatch, useSelector } from '@/store/hooks'
import { closeLgovTrfntfModal } from '@/store/popup/LgovTrfntfSlice'
import { AppState } from '@/store/store'
import { Row } from '@/app/(admin)/ilg/lpav/page'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import { usePathname } from 'next/navigation'
import { callRefetch, useIlgSelectors } from '@/types/fsms/common/ilgData'

interface LocalSearchRow {
  ctpvCd: string
  sggCd: string
  ctpvNm: string
  locgovNm: string
  locgovCd: string
}

interface LocalSelectRow {
  ctpvCd: string
  ctpvNm: string
  locgovCd: string
  locgovNm: string
}

type listSearchObj = {
  page: number
  size: number
  locgovNm: string
  trnsfRsnCn: string
  [key: string]: string | number
}

const LgovTrfntfModal = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<LocalSearchRow[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(-1)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovNm: '',
    trnsfRsnCn: '',
  })

  const [localParams, setLocalParams] = useState<LocalSelectRow>({
    ctpvCd: '',
    ctpvNm: '',
    locgovCd: '',
    locgovNm: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const dispatch = useDispatch()
  const lgovTrfntfInfo = useSelector((state: AppState) => state.LgovTrfntfInfo)
  const {
    lpavInfo,
    shlInfo,
    dmalInfo,
    tcelInfo,
    taavelInfo,
    dvhalInfo,
    nblInfo,
    ddalInfo,
  } = useIlgSelectors()

  const pathname = usePathname()

  const pageUrl = pathname.split('/')[2]

  useEffect(() => {
    if (lgovTrfntfInfo.ltModalOpen) {
      setInitialState()
    }
  }, [lgovTrfntfInfo.ltModalOpen])

  useEffect(() => {
    if (params.locgovNm && lgovTrfntfInfo.ltModalOpen) {
      fetchData()
    }
  }, [flag])

  const setInitialState = () => {
    setRows([])
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
      locgovNm: '',
      trnsfRsnCn: '',
    })
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.locgovNm) {
        alert('지자체명을 입력해주세요')
        return
      }

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

  const requestLgovTrfntf = async () => {
    if(!params.trnsfRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('이첩사유는 필수사항입니다.')
      return false
    }

    if(params.trnsfRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
      alert('이첩사유를 30자리 이하로 입력해주시기 바랍니다.')
      return false
    }

    if (selectedIndex == -1) {
      alert('이첩 요청하려는 지자체를 선택해주세요')
      return
    }

    try {
      const body = getHandleDateByUrl().map((value: Row, index: number) => {
        return {
          exmnNo: value.exmnNo,
          mvinLocgovCd: localParams.locgovCd,
          mvoutLocgovCd: value.locgovCd,
          trnsfRsnCn: params.trnsfRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
          vhclNo: value.vhclNo,
          vonrNm: value.vonrNm,
          vonrBrno: value.vonrBrno,
          aprvYymm: null,
        }
      })

      setIsDataProcessing(true)

      let endpoint: string = `/fsm${pathname}/tr/insertLgovTrfntf`

      const response = await sendHttpRequest(
        'POST',
        endpoint,
        { list: body },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        dispatch(closeLgovTrfntfModal())
        callRefetch(pageUrl, dispatch) //공통 재 조회 호출함수
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  const getHandleDateByUrl = (): any[] => {
    const url = pageUrl //lpav, shl, dmal...
    switch (url) {
      case 'lpav':
        return lpavInfo.lpavSelectedData
      case 'shl':
        return shlInfo.shlSelectedData
      case 'dmal':
        return dmalInfo.dmalSelectedData
      case 'tcel':
        return tcelInfo.tcelSelectedData
      case 'taavel':
        return taavelInfo.taavelSelectedData
      case 'dvhal':
        return dvhalInfo.dvhalSelectedData
      case 'nbl':
        return nblInfo.nblSelectedData
      case 'ddal':
        return ddalInfo.ddalSelectedData
      default:
        return []
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

  const handleClickClose = () => {
    setInitialState()
    dispatch(closeLgovTrfntfModal())
  }

  const handleReturnData = (row: any, rowIndex?: number) => {
    setSelectedIndex(rowIndex)
    const { ctpvCd, ctpvNm, locgovCd, locgovNm } = row
    setLocalParams({ ctpvCd, ctpvNm, locgovCd, locgovNm })
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={lgovTrfntfInfo.ltModalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return
          }
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지자체 변경</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                조회
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={requestLgovTrfntf}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClickClose()}
              >
                닫기
              </Button>
            </div>
          </Box>
          {/* 모달 상단부분 종료 */}
          {/* 모달 조회조건 시작 */}
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault()
              fetchData()
            }}
            sx={{ mb: 2 }}
          >
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 지자체명 조회조건 */}
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-locgovNm"
                    required={true}
                  >
                    지자체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-locgovNm"
                    name="locgovNm"
                    value={params.locgovNm}
                    onChange={handleSearchChange}
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
              //   totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              selectedRowIndex={selectedIndex}
              onRowClick={useCallback(
                (row: any, rowIndex?: number) =>
                  handleReturnData(row, rowIndex),
                [],
              )}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
            />
          </Box>
          <div className="form-group" style={{ marginTop: 10, width: '100%' }}>
            <CustomFormLabel className="input-label-display" htmlFor="ft-trnsfRsnCn" required={true}>
              이첩사유
            </CustomFormLabel>
            <CustomTextField
              id="ft-transfRsnCn"
              name="trnsfRsnCn"
              value={params.trnsfRsnCn}
              onChange={handleSearchChange}
              fullWidth
            />
          </div>
          <LoadingBackdrop open={isDataProcessing} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default LgovTrfntfModal
