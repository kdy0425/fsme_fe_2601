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
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getDateRange,
  getExcelFile,
  getToday,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'

// 헤더셀
import { calTxcsrBrnoHC } from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 공통코드용 추가
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
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
    to: '/cal/txlsr',
    title: '사업자별 청구내역',
  },
]

export interface Row {
  clclnYm?: string // 청구년월
  crdcoNm?: string // 카드사명
  locgovNm?: string // 지자체명
  flnm?: string // 대표자명
  brno?: string // 사업자등록번호
  vhclNo?: string // 차량번호
  bzmnSeNm?: string // 면허구분명
  koiNm?: string // 유종명
  gnrlDlngNocs?: string // 정상매출건수
  gnrlUseLiter?: string // 정상국토부사용량
  gnrlSlsAmt?: string // 정상매출금액
  gnrlIndvBrdnAmt?: string // 정상개인부담금
  gnrlMoliatAsstAmt?: string // 정상국토부보조금
  rtrcnDlngNocs?: string // 취소매출건수
  rtrcnUseLiter?: string // 취소국토부사용량
  rtrcnSlsAmt?: string // 취소매출금액
  rtrcnIndvClmAmt?: string // 취소개인부담금
  rtrcnMoliatAsstAmt?: string // 취소국토부보조금
  usageUnit?: string // 사용단위
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          청구년월
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          카드사
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          지자체
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          대표자명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사업자등록번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          면허업종
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          유종
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
          정상거래
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
          취소거래
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>매출건수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>매출금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>개인부담금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>국토부사용량</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>국토부보조금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>단위</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>매출건수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>매출금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>개인부담금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>국토부사용량</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>국토부보조금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>단위</TableCell>
      </TableRow>
    </TableHead>
  )
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != undefined) {
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
  }, [])

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
    try {
      if (!params.locgovCd) {
        alert('지자체를 선택해주세요.')
        return
      }

      if (!params.searchStDate || !params.searchEdDate) {
        alert('청구년월을 입력해주세요.')
        return
      }

      if (params.searchStDate > params.searchEdDate) {
        alert('시작일자가 종료일자보다 클 수 없습니다.')
        return
      }

      if (!diffDate(params.searchStDate, params.searchEdDate, 1)) {
        alert("1개월 초과 데이터는 조회가 불가능합니다.")
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/txlsr/tx/getAllBsnmSbsidyRqest?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&clclnLocgovCd=' + params.locgovCd : ''}` +
        `${params.searchStDate ? '&bgngDt=' + formatDate(params.searchStDate) : ''}` +
        `${params.searchEdDate ? '&endDt=' + formatDate(params.searchEdDate) : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}`

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
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/txlsr/tx/getExcelAllBsnmSbsidyRqest?page=0&size=9999` +
      `${params.locgovCd ? '&clclnLocgovCd=' + params.locgovCd : ''}` +
      `${params.searchStDate ? '&bgngDt=' + formatDate(params.searchStDate) : ''}` +
      `${params.searchEdDate ? '&endDt=' + formatDate(params.searchEdDate) : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}`

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
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <PageContainer
      title="사업자별 청구내역 집계현황"
      description="사업자별 청구내역 집계현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="사업자별 청구내역 집계현황" items={BCrumb} />
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
                청구년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                청구년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              <span>~</span>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                청구년월
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
                htmlFor="sch-crdcoCd"
              >
                카드사구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CCGC" // 필수 O, 가져올 코드 그룹명
                pValue={params.crdcoCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="crdcoCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-crdcoCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">사업자등록번호</CustomFormLabel>
              <CustomTextField 
                type="number"
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
                inputProps={{maxLength: 10, type: 'number'}}
                onInput={(e:{
                  target: { value: string; maxLength: number| undefined }
                }) => {
                  e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, e.target.maxLength)
                }}
                placeholder="숫자만 입력 가능합니다."
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
                cdGroupNm="KOI3" // 필수 O, 가져올 코드 그룹명
                pValue={params.koiCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="koiCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-koiCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
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
          customHeader={customHeader}
          headCells={calTxcsrBrnoHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={() => {}} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          caption={"사업자별청구집계현황 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
