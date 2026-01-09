import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { useEffect, useLayoutEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { Pageable2 } from 'table'
import { RfIdHstryTrHeadCells, SetlAprvPopupHC } from '@/utils/fsms/headCells'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'

import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { dateTimeFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import { closeRfIdHistoryModal } from '@/store/popup/RfIdHistorySlice'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface SetledAprvSearchRow {
  vhclNo: string;
  aprvYmd: string;
  vonrNm: string;
  koiCdNm: string;
  vhclTonCdNm: string;
  vonrBrno: string;
  locgovNm: string;
  aprvAmt: string;
  useLiter: string;
  asstAmt: string;
  opisAmt: string;
  ftxAsstAmt: string;
  asstAmtLiter: string;
  rtroactYn: string;
  chk: string;
  retroactResult: string;
  prcsSeCd: string;
  aprvRtrcnYn: string;
  vonrRrno: string;
  locgovCd: string;
  crdcoCdNm: string;
  cardNo: string;
  cardNoS: string;
  cardNoSecure: string;
  crdcoCd: string;
  aprvTm: string;
  aprvYmdTm: string;
  aprvNo: string;
  aprvYn: string;
  stlmYn: string;
  unsetlLiter: string;
  unsetlAmt: string;
  frcsNm: string;
  frcsCdNo: string;
  cardSeCdNm: string;
  cardSeCd: string;
  cardSttsCdNm: string;
  stlmCardNo: string;
  stlmCardNoS: string;
  stlmAprvNo: string;
  ceckStlmYn: string;
  origTrauTm: string;
  origTrauYmdTm: string;
  asstAmtCmpttnSeNm: string;
  trsmYn: string;
  regDt: string;
  subGb: string;
  colorGb: string;
  lbrctYmd: string;
  stlmCardAprvYmd: string;
  stlmCardAprvTm: string;
  stlmCardAprvYmdTm: string;
  stlmCardAprvNo: string;
  orgAprvAmt: string;
  aprvGb: string;
}

type listSearchObj = {
  page: number
  size: number
  vhclNo: string
  aprvYmd: string
  [key: string]: string | number
}

interface ModalProperties {
  searchParam: listSearchObj
}

const RfIdHistoryModal = (props: ModalProperties) => {
  const { searchParam } = props; // 호출부에서 넘겨 줄 검색 파라미터
  
  const [open, setOpen] = useState<boolean>(false)
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<SetledAprvSearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    vhclNo: '',
    aprvYmd: '',
  })

  const rfIdHistoryInfo = useSelector((state: AppState) => state.rfIdHistoryInfo)
  const dispatch = useDispatch()

  useEffect(() => {
    setParams(searchParam);
  }, [searchParam])

  useEffect(()=>{
    // console.log(params)
  },[params])

  useEffect(() =>{
    if(flag != null){
      fetchData();
    }
  },[flag])


  useEffect(() => {
    if (rfIdHistoryInfo.rfIdModalOpen) {
      //setInitialState()
      // console.log(params);
      fetchData()

    }
  }, [rfIdHistoryInfo.rfIdModalOpen])

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
  }

  const handleClose = () => {
    dispatch(closeRfIdHistoryModal())
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
        `/fsm/apv/fdd/tr/getAllRfidDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aprvYmd ? '&aprvYmd=' + params.aprvYmd : ''}`
      //  console.log(endpoint)
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
        `/fsm/apv/fdd/tr/getExcelRfidDelngDtls?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aprvYmd ? '&aprvYmd=' + params.aprvYmd : ''}`

      await getExcelFile(endpoint, 'RFID주유내역_' + getToday() + '.xlsx')
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
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


  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={rfIdHistoryInfo.rfIdModalOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>RFID 주유내역</h2>
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
          {/* <Box component="form" onSubmit={() => {}} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    name="vhclNo"
                    value={params.vhclNo}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    결제카드번호
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    name="cardNo"
                    value={params.stlmCardNo}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    결제일시
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    name="aprvYmdTm"
                    value={
                      getDateTimeString(String(params.aprvYmdTm), 'date')?.dateString
                      + " " 
                      + getDateTimeString(String(params.aprvYmdTm), 'time')?.timeString
                    }
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    승인번호
                  </CustomFormLabel>
                  <CustomTextField disabled name="aprvNo" value={params.stlmCardAprvNo} />
                </div>
              </div>
            </Box>
          </Box> */}
          {/* 모달 조회조건 종료 */}
          <Box sx={{minHeight:'400px'}}>
            <TableDataGrid
              headCells={RfIdHstryTrHeadCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              // totalRows={rows.length} // 총 로우 수
              loading={loading} // 로딩여부
              paging={true}
              pageable={pageable} 
              onPaginationModelChange={handlePaginationModelChange}
              cursor
              caption={"RFID 주유내역 조회 목록"}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RfIdHistoryModal
