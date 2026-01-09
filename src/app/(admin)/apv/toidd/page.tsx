'use client'

/* React */
import React, { ReactNode, useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange, getExcelFile, getToday, isNumber } from '@/utils/fsms/common/comm'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { diffYYYYMMDD } from '@/utils/fsms/common/util'

/* 공통 type, interface */
import { Pageable2, HeadCell } from 'table'
//import { apvToiddVhclHC, apvToiddOiHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '택시거래정보',
  },
  {
    to: '/apv/toidd',
    title: '택시영업정보 거래내역',
  },
]

// 아래두개 나중에 옮겨야 함
const apvToiddVhclHC: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzmnSeNm',
    numeric: false,
    disablePadding: false,
    label: '개인법인구분',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체명',
  },
  {
    id: 'operationNmTag',
    numeric: false,
    disablePadding: false,
    label: '운행정보 시스템 등록여부',
  },
]

const apvToiddOiHC: HeadCell[] = [
  {
    id: 'operationNmTag',
    numeric: false,
    disablePadding: false,
    label: '운행여부',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사명',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    format: 'cardNo',
    label: '카드번호',
  },
  {
    id: 'dlngSeNm',
    numeric: false,
    disablePadding: false,
    label: '거래구분',
  },
  {
    id: 'trauYmd',
    numeric: false,
    disablePadding: false,
    label: '거래일자',
    format: 'yyyymmdd',
  },
  {
    id: 'dlngTm',
    numeric: false,
    disablePadding: false,
    label: '거래시각',
    format: 'hh24miss',
  },
  {
    id: 'dailUseAcmlNmtm',
    numeric: false,
    disablePadding: false,
    label: '거래순번',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
  {
    id: 'frcsBrno',
    numeric: false,
    disablePadding: false,
    label: '가맹점\n사업자등록번호',
    format: 'brno',
  },
  {
    id: 'literAcctoUntprcSeNm',
    numeric: false,
    disablePadding: false,
    label: '사용량단가구분',
  },
  {
    id: 'literAcctoUntprc',
    numeric: false,
    disablePadding: false,
    label: '사용량당단가',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'useLiter',
    numeric: false,
    disablePadding: false,
    label: '가맹점사용량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'moliatUseLiter',
    numeric: false,
    disablePadding: false,
    label: '국토부사용량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'koiUnitNm',
    numeric: false,
    disablePadding: false,
    label: '단위',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'vhclPorgnUntprc',
    numeric: false,
    disablePadding: false,
    label: '차량등록지\n지역별평균단가',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'literAcctoOpisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금\n사용량당단가',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'exsMoliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세\n 연동보조금(ⓐ)',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'opisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가\n연동보조금(ⓑ)',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '국토부보조금\n(ⓐ+ⓑ)',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'pbillAmt',
    numeric: false,
    disablePadding: false,
    label: '수급자\n부담금',
    format: 'number',
    align: 'td-right',
  },
]

interface vhclRow {
  vhclNo: string
  brno: string
  bzmnSeNm: string
  locgovNm: string
  operationYn: string
  operationNm: string
  operationNmTag: ReactNode
  locgovCd: string
}

interface oiRow {
  cardNo: string
  trauYmd: string
  dlngTm: string
  dailUseAcmlNmtm: string
  vhclNo: string
  frcsNm: string
  frcsBrno: string
  literAcctoUntprc: string
  useLiter: string
  moliatUseLiter: string
  aprvAmt: string
  moliatAsstAmt: string
  vhclPorgnUntprc: string
  opisAmt: string
  literAcctoOpisAmt: string
  exsMoliatAsstAmt: string
  crdcoNm: string
  dlngSeNm: string
  literAcctoUntprcSeNm: string
  koiNm: string
  koiUnitNm: string
  frcsLocgovNm: string
  pid: string
  pbillAmt: string
  ctpvCd: string
  locgovCd: string
  koiCd: string
  operationYn: string
  operationNm: string
  operationNmTag: ReactNode
}

// 검색조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string,
  locgovCd: string
  bgngDt: string
  endDt: string
  brno: string
  vhclNo: string
}

