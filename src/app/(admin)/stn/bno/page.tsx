'use client'
import { Box, Button, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getFormatToday, getToday } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect, CtpvSelectAll } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { HeadCell, Pageable2 } from 'table'
import { stnbnoHeadCells } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '보조금지급시행기준',
  },
  {
    to: '/stn/bno',
    title: '지역별 고시유가관리',
  },
]

export interface Row {
  koiNm: string
  aplcnBgngYmd: string
  ancmntOilprcAmt: string
  transSts: string
  koiCd: string
  rgnNm: string
  rgnCd: string
}

type listSearchObj = {
  page: number
  size: number
  aplcnBgngYmd: string
  rgnCd: string
  koiCd: string
}

const DataList = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    aplcnBgngYmd: getFormatToday(),
    rgnCd: '',
    koiCd: '',
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
  const resetData = () => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setParams(prev => ({ ...prev, page: 1, size: 10 }))
    setErrorMsg('')
  }

  // 조회클릭시
  const handleAdvancedSearch = (event?: React.FormEvent) => {
    if (event) event.preventDefault()
    setSearchFlag(prev => !prev)
  }

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams(prev => ({ ...prev, [name]: value }))
  }

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page: page, size: pageSize }))
    setSearchFlag(prev => !prev)
  }, [])

  // 최초 진입 시 자동 조회
  useEffect(() => {
    if (searchFlag !== null) {
      fetchData()
    }
  }, [searchFlag])

  // 데이터 조회
  const fetchData = async () => {
    resetData()

    setLoading(true)
    setErrorMsg('')
    try {
      const searchObj: listSearchObj = {
        ...params,
        aplcnBgngYmd: params.aplcnBgngYmd.replaceAll('-', ''),
        rgnCd: params.rgnCd ? params.rgnCd + '000' : '',
      }

      const endpoint =
        '/fsm/stn/bno/cm/getAllByegNtfcOilprc' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data.content ?? [])
        setTotalRows(response.data.totalElements ?? 0)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setEnableExcel(true)
      } else {
        setErrorMsg('데이터가 없습니다.')
        setEnableExcel(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMsg('데이터 조회 중 오류가 발생했습니다.')
      setEnableExcel(false)
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

    const searchObj = {
      aplcnBgngYmd: params.aplcnBgngYmd.replaceAll('-', ''),
      rgnCd: params.rgnCd ? params.rgnCd + '000' : '',
      koiCd: params.koiCd,
    }

    setIsDataProcessing(true)
    const endpoint =
      '/fsm/stn/bno/cm/getExcelByegNtfcOilprc' + toQueryParameter(searchObj)

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsDataProcessing(false)
  }

  return (
    <PageContainer
      title="지역별 고시유가관리"
      description="지역별 고시유가관리"
    >
      <Breadcrumb title="지역별 고시유가관리" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                고시기준일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                name="aplcnBgngYmd"
                value={params.aplcnBgngYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                시도명
              </CustomFormLabel>
              <CtpvSelectAll
                pValue={params.rgnCd}
                pName="rgnCd"
                handleChange={handleSearchChange}
                htmlFor="sch-rgnCd"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="977"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                addText="전체"
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
              onClick={excelDownload}
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
          headCells={stnbnoHeadCells}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          caption="지역별 고시유가관리 목록 조회"
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
