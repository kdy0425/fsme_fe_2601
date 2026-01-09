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
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from './_components/TableDataGrid'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable } from 'table'
import { getDateRange, getExcelFile, getToday, getLocGovCd, getCommCd, getYear } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import DetailTableDataGrid from './_components/DetailTableDataGrid'
import ExcelFormDialog from './_components/ExcelFormDialog'
import ReportFormDialog from './_components/ReportFormDialog'
import { LocgovSelectAll } from '@/app/components/tx/commSelect/CommSelect'

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
    to: '/cal/csr',
    title: '시도별 청구내역',
  },
]

const headCells: HeadCell[] = []

const detailHeadCells: HeadCell[] = []

export interface Row {
  clclnYm?: string
  slsNocs?: string
  rlDlngNmprCnt?: string
  useLiter?: string
  asstAmtLiter?: string
  slsAmt?: string
  indvClmAmt?: string
  asstAmt?: string
  ftxAsstAmt?: string
  opisAmt?: string

  clclnLocgovCd?: string
}

export interface DetailRow {
  crdcoNm?: string
  slsNocs?: string
  rlDlngNmprCnt?: string
  useLiter?: string
  asstAmtLiter?: string
  slsAmt?: string
  indvClmAmt?: string
  asstAmt?: string
  ftxAsstAmt?: string
  opisAmt?: string