const DataList = () => {

  const userInfo = getUserInfo()

  /* 공통 */
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  /* 차량정보 */
  const [vhclRows, setVhclRows] = useState<vhclRow[]>([])
  const [vhclTotalRows, setVhclTotalRows] = useState<number>(0)
  const [vhclSelectedRow, setVhclSelectedRow] = useState<vhclRow>()
  const [vhclSelectedIndex, setVhclSelectedIndex] = useState<number>(-1)
  const [vhclFlag, setVhclFlag] = useState<boolean | null>(null)
  const [vhclLoading, setVhclLoading] = useState<boolean>(false)
  const [vhclPageable, setVhclPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [vhclParams, setVhclParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    bgngDt: getDateRange('d', 30).startDate,
    endDt: getDateRange('d', 30).endDate,
    brno: '',
    vhclNo: '',
  })

  /* 영업정보 거래내역 */
  const [dateRange, setDateRange] = useState({
    begin: "",
    end: "",
  })
  const [oiRows, setOiRows] = useState<oiRow[]>([])
  const [oiTotalRows, setOiTotalRows] = useState<number>(0)
  const [oiFlag, setOiFlag] = useState<boolean | null>(null)
  const [oiLoading, setOiLoading] = useState<boolean>(false)
  const [oiPageable, setOiPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [oiParams, setOiParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    bgngDt: '',
    endDt: '',
    brno: '',
    vhclNo: '',
  })

  /*
    운행정보 시스템 기준일자 세팅
  */
  useEffect(() => {
    const today = new Date();

    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 30);

    const beginDate = new Date(today);
    beginDate.setDate(today.getDate() - 1);

    const format = (d: Date): string => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };


    setDateRange({
      begin: format(beginDate),
      end: format(endDate),
    });
  }, [])

  /* 차량정보 조회 */
  useEffect(() => {
    if (vhclFlag !== null) {
      fetchVhclData()
    }
  }, [vhclFlag])

  /* 영업정보 거래내역 조회 */
  useEffect(() => {
    if (oiFlag != null) {
      fetchOiData()
    }
  }, [oiFlag])

  /* 관리자여부 세팅 */
  useEffect(() => {
    if (userInfo && userInfo.roles && Array.isArray(userInfo.roles)) {
      const roles: string[] = userInfo.roles
      setIsAdmin(roles.includes('ADMIN'))
    }
  }, [userInfo])

  /* 차량정보 데이터 초기화 */
  const resetVhclData = (): void => {
    setVhclRows([])
    setVhclTotalRows(0)
    setVhclSelectedRow(undefined)
    setVhclSelectedIndex(-1)
    setVhclPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  /* 영업정보 거래내역 데이터 초기화 */
  const resetOiData = (): void => {
    setOiRows([])
    setOiTotalRows(0)
    setOiPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  /* 차량정보 조회시 검색조건 검증 */
  const validation = (isExcel: boolean): boolean => {

    // 관리자일경우 검색조건 검증 통과
    if (isAdmin) {
      return true
    }

    if (!vhclParams.ctpvCd) {
      alert('시도명을 선택 해주세요')
    } else if (!vhclParams.locgovCd) {
      alert('관할관청을 선택 해주세요')
    } else if (!vhclParams.bgngDt) {
      alert('거래시작일자를 입력 해주세요')
    } else if (!vhclParams.endDt) {
      alert('거래종료일자를 입력 해주세요')
    } else if (vhclParams.bgngDt > vhclParams.endDt) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
    } else if (!diffYYYYMMDD(vhclParams.endDt, vhclParams.bgngDt, 3)) {
      // diffYYYYMMDD 함수에서 alert 처리
    } else if (isExcel && !vhclRows.length) {
      alert('차량정보가 조회되지 않았습니다.')
    } else if (isExcel && !oiRows.length) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
    } else if (isExcel && !excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
    } else {
      return true
    }
    return false
  }

  /* 차량정보 조회 */
  const fetchVhclData = async (): Promise<void> => {

    if (!validation(false)) {
      return
    }

    resetVhclData()
    resetOiData()
    setVhclLoading(true)
    setExcelFlag(true)

    try {

      const searchObj: listSearchObj = {
        ...vhclParams,
        bgngDt: vhclParams.bgngDt.replaceAll('-', ''),
        endDt: vhclParams.endDt.replaceAll('-', ''),
      }

      // 차량 검색조건으로 영업정보 거래내역 검색조건 세팅
      setOiParams(prev => ({
        ...prev,
        ...searchObj,
      }))

      const endpoint = '/fsm/apv/toidd/tx/getAllTaxiOprInfoVhcl' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length) {
        const temp: vhclRow[] = response.data.content
        temp.map(item => {
          const color = item.operationYn === 'Y' ? 'blue' : '#f44336'
          item.operationNmTag = <Box color={color}>{item.operationNm}</Box>
        })
        setVhclRows(temp)
        setVhclTotalRows(response.data.totalElements)
        setVhclPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        handleRowClick(temp[0], 0)
      }
    } catch (error) {
      console.error('Error fetchVhclData:', error)
    } finally {
      setVhclLoading(false)
    }
  }

  /* 영업정보 거래내역 조회 */
  const fetchOiData = async (): Promise<void> => {

    if (!vhclSelectedRow) {
      return
    }

    resetOiData()
    setOiLoading(true)

    try {

      // 검색 조건에 맞는 endpoint 생성
      const endpoint = '/fsm/apv/toidd/tx/getAllTaxiOprInfoDelngDtls' + toQueryParameter(oiParams)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length) {
        const temp: oiRow[] = response.data.content
        console.log(temp)
        temp.map(item => {
          const color = item.operationYn === 'Y' ? 'blue' : '#f44336'
          item.operationNmTag = <Box color={color}>{item.operationNm}</Box>
        })
        // 데이터 조회 성공시
        setOiRows(temp)
        setOiTotalRows(response.data.totalElements)
        setOiPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetchOiData:', error)
    } finally {
      setOiLoading(false)
    }
  }

  /* 영업정보 거래내역 엑셀파일 다운로드 */
  const excelDownload = async (type: 'vhcl' | 'oi'): Promise<void> => {

    if (!validation(true)) {
      return
    }

    try {
      const url = type === 'vhcl' ? '/fsm/apv/toidd/tx/getExcelTaxiOprInfoVhcl' : '/fsm/apv/toidd/tx/getExcelTaxiOprInfoDelngDtls'
      let searchObj: listSearchObj = type === 'vhcl' ? vhclParams : oiParams
      searchObj = {
        ...searchObj,
        bgngDt: searchObj.bgngDt.replaceAll('-', ''),
        endDt: searchObj.endDt.replaceAll('-', ''),
      }
      const endpoint = url + toQueryParameter(searchObj)
      const title = type === 'vhcl' ? '택시 차량정보' : '택시영업정보 거래내역'
      await getExcelFile(endpoint, title + '_' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    }
  }

  /* 검색 */
  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setVhclParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setVhclFlag((prev) => !prev)
  }

  /* 차량정보 조회 페이징 */
  const vhclPaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setVhclParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setVhclFlag((prev) => !prev)
  }, [])

  /* 영업정보 거래내역 페이징 */
  const oiPaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setOiParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setOiFlag((prev) => !prev)
  }, [])

  /* 행 클릭 시 호출되는 함수 */
  const handleRowClick = useCallback((row: vhclRow, index?: number): void => {
    // 차량 검색조건으로 영업정보 거래내역 검색조건 세팅
    setOiParams(prev => ({
      ...prev,
      page: 1,
      size: 10,
      brno: row.brno,
      vhclNo: row.vhclNo,
      locgovCd: row.locgovCd,
    }))
    setVhclSelectedIndex(index ?? -1)
    setVhclSelectedRow(row)
    setOiFlag((prev) => !prev)
  }, [])

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    if ((name === 'brno' && isNumber(value)) || name !== 'brno') {
      setVhclParams((prev) => ({ ...prev, [name]: value }))
      setExcelFlag(false)
    }
  }

  /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   * 나중에 지울부분 시작
   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

  const [vhclFlag2, setVhclFlag2] = useState<boolean | null>(null)

  /* 차량정보 조회 */
  useEffect(() => {
    if (vhclFlag2 !== null) {
      fetchVhclData2()
    }
  }, [vhclFlag2])

  /* 차량정보 조회 */
  const fetchVhclData2 = async (): Promise<void> => {

    if (!validation(false)) {
      return
    }

    resetVhclData()
    resetOiData()
    setVhclLoading(true)
    setExcelFlag(true)

    try {

      const searchObj: listSearchObj = {
        ...vhclParams,
        bgngDt: vhclParams.bgngDt.replaceAll('-', ''),
        endDt: vhclParams.endDt.replaceAll('-', ''),
      }

      // 차량 검색조건으로 영업정보 거래내역 검색조건 세팅
      setOiParams(prev => ({
        ...prev,
        ...searchObj,
      }))

      const endpoint = '/fsm/apv/toidd/tx/getAllTaxiOprInfoVhcl2' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length) {
        const temp: vhclRow[] = response.data.content
        temp.map(item => {
          const color = item.operationYn === 'Y' ? 'blue' : '#f44336'
          item.operationNmTag = <Box color={color}>{item.operationNm}</Box>
        })
        setVhclRows(temp)
        setVhclTotalRows(response.data.totalElements)
        setVhclPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        handleRowClick(temp[0], 0)
      }
    } catch (error) {
      console.error('Error fetchVhclData:', error)
    } finally {
      setVhclLoading(false)
    }
  }

  /* 검색 */
  const handleAdvancedSearch2 = (): void => {
    setVhclParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setVhclFlag2((prev) => !prev)
  }

  /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   * 나중에 지울부분 종료
   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

  return (
    <PageContainer title="택시영업정보 거래내역" description="택시영업정보 거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="택시영업정보 거래내역" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="form-list">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-ctpvCd"
                  className="input-label-display"
                  required
                >
                  시도명
                </CustomFormLabel>
                <CtpvSelect
                  pName="ctpvCd"
                  pValue={vhclParams.ctpvCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-ctpvCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-locgovCd"
                  className="input-label-display"
                  required
                >
                  관할관청
                </CustomFormLabel>
                <LocgovSelect
                  pName="locgovCd"
                  pValue={vhclParams.locgovCd}
                  handleChange={handleSearchChange}
                  ctpvCd={vhclParams.ctpvCd}
                  htmlFor={'sch-locgovCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  required
                >
                  거래일자
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  시작일
                </CustomFormLabel>
                <CustomTextField
                  value={vhclParams.bgngDt}
                  onChange={handleSearchChange}
                  name="bgngDt"
                  type="date"
                  id="ft-date-start"
                  fullWidth
                />
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  종료일
                </CustomFormLabel>
                <CustomTextField
                  value={vhclParams.endDt}
                  name="endDt"
                  onChange={handleSearchChange}
                  type="date"
                  id="ft-date-end"
                  fullWidth
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="ft-vhclNo"
                  className="input-label-display"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  placeholder=""
                  fullWidth
                  id="ft-vhclNo"
                  name="vhclNo"
                  value={vhclParams.vhclNo}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="ft-brno"
                  className="input-label-display"
                >
                  사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  fullWidth
                  id="ft-brno"
                  name="brno"
                  value={vhclParams.brno}
                  onChange={handleSearchChange}
                  inputProps={{
                    maxLength: 10,
                  }}
                />
              </div>
            </div>
          </div>
        </Box>
        {/* 검색영역 종료 */}

        {/* 버튼영역 시작 */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            {/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 나중에 지울부분 시작 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */}
            {isAdmin && (
              <Button variant="contained" color="primary" onClick={handleAdvancedSearch2}>
                검색(WITH절 테스트)
              </Button>
            )}
            {/* @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 나중에 지울부분 종료 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ */}
          </div>
        </Box>
        {/* 버튼영역 종료 */}
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard
          className="contents-card"
          title="택시 차량정보"
          buttons={[
            {
              label: '엑셀',
              disabled: !vhclRows.length,
              onClick: () => excelDownload('vhcl'),
              color: 'outlined',
            },
          ]}
        >
          <div style={{ marginBottom: '10px', color: 'red' }}>
            * 운행정보 시스템 등록기간 : {dateRange.end} ~ {dateRange.begin}
          </div>
          <TableDataGrid
            headCells={apvToiddVhclHC} // 테이블 헤더 값
            rows={vhclRows} // 목록 데이터
            loading={vhclLoading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            totalRows={vhclTotalRows} // 총 로우 수
            selectedRowIndex={vhclSelectedIndex} // 선택된 로우 인덱스
            onPaginationModelChange={vhclPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={vhclPageable}
            caption={'택시 차량정보'}
          />
        </BlankCard>
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <BlankCard
        className="contents-card"
        title="택시영업정보 거래내역"
        buttons={[
          {
            label: '엑셀',
            disabled: !oiRows.length,
            onClick: () => excelDownload('oi'),
            color: 'outlined',
          },
        ]}
      >
        <TableDataGrid
          headCells={apvToiddOiHC}
          rows={oiRows}
          loading={oiLoading}
          totalRows={oiTotalRows}
          onPaginationModelChange={oiPaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={oiPageable} // 현재 페이지 / 사이즈 정보
          caption={'택시 영업정보 거래내역 목록'}
        />
      </BlankCard>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default DataList
