'use client'

import '@/app/assets/css/layoutFsm.css'
import Box from '@mui/material/Box'
import Link from 'next/link'

// components

import PageContainer from '@/components/container/PageContainer'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import Logo from '@/app/(admin)/layout/shared/logo/Logo'
import { useMessageActions } from '@/store/MessageContext' // 메시지 액션 훅 임포트
import { ApiError, ApiResponse, getCombinedErrorMessage } from '@/types/message'
import { apiClient, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getAuthInfo } from '@/utils/fsms/common/user/authUtils'
import axios from 'axios'

import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import FormDialogId from './_components/FormDialogId'
import FormDialogPw from './_components/FormDialogPw'
import PrivacyPolicyDescription from './_components/PrivacyPolicyDescription'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { LayersTwoTone } from '@mui/icons-material'
import { getFileDown } from '@/utils/fsms/common/comm'
import Cookies from 'js-cookie'
import {
  FSM_COOKIE_KEY,
  ILP_COOKIE_KEY,
} from '@/utils/fsms/common/useTabHistory'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setMessage, clearMessage } = useMessageActions() // 메시지 설정 함수 사용
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState<boolean>(false)
  const [lgnId, setLgnId] = useState('')
  const [pswd, setPswd] = useState('')

  const [openId, setOpenId] = useState<boolean>(false)
  const [openPw, setOpenPw] = useState<boolean>(false)

  const handleLgnIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLgnId(e.target.value)
  }

  const handlePswdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPswd(e.target.value)
  }

  const handleRegGpki = () => {
    if (!lgnId) {
      alert('아이디를 입력해주세요.')
      return
    }
    if (!pswd) {
      alert('비밀번호를 입력해주세요.')
      return
    }
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
      const body = { subDnEncpt: event.data, lgnId: lgnId, pswd: pswd }
      const endpoint: string = `/fsm/cmm/us/cm/updateGpki`
      const response = await sendHttpRequest('PUT', endpoint, body, false, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        if (response.data.resultCd == 'N')
          alert('비밀번호가 일치하지 않습니다.')
        else if (response.data.resultCd == 'D') alert('등록된 인증서입니다.')
        else if (response.data.resultCd == 'A') alert('등록되지 않은 ID입니다.')
        else {
          setLgnId('')
          setPswd('')
          alert('인증서 등록되었습니다.')
        }
      } else {
        alert('인증서 등록오류입니다.')
      }
    } catch {
      alert('인증서 등록오류입니다.')
    }
  }

  const handleLoginGpki = () => {
    clearMessage()
    window.removeEventListener('message', messageLoginHandler)
    const width = 450
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

    window.addEventListener('message', messageLoginHandler)
  }

  const messageLoginHandler = async (event: MessageEvent) => {
    //if (event.origin !== process.env.NEXT_PUBLIC_API_DOMAIN) return
    window.removeEventListener('message', messageLoginHandler)

    try {
      const response: ApiResponse = await apiClient({
        endpoint: '/api/fsm/user/login',
        method: 'POST',
        body: { subDn: event.data },
      })
      setMessage({
        resultType: 'success',
        status: response.status,
        message: response.message,
      })
      setTimeout(() => {
        clearMessage()
        Cookies.remove(FSM_COOKIE_KEY) // fsm 메뉴탭 히스토리 삭제
        Cookies.remove(ILP_COOKIE_KEY) // ilp 메뉴탭 히스토리 삭제
        router.push('/') // 홈페이지로 리다이렉트
      }, 2000)
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.resultType) {
          case 'fail':
            //유효성검사 오류
            setMessage({
              resultType: error.resultType,
              status: error.status,
              message: getCombinedErrorMessage(error),
            })
            break
          case 'error':
            // 'error'는 서버 측 오류
            alert(error.message)
            break
        }
      }
    }
  }

  /** 로그인 요청 */
  const loginSubmit = async () => {
    clearMessage()

    try {
      const response: ApiResponse = await apiClient({
        endpoint: '/api/fsm/user/login',
        method: 'POST',
        body: { lgnId, pswd },
      })
      setMessage({
        resultType: 'success',
        status: response.status,
        message: response.message,
      })
      setTimeout(() => {
        clearMessage()
        Cookies.remove(FSM_COOKIE_KEY) // fsm 메뉴탭 히스토리 삭제
        Cookies.remove(ILP_COOKIE_KEY) // ilp 메뉴탭 히스토리 삭제
        router.push('/') // 홈페이지로 리다이렉트
      }, 2000)
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.resultType) {
          case 'fail':
            //유효성검사 오류
            setMessage({
              resultType: error.resultType,
              status: error.status,
              message: getCombinedErrorMessage(error),
            })
            break
          case 'error':
            // 'error'는 서버 측 오류
            setMessage({
              resultType: 'error',
              status: error.status,
              message: error.message,
            })
            break
        }
      }
    }
  }

  /** 로그인 완료 후 페이지 새로고침 */
  useEffect(() => {
    router.refresh()
  }, [])

  // useEffect(() => {
  //   setLgnId(lgnId)
  //   console.log('lgnId :',lgnId)
  // }, [openId]);

  /** 비로그인 접근으로 인한 리다이렉트 시 */
  useEffect(() => {
    const redirected = searchParams.get('redirected')
    if (redirected === 'true') {
      // alert('로그인 후 이용해주시기 바랍니다.');
      // setTimeout(() => {
      //   // clearMessage();
      //   router.push('/'); // 홈페이지로 리다이렉트
      // }, 2000);
    }
  }, [searchParams])

  const handleClickClose = () => {
    setOpenId(false)
    setOpenPw(false)
    setPrivacyPolicyOpen(false)
  }

  const idSearchModalOpen = () => {
    setOpenId(true)
  }

  const pwSearchModalOpen = () => {
    setOpenPw(true)
  }

  const localIpChk = async () => {
    // const res = axios.get('https://geolocation-db.com/json/')
    //           .then((res) => {
    //             console.log("data : ", res.data.IPv4)
    //             alert('현재 접속하신 IP 는 '+res.data.IPv4+' 입니다.')
    //           })

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/cmm/us/cm/getOneIpAddr`
      const response = await sendHttpRequest('GET', endpoint, null, false, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        alert('현재 접속하신 IP 는 ' + response.data.ipAddr + ' 입니다.')
      } else {
        // 데이터가 없거나 실패
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  return (
    <PageContainer title="로그인 페이지" description="로그인 페이지 가이드">
      <div className="bg_page flex_center">
        <Box display="flex" alignItems="center" justifyContent="center">
          <Logo />
        </Box>

        <div className="login_card">
          <div className="login_content">
            <div className="login_box">
              <h2 className="box_title">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M30.533 5.873c-3.275 0-6.257-1.173-8.601-3.105a3.397 3.397 0 0 0-4.303 0C15.284 4.7 12.302 5.873 9.027 5.873c-.177 0-.354-.004-.531-.01C6.029 5.763 4 7.798 4 10.269v7.394c0 13.126 9.87 18.376 14 19.999 1.146.45 2.418.45 3.564 0 4.13-1.617 13.997-6.85 13.997-20V10.27c0-2.47-2.03-4.506-4.496-4.406-.177.006-.354.01-.532.01Z"
                    fill="#598DDC"
                  />
                  <path
                    d="M17.906 25.894h-.045a1.915 1.915 0 0 1-1.353-.612L11.51 19.85a1.9 1.9 0 1 1 2.799-2.573l3.668 3.987 7.906-7.79a1.902 1.902 0 0 1 2.67 2.708l-9.307 9.169a1.9 1.9 0 0 1-1.334.547l-.006-.003Z"
                    fill="#fff"
                  />
                </svg>
                <span>GPKI인증서 등록</span>
              </h2>
              <div className="login_form_wrap">
                <div className="login_form">
                  <div className="input_group">
                    <div className="input">
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="lgnId"
                      ></CustomFormLabel>
                      <input
                        type="text"
                        id="lgnId"
                        placeholder="아이디를 입력하세요."
                        className="id"
                        value={lgnId}
                        onChange={handleLgnIdChange}
                      />
                    </div>
                  </div>
                  <div className="input_group">
                    <div className="input">
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="pswd"
                      ></CustomFormLabel>
                      <input
                        type="password"
                        id="pswd"
                        value={pswd}
                        placeholder="비밀번호를 입력하세요."
                        className="password"
                        onChange={handlePswdChange}
                      />
                    </div>
                  </div>
                </div>
                <button className="login_form_submit" onClick={handleRegGpki}>
                  인증서 등록
                </button>
              </div>
            </div>
            <div className="login_box">
              <h2 className="box_title">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M27.673 19.655a1.946 1.946 0 0 1-1.945-1.945v-7.125a5.704 5.704 0 0 0-5.699-5.698 5.702 5.702 0 0 0-5.698 5.698v7.125a1.946 1.946 0 0 1-1.945 1.945 1.946 1.946 0 0 1-1.945-1.945v-7.125C10.444 5.301 14.745 1 20.029 1c5.284 0 9.588 4.301 9.588 9.588v7.125a1.946 1.946 0 0 1-1.944 1.945v-.003Z"
                    fill="#C6D2E7"
                  />
                  <path
                    d="M24.639 13.552h-9.216A9.423 9.423 0 0 0 6 22.975v6.603A9.423 9.423 0 0 0 15.423 39h9.216a9.423 9.423 0 0 0 9.423-9.423v-6.603a9.423 9.423 0 0 0-9.423-9.423Z"
                    fill="#5398FF"
                  />
                  <path
                    d="M23.274 26.035a3.243 3.243 0 0 1-6.483 0 3.243 3.243 0 0 1 6.483 0Z"
                    fill="#fff"
                  />
                </svg>
                <span>GPKI인증서 로그인</span>
              </h2>
              <p>행정전자서명 인증서(GPKI)로 로그인해 주시기 바랍니다.</p>
              <button
                type="button"
                className="login_button"
                onClick={
                  String(process.env.NEXT_PUBLIC_API_DOMAIN).indexOf('uga') > -1
                    ? handleLoginGpki
                    : loginSubmit
                }
              >
                로그인
              </button>
            </div>
          </div>
          <div className="login_links">
            <div className="item">
              <Link href="/user/signup">회원가입</Link>
            </div>
            <div className="item">
              <span onClick={idSearchModalOpen}>아이디찾기</span>
            </div>
            <div className="item">
              <span onClick={pwSearchModalOpen}>비밀번호변경</span>
            </div>
            <div className="item">
              <span onClick={localIpChk}>IP확인</span>
            </div>
            <div className="item">
              <span
                onClick={() =>
                  getFileDown(
                    `${process.env.NEXT_PUBLIC_API_DOMAIN}/gpkisecureweb/client/setup/GPKISecureWebSetup.exe`,
                    'GPKISecureWebSetup.exe',
                  )
                }
              >
                GPKI모듈 수동설치
              </span>
            </div>
            <div className="item">
              <span
                onClick={() => {
                  setPrivacyPolicyOpen(true)
                }}
              >
                <strong>개인정보처리방침</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
      <FormDialogId
        open={openId}
        handleClickClose={handleClickClose}
        size="lg"
      />
      <FormDialogPw
        open={openPw}
        handleClickClose={handleClickClose}
        size="lg"
      />
      <PrivacyPolicyDescription
        open={privacyPolicyOpen}
        handleConse={handleClickClose}
        size="md"
      />
    </PageContainer>
  )
}
