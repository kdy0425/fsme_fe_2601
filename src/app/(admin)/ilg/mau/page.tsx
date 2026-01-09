'use client'
import { Box, Button, Grid } from '@mui/material'
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
import {
  default as DetailTableDataGrid,
  default as TableDataGrid,
} from '@/app/components/tables/CommDataGrid2'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import {
  ilgMauMonAveHC,
  ilgMauVhclUseDtlHC,
  ilgMauVhclUseHC,
} from '@/utils/fsms/headCells'
import { Pageable2 } from 'table'
import AverageTableDataGrid from './_components/AverageTableDataGrid'

// 시도코드, 관할관청 조회
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

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
    to: '/ilg/mau',
    title: '월 누적 사용량',
  },
]

export interface Row {
  locgovCd: string
  locgovNm: string
  dlngYm: string
  bzmnSeCd: string
  koiCd: string
  avgLiter: string
  maxLiter: string
  avrgSection: string
  a01: string
  a02: string
  a03: string
  a04: string
  a05: string
  a06: string
  a07: string
  a08: string
  a09: string
  a10: string
  a11: string
  a12: string
  a13: string
  a14: string
  a15: string
  a16: string
  a17: string
  a18: string
  a19: string
  a20: string
  a21: string
  a22: string
  a23: string
  a24: string
  a25: string
  rnk: string
  vhclNo: string
  brno: string
  bzentyNm: string
  useLiter: string
  acmlAprvAmt: string
  moliatStAmt: string
  acmlUseNmtm: string
  crdcoCd: string
  cardNo: string
  puchSlipNo: string
  dealDt: string
  dailUseAcmlNmtm: string
  dlngSeCd: string
  frcsNm: string
  frcsNo: string
  frcsBrno: string
  aprvAmt: string
  vatRmbrAmt: string
  icectxRmbrAmt: string
  sumNtsRmbrAmt: string
  sumRmbrAmt: string
  rtrcnDlngDt: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  color: string
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

// 조회하여 가져온 정보를 Table에 넘기는 객체
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>() // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [detailLoading, setDetailLoading] = useState(false) // 상세 그리드 로딩여부

  const [averageRows, setAverageRows] = useState<Row[]>([])

