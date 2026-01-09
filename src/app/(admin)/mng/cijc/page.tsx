'use client'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'

import SearchHeaderTab from './_components/SearchHeaderTab'
import CargoPage from './_components/Cargo/page'
import TaxiPage from './_components/Taxi/page'
import BusPage from './_components/Bus/page'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/cijc',
    title: '카드발급심사 변경관리',
  },
]

const Page = () => {
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
    <PageContainer
      title="카드발급심사 변경관리"
      description="카드발급심사 변경관리"
    >
      <Breadcrumb title="카드발급심사 변경관리" items={BCrumb} />

      <HeaderTab tabs={tabs} onChange={setSelectedTab} />
      {selectedTab === 'TR' ? (
        <CargoPage />
      ) : selectedTab === 'TX' ? (
        <TaxiPage />
      ) : selectedTab === 'BS' ? (
        <BusPage />
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default Page
