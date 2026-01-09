'use client'
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { drliInfoHeadCells, hisDrliHeadCells } from '@/utils/fsms/headCells'
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
    to: '/stn/di',
    title: '운전면허정보',
  },
]

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
          차량정보
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
          운전자정보
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
          운전면허정보
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>주민등록번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>소유자명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>소유구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량등록일자</TableCell>

        <TableCell style={{ whiteSpace: 'nowrap' }}>운전자명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>주민등록번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계약시작일</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>계약종료일</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>연락처</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>운전자등록일자</TableCell>

        <TableCell style={{ whiteSpace: 'nowrap' }}>면허보유여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>정지시작일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>정지종료일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>취소일자</TableCell>
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
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={8}>
          운전면허정보 이력
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>순번</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>주민등록번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>면허보유여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>정지시작일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>정지종료일자</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>취소일자</TableCell>
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
  vonrRrno?: string // 주민등록번호(원본)
  vonrRrnoSecure?: string // 주민등록번호(별표)
  knpaVonrRrno?: string
  knpaVonrRrnoS?: string
  vonrNm?: string // 소유자명
  vhclPsnNm: string // 소유구분
  vhclSttsCdNm?: string // 차량상태
  carRegDt?: string // 차량등록일자
  driverVonrNm?: string // 운전자명
  driverVonrRrno?: string // 운전자주민등록번호(원본)
  driverVonrRrnoSecure?: string // 운전자주민등록번호(별표)
  ctrtBgngYmd?: string // 계약시작일
  ctrtEndYmd?: string // 계약종료일
  telno?: string // 연락처
  driverRegDt?: string // 운전자등록일자
  psnSeCdNm?: string // 면허보유여부
  stopBgngYmd?: string // 정지시작일자
  stopEndYmd?: string // 정지종료일자
  rtrcnYmd?: string // 취소일자
  knpaRgtrId?: string // 등록자아이디
  knpaRegDt?: string // 등록일자
  knpaMdfrId?: string // 수정자아이디
  knpaMdfcnDt?: string // 수정일자
  hstrySn?: string // 순번
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [historyLoading, setHistoryLoading] = useState(false) // 로딩여부

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [historyRows, setHistoryRows] = useState<Row[]>([]) // 거래내역에 대한 Row
  const [historyTotalRows, setHistoryTotalRows] = useState(0) // 총 수

    const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  

  const [detailParams, setDetailParams] = useState({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

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

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
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

    
  // 조건 검색 변환 매칭
  const sortChange = (sort: String): String => {
    if (sort && sort != '') {
      let [field, sortOrder] = sort.split(',') // field와 sortOrder 분리하여 매칭
      if (field === 'regYmd') field = 'regDt' // DB -> regDt // DTO -> regYmd ==> 매칭 작업
      return field + ',' + sortOrder
    }
    return ''
  }

  const userInfo = getUserInfo();

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if((userInfo.roles[0]) == 'LOGV') {   // 지자체 권한일때만 시도 및 관할관청 체크
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
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/di/tr/drliInfo?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
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
        `/fsm/stn/di/tr/getExcelDrliInfoTr?page=${detailParams.page}&size=${detailParams.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}`

        await  getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
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
        `/fsm/stn/di/tr/drliHst?` +
        `${selectedRow.driverVonrRrno ? '&vonrRrno=' + selectedRow.driverVonrRrno : selectedRow.vonrRrno}`


      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
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
      `/fsm/stn/di/tr/getExcelDrliHstTr?` +
      `${selectedRow.driverVonrRrno ? '&vonrRrno=' + selectedRow.driverVonrRrno : selectedRow.vonrRrno}`
    try{
      setLoadingBackdrop(true)
      await  getExcelFile(
            endpoint,
            BCrumb[BCrumb.length - 1].title + '_이력' + getToday() + '.xlsx',
      )
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
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

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd || params.locgovCd) {
      fetchData()
    }
  }, [flag])

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
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
    <PageContainer title="화물 운전면허정보" description="차량휴지관리 페이지">
      {/* breadcrumb */}
      <Breadcrumb title="화물 운전면허정보" items={BCrumb} />
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
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vonrRrno"
              >
                주민등록번호
              </CustomFormLabel>
              <CustomTextField
                name="vonrRrno"
                value={params.vonrRrno ?? ''}
                onChange={handleSearchChange}
                type="text"
                id="ft-vonrRrno"
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
        <TableDataGrid
          headCells={drliInfoHeadCells}
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
          caption={"화물-운전면허정보 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {/* 상세 영역 시작 */}
      <>
        {selectedRow ? (
          <>
            <BlankCard title="운전면허정보 이력"
            className="contents-card" 
            buttons={[
              {
                label: '엑셀',
                onClick: () => { excelHisDownload() },
                color: 'success'
              }
            ]}
            >
              <TableDataGrid
                headCells={hisDrliHeadCells}
                customHeader={hisCustomHeader}
                rows={historyRows} // 목록 데이터
                totalRows={historyTotalRows} // 총 로우 수
                loading={historyLoading} // 로딩여부
                onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={handleDetailPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={detailPageable} // 현재 페이지 / 사이즈 정보
                paging={true}
                caption={"운전면허정보 이력 목록 조회"}
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