  // 기본 날짜 세팅 (이번달이라 endDate만 활용)
  const dateRange = getDateRange('m', 1)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [averagePageable, setAveragePageable] = useState<pageable>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 9999, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [detailFlag, setDetailFlag] = useState<boolean>(false)
  const [detailRow, setDetailRow] = useState<Row[]>([])
  const [detailTotalRows, setDetailTotalRows] = useState(0)
  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })
  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovCd: '',
    dlngYm: '',
    koiCd: '',
    brno: '',
    vhclNo: '',
    bzmnSeCd: '',
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
      setDetailRow([])
      setDetailTotalRows(0)
      setSelectedIndex(-1)
    }    
  }, [flag])

  useEffect(() => {
    if (detailParams.brno !== '') {
      fetchDetailData()
    }
  }, [detailFlag])

  const schValidation = () => {
    if (!params.ctpvCd || !params.locgovCd) {
      alert("시도명 및 관할관청을 입력해주세요.")
    } else {
      return true
    }
    return false
  }
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      if (schValidation()) {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
        `/fsm/ilg/mau/tx/getAllLgByveAccmltUsgqty?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
        `${params.searchEdDate ? '&dlngYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

      let averageEndpoint: string =
        `/fsm/ilg/mau/tx/getAllByLgovAccmltUsgqty?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
        `${params.searchEdDate ? '&dlngYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
        setRows(
          response.data.content.map((row: Row) => {
            return { ...row, color: Number(row.rnk) <= 10 ? 'red' : 'black' }
          }),
        )
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        handleRowClick(response.data.content[0], 0);
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

      const averageResponse = await sendHttpRequest(
        'GET',
        averageEndpoint,
        null,
        true,
        {
          cache: 'no-store',
        },
      )

      if (
        averageResponse &&
        averageResponse.resultType === 'success' &&
        averageResponse.data
      ) {
        // 데이터 조회 성공시
        setAverageRows(averageResponse.data.content)
        if (averageResponse.data.content.length > 0) {
          handleRowClick(averageResponse.data.content[0], 0)
        }
      } else {
        // 데이터가 없거나 실패
        setAverageRows([])
      }
      }
      
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setAveragePageable({
        pageNumber: 1,
        pageSize: 9999,
        sort: params.sort,
      })
      setAverageRows([])
    } finally {
      setLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
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

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/mau/tx/getOneByveDelngDtls?page=${detailParams.page}&size=${detailParams.size}` +
        `${'&trauYmd=' + detailParams.dlngYm}` +
        `${'&locgovCd=' + detailParams.locgovCd}` +
        `${'&brno=' + detailParams.brno}` +
        `${'&vhclNo=' + detailParams.vhclNo}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRow(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setDetailRow([])
        setDetailTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRow([])
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (rowData: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    if (index != selectedIndex) {
      setDetailParams({
        page: 1,
        size: 10,
        locgovCd: rowData.locgovCd,
        dlngYm: rowData.dlngYm,
        koiCd: rowData.koiCd,
        brno: rowData.brno,
        vhclNo: rowData.vhclNo,
        bzmnSeCd: rowData.bzmnSeCd,
      })
  
      setDetailFlag(!detailFlag)
    }
  }

  const handelDetailListPagenation = (page: number, pageSize: number) => {
    setDetailParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setDetailFlag(!detailFlag)
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setExcelFlag(false)
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

  const excelDownload = async () => {
    if (rows.length == 0) {
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
        `/fsm/ilg/mau/tx/getExcelAllLgByveAccmltUsgqty?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` +
        `${params.searchEdDate ? '&dlngYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

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

  const excelDownloadDetail = async () => {
    if (detailRow.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        `/fsm/ilg/mau/tx/getExcelOneByveDelngDtls?` +
        `${'trauYmd=' + detailParams.dlngYm}` +
        `${'&locgovCd=' + detailParams.locgovCd}` +
        `${'&brno=' + detailParams.brno}` +
        `${'&vhclNo=' + detailParams.vhclNo}`

  await  getExcelFile(
        endpoint,
        '차량별 거래내역 상세' + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <PageContainer title="월 누적 사용량" description="월 누적 사용량">
      {/* breadcrumb */}
      <Breadcrumb title="월 누적 사용량" items={BCrumb} />
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
              <CustomFormLabel className="input-label-display">
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
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
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
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

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <BlankCard title="월 누적사용량 분포">
            <AverageTableDataGrid
              headCells={ilgMauMonAveHC}
              rows={averageRows}
              totalRows={averageRows.length}
              loading={loading}
              onPaginationModelChange={() => {}}
              onSortModelChange={handleSortModelChange}
              onRowClick={() => {}}
              pageable={averagePageable}
            />
          </BlankCard>
        </Grid>
        <Grid item xs={12}>
          <BlankCard title="차량별 누적사용량">
            <TableDataGrid
              headCells={ilgMauVhclUseHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              cursor={true}
            />
          </BlankCard>
        </Grid>
        <Grid item xs={12}>
          <BlankCard
            title="차량별 거래내역 상세"
            buttons={[
              {
                label: '엑셀',
                color: 'success',
                onClick: () => excelDownloadDetail(),
              },
            ]}
          >
            <DetailTableDataGrid
              headCells={ilgMauVhclUseDtlHC}
              rows={detailRow}
              totalRows={detailTotalRows}
              loading={detailLoading}
              onPaginationModelChange={handelDetailListPagenation}
              onRowClick={() => {}}
              pageable={detailPageable}
              paging={true}
              cursor={false}
            />
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default DataList
