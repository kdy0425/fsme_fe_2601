'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { Pageable2 } from 'table'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import {
  CommSelect,
  CtpvSelectAll,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import { StatusType } from '@/types/message'
import { mngDddmHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/dddm',
    title: '의심거래대상 내역관리',
  },
]

export interface Row {
  // id:string;
  seqNo?: string // 일련번호
  exmnNo?: string // 연번
  locgovCd?: string // 관할관청코드
  locgovNm?: string // 관할관청
  vonrBrno?: string // 차주사업자번호
  vhclNo?: string // 차량번호
  aprvYmd?: string // 승인일지
  aprvTm?: string // 승인시간
  aprvAmt?: string // 승인금액
  cardNo?: string // 카드번호
  cardNoSe?: string // 카드번호(부분복호화)
  crdcoNm?: string // 카드사
  frcsNm?: string // 가맹점명
  dwGb?: string // 부정수급유형코드
  dwNm?: string // 부정수급유형
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  dwNo: string
  bgngAprvYmd: string
  endAprvYmd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    dwNo: '',
    bgngAprvYmd: '', // 시작일
    endAprvYmd: '', // 종료일
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
    if (flag) {
      fetchData()
      setSelectedRowIndex(-1)
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    // setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngAprvYmd: startDate,
      endAprvYmd: endDate,
    }))
  }, [])

  const setinitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!params.dwNo) {
      alert('패턴 선택은 필수입니다.')
      return
    }

    if (!params.vhclNo) {
      alert('차량번호는 필수입니다.')
      return
    }

    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/dddm/tr/getAllDoubtDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.dwNo ? '&dwNo=' + params.dwNo : ''}`

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
        setinitialState()
      }
    } catch (error: StatusType | any) {
      // 에러시
      // console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
      setinitialState()
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert("엑셀파일을 다운로드할 데이터가 없습니다.")
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    let endpoint: string =
      `/fsm/mng/dddm/tr/doubtDelngDtlsExcel?` +
      `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
      `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.dwNo ? '&dwNo=' + params.dwNo : ''}`

    await  getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  const removeData = async (selectedRow: Row | undefined) => {
    if (selectedRow == undefined) {
      alert('삭제할 데이터가 없습니다.')
      return
    }

    if (!selectedRow.exmnNo) {
      alert('연번이 존재하는 거래내역은 삭제할 수 없습니다.')
      return
    }

    const userConfirm = confirm('의심거래내역을 삭제 하시겠습니까?')

    if (!userConfirm) {
      return
    } else {
      try {
        let body = {
          dwNo: selectedRow.dwGb,
          seqNo: selectedRow.seqNo,
        }

        let endpoint: string = '/fsm/mng/dddm/tr/deleteDoubtDelngDtls'

        const response = await sendHttpRequest('DELETE', endpoint, body, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          alert('의심거래내역이 삭제되었습니다.')
          fetchData()
        } else {
          alert('실패 :: ' + response.message)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
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

  const handleKeyDown = ((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  })

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRowIndex(index ?? -1)
    setSelectedRow(row)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngAprvYmd' || name === 'endAprvYmd') {
      const otherDateField =
        name === 'bgngAprvYmd' ? 'endAprvYmd' : 'bgngAprvYmd'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
        return 
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
    setExcelFlag(false)
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

    if (changedField === 'bgngAprvYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer
      title="의심거래대상 내역관리"
      description="의심거래대상 내역관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="의심거래대상 내역관리" items={BCrumb} />
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
              <CtpvSelectAll
                width="70%"
                pValue={params.ctpvCd}
                htmlFor={'sch-ctpv'}
                handleChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelectAll
                width="70%"
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhcl-no"
              >
                <span className="required-text">*</span>차량번호
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dwNo"
              >
                <span className="required-text">*</span>패턴
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="164"
                pValue={params.dwNo}
                handleChange={handleSearchChange}
                pName="dwNo"
                htmlFor={'sch-dwNo'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-start-date"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-start-date"
                name="bgngAprvYmd"
                value={params.bgngAprvYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-end-date"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-end-date"
                name="endAprvYmd"
                value={params.endAprvYmd}
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
              onClick={() => removeData(selectedRow)}
              variant="contained"
              color="error"
            >
              삭제
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={mngDddmHC}
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
    </PageContainer>
  )
}

export default DataList
