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

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  getCommCd,
  getCtpvCd,
  getDateRange,
  getLocGovCd,
} from '@/utils/fsms/common/comm'
import DetailDataGrid from './DetailDataGrid'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const headCells: HeadCell[] = [
  {
    id: 'trsmNm',
    numeric: false,
    disablePadding: false,
    label: '전송여부',
  },
  {
    id: 'detailConfirmYn',
    numeric: false,
    disablePadding: false,
    label: '검토유형',
  },
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '접수일자',
    format: 'yyyymmdd',
  },
  {
    id: 'rcptSn',
    numeric: false,
    disablePadding: false,
    label: '접수순번',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'crno',
    numeric: false,
    disablePadding: false,
    label: '법인등록번호',
    format: 'rrno',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자(대표자)',
  },
  {
    id: 'rrnoS',
    numeric: false,
    disablePadding: false,
    label: '수급자주민번호(대표자주민번호)',
    format: 'rrno',
  },
  {
    id: 'koiCdNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'crdtCeckSeCdNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'reqYmd',
    numeric: false,
    disablePadding: false,
    label: '요청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'aprvYnNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
  },
  {
    id: 'aprvYmd',
    numeric: false,
    disablePadding: false,
    label: '처리일자',
    format: 'yyyymmdd',
  },
]

export interface Row {
  trsmYn?: string
  trsmNm?: string
  detailConfirmYn?: string
  rcptYmd?: string
  rcptSn?: string
  locgovCd?: string
  locgovNm?: string
  vhclNo?: string
  bzentyNm?: string
  brno?: string
  crno?: string
  flnm?: string
  rrnoS?: string
  koiCdNm?: string
  crdcoNm?: string
  crdtCeckSeCdNm?: string
  cardNoS?: string
  cardNo?: string
  reqYmd?: string
  aprvYn?: string
  aprvYnNm?: string
  aprvYmd?: string
  vhclSeCdNm?: string
  issuSeNm?: string
  rgtrId?: string
  regDt?: string
  mdfrId?: string
  mdfcnDt?: string
  rejectType?: string
  etcCn?: string
  chgRsnCn?: string
  aplySn?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const CargoPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우 데이터\
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
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
    if (flag != undefined) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // 초기 데이터 로드
  useEffect(() => {
    //setFlag(!flag)

    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cijc/bs/getAllCardIssuJdgmn?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.locgovAprvYn ? '&aprvYn=' + params.aprvYn : ''}`

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

  const cancelCardIssuJdgmn = async (row?: Row) => {
    if (!row) {
      alert('선택된 내역이 없습니다.')
      return
    }
    if (!(row.trsmYn === 'N' && row.aprvYn === 'N')) {
      alert('당일 카드발급 탈락건만 취소할 수 있습니다.')
      return
    }
    if (!confirm('취소처리 하시겠습니까?')) return

    let endpoint: string = '/fsm/mng/cijc/bs/cancelCardIssuJdgmn'

    let body = {
      rcptYmd: row.rcptYmd,
      rcptSn: row.rcptSn,
      chgRsnCn: '',
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('취소처리 되었습니다.')
        setFlag(true)
        fetchData()
      } else {
        alert('취소처리 오류입니다.')
        fetchData()
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedRowIndex(index ?? -1)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <PageContainer
      title="카드발급심사 변경관리"
      description="카드발급심사 변경관리"
    >
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
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-aprvYn"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'360'}
                pValue={params.aprvYn}
                handleChange={handleSearchChange}
                pName={'aprvYn'}
                htmlFor={'sch-aprvYn'}
                addText={'전체'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhcl-no"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhcl-no"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기간 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                기간 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => cancelCardIssuJdgmn(selectedRow)}
              variant="contained"
              color="primary"
            >
              취소
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          onRowClick={handleRowClick}
          pageable={pageable}
          paging={true}
          selectedRowIndex={selectedRowIndex}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {/* 상세 영역 시작 */}
      <>
        {selectedRow && rows.length > 0 && (
          <DetailDataGrid detail={selectedRow} />
        )}
      </>
      {/* 상세 영역 끝 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default CargoPage
