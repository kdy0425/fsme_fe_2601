import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { useEffect, useLayoutEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { Pageable2 } from 'table'
import { SetlAprvPopupHC } from '@/utils/fsms/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { closeSetledAprvModal } from '@/store/popup/SetledAprvInfoSlice'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { dateTimeFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
interface SetledAprvSearchRow {
  stlmCardNo: string
  stlmCardAprvYmdTm: string
  stlmCardAprvNo: string
  cardNoSecure: string
  stlmCardNoSecure: string
  stlmCardNoS: string
  aprvYmdTm: string
  aprvNo: string
  orgAprvAmt: string
  aprvAmt: string
  useLiter: string
  asstAmt: string
  asstAmtLiter: string
  aprvGb: string
  vhclNo: string
  vonrNm: string
  frcsNo: string
  frcsNm: string
}

type listSearchObj = {
  vhclNo: string
  stlmCardNo: string
  stlmCardAprvNo: string
  stlmCardNoS: string
  stlmCardNoSecure: string
  page: number
  size: number
  [key: string]: string | number
}

interface ModalProperties {
  searchParam: listSearchObj
}

const SetledAprvModal = (props: ModalProperties) => {
  const { searchParam } = props; // 호출부에서 넘겨 줄 검색 파라미터
  
  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<SetledAprvSearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [params, setParams] = useState<listSearchObj>({
    stlmCardNo: '',
    stlmCardNoS: '',
    stlmCardNoSecure: '',
    stlmCardAprvNo: '',
    vhclNo: '',
    crdcoCd: '',
    page: 1,
    size: 10,
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const setlAprvInfo = useSelector((state: AppState) => state.setledAprvInfo)
  const dispatch = useDispatch()

  useEffect(() => {
    setParams(searchParam);
  }, [searchParam])

  useEffect(() => {
    if(flag != null){
      fetchData();
    }
  }, [flag])

  useEffect(() => {
    if (setlAprvInfo.scaimModalOpen) {
      //setInitialState()
      fetchData()
    }
  }, [setlAprvInfo.scaimModalOpen])

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  const handleClose = () => {
    dispatch(closeSetledAprvModal())
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/fdd/tr/getAllSetledCrdtDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.stlmCardNoS ? '&cardNo=' + params.stlmCardNoS : ''}` +
        `${params.stlmCardAprvNo ? '&aprvNo=' + params.stlmCardAprvNo : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        console.log(response.data.content)
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
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      alert(error)
      setInitialState()
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  const excelDownload = async () => {
    if(rows.length == 0){
      alert('저장할 엑셀 데이터가 없습니다.');
      return
    }
    setLoadingBackdrop(true)
    try {
      let endpoint: string =
        `/fsm/apv/fdd/tr/getExcelSetledCrdtDelngDtls?` +
        `${params.stlmCardNoS ? '&cardNo=' + params.stlmCardNoS : ''}` +
        `${params.stlmCardAprvNo ? '&aprvNo=' + params.stlmCardAprvNo : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}`
        await getExcelFile(endpoint, '결제된 외상거래내역_' + getToday() + '.xlsx')
    } catch (error) {
      alert(error)
    } finally{
      setLoadingBackdrop(false)
    }
  }


  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
    console.log('handlePaginationModelChange useeffect')
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={setlAprvInfo.scaimModalOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>결제된 외상거래 내역</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <LoadingBackdrop open={loadingBackdrop} />
              <Button variant="contained" color="primary" onClick={handleClose}>
                취소
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={excelDownload}
              >
                엑셀
              </Button>
            </div>
          </Box>
          {/* 모달 조회조건 시작 */}
          <Box component="form" onSubmit={() => {}} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel htmlFor="sch-vhclNo" className="input-label-display">
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    id="sch-vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="sch-cardNoSecure" className="input-label-display">
                    결제카드번호
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    id="sch-cardNoSecure"
                    name="cardNoSecure"
                    value={params.stlmCardNoSecure}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="sch-aprvYmdTm" className="input-label-display">
                    결제일시
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    id="sch-aprvYmdTm"
                    name="aprvYmdTm"
                    value={
                      getDateTimeString(String(params.aprvYmdTm), 'date')?.dateString
                      + " " 
                      + getDateTimeString(String(params.aprvYmdTm), 'time')?.timeString
                    }
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="sch-aprvNo" className="input-label-display">
                    승인번호
                  </CustomFormLabel>
                  <CustomTextField disabled id="sch-aprvNo" name="aprvNo" value={params.stlmCardAprvNo} />
                </div>
              </div>
            </Box>
          </Box>
          {/* 모달 조회조건 종료 */}
          <Box>
            <TableDataGrid
              headCells={SetlAprvPopupHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={rows.length} // 총 로우 수
              loading={loading} // 로딩여부
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={false}
              onPaginationModelChange={handlePaginationModelChange}
              caption={"결제된 외상거래 내역 조회 목록"}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default SetledAprvModal
