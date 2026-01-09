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
import { HeadCell, Pageable, Pageable2 } from 'table'
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
import { SelectItem } from 'select'
import BsDetail from './BsDetail'

import BsModifyModal from './BsModifyModal'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnbmBsHeadCells } from '@/utils/fsms/headCells'

export interface Row {
  brno?: string // 사업자등록번호
  bzentyNm?: string // 업체명
  rprsvNm?: string // 대표자명
  vhclNo?: string // 차량번호
  bzmnSeCd?: string // 개인법인구분 코드
  crno?: string // 법인등록번호
  zip?: string // 우편번호
  addr?: string // 주소
  mdfrLocgovNm?: string // 최종수정지자체
  rprsvRrno?: string // 대표자주민등록번호
  bzmnSeNm?: string // 개인/법인구분 이름
  telno?: string // 전화번호
  origFileNm?: string // 직인 파일명
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
  giveBacntNm?: string // 예금주명
  bankCd?: string // 금융기관 코드
  bankNm?: string // 금융기관 명
  giveActno?: string // 지급계좌번호
  part1Addr?: string // 주소 (상세주소 제외)
  part2Addr?: string // 상세주소

  file?: string //직인 수정시 첨부파일
  fileSn?: string // 파일일련번호
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BsPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null >(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>() // 클릭로우
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    detailPage: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    detailSize: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
    detailSort: allParams.sort ?? '', // 정렬 기준 추가
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  //초기데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    //('301', '전체').then((itemArr) => setbzmnSeCode(itemArr)) // 개인법인구분
  }, [])

  useEffect(() => {

    if (!(params.brno || params.bzentyNm || params.rprsvNm || params.vhclNo)) {
      return
    }
    if(flag != null){
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {

      setSelectedIndex(-1)
      setSelectedRow(undefined)
      setLoading(true)
      setExcelFlag(true)

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bm/bs/getAllBsnesMng?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.rprsvNm ? '&rprsvNm=' + params.rprsvNm : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}`

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
        `/fsm/stn/bm/bs/getExcelBsnesMng?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.rprsvNm ? '&rprsvNm=' + params.rprsvNm : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzmnSeCd ? '&bzmnSeCd=' + params.bzmnSeCd : ''}`

  await  getExcelFile(endpoint, '사업자관리_' + getToday() + '.xlsx')
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

    if (
      !(params.brno || params.bzentyNm || params.rprsvNm || params.vhclNo)
    ) {
      alert(
        '사업자등록번호, 업체명, 대표자명, 차량번호 중 최소 1개는 입력해주세요 입력해주세요.',
      )
      return
    }

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
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
  const handleRowClick = async (row: Row, rowIndex?: number) => {
    setSelectedRow(row)
    setSelectedIndex(rowIndex ?? -1)
  }
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)

    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleReload = () => {
    setSelectedRow(undefined)
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }



  return (
    <Box>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno" required>
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                type="number"
                inputProps={{maxLength:10, type:'number'}}
                onInput={(e: { target: { value: string; maxLength: number | undefined; }; })=>{
                e.target.value = Math.max(0, parseInt(e.target.value) ).toString().slice(0,e.target.maxLength)
                }}
                placeholder="숫자만 입력 가능합니다."
                name="brno"
                id="ft-brno"
                value={params.brno ?? ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-bzentyNm" required>
                업체명
              </CustomFormLabel>
              <CustomTextField
                id="ft-bzentyNm"
                name="bzentyNm"
                value={params.bzentyNm ?? ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-rprsvNm" required>
                대표자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-rprsvNm"
                name="rprsvNm"
                value={params.rprsvNm ?? ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo" required>
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo ?? ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-bzmnSe"
              >
                개인법인구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'301'}
                pValue={params.bzmnSeCd}
                pName={'bzmnSeCd'}
                width={'100%'}
                handleChange={handleSearchChange}
                htmlFor={'sch-bzmnSe'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            {selectedRow && (
              <>
                <BsModifyModal
                  data={selectedRow as Row}
                  buttonLabel={'수정'}
                  reloadFunc={handleReload}
                  title={'사업자정보 변경'}
                />
              </>
            )}
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
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnbmBsHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedIndex}
          caption={"버스 사업자관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRow && (
        <>
          <BsDetail data={selectedRow} reloadFunc={handleReload} />
        </>
      )}
    </Box>
  )
}

export default BsPage
