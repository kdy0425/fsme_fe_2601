import Menudata, { MenuItem } from '../Menudata'
import { usePathname } from 'next/navigation'
import List from '@mui/material/List'
import NavItem from '../NavItem/NavItem'
import NavCollapse from '../NavCollapse/NavCollapse'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Menu } from '../../sidebar/SidebarItems'
import { useEffect, useState } from 'react'

//menu ------>  MenuItem로 바꾸기 위한 함수
function convertRowToMenuitemsType(menu: Menu): MenuItem {
  return {
    id: menu.menuTsid,
    title: menu.menuNm,
    href: cleanUrl(menu.urlAddr as string),
    target: undefined, // _blank 이렇게 넣거나 아무것도 없거나이다. 잘 모르겠다.
    elementTitle: menu.npagYn === 'Y' ? '새창 띄우기' : undefined,
    children:
      menu.children && menu.children.length > 0
        ? menu.children.map(convertRowToMenuitemsType)
        : undefined,
  }
}

// 재귀적으로 useYn이 'Y'가 아닌 경우 거름.
const filterAndConvertMenu = (menu: Menu): MenuItem | null => {
  // `useYn`이 'Y'가 아닌 경우 null 반환
  if (menu.useYn !== 'Y') return null

  // children이 있는 경우 재귀적으로 필터링과 변환
  const filteredChildren = menu.children
    ? menu.children
        .map(filterAndConvertMenu) // 각 하위 메뉴를 재귀적으로 확인
        .filter((child) => child !== null) // 유효한 하위 메뉴만 남김
    : undefined

  // 현재 메뉴를 MenuitemsType 형태로 변환
  return {
    ...convertRowToMenuitemsType(menu),
    children: filteredChildren,
  }
}

// API로 부터 받는 urlAddr의 경로중에서 /fsm,   /** 를 제거해서 올바른 경로를 매핑하기 우
function cleanUrl(url: string): string {
  return url.replace('/fsm', '').replace('/**', '')
}

const NavListing = () => {
  const pathname = usePathname()
  const pathDirect = pathname
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'))
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]) // 메뉴 항목을 상태로 설정

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
        // 현재 루트에서 시작되므로 ROOT만 빼왔다.
        const rootMenus = response.data.filter(
          (menu: Menu) => menu.menuNm === 'ROOT',
        )[0]
        const mappedData = rootMenus.children //  원래는  const mappedData = response.data 였다.

          // useYn Y인 것만 빼는 것 생략
          //.map(filterAndConvertMenu).filter((menu: Menu) => menu !== null) // useYn이 'Y'인 경우에만 필터링
          .map((menu: Menu) => convertRowToMenuitemsType(menu))

        setMenuItems(mappedData)
      } else {
        console.error('No data found or request failed')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <List
      className="top-navigation-list"
      style={{
        backgroundColor: 'white',
      }}
    >
      {menuItems.map((item) => {
        if (item.children) {
          return (
            <NavCollapse
              menu={item}
              pathDirect={pathDirect}
              pathWithoutLastPart={pathWithoutLastPart}
              level={1}
              key={item.id}
              onClick={undefined}
            />
          )

          // {/********서브메뉴의 리스트가 없을 때**********/}
        } else {
          return (
            <NavItem
              item={item}
              key={item.id}
              pathDirect={pathDirect}
              onClick={function (): void {
                throw new Error('기능이 구현되지 않았습니다.')
              }}
            />
          )
        }
      })}
    </List>
  )
}
export default NavListing
