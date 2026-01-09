'use client'
import {
  Box,
  Button,
  FormControlLabel,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable, Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  getCityCodes,
  getCodesByGroupNm,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'
import { formatDate } from '@/utils/fsms/common/convert'
import {
  getCtpvCd,
  getExcelFile,
  getLocGovCd,
  getToday,
} from '@/utils/fsms/common/comm'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  dutyInsrSbscInfoHeadCells,
  hisDutyInsrSbscInfoHeadCells,
} from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import { getUserInfo } from '@/utils/fsms/utils'

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
    to: '/stn/disi',
    title: '의무보험가입정보',
  },
]

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={5}>
          차량정보
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={14}>
          의무보험 가입정보
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>소유자명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>소유구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량등록일자</TableCell>

        <TableCell style={{ whiteSpace: 'nowrap' }}>대인1보험상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인1보험시기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인1보험종기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대인2보험상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인2보험시기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인2보험종기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대물보험상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대물보험시기일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대물보험종기일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>보험사</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>보험종목</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계약번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>등록일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>수정일자</TableCell>
      </TableRow>
    </TableHead>
  )
}

const hisCustomHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={17}>
          의무보험 가입정보 이력
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>순번</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>당일수신상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대인1보험상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인1보험시기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인1보험종기일자
        </TableCell>

        <TableCell style={{ whiteSpace: 'nowrap' }}>대인2보험상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인2보험시기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          대인2보험종기일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대물보험상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대물보험시기일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대물보험종기일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>보험사</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>보험종목</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계약번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>등록일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>수정일자</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

export interface Row {
  sn?: string // 순번
  locgovCd?: string // 시도명+관할관청
  vhclNo?: string // 차량번호
  vonrRrno?: string // 주민등록번호
  vonrNm?: string // 소유자명
  carSts?: string // 차량상태
  carRegDt?: string // 차량등록일자
  carOwnNm?: string // 소유구분
  twdpsn1SeNm?: string // 대인1보험상태
  twdpsn1EraYmd?: string // 대인1보험 시기일자
  twdpsn1EotYmd?: string | null // 대인1보험 종기일자
  twdpsn2SeNm?: string // 대인2보험상태
  twdpsn2EraYmd?: string // 대인2보험 시기일자
  twdpsn2EotYmd?: string | null // 대인2보험 종기일자
  sbsttNm?: string // 대물보험상태
  sbsttEraYmd?: string // 대물보험시기일자
  sbsttEotYmd?: string // 대물보험종기일자
  insrncCoNm?: string // 보험사
  insrncClsSetuNm?: string // 보험종목명
  insrncCtrtNo?: string // 계약번호
  etcCn?: string // 기타내용
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일시
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일시
  insrncSttsCd?: string // 당일수신상태
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

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [historyLoading, setHistoryLoading] = useState(false) // 로딩여부

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [isModalOpen, setIsModalOpen] = useState(false) // modal   오픈 상태

  const [historyRows, setHistoryRows] = useState<Row[]>([]) // 거래내역에 대한 Row
  const [historyTotalRows, setHistoryTotalRows] = useState(0)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
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

  const [detailParams, setDetailParams] = useState({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (selectedRow !== undefined) {
      fetchhistoryData()
    }
  }, [historyflag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  const userInfo = getUserInfo()

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (userInfo.roles[0] == 'LOGV') {
      // 지자체 권한일때만 시도 및 관할관청 체크
      if (!params.ctpvCd) {
        alert('시도를 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }
    }
    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setLoading(true)
    setExcelFlag(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/disi/bs/getAllDutyInsrSbscInfo?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

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
        `/fsm/stn/disi/bs/getExcelDutyInsrSbscInfo?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      await getExcelFile(
        endpoint,
        '버스' + BCrumb[BCrumb.length - 1].title + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchhistoryData = async () => {
    if (selectedRow == undefined) {
      return
    }
    setHistoryLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/disi/bs/getAllDutyInsrSbscHst?page=${detailParams.page}&size=${detailParams.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setHistoryRows(response.data.content)
        setHistoryTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setHistoryRows([])
        setHistoryTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      setHistoryRows([])
      setHistoryTotalRows(0)
      setDetailPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      console.error('Error fetching data:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const excelHisDownload = async () => {
    if (selectedRow == undefined) {
      return
    }
    let endpoint: string =
      `/fsm/stn/disi/bs/getExcelDutyInsrSbscHst?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
      `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}`
    try {
      setLoadingBackdrop(true)
      await getExcelFile(
        endpoint,
        '버스' +
          BCrumb[BCrumb.length - 1].title +
          '이력' +
          getToday() +
          '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
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

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handleDetailPaginationModelChange = (
    page: number,
    pageSize: number,
  ) => {
    setDetailParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setHistoryFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(selectedRow)
    setHistoryFlag((prev) => !prev)
  }

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (userInfo.roles[0] == 'LOGV') {
      // 지자체 권한일때만 시도 및 관할관청 체크
      if (!params.ctpvCd) {
        alert('시도를 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }
    }
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    fetchData()
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField = name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setExcelFlag(false)

        setParams((prev) => ({ ...prev, page: 1, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setExcelFlag(false)

      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
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

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer
      title="버스 의무보험가입정보"
      description="의무보험가입정보 페이지"
    >
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                value={params.vhclNo ?? ''}
                onChange={handleSearchChange}
                type="text"
                id="ft-vhclNo"
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
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
        {/* <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
          <span>
            ■ 의무보험 정보가 유효하게 변경이 된 경우 보험 시작일부터 어제까지
            유효한 거래건이 있는 경우 2~3일 이내에 자동소급이 등록이 됩니다.
          </span>
        </Box> */}
        <TableDataGrid
          headCells={dutyInsrSbscInfoHeadCells}
          customHeader={customHeader}
          selectedRowIndex={selectedIndex}
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={'버스-의무보험가입정보 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}

      <>
        {selectedRow ? (
          <>
            <BlankCard
              title="의무보험가입 정보 이력"
              className="contents-card"
              buttons={[
                {
                  label: '엑셀',
                  onClick: () => {
                    excelHisDownload()
                  },
                  color: 'success',
                },
              ]}
            >
              <TableDataGrid
                headCells={hisDutyInsrSbscInfoHeadCells}
                customHeader={hisCustomHeader}
                rows={historyRows} // 목록 데이터
                totalRows={historyTotalRows} // 총 로우 수
                loading={historyLoading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={handleDetailPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={detailPageable} // 현재 페이지 / 사이즈 정보
                paging={true}
                caption={'의무보험가입 정보 이력 목록 조회'}
              />
            </BlankCard>
          </>
        ) : null}
      </>

      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default DataList
