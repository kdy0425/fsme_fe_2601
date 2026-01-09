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
import BlankCard from '@/app/components/shared/BlankCard'
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

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { getDateRange, isNumber } from '@/utils/fsms/common/comm'
import {
  getNumtoWon,
  getNumtoWonAndDecimalPoint,
} from '@/utils/fsms/common/convert'
import { number } from '@amcharts/amcharts4/core'
import { toNumber } from 'lodash'

// 신규 등록 모달창의 경우 당장에 받아야할 것들이 없음.
interface ModalFormProps {
  buttonLabel: string
  title: string
  size?: DialogProps['maxWidth'] | 'lg'
  reloadFunc: () => void
  // data?: Row;
  // handleOpen?: () => any
  // handleClose?: () => any
}

const RegisterModalForm = (props: ModalFormProps) => {
  const { reloadFunc } = props

  const [leadCnCode, setNotiCode] = useState<SelectItem[]>([]) //        공지구분 코드
  const [relateTaskSeCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드

  const [content, setContent] = useState<string>('') // 게시글 내용 상태
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // 첨부된 파일 상태
  const [open, setOpen] = useState(false)

  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setParams({
      locgovCd: '', //관할관청
      crtrYm: endDate, //기준년월
      carmdlCd: '', //차종코드
      carmdlNm: '', //업무구분
      anlrveAmt: '', //월세입금액
      totalPayAmt: '', //총지급금액
      totalPayLit: '', //총유류사용량
      totalBalAmt: '', //과,부족액
      cardGiveAmt: '', //카드지급금액
      cardGiveAog: '', //카드지급유류사용량
      orgLocgovCd: '', //원관할관청
      orgCrtrYm: '', //원거래년월
      orgCarmdlCd: '', //원차종코드
      cardClmAmt: '', //카드청구금액
      cardClmAog: '', //카드청구주유량
      cardClmVhclCnt: '', //카드청구차량대수
      cardGiveVhclCnt: '', //카드지급차량대수
      docmntAplyClmAmt: '', //서면청구금액
      docmntAplyClmLbrctQty: '', //서면청구주유량
      docmntAplyClmVhclCnt: '', //서면청구차량대수
      docmntAplyGiveAmt: '', //서면지급금액
      docmntAplyGiveLbrctQty: '', //서면지급주유량
      docmntAplyGiveVhclCnt: '', //서면지급차량대수
      rgtrId: '', //등록자아이디
      regDt: '', //등록시간
      mdfrId: '', //수정자아이디
      mdfcnDt: '', //수정시간
      ctpvCd: '', //시도코드 표시용
      locgovNm: '',
      ctpvNm: '',
    })
    setUploadedFiles([])

    setOpen(false)
  }

  const [params, setParams] = useState<Row>({
    locgovCd: '', //관할관청
    crtrYm: '', //기준년월
    carmdlCd: '', //차종코드
    carmdlNm: '', //업무구분
    anlrveAmt: '', //월세입금액
    totalPayAmt: '', //총지급금액
    totalPayLit: '', //총유류사용량
    totalBalAmt: '', //과,부족액
    cardGiveAmt: '', //카드지급금액
    cardGiveAog: '', //카드지급유류사용량
    orgLocgovCd: '', //원관할관청
    orgCrtrYm: '', //원거래년월
    orgCarmdlCd: '', //원차종코드
    cardClmAmt: '', //카드청구금액
    cardClmAog: '', //카드청구주유량
    cardClmVhclCnt: '', //카드청구차량대수
    cardGiveVhclCnt: '', //카드지급차량대수
    docmntAplyClmAmt: '', //서면청구금액
    docmntAplyClmLbrctQty: '', //서면청구주유량
    docmntAplyClmVhclCnt: '', //서면청구차량대수
    docmntAplyGiveAmt: '', //서면지급금액
    docmntAplyGiveLbrctQty: '', //서면지급주유량
    docmntAplyGiveVhclCnt: '', //서면지급차량대수
    rgtrId: '', //등록자아이디
    regDt: '', //등록시간
    mdfrId: '', //수정자아이디
    mdfcnDt: '', //수정시간
    ctpvCd: '', //시도코드 표시용
    locgovNm: '',
    ctpvNm: '',
  })

  const dateRange = getDateRange('m', 1)
  let endDate = dateRange.endDate

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    setParams((prev) => ({ ...prev, crtrYm: endDate }))
  }, [])

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    let checkList = [
      'cardGiveAmt',
      'cardGiveVhclCnt',
      'docmntAplyGiveAmt',
      'docmntAplyGiveVhclCnt',
    ]
    let checkListAog = ['cardGiveAog', 'docmntAplyGiveLbrctQty']

    if (checkList.includes(name)) {
      setParams((prev) => ({
        ...prev,
        [name]: isNumber(value, [',', '.'])
          ? value
          : value.substring(0, value.length - 1),
      }))
    } else if (checkListAog.includes(name)) {
      console.log(isNumber(value, [',', '.']))
      setParams((prev) => ({
        ...prev,
        [name]: isNumber(value, [',', '.'])
          ? value
          : value.substring(0, value.length - 1),
      }))
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
    // setParams((prev) => ({ ...prev, [name]: value }));
  }

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setContent(event.target.value)
  }

  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  }

  const handleSave = async () => {
    try {
      // 필수 값 체크
      if (!params.crtrYm || !params.locgovCd || !params.carmdlCd) {
        alert('필수 항목을 모두 입력해야 합니다.')
        return
      }

      // 사용자 확인
      const userConfirm = confirm('지급실적정보를 등록하시겠습니까?')
      if (!userConfirm) {
        return
      }

      const endpoint = '/fsm/sup/pmr/cm/createPerfMng'

      // FormData 생성
      const jsonData = {
        crtrYm: params.crtrYm.replaceAll('-', ''),
        locgovCd: params.locgovCd,
        carmdlCd: params.carmdlCd,
        orgCrtrYm: params.crtrYm.replaceAll('-', ''),
        orgLocgovCd: params.locgovCd,
        orgCarmdlCd: params.carmdlCd,
        cardGiveAmt: params.cardGiveAmt.replaceAll(',', ''),
        cardGiveAog: params.cardGiveAog.replaceAll(',', ''),
        cardGiveVhclCnt: params.cardGiveVhclCnt.replaceAll(',', ''),
        docmntAplyGiveAmt: params.docmntAplyGiveAmt.replaceAll(',', ''),
        docmntAplyGiveLbrctQty: params.docmntAplyGiveLbrctQty.replaceAll(
          ',',
          '',
        ),
        docmntAplyGiveVhclCnt: params.docmntAplyGiveVhclCnt.replaceAll(',', ''),
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
        alert('지급실적정보 데이터가 등록되었습니다.')
        handleClose()
        reloadFunc?.()

        console.log('Success Response:', response)
      } else {
        console.error('Response Error:', response)
        alert(
          `지급실적정보 데이터 등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
        // handleClose();
        // reloadFunc?.();
      }
    } catch (error) {
      // error를 Error로 캐스팅
      //const errorMessage = (error as Error).message || '알 수 없는 오류가 발생했습니다.';
      alert(`Error : 지급실적정보 데이터 등록에 실패했습니다. `)
      handleClose()
    }
  }

  const handleSearchData = async () => {
    try {
      // 필수 값 체크
      console.log(params)
      if (!params.crtrYm || !params.locgovCd || !params.carmdlCd) {
        alert('필수 항목을 모두 입력해야 합니다.')
        return
      }

      let endpoint = ''

      if (params.carmdlCd == '3') {
        endpoint =
          '/fsm/sup/pmr/tr/getClaimDstrnTr?' +
          'clclnYm=' +
          params.crtrYm.replaceAll('-', '') +
          '&clclnLocgovCd=' +
          params.locgovCd
      } else if (params.carmdlCd == '2') {
        endpoint =
          '/fsm/sup/pmr/bs/getClaimDstrnBs?' +
          'clclnYm=' +
          params.crtrYm.replaceAll('-', '') +
          '&clclnLocgovCd=' +
          params.locgovCd +
          '&koiCd=D'
      } else if (params.carmdlCd == '1') {
        endpoint =
          '/fsm/sup/pmr/tx/getClaimDstrnTx?' +
          'clclnYm=' +
          params.crtrYm.replaceAll('-', '') +
          '&clclnLocgovCd=' +
          params.locgovCd
      }

      // 서버 요청
      const response = await sendHttpRequest(
        'GET',
        endpoint,
        null,
        true, // JWT 사용 여부
      )

      // console.log(response)

      // 응답 처리
      if (response?.resultType === 'success') {
        if (response.data?.content && response.data?.content.length > 0) {
          console.log(response.data.content)
          let content = response.data.content[0]
          setParams((prev) => ({
            ...prev,
            cardGiveAmt: getNumtoWon(content.subsidyMny),
            cardGiveAog: getNumtoWon(content.useLiter),
            cardGiveVhclCnt: getNumtoWon(content.carCnt),
          }))
        } else {
          alert('지자체별 지급실적 중 조회된 청구내역이 없습니다.')
        }

        // handleClose();
        // reloadFunc?.();

        // console.log('Success Response:', response);
      } else {
        console.error('Response Error:', response)
        // alert(`민원처리 사례 데이터 등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`);
        // handleClose();
        reloadFunc?.()
      }
    } catch (error) {
      // error를 Error로 캐스팅
      //const errorMessage = (error as Error).message || '알 수 없는 오류가 발생했습니다.';
      alert(`Error : 지자체별 지급실적 중 청구내역 조회에 실패했습니다. `)
      // handleClose();
    }
  }

  return (
    <React.Fragment>
      <Button variant="contained" onClick={handleClickOpen}>
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
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            id="form-modal"
            component="form"
            onSubmit={(e) => handleSave()}
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
              <BlankCard
                className="contents-card fit"
                title="유가보조금 집행실적"
              >
                <TableContainer style={{ margin: '0 0 -1em 0' }}>
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
                          <span className="required-text">*</span>기준월
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="month"
                            id="ft-date-crtrYm"
                            name="crtrYm"
                            value={params.crtrYm}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>지자체
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <div className="input_group">
                          <CustomFormLabel className="input-label-none" htmlFor="sch-ctpv">시도</CustomFormLabel>
                            <div className="input">
                              <CtpvSelect
                                pValue={params.ctpvCd}
                                handleChange={handleParamChange}
                                htmlFor={'sch-ctpv'}
                                pDisabled={isLocgovCdAll}
                              />
                            </div>
                            <div className="input">
                            <CustomFormLabel className="input-label-none" htmlFor="sch-locgovCd">지자체</CustomFormLabel>
                              <LocgovSelect
                                ctpvCd={params.ctpvCd}
                                pValue={params.locgovCd}
                                pName="locgovCd"
                                handleChange={handleParamChange}
                                htmlFor={'sch-locgovCd'}
                                pDisabled={isLocgovCdAll}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>업무구분
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CommSelect
                            cdGroupNm='92H' // 필수 O, 가져올 코드 그룹명
                            pValue={params.carmdlCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                            handleChange={handleParamChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                            pName="carmdlCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                            /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                            htmlFor={'sch-carmdlCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          월세입액
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-anlrveAmt"
                            name="anlrveAmt"
                            value={params.anlrveAmt}
                            onChange={handleParamChange}
                            disabled={true}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          총집행액
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-totalPayAmt"
                            name="totalPayAmt"
                            value={params.totalPayAmt}
                            onChange={handleParamChange}
                            disabled={true}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          과,부족액
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-totalBalAmt"
                            name="totalBalAmt"
                            value={params.totalBalAmt}
                            onChange={handleParamChange}
                            disabled={true}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="contents-explanation">
                    <div className="contents-explanation-inner">
                      <div className="contents-explanation-text">
                        월세입액, 총집행액, 과,부족액은 데이터 입력 후 자동으로
                        매핑 됩니다.
                      </div>
                    </div>
                  </div>
                </TableContainer>
              </BlankCard>
              <BlankCard
                className="contents-card fit"
                title="카드사 지급실적"
                buttons={[
                  {
                    label: '청구내역조회',
                    color: 'outlined',
                    onClick: () => handleSearchData(),
                  },
                ]}
              >
                <TableContainer style={{ margin: '0 0 -1em 0' }}>
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
                          카드사 지급금액
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-cardGiveAmt"
                            name="cardGiveAmt"
                            value={params.cardGiveAmt}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          지급 유류사용량
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-cardGiveAog"
                            name="cardGiveAog"
                            value={params.cardGiveAog}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          지급 차량대수
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-cardGiveVhclCnt"
                            name="cardGiveVhclCnt"
                            value={params.cardGiveVhclCnt}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="contents-explanation">
                    <div className="contents-explanation-inner">
                      <div className="contents-explanation-text">
                        청구내역조회시 기준월에 청구된 내역이 자동으로
                        매핑됩니다.
                      </div>
                    </div>
                  </div>
                </TableContainer>
              </BlankCard>
              <BlankCard
                className="contents-card fit"
                title="서면신청 지급실적"
              >
                <TableContainer style={{ margin: '0 0 -1em 0' }}>
                  <Table
                    className="table table-bordered"
                    style={{ tableLayout: 'fixed', width: '100%' }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '130px', verticalAlign: 'middle' }}
                        >
                          서면신청지급금액
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-docmntAplyGiveAmt"
                            name="docmntAplyGiveAmt"
                            value={params.docmntAplyGiveAmt}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          지급 유류사용량
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-docmntAplyGiveLbrctQty"
                            name="docmntAplyGiveLbrctQty"
                            value={params.docmntAplyGiveLbrctQty}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          지급 차량대수
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                          <CustomTextField
                            type="text"
                            id="ft-docmntAplyGiveVhclCnt"
                            name="docmntAplyGiveVhclCnt"
                            value={params.docmntAplyGiveVhclCnt}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="contents-explanation">
                    <div className="contents-explanation-inner">
                      <div className="contents-explanation-text">
                        지자체에서 지급한 서면신청 내역을 직접 입력합니다.
                      </div>
                    </div>
                  </div>
                </TableContainer>
              </BlankCard>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

export default RegisterModalForm
