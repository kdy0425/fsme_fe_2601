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
  getToday,
} from '@/utils/fsms/common/comm'
import DetailDataGrid from './DetailDataGrid'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'

const headCells: HeadCell[] = [
  {
    id: 'trsnYnNm',
    numeric: false,
    disablePadding: false,
    label: '전송상태',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '발급구분',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사코드',
  },
  {
    id: 'flRsnNm',
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
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'bzmnSeNm',
    numeric: false,
    disablePadding: false,
    label: '개인법인',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자성명',
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
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '대표자명',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'custSeNm',
    numeric: false,
    disablePadding: false,
    label: '대리운전',
  },
  {
    id: 'agncyDrvBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '대리시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'agncyDrvEndYmd',
    numeric: false,
    disablePadding: false,
    label: '대리종료일',
    format: 'yyyymmdd',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    format: 'cardNo',
    label: '카드번호',
  },
  {
    id: 'crno',
    numeric: false,
    disablePadding: false,
    label: '법인번호',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '요청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'moliatAprvNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
  },
  {
    id: 'moliatAprvDt',
    numeric: false,
    disablePadding: false,
    label: '처리일자',
    format: 'yyyymmdd',
  },
  {
    id: 'mdfrId',
    numeric: false,
    disablePadding: false,
    label: '승인자ID',
  },
]

export interface Row {
  aplySn?: string
  trsmYn?: string
  locgovNm?: string
  issuSeCd?: string
  crdcoCd?: string
  rcptYmd?: string
  rcptSeqNo?: string
  seqNo?: string
  cardSeCd?: string
  vhclNo?: string
  bzmnSeCd?: string
  flnm?: string
  rrno?: string
  rrnoS?: string
  pidS?: string
  brno?: string
  rprsvNm?: string
  bzentyNm?: string
  custSeCd?: string
  agncyDrvBgngYmd?: string
  agncyDrvEndYmd?: string
  koiCd?: string
  cardNo?: string
  cardNoS?: string
  regDt?: string
  moliatAprvYn?: string
  moliatAprvDt?: string
  flRsnCd?: string
  flRsnCn?: string
  enCardNo?: string
  locgovCd?: string
  crno?: string
  ntsAprvYn?: string
  custNo?: string
  bfrCardNo?: string
  vonrTelno?: string
  aprvCd?: string
  issuErrCd?: string
  enRrno?: string
  orgFlnm?: string
  orgRprsvNm?: string
  bmSttsCd?: string
  cmSttsCd?: string
  confTyp?: string
  mdfrId?: string
  bmMdfrId?: string
  carStopYn?: string
  carPauseYn?: string
  alotQty?: string
  rgtrId?: string
  mdfcnDt?: string
  issuSeNm?: string
  cardSeNm?: string
  bzmnSeNm?: string
  crdcoNm?: string
  koiNm?: string
  custSeNm?: string
  flRsnNm?: string
  moliatAprvNm?: string
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

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우 데이터
  const [rowIndex, setRowIndex] = useState(-1)
  const [isDetailOn, setIsDetailOn] = useState(false)

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
    setLoading(true)
    setSelectedRow(undefined)
    setRowIndex(-1)
    setIsDetailOn(false)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cijc/tx/getAllCardIssuJdgmn?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngRegDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endRegDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.moliatAprvYn ? '&moliatAprvYn=' + params.moliatAprvYn : ''}`

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
      alert("카드발급심시를 취소할 데이터를 선택해주세요.")
      return
    }

    if (
      row.moliatAprvYn === 'Y' && row.moliatAprvDt === getToday()
    ) {
      const userConfirm = confirm('해당 카드발급심사건을 취소하시겠습니까?')

      if (!userConfirm) {
        return
      } else {
        try {
          let body = {
            crdcoCd: row.crdcoCd,
            rcptYmd: row.rcptYmd,
            rcptSeqNo: row.rcptSeqNo,
            seqNo: row.seqNo,
          }

          let endpoint: string = '/fsm/mng/cijc/tx/cancelCardIssuJdgmn'

          const response = await sendHttpRequest('PUT', endpoint, body, true, {
            cache: 'no-store',
          })

          if (response && response.resultType === 'success') {
            // 성공
            alert(response.message)
          } else {
            // 실패
            alert('실패 :: ' + response.message)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    } else {
      alert('금일 승인건이 아니므로 카드발급심사를 취소할 수 없습니다.')
      return
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
    setRowIndex(index ?? -1)
    if (rowIndex === index) {
      setIsDetailOn(!isDetailOn)
    } else {
      setIsDetailOn(true)
    }
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

  const handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
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
                htmlFor="sch-moliatAprvYn"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect 
                cdGroupNm={'CUGU'}
                pValue={params.moliatAprvYn}
                pName={'moliatAprvYn'}
                handleChange={handleSearchChange}
                htmlFor={'sch-moliatAprvYn'}
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
                접수일자
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
                기간 종료
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
              type="submit"
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
          selectedRowIndex={rowIndex}
          pageable={pageable}
          paging={true}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {/* 상세 영역 시작 */}
      <>
        {(selectedRow && isDetailOn) && <DetailDataGrid detail={selectedRow} />}
      </>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default CargoPage
