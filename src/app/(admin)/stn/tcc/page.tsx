'use client'
import { Box, Button, FormControlLabel, Grid, RadioGroup } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

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
import ModalContent from './_components/SearchModal'
import { SelectItem } from 'select'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import DetailDataGrid from './_components/DetailDataGrid'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnTccsrTnkCpctyChmngmtTrHc } from '@/utils/fsms/headCells'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { isNumber } from '@/utils/fsms/common/comm'

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
    to: '/stn/tcc',
    title: '탱크용량변경관리',
  },
]

export interface Row {
  vhclNo: string // 차량번호
  dmndYmd: string // 요청일자
  crtrYmd: string // 탱크용량변경일자
  prcsYmd: string // 처리일자
  prcsSttsCd: string // 처리상태 코드
  tnkCpcty: string // 변경후 탱크용량
  chgRsnCn: string // 변경사유 내용
  tankRsnNm: string // 탱크용량 변경사유
  flCd: string // 탈락코드
  flRsnCn: string // 탈락사유 내용
  fileId: string // 파일아이디
  mbtlnum: string // 휴대폰번호
  rgtrId: string // 등록자아이디
  regDt: string // 등록일시
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일시
  vonrBrno: string // 차량소유자 사업자등록번호
  vonrNm: string // 차량소유자명
  tankStsNm: string // 처리상태
  bfchgTnkCpcty: string // 변경전 탱크용량
  locgovCd: string // 관할구청 코드
  locgovNm: string // 관할구청명
  vonrRrno: string // 주민등록번호
  rejectNm: string // 탈락유형
  saveFlag: string
  trsmYn: string // 전송여부
  trsmDt: string // 전송일시
  confirmNm: string // 처리자
  inptSeCd: string // 입력구분코드
  rmrkCn: string // 비고
  carTonsNm: string // 톤수
  tonsLit: string
  carSts: string // 차량형태
  vhclNm: string // 차명
  carPid: string // 차량소유자 주민등록번호
  carBid: string // 차량소유자 법인등록번호
  ownerChangeYn: string
  cnt: string
  vonrRrnoS: string
  aprvLit: string // 3개월 최고주유량
  secondLit: string // 3개월 두번째 주유량
  aprvAvg: string // 3개월 평균주유량
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

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [isDetailOn, setIsDetailOn] = useState<boolean>(false)
  // const [detail, setDetail] = useState<DetailData>();
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [cityCode, setCityCode] = useState<SelectItem[]>([])
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([])
  const [prcsSttsItems, setPrcsSttsItems] = useState<SelectItem[]>([]) // 처리상태 코드
  const [rejectItems, setRejectItems] = useState<SelectItem[]>([]) // 탈락유형 코드

  const [rowIndex, setRowIndex] = useState<number>(-1)
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
    if (flag !== null) {
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

  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true)
    setRowIndex(-1)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tcc/tr/tnkCpctyChmngmt?page=${params.page}&size=${params.size}` +
        `${params.searchValue ? '&' + params.searchSelect + '=' + params.searchValue : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrBrno ? '&brno=' + params.vonrBrno : ''}` +
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
        setRowIndex(0)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setRowIndex(-1)
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
      setRowIndex(0)
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
        `/fsm/stn/tcc/tr/tnkCpctyChmngmtExcel?` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.searchValue ? '&' + params.searchSelect + '=' + params.searchValue : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrBrno ? '&brno=' + params.vonrBrno : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}`

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
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setRowIndex(index ?? -1)
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g
    if (name === 'vonrBrno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, page: 1, [name]: value }))
      }
    } else if (name == 'vhclNo') {
      setParams((prev) => ({
        ...prev,
        page: 1,
        [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
      }))
    } else {
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
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
    <PageContainer title="탱크용량변경관리" description="탱크용량변경관리">
      {/* breadcrumb */}
      <Breadcrumb title="탱크용량변경관리" items={BCrumb} />
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
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-car-name"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 9 }}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="vonr-brno-name"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="vonr-brno-name"
                name="vonrBrno"
                value={params.vonrBrno}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 13 }}
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
                inputProps={{
                  min: params.searchStDate,
                }}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-prcsSttsCd"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="172"
                pValue={params.prcsSttsCd}
                handleChange={handleSearchChange}
                pName="prcsSttsCd"
                htmlFor={'sch-prcsSttsCd'}
                addText="- 전체 -"
                defaultValue={'00'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              onClick={() => excelDownload()}
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
          headCells={stnTccsrTnkCpctyChmngmtTrHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          selectedRowIndex={rowIndex} // 선택된 행 인덱스
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={'화물-탱크용량변경관리 조회 목록'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      {/* <Box style={{ display: isDetailOn ? 'block' : 'none' }}> */}
      <Box style={{ display: 'block' }}>
        {!loading && rows[rowIndex] ? (
          <Grid item xs={4} sm={4} md={4}>
            <DetailDataGrid
              detail={rows[rowIndex]}
              rejectItems={rejectItems}
              reload={() => setFlag((prev) => !prev)}
            />
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
