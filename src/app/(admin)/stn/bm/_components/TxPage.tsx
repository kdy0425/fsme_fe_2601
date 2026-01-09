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
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { toQueryParameter } from '@/utils/fsms/utils'

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
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import TxDetail from './TxDetail'

import TxModifyModal from './TxModifyModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnbmTxHeadCells } from '@/utils/fsms/headCells'

export interface Row {
  vhclNo?: string // 차량번호
  brno?: string // 사업자등록번호
  crno?: string // 법인등록번호
  bzmnSeCd?: string // 개인법인구분
  bzmnSeNm?: string // 개인법인구분명
  bzentyNm?: string // 업체명
  rprsvNm?: string // 대표자명
  rprsvRrno?: string // 대표자주민등록번호
  telno?: string // 전화번호
  sttsNm?: string // 상태
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
  txtnTypeNm?: string // 과세구분
  ntsChgYmd?: string // 국세청변경일자
  locgovCd?: string // 시도명
  rprsvRrnoS?: string // 주민번호 암호화
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TrPage = () => {
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>() // 클릭로우
  const [rowIndex, setRowIndex] = useState(-1)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setRowIndex(-1)
    setSelectedRow(null)
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
      }

      // 검색 조건에 맞는 endpoint 생성
      const endpoint: string =
        '/fsm/stn/bm/tx/getAllBsnesMng' + toQueryParameter(searchObj)
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
        handleRowClick(response.data.content[0], 0)
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
      const endpoint: string =
        '/fsm/stn/bm/tx/getExcelBsnesMng' + toQueryParameter(params)
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
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setRowIndex(index ?? -1)
    setSelectedRow(row)
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleReload = () => {
    setSelectedRow(undefined)
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  return (
    <Box>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            {/* 시도 조회조건 */}
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

            {/* 관할관청 조회조건 */}
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
                htmlFor="sch-bzmnSeCd"
              >
                개인법인구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CBG0"
                pValue={params.bzmnSeCd}
                handleChange={handleSearchChange}
                pName="bzmnSeCd"
                htmlFor={'sch-bzmnSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-crno">
                법인등록번호
              </CustomFormLabel>
              <CustomTextField
                type="number"
                id="ft-crno"
                name="crno"
                value={params.crno ?? ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                type="number"
                id="ft-brno"
                name="brno"
                value={params.brno ?? ''}
                onChange={handleSearchChange}
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
                value={params.vhclNo ?? ''}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-bzentyNm">
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
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            {selectedRow && (
              <TxModifyModal
                data={selectedRow as Row}
                buttonLabel={'수정'}
                reloadFunc={handleReload}
                title={'사업자정보 변경'}
              />
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
          headCells={stnbmTxHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={rowIndex}
          caption={"택시 사업자관리 조회 목록"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRow && (
        <>
          <TxDetail data={selectedRow} />
        </>
      )}
    </Box>
  )
}

export default TrPage
