'use client'
import { Box, Button, Grid } from '@mui/material'
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
import {
  getDateRange,
  getExcelFile,
  getLocGovCd,
  getToday,
} from '@/utils/fsms/common/comm'
import { mngGprcHC } from '@/utils/fsms/headCells'
import {
  CommSelect,
  CtpvSelectAll,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import DetailDataGrid from './_components/DetailDataGrid'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/gprc',
    title: '서면신청(일반) 변경관리',
  },
]

export interface Row {
  locgovCd?: string // 지자체코드
  vhclNo?: string // 차량번호
  clclnYm?: string // 주유월
  aplySn?: string // 신청순번
  koiCd?: string // 유종코드
  koiNm?: string // 유종
  vhclTonCd?: string // 차량톤수코드
  vhclTonNm?: string // 차량톤수
  useLiter?: string // 유류사용량
  tclmAmt?: string // 총청구금액
  cashBillAmt?: string // 총청구금액(원단위절삭)
  tclmLiter?: string // 정산리터
  vhclPsnCd?: string // 차량소유코드
  vhclPsnNm?: string // 차량소유구분
  crno?: string // 법인등록번호
  crnoDe?: string // 법인등록번호(완전복호화)
  vonrRrno?: string // 주민등록번호
  vonrBrno?: string // 사업자등록번호
  vonrRrnoDeS?: string // 주민등록번호(부분복호화)
  vonrNm?: string // 소유자명
  prcsSttsCd?: string // 처리상태코드
  prcsSttsNm?: string // 처리상태
  clclnCmptnYmd?: string // 정산완료일자
  giveCfmtnYmd?: string // 지급확정일자
  docmntAplyRsnCn?: string // 신청사유
  bacntInfoSn?: string // 계좌일련번호
  bankCd?: string // 금융기관코드
  bankNm?: string // 금융기관
  actno?: string // 계좌번호
  dpstrNm?: string // 예금주명
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
  trsmYn?: string // 전송여부
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngAprvYmd: string
  endAprvYmd: string
  ctpvCd: string // 시도명 코드
  locgovCd: string // 관할관청 코드
  prcsSttsCd: string // 처리 상태 코드
  vhclNo: string // 차량번호
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [rowIndex, setRowIndex] = useState(-1)
  const [isDetailOn, setIsDetailOn] = useState(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngAprvYmd: '', // 시작일
    endAprvYmd: '', // 종료일
    ctpvCd: '', // 시도명 코드
    locgovCd: '', // 관할관청 코드
    prcsSttsCd: '', // 처리 상태 코드
    vhclNo: '', // 차량번호
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
      bgngAprvYmd: startDate,
      endAprvYmd: endDate,
    }))
  }, [])

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setParams((prev) => ({
      ...prev,
      page: 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: 10,
    }))
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // 조회 Validation
  const schValidation = () => {
    if (!params.bgngAprvYmd) {
      alert('시작거래년월을 입력해주세요.')
    } else if (!params.endAprvYmd) {
      alert('종료거래년월을 입력해주세요.')
    } else if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
    } else if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
    } else if (new Date(params.bgngDt) > new Date(params.endDt)) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
    } else {
      return true
    }
    return false
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!schValidation()) {
      return
    }
    setLoading(true)
    setInitialState()
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/gprc/tr/getAllGnrlPapersReqst?page=${params.page}&size=${params.size}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}`

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
        setSelectedRow(undefined)
      } else {
        // 데이터가 없거나 실패
        setInitialState()
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setInitialState()
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  const excelDownload = async () => {
    let endpoint: string =
      `/fsm/mng/gprc/tr/gnrlPapersReqstExcel?` +
      `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
      `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}`

    await  getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
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

    if (changedField === 'bgngAprvYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setRowIndex(index ?? -1)
    if (rowIndex === index) {
      setIsDetailOn(!isDetailOn)
    } else {
      setIsDetailOn(true)
    }
  }

  return (
    <PageContainer
      title="서면신청(일반) 변경관리"
      description="서면신청(일반) 변경관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="서면신청(일반) 변경관리" items={BCrumb} />
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
              <CustomFormLabel className="input-label-display">
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngAprvYmd"
                value={params.bgngAprvYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endAprvYmd"
                value={params.endAprvYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-prcsSttsCd"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="046"
                pValue={params.prcsSttsCd}
                handleChange={handleSearchChange}
                pName="prcsSttsCd"
                htmlFor={'sch-prcsSttsCd'}
                addText="전체"
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
          headCells={mngGprcHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange} // 페이지, 사이즈 변경 핸들러 추가
          pageable={pageable}
          paging={true}
          cursor={true}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <Box style={{ display: isDetailOn ? 'block' : 'none' }}>
        {/* <Grid item xs={4} sm={4} md={4}>
          <DetailDataGrid detail={rows[rowIndex]} reload={() => setFlag((prev) => !prev)}/>
        </Grid> */}
        {selectedRow && rows.length > 0 && rowIndex >= 0 ? (
          <Grid item xs={4} sm={4} md={4}>
            <DetailDataGrid detail={rows[rowIndex]} reload={() => setFlag((prev) => !prev)} />
          </Grid>
        ) : (
          ''
        )}
      </Box>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default DataList
