'use client'
import {
  Box,
  Button,
  Typography,
} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getFormatToday, getToday } from '@/utils/fsms/common/dateUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2, HeadCell } from 'table'
import { systemAccessInfoHC } from '@/utils/fsms/ilp/headCells'
import { telnoFormatter } from '@/utils/fsms/common/util'

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '시스템관리' },
  { title: '접속기록 관리' },
  { to: '/ilp/sci', title: '시스템 접속정보' },
]

const headCells: HeadCell[] = systemAccessInfoHC

export interface Row {
  lgnId: string           // 아이디
  userNm: string          // 사용자명
  agenNm: string          // 지자체
  authNm: string          // 권한
  telno: string           // 내선번호
  lastLgnDt: string       // 최근접속일시
  userAcntSttsNm: string  // 사용구분
}

type listSearchObj = {
  page: number
  size: number
  lgmLgtDt: string
  userNm: string
  lgnId: string
}

const DataList = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    lgmLgtDt: getFormatToday(),
    userNm: '',
    lgnId: '',
  })

  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [enableExcel, setEnableExcel] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  // 공통 데이터 초기화 함수
  const resetData = (page: number, pageSize: number) => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setParams((prev) => ({ ...prev, page, size: pageSize }))
    setErrorMsg('')
  }

  // 조회클릭시
  const handleAdvancedSearch = (event?: React.FormEvent) => {
    if (event) event.preventDefault()
    resetData(1, 10)
    setSearchFlag((prev) => !prev)
  }

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 페이징 이벤트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    resetData(page, pageSize)
    setSearchFlag((prev) => !prev)
  }

  // 최초 진입 시 자동 조회
  useEffect(() => {
    if (searchFlag !== null) {
      fetchData()
    }
  }, [searchFlag])

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const searchObj: listSearchObj = {
        ...params,
        lgmLgtDt: params.lgmLgtDt.replaceAll('-', ''),
      }
      let endpoint =
        `/fsm/ilp/sci/getAllSystemAccessInfo` + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const formattedRows = response.data.content.map((row:Row) => ({
          ...row,
          telno: telnoFormatter(row.telno)
      }))
        setRows(formattedRows)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setErrorMsg('')
      } else {
        resetData(1, 10)
        setErrorMsg('데이터가 없습니다.')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      resetData(1, 10)
      setErrorMsg('데이터 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setEnableExcel(true)
    }
  }

  // 엑셀 다운로드
  const excelDownload = async () => {
    if (rows.length === 0 || !enableExcel) {
      alert('조회 후 엑셀 다운로드를 하시기 바랍니다.')
      return
    }
    const searchObj: listParamObj = {
      ...params,
      lgmLgtDt: params.lgmLgtDt.replaceAll('-', ''),
    }
    setIsDataProcessing(true)
    const endpoint =
      `/fsm/ilp/sci/getExcelSystemAccessInfo` + toQueryParameter(searchObj)
    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsDataProcessing(false)
  }

  // 행 클릭 시
  const handleRowClick = useCallback((row: Row) => {
    // 필요시 상세 모달 구현
  }, [])

  return (
    <PageContainer
      title="시스템 접속정보"
      description="시스템 접속정보"
    >
      <Breadcrumb title="시스템 접속정보" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-search-date">
                접속일자
              </CustomFormLabel>
              <CustomTextField
                name="lgmLgtDt"
                value={params.lgmLgtDt}
                onChange={handleSearchChange}
                type="date"
                id="ft-search-date"
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-user-name">
                사용자명
              </CustomFormLabel>
              <CustomTextField
                name="userNm"
                value={params.userNm}
                onChange={handleSearchChange}
                type="text"
                id="ft-user-name"
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-login-id">
                아이디
              </CustomFormLabel>
              <CustomTextField
                name="lgnId"
                value={params.lgnId}
                onChange={handleSearchChange}
                type="text"
                id="ft-login-id"
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
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
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
        />
        {errorMsg && (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">{errorMsg}</Typography>
          </Box>
        )}
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList