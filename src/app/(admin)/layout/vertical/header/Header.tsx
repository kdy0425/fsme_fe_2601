import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import { useSelector, useDispatch } from '@/store/hooks'
import UserProfile from './UserProfile'
import { AppState } from '@/store/store'
import Logo from '../../shared/logo/Logo'
import Navigation from './Navigation'
import { useContext, useEffect, useState } from 'react'
import Badge from '@mui/material/Badge'

import { userProfileType } from '@/types/auth/auth'
import { getAuthInfo } from '@/utils/fsms/common/user/authUtils'
import MyPage from './MyPage'
import Favorites from './Favorites'
import LogoutButton from '@/app/components/fsms/fsm/user/LoginButton'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import NtcnDialog from '../../../_components/NtcnDialog'

export interface NtcnRow {
  ntcnRegYmd: string //게시일자
  ntcnUrl: string //이동 URL (공지사항 이외 구분 필요)
  ntcnTtl: string //업무구분명
  ntcnCn: string //제목
  ntcnSn: string //알림일련번호
  delYn?: string //삭제여부 전달용
}

const Header = () => {
  // drawer
  const customizer = useSelector((state: AppState) => state.customizer)
  const dispatch = useDispatch()

  const { setUserAuthInfo } = useContext(UserAuthContext)

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }))
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }))

  const [rows, setRows] = useState<NtcnRow[]>([]) // 가져온 로우 데이터

  // 알림카운트
  const [rtcnCnt, setRtcnCnt] = useState(0)
  const [rtcnMoalFlag, setRtcnModalFlag] = useState(false)

  /* 회원프로필 */
  const [authStatus, setAuthStatus] = useState<userProfileType>({})
  /* 로그인 여부 */
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  /** 토큰 기반 로그인 정보 호출 및 할당 */
  useEffect(() => {
      const fetchAuthInfo = async () => {
      const authInfo = await getAuthInfo()

      setAuthStatus(authInfo.authSttus ?? {})
      setIsLoggedIn(authInfo.isLoggedIn)
      setUserAuthInfo(authInfo.authSttus)
      if (authInfo.isLoggedIn) {
        //로그인 되어있을때만 알림 호출
        fetchData()
      }
    }
    fetchAuthInfo()
  }, [])

  useEffect(() => {
    setRtcnCnt(rows.length)
  }, [rows])

  const handleReload = () => {
    fetchData()
  }

  const handleDetailCloseModal = () => {
    setRtcnModalFlag((prev) => false)
  }

  const handleClick = () => {
    setRtcnModalFlag(true)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/mai/ntcn/getAllRtroact`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        // setRtcnCnt(rows.length)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setRtcnCnt(0)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setRtcnCnt(0)
    } finally {
    }
  }

  return (
    <AppBarStyled
      position="relative"
      color="default"
      className="header-wrapper"
    >
      <ToolbarStyled className="header-inner">
        <Logo />

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          {/* 로그인/프로필 분기처리 */}
          {isLoggedIn ? (
            <>
              {/* <UserProfile
                userNm={authStatus.userNm}
                authorities={authStatus.authorities}
              /> */}
              <Stack spacing={1} className="global-link-wrapper">
                <Link href="/ilp" className='main-info-link' target = '_blank' rel='noopener noreferrer'>
                  <button type="button" className='top-btn btn-gradient-contain'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.1068 1C10.1068 1 8.3775 4.96798 3 4.11121V12.1577C3.13819 12.6789 2.51832 16.9074 10.1068 19C17.6953 16.9074 17.0755 12.6789 17.2136 12.1577V4.11121C11.8361 4.96798 10.1068 1 10.1068 1Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7.44922 10.5621L9.88133 12.5915L13.1268 8.76172" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    부정수급방지시스템
                  </button>
                </Link>
                {/* <button type="button" className='top-btn btn-blue-contain'>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.99594 2L14.5947 6.68768C15.5042 7.61413 16.1236 8.79471 16.3748 10.0801C16.6259 11.3655 16.4975 12.6979 16.0056 13.9088C15.5138 15.1198 14.6807 16.1548 13.6116 16.8831C12.5426 17.6113 11.2858 18 10 18C8.71424 18 7.45736 17.6113 6.38835 16.8831C5.31934 16.1548 4.48622 15.1198 3.99438 13.9088C3.50253 12.6979 3.37406 11.3655 3.62521 10.0801C3.87636 8.79471 4.49585 7.61413 5.40531 6.68768L9.99594 2Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.5 14.5C11.6667 14.3333 13.5 13.5 13.5 11" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                  유가보조금관리시스템 
                </button> */}
                <span className="username-zone">
                  <span className="username">{authStatus.userNm}</span>님이
                  로그인하셨습니다.
                </span>
                <LogoutButton />
                {/* <Button className="top-btn btn-mypage">마이 페이지</Button> */}
                {/* 마이 페이지 */}
                <MyPage />
                {/* 즐겨찾는 메뉴 */}
                <Favorites />
                {/* <Button className="top-btn btn-sitemap">사이트맵</Button> */}
                <Button className="top-btn btn-alarm" onClick={handleClick}>
                  <Badge color="primary" badgeContent={rtcnCnt}>
                    알림
                  </Badge>
                </Button>
              </Stack>
            </>
          ) : (
            <Stack spacing={1} className="global-link-wrapper">
              <Link className="top-btn btn-login" href={'/user/login'}>
                로그인
              </Link>
            </Stack>
          )}
        </Stack>
      </ToolbarStyled>
      <NtcnDialog
        size="sm"
        title="알림내용"
        reloadFunc={handleReload}
        handleDetailCloseModal={handleDetailCloseModal}
        ntcnRows={rows}
        open={rtcnMoalFlag}
      ></NtcnDialog>
    </AppBarStyled>
  )
}

export default Header
