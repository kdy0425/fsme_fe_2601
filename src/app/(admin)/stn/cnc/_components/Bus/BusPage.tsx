'use client'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Button,
  MenuItem,
  Stack,
  TableHead,
  TableRow,
} from '@mui/material'
import { Label } from '@mui/icons-material'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import { useRouter, useSearchParams } from 'next/navigation'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import BlankCard from '@/components/shared/BlankCard'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable, Pageable2 } from 'table'
import DetailDataGrid from './DetailDataGrid'
import { SelectItem } from 'select'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getCommCd,
  getCtpvCd,
  getExcelFile,
  getLocGovCd,
  getToday,
} from '@/utils/fsms/common/comm'
import { TableCell } from '@mui/material'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { stncncBSCarNetCmprinfoTrHc } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/cnc',
    title: '자동차망비교조회',
  },
]

// 커스텀 헤더 등록
const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={10}>
          FSMS 차량 정보
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
          변경사항
        </TableCell>
        {/* <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={7}>
          변경사항
        </TableCell> */}
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>사업자번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>업체명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>주민등록번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>법인등록번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>지자체명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>면허업종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>대표자명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태</TableCell>

        <TableCell style={{ whiteSpace: 'nowrap' }}>업체명 변경</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>사업자번호 변경</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>주민번호 변경</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>면허업종 변경</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>지자체 변경</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태 변경</TableCell>
      </TableRow>
    </TableHead>
  )
}

export interface Row {
  vhclNo?: string // 차량번호
  vhclSeNm?: string // 면허업종
  brno?: string // 사업자번호
  bzentyNm?: string // 업체명
  locgovCd?: string // 지자체코드
  vhclSttsCd?: string // 차량상태
  vhclSttsNm?: string // 차량상태명
  carBrno?: string // 사업자번호
  vonrNm?: string // 차주명
  carRrno?: string // 주민번호
  carRrnoHid?: string // 주민번호 암호화
  carCrno?: string // 법인번호
  carKoiCd?: string // 유종
  carKoiNm?: string // 유종명
  carBzmnSeCd?: string // 사업자구분
  carLocgovCd?: string // 지자체코드
  carLocgovNm?: string // 지자체명
  bzmnSeCdNm?: string // 사업자구분명
  mdfcnDt?: string // 수정일자
  carDscntYn?: string // 차량할인상태여부
  netKoiCd?: string | null // 자동차망 유종
  netLocgovCd?: string | null // 자동차망 지자체정보
  netReowUserSeCd?: string | null // 자동차망 대표사용자구분코드
  netReowNm?: string | null // 자동차망 소유자명
  newLocgovNm?: string | null // 변경된 지자체명
  netCarBrno?: string // 자동차망 사업자번호
  netCarRrno?: string // 자동차망 주민번호
  netVhclSttsCd?: string | null // 자동차망 차량상태
  carReowNmChangeYn?: string // 대표자명 변경여부
  carBrnoChangeYn?: string // 사업자번호 변경여부
  carRrnoChangeYn?: string // 주민번호 변경여부
  vhclSeCdChangeYn?: string // 면허업종변경
  locgovCdChangeYn?: string // 지자체코드 변경여부
  vhclSttsCdChangeYn?: string // 차량상태 변경여부
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

export const BusPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [hisRows, setHisRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

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

  useEffect(() => {
    if (flag != null) {
      if (params.ctpvCd) {
        fetchData()
      }
    }
  }, [flag])

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField = name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate as string)) {
        setExcelFlag(false)
        setParams((prev) => ({ ...prev, page: 1, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
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

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedIndex(index ?? -1)
    setHistoryFlag((prev) => !prev)
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

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (selectedRow === undefined) {
      return
    }
    fetchHistoryData()
  }, [historyflag])

  // 버스 차량비교정보를 조회 파라미터 명세서 아직 안 나옴
  const fetchHistoryData = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        // 버스 차량비교정보 history data
        `/sample/data?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
        `${params.cardCnt ? '&cardCnt=' + params.cardCnt : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.crno ? '&crno=' + params.crno : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setHisRows(response.data)
      } else {
        console.error('조회에 실패했습니다.!')
        // 데이터가 없거나 실패
        setHisRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setHisRows([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setLoading(true)
    setHisRows([])
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/cnc/bs/getAllCarNetCmpr?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`
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
        `/fsm/stn/cnc/bs/getExcelCarNetCmpr?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
        `${params.cardCnt ? '&cardCnt=' + params.cardCnt : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.crno ? '&crno=' + params.crno : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}`

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

  return (
    <PageContainer
      title="자동차망비교조회"
      description="자동차망비교조회 페이지"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="form-list">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-ctpv"
                >
                  시도명
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
                  관할관청
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
                  htmlFor="sch-vhclSttsCd"
                >
                  자동차망 차량상태
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="006"
                  pValue={params.vhclSttsCd}
                  handleChange={handleSearchChange}
                  pName="vhclSttsCd"
                  htmlFor={'sch-vhclSttsCd'}
                />
              </div>
            </div>
            {/* 신청일자 datePicker */}
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-vhclNo"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  name="vhclNo"
                  value={params.vhclNo ?? ''}
                  onChange={handleSearchChange}
                  type="text"
                  id="ft-vhclNo"
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-bzentyNm"
                >
                  업체명
                </CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-bzentyNm"
                  name="bzentyNm"
                  fullWidth
                  value={params.bzentyNm ?? ''}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-brno"
                >
                  사업자 등록번호
                </CustomFormLabel>
                <CustomTextField
                  id="ft-brno"
                  name="brno"
                  value={params.brno ?? ''}
                  onChange={handleSearchChange}
                  type="number"
                  inputProps={{ maxLength: 10, type: 'number' }}
                  onInput={(e: {
                    target: { value: string; maxLength: number | undefined }
                  }) => {
                    e.target.value = Math.max(0, parseInt(e.target.value))
                      .toString()
                      .slice(0, e.target.maxLength)
                  }}
                  placeholder="숫자만 입력 가능합니다."
                  fullWidth
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

      {/* 검색영역 끝 */}

      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          rows={rows} // 목록 데이터
          customHeader={customHeader}
          headCells={stncncBSCarNetCmprinfoTrHc}
          selectedRowIndex={selectedIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={'버스 자동차망비교 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <>{hisRows && hisRows.length > 0 && <DetailDataGrid rows={hisRows} />}</>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default BusPage
