import React from 'react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from '@/store/hooks'
import { usePathname } from 'next/navigation'

// mui imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import useMediaQuery from '@mui/material/useMediaQuery'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'

// custom imports
import NavItem from './NavItem'
import NavCollapse from './NavCollapse'
import NavGroup from './NavGroup/NavGroup'
import { AppState } from '@/store/store'
import { toggleMobileSidebar } from '@/store/customizer/CustomizerSlice'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import DetailSearch from '../navbar-top/DetailSearch'

// components 모듈
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { MenuitemsType } from './MenuItems'
import { Padding } from '@mui/icons-material'

// API로 부터 가져올 데이터를 매핑할 타입 선언
export interface Menu {
  children?: Menu[]
  menuTsid?: string // 메뉴ID
  menuNm?: string // 메뉴명
  title?: string
  upMenuTsid?: string // 상위메뉴
  urlAddr?: string // URL 주소
  menuSeq?: string // 메뉴 순서
  navlabel?: boolean
  useYn?: string
  menuExpln?: string // 메뉴 설명
  npagYn?: string // 새창 여부
  httpDmndMethNm?: string // Http 요청 메서드명
}

// menu ------> MenuitemsType로 바꾸기 위한 함수
function convertRowToMenuitemsType(menu: Menu): MenuitemsType {
  return {
    id: menu.menuTsid,
    navlabel: menu.upMenuTsid === '0000000000000' ? true : false,
    subheader: menu.upMenuTsid === '0000000000000' ? menu.menuNm : undefined,
    upMenuTsid: menu.upMenuTsid,
    title: menu.menuNm,
    href: cleanUrl(menu.urlAddr as string),
    variant: cleanUrl(menu.urlAddr as string),
    external: menu.npagYn === 'Y',
    children:
      menu.children && menu.children.length > 0
        ? menu.children.map(convertRowToMenuitemsType)
        : undefined,
  }
}

// API로 부터 받는 urlAddr의 경로중에서 /fsm, /** 를 제거해서 올바른 경로를 매핑하기 위함
function cleanUrl(url: string): string {
  return url.replace('/fsm', '').replace('/**', '')
}

const SidebarItems = () => {
  const pathname = usePathname()
  const pathDirect = pathname
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'))
  const customizer = useSelector((state: AppState) => state.customizer)
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'))
  const hideMenu: any = lgUp
    ? customizer.isCollapse && !customizer.isSidebarHover
    : ''
  const [menuItems, setMenuItems] = useState<MenuitemsType[]>([]) // 메뉴 항목을 상태로 설정
  const dispatch = useDispatch()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const endpoint = `/fsm/cmm/cmmn/cm/getAllUserFsmMenu`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const rootMenus = response.data.filter(
          (menu: Menu) => menu.menuNm === 'ROOT',
        )[0]
        const mappedData = rootMenus.children.map((menu: Menu) =>
          convertRowToMenuitemsType(menu),
        )
        setMenuItems(mappedData)
      } else {
        console.error('No data found or request failed')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const [openSearchLayer, setOpenSearchLayer] = React.useState(false)

  const onFocus = (e: any) => {
    setOpenSearchLayer(true)
  }
  const onBlur = (e: any) => {
    setOpenSearchLayer(false)
  }

  // 현재 경로에 맞는 상위 부모 메뉴인지 확인하는 함수
  const isParentActive = (menuItem: MenuitemsType): boolean => {
    if (menuItem.href && pathname?.startsWith(menuItem.href)) {
      return true
    }
    if (Array.isArray(menuItem.children)) {
      return menuItem.children.some((child) => isParentActive(child))
    }
    return false
  }

  const isKbfpsPage = pathname?.startsWith('/sta/kbfps')

  // 현재 경로와 관련된 메뉴 항목만 렌더링
  const filteredMenuItems = isKbfpsPage
    ? menuItems
    : menuItems.filter(isParentActive)

  // 메뉴 아이템을 재귀적으로 렌더링하는 함수
  const renderMenuItems = (items: MenuitemsType[]) => {
    return items.map((item) => {
      if (item.subheader) {
        // 서브헤더 렌더링
        return (
          <React.Fragment key={item.id}>
            <NavGroup item={item} hideMenu={hideMenu} />
            {item.children && item.children.length > 0 && (
              <Box sx={{ pl: hideMenu ? 1 : 3 }}>
                {renderMenuItems(item.children)}
              </Box>
            )}
          </React.Fragment>
        )
      } else if (item.children && item.children.length > 0) {
        // 서브 메뉴가 있는 경우 NavCollapse를 렌더링
        return (
          <NavCollapse
            menu={item}
            pathDirect={pathDirect}
            hideMenu={hideMenu}
            pathWithoutLastPart={pathWithoutLastPart}
            level={1}
            key={item.id}
            onClick={() => dispatch(toggleMobileSidebar())}
          />
        )
      } else {
        // 서브 메뉴가 없는 경우 NavItem을 렌더링
        return (
          <NavItem
            item={item}
            key={item.id}
            pathDirect={pathDirect}
            hideMenu={hideMenu}
            onClick={() => dispatch(toggleMobileSidebar())}
          />
        )
      }
    })
  }

  return (
    <Box sx={{ px: 3 }} className="sidebar-nav-wrapper">
      {/* <Container className="top-navigation-inner top-total-search"> */}
      {/* 통합검색 시작 */}
      {/* <div className="total-search-wrapper" style={{ maxWidth: '120%' }}>
          <div className="total-search-inner">
            <div className="input-group">
              <CustomFormLabel htmlFor="ft-fname-input-01" className="input-label-none">
                label명
              </CustomFormLabel>
              <CustomTextField
                id="ft-fname-input-01"
                className="form-control total-search-bar"
                placeholder="검색어를 입력하세요."
                onFocus={(e: any) => onFocus(e)}
                onBlur={(e: any) => onBlur(e)}
                style={{fontSize:'12px'}}
              />
              <span className="input-group-btn">
                <Button
                  variant="contained"
                  color="primary"
                  className="btn search-btn"
                  title="검색어 버튼"
                ></Button>
              </span>
            </div>
            <DetailSearch />
          </div>
          <div className="search-layer">
            <div className={openSearchLayer ? 'search-select on' : 'search-select'}>
              <ul>
                <li>검색어</li>
                <li>검색어</li>
                <li>검색어</li>
              </ul>
            </div>
          </div>
        </div> */}
      {/* </Container> */}
      <List sx={{ pt: 0 }} className="sidebarNav">
        {renderMenuItems(filteredMenuItems)}
      </List>
    </Box>
  )
}

export default SidebarItems
