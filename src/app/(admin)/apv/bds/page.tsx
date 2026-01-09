'use client'
import {
  Box,
  Button,
  FormControlLabel,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// types
// import FormDialog from '@/app/components/bs/popup/ApvDetailDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from '@/app/components/bs/popup/ApvDetailModal'
import { SelectItem } from 'select'
import {
  getCityCodes,
  getCodesByGroupNm,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'
import ApvDetailModal from '@/components/bs/popup/ApvDetailModal'
import { apvlBdsHC } from '@/utils/fsms/headCells'

import { isNumber } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '버스거래정보',
  },
  {
    to: '/apv/bds',
    title: '업체별거래내역',
  },
]

export interface Row {
  dlngYm?: string // 거래년월                     // 모달 헤더에서 사용됨.
  locgovNm?: string // 지자체명                   // 모달 헤더에서 사용됨.
  locgovCd?: string // 지자체코드
  brno?: string // 사업자번호                     // 모달 헤더에서 사용됨.
  bzentyNm?: string // 업체명
  vhclSeNm?: string // 면허업종
  koiNm?: string // 유종
  lbrctStleNm?: string // 주유형태
  dlngNocs?: string // 거래건수?
  aprvAmt?: string // 거래건수?
  fuelQty?: string // 주유/충전량
  asstAmt?: string // 보조금
  ftxAsstAmt?: string // 유류세연동보조금
  opisAmt?: string // 유가연동보조금

  vhclSeCd?: string
  koiCd?: string // 유종
  lbrctStleCd?: string
  cardNo?: any // 카드번호
  setlApvlYmd?: any // ?
  stlmAprvYmd?: any // ?
  vhclNo?: any // 차량번호
  dlngDt?: any // ?
  cnptSeCd?: any // ?

  cnptSeNm?: any // ?
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [detailflag, setDetailFlag] = useState<number>(0) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [isModalOpen, setIsModalOpen] = useState(false) // modal   오픈 상태
  const [detailRows, setDetailRows] = useState<Row[]>([]) // 거래내역에 대한 Row
  const [selectedIndex, setSelectedIndex] = useState<number>()

  const [open, setOpen] = useState<boolean>(false)
  const [modalRowData, setModalRowData] = useState<Row[]>([])
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //

