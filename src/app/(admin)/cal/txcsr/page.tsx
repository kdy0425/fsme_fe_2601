'use client'
import {
  Box,
  Button,
  FormControlLabel,
  RadioGroup,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TxSearchHeaderTab from '@/app/components/tx/txSearchHeaderTab/TxSearchHeaderTab'
import { HeadCell, Pageable2 } from 'table'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import SearchCondition from './_components/SearchCondition'
import CrudButtons from './_components/CrudButtons'
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import IndvTableDataGrid from './_components/IndvTableDataGrid'
import BizTableDataGrid from './_components/BizTableDataGrid'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* interface, type 선언 */
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  ddlnYn: string
  koiCd: string
  bzmnSeCd: string
  bgngDt: string
  endDt: string
  brno: string
  crdcoCd: string
  clmAprvYn: string
  clclnSeCd: string
  vhclNo: string
}

export interface Row {
  crdcoCd: string
  crdcoNm: string
  cardNo: string
  cardNoS: string
  clclnSeCd: string
  clclnSeNm: string
  clclnYm: string
  clmAprvYn: string
  aprvNo: string
  aprvYmd: string
  aprvTm: string
  vhclNo: string
  bzmnSeCd: string
  bzmnSeNm: string
  locgovCd: string
  locgovNm: string
  moliatUseLiter: string
  aprvAmt: string
  moliatAsstAmt: string
  pbillAmt: string
  flnm: string
  rrno: string
  brno: string
  koiCd: string
  koiNm: string
  literAcctoUntprc: string
  frcsNm: string
  frcsAddr: string
  rprsvNm: string
  uiGb: string
  ddlnYn: string
  usageUnit: string
  ddlnNm: string
  literUntprcNm: string
  custSeNm: string
  aprvDt: string
  frcsNo: string
  vhclPorgnUntprc: string
  opisAmt: string
  literAcctoOpisAmt: string
  exsMoliatAsstAmt: string
}

/* HeadCell 정의 */
const indvCustomHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>선택</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={2}>
          청구승인여부
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>확정여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>청구월</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>면허업종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대리운전</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>수급자명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>수급자주민번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>사업자번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>카드사</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>카드번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={2}>
          거래일시
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>거래구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>사용량당단가구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>사용량당단가</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>국토부사용량</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>단위</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>매출금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>개인부담금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          차량등록지지역별평균단가
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          유가연동보조금사용량당단가
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          유류세연동보조금(ⓐ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          유가연동보조금(ⓑ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          국토부보조금(ⓐ+ⓑ)
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>가맹점명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>가맹점주소</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>거절사유</TableCell>
      </TableRow>
    </TableHead>
  )
}

const bizHeadCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '청구월',
    format: 'yyyymm',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자명',
  },
  {
    id: 'rrnoS',
    numeric: false,
    disablePadding: false,
    format: 'rrno',
    label: '수급자주민번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    format: 'cardNo',
    label: '카드번호',
  },
  {
    id: 'aprvYmd',
    numeric: false,
    disablePadding: false,
    label: '거래일자',
  },
  {
    id: 'aprvTm',
    numeric: false,
    disablePadding: false,
    label: '거래시간',
  },
  {
    id: 'clclnSeNm',
    numeric: false,
    disablePadding: false,
    label: '거래구분',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'literUntprcNm',
    numeric: false,
    disablePadding: false,
    label: '사용량당단가구분',
  },
  {
    id: 'literAcctoUntprc',
    numeric: false,
    disablePadding: false,
    label: '사용량당단가',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatUseLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'usageUnit',
    numeric: false,
    disablePadding: false,
    label: '단위',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '매출금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'pbillAmt',
    numeric: false,
    disablePadding: false,
    label: '개인부담금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
  {
    id: 'frcsAddr',
    numeric: false,
    disablePadding: false,
    label: '가맹점주소',
  },
  {
    id: 'uiGb',
    numeric: false,
    disablePadding: false,
    label: '지급확정여부',
  },
]

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
    to: '/cal/txcsr',
    title: '건별 청구내역',
  },
]

