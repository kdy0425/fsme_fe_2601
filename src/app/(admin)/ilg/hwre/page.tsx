'use client'
import {
  Box,
  Button,
  RadioGroup,
  Typography,
  FormControlLabel,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useContext, useMemo } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { sendHttpFileRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import { getToday } from '@/utils/fsms/common/dateUtils'
import { getDateRange } from '@/utils/fsms/common/util'
import { getUserInfo } from '@/utils/fsms/utils' // 로그인 유저 정보

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// table
import TabDataGrid from '@/app/components/tables/CommDataGrid2'

//Dialog
import AdminProcessDialog from './../aavee/_components/AdminProcessDialog'
import ExamResultDialog from './../aavee/_components/ExamResultDialog'
import LocalTransDialog from './../aavee/_components/LocalTransDialog'

// types
import TxSearchHeaderTab from '@/app/components/tx/txSearchHeaderTab/TxSearchHeaderTab'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'

import { SelectItem } from 'select'
import { Pageable2 } from 'table'
import BlankCard from '@/app/components/shared/BlankCard'

// 시도, 시군구, 개인법인구분 선택
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 백앤드 처리시 로딩
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// headCells
import { ilgHwreDoubtTransTxHC } from '@/utils/fsms/headCells' // 의심거래내역 탭 그리드
import { ilgHwreExamTargetTxHC } from '@/utils/fsms/headCells' // 조사대상내역 탭 그리드
import { ilgAaveeExamResultTxHC } from '@/utils/fsms/headCells' // 조사결과조회 탭 그리드
import { ilgAaveeAdminProcessTxHC } from '@/utils/fsms/headCells' // 행정처분조회 탭 그리드
import { ilgAaveeLocalTransChgTxHC } from '@/utils/fsms/headCells' // 지자체이첩승인 탭 그리드
import { ilgAaveeLocalTransExsTxHC } from '@/utils/fsms/headCells' // 지자체이첩요청 탭 그리드

import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { useInitSearchHook } from '@/utils/fsms/fsm/hooks/useInitSearchHook'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '택시의심거래상시점검',
  },
  {
    to: '/ilg/hwre',
    title: '1시간이내 재충전',
  },
]

// 탭 목록
const tabList = [
  '의심거래내역',
  '조사대상내역',
  '조사결과조회',
  '행정처분조회',
  '지자체이첩승인',
  '지자체이첩요청',
] 

export interface Row {
  chk: string
  chkVal?: string
  dlngYm: string
  ctpvCd: string
  locgovCd: string
  bzmnSeCd: string
  bzmnSeNm: string
  koiCd: string
  sumUseLiter: string | number | null
  avgUseLiter: string | number | null
  aprvAmt: string
  moliatAsstAmt: string
  useNmtm: string
  vhclCnt: string | number | null
  mdfcnDt: string | number | null
  localNm: string | number | null
  vhclNo: string
  brno: string
  useLiter: string
  trauYmd: string
  acmlAprvAmt: string
  acmlVatRmbrAmt: string | number | null
  acmlIcectxRmbrAmt: string | number | null
  bzentyNm: string
  crdcoCd: string
  cardNo: string
  puchasSlipNo: string | number | null
  dlngYmd: string | number | null
  dailUseAcmlNmtm: string | number | null
  dlngSeCd: string
  asbzentyNm: string | number | null
  frcsNm: string
  frcsNo: string | number | null
  frcsBrno: string | number | null
  vatRmbrAmt: string | number | null
  icectxRmbrAmt: string | number | null
  sumNtsRmbrAmt: string | number | null
  sumRmbrAmt: string | number | null
  rtrcnDlngDt: string | number | null
  rgtrId: string | number | null
  regDt: string | number | null
  mdfrId: string
  dlngTm: string
  acmlUseNmtm: string | number | null
  dlngDt: string
  othLocgovCd: string | number | null
  oltNm: string | number | null
  opsAmt: string | number | null
  status: string
  vonrNm: string
  vonrBrno: string
  aprvYm: string

  locgovNm: string // 지자체명
  tpbizCd: string // 업종
  tpbizSeCd: string // 업종구분
  droperYn: string // 직영여부
  exmnRsltCn: string // 조사결과내용
  rdmActnAmt: string // 환수조치금액
  exmnRegYn: string // 조사등록여부
  pbadmsPrcsYn: string // 행정처분등록여부
  rdmTrgtNocs: string // 환수대상건수 

  sttsCd: string
  trnsfRsnCn: string | null
  chgLocgovCd: string | null
  exsLocgovCd: string | null
  chgLocgovNm: string | null
  exsLocgovNm: string | null
  chgLocgovNmP: string | null
  exsLocgovNmP: string | null
  exmnNo: string
  sn: number

  rdmYn: string
  rdmNm: string
  dlngNocs: string
  totlAprvAmt: string
  totlAsstAmt: string
  dspsDt: string
  admdspSeCd: string
  admdspSeNm: string
  admdspRsnCn: string
  admdspBgngYmd: string
  admdspEndYmd: string
  oltPssrpPrtiYn: string
  oltPssrpPrtiNm: string
  oltPssrpPrtiOltNm: string
  oltPssrpPrtiBrno: string
  dsclMthdCd: string
  dsclMthdNm: string
  dsclMthdEtcMttrCn: string
  ruleVltnCluCd: string
  ruleVltnCluNm: string
  ruleVltnCluEtcCn: string
  moliatOtspyYn: string
  moliatOtspyNm: string
  ntsOtspyYn: string
  exceptYn: string
}

// 목록 조회시 필요한 조건
export type searchObj = {
  sort: string
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  bgngDt: string
  endDt: string
  brno : string
  vhclNo : string
  bzmnSeCd : string
  exmnNo : string
  status : string 
  sttsCd : string
  trnsfRsnCn : string
  [key: string]: string | number // 인덱스 시그니처 추가
}

// 조회하여 가져온 정보를 Table에 넘기는 객체
export type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

