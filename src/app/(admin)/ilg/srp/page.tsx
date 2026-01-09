'use client'

/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* 공통 type, interface */
import { Pageable2, HeadCell } from 'table'
import { ilgSrpRowHC } from '@/utils/fsms/headCells'
import { SelectItem } from 'select'

/* 공통 컴포넌트 */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import HeaderTab from '@/components/tables/CommHeaderTab'

/* 공통js */
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { getDateRange, getToday } from '@/utils/fsms/common/dateUtils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, isNumber } from '@/utils/fsms/common/comm'

/* mui component */
import { Box } from '@mui/material'

/* _component */
import SearchCondition from './_components/SearchCondition'
import CrudButtons from './_components/CrudButtons'
import DetailDataGrid from './_components/DetailDataGrid'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { isArray } from 'lodash'

/* interface, type 선언 */
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  vonrNm: string
  bgngYmd: string
  endYmd: string
  setYn: string
  vonrRrno: string
}

interface rowInterface {
  vhclNo: string // 차량번호
  vonrNm: string // 소유자명
  vonrRrnoSe: string // 주민등록번호
  vonrBrno: string // 사업자등록번호
  koiNm?: string // 유종
  vhclTonNm?: string // 톤수
  bgngYmd: string // 지급거절시작일
  endYmd: string // 지급거절종료일
  locgovNm?: string // 관할관청
}

export interface detailInfoInterface extends rowInterface {
  hstrySn: string // 이력번호
  brno: string // 사업자등록번호
  delYn: string // 삭제여부
  locgovCd: string // 지자체코드
  vonrRrno: string // 주민등록번호
  chgRsnCn: string // 지급거절사유
  rgtrId: string // 등록자아이디
  regDt: string // 등록일자
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일자
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
    title: '행정처분',
  },
  {
    to: '/ilg/srp',
    title: '보조금지급거절',
  },
]

