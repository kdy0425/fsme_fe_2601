import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import AddrSearchModal, {
  AddrRow,
} from '@/app/components/popup/AddrSearchModal'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { telnoFormatter } from '@/utils/fsms/common/comm'
import { getDateTimeString } from '@/utils/fsms/common/util'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  RadioGroup,
  TableContainer,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { Row } from '../page'

interface UserData {
  userTsid: string
  userAcntSttsCd: string
  lgnId: string
  userNm: string
  pswd: string
  ctpvCd: string
  locgovCd: null
  ipAddr: string
  ctpvNm: string
  locgovNm: string
  roleNm: string
  deptNm: string
  part1Addr: string
  part2Addr: string
  zip?: string // 지금은 없지만 필요함
  emlAddr: null
  telno: string
  mbtlnum: string
  aplyBgngYmd: string
  aplyEndYmd: string
  useYn: string
  subDnEncpt: string
  gccDeptNm: string
  userRoles: any[]
  userAuths: UserAuth[]
  menus: null
}

interface UserAuth {
  userTypeCd: string
}

interface Body {
  lgnId: string
  userTsid?: string
  pswd: string
  locgovGb: string
  ctpvCd: string
  instCd: string
  bsBillYn: string
  bsPayYn: string
  bsRegYn: string
  bsQualYn: string
  bsInstcYn: string
  txBillYn: string
  txPayYn: string
  txRegYn: string
  txQualYn: string
  txInstcYn: string
  trBillYn: string
  trPayYn: string
  trRegYn: string
  trQualYn: string
  trInstcYn: string
  scrapYn: string
  userNm: string
  deptNm: string
  zip: string
  part1Addr: string
  part2Addr: string
  emlAddr: string
  telno: string
  mbtlnum: string
  aplyBgngYmd: string
  aplyEndYmd: string
  ipAddr: string
  userAcntSttsCd?: string
}

interface ModalProps {
  type: 'CREATE' | 'UPDATE'
  title: string
  row: Row | null
  remoteFlag: boolean
  closeHandler: () => void
  reload: () => void
}

const emailDomain: SelectItem[] = [
  {
    label: '직접입력',
    value: '',
  },
  {
    label: 'korea.co.kr',
    value: 'korea.co.kr',
  },
]

const localTelNum: SelectItem[] = [
  {
    label: '02',
    value: '02',
  },
  {
    label: '031',
    value: '031',
  },
  {
    label: '032',
    value: '032',
  },
  {
    label: '033',
    value: '033',
  },
  {
    label: '041',
    value: '041',
  },
  {
    label: '042',
    value: '042',
  },
  {
    label: '043',
    value: '043',
  },
  {
    label: '051',
    value: '051',
  },
  {
    label: '052',
    value: '052',
  },
  {
    label: '053',
    value: '053',
  },
  {
    label: '054',
    value: '054',
  },
  {
    label: '055',
    value: '055',
  },
  {
    label: '061',
    value: '061',
  },
  {
    label: '062',
    value: '062',
  },
  {
    label: '063',
    value: '063',
  },
  {
    label: '064',
    value: '064',
  },
]

const phoneNum: SelectItem[] = [
  {
    label: '010',
    value: '010',
  },
  {
    label: '011',
    value: '011',
  },
  {
    label: '016',
    value: '016',
  },
  {
    label: '017',
    value: '017',
  },
  {
    label: '018',
    value: '018',
  },
  {
    label: '019',
    value: '019',
  },
]

