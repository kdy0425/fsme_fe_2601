'use client'
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  getCityCodes,
  getCodesByGroupNm,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { hisstnosiheadCells, stnosiheadCells } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

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
    to: '/stn/osi',
    title: '운행정지 정보',
  },
]

const CustomHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={7}>
          운행정지정보
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>입력구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>운행정지등록구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>운행정지등록사유</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          운행정지등록/해제일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>등록일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>수정일자</TableCell>
      </TableRow>
    </TableHead>
  )
}

const HisCustomHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={8}>
          운행정지정보 변경이력
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>순번</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>입력구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>운행정지등록구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>운행정지등록사유</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          운행정지등록/해제일자
        </TableCell>
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
  locgovCd?: string // 시도명+관할관청
  vhclNo?: string // 차량번호
  oprStopRegDataSn?: number // 순번
  oprStopRegSeCd?: string // 운행정지등록구분코드
  oprStopRegSeCdNm?: string // 입력구분
  oprStopRegSttsCd?: string // 운행정지등록상태코드
  oprStopRegSttsCdNm?: string // 운행정지등록구분
  stopRsnCn?: string // 운행정지등록사유
  oprStopRegRmvYmd?: string // 운행정지등록/해제일자
  regDt?: string // 등록일자
  mdfcnDt?: string // 수정일자
  locgovNm?: string // 지자체명
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null >(null) // 데이터 갱신을 위한 플래그 설정
  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [historyLoading, setHistoryLoading] = useState(false) // 로딩여부

  const [cityCode, setCityCode] = useState<SelectItem[]>([]) //        시도 코드
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [historyTotalRows, setHistoryTotalRows] = useState(0)

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [historyRows, setHistoryRows] = useState<Row[]>([]) // 거래내역에 대한 Row


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

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    // select item setting
    let cityCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]
    let locgovCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]

    // 시도명 select item setting
    getCityCodes().then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['ctpvNm'],
            value: code['ctpvCd'],
          }

          cityCodes.push(item)
        })
      }
      setCityCode(cityCodes)
    })

    // 관할관청 select item setting
    getLocalGovCodes().then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['locgovNm'],
            value: code['locgovCd'],
          }

          locgovCodes.push(item)
        })
      }
      setLocalGovCode(locgovCodes)
    })
  }, [])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (selectedRow !== undefined) {
      fetchhistoryData()
    }
  }, [historyflag])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      if (params.ctpvCd && params.locgovCd) {
        fetchData()
      }
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setLoading(true)
    setExcelFlag(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/osi/tr/opratStopInfo?page=${params.page}&size=${params.size}` +
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
    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try{
      setLoadingBackdrop(true)

    let endpoint: string =
      `/fsm/stn/osi/tr/getExcelOpratStopInfo?` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      await  getExcelFile(
      endpoint,
      '' + BCrumb[BCrumb.length - 1].title + getToday() + '.xlsx',
    )
  }catch(error){
    console.error("ERROR :: ", error)
  }finally{
    setLoadingBackdrop(false)
  }
}


  const excelHisDownload = async () => {
    if (selectedRow == undefined) {
      alert('선택된 행이 없습니다.')
      return
    }
    let endpoint: string =
      `/fsm/stn/osi/tr/getExcelOpratStopHst?` +
      `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
      `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}`
    try{
      setLoadingBackdrop(true)
      await  getExcelFile(
        endpoint,
        '' + BCrumb[BCrumb.length - 1].title + '상세' + getToday() + '.xlsx',
      )
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
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
        `/fsm/stn/osi/tr/opratStopHst?` +
        `${selectedRow.locgovCd ? 'locgovCd=' + selectedRow.locgovCd : ''}` +
        `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}`


      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setHistoryRows(response.data.content)
      } else {
        setHistoryRows([])
      }
    } catch (error) {
      // 에러시
      setHistoryRows([])
      console.error('Error fetching data:', error)
    } finally {
      setHistoryLoading(false)
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row) => {
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
    if (!params.ctpvCd) {
      alert('시도를 선택해주세요.')
      return
    }

    if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return
    }
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
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
        setParams((prev) => ({ ...prev, page: 1, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
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
    <PageContainer title="화물 운행정지 정보" description="차량휴지관리 페이지">
      {/* breadcrumb */}
      <Breadcrumb title="화물 운행정지 정보" items={BCrumb} />
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
          <LoadingBackdrop open={loadingBackdrop} />
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
          headCells={stnosiheadCells}
          rows={rows} // 목록 데이터
          customHeader={CustomHeader}
          selectedRowIndex={selectedIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"화물-운행정지정보 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <>
        {selectedRow ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                onClick={() => excelHisDownload()}
                variant="contained"
                color="success"
              >
                엑셀
              </Button>
            </Box>
            <BlankCard title="운행정지정보 이력">
            <TableDataGrid
              headCells={hisstnosiheadCells}
              customHeader={HisCustomHeader}
              rows={historyRows} // 목록 데이터
              totalRows={historyTotalRows} // 총 로우 수
              loading={historyLoading} // 로딩여부
              onRowClick={() => {}} // 행 클릭 핸들러 추가
              paging={false}
              caption={"운행정지정보 이력 조회"}
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
