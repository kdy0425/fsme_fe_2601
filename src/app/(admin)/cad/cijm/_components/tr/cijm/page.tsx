'use client'
import {
  Box,
  Button,
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  addDays,
  getDateFormatYMD,
  dateToString,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter, toQueryString } from '@/utils/fsms/utils'
import HeaderTab from '@/components/tables/CommHeaderTab'
import TableDataGrid from '@/app/components/tables/CommDataGrid3'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { HeadCell, Pageable2 } from 'table'
import { calMonthsDate, getExcelFile, getToday } from '@/utils/fsms/common/comm'

import TrIfCardReqComponent from './_components/TrIfCardReqComponent'
import TrModalContent from './_components/TrModalContent'
import TxIfCardReqComponent from './_components/TxIfCardReqComponent'
import BsIfCardReqComponent from './_components/BsIfCardReqComponent'
import { SelectItem } from 'select'

/* 검색조건 */
export interface listSearchObj {
  ctpvCd: string
  locgovCd: string
  locgovAprvYn: string
  vhclNo: string
  srchDtGb: string
  bgngDt: string
  endDt: string
  bzentyNm: string
}

interface Row {
  [key: string]: any
}

//내비게이션
const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '유류구매카드관리',
  },
  {
    title: '보조금카드관리',
  },
  {
    to: '/cad/cijm',
    title: '카드발급 심사 관리',
  },
]

const componentsMap = {
  TR: TrIfCardReqComponent,
  TX: TxIfCardReqComponent,
  BS: BsIfCardReqComponent,
}

//쿼리스트링
const generateQueryString = (obj) => {
  let query = ''

  for (const [key, originalValue] of Object.entries(obj)) {
    if (
      originalValue !== undefined &&
      originalValue !== null &&
      typeof originalValue === 'string' &&
      originalValue.trim() !== ''
    ) {
      const value = key.includes('Dt') // key에 "Dt"가 포함되어 있으면
        ? originalValue.trim().replaceAll('-', '') // "-" 제거
        : originalValue.trim()
      query += `${key}=${value}&` // 쿼리 문자열 추가
    }
  }
  // 마지막 "&" 제거 후 반환
  return query.slice(0, -1)
}