const DataList = () => {
  /* 상태관리 */
  const tabList = useMemo(() => ['법인', '개인'], []) // MENU TAB 리스트
  const [tabIndex, setTabIndex] = useState<string>('0') // MENU TAB 인덱스

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    ddlnYn: '',
    koiCd: '',
    bzmnSeCd: '',
    bgngDt: getDateRange('m', 1).startDate,
    endDt: getDateRange('m', 1).endDate,
    brno: '',
    crdcoCd: '',
    clmAprvYn: '',
    clclnSeCd: '',
    vhclNo: '',
  })

  const [rows, setRows] = useState<Row[]>([]) // 조회 결과
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [rowIndex, setRowIndex] = useState<number>(-1) // 현재 선택된 ROW INDEX
  const [selectedRow, setSelectedRow] = useState<Row>() // 현재 선택된 ROW

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 FLAG
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징 객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 엑셀 FLAG
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  const [CsbySbsidyRqestList, setCsbySbsidyRqestList] = useState<any[]>()

  // 업무구분 변경시 상태 초기화
  useEffect(() => {
    resetParams()
    resetSearchResult()
    resetPageObject()
    resetHeadCell()
    setCsbySbsidyRqestList([])
  }, [tabIndex])

  // 검색 FLAG
  useEffect(() => {
    if (searchFlag != null) {
      getData()
      setCsbySbsidyRqestList([])
    }
  }, [searchFlag])

  const handleCheckChange = (rows: Row[]) => {
    let selectList: any[] = []
    if (rows) {
      rows.map((row) => {
        let reqData = {
          crdcoCd: row.crdcoCd,
          clclnSeCd: row.clclnSeCd,
          cardNo: row.cardNo,
          clclnYm: row.clclnYm,
          aprvNo: row.aprvNo,
          aprvYmd: row.aprvYmd,
          aprvTm: row.aprvTm,
          clmAprvYn: row.clmAprvYn,
          ddlnYn: row.ddlnYn,
        }

        selectList.push(reqData)
      })
    }
    setCsbySbsidyRqestList(selectList)
  }

  // 조회조건 초기화
  const resetParams = () => {
    setParams((prev) => ({
      ...prev,
    }))
    setIsExcelProcessing(false)
  }

  // 검색결과 초기화
  const resetSearchResult = () => {
    setRows([])
    setTotalRows(0)
    setRowIndex(-1)
    setSelectedRow(undefined)
  }

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // 조회영역 Head Cell 수정
  const resetHeadCell = useCallback(() => {
    if (tabIndex == '0') {
      return bizHeadCells
    } else {
      return indvCustomHeader
    }
  }, [tabIndex])

  // 조회조건 변경
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
      setExcelFlag(false)
    },
    [],
  )

  // 엔터키 입력 시 조회
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleAdvanceSearch()
      }
    },
    [],
  )

  const getData = async () => {
    if (schValidation()) {
      setLoading(true)

      try {
        let searchObj = {}

        if (tabIndex === '0') {
          searchObj = {
            ...params,
            bzmnSeCd: '0',
            page: params.page,
            size: params.size,
            bgngDt: params.bgngDt.replaceAll('-', ''),
            endDt: params.endDt.replaceAll('-', ''),
            brno: params.brno.replaceAll('-', ''),
          }
        } else {
          searchObj = {
            ...params,
            bzmnSeCd: '1',
            page: params.page,
            size: params.size,
            bgngDt: params.bgngDt.replaceAll('-', ''),
            endDt: params.endDt.replaceAll('-', ''),
          }
        }

        let endpoint =
          '/fsm/cal/txcsr/tx/getAllCsbySbsidyRqest' +
          toQueryParameter(searchObj)

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length != 0
        ) {
          // 데이터 조회 성공 시
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
        } else {
          // 데이터가 없거나 실패
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

  // 조회 Validation
  const schValidation = () => {
    if (tabIndex === '0') {
      if (!params.bgngDt) {
        alert('청구시작일자를 입력해주세요.')
      } else if (!params.endDt) {
        alert('청구종료일자를 입력해주세요.')
      } else if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
      } else if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
      } else if (new Date(params.bgngDt) > new Date(params.endDt)) {
        alert('시작일자가 종료일자보다 클 수 없습니다.')
      } else if (!isValidDateRange(params.bgngDt, params.endDt)) {
        alert('1개월 초과 데이터는 조회가 불가능합니다.')
      } else {
        return true
      }
    } else {
      if (!params.bgngDt) {
        alert('청구시작일자를 입력해주세요.')
      } else if (!params.endDt) {
        alert('청구종료일자를 입력해주세요.')
      } else if (new Date(params.bgngDt) > new Date(params.endDt)) {
        alert('시작일자가 종료일자보다 클 수 없습니다.')
      } else if (!isValidDateRange(params.bgngDt, params.endDt)) {
        alert('1개월 초과 데이터는 조회가 불가능합니다.')
      } else if (!params.ctpvCd) {
        alert('시도명을 입력해주세요.')
      } else if (!params.locgovCd) {
        alert('지자체명을 입력해주세요.')
      } else if (!params.crdcoCd) {
        alert('카드사를 선택해주세요.')
      } else {
        return true
      }
    }
    return false
  }

  const isValidDateRange = (start: string, end: string) => {
    const firstDate = new Date(start)
    const secondDate = new Date(end)

    const yearDiff = secondDate.getFullYear() - firstDate.getFullYear()
    const monthDiff = secondDate.getMonth() - firstDate.getMonth()

    let diff = yearDiff * 12 + monthDiff

    if (diff > 1) {
      return false
    } else {
      return true
    }
  }

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  // 조회 클릭 시
  const handleAdvanceSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
    setExcelFlag(false)
  }

  const handleExcelDownLoad = async () => {
    // console.log('excelFlag :', excelFlag)
    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드할 수 있습니다.')
      return
    }

    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    setIsExcelProcessing(true)
    let searchObj = {}
    if (tabIndex === '0') {
      searchObj = {
        ...params,
        bzmnSeCd: '0',
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
        brno: params.brno.replaceAll('-', ''),
        excelYn: 'Y',
      }
    } else {
      searchObj = {
        ...params,
        bzmnSeCd: '1',
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
        excelYn: 'Y',
      }
    }

    let endpoint =
      '/fsm/cal/txcsr/tx/getExcelAllCsbySbsidyRqest' +
      toQueryParameter(searchObj)

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  return (
    <PageContainer title="건별청구내역관리" description="건별청구내역관리">
      {/* breadcrumb */}
      <Breadcrumb title="건별청구내역관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 */}
      <Box sx={{ mb: 2 }}>
        {/* 조회조건 */}
        <SearchCondition
          tabIndex={tabIndex}
          params={params}
          handleSearchChange={handleSearchChange}
          handleKeyDown={handleKeyDown}
        />

        {/* CRUD Button */}
        <CrudButtons
          rowIndex={rowIndex}
          tabIndex={tabIndex}
          handleAdvancedSearch={handleAdvanceSearch}
          handleExcelDownLoad={handleExcelDownLoad}
          CsbySbsidyRqestList={CsbySbsidyRqestList}
          getData={getData}
        />
      </Box>

      {/* 업무구분 */}
      <TxSearchHeaderTab
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
        tabList={tabList}
      />

      {/* 테이블영역 */}
      <Box>
        {tabIndex === '0' ? (
          <>
            <BizTableDataGrid
              headCells={bizHeadCells}
              rows={rows}
              totalRows={totalRows}
              loading={loading}
              onPaginationModelChange={handlePaginationModelChange}
              pageable={pageable}
              paging={true}
              caption={"법인 건별청구내역 목록 조회"}
            />
          </>
        ) : (
          <>
            <IndvTableDataGrid
              headCells={[]}
              rows={rows}
              totalRows={totalRows}
              loading={loading}
              onRowClick={() => {}}
              onPaginationModelChange={handlePaginationModelChange}
              onCheckChange={handleCheckChange}
              pageable={pageable}
              paging={true}
              customHeader={indvCustomHeader}
              caption={"개인 건별청구내역 목록 조회"}
            />
          </>
        )}
      </Box>
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
