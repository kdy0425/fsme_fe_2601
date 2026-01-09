'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid' //custom 사용을 위한 ilp 공통

import { isddHC } from '@/utils/fsms/ilp/headCells'

// types
import { Pageable2 } from 'table'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { getDateRange } from '@/utils/fsms/common/util'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '부정수급관리',
  },
  {
    to: '/ilp/isdd',
    title: '부정수급자 거래내역',
  },
]

export interface Row {
  exmnNo: string;
	locgovCd: string;
	vhclNo: string;
	dlngYmd: string;
	dlngTm: string;
	AprvAmt: string;
	asstAmt: string;
	fuelQty: string;
	frcsNm: string;
	pttrnSeCd: string;
	pttrnSeNm: string;
  fileList: []
 
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  bgngDt: string
  endDt: string
  pttrnSeCd: string
  vhclNo : string
  aprvAmtEq : string;       // 금액
  aprvAmtOp: string;
	fuelQtyEq : string;       // 리터
  fuelQtyOp: string; 
	dlngNocsEq : string;      // 주유횟수
  freqOp: string;
	freqDays : string;        // 빈도 
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
 const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd:         '', // 시도
    locgovCd:       '', // 지자체
    bgngDt:         '', // 시작일
    endDt:          '', // 종료일
    pttrnSeCd:      '', // 패턴구분
    vhclNo:         '', // 차량번호
    aprvAmtEq:      '', // 금액
    aprvAmtOp:      'GE',   // 기본값을 GE로
	  fuelQtyEq:      '', // 리터
    fuelQtyOp:      '',
	  dlngNocsEq:     '', // 주유횟수
	  freqDays:       '', // 빈도
    freqOp:     ''
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
  }, [])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('month', 30)

    const startDate = dateRange.startDate
    const endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    setSelectedRowIndex(-1)
    setLoading(true)
    setExcelFlag(true) //엑셀기능 동작여부
    
    try {
      // 검색 조건에 맞는 endpoint 생성  
      let endpoint: string =
        `/ilp/isdd/bs/getInstcSpldmdDoubtDlng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.pttrnSeCd ? '&pttrnSeCd=' + params.pttrnSeCd : ''}` +
        `${params.aprvAmtOp ? '&aprvAmtOp=' + params.aprvAmtOp : ''}` +     
        `${params.aprvAmtEq ? '&aprvAmtEq=' + params.aprvAmtEq.replaceAll(',', '') : ''}` +
        `${params.fuelQtyOp ? '&fuelQtyOp=' + params.fuelQtyOp : ''}` + 
        `${params.fuelQtyEq ? '&fuelQtyEq=' + params.fuelQtyEq.replaceAll(',', '') : ''}` +
        `${params.dlngNocsEq ? '&dlngNocsEq=' + params.dlngNocsEq.replaceAll(',', '') : ''}` +
        `${params.freqOp ? '&freqOp=' + params.freqOp : ''}` + 
        `${params.freqDays ? '&freqDays=' + params.freqDays.replaceAll(',', '') : ''}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

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
        `/ilp/isdd/bs/getExcelInstcSpldmdDoubtDlng?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.pttrnSeCd ? '&pttrnSeCd=' + params.pttrnSeCd : ''}` +
        `${params.aprvAmtOp ? '&aprvAmtOp=' + params.aprvAmtOp : ''}` +     
        `${params.aprvAmtEq ? '&aprvAmtEq=' + params.aprvAmtEq.replaceAll(',', '') : ''}` +
        `${params.fuelQtyOp ? '&fuelQtyOp=' + params.fuelQtyOp : ''}` + 
        `${params.fuelQtyEq ? '&fuelQtyEq=' + params.fuelQtyEq.replaceAll(',', '') : ''}` +
        `${params.dlngNocsEq ? '&dlngNocsEq=' + params.dlngNocsEq.replaceAll(',', '') : ''}` +
        `${params.freqOp ? '&freqOp=' + params.freqOp : ''}` + 
        `${params.freqDays ? '&freqDays=' + params.freqDays.replaceAll(',', '') : ''}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
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
      page: page,
      size: pageSize,
    }))
    setFlag(!flag)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  return (
    <PageContainer title="화물 운전자 자격정보" description="화물 운전자 자격정보">
      {/* breadcrumb */}
      <Breadcrumb title="화물 운전자 자격정보" items={BCrumb} />
      <Box>
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
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-vhclNo"
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
                <CustomFormLabel className="input-label-display" required>
                  거래년월
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  거래년월 시작
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
                  거래년월 종료
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
            <hr></hr>
            <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-aprvAmtEq"
                  >
                    승인금액
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-aprvAmtEq"
                    name="aprvAmtEq"
                    value={params.aprvAmtEq}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                  <CommSelect
                    cdGroupNm="ISDDOPT"
                    pValue={params.aprvAmtOp || 'GE'}   // ← 값이 비어도 GE 표시
                    handleChange={handleSearchChange}
                    pName="aprvAmtOp"
                    htmlFor={'ft-aprvAmtEq'}
                    width="80px"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fuelQtyEq"
                  >
                    주유량
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fuelQtyEq"
                    name="fuelQtyEq"
                    value={params.fuelQtyEq}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                  <CommSelect
                    cdGroupNm="ISDDOPT"
                    pValue={params.fuelQtyOp || 'GE'}   // ← 값이 비어도 GE 표시
                    handleChange={handleSearchChange}
                    pName="fuelQtyOp"
                    htmlFor={'ft-fuelQtyEq'}
                    width="80px"
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    일일주유횟수
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-dlngNocsEq"
                    name="dlngNocsEq"
                    value={params.dlngNocsEq}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-freqOp"
                  >
                    빈도
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-freqDays"
                    name="freqDays"
                    value={params.freqDays}
                    onChange={handleSearchChange}
                    disabled={!params.dlngNocsEq}
                    fullWidth
                  />
                  <CommSelect
                    cdGroupNm="ISDDOPT"
                    pValue={params.freqOp || 'GE'}   // ← 값이 비어도 GE 표시
                    handleChange={handleSearchChange}
                    pName="freqOp"
                    htmlFor={'ft-freqOp'}
                    width="80px"
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
        {/* 검색영역 끝 */}

        {/* 테이블영역 시작 */}
        <Box>
          <TableDataGrid
            headCells={isddHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            selectedRowIndex={selectedRowIndex}
            caption={'부정수급자 거래내역 목록 조회'}
          />
        </Box>
        {/* 테이블영역 끝 */}
      </Box>
    </PageContainer>
  )
}

export default DataList
