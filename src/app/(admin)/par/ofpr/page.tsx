'use client'
import BlankCard from '@/app/components/shared/BlankCard'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState, useContext, use } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { openReport } from '@/utils/fsms/common/comm'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { getExcelFile, isNumber } from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'

import { parOfprBsHC, parOfprDtBsHC } from '@/utils/fsms/headCells'

import UserAuthContext from '@/app/components/context/UserAuthContext'

import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  getDateRange,
  getFormatToday,
  getToday,
} from '@/utils/fsms/common/dateUtils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '서면신청',
  },
  {
    title: '버스서면신청',
  },
  {
    to: '/par/ofpr',
    title: '서면신청(오프라인)',
  },
]

export interface Row {
  dlngYmd: string //거래일자
  dlngTm: string //거래시각
  dlngYm: string //거래년월
  koiNm: string //유종
  vhclNo: string //차량번호
  brno: string //사업자번호
  bzentyNm: string //업체명
  vhclSeNm: string //면허업종
  sumFuelQty: string //연료량합계
  sumAsstAmt: string //보조금합계
  ftxAsstAmt: string //유류세연동보조금합계
  opisAmt: string //유가연동보조금합계
  asstAmt: string //확정보조금
  transCnt: string //거래건수
  carCnt: string //차량수
  locgovCd: string //관할관청코드
  koiCd: string //유종코드
  vhclSeCd: string //면허업종코드
  cnptSeCd: string //거래처구분코드
  docmntAplySttsCd: string //확정코드
  lbrctStleCd: string //주유형태코드
  docmntAplyUnqNo: string //서면신청고유번호
  onlnDocmntAplyYn: string //신청구분코드
}

export interface DetailRow {
  docmntAplyUnqNo: string //서면신청고유번호
  docmntAplySttsCd: string //확정코드
  docmntAplySttsNm: string //확정여부
  dlngYmd: string //거래일자
  dlngTm: string //거래시각
  dlngYmdtm: string //거래일시
  fuelQty: string //연료량
  cnptSeCd: string //거래처구분코드
  dlngSeNm: string //거래구분
  asstAmt: string //보조금
  ftxAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  bzmnSeNm: string //사업구분
  crno: string //법인등록번호
  brno: string //사업자번호
  bzentyNm: string //업체명
  vhclNo: string //차량번호
  vhclSeNm: string //면허업종
  carmdlTypeNm: string //면허구분
  koiCd: string //유종코드
  koiNm: string //유종
  frcsNm: string //주유충전소명

  dlngSeCd: string
  dlngMnsNo: string
  aprvNo: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [detailRows, setDetailRows] = useState<DetailRow[]>([])
  const [detailTotalRows, setDetailTotalRows] = useState(0)
  const [detailLoading, setDetailLoading] = useState(false) // 로딩여부

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
  
  const [detailSearchVhclNo, setDetailSearchVhclNo] = useState<string>('') // 상세내역 차량번호 검색

  const [isDetailSearched, setIsDetailSearched] = useState<boolean>(false)

