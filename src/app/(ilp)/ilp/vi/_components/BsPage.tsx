'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Box, Grid, Button } from '@mui/material'

import PageContainer from '@/components/container/PageContainer'
import { Pageable2 } from 'table'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import BrnoDetailDataGrid from './BsBrnoDetailDataGrid'
import CarDetailDataGrid from './BsCarDetailDataGrid'
import MovePathReqDataGrid from './MovePathReqDataGrid'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { ilpStnVmVhcleMngBsHc } from '@/utils/fsms/ilp/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

export interface Row {
  ctpvCd?: string // 시도명
  ctpvNm?: string // 시도명

  locgovCd?: string // 관할관청코드
  locgovNm?: string // 관할관청명
  vhclNo?: string // 차량번호
  bzentyNm?: string // 업체명
  vhclSeCd?: string // 면허업종코드
  vhclSeNm?: string // 면허업종명
  vhclSttsCd?: string // 차량상태코드
  vhclSttsNm?: string // 차량상태명
  brno?: string // 사업자번호
  rprsvRrno?: string // 수급자주민번호 (마스킹)
  koiCd?: string // 유종코드
  koiNm?: string // 유종명
  delYn?: string // 삭제여부
  dscntYn?: string // 할인여부
  dscntNm?: string // 할인여부명
  locgovAprvYn?: string // 지자체승인여부
  crno?: string // 법인등록번호
  rprsvNm?: string // 대표자명
  zip?: string // 우편번호
  addr?: string // 주소
  telno?: string // 전화번호
  rfidYn?: string // RFID 차량여부
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
  bzmnSeNm?: string // 개인법인구분명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BasicTable = () => {
  // const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [dtFlag, setDtFlag] = useState<boolean>(false) // 전체날짜조회를 위한 플래그
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row>() // 클릭로우
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  //각종 모달 닫기 열기 버튼
  const [vehHisOpen, setVehHisOpen] = useState(false)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const router = useRouter()

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRow(undefined)
    setSelectedRowIndex(-1)
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/ilp/vi/bs/getAllVhcleMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
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
        alert(response.message)
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
      // 디테일 데이터 초기화하기.
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

    try {
      setLoadingBackdrop(true)
      let endpoint: string =
        `/ilp/vi/bs/getExcelVhcleMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`

      await getExcelFile(endpoint, '버스_차량관리_' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag(true)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedRowIndex(index ?? -1)
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 원하는 경로로 이동!
  const handleCartPubClick = (url: string) => {
    // useEffect 안에서 라우팅 기능을 실행
    router.push(url)
  }

  // onClick={() => handleCartPubClick('./cad/cijm')
  return (
    <PageContainer title="차량관리" description="차량관리 페이지">
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
                htmlFor="sch-vhclSttsCd"
              >
                차량상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="506"
                pValue={params.vhclSttsCd}
                handleChange={handleSearchChange}
                pName="vhclSttsCd"
                htmlFor={'sch-vhclSttsCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="sch-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
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
                id="ft-bzentyNm"
                name="bzentyNm"
                value={params.bzentyNm}
                onChange={handleSearchChange}
                fullWidth
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
                fullWidth
              />
            </div>
          </div>
        </Box>
        {/* 검색영역 끝 */}

        <Grid style={{ marginBottom: '8px' }}>
          <Box className="table-bottom-button-group">
            <div className="button-right-align">
              <LoadingBackdrop open={loadingBackdrop} />
              <Button type="submit" variant="contained" color="primary">
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
        </Grid>
        {/* 검색영역 끝 */}
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilpStnVmVhcleMngBsHc}
          rows={rows}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
          caption={'버스 차량관리 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}

      <>
        {selectedRowIndex > -1 && (
          <Grid item xs={4} sm={4} md={4} style={{ marginBottom: '20px' }}>
            <BrnoDetailDataGrid data={rows[selectedRowIndex]} />
          </Grid>
        )}
      </>

      <>
        {selectedRowIndex > -1 && (
          <Grid item xs={4} sm={4} md={4} style={{ marginBottom: '20px' }}>
            <CarDetailDataGrid data={rows[selectedRowIndex]} />
          </Grid>
        )}
      </>

      <>
        {selectedRowIndex > -1 && (
          <Grid item xs={4} sm={4} md={4}>
            <MovePathReqDataGrid
              data={{ ...rows[selectedRowIndex], taskSeCd: 'BS' }}
            />
          </Grid>
        )}
      </>

      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default BasicTable
