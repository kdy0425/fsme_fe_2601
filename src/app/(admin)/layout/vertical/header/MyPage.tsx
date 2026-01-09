import { useEffect, useState } from 'react'
import Image from "next/image";
import { IconX } from '@tabler/icons-react';
import {
  Box,
  Button,
  Typography,
  Drawer,
  IconButton,
  FormControlLabel,
  FormGroup, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SelectItem } from 'select'

import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import BlankCard from '@/app/components/shared/BlankCard'

import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { width } from '@amcharts/amcharts4/.internal/core/utils/Utils';

import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils' // 로그인 유저 정보

// 이메일 도메인 주소
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

// 내선번호 지역번호
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
  {
    label: '070',
    value: '070',
  },
]

// 휴대폰 통신사 번호
const phoneNum: SelectItem[] = [
  {
    label: '010',
    value: '010',
  },
]

type myPageObj = {
  userTsid: string
  ctpvCd: string
  instCd: string
  ctpvNm: string
  locgovNm: string
  lgnId: string
  pswd: string
  pswdInpt: string
  pswdCfrm: string 
  userNm: string
  emlAddr: string
  emlAddr1: string
  emlAddr2: string
  telno: string
  telno1: string
  telno2: string
  telno3: string
  mbtlnum: string
  mbtlnum1: string
  mbtlnum2: string
  mbtlnum3: string
  subDnEncpt: string
  certRegYn: string
  [key: string]: string | number
}