const UserFormModal = (props: ModalProps) => {
  const { type, title, row, remoteFlag, closeHandler, reload } = props

  const [open, setOpen] = useState(false)

  const [telno1, setTelno1] = useState<string>('02') // 지역번호
  const [telno2, setTelno2] = useState<string>('') // 전화번호 2번째 자리
  const [telno3, setTelno3] = useState<string>('') // 전화번호 3번째 자리

  const [phone1, setPhone1] = useState<string>('010') // 휴대폰번호 1번째 자리
  const [phone2, setPhone2] = useState<string>('') // 휴대폰번호 2번째 자리
  const [phone3, setPhone3] = useState<string>('') // 휴대폰번호 3번째 자리

  const [email1, setEmail1] = useState<string>('') // 이메일 아이디
  const [email2, setEmail2] = useState<string>('') // 이메일 도메인
  const [pswdChk, setPswdChk] = useState<string>('') // 비밀번호 확인 값

  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false)

  const [didDupChk, setDidDupChk] = useState<boolean>(false) // 아이디 중복체크 여부

  const [data, setData] = useState<UserData>()
  const [body, setBody] = useState<Body>({
    lgnId: '',
    pswd: '',
    locgovGb: '',
    ctpvCd: '',
    instCd: '',
    bsBillYn: '',
    bsPayYn: '',
    bsRegYn: '',
    bsQualYn: '',
    bsInstcYn: '',
    txBillYn: '',
    txPayYn: '',
    txRegYn: '',
    txQualYn: '',
    txInstcYn: '',
    trBillYn: '',
    trPayYn: '',
    trRegYn: '',
    trQualYn: '',
    trInstcYn: '',
    scrapYn: '',
    userNm: '',
    deptNm: '',
    zip: '',
    part1Addr: '',
    part2Addr: '',
    emlAddr: '',
    telno: '',
    mbtlnum: '',
    aplyBgngYmd: '',
    aplyEndYmd: '',
    ipAddr: '',
    userTsid: '',
    userAcntSttsCd: '',
  })

  useEffect(() => {
    if (props.remoteFlag !== undefined) {
      setOpen(remoteFlag)
    }
  }, [remoteFlag])

  useEffect(() => {
    if (type === 'UPDATE' && row?.lgnId) {
      setDidDupChk(true)
      getData(row?.lgnId)
    }
  }, [open])

  useEffect(() => {
    if (data) {
      setBody((prev) => ({
        ...prev,
        bsBillYn: '',
        bsPayYn: '',
        bsRegYn: '',
        bsQualYn: '',
        bsInstcYn: '',
        txBillYn: '',
        txPayYn: '',
        txRegYn: '',
        txQualYn: '',
        txInstcYn: '',
        trBillYn: '',
        trPayYn: '',
        trRegYn: '',
        trQualYn: '',
        trInstcYn: '',
      }))

      if (data.emlAddr) {
        let emailAddrArr: string[] = String(data.emlAddr).split('@')

        setEmail1(emailAddrArr[0])
        setEmail2(emailAddrArr[1])
      }

      if (data.telno) {
        let formated = telnoFormatter(data.telno)
        let telnoArr: string[] = String(formated).split('-')

        setTelno1(telnoArr[0])
        setTelno2(telnoArr[1])
        setTelno3(telnoArr[2])
      }

      if (data.mbtlnum) {
        let formated = telnoFormatter(data.mbtlnum)
        let mbtlNumArr: string[] = String(formated).split('-')

        setPhone1(mbtlNumArr[0])
        setPhone2(mbtlNumArr[1])
        setPhone3(mbtlNumArr[2])
      }

      if (data.userAuths && data.userAuths.length > 0) {
        let locgovGbString: string = data.userAuths[0].userTypeCd.split('_')[0]

        setBody((prev) => ({ ...prev, locgovGb: locgovGbString }))

        data.userAuths.map((auth) => {
          let code: string = auth.userTypeCd.split('_')[1]

          switch (code) {
            case '21':
              setBody((prev) => ({ ...prev, bsBillYn: 'Y' }))
              break
            case '22':
              setBody((prev) => ({ ...prev, bsPayYn: 'Y' }))
              break
            case '23':
              setBody((prev) => ({ ...prev, bsRegYn: 'Y' }))
              break
            case '24':
              setBody((prev) => ({ ...prev, bsQualYn: 'Y' }))
              break
            case '25':
              setBody((prev) => ({ ...prev, bsInstcYn: 'Y' }))
              break
            case '31':
              setBody((prev) => ({ ...prev, txBillYn: 'Y' }))
              break
            case '32':
              setBody((prev) => ({ ...prev, txPayYn: 'Y' }))
              break
            case '33':
              setBody((prev) => ({ ...prev, txRegYn: 'Y' }))
              break
            case '34':
              setBody((prev) => ({ ...prev, txQualYn: 'Y' }))
              break
            case '35':
              setBody((prev) => ({ ...prev, txInstcYn: 'Y' }))
              break
            case '11':
              setBody((prev) => ({ ...prev, trBillYn: 'Y' }))
              break
            case '12':
              setBody((prev) => ({ ...prev, trPayYn: 'Y' }))
              break
            case '13':
              setBody((prev) => ({ ...prev, trRegYn: 'Y' }))
              break
            case '14':
              setBody((prev) => ({ ...prev, trQualYn: 'Y' }))
              break
            case '15':
              setBody((prev) => ({ ...prev, trInstcYn: 'Y' }))
              break
            default:
              break
          }
        })
      }

      setBody((prev) => ({
        ...prev,
        lgnId: data.lgnId ?? '',
        pswd: '',
        ctpvCd: data.ctpvCd ?? '',
        instCd: data.locgovCd ?? '',
        scrapYn: '',
        userNm: data.userNm ?? '',
        deptNm: data.deptNm ?? '',
        zip: data.zip ?? '',
        part1Addr: data.part1Addr ?? '',
        part2Addr: data.part2Addr ?? '',
        emlAddr: data.emlAddr ?? '',
        telno: data.telno,
        mbtlnum: data.mbtlnum,
        aplyBgngYmd:
          getDateTimeString(data?.aplyBgngYmd, 'date')?.dateString ?? '',
        aplyEndYmd:
          getDateTimeString(data?.aplyEndYmd, 'date')?.dateString ?? '',
        ipAddr: data.ipAddr,
        userAcntSttsCd: data.userAcntSttsCd,
        userTsid: data.userTsid,
      }))
    }
  }, [data])

  useEffect(() => {
    setBody((prev) => ({
      ...prev,
      emlAddr: email1 + '@' + email2,
      telno: telno1 + telno2 + telno3,
      mbtlnum: phone1 + phone2 + phone3,
    }))
  }, [email1, email2, telno1, telno2, telno3, phone1, phone2, phone3])

  const getData = async (lgnId: string) => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/getOneDetailUser?lgnId=${lgnId}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setData(response.data)
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
    }
  }

  const sendData = async () => {
    try {
      let endpoint: string =
        type === 'CREATE'
          ? `/fsm/sym/user/cm/createUser`
          : `/fsm/sym/user/cm/updateUser`

      /** 필수값 누락 Check 시작 */
      if (
        body.bsBillYn == 'N' &&
        body.bsPayYn == 'N' &&
        body.bsRegYn == 'N' &&
        body.bsQualYn == 'N' &&
        body.bsInstcYn == 'N' &&
        body.txBillYn == 'N' &&
        body.txPayYn == 'N' &&
        body.txRegYn == 'N' &&
        body.txQualYn == 'N' &&
        body.txInstcYn == 'N' &&
        body.trBillYn == 'N' &&
        body.trPayYn == 'N' &&
        body.trRegYn == 'N' &&
        body.trQualYn == 'N' &&
        body.trInstcYn == 'N'
      ) {
        alert('담당업무를 지정해주세요.')
        return
      } else if (!body.lgnId || body.lgnId == '') {
        alert('아이디를 입력해주세요.')
        return
      } else if (!didDupChk) {
        alert('아이디 중복확인을 해주세요.')
        return
      } else if (body.pswd && pswdChk && body.pswd !== pswdChk) {
        alert('비밀번호와 비밀번호확인 값이 일치하지 않습니다.')
        return
      } else if (!body.userNm || body.userNm == '') {
        alert('사용자명을 입력해주세요.')
        return
      } else if (!email1 || !email2) {
        alert('이메일 주소를 정확히 입력해주세요.')
        return
      } else if (!telno1 || !telno2 || !telno3) {
        alert('내선번호를 정확히 입력해주세요.')
        return
      } else if (!body.aplyBgngYmd || !body.aplyEndYmd) {
        alert('신청기간을 정확히 입력해주세요.')
        return
      } else if (!body.ipAddr || body.ipAddr == '') {
        alert('IP주소를 입력해주세요.')
        return
      }
      /** 필수값 누락 Check 종료 */

      let formData = {
        ...body,
        aplyBgngYmd: body.aplyBgngYmd.replaceAll('-', ''),
        aplyEndYmd: body.aplyEndYmd.replaceAll('-', ''),
        userAcntSttsCd: type === 'CREATE' ? 'R' : body.userAcntSttsCd,
        userTsid: body.userTsid,
      }

      console.log(JSON.stringify(formData))

      const response = await sendHttpRequest(
        type === 'CREATE' ? 'POST' : 'PUT',
        endpoint,
        formData,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType == 'success') {
        alert(response.message)
        reload()
      } else {
        console.log(response.message)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleClose = () => {
    closeHandler()
    setOpen(false)
  }

  const handleDuplicationCheck = async () => {
    try {
      let endpoint: string = `/fsm/sym/user/cm/getOneUser?lgnId=${body.lgnId}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        alert('이미 사용중인 아이디입니다.')
        setDidDupChk(false)
      } else {
        alert('사용가능한 아이디 입니다.')
        setDidDupChk(true)
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
    }
  }

  const getIpAddr = async () => {
    try {
      let endpoint: string = `/fsm/cmm/us/cm/getOneIpAddr`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setBody((prev) => ({ ...prev, ipAddr: response.data.ipAddr }))
      } else {
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
    }
  }

  const handleClickAddr = (row: AddrRow) => {
    setBody((prev) => ({
      ...prev,
      part1Addr: row.roadAddr,
      zip: row.zipNo,
    }))

    setAddrModalOpen(false)
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target

    if (type == 'checkbox') {
      let isChecked: boolean = event.target.checked

      if (isChecked) {
        setBody((prev) => ({ ...prev, [name]: 'Y' }))
      } else if (!isChecked) {
        setBody((prev) => ({ ...prev, [name]: 'N' }))
      }
    } else if (name == 'locgovGb') {
      // 권한 국토부일 때 모든 권한 체크
      if (value == 'MOLIT') {
        setBody((prev) => ({
          ...prev,
          [name]: value,
          bsBillYn: 'Y',
          bsPayYn: 'Y',
          bsRegYn: 'Y',
          bsQualYn: 'Y',
          bsInstcYn: 'Y',
          txBillYn: 'Y',
          txPayYn: 'Y',
          txRegYn: 'Y',
          txQualYn: 'Y',
          txInstcYn: 'Y',
          trBillYn: 'Y',
          trPayYn: 'Y',
          trRegYn: 'Y',
          trQualYn: 'Y',
          trInstcYn: 'Y',
        }))
      } else {
        setBody((prev) => ({
          ...prev, // 아니라면 초기화
          [name]: value,
          bsBillYn: 'N',
          bsPayYn: 'N',
          bsRegYn: 'N',
          bsQualYn: 'N',
          bsInstcYn: 'N',
          txBillYn: 'N',
          txPayYn: 'N',
          txRegYn: 'N',
          txQualYn: 'N',
          txInstcYn: 'N',
          trBillYn: 'N',
          trPayYn: 'N',
          trRegYn: 'N',
          trQualYn: 'N',
          trInstcYn: 'N',
        }))
      }
    } else if (
      name === 'telno2' ||
      name === 'telno3' ||
      name === 'phone2' ||
      name === 'phone3'
    ) {
      if (value.length > 4) {
        return
      } else {
        if (name === 'telno2') {
          setTelno2(value)
        } else if (name === 'telno3') {
          setTelno3(value)
        } else if (name === 'phone2') {
          setPhone2(value)
        } else if (name === 'phone3') {
          setPhone3(value)
        }
      }
    } else {
      if (didDupChk && name == 'lgnId') {
        // 중복확인 했는데 아이디 다시 입력할 때
        setDidDupChk(false)
      }

      setBody((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <>
      <Dialog fullWidth={false} maxWidth={'xl'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => sendData()}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <TableContainer
              className="table-scrollable"
              style={{ minWidth: '1000px', margin: '16px 0 2em 0' }}
            >
              <table className="table table-bordered">
                <caption>사용자 정보 등록 테이블</caption>
                <thead style={{ display: 'none' }}>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th
                      className="td-head td-left"
                      scope="row"
                      style={{ width: '16.6%' }}
                    >
                      <span className="required-text">*</span>권한
                    </th>
                    <td colSpan={2}>
                      <div className="table-form" style={{ width: 'inherit' }}>
                        <RadioGroup
                          row
                          id="ft-locgovGb-radio"
                          name="locgovGb"
                          value={body.locgovGb}
                          onChange={handleParamChange}
                          className="mui-custom-radio-group"
                        >
                          <FormControlLabel
                            control={
                              <CustomRadio
                                id="chk_MOLIT"
                                name="locgovGb"
                                value="MOLIT"
                              />
                            }
                            label="국토부"
                          />
                          <FormControlLabel
                            control={
                              <CustomRadio
                                id="chk_LOGV"
                                name="locgovGb"
                                value="LOGV"
                              />
                            }
                            label="시군구"
                          />
                        </RadioGroup>
                      </div>
                    </td>
                    <th
                      className="td-head td-left"
                      scope="row"
                      style={{ width: '16.6%' }}
                    >
                      <span className="required-text">*</span>지자체
                    </th>
                    <td colSpan={2}>
                      <div className="table-form">
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor={'sch-ctpv'}
                        >
                          시도명
                        </CustomFormLabel>
                        <CtpvSelect
                          pName="ctpvCd"
                          pValue={body?.ctpvCd ?? ''}
                          handleChange={handleParamChange}
                          htmlFor={'sch-ctpv'}
                        />
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor={'sch-locgov'}
                        >
                          관할관청
                        </CustomFormLabel>
                        <LocgovSelect
                          pName="instCd"
                          pValue={body?.instCd ?? ''}
                          defaultCd={body?.instCd ?? ''}
                          handleChange={handleParamChange}
                          ctpvCd={body?.ctpvCd ?? ''}
                          htmlFor={'sch-locgov'}
                        />
                      </div>
                    </td>
                  </tr>
                  {body.locgovGb == 'MOLIT' ? (
                    <>
                      <tr>
                        <th className="td-head td-left" rowSpan={2}>
                          <span className="required-text">*</span>담당업무
                        </th>
                        <th colSpan={2}>업무유형</th>
                        <th>버스</th>
                        <th>택시</th>
                        <th>화물</th>
                      </tr>
                      <tr>
                        <td
                          style={{ height: '140px' }}
                          rowSpan={1}
                          colSpan={2}
                          className="td-center"
                        >
                          전체
                        </td>
                        <td rowSpan={1} colSpan={3} className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-bsBillYnAll'}
                          >
                            전체
                          </CustomFormLabel>
                          <CustomCheckbox
                            id="chk-bsBillYnAll"
                            name="bsBillYn"
                            onChange={handleParamChange}
                            checked
                          />
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <th className="td-head td-left" rowSpan={6}>
                          <span className="required-text">*</span>담당업무
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2}>업무유형</th>
                        <th>버스</th>
                        <th>택시</th>
                        <th>화물</th>
                      </tr>
                      <tr>
                        <td colSpan={2}>청구</td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-bsBillYn'}
                          >
                            버스
                          </CustomFormLabel>
                          <CustomCheckbox
                            className="auth-check"
                            id="chk-bsBillYn"
                            name="bsBillYn"
                            onChange={handleParamChange}
                            checked={body.bsBillYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-txBillYn'}
                          >
                            택시
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="txBillYn"
                            id="chk-txBillYn"
                            onChange={handleParamChange}
                            checked={body.txBillYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-trBillYn'}
                          >
                            화물
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="trBillYn"
                            id="chk-trBillYn"
                            onChange={handleParamChange}
                            checked={body.trBillYn === 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>지급</td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-bsPayYn'}
                          >
                            버스
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="bsPayYn"
                            id="chk-bsPayYn"
                            onChange={handleParamChange}
                            checked={body.bsPayYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-txPayYn'}
                          >
                            택시
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="txPayYn"
                            id="chk-txPayYn"
                            onChange={handleParamChange}
                            checked={body.txPayYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-trPayYn'}
                          >
                            화물
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="trPayYn"
                            id="chk-trPayYn"
                            onChange={handleParamChange}
                            checked={body.trPayYn === 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>발급</td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-bsRegYn'}
                          >
                            버스
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="bsRegYn"
                            id="chk-bsRegYn"
                            onChange={handleParamChange}
                            checked={body.bsRegYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-txRegYn'}
                          >
                            택시
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="txRegYn"
                            id="chk-txRegYn"
                            onChange={handleParamChange}
                            checked={body.txRegYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-trRegYn'}
                          >
                            화물
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="trRegYn"
                            id="chk-trRegYn"
                            onChange={handleParamChange}
                            checked={body.trRegYn === 'Y'}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>자격</td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-bsQualYn'}
                          >
                            버스
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="bsQualYn"
                            id="chk-bsQualYn"
                            onChange={handleParamChange}
                            checked={body.bsQualYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-txQualYn'}
                          >
                            택시
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="txQualYn"
                            id="chk-txQualYn"
                            onChange={handleParamChange}
                            checked={body.txQualYn === 'Y'}
                          />
                        </td>
                        <td className="td-center">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor={'chk-trQualYn'}
                          >
                            화물
                          </CustomFormLabel>
                          <CustomCheckbox
                            name="trQualYn"
                            id="chk-trQualYn"
                            onChange={handleParamChange}
                            checked={body.trQualYn === 'Y'}
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <th rowSpan={1} className="td-head td-left">
                      <span className="required-text">*</span>아이디
                    </th>
                    <td colSpan={5}>
                      <div className="table-form">
                        {type === 'CREATE' ? (
                          <>
                            <CustomTextField
                              id="ft-lgnId"
                              name="lgnId"
                              value={body?.lgnId}
                              onChange={handleParamChange}
                              sx={{ width: '50%' }}
                            />
                            <Button
                              onClick={handleDuplicationCheck}
                              disabled={didDupChk}
                            >
                              중복확인
                            </Button>
                          </>
                        ) : (
                          body?.lgnId
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head td-left">비밀번호</th>
                    <td colSpan={5}>
                      <div className="table-form">
                        <CustomTextField
                          type="password"
                          id="fr-pswd"
                          name="pswd"
                          value={body.pswd}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head td-left">비밀번호확인</th>
                    <td colSpan={5}>
                      <div className="table-form">
                        <CustomTextField
                          type="password"
                          id="ft-pswdChk"
                          value={pswdChk}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPswdChk(e.target.value)
                          }
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head td-left">
                      <span className="required-text">*</span>사용자명
                    </th>
                    <td colSpan={2}>
                      <div className="table-form">
                        <CustomTextField
                          id="ft-userNm"
                          name="userNm"
                          value={body?.userNm}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                    <th className="td-head td-left">부서명</th>
                    <td colSpan={2}>
                      <div className="table-form">
                        <CustomTextField
                          id="ft-deptNm"
                          name="deptNm"
                          value={body?.deptNm}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head td-left">기관주소</th>
                    <td colSpan={5}>
                      <div className="table-form">
                        <CustomTextField
                          onClick={() => setAddrModalOpen(true)}
                          id="ft-zip"
                          name="zip"
                          value={body?.zip}
                          onChange={handleParamChange}
                          readOnly
                          inputProps={{ readOnly: true }}
                        />
                        <Button onClick={() => setAddrModalOpen(true)}>
                          우편번호
                        </Button>
                        <CustomTextField
                          onClick={() => setAddrModalOpen(true)}
                          id="ft-part1Addr"
                          name="part1Addr"
                          value={body?.part1Addr}
                          onChange={handleParamChange}
                          readOnly
                          inputProps={{ readOnly: true }}
                          sx={{ width: '50%' }}
                        />
                        <CustomTextField
                          id="ft-part2Addr"
                          name="part2Addr"
                          value={body?.part2Addr}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head td-left">
                      <span className="required-text">*</span>이메일
                    </th>
                    <td colSpan={5}>
                      <div className="table-form">
                        <CustomTextField
                          id="ft-email1"
                          value={email1}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail1(e.target.value)
                          }
                          sx={{ width: '15%' }}
                        />
                        @
                        <CustomTextField
                          id="ft-email2"
                          value={email2}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail2(e.target.value)
                          }
                          sx={{ width: '15%' }}
                        />
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor={'ft-email-select'}
                        >
                          도메인선택
                        </CustomFormLabel>
                        <select
                          id="ft-email-select"
                          className="custom-default-select"
                          value={email2}
                          onChange={(e) => setEmail2(e.target.value)}
                        >
                          {emailDomain.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head td-left">
                      <span className="required-text">*</span>내선번호
                    </th>
                    <td colSpan={2}>
                      <div className="table-form">
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor={'ft-telno-select'}
                        >
                          telno1
                        </CustomFormLabel>
                        <select
                          id="ft-telno-select"
                          className="custom-default-select"
                          value={telno1}
                          onChange={(e) => setTelno1(e.target.value)}
                        >
                          {localTelNum.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        -
                        <CustomTextField
                          type="number"
                          id="ft-telno2"
                          name="telno2"
                          value={telno2}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                        -
                        <CustomTextField
                          type="number"
                          id="ft-telno3"
                          name="telno3"
                          value={telno3}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                    <th className="td-head td-left">핸드폰번호</th>
                    <td colSpan={2}>
                      <div className="table-form">
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor={'ft-phone-select'}
                        >
                          phone1
                        </CustomFormLabel>
                        <select
                          id="ft-phone-select"
                          className="custom-default-select"
                          value={phone1}
                          onChange={(e) => setPhone1(e.target.value)}
                        >
                          {phoneNum.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        -
                        <CustomTextField
                          type="number"
                          id="ft-phone2"
                          name="phone2"
                          value={phone2}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                        -
                        <CustomTextField
                          type="number"
                          id="ft-phone3"
                          name="phone3"
                          value={phone3}
                          onChange={handleParamChange}
                          sx={{ width: '50%' }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head td-left">
                      <span className="required-text">*</span>신청기간
                    </th>
                    <td colSpan={5}>
                      <div className="table-form">
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="aplyBgngYmd"
                          value={body?.aplyBgngYmd}
                          onChange={handleParamChange}
                        />
                        ~
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="aplyEndYmd"
                          value={body?.aplyEndYmd}
                          onChange={handleParamChange}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head td-left">
                      <span className="required-text">*</span>IP주소
                    </th>
                    <td colSpan={5}>
                      <div className="table-form">
                        <CustomTextField
                          id="ft-ipAddr"
                          name="ipAddr"
                          value={body?.ipAddr}
                          onChange={handleParamChange}
                          sx={{ width: '30%' }}
                        />
                        <Button onClick={() => getIpAddr()}>내IP확인</Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </TableContainer>
            <AddrSearchModal
              open={addrModalOpen}
              onRowClick={handleClickAddr}
              onCloseClick={() => setAddrModalOpen(false)}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserFormModal
