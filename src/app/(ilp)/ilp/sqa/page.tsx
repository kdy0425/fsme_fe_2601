'use client'
import React, { useEffect, useState } from 'react'

import { Box, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'
import TrPage from './_components/tr/TrPage'
import TxPage from './_components/tx/TxPage'
import BsPage from './_components/bs/BsPage'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급분석',
  },
  {
    title: '자격정보분석',
  },
  {
    to: '/ilp/sqa',
    title: '수급자격 종합 분석',
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
    <PageContainer title="차량 자격정보" description="차량 자격정보">
      {/* breadcrumb */}
      <Breadcrumb title="차량 자격정보" items={BCrumb} />
      {tabs.length > 0 ? <HeaderTab tabs={tabs} onChange={setSelectedTab} /> : <></>}
      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'TX' ? (
        <TxPage />
      ) : selectedTab === 'BS' ? (
        <BsPage />
      ) : <></>}
      {/* 테이블영역 끝 */}
      <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
        <span style={{ color: '#1976d2' }}>■ 유효</span>
        <span style={{ color: '#d32f2f' }}>■ 미유효</span>
      </Box>
    </PageContainer>
  )
}

export default DataList
