'use client'
import BlankCard from '@/app/components/shared/BlankCard'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { openReport } from '@/utils/fsms/common/comm'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { getExcelFile, isNumber } from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'

import { parOprBsHC, parOprDtBsHC } from '@/utils/fsms/headCells'
import axios from 'axios'

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
    to: '/par/opr',
    title: '서면신청(온라인)',
  },
]

export interface Row {
  docmntAplySttsNm: string //확정여부
  koiNm: string //유종
  regYmd: string //접수일자
  brno: string //사업자번호
  bzentyNm: string //업체명
  vhclSeNm: string //면허업종
  useLiter: string //연료량합계
  totlAsstAmt: string //보조금합계
  ftxAsstAmt: string //유류세연동보조금합계
  opisAmt: string //유가연동보조금합계
  giveUntprc: string //지급단가
  detailCnt: string //거래건수
  vhclCnt: string //차량수
  dlngBgngYmd: string //거래시작일
  dlngEndYmd: string //거래종료일
  atchFileNm: string //첨부파일
  locgovCd: string //관할관청코드
  docmntAplyUnqNo: string
  giveSeCd: string
  origFileNm: string
}

export interface DetailRow {
  apvlDt: string //거래일시
  aprvNo: string //승인번호
  fuelQty: string //연료량
  asstAmt: string //보조금
  ftxAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  bzmnSeNm: string //사업구분
  crno: string //법인등록번호
  brno: string //사업자번호
  bzentyNm: string //업체명
  vhclNo: string //차량번호
  vhclSeNm: string //면허업종
  carmdlSeNm: string //면허구분
  koiNm: string //유종
  oilStaNm: string //주유/충전소명
  giveSeCd: string
  giveSeNm: string //확정여부
  atchFileNm: string //첨부파일
  origFileNm: string
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
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
    origFileNm: '',
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngDt: '',
    endDt: '',
    locgovCd: '',
    koiCd: '',
    vhclSeCd: '',
    brno: '',
    docmntAplySttsCd: '',
    docmntAplyUnqNo: '',
    giveSeCd: '',
    atchFileNm: '',
    origFileNm: '',
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

