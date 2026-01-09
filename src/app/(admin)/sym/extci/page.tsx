'use client'
import { Box, Button, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange, getExcelFile, openReport } from '@/utils/fsms/common/comm'
import { getToday } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '연계정보관리',
  },
  {
    to: '/sym/extci',
    title: '대외기관 연계 송수신정보',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'procId',
    numeric: false,
    disablePadding: false,
    label: '프로세스명',
  },
  {
    id: 'procNm',
    numeric: false,
    disablePadding: false,
    label: '전문내용',
  },
  {
    id: 'dlngNm',
    numeric: false,
    disablePadding: false,
    label: '송수신여부',
  },
  {
    id: 'reptSe',
    numeric: false,
    disablePadding: false,
    label: '스케줄구분'
  },
  {
    id: 'excnBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '실행시작일자',
    format: 'yyyymmdd',
  },
  {
    id: 'excnBgngTm',
    numeric: false,
    disablePadding: false,
    label: '실행시작시간',
    format: 'hh24miss',
  },
  {
    id: 'excnEndYmd',
    numeric: false,
    disablePadding: false,
    label: '실행종료일자',
    format: 'yyyymmdd',
  },
  {
    id: 'excnEndTm',
    numeric: false,
    disablePadding: false,
    label: '실행종료시간',
    format: 'hh24miss',
  },
  {
    id: 'errCn',
    numeric: false,
    disablePadding: false,
    label: '오류내용',
  },
  {
    id: 'prcsNocs',
    numeric: false,
    disablePadding: false,
    label: '처리건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'errorNocs',
    numeric: false,
    disablePadding: false,
    label: '오류건수',
    format: 'number',
    align: 'td-right',
  },
]

export interface Row {
  procNm: string
  procKornNm: string
  dlngCd: string
  dlngNm: string
  reptSe: string
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

type listSearchObj = {
  page: number
  size: number
  excnBgngYmd: string
  excnEndYmd: string
  dlngCd: string
  procNm: string
  instCd: string
}

const DataList = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    excnBgngYmd: getDateRange('d', 0).startDate,
    excnEndYmd: getDateRange('d', 0).endDate,
    dlngCd: '',
    procNm: '',
    instCd: '',
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
    if (!params.excnBgngYmd) {
      alert('시작일자를 입력 해주세요')
      return false
    }
    if (!params.excnEndYmd) {
      alert('종료일자를 입력 해주세요')
      return false
    }
    if (params.excnBgngYmd > params.excnEndYmd) {
      alert('시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
      return false
    }
    return true
  }

  // 공통 데이터 초기화 함수
  const resetData = () => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setErrorMsg('')
  }

  // 조회클릭시
  const handleAdvancedSearch = (event?: React.FormEvent) => {
    if (event) event.preventDefault()
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
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setSearchFlag((prev) => !prev)
  }, [])

  // 최초 진입 시 자동 조회
  useEffect(() => {
    if (searchFlag !== null) {
      fetchData()
    }
  }, [searchFlag])

  // 데이터 조회
  const fetchData = async () => {

    if (!searchValidation()) return
    resetData()

    setLoading(true)
    setErrorMsg('')
    try {
      const searchObj: listSearchObj = {
        ...params,
        excnBgngYmd: params.excnBgngYmd.replaceAll('-', ''),
        excnEndYmd: params.excnEndYmd.replaceAll('-', ''),
      }

      const endpoint =
        '/fsm/sym/nci/cm/getAllTransJobInfo' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
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

  // 엑셀 다운로드
  const excelDownload = async () => {
    if (rows.length === 0 || !enableExcel) {
      alert('조회 후 엑셀 다운로드를 하시기 바랍니다.')
      return
    }

    const searchObj: listParamObj = {
      ...params,
      excnBgngYmd: params.excnBgngYmd.replaceAll('-', ''),
      excnEndYmd: params.excnEndYmd.replaceAll('-', ''),
    }

    setIsDataProcessing(true)
    const endpoint =
      '/fsm/sym/nci/cm/getExcelAllTransJobInfo' + toQueryParameter(searchObj)

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsDataProcessing(false)
  }

  const handleReport = async () => {

    const searchObj = {
      excnBgngYmd: params.excnBgngYmd.replaceAll('-', ''),
      excnEndYmd: params.excnEndYmd.replaceAll('-', ''),
      dlngCd: params.dlngCd,
      procNm: params.procNm,
      instCd: params.instCd,
    };

    const endpoint =
      '/fsm/sym/nci/cm/getPrintAllTransJobInfo' + toQueryParameter(searchObj);

    try {
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      });

      if (
        response?.resultType === 'success' &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const crfName = 'ExtciDailyCheck';
        const crfPayload = {
          [crfName]: response.data,
        };
        const crfData = JSON.stringify(crfPayload);

        openReport(crfName, crfData);
      } else {
        alert('출력할 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageContainer
      title="대외기관 연계 송수신정보"
      description="대외기관 연계 송수신정보"
    >
      <Breadcrumb title="대외기관 연계 송수신정보" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                실행일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                실행시작일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="excnBgngYmd"
                value={params.excnBgngYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                실행종료일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="excnEndYmd"
                value={params.excnEndYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-instCd"
              >
                대외기관
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="ORGN"
                pValue={params.instCd}
                handleChange={handleSearchChange}
                pName="instCd"
                htmlFor={'sch-instCd'}
                addText="전체"
              />
            </div>
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
                htmlFor="ft-dlngCd"
              >
                송수신여부
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'899'}
                pValue={params.dlngCd}
                handleChange={handleSearchChange}
                pName={'dlngCd'}
                addText="전체"
                htmlFor={'ft-dlngCd'}
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
            <Button
              onClick={handleReport}
              variant="contained"
              color="success"
            >
              출력
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