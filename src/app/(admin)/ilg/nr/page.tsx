'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Breadcrumb, Grid } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

// components
import TxSearchHeaderTab from '@/app/components/tx/txSearchHeaderTab/TxSearchHeaderTab'
import { getDateRange, getExcelFile, getToday, isNumber } from '@/utils/fsms/common/comm'
import SearchCondition from './_components/SearchCondition'
import CrudButtons from './_components/CrudButtons'
import { Pageable2 } from 'table'
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import DetailDataGrid from './_components/DetailDataGrid'
import { ilgNrCommHeadCells, ilgNrCommHeadTxCells } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* interface, type 선언 */
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  vonrNm: string
  bgngRegDt: string
  endRegDt: string
  vonrRrno: string
  regSttsCd: string
}

export interface Row {
  sn:string,                // 일련번호
  vhclNo:string,            // 차량번호
  crno:string,              // 법인등록번호(암호화)
  crnoS:string,             // 법인등록번호(복호화)
  vonrBrno:string,          // 차량소유자사업자등록번호
  vonrNm:string,            // 차량소유자명
  vonrRrno:string,          // 차량소유자주민등록번호(암호화)
  vonrRrnoS:string,         // 차량소유자주민등록번호(복호회)
  locgovCd:string,          // 지자체코드
  koiCd:string,             // 유종코드
  koiNm:string,             // 유종명
  vhclTonCd:string,         // 차량톤수코드
  vhclTonNm:string,         // 차량톤수명
  regSttsCd:string,         // 등록상태코드
  regSttsNm:string,         // 등록상태명
  regRsnCn:string,          // 등록사유내용
  rdmAmt:string,            // 환수금액
  sbtrRdmAmt:string,        // 차감환수금액
  rmndRdmAmt:string,        // 잔여환수금액
  enfcYmd:string,           // 시행일자
  lastSbtrYmd:string,       // 최종차감일자
  hitEndYmd:string,         // 중지종료일자
  trsmYn:string,            // 전송여부
  trsmDt:string,            // 전송일시
  rgtrId:string,            // 등록자아이디
  regDt:string,             // 등록일시
  mdfrId:string,            // 수정자아이디
  mdfcnDt:string,           // 수정일시
  locgovNm:string,          // 지자체명
  brno:string,              // 차량소유자사업자등록번호(택시)
  brnoEncpt:string,       // 법인번호
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    to: '/ilg/nr',
    title: '체납환수금관리',
  },
]

