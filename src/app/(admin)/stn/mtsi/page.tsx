'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, BlankCard } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getToday, getDateRange } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { Pageable2 } from 'table'
import { stnTsiHC, stnMtsiHC } from '@/utils/fsms/headCells'
import { TaxiSalesInfoRow } from '../tsi/page'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/mtsi',
    title: '택시 30일치 영업정보',
  },
]

interface MonthlyTaxiSalesInfoRow {
  vhclNo: string
  aplcnYm: string
  useNmtm: number
  aplySeCd: string
  aplySNm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngAplcnYmd: string
  endAplcnYmd: string
  vhclNo: string
  aplySeCd: string
}

type detailListSearchObj = {
  page: number
  size: number
  aplcnYmd: string
  vhclNo: string
  aplySeCd: string
  srchDtGb: 'm' // 검색조건 분기처리
}

const DataList = () => {
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [loading, setLoading] = useState(false) // 로딩여부
  const [rows, setRows] = useState<MonthlyTaxiSalesInfoRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [detailFlag, setDetailFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [detailLoading, setDetailLoading] = useState(false) // 로딩여부
  const [detailRows, setDetailRows] = useState<TaxiSalesInfoRow[]>([]) // 가져온 로우 데이터
  const [detailTotalRows, setDetailTotalRows] = useState(0) // 총 수

  // 목록 조회를 위한 객체
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngAplcnYmd: '',
    endAplcnYmd: '',
    vhclNo: '',
    aplySeCd: '',
  })

  // 목록 조회를 위한 객체
  const [detailParams, setDetailParams] = useState<detailListSearchObj>({
    page: 1,
    size: 10,
    aplcnYmd: '',
    vhclNo: '',
    aplySeCd: '',
    srchDtGb: 'm',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (detailFlag !== null) {
      fetchDetailData()
    }
  }, [detailFlag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('m', 1)
    setParams((prev) => ({
      ...prev,
      bgngAplcnYmd: dateRange.startDate,
      endAplcnYmd: dateRange.endDate,
    }))
  }, [])

  const searchValidation = (): boolean => {
    if (!params.bgngAplcnYmd) {
      alert('영업시작월을 입력해주세요.')
    } else if (!params.endAplcnYmd) {
      alert('영업종료월을 입력해주세요.')
    } else if (params.bgngAplcnYmd > params.endAplcnYmd) {
      alert('영업시작월이 영업종료월보다 큽니다.')
    } else if (!params.vhclNo.trim()) {
      alert('차량번호를 입력해주세요.')
    } else {
      return true
    }
    return false
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async (): Promise<void> => {
    if (searchValidation()) {
      try {
        setRows([])
        setTotalRows(0)
        setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
        setSelectedIndex(-1)
        setDetailRows([])
        setDetailTotalRows(0)
        setDetailPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
        setLoading(true)

        const searchObj: listSearchObj = {
          ...params,
          bgngAplcnYmd: params.bgngAplcnYmd.replaceAll('-', ''),
          endAplcnYmd: params.endAplcnYmd.replaceAll('-', ''),
        }

        const endpoint =
          '/fsm/stn/tsi/cm/getMonthlyTaxiSalesInfo' +
          toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length !== 0
        ) {
          // 데이터 조회 성공시
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          handleRowClick(response.data.content[0], 0)
        }
      } catch (error) {
        console.log('fetchData error : ' + error)
      } finally {
        setLoading(false)
        setExcelFlag(true)
      }
    }
  }

  // row클릭시
  const handleRowClick = useCallback(
    (row: MonthlyTaxiSalesInfoRow, index?: number): void => {
      setSelectedIndex(index ?? -1)
      setDetailParams({
        page: 1,
        size: 10,
        aplcnYmd: row.aplcnYm,
        vhclNo: row.vhclNo,
        aplySeCd: row.aplySeCd,
        srchDtGb: 'm',
      })
      setDetailFlag((prev) => !prev)
    },
    [],
  )

  // Fetch를 통해 데이터 갱신
  const fetchDetailData = async (): Promise<void> => {
    try {
      setDetailRows([])
      setDetailTotalRows(0)
      setDetailPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setDetailLoading(true)

      const searchObj: detailListSearchObj = {
        ...detailParams,
        aplcnYmd: detailParams.aplcnYmd.replaceAll('-', ''),
      }

      const endpoint =
        '/fsm/stn/tsi/cm/getAllTaxiSalesInfo' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (
        response &&
        response.resultType === 'success' &&
        response.data.content.length !== 0
      ) {
        // 데이터 조회 성공시
        setDetailRows(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      }
    } catch (error) {
      console.log('fetchDetailData error : ' + error)
    } finally {
      setDetailLoading(false)
      setExcelFlag(true)
    }
  }

  const excelDownload = async (type: 'm' | 'd'): Promise<void> => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
    } else if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
    } else {
      if (type === 'm') {
        const searchObj: listSearchObj = {
          ...params,
          bgngAplcnYmd: params.bgngAplcnYmd.replaceAll('-', ''),
          endAplcnYmd: params.endAplcnYmd.replaceAll('-', ''),
        }
        const endpoint =
          `/fsm/stn/tsi/cm/getExcelMonthlyTaxiSalesInfo` +
          toQueryParameter(searchObj)
        await getExcelFile(
          endpoint,
          '택시 30일치 영업정보_' + getToday() + '.xlsx',
        )
      } else {
        const searchObj: detailListSearchObj = {
          ...detailParams,
          aplcnYmd: detailParams.aplcnYmd.replaceAll('-', ''),
        }
        const endpoint =
          `/fsm/stn/tsi/cm/getExcelTaxiSalesInfo` + toQueryParameter(searchObj)
        await getExcelFile(
          endpoint,
          '택시 30일치 영업정보 상세_' + getToday() + '.xlsx',
        )
      }
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number): void => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handleDetailPaginationModelChange = useCallback(
    (page: number, pageSize: number): void => {
      setDetailParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setDetailFlag((prev) => !prev)
    },
    [],
  )

  // 검색조건 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = event.target
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  return (
    <PageContainer
      title="택시 30일치 영업정보"
      description="택시 30일치 영업정보"
    >
      {/* breadcrumb */}
      <Breadcrumb title="택시 30일치 영업정보" items={BCrumb} />

      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        {/* 검색영역 시작 */}
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                영업월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작영업월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngAplcnYmd"
                value={params.bgngAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료영업월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endAplcnYmd"
                value={params.endAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
                required
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-aplySeCd"
                className="input-label-display"
              >
                영업구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CCAC"
                pValue={params.aplySeCd}
                handleChange={handleSearchChange}
                pName="aplySeCd"
                htmlFor={'sch-aplySeCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>

        {/* 버튼영역 시작 */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard
          className="contents-card"
          title="택시 30일치 영업정보"
          buttons={[
            {
              label: '엑셀',
              onClick: () => excelDownload('m'),
              color: 'success',
            },
          ]}
        >
          <TableDataGrid
            headCells={stnMtsiHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            caption={'택시 30일치 영업정보 목록 조회'}
            selectedRowIndex={selectedIndex}
            onRowClick={handleRowClick}
          />
        </BlankCard>
      </Box>

      <>
        {selectedIndex !== -1 ? (
          <Box>
            <BlankCard
              className="contents-card"
              title="택시 30일치 영업정보 상세"
              buttons={[
                {
                  label: '엑셀',
                  onClick: () => excelDownload('d'),
                  color: 'success',
                },
              ]}
            >
              <TableDataGrid
                headCells={stnTsiHC} // 테이블 헤더 값
                rows={detailRows} // 목록 데이터
                totalRows={detailTotalRows} // 총 로우 수
                loading={detailLoading} // 로딩여부
                onPaginationModelChange={handleDetailPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={detailPageable} // 현재 페이지 / 사이즈 정보
                caption={'택시 30일치 영업정보 상세 목록 조회'}
              />
            </BlankCard>
          </Box>
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
