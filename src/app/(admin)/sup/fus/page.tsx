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
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
import { getCityCodes, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import { SelectItem } from 'select'
import { getExcelFile, getToday,getDateRange } from '@/utils/fsms/common/comm'

import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint
} from '@/utils/fsms/common/convert'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '예산관리',
  },
  {
    to: '/sup/fus',
    title: '유가보조금통합조회',
  },
]

const headCells: HeadCell[] = [
    
  {
      id: 'crtrYm',
      numeric: false,
      disablePadding: false,
      label: '기준년월',
      format: 'yyyymm',
  },
  {
      id: 'bgtFrmtAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '예산액',
  },
  {
      id: 'bgtRt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      label: '안분비율',
  },
  {
      id: 'anlrveAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '월세입액',
  },
  {
      id: 'sumPayAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '연 누적집행금액',
  },
  {
      id: 'payAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '월 집행금액',
  },
  {
      id: 'txCardAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '택시카드',
  },
  {
      id: 'txPaperAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '택시서면',
  },
  {
      id: 'bsCardAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '버스카드',
  },
  {
      id: 'bsPaperAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '버스서면',
  },
  {
      id: 'frCardAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '화물카드',
  },
  {
      id: 'frPaperAmt',
      numeric: false,
      disablePadding: false,
      align: 'td-right',
      format: 'number',
      label: '화물서면',
  },
]
  const customHeader = (): React.ReactNode => {
    return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2}> 기준년월  </TableCell>
        <TableCell colSpan={2}>연간</TableCell> {/* 연간 집계 */}
        <TableCell rowSpan={2}>월세입액</TableCell>
        <TableCell colSpan={2}>지자체 집행금액</TableCell> {/* 지자체 집행 */}
        <TableCell colSpan={6}>집행상세내역</TableCell> {/* 집행상세 */}
      </TableRow>
      <TableRow>
        {/* 하위 열 정의 */}
        <TableCell>예산액</TableCell>
        <TableCell>안분비율</TableCell>
        <TableCell>연 누적집행금액 </TableCell>
        <TableCell>월 집행금액</TableCell>
        <TableCell>택시카드</TableCell>
        <TableCell>택시서면</TableCell>
        <TableCell>버스카드</TableCell>
        <TableCell>버스서면</TableCell>
        <TableCell>화물카드</TableCell>
        <TableCell>화물서면</TableCell>
      </TableRow>
    </TableHead>
    )
  }

export interface Row {
  // 기존 속성

  // 새로 추가된 속성
  bgngDt?: string; // 기준시작일
  endDt?: string; // 기준종료일
  ctpvCd?: string; // 시도코드
  locgovCd?: string; // 관할관청코드

  crtrYm?: string; // 기준년월
  bgtFrmtAmt?: number; // 예산액
  bgtRt?: string; // 안분비율
  anlrveAmt?: number; // 월세입액
  sumPayAmt?: number; // 연누적집행금액
  payAmt?: number; // 월집행금액
  txCardAmt?: number; // 택시카드
  txPaperAmt?: number; // 택시서면
  bsCardAmt?: number; // 버스카드
  bsPaperAmt?: number; // 버스서면
  frCardAmt?: number; // 화물카드
  frPaperAmt?: number; // 화물서면
}

const rowData: Row[] = [

]

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
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? '') ?? '', // 시작일
    endDt: String(allParams.endDt ?? '') ?? '', // 종료일
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
    if ((params.ctpvCd || params.locgovCd) && params.bgngDt && params.endDt) {
      fetchData()
    }
  }, [flag])

     // 초기 데이터 로드
     useEffect(() => {
  
      setFlag(!flag)
      const dateRange = getDateRange('d', 30);
  
      let startDate = dateRange.startDate;
      let endDate = dateRange.endDate;
  

      setParams((prev) => ({...prev, 
        bgngDt: startDate.substring(0,7),
        endDt: endDate.substring(0,7),
      }))
    }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if(!params.ctpvCd) {
      alert("시도명을 선택해주세요.");
      return;
    }

    if( !params.locgovCd) {
      alert("관할관청을 선택해주세요.");
      return;
    }
    if(!params.bgngDt) {
      alert("기준년월을 선택해주세요.");
      return;
    }

    if( !params.endDt) {
      alert("기준년월을 선택해주세요.");
      return;
    }


    setExcelFlag(true)
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/fus/cm/getAllFsmUtSearch?page=${params.page}&size=${params.size}` +
        `${params.bgngDt ? '&bgngDt=' + (params.bgngDt +'').replace('-','') as string : ''}` +
        `${params.endDt ? '&endDt=' + (params.endDt +'').replace('-','') as string: ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}`


        console.log(endpoint)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {

        console.log(response.data)
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
      setRows(rowData)
      setTotalRows(rowData.length)
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
      return;
    }

    try{
      setLoadingBackdrop(true)
    let endpoint: string =
    `/fsm/sup/fus/cm/getExcelFsmUtSearch?` +
        `${params.bgngDt ? '&bgngDt=' + (params.bgngDt +'').replace('-','') as string : ''}` +
        `${params.endDt ? '&endDt=' + (params.endDt +'').replace('-','') as string: ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}`

    await  getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
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
      page: page ,
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




  const handleExcelDown = () => {
    excelDownload()
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField =
        name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate as string)) {
        setParams((prev) => ({ ...prev, [name]: value }))
        setExcelFlag(false)
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
      setExcelFlag(false)
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
    <PageContainer title="유가보조금통합조회" description="유가보조금통합조회">
      {/* breadcrumb */}
      <Breadcrumb title="유가보조금통합조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                <span className="required-text" >*</span>기준년월
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">거래년월 시작</CustomFormLabel>
              <CustomTextField  type="month" id="ft-date-start" name="bgngDt" value={params.bgngDt} onChange={handleSearchChange} fullWidth />
              ~ 
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">거래년월 종료</CustomFormLabel>
              <CustomTextField type="month" id="ft-date-end" name="endDt" value={params.endDt} onChange={handleSearchChange} fullWidth />
            </div>

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
                  htmlFor="sch-locgov"
                >
                  <span className="required-text">*</span>관할관청
                </CustomFormLabel>
                <LocgovSelect
                  ctpvCd={params.ctpvCd}
                  pValue={params.locgovCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-locgov'}
                />
              </div>

    
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button onClick={() => fetchData()} variant="contained" color="primary">
            검색
            </Button>
            <Button variant="contained"  onClick={handleExcelDown} color="success">
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          rows={rows} // 목록 데이터
          customHeader={customHeader}
          headCells={headCells} // 테이블 헤더
          totalRows={totalRows} // 총 로우 수
          pageable={pageable} // 페이지 정보
          loading={loading} // 로딩여부
          onRowClick={() =>{}} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          paging={true} // 페이징 여부
          cursor={false} // 커서 포인터 여부
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* <Box className="table-bottom-button-group">
          <div className="button-right-align">
              <Button variant="contained" color="primary"
              onClick={handleWriteClick}
              >
                등록
              </Button>
          </div>
      </Box> */}
    </PageContainer>
  )
}

export default DataList
