'use client'
import { Box, Button, FormControlLabel } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { Pageable2 } from 'table'

import BlankCard from '@/app/components/shared/BlankCard'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import CardApvModal from '@/components/bs/popup/CardApvModal'
import VhclHisSearchModal from '@/components/bs/popup/VhclHisSearchModal'
import { isNumber } from '@/utils/fsms/common/comm'
import { apvlBdddDtlHC, apvlBdddHC } from '@/utils/fsms/headCells'

import { getDateRange } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '버스거래정보',
  },
  {
    to: '/apv/bddd',
    title: '일별거래내역',
  },
]

export interface Row {
  dlngYmd: string // 거래연월일
  cnptSeCd: string // 거래원코드
  cnptSeNm: string // 거래원명
  dlngSeCd: string // 거래구분코드
  dlngSeNm: string // 거래구분명
  brno: string // 사업자번호
  lbrctStleCd: string // 주유형태코드
  lbrctStleNm: string // 주유형태명
  koiCd: string // 유종코드
  koiNm: string // 유종명
  locgovCd: string // 관할관청코드
  locgovNm: string // 관할관청명
  vhclSeCd: string // 면허업종코드
  vhclSeNm: string // 면허업종명
  dlngNocs: string // 거래건수
  aprvAmt: string // 승인금액합계
  fuelQty: string // 연료량합계
  asstAmt: string // 보조금합계
  ftxAsstAmt: string // 유류세연동보조금합계
  opisAmt: string // 유가연동보조금합계
  bzentyNm: string // 업체명
  rtrcnYn: string // 취소포함여부
}

export interface DetailRow {
  dlngDt: string
  dlngYmd: string
  brno: string
  vhclNo: string
  cardNoEncpt: string
  cardNo: string
  asstAmtClclnCd: string
  frcsNm: string
  aprvAmt: number
  fuelQty: number
  asstAmt: number
  ftxAsstAmt: number
  opisAmt: string
  aprvNo: string
  imgRecog1VhclNo: string
  imgRecog2VhclNo: string
  vcf: string
  crctBfeFuelQty: string
  asstAmtClclnNm: string
  locgovNm: string
  bzentyNm: string
  dlngSeNm: string
  stlmNm: string
  lbrctStleNm: string
  koiNm: string
  vhclSeNm: string
  cnptSeNm: string
  cardSeNm: string
  crdcoNm: string
  unsetlAmt: string
  prttnYn: string
  prttnNm: string
  stlmAprvNo: string
  stlmCardNoEncpt: string
  koiCd: string
  dlngTm: string
  stlmCardNo: string
  stlmAprvYmd: string
  stlmAprvTm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [detailLoading, setDetailLoading] = useState(false) // 로딩여부

