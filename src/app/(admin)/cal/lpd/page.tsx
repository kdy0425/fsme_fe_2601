'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import { Pageable2 } from 'table'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { brNoFormatter, getDateRange } from '@/utils/fsms/common/util'

// components
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell } from 'table'
import { SelectItem } from 'select'

import { getCtpvCd, getCommCd, getLocGovCd } from '@/utils/fsms/common/comm'
import { getExcelFile } from '../../ilg/aavee/page'
import { getFormatToday, getToday } from '@/utils/fsms/common/dateUtils'

import BsnmSbsidySetlModal from '@/app/components/bs/popup/BsnmSbsidySetlModal'
import ReportFormDialog from './_components/ReportFormDialog'
import { openReport } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '보조금청구',
  },
  {
    title: '버스청구',
  },
  {
    to: '/cal/lpd',
    title: '지자체별지급확정관리',
  },
]

const monthHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'sumSlsNocs',
    numeric: false,
    disablePadding: false,
    label: '거래건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumUserCnt',
    numeric: false,
    disablePadding: false,
    label: '사업자수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumFuelQty',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumSlsAmt',
    numeric: false,
    disablePadding: false,
    label: '거래금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumIndvClmAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
    align: 'td-right',
  },
]

const cardHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'giveCfmtnNm',
    numeric: false,
    disablePadding: false,
    label: '지급확정',
  },
  {
    id: 'giveCfmtnYmd',
    numeric: false,
    disablePadding: false,
    label: '확정일',
    format: 'yyyymmdd',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'slsNocs',
    numeric: false,
    disablePadding: false,
    label: '거래건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'userCnt',
    numeric: false,
    disablePadding: false,
    label: '사업자수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'fuelQty',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'slsAmt',
    numeric: false,
    disablePadding: false,
    label: '거래금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'indvClmAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
    align: 'td-right',
  },
]

const koiHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'slsNocs',
    numeric: false,
    disablePadding: false,
    label: '거래건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'userCnt',
    numeric: false,
    disablePadding: false,
    label: '사업자수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumFuelQty',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumSlsAmt',
    numeric: false,
    disablePadding: false,
    label: '거래금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumIndvClmAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
    align: 'td-right',
  },
]

const licenseHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'vhclSeNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
  {
    id: 'prttnUseLiter',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'prtstleAmt',
    numeric: false,
    disablePadding: false,
    label: '거래금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'prttnBzentyBrdnAmt',
    numeric: false,
    disablePadding: false,
    label: '업체부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'prttnAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
    align: 'td-right',
  },
]

const brHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'vhclSeNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
  {
    id: 'slsNocs',
    numeric: false,
    disablePadding: false,
    label: '거래건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumFuelQty',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumSlsAmt',
    numeric: false,
    disablePadding: false,
    label: '거래금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumIndvClmAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumFtxAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'sumOpisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금',
    format: 'number',
    align: 'td-right',
  },
]

export interface MonthRows {
  clclnYm?: string // 청구년월
  sumSlsNocs?: string // 거래건수
  sumUserCnt?: string // 사업자수
  sumFuelQty?: string // 주유·충전량
  sumSlsAmt?: string // 거래금액
  sumIndvClmAmt?: string // 개인부담금
  sumAsstAmt?: string // 유가보조금
  clclnLocgovCd?: string
}

export interface CardRows {
  clclnYm?: string // 청구년월
  giveCfmtnNm?: string //  지급확정
  giveCfmtnYmd?: string // 확정일
  crdcoCd?: string // 카드사
  slsNocs?: string // 거래건수
  userCnt?: string // 사업자수
  fuelQty?: string // 주유·충전량
  slsAmt?: string // 거래금액
  indvClmAmt?: string // 개인부담금
  asstAmt?: string // 유가보조금
  giveCfmtnYn?: string
  giveActno?: string
  locgovNm?: string
  crdcoNm?: string
  regDt?: string
  clclnLocgovCd?: string
}

export interface KoiRows {
  clclnYm?: string // 청구년월
  koiNm?: string //  유종
  slsNocs?: string // 거래건수
  userCnt?: string // 사업자수
  sumFuelQty?: string // 주유·충전량
  sumSlsAmt?: string // 거래금액
  sumIndvClmAmt?: string // 개인부담금
  sumAsstAmt?: string // 유가보조금
  crdcoCd?: string
  koiCd?: string
}

export interface LicenseRows {
  clclnYm?: string // 청구년월
  vhclSeNm?: string //  면허업종
  prttnUseLiter?: string // 주유·충전량
  prtstleAmt?: string // 거래금액
  prttnBzentyBrdnAmt?: string // 업체부담금
  prttnAsstAmt?: string // 유가보조금
  crdcoCd?: string
  koiCd?: string
}

export interface BrRows {
  clclnYm?: string // 청구년월
  bzentyNm?: string //  업체명
  brno?: string // 사업자번호
  vhclSeNm?: string // 면허업종
  slsNocs?: string // 거래건수
  sumFuelQty?: string // 주유·충전량
  sumSlsAmt?: string // 거래금액
  sumIndvClmAmt?: string // 개인부담금
  sumAsstAmt?: string // 유가보조금
  sumFtxAsstAmt?: string // 유류세연동보조금
  sumOpisAmt?: string // 유가연동보조금
  crdcoCd?: string
  locgovCd?: string
  koiCd?: string
  prttnYn?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [pageFlag, setPageFlag] = useState<boolean>(false) //페이징 데이터 갱신을 위한 플래그 설정