const BasicTable = () => {
  const tabList = useMemo(() => ['화물', '택시'], [])                               // MENU TAB 리스트
  const [tabIndex, setTabIndex] = useState('0')                                    // MENU TAB 인덱스

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
    bgngRegDt: '',
    endRegDt: '',
    vonrRrno: '',
    regSttsCd: ''
  })

  const [rows, setRows] = useState<Row[]>([]);                                      // 조회 결과
  const [totalRows, setTotalRows] = useState<number>(0);                            // 조회 결과 갯수
  const [rowIndex, setRowIndex] = useState<number>(-1);                             // 현재 선택된 ROW INDEX

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)                // 검색 FLAG
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1
  })                                                                                // 페이징 객체
  const [loading, setLoading] = useState<boolean>(false)                            // 로딩 여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false)                        // 엑셀 FLAG
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)                     // back로딩상태
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  // 업무 구분 변경 시 상태 초기화
  useEffect(() => {
    resetParams()
    resetSearchResult()
    resetPageObject()
  }, [tabIndex])

  // 검색 FLAG
  useEffect(() => {
    if (searchFlag != null) {
      getData()
    }
  }, [searchFlag])

  // 조회조건 초기화
  const resetParams = () => {
    setParams({
      page: 1,
      size: 10,
      ctpvCd: '51',
      locgovCd: '',
      vhclNo: '',
      vonrNm: '',
      bgngRegDt: getDateRange('d', 30).startDate,
      endRegDt: getDateRange('d', 30).endDate,
      vonrRrno: '',
      regSttsCd: ''
    })
  }

  // 검색결과 초기회
  const resetSearchResult = () => {
    setRows([])
    setTotalRows(0)
    setRowIndex(-1)
  }

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1, })
  }

  const schValidation = () => {
    if (params.bgngRegDt > params.endRegDt) {
      alert("등록시작일자가 등록종료일보다 클 수 없습니다.")
    } else {
      return true
    }
    return false
  }

  const getData = async () => {
    
    if (schValidation()) {
    
      setLoading(true)
      setRowIndex(-1)
      
      try {

        let searchObj = {
          ...params,
          page: params.page,
          size: params.size,
          bgngRegDt: params.bgngRegDt.replaceAll("-", ""),
          endRegDt: params.endRegDt.replaceAll("-", ""),
          vonrRrno:params.vonrRrno.replaceAll("-", ""),
        }

        let endpoint = ''
        if (tabIndex === '0') {
          endpoint = '/fsm/ilg/nr/tr/getAllNpymRedemp' + toQueryParameter(searchObj)
        } else {
          endpoint = '/fsm/ilg/nr/tx/getAllNpymRedemp' + toQueryParameter(searchObj)
        }

        const response = await sendHttpRequest('GET', endpoint, null, true,  {
          cache: 'no-store'
        })

        if (response && response.resultType === 'success' && response.data.content.length != 0) {
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          handleRowClick(response.data.content[0], 0)
        } else {
          resetSearchResult()
          resetPageObject()
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        resetSearchResult()
        resetPageObject()
      } finally {
        setLoading(false)
        setExcelFlag(true)
      }
    }
  }

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    if (name === 'vonrRrno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      }      
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
    setExcelFlag(false)
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        // 조회 메소드 실행
        getData()
      }
    },
    []
  )

  const handleRowClick = (row: Row, index?: number) => {
    setRowIndex(index ?? -1)
  }

  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag((prev) => !prev)
    },
    []
  )

  const handleAdvanceSearch = () => {
    setParams((prev) => ({ ...prev, page:1, size: 10 }))
    setSearchFlag((prev) => !prev)
    setExcelFlag(false)
  }

  const handleExcelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert("조회조건이 변경되었습니다. 검색 후 다운로드할 수 있습니다.")
      return
    }

    try{
      setLoadingBackdrop(true);

      let searchObj = {
        ...params,
        bgngRegDt: params.bgngRegDt.replaceAll("-", ""),
        endRegDt: params.endRegDt.replaceAll("-", ""),
        vonrRrno:params.vonrRrno.replaceAll("-", ""),
      }
  
      // 엑셀 API 확인 필요
      let endpoint: string = ''
  
      if (tabIndex === '0') {
        endpoint = '/fsm/ilg/nr/tr/getExcelNpymRedemp' + toQueryParameter(searchObj)
      } else {
        endpoint = '/fsm/ilg/nr/tx/getExcelNpymRedemp' + toQueryParameter(searchObj)
      }
  
      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + "_" + getToday() + ".xlsx")
      
    } catch (error) {
      console.error('ERROR :: ', error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

  return (
    <PageContainer title="체납환수금관리" description="체납환수금관리">
      {/* breadcrumb */}
      <Breadcrumb title="체납환수금관리" items={BCrumb} />
      {/* breadcrumb */}
      
      {/* 탭영역 시작 */}
      <TxSearchHeaderTab 
        tabList={tabList}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      />
      {/* 탭영역 종료 */}
      
      <LoadingBackdrop open={loadingBackdrop} />
      {/* 검색 영역 */}
      <Box sx={{ mb: 2 }}>
        {/* 조회조건 */}
        <SearchCondition 
          tabIndex={tabIndex}
          params={params}
          handleSearchChange={handleSearchChange}
          fn={getData}
        />
        {/* CRUD Buttons */}
        <CrudButtons 
          rows={rows}
          rowIndex={rowIndex}
          handleAdvancedSearch={handleAdvanceSearch}
          handleExcelDownload={handleExcelDownload}
          tabIndex={tabIndex}
          reload={getData}
        />
      </Box>
      {/* 검색 영역 */}

      {/* 테이블 영역 */}
      <Box>
        {tabIndex === '0' && (
          <TableDataGrid 
            headCells={ilgNrCommHeadCells}
            rows={rows}
            totalRows={totalRows}
            loading={loading}
            onRowClick={handleRowClick}
            onPaginationModelChange={handlePaginationModelChange}
            selectedRowIndex={rowIndex}
            pageable={pageable}
            paging={true}
            cursor={true}
            caption={"화물 체납환수금관리 목록 조회"}
          />
        )}
        {tabIndex === '1' && (
            <TableDataGrid 
            headCells={ilgNrCommHeadTxCells}
            rows={rows}
            totalRows={totalRows}
            loading={loading}
            onRowClick={handleRowClick}
            onPaginationModelChange={handlePaginationModelChange}
            selectedRowIndex={rowIndex}
            pageable={pageable}
            paging={true}
            cursor={true}
            caption={"택시 체납환수금 목록 조회"}
            />
        )}
      </Box>
      {/* 테이블 영역 */}
      {/* 상세 영역 시작 */}
      <Box style={{ display: rowIndex !== -1 ? 'block' : 'none' }}>
        <Grid item xs={4} sm={4} md={4}>
          <DetailDataGrid 
            row={rows[rowIndex]}
            tabIndex={tabIndex}
            reload={getData}
          />
        </Grid>
      </Box>
      {/* 상세 영역 끝 */}
      {/* 컨텐츠 영역 종료 */}
    </PageContainer>
  )
}

export default BasicTable
