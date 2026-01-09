'use client'

/* React */
import React, { useState, useEffect } from 'react'
import { useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'

/* Next */
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

/* mui */
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { styled, useTheme } from '@mui/material/styles'

/* 레이아웃 컴포넌트 */
import Header from './layout/vertical/header/Header'
import Footer from './layout/vertical/footer/Footer'
import Navigation from './layout/vertical/navbar-top/Navigation'
import Sidebar from './layout/vertical/sidebar/Sidebar'

/* 공통컴포넌트 */
import CustomKeepAlive from '../components/container/CustomKeepAlive'
import HistorySlider from '@/components/history/HistorySlider'

/* css */
import '@/app/assets/css/layoutFsm.css' // 포털시스템 스타일

/* js */
import { useTabHistory } from '@/utils/fsms/common/useTabHistory'
import { getMenuList } from '@/utils/fsms/common/comm'

/* type */
import { Menu } from './layout/vertical/sidebar/SidebarItems'

const BodyContainerWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}))

const BodyContainerInner = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  zIndex: 1,
  width: '100%',
  backgroundColor: 'transparent',
}))

const BodyContent = styled('div')(() => ({}))

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  const pathname = usePathname() // usePathname 사용하여 경로 가져오기
  const isIndexPage = pathname === '/ilp'
  const isPrivacyPage = pathname.indexOf('privacy') > -1
  const customizer = useSelector((state: AppState) => state.customizer)
  const theme = useTheme()

  // 메뉴 이동기록 탭
  const { tabs, add, remove, removeAll } = useTabHistory()

  // 화면 DOM 상태관리
  const [pageMap, setPageMap] = useState<
    Record<string, React.ComponentType<any>>
  >({ '/ilp': dynamic(() => import('./ilp/page')) })
  const [menuList, setMenuList] = useState<Menu[]>([])

  // 최초 layout선언시 하위 메뉴리스트 가져옴
  useEffect(() => {
    init()
  }, [])

  // url(화면) 이동시마다 해당화면 이동기록 탭 생성
  useEffect(() => {
    if (!isIndexPage) {
      if (menuList.length !== 0) {
        const menuInfo = menuList.find((item) => item.urlAddr === pathname)
        add({ title: menuInfo?.menuNm ?? '', url: menuInfo?.urlAddr ?? '' })
        setPageMap((prev) => {
          if (prev[menuInfo?.urlAddr ?? '']) {
            return prev
          }

          return {
            ...prev,
            [menuInfo?.urlAddr ?? '']: dynamic(
              () => import('.' + menuInfo?.urlAddr + '/page'),
            ),
          }
        })
        document.title = menuInfo?.menuNm ?? '유가보조금 관리시스템'
      } else {
        // url창 또는 a태그로 진입시 기존 이동한 메뉴이력 전부 제거
        removeAll()
      }
    }
  }, [pathname, menuList])

  const init = async () => {
    const list: Menu[] = await getMenuList('ilp')
    setMenuList(list)
  }

  return (
    <BodyContainerWrapper
      className={`body-container-wrapper page-fsm-wrapper ${isIndexPage ? 'page-fsm-main' : ''}`}
    >
      {/* ------------------------------------------- */}
      {/* Body Wrapper */}
      {/* ------------------------------------------- */}
      <BodyContainerInner className="body-container-inner">
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header />

        {/* ------------------------------------------- */}
        {/* Navigation */}
        {/* ------------------------------------------- */}
        <Navigation />

        {/* 인덱스 페이지가 아닌 경우에만 Navigation을 표시 */}
        <BodyContent className="body-content">
          {/* ------------------------------------------- */}
          {/* Sidebar */}
          {/* ------------------------------------------- */}
          {!isIndexPage && <Sidebar />}
          {/* PageContent */}
          <Container className={'page-content-wrapper'}>
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}
            <Box className="page-content-inner">
              {/* <Outlet /> */}
              <div style={{ display: 'flex' }}>
                <main
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  {/* 메인페이지가 아닐경우에만 메뉴 히스토리 생성 */}
                  {!isIndexPage ? (
                    <HistorySlider
                      items={tabs}
                      onRemove={remove}
                      onRemoveAll={removeAll}
                      pageMap={pageMap}
                      setPageMap={setPageMap}
                    />
                  ) : null}

                  <div style={{ flex: 1, position: 'relative' }}>
                    <CustomKeepAlive pageMap={pageMap} path={pathname} />
                  </div>
                </main>
              </div>
              {/* <Index /> */}
            </Box>
            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
        </BodyContent>
        <Footer />
      </BodyContainerInner>
    </BodyContainerWrapper>
  )
}