    const dateRange = getDateRange('d', 30)
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
        `/fsm/par/opr/bs/getAllOnPapersReqst?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.cardDlngTypeCd ? '&cardDlngTypeCd=' + params.cardDlngTypeCd : ''}` + //유종분류컬럼
        `${params.carmdlSeCd ? '&carmdlSeCd=' + params.carmdlSeCd : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replace(/-/g, '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replace(/-/g, '') : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.giveSeCd ? '&giveSeCd=' + params.giveSeCd : ''}`

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
      setExcelFlag(true)
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }
    let endpoint: string =
      `/fsm/par/opr/bs/getExcelOnPapersReqst?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.cardDlngTypeCd ? '&cardDlngTypeCd=' + params.cardDlngTypeCd : ''}` + //유종분류컬럼
      `${params.carmdlSeCd ? '&carmdlSeCd=' + params.carmdlSeCd : ''}` +
      `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replace(/-/g, '') : ''}` +
      `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replace(/-/g, '') : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.giveSeCd ? '&giveSeCd=' + params.giveSeCd : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  const paperDown = async () => {
    if (!detailParams.brno) {
      alert('선택항목이 없습니다.')
      return
    }

    if (detailParams.atchFileNm == '미등록') {
      alert('첨부파일이 없습니다.')
      return
    }

    try {
      const endPoint =
        `/fsm/par/opr/bs/getDownloadPapersReqst/` + detailParams.docmntAplyUnqNo
      const response = await sendHttpFileRequest('GET', endPoint, null, true, {
        cache: 'no-store',
      })

      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')

      link.href = url
      link.setAttribute('download', detailParams.origFileNm)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      alert('관리자에게 문의부탁드립니다')
    }

    // try {
    //       let endpoint: string =
    //       `http://www.buscard.co.kr/file/fileDownloadFsmsAjax.do?formId=ONFORM_0000000012291&bid=1248101172`;

    //       const response = await sendHttpFileRequest('GET', endpoint, null, true, {
    //       cache: 'no-store',
    //       })
    //       const url = window.URL.createObjectURL(new Blob([response]));
    //       const link = document.createElement('a');
    //       link.href = url;
    //       link.setAttribute('download', '테스트');
    //       document.body.appendChild(link);
    //       link.click();
    //   } catch (error) {
    //       // 에러시
    //       console.error('Error fetching data:', error)
    //       alert(error)
    //   }
  }

  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      let endpoint =
        `/fsm/par/opr/bs/getAllOnPapersReqstDtl?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.docmntAplyUnqNo ? '&docmntAplyUnqNo=' + detailParams.docmntAplyUnqNo : ''}` +
        `${detailParams.brno ? '&brno=' + detailParams.brno : ''}`

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
    }
  }

  const detailExcelDownload = async () => {
    if (detailRows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
      return
    }

    let endpoint: string =
      `/fsm/par/opr/bs/getExcelOnPapersReqstDtl?` +
      `${detailParams.docmntAplyUnqNo ? '&docmntAplyUnqNo=' + detailParams.docmntAplyUnqNo : ''}` +
      `${detailParams.brno ? '&brno=' + detailParams.brno : ''}`

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
    setDetailParams((prev) => ({
      ...prev,
      page: 1,
      docmntAplySttsNm: row.docmntAplySttsNm ? row.docmntAplySttsNm : '',
      koiNm: row.koiNm ? row.koiNm : '',
      regYmd: row.regYmd ? row.regYmd : '',
      brno: row.brno ? row.brno : '',
      bzentyNm: row.bzentyNm ? row.bzentyNm : '',
      locgovCd: row.locgovCd ? row.locgovCd : '',
      docmntAplyUnqNo: row.docmntAplyUnqNo ? row.docmntAplyUnqNo : '',
      vhclSeNm: row.vhclSeNm ? row.vhclSeNm : '',
      useLiter: row.useLiter ? row.useLiter : '',
      totlAsstAmt: row.totlAsstAmt ? row.totlAsstAmt : '',
      ftxAsstAmt: row.ftxAsstAmt ? row.ftxAsstAmt : '',
      opisAmt: row.opisAmt ? row.opisAmt : '',
      giveUntprc: row.giveUntprc ? row.giveUntprc : '',
      detailCnt: row.detailCnt ? row.detailCnt : '',
      vhclCnt: row.vhclCnt ? row.vhclCnt : '',
      dlngBgngYmd: row.dlngBgngYmd ? row.dlngBgngYmd : '',
      dlngEndYmd: row.dlngEndYmd ? row.dlngEndYmd : '',
      atchFileNm: row.atchFileNm ? row.atchFileNm : '',
      giveSeCd: row.giveSeCd ? row.giveSeCd : '',
      origFileNm: row.origFileNm ? row.origFileNm : '',
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
    setExcelFlag(false)
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  const updateOnApprovePapersReqst = async () => {
    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    let canProceed = true

    selectedRows.forEach((id) => {
      const row = rows[Number(id.replace('tr', ''))]
      if (row.giveSeCd === 'Y' || row.giveSeCd === 'N') {
        alert('온라인 지급신청 상태가 이미 확정/탈락인 건은 처리할 수 없습니다')
        canProceed = false
        return
      }
    })

    if (!canProceed) {
      return
    }

    let endpoint: string = `/fsm/par/opr/bs/updateOnDecisionPapersReqst`

    let userConfirm = confirm('선택된 건을 확정 처리하시겠습니까?')

    try {
      setLoadingBackdrop(true)
      if (userConfirm) {
        let param: any[] = []
        selectedRows.map((id) => {
          const row = rows[Number(id.replace('tr', ''))]
          param.push({
            ...row,
            giveSeCd: 'Y',
            docmntAplySttsCd: 'Y',
          })
        })
        const updatedRows = { list: param }

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

  const updateOnFailPapersReqst = async () => {
    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    let canProceed = true

    selectedRows.forEach((id) => {
      const row = rows[Number(id.replace('tr', ''))]
      if (row.giveSeCd === 'Y' || row.giveSeCd === 'N') {
        alert('온라인 지급신청 상태가 이미 확정/탈락인 건은 처리할 수 없습니다')
        canProceed = false
        return
      }
    })

    if (!canProceed) {
      return
    }

    let endpoint: string = `/fsm/par/opr/bs/updateOnDecisionPapersReqst`

    let userConfirm = confirm('선택된 건을 탈락 처리하시겠습니까?')

    try {
      setLoadingBackdrop(true)
      if (userConfirm) {
        let param: any[] = []
        selectedRows.map((id) => {
          const row = rows[Number(id.replace('tr', ''))]
          param.push({
            ...row,
            giveSeCd: 'N',
            docmntAplySttsCd: 'N',
          })
        })
        const updatedRows = { list: param }

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

  const onPaperPrint = async () => {
    if (detailParams.giveSeCd != 'Y') {
      alert('확정여부가 승인인 내역만 출력할 수 있습니다.')
      return
    }

    let endpoint: string =
      `/fsm/par/opr/bs/getPrintOnPapersReqst?` +
      `${detailParams.docmntAplyUnqNo ? '&docmntAplyUnqNo=' + detailParams.docmntAplyUnqNo : ''}` +
      `${detailParams.brno ? '&brno=' + detailParams.brno : ''}`

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
                htmlFor="sch-carmdlSeCd"
              >
                면허구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="583"
                pValue={params.carmdlSeCd}
                handleChange={handleSearchChange}
                pName="carmdlSeCd"
                htmlFor={'sch-carmdlSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                접수일자
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
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{
                  max: getFormatToday,
                }}
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
                placeholder="숫자만 입력 가능합니다."
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-giveSeCd"
              >
                확정여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="582"
                pValue={params.giveSeCd}
                handleChange={handleSearchChange}
                pName="giveSeCd"
                htmlFor={'sch-giveSeCd'}
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
              variant="contained"
              color="primary"
              onClick={updateOnApprovePapersReqst}
            >
              확정
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={updateOnFailPapersReqst}
            >
              탈락
            </Button>
            <Button
              onClick={() => paperDown()}
              variant="contained"
              color="success"
            >
              증빙
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            <Button
              onClick={() => onPaperPrint()}
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
          headCells={parOprBsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          onCheckChange={handleCheckChange}
        />

        {detailRows && detailRows.length > 0 && (
          <BlankCard
            className="contents-card"
            title="상세 거래내역"
            buttons={[
              {
                label: '엑셀',
                onClick: () => detailExcelDownload(),
                color: 'success',
              },
            ]}
          >
            <TableDataGrid
              headCells={parOprDtBsHC}
              rows={detailRows}
              totalRows={detailTotalRows}
              loading={detailLoading}
              onRowClick={() => {}} // 행 클릭 핸들러 추가
              onPaginationModelChange={detailhandlePaginationModelChange}
              pageable={detailPageable}
              paging={true}
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
