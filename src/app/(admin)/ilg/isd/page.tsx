'use client'

/* React */
import { useEffect, useState } from 'react'

/* mui component */
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'

import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import { SelectItem } from 'select'

import TrPage from './_components/tr/TrPage'
import TxPage from './_components/tx/TxPage'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '행정처분',
  },
  {
    to: '/ilg/isd',
    title: '부정수급행정처리',
  },
]

const DataList = () => {
  const userInfo = getUserInfo()

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
    <PageContainer title="부정수급행정처리" description="부정수급행정처리">
      {/* breadcrumb */}
      <Breadcrumb title="부정수급행정처리" items={BCrumb} />
      <HeaderTab tabs={tabs} onChange={setSelectedTab} />

      {selectedTab === 'TR' ? (
        <TrPage />
      ) : selectedTab === 'TX' ? (
        <TxPage />
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default DataList
