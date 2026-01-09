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
import {
  getCommCd,
  getCtpvCd,
  getExcelFile,
  getLocGovCd,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/comm'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import DetailDataGrid from './_components/DetailDataGrid'

import { mngCijafTrHeadCells } from '@/utils/fsms/headCells'
import { Pageable2 } from 'table'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/cijaf',
    title: '카드발급심사 자동탈락내역',
  },
]

export interface Row {
  ctpvCd?: string // 시도코드 (locgovCd의 앞 2자리)
  locgovCd?: string // 시도+지자체코드
  errCd?: string // 오류사유
  vhclNo?: string // 차량번호
  bgngRegDt?: string // 시작일
  endRegDt?: string // 종료일
  errorNm?: string // 오류명
  crdcoCd?: string // 카드사코드
  rcptYmd?: string // 접수일자
  rcptSeqNo?: string // 접수일련번호
  reqSeq?: string // 요청이력번호
  locgovNm?: string // 지자체명
  issuSeCd?: string // 발급구분코드
  vonrNm?: string // 차주명
  vonrBrno?: string // 차주사업자번호
  vhclPsnCd?: string // 차량소유구분코드
  koiCd?: string // 유종코드
  vhclTonCd?: string // 톤수코드
  lcnsTpbizCd?: string // 면허업종코드
  stlmCardNo?: string // 결제카드번호
  rissuBfrCardNo?: string // 재발급이전카드번호
  cardSeCd?: string // 카드구분코드
  cardBzmnSeCd?: string // 카드사업자구분코드
  vldPrdYm?: string // 유효기간년월
  bzentyNm?: string // 업체명
  locgovAprvYn?: string // 지자체승인여부
  telno?: string // 전화번호
  trsmYn?: string // 전송여부
  transDt?: string // 전송일자
  rgtrId?: string // 등록ID
  regDt?: string // 등록일
  mdfrId?: string // 수정ID
  updateDt?: string // 수정일
  cardAplyYmd?: string // 등록일
  idntyYmd?: string // 전송일자
  cardNoS?: string // 카드번호(암호화)
  cardNoD?: string // 카드번호(복호화)
  cardNo?: string // 카드번호(암호화)
  crnoD?: string // 사업자번호(복호화)
  crnoS?: string // 사업자번호(암호화)
  crno?: string // 사업자번호(암호화)
  vonrRrno?: string // 주민번호(암호화)
  vonrRrnoD?: string // 주민번호(복호화)
  vonrRrnoS?: string // 주민번호(암호화)
  crnoEncpt?: string // 법인등록번호(암호화)
  rprsvNm?: string // 대표자명
  rprsvRrno?: string // 대표자 주민번호
  bzmnSeCd?: string // 사업자구분코드
  koiNm?: string // 유종명
  vhclTonNm?: string // 톤수명
  crdcoNm?: string // 카드사명
  vhclPsnNm?: string // 소유구분명
  cardSeNm?: string // 카드구분명
  issuGbNm?: string // 처리구분명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngRegDt: string
  endRegDt: string
  locgovCd: string
  ctpvCd: string
  errCd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 0, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngRegDt: '', // 시작일
    endRegDt: '', // 종료일
    locgovCd: '',
    ctpvCd: '',
    errCd: '',
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
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('date', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({ ...prev, bgngDt: startDate, endDt: endDate }))
  }
  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)

    let bgngRegDt = dateRange.startDate
    let endRegDt = dateRange.endDate

    setParams((prev) => ({ ...prev, bgngRegDt: bgngRegDt, endRegDt: endRegDt }))
  }, [])

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      setLoadingBackdrop(true)
      let endpoint: string =
        `/fsm/mng/cijaf/tr/cardIssuJdgAtmcFailExcel?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.errCd ? '&errCd=' + params.errCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngRegDt ? '&bgngRegDt=' + params.bgngRegDt.replace(/-/g, '') : ''}` +
        `${params.endRegDt ? '&endRegDt=' + params.endRegDt.replace(/-/g, '') : ''}`

      await getExcelFile(endpoint, BCrumb[3].title + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedRow(null)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cijaf/tr/getAllCardIssuJdgAtmcFailTr?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.errCd ? '&errCd=' + params.errCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngRegDt ? '&bgngRegDt=' + params.bgngRegDt.replace(/-/g, '') : ''}` +
        `${params.endRegDt ? '&endRegDt=' + params.endRegDt.replace(/-/g, '') : ''}`

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
        setInitialState()
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      alert(error)
      setInitialState()
    } finally {
      setLoading(false)
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
  const handleRowClick = (row: Row) => {
    setSelectedRow(row)
    if (selectedRow === row) {
      setIsDetailOpen(!isDetailOpen)
    } else {
      setIsDetailOpen(true)
    }
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngRegDt' || name === 'endRegDt') {
      const otherDateField = name === 'bgngRegDt' ? 'endRegDt' : 'bgngRegDt'
      const otherDate = params[otherDateField]

      setExcelFlag(false)
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    } else {
      setExcelFlag(false)
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
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

    if (changedField === 'bgngRegDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer
      title="카드발급심사 자동탈락내역"
      description="카드발급심사 자동탈락내역"
    >
      {/* breadcrumb */}
      <Breadcrumb title="카드발급심사 자동탈락내역" items={BCrumb} />
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
              <CtpvSelect
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
              <LocgovSelect
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
                htmlFor="sch-errCd"
              >
                오류사유
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="034"
                pValue={params.errCd}
                handleChange={handleSearchChange}
                pName="errCd"
                htmlFor={'sch-errCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                placeholder=""
                fullWidth
                name="vhclNo"
                text={params.vhclNo}
                onChange={handleSearchChange}
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
                시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngRegDt"
                value={params.bgngRegDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endRegDt"
                value={params.endRegDt}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button variant="contained" color="success" onClick={excelDownload}>
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={mngCijafTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <>
        {selectedRow && isDetailOpen ? (
          <DetailDataGrid
            row={selectedRow as Row} // 목록 데이터
          />
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
