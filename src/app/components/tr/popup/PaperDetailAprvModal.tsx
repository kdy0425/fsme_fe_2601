import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { useEffect, useState } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { PaperDetailAprvPopupHC } from '@/utils/fsms/headCells'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { closePaperDetailAprvModal } from '@/store/popup/PaperDetailAprvSlice'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'

interface PaperDetailAprvSearchRow {
  vhclNo: string
  vonrNm: string
  crdcoCd: string
  crdcoNm: string
  cardNoSc: string
  aprvYmd: string
  aprvTm: string
  aprvYmdTm: string
  aprvNo: string
  aprvYn: string
  stlmYn: string
  aprvAmt: string
  useLiter: string
  asstAmt: string
  asstAmtLiter: string
  unsetlLiter: string
  unsetlAmt: string
  frcsNm: string
  frcsCdNo: string
  cardSeCd: string
  cardSeNm: string
  cardSttsCd: string
  cardSttsNm: string
  stlmCardNo: string
  stlmAprvNo: string
  ceckStlmYn: string
  origTrauTm: string
  origTrauYmdTm: string
  colorGb: string
  subsGb: string
}

type listSearchObj = {
  vhclNo: string
  aprvYm: string
  page: number
  size: number
  [key: string]: string | number
}

const PaperDetailAprvModal = () => {
  const [rows, setRows] = useState<PaperDetailAprvSearchRow[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelLoading, setExcelLoading] = useState<boolean>(false)
  const [params, setParams] = useState<listSearchObj>({
    vhclNo: '충북80아1304',
    aprvYm: '202408',
    page: 1,
    size: 10,
  })

  const paperDetailAprvInfo = useSelector(
    (state: AppState) => state.paperDetailAprvInfo,
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if (paperDetailAprvInfo.pdaModalOpen) {
      fetchData()
    }
  }, [paperDetailAprvInfo.pdaModalOpen])

  const getCellColor = (colorGb: string): string => {
    switch (colorGb) {
      case '일반':
        return '#000000'
      case '차감':
        return '#228B22'
      case '휴지':
        return '#ff1493'
      case '결제':
        return '#964b00'
      case '취소':
        return '#0000ff'
      case '탱크':
        return '#ffa500'
      case '미경과':
        return '#ffa500'
      default:
        return '#ffa500'
    }
  }

  const handleClose = () => {
    dispatch(closePaperDetailAprvModal())
  }

  const setInitialState = () => {
    setRows([])
  }

  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/par/gpr/tr/getAllDelngGnrlPapersReqst?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aprvYm ? '&aprvYm=' + params.aprvYm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        let { data } = response
        const datas = data.map((value: any, index: number) => {
          value.color = getCellColor(value['colorGb'])
          return value
        })
        setRows(datas)
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

  const excelDownload = async () => {
    try {
      setExcelLoading(true)

      let endpoint: string =
        `/fsm/par/gpr/tr/getDelngGnrlPaperExcel?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aprvYm ? '&aprvYm=' + params.aprvYm : ''}`

        await getExcelFile(endpoint, '카드거래 상세내역_' + getToday() + '.xlsx')
        setExcelLoading(false)

      } catch (error) {
      alert(error)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={paperDetailAprvInfo.pdaModalOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>카드거래 상세내역</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="dark" onClick={handleClose}>
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
          <Box>
            <TableDataGrid
              headCells={PaperDetailAprvPopupHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              paging={true}
            />
          </Box>
        </DialogContent>
        <LoadingBackdrop open={excelLoading} />
        
      </Dialog>
    </Box>
  )
}

export default PaperDetailAprvModal
