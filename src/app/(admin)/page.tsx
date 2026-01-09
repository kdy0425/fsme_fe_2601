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
  CardIssueRequest,
  RfidIssueRequest,
  WrittenApplication,
  ClaimConfirmation,
  SuspiciousTransaction,
  TankCapacity,
  LgovTrnsfrnRequst,
  LgovMvtRequst,
  DdppDoubtDlng,
  DoubtExamTarget,
  FuelSubsidyRate,
  FreightDailyApplicationStatus,
  BusCardDailyApplicationStatus,
  BusRfidDailyApplicationStatus,
  TaxiCardDailyApplicationStatus,
  FreightFuelSubsidyClaimStatus,
  BusFuelSubsidyClaimStatus,
  TaxiFuelSubsidyClaimStatus,
  FreightMonthlySubsidyPaymentStatus,
  BusMonthlySubsidyPaymentStatus,
  TaxiMonthlySubsidyPaymentStatus,
  FreightSuspiciousTransactionDetection,
  TaxiSuspiciousTransactionDetection,
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
} from '../components/context/UserAuthContext'
import ModifyDialog from './_components/NoticeDetailDialog'
import { useDispatch, useSelector } from '@/store/hooks'
import { openIllegalModal } from '@/store/popup/MainPageIllegalitySlice'
import { openServeyModal, setSurveyInfo } from '@/store/popup/SurveySlice'
import MainIllegalityModal from '../components/popup/MainIllegalityModal'
import SurveyModal from '../components/popup/SurveyModal'
import NoticeModalContainer from '../components/popup/NoticeModalContainer'
import { openNoticeModal, setNoticeModalData } from '@/store/popup/NoticeSlice'
import CustomFormLabel from '../components/forms/theme-elements/CustomFormLabel'
import { string } from '@amcharts/amcharts4/core'
import { getCommaNumber } from '@/utils/fsms/common/util'
import { VerticalAlignCenter } from '@mui/icons-material'

