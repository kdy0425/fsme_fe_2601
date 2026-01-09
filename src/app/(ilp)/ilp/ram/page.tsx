'use client'
import React, { useCallback, useEffect, useState } from 'react'

import { Box, Breadcrumb, Grid } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'

// utils
import { getDateRange, getExcelFile, getToday, isNumber } from '@/utils/fsms/common/comm'
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// table
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// 버스 컴포넌트 및 헤더
import { ramBsHc } from '@/utils/fsms/ilp/headCells'
import SearchConditionBS from './_components/SearchConditionBS'
import DetailDataGridBS from './_components/DetailDataGridBS'
import CrudButtonsBS from './_components/CrudButtonsBS'

/* types */
import { Pageable2 } from 'table'

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
  pttrnSeCd: string   // 의심거래패턴
  brno: string        // 사업자등록번호
}

export interface Row {
  // 메인 그리드(ramBsHc)
  exmnNo: string
  locgovNm: string
  locgovCd: string
  vhclNo: string
  brno: string
  bzentyNm: string
  pttrnSeNm: string
  useNmtm: string         // 거래건수
  totlAprvAmt: string     // 거래금액
  totlAsstAmt: string     // 유가보조금
  rdmActnAmt: string      // 환수조치액
  rdmTrgtNocs: string     // 조사등록건수
  exmnRegMdfcnYmd: string // 조사결과등록일(YYYYMMDD 등)
  rdmAmt: string          // 환수금액
  rdmYmd: string          // 환수일자
  rdmYnNm: string         // 환수여부

  // 상세 카드(DetailDataGrid)
  bankCd: string
  bankNm: string
  actno: string
  dpstrNm: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string

  vonrBrno: string
}

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '부정수급관리' },
  { title: '부정수급관리' },
  { to: '/ilp/rap', title: '환수금관리' },
]

const BasicTable = () => {
  // === 상태 ===
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
    regSttsCd: '',
    pttrnSeCd: '',
    brno: '',
  })

  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [rowIndex, setRowIndex] = useState<number>(-1)

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [loading, setLoading] = useState<boolean>(false)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  // === 초기화: 최초 마운트 시 ===
  useEffect(() => {
    resetParams()
    resetSearchResult()
    resetPageObject()
  }, [])

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
      regSttsCd: '',
      pttrnSeCd: '',
      brno: '',
    })
  }

  // 검색결과 초기화
  const resetSearchResult = () => {
    setRows([])
    setTotalRows(0)
    setRowIndex(-1)
  }

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  const schValidation = () => {
    if (params.bgngRegDt > params.endRegDt) {
      alert('등록시작일자가 등록종료일보다 클 수 없습니다.')
      return false
    }
    return true
  }

  const getData = async () => {
    if (!schValidation()) return

    setLoading(true)
    setRowIndex(-1)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        // 알고 있는 totalCount를 같이 보냄
        totalCount: totalRows,
        bgngRegDt: params.bgngRegDt.replaceAll('-', ''),
        endRegDt: params.endRegDt.replaceAll('-', ''),
        vonrRrno: params.vonrRrno.replaceAll('-', ''),
      }

      const endpoint = '/ilp/ram/bs/getRdmAmtMng' + toQueryParameter(searchObj)

      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        // 첫 행 자동 선택
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

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'vonrRrno') {
      if (isNumber(value)) setParams((prev) => ({ ...prev, [name]: value }))
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
    setExcelFlag(false)
  }, [])

  const handleRowClick = (row: Row, index?: number) => {
    setRowIndex(index ?? -1)
  }

  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page, size: pageSize }))
    setSearchFlag((prev) => !prev)
  }, [])

  const handleAdvanceSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setTotalRows(0)
    setSearchFlag((prev) => !prev)
    setExcelFlag(false)
  }

  const handleExcelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }
    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드할 수 있습니다.')
      return
    }

    try {
      setLoadingBackdrop(true)
      const searchObj = {
        ...params,
        bgngRegDt: params.bgngRegDt.replaceAll('-', ''),
        endRegDt: params.endRegDt.replaceAll('-', ''),
        vonrRrno: params.vonrRrno.replaceAll('-', ''),
      }
      const endpoint = '/ilp/ram/bs/getExcelRdmAmtMng' + toQueryParameter(searchObj)
      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <PageContainer title="환수금관리" description="환수금관리">
      {/* breadcrumb */}
      <Breadcrumb title="환수금관리" items={BCrumb} />

      <LoadingBackdrop open={loadingBackdrop} />

      {/* 검색 영역 - 버스 */}
      <Box sx={{ mb: 2 }}>
        <SearchConditionBS
          tabIndex={'2'}
          params={params}
          handleSearchChange={handleSearchChange}
          fn={getData}
        />
        <CrudButtonsBS
          rows={rows}
          rowIndex={rowIndex}
          handleAdvancedSearch={handleAdvanceSearch}
          handleExcelDownload={handleExcelDownload}
          tabIndex={'2'}
          reload={getData}
        />
      </Box>

      {/* 테이블 영역 - 버스 */}
      <Box>
        <TableDataGrid
          headCells={ramBsHc}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          selectedRowIndex={rowIndex}
          pageable={pageable}
          paging={true}
          cursor={true}
          caption={'버스 환수금 목록 조회'}
        />
      </Box>

      {/* 상세 영역 - 버스 */}
      <Box style={{ display: rowIndex !== -1 ? 'block' : 'none' }}>
        <Grid item xs={4} sm={4} md={4}>
          <DetailDataGridBS row={rows[rowIndex]} tabIndex={'2'} reload={getData} />
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default BasicTable
