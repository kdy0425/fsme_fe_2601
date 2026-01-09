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
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/cvpl',
    title: '민원관리',
  },
]

const tonData = [
  {
    value: '01',
    label: '1톤이하',
  },
  {
    value: '03',
    label: '3톤이하',
  },
  {
    value: '05',
    label: '5톤이하',
  },
  {
    value: '08',
    label: '8톤이하',
  },
  {
    value: '10',
    label: '10톤이하',
  },
]

const fuelData = [
  {
    value: 'L',
    label: 'LPG',
  },
  {
    value: 'M',
    label: '경유',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'vhclTonCd',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
  {
    id: 'koiCd',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'crtrAplcnYmd',
    numeric: false,
    disablePadding: false,
    label: '고시기준일',
  },
  {
    id: 'crtrYear',
    numeric: false,
    disablePadding: false,
    label: '기준년도',
  },
  {
    id: 'avgUseLiter',
    numeric: false,
    disablePadding: false,
    label: '월지급기준량(L)',
  },
  {
    id: 'limUseRt',
    numeric: false,
    disablePadding: false,
    label: '한도비율(%)',
  },
  {
    id: 'crtrLimLiter',
    numeric: false,
    disablePadding: false,
    label: '한도리터(L)',
  },
]

/**
 *   {
        "koiCd": "LPG",
        "vhclTonCd": "1톤이하",
        "crtrAplcnYmd": "20090601",
        "crtrAplcnYmdHyp": null,
        "crtrYear": "2009",
        "limUseRt": "225.000000000",
        "crtrLimLiter": "1024.000",
        "avgUseLiter": "455.000"
    }
 * 
 */

export interface Row {
  // id:string;
  vhclTonCd?: string // 톤수
  koiCd?: string // 유종
  crtrAplcnYmd?: string // 고시기준일
  crtrYear?: string // 기준년도
  avgUseLiter: string // 월지급기준량
  limUseRt?: string // 한도비율
  crtrLimLiter?: string // 한도리터
}

const rowData: Row[] = [
  {
    // id: uniqueId(),
    vhclTonCd: '1톤이하', // 톤수
    koiCd: '경유', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '455', // 월지급기준량
    limUseRt: '150', // 한도비율
    crtrLimLiter: '683', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '1톤이하', // 톤수
    koiCd: 'LPG', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '455', // 월지급기준량
    limUseRt: '225', // 한도비율
    crtrLimLiter: '1,024', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '3톤이하', // 톤수
    koiCd: '경유', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '676', // 월지급기준량
    limUseRt: '150', // 한도비율
    crtrLimLiter: '1,014', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '3톤이하', // 톤수
    koiCd: 'LPG', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '676', // 월지급기준량
    limUseRt: '225', // 한도비율
    crtrLimLiter: '1,521', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '5톤이하', // 톤수
    koiCd: '경유', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '1,031', // 월지급기준량
    limUseRt: '150', // 한도비율
    crtrLimLiter: '1,547', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '5톤이하', // 톤수
    koiCd: 'LPG', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '1,031', // 월지급기준량
    limUseRt: '225', // 한도비율
    crtrLimLiter: '2,320', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '8톤이하', // 톤수
    koiCd: '경유', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '1,480', // 월지급기준량
    limUseRt: '150', // 한도비율
    crtrLimLiter: '2,220', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '8톤이하', // 톤수
    koiCd: 'LPG', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '1,480', // 월지급기준량
    limUseRt: '225', // 한도비율
    crtrLimLiter: '3,330', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '10톤이하', // 톤수
    koiCd: '경유', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '1,800', // 월지급기준량
    limUseRt: '150', // 한도비율
    crtrLimLiter: '2,700', // 한도리터
  },
  {
    // id: uniqueId(),
    vhclTonCd: '10톤이하', // 톤수
    koiCd: 'LPG', // 유종
    crtrAplcnYmd: '2024-09-01', // 고시기준일
    crtrYear: '2024', // 기준년도
    avgUseLiter: '1,800', // 월지급기준량
    limUseRt: '225', // 한도비율
    crtrLimLiter: '4,050', // 한도리터
  },
]

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

// 조회하여 가져온 정보를 Table에 넘기는 객체
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

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
  const [pageable, setPageable] = useState<pageable>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준
  })

  const [ton, setTon] = useState('1톤이하')
  const [fuel, setFuel] = useState('L')
  const [date, setDate] = useState('2024-10-15')

  const handleTonChange = (event: any) => {
    setTon(event.target.value)
  }

  const handleFuelChange = (event: any) => {
    setFuel(event.target.value)
  }

  const handleDateChange = (event: any) => {
    setDate(event.target.value)
  }

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/sample/posts?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.searchValue ? '&' + params.searchSelect + '=' + params.searchValue : ''}` +
        `${params.searchStDate ? '&pstgBgngYmd=' + params.searchStDate : ''}` +
        `${params.searchEdDate ? '&pstgEndYmd=' + params.searchEdDate : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber +1,
          pageSize: response.data.pageable.pageSize,
          sort: params.sort,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          sort: params.sort,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows(rowData)
      setTotalRows(rowData.length)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        sort: params.sort,
      })
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
      page: page + 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (postTsid: string) => {
    router.push(`./view/${postTsid}${qString}`) // 조회 페이지 경로
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
    <PageContainer title="서면신청 지급확정 취소" description="서면신청 지급확정 취소">

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                고시기준일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                고시기준일
              </CustomFormLabel>
              <CustomTextField type="date" id="ft-date-start" fullWidth />
              {/* <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">종료일</CustomFormLabel>
            <CustomTextField type="date" id="ft-date-end" fullWidth /> */}
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-ton">
                톤수
              </CustomFormLabel>
              <select
                id="ft-ton-select-01"
                className="custom-default-select"
                value={ton}
                onChange={handleTonChange}
                style={{ width: '100%' }}
              >
                {tonData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fuel"
              >
                유종
              </CustomFormLabel>
              <select
                id="ft-fuel-select-02"
                className="custom-default-select"
                value={fuel}
                onChange={handleFuelChange}
                style={{ width: '100%' }}
              >
                {fuelData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary">
              검색
            </Button>
            <Button variant="contained" color="primary">
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
