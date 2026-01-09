'use client'
import { Box, Button, FormControlLabel, Grid, RadioGroup } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types

import { Pageable2 } from 'table'
import {
  CommSelect,
  CtpvSelectAll,
  CtpvSelect,
  LocgovSelectAll,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { StatusType } from '@/types/message'
import { mngTcjcMainHC } from '@/utils/fsms/headCells'
import DetailDataGrid from './_components/DetailDataGrid'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { isNumber } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/tcjc',
    title: '탱크용량심사 변경관리',
  },
]

export interface Row {
  // id:string;
  vhclNo?: string // 차량번호
  vonrNm?: string // 소유자명
  vonrBrno?: string // 사업자등록번호
  dmndYmd?: string // 요청일자
  crtrYmd?: string // 탱크용량변경일자
  prcsSttsCd?: string
  prcsSttsCdNm?: string // 처리상태
  locgovNm?: string // 관할관청
  mbtlnum?: string // 연락처
  vhclTonCdNm?: string // 톤 수
  vhclSttsCd?: string // 차량형태
  vhclNm?: string // 차명
  reqDt?: string // 요청일자
  mdfcnDt?: string // 처리일자
  bfchgTnkCpcty?: string // 변경전 탱크용량
  tnkCpcty?: string // 변경후 탱크용량
  chgRsnCnNm?: string // 탱크용량 변경사유
  rmrkCn?: string // 비고?
  flCdNm?: string // 탈락 유형
  flRsnCn?: string // 탈락 사유
  mdfrId?: string // (임시) 등록자 아이디
  createdDt?: string // (임시) 등록일자
  updatedBy?: string // (임시) 수정자 아이디
  updatedDt?: string // (임시) 수정일자
  trsmYn?: string // 전송여부(코드)
  trsmYnNm?: string // 전송여부(이름)
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngAplcnYmd: string
  endAplcnYmd: string
  ctpvCd: string
  locgovCd: string
  chk: string
  prcsSttsCd: string
  vhclNo: string
  brno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  // const [detail, setDetail] = useState<DetailData>();
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [isDetailOn, setIsDetailOn] = useState<boolean>(false)
  const [rowIndex, setRowIndex] = useState<number>(-1)
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngAplcnYmd: '', // 시작일
    endAplcnYmd: '', // 종료일
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

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    const dateRangeEnd = getDateRange('d', -30)
    let startDate = dateRange.startDate
    let endDate = dateRangeEnd.startDate
    setParams((prev) => ({
      ...prev,
      bgngAplcnYmd: startDate,
      endAplcnYmd: endDate,
    }))
  }, [])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setIsDetailOn(false)
    //setInitialState()
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/tcjc/tr/tnkCpctyJdgmn?page=${params.page}&size=${params.size}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.bgngAplcnYmd ? '&bgngAplcnYmd=' + params.bgngAplcnYmd.replaceAll('-', '') : ''}` +
        `${params.endAplcnYmd ? '&endAplcnYmd=' + params.endAplcnYmd.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}`
      console.log(endpoint)
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
        //setInitialState()
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error: StatusType | any) {
      // 에러시
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      //setInitialState()
    } finally {
      setLoading(false)
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
    // setIsDetailOn(false)
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
    const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g
    if (name == 'vhclNo') {
      setParams((prev) => ({
        ...prev,
        page: 1,
        [name]: value.replace(regex, '').replace(' ', ''),
      }))
    } else if (name == 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
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
      title="탱크용량심사 변경관리"
      description="탱크용량심사 변경관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="탱크용량심사 변경관리" items={BCrumb} />
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
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor="sch-ctpv"
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
            <div className="form-group" style={{ marginRight: '-6%' }}>
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
                inputProps={{
                  maxLength: 9,
                }}
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
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 10,
                }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group" style={{ maxWidth: '35.5rem' }}>
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <RadioGroup
                row
                id="chk"
                className="mui-custom-radio-group"
                value={params.chk || ''}
                onChange={handleSearchChange}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                }}
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

              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngAplcnYmd"
                value={params.bgngAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ max: params.endAplcnYmd }}
              />

              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endAplcnYmd"
                value={params.endAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ min: params.bgngAplcnYmd }}
              />
            </div>
            {/* <div className="form-group">
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngAplcnYmd"
                value={params.bgngAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ max: params.endAplcnYmd }}
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
                name="endAplcnYmd"
                value={params.endAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ min: params.bgngAplcnYmd }}
              />
            </div> */}
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
                addText="전체"
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
          headCells={mngTcjcMainHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick}
          selectedRowIndex={rowIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <Box style={{ display: isDetailOn ? 'block' : 'none' }}>
        <Grid item xs={4} sm={4} md={4}>
          <DetailDataGrid detail={selectedRow} reload={fetchData} />
        </Grid>
      </Box>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default DataList