  // 조회하여 가져온 정보를 Table에 넘기는 객체
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd) {
      fetchData()
    }
  }, [flag])

  // useEffect 내에서 조건 추가
  useEffect(() => {
    if (detailflag > 0) {
      // detailflag가 1 이상일 때만 실행
      fetchDetails(selectedRow)
    }
  }, [detailflag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  useEffect(() => {
    let locgovCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]

    // 관할관청 select item setting
    getLocalGovCodes(params.ctpvCd).then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['locgovNm'],
            value: code['locgovCd'],
          }

          locgovCodes.push(item)
        })
      }
    })
  }, [params.ctpvCd])

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // "-" 제거하고 반환
    return dateString.replace('-', '')
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (((params.bgngDt.replace('-', '') <= "20191231" && params.endDt.replace('-', '') >= "20200101") 
      || (params.bgngDt.replace('-', '') <= "201912" && params.endDt.replace('-', '') >= "202001"))) {
      alert("2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.");
      return;
    }
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setLoading(true)
    setExcelFlag(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/bds/bs/getAllByenDelngSttus?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.koiCd ? '&' + 'koiCd' + '=' + params.koiCd : ''}` +
        `${params.lbrctStleCd ? '&' + 'lbrctStleCd' + '=' + params.lbrctStleCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
        `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}`

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

  // Fetch를 통해 데이터 갱신
  const fetchDetails = async (selectedRow: Row | undefined) => {
    setLoading(true)
    if (selectedRow == undefined) {
      alert('가져온 데이터가 없습니다.')
      return
    }
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/bds/bs/getAllByenDelngSttusDtl?page=` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${selectedRow.brno ? '&brno=' + selectedRow.brno : ''}` +
        `${selectedRow.dlngYm ? '&dlngYm=' + selectedRow.dlngYm : ''}` +
        `${selectedRow.vhclSeCd ? '&vhclSeCd=' + selectedRow.vhclSeCd : ''}` +
        `${selectedRow.koiCd ? '&' + 'koiCd' + '=' + selectedRow.koiCd : ''}` +
        `${selectedRow.lbrctStleCd ? '&lbrctStleCd=' + selectedRow.lbrctStleCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data)
      } else {
        console.error('no surch fetching data:')
        setDetailRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
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

    setIsExcelProcessing(true)

    try {
      let endpoint: string =
        `/fsm/apv/bds/bs/getExcelByenDelngSttus?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.koiCd ? '&' + 'koiCd' + '=' + params.koiCd : ''}` +
        `${params.lbrctStleCd ? '&' + 'lbrctStleCd' + '=' + params.lbrctStleCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
        `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '업체별거래현황.xlsx')
      document.body.appendChild(link)
      link.click()
      // if (response && response.resultType === 'success' && response.data) {
      //   // 데이터 조회 성공시

      // } else {
      //   // 데이터가 없거나 실패

      // }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
    }
    setIsExcelProcessing(false)
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((selectedRow: Row, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedIndex(index)
  }, [])

  const handleModalOpen = async () => {
    if (!selectedRow) {
      setOpen(false)
      alert('행을 먼저 선택하세요.')
      return
    }

    try {
      //setSelectedVhclNo(selectedRow.vhclNo)
      let endPoint =
        `/fsm/apv/bds/bs/getAllByenDelngSttusDtl?page=` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}` +
        `${selectedRow.brno ? '&brno=' + selectedRow.brno : ''}` +
        `${selectedRow.dlngYm ? '&dlngYm=' + selectedRow.dlngYm : ''}` +
        `${selectedRow.vhclSeCd ? '&vhclSeCd=' + selectedRow.vhclSeCd : ''}` +
        `${selectedRow.koiCd ? '&' + 'koiCd' + '=' + selectedRow.koiCd : ''}` +
        `${selectedRow.lbrctStleCd ? '&lbrctStleCd=' + selectedRow.lbrctStleCd : ''}`

      const response = await sendHttpRequest('GET', endPoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setModalRowData(response.data)
        setOpen(true)
      } else {
        setModalRowData([])
      }
    } catch (error) {
      console.error('Error ::: ', error)
      setModalRowData([])
    }
  }

  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    //setParams((prev) => ({ ...prev, [name]: value }))
    if (isNumber(value) || name !== 'brno') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
    }
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
    <PageContainer title="업체별거래현황" description="업체별거래현황">
      {/* breadcrumb */}
      <Breadcrumb title="업체별거래현황" items={BCrumb} />
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
                htmlFor="ft-car-name"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                name="brno"
                value={params.brno}
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
                id="ft-car-name"
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                청구 년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngDt"
                onChange={handleSearchChange}
                inputProps={{ max: params.endDt }}
                value={params.bgngDt}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                청구 종료 년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endDt"
                onChange={handleSearchChange}
                inputProps={{ min: params.bgngDt }}
                value={params.endDt}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-lbrctStleCd"
              >
                주유형태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="550"
                pValue={params.lbrctStleCd}
                handleChange={handleSearchChange}
                pName="lbrctStleCd"
                htmlFor={'sch-lbrctStleCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclSeCd"
              >
                면허업종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="505"
                pValue={params.vhclSeCd}
                handleChange={handleSearchChange}
                pName="vhclSeCd"
                htmlFor={'sch-vhclSeCd'}
                addText="전체"
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
                cdGroupNm="599"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
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
              onClick={handleModalOpen}
              variant="contained"
              color="primary"
            >
              거래상세내역
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            {/* 테이블영역 끝 */}
            <ApvDetailModal
              open={open}
              title={'거래상세내역조회'}
              size={'xl'}
              handleOpen={() => {}}
              handleClose={() => setOpen(false)}
              modalRow={modalRowData}
              selectedRow={selectedRow}
              dlngYm={selectedRow ? (selectedRow.dlngYm ?? '') : ''}
              brno={selectedRow ? (selectedRow.brno ?? '') : ''}
              locgovNm={selectedRow ? (selectedRow.locgovNm ?? '') : ''}
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvlBdsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedIndex}
          caption={'업체별거래현황 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
