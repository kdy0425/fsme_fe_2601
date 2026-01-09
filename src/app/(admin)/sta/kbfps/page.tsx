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

import TableDataGrid from '../CustomDataGrid'

// types
import { getExcelFile } from '@/utils/fsms/common/comm'
import { staKbfpsHC } from '@/utils/fsms/headCells'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'

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
    to: '/sta/kbfps',
    title: '유종별 유가보조금 지급현황',
  },
]

type commonCodeObj = {
  cdExpln: string
  cdGroupNm: string
  cdKornNm: string
  cdNm: string
  cdSeNm: string
  cdSeq: string
  comCdYn: string
  useNm: string
  useYn: string
}

export interface Row {
  crtrYm: string //년도
  taskSeNm: string //구분
  vhclCntom: string //차량대수
  asstLiter: string //보조리터
  ftxIntrlckAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  opsAmt: string //계
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  bgngDt: string
  endDt: string
  koiCd: string
  srchGb: string
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
    koiCd: '',
    srchGb: '',
  })

  const [codeList, setCodeList] = useState<SelectItem[]>([])

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
    handleKoiCdData(params.srchGb)
  }, [params.srchGb])

  useEffect(() => {
    setEnableData(false)
  }, [params, prdAdupYn])

  const handleKoiCdData = async (taskSeCd: string) => {
    const taskKoiNone = 'R'

    let koiCdList: Array<commonCodeObj>
    let filteredList: Array<SelectItem> = []
    if (taskSeCd === '010') {

      koiCdList = await getCodesByGroupNm('KOI1')

      filteredList = koiCdList
        .filter((value: commonCodeObj) => {
          return value.cdNm != taskKoiNone
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    } else if (taskSeCd === '020') {
      koiCdList = await getCodesByGroupNm('KOI2')

      filteredList = koiCdList
        .filter((value: commonCodeObj) => {
          return value.cdNm != taskKoiNone
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    } else if (taskSeCd === '030') {
      koiCdList = await getCodesByGroupNm('KOI3')

      filteredList = koiCdList
        .filter((value: commonCodeObj) => {
          return value.cdNm != taskKoiNone
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    }

    filteredList.unshift({ value: '', label: '전체' })
    setCodeList(filteredList)
  }
  const validate = () => {
    const { bgngDt, endDt } = params

    if (!bgngDt) {
      alert('시작기간을 입력해주세요')
      return false
    }

    if (!endDt) {
      alert('종료기간을 입력해주세요.')
      return false
    }

    if (new Date(bgngDt) > new Date(endDt)) {
      alert('종료거래년월이 시작거래년월보다 작을 수 없습니다.')
      return false
    }
    return true
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!validate()) return

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sta/kbfps/cm/getAllByfuFsmPymntSttus?` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.srchGb ? '&srchGb=' + params.srchGb : '&srchGb=all'}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
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
    if (!validate()) return

    if (!enableData) {
      alert('데이터 조회 후 엑셀다운로드 하시기 바랍니다.')
      return
    }else if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    setIsDataProcessing(true)

    let endpoint: string =
      `/fsm/sta/kbfps/cm/getExcelByfuFsmPymntSttus?` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
      `${params.srchGb ? '&srchGb=' + params.srchGb : '&srchGb=all'}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${prdAdupYn ? '&prdAdupYn=Y' : '&prdAdupYn=N'}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )

    setIsDataProcessing(false)
  }

  const handleReport = async () => {
  
    const { bgngDt, endDt } = params

    if (!enableData) {
      alert('데이터 조회 후 출력하시기 바랍니다.')
      return
    }else if (rows.length == 0) {
      alert('출력할 데이터가 없습니다.')
      return
    }

    let endpoint: string =
      `/fsm/sta/kbfps/cm/getPrintByfuFsmPymntSttus?` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.srchGb ? '&srchGb=' + params.srchGb : '&srchGb=all'}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
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
  
          const crfName = 'byfuFsmPymntSttus';
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
    setParams((prev) => ({ ...prev, page: 1, [name]: value,
      ...(name === 'srchGb' && { koiCd: '' })
     }))
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
            구분
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            유종
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            차량대수
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            보조리터
          </TableCell>
          <TableCell colSpan={8}>유가보조금</TableCell>
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
      title="유종별 유가보조금 지급현황"
      description="유종별 유가보조금 지급현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="유종별 유가보조금 지급현황" items={BCrumb} />
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
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-srchGb"
              >
                업무구분
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
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <select
                id="sch-koiCd"
                name="koiCd"
                className="custom-default-select"
                value={params.koiCd}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {codeList.map((option) => (
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
          headCells={staKbfpsHC} // 테이블 헤더 값
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
