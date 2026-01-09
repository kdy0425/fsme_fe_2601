'use client'
import React from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

import TonsPage from './_components/tons/page'
import PaperPage from './_components/paper/page'
import RecalPage from './_components/recal/page'
import SettlePage from './_components/settle/page'
import TankPage from './_components/tank/page'
import IllegalPage from './_components/illegal/page'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/cvpl',
    title: '민원관리',
  },
]

const Page = () => {
  return (
    <PageContainer title="민원관리" description="민원관리">
      {/* breadcrumb */}
      <Breadcrumb title="민원관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 컨텐츠 영역 시작 */}
      <div style={style.contentStyle}>
        <h2>톤수 전문 재전송</h2>
        <TonsPage />
      </div><br/>
      <div style={style.contentStyle}>
        <h2>서면신청 지급확정 취소</h2>
        <PaperPage />
      </div><br/>
      <div style={style.contentStyle}>
        <h2>거래확인카드 보조금 재정산</h2>
        <RecalPage />
      </div><br/>
      <div style={style.contentStyle}>
        <h2>거래확인카드 보조금 지급확정 취소</h2>
        <SettlePage />
      </div><br/>
      <div style={style.contentStyle}>
        <h2>탱크용량 변경신청 지자체 변경</h2>
        <TankPage />
      </div><br/>
      <div style={style.contentStyle}>
        <h2>부정수급 행정처리 내역 조회</h2>
        <IllegalPage />
      </div>
      {/* 컨텐츠 영역 끝 */}
    </PageContainer>
  )
}

const style = {
  contentStyle: {
    alignContent: 'center',
    padding: '2rem',
    paddingTop: 0,
    borderBottom: '1px solid black',
    borderColor: '#dfdfdf',
    marginBottom: '2rem',
  },
}

export default Page
