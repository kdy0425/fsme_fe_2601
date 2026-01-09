import React, { ReactNode, useContext, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import { getDateRange } from '@/utils/fsms/common/dateUtils'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 안분정보
export interface prpdvsInfo {
  crtrYm: string // 기준년도
  anlrveAmtNo?: string //비율번호
  ctpvCd: string //
  locgovCd: string //지자체코드
  rtSeqNo: string // 차수
  anlrveAmt: string // 안분액
  aplcnRt: string // 안분비율
}

// 신규 등록 모달창의 경우 당장에 받아야할 것들이 없음.
interface ModalFormProps {
  buttonLabel: string
  title: string
  size?: DialogProps['maxWidth'] | 'lg'
  reloadFunc: () => void
  data?: Row;
  // handleOpen?: () => any
  // handleClose?: () => any
}

const RegisterModalForm = (props: ModalFormProps) => {
  const { reloadFunc, data } = props

  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false)
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([]) // 시도 코드
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]) // 관할관청 코드

  const [content, setContent] = useState<string>('') // 저장 내용 상태

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const [params, setParams] = useState<prpdvsInfo>({
    crtrYm: data?.crtrYm.substring(0,4)+'-'+data?.crtrYm.substring(4,6),
    anlrveAmtNo: data?.anlrveAmtNo, //비율번호
    ctpvCd: '', //
    locgovCd: '', //지자체코드
    rtSeqNo: '', // 차수
    anlrveAmt: '', // 안분액
    aplcnRt: '', // 안분비율
  })

  const handleClose = () => {
    const dateRange = getDateRange('m', 0)

    setParams({
      crtrYm: dateRange.startDate,
      anlrveAmtNo: '', //비율번호
      ctpvCd: '', //
      locgovCd: '', //지자체코드
      rtSeqNo: '', // 차수
      anlrveAmt: '', // 안분액
      aplcnRt: '', // 안분비율
    })
    setOpen(false)
  }

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  // useEffect(() => {
  //   const dateRange = getDateRange('m', 0)
  //   setParams((prev) => ({
  //     ...prev,
  //     crtrYm: dateRange.startDate,
  //   }))
  // }, [])

  useEffect(() => {
    // console.log('open : ',open)
    // console.log('data : ',data)
    if(open && !data){
      // alert('세입정보 선택 이후 신규 등록이 가능 합니다.')
      // handleClose()
      const nowDate = new Date()
      let nowYear = nowDate.getFullYear() // 올 해 년수
      let nowMonth = nowDate.getMonth() // 올 해 년수
      setParams((prev) => ({ ...prev, anlrveAmtNo: nowYear+"-"+nowMonth }))
    }else if(open && data){
      // console.log('data : ',data)
      setParams((prev) => ({ ...prev, anlrveAmtNo: data.anlrveAmtNo, 
        crtrYm:data.crtrYm.substring(0,4)+'-'+data.crtrYm.substring(4,6) }))
      // console.log('params : ',params)
    }
  }, [open])

  useEffect(() => {}, [params])

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveModal = async (event: React.FormEvent) => {
    event.preventDefault()
    saveInfo()
  }

  const saveInfo = async () => {
    try {
      // 필수 값 확인
      if (!params.crtrYm) {
        alert('기준년도를 입력해야 합니다.')
        return
      }
      if (!params.locgovCd) {
        alert('지자체 정보를 선택해야 합니다.')
        return
      }
      if (!params.anlrveAmt) {
        alert('세입액을 입력해야 합니다.')
        return
      }

      // 사용자 확인
      const userConfirm = confirm('세입정보를 등록하시겠습니까?')
      if (!userConfirm) {
        return
      }

      const endpoint = '/fsm/sup/tm/cm/createTxrvamtMng'

      // FormData 생성
      const jsonData = {
        crtrYm: params.crtrYm.replaceAll('-', ''), //
        anlrveAmtNo: params.anlrveAmtNo, //
        locgovCd: params.locgovCd, //
        rtSeqNo: params.rtSeqNo, //
        anlrveAmt: params.anlrveAmt,
      }

      // 서버 요청
      const response = await sendHttpRequest(
        'POST',
        endpoint,
        jsonData,
        true, // JWT 사용 여부
      )

      // 응답 처리
      if (response?.resultType === 'success') {
        alert('정상적으로 저장되었습니다.')
        handleClose()
        reloadFunc?.()

        console.log('Success Response:', response)
      } else {
        console.error('Response Error:', response)
        alert(
          `등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
        handleClose()
        reloadFunc?.()
      }
    } catch (error) {
      // error를 Error로 캐스팅
      //const errorMessage = (error as Error).message || '알 수 없는 오류가 발생했습니다.';
      alert(`Error : 등록에 실패했습니다. `)
      handleClose()
    }
  }

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        {props.buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={props.size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{props.title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                type="submit"
                form="form-modal"
                color="primary"
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
            </div>
          </Box>
          <Box
            id="form-modal"
            component="form"
            onSubmit={(e) => handleSaveModal(e)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <Box
              sx={{
                maxWidth: 'fullWidth',
                margin: '0 auto', // 중앙 정렬
              }}
            >
              <TableContainer style={{ margin: '16px 0 4em 0' }}>
                <Table
                  className="table table-bordered"
                  style={{ tableLayout: 'fixed', width: '100%' }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '120px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>기준년월
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="month"
                          id="ft-date-start"
                          name="crtrYm"
                          value={params.crtrYm}
                          onChange={handleParamChange}
                          disabled={data}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '120px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>시도
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="sch-ctpv">시도</CustomFormLabel>
                        <CtpvSelect
                          pValue={params.ctpvCd}
                          handleChange={handleParamChange}
                          htmlFor={'sch-ctpv'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>지자체
                      </TableCell>
                      <TableCell
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CustomFormLabel className="input-label-none" htmlFor="sch-locgovCd">지자체</CustomFormLabel>
                        <LocgovSelect
                          ctpvCd={params.ctpvCd}
                          pValue={params.locgovCd}
                          handleChange={handleParamChange}
                          htmlFor={'sch-locgovCd'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '120px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>세입액(원)
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="number"
                          id="modal-anlrveAmt"
                          name="anlrveAmt"
                          onChange={handleParamChange}
                          value={params.anlrveAmt}
                          placeholder="숫자만 입력 가능합니다."
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

export default RegisterModalForm
