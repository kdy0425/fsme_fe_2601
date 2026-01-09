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
import { getDateRange, getExcelFile } from '@/utils/fsms/common/comm'
import { getToday } from '@/utils/fsms/common/dateUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2, HeadCell } from 'table'
import { personalAccessInfoHC } from '@/utils/fsms/ilp/headCells'

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '시스템관리' },
  { title: '접속기록 관리' },
  { to: '/ilp/pai', title: '개인정보 접근정보' },
]

const headCells: HeadCell[] = personalAccessInfoHC

export interface Row {
  searchDt: string;
  lgnId: string;
  userNm: string;
  searchScreenInfo: string;
  searchReason: string;
  searchDetailDt: string;
  excelDownloadYn: string;
}

type listSearchObj = {
  sort: string
  page: number
  size: number
  bgngDt: string
  endDt: string
  userNm: string
  lgnId: string
  searchReason: string
  excelDownloadYn: string
}

const DataList = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngDt: getDateRange('d', 1).startDate,
    endDt: getDateRange('d', 1).endDate,
    userNm: '',
    lgnId: '',
    searchReason: '',
    excelDownloadYn: '',
    sort: '',
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

  // 날짜 유효성 검사 
  const searchValidation = () => {
    if (!params.bgngDt) {
      alert('시작일자를 입력 해주세요')
      return false
    }
    if (!params.endDt) {
      alert('종료일자를 입력 해주세요')
      return false
    }
    if (params.bgngDt > params.endDt) {
      alert('시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
      return false
    }
    return true
  }

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
    if (!searchValidation()) return
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
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
      }
      let endpoint =
        `/fsm/ilp/pai/getAllPersonalAccessInfo` + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const formattedRows = response.data.content.map((row: Row) => ({
          ...row,
          searchDt: row.searchDt ? row.searchDt.split(' ')[0] : '',
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
      bgngDt: params.bgngDt.replaceAll('-', ''),
      endDt: params.endDt.replaceAll('-', ''),
    }
    setIsDataProcessing(true)
    const endpoint =
      `/fsm/ilp/pai/getExcelPersonalAccessInfo` + toQueryParameter(searchObj)
    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsDataProcessing(false)
  }

  return (
    <PageContainer
      title="개인정보"
      description="개인정보"
    >
      <Breadcrumb title="개인정보" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                조회기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                조회시작일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                value={params.bgngDt}
                onChange={handleSearchChange}
                name="bgngDt"
                id="ft-date-start"
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                조회종료일자
              </CustomFormLabel>
              <CustomTextField
                value={params.endDt}
                onChange={handleSearchChange}
                name="endDt"
                type="date"
                id="ft-date-end"
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
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                조회사유
              </CustomFormLabel>
              <select
                name="searchReason"
                value={params.searchReason}
                onChange={handleSearchChange}
                className="custom-default-select"
                style={{ width: '100%' }}
              >
                <option value="">전체</option>
                <option value="ADMIN">관리자</option>
                <option value="MOLIT">국토부</option>
                <option value="LOGV">지자체</option>
              </select>
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