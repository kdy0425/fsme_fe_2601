'use client'
import React, { useState } from 'react'
import SearchHeaderTab from './SearchHeaderTab'
import CargoPage from './Cargo/page'
import TaxiPage from './Taxi/page'

const Page = () => {
  const [selectedTab, setSelectedTab] = useState('1');

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  }

  return (
    <>
    {/* 컨텐츠 영역 시작 */}
    
    {/* 조건부 렌더링 */}
    
      <CargoPage />
    
    
    {/* 조건부 렌더링 */}
    {/* 컨텐츠 영역 끝 */}
    </>
  )
}

export default Page
