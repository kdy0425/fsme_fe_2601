'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* 공통 type, interface */
import {
  Box,
  Button,
  TableCell,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import {
  getToday,
  getDateRange,
  getFormatToday_yyyymm,
} from '@/utils/fsms/common/dateUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'

/* 공통 컴포넌트 */
import PageContainer from '@/components/container/PageContainer'
import { openReport } from '@/utils/fsms/common/comm'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '../CustomDataGrid'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

/* 공통 type, interface */
import { SelectItem } from 'select'
import { staBlfpsHC } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import ControlledStateAutocomplete from '@/app/components/forms/form-elements/autoComplete/ControlledStateAutocomplete'

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
    to: '/sta/blfps',
    title: '지자체별 유가보조금 지급현황',
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
  strCrtrYm: string
  endCrtrYm: string
  ctpvCd: string
  locgovCd: string
  koiCd: string
  taskSeCd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부
  const [prdAdupYn, setPrdAdupYn] = useState(false) // 로딩여부

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [enableData, setEnableData] = useState<boolean>(false)

  const excelErrorMessage = '조회 후 엑셀 다운로드를 하시기 바랍니다.'

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    strCrtrYm: getDateRange('m', 1).startDate, // 시작일
    endCrtrYm: getDateRange('m', 1).endDate, // 종료일
    ctpvCd: '',
    locgovCd: '',
    koiCd: '',
    taskSeCd: '',
  })

  const [codeList, setCodeList] = useState<SelectItem[]>([])

  // 업무구분 변경시 해당업무구분에 맞게 면허업종을 세팅함
  useEffect(() => {
    handleKoiCdData(params.taskSeCd)
  }, [params.taskSeCd])

  useEffect(() => {
    setEnableData(false)
  }, [params, prdAdupYn])

  const handleKoiCdData = async (taskSeCd: string) => {
    const taskKoiNone = 'C'

    let koiCdList: Array<commonCodeObj> = await getCodesByGroupNm('599')
    let filteredList: Array<SelectItem> = []
    if (taskSeCd === '010' || taskSeCd === '030') {
      filteredList = koiCdList
        .filter((value: commonCodeObj) => {
          return value.cdNm != taskKoiNone
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    } else {
      filteredList = koiCdList.map((val, index) => {
        return { label: val.cdKornNm, value: val.cdNm }
      })
    }

    filteredList.unshift({ value: '', label: '전체' })
    setCodeList(filteredList)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    console.log(searchValidation())
    if (searchValidation()) {
      setLoading(true)

      try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/sta/blfps/cm/getAllByLogoFsmPymntSttus?` +
          `${params.strCrtrYm ? '&strCrtrYm=' + params.strCrtrYm.replaceAll('-', '') : ''}` +
          `${params.endCrtrYm ? '&endCrtrYm=' + params.endCrtrYm.replaceAll('-', '') : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
          `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
          `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
          `${prdAdupYn ? '&groupYn=Y' : '&prdAdupYn=N'}`

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
  }

  const excelDownload = async () => {
    
    if (!enableData) {
      alert('데이터 조회 후 엑셀다운로드 하시기 바랍니다.')
      return
    }else if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    setIsDataProcessing(true)

    if (searchValidation()) {
      let endpoint: string =
        `/fsm/sta/blfps/cm/getExcelByLogoFsmPymntSttus?` +
        `${params.strCrtrYm ? '&strCrtrYm=' + params.strCrtrYm.replaceAll('-', '') : ''}` +
        `${params.endCrtrYm ? '&endCrtrYm=' + params.endCrtrYm.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
        `${prdAdupYn ? '&groupYn=Y' : '&prdAdupYn=N'}`
      
      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    }

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
      `/fsm/sta/blfps/cm/getPrintByLogoFsmPymntSttus?` +
      `${params.strCrtrYm ? '&strCrtrYm=' + params.strCrtrYm.replaceAll('-', '') : ''}` +
      `${params.endCrtrYm ? '&endCrtrYm=' + params.endCrtrYm.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
      `${prdAdupYn ? '&groupYn=Y' : '&prdAdupYn=N'}`

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

        const crfName = 'byLogoFsmPymntSttus';
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

  const searchValidation = () => {
    if (!params.strCrtrYm) {
      alert('검색 시작기간을 입력해주세요.')
    } else if (!params.endCrtrYm) {
      alert('검색 종료기간을 입력해주세요.')
    } else if (params.strCrtrYm > params.endCrtrYm) {
      alert('검색 시작기간이 종료기간보다 큽니다 다시 확인해주세요.')
    //} else if (!params.ctpvCd) {
    //  alert('시도명을 선택해주세요.')
    // } else if (!params.locgovCd) {
    //   alert('관할관청을 선택해주세요.')
    } else {
      return true
    }

    return false
  }

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

  const customHeader = useCallback((): React.ReactNode => {
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
  }, [])

  return (
    <PageContainer
      title="지자체별 유가보조금 지급현황"
      description="지자체별 유가보조금 지급현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="지자체별 유가보조금 지급현황" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
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
                htmlFor="sch-taskSeCd"
              >
                구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="801"
                pValue={params.taskSeCd}
                handleChange={handleSearchChange}
                pName="taskSeCd"
                htmlFor={'sch-taskSeCd'}
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
                onChange={(event) => handleSearchChange(event)}
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
                name="strCrtrYm"
                value={params.strCrtrYm}
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
                name="endCrtrYm"
                value={params.endCrtrYm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                inputProps={{
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
          headCells={staBlfpsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          loading={loading} // 로딩여부
          customHeader={customHeader}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