const MyPage: React.FC = () => {
  const router = useRouter()
  const [myPageInfo, setMyPageInfo] = useState<myPageObj>({
    userTsid: '',
    ctpvCd: '',
    instCd: '',
    ctpvNm: '',
    locgovNm: '',
    lgnId: '',
    pswd: '',
    pswdInpt: '',
    pswdCfrm: '',  
    userNm: '',
    emlAddr: '',
    emlAddr1: '',
    emlAddr2: '',
    telno: '',
    telno1: '',
    telno2: '',
    telno3: '',
    mbtlnum: '',
    mbtlnum1: '',
    mbtlnum2: '',
    mbtlnum3: '',
    subDnEncpt: '',
    certRegYn: '',
  })

  const [showDrawer, setShowDrawer] = useState(false)

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩 상태

  const [disabled, setDisabled] = useState<boolean>(false)  // 인증서 등록여부
  const [password, setPassword] = useState<boolean>(false)  // 패스워드 할당여부

  // 로그인 아이디 조회
  const userInfo = getUserInfo();
  const userLgnId = userInfo.lgnId;

  // 초기 데이터 로드
  useEffect(() => {
    fetchUserInfo()
  }, [showDrawer])

  // 마이페이지 조회
  const fetchUserInfo = async () => {
    try {
      const endpoint: string = 
        `/fsm/cmm/mypage/getMyPageInfo?lgnId=${userLgnId}`
      
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store', })
      
      if (response && response.resultType === 'success' && response.data) {
        // 이메일 설정
        if(response.data.emlAddr !== ''
        && response.data.emlAddr !== null
        && response.data.emlAddr !== undefined) 
        {
          if(response.data.emlAddr.includes('@')) {
            const emlArr: any[] = response.data.emlAddr.split("@")
            response.data.emlAddr1 = emlArr[0]
            response.data.emlAddr2 = emlArr[1]
          }
        }

        // 내선번호 설정
        if(response.data.telno !== ''
        && response.data.telno !== null
        && response.data.telno !== undefined
        && response.data.telno.length > 8
        && response.data.telno.length < 12) 
        {
          if (response.data.telno.substring(0,2) === '02') {
            response.data.telno1 = response.data.telno.substring(0,2)
            if (response.data.telno.length === 9) {
              response.data.telno2 = response.data.telno.substring(2,5)
              response.data.telno3 = response.data.telno.substring(5,9)
            } else {
              response.data.telno2 = response.data.telno.substring(2,6)
              response.data.telno3 = response.data.telno.substring(6,10)
            }
          } else {
            response.data.telno1 = response.data.telno.substring(0,3)
            if (response.data.telno.length === 10) {
              response.data.telno2 = response.data.telno.substring(3,6)
              response.data.telno3 = response.data.telno.substring(6,10)
            } else {
              response.data.telno2 = response.data.telno.substring(3,7)
              response.data.telno3 = response.data.telno.substring(7,11)
            }
          }
        }

        // 휴대폰번호 설정
        if(response.data.mbtlnum !== ''
          && response.data.mbtlnum !== null
          && response.data.mbtlnum !== undefined
          && response.data.mbtlnum.length === 11) 
        {
          response.data.mbtlnum1 = response.data.mbtlnum.substring(0,3)
          response.data.mbtlnum2 = response.data.mbtlnum.substring(3,7)
          response.data.mbtlnum3 = response.data.mbtlnum.substring(7,11)
        }

        // 인증서 등록여부 설정
        if(response.data.subDnEncpt !== ''
        && response.data.subDnEncpt !== null
        && response.data.subDnEncpt !== undefined) 
        {
          response.data.certRegYn = '등록'
          setDisabled(false)
        } else {
          response.data.certRegYn = '미등록'  
          setDisabled(true)
        }

        setMyPageInfo(response.data)
      } else {
        // 데이터가 없거나 실패
        setMyPageInfo(myPageInfo)
      }
    } catch (error) {
      // 에러시
      console.error("Error fetch userInfo: ", error)
      setMyPageInfo(myPageInfo)
    } finally {
    }
  }

  function checkValidation() {
    const emlAddrComb = myPageInfo.emlAddr1 + '@' + myPageInfo.emlAddr2
    const telnoComb   = myPageInfo.telno1 + myPageInfo.telno2 + myPageInfo.telno3
    const mbtlnumComb = myPageInfo.mbtlnum1 + myPageInfo.mbtlnum2 + myPageInfo.mbtlnum3
    const regexPswd  = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@!%*#?&])[A-Za-z\d@!%*#?&]{12,}$/
    const regexEmail = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+$/
    
    if (myPageInfo.pswdInpt !== '' && myPageInfo.pswdInpt !== null && myPageInfo.pswdInpt !== undefined) {
      if (myPageInfo.pswdCfrm === '' || myPageInfo.pswdCfrm === null || myPageInfo.pswdCfrm === undefined) {
        alert("비밀번호확인 값을 입력하세요.")
        return false
      }

      if (myPageInfo.pswdInpt !== myPageInfo.pswdCfrm) {
        alert("비밀번호와 비밀번호확인 값이 일치하지 않습니다.")
        return false
      }

      if (!regexPswd.test(myPageInfo.pswdInpt)) {
        alert("패스워드는 영문, 숫자, 특수문자를 포함한\n12자리 이상으로 설정해야 합니다.")
        return false
      }  
    }
    
    if((myPageInfo.pswdInpt === '' || myPageInfo.pswdInpt === null || myPageInfo.pswdInpt === undefined)
    && (myPageInfo.pswdCfrm === '' || myPageInfo.pswdCfrm === null || myPageInfo.pswdCfrm === undefined)
    && myPageInfo.emlAddr === emlAddrComb
    && myPageInfo.telno === telnoComb
    && myPageInfo.mbtlnum === mbtlnumComb) 
    {
      alert("수정된 회원 정보가 없습니다.")
      return false
    }

    if(myPageInfo.emlAddr1 === '' || myPageInfo.emlAddr1 === null || myPageInfo.emlAddr1 === undefined
    || myPageInfo.emlAddr2 === '' || myPageInfo.emlAddr2 === null || myPageInfo.emlAddr2 === undefined)
    {
      alert("이메일 항목을 입력하세요.")
      return false
    } else {
      if (!regexEmail.test(emlAddrComb)) {
        alert("올바른 이메일 형식이 아닙니다.")
        return false
      }
    }

    if(myPageInfo.telno2 === '' || myPageInfo.telno2 === null || myPageInfo.telno2 === undefined
    || myPageInfo.telno3 === '' || myPageInfo.telno3 === null || myPageInfo.telno3 === undefined)
    {
      alert("내선번호 항목을 입력하세요.")
      return false
    } else {
      if (myPageInfo.telno2.length < 3 || myPageInfo.telno3.length !== 4) {
        alert("올바른 내선번호 형식이 아닙니다.")
        return false
      }
    }

    if(myPageInfo.mbtlnum2 === '' || myPageInfo.mbtlnum2 === null || myPageInfo.mbtlnum2 === undefined
    || myPageInfo.mbtlnum3 === '' || myPageInfo.mbtlnum3 === null || myPageInfo.mbtlnum3 === undefined)
    {
      alert("휴대폰번호 항목을 입력하세요.")
      return false
    } else {
      if (myPageInfo.mbtlnum2.length !== 4 || myPageInfo.mbtlnum3.length !== 4) {
        alert("올바른 휴대폰번호 형식이 아닙니다.")
        return false
      }
    }

    return true
  }

  // 마이페이지 수정
  const updateUserInfo = async () => {

    // 사용자 정보 저장 유효성 검사
    const validation = checkValidation()
    if (!validation) { return }
    
    const cancelConfirm: boolean = confirm("회원 정보를 저장하시겠습니까?")
    if (!cancelConfirm) return

    try {
      
      setLoadingBackdrop(true)

      const emlAddrComb = myPageInfo.emlAddr1 + '@' + myPageInfo.emlAddr2
      const telnoComb   = myPageInfo.telno1 + myPageInfo.telno2 + myPageInfo.telno3
      const mbtlnumComb = myPageInfo.mbtlnum1 + myPageInfo.mbtlnum2 + myPageInfo.mbtlnum3
      
      const body = { 
        lgnId   : myPageInfo.lgnId,
        pswd    : myPageInfo.pswdCfrm,
        emlAddr : emlAddrComb,
        telno   : telnoComb,
        mbtlnum : mbtlnumComb,
      }

      const endpoint: string = `/fsm/cmm/mypage/updateMyPageInfo`
      const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' })

      if (response && response.data > 0) {
        alert("회원 정보가 저장되었습니다.")
      } else {
        alert("저장된 회원 정보 내역이 없습니다.")
      }
    } catch(error) {
      alert("회원 정보 저장에 실패하였습니다.")
      console.error("ERROR POST DATA : ", error)
    } finally {
      setLoadingBackdrop(false)
      handleDrawerClose()  // 마이페이지 모달 닫기
    }
  }

  // 인증서 등록정보 삭제
  const deleteCertificate = async () => {
    const cancelConfirm: boolean = confirm("GPKI인증서를 삭제할 경우 재등록을 하셔야 합니다.\n인증서를 영구히 삭제하시겠습니까?")
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)
      
      const body = { lgnId : myPageInfo.lgnId }    
      const endpoint: string = `/fsm/cmm/mypage/updateSubDnEncpt`
      const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' })

      if (response && response.data > 0) {
        alert("인증서 등록정보가 삭제되었습니다.")
      } else {
        alert("인증서 삭제 처리 내역이 없습니다.")
      }
    } catch(error) {
      alert("인증서 삭제에 실패하였습니다.")
      console.error("ERROR POST DATA : ", error)
    } finally {
      setLoadingBackdrop(false)
      fetchUserInfo()   // 회원정보 재조회
    }
}

  const handleInfoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const checkNum = /[0-9]/

    // 구글 패스워드 자동설정 방지
    if (name === 'pswdInpt' && !password) { 
      setPassword(true)
      return 
    } 

    if (name === 'telno2' || name === 'mbtlnum2') {
      if (value.length === 1 && value === '0') {
        alert("올바른 번호 값을 입력하세요.")
        return
      }
    }

    if (name === 'telno2' || name === 'telno3' || name === 'mbtlnum2' || name === 'mbtlnum3' ) {
      if (!checkNum.test(value) && value !== '') {
        alert("올바른 번호 값을 입력하세요.")
        return
      }
      if (value.length > 4) {
        alert("올바른 번호 값을 입력하세요.")
        return
      }
    }

    setMyPageInfo((prev) => ({ ...prev, [name]: value }))
  }

  // 마이페이지 저장
  const handleMyPageSave = async () => {
    updateUserInfo()
  }

  // 인증서 등록정보 삭제
  const handleDeleteButton = async () => {
    deleteCertificate()
  }

  // 모달 닫기 핸들러
  const handleDrawerClose = () => {
    setMyPageInfo((prev) => Object({}))
    setPassword(false)
    setShowDrawer(false) 
  }

  return (
    <div className="favorites-group">
      <Button
        className="top-btn btn-mypage"
        onClick={() => setShowDrawer(true)}
      >
        마이페이지
      </Button>
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      <Drawer
        className="custom-modal-box-wrapper"
        anchor="top"
        open={showDrawer}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { maxWidth: '1000px', width: '1000px', top: '100px', left: '50%', marginLeft: '-500px', height: '586px' } }}
      >
        <div className="custom-modal-box-inner">
          <div className="custom-modal-box-title">
            <Typography variant="h2" fontWeight={600}>
              마이페이지
            </Typography>
            <Box>
              <div className="button-right-align">
                <LoadingBackdrop open={loadingBackdrop} />
                <Button variant="contained" onClick={handleMyPageSave} color="primary" >저장</Button>
                <Button variant="outlined" color="primary" onClick={handleDrawerClose} style={{ marginLeft:'10px' }}>취소</Button>
              </div>
            </Box>
          </div>
            <Box sx={{ maxWidth: 'fullWidth', margin: '0px auto' }}>
              <TableContainer style={{ padding: '20px 40px 20px 40px' }}>
                <Table className="table table-bordered" aria-labelledby="tableTitle" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '20px' }}>
                        <span className="required" style={{ color:"red" }} >*</span> 지자체
                      </TableCell>
                      <TableCell>
                        <div className="input_group">
                          <CustomTextField 
                            type="text"
                            id="txt_ctpvNm" 
                            name="ctpvNm"
                            value={myPageInfo.ctpvNm} 
                            style={{ marginLeft: '20px' }}
                            disabled={true}
                            />
                          <CustomTextField 
                            type="text"
                            id="txt_locgovNm" 
                            name="locgovNm"
                            value={myPageInfo.locgovNm}
                            style={{ marginLeft:'10px' }}                             
                            disabled={true}
                          />  
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '20px' }}>
                        <span className="required" style={{ color:"red" }} >*</span> 아이디
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          type="text"
                          id="txt_lgnId" 
                          name="lgnId"
                          value={myPageInfo.lgnId} 
                          style={{ marginLeft: '20px' }}
                          disabled={true}
                          />                           
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '30px' }}>
                        비밀번호
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          type={password ? "password" : "text" }
                          id="txt_pswdInpt" 
                          name="pswdInpt"
                          placeholder="비밀번호 입력"
                          value={myPageInfo.pswdInpt}
                          onChange={handleInfoChange}
                          style={{ marginLeft: '20px' }}
                          disabled={false}
                          />                           
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '30px' }}>
                        비밀번호 확인
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          type={password ? "password" : "text" }
                          id="txt_pswdCfrm"
                          name="pswdCfrm"
                          placeholder="비밀번호 확인"
                          value={myPageInfo.pswdCfrm}
                          onChange={handleInfoChange}
                          style={{ marginLeft: '20px' }}
                          disabled={false}
                          />                           
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '20px' }}>
                        <span className="required" style={{ color:"red" }} >*</span> 사용자명
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          type="text"
                          id="txt_userNm" 
                          name="userNm"
                          value={myPageInfo.userNm} 
                          style={{ marginLeft: '20px' }}
                          disabled={true}
                          />                           
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '20px' }}>
                        <span className="required" style={{ color:"red" }} >*</span> 이메일
                      </TableCell>
                      <TableCell>
                        <div className="input_group">
                          <CustomTextField
                            type="text"
                            id="txt_emlAddr1" 
                            name="emlAddr1"
                            value={myPageInfo.emlAddr1} 
                            onChange={handleInfoChange}
                            style={{ marginLeft: '20px' }}
                          />
                          <span className="dash">@</span>
                          <CustomTextField
                            type="text"
                            id="txt_emlAddr2" 
                            name="emlAddr2"
                            value={myPageInfo.emlAddr2} 
                            onChange={handleInfoChange}
                          />

                          <div className="input size_28">
                          <CustomFormLabel className="input-label-none" htmlFor="slt_emlAddr2">주소</CustomFormLabel>
                            <select
                              className="custom-default-select"
                              id="slt_emlAddr2"
                              name="emlAddr2"
                              value={myPageInfo.emlAddr2} 
                              onChange={handleInfoChange}
                              style={{ width: '160px', marginLeft: '20px' }}
                            >
                              {emailDomain.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>                     
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '20px' }}>
                        <span className="required" style={{ color:"red" }} >*</span> 내선번호
                      </TableCell>
                      <TableCell>
                        <div className="input_group">
                        <CustomFormLabel className="input-label-none" htmlFor="slt_telno1">내선번호</CustomFormLabel>
                          <select
                            className="custom-default-select"
                            id="slt_telno1"
                            name='telno1'
                            value={myPageInfo.telno1} 
                            onChange={handleInfoChange}
                            style={{ width: '80px', marginLeft: '20px' }}
                          >
                            {localTelNum.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <span className="dash" style={{ marginLeft: '5px' }}>-</span>
                          <CustomTextField
                            type="text"
                            id="txt_telno2" 
                            name="telno2"
                            value={myPageInfo.telno2} 
                            onChange={handleInfoChange}
                            style={{ width: '100px', marginLeft: '5px' }}
                          />
                          <span className="dash" style={{ marginLeft: '5px' }}>-</span>
                          <CustomTextField
                            type="text"
                            id="txt_telno3" 
                            name="telno3"
                            value={myPageInfo.telno3} 
                            onChange={handleInfoChange}
                            style={{ width: '100px', marginLeft: '5px' }}
                          />
                        </div>                   
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '20px' }}>
                        <span className="required" style={{ color:"red" }} >*</span> 휴대폰번호
                      </TableCell>
                      <TableCell>
                        <div className="input_group">
                        <CustomFormLabel className="input-label-none" htmlFor="slt_mbtlnum1">휴대폰번호</CustomFormLabel>
                          <select
                            className="custom-default-select"
                            id="slt_mbtlnum1"
                            name='mbtlnum1'
                            value={myPageInfo.mbtlnum1} 
                            onChange={handleInfoChange}
                            style={{ width: '80px', marginLeft: '20px' }}
                          >
                            {phoneNum.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <span className="dash" style={{ marginLeft: '5px' }}>-</span>
                          <CustomTextField
                            type="text"
                            id="txt_mbtlnum2" 
                            name="mbtlnum2"
                            value={myPageInfo.mbtlnum2} 
                            onChange={handleInfoChange}
                            style={{ width: '100px', marginLeft: '5px' }}
                          />

                          <span className="dash" style={{ marginLeft: '5px' }}>-</span>
                          <CustomTextField
                            type="text"
                            id="txt_mbtlnum3" 
                            name="mbtlnum3"
                            value={myPageInfo.mbtlnum3} 
                            onChange={handleInfoChange}
                            style={{ width: '100px', marginLeft: '5px' }}
                          />
                        </div>                      
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '160px', textAlign: 'left', paddingLeft: '30px' }}>
                        인증서 등록여부
                      </TableCell>
                      <TableCell>
                        <div className="input_group">
                          <CustomTextField 
                            type="text"
                            id="txt_subDnEncpt" 
                            name="subDnEncpt"
                            value={myPageInfo.certRegYn} 
                            style={{ marginLeft: '20px' }}
                            disabled={true}
                            />
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={handleDeleteButton} 
                            style={{ marginLeft:'10px' }}
                            disabled={disabled}
                          >
                            삭제
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
        </div>
      </Drawer>
    </div>
  );
};

export default MyPage
