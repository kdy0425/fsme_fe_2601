'use client'
import {
  Box,
  Button,
  FormControlLabel,
  RadioGroup,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import VhclHisSearchModal, {
  VhclHisRow,
} from '@/components/bs/popup/VhclHisSearchModal'
import { brNoFormatter, getDateRange } from '@/utils/fsms/common/util'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getFormatToday,
} from '@/utils/fsms/common/comm'
import { apvlVmddHC } from '@/utils/fsms/headCells'
import { isNumber } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils'

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
    to: '/apv/vmdd',
    title: '차량월별거래내역',
  },
]

export interface Rows {
  vhclNo: string //차량번호
  dlngYm: string //주유월
  fuelQty: string //주유/충전량
  asstAmt: string //보조금
  ftxAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  vhclSeNm: string //면허업종
  koiNm: string //유종
  lbrctStleNm: string //주유형태
  locgovNm: string //관할관청
  bzentyNm: string //업체명
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

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [rows, setRows] = useState<Rows[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([])
  const [koicdItems, setKoicdItems] = useState<SelectItem[]>([]) // 유종 코드
  const [lbrctStleCdItems, setLbrctStleCdItems] = useState<SelectItem[]>([]) // 주유형태 코드
  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false) // 관할관청 전체 검색 체크여부
  const [selectedBrno, setSelecteBrno] = useState<string>('')
  const [selectedBzentyNm, setSelectedBzentyNm] = useState<string>('')
  const [vhclHisOpen, setVhclHisOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Rows>()
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)
  const userInfo = getUserInfo()

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
    totalPages: 1, // 정렬 기준
  })

  // 상세 모달팝업을 위한 상태값 정의
  const [open, setOpen] = useState<boolean>(false)
  const [historyData, setHistoryData] = useState<VhclHisRow[] | null>(null)

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('month', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()

    getCtpvCd().then((itemArr) => {
      setCtpvCdItems(itemArr)
      setParams((prev) => ({ ...prev, ctpvCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
    }) // 시도코드

    getCommCd('599', '전체').then((itemArr) => setKoicdItems(itemArr)) // 유종코드
    getCommCd('550', '전체').then((itemArr) => setLbrctStleCdItems(itemArr)) //업무구분코드
  }, [])

  useEffect(() => {
    // 시도 코드 변경시 관할관청 재조회
    // 관할관청
    if (params.ctpvCd) {
      getLocGovCd(params.ctpvCd).then((itemArr) => {
        setLocalGovCode(itemArr)
        setParams((prev) => ({ ...prev, locgovCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
      })
    }
  }, [params.ctpvCd])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (((params.searchStDate.replace('-', '') <= "20191231" && params.searchEdDate.replace('-', '') >= "20200101") 
      || (params.searchStDate.replace('-', '') <= "201912" && params.searchEdDate.replace('-', '') >= "202001"))) {
      alert("2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.");
      return;
    }
    setSelecteBrno('')
    setSelectedBzentyNm('')
    setLoading(true)
    setExcelFlag(true)
    try {
      if (!params.searchStDate || !params.searchEdDate) {
        alert('거래년월을 입력해주세요.')
        return
      }

      if (!params.brno && !params.vhclNo) {
        alert('사업자등록번호 또는 차량번호를 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/vmdd/bs/getAllVhcleMnbyDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${!isLocgovCdAll && params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${!isLocgovCdAll && params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.lbrctStleCd ? '&lbrctStleCd=' + params.lbrctStleCd : ''}` +
        ``

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
        setSelecteBrno(response.data.content[0].brno)
        setSelectedBzentyNm(response.data.content[0].bzentyNm)
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
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
      setFlag(false)
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
        `/fsm/apv/vmdd/bs/getExcelVhcleMnbyDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${!isLocgovCdAll && params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${!isLocgovCdAll && params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.lbrctStleCd ? '&lbrctStleCd=' + params.lbrctStleCd : ''}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '차량월별거래내역.xlsx')
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
    }
    setIsExcelProcessing(false)
  }
  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Rows) => {
    setSelectedRow(row)
    setVhclHisOpen(true)
  }

  // 글쓰기 페이지로 이동하는 함수
  const handleWriteClick = () => {
    router.push(`./create${qString}`) // '/create'는 글쓰기 페이지의 경로입니다.
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
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
    <PageContainer title="차량월별거래내역" description="차량월별거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="차량월별거래내역" items={BCrumb} />
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
                pDisabled={isLocgovCdAll}
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
                pDisabled={isLocgovCdAll}
              />
            </div>

            <div className="form-group" style={{ maxWidth: '5rem' }}>
              <FormControlLabel
                sx={userInfo.roles[0] == 'LOGV' ? { display: 'none' } : {}}
                control={
                  <CustomCheckbox
                    name="isLocgovCdAll"
                    value={isLocgovCdAll}
                    onChange={() => setIsLocgovCdAll(!isLocgovCdAll)}
                  />
                }
                label="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{
                  max: getFormatToday(),
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                  max: getFormatToday(),
                }}
                fullWidth
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
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                htmlFor="ft-brno"
                className="input-label-display"
                required
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                name="brno"
                id="ft-brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
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

            <div className="form-group">
              <CustomFormLabel
                htmlFor="ft-vhclNo"
                className="input-label-display"
                required
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                id="ft-vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
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
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              {/* <Button type='submit' variant="contained" color="primary"> */}
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
        <div className="table-scrollable">
          <table className="table table-bordered">
            <caption>가이드 타이틀 테이블 요약</caption>
            <colgroup>
              <col style={{ width: '20%' }}></col>
              <col style={{ width: 'auto' }}></col>
              <col style={{ width: '20%' }}></col>
              <col style={{ width: 'auto' }}></col>
            </colgroup>
            <tbody>
              <tr>
                <th className="td-head" scope="row">
                  사업자등록번호
                </th>
                <td>{brNoFormatter(selectedBrno)}</td>
                <th className="td-head" scope="row">
                  업체명
                </th>
                <td>{selectedBzentyNm}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>

      <Box sx={{ padding: '32px 0' }}></Box>

      <Box>
        <div className="data-grid-top-toolbar">
          <div className="data-grid-search-count">
            검색 결과 <span className="search-count">{totalRows}</span>건
          </div>
        </div>

        <TableDataGrid
          headCells={apvlVmddHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowDoubleClick={handleRowClick} // 행 더블 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={'차량월별거래내역 조회 목록'}
        />
      </Box>
      <VhclHisSearchModal
        onCloseClick={() => setVhclHisOpen(false)}
        title="차량이력 조회"
        url="/fsm/apv/vmdd/bs/getAllVhcleMngHis"
        open={vhclHisOpen}
        row={selectedRow}
      />
      <Box style={{ textAlign: 'center' }}>
        <h3>
          ※거래내역을 더블클릭하면 해당 차량의 이력조회를 확인 할 수 있습니다.
        </h3>
      </Box>

      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
