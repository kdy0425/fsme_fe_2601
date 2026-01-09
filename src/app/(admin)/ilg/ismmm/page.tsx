'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from './_components/TableDataGrid'

// types
import {
  ligIsmmmPatternTrHeadCells,
  ligIsmmmLocgovTrHeadCells,
} from '@/utils/fsms/headCells'
import { getDateRange } from '@/utils/fsms/common/util'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import {
  CtpvSelect,
  CtpvSelectAll,
  LocgovSelect,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getAuthInfo } from '@/utils/fsms/fsm/utils-imports'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '화물의심거래상시점검',
  },
  {
    to: '/ilg/dvhal',
    title: '부정수급 조치관리 모니터링',
  },
]

export interface Row {
  patternName: string
  dtlCnt: number
  investCnt: number
  adminCnt: number
  noSuspectCnt: number
  warnCnt: number
  stop6Cnt: number
  stop12Cnt: number
  gamchaCnt: number
  rdmTrgtNocs: number
  totlAprvAmt: number
  totlAsstAmt: number
  totlActnAmt: number
  localCntR: number
  localCntV: number
  localCntA: number
  localCntD: number
  seq: number
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  bgngAprvYmd: string
  endAprvYmd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [rows2, setRows2] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [authInfo, setAuthInfo] = useState<any>(null)
  const [excelLoading, setExcelLoading] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    bgngAprvYmd: '', // 시작일
    endAprvYmd: '', // 종료일
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
  }, [])

  // 기본 날짜 세팅 (30일)
  const setDateRange = async () => {
    const dateRange = getDateRange('date', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    const tempAuthInfo = authInfo ? authInfo : await getAuthInfo()
    const { authSttus } = tempAuthInfo

    setParams((prev) => ({
      ...prev,
      bgngAprvYmd: startDate,
      endAprvYmd: endDate,
      ctpvCd: authSttus.locgovCd.substring(0, 2),
      locgovCd: authSttus.locgovCd,
    }))
    setFlag(true)
  }

  // 엑셀다운로드
  const excelDownload = async (excelType: string) => {
    /**
     * excelType의 값이 pattern인 경우 패턴별 통계 엑셀다운로드
     * excelType의 값이 locgovCd인 경우 지자체별 통계 엑셀다운로드
     */
    if (excelType === '') {
      alert(' 출력하려는 통계의 종류를 선택해주세요 ')
      return
    }

    let excelFileName: string =
      excelType === 'pattern'
        ? '패턴별 부정수급 조사/처분현황'
        : '지자체별 부정수급 조사/처분현황'

    try {
      setExcelLoading(true)
      let endpoint: string =
        `/fsm/ilg/ismmm/tr/${excelType === 'pattern' ? 'instcSplMgtMagMntrngPatternExcel' : 'instcSplMgtMagMntrngLocgovExcel'}?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}`

      await getExcelFile(endpoint, excelFileName + '_' + getToday() + '.xlsx')

      setExcelLoading(false)
    } catch (error) {
      alert(error)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성

      // 지자체별
      let endpoint: string =
        `/fsm/ilg/ismmm/tr/getAllInstcSplMgtMagMntrngPattern?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}`
      // 패턴별
      let endpoint2: string =
        `/fsm/ilg/ismmm/tr/getAllInstcSplMgtMagMntrngLocgov?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const response2 = await sendHttpRequest('GET', endpoint2, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        // setPageable({
        //   pageNumber: response.data.pageable.pageNumber +1,
        //   pageSize: response.data.pageable.pageSize,
        //   sort: params.sort,
        // })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        // setPageable({
        //   pageNumber: 1,
        //   pageSize: 10,
        //   sort: params.sort,
        // })
      }
      if (response2 && response2.resultType === 'success' && response2.data) {
        // 데이터 조회 성공시
        setRows2(response2.data.content)
        setTotalRows(response2.data.totalElements)
      } else {
        // 데이터가 없거나 실패
        setRows2([])
        setTotalRows(0)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngAprvYmd' || name === 'endAprvYmd') {
      const otherDateField =
        name === 'bgngAprvYmd' ? 'endAprvYmd' : 'bgngAprvYmd'
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

    if (changedField === 'bgngAprvYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <>
      <PageContainer
        title="부정수급 조치관리 모니터링"
        description="부정수급 조치관리 모니터링"
      >
        {/* breadcrumb */}
        <Breadcrumb title="부정수급 조치관리 모니터링" items={BCrumb} />
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
                  width="70%"
                  pValue={params.ctpvCd}
                  htmlFor={'sch-ctpv'}
                  handleChange={handleSearchChange}
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
                  width="70%"
                  ctpvCd={params.ctpvCd}
                  pValue={params.locgovCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-locgov'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  기간
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  기간 시작
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="bgngAprvYmd"
                  value={params.bgngAprvYmd}
                  onChange={handleSearchChange}
                  fullWidth
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  기간 종료
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="endAprvYmd"
                  value={params.endAprvYmd}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>
            </div>
          </Box>
          <Box className="table-bottom-button-group">
            <div className="button-right-align">
              <Button variant="contained" type="submit" color="primary">
                검색
              </Button>
              <Button
                variant="contained"
                onClick={() => excelDownload('pattern')}
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
          <CustomFormLabel className="input-label-display">
            <h2>패턴별 부정수급 조사/처분현황</h2>
          </CustomFormLabel>
          <TableDataGrid
            headCells={ligIsmmmPatternTrHeadCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          />
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              onClick={() => excelDownload('locgovCd')}
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
        <Box>
          <CustomFormLabel className="input-label-display">
            <h2>지자체별 부정수급 조사/처분현황</h2>
          </CustomFormLabel>
          <TableDataGrid
            headCells={ligIsmmmLocgovTrHeadCells} // 테이블 헤더 값
            rows={rows2} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          />
        </Box>
        {/* 테이블영역 끝 */}
        <LoadingBackdrop open={excelLoading} />
      </PageContainer>
    </>
  )
}

export default DataList
