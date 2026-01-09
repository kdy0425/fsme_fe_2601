'use client'

/* React */
import React, { useMemo, useState } from 'react'

/* MUI */
import { Tabs, Tab } from '@mui/material'

/* 공통 component */
import PageContainer from '@/app/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 js */
import { useSearchParams } from 'next/navigation'
import type { SelectItem } from 'select'

/* 유가보조금메인 */
import OptAmtComponent from './_components/optAmt/page'

/* 지급차량메인 */
import VhclComponent from './_components/vhcl/page'

/* 유류구매카드메인 */
import CardComponent from './_components/card/page'

// 내비게이션
const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '통계보고서' },
  { title: '통계보고서' },
  { to: '/star/dr', title: '대시보드' },
] as const

// 허용 탭 목록
const TAB_VALUES = ['OPTAMT', 'VHCL', 'CARD'] as const
type TabKey = (typeof TAB_VALUES)[number]

function clampTab(v: string | null | undefined, fallback: TabKey = 'OPTAMT'): TabKey {
  const up = (v ?? '').toUpperCase()
  return (TAB_VALUES as readonly string[]).includes(up) ? (up as TabKey) : fallback
}

/** 로컬 전용 탭 컴포넌트 (공통 HeaderTab 미사용) */
function LocalHeaderTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: SelectItem[]
  value: string
  onChange: React.Dispatch<React.SetStateAction<string>>
}) {
  const handleChange = (_e: React.SyntheticEvent, newValue: string) => {
    // newValue는 Tab의 value로 지정한 string
    onChange(newValue)
  }
  return (
    <Tabs
      value={value}
      onChange={handleChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      {tabs.map((t) => (
        <Tab key={t.value} label={t.label} value={t.value} />
      ))}
    </Tabs>
  )
}

const DataList: React.FC = () => {
  const querys = useSearchParams()
  const tabFromQuery = querys.get('tabIndex') // OPTAMT | VHCL | CARD | 기타

  // 탭 정의
  const tabs: SelectItem[] = useMemo(
    () => [
      { value: 'OPTAMT', label: '유가보조금지급현황' },
      { value: 'VHCL', label: '유가보조금등록차량현황' },
      { value: 'CARD', label: '유류구매카드발급현황' },
    ],
    [],
  )

  // 초기 탭: 쿼리 → 화이트리스트 → 없으면 첫 탭
  const initialTab = clampTab(tabFromQuery, tabs[0].value as TabKey)
  const [selectedTab, setSelectedTab] = useState<string>(initialTab)

  return (
    <PageContainer title="대시보드" description="대시보드">
      {/* breadcrumb */}
      <Breadcrumb title="대시보드" items={BCrumb as any} />

      {/* 로컬 제어형 탭 */}
      <LocalHeaderTabs tabs={tabs} value={selectedTab} onChange={setSelectedTab} />

      {/* ❗ null 대신 빈 Fragment로 ReactElement 보장 */}
      {selectedTab === 'OPTAMT' ? (
        <OptAmtComponent />
      ) : selectedTab === 'VHCL' ? (
        <VhclComponent />
      ) : selectedTab === 'CARD' ? (
        <CardComponent />
      ) : (
        <></>
      )}
    </PageContainer>
  )
}

export default DataList
