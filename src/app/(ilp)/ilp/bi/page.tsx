'use client'
import React, { useEffect, useState } from 'react'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'
import TrPage from './_components/TrPage'
import TxPage from './_components/TxPage'
import BsPage from './_components/BsPage'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '사업자정보',
  },
  {
    to: '/ilp/bi',
    title: '사업자정보',
  },
]

const DataList = () => {
  const userInfo = getUserInfo()

  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState<string>('')
  const [tabs, setTabs] = useState<SelectItem[]>([])

  useEffect(() => {
    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      const result: SelectItem[] = []
      userInfo.taskSeCd.map((item) => {
        if (item === 'TR') {
          result.push({ value: 'TR', label: '화물' })
        } else if (item === 'TX') {
          result.push({ value: 'TX', label: '택시' })
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
    <PageContainer title="사업자정보" description="사업자정보">
      {/* breadcrumb */}
      <Breadcrumb title="사업자정보" items={BCrumb} />
      {tabs.length > 0 ? <HeaderTab tabs={tabs} onChange={setSelectedTab} /> : <></>}
      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'TX' ? (
        <TxPage />
      ) : selectedTab === 'BS' ? (
        <BsPage />
      ) : <></>}
    </PageContainer>
  )
}

export default DataList
