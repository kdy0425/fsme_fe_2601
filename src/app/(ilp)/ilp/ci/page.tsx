'use client'
import { Box } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import SearchCondition from './_components/SearchCondition'
import {  Pageable2 } from 'table'
import { SelectItem } from 'select'
import HeaderTab from '@/components/tables/CommHeaderTab'
import { getUserInfo } from '@/utils/fsms/utils'
import { isArray } from 'lodash'
import CrudButtons from './_components/CrudButtons'
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import DetailDataGrid from './_components/DetailDataGrid'
import { StatusType } from '@/types/message'
import { ciCadCimHeadCellsTr, ciCadCimHeadCellsTx, ciCadCimHeadCellsBs } from '@/utils/fsms/ilp/headCells'

import { IconSearch } from '@tabler/icons-react'

export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  flnm: string
  crdcoCd: string
  cardSttsCd: string
  crdtCeckSeCd: string
  koiCd: string
  dscntYn: string
  vonrNm: string
  cardSeCd: string
}

interface Row {
  vhclNo: string
  flnm: string
  vonrNm: string
  crdcoNm: string
  cardSeNm: string
  cardNoSe: string
  stlmCardNoVe: string
  cardSttsCd: string
  custSeNm: string
  dscntNm: string
  koiNm: string
  brno: string
}

export interface DetailRow extends Row {
  cardBid: string
  carBid: string
  chgRsnCn: string
  inputDt: string
  locgovNm: string
  cardSttsNm: string
  agncyDrvBgngYmd: string
  agncyDrvEndYmd: string
  issuSeNm: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  vhclSttsCd: string
  crdcoCd: string
  cardNo: string
  vonrRrno: string
  rrno: string
  rrnoS: string
  cardNoDe: string
  cardNoS: string
  crdcoSttsNm: string
  rcptYmd: string
  crdtCeckSeNm: string
  stlmCardNo: string
  rcvYn: string
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '카드정보',
  },
  {
    to: '/ilp/ci',
    title: '카드정보',
  },
]

