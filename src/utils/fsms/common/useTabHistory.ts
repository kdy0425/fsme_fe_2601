'use client'
import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { usePathname, useRouter } from 'next/navigation'

type TabItem = {
  title: string
  url: string
}

export type layoutKeyType = 'fsm' | 'ilp'

type cookieKeyType = {
  [key in layoutKeyType]: string;
}

export const FSM_COOKIE_KEY = 'fsm_history_tabs'
export const ILP_COOKIE_KEY = 'ilp_history_tabs'

const COOKIE_KEY: cookieKeyType = {
  fsm: FSM_COOKIE_KEY,
  ilp: ILP_COOKIE_KEY
}

export function useTabHistory() {

  const router = useRouter()
  const pathname = usePathname()
  const [tabs, setTabs] = useState<TabItem[]>([])
  const [layoutKey, setLayoutKey] = useState<layoutKeyType>('fsm')

  useEffect(() => {
    if (pathname) {
      if(pathname.startsWith('/ilp')) {
        setLayoutKey('ilp')
      } else {
        setLayoutKey('fsm')
      }
    }
  }, [pathname])

  const save = useCallback((list: TabItem[]) => {
    Cookies.set(COOKIE_KEY[layoutKey], JSON.stringify(list), { expires: 7 })
  }, [])

  // 탭 추가
  const add = useCallback((item: TabItem) => {
    setTabs((prev) => {
      if (prev.some((t) => t.url === item.url)) return prev
      const next = [...prev, item]

      // 최대 10개만 저장하며 10개 초과시 구 히스토리 메뉴 삭제
      if (next.length > 10) {
        next.shift()
      }

      save(next)
      return next
    })
  }, [save])

  // 개별 삭제
  const remove = useCallback((url: string) => {

    let route = '';

    setTabs((prev) => {
      const next = prev.filter((t) => t.url !== url)
      save(next)
      route = next[next.length - 1].url // 최신 메뉴
      return next
    })

    if (url === pathname) {
      // 현재화면과 삭제화면이 동일시 제일 최신 메뉴로 이동
      router.push(route)
    }    
  }, [save, pathname])

  // 전체 삭제
  const removeAll = useCallback(() => {
    setTabs(prev => prev.filter(item => item.url === pathname))
    Cookies.remove(COOKIE_KEY[layoutKey])
  }, [pathname])

  return { tabs, add, remove, removeAll }
}
