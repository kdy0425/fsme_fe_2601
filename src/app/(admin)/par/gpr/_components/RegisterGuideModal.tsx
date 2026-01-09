import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  sendHttpRequest,
  sendSingleMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  RadioGroup,
} from '@mui/material'
import { useEffect, useState } from 'react'
import ModalContent from './ModalContent'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { parGprUploadResultTrHeadCells } from '@/utils/fsms/headCells'
import { StatusType } from '@/types/message'

export interface ExcelRow {
  locgovCd: string
  vhclNo: string
  clclnYm: string
  koiCd: string
  vhclTonCd: string
  useLiter: number
  drvngDstnc: number | null
  tclmAmt: number
  tclmLiter: number
  vhclPsnCd: string
  crno: string
  vonrBrno: string
  vonrNm: string
  prcsSttsCd: string
  vonrRrno: string
  docmntAplyRsnCn: string
  bankCd: string
  actno: string
  dpstrNm: string
}

interface ModalProps {
  remoteFlag: boolean
  closeHandler: () => void
  reload: () => void
}

const RegisterGuideModal = (props: ModalProps) => {
  const { remoteFlag, closeHandler, reload } = props

  const [open, setOpen] = useState<boolean>(false)
  const [registerType, setRegisterType] = useState<string>('A') // 초기값을 설정
  const [showNextModal, setShowNextModal] = useState<boolean>(false)
  const [isBlock, setIsBlock] = useState<boolean>(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null) // 업로드된 파일 상태
  const [rows, setRows] = useState<ExcelRow[]>([]) // 업로드된 파일 상태
  const [loading, setLoading] = useState<boolean>(false)
  const [excelLoading, setExcelLoading] = useState<boolean>(false)

  const createExcelFileToRow = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.')
      return
    }
    try {
      setLoading(true)
      setIsBlock(false)

      const endpoint = `/fsm/par/gpr/tr/getExcelUploadGnrlPapersReqst` // 서버의 파일 업로드 엔드포인트
      const response = await sendSingleMultipartFormDataRequest(
        'POST',
        endpoint,
        {},
        selectedFile,
        true,
      )

      if (response && response.resultType === 'success' && response.data) {
        const responseData = response.data.map((item: any) => {
          item.validKnd === 'R' ? setIsBlock(true) : '' // R일 경우 저장못하는 flag

          return {
            ...item,
            color:
              item.validKnd === 'R'
                ? 'red'
                : item.validKnd === 'B'
                  ? 'blue'
                  : 'black',
          }
        })
        setRows(responseData)
      } else {
        // alert('등록에 실패했습니다. 다시 시도하세요.')
        alert(response.message)
      }
    } catch (error: StatusType | any) {
      console.error('Error uploading file:', error)
      alert(error.errors[0].reason)
    } finally {
      setLoading(false)
    }
  }

  const createTrnsBatchfrnRequ = async () => {
    try {
      if (isBlock) return

      // 엑셀업로드 등록에서는 정산요청상태로 저장
      const userConfirm = confirm('입력한 서면신청정보에 대한 [보조금정산]을 요청하시겠습니까?')

      let endpoint: string = `/fsm/par/gpr/tr/createExcelUploadGnrlPapersReqst`

      if (rows.length <= 0) {
        alert('입력될 정보가 없습니다. 엑셀 파일을 업로드 하세요')
        return
      } else {
        let reqList: ExcelRow[] = []

        rows.map((row) => {
          reqList.push({
            locgovCd: row.locgovCd,
            vhclNo: row.vhclNo,
            clclnYm: row.clclnYm.replaceAll('-', ''),
            koiCd: row.koiCd,
            vhclTonCd: row.vhclTonCd,
            useLiter: row.useLiter,
            drvngDstnc: row.drvngDstnc,
            tclmAmt: row.tclmAmt ?? 0,
            tclmLiter: row.tclmLiter ?? 0,
            vhclPsnCd: row.vhclPsnCd,
            crno: row.crno,
            vonrBrno: row.vonrBrno,
            vonrNm: row.vonrNm,
            prcsSttsCd: '02',
            vonrRrno: row.vonrRrno,
            docmntAplyRsnCn: row.docmntAplyRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
            bankCd: row.bankCd,
            actno: row.actno,
            dpstrNm: row.dpstrNm,
          })
        })

        // HTTP 요청 전송
        const response = await sendHttpRequest(
          'POST',
          endpoint,
          {
            reqList: reqList,
          },
          true,
          {
            cache: 'no-store',
          },
        )

        // 응답 처리
        if (response && response.resultType === 'success') {
          alert(response.message)
          setRows([])
          listReload()
        } else {
          alert(response.message)
        }
      }
    } catch (error: StatusType | any) {
      console.error('ERROR :: ', error)
      alert(error.errors[0].reason)
    }
  }

  const excelDownload = async () => {
    const endpoint = `/fsm/par/gpr/tr/getDownloadExcelSample`

    try {
      setExcelLoading(true)
      await getExcelFile(endpoint, `서면신청(일반)_샘플파일_${getToday()}.xlsx`)

      setExcelLoading(false)
    } catch (error) {
      alert(error)
    }
  }

  useEffect(() => {
    // 선택된 파일이 있을 경우 실행되는 명령이다.
    if (!selectedFile) {
      return
    }
    createExcelFileToRow()
  }, [selectedFile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      alert('파일을 선택해주세요.')
      return
    }

    setSelectedFile(file) // 파일 객체 저장
    // 파일 선택 초기화 (같은 파일 재선택 가능하도록)
    event.target.value = ''
  }

  useEffect(() => {
    setOpen(remoteFlag)
  }, [remoteFlag])

  const handleClose = () => {
    setRows([])
    setOpen(false)
    closeHandler()
  }

  // 창을 선택하는 라디오 동작
  const handleRadio = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { value } = event.target
    setRegisterType(value)
  }

  // 다음 모달 오픈
  const openNextModal = () => {
    setShowNextModal(true)
  }

  const closeNextModal = () => {
    handleClose()
    setShowNextModal(false)
  }

  const listReload = () => {
    closeNextModal()
    reload()
  }

  // 등록 안내문 텍스트
  const guideText = () => {
    return (
      `※ 외상거래카드를 사용한 차주가 주유소 폐업/카드 말소 등의 사유로 서면신청하는 경우\n` +
      `  - 미결로 남아있는 외상거래카드 주유내역이 잔여한도리터를 차감하고 있기 때문에 미결내역삭제 요청을 하고,\n` +
      `  삭제를 확인한 후 서면신청 등록\n` +
      `  - 미결내역삭제 요청은 업무지원 > 커뮤니티 > 자료실 44802번 게시글의 예시공문을 참고하여 트라이언소프트(주)\n` +
      `  Fax 02-3444-6329 로 발송\n` +
      `\n` +
      `※ 정산리터/금액이 상이한 경우\n` +
      `  - 서면신청한 월에 유류구매카드를 발급승인하면서 입력한 허가일을 기준으로 일할계산 된 잔여한도리터에서 현재 차주가 해당 월에\n` +
      `  카드를 사용해 보조받은 리터량을 제외하고 남은 부분만 정산되었을 수 있음\n` +
      `  - 일할계산 된 잔여한도리터보다 전 차주가 남긴 잔여한도리터가 더 적다면, 전 차주가 남긴 잔여한도리터를 그대로 승계받게 되며\n` +
      `  승계된 잔여한도리터에서 현재 차주가 해당 월에 카드를 사용해 보조받은 리터량을 제외하고 남은 부분만 정산되었을 수 있음\n` +
      `\n` +
      `※ 서면신청 시 해당 신청월에 행정처분이 등록되어있는지 확인하고 등록` +
      `\n`
    )
  }

  return (
    <Box>
      <Dialog fullWidth={false} maxWidth={'lg'} open={open} aria-modal={true}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>등록방법 선택</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                type="button"
                color="primary"
                onClick={openNextModal}
              >
                다음
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              border: '1px solid #d3d3d3',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <pre>{guideText()}</pre>
          </Box>
          <Box
            sx={{
              border: '1px solid #d3d3d3',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <RadioGroup
              name="useYn"
              onChange={handleRadio}
              value={registerType} // 상태 변수를 value로 설정
              className="mui-custom-radio-group"
            >
              <FormControlLabel
                label="서면신청 단건등록"
                value="A"
                control={<CustomRadio />}
              />
              <FormControlLabel
                label="서면신청 일괄등록"
                value="B"
                control={<CustomRadio />}
              />
            </RadioGroup>
          </Box>
        </DialogContent>
        {registerType === 'A' ? (
          <FormModal
            buttonLabel=""
            formLabel="저장"
            formId="register-data"
            remoteFlag={showNextModal}
            closeHandler={closeNextModal}
            title="서면신청 단건등록"
            size="xl"
          >
            <ModalContent formType="CREATE" data={null} reload={listReload} />
          </FormModal>
        ) : (
          <FormModal
            buttonLabel=""
            submitBtn={false}
            remoteFlag={showNextModal}
            closeHandler={closeNextModal}
            title="서면신청등록"
            size="xl"
            btnSet={
              <>
                <Button
                  variant="contained"
                  type="button"
                  color="primary"
                  onClick={excelDownload}
                >
                  샘플파일 다운로드
                </Button>
                <label htmlFor="file-upload">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <Button variant="contained" component="span" color="primary">
                    엑셀 업로드
                  </Button>
                </label>
                <Button
                  variant="contained"
                  type="button"
                  color="primary"
                  onClick={createTrnsBatchfrnRequ}
                  disabled={isBlock}
                >
                  저장
                </Button>
              </>
            }
          >
            <Box sx={{ width: '1200px', height: '800px', overflowY: 'auto' }}>
              <TableDataGrid
                headCells={parGprUploadResultTrHeadCells} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                totalRows={rows.length} // 총 로우 수
                loading={loading} // 로딩여부
                paging={false}
              />
            </Box>
            <LoadingBackdrop open={excelLoading} />
          </FormModal>
        )}
      </Dialog>
    </Box>
  )
}

export default RegisterGuideModal