  const [monthRows, setMonthRows] = useState<MonthRows[]>([]) // 가져온 로우 데이터
  const [cardRows, setCardRows] = useState<CardRows[]>([]) // 가져온 로우 데이터
  const [koiRows, setKoiRows] = useState<KoiRows[]>([]) // 가져온 로우 데이터
  const [licenseRows, setLicenseRows] = useState<LicenseRows[]>([]) // 가져온 로우 데이터
  const [brRows, setBrRows] = useState<BrRows[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [monthLoading, setMonthLoading] = useState(false) // 로딩여부
  const [crdcoLoading, setCrdcoLoading] = useState(false) // 로딩여부
  const [koiLoading, setKoiLoading] = useState(false) // 로딩여부
  const [licenseLoading, setLicenseLoading] = useState(false) // 로딩여부
  const [brLoading, setBrLoading] = useState(false) // 로딩여부

  const [selectedMonthRow, setSelectedMonthRow] = useState<MonthRows>() // 선택된 Row를 저장할 state
  const [selectedCardRow, setSelectedCardRow] = useState<CardRows>() // 선택된 Row를 저장할 state
  const [selectedKoiRow, setSelectedKoiRow] = useState<KoiRows>() // 선택된 Row를 저장할 state
  const [selectedBrRow, setSelectedBrRow] = useState<BrRows>() // 선택된 Row를 저장할 state

  const [selectedMonthRowIndex, setSelectedMonthRowIndex] = useState<number>(0) // 선택된 로우 인덱스
  const [selectedCardRowIndex, setSelectedCardRowIndex] = useState<number>(0) // 선택된 로우 인덱스
  const [selectedKoiRowIndex, setSelectedKoiRowIndex] = useState<number>(0) // 선택된 로우 인덱스
  const [selectedBrRowIndex, setSelectedBrRowIndex] = useState<number>(0) // 선택된 로우 인덱스
  const [selectedLicenseRowIndex, setSelectedLicenseRowIndex] =
    useState<number>(0) // 선택된 로우 인덱스

  const [bsnmSbsidySetlOpen, setBsnmSbsidySetlOpen] = useState(false)

  const [reportFormDialogOpen, setReportFormDialogOpen] = useState(false)
  const [reportType, setReportType] = useState<string>('')
  const [reportState, setReportState] = useState<string>('')

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
    clclnYm: '',
    koiCd: '',
    crdcoCd: '',
  })

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('month', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd || params.locgovCd) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (selectedLicenseRowIndex > -1)
      fetchBrData(
        licenseRows[selectedLicenseRowIndex]?.clclnYm,
        licenseRows[selectedLicenseRowIndex]?.koiCd,
        licenseRows[selectedLicenseRowIndex]?.crdcoCd,
      )
  }, [pageFlag])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()

    getCtpvCd().then((itemArr) => {
      setCtpvCdItems(itemArr)
      setParams((prev) => ({ ...prev, ctpvCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
    }) // 시도코드

    setFlag(!flag)
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신(월별)
  const fetchData = async () => {
    setMonthLoading(true)
    setMonthRows([])
    setCardRows([])
    setKoiRows([])
    setLicenseRows([])
    setBrRows([])
    setTotalRows(0)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/lpd/bs/getAllLocgocPymntDcsnMonth?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setMonthRows(response.data)
        setTotalRows(response.data.length)

        const { clclnYm, clclnLocgovCd } = response.data[0]
        setSelectedMonthRowIndex(0)
        fetchCardData(clclnYm, clclnLocgovCd)
      } else {
        // 데이터가 없거나 실패
        setMonthRows([])
        setCardRows([])
        setKoiRows([])
        setLicenseRows([])
        setBrRows([])
        setTotalRows(0)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setMonthLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신(카드사별)
  const fetchCardData = async (clclnYm: any, clclnLocgovCd: any) => {
    setCrdcoLoading(true)
    setCardRows([])
    setKoiRows([])
    setLicenseRows([])
    setBrRows([])
    setTotalRows(0)
    try {
      let endpoint: string =
        `/fsm/cal/lpd/bs/getAllLocgocPymntDcsnCard?` +
        `${clclnYm ? '&clclnYm=' + clclnYm : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setCardRows(response.data)
        setTotalRows(response.data.length)
        setSelectedCardRow(response.data[0])
        setSelectedCardRowIndex(0)
        const { clclnYm, crdcoCd } = response.data[0]
        fetchKoiData(clclnYm, crdcoCd)
      } else {
        // 데이터가 없거나 실패
        setCardRows([])
        setKoiRows([])
        setLicenseRows([])
        setBrRows([])
        setTotalRows(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setCrdcoLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신(유종별)
  const fetchKoiData = async (clclnYm: any, crdcoCd: any) => {
    setKoiLoading(true)
    setKoiRows([])
    setLicenseRows([])
    setBrRows([])
    setTotalRows(0)
    try {
      let endpoint: string =
        `/fsm/cal/lpd/bs/getAllLocgocPymntDcsnKoi?` +
        `${clclnYm ? '&clclnYm=' + clclnYm : ''}` +
        `${crdcoCd ? '&crdcoCd=' + crdcoCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setKoiRows(response.data)
        setTotalRows(response.data.length)
        setSelectedKoiRowIndex(0)
        const { clclnYm, koiCd, crdcoCd } = response.data[0]
        fetchLicenseData(clclnYm, koiCd, crdcoCd)
      } else {
        // 데이터가 없거나 실패
        setKoiRows([])
        setLicenseRows([])
        setBrRows([])
        setTotalRows(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setKoiLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신(면허업종별)
  const fetchLicenseData = async (clclnYm: any, koiCd: any, crdcoCd: any) => {
    setLicenseLoading(true)
    setLicenseRows([])
    setBrRows([])
    setTotalRows(0)
    try {
      let endpoint: string =
        `/fsm/cal/lpd/bs/getAllLocgocPymntDcsnKoiSe?` +
        `${clclnYm ? '&clclnYm=' + clclnYm : ''}` +
        `${koiCd ? '&koiCd=' + koiCd : ''}` +
        `${crdcoCd ? '&crdcoCd=' + crdcoCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setLicenseRows(response.data)
        setTotalRows(response.data.length)
        setSelectedLicenseRowIndex(0)
        const { clclnYm, koiCd, crdcoCd } = response.data[0]
        fetchBrData(clclnYm, koiCd, crdcoCd)
      } else {
        // 데이터가 없거나 실패
        setLicenseRows([])
        setBrRows([])
        setTotalRows(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLicenseLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신(업체별)
  const fetchBrData = async (clclnYm: any, koiCd: any, crdcoCd: any) => {
    setBrLoading(true)
    setBrRows([])
    setTotalRows(0)
    // 엑셀 다운로드용 params 업데이트
    setParams((prev) => ({
      ...prev,
      clclnYm: clclnYm,
      koiCd: koiCd,
      crdcoCd: crdcoCd,
    }))
    try {
      let endpoint: string =
        `/fsm/cal/lpd/bs/getAllLocgocPymntDcsnBrno?page=${params.page}&size=${params.size}` +
        `${clclnYm ? '&clclnYm=' + clclnYm : ''}` +
        `${koiCd ? '&koiCd=' + koiCd : ''}` +
        `${crdcoCd ? '&crdcoCd=' + crdcoCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSelectedBrRow(response.data.content[0])
        setBrRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setSelectedBrRowIndex(0)
      } else {
        // 데이터가 없거나 실패
        setBrRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setBrRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setBrLoading(false)
    }
  }

  const excelDownload = async () => {
    let endpoint: string =
      `/fsm/cal/lpd/bs/getExcelLocgocPymntDcsnBrno?` +
      `${params.clclnYm ? '&clclnYm=' + params.clclnYm : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  const giveCfmtn = async () => {
    if (!selectedCardRow?.crdcoCd) {
      alert('확정처리할 카드사를 선택해주세요.')
      return
    }

    if (selectedCardRow.giveCfmtnYn == 'Y') {
      alert('이미 확정 처리된 건입니다.')
      return
    }

    try {
      const userConfirm = confirm('확정 처리 하시겠습니까?')

      if (userConfirm) {
        let endpoint: string =
          `/fsm/cal/lpd/bs/decisionLocgocPymntDcsn?` +
          `${selectedCardRow.clclnLocgovCd ? '&locgovCd=' + selectedCardRow.clclnLocgovCd : ''}` +
          `${selectedCardRow.clclnYm ? '&clclnYm=' + selectedCardRow.clclnYm : ''}` +
          `${selectedCardRow.crdcoCd ? '&crdcoCd=' + selectedCardRow.crdcoCd : ''}`

        const response = await sendHttpRequest('PUT', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          alert('확정처리 되었습니다.')
          fetchData()
        } else {
          // 데이터가 없거나 실패
          alert('확정처리 실패입니다.')
        }
      } else {
        return
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setPageFlag(!pageFlag)
  }

  // 행 클릭 시 호출되는 함수
  const handleMonthRowClick = (selectedRow: MonthRows, index?: number) => {
    fetchCardData(selectedRow.clclnYm, selectedRow.clclnLocgovCd)
    setSelectedMonthRowIndex(index ?? -1)
    setMonthLoading(false)
  }
  const handleCardRowClick = (selectedRow: CardRows, index?: number) => {
    setSelectedCardRow(selectedRow)
    fetchKoiData(selectedRow.clclnYm, selectedRow.crdcoCd)
    setSelectedCardRowIndex(index ?? -1)
    setCrdcoLoading(false)
  }
  const handleKoiRowClick = (selectedRow: KoiRows, index?: number) => {
    fetchLicenseData(
      selectedRow.clclnYm,
      selectedRow.koiCd,
      selectedRow.crdcoCd,
    )
    setSelectedKoiRowIndex(index ?? -1)
    setKoiLoading(false)
  }

  const handleBrRowClick = (selectedRow: BrRows, index?: number) => {
    setSelectedBrRow(selectedRow)
    setSelectedBrRowIndex(index ?? -1)
  }

  const BsnmSbsidySetlClick = () => {
    if (!selectedBrRow?.brno) {
      alert('선택된 업체가 없습니다.')
      return
    }
    setBsnmSbsidySetlOpen(true)
  }

  const printReportClick = (state: string) => {
    if (!selectedCardRow || selectedCardRow?.giveCfmtnYn == 'N') {
      alert('지급확정 후 출력할 수 있습니다.')
      return
    }
    setReportState(state)
    setReportFormDialogOpen(true)
  }

  const handleDialogClose = async (selectedValue: string) => {
    setReportFormDialogOpen(false)
    setReportType(selectedValue)

    if (reportState == 'K' && selectedValue == 'O') {
      //청구서 출력 선택 카드사
      try {
        let endpoint: string =
          `/fsm/cal/lpd/bs/printLocgocPymntDcsnKoi?` +
          `${selectedCardRow?.clclnYm ? '&clclnYm=' + selectedCardRow?.clclnYm : ''}` +
          `${selectedCardRow?.slsNocs ? '&cnt=' + selectedCardRow?.slsNocs : ''}` +
          `${selectedCardRow?.userCnt ? '&mberCnt=' + selectedCardRow?.userCnt : ''}` +
          `${selectedCardRow?.fuelQty ? '&useLit=' + selectedCardRow?.fuelQty : ''}` +
          `${selectedCardRow?.slsAmt ? '&selAmt=' + selectedCardRow?.slsAmt : ''}` +
          `${selectedCardRow?.indvClmAmt ? '&pBillAmt=' + selectedCardRow?.indvClmAmt : ''}` +
          `${selectedCardRow?.asstAmt ? '&asstAmt=' + selectedCardRow?.asstAmt : ''}` +
          `${selectedCardRow?.crdcoCd ? '&crdcoCd=' + selectedCardRow?.crdcoCd : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          const jsonString = JSON.stringify(response.data) // JSON 객체를 문자열로 변환

          let crdcoBankNm
          let crdcoNm
          let crdcoNmF
          let crdcoBrNo
          let firstDay
          let lastDayFormatted

          if (selectedCardRow && selectedCardRow.clclnYm) {
            const clclnYm = selectedCardRow.clclnYm.toString()
            const year = parseInt(clclnYm.substring(0, 4), 10)
            const month = parseInt(clclnYm.substring(4, 6), 10)

            // 1일 구하기
            firstDay = `${year}년${month}월01일`

            // 말일 구하기
            const lastDay = new Date(year, month, 0).getDate()
            lastDayFormatted = `${year}년${month}월${lastDay}일`
          }

          if (selectedCardRow?.crdcoCd == 'SH') {
            crdcoBankNm = '신한은행'
            crdcoNm = '신한카드(주)'
            crdcoNmF = '신한카드 주식회사'
            crdcoBrNo = '202-81-48079'
          } else if (selectedCardRow?.crdcoCd == 'KB') {
            crdcoBankNm = '국민은행'
            crdcoNm = '(주)KB국민카드'
            crdcoNmF = '국민카드 주식회사'
            crdcoBrNo = '101-86-61717'
          } else if (selectedCardRow?.crdcoCd == 'WR') {
            crdcoBankNm = '우리은행'
            crdcoNm = '(주)우리카드'
            crdcoNmF = '우리카드 주식회사'
            crdcoBrNo = '101-86-79070'
          }

          // JSON 문자열을 배열로 파싱
          let jsonArray = JSON.parse(jsonString)

          // jsonArray가 배열인지 확인
          if (Array.isArray(jsonArray) && jsonArray.length > 0) {
            // 배열의 첫 번째 요소에 locgovNm 값을 추가
            jsonArray[0].crdcoCd = selectedCardRow?.crdcoCd || null
            jsonArray[0].giveActno = selectedCardRow?.giveActno || null
            jsonArray[0].locgovNm = selectedCardRow?.locgovNm || null
            jsonArray[0].clclnYm = selectedCardRow?.clclnYm || null
            jsonArray[0].regDt = selectedCardRow?.regDt || null

            jsonArray[0].crdcoBankNm = crdcoBankNm || null
            jsonArray[0].crdcoNm = crdcoNm || null
            jsonArray[0].crdcoNmF = crdcoNmF || null
            jsonArray[0].crdcoBrNo = crdcoBrNo || null

            jsonArray[0].firstDay = firstDay || null
            jsonArray[0].lastDayFormatted = lastDayFormatted || null
          }

          const wrappedJson = { content: jsonArray }
          var crfName = 'getBsBill'
          var crfData = JSON.stringify(wrappedJson)
          console.log(JSON.stringify(wrappedJson))
          openReport(crfName, crfData)
        } else {
          // 데이터가 없거나 실패
          alert('2')
        }
      } catch (error) {
        alert(error)
      }
    } else if (reportState == 'K' && selectedValue == 'T') {
      //청구서 출력 전체 카드사
      try {
        let endpoint: string =
          `/fsm/cal/lpd/bs/printLocgocPymntDcsnKoiAll?` +
          `${selectedCardRow?.clclnYm ? '&clclnYm=' + selectedCardRow?.clclnYm : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          // 데이터 조회 성공시
          const jsonString = response.data

          let firstDay
          let lastDayFormatted

          if (selectedCardRow && selectedCardRow.clclnYm) {
            const clclnYm = selectedCardRow.clclnYm.toString()
            const year = parseInt(clclnYm.substring(0, 4), 10)
            const month = parseInt(clclnYm.substring(4, 6), 10)

            // 1일 구하기
            firstDay = `${year}년${month}월01일`

            // 말일 구하기
            const lastDay = new Date(year, month, 0).getDate()
            lastDayFormatted = `${year}년${month}월${lastDay}일`
          }

          // jsonObject가 배열인지 확인
          if (Array.isArray(jsonString) && jsonString.length > 0) {
            // 배열의 첫 번째 요소에 locgovNm 값을 추가
            jsonString[0].locgovNm = selectedCardRow?.locgovNm || null
            jsonString[0].clclnYm = selectedCardRow?.clclnYm || null
            jsonString[0].firstDay = firstDay || null
            jsonString[0].lastDayFormatted = lastDayFormatted || null
            jsonString[0].regDt = selectedCardRow?.regDt || null

            if (jsonString.length > 1) {
              jsonString[1].locgovNm = selectedCardRow?.locgovNm || null
              jsonString[1].clclnYm = selectedCardRow?.clclnYm || null
              jsonString[1].firstDay = firstDay || null
              jsonString[1].lastDayFormatted = lastDayFormatted || null
              jsonString[1].regDt = selectedCardRow?.regDt || null
            }
            if (jsonString.length > 2) {
              jsonString[2].locgovNm = selectedCardRow?.locgovNm || null
              jsonString[2].clclnYm = selectedCardRow?.clclnYm || null
              jsonString[2].firstDay = firstDay || null
              jsonString[2].lastDayFormatted = lastDayFormatted || null
              jsonString[2].regDt = selectedCardRow?.regDt || null
            }
          }

          const wrappedJson = { content: jsonString }
          var crfName = 'getBsBill'
          var crfData = JSON.stringify(wrappedJson)
          console.log(JSON.stringify(wrappedJson))
          openReport(crfName, crfData)
        } else {
          // 데이터가 없거나 실패
          alert('2')
        }
      } catch (error) {
        alert(error)
      }
    } else if (reportState == 'A' && selectedValue == 'O') {
      //일반버스 청구서 출력 선택 카드사
      try {
        let endpoint: string =
          `/fsm/cal/lpd/bs/printLocgocPymntDcsnVhclA?` +
          `${selectedCardRow?.clclnYm ? '&clclnYm=' + selectedCardRow?.clclnYm : ''}` +
          `${selectedCardRow?.slsNocs ? '&cnt=' + selectedCardRow?.slsNocs : ''}` +
          `${selectedCardRow?.userCnt ? '&mberCnt=' + selectedCardRow?.userCnt : ''}` +
          `${selectedCardRow?.fuelQty ? '&useLit=' + selectedCardRow?.fuelQty : ''}` +
          `${selectedCardRow?.slsAmt ? '&selAmt=' + selectedCardRow?.slsAmt : ''}` +
          `${selectedCardRow?.indvClmAmt ? '&pBillAmt=' + selectedCardRow?.indvClmAmt : ''}` +
          `${selectedCardRow?.asstAmt ? '&asstAmt=' + selectedCardRow?.asstAmt : ''}` +
          `${selectedCardRow?.crdcoCd ? '&crdcoCd=' + selectedCardRow?.crdcoCd : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          const jsonString = response.data

          let crdcoBankNm
          let crdcoNm
          let crdcoNmF
          let crdcoBrNo
          let firstDay
          let lastDayFormatted

          if (selectedCardRow && selectedCardRow.clclnYm) {
            const clclnYm = selectedCardRow.clclnYm.toString()
            const year = parseInt(clclnYm.substring(0, 4), 10)
            const month = parseInt(clclnYm.substring(4, 6), 10)

            // 1일 구하기
            firstDay = `${year}년${month}월01일`

            // 말일 구하기
            const lastDay = new Date(year, month, 0).getDate()
            lastDayFormatted = `${year}년${month}월${lastDay}일`
          }

          if (selectedCardRow?.crdcoCd == 'SH') {
            crdcoBankNm = '신한은행'
            crdcoNm = '신한카드(주)'
            crdcoNmF = '신한카드 주식회사'
            crdcoBrNo = '202-81-48079'
          } else if (selectedCardRow?.crdcoCd == 'KB') {
            crdcoBankNm = '국민은행'
            crdcoNm = '(주)KB국민카드'
            crdcoNmF = '국민카드 주식회사'
            crdcoBrNo = '101-86-61717'
          } else if (selectedCardRow?.crdcoCd == 'WR') {
            crdcoBankNm = '우리은행'
            crdcoNm = '(주)우리카드'
            crdcoNmF = '우리카드 주식회사'
            crdcoBrNo = '101-86-79070'
          }

          // jsonObject가 배열인지 확인
          if (Array.isArray(jsonString) && jsonString.length > 0) {
            // 배열의 첫 번째 요소에 locgovNm 값을 추가
            jsonString[0].crdcoCd = selectedCardRow?.crdcoCd || null
            jsonString[0].giveActno = selectedCardRow?.giveActno || null
            jsonString[0].locgovNm = selectedCardRow?.locgovNm || null
            jsonString[0].clclnYm = selectedCardRow?.clclnYm || null

            jsonString[0].crdcoBankNm = crdcoBankNm || null
            jsonString[0].crdcoNm = crdcoNm || null
            jsonString[0].crdcoNmF = crdcoNmF || null
            jsonString[0].crdcoBrNo = crdcoBrNo || null

            jsonString[0].firstDay = firstDay || null
            jsonString[0].lastDayFormatted = lastDayFormatted || null
            jsonString[0].regDt = selectedCardRow?.regDt || null
            jsonString[0].bsGb = '(일반버스)'
          } else {
            alert('청구된 일반버스내역이 없습니다.')
            return
          }
          const wrappedJson = { content: jsonString }
          var crfName = 'getBsBill'
          var crfData = JSON.stringify(wrappedJson)
          console.log(JSON.stringify(wrappedJson))
          openReport(crfName, crfData)
        } else {
          // 데이터가 없거나 실패
          alert('2')
        }
      } catch (error) {
        alert(error)
      }
    } else if (reportState == 'A' && selectedValue == 'T') {
      //일반버스 청구서 출력 전체 카드사
      try {
        let endpoint: string =
          `/fsm/cal/lpd/bs/printLocgocPymntDcsnVhclAllA?` +
          `${selectedCardRow?.clclnYm ? '&clclnYm=' + selectedCardRow?.clclnYm : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          const jsonString = response.data

          let firstDay
          let lastDayFormatted

          if (selectedCardRow && selectedCardRow.clclnYm) {
            const clclnYm = selectedCardRow.clclnYm.toString()
            const year = parseInt(clclnYm.substring(0, 4), 10)
            const month = parseInt(clclnYm.substring(4, 6), 10)

            // 1일 구하기
            firstDay = `${year}년${month}월01일`

            // 말일 구하기
            const lastDay = new Date(year, month, 0).getDate()
            lastDayFormatted = `${year}년${month}월${lastDay}일`
          }

          // jsonObject가 배열인지 확인
          if (Array.isArray(jsonString) && jsonString.length > 0) {
            // 배열의 첫 번째 요소에 locgovNm 값을 추가

            jsonString[0].locgovNm = selectedCardRow?.locgovNm || null
            jsonString[0].clclnYm = selectedCardRow?.clclnYm || null
            jsonString[0].firstDay = firstDay || null
            jsonString[0].lastDayFormatted = lastDayFormatted || null
            jsonString[0].regDt = selectedCardRow?.regDt || null
            jsonString[0].bsGb = '(일반버스)'
            if (jsonString.length > 1) {
              jsonString[1].locgovNm = selectedCardRow?.locgovNm || null
              jsonString[1].clclnYm = selectedCardRow?.clclnYm || null
              jsonString[1].firstDay = firstDay || null
              jsonString[1].lastDayFormatted = lastDayFormatted || null
              jsonString[1].regDt = selectedCardRow?.regDt || null
              jsonString[1].bsGb = '(일반버스)'
            }
            if (jsonString.length > 2) {
              jsonString[2].locgovNm = selectedCardRow?.locgovNm || null
              jsonString[2].clclnYm = selectedCardRow?.clclnYm || null
              jsonString[2].firstDay = firstDay || null
              jsonString[2].lastDayFormatted = lastDayFormatted || null
              jsonString[2].regDt = selectedCardRow?.regDt || null
              jsonString[2].bsGb = '(일반버스)'
            }
          } else {
            alert('청구된 일반버스내역이 없습니다.')
            return
          }

          const wrappedJson = { content: jsonString }
          var crfName = 'getBsBill'
          var crfData = JSON.stringify(wrappedJson)
          console.log(JSON.stringify(wrappedJson))
          openReport(crfName, crfData)
        } else {
          // 데이터가 없거나 실패
          alert('2')
        }
      } catch (error) {
        alert(error)
      }
    } else if (reportState == 'B' && selectedValue == 'O') {
      //전세버스 청구서 출력 선택 카드사
      try {
        let endpoint: string =
          `/fsm/cal/lpd/bs/printLocgocPymntDcsnVhclB?` +
          `${selectedCardRow?.clclnYm ? '&clclnYm=' + selectedCardRow?.clclnYm : ''}` +
          `${selectedCardRow?.slsNocs ? '&cnt=' + selectedCardRow?.slsNocs : ''}` +
          `${selectedCardRow?.userCnt ? '&mberCnt=' + selectedCardRow?.userCnt : ''}` +
          `${selectedCardRow?.fuelQty ? '&useLit=' + selectedCardRow?.fuelQty : ''}` +
          `${selectedCardRow?.slsAmt ? '&selAmt=' + selectedCardRow?.slsAmt : ''}` +
          `${selectedCardRow?.indvClmAmt ? '&pBillAmt=' + selectedCardRow?.indvClmAmt : ''}` +
          `${selectedCardRow?.asstAmt ? '&asstAmt=' + selectedCardRow?.asstAmt : ''}` +
          `${selectedCardRow?.crdcoCd ? '&crdcoCd=' + selectedCardRow?.crdcoCd : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          const jsonString = response.data

          let crdcoBankNm
          let crdcoNm
          let crdcoNmF
          let crdcoBrNo
          let firstDay
          let lastDayFormatted

          if (selectedCardRow && selectedCardRow.clclnYm) {
            const clclnYm = selectedCardRow.clclnYm.toString()
            const year = parseInt(clclnYm.substring(0, 4), 10)
            const month = parseInt(clclnYm.substring(4, 6), 10)

            // 1일 구하기
            firstDay = `${year}년${month}월01일`

            // 말일 구하기
            const lastDay = new Date(year, month, 0).getDate()
            lastDayFormatted = `${year}년${month}월${lastDay}일`
          }

          if (selectedCardRow?.crdcoCd == 'SH') {
            crdcoBankNm = '신한은행'
            crdcoNm = '신한카드(주)'
            crdcoNmF = '신한카드 주식회사'
            crdcoBrNo = '202-81-48079'
          } else if (selectedCardRow?.crdcoCd == 'KB') {
            crdcoBankNm = '국민은행'
            crdcoNm = '(주)KB국민카드'
            crdcoNmF = '국민카드 주식회사'
            crdcoBrNo = '101-86-61717'
          } else if (selectedCardRow?.crdcoCd == 'WR') {
            crdcoBankNm = '우리은행'
            crdcoNm = '(주)우리카드'
            crdcoNmF = '우리카드 주식회사'
            crdcoBrNo = '101-86-79070'
          }

          // jsonObject가 배열인지 확인
          if (Array.isArray(jsonString) && jsonString.length > 0) {
            // 배열의 첫 번째 요소에 locgovNm 값을 추가
            jsonString[0].crdcoCd = selectedCardRow?.crdcoCd || null
            jsonString[0].giveActno = selectedCardRow?.giveActno || null
            jsonString[0].locgovNm = selectedCardRow?.locgovNm || null
            jsonString[0].clclnYm = selectedCardRow?.clclnYm || null

            jsonString[0].crdcoBankNm = crdcoBankNm || null
            jsonString[0].crdcoNm = crdcoNm || null
            jsonString[0].crdcoNmF = crdcoNmF || null
            jsonString[0].crdcoBrNo = crdcoBrNo || null
            jsonString[0].firstDay = firstDay || null
            jsonString[0].lastDayFormatted = lastDayFormatted || null
            jsonString[0].regDt = selectedCardRow?.regDt || null
            jsonString[0].bsGb = '(전세버스)'
          } else {
            alert('청구된 전세버스내역이 없습니다.')
            return
          }
          const wrappedJson = { content: jsonString }
          var crfName = 'getBsBill'
          var crfData = JSON.stringify(wrappedJson)
          console.log(JSON.stringify(wrappedJson))
          openReport(crfName, crfData)
        } else {
          // 데이터가 없거나 실패
          alert('2')
        }
      } catch (error) {
        alert(error)
      }
    } else if (reportState == 'B' && selectedValue == 'T') {
      //전세버스 청구서 출력 전체 카드사
      try {
        let endpoint: string =
          `/fsm/cal/lpd/bs/printLocgocPymntDcsnVhclAllB?` +
          `${selectedCardRow?.clclnYm ? '&clclnYm=' + selectedCardRow?.clclnYm : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          // 데이터 조회 성공시
          const jsonString = response.data

          let firstDay
          let lastDayFormatted

          if (selectedCardRow && selectedCardRow.clclnYm) {
            const clclnYm = selectedCardRow.clclnYm.toString()
            const year = parseInt(clclnYm.substring(0, 4), 10)
            const month = parseInt(clclnYm.substring(4, 6), 10)

            // 1일 구하기
            firstDay = `${year}년${month}월01일`

            // 말일 구하기
            const lastDay = new Date(year, month, 0).getDate()
            lastDayFormatted = `${year}년${month}월${lastDay}일`
          }

          // jsonObject가 배열인지 확인
          if (Array.isArray(jsonString) && jsonString.length > 0) {
            // 배열의 첫 번째 요소에 locgovNm 값을 추가

            jsonString[0].locgovNm = selectedCardRow?.locgovNm || null
            jsonString[0].clclnYm = selectedCardRow?.clclnYm || null
            jsonString[0].firstDay = firstDay || null
            jsonString[0].lastDayFormatted = lastDayFormatted || null
            jsonString[0].regDt = selectedCardRow?.regDt || null
            jsonString[0].bsGb = '(전세버스)'
            if (jsonString.length > 1) {
              jsonString[1].locgovNm = selectedCardRow?.locgovNm || null
              jsonString[1].clclnYm = selectedCardRow?.clclnYm || null
              jsonString[1].firstDay = firstDay || null
              jsonString[1].lastDayFormatted = lastDayFormatted || null
              jsonString[1].regDt = selectedCardRow?.regDt || null
              jsonString[1].bsGb = '(전세버스)'
            }
            if (jsonString.length > 2) {
              jsonString[2].locgovNm = selectedCardRow?.locgovNm || null
              jsonString[2].clclnYm = selectedCardRow?.clclnYm || null
              jsonString[2].firstDay = firstDay || null
              jsonString[2].lastDayFormatted = lastDayFormatted || null
              jsonString[2].regDt = selectedCardRow?.regDt || null
              jsonString[2].bsGb = '(전세버스)'
            }
          } else {
            alert('청구된 전세버스내역이 없습니다.')
            return
          }

          const wrappedJson = { content: jsonString }
          var crfName = 'getBsBill'
          var crfData = JSON.stringify(wrappedJson)
          console.log(JSON.stringify(wrappedJson))
          openReport(crfName, crfData)
        } else {
          // 데이터가 없거나 실패
          alert('2')
        }
      } catch (error) {
        alert(error)
      }
    }
  }

  //클립레포트 출력 공통함수
  // const handleReport = (crfName?: string, crfData?: string) => {
  //   openReport(crfName, crfData)
  // }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
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

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  // 조건 검색 변환 매칭
  const sortChange = (sort: String): String => {
    if (sort && sort != '') {
      let [field, sortOrder] = sort.split(',') // field와 sortOrder 분리하여 매칭
      if (field === 'regYmd') field = 'regDt' // DB -> regDt // DTO -> regYmd ==> 매칭 작업
      return field + ',' + sortOrder
    }
    return ''
  }

  return (
    <PageContainer
      title="지자체별지급확정관리"
      description="지자체별지급확정관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="지자체별지급확정관리" items={BCrumb} />
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
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                청구년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                청구년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{
                  max: getFormatToday(),
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                청구년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                  max: getFormatToday(),
                }}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            <Button
              onClick={() => giveCfmtn()}
              variant="contained"
              color="primary"
            >
              확정
            </Button>
            <Button
              onClick={() => printReportClick('K')}
              variant="contained"
              color="success"
            >
              출력
            </Button>
            <ReportFormDialog
              buttonLabel="출력"
              title="청구서출력"
              size="lg"
              open={reportFormDialogOpen}
              onClose={handleDialogClose}
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={monthHeadCells} // 테이블 헤더 값
          rows={monthRows} // 목록 데이터
          loading={monthLoading} // 로딩여부
          onRowClick={handleMonthRowClick} // 행 클릭 핸들러 추가
          cursor={true}
          selectedRowIndex={selectedMonthRowIndex}
          caption={'월별 지자체지급확정 목록 조회'}
        />
      </Box>
      <Box>
        <TableDataGrid
          headCells={cardHeadCells} // 테이블 헤더 값
          rows={cardRows} // 목록 데이터
          loading={crdcoLoading} // 로딩여부
          onRowClick={handleCardRowClick} // 행 클릭 핸들러 추가
          cursor={true}
          selectedRowIndex={selectedCardRowIndex}
          caption={'카드사별 지자체지급확정 목록 조회'}
        />
      </Box>
      <Box>
        <TableDataGrid
          headCells={koiHeadCells} // 테이블 헤더 값
          rows={koiRows} // 목록 데이터
          loading={koiLoading} // 로딩여부
          onRowClick={handleKoiRowClick} // 행 클릭 핸들러 추가
          cursor={true}
          selectedRowIndex={selectedKoiRowIndex}
          caption={'유조별 지자체지급확정 목록 조회'}
        />
      </Box>
      <Box>
        <TableDataGrid
          headCells={licenseHeadCells} // 테이블 헤더 값
          rows={licenseRows} // 목록 데이터
          loading={licenseLoading} // 로딩여부
          cursor={true}
          caption={'면허업종별 지자체지급확정 목록 조회'}
        />
      </Box>

      <BlankCard
        className="contents-card"
        title="사업자별 청구내역 상세"
        buttons={[
          {
            label: '결제된 외상거래',
            onClick: () => BsnmSbsidySetlClick(),
            color: 'outlined',
          },
          {
            label: '일반버스 청구서출력',
            onClick: () => printReportClick('A'),
            color: 'outlined',
          },
          {
            label: '전세버스 청구서출력',
            onClick: () => printReportClick('B'),
            color: 'outlined',
          },
        ]}
      >
        <TableDataGrid
          headCells={brHeadCells} // 테이블 헤더 값
          rows={brRows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={false} // 로딩여부
          onRowClick={handleBrRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedBrRowIndex}
          caption={'사업자별 청구내역 상세 목록 조회'}
        />

        <BsnmSbsidySetlModal
          title="외상거래 결제내역"
          url="/fsm/cal/lpd/bs/getAllBsnmSbsidySetlCur"
          open={bsnmSbsidySetlOpen}
          row={selectedBrRow}
          onCloseClick={() => setBsnmSbsidySetlOpen(false)}
        />
        {/* <ReportFormModal
          title="청구서출력"
          open={reportFormDialogOpen}
          onCloseClick={() => setReportFormDialogOpen(false)}
        /> */}
      </BlankCard>

      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
