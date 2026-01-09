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
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getExcelFile,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import BsDetail from './BsDetail'
import BsModifyModal from './BsModifyModal'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import { stnvdcmBsheadCell, stnVpmBsHC } from '@/utils/fsms/headCells'

export interface Row {
  bgngDt: string // 기준시작일자
  endDt: string // 기준종료일자
  ctpvCd: string // 시도코드
  locgovCd: string // 관할관청코드
  brno: string // 사업자번호
  vhclNo: string // 차량번호
  rprsvNm: string // 수급자명
  rprsvRrno: string // 수급자주민번호
  bfchgKoiNm: string // 변경전유종
  bfrLcnsTpbizNm: string // 변경전면허업종
  aftchKoiNm: string // 변경후유종
  aftrLcnsTpbizNm: string // 변경후면허업종
  chgYmd: string // 변경일자
  koiCd: string // 유종코드
  koiNm: string // 유종
  rgtrId: string // 입력자ID
  regDt: string // 입력일자
  mdfrId: string // 수정자ID
  mdfcnDt: string // 수정일자
}



const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          사업자등록번호
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          차량번호
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          대표자명
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          수급자명
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          수급자주민등록번호
        </TableCell>
        <TableCell colSpan={2}>변경전</TableCell>
        <TableCell colSpan={2}>변경후</TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          변경일자
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>면허업종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유종 </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>면허업종</TableCell>
      </TableRow>
    </TableHead>
  )
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BsPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 클릭로우

  const [open, setOpen] = useState<boolean>(false)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  useEffect(() => {
    if(flag != null){
      if (params.ctpvCd && params.locgovCd) {
        fetchData()
      }
    }
  }, [flag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0])
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      setSelectedRow(null)
      setLoading(true)
      setExcelFlag(true) // 엑셀기능 동작여부
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vdcm/bs/getAllVhcleDtaChangeMng?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
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
        `/fsm/stn/vdcm/bs/getExcelVhcleDtaChangeMng?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`

      await  getExcelFile(endpoint, '버스_차량제원변경관리' + getToday() + '.xlsx')
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
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))

      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row) => {
    setSelectedRow(row)
  }, [])
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }
  
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return
    }

    if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return
    }
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }


  return (
    <Box>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
                required
              >
                시도명
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
                required
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
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                사업자번호
              </CustomFormLabel>
              <CustomTextField
                type="number"
                inputProps={{maxLength:10, type:'number'}}
                onInput={(e: { target: { value: string; maxLength: number | undefined; }; })=>{
                e.target.value = Math.max(0, parseInt(e.target.value) ).toString().slice(0,e.target.maxLength)
                }}
                placeholder="숫자만 입력 가능합니다."
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                변경일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                변경일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                변경일자 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                }}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              type='submit'
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => {
                setOpen(true)
              }}
              variant="contained"
              color="primary"
            >
              등록
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
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnvdcmBsheadCell} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          customHeader={customHeader}
          caption={"버스 차량제원변경관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRow && (
        <BlankCard className="contents-card" title="상세정보">
          <BsDetail data={selectedRow} />
        </BlankCard>
      )}
      <BsModifyModal
        open={open}
        row={selectedRow}
        handleClickClose={handleClickClose}
        reload={() => fetchData()}
      />
    </Box>
  )
}

export default BsPage
