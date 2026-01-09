'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
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
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getDateRange,
  getExcelFile,
  getToday,
  calMonthsDate,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { isNumber } from '@/utils/fsms/common/comm'

// 헤더셀
import { apvbddtlsHeadCells } from '@/utils/fsms/headCells'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 공통코드용 추가
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'
import { PX } from '@amcharts/amcharts4/core'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '화물주유정보',
  },
  {
    to: '/apv/bdd',
    title: '가맹점별 거래내역',
  },
]

export interface Row {
  cnt: number
  vhclNo: string
  vonrNm: string
  crdcoCdNm: string
  crdcoCdNmS: string
  crdcoCd: string
  cardNo: string
  cardNoS: string
  cardNoSecure: String
  aprvYmd: string
  aprvTm: string
  aprvYmdTm: string
  aprvNo: string
  aprvYn: string
  stlmYn: string
  aprvAmt: string
  useLiter: string
  asstAmt: string
  asstAmtLiter: string
  unsetlLiter: string
  unsetlAmt: string
  frcsNm: string
  frcsCdNo: string
  cardSeCdNm: string
  cardSttsCdNm: string
  stlmCardNo: string
  stlmAprvNo: string
  ceckStlmYn: string
  origTrauTm: string
  origTrauYmdTm: string
  subsGb: string
  colorGb: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

// 조회하여 가져온 정보를 Table에 넘기는 객체
// type pageable = {
//   pageNumber: number
//   pageSize: number
//   totalPages: number
// }

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row>()
  const [crdCoCdItems, setCrdCoCdItems] = useState<SelectItem[]>([])
  const [cardSeCdItems, setCardSeCdItems] = useState<SelectItem[]>([])
  const [chk, setChk] = useState<boolean>(false) // 취소포함 flag
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false) // 로딩상태
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
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
    if (params.vhclNo || params.frcsBrno) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRangeStart = getDateRange('d', 60)
    const dateRangeEnd = getDateRange('d', 0)

    let startDate = dateRangeStart.startDate
    let endDate = dateRangeEnd.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
    setExcelFlag(false)
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  useEffect(() => {
    if (chk) {
      setParams((prev) => ({ ...prev, chk: '01' }))
    } else {
      setParams((prev) => ({ ...prev, chk: '' }))
    }
  }, [chk])

  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!isValidDateIn3Month(params.searchStDate, params.searchEdDate)) {
      alert('거래년월 조회기간은 3개월 이내이어야 합니다.')
      return
    }
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/bddtls/tr/bymrDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}` +
        `${params.cardNo ? '&cardNo=' + params.cardNo : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        console.log(response.data)
        //if(response.data.content[0] != undefined){
        //if(response.data.content[0].cnt < 10){
        const responseData = response.data.content.map((item: any) => ({
          ...item,
          color:
            item.colorGb === '일반'
              ? 'black'
              : item.colorGb === '취소'
                ? 'blue'
                : item.colorGb === '결제'
                  ? 'brown'
                  : item.colorGb === '휴지'
                    ? 'forestgreen'
                    : item.colorGb === '차감'
                      ? 'magenta'
                      : item.colorGb === '탱크'
                        ? 'orange'
                        : item.colorGb === '미경과'
                          ? 'orange'
                          : 'orange',
        }))
        setRows(responseData)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setExcelFlag(true)
      } else {
        // 데이터가 없거나 실패
        if (response.status == 413 && response.message) {
          setExcelFlag(false)
          alert(response.message)
        }
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
    try {
      if (!excelFlag) {
        alert('조회 후 이용해주시기 바랍니다.')
        return
      }

      if (!isValidDateIn3Month(params.searchStDate, params.searchEdDate)) {
        alert('거래년월 조회기간은 3개월 이내이어야 합니다.')
        return
      }
      setLoadingBackdrop(true)
      let endpoint: string =
        `/fsm/apv/bddtls/tr/getExcelBymrDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}` +
        `${params.cardNo ? '&cardNo=' + params.cardNo : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`
      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      console.log(response)

      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '가맹점별거래내역.xlsx')
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!params.frcsBrno) {
      alert('가맹점사업자등록번호를 입력해주세요.')
      return
    }
    console.log('조회 누름')
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    setExcelFlag(true)
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

  const isValidDateIn3Month = (stDate: string, edDate: string): boolean => {
    const iDate: Date = new Date(stDate)
    const oDate: Date = new Date(edDate)

    let compare1: boolean = true
    let compare2: boolean = true

    const plus3Month: Date = new Date(calMonthsDate(new Date(iDate), 3))
    const minus3Month: Date = new Date(calMonthsDate(new Date(oDate), -3))

    // 시작일자 + 3개월이 종료일자보다 클 때 정상
    compare1 = plus3Month >= oDate ? true : false

    // 종료일자 - 3개월이 시작일자보다 작을 때 정상
    compare2 = minus3Month <= iDate ? true : false

    return compare1 && compare2 ? true : false
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    console.log(value)
    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)
    // if (name === 'searchStDate' || name === 'searchEdDate') {
    //   const otherDateField =
    //     name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
    //   const otherDate = params[otherDateField]

    //   if (isValidDateRange(name, value, otherDate)) {
    //     setParams((prev) => ({ ...prev, [name]: value }))
    //   } else {
    //     alert('종료일은 시작일보다 빠를 수 없습니다.')
    //   }
    // } else {
    //    if(name === 'chk') {
    //      value === 'on' ? setParams((prev) => ({ ...prev, [name]: 'Y' })) : setParams((prev) => ({ ...prev, [name]: '' }))
    //    }else {
    //      setParams((prev) => ({ ...prev, [name]: value }))
    //    }
    // }
  }

  const handleSearchChange2 = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (isNumber(value) || name !== 'cardNo') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
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

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     fetchData()
  //   }
  // }

  return (
    <PageContainer
      title="가맹점별 거래내역조회"
      description="가맹점별 거래내역조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="가맹점별 거래내역조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <div className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="sch-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="sch-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{
                  max: getFormatToday,
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="sch-date-end"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="sch-date-end"
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
            <div className="form-group" style={{ maxWidth: '6rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="chk"
                    value={params.chk}
                    onChange={() => setChk(!chk)}
                  />
                }
                label="취소포함"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
                required
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsBrno"
                required
              >
                가맹점사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-frcsBrno"
                name="frcsBrno"
                value={params.frcsBrno}
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
                htmlFor="ft-select-01"
                style={{ width: '75px' }}
              >
                카드사
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="023" // 필수 O, 가져올 코드 그룹명
                pValue={params.crdcoCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="crdcoCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                width="50%" // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'ft-select-01'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-select-02"
              >
                카드구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="974" // 필수 O, 가져올 코드 그룹명
                pValue={params.cardSeCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="cardSeCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                width="50%" // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'ft-select-02'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cardNo"
              >
                카드번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-cardNo"
                name="cardNo"
                value={params.cardNo}
                onChange={handleSearchChange2}
                fullWidth
              />
            </div>
          </div>
        </div>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
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
        <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
          <span>■ 일반거래</span>
          <span style={{ color: 'blue' }}>■ 취소거래</span>
          <span style={{ color: 'brown' }}>■ 외상결제</span>
          <span style={{ color: 'green' }}>
            ■ 차량휴지/보조금지급정지기간 거래건
          </span>
          <span style={{ color: 'magenta' }}>■ 체납환수금차감 거래건</span>
          <span style={{ color: 'orange' }}>■ 지급거절거래건 (비고참조)</span>
        </Box>
        <TableDataGrid
          headCells={apvbddtlsHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={() => {}} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          caption={'가맹점별 거래내역조회 목록'}
        />
      </Box>
      <LoadingBackdrop open={loadingBackdrop} />
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
