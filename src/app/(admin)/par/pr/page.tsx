'use client'
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange, getToday, getExcelFile, openReport } from '@/utils/fsms/common/comm'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'

// components
import HeaderTab, { Tab } from '@/app/components/tables/HeaderTab'
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import DetailDataGrid from './_components/DetailDataGrid'
import AccountFormModal from './_components/AccountFormModal'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { parPrRfidMonTrHeadCells, parPrRfidVhclTrHeadCells, 
         parPrDealMonTrHeadCells, parPrDealVhclTrHeadCells } from '@/utils/fsms/headCells'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { SelectItem } from 'select'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '서면신청',
  },
  {
    title: '화물서면신청',
  },
  {
    to: '/par/pr',
    title: '서면신청(RFID/거래확인)',
  },
]

const tabs: Tab[] = [
  {
    value: '1',
    label: 'RFID',
    active: false,
  },
  {
    value: '2',
    label: '거래확인',
    active: false,
  },
]

export interface Row {
  brno: number
  bzentyNm: string
  locgovCd: string
  locgovNm: string
  asstAmt: number
  ftxAsstAmt: number
  opisAmt: number
  vhclNo: string
  crdcoCd: string
  cardNo: string
  cardNoS: string
  aprvAmt: number
  koiCd: string
  koiNm: string
  asstAmtClclnCd: string
  stlmYn: string
  stlmCardNoS: string
  stlmAprvNo: string
  crdcoNm: string
  chk: string
  lbrctCnt: number
  vhclCnt: number
  useLiter: number
  lbrctGiveAmt: number
  lbrctGiveNotAmt: number
  lbrctYm: string
  crno: string
  asstAmtLiter: number
  vhclTonCd: string
  bankCd: string
  actno: string
  dpstrNm: string
  bacntInfoSn: number
  vhclTonNm: string
  bankNm: string
  aplySn: number
  lbrctYmdTm: string
  lbrctYmd: string
  lbrctTm: string
  giveCfmtnYn: string
  giveCfmtnYmd: string
  giveCfmtnTxt: string
  giveCfmtnYmdD: string
  rcptSeqNo: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  clclnYm: string
  perAmt: number
  asstGiveAmt: number
  asstGiveNotAmt: number
  vonrNm: string
  vonrBrno: string
  aprvYmdTm: string
  aprvYmd: string
  aprvTm: string
  aprvNo: string
  prcsSeCd: string
  clclnSn: string
  asstAmtCmpttnSeNm: string
  col01: string
  col02: string
  col03: string
  col04: string
  col05: string
  col06: string
  col07: string
  col08: string
  col09: string
  col10: string
  col11: string
  col12: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

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

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [selectedTab, setSelectedTab] = useState<string | number>('1')
  const [dataSeCd, setDataSeCd] = useState<string>('RFID')

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 월별 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingDtl, setLoadingDtl] = useState(false) // 로딩여부

  const [vhclRows, setVhclRows] = useState<Row[]>([]) // 차량별 로우 데이터
  const [detail, setDetail] = useState<Row | null>(null) // 상세정보

  const [koicdItems, setKoicdItems] = useState<SelectItem[]>([]) // 유종 코드
  const [bankCdItems, setBankCdItems] = useState<SelectItem[]>([]) // 은행 코드
  const [vhclTonCdItems, setVhclTonCdItems] = useState<SelectItem[]>([]) // 톤수 코드

  // 월별
  const [selectedMonIndex, setSelectedMonIndex] = useState<number>(-1)
  const [selectedMonRow, setSelectedMonRow] = useState<Row>()

  // 차량별
  const [selectedVhclIndex, setSelectedVhclIndex] = useState<number>(-1)
  const [selectedVhclRow, setSelectedVhclRow] = useState<Row>()

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [remoteFlag, setRemoteFlag] = useState<boolean>(false);

  const monCustomHeader = (): React.ReactNode => {
    return (
      <TableHead>
        <TableRow>
          <TableCell rowSpan={2}>
            {dataSeCd == 'RFID' ? '주유월' : '정산월'}
          </TableCell>
          <TableCell rowSpan={2}>주유건수</TableCell>
          <TableCell rowSpan={2}>차량대수</TableCell>
          {dataSeCd == 'RFID' ? (
            <></>
          ) : (
            <>
              <TableCell rowSpan={2}>거래금액</TableCell>
            </>
          )}
          <TableCell rowSpan={2}>주유량</TableCell>
          <TableCell colSpan={3}>유가보조금</TableCell>
          <TableCell rowSpan={2}>지급금액</TableCell>
          <TableCell rowSpan={2}>미지급금액</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>합계</TableCell>
          <TableCell>유류세연동</TableCell>
          <TableCell>유가연동</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const vhclCustomHeader = (): React.ReactNode => {
    return (
      <TableHead>
        <TableRow>
          <TableCell rowSpan={2}>소유자명</TableCell>
          <TableCell rowSpan={2}>차량번호</TableCell>
          <TableCell rowSpan={2}>주유건수</TableCell>
          <TableCell rowSpan={2}>주유량</TableCell>
          <TableCell rowSpan={2}>보조리터</TableCell>
          <TableCell colSpan={3}>유가보조금</TableCell>
          <TableCell rowSpan={2}>지급금액</TableCell>
          <TableCell rowSpan={2}>미지급금액</TableCell>
          <TableCell rowSpan={2}>유종</TableCell>
          <TableCell rowSpan={2}>톤수</TableCell>
          <TableCell rowSpan={2}>예금주명</TableCell>
          <TableCell rowSpan={2}>금융기관</TableCell>
          <TableCell rowSpan={2}>계좌번호</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>합계</TableCell>
          <TableCell>유류세연동</TableCell>
          <TableCell>유가연동</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    vhclNo: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      if (params.ctpvCd && params.locgovCd) {
        setSelectedMonIndex(-1)
        setSelectedVhclIndex(-1)
        setVhclRows([])
        fetchData()
      }
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('m', 5)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    //공통코드setting
    handleCommCd()

    setFlag((prev) => !prev)
  }, [])

  useEffect(() => {
    setFlag((prev) => !prev)
  }, [dataSeCd])

  useEffect(() => {
    setSelectedVhclIndex(-1)
    setDetail(null)
  }, [selectedMonRow])

  const handleCommCd = async () => {
    let koiCdList: Array<commonCodeObj> = await getCodesByGroupNm('599') // 유종코드
    let vhclTonCdList: Array<commonCodeObj> = await getCodesByGroupNm('971') // 톤수코드
    let bankCdList: Array<commonCodeObj> = await getCodesByGroupNm('973') // 은행코드

    setKoicdItems(
      koiCdList.map((val) => {
        return { label: val.cdKornNm, value: val.cdNm }
      }),
    )
    setVhclTonCdItems(
      vhclTonCdList.map((val) => {
        return { label: val.cdKornNm, value: val.cdNm }
      }),
    )
    setBankCdItems(
      bankCdList.map((val) => {
        return { label: val.cdKornNm, value: val.cdNm }
      }),
    )
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if(!params.ctpvCd || params.ctpvCd == ''){
      alert("시도명을 선택해주세요.")
    }
    if(!params.locgovCd || params.locgovCd == ''){
      alert("관할관청을 선택해주세요.")
    }
    if(params.searchStDate.replaceAll('-', '').length != 6 || params.searchEdDate.replaceAll('-', '').length != 6){
      alert("주유월을 입력해주세요.")
    }

    try {
      setLoading(true)
      setExcelFlag(true) // 엑셀기능 동작여부

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/getAllPapersReqstRfidMon?page=${params.page}&size=${params.size}` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.searchStDate ? '&lbrctBgngYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
            `${params.searchEdDate ? '&lbrctEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`
          : `/fsm/par/pr/tr/getAllPapersReqstDealCnfirmMon?page=${params.page}&size=${params.size}` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.searchStDate ? '&clclnBgngYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
            `${params.searchEdDate ? '&clclnEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVhclData = async (row: Row) => {
    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다시 선택해주세요.')
      return
    }

    if(!params.ctpvCd || params.ctpvCd == ''){
      alert("시도명을 선택해주세요.")
    }
    if(!params.locgovCd || params.locgovCd == ''){
      alert("관할관청을 선택해주세요.")
    }
    if(params.searchStDate.replaceAll('-', '').length != 6 || params.searchEdDate.replaceAll('-', '').length != 6){
      alert("주유월을 입력해주세요.")
    }

    try {
      setLoadingDtl(true)

      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/getAllPapersReqstRfidVhcl?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${row.lbrctYm ? '&lbrctYm=' + row.lbrctYm : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`
          : `/fsm/par/pr/tr/getAllPapersReqstDealCnfirmVhcl?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${row.clclnYm ? '&clclnYm=' + row.clclnYm : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setVhclRows(response.data)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setVhclRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setVhclRows([])
    }finally{
      setLoadingDtl(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleMonRowClick = (row: Row, index?: number) => {
    setSelectedMonIndex(index ?? -1)
    setSelectedMonRow(row)

    fetchVhclData(row)
  }

  const handleVhclRowClick = (row: Row, index?: number) => {
    setSelectedVhclIndex(index ?? -1)
    setSelectedVhclRow(row)

    setDetail(row)
  }

  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleTabChange = (event: React.SyntheticEvent, tabValue: string) => {
    if (tabValue == '1') {
      setSelectedTab('1')
      setDataSeCd('RFID')
      setRows([])
    } else if (tabValue == '2') {
      setSelectedTab('2')
      setDataSeCd('DealCnfirm')
      setRows([])
    }
  }
  
  const openUpdateModal = () => {
    if(selectedVhclRow && selectedVhclIndex > -1) {
      if(selectedVhclRow?.asstGiveAmt != 0){
        setRemoteFlag(true);
      }else{
        alert('지급확정 상태가 아닙니다. 지급확정 후 수정 가능합니다.')
      }
    }else{
      alert('선택된 데이터가 없습니다')
    }
  }

  const reload = () => {
    setRemoteFlag(false);

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    if(!params.ctpvCd || params.ctpvCd == ''){
      alert("시도명을 선택해주세요.")
    }
    if(!params.locgovCd || params.locgovCd == ''){
      alert("관할관청을 선택해주세요.")
    }
    if(params.searchStDate.replaceAll('-', '').length != 6 || params.searchEdDate.replaceAll('-', '').length != 6){
      alert("주유월을 입력해주세요.")
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/getExcelPapersReqstRfidMon?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.searchStDate ? '&lbrctBgngYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
            `${params.searchEdDate ? '&lbrctEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`
          : `/fsm/par/pr/tr/getExcelPapersReqstDealCnfirmMon?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.searchStDate ? '&clclnBgngYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
            `${params.searchEdDate ? '&clclnEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

      let excelNm =
        dataSeCd == 'RFID'
          ? '월별 RFID(자가주유) 현황_'
          : '월별 거래확인카드 거래집계 현황_'

      await getExcelFile(endpoint, excelNm + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const detailExcelDownload = async (row: Row) => {
    if (vhclRows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    if(!params.ctpvCd || params.ctpvCd == ''){
      alert("시도명을 선택해주세요.")
    }
    if(!params.locgovCd || params.locgovCd == ''){
      alert("관할관청을 선택해주세요.")
    }
    if(params.searchStDate.replaceAll('-', '').length != 6 || params.searchEdDate.replaceAll('-', '').length != 6){
      alert("주유월을 입력해주세요.")
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/getExcelPapersReqstRfidVhcl?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${row.lbrctYm ? '&lbrctYm=' + row.lbrctYm : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`
          : `/fsm/par/pr/tr/getExcelPapersReqstDealCnfirmVhcl?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${row.clclnYm ? '&clclnYm=' + row.clclnYm : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      let excelNm =
        dataSeCd == 'RFID'
          ? '차량별 RFID(자가주유) 현황_'
          : '차량별 거래확인카드 거래집계 현황_'

      await getExcelFile(endpoint, excelNm + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const print = async () => {

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 출력이 가능합니다.')
      return
    }

    if(!params.ctpvCd || params.ctpvCd == ''){
      alert("시도명을 선택해주세요.")
    }
    if(!params.locgovCd || params.locgovCd == ''){
      alert("관할관청을 선택해주세요.")
    }
    if(params.searchStDate.replaceAll('-', '').length != 6 || params.searchEdDate.replaceAll('-', '').length != 6){
      alert("주유월을 입력해주세요.")
    }

    try {
      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/printPapersReqstRfid?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.searchStDate ? '&lbrctBgngYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
            `${params.searchEdDate ? '&lbrctEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`
          : `/fsm/par/pr/tr/printPapersReqstDealCnfirm?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.searchStDate ? '&clclnBgngYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
            `${params.searchEdDate ? '&clclnEndYm=' + params.searchEdDate.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        if (response.data.length == 0) {
          alert(
            dataSeCd == 'RFID'
              ? '자가주유 보조금정산내역이 없습니댜.'
              : '거래확인용카드 보조금정산내역이 없습니다.',
          )
          return
        }else{
          alert(response.message)
        }

        const responseData = response.data.map((item: any) => ({
          ...item,
          bgngYm: params.searchStDate,
          endYm: params.searchEdDate,
        }))

        const jsonData = { papersReqst: responseData }

        handleReport(
          dataSeCd == 'RFID' ? 'papersReqstRfid' : 'papersReqstDealCnfirm',
          JSON.stringify(jsonData),
        )
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const handleReport = (crfName?: string, crfData?: any) => {
    openReport(crfName, crfData)
  }

  return (
    <PageContainer title="서면신청관리" description="서면신청관리">
      {/* breadcrumb */}
      <Breadcrumb title="서면신청관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <HeaderTab
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      />
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
                required
              >
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
                pDisableSelectAll={true}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
                required
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
                pDisableSelectAll={true}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                주유월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                주유월 시작연월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{ max: params.searchEdDate }}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                주유월 종료연월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{ min: params.searchStDate }}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant='contained' onClick={() => openUpdateModal()}>
              수정
            </Button>
            <AccountFormModal
              size={'xl'}
              title={'계좌정보수정'}
              formLabel="검색"
              // content props
              dataSeCd={dataSeCd}
              vhclNo={selectedVhclRow?.vhclNo ?? ""}
              locgovCd={selectedVhclRow?.locgovCd ?? ""}
              crno={selectedVhclRow?.crno ?? ""}
              lbrctYm={selectedVhclRow?.lbrctYm ?? ""}
              vonrBrno={selectedVhclRow?.vonrBrno ?? ""}
              clclnYm={selectedVhclRow?.clclnYm ?? ""}
              bankCdItems={bankCdItems}
              // modal-open / reload
              closeHandler={() => setRemoteFlag(false)}
              remoteFlag={remoteFlag}
              reloadFn={reload}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
            <Button variant="contained" color="success" onClick={() => print()}>
              출력
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard
          title={
            dataSeCd == 'RFID'
              ? '월별 RFID(자가주유) 현황'
              : '월별 거래확인카드 거래집계 현황'
          }
        >
          <TableDataGrid
            headCells={
              dataSeCd == 'RFID'
                ? parPrRfidMonTrHeadCells
                : parPrDealMonTrHeadCells
            } // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleMonRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            selectedRowIndex={selectedMonIndex}
            paging={true}
            cursor={true}
            customHeader={monCustomHeader}
          />
        </BlankCard>
      </Box>

      {selectedMonRow && selectedMonIndex > -1 ? (
        <Box sx={{ mb: 3 }}>
          <BlankCard
            className="contents-card"
            title={
              dataSeCd == 'RFID'
                ? '차량별 RFID(자가주유) 현황'
                : '차량별 거래확인카드 거래집계 현황'
            }
            buttons={[
              {
                label: '엑셀',
                color: 'success',
                onClick: () => detailExcelDownload(selectedMonRow),
              },
            ]}
          >
            <TableDataGrid
              headCells={
                dataSeCd == 'RFID'
                  ? parPrRfidVhclTrHeadCells
                  : parPrDealVhclTrHeadCells
              } // 테이블 헤더 값
              rows={vhclRows} // 목록 데이터
              loading={loadingDtl} // 로딩여부
              onRowClick={handleVhclRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              selectedRowIndex={selectedVhclIndex}
              paging={false}
              cursor={true}
              customHeader={vhclCustomHeader}
            />
          </BlankCard>
        </Box>
      ) : (
        <></>
      )}

      {selectedVhclRow && selectedVhclIndex > -1 ? (
        <Box>
          <DetailDataGrid
            dataSeCd={dataSeCd}
            detail={detail}
            koiCdItems={koicdItems}
            bankCdItems={bankCdItems}
            vhclTonCdItems={vhclTonCdItems}
            //reload
            reloadFn={reload} // 콜백 전달
          />
        </Box>
      ) : (
        <></>
      )}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
