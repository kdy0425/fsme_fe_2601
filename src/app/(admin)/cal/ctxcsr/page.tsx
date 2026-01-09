'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import BlankCard from '@/app/components/shared/BlankCard'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import MainTableDataGrid from './_components/TableDataGrid'
import { diffDate } from '@/utils/fsms/common/util'

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
    to: '/cal/ctxcsr',
    title: '카드사별 청구내역',
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
    id: 'userCnt',
    numeric: false,
    disablePadding: false,
    label: '사용자수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'dlngNocs',
    numeric: false,
    disablePadding: false,
    label: '매출건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'useLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'slsAmt',
    numeric: false,
    disablePadding: false,
    label: '매출금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'indvBrdnAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금',
    format: 'number',
    align: 'td-right',
  },
]

const detailHeadCells: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체',
  },
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구월',
    format: 'yyyymm',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'userCnt',
    numeric: false,
    disablePadding: false,
    label: '회원수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'dlngNocs',
    numeric: false,
    disablePadding: false,
    label: '청구건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'useLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'slsAmt',
    numeric: false,
    disablePadding: false,
    label: '매출금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'indvBrdnAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatAsstAmt',
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
  bzmnSeCd?: string
  crdcoNm?: string
  bznmSeNm?: string
  userCnt?: string
  dlngNocs?: string
  useLiter?: string
  slsAmt?: string
  indvBrndAmt?: string
  moliatAsstAmt?: string
}

export interface DetailRow {
  clclnYm?: string
  crdcoCd?: string
  bzmnSeCd?: string
  userCnt?: string
  dlngNocs?: string
  locgovCd?: string
  locgovNm?: string
  useLiter?: string
  slsAmt?: string
  indvBrndAmt?: string
  moliatAsstAmt?: string
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
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [searchFlag, setSearchFlag] = useState<boolean | undefined>(undefined)
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)
  const [rowIndex, setRowIndex] = useState(-1)

  const [detailLoading, setDetailLoading] = useState(false)
  const [detailRows, setDetailRows] = useState<DetailRow[]>([])
  const [detailTotalRows, setDetailTotalRows] = useState(0)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    detailPage: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    detailSize: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: '', // 시작일
    endDt: '', // 종료일
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    crdcoCd: '',
    clclnYm: '',
    bzmnSeCd: '',
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
    if (searchFlag != undefined) {
      fetchData()
    }
  }, [searchFlag])

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
    if (detailParams.crdcoCd && detailParams.clclnYm && detailParams.bzmnSeCd) {
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

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setDetailRows([])
    setDetailTotalRows(0)
    setRowIndex(-1)
    try {
      if (!params.bgngDt || !params.endDt) {
        alert("청구일자를 입력해주세요.")
        return
      }

      if (params.bgngDt > params.endDt) {
        alert('시작일자가 종료일자보다 클 수 없습니다.')
        return
      }

      if (!diffDate(params.bgngDt, params.endDt, 1)) {
        alert("1개월 초과 데이터는 조회가 불가능합니다.")
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/ctxcsr/tx/getAllCardSbsidyRqestTx?page=${params.page}&size=${params.size}` +
        `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
        `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}`

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
    }
  }

  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint =
        `/fsm/cal/ctxcsr/tx/getAllSbsidyRqestTx?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.crdcoCd ? '&crdcoCd=' + detailParams.crdcoCd : ''}` +
        `${detailParams.clclnYm ? '&clclnYm=' + formatDate(detailParams.clclnYm) : ''}` +
        `${detailParams.bzmnSeCd ? '&bzmnSeCd=' + detailParams.bzmnSeCd : ''}`

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

  // 상세 엑셀 다운로드
  const detailDataExcelDownload = async () => {
    if (detailRows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/ctxcsr/tx/getExcelAllCardSbsidyRqestTx?page=0` +
      `${detailParams.crdcoCd ? '&crdcoCd=' + detailParams.crdcoCd : ''}` +
      `${detailParams.clclnYm ? '&clclnYm=' + formatDate(detailParams.clclnYm) : ''}` +
      `${detailParams.bzmnSeCd ? '&bzmnSeCd=' + detailParams.bzmnSeCd : ''}`

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
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setSearchFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setSearchFlag((prev) => !prev)
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
      crdcoCd: row.crdcoCd ? row.crdcoCd : '',
      clclnYm: row.clclnYm ? row.clclnYm : '',
      bzmnSeCd: row.bzmnSeCd ? row.bzmnSeCd : '',
    }))
    setRowIndex(index ?? -1)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)
  }

  return (
    <PageContainer
      title="카드사별청구내역조회"
      description="카드사별청구내역조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="카드사별청구내역조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
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
            {/*
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
             */}
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard className="contents-card" title="카드사별 청구내역 조회">
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            selectedRowIndex={rowIndex}
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            caption={"카드사멸 청구내역 목록 조회"}
          />
        </BlankCard>
        <br />
        <br />
        {detailRows && detailRows.length > 0 && (
          <BlankCard
            className="contents-card"
            title="카드사/지자체별 청구내역 조회"
          >
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
              caption={"카드사/지자체별 청구내역 목록 조회"}
            />
          </BlankCard>
        )}
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