  selectedRow?: Row
}
// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)

  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [detailRows, setDetailRows] = useState<DetailRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<Row>(); // 선택된 로우 데이터
  
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]);
  const [crdcoCdItems, setCrdcoCdItems] = useState<SelectItem[]>([]);
  const [yearItems, setYearItems] = useState<SelectItem[]>([]);
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 12), // 기본 페이지 사이즈 설정
    searchStDate: allParams.searchStDate ?? '',
    searchEdDate: allParams.searchEdDate ?? '',
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  const [detailParams, setDetailParams] = useState({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 12), // 기본 페이지 사이즈 설정
    clclnYm: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 12, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준
  })
  //
  const [detailPageable, setDetailPageable] = useState<Pageable>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 12, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준
  })

  const [modalParam, setModalParam] = useState({
    clclnYm: '',
    locgovCd: ''
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (searchFlag) {
      fetchData()
    }
  }, [searchFlag])

  // 초기 데이터 로드
  useEffect(() => {
    setSearchFlag(false)

    getCommCd('023', '전체').then((itemArr) => setCrdcoCdItems(itemArr));

    getYear(-15, "").then((itemArr) => {
      setYearItems(itemArr)
      setParams((prev) => ({ ...prev, searchDate: itemArr[0].value }))
    });

  }, [])

  // 상세 내역 조회
  useEffect(() => {
    if (params.locgovCd && detailParams.clclnYm) {
      if (rows.length > 0) {
      fetchDetailData(rows[0]);
      }
    }
  }, [detailParams])

  useEffect(() => {
      //첫행조회
      if (rows.length > 0) {
        handleRowClick(rows[0], 0)
      }
    }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.locgovCd) {
        alert("정산관할관청을 선택해주세요.");
        return;
      }
    
      if (!params.searchDate) {
        alert("청구년도를 입력해주세요.");
        return;
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/csr/tr/getAllCtprvnSbsidy?page=${params.page}&size=${params.size}` +
        `${params.searchDate ? '&clclnYm=' + params.searchDate : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`
      console.log(params.page);
      console.log(params.size);
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
    } finally {
      setDetailRows([])
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const fetchDetailData = async (selectedRow?: Row) => {
    try {
      let endpoint: string = `/fsm/cal/csr/tr/getAllCtprvnSbsidyCard?` + 
        `${selectedRow?.clclnYm ? '&clclnYm=' + selectedRow?.clclnYm : ''}` + 
        `${selectedRow?.clclnLocgovCd ? '&locgovCd=' + selectedRow?.clclnLocgovCd : ''}` 

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store'
        })
        if (response && response.resultType === 'success' && response.data) {
          // 데이터 조회 성공시
          setDetailRows(response.data.content);
        } else {
          // 데이터 조회 실패시
          setDetailRows([]);
        }
    } catch (error) {
      console.error('no such fetching data:', error);
      setDetailRows([]);
    }
  }

const excelDownloadMonthly = async () => {
    if (rows.length === 0) {
      alert("엑셀파일을 다운로드할 데이터가 없습니다.")
      return
    }

    if (!excelFlag) {
      alert("조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.")
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string = 
      `/fsm/cal/csr/tr/getExcelCtprvnSbsidy?page${params.page}&size=${params.size}` +
      `${params.searchDate ? '&clclnYm=' + params.searchDate : ''}` + 
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

    await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + "_월별_" + getToday() + ".xlsx");
    setIsExcelProcessing(false)
  }

  const excelDownloadByCard = async (selectedRow?: Row) => {
    if (detailRows.length === 0) {
      alert("엑셀파일을 다운로드할 데이터가 없습니다.")
      return
    }

    if (!excelFlag) {
      alert("조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.")
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string = 
      `/fsm/cal/csr/tr/getExcelCtprvnSbsidyCard?` + 
      `${selectedRow?.clclnYm ? '&clclnYm=' + selectedRow?.clclnYm : ''}` + 
        `${selectedRow?.clclnLocgovCd ? '&locgovCd=' + selectedRow?.clclnLocgovCd : ''}`

    await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + "_월카드사별_" + getToday() + ".xlsx");
    setIsExcelProcessing(false)
  }

  const getLocgovCd = (): string | number => {
    return params.locgovCd;
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:12 })) // 첫 페이지로 이동
    setSearchFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row,  index?: number) => {
    setSelectedRow(row);
    fetchDetailData(row);
    setSelectedRowIndex(index ?? -1)
  }
  // 페이지 이동 감지 종료 //
  // 시작일과 종료일 비교 후 일자 변경
    const handleSearchChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }));
      setExcelFlag(false)
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

  return (
    <PageContainer title="시도별 보조금 청구내역 관리" description="시도별 보조금 청구내역 관리">
      {/* breadcrumb */}
      <Breadcrumb title="시도별 보조금 청구내역 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgovCd">
                <span className="required-text">*</span>정산관할관청
              </CustomFormLabel>
              <LocgovSelectAll 
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
              />
            </div>
            
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-select-02">
                <span className="required-text">*</span>청구년도
              </CustomFormLabel>
              <select
                id="ft-select-02"
                className="custom-default-select"
                name="searchDate"
                value={params.searchDate}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {yearItems.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button onClick={() => fetchData()} variant="contained" color="primary">
              검색
            </Button>
            <Button onClick={() => excelDownloadMonthly()} variant="contained" color="success">엑셀</Button>
            <ReportFormDialog 
              buttonLabel="출력"
              title="청구서출력"
              size="lg"
              selectedRow={selectedRow}
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        {/* 원 데이터 영역 */}
        <TableDataGrid 
          headCells={[]}
          rows={rows}
          selectedRowIndex={selectedRowIndex}
          loading={loading}
          onRowClick={handleRowClick}
          pageable={pageable} 
          caption={"시도별 보조금 청구현황 목록 조회"}
        />
        {/* 원 데이터 영역 */}

        {/* 상세 데이터 영역 */}
        {detailRows && detailRows.length > 0 && 
          <BlankCard className="contents-card" title="월 카드사 총계현황"
          buttons={[
            {
              label: '엑셀',
              onClick: () => { excelDownloadByCard(selectedRow) },
              color: 'success'
            }
          ]}>
            <DetailTableDataGrid 
              headCells={[]}
              rows={detailRows}
              loading={loading}
              onRowClick={() => {}}
              parentRow={selectedRow}
              pageable={pageable}
              caption={"월 카드사 총계현황"}
            />
          </BlankCard>
        }
        {/* 상세 데이터 영역 */}
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