const DataList = () => {
  /* 상태관리 */
 const [tabIndex, setTabIndex] = useState('0')
 const [tabList, setTabList] = useState<SelectItem[]>([
    { value: '0', label: '화물' },
    { value: '1', label: '택시' },
    { value: '2', label: '버스' },
  ])

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    flnm: '',
    crdcoCd: '',
    cardSttsCd: '',
    crdtCeckSeCd: '',
    koiCd: '',
    dscntYn: '',
    vonrNm: '',
    cardSeCd: '',
  })

  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [rowIndex, setRowIndex] = useState<number>(-1)
  const [detail, setDetail] = useState<DetailRow>({
    vhclNo: '',
    flnm: '',
    vonrNm: '',
    crdcoNm: '',
    cardSeNm: '',
    cardNoSe: '',
    stlmCardNoVe: '',
    cardSttsCd: '',
    custSeNm: '',
    dscntNm: '',
    koiNm: '',
    brno: '',
    cardBid: '',
    carBid: '',
    chgRsnCn: '',
    inputDt: '',
    locgovNm: '',
    cardSttsNm: '',
    agncyDrvBgngYmd: '',
    agncyDrvEndYmd: '',
    issuSeNm: '',
    rgtrId: '',
    regDt: '',
    mdfrId: '',
    mdfcnDt: '',
    vhclSttsCd: '',
    crdcoCd: '',
    cardNo: '',
    vonrRrno: '',
    rrno: '',
    rrnoS: '',
    cardNoDe: '',
    cardNoS: '',
    crdcoSttsNm: '',
    rcptYmd: '',
    crdtCeckSeNm: '',
    stlmCardNo: '',
    rcvYn: '',
  })

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState<boolean>(false)

  // 업무구분 변경시 상태 초기화
  useEffect(() => {
    resetParams()
    resetSearchResult()
    resetPageObject()
    resetHeadCell()
  }, [tabIndex])

  const userInfo = getUserInfo()

  // 상위 컴포넌트에서 탭 상태 관리

  useEffect(() => {
    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      const result: SelectItem[] = []
      userInfo.taskSeCd.map((item) => {
        console.log(item)
        if (item === 'TR') {
          result.push({ value: '0', label: '화물' })
        } else if (item === 'TX') {
          result.push({ value: '1', label: '택시' })
        } else if (item === 'BS') {
          result.push({ value: '2', label: '버스' })
        } else {
        }
      })

      setTabList(result)

      if (result.length > 0) {
        setTabIndex(result[0].value)
      }
    }
  }, [userInfo.taskSeCd])

  // 검색 Flag
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
      ctpvCd: params.ctpvCd,
      locgovCd: params.locgovCd,
      vhclNo: '',
      flnm: '',
      crdcoCd: '',
      cardSttsCd: '',
      crdtCeckSeCd: '',
      koiCd: '',
      dscntYn: '',
      vonrNm: '',
      cardSeCd: '',
    })
  }

  // 검색결과 초기화
  const resetSearchResult = () => {
    setRows([])
    setTotalRows(0)
    setRowIndex(-1)
    setDetail({
      vhclNo: '',
      flnm: '',
      vonrNm: '',
      crdcoNm: '',
      cardSeNm: '',
      cardNoSe: '',
      stlmCardNoVe: '',
      cardSttsCd: '',
      custSeNm: '',
      dscntNm: '',
      koiNm: '',
      brno: '',
      cardBid: '',
      carBid: '',
      chgRsnCn: '',
      inputDt: '',
      locgovNm: '',
      cardSttsNm: '',
      agncyDrvBgngYmd: '',
      agncyDrvEndYmd: '',
      issuSeNm: '',
      rgtrId: '',
      regDt: '',
      mdfrId: '',
      mdfcnDt: '',
      vhclSttsCd: '',
      crdcoCd: '',
      cardNo: '',
      vonrRrno: '',
      rrno: '',
      rrnoS: '',
      cardNoDe: '',
      cardNoS: '',
      crdcoSttsNm: '',
      rcptYmd: '',
      crdtCeckSeNm: '',
      stlmCardNo: '',
      rcvYn: '',
    })
  }

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // HeadCell 초기화
  const resetHeadCell = useCallback(() => {
    if (tabIndex == '0') {
      return ciCadCimHeadCellsTr
    } else if (tabIndex == '1') {
      return ciCadCimHeadCellsTx
    } else {
      return ciCadCimHeadCellsBs
    }
  }, [tabIndex])

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 조회정보 가져오기
  const getData = async () => {
    setRows([])
    if (schValidation()) {
      setLoading(true)

      try {
        const searchObj = {
          ...params,
          page: params.page,
          size: params.size,
        }

        let endpoint = ''

        if (tabIndex == '0') {
          endpoint =
            '/ilp/ci/tr/getAllCardInfoMng' + toQueryParameter(searchObj)
        } else if (tabIndex == '1') {
          endpoint =
            '/ilp/ci/tx/getAllCardInfoMng' + toQueryParameter(searchObj)
        } else if (tabIndex == '2') {
          endpoint =
            '/ilp/ci/bs/getAllCardInfoMng' + toQueryParameter(searchObj)
        }

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length != 0
        ) {
          // 데이터 조회 성공시
          setRows(() => {
            return response.data.content
          })
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // click event 발생시키기
          handleClick(response.data.content[0], 0)
        } else {
          resetSearchResult()
          resetPageObject()
        }
      } catch (error: StatusType | any) {
        // 에러시
        alert(error.errors?.[0].reason)
        resetSearchResult()
        resetPageObject()
      } finally {
        setLoading(false)
      }
    }
  }

  const schValidation = () => {
    if (tabIndex === '0') {
      if (!params.vhclNo && !params.vonrNm) {
        alert('차량번호 또는 소유자명을 입력해주세요.')
      } else {
        return true
      }
    } else {
      return true
    }

    return false
  }

  const handleClick = useCallback((row: DetailRow, index?: number) => {
    setDetail(row)
    setRowIndex(index ?? -1)
  }, [])

  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      getData()
    }
  }

  const handleExcelDownload = async () => {
    if (rowIndex === -1) {
      alert('조회된 내역이 없습니다.')
      return
    }

    let searchObj = {
      ...params,
      excelYn: 'Y',
    }

    let endpoint = ''
    let title = ''

    if (tabIndex == '0') {
      endpoint =
        '/ilp/ci/tr/cardInfoMngExcel' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_화물_' + getToday() + '.xlsx'
    } else if (tabIndex == '1') {
      endpoint =
        '/ilp/ci/tx/getExcelCardInfoMng' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_택시_' + getToday() + '.xlsx'
    } else if (tabIndex == '2') {
      endpoint =
        '/ilp/ci/bs/getExcelCardInfoMng' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_버스_' + getToday() + '.xlsx'
    }

    console.log(endpoint)
    await getExcelFile(endpoint, title)
  }

  return (
    <PageContainer title="카드정보" description="카드정보">
      {/* breadcrumb */}
      <Breadcrumb title="카드정보" items={BCrumb} />
      <HeaderTab tabs={tabList} onChange={setTabIndex} />

      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box sx={{ mb: 2 }}>
        {/* 조회 조건 */}
        <SearchCondition
          tabIndex={tabIndex}
          params={params}
          handleSearchChange={handleSearchChange}
          handleKeyDown={handleKeyDown}
        />

        {/* CRUD 버튼 */}
        <CrudButtons
          rowIndex={rowIndex}
          tabIndex={tabIndex}
          detailInfo={detail}
          handleAdvancedSearch={handleAdvancedSearch}
          handleExcelDownload={handleExcelDownload}
          getData={getData}
        />
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={resetHeadCell()}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          selectedRowIndex={rowIndex}
          caption={'카드정보 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세영역 */}
      {rows && rows.length > 0 && rowIndex != -1 ? (
        <>
          <DetailDataGrid detail={detail} tabIndex={tabIndex} />
        </>
      ) : (
        <></>
      )}

    
    </PageContainer>
  )
}

export default DataList
