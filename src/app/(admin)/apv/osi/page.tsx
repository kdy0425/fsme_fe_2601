'use client'
import { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

import TrPage from './_components/TrPage'
import TxPage from './_components/TxPage'
import BsPage from './_components/BsPage'

import HeaderTab from '@/app/components/tables/CommHeaderTab'
import { SelectItem } from 'select'
import { getUserInfo } from '@/utils/fsms/utils'
import { CoPresentOutlined } from '@mui/icons-material'
import { isArray } from 'lodash'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '주유(충전)소 관리',
  },
  {
    to: '/apv/osi',
    title: '주유(충전)소 관리',
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
      title="주유(충전소) 정보 조회"
      description="주유(충전소) 정보 조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="주유(충전소) 정보 조회" items={BCrumb} />
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
