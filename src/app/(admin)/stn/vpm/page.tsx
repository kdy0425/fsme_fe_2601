'use client'
import React, { useEffect, useState } from 'react'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { SelectItem } from 'select'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import TrPage from './_components/TrPage'
import TxPage from './_components/TxPage'
import BsPage from './_components/BsPage'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/vpm',
    title: '차량휴지관리',
  },
]

const DataList = () => {
  // 상위 컴포넌트에서 탭 상태 관리
  const userInfo = getUserInfo()

  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState('')
  const [tabs, setTabs] = useState<SelectItem[]>([{ value: '', label: '' }])

  useEffect(() => {
    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      const result: SelectItem[] = []
      userInfo.taskSeCd.map((item) => {
        console.log(item)
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
    <PageContainer title="차량휴지관리" description="차량휴지관리">
      {/* breadcrumb */}
      <Breadcrumb title="차량휴지관리" items={BCrumb} />
      <HeaderTab tabs={tabs} onChange={setSelectedTab} />
      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'TX' ? (
        <TxPage />
      ) : (
        <BsPage />
      )}
    </PageContainer>
  )
}

export default DataList