const DataList = () => {
  /* 상태관리 */
  const [tabs, setTabs] = useState<SelectItem[]>([{ value: '', label: '' }])
  const [tabIndex, setTabIndex] = useState('')

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
    bgngYmd: '',
    endYmd: '',
    setYn: '',
    vonrRrno: '',
  })

  const [rows, setRows] = useState<rowInterface[]>([]) // 조회결과
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [rowIndex, setRowIndex] = useState<number>(-1) // 현재 선택된 로우
  const [detailInfo, setDetailInfo] = useState<detailInfoInterface>({
    vhclNo: '',
    vonrNm: '',
    vonrRrnoSe: '',
    vonrBrno: '',
    bgngYmd: '',
    endYmd: '',
    hstrySn: '',
    brno: '',
    delYn: '',
    locgovCd: '',
    vonrRrno: '',
    chgRsnCn: '',
    rgtrId: '',
    regDt: '',
    mdfrId: '',
    mdfcnDt: '',
  }) // 상세정보

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [enableExcel, setEnableExcel] = useState<boolean>(false) //엑셀다운로드
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const userInfo = getUserInfo();

  useEffect(() => {

    if (isArray(userInfo.taskSeCd) && userInfo.taskSeCd.length !== 0) {
      
      const result: SelectItem[] = []
      
      userInfo.taskSeCd.map((item) => {        
        if (item === 'TR') {
          result.push({ value: '0', label: '화물' })
        } else if (item === 'TX') {
          result.push({ value: '1', label: '택시' })
        } else {

        }
      })

      setTabs(result)

      if (result.length > 0) {
        setTabIndex(result[0].value)
      }
    }
  }, [userInfo.taskSeCd])

  // 업무구분 변경시 상태 초기화
  useEffect(() => {
    resetParams()
    resetSearchresults()
    resetPageObject()
    resetHeadCell()
  }, [tabIndex])

  // 검색flag
  useEffect(() => {
    if (searchFlag != null) {
      setRowIndex(-1);
      getAllSbsidyRejectPymnt()
    }
  }, [searchFlag])

  useEffect(() => {
    setEnableExcel(false)
  }, [params])

  // 조회조건 초기화
  const resetParams = () => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      size: 10,
      vhclNo: '',
      vonrNm: '',
      bgngYmd: getDateRange('d', 30).startDate,
      endYmd: getDateRange('d', 30).endDate,
      setYn: '',
      vonrRrno: '',
    }));
  }

  // 검색결과 초기화
  const resetSearchresults = () => {
    setRows([])
    setTotalRows(0)
    setRowIndex(-1)
    setDetailInfo({
      vhclNo: '',
      vonrNm: '',
      vonrRrnoSe: '',
      vonrBrno: '',
      bgngYmd: '',
      endYmd: '',
      hstrySn: '',
      brno: '',
      delYn: '',
      locgovCd: '',
      vonrRrno: '',
      chgRsnCn: '',
      rgtrId: '',
      regDt: '',
      mdfrId: '',
      mdfcnDt: '',
    })
  }

  // 페이징 객체 초기화
  const resetPageObject = () => {
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // 조회영역 Head Cell 수정
  const resetHeadCell = useCallback(() => {
    if (tabIndex == '0') {
      return ilgSrpRowHC
    } else {
      // 택시는 톤수 제외
      const temp: HeadCell[] = []

      ilgSrpRowHC.map((item, index) => {
        if (item.id != 'vhclTonNm') {
          temp.push(item)
        }
      })

      return temp
    }
  }, [tabIndex])

  // 조회조건 변경시
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'vonrRrno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }));
    }    
  }, []);

  // 조회정보 가져오기
  const getAllSbsidyRejectPymnt = async () => {
    if (schValidation()) {
      setLoading(true)

      try {
        const searchObj = {
          ...params,
          page: params.page,
          size: params.size,
          bgngYmd: params.bgngYmd.replaceAll('-', ''),
          endYmd: params.endYmd.replaceAll('-', ''),
        }

        let endpoint = ''

        if (tabIndex == '0') {
          endpoint =
            '/fsm/ilg/srp/tr/getAllSbsidyRejectPymnt' +
            toQueryParameter(searchObj)
        } else if (tabIndex == '1') {
          endpoint =
            '/fsm/ilg/srp/tx/getAllSbsidyRejectPymnt' +
            toQueryParameter(searchObj)
        } else {
          alert('업무구분이 잘못되었습니다.')
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
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // click event 발생시키기
          handleClick(response.data.content[0], 0)
        } else {
          // 데이터가 없거나 실패
          resetSearchresults()
          resetPageObject()
        }
      } catch (error: StatusType | any) {
        // 에러시
        console.log(error)
        alert(error.errors?.[0].reason)
        resetSearchresults()
        resetPageObject()
      } finally {
        setLoading(false)
        setEnableExcel(true)
      }
    }
  }

  // 조회 벨리데이션
  const schValidation = () => {
    if (!params.bgngYmd) {
      alert('신청시작일자를 입력 해주세요.')
    } else if (!params.endYmd) {
      alert('신청종료일자를 입력 해주세요.')
    } else if (new Date(params.bgngYmd) > new Date(params.endYmd)) {
      alert('시작일자가 종료일자보다 클 수 없습니다')
    } else {
      return true
    }

    return false
  }

  // row클릭시
  const handleClick = useCallback(
    (row: detailInfoInterface, index?: number) => {
      setDetailInfo(row)
      setRowIndex(index ?? -1)
    },
    [],
  )

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  // 조회클릭시
  const handleAdvancedSearch = () => {    
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  const handleExcelDownLoad = async () => {
    if (rowIndex == -1) {
      alert('조회된 내역이 없습니다')
      return
    }

    if (!enableExcel) {
      alert('조회 후에 엑셀다운로드 하시기 바랍니다.')
      return
    }

    let searchObj = {
      ...params,
      bgngYmd: params.bgngYmd.replaceAll('-', ''),
      endYmd: params.endYmd.replaceAll('-', ''),
      excelYn: 'Y',
    }

    let endpoint = ''

    setIsDataProcessing(true)

    if (tabIndex == '0') {
      endpoint =
        '/fsm/ilg/srp/tr/sbsidyRejectPymntExcel' + toQueryParameter(searchObj)
    } else {
      // 택시는 상태 조회조건 제외
      searchObj = {
        ...searchObj,
        setYn: '',
      }

      endpoint =
        '/fsm/ilg/srp/tx/sbsidyRejectPymntExcel' + toQueryParameter(searchObj)
    }

    await getExcelFile(endpoint, '보조금지급거절' + '_' + getToday() + '.xlsx')

    setIsDataProcessing(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchFlag((prev) => !prev)
    }
  }

  return (
    <PageContainer title="보조금지급거절" description="보조금지급거절">
      {/* 메뉴 경로명 */}
      <Breadcrumb title="보조금지급거절" items={BCrumb} />

      <HeaderTab tabs={tabs} onChange={setTabIndex} />

      {/* 검색영역 */}
      <Box sx={{ mb: 2 }}>
        {/* 조회조건 */}
        <SearchCondition
          tabIndex={tabIndex}
          params={params}
          handleSearchChange={handleSearchChange}
          onkeyChange={handleKeyDown}
        />

        {/* CRUD Button */}
        <CrudButtons
          rowIndex={rowIndex}
          tabIndex={tabIndex}
          detailInfo={detailInfo}
          handleAdvancedSearch={handleAdvancedSearch}
          handleExcelDownLoad={handleExcelDownLoad}
        />
      </Box>

      {/* 테이블영역 */}
      <Box>
        <TableDataGrid
          headCells={resetHeadCell()} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={rowIndex}
        />
      </Box>

      {/* 상세영역 */}
      {rowIndex !== -1 ? (
      <>
        <DetailDataGrid detailInfo={detailInfo} />
      </>
      ) : (
      <></>  
      )}
      
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
