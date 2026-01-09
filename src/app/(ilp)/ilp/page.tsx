'use client'
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Divider, Button } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
// import { useRouter } from 'next/router'
import PageContainer from '@/components/container/PageContainer'
// 탭 모듈
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Breadcrumb from '@/app/(admin)/layout/shared/breadcrumb/BreadcrumbFsmMain'
// 주석 : amcharts nextjs  SyntaxError: Unexpected token 'export'
import dynamic from 'next/dynamic'
const XYChart01 = dynamic(() => import('@/app/components/amcharts/XYChart01'), {
  ssr: false,
})
const XYChart02 = dynamic(() => import('@/app/components/amcharts/XYChart02'), {
  ssr: false,
})
const XYChart03 = dynamic(() => import('@/app/components/amcharts/XYChart03'), {
  ssr: false,
})
// 도움말 모듈
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  Notice,
  DdppDoubtDlng,
  DoubtExamTarget,
  ExamResult,
  DoubtAdminProcess,
  VndcReq,
  RdmAmtMngp,
  urls,
} from '@/types/main/main'

import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint,
  formatToTwoDecimalPlaces,
  formatDateDecimal,
} from '@/utils/fsms/common/convert'
 import UserAuthContext, {
   UserAuthInfo,
 } from '@/app/components/context/UserAuthContext'
import { useDispatch, useSelector } from '@/store/hooks'
import { openIllegalModal } from '@/store/popup/MainPageIllegalitySlice'
import { openServeyModal, setSurveyInfo } from '@/store/popup/SurveySlice'
import MainIllegalityModal from '@/app/components/popup/MainIllegalityModal'
import SurveyModal from '@/app/components/popup/SurveyModal'
import NoticeModalContainer from '../_components/NoticeModalContainer'

import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'
import { string } from '@amcharts/amcharts4/core'
import { getCommaNumber, getCookie } from '@/utils/fsms/common/util'
import { VerticalAlignCenter } from '@mui/icons-material'

/* 게시판 컴포넌트 */
import BoardModal from '../_components/board/BoardModal'
import { handleIlpBoardOpen } from '@/store/popup/IlpBoardSlice'
import NoticePopupModal from '../_components/board/NoticePopupModal'
import { bbsSnObj } from '../_components/board/boardInfo'
import { isArray } from 'lodash'

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} placement="top" />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#2A3547',
    color: '#fff',
    maxWidth: 220,
    fontSize: 14,
    border: '1px solid #dadde9',
  },
}))
const BCrumb = [
  {
    to: '/ilp',
    title: 'Home',
  },
  {
    to: '/ilp',
    title: '부정수급 방지시스템 메인',
  },
]

const currentYear = new Date().getFullYear() // 현재 연도 가져오기

const selectData = Array.from({ length: 3 }, (_, i) => {
  const year = currentYear - i
  return {
    value: String(year),
    label: `${year}년`,
  }
})

