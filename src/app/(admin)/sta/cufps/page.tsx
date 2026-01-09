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
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'

/* 공통 컴포넌트 */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { openReport } from '@/utils/fsms/common/comm'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '../CustomDataGrid'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* 공통 type, interface */
import { SelectItem } from 'select'
import { staCufpsHC } from '@/utils/fsms/headCells'
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
    to: '/sta/cufps',
    title: '카드사용유가보조금 지급현황',
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
  crtrYm: string // 기준연월
  taskSeNm: string // 업무구분코드명
  crdcoNm: string // 카드사코드명
  vhclCntom: string // 차량대수
  asstLiter: string // 보조리터
  opsAmt: string // 유가보조금금액
  opisAmt: string // 유가연동보조금금액
  ftxIntrlckAsstAmt: string // 유류세연동보조금액
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  strCrtrYm: string
  endCrtrYm: string
  crdcoCd: string
  srchGb: string
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
    crdcoCd: '',
    srchGb: '',
  })

  const [codeList, setCodeList] = useState<SelectItem[]>([])

  // 업무구분 변경시 해당업무구분에 맞게 면허업종을 세팅함
  useEffect(() => {
    handleCrdcoData(params.srchGb)
  }, [params.srchGb])

  useEffect(() => {
    setEnableData(false)
  }, [params, prdAdupYn])

  const handleCrdcoData = async (taskSeCd: string) => {
    /**
     * CRD1  HD, SH, WR, KB, SS
     * CRD2  KB, SH, WR
     * CRD3  HD, SH, LT
     */
    let CRD1 = ['HD', 'SH', 'WR', 'KB', 'SS']
    let CRD2 = ['KB', 'SH', 'WR']
    let CRD3 = ['HD', 'SH', 'LT']

    let crdcoList: Array<commonCodeObj> = await getCodesByGroupNm('CRD')
    let filteredList: Array<SelectItem> = []
    if (taskSeCd === '010') {
      //화물
      filteredList = crdcoList
        .filter((value, index) => {
          return CRD1.includes(value.cdNm)
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    } else if (taskSeCd === '020') {
      //버스
      filteredList = crdcoList
        .filter((value, index) => {
          return CRD2.includes(value.cdNm)
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    } else if (taskSeCd === '030') {
      //택시
      filteredList = crdcoList
        .filter((value, index) => {
          return CRD3.includes(value.cdNm)
        })
        .map((val, index) => {
          return { label: val.cdKornNm, value: val.cdNm }
        })
    } else {
      filteredList = crdcoList.map((val, index) => {
        return { label: val.cdKornNm, value: val.cdNm }
      })
    }
    filteredList.unshift({ value: '', label: '전체' })
    setCodeList(filteredList)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (searchValidation()) {
      setLoading(true)

      try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/sta/cufps/cm/getAllCardUsFsmPymntSttus?` +
          `${params.strCrtrYm ? '&strCrtrYm=' + params.strCrtrYm.replaceAll('-', '') : ''}` +
          `${params.endCrtrYm ? '&endCrtrYm=' + params.endCrtrYm.replaceAll('-', '') : ''}` +
          `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
          `${params.srchGb ? '&taskSeCd=' + params.srchGb : ''}` +
          `${prdAdupYn ? '&groupYn=Y' : '&groupYn=N'}`

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
    if (rows.length === 0 || !enableData) {
      alert(excelErrorMessage)
      return
    }

    if (loading) {
      alert('조회중입니다.')
      return
    }

    if (searchValidation()) {
      setIsDataProcessing(true)
      let endpoint: string =
        `/fsm/sta/cufps/cm/getExcelCardUsFsmPymntSttus?` +
        `${params.strCrtrYm ? '&strCrtrYm=' + params.strCrtrYm.replaceAll('-', '') : ''}` +
        `${params.endCrtrYm ? '&endCrtrYm=' + params.endCrtrYm.replaceAll('-', '') : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.srchGb ? '&taskSeCd=' + params.srchGb : ''}` +
        `${prdAdupYn ? '&groupYn=Y' : '&groupYn=N'}`

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
      `/fsm/sta/cufps/cm/getPrintCardUsFsmPymntSttus?` +
      `${params.strCrtrYm ? '&strCrtrYm=' + params.strCrtrYm.replaceAll('-', '') : ''}` +
        `${params.endCrtrYm ? '&endCrtrYm=' + params.endCrtrYm.replaceAll('-', '') : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.srchGb ? '&taskSeCd=' + params.srchGb : ''}` +
        `${prdAdupYn ? '&groupYn=Y' : '&groupYn=N'}`

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

        const crfName = 'cardUsFsmPymntSttus';
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
    if (name == "srchGb")
    {
      setParams((prev) => ({ ...prev, crdcoCd: '' }))
    }
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
            구분
          </TableCell>
          <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
            카드사
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
      title="카드사용유가보조금 지급현황"
      description="카드사용유가보조금 지급현황"
    >
      {/* breadcrumb */}
      <Breadcrumb title="카드사용유가보조금 지급현황" items={BCrumb} />
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
                htmlFor="sch-crdcoCd"
              >
                카드사
              </CustomFormLabel>
              <select
                id="sch-crdcoCd"
                name="crdcoCd"
                className="custom-default-select"
                value={params.crdcoCd}
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
          headCells={staCufpsHC} // 테이블 헤더 값
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
