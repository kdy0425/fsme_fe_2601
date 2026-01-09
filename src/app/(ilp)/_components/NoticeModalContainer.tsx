import NoticeModal from './NoticeModal'
import { AppState } from '@/store/store'
import { useDispatch, useSelector } from '@/store/hooks'
import { useEffect } from 'react'
import { notiModalObj, setNoticeModalData } from '@/store/popup/NoticeSlice'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { StatusType } from '@/types/message'
import { getCookie } from '@/utils/fsms/common/util'

const NoticeModalContainer = () => {
  const noticeInfo = useSelector((state: AppState) => state.noticeInfo)
  const dispatch = useDispatch()

  const fetchModalData = async () => {
    try {
      const response = await sendHttpRequest(
        'GET',
        `/fsm/ilp/notice/getNoticePopup`,
        null,
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        const notiInfoMap = response.data.map(
          (value: notiModalObj, index: number) => {
            const {
              bbsNm,
              bbscttSn,
              cn,
              leadCnNm,
              relateTaskSeNm,
              ttl,
              regDt,
              fileCount,
              fileList,
            } = value
            return {
              bbsNm,
              bbscttSn: Number(bbscttSn),
              cn,
              leadCnNm,
              relateTaskSeNm,
              ttl,
              regDt,
              fileCount,
              fileList,
            }
          },
        )

        //쿠키값으로부터 표시할 공지사항 정보 간소화
        const modalCookie = getCookie('ignoreModal')
        modalCookie?.forEach((cookieVal: number, index: number) => {
          const findIdx = notiInfoMap.findIndex(
            (value: notiModalObj) => value.bbscttSn === cookieVal,
          )
          if (findIdx > -1) {
            notiInfoMap.splice(findIdx, 1)
          }
        })
        // console.log('after check from cookie : ', notiInfoMap)

        dispatch(setNoticeModalData(notiInfoMap))
      } else {
        alert(response.message)
      }
    } catch (error: StatusType | any) {
      // console.log(error.errors[0])
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  useEffect(() => {
    fetchModalData()
  }, [])

  return (
    <>
      {noticeInfo.notiModalOpen && noticeInfo.notiModalData.length ? (
        <>
          {noticeInfo.notiModalData.map((value, index: number) => {
            return <NoticeModal key={index} notiData={value} />
          })}
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export default NoticeModalContainer
