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
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import { getCityCodes, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import DetailReportDataGrid from './_components/DetailReportDataGrid'
import BrnoDetailDataGrid from './_components/DetailScrcarCarDataGrid'
import DetailScrcarCarDataGrid from './_components/DetailScrcarCarDataGrid'
import DetailRentalDataGrid from './_components/DetailRentalDataGrid'
// import ModalContent from './_components/ModalContent'
import { getCommCd, getCtpvCd, getExcelFile, getLocGovCd, getToday , getDateRange, openReport} from '@/utils/fsms/common/comm'
// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 헤더셀
import {stnrsRoscSttemntTrHc} from '@/utils/fsms/headCells'
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
    to: '/stn/rs',
    title: '대폐차신고정보',
  },
]


/**
 *   {
        "koiCd": 경유 / LPG
        "cityName": "서울"
        "crtrAplcnYmd": "20090601",
        "crtrPrice": "1,500,00",
        "status": "전송" 
    }
 * 
 */

    export interface Row {
      locgovCd?: string; // 시도명+관할관청
      vhclNo?: string; // 차량번호
      bgngAplcnYmd?: string; // 시작일자
      endAplcnYmd?: string; // 종료일자
      flnm?: string; // 성명
      rprNo?: string  // 수리번호 
      rprCd?: string // 수리코드

      //vhclNo?: string; // 차량번호
      vin?: string; // 차대번호
      //flnm?: string; // 성명
      crno?: string; // 법인등록번호(원본)
      crnoS?: string; // 법인등록번호(복호화)
      partAddr?: string; // 주소
      part1Addr?: string; // 부분1주소
      part2Addr?: string; // 부분2주소
      zip?: string; // 우편번호
      telno?: string; // 전화번호
      bizKndCdNm?: string; // 사업종류
      carmdlCdNm?: string; // 차종
      typeCdNm?: string; // 유형
      detailTypeCdNm?: string; // 세부유형명
      vhclCdNm?: string; // 차량코드명
      vhclDtlCdNm?: string; // 차량상세코드명
      yridnw?: string; // 연식
      maxLoadQty?: string; // 최대적재수량
      scrcarTotlWt?: string; // 총중량
      frstDclrYmd?: string; // 최초신고일자
      acceptCdNm?: string; // 수리코드명
      rprDt?: string; // 수리일시
      //rprNo?: string; // 수리번호
      acceptYn?: string; // 수리 여부
      frstRptpEndYmd?: string; // 최초보고서종료일자
      rgtrId?: string; // 등록자아이디
      regDt?: string; // 등록일자
      mdfrId?: string; // 수정자아이디
      mdfcnDt?: string; // 수정일자
      locgovNm?: string; // 지자체명
      histCnt?: string; // 순번
      scrapPeriodYmd?: string; // 대폐차기간
      vhclNm?: string; // 차량명
      vonrBrno?: string; // 차주사업자등록번호
      cosiNm?: string; // 위수탁명

      scrcarCarmdlCd?: string; // 폐차차종코드
      scrcarCarmdlCdNm?: string; // 폐차차종코드명
      scrcarTypeCd?: string; // 폐차유형코드
      scrcarTypeCdNm?: string; // 폐차유형코드명
      scrcarDetailTypeCd?: string; // 폐차세부유형코드
      scrcarDetailTypeCdNm?: string; // 폐차세부유형코드명
      scrcarVhclCd?: string; // 폐차차량코드
      scrcarVhclCdNm?: string; // 폐차차량코드명
      scrcarVhclDtlCd?: string; // 폐차차량상세코드
      scrcarVhclDtlCdNm?: string; // 폐차차량상세코드명
      scrcarVhclNm?: string; // 폐차차량명
      scrcarVin?: string; // 폐차차대번호
      scrcarYridnw?: string; // 폐차연식
      scrcarMaxLoadQty?: string; // 폐차최대적재수량
      scrcarScrcarTotlWt?: string; // 폐차 총중량

      totlWt?: string;
      bgngEndYmd?: string;
      scrapGbNmDtl?: string;
      scrapGbNm?:string;
      scrapGb?:string;
      hCarmdlCdNm?: string;
      hTypeCdNm?: string;
      hDetailTypeCdNm?: string;
      hVhclCdNm?: string;
      hVhclDtlCdNm?: string;
      hScrcarVhclNm?: string;
      hScrcarYridnw?: string;
      hScrcarMaxLoadQty?: string;
      hScrcarScrcarTotlWt?: string
      hScrcarVin?: string;
      assoNm?: string;
      today?: string;
    }
    