//엑셀다운로드
export const getExcelFile = async (endpoint: string, name: string) => {
  try {
    const response = await sendHttpFileRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })

    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', name)
    document.body.appendChild(link)
    link.click()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const [tabFlag, setTabFlag] = useState<boolean>(false) // 탭 변경시 자동 조회를 위한 플래그 설정
  const [tabRows, setTabRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [tabTotalRows, setTabTotalRows] = useState(0) // 총 수

  const [regRows, setRegRows] = useState<Row[]>([]) // 조사결과 등록할 로우 데이터

  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([]) // 시도 코드
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]) // 관할관청 코드

  const [selectedTab, setSelectedTab] = useState<string>('0')

  const [selectedRows, setSelectedRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [validMsg, setValidMsg] = useState<string>('') // 유효성검사 메시지

  const [validFlag, setValidFlag] = useState<boolean>(false) // 유효성검사 부분 선택 플래그
  const [radioFlag, setRadioFlag] = useState<boolean>(false) // 라디오버튼 초기화 플래그
  const [checkFlag, setCheckFlag] = useState<boolean>(false) // 체크박스 초기화 플래그
  
  const [brnoFlag, setBrnoFlag] = useState<boolean>(false) // 사업자등록번호 검색 설정 플래그
  const [vhclNoFlag, setVhclNoFlag] = useState<boolean>(false) // 차량번호 검색 설정 플래그
  const [bzmnSeCdFlag, setBzmnSeCdFlag] = useState<boolean>(false) // 개인법인구분 검색 설정 플래그
  const [exmnNoFlag, setExmnNoFlag] = useState<boolean>(false) // 연번 검색 설정 플래그

  const [doubtTransModalFlag, setDoubtTransModalFlag] = useState(false) // 기간별 조사대상 확정 모달
  const [rejectTransModalFlag, setRejectTransModalFlag] = useState(false) // 지자체 이첩 반려 모달
  const [localTransModalFlag, setLocalTransModalFlag] = useState(false) // 지자체이첩 등록 모달
  const [examResultModalFlag, setExamResultModalFlag] = useState(false) // 조사결과 등록 모달
  const [adminProcessModalFlag, setAdminProcessModalFlag] = useState(false) // 행정처분 등록 모달

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState({
    page:            1, // 페이지 번호는 1부터 시작
    size:           10, // 기본 페이지 사이즈 설정
    ctpvCd:         '', // 시도
    locgovCd:       '', // 지자체
    bgngDt:         '', // 시작일
    endDt:          '', // 종료일
    brno:           '', // 사업자등록번호
    vhclNo:         '', // 차량번호
    bzmnSeCd:       '', // 개인법인구분
    exmnNo:         '', // 연번
    status:         '', // 상태코드
    sttsCd:         '', // 상태코드
    trnsfRsnCn:     '', // 반려사유
  })

  const [tapPageable, setTapPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 로그인 아이디 조회
  const userInfo = getUserInfo()
  const userLoginId = userInfo.lgnId
  const userLocgovCd = userInfo.locgovCd

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // 탭 영역 조회
  useEffect(() => {
    setTabRows([])
    setRegRows([])
    setSelectedRows([])

    setTabTotalRows(0)
    setTapPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
    setParams((prev) => ({
      ...prev,
      page: 1,
      size: 10,
    }))

    if (!isInit) {
      fetchTab()
    }
  }, [tabFlag])

  useEffect(() => {
    // 탭 변경시 라디오버튼 위치를 초기화
    if (radioFlag) {
      setRadioFlag(false)
      setParams((prev) => ({ ...prev, status: '', sttsCd: '' }))
    }

    handleSearchParams()  // 검색조건 활성화, 비활성화 처리
    handleValidMsg()  // 유효성검사 메시지 변경
    
    setTabFlag(!tabFlag)
  }, [selectedTab])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('month', 30)

    const startDate = dateRange.startDate
    const endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setTabFlag(!tabFlag)
  }

  // 체크버튼 변경시 설정
  const handleCheckChange = (selected: string[]) => {
    let selectedRows: Row[] = []
    let selectedIndexs = selected.filter((id) => id.replace('tr', '') !== '')
    selectedIndexs.map((id) => selectedRows.push(tabRows[Number(id.replace('tr', ''))]))    
    selectedRows.map((row) => (row.chk = '1'))
    setSelectedRows(selectedRows)
  }

  // 파라미터 변경시 설정
  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 라디오버튼 변경시 재조회
  const handleRadioChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (selectedTab === '0' || selectedTab === '1') {
      setValidFlag(false)
    } else if (selectedTab === '2' || selectedTab === '3') {
        setValidFlag(true)
    } else if (selectedTab === '4' || selectedTab === '5') {
      if (name === 'sttsCd') {
        if (value === 'A' || value === 'C' || value === 'D') {
          setValidFlag(true)
        } else {
          setValidFlag(false)
        }
      }
    }

    setParams((prev) => ({ ...prev, [name]: value }))
    setRadioFlag(true)
    setTabFlag(!tabFlag)
  }

  // 탭별로 조회 조건에 해당하는 항목만 활성화
  const handleSearchParams = async () => {
    switch (selectedTab) {
      case '0': case '2':
        setBrnoFlag(false)
        setVhclNoFlag(false)
        setBzmnSeCdFlag(false)
        setExmnNoFlag(true)
        break
      case '1':
        setBrnoFlag(true)
        setVhclNoFlag(false)
        setBzmnSeCdFlag(true)
        setExmnNoFlag(false)
        break
      case '3':
        setBrnoFlag(false)
        setVhclNoFlag(false)
        setBzmnSeCdFlag(false)
        setExmnNoFlag(false)
        break
      case '4': case '5':
        setBrnoFlag(true)
        setVhclNoFlag(true)
        setBzmnSeCdFlag(true)
        setExmnNoFlag(true)
        break
      default:
        break
    }
  }
  
  const handleValidMsg = async () => {
    if (selectedTab === '2') {
      setValidMsg('조사결과 등록대기 또는 행정처분 등록완료 건은 선택할 수 없습니다.')
    } else if (selectedTab === '3') {
      setValidMsg('행정처분 등록대기 또는 보조금 지급정지 건은 선택할 수 없습니다.')
    } else if (selectedTab === '4' || selectedTab === '5') {
      setValidMsg('요청중인 상태만 처리가 가능합니다.')
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  // 기간별 조사대상 확정 모달창 검색 조건 핸들러 (비활성화처리, 고정값)
  const handleModalSearch = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {}

  // 검색 조건 변경시 핸들러
  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    // 시작일이 종료일 이후인 경우
    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField =
        name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (!isValidDateRange(name, value, otherDate)) {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
        return
      }
    }

    // 시도명이 전체일 때 관할관청도 전체로 초기화
    if (name === 'ctpvCd' && params.locgovCd !== '') {
      setParams((prev) => ({ ...prev, locgovCd: '' }))
    }
    
    // 관할관청 선택시 시도명 자동 설정
    if (name === 'locgovCd' && value !== '' && params.ctpvCd === '') {
      setParams((prev) => ({ ...prev, ctpvCd: value.substring(0,2), locgovCd: value }))
    }
    
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  // 페이지 이동 감지 시작 //

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setTabFlag(!tabFlag)
  }

  // 탭 조회시 호출부와 파라미터 설정
  function getEndpoint(): string {
    // 의심거래내역 조회
    const doubtTrans: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getAllDoubtAreaAprvList?page=${params.page}&size=${params.size}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 조사대상내역 조회
    const examTarget: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getAllDoubtExamTargetList?page=${params.page}&size=${params.size}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.exmnNo ? '&exmnNo=' + params.exmnNo : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 조사결과조회 조회
    const examResult: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getAllDoubtExamResultList?page=${params.page}&size=${params.size}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
      `${params.status ? '&status=' + params.status : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 행정처분조회 조회
    const AdminProcess: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getAllDoubtAdminProcessList?page=${params.page}&size=${params.size}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
      `${params.exmnNo ? '&exmnNo=' + params.exmnNo : ''}` +
      `${params.status ? '&status=' + params.status : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 지자체이첩승인 조회
    const localTransChg: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getAllDoubtLocalTransChgList?page=${params.page}&size=${params.size}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

    // 지자체이첩요청 조회
    const localTransExs: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getAllDoubtLocalTransExsList?page=${params.page}&size=${params.size}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

    switch (selectedTab) {
      case '0':
        return doubtTrans
      case '1':
        return examTarget
      case '2':
        return examResult
      case '3':
        return AdminProcess
      case '4':
        return localTransChg
      case '5':
        return localTransExs
      default:
        return ''
    }
  }

  // 탭 영역 데이터 조회
  const fetchTab = async () => {
    setLoading(true)
    try {
      const endpoint = getEndpoint() // 탭 별로 조회 조건을 설정

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        let tempRows = response.data.content

        // 조사결과 등록대기 상태 유효성 검사 설정
        if (selectedTab === '2') {
          tempRows.map((row: any) => {
            if (row.exmnRegYn === 'N') {
              row.chkVal = 'V'
            }
            if (row.pbadmsPrcsYn === 'Y') {
              row.chkVal = 'R'
            }
          })
        }

        // 행정처분 등록대기 상태 유효성 검사 설정
        if (selectedTab === '3') {
          tempRows.map((row: any) => {
            if (row.exmnRegYn === 'Y' && row.pbadmsPrcsYn === 'N') {
              row.chkVal = 'V'
            }
            if (row.admdspSeCd === 'H' || row.admdspSeCd === 'S') {
              row.chkVal = 'R'
            }
          })
        }

        // 지자체이첩 요청중 상태 유효성 검사 설정
        if (selectedTab === '4' || selectedTab === '5') {
          tempRows.map((row: any) => {
            if (row.sttsCd !== 'R') {
              row.chkVal = 'V'
            }
          })
        }

        // 데이터 조회 성공시
        setTabRows(tempRows)
        setTabTotalRows(response.data.totalElements)
        setTapPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setTabRows([])
        setTabTotalRows(0)
        setTapPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setTabRows([])
      setTabTotalRows(0)
      setTapPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  // 탭 엑셀 출력시 호출부와 파라미터 설정
  function getExcelEndpoint(): string {
    // 의심거래내역 엑셀
    const doubtTrans: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getExcelAllDoubtAreaAprvList?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 조사대상내역 엑셀
    const examTarget: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getExcelAllDoubtExamTargetList?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.exmnNo ? '&exmnNo=' + params.exmnNo : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 조사결과조회 엑셀
    const examResult: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getExcelAllDoubtExamResultList?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
      `${params.status ? '&status=' + params.status : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 행정처분조회 엑셀
    const AdminProcess: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getExcelAllDoubtAdminProcessList?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
      `${params.exmnNo ? '&exmnNo=' + params.exmnNo : ''}` +
      `${params.status ? '&status=' + params.status : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    // 지자체이첩승인 엑셀
    const localTransChg: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getExcelAllDoubtLocalTransChgList?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

    // 지자체이첩요청 엑셀
    const localTransExs: string =
      `/fsm${BCrumb[BCrumb.length - 1].to}/tx/getExcelAllDoubtLocalTransExsList?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

    switch (selectedTab) {
      case '0':
        return doubtTrans
      case '1':
        return examTarget
      case '2':
        return examResult
      case '3':
        return AdminProcess
      case '4':
        return localTransChg
      case '5':
        return localTransExs
      default:
        return ''
    }
  }

  // 탭 영역 엑셀 다운로드
  const tabExcelDownload = async () => {
    const endpoint: string = getExcelEndpoint()
    const tabIndex = Number(selectedTab)
    const tabLabel = tabList[tabIndex]

    await  getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title +
        '_' +
        tabLabel +
        '_' +
        getToday() +
        '.xlsx',
    )
  }

  // 기간별 조사대상 확정 모달 열기
  const openDoubtTransModal = async () => {
    setDoubtTransModalFlag(true)
  }

  // 기간별 조사대상 확정 모달 닫기
  const closeDoubtTransModal = async () => {
    setDoubtTransModalFlag((prev) => false)
  }

  // 기간별 조사대상 확정 모달 저장
  const saveDoubtTransModal = async () => {
    if (params.locgovCd === '') {
      alert('관할관청을 선택하세요.')
      return
    }

    createDoubtDwTarget() // 기간별 조사대상 확정 처리
  }

  // 지자체 이첩 반려 모달 열기
  const openRejectTransModal = async () => {
    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }

    setRejectTransModalFlag(true)
  }

  // 지자체 이첩 반려 모달 닫기
  const closeRejectTransModal = async () => {
    setRejectTransModalFlag((prev) => false)
  }

  // 지자체 이첩 반려 모달 저장
  const saveRejectTransModal = async () => {
    updateLocalTransStatus('D', '반려')
  }

  // 지자체이첩 등록 모달 열기
  const openLocalTransModal = async () => {
    if (tabRows.length < 1) {
      alert('처리할 내역이 없습니다.')
      return
    }

    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }

    setLocalTransModalFlag(true)
  }

  // 지자체이첩 등록 모달 닫기
  const closeLocalTransModal = async (saveFlag: boolean) => {
    setLocalTransModalFlag((prev) => false)
    if (saveFlag) {
      setTabFlag(!tabFlag)
    }
  }

  // 조사결과 등록 합산 처리
  function sumAmtPerExmnNo() {
    // 체크된 행들 중 중첩 제거 및 금액 합산 처리 후 등록
    let sumRows: Row[] = []
    let preExmnNo: string = ''
    let index = -1

    // 안 해도 되지만 추후 정렬 기준이 바뀔 때를 대비하여 처리
    const sortChkRows = selectedRows.sort((a, b) => a.exmnNo.localeCompare(b.exmnNo))

    sortChkRows.map((row, idx) => {
      if (preExmnNo !== row.exmnNo) {
        row.dlngNocs = '1'
        row.rdmTrgtNocs = '1'
        row.rdmYn = 'N'
        sumRows.push(row)
        index = index + 1
        preExmnNo = row.exmnNo
      } 
    })
    
    let sumFlag = false

    sumRows.map((sumRow, sumIdx) => {
      tabRows.forEach((tabRow, tabIdx) => {
        if (sumRow.exmnNo === tabRow.exmnNo) {
          if (!sumFlag) {
            sumFlag = true
          } else {
            if (tabRow.chk === '1') {
              sumRows[sumIdx].rdmTrgtNocs = String(
                Number(sumRows[sumIdx].rdmTrgtNocs) + 1
              )
            }
            sumRows[sumIdx].dlngNocs = String(
              Number(sumRows[sumIdx].dlngNocs) + 1
            )
            sumRows[sumIdx].aprvAmt = String(
              Number(sumRow.aprvAmt === '' ? '0' : sumRow.aprvAmt) +
                Number(tabRow.aprvAmt === '' ? '0' : tabRow.aprvAmt)
            )
            sumRows[sumIdx].moliatAsstAmt = String(
              Number(sumRow.moliatAsstAmt === '' ? '0' : sumRow.moliatAsstAmt) +
                Number(tabRow.moliatAsstAmt === '' ? '0' : tabRow.moliatAsstAmt)
            )
          }
        }
      }),
      sumFlag = false
    })

    sumRows.map(
      (row) => (
        (row.chk = '0'),
        (row.totlAprvAmt = row.aprvAmt),
        (row.totlAsstAmt = row.moliatAsstAmt),
        (row.rdmActnAmt = row.rdmActnAmt ?? '0')
      ),
    )

    setRegRows(sumRows)
  }

  // 조사결과 등록 모달 열기
  const openExamResultModal = async () => {
    if (tabRows.length < 1) {
      alert('처리할 내역이 없습니다.')
      return
    }

    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }

    sumAmtPerExmnNo() // 조사결과 등록 합산 처리

    setExamResultModalFlag(true)
  }
  // 조사결과 등록 모달 닫기
  const closeExamResultModal = async (saveFlag: boolean) => {
    setExamResultModalFlag((prev) => false)
    if (saveFlag) {
      setTabFlag(!tabFlag)
    }
  }

  // 행정처분 등록 모달 열기
  const openAdminProcessModal = async () => {
    if (tabRows.length < 1) {
      alert('처리할 내역이 없습니다.')
      return
    }

    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }

    selectedRows.map((row) => {
      row.chk = '0'
      row.rdmYn = 'N'
    })

    setAdminProcessModalFlag(true)
  }

  // 행정처분 등록 모달 닫기
  const closeAdminProcessModal = async (saveFlag: boolean) => {
    setAdminProcessModalFlag((prev) => false)
    if (saveFlag) {
      setTabFlag(!tabFlag)
    }
  }

  // 모달 새고로침
  const handleModalReload = async () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
  }

  // 기간별 조사대상 확정 조건 확인
  const checkSearchData = async () => {

    if (params.locgovCd === '') {
      alert('관할관청과 기간을 선택하고 조회를 먼저 진행하세요.')
      return
    }

    if (tabRows.length < 1) {
      alert('조회를 진행하지 않았거나 처리할 내역이 없습니다.')
      return
    }

    openDoubtTransModal() // 기간별 조사대상 확정 팝업 띄우기
  }

  // 기간별 조사대상 확정 처리
  const createDoubtDwTarget = async () => {
    const cancelConfirm: boolean = confirm('조사대상 확정 처리하시겠습니까?')
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)

      const body = {
        locgovCd: params.locgovCd,
        rgtrId: userLoginId,
        mdfrId: userLoginId,
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
      }

      const endpoint: string = `/fsm${BCrumb[BCrumb.length - 1].to}/tx/createDoubtDwTarget`
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('조사대상 확정 처리가 완료되었습니다.')
        closeDoubtTransModal()
        setTabFlag(!tabFlag)
      } else {
        alert('선택한 기간의 의심거래내역이 없습니다.')
      }
    } catch (error) {
      alert('조사대상 확정 처리에 실패하였습니다.')
      console.error('ERROR POST DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 건별 조사대상 확정 처리
  const createEachDoubtDwTarget = async () => {

    if (tabRows.length < 1) {
      alert('조회를 진행하지 않았거나 처리할 내역이 없습니다.')
      return
    }

    if (selectedRows.length < 1) {
      alert('조사대상 확정할 건을 선택하세요.')
      return
    }

    const cancelConfirm: boolean = confirm('조사대상 확정 처리하시겠습니까?')
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)

      let param: any[] = []
      selectedRows.map((row) => {
        param.push({
          locgovCd: row.locgovCd,
          vhclNo: row.vhclNo,
          trauYmd: row.trauYmd, // 05 ~ 10 화면
          rgtrId: userLoginId,
          mdfrId: userLoginId,
          bgngDt: params.bgngDt.replaceAll('-', ''),
          endDt: params.endDt.replaceAll('-', ''),
        })
      })

      const body = { areaAvgVolExElctcReqstDto: param }
      const endpoint: string = `/fsm${BCrumb[BCrumb.length - 1].to}/tx/createEachDoubtDwTarget`
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('조사대상 확정 처리가 완료되었습니다.')
        setTabFlag(!tabFlag)
      } else {
        alert('확정 처리할 의심거래내역이 없습니다.')
      }
    } catch (error) {
      alert('조사대상 확정 처리에 실패하였습니다.')
      console.error('ERROR POST DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 의심거래내역 이동 (조사대상 확정 취소 처리)
  const deleteDoubtDWTarget = async () => {
    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }

    const cancelConfirm: boolean = confirm(
      '의심거래내역 이동 처리하시겠습니까?',
    )
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)

      let param: any[] = []
      selectedRows.map((row) => {
        param.push({
          exmnNo: row.exmnNo,
          vhclNo: row.vhclNo,
        })
      })

      const body = { areaAvgVolExElctcReqstDto: param }
      const endpoint: string = `/fsm${BCrumb[BCrumb.length - 1].to}/tx/deleteDoubtDWTarget`
      const response = await sendHttpRequest('DELETE', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('의심거래내역 이동 처리가 완료되었습니다.')
        setTabFlag(!tabFlag)
      } else {
        alert('의심거래내역 이동 처리 내역이 없습니다.')
      }
    } catch (error) {
      alert('의심거래내역이동 처리에 실패하였습니다.')
      console.error('ERROR DELETE DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 조사결과 취소처리 & 행정처분 등록취소 처리
  const updateAdminProcessYN = async (chkReg: string, sttsMsg: string) => {
    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }
    
    const cancelConfirm: boolean = confirm(sttsMsg + '취소 처리하시겠습니까?')
    if (!cancelConfirm) return

    try {
      setLoadingBackdrop(true)

      let param: any[] = []
      selectedRows.map((row) => {
        param.push({
          checkRegister: chkReg,
          exmnNo: row.exmnNo,
        })
      })

      const body = { areaAvgVolExElctcReqstDto: param }
      const endpoint: string = `/fsm${BCrumb[BCrumb.length - 1].to}/tx/updateDoubtAdminProcessYN`
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert(sttsMsg + '취소 처리가 완료되었습니다.')
        setTabFlag(!tabFlag)
      } else {
        alert(sttsMsg + '취소 처리 내역이 없습니다.')
      }
    } catch (error) {
      alert(sttsMsg + '취소 처리에 실패하였습니다.')
      console.error('ERROR PUT DATA : ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 지자체이첩 승인, 반려, 취소 처리
  const updateLocalTransStatus = async (sttsCd: string, sttsMsg: string) => {
    if (selectedRows.length < 1) {
      alert('처리할 목록을 선택하세요.')
      return
    }

    const cancelConfirm: boolean = confirm(
      '차량 지자체 이첩을 ' + sttsMsg + '하시겠습니까?',
    )
    if (!cancelConfirm) {
      return
    }

    try {
      setLoadingBackdrop(true)

      let param: any[] = []
      selectedRows.map((row) => {
        param.push({
          sttsCd: sttsCd,
          mdfrId: userLoginId,
          exmnNo: row.exmnNo,
          sn: row.sn,
          locgovCd: row.chgLocgovCd,
          trnsfRsnCn: params.trnsfRsnCn,
        })
      })

      const body = { areaAvgVolExElctcReqstDto: param }
      const endpoint: string = `/fsm${BCrumb[BCrumb.length - 1].to}/tx/updateDoubtLocalTransStatus`
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.data > 0) {
        alert('차량 지자체 이첩 ' + sttsMsg + ' 처리가 완료되었습니다.')
        setTabFlag(!tabFlag)
      } else {
        alert('차량 지자체 이첩 ' + sttsMsg + ' 처리 내역이 없습니다.')
        alert(response.message)
      }
    } catch (error) {
      alert('차량 지자체 이첩 ' + sttsMsg + '처리에 실패하였습니다.')
      console.error('ERROR PUT DATA : ', error)
    } finally {
      if (sttsCd === 'D') {
        params.trnsfRsnCn = ''
        closeRejectTransModal()
      }

      setLoadingBackdrop(false)
    }
  }

  const { isInit } = useInitSearchHook(params, ['bgngDt', 'endDt', 'ctpvCd', 'locgovCd'], fetchTab, ['locgovCd']) // 초기화시 자동 조회를 막기 위한 커스텀 훅

  return (
    <PageContainer
      title="지역평균거래량 2배초과충전"
      description="지역평균거래량 2배초과충전"
    >
      {/* breadcrumb */}
      <Breadcrumb title="지역평균거래량 2배초과충전" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pName={'ctpvCd'}
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                width={'60%'}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                pName={'locgovCd'}
                pValue={params.locgovCd}
                ctpvCd={params.ctpvCd}
                handleChange={handleSearchChange}
                width={'60%'}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
          <div className="form-group" style={{ padding: '0px 0px 0px 0px' }}>
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                disabled={brnoFlag}
                width={'60%'}
              />
            </div>
            <div className="form-group" style={{ padding: '0px 0px 0px 25px' }}>
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                disabled={vhclNoFlag}
                width={'60%'}
              />
            </div>
            <div className="form-group" style={{ padding: '0px 0px 0px 25px' }}>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-bzmnSe"
              >
                개인법인구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'706'}
                pValue={params.bzmnSeCd}
                pName={'bzmnSeCd'}
                handleChange={handleSearchChange}
                width={'60%'}
                pDisabled={bzmnSeCdFlag}
                htmlFor={'sch-bzmnSe'}
                addText="전체"
              />
            </div>
            <div className="form-group" style={{ padding: '0px 0px 0px 25px' }}>
              <CustomFormLabel className="input-label-display" htmlFor="ft-exmnNo">
                연번
              </CustomFormLabel>
              <CustomTextField
                id="ft-exmnNo"
                name="exmnNo"
                value={params.exmnNo}
                onChange={handleSearchChange}
                disabled={exmnNoFlag}
                width={'60%'}
              />
            </div>
          </div>
        </Box>
        <Box
          className="table-bottom-button-group"
          style={{ padding: '0px 0px 0px 0px' }}
        >
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 종료 */}

      {/* 테이블영역 시작 */}
      <TxSearchHeaderTab
        tabIndex={selectedTab}
        setTabIndex={setSelectedTab}
        tabList={tabList}
      />
      <div style={{ marginTop: '-8px' }}>
        <BlankCard>
          <Box display={selectedTab === '0' ? 'block' : 'none'} sx={{ mb: 2 }}>
            <Box
              className="table-bottom-button-group"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '-6px',
                paddingBottom: '14px',
              }}
            >
              <div className="data-grid-top-toolbar">
                <div className="data-grid-search-count">
                  검색 결과 <span className="search-count">{tabTotalRows}</span>
                  건
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => checkSearchData()}
                >
                  기간별 조사대상 확정
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => createEachDoubtDwTarget()}
                >
                  {' '}
                  건별 조사대상 확정
                </Button>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => tabExcelDownload()}
                >
                  엑셀
                </Button>
              </div>
            </Box>
            <TabDataGrid
              headCells={ilgHwreDoubtTransTxHC} // 테이블 헤더 값
              rows={tabRows} // 목록 데이터
              totalRows={tabTotalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              onCheckChange={handleCheckChange}
            />
          </Box>
          <Box display={selectedTab === '1' ? 'block' : 'none'} sx={{ mb: 2 }}>
            <Box
              className="table-bottom-button-group"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '-6px',
                paddingBottom: '14px',
              }}
            >
              <div className="data-grid-top-toolbar">
                <div className="data-grid-search-count">
                  검색 결과 <span className="search-count">{tabTotalRows}</span>
                  건
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => openExamResultModal()}
                >
                  조사결과 등록
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => openLocalTransModal()}
                >
                  지자체이첩 등록
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => deleteDoubtDWTarget()}
                >
                  의심거래내역 이동
                </Button>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => tabExcelDownload()}
                >
                  엑셀
                </Button>
              </div>
            </Box>
            <TabDataGrid
              headCells={ilgHwreExamTargetTxHC} // 테이블 헤더 값
              rows={tabRows} // 목록 데이터
              totalRows={tabTotalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              onCheckChange={handleCheckChange}
            />
          </Box>
          <Box display={selectedTab === '2' ? 'block' : 'none'} sx={{ mb: 2 }}>
            <Box
              className="table-bottom-button-group"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '-6px',
                paddingBottom: '14px',
              }}
            >
              <div className="data-grid-top-toolbar">
                <div className="data-grid-search-count">
                  검색 결과 <span className="search-count">{tabTotalRows}</span>
                  건
                </div>
              </div>
              <div className="form-group" style={{ marginLeft: '30px' }}>
                <CustomFormLabel
                  htmlFor="ft-fname-radio-01"
                  className="input-label-none"
                >
                  등록구분
                </CustomFormLabel>
                <RadioGroup
                  row
                  id="status"
                  name="status"
                  className="mui-custom-radio-group"
                  onChange={handleRadioChange}
                  value={params.status || ''}
                >
                  <FormControlLabel
                    control={<CustomRadio id="rdo2_1" name="status" value="" />}
                    label="전체"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo2_2" name="status" value="N" />
                    }
                    label="등록대기"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo2_3" name="status" value="Y" />
                    }
                    label="등록완료"
                  />
                </RadioGroup>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => openAdminProcessModal()}
                >
                  행정처분 등록
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => updateAdminProcessYN('INV', '조사결과 등록')}
                >
                  조사결과 등록취소
                </Button>
              </div>
              <div style={{ marginLeft: 'auto'}}>
                <Typography 
                  variant="body1"
                  fontSize={16} 
                  fontWeight={600}
                  style={{ paddingLeft: '0px', paddingTop: '10px' }}
                  >
                    <span className="required-text">※ 빨간색 표시는 행정처리 등록완료된 건입니다.</span>
                </Typography>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => tabExcelDownload()}
                >
                  엑셀
                </Button>
              </div>
            </Box>
            <TabDataGrid
              headCells={ilgAaveeExamResultTxHC} // 테이블 헤더 값
              rows={tabRows} // 목록 데이터
              totalRows={tabTotalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              paging={true} // 페이지 처리 여부
              onCheckChange={handleCheckChange} // 체크박스 변경 핸들러
              validMsg={validMsg} // 유효성검사 메시지
              validFlag={validFlag} // 유효성검사 플래그
            />
          </Box>
          <Box display={selectedTab === '3' ? 'block' : 'none'} sx={{ mb: 2 }}>
            <Box
              className="table-bottom-button-group"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '-6px',
                paddingBottom: '14px',
              }}
            >
              <div className="data-grid-top-toolbar">
                <div className="data-grid-search-count">
                  검색 결과 <span className="search-count">{tabTotalRows}</span>
                  건
                </div>
              </div>
              <div className="form-group" style={{ marginLeft: '30px' }}>
                <CustomFormLabel
                  htmlFor="ft-fname-radio-02"
                  className="input-label-none"
                >
                  등록구분
                </CustomFormLabel>
                <RadioGroup
                  row
                  id="status"
                  name="status"
                  className="mui-custom-radio-group"
                  onChange={handleRadioChange}
                  value={params.status || ''}
                >
                  <FormControlLabel
                    control={<CustomRadio id="rdo2_1" name="status" value="" />}
                    label="전체"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo2_2" name="status" value="N" />
                    }
                    label="등록대기"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo2_3" name="status" value="Y" />
                    }
                    label="등록완료"
                  />
                </RadioGroup>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => updateAdminProcessYN('ADM', '행정처분 등록')}
                >
                  행정처분 등록취소
                </Button>
              </div>
              <div style={{ marginLeft: 'auto'}}>
                <Typography 
                  variant="body1"
                  fontSize={16} 
                  fontWeight={600}
                  style={{ paddingLeft: '0px', paddingTop: '10px' }}
                  >
                    <span className="required-text">※ 빨간색 표시는 보조금 지급정지된 건입니다.</span>
                </Typography>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => tabExcelDownload()}
                >
                  엑셀
                </Button>
              </div>
            </Box>
            <TabDataGrid
              headCells={ilgAaveeAdminProcessTxHC} // 테이블 헤더 값
              rows={tabRows} // 목록 데이터
              totalRows={tabTotalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              paging={true} // 페이지 처리 여부
              onCheckChange={handleCheckChange} // 체크박스 변경 핸들러
              validMsg={validMsg} // 유효성검사 메시지
              validFlag={validFlag} // 유효성검사 플래그
            />
          </Box>
          <Box display={selectedTab === '4' ? 'block' : 'none'} sx={{ mb: 2 }}>
            <Box
              className="table-bottom-button-group"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '-6px',
                paddingBottom: '14px',
              }}
            >
              <div className="data-grid-top-toolbar">
                <div className="data-grid-search-count">
                  검색 결과 <span className="search-count">{tabTotalRows}</span>
                  건
                </div>
              </div>
              <div className="form-group" style={{ marginLeft: '30px' }}>
                <CustomFormLabel
                  htmlFor="ft-fname-radio-03"
                  className="input-label-none"
                >
                  요청상태
                </CustomFormLabel>
                <RadioGroup
                  row
                  id="sttsCd"
                  name="sttsCd"
                  className="mui-custom-radio-group"
                  onChange={handleRadioChange}
                  value={params.sttsCd || ''}
                >
                  <FormControlLabel
                    control={<CustomRadio id="rdo3_1" name="sttsCd" value="" />}
                    label="전체"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo3_2" name="sttsCd" value="A" />
                    }
                    label="승인"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo3_3" name="sttsCd" value="D" />
                    }
                    label="반려"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo3_4" name="sttsCd" value="R" />
                    }
                    label="요청중"
                  />
                </RadioGroup>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => updateLocalTransStatus('A', '승인')}
                >
                  승인
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => openRejectTransModal()}
                >
                  반려
                </Button>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => tabExcelDownload()}
                >
                  엑셀
                </Button>
              </div>
            </Box>
            <TabDataGrid
              headCells={ilgAaveeLocalTransChgTxHC} // 테이블 헤더 값
              rows={tabRows} // 목록 데이터
              totalRows={tabTotalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              paging={true} // 페이지 처리 여부
              onCheckChange={handleCheckChange} // 체크박스 변경 핸들러
              validMsg={validMsg} // 유효성검사 메시지
              validFlag={validFlag} // 유효성검사 플래그
            />
          </Box>
          <Box display={selectedTab === '5' ? 'block' : 'none'} sx={{ mb: 2 }}>
            <Box
              className="table-bottom-button-group"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '-6px',
                paddingBottom: '14px',
              }}
            >
              <div className="data-grid-top-toolbar">
                <div className="data-grid-search-count">
                  검색 결과 <span className="search-count">{tabTotalRows}</span>
                  건
                </div>
              </div>
              <div className="form-group" style={{ marginLeft: '30px' }}>
                <CustomFormLabel
                  htmlFor="ft-fname-radio-04"
                  className="input-label-none"
                >
                  요청상태
                </CustomFormLabel>
                <RadioGroup
                  row
                  id="sttsCd"
                  name="sttsCd"
                  className="mui-custom-radio-group"
                  onChange={handleRadioChange}
                  value={params.sttsCd || ''}
                >
                  <FormControlLabel
                    control={<CustomRadio id="rdo4_1" name="sttsCd" value="" />}
                    label="전체"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo4_2" name="sttsCd" value="A" />
                    }
                    label="승인"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo4_3" name="sttsCd" value="C" />
                    }
                    label="취소"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo4_4" name="sttsCd" value="D" />
                    }
                    label="반려"
                  />
                  <FormControlLabel
                    control={
                      <CustomRadio id="rdo4_5" name="sttsCd" value="R" />
                    }
                    label="요청중"
                  />
                </RadioGroup>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => updateLocalTransStatus('C', '취소')}
                >
                  취소
                </Button>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => tabExcelDownload()}
                >
                  엑셀
                </Button>
              </div>
            </Box>
            <TabDataGrid
              headCells={ilgAaveeLocalTransExsTxHC} // 테이블 헤더 값
              rows={tabRows} // 목록 데이터
              totalRows={tabTotalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              paging={true} // 페이지 처리 여부
              onCheckChange={handleCheckChange} // 체크박스 변경 핸들러
              validMsg={validMsg} // 유효성검사 메시지
              validFlag={validFlag} // 유효성검사 플래그
            />
          </Box>
        </BlankCard>
      </div>
      {/* 테이블영역 끝 */}
      {/* 기간별 조사대상 확정 모달 */}
      <div>
        {doubtTransModalFlag && (
          <Dialog
            fullWidth={false}
            // maxWidth={"lg"}
            open={doubtTransModalFlag}
            onClose={closeDoubtTransModal}
          >
            <DialogContent>
              <Box className="table-bottom-button-group">
                <CustomFormLabel className="input-label-display">
                  <h2>기간별 조사대상 확정</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                  <Button
                    variant="contained"
                    onClick={() => saveDoubtTransModal()}
                    color="primary"
                  >
                    저장
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={closeDoubtTransModal}
                  >
                    취소
                  </Button>
                </div>
              </Box>
              <Box
                id="form-modal"
                component="form"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  m: 'auto',
                  width: 'auto',
                }}
              >
                <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                  <TableContainer style={{ margin: '16px 0 0 0' }}>
                    <Table
                      className="table table-bordered"
                      aria-labelledby="tableTitle"
                      style={{ tableLayout: 'fixed', width: '100%' }}
                    >
                      <TableBody>
                        <TableRow>
                          <TableCell
                            className="td-head"
                            style={{ width: '100px', textAlign: 'left', paddingLeft: '10px' }}
                          >
                            <span className="required-text">*</span> 시도명
                          </TableCell>
                          <TableCell>
                            <CtpvSelect
                              pName={'ctpvCd'}
                              pValue={params.ctpvCd}
                              handleChange={handleModalSearch}
                              width={'100%'}
                              htmlFor={'sch-ctpv'}
                              pDisabled={true}
                            />
                          </TableCell>
                          <TableCell
                            className="td-head"
                            style={{ width: '100px', textAlign: 'left', paddingLeft: '10px' }}
                          >
                            <span className="required-text">*</span> 관할관청
                          </TableCell>
                          <TableCell>
                            <LocgovSelect
                              pName={'locgovCd'}
                              pValue={params.locgovCd}
                              ctpvCd={params.ctpvCd}
                              handleChange={handleModalSearch}
                              width={'100%'}
                              htmlFor={'sch-locgov'}
                              pDisabled={true}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            className="td-head"
                            style={{ width: '100px', textAlign: 'left', paddingLeft: '10px' }}
                          >
                            <span className="required-text">*</span> 대상기간
                          </TableCell>
                          <TableCell
                            colSpan={3}
                            style={{ textAlign: 'center' }}
                          >
                            <CustomTextField
                              type="month"
                              id="ft-date-start"
                              name="bgngDt"
                              value={params.bgngDt}
                              onChange={handleModalSearch}
                              style={{ width: '192px', marginRight: '5px' }}
                              disabled={true}
                            />
                            ~
                            <CustomTextField
                              type="month"
                              id="ft-date-end"
                              name="endDt"
                              value={params.endDt}
                              onChange={handleModalSearch}
                              style={{ width: '192px', marginLeft: '5px' }}
                              disabled={true}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {/* 지자체 이첩 반려 모달 */}
      <div>
        {rejectTransModalFlag && (
          <Dialog
            fullWidth={false}
            maxWidth={'sm'}
            open={rejectTransModalFlag}
            onClose={closeRejectTransModal}
          >
            <DialogContent>
              <Box className="table-bottom-button-group">
                <CustomFormLabel className="input-label-display">
                  <h2>지자체 이첩 반려</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                  <Button
                    variant="contained"
                    onClick={() => saveRejectTransModal()}
                    color="primary"
                  >
                    저장
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={closeRejectTransModal}
                  >
                    취소
                  </Button>
                </div>
              </Box>
              <Box
                id="form-modal"
                component="form"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  m: 'auto',
                  width: 'auto',
                }}
              >
                <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                  <TableContainer style={{ margin: '0px 0px 0px 0px' }}>
                    <Table
                      className="table table-bordered"
                      aria-labelledby="tableTitle"
                      style={{ tableLayout: 'fixed', width: '100%' }}
                    >
                      <TableBody>
                        <TableRow>
                          <TableCell
                            className="td-head"
                            style={{ width: '120px', verticalAlign: 'middle' }}
                          >
                            <span className="required-text">*</span>반려사유
                          </TableCell>
                          <TableCell style={{ textAlign: 'left' }}>
                            <CustomFormLabel className="input-label-none" htmlFor="trnsfRsnCn">반려사유</CustomFormLabel>
                            <textarea className="MuiTextArea-custom"
                              id="trnsfRsnCn"
                              name="trnsfRsnCn"
                              // multiline
                              rows={10}
                              value={params.trnsfRsnCn}
                              // variant="outlined"
                              style={{
                                marginLeft: '0px',
                                width: '100%',
                                height: '100%',
                              }}
                              onChange={handleParamChange}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {/* 지자체이첩 등록 모달 */}
      <div>
        {localTransModalFlag && (
          <LocalTransDialog
            size="md"
            title="지자체이첩 등록"
            reloadFunc={handleModalReload}
            closeLocalTransModal={closeLocalTransModal}
            selectedRows={selectedRows}
            open={localTransModalFlag}
          ></LocalTransDialog>
        )}
      </div>
      {/* 조사결과 등록 모달 */}
      <div>
        {examResultModalFlag && (
          <ExamResultDialog
            size="lg"
            title="조사결과 등록"
            reloadFunc={handleModalReload}
            closeExamResultModal={closeExamResultModal}
            selectedRows={regRows}
            open={examResultModalFlag}
          ></ExamResultDialog>
        )}
      </div>
      {/* 행정처분 등록 모달 */}
      <div>
        {adminProcessModalFlag && (
          <AdminProcessDialog
            size="lg"
            title="행정처분 등록"
            reloadFunc={handleModalReload}
            closeAdminProcessModal={closeAdminProcessModal}
            selectedRows={selectedRows}
            open={adminProcessModalFlag}
          ></AdminProcessDialog>
        )}
      </div>
    </PageContainer>
  )
}

export default React.memo(DataList)
