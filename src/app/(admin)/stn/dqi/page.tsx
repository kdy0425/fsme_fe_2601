'use client'

/* React */
import React, { useEffect, useState } from 'react'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import HeaderTab from '@/components/tables/CommHeaderTab'

/* 공통 js */
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'
import { useSearchParams } from 'next/navigation'

/* 화물메인 */
import TrPage from './_components/tr/TrPage'

/* 버스메인 */
import BsPage from './_components/bs/BsPage'

/* 택시메인 */
import TxPage from './_components/tx/TxPage'

//내비게이션
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
    to: '/stn/dqi',
    title: '운수종사자격정보',
  },
]

const DataList = () => {
  const userInfo = getUserInfo()
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  // 상위 컴포넌트에서 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState('')
  const [tabs, setTabs] = useState<SelectItem[]>([{ value: '', label: '' }])

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
        const tabIndex = allParams.tabIndex

        if (tabIndex) {
          setSelectedTab(tabIndex)
        } else {
          setSelectedTab(result[0].value)
        }
      }
    }
  }, [userInfo.taskSeCd])

  return (
    <PageContainer title="운수종사자격정보" description="운수종사자격정보">
      {/* breadcrumb */}
      <Breadcrumb title="운수종사자격정보" items={BCrumb} />

      <HeaderTab tabs={tabs} onChange={setSelectedTab} />

      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'TX' ? (
        <TxPage />
      ) : selectedTab === 'BS' ? (
        <BsPage />
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default DataList