export default function Main() {
  // 탭
  const [valueTab1, setValueTab1] = React.useState('1')
  const handleChangeTab1 = (
    event: React.SyntheticEvent,
    newValueTab1: string,
  ) => {
    setValueTab1(newValueTab1)
  }
  const [valueTab2, setValueTab2] = React.useState('1')
  const handleChangeTab2 = (
    event: React.SyntheticEvent,
    newValueTab2: string,
  ) => {
    setValueTab2(newValueTab2)
  }
  const [valueTab3, setValueTab3] = React.useState('1')
  const handleChangeTab3 = (
    event: React.SyntheticEvent,
    newValueTab3: string,
  ) => {
    setValueTab3(newValueTab3)
  }
  const [valueTab4, setValueTab4] = React.useState('1')
  const handleChangeTab4 = (
    event: React.SyntheticEvent,
    newValueTab4: string,
  ) => {
    setValueTab4(newValueTab4)
  }
  // Select
  const [select, setSelect] = React.useState(selectData[0]?.value)

  const handleChangeSelect = (event: any) => {
    setSelect(event.target.value)
  }

  // redux-toolkit
  const dispatch = useDispatch()

  /* redux-toolkit(게시판) */
  const { ilpBoardOpen } = useSelector(state => state.IlpBoard)
  

  // 현재 년 월 일을 반환하는 함수 yyyy.mm.dd
  const getFormattedDate = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}.${month}.${day}`
  }
  const router = useRouter()

  const handleSelectedNotice = (notice: Notice) => {
    dispatch(handleIlpBoardOpen({
      boardType: 'NOTICE',
      openType: 'VIEW',
      bbscttSn: notice.bbscttSn ?? '',
    }))
  }

  const handleSelectedIscs = (notice: Notice) => {
    dispatch(handleIlpBoardOpen({
      boardType: 'ISCS',
      openType: 'VIEW',
      bbscttSn: notice.bbscttSn ?? '',
    }))
  }

  // 원하는 경로로 이동!
  const handleCartPubClick = (url: string, options?: object) => {
    // useEffect 안에서 라우팅 기능을 실행
    router.push(url, options)
  }
  const [loading, setLoading] = React.useState(false) // 로딩여부
  // 상태 변수들 정의
  
  // 게시판관련
  const [noticeList, setNoticeList] = useState<Notice[]>([]) // 7.메인화면 게시판을 조회
  const [noticePopupList, setNoticePopupList] = useState<Notice[]>([]) // 7.메인화면 게시판 팝업을 조회
  const [noticePopupOpen, setNoticePopupOpen] = useState<boolean>() // 7.메인화면 게시판 팝업을 오픈
  const [InstcSpldmd, setInstcSpldmd] = useState<Notice[]>([]) // 10.메인화면 부정수급사례공유 조회  
  
  // 팝업공지사항 set 완료시 모달 오픈
  useEffect(() => {
    if (noticePopupList && noticePopupList.length > 0) {
      setNoticePopupOpen(true)
    }    
  }, [noticePopupList])
  const [ddppDoubtDlng, setDdppDoubtDlng] = useState<DdppDoubtDlng>() // 1.나의 할일 - 의심거래적발건수 조회
  const [doubtExamTarget, setDoubtExamTarget] = useState<DoubtExamTarget>() // 2.나의 할일 - 조사대상건수 조회
  const [examResult, setExamResult] = useState<ExamResult>() // 3.나의 할일 - 조사결과등록건수 조회
  const [doubtAdminProcess, setDoubtAdminProcess] = useState<DoubtAdminProcess>() // 4.나의 할일 - 행정처분등록건수 조회
  const [vndcReq, setVndcReq] = useState<VndcReq>() // 5.나의 할일 - 소명자료요청건수 조회
  const [rdmAmtMngp, setRdmAmtMngp] = useState<RdmAmtMngp>() // 6.나의 할일 - 환수등록건수 조회

  const [year, setYear] = useState<string>()

  const { authInfo } = useContext(UserAuthContext)

  /**************************************************************  useEffect 부 시작 ********************************************************/

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          // 0
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobDdppDoubtDlng`, null, true),
          // 1
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobDoubtExamTarget`, null, true),
          // 2
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobExamResultCnt`, null, true),
          // 3
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobDoubtAdminProcess`, null, true),
          // 4
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobVndcReq`, null, true),
          // 5
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobRdmAmtMngp`, null, true),
          // 6
          sendHttpRequest('GET', `/ilp/mai/main/getNtcMttr`, null, true),
          // 7
          sendHttpRequest('GET', `/ilp/mai/main/getNoticePopup`, null, true),
          // 부정수급 행정처리 현황 모달 표시여부 조회
          // 8
          sendHttpRequest('GET', `/fsm/mai/main/getIllegalityCnt`, null, true),
          // 설문조사 팝업 표시여부 조회
          // 9
          sendHttpRequest('GET', `/fsm/mai/main/getQesitmTrgetYn`, null, true),
          // 10 부정수급 사례 공유
          sendHttpRequest('GET', `/ilp/mai/main/getAllInstcSpldmdCaseShrn`, null, true),
        ]

        const results = await Promise.allSettled(endpoints)

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value
            switch (index) {
              case 0:
                if (data?.resultType === 'success') {
                  setDdppDoubtDlng(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할일 의심거래적발건수 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 1:
                if (data?.resultType === 'success') {
                  setDoubtExamTarget(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할일 조사대상건수 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 2:
                if (data?.resultType === 'success') {
                  setExamResult(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할일 조사결과등록건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 3:
                if (data?.resultType === 'success') {
                  setDoubtAdminProcess(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할일 행정처분등록건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 4:
                if (data?.resultType === 'success') {
                  setVndcReq(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할일 소명자료요청건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 5:
                if (data?.resultType === 'success') {
                  setRdmAmtMngp(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할일 환수등록건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 6:
                if (data?.resultType === 'success') {
                  setNoticeList(data.data)

                } else if (data?.resultType === 'error') {
                  alert(
                    `공지사항 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 7:
                if (data?.resultType === 'success') {
                  const tempList = data.data

                  // 쿠키값으로부터 표시할 공지사항 정보 간소화
                  const modalCookie = getCookie('ignoreModal')                

                  modalCookie?.forEach((cookieVal: number, index: number) => {

                    const findIdx = tempList.findIndex((value: Notice) => value.bbscttSn === cookieVal.toString())
                    if (findIdx > -1) {
                      tempList.splice(findIdx, 1)
                    }
                  })
	        
                  setNoticePopupList(tempList)

                } else if (data?.resultType === 'error') {
                  alert(
                    `공지사항 팝업 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              // 부정수급 행정처리 현황 모달 표시
              case 8:
                if (data?.resultType === 'success') {
                  let { rdmCnt } = data?.data
                  if (rdmCnt > 0) {
                    if (checkTrDoubtDelng()) {
                      dispatch(openIllegalModal())
                    }
                  }
                }
                break
              // 설문조사 팝업 표시여부 조회
              case 9:
                if (data?.data.length > 0) {
                  let { srvyYn, srvyCycl } = data?.data[0]
                  if (srvyYn === 'N') {
                    dispatch(setSurveyInfo(srvyCycl))
                    dispatch(openServeyModal())
                  }
                  break
                }
                break
              //부정수급 사례 공유 조회
              case 10:
                if (data?.resultType === 'success') {
                  setInstcSpldmd(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `부정수급 사례 공유 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              default:
                break
            }
            // console.log('공지사항 출력함.', result.value)
          } else {
            console.error(`Error in request ${index}:`, result.reason)
          }
        })
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData().then(() => {
      
    })
  }, [])

  const checkTrDoubtDelng = () => {
    const auths = authInfo?.auths
    if (
      auths.findIndex((value: string, index: number) => {
        return value === 'LOGV_10'
      }) > -1
    ) {
      return true
    }
    return false
  }

  // useEffect(() => {
  //   setTabValue()

  //   if (isAuthUser('TR')) {
  //     fetchTruckMainData()
  //     fetchFreightData()
  //   }
  //   if (isAuthUser('TX')) {
  //     fetchTaxiMainData()
  //     fetchTaxiData()
  //   }
  //   if (isAuthUser('BS')) {
  //     fetchBusMainData()
  //     fetchBusData()
  //   }
  // }, [authInfo])

  // useEffect(() => {
  //   handleSelectChange()
  // }, [select])

  const isAuthUser = (task: string): boolean => {
    const { taskSeCd }: any = authInfo //string[]

    if (!taskSeCd) {
      return false
    }

    if (
      taskSeCd.findIndex((value: string, index: number) => value === task) < 0
    ) {
      return false
    } else {
      return true
    }
  }

  const setTabValue = () => {
    let tabIndex = 0
    const taskSeArr = ['TR', 'TX', 'BS']
    const { taskSeCd }: any = authInfo
    if (!taskSeCd) {
      return
    }
    tabIndex =
      taskSeArr.findIndex(
        (value: string, index: number) => value === taskSeCd[0],
      ) + 1
    setValueTab1(String(tabIndex))
    setValueTab2(String(tabIndex))
    setValueTab3(String(tabIndex))
    setValueTab4(String(tabIndex))
  }

  // const handleSelectChange = () => {
  //   if (isAuthUser('TR')) {
  //     fetchFreightData()
  //   }
  //   if (isAuthUser('BS')) {
  //     fetchBusData()
  //   }
  //   if (isAuthUser('TX')) {
  //     fetchTaxiData()
  //   }
  // }

  return (
    <PageContainer title="Main" description="메인페이지">
      <div className="main-container">
        <div className="main-container-inner">
          {/* 카테고리 시작 */}
          <Breadcrumb title="부정수급 방지시스템" items={BCrumb} className={'category-gradient'} />
          {/* 카테고리 끝 */}
        </div>
      </div>
      

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">나의 할일</h1>

                <div className="contents-box-con">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: 0,
                      padding: 0,
                      height: 15,
                    }}
                  >
                    <p className="oilps-info-date">
                      ({getFormattedDate() + '  기준 최근 한달'})
                    </p>
                  </div>
                  <div className="oilps-map-info-box-col-group">
                    {/* 의심거래 적발건수 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">의심거래적발건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 의심거래적발건수 */}
                        {ddppDoubtDlng?.ddppDoubtDlngAuth ? (
                          <p
                            className="oilps-info-con-value color-gray button"
                            onClick={() => handleCartPubClick('/ilp/ddpp?tab=0')}
                          >
                            {ddppDoubtDlng !== undefined
                              ? Number(
                                  ddppDoubtDlng.ddppDoubtDlngCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value color-gray button">
                            0
                            <span className="info-value-small">건</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* 조사대상건수 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">조사대상건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 조사대상건수 */}
                        {doubtExamTarget?.doubtExamTargetAuth ? (
                          <p
                            className="oilps-info-con-value color-gray button"
                            onClick={() => handleCartPubClick('/ilp/ddpp?tab=1')}
                          >                            
                            {doubtExamTarget !== undefined
                              ? Number(
                                  doubtExamTarget.doubtExamTargetCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value color-gray button">
                            0
                            <span className="info-value-small">건</span>
                          </p>
                        )} 
                      </div>
                    </div>
                    {/* 조사결과등록건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">조사결과등록건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 조사결과등록건수 */}
                        {examResult?.examResultAuth ? (
                          <p
                            className="oilps-info-con-value color-gray button"
                            onClick={() => handleCartPubClick('/ilp/ddpp?tab=2&status=Y')}
                          >                            
                            {examResult !== undefined
                              ? Number(
                                  examResult.examResultCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value color-gray button">
                            0
                            <span className="info-value-small">건</span>
                          </p>
                        )}  
                      </div>
                    </div>
                    {/* 행정처분등록건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">행정처분등록건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 행정처분등록건수 */}
                        {doubtAdminProcess?.doubtAdminProcessAuth ? (
                          <p
                            className="oilps-info-con-value color-gray button"
                            onClick={() => handleCartPubClick('/ilp/ddpp?tab=3&status=Y')}
                          >                            
                            {doubtAdminProcess !== undefined
                              ? Number(
                                  doubtAdminProcess.doubtAdminProcessCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value color-gray button">
                            0
                            <span className="info-value-small">건</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* 소명자료요청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">소명자료요청건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 소명자료요청건수 */}
                        {vndcReq?.vndcReqAuth ? (
                          <p
                            className="oilps-info-con-value color-gray button"
                            onClick={() => handleCartPubClick('/ilp/vd?prcsSttsCd=01')}
                          >                            
                            {vndcReq !== undefined
                              ? Number(
                                  vndcReq.vndcReqCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value color-gray button">
                            0
                            <span className="info-value-small">건</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* 환수등록건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">환수등록건수</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 환수등록건수 */}
                        {rdmAmtMngp?.rdmAmtMngpAuth ? (
                          <p
                            className="oilps-info-con-value color-gray button"
                            onClick={() => handleCartPubClick('/ilp/ram')}
                          >                            
                            {rdmAmtMngp !== undefined
                              ? Number(
                                  rdmAmtMngp.rdmAmtMngpCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value color-gray button">
                            0
                            <span className="info-value-small">건</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  공지사항
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./ilp/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    {noticeList && noticeList.length > 0 ? (
                      noticeList.map((notice, index) => {
                        if (notice) {
                          return (
                            <li key={index}>
                              <div
                                className="main-info-board-inner"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectedNotice(notice)} // 수정된 부분
                              >
                                <span className="main-notice-link-title">
                                  {notice.ttl}
                                </span>
                                <p className="main-notice-link-date">
                                  <span className="info-month-date">
                                    {formatDateDecimal(notice.regDt)}
                                  </span>
                                </p>
                              </div>
                            </li>
                          )
                        }
                        return null // notice가 null 또는 undefined인 경우
                      })
                    ) : (
                      <>
                        <li>
                          <div className="main-info-board-inner">
                            <a href="#" className="main-info-link">
                              <span className="main-notice-link-title">
                                게시된 공지사항이 없습니다.{' '}
                              </span>
                            </a>
                            <p className="main-notice-link-date">
                              <span className="info-month-date"></span>
                            </p>
                          </div>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">주요 서비스</h1>
                <div className="contents-box-con">
                  <div className="main-service-box">
                    <div className='item'>
                      <Link href="/ilp/vqi" className='main-info-link'>
                        <svg width={50} height={50} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" > <mask id="mask0_180_2864" style={{ maskType: "luminance", }} maskUnits="userSpaceOnUse" x={0} y={0} width={50} height={50} > <path d="M50 0H0V50H50V0Z" fill="white" /> </mask> <g mask="url(#mask0_180_2864)"> <path d="M15.7583 5H35.7918C38.001 5 39.7918 6.79086 39.7918 9V41C39.7918 43.2091 38.0147 45 35.8056 45C29.2975 45 16.501 45 9.99771 45C7.78857 45 6 43.2091 6 41V14.7544L15.7583 5Z" fill="#97BCFF" /> <path d="M15.7543 10.7544C15.7543 12.9635 13.9635 14.7544 11.7543 14.7544H6L15.7543 5V10.7544Z" fill="#3D79E7" /> <path d="M26.5 20H13.5C12.6716 20 12 20.6716 12 21.5C12 22.3284 12.6716 23 13.5 23H26.5C27.3284 23 28 22.3284 28 21.5C28 20.6716 27.3284 20 26.5 20Z" fill="white" /> <path d="M21.5 27H13.5C12.6716 27 12 27.6716 12 28.5C12 29.3284 12.6716 30 13.5 30H21.5C22.3284 30 23 29.3284 23 28.5C23 27.6716 22.3284 27 21.5 27Z" fill="white" /> <path d="M19.5 34H13.5C12.6716 34 12 34.6716 12 35.5C12 36.3284 12.6716 37 13.5 37H19.5C20.3284 37 21 36.3284 21 35.5C21 34.6716 20.3284 34 19.5 34Z" fill="white" /> <path d="M41.7143 43.0003C41.3536 43.0003 40.993 42.8508 40.7335 42.5605L37.5449 39.0069C37.0567 38.4659 37.1051 37.6303 37.6461 37.1421C38.187 36.6539 39.0227 36.7023 39.5108 37.2432L42.6994 40.7969C43.1876 41.3378 43.1392 42.1735 42.5983 42.6617C42.3476 42.886 42.0309 43.0003 41.7187 43.0003H41.7143Z" fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.8} /> <path d="M34.0704 41.1321C29.6196 41.1321 26 37.5125 26 33.0661C26 28.6196 29.6196 25 34.0704 25C38.5213 25 42.1365 28.6196 42.1365 33.0661C42.1365 37.5125 38.5169 41.1321 34.0704 41.1321ZM34.0704 27.6388C31.0754 27.6388 28.6388 30.0754 28.6388 33.0661C28.6388 36.0568 31.0754 38.4933 34.0704 38.4933C37.0655 38.4933 39.4976 36.0568 39.4976 33.0661C39.4976 30.0754 37.0611 27.6388 34.0704 27.6388Z" fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.8} /> </g> </svg>
                        <span>자격정보</span>
                      </Link>
                    </div>
                    <div className='item'>
                      <Link href="/ilp/sqa" className='main-info-link'>
                        <svg xmlns="http://www.w3.org/2000/svg" width={51} height={50} fill="none" > <mask id="a" width={51} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50.5 0H.5v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#97BCFF" d="M12.728 7.055h24.66a4.23 4.23 0 0 1 4.229 4.228V40.77A4.23 4.23 0 0 1 37.389 45H12.728A4.23 4.23 0 0 1 8.5 40.771V11.282a4.23 4.23 0 0 1 4.228-4.227Z" /> <path fill="#3D79E7" d="M29.843 11.757h-9.566a3.145 3.145 0 0 1-3.145-3.145V5.961c0-.53.431-.961.96-.961h13.935c.53 0 .961.431.961.96v2.652a3.145 3.145 0 0 1-3.145 3.145Z" /> <path fill="#fff" d="M24.366 33c-.452 0-.886-.18-1.206-.506l-4.163-4.204A1.725 1.725 0 0 1 19 25.864a1.7 1.7 0 0 1 2.412.004l2.778 2.807 5.246-6.995a1.699 1.699 0 0 1 2.387-.334c.75.57.899 1.646.332 2.4l-6.43 8.573c-.299.398-.75.642-1.245.677h-.115V33Z" /> </g> </svg>
                        <span>자격분석</span>
                      </Link>
                    </div>
                    <div className='item'>
                      <Link href="/ilp/ma" className='main-info-link'>
                        <svg xmlns="http://www.w3.org/2000/svg" width={50} height={50} fill="none" > <mask id="a" width={50} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50 0H0v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#97BCFF" d="M33.09 20.334a9.314 9.314 0 0 1 1.257 4.667c0 5.16-4.18 9.347-9.347 9.347V45c11.045 0 20-8.955 20-20 0-3.638-.98-7.053-2.678-9.988l-9.233 5.33v-.008Z" /> <path fill="#97BCFF" d="M25 15.659c3.462 0 6.472 1.887 8.088 4.68l9.233-5.33C38.864 9.031 32.404 5 24.999 5 17.593 5 11.134 9.024 7.68 15.01l9.231 5.329c1.617-2.793 4.627-4.68 8.09-4.68Z" /> <path fill="#3D79E7" d="M15.652 25.004c0-1.698.46-3.287 1.258-4.667l-9.232-5.33A19.855 19.855 0 0 0 5 24.998c0 11.044 8.955 19.999 20 19.999V34.344c-5.161 0-9.348-4.187-9.348-9.347v.007Z" /> <path fill="#3D79E7" stroke="#3D79E7" strokeWidth={0.4} d="M30.403 23.695h-.718l.474-1.32a1.029 1.029 0 0 0-1.938-.692l-1.353 3.782-.906-3.523a1.027 1.027 0 0 0-1.992 0l-.905 3.523-1.354-3.782a1.03 1.03 0 0 0-1.937.692l.473 1.32h-.718a1.029 1.029 0 1 0 0 2.058h1.454l1.274 3.564a1.03 1.03 0 0 0 1.966-.09l.746-2.9.746 2.9c.113.437.5.751.95.772h.046c.432 0 .82-.273.97-.682l1.273-3.564h1.454a1.029 1.029 0 1 0 0-2.058h-.005Z" /> </g> </svg>
                        <span>연비분석</span>
                      </Link>
                    </div>
                    <div className='item'>
                      <Link href="/" className='main-info-link' target = '_blank' rel='noopener noreferrer'>
                        <svg xmlns="http://www.w3.org/2000/svg" width={51} height={50} fill="none" > <mask id="a" width={51} height={50} x={0} y={0} maskUnits="userSpaceOnUse" style={{ maskType: "luminance", }} > <path fill="#fff" d="M50.5 0H.5v50h50V0Z" /> </mask> <g mask="url(#a)"> <path fill="#3D79E7" d="M6.5 11a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4h-38Z" /> <path fill="#97BCFF" d="M6.5 11h38v20h-38z" /> <path fill="#fff" d="M15.5 17.5v8a2 2 0 1 0 4 0v-8a2 2 0 1 0-4 0ZM23.5 19.5v6a2 2 0 1 0 4 0v-6a2 2 0 1 0-4 0ZM31.5 21.5v4a2 2 0 1 0 4 0v-4a2 2 0 1 0-4 0Z" /> <path fill="#3D79E7" d="M6.5 31h38a4 4 0 0 1-4 4h-30a4 4 0 0 1-4-4ZM19.5 35h12v4h-12z" /> <rect width={18} height={4} x={16.5} y={39} fill="#3D79E7" rx={2} /> </g> </svg>
                        <span>유가보조금관리시스템</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  부정수급 사례 공유
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./ilp/iscs')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    {InstcSpldmd && InstcSpldmd.length > 0 ? (
                      InstcSpldmd.map((iscs, index) => {
                        if (iscs) {
                          return (
                            <li key={index}>
                              <div
                                className="main-info-board-inner"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectedIscs(iscs)} // 수정된 부분
                              >
                                <span className="main-notice-link-title">
                                  {iscs.ttl}
                                </span>
                                <p className="main-notice-link-date">
                                  <span className="info-month-date">
                                    {formatDateDecimal(iscs.regDt)}
                                  </span>
                                </p>
                              </div>
                            </li>
                          )
                        }
                        return null // notice가 null 또는 undefined인 경우
                      })
                    ) : (
                      <>
                        <li>
                          <div className="main-info-board-inner">
                            <a href="#" className="main-info-link">
                              <span className="main-notice-link-title">
                                게시된 부정수급 사례가 없습니다.
                              </span>
                            </a>
                            <p className="main-notice-link-date">
                              <span className="info-month-date"></span>
                            </p>
                          </div>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <>
        {/* 게시판 공통 컴포넌트 */}
        {ilpBoardOpen && (
          <BoardModal isMain={true} />
        )}

        {/* 공지사항 팝업 */}
        {noticePopupOpen && isArray(noticePopupList) && noticePopupList.length > 0 ? (
          <>
            {noticePopupList && noticePopupList.map((item, index) => {              
              return (
                <NoticePopupModal
                  key={`NoticePopupModal_${index}`}
                  bbsSn={bbsSnObj['NOTICE']}
                  bbscttSn={item.bbscttSn ?? ''}
                  boardType='NOTICE'
                />
              )
            })}
          </>          
        ) : null}
      </>
      <MainIllegalityModal />
      <SurveyModal />
      {/* <NoticeModalContainer /> */}
    </PageContainer>
  )
}

const MainContents = ({
  contentTitle,
  tabContextValue,
  tabListHandler,
  tabListLabel,
  isAuthUser,
  children,
}: any) => {
  return (
    <div className="main-contents">
      <div className="main-contents-box">
        <h1 className="contents-box-title">
          <span>{contentTitle}</span>
          <div className="main-title-option">
            {/* <button className="main-info-board-more-btn" onClick={() => handleCartPubClick('./sta/ci')} title="더보기 버튼"></button> */}
          </div>
        </h1>
        <div className="contents-box-con">
          <TabContext value={tabContextValue}>
            <div className="tabs-round-type">
              <TabList
                className="tab-list"
                onChange={tabListHandler}
                aria-label={tabListLabel}
              >
                <Tab
                  key={1}
                  label={'화물'}
                  value={String(1)}
                  disabled={!isAuthUser('TR')}
                />
                <Tab
                  key={2}
                  label={'택시'}
                  value={String(2)}
                  disabled={!isAuthUser('TX')}
                />
                <Tab
                  key={3}
                  label={'버스'}
                  value={String(3)}
                  disabled={!isAuthUser('BS')}
                />
              </TabList>
              <>{children}</>
            </div>
          </TabContext>
        </div>
      </div>
    </div>
  )
}

const DefaultSuspiciousDetections = () => {
  return (
    <>
      <tr>
        <td className="t-left">주유 패턴이상</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">단시간 반복주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">1일 4회이상</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">탱크용량 초과주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">톤급별 평균대비 초과주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">거리대비 주유시간이상</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">유효하지 않은 사업자 의심 주유</td>
        <td className="t-right">00,00</td>
      </tr>
      <tr>
        <td className="t-left">주행거리 기반 주유량 의심 주유</td>
        <td className="t-right">00,00</td>
      </tr>
    </>
  )
}

const NoneSubsidyClaimData = () => {
  return (
    <tr>
      <td className="t-center">데이터 없음</td>
      <td className="t-right">00,000</td>
      <td className="t-right">00,000</td>
      <td className="t-right">00,000</td>
      <td className="t-right">00,000</td>
    </tr>
  )
}

const SubsidyAreaNoticeComment = ({ children }: any) => {
  return (
    <div className="contents-explanation">
      <div className="contents-explanation-inner">
        <div className="contents-explanation-text">{children}</div>
      </div>
    </div>
  )
}
