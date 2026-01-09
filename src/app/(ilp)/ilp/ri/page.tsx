'use client'
import TrPage from './_components/tr/page'
import BsPage from './_components/bs/page'
import { useEffect, useState } from 'react'
import HeaderTab from '@/components/tables/CommHeaderTab'
import PageContainer from '@/app/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { getUserInfo } from '@/utils/fsms/utils'
import { SelectItem } from 'select'
import { isArray } from 'lodash'
import { useSearchParams } from 'next/navigation'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '카드정보',
  },
  {
    to: '/ilp/ri',
    title: 'RFID정보',
  },
]

const DataList = () => {

  const userInfo = getUserInfo()
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState<string>('')
  const [tabs, setTabs] = useState<SelectItem[]>([])

  useEffect(() => {
    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      const result: SelectItem[] = []
      userInfo.taskSeCd.map((item) => {
        if (item === 'TR') {
          result.push({ value: 'TR', label: '화물' })
        } else if (item === 'BS') {
          result.push({ value: 'BS', label: '버스' })
        } else {
        }
      })

      setTabs(result)

      if (result.length > 0) {
        setSelectedTab(result[0].value)
      }
    }
  }, [userInfo.taskSeCd])

  return (
    <PageContainer title="RFID정보" description="RFID정보">
      <Breadcrumb title="RFID정보" items={BCrumb} />
      {tabs.length > 0 ? <HeaderTab tabs={tabs} onChange={setSelectedTab} /> : <></>}
      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'BS' ? (
        <BsPage />
      ) : <></>}
    </PageContainer>
  )
}

export default DataList
