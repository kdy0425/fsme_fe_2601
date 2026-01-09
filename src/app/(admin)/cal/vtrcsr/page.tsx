'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { calVtrcsrVhclTrHeadCells } from '@/utils/fsms/headCells'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '보조금청구',
  },
  {
    title: '화물청구',
  },
  {
    to: '/cal/vtrcsr',
    title: '차량별 청구내역',
  },
]

export interface Row {
  vhclNo?: string // 차량번호
  vonrNm?: string // 소유자명
  vonrBrno?: string // 사업자등록번호
  slsNocs?: string // 매출건
  slsAmt?: string // 매출액
  indvClmAmt?: string // 개인청구
  asstAmt?: string // 정부지원
  useLiter?: string // 사용리터
  asstAmtLiter?: string // 보조리터
  koiCdNm?: string // 유종
  vhclTonCdNm?: string // 톤수
  vhclPsnCdNm?: string // 비고
  crdcoCdNm?: string // 카드사
  locgovNm?: string // 관할관청
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

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
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
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    brno: '',
    vhclNo: '',
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
    if(flag != null){
      fetchData()  
    }
  }, [flag])

  // 초기 데이터 로드 후 관할관청 변경 시점에 검색
  useEffect(() => {
    // 시도/관할관청 값이 없을땐 조회하지 않음
    if(params.ctpvCd !== undefined || params.locgovCd !== undefined){
      setFlag(prev => !prev)
    }
  }, [params.locgovCd])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('m', 1);
    let startDate = dateRange.startDate;
    let endDate = dateRange.endDate;
    setParams((prev) => ({ ...prev, searchStDate: startDate, searchEdDate: endDate }))
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    setRows([])
    setTotalRows(0)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/vtrcsr/tr/getAllByveSbsidyRqest?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&clclnStartYm=' + params.searchStDate.replaceAll("-", "") : ''}` +
        `${params.searchEdDate ? '&clclnEndYm=' + params.searchEdDate.replaceAll("-", "") : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` + 
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` + 
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
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
          `/fsm/cal/vtrcsr/tr/getExcelByveSbsidyRqest?`+
          `${params.searchStDate ? '&clclnStartYm=' + params.searchStDate.replaceAll("-", "") : ''}` +
          `${params.searchEdDate ? '&clclnEndYm=' + params.searchEdDate.replaceAll("-", "") : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
          `${params.brno ? '&brno=' + params.brno : ''}` + 
          `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` + 
          `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
          `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`
      
      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + "_" + getToday() + ".xlsx")
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
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }
  
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  return (
    <PageContainer
      title="차량별 청구내역 집계현황"
      description="차량별 청구내역 집계현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="차량별 청구내역 집계현황" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv" required>
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov" required>
                관할관청
              </CustomFormLabel>              
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                청구년월
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">
                청구년월
              </CustomFormLabel>
              <CustomTextField type="month" id="ft-date-start" name="searchStDate" value={params.searchStDate} onChange={handleSearchChange} inputProps={{max: params.searchEdDate}} fullWidth />
              <span>~</span>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">
                청구년월
              </CustomFormLabel>
              <CustomTextField type="month" id="ft-date-end" name="searchEdDate" value={params.searchEdDate} onChange={handleSearchChange} inputProps={{min: params.searchStDate}} fullWidth />
            </div>
        </div><hr></hr>
        <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-crdcoCd" required>
                카드사
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='023'
                pValue={params.crdcoCd}
                handleChange={handleSearchChange}
                pName='crdcoCd'
                htmlFor={'sch-crdcoCd'}
                addText='- 전체 -'
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-koiCd" required>
                유종
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='977'
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName='koiCd'
                htmlFor={'sch-koiCd'}
                addText='- 전체 -'
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField 
                id="ft-brno" 
                name='brno' 
                value={params.brno} 
                onChange={handleSearchChange} 
                fullWidth 
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange} 
                inputProps={{
                  inputMode: 'text',
                  maxLength: 50,
                }}
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
            <Button onClick={() => excelDownload()} variant="contained" color="success">
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid 
            headCells={calVtrcsrVhclTrHeadCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={() => {}} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지, 사이즈 변경 핸들러
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            caption={"차량별 청구내역 집계 현황 목록"}
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
