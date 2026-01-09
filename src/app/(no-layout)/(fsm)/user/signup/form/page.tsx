'use client'

import AddrSearchModal, {
  AddrRow,
} from '@/app/components/popup/AddrSearchModal2'
import {
  CtpvSelectSign,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SelectItem } from 'select'

// import { ErrorStatus } from '@/utils/fsms/common/messageUtils'
import { PageContainer } from '@/utils/fsms/fsm/mui-imports'
import { getCtpvCd, getLocGovCd } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'

const emailDomain: SelectItem[] = [
  {
    label: '직접입력',
    value: '',
  },
  {
    label: 'korea.kr',
    value: 'korea.kr',
  },
  {
    label: 'seoul.go.kr',
    value: 'seoul.go.kr',
  },
  {
    label: 'gmail.com',
    value: 'gmail.com',
  },
  {
    label: 'naver.com',
    value: 'naver.com',
  },
  {
    label: 'daum.net',
    value: 'daum.net',
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

type signupObj = {
  lgnId: string
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
  userNm: string
  deptNm: string
  zip: string
  part1Addr: string
  part2Addr: string
  emlAddr: string
  mbtlnum: string
  aplyBgngYmd: string
  aplyEndYmd: string
  ipAddr: string
  subDn: string
  mngNo: string
  [key: string]: string | number
}

type ldapData = {
  govUserNm: string
  govDeptNm: string
  govEmailAddr: string
  mngNo: string
  subDn: string
  subDnCk: boolean
}

/** 페이지 제목 및 설명 정보 */
const pageInfo = {
  title: '회원가입',
  description: '유가보조금포털시스템 회원가입 정보입력 화면',
}

const SignupPage: React.FC = () => {
  const router = useRouter()
  const [signupData, setSignupData] = useState<signupObj>({
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
    lgnId: '',
    pswd: '',
    locgovGb: 'LOGV',
    ctpvCd: '',
    instCd: '',
    userNm: '',
    deptNm: '',
    zip: '',
    part1Addr: '',
    part2Addr: '',
    emlAddr: '',
    mbtlnum: '',
    aplyBgngYmd: '',
    aplyEndYmd: '',
    ipAddr: '',
    subDn: '',
    mngNo: '',
  })

  const [ldapData, setLdapData] = useState<ldapData>({
    govUserNm: '',
    govDeptNm: '',
    govEmailAddr: '',
    mngNo: '',
    subDn: '',
    subDnCk: true,
  })

  const [pswdCheck, setPswdCheck] = useState('')
  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false)

  const [idOverlapCheck, setIdOverlapCheck] = useState<boolean>(false) //아이디 중복체크
  const [ipOverlapCheck, setIpOverlapCheck] = useState<boolean>(false) //아이피 중복체크

  const [telno1, setTelno1] = useState<string>('02') // 지역번호
  const [telno2, setTelno2] = useState<string>('') // 전화번호 2번째 자리
  const [telno3, setTelno3] = useState<string>('') // 전화번호 3번째 자리

  const [phone1, setPhone1] = useState<string>('010') // 휴대폰번호 1번째 자리
  const [phone2, setPhone2] = useState<string>('') // 휴대폰번호 2번째 자리
  const [phone3, setPhone3] = useState<string>('') // 휴대폰번호 3번째 자리

  const [email1, setEmail1] = useState<string>('') // 이메일 아이디
  const [email2, setEmail2] = useState<string>('') // 이메일 도메인

  const [ldapOpen, setLdapOpen] = useState<boolean>(false) // 회원연계 모달 오픈

  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([])

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [isSubDnDup, setIsSubDnDup] = useState(false)

  // 초기 데이터 로드
  useEffect(() => {
    getCtpvCd().then((itemArr) => {
      setCtpvCdItems(itemArr)
      setSignupData((prev) => ({ ...prev, ctpvCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
    }) // 시도코드
  }, [])

  useEffect(() => {
    // 시도 코드 변경시 관할관청 재조회
    // 관할관청
    if (signupData.ctpvCd) {
      getLocGovCd(signupData.ctpvCd).then((itemArr) => {
        setLocgovCdItems(itemArr)
        setSignupData((prev) => ({ ...prev, instCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
      })
    }
  }, [signupData.ctpvCd])

  useEffect(() => {
    setSignupData((prev) => ({
      ...prev,
      telno: `${telno1}${telno2}${telno3}`,
    }))
  }, [telno1, telno2, telno3])

  useEffect(() => {
    setSignupData((prev) => ({
      ...prev,
      mbtlnum: `${phone1}${phone2}${phone3}`,
    }))
  }, [phone1, phone2, phone3])

  useEffect(() => {
    setSignupData((prev) => ({
      ...prev,
      emlAddr: `${email1}@${email2}`,
    }))
  }, [email1, email2])

  const [params, setParams] = useState({})

  const handleClickAddr = (row: AddrRow, daddr: string) => {
    // console.log('ADDR ::: ', row);

    setSignupData((prev) => ({
      ...prev,
      zip: row.zipNo,
      part1Addr: row.roadAddr,
      part2Addr: daddr,
    }))

    setAddrModalOpen(false)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setSignupData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target

    if (type === 'checkbox') {
      setSignupData((prev) => ({ ...prev, [name]: checked ? 'Y' : 'N' }))
    }
  }

  const onCheckId = async () => {
    setIdOverlapCheck(false)
    if (signupData?.lgnId) {
      try {
        let endpoint = `/fsm/cmm/us/cm/getOneUserIdCk?lgnId=${signupData?.lgnId}`

        const response = await sendHttpRequest('GET', endpoint)

        if (response && response.resultType == 'success') {
          if (response.data?.userIdCkCnt > 0) {
            setSignupData((prev) => ({ ...prev, lgnId: '' }))
            alert('중복된 아이디입니다. 다른 아이디를 사용해 주세요. ')
            setIdOverlapCheck(false)
          } else {
            alert('사용가능한 아이디입니다.')
            setIdOverlapCheck(true)
          }
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.warn('Error ::: ', error)
      }
    } else {
      alert('아이디를 입력해주세요.')
    }
  }

  const onCheckIp = async () => {
    setIpOverlapCheck(false)
    try {
      let endpoint = `/fsm/cmm/us/cm/getOneIpAddr`

      const response = await sendHttpRequest('GET', endpoint)

      if (response && response.resultType == 'success') {
        if (response.data?.ipAddr > 0) {
          setSignupData((prev) => ({ ...prev, ipAddr: response.data.ipAddr }))
          alert('사용중인 IP주소입니다. 담당자에게 문의하세요.')
          setIpOverlapCheck(false)
        } else {
          setSignupData((prev) => ({ ...prev, ipAddr: response.data.ipAddr }))
          alert('사용가능한 IP주소입니다.')
          setIpOverlapCheck(true)
        }
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.warn('Error ::: ', error)
    }
  }

  const handleNextClick = () => {
    if (!signupData.lgnId) {
      alert('아이디를 입력해주세요.')
      return
    }
    if (!signupData.pswd) {
      alert('비밀번호를 입력해주세요.')
      return
    }
    if (signupData.pswd !== pswdCheck) {
      alert('비밀번호가 다릅니다. 다시 한번 확인해주세요.')
      return
    }
    if (!signupData.ctpvCd || !signupData.instCd) {
      alert('지자체를 선택해주세요.')
      return
    }
    if (
      signupData.bsBillYn === 'N' &&
      signupData.bsPayYn === 'N' &&
      signupData.bsRegYn === 'N' &&
      signupData.bsQualYn === 'N' &&
      signupData.bsInstcYn === 'N' &&
      signupData.txBillYn === 'N' &&
      signupData.txPayYn === 'N' &&
      signupData.txRegYn === 'N' &&
      signupData.txQualYn === 'N' &&
      signupData.txInstcYn === 'N' &&
      signupData.trBillYn === 'N' &&
      signupData.trPayYn === 'N' &&
      signupData.trRegYn === 'N' &&
      signupData.trQualYn === 'N' &&
      signupData.trInstcYn === 'N'
    ) {
      alert('담당업무를 선택해주세요.')
      return
    }
    if (!signupData.userNm) {
      alert('사용자명을 입력해주세요.')
      return
    }
    if (!signupData.deptNm) {
      alert('부서명을 입력해주세요.')
      return
    }
    if (!signupData.part1Addr || !signupData.part2Addr) {
      alert('기관주소를 입력해주세요.')
      return
    }
    if (!email1 || !email2) {
      alert('이메일을 입력해주세요.')
      return
    }
    if (!telno1 || !telno2 || !telno3) {
      alert('내선번호를 입력해주세요.')
      return
    }
    if (!phone1 || !phone2 || !phone3) {
      alert('핸드폰번호를 입력해주세요.')
      return
    }
    if (!signupData.aplyBgngYmd || !signupData.aplyEndYmd) {
      alert('신청기간을 입력해주세요')
      return
    }
    if (!idOverlapCheck) {
      alert('아이디 중복체크를 해주세요')
      return
    }
    if (!signupData.ipAddr) {
      alert('IP주소를 확인해주세요')
      return
    }

    if (
      !confirm(
        '정부디렉토리 데이터 확인후 회원가입이 가능합니다.\n정부디렉토리 연계를 위해 GPKI인증서를 인증하시겠습니까?',
      )
    )
      return

    handleGpki()
  }

  const handleGpki = () => {
    window.removeEventListener('message', messageHandler)
    const width = 420
    const height = 560
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const options = `
    width=${width},
    height=${height},
    top=${top},
    left=${left},
    location=no,
    menubar=no,
    toolbar=no,
    status=no,
    scrollbars=yes,
    resizable=no
    `

    const popup = window.open(
      `${process.env.NEXT_PUBLIC_API_DOMAIN}/gpkisecureweb/jsp/login.jsp`,
      '_blank',
      options,
    )

    window.addEventListener('message', messageHandler)
  }

  const messageHandler = async (event: MessageEvent) => {
    //if (event.origin !== process.env.NEXT_PUBLIC_API_DOMAIN) return
    window.removeEventListener('message', messageHandler)

    try {
      const endpoint: string =
        `/fsm/cmm/us/cm/getOneLdapCntc?subDn=` + event.data
      const response = await sendHttpRequest('GET', endpoint, null, false, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setLdapData(response.data)
        setSignupData((prev) => ({
          ...prev,
          mngNo: response.data.mngNo,
          subDn: event.data,
        }))
        setIsSubDnDup(response.data.subDnCk)
        setLdapOpen(true)
      } else {
        // 데이터가 없거나 실패
        alert('인증서 연계 실패입니다.')
      }
    } catch {
      alert('인증서 연계 실패입니다.')
    }
  }

  const onSignup = async () => {
    if (!isSubDnDup) {
      alert('등록된 인증서입니다.')
      return
    }
    setLoadingBackdrop(true)
    try {
      let endpoint = `/fsm/cmm/us/cm/createUserSbscrb`
      var form = { ...signupData }

      console.log(JSON.stringify(form))

      form.aplyBgngYmd = signupData.aplyBgngYmd.replace(/-/g, '')
      form.aplyEndYmd = signupData.aplyEndYmd.replace(/-/g, '')

      const response = await sendHttpRequest('POST', endpoint, form)

      if (response && response.resultType == 'success') {
        router.push('/user/signup/comp')
      } else {
        alert(response.message)
        setLoadingBackdrop(false)
      }
    } catch (error) {
      console.warn('Error ::: ', error)
      setLoadingBackdrop(false)
    }
  }

  return (
    <PageContainer
      title="회원가입 개인정보 관련 정보입력 페이지"
      description="가입 정보 입력"
    >
      <h2 className="page_title">회원가입</h2>
      <div className="tap_step">
        <div className="item">
          <span className="num">1</span>
          <span className="page">개인정보 관련 동의</span>
        </div>
        <div className="item active">
          <span className="num">2</span>
          <span className="page">회원정보 입력</span>
        </div>
        <div className="item">
          <span className="num">3</span>
          <span className="page">회원가입 완료</span>
        </div>
      </div>

      <div className="form_table_type1">
        <table>
          <colgroup>
            <col style={{ width: '200px' }} />
            <col style={{ width: 'calc(50% - 200px)' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: 'calc(50% - 200px)' }} />
          </colgroup>
          <thead></thead>
          <caption>회원가입</caption>
          <tbody>
            <tr>
              <th scope="row">
                <span className="required">*</span>지자체
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <div className="input">
                    <label htmlFor="sch-ctpv"></label>
                    <CtpvSelectSign
                      pName="ctpvCd"
                      pValue={signupData?.ctpvCd ?? ''}
                      handleChange={handleSearchChange}
                      htmlFor={'sch-ctpv'}
                    />
                  </div>
                  <div className="input">
                    <label htmlFor="sch-locgov"></label>
                    <LocgovSelect
                      pName="instCd"
                      ctpvCd={signupData.ctpvCd}
                      pValue={signupData?.instCd ?? ''}
                      handleChange={handleSearchChange}
                      htmlFor={'sch-locgov'}
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>담당업무
              </th>
              <td colSpan={3} className="padding_0">
                <div className="form_table_type2">
                  <table>
                    <caption>담당업무</caption>
                    <colgroup>
                      <col style={{ width: '498px' }} />
                      <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                      <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                      <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                      <col style={{ width: 'calc((100% - 498px) / 4)' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col">업무유형</th>
                        <th scope="col">버스</th>
                        <th scope="col">택시</th>
                        <th scope="col">화물</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="align_left">청구</td>
                        <td>
                          <label className="checkbox single" htmlFor="bsBillYn">
                            <input
                              type="checkbox"
                              id="bsBillYn"
                              name="bsBillYn"
                              checked={signupData.bsBillYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="txBillYn">
                            <input
                              type="checkbox"
                              id="txBillYn"
                              name="txBillYn"
                              checked={signupData.txBillYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="trBillYn">
                            <input
                              type="checkbox"
                              id="trBillYn"
                              name="trBillYn"
                              checked={signupData.trBillYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td className="align_left">지급</td>
                        <td>
                          <label className="checkbox single" htmlFor="bsPayYn">
                            <input
                              type="checkbox"
                              id="bsPayYn"
                              name="bsPayYn"
                              checked={signupData.bsPayYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="txPayYn">
                            <input
                              type="checkbox"
                              id="txPayYn"
                              name="txPayYn"
                              checked={signupData.txPayYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="trPayYn">
                            <input
                              type="checkbox"
                              id="trPayYn"
                              name="trPayYn"
                              checked={signupData.trPayYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td className="align_left">발급</td>
                        <td>
                          <label className="checkbox single" htmlFor="bsRegYn">
                            <input
                              type="checkbox"
                              id="bsRegYn"
                              name="bsRegYn"
                              checked={signupData.bsRegYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="txRegYn">
                            <input
                              type="checkbox"
                              id="txRegYn"
                              name="txRegYn"
                              checked={signupData.txRegYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="trRegYn">
                            <input
                              type="checkbox"
                              id="trRegYn"
                              name="trRegYn"
                              checked={signupData.trRegYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td className="align_left">자격</td>
                        <td>
                          <label className="checkbox single" htmlFor="bsQualYn">
                            <input
                              type="checkbox"
                              id="bsQualYn"
                              name="bsQualYn"
                              checked={signupData.bsQualYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="txQualYn">
                            <input
                              type="checkbox"
                              id="txQualYn"
                              name="txQualYn"
                              checked={signupData.txQualYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                        <td>
                          <label className="checkbox single" htmlFor="trQualYn">
                            <input
                              type="checkbox"
                              id="trQualYn"
                              name="trQualYn"
                              checked={signupData.trQualYn === 'Y'}
                              onChange={handleCheckData}
                            />
                            <span className="ck_icon"></span>
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>아이디
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <div className="input size_28">
                    <label htmlFor="lgnId">
                      <CustomTextField
                        fullWidth
                        placeholder="아이디 입력"
                        name="lgnId"
                        value={signupData.lgnId}
                        onChange={handleSearchChange}
                      />
                    </label>
                  </div>
                  <button type="button" className="btn_tb1" onClick={onCheckId}>
                    중복확인
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>비밀번호
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <div className="input size_28">
                    <label htmlFor="pswd">
                      <CustomTextField
                        type="password"
                        fullWidth
                        placeholder="비밀번호 입력"
                        name="pswd"
                        value={signupData.pswd}
                        onChange={handleSearchChange}
                      />
                    </label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>비밀번호 확인
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <div className="input size_28">
                    <label htmlFor="password">
                      <CustomTextField
                        type="password"
                        fullWidth
                        placeholder="비밀번호 확인"
                        value={pswdCheck}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setPswdCheck(e.target.value)
                        }}
                      />
                    </label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>사용자명
              </th>
              <td>
                <div className="input_group">
                  <div className="input size_28">
                    <label htmlFor="userNm">
                      <CustomTextField
                        fullWidth
                        name="userNm"
                        value={signupData.userNm}
                        onChange={handleSearchChange}
                      />
                    </label>
                  </div>
                </div>
              </td>
              <th scope="row">
                <span className="required">*</span>부서명
              </th>
              <td>
                <div className="input_group">
                  <div className="input size_28">
                    <label htmlFor="deptNm">
                      <CustomTextField
                        fullWidth
                        name="deptNm"
                        value={signupData.deptNm}
                        onChange={handleSearchChange}
                      />
                    </label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>기관주소
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <div className="input size_10">
                    <label htmlFor="zip">
                      <CustomTextField
                        onClick={() => setAddrModalOpen(true)}
                        name="zip"
                        value={signupData?.zip}
                        onChange={handleSearchChange}
                        readOnly
                        inputProps={{ readOnly: true }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddrModalOpen(true)}
                    className="btn_tb1"
                  >
                    우편번호
                  </button>
                </div>
                <div className="input_group">
                  <label htmlFor="part1Addr">
                    <CustomTextField
                      onClick={() => setAddrModalOpen(true)}
                      name="part1Addr"
                      value={signupData?.part1Addr}
                      onChange={handleSearchChange}
                      readOnly
                      inputProps={{ readOnly: true }}
                    />
                  </label>
                  <label htmlFor="part2Addr">
                    <CustomTextField
                      name="part2Addr"
                      value={signupData?.part2Addr}
                      onChange={handleSearchChange}
                    />
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>이메일
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <label htmlFor="email1">
                    <CustomTextField
                      value={email1}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail1(e.target.value)
                      }
                    />
                  </label>
                  <span className="dash">@</span>
                  <label htmlFor="email2">
                    <CustomTextField
                      value={email2}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail2(e.target.value)
                      }
                    />
                  </label>

                  <div className="input size_28">
                    <select
                      id="ft-telno-select"
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
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>내선번호
              </th>
              <td>
                <div className="input_group">
                  <label htmlFor="ft-telno-select"></label>
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
                  <span className="dash">-</span>
                  <label htmlFor="telno2">
                    <CustomTextField
                      value={telno2}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTelno2(e.target.value)
                      }
                      inputProps={{ maxLength: 4, type: 'number' }}
                    />
                  </label>
                  <span className="dash">-</span>
                  <label htmlFor="telno3">
                    <CustomTextField
                      value={telno3}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTelno3(e.target.value)
                      }
                      inputProps={{ maxLength: 4, type: 'number' }}
                    />
                  </label>
                </div>
              </td>
              <th scope="row">
                <span className="required">*</span>핸드폰번호
              </th>
              <td>
                <div className="input_group">
                  <label htmlFor="ft-phone-select"></label>
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
                  <span className="dash">-</span>
                  <label htmlFor="phone2">
                    <CustomTextField
                      value={phone2}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPhone2(e.target.value)
                      }
                      inputProps={{ maxLength: 4, type: 'number' }}
                    />
                  </label>

                  <span className="dash">-</span>
                  <label htmlFor="phone3">
                    <CustomTextField
                      value={phone3}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPhone3(e.target.value)
                      }
                      sx={{ width: '50%' }}
                      inputProps={{ maxLength: 4, type: 'number' }}
                    />
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>신청기간
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <label htmlFor="aplyBgngYmd">
                    <CustomTextField
                      type="date"
                      name="aplyBgngYmd"
                      value={signupData?.aplyBgngYmd}
                      onChange={handleSearchChange}
                      inputProps={{
                        min: getFormatToday(),
                      }}
                    />
                  </label>
                  <span className="dash">-</span>
                  <label htmlFor="aplyEndYmd">
                    <CustomTextField
                      type="date"
                      name="aplyEndYmd"
                      value={signupData?.aplyEndYmd}
                      onChange={handleSearchChange}
                      inputProps={{
                        min: signupData.aplyBgngYmd,
                      }}
                    />
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <span className="required">*</span>IP주소
              </th>
              <td colSpan={3}>
                <div className="input_group">
                  <label htmlFor="ipAddr">
                    <CustomTextField
                      name="ipAddr"
                      value={signupData?.ipAddr}
                      onChange={handleSearchChange}
                      readOnly
                    />
                  </label>

                  <button type="button" className="btn_tb1" onClick={onCheckIp}>
                    내IP확인
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <LoadingBackdrop open={loadingBackdrop} />
      <div className="form_btns">
        <Link href="/user/login" className="btn">
          취소
        </Link>
        <button
          type="button"
          className="btn btn_submit"
          onClick={handleNextClick}
        >
          다음
        </button>
      </div>
      <AddrSearchModal
        open={addrModalOpen}
        onSaveClick={handleClickAddr}
        onCloseClick={() => setAddrModalOpen(false)}
      />
      <Box>
        <Dialog
          fullWidth={true}
          maxWidth={'sm'}
          open={ldapOpen}
          onClose={() => setLdapOpen(true)}
        >
          <DialogContent>
            <Box className="table-bottom-button-group">
              <h2>정부디렉토리 연계테이블</h2>
              <div className="button-right-align">
                <Button
                  variant="contained"
                  color="dark"
                  onClick={() => setLdapOpen(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={onSignup}
                  variant="contained"
                  form="form-modal"
                  color="primary"
                >
                  회원가입
                </Button>
              </div>
            </Box>
            <Box
              id="form-modal"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                m: 'auto',
                width: 'full',
              }}
            >
              <div id="alert-dialog-description1">
                {/* 테이블영역 시작 */}
                <div className="table-scrollable">
                  <table className="table table-bordered">
                    <caption>기존 사업자정보</caption>
                    <colgroup>
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '60%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th
                          style={{
                            backgroundColor: '#e5ebf0',
                            fontWeight: '500',
                          }}
                        >
                          이름
                        </th>
                        <td
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
                          {ldapData.govUserNm}
                        </td>
                      </tr>
                      <tr>
                        <th
                          style={{
                            backgroundColor: '#e5ebf0',
                            fontWeight: '500',
                          }}
                        >
                          조직명
                        </th>
                        <td
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
                          {ldapData.govDeptNm}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <Box
                mt={1.5}
                style={{
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                ※ 회원정보와 정부디렉토리 연계데이터가 맞으시는 경우 회원가입을
                진행하시길 바랍니다.
              </Box>
            </Box>
            {/* <LoadingBackdrop open={loadingBackdrop} /> */}
          </DialogContent>
        </Dialog>
      </Box>
    </PageContainer>
  )
}

export default SignupPage