import BoardModal from '../(ilp)/_components/board/BoardModal'
import { handleIlpBoardOpen } from '@/store/popup/IlpBoardSlice'

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
    to: '/',
    title: 'Home',
  },
  {
    to: '/',
    title: '관리시스템 메인',
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

  const [detailMoalFlag, setDetailModalFlag] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice>()
  const handleDetailCloseModal = () => {
    setDetailModalFlag((prev) => false)
  }
  const handleSelectedNotice = (notice: Notice) => {
    setSelectedNotice(notice)
    setDetailModalFlag(true)
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
  const [notices, setNotices] = useState<Notice[]>([]) // 1.메인화면 게시판을 조회
  const [cardIssueRequests, setCardIssueRequests] = useState<CardIssueRequest>() // 2.나의 할일 - 카드발급요청을 조회
  const [rfidIssueRequests, setRfidIssueRequests] = useState<RfidIssueRequest>() // 3.나의 할일 - RFID발급요청을 조회
  const [writtenApplications, setWrittenApplications] =
    useState<WrittenApplication>() // 4.나의 할일 - 서면신청을 조회
  const [claimConfirmations, setClaimConfirmations] =
    useState<ClaimConfirmation>() // 5.나의 할일 - 청구확정을 조회
  const [suspiciousTransactions, setSuspiciousTransactions] =
    useState<SuspiciousTransaction>() // 6.나의 할일 - 의심거래를 조회
  const [tankCapacities, setTankCapacities] = useState<TankCapacity>() // 7.나의 할일 - 탱크용량을 조회
  const [lgovTrnsfrnRequst, setLgovTrnsfrnRequst] = useState<LgovTrnsfrnRequst>() // 8.나의 할일 - 지자체전입요청을 조회
  const [lgovMvtRequst, setLgovMvtRequst] = useState<LgovMvtRequst>() // 9.나의 할일 - 지자체전출요청을 조회
  const [ddppDoubtDlng, setDdppDoubtDlng] = useState<DdppDoubtDlng>() // 10.나의 할일 - 부정수급방지시스템 의심거래적발건수 조회
  const [doubtExamTarget, setDoubtExamTarget] = useState<DoubtExamTarget>() // 11.나의 할일 - 부정수급방지시스템 조사대상건수 조회
  const [urls, setUrls] = useState<any>([])
  const [fuelSubsidyRates, setFuelSubsidyRates] = useState<FuelSubsidyRate>() // 유가보조금 단가를 조회
  const [freightDailyApplications, setFreightDailyApplications] = useState<
    FreightDailyApplicationStatus[]
  >([]) // 12.화물 일별 신청현황을 조회
  const [busCardDailyApplications, setBusCardDailyApplications] = useState<
    BusCardDailyApplicationStatus[]
  >([]) // 13.버스 카드 일별 신청현황을 조회
  const [busRfidDailyApplications, setBusRfidDailyApplications] = useState<
    BusRfidDailyApplicationStatus[]
  >([]) // 14.버스 RFID 일별 신청현황을 조회
  const [taxiCardDailyApplications, setTaxiCardDailyApplications] = useState<
    TaxiCardDailyApplicationStatus[]
  >([]) // 15.택시 카드 일별 신청현황을 조회

  const [freightFuelSubsidyClaims, setFreightFuelSubsidyClaims] = useState<
    FreightFuelSubsidyClaimStatus[]
  >([]) // 16.화물 유가보조금 청구현황을 조회
  const [busFuelSubsidyClaims, setBusFuelSubsidyClaims] = useState<
    BusFuelSubsidyClaimStatus[]
  >([]) // 17.버스 유가보조금 청구현황을 조회
  const [taxiFuelSubsidyClaims, setTaxiFuelSubsidyClaims] = useState<
    TaxiFuelSubsidyClaimStatus[]
  >([]) // 18.택시 유가보조금 청구현황을 조회            파리미터

  const [freightMonthlySubsidies, setFreightMonthlySubsidies] = useState<
    FreightMonthlySubsidyPaymentStatus[]
  >([]) // 19.화물 월별 보조금 지급현황을 조회           파리미터
  const [busMonthlySubsidies, setBusMonthlySubsidies] = useState<
    BusMonthlySubsidyPaymentStatus[]
  >([]) // 20.페이징, 버스 월별 보조금 지급현황을 조회   페이징      파리미터
  const [taxiMonthlySubsidies, setTaxiMonthlySubsidies] = useState<
    TaxiMonthlySubsidyPaymentStatus[]
  >([]) //21.페이징, 택시 월별 보조금 지급현황을 조회   페이징      파리미터

  const [freightSuspiciousDetections, setFreightSuspiciousDetections] =
    useState<FreightSuspiciousTransactionDetection[]>([]) // 22.화물 의심거래 적발현황을 조회   페이징      파리미터
  const [taxiSuspiciousDetections, setTaxiSuspiciousDetections] = useState<
    TaxiSuspiciousTransactionDetection[]
  >([]) // 23.택시 의심거래 적발현황을 조회    페이징    파리미터

  const [InstcSpldmd, setInstcSpldmd] = useState<Notice[]>([]) // 24.메인화면 부정수급사례공유 조회  

  const [year, setYear] = useState<string>()

  const { authInfo } = useContext(UserAuthContext)

  /**************************************************************  useEffect 부 시작 ********************************************************/

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          // 0
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobCrdIssuDmnd`,
            null,
            true,
          ),
          // 1
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobRfidIssuDmnd`,
            null,
            true,
          ),
          // 2
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobDocmntAply`,
            null,
            true,
          ),
          // 3
          sendHttpRequest('GET', `/fsm/mai/main/getMyJobClnCfmtn`, null, true),
          // 4
          sendHttpRequest(
            'GET',
            `/fsm/mai/main/getMyJobDoubtDelng`,
            null,
            true,
          ),
          // 탱크용량 변경요청
          // 5
          sendHttpRequest('GET', `/fsm/mai/main/getMyJobTnkCpcty`, null, true),
          // 지자체 전입요청
          // 6
          sendHttpRequest('GET', `/fsm/mai/main/getMyJobLgovTrnsfrnRequst`, null, true),
          // 지자체 전출요청
          // 7
          sendHttpRequest('GET', `/fsm/mai/main/getMyJobLgovMvtRequst`, null, true),
          // 부정수급방지시스템 의심거래적발건수
          // 8
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobDdppDoubtDlng`, null, true),
          // 부정수급방지시스템 조사대상건수
          // 9
          sendHttpRequest('GET', `/ilp/mai/main/getMyJobDoubtExamTarget`, null, true),
          // 10
          sendHttpRequest('GET', `/fsm/mai/main/getUnitPrc`, null, true),
          // 11
          sendHttpRequest('GET', `/fsm/mai/main/getNtcMttr`, null, true),
          // 부정수급 행정처리 현황 모달 표시여부 조회
          // 12
          sendHttpRequest('GET', `/fsm/mai/main/getIllegalityCnt`, null, true),
          // 설문조사 팝업 표시여부 조회
          // 13
          sendHttpRequest('GET', `/fsm/mai/main/getQesitmTrgetYn`, null, true),
          // 14 부정수급 사례 공유
          sendHttpRequest('GET', `/ilp/mai/main/getAllInstcSpldmdCaseShrn`, null, true),
        ]

        const results = await Promise.allSettled(endpoints)

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value
            switch (index) {
              case 0:
                if (data?.resultType === 'success') {
                  setCardIssueRequests(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 카드발급요청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 1:
                if (data?.resultType === 'success') {
                  setRfidIssueRequests(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 RFID발급요청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 2:
                if (data?.resultType === 'success') {
                  setWrittenApplications(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 서면신청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 3:
                if (data?.resultType === 'success') {
                  setClaimConfirmations(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 청구확정 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 4:
                if (data?.resultType === 'success') {
                  setSuspiciousTransactions(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 의심거래 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 5:
                if (data?.resultType === 'success') {
                  setTankCapacities(data.data)
                } else if (data?.resultType === 'error') {                  
                  alert(
                    `나의 할 일 탱크용량 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 6:
                if (data?.resultType === 'success') {
                  setLgovTrnsfrnRequst(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 전입요청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 7:
                if (data?.resultType === 'success') {
                  setLgovMvtRequst(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 전출요청 건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 8:
                if (data?.resultType === 'success') {
                  setDdppDoubtDlng(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 부정수급방지시스템 의심거래적발건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 9:
                if (data?.resultType === 'success') {
                  setDoubtExamTarget(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 부정수급방지시스템 조사대상건수 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
                  )
                }
                break
              case 10:
                if (data?.resultType === 'success')
                  setFuelSubsidyRates(data.data)
                break
              case 11:
                if (data?.resultType === 'success') setNotices(data.data)
                break

              // 부정수급 행정처리 현황 모달 표시
              case 12:
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
              case 13:
                if (data?.data.length > 0) {
                  let { srvyYn, srvyCycl } = data?.data[0]
                  if (srvyYn === 'N') {
                    dispatch(setSurveyInfo(srvyCycl))
                    dispatch(openServeyModal())
                  }
                  break
                }
                break
              case 14:
                if (data?.resultType === 'success') {
                  setInstcSpldmd(data.data)
                } else if (data?.resultType === 'error') {
                  alert(
                    `나의 할 일 부정수급 사례 공유 조회중 문제가 발생하였습니다. ${data?.status} ${data?.message}`,
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
      //데이터 전부 조회 후에 공지사항 모달데이터를 조회한다.
      dispatch(openNoticeModal())
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

  useEffect(() => {
    setTabValue()

    if (isAuthUser('TR')) {
      fetchTruckMainData()
      fetchFreightData()
    }
    if (isAuthUser('TX')) {
      fetchTaxiMainData()
      fetchTaxiData()
    }
    if (isAuthUser('BS')) {
      fetchBusMainData()
      fetchBusData()
    }
  }, [authInfo])

  useEffect(() => {
    handleSelectChange()
  }, [select])

  /**************************************************************  useEffect 부 끝 ********************************************************/

  /*********************************************************  나의 할일 이외 api호출 시작 ***************************************************/

  const fetchTruckMainData = async () => {
    const { locgovCd }: any = authInfo

    try {
      const endpoints = [
        // 8
        sendHttpRequest('GET', `/fsm/mai/main/tr/getCardCnt`, null, true), //화물 카드발급&rfid발급 일별신청현황
        // 12
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tr/getInstcDoubt?gubun=TR`,
          null,
          true,
        ), //화물 의심거래 적발현황
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tr/getFtxAsst?locgovCd=` + locgovCd,
          null,
          true,
        ),
      ]

      const [
        //유가 보조금 청구현황
        trCardRfid,
        trInstcDoubt,
        trftxAsst,
      ] = await Promise.all(endpoints)

      try {
        if (trCardRfid?.resultType === 'success')
          setFreightDailyApplications(trCardRfid.data)
      } catch (error) {
        console.log('error fail trCardRfid')
      }
      try {
        if (trInstcDoubt?.resultType === 'success')
          setFreightSuspiciousDetections(trInstcDoubt.data)
      } catch (error) {
        console.log('error fail trInstcDoubt')
      }
      try {
        if (trftxAsst?.resultType === 'success')
          setFreightFuelSubsidyClaims(trftxAsst.data)
      } catch (error) {
        console.log('error fail trftxAsst')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchTaxiMainData = async () => {
    const { locgovCd }: any = authInfo
    try {
      const endpoints = [
        // 8
        sendHttpRequest('GET', `/fsm/mai/main/tx/getCardCnt`, null, true), //택시 카드발급 일별신청현황
        // 12
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tr/getInstcDoubt?gubun=TX`,
          null,
          true,
        ), //택시 의심거래 적발현황
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/tx/getFtxAsst?locgovCd=` + locgovCd,
          null,
          true,
        ), //택시 유가보조금 청구현황을 조회
      ]

      const [
        //유가 보조금 청구현황
        txCardRfid,
        txInstcDoubt,
        txftxAsst,
      ] = await Promise.all(endpoints)

      try {
        if (txCardRfid?.resultType === 'success')
          setTaxiCardDailyApplications(txCardRfid.data)
      } catch (error) {
        console.log('error fail txCardRfid')
      }
      try {
        if (txInstcDoubt?.resultType === 'success')
          setTaxiSuspiciousDetections(txInstcDoubt.data)
      } catch (error) {
        console.log('error fail txInstcDoubt')
      }
      try {
        if (txftxAsst?.resultType === 'success')
          setTaxiFuelSubsidyClaims(txftxAsst.data)
      } catch (error) {
        console.log('error fail setTaxiCardDailyApplications')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchBusMainData = async () => {
    const { locgovCd }: any = authInfo
    try {
      const endpoints = [
        // 9
        sendHttpRequest('GET', `/fsm/mai/main/bs/getCardRqstDt`, null, true),
        // 10
        sendHttpRequest('GET', `/fsm/mai/main/bs/getRfidRqstDt`, null, true), //택시 의심거래 적발현황
        sendHttpRequest(
          'GET',
          `/fsm/mai/main/bs/getFtxAsst?locgovCd=` + locgovCd,
          null,
          true,
        ), // 버스 유가보조금 청구현황을 조회
      ]

      const [
        //유가 보조금 청구현황
        bsCardCnt,
        bsRfidCnt,
        bsftxAsst,
      ] = await Promise.all(endpoints)

      try {
        if (bsCardCnt?.resultType === 'success')
          setBusCardDailyApplications(bsCardCnt.data)
      } catch (error) {
        console.log('error fail bsCardCnt')
      }
      try {
        if (bsRfidCnt?.resultType === 'success')
          setBusRfidDailyApplications(bsRfidCnt.data)
      } catch (error) {
        console.log('error fail bsRfidCnt')
      }
      try {
        if (bsftxAsst?.resultType === 'success')
          setBusFuelSubsidyClaims(bsftxAsst.data)
      } catch (error) {
        console.log('error fail bsftxAsst')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 화물 월별 보조금 지급 현황 호출
  const fetchFreightData = async () => {
    setLoading(true)
    try {
      const endpoint = `/fsm/mai/main/tr/monAsstGiveCusTr?&year=${select}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // console.log('Freight Data:', response.data)
        // setFreightMonthlySubsidies([...response.data])
        const responseData = response.data.map((item: any) => ({
          ...item,
          type: 'freight',
        }))
        setFreightMonthlySubsidies(responseData)
      }
    } catch (error) {
      console.log('화물 월별 보조금 데이터를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 버스 월별 보조금 지급 현황 호출
  const fetchBusData = async () => {
    setLoading(true)
    try {
      const endpoint = `/fsm/mai/main/bs/getOpsMth?&year=${select}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // console.log('Bus Data:', response.data.content)
        // setBusMonthlySubsidies([...response.data.content])
        const responseData = response.data.content.map((item: any) => ({
          ...item,
          type: 'bus',
        }))
        setBusMonthlySubsidies(responseData)
      }
    } catch (error) {
      console.log('버스 월별 보조금 데이터를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 택시 월별 보조금 지급 현황 호출
  const fetchTaxiData = async () => {
    setLoading(true)
    try {
      const endpoint = `/fsm/mai/main/tx/getOpsMthTx?&year=${select}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // console.log('Taxi Data:', response.data)
        // setTaxiMonthlySubsidies([...response.data])
        const responseData = response.data.map((item: any) => ({
          ...item,
          type: 'taxi',
        }))
        setTaxiMonthlySubsidies(responseData)
      }
    } catch (error) {
      console.log('택시 월별 보조금 데이터를 가져오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /*********************************************************  나의 할일 이외 api호출 끝 ***************************************************/

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

  const handleSelectChange = () => {
    if (isAuthUser('TR')) {
      fetchFreightData()
    }
    if (isAuthUser('BS')) {
      fetchBusData()
    }
    if (isAuthUser('TX')) {
      fetchTaxiData()
    }
  }

  return (
    <PageContainer title="Main" description="메인페이지">
      <div className="main-container">
        <div className="main-container-inner">
          {/* 카테고리 시작 */}
          <Breadcrumb title="유가보조금 관리시스템" items={BCrumb} />
          {/* 카테고리 끝 */}
        </div>
      </div>
      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents">
            <div className="main-contents-box">
              <div style={{
                display: 'flex',
                gap:10,
                alignItems:'center',
                margin:0,
                padding:0
              }}>
                <h1 className="contents-box-title"
                  style={{margin:0}}
                >나의 할일</h1>
                <p className="oilps-info-date">
                    ({getFormattedDate() + '  기준 최근 한달'})
                  </p>
              </div>
              <div className="contents-box-con">
                <div className='info-box-dsc'>
                  <div className="oilps-map-info-box">
                    <div className="oilps-info-con-value-md ">
                      ※ <span className="textB">화물</span> /{' '}
                      <span className="color-orange">택시</span> /{' '}
                      <span className="color-gray">버스</span>
                    </div>
                  </div>
                </div>
                <div className='main-oilps-full'>
                  <div className="oilps-map-info-box-col-group grid-4">
                    {/* 카드발급요청 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">카드발급요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 카드발급요청 화물 건수 */}
                        {cardIssueRequests?.cardTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() =>
                              handleCartPubClick('/cad/cijm?tabIndex=TR')
                            }
                          >
                            {cardIssueRequests !== undefined
                              ? Number(
                                  cardIssueRequests.cardDmndTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* 카드발급요청 택시 건수 */}
                        {cardIssueRequests?.cardTxAuth ? (
                          <>
                            {cardIssueRequests?.cardTrAuth ? <>{'/'}</> : null}
                            <p
                              className="oilps-info-con-value color-orange button"
                              onClick={() =>
                                handleCartPubClick('/cad/cijm?tabIndex=TX')
                              }
                            >
                              {cardIssueRequests !== undefined
                                ? Number(
                                    cardIssueRequests.cardDmndTxCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 카드발급요청 버스 건수 */}
                        {cardIssueRequests?.cardBsAuth ? (
                          <>
                            {cardIssueRequests?.cardTxAuth ||
                            cardIssueRequests?.cardTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-gray button"
                              onClick={() =>
                                handleCartPubClick('/cad/cijm?tabIndex=BS')
                              }
                            >
                              {cardIssueRequests !== undefined
                                ? Number(
                                    cardIssueRequests.cardDmndBsCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 카드발급요청 해당없음 */}
                        {!cardIssueRequests?.cardTxAuth &&
                        !cardIssueRequests?.cardTrAuth &&
                        !cardIssueRequests?.cardBsAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                    {/* RFID발급요청 건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">RFID발급요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* RFID발급요청 화물 건수 */}
                        {rfidIssueRequests?.rfidTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() =>
                              handleCartPubClick('/cad/rtjm?tabIndex=TR')
                            }
                          >
                            {rfidIssueRequests !== undefined
                              ? Number(
                                  rfidIssueRequests.rfidDmndTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* RFID발급요청 버스 건수 */}
                        {rfidIssueRequests?.rfidBsAuth ? (
                          <>
                            {rfidIssueRequests?.rfidTrAuth ? <>{'/'}</> : null}
                            <p
                              className="oilps-info-con-value color-gray button"
                              onClick={() =>
                                handleCartPubClick('/cad/rtjm?tabIndex=BS')
                              }
                            >
                              {rfidIssueRequests !== undefined
                                ? Number(
                                    rfidIssueRequests.rfidDmndBsCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* RFID발급요청 해당없음 */}
                        {!rfidIssueRequests?.rfidTrAuth &&
                        !rfidIssueRequests?.rfidBsAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                    {/* 서면신청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">서면신청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 서면신청 화물 건수 */}
                        {writtenApplications?.docmntTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() => handleCartPubClick('/par/pr')}
                          >
                            {writtenApplications !== undefined
                              ? Number(
                                  writtenApplications.docmntAplyTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* 서면신청 택시 건수 */}
                        {writtenApplications?.docmntTxAuth ? (
                          <>
                            {writtenApplications?.docmntTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-orange button"
                              onClick={() => handleCartPubClick('/par/cpr')}
                            >
                              {writtenApplications !== undefined
                                ? Number(
                                    writtenApplications.docmntAplyTxCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 서면신청 버스 건수 */}
                        {writtenApplications?.docmntBsAuth ? (
                          <>
                            {writtenApplications?.docmntTxAuth ||
                            writtenApplications?.docmntTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-gray button"
                              onClick={() => handleCartPubClick('/par/opr')}
                            >
                              {writtenApplications !== undefined
                                ? Number(
                                    writtenApplications.docmntAplyBsCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 서면신청 해당없음 */}
                        {!writtenApplications?.docmntTxAuth &&
                        !writtenApplications?.docmntTrAuth &&
                        !writtenApplications?.docmntBsAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                    {/* 청구확정건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">청구확정</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 청구확정 화물건수 */}
                        {claimConfirmations?.clnCfmtnTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() => handleCartPubClick('/cal/sr')}
                          >
                            {claimConfirmations !== undefined
                              ? Number(
                                  claimConfirmations.clnCfmtnTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* 청구확정 택시건수 */}
                        {claimConfirmations?.clnCfmtnTxAuth ? (
                          <>
                            {claimConfirmations?.clnCfmtnTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-orange button"
                              onClick={() => handleCartPubClick('/cal/pd')}
                            >
                              {claimConfirmations !== undefined
                                ? Number(
                                    claimConfirmations.clnCfmtnTxCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 청구확정 버스건수 */}
                        {claimConfirmations?.clnCfmtnBsAuth ? (
                          <>
                            {claimConfirmations?.clnCfmtnTxAuth ||
                            claimConfirmations?.clnCfmtnTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-gray button"
                              onClick={() => handleCartPubClick('/cal/lpd')}
                            >
                              {claimConfirmations !== undefined
                                ? Number(
                                    claimConfirmations.clnCfmtnBsCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 청구확정 해당없음 */}
                        {!claimConfirmations?.clnCfmtnTxAuth &&
                        !claimConfirmations?.clnCfmtnTrAuth &&
                        !claimConfirmations?.clnCfmtnBsAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                    {/* 의심거래건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">의심거래</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 의심거래 화물건수 */}
                        {suspiciousTransactions?.doubtDelngTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() =>
                              handleCartPubClick(
                                `${suspiciousTransactions?.doubtDelngTrUrl === '' ? '/ilg/lpav' : suspiciousTransactions?.doubtDelngTrUrl}`,
                              )
                            }
                          >
                            {suspiciousTransactions !== undefined
                              ? Number(
                                  suspiciousTransactions.doubtDelngTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {suspiciousTransactions?.doubtDelngTrAuth &&
                        suspiciousTransactions.doubtDelngTxAuth ? (
                          <>{'/'}</>
                        ) : null}
                        {/* 의심거래 택시건수 */}
                        {suspiciousTransactions?.doubtDelngTxAuth ? (
                          <p
                            className="oilps-info-con-value color-orange button"
                            onClick={() =>
                              handleCartPubClick(
                                `${suspiciousTransactions?.doubtDelngTxUrl === '' ? '/ilg/aavee' : suspiciousTransactions?.doubtDelngTxUrl}`,
                              )
                            }
                          >
                            {suspiciousTransactions !== undefined
                              ? Number(
                                  suspiciousTransactions.doubtDelngTxCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* 의심거래 해당없음 */}
                        {!suspiciousTransactions?.doubtDelngTrAuth &&
                        !suspiciousTransactions?.doubtDelngTxAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                    {/* 탱크용량신청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">탱크용량</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 탱크용량 화물신청건수 */}
                        {tankCapacities?.tnkCpctyTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() => handleCartPubClick('/stn/tcc')}
                          >
                            {tankCapacities !== undefined
                              ? Number(
                                  tankCapacities.tnkCpctyTrCnt,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        )}
                      </div>
                    </div>
                    {/* 전입요청건수 */}
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">전입요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 화물 전입요청 건수 */}
                        {lgovTrnsfrnRequst?.lgovTrnsfrnRequstTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() =>
                              handleCartPubClick('/stn/lttm?tabIndex=TR')
                            }
                          >
                            {lgovTrnsfrnRequst !== undefined
                              ? Number(
                                  lgovTrnsfrnRequst.lgovTrnsfrnRequstTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* 택시 전입요청 건수 */}
                        {lgovTrnsfrnRequst?.lgovTrnsfrnRequstTxAuth ? (
                          <>
                            {lgovTrnsfrnRequst?.lgovTrnsfrnRequstTrAuth ? <>{'/'}</> : null}
                            <p
                              className="oilps-info-con-value color-orange button"
                              onClick={() =>
                                handleCartPubClick('/stn/lttm?tabIndex=TX')
                              }
                            >
                              {lgovTrnsfrnRequst !== undefined
                                ? Number(
                                    lgovTrnsfrnRequst.lgovTrnsfrnRequstTxCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 버스 전입요청 건수 */}
                        {lgovTrnsfrnRequst?.lgovTrnsfrnRequstBsAuth ? (
                          <>
                            {lgovTrnsfrnRequst?.lgovTrnsfrnRequstTxAuth ||
                            lgovTrnsfrnRequst?.lgovTrnsfrnRequstTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-gray button"
                              onClick={() =>
                                handleCartPubClick('/stn/lttm?tabIndex=BS')
                              }
                            >
                              {lgovTrnsfrnRequst !== undefined
                                ? Number(
                                    lgovTrnsfrnRequst.lgovTrnsfrnRequstBsCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 전입요청 해당없음 */}
                        {!lgovTrnsfrnRequst?.lgovTrnsfrnRequstTxAuth &&
                        !lgovTrnsfrnRequst?.lgovTrnsfrnRequstTrAuth &&
                        !lgovTrnsfrnRequst?.lgovTrnsfrnRequstBsAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title">전출요청</div>
                      <div
                        className="oilps-info-con"
                        style={{ display: 'flex' }}
                      >
                        {/* 화물 전출요청 건수 */}
                        {lgovMvtRequst?.lgovMvtRequstTrAuth ? (
                          <p
                            className="oilps-info-con-value textB button"
                            onClick={() =>
                              handleCartPubClick('/stn/ltmm?tabIndex=TR')
                            }
                          >
                            {lgovMvtRequst !== undefined
                              ? Number(
                                  lgovMvtRequst.lgovMvtRequstTrCnt ?? 0,
                                ).toLocaleString('ko-KR')
                              : '0'}
                            <span className="info-value-small">건</span>
                          </p>
                        ) : null}
                        {/* 택시 전출요청 건수 */}
                        {lgovMvtRequst?.lgovMvtRequstTxAuth ? (
                          <>
                            {lgovMvtRequst?.lgovMvtRequstTrAuth ? <>{'/'}</> : null}
                            <p
                              className="oilps-info-con-value color-orange button"
                              onClick={() =>
                                handleCartPubClick('/stn/ltmm?tabIndex=TX')
                              }
                            >
                              {lgovMvtRequst !== undefined
                                ? Number(
                                    lgovMvtRequst.lgovMvtRequstTxCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 버스 전출요청 건수 */}
                        {lgovMvtRequst?.lgovMvtRequstBsAuth ? (
                          <>
                            {lgovMvtRequst?.lgovMvtRequstTxAuth ||
                            lgovMvtRequst?.lgovMvtRequstTrAuth ? (
                              <>{'/'}</>
                            ) : null}
                            <p
                              className="oilps-info-con-value color-gray button"
                              onClick={() =>
                                handleCartPubClick('/stn/ltmm?tabIndex=BS')
                              }
                            >
                              {lgovMvtRequst !== undefined
                                ? Number(
                                    lgovMvtRequst.lgovMvtRequstBsCnt ?? 0,
                                  ).toLocaleString('ko-KR')
                                : '0'}
                              <span className="info-value-small">건</span>
                            </p>
                          </>
                        ) : null}
                        {/* 전출요청 해당없음 */}
                        {!lgovMvtRequst?.lgovMvtRequstTxAuth &&
                        !lgovMvtRequst?.lgovMvtRequstTrAuth &&
                        !lgovMvtRequst?.lgovMvtRequstBsAuth ? (
                          <p className="oilps-info-con-value textB">해당없음</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className='oilps-map-info-box-col-group green_box half'>
                    <div className="oilps-map-title">
                        <h2>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.8965 2C11.8965 2 9.97499 6.40886 4 5.4569V14.3975C4.15354 14.9765 3.4648 19.6749 11.8965 22C20.3281 19.6749 19.6394 14.9765 19.7929 14.3975V5.4569C13.8179 6.40886 11.8965 2 11.8965 2Z" stroke="#1694B1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M8.94385 12.6235L11.6462 14.8784L15.2522 10.623" stroke="#1694B1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>
                          부정수급방지시스템
                        </h2>
                        <div className="description">
                          <Link href="/ilp" className='main-info-link'
                            target = '_blank' rel='noopener noreferrer'
                          >
                            부정수급방지시스템으로 이동합니다.
                          </Link>
                        </div>
                    </div>
                    <div className="oilps-map-info-box green">
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
                          <p className="oilps-info-con-value textB">해당없음</p>
                        )}
                      </div>
                    </div>
                    <div className="oilps-map-info-box green">
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
                          <p className="oilps-info-con-value textB">해당없음</p>
                        )}                        
                      </div>
                    </div>
                  </div>
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
                <h1 className="contents-box-title">
                  공지사항
                  <div className="main-title-option">
                    <button
                      className="main-info-board-more-btn"
                      onClick={() => handleCartPubClick('./sup/notice')}
                      title="더보기 버튼"
                    ></button>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <ul className="main-info-board-list">
                    {notices && notices.length > 0 ? (
                      notices.map((notice, index) => {
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
      </>        

      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group row-full">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">유가보조금 단가 정보</h1>
                <div className="contents-box-con box-con-col-group">
                  <div className="oilps-map-info-box-col-group box-con-col">
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type1">
                        경유
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">경유</div> */}
                              <div className="tooltip-content">
                                경유 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <p className="oilps-info-con-title info-value-small">
                        단가 (ℓ)
                      </p>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-value textB">
                          {fuelSubsidyRates !== undefined
                            ? getNumtoWon(fuelSubsidyRates.koiD)
                            : '데이터 없음'}
                          <span className="info-value-small">원</span>
                        </p>
                        <p className="oilps-info-con-value info-value-small">
                          {fuelSubsidyRates !== undefined &&
                          fuelSubsidyRates.koiD10
                            ? `(${getNumtoWon(fuelSubsidyRates.koiD10)})원`
                            : '(데이터 없음)'}
                        </p>
                      </div>
                    </div>

                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type3">
                        CNG
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">CNG</div> */}
                              <div className="tooltip-content">
                                CNG 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <p className="oilps-info-con-title info-value-small">
                        단가 (㎥)
                      </p>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-value textB">
                          {fuelSubsidyRates !== undefined
                            ? getNumtoWon(fuelSubsidyRates.koiC)
                            : '데이터 없음'}
                          <span className="info-value-small">원</span>
                        </p>
                        <p className="oilps-info-con-value info-value-small">
                          {fuelSubsidyRates !== undefined &&
                          fuelSubsidyRates.koiC13
                            ? `(${getNumtoWon(fuelSubsidyRates.koiC13)})원`
                            : '데이터 없음'}
                        </p>
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type4">
                        수소
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">수소</div> */}
                              <div className="tooltip-content">
                                수소 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-title info-value-small">
                          단가 (㎏)
                        </p>
                        <div className="oilps-info-sub-value">
                          <div className="color-blue">
                            {fuelSubsidyRates !== undefined
                              ? getNumtoWon(fuelSubsidyRates.koiHtr)
                              : '데이터 없음'}
                            <span className="info-value-small">원</span>
                          </div>
                        </div>
                        <div className="oilps-info-sub-value">
                          <div className="color-orange">
                            {fuelSubsidyRates !== undefined
                              ? getNumtoWon(fuelSubsidyRates?.koiHtx)
                              : '데이터 없음'}
                            <span className="info-value-small">원</span>
                          </div>
                        </div>
                        <div className="oilps-info-sub-value">
                          <div className="color-gray">
                            {fuelSubsidyRates !== undefined
                              ? getNumtoWon(fuelSubsidyRates?.koiHbs)
                              : '데이터 없음'}
                            <span className="info-value-small">원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="oilps-map-info-box">
                      <div className="oilps-info-title info-title-type2">
                        LPG
                        <HtmlTooltip
                          className="help-tooltip"
                          title={
                            <React.Fragment>
                              {/* <div className="tooltip-title">LPG</div> */}
                              <div className="tooltip-content">
                                LPG 단가 정보입니다.
                              </div>
                            </React.Fragment>
                          }
                        >
                          <Button className="icon icon-help tooltips">
                            도움말
                          </Button>
                        </HtmlTooltip>
                      </div>
                      <p className="oilps-info-con-title info-value-small">
                        단가 (ℓ)
                      </p>
                      <div className="oilps-info-con">
                        <p className="oilps-info-con-value textB">
                          {fuelSubsidyRates !== undefined
                            ? getNumtoWon(fuelSubsidyRates.koiL)
                            : '데이터 없음'}
                          <span className="info-value-small">원</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="box-con-col box-auto">
                    <div className="contents-explanation">
                      <div className="contents-explanation-inner">
                        <div className="contents-explanation-text">
                          경유의 경우 고속우등버스가 아닌 경우 괄호안의 단가를
                          적용 받습니다.
                        </div>
                      </div>
                    </div>
                    <div className="contents-explanation">
                      <div className="contents-explanation-inner">
                        <div className="contents-explanation-text">
                          CNG의 경우 전세버스인 경우 괄호 안의 단가를 적용
                          받습니다.
                        </div>
                      </div>
                    </div>
                    <div className="contents-explanation">
                      <div className="contents-explanation-inner">
                        <div className="contents-explanation-text">
                          수소의 경우{' '}
                          <strong className="color-blue">화물</strong> /{' '}
                          <strong className="color-orange">택시</strong> /{' '}
                          <strong className="color-gray">버스</strong>의 단가를
                          적용 받습니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <MainContents
              contentTitle={'일별신청현황'}
              tabContextValue={valueTab3}
              tabListHandler={handleChangeTab3}
              tabListLabel={'유가보조금 청구현황 탭 그룹'}
              isAuthUser={isAuthUser}
            >
              <p className="oilps-info-date" style={{ margin: '10px 0 0 0' }}>
                ({getFormattedDate() + ''})
              </p>
              <div className="tab-content">
                <TabPanel key={1} value={String(1)}>
                  <div className="chart-group marT20">
                    {/* 화물  */}
                    <div className="chart-col">
                      <h4>카드발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart01
                        id="chartdiv1"
                        key="chartdiv1"
                        cardPulist={freightDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                    <div className="chart-col">
                      <h4>RFID발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart02
                        id="chartdiv2"
                        key="chartdiv2"
                        rfidPulist={freightDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel key={2} value={String(2)}>
                  <div className="chart-group marT20">
                    {/* 택시  */}
                    <div className="chart-col">
                      <h4>카드발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart01
                        id="chartdiv3"
                        key="chartdiv3"
                        cardPulist={taxiCardDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                    <div className="chart-col">
                      <h4>RFID발급 현황</h4>
                      {/* 차트 시작 */}

                      <XYChart02
                        id="chartdiv4"
                        key="chartdiv4"
                        rfidPulist={[]}
                      />
                      {/* 차트 끝 */}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel key={3} value={String(3)}>
                  <div className="chart-group marT20">
                    {/* 버스  */}
                    <div className="chart-col">
                      <h4>카드발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart01
                        id="chartdiv5"
                        key="chartdiv5"
                        cardPulist={busCardDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                    <div className="chart-col">
                      <h4>RFID발급 현황</h4>
                      {/* 차트 시작 */}
                      <XYChart02
                        id="chartdiv6"
                        key="chartdiv6"
                        rfidPulist={busRfidDailyApplications}
                      />
                      {/* 차트 끝 */}
                    </div>
                  </div>
                </TabPanel>
              </div>
            </MainContents>
            <MainContents
              contentTitle={'유가보조금 청구현황'}
              tabContextValue={valueTab1}
              tabListHandler={handleChangeTab1}
              tabListLabel={'유가보조금 청구현황 탭 그룹'}
              isAuthUser={isAuthUser}
            >
              <div className="tab-content">
                <Link href="./cal/sr" className="main-info-link">
                  <TabPanel key={1} value={String(1)}>
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>가이드 타이틀 테이블 요약</caption>
                        <colgroup>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">청구월</th>
                            <th scope="col">거래건수</th>
                            <th scope="col">주유량(ℓ)</th>
                            <th scope="col">총거래금액</th>
                            <th scope="col">유가보조금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {freightFuelSubsidyClaims &&
                          freightFuelSubsidyClaims.length > 0 ? (
                            freightFuelSubsidyClaims.map(
                              (freightFuelSubsidyClaim, index) => {
                                return (
                                  <tr key={'trrow2' + index}>
                                    <td className="t-center">
                                      {formatDate(
                                        freightFuelSubsidyClaim.clclnYm,
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(
                                        freightFuelSubsidyClaim.cnt1,
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getCommaNumber(
                                        getNumtoWonAndDecimalPoint(
                                          freightFuelSubsidyClaim.cnt2,
                                        ),
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(
                                        freightFuelSubsidyClaim.cnt3,
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(
                                        freightFuelSubsidyClaim.cnt4,
                                      )}
                                    </td>
                                  </tr>
                                )
                              },
                            )
                          ) : (
                            <>
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Link>
                <Link href="./cal/sr" className="main-info-link">
                  <TabPanel key={2} value={String(2)}>
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>가이드 타이틀 테이블 요약</caption>
                        <colgroup>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">청구월</th>
                            <th scope="col">거래건수</th>
                            <th scope="col">주유량(ℓ)</th>
                            <th scope="col">총거래금액</th>
                            <th scope="col">유가보조금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxiFuelSubsidyClaims &&
                          taxiFuelSubsidyClaims.length > 0 ? (
                            taxiFuelSubsidyClaims.map(
                              (taxiFuelSubsidyClaim, index) => {
                                return (
                                  <tr key={'trrow3' + index}>
                                    <td className="t-center">
                                      {formatDate(taxiFuelSubsidyClaim.clclnYm)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(taxiFuelSubsidyClaim.cnt1)}
                                    </td>
                                    <td className="t-right">
                                      {getCommaNumber(
                                        formatToTwoDecimalPlaces(
                                          taxiFuelSubsidyClaim.cnt2,
                                        ),
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(taxiFuelSubsidyClaim.cnt3)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(taxiFuelSubsidyClaim.cnt4)}
                                    </td>
                                  </tr>
                                )
                              },
                            )
                          ) : (
                            <>
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Link>
                <Link href="./cal/lpd" className="main-info-link">
                  <TabPanel key={3} value={String(3)}>
                    <div className="table-scrollable">
                      <table className="table table-bordered">
                        <caption>가이드 타이틀 테이블 요약</caption>
                        <colgroup>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '17%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                          <col style={{ width: '22%' }}></col>
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">청구월</th>
                            <th scope="col">거래건수</th>
                            <th scope="col">주유량(ℓ)</th>
                            <th scope="col">총거래금액</th>
                            <th scope="col">유가보조금</th>
                          </tr>
                        </thead>
                        <tbody>
                          {busFuelSubsidyClaims &&
                          busFuelSubsidyClaims.length > 0 ? (
                            busFuelSubsidyClaims.map(
                              (busFuelSubsidyClaim, index) => {
                                return (
                                  <tr key={'trrow4' + index}>
                                    <td className="t-center">
                                      {formatDate(busFuelSubsidyClaim.clclnYm)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(busFuelSubsidyClaim.cnt1)}
                                    </td>
                                    <td className="t-right">
                                      {getCommaNumber(
                                        formatToTwoDecimalPlaces(
                                          busFuelSubsidyClaim.cnt2,
                                        ),
                                      )}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(busFuelSubsidyClaim.cnt3)}
                                    </td>
                                    <td className="t-right">
                                      {getNumtoWon(busFuelSubsidyClaim.cnt4)}
                                    </td>
                                  </tr>
                                )
                              },
                            )
                          ) : (
                            <>
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                              <NoneSubsidyClaimData />
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Link>
              </div>
            </MainContents>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="main-container-inner">
          <div className="main-contents-group">
            <div className="main-contents">
              <div className="main-contents-box">
                <h1 className="contents-box-title">
                  <span>월별보조금지급현황</span>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fname-select-01"
                  ></CustomFormLabel>
                  <div className="main-title-option">
                    <select
                      id="ft-fname-select-01"
                      className="custom-default-select"
                      value={select}
                      onChange={handleChangeSelect}
                    >
                      {selectData.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </h1>
                <div className="contents-box-con">
                  <TabContext value={valueTab4}>
                    <div className="tabs-round-type">
                      <TabList
                        className="tab-list"
                        onChange={handleChangeTab4}
                        aria-label="유가보조금 청구현황 탭 그룹"
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
                      <p
                        className="oilps-info-date"
                        style={{ margin: '10px 0 0 0' }}
                      >
                        ({getFormattedDate() + ''})
                      </p>

                      <div className="tab-content">
                        <TabPanel key={1} value={String(1)}>
                          <div className="chart-con marT20">
                            {/* 차트 시작 */}
                            {freightMonthlySubsidies &&
                            freightMonthlySubsidies.length > 0 ? (
                              <XYChart03 monthly={freightMonthlySubsidies} />
                            ) : (
                              <div
                                style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                }}
                              >
                                <h1 style={{ marginTop: '120px' }}>
                                  준비중입니다.
                                </h1>
                              </div>
                            )}
                            {/* 차트 끝 */}
                          </div>
                        </TabPanel>
                        <TabPanel key={2} value={String(2)}>
                          <div className="chart-con marT20">
                            {/* 차트 시작 */}
                            {taxiMonthlySubsidies &&
                            taxiMonthlySubsidies.length > 0 ? (
                              <XYChart03 monthly={taxiMonthlySubsidies} />
                            ) : (
                              <div
                                style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                }}
                              >
                                <h1 style={{ marginTop: '120px' }}>
                                  준비중입니다.
                                </h1>
                              </div>
                            )}

                            {/* 차트 끝 */}
                          </div>
                        </TabPanel>
                        <TabPanel key={3} value={String(3)}>
                          <div className="chart-con marT20">
                            {/* 차트 시작 */}
                            {busMonthlySubsidies &&
                            busMonthlySubsidies.length > 0 ? (
                              <XYChart03 monthly={busMonthlySubsidies} />
                            ) : (
                              <div
                                style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                }}
                              >
                                <h1 style={{ marginTop: '120px' }}>
                                  준비중입니다.
                                </h1>
                              </div>
                            )}
                            {/* 차트 끝 */}
                          </div>
                        </TabPanel>
                      </div>
                    </div>
                  </TabContext>
                </div>
              </div>
            </div>
            <MainContents
              contentTitle={'의심거래 적발현황'}
              tabContextValue={valueTab2}
              tabListHandler={handleChangeTab2}
              tabListLabel={'의심거래 적발현황 탭 그룹'}
              isAuthUser={isAuthUser}
            >
              <div className="tab-content">
                <TabPanel key={1} value={String(1)}>
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>의심거래 적발현황 테이블 요약</caption>
                      <colgroup>
                        <col style={{ width: '70%' }}></col>
                        <col style={{ width: '30%' }}></col>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">구분</th>
                          <th scope="col">건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {freightSuspiciousDetections &&
                        freightSuspiciousDetections.length > 0 ? (
                          freightSuspiciousDetections.map(
                            (freightSuspiciousDetection, index) => {
                              return (
                                <tr key={'trrow' + index}>
                                  <td className="t-left">
                                    <Link
                                      href={
                                        freightSuspiciousDetection.url
                                          ? freightSuspiciousDetection.url?.replace(
                                              '/fsm',
                                              '.',
                                            )
                                          : ''
                                      }
                                      className="main-info-link"
                                    >
                                      {freightSuspiciousDetection.patternNm}
                                    </Link>
                                  </td>
                                  <td className="t-right">
                                    {getCommaNumber(
                                      Number(freightSuspiciousDetection.cnt),
                                    )}
                                  </td>
                                </tr>
                              )
                            },
                          )
                        ) : (
                          <DefaultSuspiciousDetections />
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
                <TabPanel key={2} value={String(2)}>
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>의심거래 적발현황 테이블 요약</caption>
                      <colgroup>
                        <col style={{ width: '70%' }}></col>
                        <col style={{ width: '30%' }}></col>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">구분</th>
                          <th scope="col">건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxiSuspiciousDetections &&
                        taxiSuspiciousDetections.length > 0 ? (
                          taxiSuspiciousDetections.map(
                            (taxiSuspiciousDetections, index) => {
                              return (
                                <tr key={'trrow2' + index}>
                                  <td className="t-left">
                                    {taxiSuspiciousDetections.patternNm}
                                  </td>
                                  <td className="t-right">
                                    {getCommaNumber(
                                      Number(taxiSuspiciousDetections.cnt),
                                    )}
                                  </td>
                                </tr>
                              )
                            },
                          )
                        ) : (
                          <DefaultSuspiciousDetections />
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
                <TabPanel key={3} value={String(3)}>
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>의심거래 적발현황 테이블 요약</caption>
                      <colgroup>
                        <col style={{ width: '70%' }}></col>
                        <col style={{ width: '30%' }}></col>
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">구분</th>
                          <th scope="col">건수</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="t-center" colSpan={2}>
                            해당없음
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
              </div>
            </MainContents>
          </div>
        </div>
      </div>
      <div>
        {detailMoalFlag && selectedNotice && (
          <ModifyDialog
            size="lg"
            title="공지사항"
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={selectedNotice}
            open={detailMoalFlag}
          ></ModifyDialog>
        )}{' '}
      </div>
      <MainIllegalityModal />
      <SurveyModal />
      <NoticeModalContainer />
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
