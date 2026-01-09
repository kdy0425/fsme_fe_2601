import { formBrno } from '@/utils/fsms/common/convert'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { HeadCell, Pageable2 } from 'table'
import React, { useEffect, useState, useCallback } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { brNoFormatter, formatKorYearMonth } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const headCells: HeadCell[] = [
  {
    id: 'rn',
    numeric: false,
    disablePadding: false,
    label: 'No',
  },
  {
    id: 'dlngDt',
    numeric: false,
    disablePadding: false,
    label: '거래일시',
    format: 'yyyymmddhh24miss',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'cnptSeNm',
    numeric: false,
    disablePadding: false,
    label: '거래구분',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'cardNo',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'stlmAprvYmd',
    numeric: false,
    disablePadding: false,
    label: '결제일자',
    format: 'yyyymmdd',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'ftxAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'opisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'fuelQty',
    numeric: false,
    disablePadding: false,
    label: '연료량',
    format: 'lit',
    align: 'td-right',
  },
]

//const [loading, setLoading] = useState(false) // 로딩여부

export interface Row {
  dlngYm?: string // 거래년월                     // 모달 헤더에서 사용됨.
  locgovNm?: string // 지자체명                   // 모달 헤더에서 사용됨.
  locgovCd?: string // 지자체코드
  brno?: string // 사업자번호                     // 모달 헤더에서 사용됨.
  bzentyNm?: string // 업체명
  vhclSeNm?: string // 면허업종
  koiNm?: string // 유종
  lbrctStleNm?: string // 주유형태
  dlngNocs?: string // 거래건수?
  aprvAmt?: string // 거래건수?
  fuelQty?: string // 주유/충전량
  asstAmt?: string // 보조금
  ftxAsstAmt?: string // 유류세연동보조금
  opisAmt?: string // 유가연동보조금

  vhclSeCd?: string
  koiCd?: string // 유종
  lbrctStleCd?: string
  cardNo?: any // 카드번호
  setlApvlYmd?: any // ?
  stlmAprvYmd?: any // ?
  vhclNo?: any // 차량번호
  dlngDt?: any // ?
  cnptSeCd?: any // ?

  cnptSeNm?: any // ?
}

export interface VhclHistoryRow {
  hstrySn: string
  mdfcnDt: string
  locgovNm: string
  vhclSttsNm: string
  koiNm: string
  vhclSeNm: string
  dscntYnNm: string
  rfidNm: string
}

interface ApvDetailModalProps {
  title: string
  open: boolean
  handleOpen: () => void
  handleClose: () => void
  selectedRow: Row | undefined
  modalRow: Row[]
  size?: DialogProps['maxWidth']
  dlngYm?: string // 거래년월
  locgovNm?: string // 지자체명
  brno?: string // 사업자번호
}

const ApvDetailModal = (props: ApvDetailModalProps) => {
  const {
    open,
    title,
    handleOpen,
    handleClose,
    selectedRow,
    size,
    modalRow,
    dlngYm,
    locgovNm,
    brno,
  } = props

  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // "-" 제거하고 반환
    return dateString.replace('-', '')
  }

  const excelDownload = async (selectedRow: Row | undefined) => {
    if (selectedRow == undefined) {
      alert('액셀파일을 다운로드할 데이터가 없습니다.')
      return
    }
    setIsExcelProcessing(true)
    try {
      let endpoint: string =
        `/fsm/apv/bds/bs/getExcelByenDelngSttusDtl?` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${selectedRow.brno ? '&brno=' + selectedRow.brno : ''}` +
        `${selectedRow.dlngYm ? '&dlngYm=' + formatDate(selectedRow.dlngYm) : ''}` +
        `${selectedRow.vhclSeCd ? '&vhclSeCd=' + selectedRow.vhclSeCd : ''}` +
        `${selectedRow.koiCd ? '&' + 'koiCd' + '=' + selectedRow.koiCd : ''}` +
        `${selectedRow.lbrctStleCd ? '&lbrctStleCd=' + selectedRow.lbrctStleCd : ''}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '거래상세내역.xlsx')
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
    setIsExcelProcessing(false)
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent style={{ minHeight: '500px' }}>
          <Box className="table-bottom-button-group" sx={{ mb: 2 }}>
            <h3>{title}</h3>
            <div className="button-right-align">
              <Button onClick={handleClose} variant="contained" color="dark">
                취소
              </Button>
              <Button
                onClick={() => excelDownload(selectedRow)}
                variant="contained"
                type="submit"
                form="form-modal"
                color="success"
              >
                엑셀
              </Button>
            </div>
          </Box>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel htmlFor="ft-dlngYm" className="input-label-display">
                  거래년월
                </CustomFormLabel>
                <CustomTextField
                  name="dlngYm"
                  id="ft-dlngYm"
                  value={formatKorYearMonth(dlngYm ?? '')}
                  disabled
                  type="text"
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel htmlFor="ft-brno" className="input-label-display">
                  사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  name="brno"
                  id="ft-brno"
                  value={brNoFormatter(brno ?? '')}
                  disabled
                  type="text"
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel htmlFor="ft-locgovNm" className="input-label-display">
                  지자체명
                </CustomFormLabel>
                <CustomTextField
                  name="locgovNm"
                  id="ft-locgovNm"
                  value={locgovNm ?? ''}
                  disabled
                  type="text"
                  fullWidth
                />
              </div>
            </div>
          </Box>
          <br></br>
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={modalRow} // 목록 데이터
            loading={false} // 로딩여부
            paging={false}
            caption={"거래내역 상세 조회 목록"}
          />
        <LoadingBackdrop open={isExcelProcessing} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ApvDetailModal
