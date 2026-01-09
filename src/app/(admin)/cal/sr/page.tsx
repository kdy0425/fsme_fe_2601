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

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from './_components/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { SelectItem } from 'select'
import {
  getCommCd,
  getCtpvCd,
  getExcelFile,
  getLocGovCd,
  getToday,
  getYear,
} from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { calSrSbsidyRqestTrHc } from '@/utils/fsms/headCells'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import {
  calsrTrHeadCells,
  calsrCardTrHeadCells,
  calsrCarTrHeadCells,
} from '@/utils/fsms/headCells'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '보조금청구',
  },
  {
    title: '화물청구',
  },
  {
    to: '/cal/sr',
    title: '보조금 청구내역',
  },
]

// 월별 보조금 현황 HeadCell
const customHeaderMonthly = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          청구월
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          거래건수
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          거래실인원
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사용리터(ℓ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          보조리터(ℓ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          총거래금액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          본인정산액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={3}>
          유가보조금
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유류세연동</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가연동</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 카드사별 보조금 현황 HeadCell
const customHeaderByCard = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          카드사
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          거래건수
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          거래실인원
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사용리터(ℓ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          보조리터(ℓ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          총거래금액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          본인정산액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={3}>
          유가보조금
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유류세연동</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가연동</TableCell>
      </TableRow>
    </TableHead>
  )
}

const customHeaderByCar = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          차량번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          차주명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          매출건
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          매출액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          개인청구
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={3}>
          유가보조금
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사용리터(ℓ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          보조리터(ℓ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          유종
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          톤수
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          비고
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          카드사
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          지자체
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유류세연동</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가연동</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 월별 보조금 현황 ROW 데이터
export interface MonthlyRow {
  clclnYm?: string // 청구년월
  slsNocs?: string // 거래건수
  rlDlngNmprCnt?: string // 거래실인원
  useLiter?: string // 사용리터
  asstAmtLiter?: string // 보조리터
  slsAmt?: string // 총거래금액
  indvClmAmt?: string // 본인정산액
  asstAmt?: string // 합계(유가보조금)
  ftxAsstAmt?: string // 유류세연동(유가보조금)
  opisAmt?: string // 유가연동(유가보조금)

  locgovCd?: string // 관할관청코드
}

// 카드사별 보조금 현황 ROW 데이터
export interface CardRow {
  crdcoNm?: string // 카드사
  crdcoCd?: string
  slsNocs?: string // 거래건수
  rlDlngNmprCnt?: string // 거래실인원
  useLiter?: string // 사용리터
  asstAmtLiter?: string // 보조리터
  slsAmt?: string // 총거래금액
  indvClmAmt?: string // 본인정산액
  asstAmt?: string // 합계(유가보조금)
  ftxAsstAmt?: string // 유류세연동(유가보조금)
  opisAmt?: string // 유가연동(유가보조금)
}

// 차량별 보조금 현황 ROW 데이터
export interface CarRow {
  vhclNo?: string // 차량번호
  vonrNm?: string // 차주명
  slsNocs?: string // 매출건
  slsAmt?: string // 매출액
  indvClmAmt?: string // 개인청구
  asstAmt?: string // 합계(유가보조금)
  ftxAsstAmt?: string // 유류세연동(유가보조금)
  opisAmt?: string // 유가연동(유가보조금)
  useLiter?: string // 사용리터
  asstAmtLiter?: string // 보조리터
  koiNm?: string // 유종
  vhclTonNm?: string // 톤수
  vhclPsnNm?: string // 비고
  crdcoNm?: string // 카드사
  locgovNm?: string // 지자체
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

type commonCodeObj = {
  cdExpln: string
  cdGroupNm: string
  cdKornNm: string
  cdNm: string
  cdSeNm: string
  cdSeq: string
  comCdYn: string
  useNm: string
  useYn: string
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [loading, setLoading] = useState(false) // 로딩여부
  const [cardLoading, setCardLoading] = useState(false) // 로딩여부
  const [carLoading, setCarLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [selectedCardRowIndex, setSelectedCardRowIndex] = useState<number>(-1)

  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>([]) // 가져온 로우 데이터(월별 보조금현황)
  const [cardRows, setCardRows] = useState<CardRow[]>([]) // 가져온 로우 데이터(카드별 보조금현황)
  const [carRows, setCarRows] = useState<CarRow[]>([]) // 가져온 로우 데이터(차량별 보조금현황)

  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([])
  const [yearItems, setYearItems] = useState<SelectItem[]>([])
  const [crdcoCdItems, setCrdcoCdItems] = useState<SelectItem[]>([]) // 모달 팝업 셀렉트 박스용

  const [selectedRow, setSelectedRow] = useState<MonthlyRow>() // 선택된 로우 데이터
  const [selectedCardRow, setSelectedCardRow] = useState<CardRow>()
  const [selectedCarRow, setSelectedCarRow] = useState<CarRow>()

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)
  const [totalRows, setTotalRows] = useState(0) // 총
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)
  // const [selectedRowIndex , setSelectedRowIndex] = useState(-1);
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: allParams.searchStDate ?? '',
    searchEdDate: allParams.searchEdDate ?? '',
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 초기 데이터 로드
  useEffect(() => {
    const today = new Date()
    let year = String(today.getFullYear())
    setParams((prev) => ({ ...prev, searchDate: year }))

    //getCommCd('023', '전체').then((itemArr) => setCrdcoCdItems(itemArr)) // 카드사구분 코드(모달 팝업용)

    getYear(-16, '').then((itemArr) => setYearItems(itemArr))
  }, [])

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (searchFlag != null) {
      fetchDetailDataByCar(selectedCardRow)
    }
  }, [searchFlag])

  useEffect(() => {
    //첫행조회
    if (monthlyRows.length > 0) {
      handleRowClick(monthlyRows[0], 0)
    }
  }, [monthlyRows])

  useEffect(() => {
    //두번째 테이블 조회
    if (cardRows.length > 0) {
      handleCardRowClick(cardRows[0], 0)
    }
  }, [cardRows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.ctpvCd || !params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }

      if (!params.searchDate) {
        alert('청구년도를 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/sr/tr/getAllSbsidyRqest?` +
        `${params.searchDate ? '&clclnYm=' + params.searchDate : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setMonthlyRows(response.data.content)
        setSelectedRow(response.data.content[0])
        setSelectedRowIndex(0)
      } else {
        // 데이터가 없거나 실패
        setMonthlyRows([])
        setSelectedRow(undefined)
        setSelectedRowIndex(-1)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setMonthlyRows([])
      setSelectedRow(undefined)
      setSelectedRowIndex(-1)
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const fetchDetailDataByCard = async (selectedRow?: MonthlyRow) => {
    setCardLoading(true)
    try {
      if (!selectedRow) {
        alert('조회할 데이터를 선택해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/sr/tr/getAllSbsidyCardRqest?` +
        `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setCardRows(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setCardRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setCardRows([])
    } finally {
      setCardLoading(false)
    }
  }

  const fetchDetailDataByCar = async (selectedRow?: any) => {
    setCarLoading(true)
    try {
      if (!selectedRow) {
        alert('조회할 데이터를 선택해주세요.')
        return
      }
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/sr/tr/getAllSbsidyCarRqest?page=${params.page}&size=${params.size}` +
        `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
        `${selectedRow.crdcoCd ? '&crdcoCd=' + selectedRow.crdcoCd.replaceAll('합계', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setCarRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setCarRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      setCarRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setCarLoading(false)
    }
  }

  const excelDownloadMonthly = async () => {
    if (monthlyRows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)

    let endpoint: string =
      `/fsm/cal/sr/tr/getExcelSbsidyRqest?` +
      `${params.searchDate ? '&clclnYm=' + params.searchDate : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_월별_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  const excelDownloadByCard = async (selectedRow?: MonthlyRow) => {
    if (!selectedRow) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/sr/tr/getExcelSbsidyCardRqest?` +
      `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_카드사별_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  const excelDownloadByCar = async (selectedRow?: any) => {
    if (!selectedRow) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/sr/tr/getExcelSbsidyCarRqest?` +
      `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
      `${selectedRow.crdcoCd ? '&crdcoCd=' + selectedRow.crdcoCd : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`
    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_차량별_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  const excelDownloadTotal = async (selectedRow?: MonthlyRow) => {
    if (!selectedRow) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    const userConfirm = confirm(
      '5개 카드사의 자료를 한번에 다운로드합니다.\n수 분이 소요될 수 있습니다. 다운로드 하시겠습니까?',
    )

    if (!userConfirm) {
      return
    } else {
      setIsExcelProcessing(true)
      let endpoint: string =
        `/fsm/cal/sr/tr/getExcelSbsidyTotal?` +
        `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_전체청구_' + getToday() + '.xlsx',
      )
      setIsExcelProcessing(false)
    }
  }

  const excelDownloadCard = async (selectedRow?: any) => {
    if (!selectedRow) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    const userConfirm = confirm(
      '자료의 양이 많아 팝업창을 띄우지 않고 엑셀다운로드를 바로 진행합니다.\n거래건수가 많을경우 수 분이 소요될 수 있습니다.\n다운로드 하시겠습니까?',
    )

    if (!userConfirm) {
      return
    } else {
      setIsExcelProcessing(true)
      let endpoint: string =
        `/fsm/cal/sr/tr/getExcelSbsidyCard?` +
        `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${selectedRow.crdcoCd ? '&crdcoCd=' + selectedRow.crdcoCd : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title +
          '_카드사별청구_' +
          getToday() +
          '.xlsx',
      )
      setIsExcelProcessing(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  // 페이지 이동 감지 종료 //

  const handleRowClick = (selectedRow: MonthlyRow, index?: number) => {
    setSelectedRow(selectedRow)
    fetchDetailDataByCard(selectedRow)
    setSelectedRowIndex(index ?? -1)
  }

  const handleCardRowClick = (selectedRow: CardRow, index?: number) => {
    if (selectedRow.crdcoCd !== '합계') {
      setSelectedCardRow(selectedRow)
      setSelectedCardRowIndex(index ?? -1)
      fetchDetailDataByCar(selectedRow)
      return
    }
    setSelectedCardRowIndex(index ?? -1)
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)
  }

  return (
    <PageContainer title="보조금 청구내역" description="보조금 청구내역">
      {/* breadcrumb */}
      <Breadcrumb title="보조금 청구내역" items={BCrumb} />
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
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-select-03"
                required
              >
                청구년도
              </CustomFormLabel>
              <select
                id="ft-select-03"
                className="custom-default-select"
                name="searchDate"
                value={params.searchDate}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {yearItems.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={isExcelProcessing} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button
              onClick={() => excelDownloadMonthly()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            <FormDialog
              buttonLabel="출력"
              title="청구서 출력"
              size="lg"
              selectedRow={selectedRow}
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={calsrTrHeadCells}
          rows={monthlyRows}
          selectedRowIndex={selectedRowIndex}
          totalRows={0}
          loading={loading}
          onRowClick={handleRowClick}
          customHeader={customHeaderMonthly}
          caption={'화물 보조금 청구 내역 목록 조회'}
        />

        {selectedRow && (
          <>
            <BlankCard
              className="contents-card"
              title="카드사별 보조금현황"
              buttons={[
                {
                  label: '엑셀',
                  onClick: () => {
                    excelDownloadByCard(selectedRow)
                  },
                  color: 'success',
                },
              ]}
            >
              <TableDataGrid
                headCells={calsrCardTrHeadCells}
                rows={cardRows}
                selectedRowIndex={selectedCardRowIndex}
                totalRows={0}
                loading={cardLoading}
                onRowClick={handleCardRowClick}
                customHeader={customHeaderByCard}
                caption={'카드사별 보조금현황 목록 조회'}
              />
            </BlankCard>

            <BlankCard
              className="contents-card"
              title="차량별 보조금현황"
              buttons={[
                {
                  label: '전체 청구상세내역',
                  onClick: () => {
                    excelDownloadTotal(selectedRow)
                  },
                  color: 'outlined',
                },
                {
                  label: '카드사별 청구상세내역',
                  onClick: () => {
                    excelDownloadCard(selectedCardRow)
                  },
                  color: 'outlined',
                },
                {
                  label: '엑셀',
                  onClick: () => {
                    excelDownloadByCar(selectedCardRow)
                  },
                  color: 'success',
                },
              ]}
            >
              <TableDataGrid
                headCells={calsrCarTrHeadCells}
                rows={carRows}
                totalRows={totalRows}
                loading={carLoading}
                customHeader={customHeaderByCar}
                onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={pageable} // 현재 페이지 / 사이즈 정보
                paging={true}
                cursor={true}
                caption={'차량별 보조금현황 목록 조회'}
              />
            </BlankCard>
          </>
        )}
      </Box>
      {/* 테이블영역 끝 */}

      {/* 버튼 영역 시작 */}
      {/* <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '1rem 1rem',
        }}
      >
        <Button
          onClick={() => excelDownloadTotal(selectedRow)}
          variant="contained"
          color="primary"
        >
          전체 청구상세내역
        </Button>
        <Button
          onClick={() => excelDownloadCard(selectedCardRow)}
          variant="contained"
          color="primary"
        >
          카드사별 청구상세내역
        </Button>
      </Box> */}
      {/* 버튼 영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
