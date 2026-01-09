import React, { useState, useContext, useEffect } from 'react'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import NavListing from './NavListing/NavListing'

// components 모듈
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import SearchRadioModal from './DataResearch/SearchRadioModal'

import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Search from './Search'

const Navigation = () => {
  const router = useRouter()

  const [openModal, setOpenModal] = useState<boolean>(false)

  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // 관리자여부

  useEffect(() => {
    // authInfo에서 roles의 첫 번째 값이 "Admin"인지 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles.includes('ADMIN'))
    }
  }, [authInfo])

  return (
    <Box className="top-navigation-wrapper top-nevi-all">
      {/* ------------------------------------------- */}
      {/* 상단 메뉴 */}
      {/* ------------------------------------------- */}
      <Container
        className="top-navigation-inner top-total-search"
        style={{ gap: '15px' }}
      >
        {/* 최대 높이와 스크롤 기능 추가 */}
        <NavListing />

        <div className="navbar-btn-wrapper">
          {/* <a href="/site-map" className="header-right-menu header-menu-all">전체메뉴 열기</a> */}
          {/* <a href="javascript:;" className="header-right-menu header-menu-search">차량검색</a> */}
        </div>

        <div className="navbar-btn-wrapper">
          {/* 메뉴 버튼 */}
          <a
            href="#"
            className="header-right-menu header-menu-search green"
            onClick={(e) => {
              e.preventDefault() // 기본 동작 방지
              setOpenModal(true)
            }}
          >
            차량검색
          </a>
        </div>

        <SearchRadioModal
          isOpen={openModal}
          setClose={() => setOpenModal(false)}
        />
      </Container>
    </Box>
  )
}

export default React.memo(Navigation)
