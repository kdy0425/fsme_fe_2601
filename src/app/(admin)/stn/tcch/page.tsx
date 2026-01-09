'use client'
import { Box, Button, FormControlLabel, Grid, RadioGroup } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import {
  BlankCard,
  Breadcrumb,
  CustomRadio,
} from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import {
  getCityCodes,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'

import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getDateRange,
  isValidDateRange,
  sortChange,
  getExcelFile,
  getToday,
} from '@/utils/fsms/common/comm'

import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import DetailDataGrid from './_components/DetailDataGrid'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { stnTcchTnkCpctyChghstTrHc } from '@/utils/fsms/headCells'

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
    to: '/stn/tcch',
    title: '탱크용량변경이력',
  },
]

export interface Row {
  locgovCd: string // 시도명 + 관할관청
  vhclNo: string // 차량번호
  chk: string // 기간(요청일자: 01, 처리일자: 02)
  bgngDt: string // 시작일자(날짜)
  endDt: string // 종료일자(날짜)
  prcsSttsCd: string // 처리상태(셀렉트박스)
  dmndYmd: string // 요청일자
  crtrYmd: string // 탱크용량변경일자
  prcsYmd: string // 처리일자
  tnkCpcty: string // 변경후탱크용량
  chgRsnCn: string // 변경사유내용
  tankRsnNm: string // 탱크용량변경사유
  flCd: string // 탈락코드
  flRsnCn: string // 탈락사유내용
  fileId: string // 파일아이디
  mbtlnum: string // 휴대폰번호
  rgtrId: string // 등록자아이디
  regDt: string // 등록일시
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일시
  vonrBrno: string // 차량소유자사업자등록번호
  vonrNm: string // 차량소유자명
  tankStsNm: string // 처리상태
  bfchgTnkCpcty: string // 변경전탱크용량
  locgovNm: string // 관할관청
  vonrRrno: string // 주민등록번호
  rejectNm: string // 탈락유형
  saveFlag: string
  trsmYn: string // 전송여부
  trsmDt: string // 전송일시
  inptSeCd: string // 입력구분코드
  rmrkCn: string // 비고
  carTonsNm: string // 톤수
  tonsLit: string // 톤수코드
  carSts: string // 차량형태
  vhclNm: string // 차명
  carPid: string // 차량소유자 주민등록번호
  carBid: string // 차량소유자 법인등록번호
  ownerChangeYn: string // 소유자 변경 여부
  prcsSttsCdNm: string
  vhclTonCd: string
  vhclTonNm: string
  flNm: string
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

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  // const [detail, setDetail] = useState<DetailData>();
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [cityCode, setCityCode] = useState<SelectItem[]>([])
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([])

  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [selectedRow, setSelectedRow] = useState<Row>()

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    ctpvCd: '', // 시도명 코드
    locgovCd: '', // 관할관청 코드
    chk: '01', // 기간 체크
    prcsSttsCd: '', // 처리 상태
    vhclNo: '', // 차량번호
    brno: '', // 사업자등록번호
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const { authInfo } = useContext(UserAuthContext)

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 60)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

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

      setLocalGovCode(locgovCodes)
    })
  }, [params.ctpvCd])

  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tcc/tr/tnkCpctyChghst?page=${params.page}&size=${params.size}` +
        `${params.searchValue ? '&' + params.searchSelect + '=' + params.searchValue : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
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
      page: page,
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g
    if (name == 'vhclNo') {
      setParams((prev) => ({
        ...prev,
        page: 1,
        [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
      }))
    } else {
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    }
  }

  return (
    <PageContainer title="탱크용량변경이력" description="탱크용량변경이력">
      {/* breadcrumb */}
      <Breadcrumb title="탱크용량변경이력" items={BCrumb} />
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
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                inputProps={{ maxLength: 9 }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group" style={{ minWidth: '45rem' }}>
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <RadioGroup
                sx={{ minWidth: '13rem' }}
                row
                id="chk"
                className="mui-custom-radio-group"
                value={params.chk || ''}
                onChange={handleSearchChange}
              >
                <FormControlLabel
                  control={<CustomRadio id="chk_01" name="chk" value="01" />}
                  label="요청일자"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_02" name="chk" value="02" />}
                  label="처리일자"
                />
              </RadioGroup>
              {/* </div>
            <div className="form-group"> */}
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ max: params.searchEdDate }}
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
                inputProps={{ min: params.searchStDate }}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnTcchTnkCpctyChghstTrHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          paging={true}
          cursor={true}
          caption={'화물-탱크용량변경이력 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      <>
        {selectedRow && (
          <BlankCard className="contents-card" title="상세정보">
            <Grid item xs={4} sm={4} md={4}>
              <DetailDataGrid detail={selectedRow} />
            </Grid>
          </BlankCard>
        )}
      </>
    </PageContainer>
  )
}

export default DataList
