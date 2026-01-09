/* React */
import React, { useEffect, useState, memo, useContext } from 'react'
import NextLink from 'next/link'

/* mui component */
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'

/* Type */
import UserAuthContext from '@/app/components/context/UserAuthContext'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getCheckUserBookmark } from '@/utils/fsms/common/comm'

/* interface 선언 */
interface BreadCrumbType {
  subtitle?: string
  items?: any[]
  title: string
  children?: JSX.Element
}

const Breadcrumb = (props: BreadCrumbType) => {
  const { subtitle, items, title, children } = props

  const { contextFavoriteList } = useContext(UserAuthContext)

  const [resultData, setResultData] = useState<string>('')
  const [resultUrl, setResultUrl] = useState<string>('')

  useEffect(() => {
    const url = items ? items[items.length - 1].to : ''

    getCheckUserBookmark(url).then((res) => {
      if (res) {
        setResultData(res.useYn)
        setResultUrl(url)
      }
    })
  }, [])

  useEffect(() => {
    if (contextFavoriteList.length != 0) {
      const index = contextFavoriteList.findIndex(
        (item) => item.urlAddr === resultUrl,
      )
      const yn = index === -1 ? 'N' : 'Y'
      setResultData(yn)
    }
  }, [contextFavoriteList])

  const bookMark = async () => {
    if (resultData === 'N') {
      if (confirm('즐겨찾기를 추가하시겠습니까?')) {
        try {
          let endpoint: string =
            `/fsm/cmm/cmmn/cm/createUserBookmark` +
            `${resultUrl ? '?urlAddr=' + resultUrl : ''}`
          const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
          })

          if (response && response.resultType === 'success' && response.data) {
            if (response.data.useYn == 'Y') {
              alert('즐겨찾기가 추가되었습니다.')
              setResultData('Y')
            } else if (response.data.useYn == 'O') {
              alert('즐겨찾기는 최대 6개만 등록할 수 있습니다.')
            } else if (response.data.useYn == 'N') {
              alert('즐겨찾기가 추가에 실패하였습니다.')
            } else {
              alert('오류입니다.')
            }
          } else {
            alert('오류입니다.')
          }
        } catch (error) {
          alert('오류입니다.')
        }
      }
    } else if (resultData === 'Y') {
      if (confirm('즐겨찾기를 해제 하시겠습니까?')) {
        try {
          let endpoint: string =
            `/fsm/cmm/cmmn/cm/deleteUserBookmark` +
            `${resultUrl ? '?urlAddr=' + resultUrl : ''}`
          const response = await sendHttpRequest('GET', endpoint, null, true, {
            cache: 'no-store',
          })

          if (response && response.resultType === 'success' && response.data) {
            if (response.data.useYn == 'Y') {
              alert('즐겨찾기가 해제되었습니다.')
              setResultData('N')
            } else if (response.data.useYn == 'N') {
              alert('즐겨찾기가 해제되지 못했습니다.')
            } else {
              alert('오류입니다.')
            }
          } else {
            alert('오류입니다.')
          }
        } catch (error) {
          alert('오류입니다.')
        }
      }
    } else {
      return
    }
  }

  return (
    <div className="category-wrapper main-category-wrapper">
      <Breadcrumbs
        separator={<div className="category-item-icon" />}
        sx={{ alignItems: 'center', mt: items ? '10px' : '' }}
        aria-label="breadcrumb"
        className=""
      >
        {items
          ? items.map((item, index) => (
              <div key={item.title}>
                {item.to ? (
                  <NextLink href={item.to} passHref key={index}>
                    <Typography color="textSecondary">{item.title}</Typography>
                  </NextLink>
                ) : (
                  <Typography key={index} color="textPrimary">
                    {item.title}
                  </Typography>
                )}
              </div>
            ))
          : null}
      </Breadcrumbs>

      <nav
        className="MuiTypography-root MuiTypography-body1 MuiBreadcrumbs-root mui-184aith"
        aria-label="breadcrumb"
      />
      <button
        type="button"
        className={`btn_favorite ${resultData === 'Y' ? 'active' : ''}`}
        onClick={bookMark}
      >
        즐겨찾기
      </button>
    </div>
  )
}

export default memo(Breadcrumb)
