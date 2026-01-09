'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import BlankCard from '@/app/components/shared/BlankCard'

//엑셀 및 출력용 팝업 및 모달
import ExcelFormDialog from './_components/ExcelFormDialog'
import ReportFormDialog from './_components/ReportFormDialog'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getDateRange,
  getExcelFile,
  getToday,
  openReport,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { diffDate } from '@/utils/fsms/common/util'
import PrintTypeModal from './_components/PrintTypeModal'
import { toQueryParameter } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '보조금청구',
  },
  {
    title: '택시청구',
  },
  {
    to: '/cal/txsr',
    title: '청구서 출력',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'bzmnSeNm',
    numeric: false,
    disablePadding: false,
    label: '사업자구분',
  },
  {
    id: 'ddlnNm',
    numeric: false,
    disablePadding: false,
    label: '확정구분',
  },
  {
    id: 'totDlngNocs',
    numeric: false,
    disablePadding: false,
    label: '매출건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totUserCnt',
    numeric: false,
    disablePadding: false,
    label: '회원수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totUseLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'totSlsAmt',
    numeric: false,
    disablePadding: false,
    label: '매출금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totIndvBrdnAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totMoliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금',
    format: 'number',
    align: 'td-right',
  },
]

const detailHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },

  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'totDlngNocs',
    numeric: false,
    disablePadding: false,
    label: '매출건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totUseLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'usageUnit',
    numeric: false,
    disablePadding: false,
    label: '단위',
  },
  {
    id: 'totSlsAmt',
    numeric: false,
    disablePadding: false,
    label: '매출금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totIndvBrdnAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totMoliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금',
    format: 'number',
    align: 'td-right',
  },
]

const detailHeadCells2: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구년월',
    format: 'yyyymm',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'totDlngNocs',
    numeric: false,
    disablePadding: false,
    label: '매출건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totUseLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'usageUnit',
    numeric: false,
    disablePadding: false,
    label: '단위',
  },
  {
    id: 'totSlsAmt',
    numeric: false,
    disablePadding: false,
    label: '매출금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totIndvBrdnAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'totMoliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금',
    format: 'number',
    align: 'td-right',
  },
]

export interface Row {
  clclnYm?: string

  crdcoCd?: string
  crdcoNm?: string

  bzmnSeCd?: string
  bzmnSeNm?: string

  ddlnYn?: string // 확정여부
  usageUnit?: string // 단위

  totDlngNocs?: string // 매출건수
  totUserCnt?: string // 회원수
  totUseLiter?: string //국토부사용량
  totSlsAmt?: string // 매출금액
  totIndvBrdnAmt?: string // 개인부담금액
  totIcectxRmbrAmt?: string // 개별소비세 환급금액
  totVatRmbrAmt?: string // 부가가치세 환급금액
  totMoliatAsstAmt?: string // 국토부보조금
  totSumRmbrAmt?: string // 합계환급금액

  clclnLocgovCd?: string // 지자체코드

  clmAprvYn?: string // 구분값
  clmAprvNm?: string // 구분명
}

export interface PrintRow {
  //resultType?: string,
  //status?: string,
  //message?: string,
  //content?: [
  clclnYm?: string
  clclnYmd?: string
  atcno?: string
  crdcoCd?: string
  crdcoNm?: string
  bzmnSeCd?: string
  bzmnSeNm?: string
  totDlngNocs?: string // 매출건수
  totUserCnt?: string // 회원수
  totUseLiter?: string //국토부사용량
  totSlsAmt?: string // 매출금액
  totIndvBrdnAmt?: string // 개인부담금액
  totIcectxRmbrAmt?: string // 개별소비세 환급금액
  totVatRmbrAmt?: string // 부가가치세 환급금액
  totMoliatAsstAmt?: string // 국토부보조금
  totSumRmbrAmt?: string // 합계환급금액
  clclnLocgovCd?: string // 지자체코드
  clmAprvYn?: string // 구분값
  clmAprvNm?: string // 구분명
  //]
}

export interface DetailRow {
  clclnYm?: string
  crdcoCd?: string
  bzmnSeCd?: string
  userCnt?: string
  dlngNocd?: string
  locgovCd?: string
  locgovNm?: string
  usageUnit?: string // 단위
  useLiter?: string
  slsAmt?: string
  indvBrndAmt?: string
  moliatAsstAmt?: string

