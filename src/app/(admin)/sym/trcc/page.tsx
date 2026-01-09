'use client'
import { Box, Button, Typography } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, openReport } from '@/utils/fsms/common/comm'
import { getToday } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import ModalContent from './_components/ModalContent'
import ReportDateModal from './_components/ReportDateModal'

// types
import { HeadCell, Pageable2 } from 'table'
import { symTrccHC as baseHC } from '@/utils/fsms/headCells'

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: '시스템관리' },
  { title: '연계정보관리' },
  { to: '/sym/trcc', title: '화물 카드협약사 연계관리' },
]

// 목록 row 타입
export interface Row {
  procNm: string
  procKornNm: string
  dlngCd: string
  dlngNm: string
  useYn: string
  schdulSeCd: string
  schdulExcnYmd: string
  schdulExcnTm: string
  excnBgngYmd: string
  excnBgngTm: string
  excnEndYmd: string
  excnEndTm: string
  excnNocs: string
  schdulPrgrsSttsCd: string
  schdulPrgrsSttsNm: string
  prcsNocs: string
  errorNocs: string
}

// 검색 파라미터
type SearchParams = {
  page: number
  size: number
  dlngCd: string
  procNm: string
}

// 송수신여부 select 항목
const dlngSelectItem = [
  { label: '전체', value: '' },
  { label: '송신', value: 'S' },
  { label: '수신', value: 'R' },
]

const DataList = () => {
  // 검색 파라미터
  const [params, setParams] = useState<SearchParams>({
    page: 1,
    size: 10,
    dlngCd: '',
    procNm: '',
  })

  // 데이터/상태
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [isDataProcessing, setIsDataProcessing] = useState(false)
  const [enableExcel, setEnableExcel] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [reportModalOpen, setReportModalOpen] = useState(false)

  // 출력 버튼 클릭 시 모달 오픈
  const handleReportClick = () => {
    setReportModalOpen(true)
  }

  // 상세 모달
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Row | undefined>(undefined)

  // 재실행 버튼
  const headCells: HeadCell[] = useMemo(() => {
    const copied = baseHC.map(h => ({ ...h }))
    if (copied[0]?.id === 'edit') {
      copied[0] = {
        ...copied[0],
        format: 'button',
        button: {
          label: '재실행',
          color: 'primary',
          variant: 'contained',
          size: 'small',
        },
      }
    }
    return copied
  }, [])

  // 초기화
  const resetData = () => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setParams(prev => ({ ...prev, page: 1, size: 10 }))
    setErrorMsg('')
  }

  // 조회 버튼 클릭
  const handleAdvancedSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchFlag(prev => !prev)
  }

  // 검색조건 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams(prev => ({ ...prev, [name]: value }))
  }

  // 페이징 변경
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams(prev => ({ ...prev, page, size: pageSize }))
    setSearchFlag(prev => !prev)
  }, [])

  // 최초/재조회 트리거
  useEffect(() => {
    if (searchFlag !== null) fetchData()
  }, [searchFlag])

  // 데이터 조회
  const fetchData = async () => {
    resetData()
    setLoading(true)
    setErrorMsg('')

    try {
      const searchObj = {
        ...params
      }

      const endpoint = '/fsm/sym/trcc/tr/getAllTruckCardCntc' + toQueryParameter(searchObj)

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response?.resultType === 'success' && response.data) {
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setErrorMsg('')
      } else {
        setErrorMsg('데이터가 없습니다.')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMsg('데이터 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setEnableExcel(true)
    }
  }

  // 재실행 버튼 클릭
  const handleActionClick = useCallback(async (row: Row, id: string) => {
    if (id !== 'edit') return

    if (!window.confirm(`프로세스 [${row.procNm}] 을(를) 재실행하시겠습니까?`)) return

    const endpoint = '/fsm/sym/trcc/tr/excuteTruckCardCntc'
    const body = {
      procNm: row.procNm
    }

    const response = await sendHttpRequest('PUT', endpoint, body, true, {
      cache: 'no-store',
    })

    if (response?.resultType === 'success') {
      alert('프로세스 상태가 N으로 변경되었습니다.')
      setSearchFlag(prev => !prev)
    }
  }, [])

  // 엑셀 다운로드
  const excelDownload = async () => {
    if (rows.length === 0 || !enableExcel) {
      alert('조회 후 엑셀 다운로드를 하시기 바랍니다.')
      return
    }

    setIsDataProcessing(true)

    const searchObj = {
      dlngCd: params.dlngCd,
      procNm: params.procNm,
    }

    const endpoint = '/fsm/sym/trcc/tr/getExcelTruckCardCntc' + toQueryParameter(searchObj)

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )

    setIsDataProcessing(false)
  }

  // 리포트 출력
  const handleReport = async (start: string, end: string) => {
    setReportModalOpen(false)

    const searchObj = {
      dlngCd: params.dlngCd,
      procNm: params.procNm,
      excnBgngYmd: start.replaceAll('-', ''),
      excnEndYmd: end.replaceAll('-', ''),
    }

    const endpoint = '/fsm/sym/trcc/tr/getPrintTruckCardCntc' + toQueryParameter(searchObj)

    try {
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (
        response?.resultType === 'success' &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
        const crfName = 'TrDailyCheck'
        const crfPayload = {
            [crfName]: response.data
        }
        const crfData = JSON.stringify(crfPayload)

        openReport(crfName, crfData)
      } else {
        alert('출력할 데이터가 없습니다.')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('리포트 생성 중 오류가 발생했습니다.')
    }
  }

  // 행 클릭 → 상세 모달
  const handleRowClick = useCallback((row: Row) => {
    setSelectedRow(row)
    setOpen(true)
  }, [])

  return (
    <PageContainer title="화물 카드협약사 연계관리" description="화물 카드협약사 연계관리">
      <Breadcrumb title="화물 카드협약사 연계관리" items={BCrumb} />

      {/* 검색영역 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel 
                className="input-label-display" 
                htmlFor="ft-procNm"
              >
                프로세스명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-procNm"
                name="procNm"
                value={params.procNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel 
                className="input-label-display" 
                htmlFor="ft-dlngNm-select-01"
              >
                송수신여부
              </CustomFormLabel>
              <select
                id="ft-dlngNm-select-01"
                className="custom-default-select"
                name="dlngCd"
                value={params.dlngCd}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {dlngSelectItem.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              onClick={excelDownload} 
              variant="contained" 
              color="success"
            >
              엑셀
            </Button>
            <Button 
              onClick={handleReportClick}
              variant="contained" 
              color="success"
            >
              출력
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블 */}
      <Box>
        <TableDataGrid
          headCells={headCells}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          onActionClick={handleActionClick}
        />
        {errorMsg && (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">{errorMsg}</Typography>
          </Box>
        )}
      </Box>

      {/* 상세 모달 */}
      <ModalContent
        onCloseClick={() => setOpen(false)}
        title="연계처리이력"
        url="/fsm/sym/trcc/tr/getAllTruckCardCntcHst"
        open={open}
        row={selectedRow}
      />
      <ReportDateModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onConfirm={handleReport}
      />
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
