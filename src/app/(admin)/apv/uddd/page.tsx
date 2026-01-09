'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import {
  getDateRange,
  getExcelFile,
  getToday,
  isNumber,
} from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'
import { apvUdddTxHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '택시거래정보',
  },
  {
    to: '/apv/uddd',
    title: '미할인거래내역',
  },
]

export interface Row {
  cardNo: string
  trauDt: string
  dailUseAcmlNmtm: string
  vhclNo: string
  brno: string
  flnm: string
  frcsNm: string
  frcsBrno: string
  moliatUseLiter: string
  useLiter: string
  aprvAmt: string
  moliatAsstAmt: string
  vhclPorgnUntprc: string
  opisAmt: string
  literAcctoOpisAmt: string
  exsMoliatAsstAmt: string
  crdcoNm: string
  locgovNm: string
  dlngSeNm: string
  koiUnitNm: string
  aprvRspnsNm: string
  pbillAmt: string
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
  brno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

// 조회하여 가져온 정보를 Table에 넘기는 객체

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const dateRange = getDateRange('sm', 0)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: String(allParams.searchStDate ?? dateRange.startDate), // 시작일
    searchEdDate: String(allParams.searchEdDate ?? dateRange.endDate), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
    brno: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 5, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!params.ctpvCd) {
      alert('시도명을 선택 해주세요.')
      return
    }

    if (!params.locgovCd) {
      alert('관할관청을 선택 해주세요.')
      return
    }

    if (
      params.searchStDate.replaceAll('-', '') <= '20191231' &&
      params.searchEdDate.replaceAll('-', '') >= '20200101'
    ) {
      alert('2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.')
      return
    }

    if (params.searchStDate > params.searchEdDate) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
      return
    }

    setLoading(true)
    setExcelFlag(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/uddd/tx/getAllUnDscntDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` + // 시도코드
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + // 관할관청
        `${params.aprvRspnsCd ? '&aprvRspnsCd=' + params.aprvRspnsCd : ''}` + // 미할인사유
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` + // 업종구분
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` + // 차량번호
        `${params.brno ? '&brno=' + params.brno.replaceAll('-', '') : ''}` + // 사업자등록번호
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` + // 카드사
        `${params.flnm ? '&flnm=' + params.flnm : ''}` + // 업체명
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` + // 가맹점명
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` + // 유종
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` + // 거래시작년월일
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` // 거래종료년월일

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
      setFlag(false)
      setLoading(false)
    }
  }

  const excelDownload = async () => {
    if (
      params.searchStDate.replaceAll('-', '') <= '20191231' &&
      params.searchEdDate.replaceAll('-', '') >= '20200101'
    ) {
      alert('2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.')
      return
    }

    if (params.searchStDate > params.searchEdDate) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
      return
    }

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
        `/fsm/apv/uddd/tx/getExcelUnDscntDelngDtls?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` + // 시도코드
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + // 관할관청
        `${params.aprvRspnsCd ? '&aprvRspnsCd=' + params.aprvRspnsCd : ''}` + // 미할인사유
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}` + // 업종구분
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` + // 차량번호
        `${params.brno ? '&brno=' + params.brno.replaceAll('-', '') : ''}` + // 사업자등록번호
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` + // 카드사
        `${params.flnm ? '&flnm=' + params.flnm : ''}` + // 업체명
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` + // 가맹점명
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` + // 유종
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` + // 거래시작년월일
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` // 거래종료년월일

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setExcelFlag(false)
    if (name === 'searchStDate' || name === 'searchEdDate') {
      setParams((prev) => ({ ...prev, [name]: value }))
    } else if (name === 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
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

  return (
    <PageContainer title="미할인거래내역조회" description="미할인거래내역조회">
      {/* breadcrumb */}
      <Breadcrumb title="미할인거래내역조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="form-list">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-ctpvCd"
                  className="input-label-display"
                  required
                >
                  시도명
                </CustomFormLabel>
                <CtpvSelect
                  pName="ctpvCd"
                  pValue={params.ctpvCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-ctpvCd'}
                />
              </div>

              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-locgovCd"
                  className="input-label-display"
                  required
                >
                  관할관청
                </CustomFormLabel>
                <LocgovSelect
                  pName="locgovCd"
                  pValue={params.locgovCd}
                  handleChange={handleSearchChange}
                  ctpvCd={params.ctpvCd}
                  htmlFor={'sch-locgovCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  거래일자
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                  required
                >
                  거래일자
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
                  종료일
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
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-aprvRspnsCd"
                  className="input-label-display"
                  required
                >
                  미할인사유
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'CDE0'}
                  pValue={params.aprvRspnsCd}
                  handleChange={handleSearchChange}
                  pName={'aprvRspnsCd'}
                  addText="전체"
                  htmlFor={'sch-aprvRspnsCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-bzmnSeCd"
                  className="input-label-display"
                  required
                >
                  개인법인구분
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'CBG0'}
                  pValue={params.bzmnSeCd}
                  handleChange={handleSearchChange}
                  pName={'bzmnSeCd'}
                  defaultValue={''}
                  addText="전체"
                  htmlFor={'sch-bzmnSeCd'}
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
                  type="text"
                  id="ft-vhclNo"
                  name="vhclNo"
                  fullWidth
                  value={params.vhclNo}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-brno"
                >
                  사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  id="ft-brno"
                  type="text"
                  name="brno"
                  fullWidth
                  value={params.brno}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-crdcoCd"
                >
                  카드사
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'CCGC'}
                  pValue={params.crdcoCd}
                  handleChange={handleSearchChange}
                  pName={'crdcoCd'}
                  addText="전체"
                  htmlFor={'sch-crdcoCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-flnm"
                >
                  업체명
                </CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-flnm"
                  name="flnm"
                  fullWidth
                  value={params.flnm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-fname"
                >
                  가맹점명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-fname"
                  type="text"
                  name="frcsNm"
                  fullWidth
                  value={params.frcsNm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-koiCd"
                >
                  유종
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'KOI3'}
                  pValue={params.koiCd}
                  handleChange={handleSearchChange}
                  pName={'koiCd'}
                  addText="전체"
                  htmlFor={'sch-koiCd'}
                />
              </div>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
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
          headCells={apvUdddTxHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption={'택시 미할인 거래내역 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
