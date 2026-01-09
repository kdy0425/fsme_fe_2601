'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '권한관리',
  },
  {
    to: '/sym/ucdh',
    title: '장기미접속자삭제이력',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'delYmd',
    numeric: false,
    disablePadding: false,
    label: '삭제일자',
    format: 'yyyymmdd',
  },
  {
    id: 'delNocs',
    numeric: false,
    disablePadding: false,
    label: '삭제건수',
    format: 'number',
  },
]

const detailHeadCells: HeadCell[] = [
  {
    id: 'delYmd',
    numeric: false,
    disablePadding: false,
    label: '삭제일자',
    format: 'yyyymmdd',
  },
  {
    id: 'userId',
    numeric: false,
    disablePadding: false,
    label: '사용자ID',
  },
  {
    id: 'ctpvNm',
    numeric: false,
    disablePadding: false,
    label: '시도',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체명',
  },
]

export interface Row {
  delYmd?: string
  userId?: string
  userNm?: string
  ctpvCd?: string
  ctpvNm?: string
  instCd?: string
  locgovNm?: string
  delNocs?: string | null
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
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 인덱스

  const [detailRows, setDetailRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [detailTotalRows, setDetailTotalRows] = useState(0) // 총 수
  const [detailLoading, setDetailLoading] = useState(false) // 상세 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const dateRange = getDateRange('d', 30)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setDetailRows([])
    setDetailTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })

    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
  }, [])
  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/ucdh/cm/getAllUnConectrDelHist?` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        setTotalRows(response.data.length)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailData = async (delYmd: string) => {
    setExcelFlag(true)
    setDetailLoading(true)
    try {
      if (!delYmd) {
        return
      }
      let endpoint: string =
        `/fsm/sym/ucdh/cm/getAllUnConectrDelHistDtl?page=${params.page}&size=${params.size}` +
        `&delYmd=${delYmd}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable?.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setDetailRows([])
        setDetailTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setDetailRows([])
      setDetailTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        `/fsm/sym/ucdh/cm/getExcelUnConectrDelHist?` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      await  getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const detailExcelDownload = async () => {
    if (detailRows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string = `/fsm/sym/ucdh/cm/getExcelUnConectrDelHistDtl?delYmd=${rows[selectedIndex].delYmd}`

  await  getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '상세_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
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
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)

    await fetchDetailData(row.delYmd ?? '')
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
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

  return (
    <PageContainer
      title="장기미접속자삭제이력"
      description="장기미접속자삭제이력"
    >
      {/* breadcrumb */}
      <Breadcrumb title="장기미접속자삭제이력" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                삭제기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                삭제기간 시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                삭제기간 종료일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant="contained" color="success" onClick={excelDownload}>
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
        />
      </Box>
      {selectedRow && selectedIndex > -1 ? (
        <Box>
          <BlankCard
            title="장기미접속자 삭제 상세내역"
            buttons={[
              {
                label: '엑셀',
                color: 'success',
                onClick: () => detailExcelDownload(),
              },
            ]}
          >
            <TableDataGrid
              headCells={detailHeadCells} // 테이블 헤더 값
              rows={detailRows} // 목록 데이터
              totalRows={detailTotalRows} // 총 로우 수
              loading={detailLoading} // 로딩여부
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
            />
          </BlankCard>
        </Box>
      ) : (
        <></>
      )}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