const DataList = () => {
  const handleOpen = (row: Object, index?: number) => {
    setDetail(row)
    setRowIndex(index ?? -1)
  }

  /* 탭 상태관리*/
  const tabs: SelectItem[] = [
    { value: 'TR', label: '화물' },
    { value: 'TX', label: '택시' },
    { value: 'BS', label: '버스' },
  ]
  const [selectedTab, setSelectedTab] = useState<string>('TR') // 기본값은 'TR'

  /**
   * 헤더 / 상세 그리드 / 클릭한 row 관리 / 그리드 데이터 / 클릭한 줄 인덱스 관리
   */
  const [Component, setComponent] = useState<any>(TrIfCardReqComponent)
  const [srchCondition, setSrchCondition] = useState<React.ReactNode>(null)
  const [crudButtons, setCrudButtons] = useState<React.ReactNode>(null)
  const [header, setHeader] = useState<HeadCell[]>([])
  const [detailGrid, setDetailGrid] = useState<React.ReactNode>(null)
  const [detail, setDetail] = useState<Row>()
  const [rows, setRows] = useState<Row[]>([])
  const [rowIndex, setRowIndex] = useState<number>(-1)

  /**
   * 모달
   */
  const modalMap: Record<string, React.FC<any>> = {
    TrLocgovApvDeny: TrModalContent.TrLocgovApvDeny,
    TrLocgovApvAcc: TrModalContent.TrLocgovApvAcc,
    // 추가 모달 컴포넌트 작성
  }
  const [activeModal, setActiveModal] = useState<string | null>(null) // 활성화된 모달 이름
  const ActiveModal = activeModal ? modalMap[activeModal] : null
  const [modalData, setModalData] = useState<Record<string, any>>({}) // 모달 데이터
  const [open, setOpen] = useState<boolean>(false)

  /**
   * 검색주소 / 페이징 관리 / 파라미터 초기화 관리 / 로딩여부 관리
   */
  const [srchUrl, setSrchUrl] = useState<String>()
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const resetParams = () => {
    setParams({
      ctpvCd: '',
      locgovCd: '',
      locgovAprvYn: '',
      vhclNo: '',
      srchDtGb: '01',
      bgngDt: '',
      endDt: '',
      bzentyNm: '',
    })
  }

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    ctpvCd: '',
    locgovCd: '',
    locgovAprvYn: '',
    vhclNo: '',
    srchDtGb: '01',
    bgngDt: '',
    endDt: '',
    bzentyNm: '',
  })

  useEffect(() => {
    resetParams()
    // 조회조건 세팅
    setParams((prev) => ({
      ...prev,
      bgngDt: getDateRange('d', 30).startDate,
      endDt: getDateRange('d', 30).endDate,
    }))

    const newComponent = componentsMap[selectedTab] || TrIfCardReqComponent
    setComponent(newComponent)
    setHeader(Component.HeaderComponent)
  }, [selectedTab])

  // 조회조건 변경시
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
      //setSearchFlag(prev => !prev);
    },
    [],
  )

  /**
   * ROW 클릭 이벤트
   */
  const handleClick = useCallback((row: Object, index?: number) => {
    // 상세 그리드 설정
    // detail 값 변경 시 상세 그리드만 업데이트
    setDetail(row)
    setRowIndex(index ?? -1)
  }, [])

  const isValidDateIn3Month = (stDate: string, edDate: string): boolean => {
    const iDate: Date = new Date(stDate)
    const oDate: Date = new Date(edDate)

    let compare1: boolean = true;
    let compare2: boolean = true;

    const plus3Month: Date = new Date(calMonthsDate(new Date(iDate), 3));
    const minus3Month: Date = new Date(calMonthsDate(new Date(oDate), -3));

    // 시작일자 + 3개월이 종료일자보다 클 때 정상
    compare1 = plus3Month >= oDate ? true : false

    // 종료일자 - 3개월이 시작일자보다 작을 때 정상
    compare2 = minus3Month <= iDate ? true : false

    return (compare1 && compare2 ? true : false)
  }

  const handleAdvancedSearch = () => {
    //밸리데이션 체크
    if (!params.ctpvCd && !params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return false
    }

    let endpoint
    if (selectedTab == 'TR') {
      if (!isValidDateIn3Month(params.bgngDt ,params.endDt)) {
        alert('조회기간은 3개월 이내이어야 합니다.')
        return
      }

      endpoint =
        '/fsm/cad/cijm/tr/getAllCardIssuJdgmnMng?' + generateQueryString(params)
    } else if (selectedTab == 'TX') {
      endpoint =
        '/fsm/cad/cijm/tx/getAllCardIssuJdgmnMng?' + generateQueryString(params)
    } else if (selectedTab == 'BS') {
      endpoint =
        '/fsm/cad/cijm/bs/getAllCardIssuJdgmnMng?' + generateQueryString(params)
    }
    setSrchUrl(endpoint)
  }

  // 조건 검색 변환 매칭
  const sortChange = (sort: String): String => {
    if (sort && sort != '') {
      let [field, sortOrder] = sort.split(',') // field와 sortOrder 분리하여 매칭
      if (field === 'regYmd') field = 'regDt' // DB -> regDt // DTO -> regYmd ==> 매칭 작업
      return field + ',' + sortOrder
    }
    return ''
  }

  //엑셀 다운로드
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

    if (selectedTab == 'TR') {
      endpoint =
        '/fsm/cad/cijm/tr/cardInfoMngExcel' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_화물_' + getToday() + '.xlsx'
    } else if (selectedTab == 'TX') {
      endpoint =
        '/fsm/cad/cijm/tx/getExcelCardInfoMng' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_택시_' + getToday() + '.xlsx'
    } else if (selectedTab == 'BS') {
      endpoint =
        '/fsm/cad/cijm/bs/getExcelCardInfoMng' + toQueryParameter(searchObj)
      title = BCrumb[BCrumb.length - 1].title + '_버스_' + getToday() + '.xlsx'
    }
    await getExcelFile(endpoint, title)
  }

  /**
   * 모달 컨트롤
   */
  const openModal = (modalName: string, data: Record<string, any>) => {
    setOpen(true)
    setActiveModal(modalName)
    setModalData(data)
  }

  const closeModal = () => {
    setOpen(false)
    setActiveModal(null)
    setModalData({})
  }

  return (
    <PageContainer title="카드발급 심사 관리" description="카드발급 심사 관리">
      {/* breadcrumb */}
      <Breadcrumb title="카드발급 심사 관리" items={BCrumb} />
      {/* end breadcrumb */}
      {/* 업무구분 */}
      <HeaderTab tabs={tabs} onChange={setSelectedTab} />
      {/* 업무구분 */}
      {/* 검색영역 시작 */}
      <Box sx={{ mb: 2 }}>
        {/* 조회 조건 */}
        <Component.SrchComponent
          params={params}
          handlers={{
            handleSearchChange,
            handleAdvancedSearch,
            openModal,
          }}
          data={detail}
        />
        {/* CRUD 버튼 */}
        <Component.CRUDButtons
          params={params}
          handlers={{
            handleSearchChange,
            handleAdvancedSearch,
            openModal,
          }}
        />
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={header} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          onRowClick={handleClick} // 행 클릭 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          srchUrl={srchUrl}
        />
      </Box>
      <Grid item xs={4} sm={4} md={4}>
        <Component.DetailComponent data={detail} />
      </Grid>

      {ActiveModal && (
        <ActiveModal open={open} data={modalData} onCloseClick={closeModal} />
      )}
    </PageContainer>
  )
}

export default DataList