  ddlnYn?: string // 확정여부
  clmAprvYn?: string // 구분값
  flnm?: string // 수급자
  brno?: string // 사업자번호
  vhclNo?: string // 차량번호
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  detailPage: number
  detailSize: number
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  const [detailRows, setDetailRows] = useState<DetailRow[]>([])
  const [detailTotalRows, setDetailTotalRows] = useState(0)
  const [detailLoading, setDetailLoading] = useState(false)

  const [rowIndex, setRowIndex] = useState<number>(-1) // 선택 인덱스스

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    detailPage: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    detailSize: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류

    crdcoCd: '',

    clclnLocgovCd: '',
    bgngDt: '', // 시작일
    endDt: '', // 종료일
    koiCd: '',
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정

    detailDdlnYn: '',
    detailClclnLocgovCd: '',
    detailCrdcoCd: '',
    detailClclnYm: '',
    detailBzmnSeCd: '',
    detailClmAprvYn: '',
    detailKoiCd: '',
  })

  // 메인 리스트 페이징 정보
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 디테일 리스트 페이징 정보
  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [open, setOpen] = useState<boolean>(false);
  const [isConditionChange, setIsConditionChange] = useState<boolean>(false);

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != undefined) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

  // 상세 내역 조회
  useEffect(() => {
    if (
      detailParams.detailCrdcoCd &&
      detailParams.detailClclnYm &&
      detailParams.detailBzmnSeCd
    ) {
      fetchDetailData()
    }
  }, [detailParams])

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString
    }

    return dateString.replace('-', '')
  }

  // 조회 Validation
  const schValidation = () => {
    if (!params.bgngDt) {
      alert('청구시작일자를 입력해주세요.')
    } else if (!params.endDt) {
      alert('청구종료일자를 입력해주세요.')
    } else if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
    } else if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
    } else if (new Date(params.bgngDt) > new Date(params.endDt)) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
    } else if (!diffDate(params.bgngDt, params.endDt, 1)) {
      alert("1개월 초과 데이터는 조회가 불가능합니다.")
    } else {
      return true
    }
    return false
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!schValidation()) {
      return
    }
    setDetailRows([])
    setDetailTotalRows(0)
    setRowIndex(-1)

    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/txsr/tx/getAllSbsidyCardRqest?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&' + 'clclnLocgovCd' + '=' + params.locgovCd : ''}` +
        `${params.bzmnSeCd ? '&' + 'bzmnSeCd' + '=' + params.bzmnSeCd : ''}` +
        `${params.crdcoCd ? '&' + 'crdcoCd' + '=' + params.crdcoCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
        `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        handleRowClick(response.data.content[0], 0)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setDetailRows([])
      setDetailTotalRows(0)
      setLoading(false)
      setExcelFlag(true)
      setIsConditionChange(false)
    }
  }

  //디테일 테이블 리스트
  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint =
        `/fsm/cal/txsr/tx/getAllSbsidyRqest?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.detailClclnLocgovCd ? '&' + 'clclnLocgovCd' + '=' + detailParams.detailClclnLocgovCd : ''}` +
        `${detailParams.detailCrdcoCd ? '&crdcoCd=' + detailParams.detailCrdcoCd : ''}` +
        `${detailParams.detailClmAprvYn ? '&clmAprvYn=' + detailParams.detailClmAprvYn : ''}` +
        `${detailParams.detailClclnYm ? '&clclnYm=' + formatDate(detailParams.detailClclnYm) : ''}` +
        `${detailParams.detailBzmnSeCd ? '&bzmnSeCd=' + detailParams.detailBzmnSeCd : ''}` +
        `${detailParams.detailKoiCd ? '&koiCd=' + detailParams.detailKoiCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setDetailRows(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        setDetailRows([])
        setDetailTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      console.error('no such fetching data:', error)
      setDetailRows([])
      setDetailTotalRows(0)
      setDetailPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleReportModalClick = () => {    
    if (rowIndex === -1) {
      alert('선택된 내역이 없습니다.')
    } else if (detailRows.length === 0) { // 사전체크
      alert('상세 내역 조회 후 출력을 진행해주시기 바랍니다.')
    } else if (detailParams.detailDdlnYn === 'N') { // 미확정건 여부 체크
      alert('[지급확정]처리후 청구서를 출력하시길 바랍니다.')
    } else if (isConditionChange) { // 검색조건 변동시
      alert('검색조건이 변동되었습니다.\n재조회 이후 출력 부탁드립니다.')
    } else {
      setOpen(true)
    }    
  }


  // 리포드 출력
  const handleReport = async (type:string) => {
    var crfName = ''
    var crfData = ''

    // 클립리포트 파일지정
    crfName = 'getAllSbsidyRqestTx' // 택시 청구서출력 crf파일명 지정

    try {

      let endpoint = '/fsm/cal/txsr/tx/getAllSbsidyRqestForPrint';
      let obj = {}

      if (type === 'O') { // 선택된행
        
        obj = {
          clclnLocgovCd:detailParams.detailClclnLocgovCd,
          crdcoCd:detailParams.detailCrdcoCd,
          clmAprvYn:detailParams.detailClmAprvYn,
          clclnYm:detailParams.detailClclnYm,
          bzmnSeCd:detailParams.detailBzmnSeCd,
        }
      } else { // 전체
        
        obj = {
          clclnLocgovCd:detailParams.detailClclnLocgovCd,
          crdcoCd:params.crdcoCd,
          clmAprvYn:detailParams.detailClmAprvYn,
          clclnYm:detailParams.detailClclnYm,
          bzmnSeCd:params.bzmnSeCd,
        }
      }

      endpoint = endpoint + toQueryParameter(obj);

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        const thisRow = response.data // 결과값 취득
        crfData = JSON.stringify(thisRow) // 출력용 JSON
        //crfData = JSON.stringify(dataSet); // 테스트용 데이터셋
        //alert("response.data 처리후  :  "+crfData);
      } else {
        alert(
          '상세 내역 값이 조회되지 않습니다. 다시 조회 후 출력을 진행해주시기 바랍니다',
        )
        return
      }
    } catch (error) {
      //alert("데이터 처리중 에러");
      //crfData = JSON.stringify(dataSet);
      console.error('no such fetching data:', error)
    }

    openReport(crfName, crfData)
  }

  // 리포드 출력 (샘플)
  const handleReportTest = async (crfName?: string, crfData?: string) => {
    // 샘플파일 출력 테스트
    crfName = 'CLIP' // 샘플 crf파일명 지정
    crfData = JSON.stringify([])
    openReport(crfName, crfData)
  }

  // 엑셀 다운로드
  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/txsr/tx/getExcelAllSbsidyCardRqest?` +
      `${params.locgovCd ? '&' + 'clclnLocgovCd' + '=' + params.locgovCd : ''}` +
      `${params.bzmnSeCd ? '&' + 'bzmnSeCd' + '=' + params.bzmnSeCd : ''}` +
      `${params.crdcoCd ? '&' + 'crdcoCd' + '=' + params.crdcoCd : ''}` +
      `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
      `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}`

    //alert( endpoint );

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  // 상세 엑셀 다운로드
  const detailDataExcelDownload = async () => {
    if (detailRows.length === 0) {
      alert('조회 후 엑셀 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/txsr/tx/getExcelAllSbsidyRqest?` +
      `${detailParams.detailClclnLocgovCd ? '&' + 'clclnLocgovCd' + '=' + detailParams.detailClclnLocgovCd : ''}` +
      `${detailParams.detailCrdcoCd ? '&crdcoCd=' + detailParams.detailCrdcoCd : ''}` +
      `${detailParams.detailClmAprvYn ? '&clmAprvYn=' + detailParams.detailClmAprvYn : ''}` +
      `${detailParams.detailClclnYm ? '&clclnYm=' + formatDate(detailParams.detailClclnYm) : ''}` +
      `${detailParams.detailBzmnSeCd ? '&bzmnSeCd=' + detailParams.detailBzmnSeCd : ''}`

    //alert( endpoint );

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '(상세)_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {

    setRows([])
    setDetailRows([])
    setTotalRows(0)
    setDetailTotalRows(0)

    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setDetailParams((prev) => ({ ...prev, page: 1, size: 10, detailCrdcoCd: '' })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handleDetailPaginationModelChange = (
    page: number,
    pageSize: number,
  ) => {
    setDetailParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?: number) => {   
     
      setDetailParams((prev) => ({
        ...prev,
        page: 1,
        size: 10,
        detailCrdcoCd: row.crdcoCd ? row.crdcoCd : '',
        detailClclnYm: row.clclnYm ? row.clclnYm : '',
        detailClmAprvYn: row.clmAprvYn ? row.clmAprvYn : '',
        bzmnSeCd: row.bzmnSeNm ? (row.bzmnSeNm === '개인' ? '1' : '0') : '',
        detailBzmnSeCd: row.bzmnSeNm ? (row.bzmnSeNm === '개인' ? '1' : '0') : '',
        detailClclnLocgovCd: row.clclnLocgovCd ? row.clclnLocgovCd : '',
        detailDdlnYn: row.ddlnYn ? row.ddlnYn : '',
      }))
  
      setRowIndex(index ?? -1)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setIsConditionChange(true)
    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)
  }

  return (
    <PageContainer title="청구서 출력" description="청구서 출력">
      {/* breadcrumb */}
      <Breadcrumb title="청구서 출력" items={BCrumb} />
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
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgovCd"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
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
                청구 년월
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
                청구 종료 년월
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

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-bzmnSeCd"
              >
                사업자구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CBG0" // 필수 O, 가져올 코드 그룹명
                pValue={params.bzmnSeCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="bzmnSeCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-bzmnSeCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
              {/* // 다음줄  */}
            </div>
            {/* // 다음줄  */}
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="KOI3" // 필수 O, 가져올 코드 그룹명
                pValue={params.koiCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="koiCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-koiCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdcoCd"
              >
                카드사구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CCGC" // 필수 O, 가져올 코드 그룹명
                pValue={params.crdcoCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="crdcoCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-crdcoCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
            {/* // 다음줄  */}
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              type="submit"
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
              onClick={handleReportModalClick}
              variant="contained"
              color="success"
            >
              출력
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard className="contents-card" title="청구서 출력">
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            selectedRowIndex={rowIndex}
            paging={true}
            caption={"청구서 출력 목록 조회"}
          />
        </BlankCard>
        <br />
        <br />

        { detailParams.detailCrdcoCd != '' &&
          rows.length > 0 &&
          detailRows.length > 0 &&
          detailParams.detailBzmnSeCd === '0' && (
            <BlankCard className="contents-card" title="청구별 상세내역">
              <Box
                className="table-bottom-button-group"
                style={{ marginTop: '-63px', marginBottom: '30px' }}
              >
                <div className="button-right-align">
                  <Button
                    onClick={() => detailDataExcelDownload()}
                    variant="contained"
                    color="success"
                  >
                    엑셀
                  </Button>
                </div>
              </Box>

              <TableDataGrid
                headCells={detailHeadCells} // 테이블 헤더 값
                rows={detailRows} // 목록 데이터
                totalRows={detailTotalRows} // 총 로우 수
                loading={detailLoading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={handleDetailPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={detailPageable} // 현재 페이지 / 사이즈 정보
                paging={true}
                caption={"청구별 상세 내역 목록 조회"}
              />
            </BlankCard>
          )}

        { detailParams.detailCrdcoCd != '' &&
          rows.length > 0 &&
          detailRows.length > 0 &&
          detailParams.detailBzmnSeCd != '0' && (
            <BlankCard className="contents-card" title="청구별 상세내역">
              <Box
                className="table-bottom-button-group"
                style={{ marginTop: '-63px', marginBottom: '30px' }}
              >
                <div className="button-right-align">
                  <Button
                    onClick={() => detailDataExcelDownload()}
                    variant="contained"
                    color="success"
                  >
                    엑셀
                  </Button>
                </div>
              </Box>

              <TableDataGrid
                headCells={detailHeadCells2} // 테이블 헤더 값
                rows={detailRows} // 목록 데이터
                totalRows={detailTotalRows} // 총 로우 수
                loading={detailLoading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={handleDetailPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={detailPageable} // 현재 페이지 / 사이즈 정보
                paging={true}
              />
            </BlankCard>
          )}

        {open ? (
          <PrintTypeModal
            open={open}
            setOpen={setOpen}
            handleReport={handleReport}
          />
        ) : null}
      </Box>
      
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
