import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { usePathname } from 'next/navigation'

// mui imports
import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { styled } from '@mui/material/styles'
import { useSelector } from '@/store/hooks'

// custom imports
import NavItem from '../NavItem/NavItem'

// plugins
import { AppState } from '@/store/store'
import UserAuthContext from '@/app/components/context/UserAuthContext'

type NavGroupProps = {
  [x: string]: any
  navlabel?: boolean
  subheader?: string
  title?: string
  href?: any
  elementTitle?: string
}

interface NavCollapseProps {
  menu: NavGroupProps
  level: number
  pathWithoutLastPart: any
  pathDirect: any
  onClick: any
}

// 드롭다운 메뉴 구성 요소
const NavCollapse = ({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
}: NavCollapseProps) => {
  const theme = useTheme()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [openTopSubNav, setOpenTopSubNav] = React.useState(false)
  const customizer = useSelector((state: AppState) => state.customizer)
  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // 관리자여부

  useEffect(() => {
    // authInfo에서 roles의 첫 번째 값이 "Admin"인지 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles.includes('ADMIN'))
    }
  }, [authInfo])

  React.useEffect(() => {
    setOpen(false)
    menu.children.forEach((item: any) => {
      if (item.href === pathname) {
        setOpen(true)
      }
    })
  }, [pathname, menu.children])

  const ListItemStyled = styled(ListItemButton)(() => ({
    width: 'auto',
    padding: '5px 10px',
    position: 'static',
    flexGrow: 'unset',
    gap: '10px',
    borderRadius: `${customizer.borderRadius}px`,
    whiteSpace: 'nowrap',
    color:
      open || pathname.includes(menu.href) || level < 1
        ? 'white'
        : theme.palette.text.secondary,
    backgroundColor:
      open || pathname.includes(menu.href) ? theme.palette.primary.main : '',

    '&:hover': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        color: 'white',
        backgroundColor: theme.palette.primary.main,
      },
    },
    '&:hover .top-sub-nav-wrapper, &:hover .top-sub-nav-wrapper, .top-sub-nav-wrapper.top-sub-nav-open':
      {
        display: 'block',
      },
    ...(level === 2 && {
      '&:hover': {
        color: 'black',
        backgroundColor: 'inherit',
      },
    }),
  }))

  const ListSubMenuWrapper = styled(Box)(() => ({
    display: 'none',
    zIndex: '1',
    color: 'black',
  }))

  const ListSubMenu = styled(Box)(() => ({
    zIndex: '1',
    color: 'black',
  }))

  const listItemProps: {
    component: string
  } = {
    component: 'li',
  }

  // 메뉴에 자식이 있는 경우
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          onClick={undefined}
        />
      )
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          onClick={function (): void {
            throw new Error('기능이 구현되지 않았습니다.')
          }}
        />
      )
    }
  })

  const onKeyDownEnter = (e: any) => {
    if (e.key === 'Enter') {
      setOpenTopSubNav(true)
    }
  }

  const onFocusOut = (e: any) => {
    setOpenTopSubNav(false)
  }

  return (
    <React.Fragment key={menu.id}>
      <ListItemStyled
        {...listItemProps}
        selected={pathWithoutLastPart === menu.href}
        onKeyDown={(e) => onKeyDownEnter(e)}
        //onBlur={(e) => onFocusOut(e)}
        className={
          open || pathname.includes(menu.href)
            ? 'Mui-selected top-nav-children-li'
            : 'top-nav-children-li'
        }
      >
        <ListItemText
          className="top-nav-item"
          color="inherit"
          sx={{ mr: 'auto', width: '150px', textAlign: 'center' }}
          style={{
            color: level === 2 ? 'black' : 'inherit',
          }} // level이 2일 때만 검정색 설정
        >
          {menu.title}
        </ListItemText>
        <ListSubMenuWrapper
          className={
            openTopSubNav
              ? 'top-sub-nav-wrapper top-sub-nav-open'
              : 'top-sub-nav-wrapper'
          }
          style={{ width: '1234px' }}
        >
          <ListSubMenu
            component={'ul'}
            className={
              openTopSubNav ? 'top-sub-nav top-sub-nav-open' : 'top-sub-nav'
            }
          >
            {submenus}
          </ListSubMenu>
        </ListSubMenuWrapper>
      </ListItemStyled>
    </React.Fragment>
  )
}

export default NavCollapse
