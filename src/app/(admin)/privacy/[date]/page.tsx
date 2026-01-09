import { Box } from '@mui/material'
import Link from 'next/link'
import privacy from '@/utils/privacy/20250101'
import privacy20231123 from '@/utils/privacy/20231123'
import privacy20230427 from '@/utils/privacy/20230427'
import privacy20230102 from '@/utils/privacy/20230102'
import privacy20220721 from '@/utils/privacy/20220721'
import privacy20210427 from '@/utils/privacy/20210427'
import privacy20200617 from '@/utils/privacy/20200617'
import privacy20160201 from '@/utils/privacy/20160201'
import privacy20150706 from '@/utils/privacy/20150706'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

export default function Page({ params }: { params: { date: string } }) {
  const { date } = params

  const compareDate = (date1: string, date2: string): boolean => {
    const dateObj1 = new Date(getDateFormatYMD(date1))
    const dateObj2 = new Date(getDateFormatYMD(date2))
    if (dateObj1.getTime() - dateObj2.getTime() > 0) return true
    else return false
  }

  const showPrivacy = () => {
    if (date === '20150706') {
      return privacy20150706
    } else if (date === '20160201') {
      return privacy20160201
    } else if (date === '20181019') {
      return ''
    } else if (date === '20190612') {
      return ''
    } else if (date === '20200617') {
      return privacy20200617
    } else if (date === '20210427') {
      return privacy20210427
    } else if (date === '20220721') {
      return privacy20220721
    } else if (date === '20230102') {
      return privacy20230102
    } else if (date === '20231123') {
      return privacy20231123
    } else if (date === '20230427') {
      return privacy20230427
    } else {
      return privacy
    }
  }

  return (
    <Box>
      <Box className="table-bottom-button-group">
        <h2>개인정보처리방침</h2>
      </Box>
      <Box fontWeight={600}>
        <div
          style={{
            whiteSpace: 'pre-line', // 줄바꿈 유지
            width: '100%', // CustomTextField와 동일한 폭
            minHeight: '400px', // CustomTextField와 동일한 높이
            border: '1px solid #ccc', // 일관된 테두리
            borderRadius: '4px', // CustomTextField와 같은 테두리
            padding: '8px', // CustomTextField와 같은 내부 여백
            boxSizing: 'border-box', // 패딩 포함
            backgroundColor: '#f5f5f5', // 옅은 회색 배경
          }}
        >
          {showPrivacy()}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {compareDate(date, '20150706') && (
            <Link href={`/privacy/20150706`}>2015.7.6 이전 방침 보기</Link>
          )}
          {compareDate(date, '20160201') && (
            <Link href={`/privacy/20160201`}>2016.2.1 이전 방침 보기</Link>
          )}
          {compareDate(date, '20181019') && (
            <Link href={`/privacy/20181019`}>2018.10.19 이전 방침 보기</Link>
          )}
          {compareDate(date, '20190612') && (
            <Link href={`/privacy/20190612`}>2019.6.12 이전 방침 보기</Link>
          )}
          {compareDate(date, '20200617') && (
            <Link href={`/privacy/20200617`}>2020.6.17 이전 방침 보기</Link>
          )}
          {compareDate(date, '20210427') && (
            <Link href={`/privacy/20210427`}>2021.4.27 이전 방침 보기</Link>
          )}
          {compareDate(date, '20220721') && (
            <Link href={`/privacy/20220721`}>2022.7.21 이전 방침 보기</Link>
          )}
          {compareDate(date, '20230102') && (
            <Link href={`/privacy/20230102`}>2023.1.2 이전 방침 보기</Link>
          )}
          {compareDate(date, '20230427') && (
            <Link href={`/privacy/20230427`}>2023.4.27 이전 방침 보기</Link>
          )}
        </div>
      </Box>
    </Box>
  )
}
