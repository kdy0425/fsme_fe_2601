'use client'
import { Box, Button, FormControlLabel } from '@mui/material'
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

//import TableDataGrid from './CustomDataGrid'
import TableDataGrid from '../CustomDataGrid'

//import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { getExcelFile } from '@/utils/fsms/common/comm'
import { staFpisMainHC } from '@/utils/fsms/headCells'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
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
    to: '/sta/fpis',
    title: '유가보조금 사전차단 현황',
  },
]

export interface Row {
  ym: string // 년월
  gb: string // 구분
  nm: string // 지급거절사유
  vhclCnt: string // 차량대수
  aprvCnt: string // 사전차단건수
  trgtAsstAmt: string // 보조금
  useLiter: string // 보조리터
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  bgngDt: string
  endDt: string
  asstAmtCmpttnSeNm: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  const [prdAdupYn, setPrdAdupYn] = useState(false) // 로딩여부

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [enableExcel, setEnableExcel] = useState<boolean>(false)

  const excelErrorMessage = '조회 후 엑셀 다운로드를 하시기 바랍니다.'

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    bgngDt: '', // 시작일
    endDt: '', // 종료일
    asstAmtCmpttnSeNm: '',
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
    setEnableExcel(false)
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
        `/fsm/sta/fpis/getAllFsmPriIntrcpSttus?` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.asstAmtCmpttnSeNm ? '&asstAmtCmpttnSeNm=' + params.asstAmtCmpttnSeNm : ''}` +
        `${prdAdupYn ? '&mergYn=Y' : '&mergYn=N'}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // ym: string; // 년월
        // gb: string; // 구분
        // nm: string; // 지급거절사유

        if (prdAdupYn) {
          //nm: 소계
          // let a =  moveSummaryToEnd(response.data)
          setRows(
            response.data
              .filter((row: Row) => row.nm !== '소계')
              .map((row: Row, index: number) => ({
                ...row,
                ym:
                  row.ym === '' || row.ym == null
                    ? index > 1
                      ? response.data[index - 1].ym
                      : response.data[index - 2]?.ym || ''
                    : row.ym,
                gb:
                  row.gb === '' || row.gb == null
                    ? index > 1
                      ? response.data[index - 1].gb
                      : response.data[index - 2]?.gb || ''
                    : row.gb,
                nm:
                  row.nm === '' || row.nm == null
                    ? index > 1
                      ? response.data[index - 1].nm
                      : response.data[index - 2]?.nm || ''
                    : row.nm,
                vhclCnt: row.vhclCnt ?? '0',
                aprvCnt: row.aprvCnt ?? '0',
                trgtAsstAmt: row.trgtAsstAmt ?? '0',
                useLiter: row.useLiter ?? '0',
              })),
          )
          return
        } else {
          // 데이터 조회 성공시
          setRows(
            response.data.map((row: Row) => ({
              ...row,
              vhclCnt: row.vhclCnt ?? ' 0',
              aprvCnt: row.aprvCnt ?? ' 0',
              trgtAsstAmt: row.trgtAsstAmt ?? ' 0',
              useLiter: row.useLiter ?? ' 0',
            })),
          )
        }
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      setRows([])
    } finally {
      setLoading(false)
      setEnableExcel(true)
    }
  }

  const excelDownload = async () => {
    if (!params.bgngDt || !params.endDt) {
      alert('기간을 입력해주세요.')
      return
    }

    if (loading) {
      alert('조회중입니다.')
      return
    }

    if (rows.length === 0 || !enableExcel) {
      alert(excelErrorMessage)
      return
    }

    setIsDataProcessing(true)

    let endpoint: string =
      `/fsm/sta/fpis/cm/getExcelFsmPriIntrcpSttus?` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
      `${params.asstAmtCmpttnSeNm ? '&asstAmtCmpttnSeNm=' + params.asstAmtCmpttnSeNm : ''}` +
      `${prdAdupYn ? '&mergYn=Y' : '&mergYn=N'}`
      

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )

    setIsDataProcessing(false)
  }

  const handleReport = async () => {  
    const { bgngDt, endDt } = params

    if (rows.length == 0) {
      alert('출력할 데이터가 없습니다.')
      return
    }

    const searchObj = {
      dlngCd: params.dlngCd,
      procNm: params.procNm,
    }
    
    let endpoint: string =
      `/fsm/sta/fpis/cm/getPrintFsmPriIntrcpSttus?` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.asstAmtCmpttnSeNm ? '&asstAmtCmpttnSeNm=' + params.asstAmtCmpttnSeNm : ''}` +
        `${prdAdupYn ? '&mergYn=Y' : '&mergYn=N'}`

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

        const crfName = 'fsmPriIntrcpSttus';
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

  return (
    <PageContainer
      title="유가보조금 사전차단 현황"
      description="유가보조금 사전차단 현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="유가보조금 사전차단 현황" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
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
                onKeyPress={handleKeyDown}
                inputProps={{
                  max: getFormatToday,
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
                onKeyPress={handleKeyDown}
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
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-asstAmtCmpttnSeNm"
              >
                사전차단사유
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="072"
                pValue={params.asstAmtCmpttnSeNm}
                handleChange={handleSearchChange}
                pName="asstAmtCmpttnSeNm"
                htmlFor={'sch-asstAmtCmpttnSeNm'}
                addText="전체"
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
          headCells={staFpisMainHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          loading={loading} // 로딩여부
          paging={false}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