  const { authInfo } = useContext(UserAuthContext)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    dlngYmd: '',
    dlngTm: '',
    vhclNo: '',
    cnptSeCd: '',
    locgovCd: '',
    vhclSeCd: '',
    docmntAplySttsCd: '',
    brno: '',
    lbrctStleCd: '',
    dlngYm: '',
    docmntAplyUnqNo: '',
    onlnDocmntAplyYn: '',
    koiCd: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  //
  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  useEffect(() => {
    //상세내역 조회
    if (detailParams.locgovCd) {
      fetchDetailData()
    }
  }, [detailParams])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  //selectedRowIndex가 변경될때마다 체크된 건을 비워준다
  useEffect(() => {
    setSelectedRows([])
  }, [selectedRowIndex])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    setLoading(true)
    try {
      if (!params.searchStDate || !params.searchEdDate) {
        alert('거래년월을 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/par/ofpr/bs/getAllOffPapersReqst?page=${params.page}&size=${params.size}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replace(/-/g, '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replace(/-/g, '') : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.docmntAplySttsCd ? '&docmntAplySttsCd=' + params.docmntAplySttsCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
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
    }
  }

  const excelDownload = async () => {
    if (!params.searchStDate || !params.searchEdDate) {
      alert('거래일자를 입력해주세요.')
      return
    }

    let endpoint: string =
      `/fsm/par/ofpr/bs/getExcelOffPapersReqst?` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
      `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replace(/-/g, '') : ''}` +
      `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replace(/-/g, '') : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.docmntAplySttsCd ? '&docmntAplySttsCd=' + params.docmntAplySttsCd : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      let endpoint =
        `/fsm/par/ofpr/bs/getAllOffPapersReqstDtl?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.vhclNo ? '&vhclNo=' + detailParams.vhclNo : ''}` +
        `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}` +
        `${detailParams.vhclSeCd ? '&vhclSeCd=' + detailParams.vhclSeCd : ''}` +
        `${detailParams.koiCd ? '&koiCd=' + detailParams.koiCd : ''}` +
        `${detailParams.docmntAplySttsCd ? '&docmntAplySttsCd=' + detailParams.docmntAplySttsCd : ''}` +
        `${detailParams.brno ? '&brno=' + detailParams.brno : ''}` +
        `${detailParams.dlngYm ? '&dlngYm=' + detailParams.dlngYm : ''}` +
        `${detailParams.docmntAplyUnqNo ? '&docmntAplyUnqNo=' + detailParams.docmntAplyUnqNo : ''}` +
        `${detailParams.onlnDocmntAplyYn ? '&onlnDocmntAplyYn=' + detailParams.onlnDocmntAplyYn : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setDetailRows([])
        setDetailTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      setDetailRows([])
      setDetailTotalRows(0)
      setDetailPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setDetailLoading(false)
      setSelectedRows([]) // 상세내역 새로고침 시 체크박스 초기화
    }
  }

  const detailExcelDownload = async () => {
    let endpoint: string =
      `/fsm/par/ofpr/bs/getExcelOffPapersReqstDtl?` +
      `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}` +
      `${detailParams.vhclSeCd ? '&vhclSeCd=' + detailParams.vhclSeCd : ''}` +
      `${detailParams.koiCd ? '&koiCd=' + detailParams.koiCd : ''}` +
      `${detailParams.docmntAplySttsCd ? '&docmntAplySttsCd=' + detailParams.docmntAplySttsCd : ''}` +
      `${detailParams.brno ? '&brno=' + detailParams.brno : ''}` +
      `${detailParams.dlngYm ? '&dlngYm=' + detailParams.dlngYm : ''}` +
      `${detailParams.docmntAplyUnqNo ? '&docmntAplyUnqNo=' + detailParams.docmntAplyUnqNo : ''}` +
      `${detailParams.onlnDocmntAplyYn ? '&onlnDocmntAplyYn=' + detailParams.onlnDocmntAplyYn : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '상세내역_' + getToday() + '.xlsx',
    )
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const detailhandlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setDetailParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    
    setIsDetailSearched(false)
    setDetailSearchVhclNo('')
    setDetailParams((prev) => ({
      ...prev,
      page: 1,
      docmntAplySttsCd: row.docmntAplySttsCd ? row.docmntAplySttsCd : '',
      dlngYmd: row.dlngYmd ? row.dlngYmd : '',
      dlngTm: row.dlngTm ? row.dlngTm : '',
      cnptSeCd: row.cnptSeCd ? row.cnptSeCd : '',
      brno: row.brno ? row.brno : '',
      vhclNo: row.vhclNo ? row.vhclNo : '',
      koiCd: row.koiCd ? row.koiCd : '',
      dlngYm: row.dlngYm ? row.dlngYm : '',
      onlnDocmntAplyYn: row.onlnDocmntAplyYn ? row.onlnDocmntAplyYn : '',
      vhclSeCd: row.vhclSeCd ? row.vhclSeCd : '',
      lbrctStleCd: row.lbrctStleCd ? row.lbrctStleCd : '',
      locgovCd: row.locgovCd ? row.locgovCd : '',
      docmntAplyUnqNo: row.docmntAplyUnqNo ? row.docmntAplyUnqNo : '',
    }))
    setSelectedRowIndex(index ?? -1)
  }, [])
  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (isNumber(value) || name !== 'brno') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
    }
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  // 상세내역 차량번호 검색 핸들러
  const handleDetailVhclSearch = (event: React.FormEvent) => {
     event.preventDefault()

  // 차량번호가 비어 있으면 검색하지 않음
  if (!detailSearchVhclNo || detailSearchVhclNo.trim() === '') {
    alert('차량번호를 입력해주세요')
    return;
  }   
  
  setIsDetailSearched(true) // 검색 플래그 설정
  setDetailParams((prev) => ({
    ...prev,
    page: 1,
    vhclNo: detailSearchVhclNo,
    }))
  }

  // 상세내역 검색창 초기화 핸들러
  const handleDetailSearchReset = () => {
    setDetailSearchVhclNo('')
    setIsDetailSearched(false) // 플래그 초기화
    setDetailParams((prev) => ({
      ...prev,
      page: 1,
      vhclNo: '',
    }))
  }

  const updateOffApprovePapersReqst = async () => {
    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    // 탈락된 건과 확정된 건은 처리 불가
    if (['Y', 'N'].some(status => 
      selectedRows.some((id) => {
        const detailRow = detailRows[Number(id.replace('tr', ''))]
        return detailRow.docmntAplySttsCd === status
      })
    )) {
      alert('지급되었거나 탈락 된 건은 처리할 수 없습니다.')
      return
    }

    let endpoint: string = `/fsm/par/ofpr/bs/updateOffDecisionPapersReqst`

    const userConfirm = confirm(`선택된 건(${selectedRows.length}건)을 확정 처리하시겠습니까?`)

    try {
      setLoadingBackdrop(true)
      if (userConfirm) {
        let param: any[] = []
        selectedRows.map((id) => {
          const detailRow = detailRows[Number(id.replace('tr', ''))]
          param.push({
            ...detailRow,
            docmntAplySttsCd: 'Y',
          })
        })
        const updatedRows = { list: param }

        if (updatedRows.list.some((row) => row.onlnDocmntAplyYn === 'Y')) {
          alert('온라인 지급신청건은 처리할 수 없습니다.')
          return
        }

        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          updatedRows,
          true,
          {
            cache: 'no-store',
          },
        )

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleDetailSearchReset()
          fetchData()
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      alert('관리자에게 문의부탁드립니다')
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const updateOffFailPapersReqst = async () => {
    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    // 탈락된 건과 확정된 건은 처리 불가
    if (['Y', 'N'].some(status => 
      selectedRows.some((id) => {
        const detailRow = detailRows[Number(id.replace('tr', ''))]
        return detailRow.docmntAplySttsCd === status
      })
    )) {
      alert('지급되었거나 탈락 된 건은 처리할 수 없습니다.')
      return
    }

    let endpoint: string = `/fsm/par/ofpr/bs/updateOffDecisionPapersReqst`

    const userConfirm = confirm(`선택된 건(${selectedRows.length}건)을 탈락 처리하시겠습니까?`)

    try {
      setLoadingBackdrop(true)
      if (userConfirm) {
        let param: any[] = []
        selectedRows.map((id) => {
          const detailRow = detailRows[Number(id.replace('tr', ''))]
          param.push({
            ...detailRow,
            docmntAplySttsCd: 'N',
          })
        })
        const updatedRows = { list: param }

        if (updatedRows.list.some((row) => row.onlnDocmntAplyYn === 'Y')) {
          alert('온라인 지급신청건은 처리할 수 없습니다.')
          return
        }

        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          updatedRows,
          true,
          {
            cache: 'no-store',
          },
        )

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleDetailSearchReset()
          fetchData()
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      alert('관리자에게 문의부탁드립니다')
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const updateOffCanclePapersReqst = async () => {
    if (
      selectedRowIndex === undefined ||
      selectedRowIndex < 0 ||
      selectedRowIndex >= rows.length ||
      !rows[selectedRowIndex]
    ) {
      alert('선택된 건이 없습니다')
      return
    }

    if (
      rows[selectedRowIndex].docmntAplyUnqNo === null ||
      rows[selectedRowIndex].onlnDocmntAplyYn === 'Y' ||
      rows[selectedRowIndex].docmntAplySttsCd === 'N'
    ) {
      alert('오프라인 서면신청 확정 건만 확정취소할 수 있습니다.')
      return
    }

    let endpoint: string = `/fsm/par/ofpr/bs/updateOffCanclePapersReqst`

    const userConfirm = confirm(`거래내역 전체 건이 확정취소됩니다. 일괄 확정취소 처리하시겠습니까?`)

    if (userConfirm) {
      let body = {
        docmntAplyUnqNo: rows[selectedRowIndex].docmntAplyUnqNo,
        brno: rows[selectedRowIndex].brno,
        cnptSeCd: rows[selectedRowIndex].cnptSeCd,
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        handleDetailSearchReset()
        fetchData()
      } else {
        alert(response.message)
      }
    } else {
      return
    }
  }

  const AllApprove = async () => {
    
    let endpoint: string = `/fsm/par/ofpr/bs/updateOffAllDecisionPapersReqst`

    if (rows[selectedRowIndex].onlnDocmntAplyYn === 'Y') {
      alert('온라인 지급신청건은 처리할 수 없습니다.')
      return
    }

    if (['Y', 'N'].includes(rows[selectedRowIndex].docmntAplySttsCd)) {
      alert('지급되었거나 탈락 된 건은 처리할 수 없습니다.')
      return
    }

    const userConfirm = confirm(
      `거래내역 전체(${detailTotalRows}건)이 확정됩니다. 일괄 확정 처리하시겠습니까?`,
    )

    try {
      setLoadingBackdrop(true)
      if (userConfirm) {
        let body = {
          docmntAplySttsCd: 'Y',
          cnptSeCd: rows[selectedRowIndex].cnptSeCd,
          koiCd: rows[selectedRowIndex].koiCd,
          dlngYm: rows[selectedRowIndex].dlngYm,
          onlnDocmntAplyYn: rows[selectedRowIndex].onlnDocmntAplyYn,
          brno: rows[selectedRowIndex].brno,
          vhclSeCd: rows[selectedRowIndex].vhclSeCd,
          lbrctStleCd: rows[selectedRowIndex].lbrctStleCd,
          locgovCd: rows[selectedRowIndex].locgovCd,
          // 검색된 차량번호가 있으면 포함
        ...(isDetailSearched && detailSearchVhclNo && { vhclNo: detailSearchVhclNo })
        }

        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleDetailSearchReset()
          fetchData()
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      alert('관리자에게 문의부탁드립니다')
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const AllFail = async () => {
    let endpoint: string = `/fsm/par/ofpr/bs/updateOffAllDecisionPapersReqst`

    if (rows[selectedRowIndex].onlnDocmntAplyYn === 'Y') {
      alert('온라인 지급신청건은 처리할 수 없습니다.')
      return
    }

    if (['Y', 'N'].includes(rows[selectedRowIndex].docmntAplySttsCd)) {
      alert('지급되었거나 탈락 된 건은 처리할 수 없습니다.')
      return
    }

    const userConfirm = confirm(
      `거래내역 전체(${detailTotalRows}건)이 탈락됩니다. 일괄 탈락 처리하시겠습니까?`,
    )

    try {
      setLoadingBackdrop(true)
      if (userConfirm) {
        let body = {
          docmntAplySttsCd: 'N',
          cnptSeCd: rows[selectedRowIndex].cnptSeCd,
          koiCd: rows[selectedRowIndex].koiCd,
          dlngYm: rows[selectedRowIndex].dlngYm,
          onlnDocmntAplyYn: rows[selectedRowIndex].onlnDocmntAplyYn,
          brno: rows[selectedRowIndex].brno,
          vhclSeCd: rows[selectedRowIndex].vhclSeCd,
          lbrctStleCd: rows[selectedRowIndex].lbrctStleCd,
          locgovCd: rows[selectedRowIndex].locgovCd,
          // 검색된 차량번호가 있으면 포함
        ...(isDetailSearched && detailSearchVhclNo && { vhclNo: detailSearchVhclNo })
        }

        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleDetailSearchReset()
          fetchData()
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      alert('관리자에게 문의부탁드립니다')
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const offPaperPrint = async () => {
    if (detailParams.docmntAplySttsCd != 'Y') {
      alert('확정여부가 승인인 내역만 출력할 수 있습니다.')
      return
    }

    let endpoint: string =
      `/fsm/par/ofpr/bs/getPrintOffPapersReqst?` +
      `${detailParams.docmntAplyUnqNo ? '&docmntAplyUnqNo=' + detailParams.docmntAplyUnqNo : ''}` +
      `${detailParams.dlngYm ? '&dlngYm=' + detailParams.dlngYm : ''}` +
      `${detailParams.cnptSeCd ? '&cnptSeCd=' + detailParams.cnptSeCd : ''}` +
      `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}`

    const response = await sendHttpRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })

    if (response && response.resultType === 'success') {
      // 데이터 조회 성공시

      const jsonString = response.data

      const wrappedJson = { bsPaperReport: jsonString }

      console.log(JSON.stringify(wrappedJson))

      var crfName = 'bsPaperReport'
      var crfData = JSON.stringify(wrappedJson)
      openReport(crfName, crfData)
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
  }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    if (!params.searchStDate || !params.searchEdDate) {
      alert('거래년월을 입력해주세요.')
      return
    }

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  return (
    <PageContainer title="버스서면신청" description="버스서면신청">
      {/* breadcrumb */}
      <Breadcrumb title="버스서면신청" items={BCrumb} />
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="599"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclSeCd"
              >
                면허업종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="505"
                pValue={params.vhclSeCd}
                handleChange={handleSearchChange}
                pName="vhclSeCd"
                htmlFor={'sch-vhclSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래일자
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
                거래년월 종료
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
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                type="number"
                inputProps={{ maxLength: 10, type: 'number' }}
                onInput={(e: {
                  target: { value: string; maxLength: number | undefined }
                }) => {
                  e.target.value = Math.max(0, parseInt(e.target.value))
                    .toString()
                    .slice(0, e.target.maxLength)
                }}
                fullWidth
                placeholder="숫자만 입력 가능합니다."
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-docmntAplySttsCd"
              >
                확정구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="007"
                pValue={params.docmntAplySttsCd}
                handleChange={handleSearchChange}
                pName="docmntAplySttsCd"
                htmlFor={'sch-docmntAplySttsCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={updateOffApprovePapersReqst}
            >
              확정
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={updateOffFailPapersReqst}
            >
              탈락
            </Button>
            {/* 관리자권한일때만 취소가능 */}
            {authInfo &&
            'roles' in authInfo &&
            Array.isArray(authInfo.roles) &&
            authInfo.roles[0] === 'ADMIN' ? (
              <Button
                variant="contained"
                color="error"
                onClick={updateOffCanclePapersReqst}
              >
                확정취소
              </Button>
            ) : null}
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            <Button
              onClick={() => offPaperPrint()}
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
        <TableDataGrid
          headCells={parOfprBsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
        />

        {rows.length > 0 && (
        <BlankCard
          className="contents-card"
          title={
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                height: '26px' 
              }}
            >
              <span style={{ lineHeight: 1 }}>상세 거래내역</span>
              <Box 
                component="form" 
                onSubmit={handleDetailVhclSearch} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}
              >
                <CustomTextField
                  placeholder="차량번호을 입력하세요"
                  value={detailSearchVhclNo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setDetailSearchVhclNo(e.target.value)
                  }
                  sx={{ width: 175 }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                >
                  검색
                </Button>
              </Box>
            </Box>
          }
      buttons={[
        {
          label: '일괄확정',
          onClick: () => AllApprove(),
          color: 'outlined',
        },
        {
          label: '일괄탈락',
          onClick: () => AllFail(),
          color: 'outlined',
        },
        {
          label: '엑셀',
          onClick: () => detailExcelDownload(),
          color: 'success',
        },
      ]}
    >
      <TableDataGrid
        headCells={parOfprDtBsHC}
        rows={detailRows}
        totalRows={detailTotalRows}
        loading={detailLoading}
        onPaginationModelChange={detailhandlePaginationModelChange}
        pageable={detailPageable}
        paging={true}
        onCheckChange={handleCheckChange}
        caption={'commonPagingBs'}
      />
    </BlankCard>
  )}
      </Box>
      {/* 테이블영역 끝 */}
      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList