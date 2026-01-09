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
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { brNoFormatter,formatDay,formatTm } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// 카드결제내역 내 headcells
const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'dlngDt',
    numeric: false,
    disablePadding: false,
    label: '거래일시',
    format: 'yyyymmddhh24miss',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardNo',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '주유소명',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '거래유종',
  },
  {
    id: 'lbrctStleNm',
    numeric: false,
    disablePadding: false,
    label: '주유형태',
  },
  {
    id: 'fuelQty',
    numeric: false,
    disablePadding: false,
    label: '연료량',
    format: 'lit',
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금',
    format: 'number',
  },
  {
    id: 'ftxAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세연동보조금',
    format: 'number',
  },
  {
    id: 'opisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금',
    format: 'number',
  },
]

//const [loading, setLoading] = useState(false) // 로딩여부



export interface Row {
  dlngDt: string;
  dlngYmd: string;
  brno: string;
  vhclNo: string;
  cardNoEncpt: string;
  cardNo: string;
  asstAmtClclnCd: string;
  frcsNm: string;
  aprvAmt: number;
  fuelQty: number;
  asstAmt: number;
  ftxAsstAmt: number;
  opisAmt: string;
  aprvNo: string;
  imgRecog1VhclNo: string;
  imgRecog2VhclNo: string;
  vcf: string;
  crctBfeFuelQty: string;
  asstAmtClclnNm: string;
  locgovNm: string;
  bzentyNm: string;
  dlngSeNm: string;
  stlmNm: string;
  lbrctStleNm: string;
  koiNm: string;
  vhclSeNm: string;
  cnptSeNm: string;
  cardSeNm: string;
  crdcoNm: string;
  unsetlAmt: string;
  prttnYn: string;
  prttnNm: string;
  stlmAprvNo: string;
  stlmCardNoEncpt: string;
  koiCd: string;
  stlmAprvYmd: string;
  stlmAprvTm: string;
}

interface ApvDetailModalProps {
  title: string
  open: boolean
  handleOpen: () => void
  handleClose: () => void
  selectedRow: Row|undefined
  modalRow:Row[]
  size?: DialogProps['maxWidth']
  stlmAprvYmd?: string // 승인일자
  stlmAprvTm?: string // 승인시간
  stlmCardNo?: string // 카드번호  
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
    stlmAprvYmd,
    stlmAprvTm,
    stlmCardNo
  } = props

  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  function formatDate(dateString:string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // "-" 제거하고 반환
    return dateString.replace("-", "");
  }

  const excelDownload = async (selectedRow:Row | undefined) => {

    if(modalRow.length == 0){
      alert('액셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }
    setIsExcelProcessing(true)
    try {
      let endpoint: string =
      `/fsm/apv/bdd/bs/getExcelBusStlmDtls?` + 
      `&cardNo=${selectedRow?.cardNoEncpt}`+
      `&aprvNo=${selectedRow?.aprvNo}`+
      `&stlmAprvNo=${selectedRow?.stlmAprvNo}`+
      `&stlmCardNoEncpt=${selectedRow?.stlmCardNoEncpt}`+
      `&koiCd=${selectedRow?.koiCd}`+
      `&dlngYmd=${selectedRow?.stlmAprvYmd}`;
      

        const response = await sendHttpFileRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '카드결제내역.xlsx');
      document.body.appendChild(link);
      link.click();
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
        <DialogContent>
          <Box className="table-bottom-button-group" sx={{ mb: 2 }}>
            <h3>{title}</h3>
            <div className="button-right-align">
              <Button onClick={handleClose} variant="contained" color="dark">취소</Button>
              <Button onClick={() => excelDownload(selectedRow)} variant="contained" type="submit" form="form-modal" color="success">
                엑셀
              </Button>
            </div>

          </Box>
          <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel htmlFor="ft-dlngYmd" className="input-label-display">
                    승인일자
                  </CustomFormLabel>
                  <CustomTextField
                    name="dlngYmd"
                    id="ft-dlngYmd"
                    value={formatDay(stlmAprvYmd ?? '')}
                    disabled
                    type="text"
                    fullWidth
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="ft-dlngTm" className="input-label-display">
                    승인시간
                  </CustomFormLabel>
                  <CustomTextField
                    name="dlngTm"
                    id="ft-dlngTm"
                    value={formatTm(stlmAprvTm ?? '')}
                    disabled
                    type="text"
                    fullWidth
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="ft-stlmCardNo" className="input-label-display">
                    결제카드번호
                  </CustomFormLabel>
                  <CustomTextField
                    name="stlmCardNo"
                    id="ft-stlmCardNo"
                    value={stlmCardNo ?? ''}
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
              caption={"카드결제내역 목록 조회"}
            />
        <LoadingBackdrop open={isExcelProcessing} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ApvDetailModal
