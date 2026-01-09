import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { useEffect, useState } from 'react'
import { Pageable2 } from 'table'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { SetlCardAprvPopupHC } from '@/utils/fsms/headCells'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { closeSetlCardAprvModal } from '@/store/popup/SetlCardAprvSlice'
import { dateTimeFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
interface SetlCardAprvSearchRow {
  stlmCardNoSecure: string
  stlmCardAprvYmd: string
  stlmCardAprvTm: string
  stlmCardAprvYmdTm: string
  stlmCardAprvNo: string
  cardNoSecure: string
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
  frcsNm: string
}

type listSearchObj = {
  crdcoCd: string
  cardNo: string
  cardNoSecure: string
  cardNoS: string
  aprvNo: string
  aprvYmd: string
  aprvTm: string
  page: number
  size: number
  [key: string]: string | number
}

interface ModalProperties {
  searchParams: listSearchObj
}

const SetlCardAprvModal = (props: ModalProperties) => {
  const { searchParams } = props;

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<SetlCardAprvSearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [params, setParams] = useState<listSearchObj>({
    crdcoCd: '',
    cardNo: '',
    cardNoSecure: '',
    cardNoS: '',
    aprvNo: '',
    aprvYmd: '',
    aprvTm: '',
    page: 1,
    size: 10,
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const setlCardAprvInfo = useSelector(
    (state: AppState) => state.setlCardAprvInfo,
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if(searchParams) {
      setParams(searchParams);
      console.log(searchParams)
    }
  }, [searchParams])

  useEffect(() => {
    if(flag != null){
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (setlCardAprvInfo.sraimModalOpen) {
      console.log('1 ',searchParams)
      console.log('2 ', params)
      fetchData()
    }
  }, [setlCardAprvInfo.sraimModalOpen])

  const handleClose = () => {
    dispatch(closeSetlCardAprvModal())
  }

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
         `/fsm/apv/fdd/tr/getAllSetleCardDtls?page=${params.page}&size=${params.size}` +
        //`/fsm/apv/fdd/tr/getAllSetleCardDtls?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.cardNoS ? '&cardNo=' + params.cardNoS : ''}` +
        `${params.aprvNo ? '&aprvNo=' + params.aprvNo : ''}` +
        `${params.aprvYmd ? '&aprvYmd=' + params.aprvYmd : ''}` +
        `${params.aprvTm ? '&aprvTm=' + params.aprvTm : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      console.log(endpoint)
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
        `/fsm/apv/fdd/tr/getExcelSetleCardDtls?` +
        `${params.cardNoS ? '&cardNo=' + params.cardNoS : ''}` +
        `${params.aprvNo ? '&aprvNo=' + params.aprvNo : ''}` +
        `${params.aprvYmd ? '&aprvYmd=' + params.aprvYmd : ''}` +
        `${params.aprvTm ? '&aprvTm=' + params.aprvTm : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}`

      await getExcelFile(endpoint, '결제카드내역_' + getToday() + '.xlsx')
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
    //fetchData()
    setFlag(!flag)
    console.log('handlePaginationModelChange useeffect')
  }


  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={setlCardAprvInfo.sraimModalOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>결제거래 내역</h2>
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
                    거래카드번호
                  </CustomFormLabel>
                  <CustomTextField
                    disabled
                    id="sch-cardNoSecure"
                    name="cardNoSecure"
                    value={params.cardNoSecure}
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
                      getDateTimeString(params.aprvYmd, 'date')?.dateString
                      + " " 
                      + getDateTimeString(params.aprvTm, 'time')?.timeString
                    }
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="sch-aprvNo" lassName="input-label-display">
                    승인번호
                  </CustomFormLabel>
                  <CustomTextField disabled id="sch-aprvNo" name="aprvNo" value={params.aprvNo} />
                </div>
              </div>
            </Box>
          </Box>
          {/* 모달 조회조건 종료 */}
          <Box>
            <TableDataGrid
              headCells={SetlCardAprvPopupHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={rows.length} // 총 로우 수
              loading={loading} // 로딩여부
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={false}
              onPaginationModelChange={handlePaginationModelChange}
              caption={"결제거래내역 조회 목록"}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default SetlCardAprvModal
