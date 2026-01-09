'use client'
import {
  Box,
  Button,
  TableCell,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { openReport } from '@/utils/fsms/common/comm'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { getExcelFile } from '@/utils/fsms/common/comm'
import { staBfpsHC } from '@/utils/fsms/headCells'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
  CtpvSelectAll,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '통계',
  },
  {
    title: '보조금',
  },
  {
    to: '/sta/bfps',
    title: '차량별 유가보조금 지급현황',
  },
]

export interface Row {
  dlngYm: string //년월
  locgovNm: string //지자체명
  taskSeNm: string //구분
  koiNm: string //유종
  vhclNocs: string //차량대수
  asstAmtLiter: string //보조리터
  ftxAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  asstAmt: string //유가보조금
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  bgngDt: string
  endDt: string
  ctpvCd: string
  locgovCd: string
  koiCd: string
  srchGb: string
  vhclNo: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  const [prdAdupYn, setPrdAdupYn] = useState(false) // 로딩여부

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [enableData, setEnableData] = useState<boolean>(false)

  const excelErrorMessage = '조회 후 엑셀 다운로드를 하시기 바랍니다.'

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    bgngDt: '', // 시작일
    endDt: '', // 종료일
    ctpvCd: '',
    locgovCd: '',
    koiCd: '',
    srchGb: '',
    vhclNo: '',
  })

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

  useEffect(() => {
    setEnableData(false)
  }, [params, prdAdupYn])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.bgngDt || !params.endDt) {
        alert('기간을 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sta/bfps/cm/getAllByveFsmPymntSttus?` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.srchGb ? '&srchGb=' + params.srchGb : '&srchGb=all'}` +
        `${prdAdupYn ? '&prdAdupYn=Y' : '&prdAdupYn=N'}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        setRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      setRows([])
    } finally {
      setLoading(false)
      setEnableData(true)
    }
  }

  const excelDownload = async () => {
    if (!params.bgngDt || !params.endDt) {
      alert('기간을 입력해주세요.')
      return
    }

    if (rows.length === 0 || !enableData) {
      alert(excelErrorMessage)
      return
    }

    setIsDataProcessing(true)

    let endpoint: string =
      `/fsm/sta/bfps/cm/getExcelByveFsmPymntSttus?` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.srchGb ? '&srchGb=' + params.srchGb : '&srchGb=all'}` +
      `${prdAdupYn ? '&prdAdupYn=Y' : '&prdAdupYn=N'}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )

    setIsDataProcessing(false)
  }

  const handleReport = async () => {  
  
    if (!enableData) {
      alert('데이터 조회 후 출력하시기 바랍니다.')
      return
    }else if (rows.length == 0) {
      alert('출력할 데이터가 없습니다.')
      return
    }    
    let endpoint: string =
      `/fsm/sta/bfps/cm/getPrintByveFsmPymntSttus?` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.srchGb ? '&srchGb=' + params.srchGb : '&srchGb=all'}` +
      `${prdAdupYn ? '&prdAdupYn=Y' : '&prdAdupYn=N'}`

    try {
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      });
      
      if (
        response?.resultType === 'success' &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const resultData = response.data.map((item: any) => ({
          ...item,
          excnEndYmd: getToday(),
        }));

        const crfName = 'byveFsmPymntSttus';
        const crfResultData = {
          [crfName]: resultData,
        };
        const crfData = JSON.stringify(crfResultData);

        openReport(crfName, crfData);
      } else {
        alert('출력할 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('리포트 생성 중 오류가 발생했습니다.');
    }
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  const customHeader = (): React.ReactNode => {
    return (
      <TableHead>
        <TableRow>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            년월
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            시도
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            관할관청
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            구분
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            차량번호
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            보조리터
          </TableCell>
          <TableCell colSpan={3}>유가보조금</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            유류세연동보조금
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>유가연동보조금</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>계</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return (
    <PageContainer
      title="차량별 유가보조금 지급현황"
      description="차량별 유가보조금 지급현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="차량별 유가보조금 지급현황" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
        }}
        sx={{ mb: 2 }}
      >
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelectAll
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
              <LocgovSelectAll
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-srchGb"
              >
                구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="801"
                pValue={params.srchGb}
                handleChange={handleSearchChange}
                pName="srchGb"
                htmlFor={'sch-srchGb'}
                //addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
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
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                inputProps={{
                  max: getFormatToday(),
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                inputProps={{
                  min: params.bgngDt,
                  max: getFormatToday(),
                }}
                fullWidth
              />
            </div>
            <div className="form-group" style={{ maxWidth: '8rem' }}>
              <CustomFormLabel className="input-label-display">
                기간합산여부
              </CustomFormLabel>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="prdAdupYn"
                    value={prdAdupYn}
                    onChange={() => setPrdAdupYn(!prdAdupYn)}
                  />
                }
                label=""
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
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
              onClick={() => handleReport()}
              variant="contained"
              color="success"
            >
              출력
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={staBfpsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          loading={loading} // 로딩여부
          paging={false}
          customHeader={customHeader}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