const rowData: Row[] = [

]

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

// // 조회하여 가져온 정보를 Table에 넘기는 객체
// type pageable = {
//   pageNumber: number
//   pageSize: number
//   sort: string
// }

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row | null>(null);  // 선택된 Row를 저장할 state
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [cityCode, setCityCode] = useState<SelectItem[]>([])          //        시도 코드
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([])  // 관할관청 코드
  const [excelFlag, setExcelFlag] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
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
    if(flag != undefined){
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
   // 초기 데이터 로드
   useEffect(() => {

    const dateRange = getDateRange('d', 30);

    let startDate = dateRange.startDate;
    let endDate = dateRange.endDate;

    setParams((prev) => ({...prev, 
      bgngAplcnYmd: startDate,
      endAplcnYmd: endDate
    }))
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])


  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedRowIndex(-1)
    setSelectedRow(null)
    try {

      // if (!params.rprNo && !params.vhclNo) {
      //   alert('차량번호 또는 발급번호 입력해주세요.')
      //   return
      // }

      let endpoint: string =
        `/fsm/stn/rs/tr/roscSttemnt?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&pstgBgngYmd=' + params.searchStDate : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bgngAplcnYmd ? '&bgngAplcnYmd=' + (params.bgngAplcnYmd+'').replace(/-/g, "") : ''}` +
        `${params.endAplcnYmd ? '&endAplcnYmd=' + (params.endAplcnYmd+'').replace(/-/g, ""): ''}` +
        `${params.rprNo ? '&rprNo=' + params.rprNo : ''}` +
        `${params.flnm ? '&flnm=' + params.flnm : ''}`
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
        setExcelFlag(true)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setExcelFlag(false)
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
      setExcelFlag(false)
    } finally {
      setLoading(false)
    }
  }


  
  // Fetch를 통해 데이터 갱신
  const fetchOutputData = async () => {
    if(selectedRow == undefined){
      alert('출력할 대상이 없습니다..')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 출력이 가능합니다.')
      return
    }

    if(selectedRow.rprCd !== '1' && selectedRow.rprCd !== '2' && selectedRow.rprCd !== '4' && selectedRow.rprCd !== '7'){
      alert('수리통보서 출력은 수리, 변경신고, 기간연장, 수리[폐차] 상태에서만 가능합니다.')
      return
    }


    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/rs/tr/roscSttemntReport?` +
        `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}` 

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const row :Row = response.data.content
        const jsonData = { roscSttemnt: row}
        
        handleReport(
          'roscSttemntReport',
          JSON.stringify(jsonData),
        )

      } else {
        // 데이터가 없거나 실패
        alert('출력할 대상이 없습니다..')
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
  
    } finally {
    }
  }

  const handleReport = (crfName?: string, crfData?: any) => {
    openReport(crfName, crfData)
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

    try {
	  setLoadingBackdrop(true)
      let endpoint: string =
      `/fsm/stn/rs/tr/getExcelRoscSttemnt?` +
      `${params.searchStDate ? '&pstgBgngYmd=' + params.searchStDate : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.bgngAplcnYmd ? '&bgngAplcnYmd=' + (params.bgngAplcnYmd+'').replace(/-/g, "") : ''}` +
      `${params.endAplcnYmd ? '&endAplcnYmd=' + (params.endAplcnYmd+'').replace(/-/g, ""): ''}` +
      `${params.rprNo ? '&rprNo=' + params.rprNo : ''}` +
      `${params.flnm ? '&flnm=' + params.flnm : ''}`
      

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
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)  
    setExcelFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )


  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row);
    setSelectedRowIndex(index ?? -1)
  }, [])

  // 글쓰기 페이지로 이동하는 함수
  const handleWriteClick = () => {
    router.push(`./create${qString}`) // '/create'는 글쓰기 페이지의 경로입니다.
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*_\-+=(){}[\]|\\:;"'<>,.?/]/g
    if(name == 'vhclNo'){
      setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))
    }else if(name == 'flnm' || name == 'rprNo'){
      setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(' ', '') }))
    }else{
      setParams((prev) => ({ ...prev, page: 1, [name]: value}))
    }
    setExcelFlag(false)
  }

  return (
    <PageContainer
      title="화물 대폐차신고조회"
      description="화물 대폐차신고조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="화물 대폐차신고조회" items={BCrumb} />
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
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    fullWidth
                    name="vhclNo"
                    value={params.vhclNo ?? ''} // 빈 문자열로 초기화
                    onChange={handleSearchChange}
                    inputProps={{
                      maxLength : 9
                    }}
                  />
              </div>
          
          </div><hr></hr>
          <div className="filter-form">
            <div className="form-group">
                <CustomFormLabel className="input-label-display">
                기간
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"

                >
                  시작일
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="bgngAplcnYmd"
                  value={params.bgngAplcnYmd ?? ''}
                  onChange={handleSearchChange}
                  fullWidth
                  inputProps={{
                    max : params.endAplcnYmd
                  }}
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  종료일
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="endAplcnYmd"
                  value={params.endAplcnYmd ?? ''}
                  onChange={handleSearchChange}
                  fullWidth
                  inputProps={{
                    min : params.bgngAplcnYmd
                  }}
                />
            </div>
    
            <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-flnm"
                  >
                    성명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-flnm"
                    placeholder=""
                    fullWidth
                    name="flnm"
                    value={params.flnm ?? ''}
                    onChange={handleSearchChange}
                    inputProps={{
                      maxLength: 50
                    }}
                  />
            </div>  
            <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-rprNo"
                  >
                    발급번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-rprNo"
                    placeholder=""
                    fullWidth
                    name="rprNo"
                    value={params.rprNo ?? ''}
                    onChange={handleSearchChange}
                    inputProps={{
                      maxLength: 60
                    }}
                  />
            </div>  
          </div>
        </Box>


      <Box className="table-bottom-button-group">
        <div className="button-right-align">
          <LoadingBackdrop open={loadingBackdrop} />
          <Button 
          // onClick={() => fetchData()} 
          type="submit" variant="contained" color="primary">
          검색
          </Button>
          <Button onClick={() => excelDownload()} variant="contained" color="success">
              엑셀
          </Button>
          <Button onClick={()=> fetchOutputData()} variant="contained" color="success">
            출력
          </Button>
        </div>
      </Box>
      </Box>




      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnrsRoscSttemntTrHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
		  caption={"화물-대폐차신고 조회 목록"}
        />
      {/* 테이블영역 끝 */}
      </Box>
      {/* <Box className="table-bottom-button-group">
          <div className="button-right-align">
              <Button variant="contained" color="primary"
              onClick={handleWriteClick}
              >
                등록
              </Button>
          </div>
      </Box> */}

        <DetailReportDataGrid
            row={selectedRow as Row} // 목록 데이터
        />
            <DetailScrcarCarDataGrid
            row={selectedRow as Row} // 목록 데이터
        />
            <DetailRentalDataGrid
            row={selectedRow as Row} // 목록 데이터
        />

    </PageContainer>
  )
}

export default DataList