  const [detailRows, setDetailRows] = useState<DetailRow[]>()
  const [detailTotalRows, setDetailTotalRows] = useState(0)

  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false)

  const [open, setOpen] = useState<boolean>(false)
  const [openH, setOpenH] = useState<boolean>(false)
  const [modalRowData, setModalRowData] = useState<DetailRow[]>([])
  const [selectedRow, setSelectedRow] = useState<DetailRow>() // 선택된 Row를 저장할 state
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [selectedDetailRow, setSelectedDetailRow] = useState<DetailRow>() // 선택된 Row를 저장할 state
  const [selectedDetailRowIndex, setSelectedDetailRowIndex] =
    useState<number>(-1)

  const [rtrcnYn, setRtrcnYn] = useState<boolean>(false) // 취소포함 flag
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)
  const userInfo = getUserInfo()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngDt: '', // 시작일
    endDt: '', // 종료일
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    dlngYmd: '',
    locgovCd: '',
    brno: '',
    vhclSeCd: '',
    koiCd: '',
    lbrctStleCd: '',
    dlngSeCd: '',
    cnptSeCd: '',
    rtrcnYn: '',
  })

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

  // 기본 검색 날짜 범위 설정 1달

  // 초기 데이터 로드
  useEffect(() => {
    setFlag((prev) => !prev)

    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

  useEffect(() => {
    if (rtrcnYn) {
      setParams((prev) => ({ ...prev, rtrcnYn: 'Y' }))
    } else {
      setParams((prev) => ({ ...prev, rtrcnYn: 'N' }))
    }
  }, [rtrcnYn])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0])
      setSelectedRowIndex(0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (((params.bgngDt.replace('-', '') <= "20191231" && params.endDt.replace('-', '') >= "20200101") 
      || (params.bgngDt.replace('-', '') <= "201912" && params.endDt.replace('-', '') >= "202001"))) {
      alert("2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.");
      return;
    }
    setDetailRows([])
    setDetailTotalRows(0)
    setLoading(true)
    setSelectedRowIndex(-1)
    setExcelFlag(true)
    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.bgngDt || !params.endDt) {
        alert('거래년월을 입력해주세요.')
        return
      }
      /*
      if (!params.brno) {
        alert('사업자등록번호를 입력해주세요.')
        return
      }
        */

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/bddd/bs/getAllBusDalyDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${!isLocgovCdAll && params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${!isLocgovCdAll && params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.rtrcnYn ? '&rtrcnYn=' + params.rtrcnYn : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.asstAmtClclnCd ? '&asstAmtClclnCd=' + params.asstAmtClclnCd : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.lbrctStleCd ? '&lbrctStleCd=' + params.lbrctStleCd : ''}`

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
      setSelectedDetailRowIndex(-1)
      setSelectedDetailRow(undefined)
      setLoading(false)
    }
  }

  const fetchDetailData = async () => {
    setSelectedDetailRowIndex(-1)
    setSelectedDetailRow(undefined)
    setDetailLoading(true)
    try {
      let endpoint =
        `/fsm/apv/bddd/bs/getAllBusDelngDtls?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.dlngYmd ? '&dlngYmd=' + detailParams.dlngYmd : ''}` +
        `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}` +
        `${detailParams.brno ? '&brno=' + detailParams.brno : ''}` +
        `${detailParams.vhclSeCd ? '&vhclSeCd=' + detailParams.vhclSeCd : ''}` +
        `${detailParams.koiCd ? '&koiCd=' + detailParams.koiCd : ''}` +
        `${detailParams.lbrctStleCd ? '&lbrctStleCd=' + detailParams.lbrctStleCd : ''}` +
        `${detailParams.dlngSeCd ? '&dlngSeCd=' + detailParams.dlngSeCd : ''}` +
        `${detailParams.cnptSeCd ? '&cnptSeCd=' + detailParams.cnptSeCd : ''}` +
        `${detailParams.rtrcnYn ? '&rtrcnYn=' + detailParams.rtrcnYn : ''}`

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
    } finally {
      setDetailLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //

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
    setDetailParams((prev) => ({
      ...prev,
      page: 1,
      dlngYmd: row.dlngYmd ? row.dlngYmd : '',
      locgovCd: row.locgovCd ? row.locgovCd : '',
      brno: row.brno ? row.brno : '',
      vhclSeCd: row.vhclSeCd ? row.vhclSeCd : '',
      koiCd: row.koiCd ? row.koiCd : '',
      lbrctStleCd: row.lbrctStleCd ? row.lbrctStleCd : '',
      dlngSeCd: row.dlngSeCd ? row.dlngSeCd : '',
      cnptSeCd: row.cnptSeCd ? row.cnptSeCd : '',
      rtrcnYn: row.rtrcnYn ? row.rtrcnYn : '',
    }))
    setSelectedRowIndex(index ?? -1)
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    //setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    if (isNumber(value) || name !== 'brno') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
    }
    setExcelFlag(false)
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)

    try {
      let endpoint: string =
        `/fsm/apv/bddd/bs/getExcelBusDalyDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${!isLocgovCdAll && params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${!isLocgovCdAll && params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.rtrcnYn ? '&rtrcnYn=' + params.rtrcnYn : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.asstAmtClclnCd ? '&asstAmtClclnCd=' + params.asstAmtClclnCd : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.lbrctStleCd ? '&lbrctStleCd=' + params.lbrctStleCd : ''}` +
        ``

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      console.log(response)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '버스일별거래내역.xlsx')
      document.body.appendChild(link)
      link.click()
      // if (response && response.resultType === 'success' && response.data) {
      //   // 데이터 조회 성공시

      // } else {
      //   // 데이터가 없거나 실패

      // }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
    setIsExcelProcessing(false)
  }

  const excelDetailDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)

    try {
      let endpoint =
        `/fsm/apv/bddd/bs/getExcelBusDelngDtls?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.dlngYmd ? '&dlngYmd=' + detailParams.dlngYmd : ''}` +
        `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}` +
        `${detailParams.brno ? '&brno=' + detailParams.brno : ''}` +
        `${detailParams.vhclSeCd ? '&vhclSeCd=' + detailParams.vhclSeCd : ''}` +
        `${detailParams.koiCd ? '&koiCd=' + detailParams.koiCd : ''}` +
        `${detailParams.lbrctStleCd ? '&lbrctStleCd=' + detailParams.lbrctStleCd : ''}` +
        `${detailParams.dlngSeCd ? '&dlngSeCd=' + detailParams.dlngSeCd : ''}` +
        `${detailParams.cnptSeCd ? '&cnptSeCd=' + detailParams.cnptSeCd : ''}` +
        `${detailParams.rtrcnYn ? '&rtrcnYn=' + detailParams.rtrcnYn : ''}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      console.log(response)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '버스일별상세거래내역.xlsx')
      document.body.appendChild(link)
      link.click()
      // if (response && response.resultType === 'success' && response.data) {
      //   // 데이터 조회 성공시

      // } else {
      //   // 데이터가 없거나 실패

      // }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
    setIsExcelProcessing(false)
  }

  // 행 클릭 시 호출되는 함수
  const handleDetailRowClick = useCallback(
    (selectedRow: DetailRow, index?: number) => {
      setSelectedDetailRow(selectedRow)
      setSelectedDetailRowIndex(index ?? -1)
    },
    [],
  )

  useEffect(() => {
    if (detailParams.locgovCd && detailParams.brno) {
      fetchDetailData()
    }
  }, [detailParams])

  // 페이지 이동 감지 종료 //

  const handleModalOpen = async () => {
    if (!selectedDetailRow) {
      setOpen(false)
      alert('행을 먼저 선택하세요.')
      return
    }

    if (selectedDetailRow?.stlmNm === '미결제') {
      alert('미결제내역으로 카드결제내역을 확인하실 수 없습니다.')
      return
    }
    try {
      //setSelectedVhclNo(selectedRow.vhclNo)
      let endPoint =
        `/fsm/apv/bddd/bs/getAllBusStlmDtls?` +
        `&cardNo=${selectedDetailRow?.cardNoEncpt}` +
        `&aprvNo=${selectedDetailRow?.aprvNo}` +
        `&stlmAprvNo=${selectedDetailRow?.stlmAprvNo}` +
        `&stlmCardNoEncpt=${selectedDetailRow?.stlmCardNoEncpt}` +
        `&koiCd=${selectedDetailRow?.koiCd}` +
        `&dlngYmd=${selectedDetailRow?.stlmAprvYmd}`

      const response = await sendHttpRequest('GET', endPoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setModalRowData(response.data)
        setOpen(true)
      } else {
        setModalRowData([])
      }
    } catch (error) {
      console.error('Error ::: ', error)
      setModalRowData([])
    }
  }

  const handleHisModalOpen = async () => {
    if (!selectedDetailRow) {
      setOpenH(false)
      alert('행을 먼저 선택하세요.')
      return
    }
    setOpenH(true)
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  return (
    <PageContainer title="버스일별거래내역" description="버스일별거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="버스일별거래내역" items={BCrumb} />
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
                pDisabled={isLocgovCdAll}
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
                pDisabled={isLocgovCdAll}
              />
            </div>

            <div className="form-group" style={{ maxWidth: '5rem' }}>
              <FormControlLabel
                sx={userInfo.roles[0] == 'LOGV' ? { display: 'none' } : {}}
                control={
                  <CustomCheckbox
                    name="isLocgovCdAll"
                    value={isLocgovCdAll}
                    onChange={() => setIsLocgovCdAll(!isLocgovCdAll)}
                  />
                }
                label="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래년월일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월일 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngDt"
                onChange={handleSearchChange}
                inputProps={{ max: params.endDt }}
                value={params.bgngDt}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월일 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endDt"
                onChange={handleSearchChange}
                inputProps={{ min: params.bgngDt }}
                value={params.endDt}
                fullWidth
              />
            </div>

            <div className="form-group" style={{ maxWidth: '6rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="rtrcnYn"
                    value={params.rtrcnYn}
                    onChange={() => setRtrcnYn(!rtrcnYn)}
                  />
                }
                label="취소포함"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-koiCd"
                className="input-label-display"
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
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                htmlFor="ft-brno"
                className="input-label-display"
                required
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                name="brno"
                id="ft-brno"
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
                placeholder="숫자만 입력 가능합니다."
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-lbrctStleCd"
                className="input-label-display"
              >
                주유형태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="550"
                pValue={params.lbrctStleCd}
                handleChange={handleSearchChange}
                pName="lbrctStleCd"
                htmlFor={'sch-lbrctStleCd'}
                addText="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-vhclSeCd"
                className="input-label-display"
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

            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-asstAmtClclnCd"
                className="input-label-display"
              >
                보조금정산
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="544"
                pValue={params.asstAmtClclnCd}
                handleChange={handleSearchChange}
                pName="asstAmtClclnCd"
                htmlFor={'sch-asstAmtClclnCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvlBdddHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedRowIndex}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          caption={'버스일별거래내역 조회 목록'}
        />

        {detailRows && detailRows.length > 0 && (
          <BlankCard
            className="contents-card"
            title="상세 거래내역"
            buttons={[
              {
                label: '카드결제내역',
                onClick: () => handleModalOpen(),
                color: 'outlined',
              },
              {
                label: '차량이력조회',
                onClick: () => handleHisModalOpen(),
                color: 'outlined',
              },
              {
                label: '엑셀',
                onClick: () => excelDetailDownload(),
                color: 'success',
              },
            ]}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '1rem 1rem',
              }}
            >
              <span>■ 일반거래</span>
              <span style={{ color: 'red' }}>■ 취소거래</span>
              <span style={{ color: 'blue' }}>■ 취소된원거래</span>
              <span style={{ color: 'green' }}>■ 대체카드거래</span>
              <span style={{ color: 'purple' }}>■ 보조금지급정지/휴지</span>
              <span style={{ color: 'fuchsia' }}>■ 유종없음</span>
              <span style={{ color: 'teal' }}>■ 유종불일치</span>
              <span style={{ color: 'deepskyblue' }}>■ 1시간이내재주유</span>
              <span style={{ color: 'brown' }}>■ 1일4회이상주유</span>
              <span style={{ color: 'chartreuse' }}>■ 사용리터없음</span>
            </Box>
            <TableDataGrid
              headCells={apvlBdddDtlHC}
              rows={detailRows}
              totalRows={detailTotalRows}
              loading={detailLoading}
              onRowClick={handleDetailRowClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedDetailRowIndex}
              onPaginationModelChange={detailhandlePaginationModelChange}
              pageable={detailPageable}
              caption={'상세 거래 내역 조회 목록'}
            />
          </BlankCard>
        )}
        <CardApvModal
          open={open}
          title={'카드결제내역'}
          size={'xl'}
          handleOpen={() => {}}
          handleClose={() => setOpen(false)}
          modalRow={modalRowData}
          selectedRow={selectedDetailRow}
          stlmAprvYmd={
            selectedDetailRow ? (selectedDetailRow.stlmAprvYmd ?? '') : ''
          }
          stlmAprvTm={
            selectedDetailRow ? (selectedDetailRow.stlmAprvTm ?? '') : ''
          }
          stlmCardNo={
            selectedDetailRow ? (selectedDetailRow.stlmCardNo ?? '') : ''
          }
        />
        <VhclHisSearchModal
          onCloseClick={() => setOpenH(false)}
          title="차량이력 조회"
          url="/fsm/apv/bddd/bs/getAllVhcleMngHis"
          open={openH}
          row={selectedDetailRow}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
