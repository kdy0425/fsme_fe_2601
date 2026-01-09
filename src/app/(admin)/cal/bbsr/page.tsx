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
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { isNumber } from '@/utils/fsms/common/comm'

// components
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import { Pageable2 } from 'table'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { calBbsrHC } from '@/utils/fsms/headCells'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable } from 'table'
import {
  getCtpvCd,
  getDateRange,
  getCommCd,
  getToday,
  getExcelFile,
  getLocGovCd,
} from '@/utils/fsms/common/comm'
import BsnmSbsidySetlModal from '@/app/components/bs/popup/BsnmSbsidySetlModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

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
    to: '/apv/bbsr',
    title: '사업자별 청구현황',
  },
]

export interface Rows {
  clclnYm?: string // 청구년월
  locgovNm?: string // 지자체명
  brno?: string // 사업자번호
  bzentyNm?: string // 업체명
  koiCd?: string // 유종코드
  koiNm?: string // 유종
  apvrCnt?: string // 거래건수
  slsAmt?: string // 거래금액
  indvClmAmt?: string // 개인부담금
  asstAmt?: string // 보조금액
  ftxAsstAmt?: string // 유류세보조금액
  opisAmt?: string // 유가연동보조금액
  fuelQty?: string // 주유·충전량
  capvrCnt?: string // 취소 건수
  cslsAmt?: string // 취소 거래금액
  cindvClmAmt?: string // 취소 개인부담금액
  casstAmt?: string // 취소 보조금액
  cftxAsstAmt?: string // 취소 유류세연동보조금액
  copisAmt?: string // 취소 유가연동보조금액
  cfuelQty?: string // 취소 주유·충전량
  prttnYn?: string // 분할여부
  locgovCd?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Rows[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Rows>()
  const [bsnmSbsidySetlOpen, setBsnmSbsidySetlOpen] = useState(false)

  const [selectedIndex, setSelectedIndex] = useState<number>()
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.searchStDate && params.searchEdDate) {
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
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    setFlag(false)
  }, [])

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM-DD인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // "-" 제거하고 반환
    return dateString.replace('-', '')
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    setSelectedRow(undefined)
    setLoading(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/bbsr/bs/getAllBsnmSbsidyRqestCur?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.searchStDate ? '&bgngDt=' + formatDate(params.searchStDate) : ''}` +
        `${params.searchEdDate ? '&endDt=' + formatDate(params.searchEdDate) : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`

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
      setLoading(false)
      setExcelFlag(true)
    }
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
    let endpoint: string =
      `/fsm/cal/bbsr/bs/getExcelBsnmSbsidyRqestCur?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.searchStDate ? '&bgngDt=' + formatDate(params.searchStDate) : ''}` +
      `${params.searchEdDate ? '&endDt=' + formatDate(params.searchEdDate) : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
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
    setFlag(!flag)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((selectedRow: Rows, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedRowIndex(index)
  }, [])

  const BsnmSbsidySetlClick = () => {
    if (!selectedRow?.brno) {
      alert('선택된 업체가 없습니다.')
      return
    }
    setBsnmSbsidySetlOpen(true)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    //setParams((prev) => ({ ...prev, [name]: value }))
    if (isNumber(value) || name !== 'brno') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
    }
    setExcelFlag(false)
  }

  return (
    <PageContainer title="사업자별청구현황" description="사업자별청구현황">
      {/* breadcrumb */}
      <Breadcrumb title="사업자별청구현황" items={BCrumb} />
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
                onChange={handleSearchChange}
                inputProps={{ max: params.searchEdDate }}
                value={params.searchStDate}
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
                onChange={handleSearchChange}
                inputProps={{ min: params.searchStDate }}
                value={params.searchEdDate}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
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
                onKeyDown={handleKeyDown}
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
              onClick={BsnmSbsidySetlClick}
              variant="contained"
              color="primary"
            >
              결제된 외상거래
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={calBbsrHC}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
          caption={'버스 사업자별 청구현황 목록 조회'}
        />
        <BsnmSbsidySetlModal
          title="외상거래 결제내역"
          url="/fsm/cal/lpd/bs/getAllBsnmSbsidySetlCur"
          open={bsnmSbsidySetlOpen}
          row={selectedRow}
          onCloseClick={() => setBsnmSbsidySetlOpen(false)}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
