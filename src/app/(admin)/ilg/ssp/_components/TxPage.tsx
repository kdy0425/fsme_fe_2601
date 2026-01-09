'use client'
import { Box, Button } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// components
import {
  CtpvSelect,
  CtpvSelectAll,
  LocgovSelect,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { getDateRange, getExcelFile, getToday, isNumber } from '@/utils/fsms/common/comm'
import { HeadCell, Pageable2 } from 'table'
import TxDetail from './TxDetail'

const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'vonrRrnoSe',
    numeric: false,
    disablePadding: false,
    format: 'rrno',
    label: '주민등록번호',
  },
  {
    id: 'vonrBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'bgngYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'endYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지종료일',
    format: 'yyyymmdd',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
]

export interface Row {
  vhclNo: string
  hstrySn: string
  brno: string
  vonrBrno: string
  vonrNm: string
  vonrRrnoS: string
  vhclPsnCd: string
  secureVonrRrno: string
  vonrRrno: string
  vonrRrnoSe: string
  locgovCd: string
  koiCd: string
  koiNm: string
  bgngYmd: string
  endYmd: string
  chgSeCd: string
  chgRsnCn: string
  trsmYn: string
  trsmDt: string
  delYn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  locgovNm: string
  moliatOtspyYn: string
  ntsOtspyYn: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  vonrNm: string
  bgngYmd: string
  endYmd: string
  vonrRrno: string
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
    bgngYmd: '',
    endYmd: '',
    vonrRrno: '',
  })
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })

  /* 화면로드시 */
  useEffect(() => {
    // 조회조건 세팅
    setParams((prev) => ({
      ...prev,
      bgngYmd: getDateRange('d', 30).startDate,
      endYmd: getDateRange('d', 30).endDate,
    }))
  }, [])

  // 플래그를 통한 데이터 갱신
  useEffect(() => {
    setSelectedIndex(-1)
    setSelectedRow(null)
    if (flag != null) {
      fetchData()
    }    
  }, [flag])

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

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {    

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
  
        // 검색 조건에 맞는 endpoint 생성
        const endpoint: string =
          '/fsm/ilg/ssp/tx/getAllSbsidyStopPymnt' + toQueryParameter(searchObj)
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
          handleRowClick(response.data.content[0], 0)
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
  }

  const excelDownload = async () => {
    const searchObj = {
      ...params,
      bgngYmd: params.bgngYmd.replaceAll('-', ''),
      endYmd: params.endYmd.replaceAll('-', ''),
      excelYn: 'Y',
    }

    const endpoint =
      '/fsm/ilg/srp/tx/sbsidyRejectPymntExcel' + toQueryParameter(searchObj)
    await  getExcelFile(endpoint, '택시보조금지급정지_' + getToday() + '.xlsx')
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((selectedRow: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(selectedRow)
  }, [])

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'vonrRrno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))  
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }    
  }

  return (
    <>
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            {/* 시도 조회조건 */}
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

            {/* 관할관청 조회조건 */}
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
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                placeholder=""
                fullWidth
                name="vhclNo"
                value={params.vhclNo} // 빈 문자열로 초기화
                onChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrNm"
                placeholder=""
                fullWidth
                name="vonrNm"
                text={params.vonrNm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                정지일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                정지 시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngYmd"
                value={params.bgngYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                정지 종료일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endYmd"
                value={params.endYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vonrRrno"
              >
                주민등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrRrno"
                type="text"
                name="vonrRrno"
                value={params.vonrRrno}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
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
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      {/* 테이블영역 끝 */}

      <TxDetail
        row={selectedRow as Row} // 목록 데이터
      />
    </>
  )
}

export default DataList
