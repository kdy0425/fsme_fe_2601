'use client'
import {
  Box,
  Button,
  FormControlLabel,
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'

import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { getExcelFile, getToday, getDateRange } from '@/utils/fsms/common/comm'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import {getFormatToday} from '@/utils/fsms/common/dateUtils'
import { ilpFliDelngMonsTrHc } from '@/utils/fsms/ilp/headCells'
import { isNumber } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '주유정보',
  },
  {
    to: '/ilp/fli',
    title: '화물주유정보',
  },
]

export interface Row {
  vhclNo: string
  aprvYmd: string
  vonrNm: string
  koiCdNm: string
  vhclTonCdNm: string
  brno: string
  vonrBrno : string
  locgovNm: string
  aprvAmt: string
  useLiter: string
  asstAmt: string
  opisAmt: string
  ftxAsstAmt: string
  asstAmtLiter: string
  rtroactYn: string
  chk: string
  retroactResult: string
  prcsSeCd: string
  aprvRtrcnYn: string
  vonrRrno: string
  locgovCd: string
  crdcoCdNm: string
  cardNo: string
  cardNoS: string
  cardNoSecure: string
  crdcoCd: string
  aprvTm: string
  aprvYmdTm: string
  aprvNo: string
  aprvYn: string
  stlmYn: string
  unsetlLiter: string
  unsetlAmt: string
  frcsNm: string
  frcsCdNo: string
  cardSeCdNm: string
  cardSeCd: string
  cardSttsCdNm: string
  stlmCardNo: string
  stlmCardNoS: string
  stlmAprvNo: string
  ceckStlmYn: string
  origTrauTm: string
  origTrauYmdTm: string
  asstAmtCmpttnSeNm: string
  trsmYn: string
  regDt: string
  subGb: string
  colorGb: string
  lbrctYmd: string
  stlmCardAprvYmd: string
  stlmCardAprvTm: string
  stlmCardAprvYmdTm: string
  stlmCardAprvNo: string
  orgAprvAmt: string
  aprvGb: string
  color: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  brno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {

  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    brno: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const [pageable2, setPageable2] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [chk, setChk] = useState<boolean>(false); // 취소포함 flag
  const [excelFlag, setExcelFlag] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      setSelectedIndex(-1)
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {

    const dataRange = getDateRange('m', 1);

    let startDate = dataRange.startDate;
    let endDate = dataRange.endDate;

    setParams((prev) => ({...prev, 
      searchStDate: startDate,
      searchEdDate: endDate
    }))
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if(!params.vhclNo && !params.brno.replaceAll('-', '')) {
      alert("차량번호 또는 사업자등록번호 중 1개 항목은 필수 입력해주세요");
      return;
    }

    try {
      setLoading(true)
      
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/ilp/fli/tr/getAllDelngMons?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno.replaceAll('-', '') : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`+
        `${params.cardNo ? '&cardNo=' + params.cardNo : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}`

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
      } else if(response.resultType === 'fail'){
        alert(response.message);
      } else{
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
    setLoadingBackdrop(true)
    try{

      let endpoint: string = 
        `/ilp/fli/tr/getExcelDelngMons?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno.replaceAll('-', '') : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`+
        `${params.cardNo ? '&cardNo=' + params.cardNo : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}`
      await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
    }catch(error){
      console.error('Error : excelDownload', error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

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
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
  }
  
  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    
    if(name == 'vhclNo'){
      setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))  
    }else if(name =='cardNo' || name == 'brno'){
      if(isNumber(value)){
        setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))  
      }
    }else{
      setParams((prev) => ({ ...prev, [name]: value }))  
    }

    // 엑셀구분 선택시에는 엑셀플래그 변경하지 않음
    if(name != 'excelType'){
      setExcelFlag(false)
    }
  }

  useEffect(() => {
    if(chk) {
      setParams((prev) => ({...prev, chk: "01"}))
    }else {
      setParams((prev) => ({...prev, chk: ""}))
    }
  }, [chk])

  return (
    <PageContainer title="화물거래내역" description="화물거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="화물거래내역" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                거래년월
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="sch-date-start">주유월 종료연월</CustomFormLabel>
              <CustomTextField type="month" id="sch-date-start" name="searchStDate" value={params.searchStDate} onChange={handleSearchChange} 
              inputProps={{
                max: getFormatToday(),
              }} fullWidth />
              ~              
              <CustomFormLabel className="input-label-none" htmlFor="sch-date-end">주유월 종료연월</CustomFormLabel>
              <CustomTextField type="month" id="sch-date-end" name="searchEdDate" value={params.searchEdDate} onChange={handleSearchChange} 
              inputProps={{
                min: params.searchStDate,
                max: getFormatToday(),
                }}fullWidth />
            </div>

            <div className="form-group" style={{ maxWidth: '6rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="chk"
                    value={params.chk}
                    onChange={() => setChk(!chk)}
                  />
                }
                label="취소포함"
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
                type="text"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 9
                }}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
                required
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                type="text"
                value={params.brno}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 10
                }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdcoCd"
              >
                카드사
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='023'                   
                pValue={params.crdcoCd}          
                handleChange={handleSearchChange} 
                pName='crdcoCd'                                      
                htmlFor={'sch-crdcoCd'}           
                addText='전체'                
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardSeCd"
              >
                카드구분
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='974'                   
                pValue={params.cardSeCd}          
                handleChange={handleSearchChange} 
                pName='cardSeCd'                                      
                htmlFor={'sch-cardSeCd'}           
                addText='전체'                
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cardNo"
              >
                카드번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-cardNo"
                name="cardNo"
                type="text"
                value={params.cardNo}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 20
                }}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" 
            type="submit">
              검색
            </Button>
            {/* <Button variant="contained" color="success" onClick={() => excelDownload()}> */}
            <Button variant="contained" color="success" onClick={() => excelDownload()}>
              엑셀
            </Button>
          </div>
        </Box>
        
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilpFliDelngMonsTrHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          cursor
          caption={"화물주유내역 조회 목록"}
        />
      </Box>
       {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
