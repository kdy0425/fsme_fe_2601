'use client'
import React, { useEffect, useState } from 'react'
import { Box, Grid, Button, MenuItem, Stack ,Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { Label } from '@mui/icons-material'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import { useRouter, useSearchParams } from 'next/navigation'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { toQueryString } from '@/utils/fsms/utils'

import BlankCard from '@/components/shared/BlankCard'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import DetailDataGrid from './DetailDataGrid'
import { SelectItem } from 'select'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getCommCd, getCtpvCd, getExcelFile, getLocGovCd, getToday } from '@/utils/fsms/common/comm'

// 헤더셀
import {hisstncnctrheadCells, stncnccarnetcmprinfoTrHc} from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { isNumber } from '@/utils/fsms/common/comm';
import { selectedGridRowsCountSelector } from '@mui/x-data-grid'



const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/cnc',
    title: '자동차망비교조회',
  },
]





export interface Row {
  vhclNo?: string; // 차량번호
  locgovCd?: string; // 시도명+ 관할관청
  vhclSttsCd?: string; // 자동차망차량상태 일치여부
  cardCnt?: string; // 카드보유여부
  bzentyNm?: string; // 업체명
  crno?: string; // 사업자(법인)등록번호
  vonrRrno?: string; // 주민등록번호
  vhclSttsNm?: string; // 자동차정보 - 차량상태
  vonrRrnoSecure?: string; // 자동차정보 - 주민등록번호(별표)
  vonrNm?: string; // 자동차정보 - 차주성명
  vonrBrno?: string; // 자동차정보 - 차주사업자번호
  netVhclNo?: string; // 화물차량비교정보(자망) - 차량번호
  netKoiNm?: string; // 화물차량비교정보(자망) - 유종
  netReowNm?: string; // 화물차량비교정보(자망) - 업체명
  netVhclSttsNm?: string; // 화물차량비교정보(자망) - 차량상태
  carOwnerBzentyNm?: string; // 화물차량비교정보(FSMS) - 업체명(차주성명)
  netLocgovCdNm?: string; // 화물차량비교정보(자망) - 지자체명
  netVonrBrno?: string; // 화물차량비교정보(자망) - 사업자등록번호
  carCrnoS?: string; // 자동차 정보 사업자(법인)번호(복호화)
  carKoiNm?: string; // 자동차정보 - 유종
  koiNm?: string;
  vonrNmChangeYn?: string; // 차주성명(변경사항)
  vonrBrnoChangeYn?: string; // 차주사업자번호(변경사항)
  vonrRrnoChangeYn?: string; // 차주주민번호(변경사항)
  koiCdChangeYn?: string; // 유종(변경사항)
  vhclTonCdChangeYn?: string; // 톤수(변경사항)
  locgovCdChangeYn?: string; // 지자체(변경사항)
  vhclSttsCdChangeYn?: string; // 차량상태(변경사항)
  gbItas?: string; // 화물차량비교정보(FSMS) - 구분 (FSMS)
  gbVims?: string; // 화물차량비교정보(자망) - 구분(자망)
  gb?: string;
  netVhclTonNm?: string; // 화물차량비교정보(자망) - 톤수
  vhclSttsCdSameGb?: string; // 자동차정보 - 일치여부
  chk?: string; // 체크박스
  vhclTonCd?: string; // 톤수코드
  carVhclTonNm?: string; // 차량 톤수
  vhclTonNm?: string;
  lcnsTpbizCd?: string; // 면허업종코드
  vhclSeCd?: string; // 차량구분코드
  vhclRegYmd?: string; // 차량등록일자
  yridnw?: string; // 연식
  len?: string; // 길이
  bt?: string; // 너비
  maxLoadQty?: string; // 최대적재수량
  vhclPsnCd?: string; // 차량소유구분코드
  dscntYn?: string; // 삭제여부
  dscntYnNm?: string; // 삭제여부명
  souSourcSeCd?: string; // 원천소스구분
  bscInfoChgYn?: string; // 기본정보변경여부
  locgovAprvYn?: string; // 지자체승인여부
  vonrSn?: string; // 차량소유자일련번호
  rgtrId?: string; // 등록자아이디
  regDt?: string; // 등록일자
  mdfrId?: string; // 수정자아이디
  mdfcnDt?: string; // 수정일자
  carTelno?: string; // 차량 전화번호
  netMaxLoadQty?: string; // 자망정보 최대적재수량
  netKoiCd?: string; // 자망정보 유종코드
  netCarmdlTypeCd?: string; // 자망정보 차종유형코드
  netCarmdlClsfCd?: string; // 자망정보 차종분류코드
  netUsgDtlSeCd?: string; // 자망정보 용도상세구분
  netUsgsrhldStdgCd?: string; // 자망정보 사용본거지법정도코드
  netReowTelno?: string; // 대표소유자전화번호
  netReowUserNo?: string; // 대표소유자사용자번호(원본)
  netReowUserNoSecure?: string; // 대표소유자사용자번호(별표)
  netReowUserSeCd?: string; // 대표소유자사용자구분코드
  netVhclSttsCd?: string; // 자망정보 차량상태코드
  netLcnsTpbizCd?: string; // 자망정보 면허업종코드
  netVonrRrno?: string; // 자망정보 주민등록번호
  carLocgovCdNm?: string; // 차량 지자체명
  carCrno?: string; // 자동차 정보 사업자(법인)번호(원본)
  koiCd?: string; // 유종코드
  netLocgovCd?: string; // 자망정보 지자체코드
  locgovNm?: string;
  bizCrno?: string; // 사업자(법인)등록번호(원본)
  bizCrnoS?: string; // 사업자(법인)등록번호(법인)
  bizCrnoSecure?: string; // 사업자(법인)등록번호(별표)
  bzmnSeCd?: string; // 사업자구분코드
  crnoEncpt?: string;
  crnoEncptS?: string;
  rprsvRrno?: string; // 대표자주민등록번호(원본)
  rprsvRrnoS?: string; // 대표주민등록번호(복호화)
  rprsvRrnoSecure?: string; // 대표주민등록번호(별표)
  bizTelno?: string; // 사업자정보의 전화번호
  bizSouSourcSeCd?: string; // 원천소스구분
  bzmnSeCdNm?: string; // 사업자구분
  netVhclTonCd?: string; // 자동차차망정보의 톤수코드
  netKoiCdDiff?: string; // 자망정보의 유종코드
  liveCardCnt?: string; // 카드보유여부
  netVonrRrnoSecure? :string;
}



export interface ButtonGroupActionProps {
  onClickCarStatusModify: () => void // 일괄승인 버튼 action
}

// 상세정보에 있는 Button actions
const buttonGroupActions: ButtonGroupActionProps = {
  onClickCarStatusModify: function (): void {
  },
  
}


// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

// 커스텀 헤더 등록
const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={11}>
          자동차 정보
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={7}>
          변경 사항
        </TableCell>
        {/* <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={7}>
          변경사항
        </TableCell> */}
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>사업자(법인)번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>업체명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차주성명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차주사업자번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차주주민번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>톤급</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>지자체명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>일치여부</TableCell>

        <TableCell style={{ whiteSpace: 'nowrap' }}>차주성명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차주사업자번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차주주민번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>톤수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>지자체</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태</TableCell>        
      </TableRow>
    </TableHead>
  )
}



export const FreightPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [hisRows, setHisRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [historyLoading, setHistoryLoading] = useState(false) // 로딩여부


  const [selectedRow, setSelectedRow] = useState<Row>();  // 선택된 Row를 저장할 state

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [cityCode, setCityCode] = useState<SelectItem[]>([])  //        시도 코드
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드
  const [vhclSttsCode, setVhclSttsCode] = useState<SelectItem[]>([]) // 차량 상태 코드 
  const [cardCode, setCardCode] = useState<SelectItem[]>([]) // 카드 보유 여부 
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);



  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일

  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }


  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*_\-+=(){}[\]|\\:;"'<>,.?/]/g
    const regex2 = /[~`!@#$%^&*_\-+={}[\]|\\:;"'<>,.?/]/g

    
    if(name == 'crno' || name == 'vonrRrno'){
      if(isNumber(value)){
        setParams((prev) => ({ ...prev, page: 1, [name]: value }))  
      }
    }
    // else if(name == 'bzentyNm'){
    //   setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(regex2, '') }))
    // }
    else if(name == 'vhclNo'){
      setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))
    }else {
      setParams((prev) => ({ ...prev, page: 1, [name]: value.replaceAll(' ', '') }))
    }
	  setExcelFlag(false)
  }

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // // 관할관청 select item setting
  // useEffect(() => { // 시도 코드 변경시 관할관청 재조회
  //   // 관할관청
  //   if(params.ctpvCd) {
  //     getLocGovCd(params.ctpvCd).then((itemArr) => {
  //       setLocalGovCode(itemArr);
  //       // setParams((prev) => ({...prev, locgovCd: itemArr[0].value})); // 첫번째 아이템으로 기본값 설정
  //     })
  //   }
  // }, [params.ctpvCd])


  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedRow(selectedRow);
    setSelectedIndex(index?? -1);
    setHistoryFlag((prev)=> !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }


  // 초기 데이터 로드
  useEffect(() => {
    // 카드보유여부 전체 : 00, 보유 : 01, 미보유 : 02 
    // 파라미터 정의서 참조
    let cardCode: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
      {
        label: '보유',
        value: '01',
      },
      {
        label: '미보유',
        value: '02',
      },
    ]

    // getCommCd('226', '전체').then((itemArr) => setVhclSttsCode(itemArr))// 카드사
    setCardCode(cardCode)

    // getCtpvCd().then((itemArr) => {
    //   setCityCode(itemArr);
    //   setParams((prev) => ({...prev, ctpvCd: itemArr[0].value})); // 첫번째 아이템으로 기본값 설정
    // })// 시도코드 
  }, [])



  const handleCarStatusModify = () =>{
      // selectedRow를 가지고 historty  조회함  

      setHistoryFlag( prev => !prev)
  }
  
  

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      fetchData()
    }
  }, [flag])


  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(selectedRow === undefined){
      return 
    }
    var vhclNo = selectedRow['vhclNo'];
    fetchHistoryData(selectedRow)
  }, [historyflag])


  // 화물차량비교정보를 조회 파라미터 명세서 아직 안 나옴  
  const fetchHistoryData = async (selectedRow:any) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
      // 화물차량비교정보 history data 
        `/fsm/stn/cnc/tr/getCompareCarNetCmpr?page=${params.page}&size=${params.size}` +
        `${selectedRow['vhclNo'] ? '&vhclNo=' + selectedRow['vhclNo'] : ''}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setHisRows(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setHisRows([])
      }
    } catch (error) {
      setHisRows([])
    } finally {
      setLoading(false)
    }

  }

  //차량상태 변경을 요청한다.  파라미터 명세서 아직 안 나옴  
  const ConfirmData = async ( ) => {
    if (!selectedRow) return

    if(!confirm(
      `※ 자동차정보관리시스템에서 변동되는 차량변경정보는 처리후
다음날(익일) 유가보조금 관리시스템내에 반영됩니다.
선택한 ${selectedRow.vhclNo} 차량이 말소 됩니다.
대상 차량을 말소 처리 하겠습니까?`)){
      return
    }

    let chgRsnCn = '자동차망 비교 조회-FSMS 차량상태 동기화';
    let aplcnYmd = getToday();

    setLoading(true)
    try {
      const result = await putData(selectedRow, chgRsnCn, aplcnYmd);

      if (result === 'success') {
          alert('차량상태 변경이 처리되었습니다.')
      } else {
          alert('차량상태 변경 중 오류가 발생했습니다.')
      }
      setFlag((prev) => !prev) // 데이터 갱신을 위한 플래그 토글
      } catch (error) {
      console.error('Error processing data:', error)
      alert('차량상태 변경 중 오류가 발생했습니다.')
      } finally {
      setLoading(false)
      }
  }


  // 데이터 수정하는 메서드
  const putData = async (row : Row, chgRsnCn : string, aplcnYmd: string) => {
    setLoading(true)
    try {
    // 검색 조건에 맞는 endpoint 생성
    let endpoint: string =
        `/fsm/stn/vem/tr/createVhcleErsr`
    const response = await sendHttpRequest('POST', endpoint, {
        vhclNo: row.vhclNo,
        aplcnYmd: aplcnYmd,
        chgRsnCn: chgRsnCn,
    }, true, {
        cache: 'no-store',
    })
    if (response && response.resultType === 'success') {
        return 'success'
    } else {
        return 'failed'
    }
    } catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    return 'failed'
    } finally {
    setLoading(false)
    }
  }


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setLoading(true)
    setHisRows([])
	  setExcelFlag(true) // 엑셀기능 동작여부
	
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/cnc/tr/getAllCarNetCmpr?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` + 
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
        `${params.cardCnt ? '&cardCnt=' + params.cardCnt : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.crno ? '&crno=' + params.crno : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}`
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

  const excelDownload = async () => {

	if(rows.length == 0){
	  alert('엑셀파일을 다운로드할 데이터가 없습니다.')
	  return;
	}

	if(!excelFlag){
	  alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
	  return
	}

	try{
	  setLoadingBackdrop(true)

    let endpoint: string =
      `/fsm/stn/cnc/tr/getExcelCarNetCmpr?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` + 
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}` +
        `${params.cardCnt ? '&cardCnt=' + params.cardCnt : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.crno ? '&crno=' + params.crno : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}`
        

        
		await getExcelFile(endpoint, '화물 자동차망비교조회_'+getToday()+'.xlsx')
		      }catch(error){
		        console.error("ERROR :: ", error)
		      }finally{
		        setLoadingBackdrop(false)
		      }
	}




  return (
    <PageContainer
      title="자동차망비교조회"
      description="자동차망비교조회 페이지"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
      <Box className="sch-filter-box">
        <div className="form-list">
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
                htmlFor="sch-locgovCd"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
              />
            </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-vhclSttsCd"
                >
                자동차망 차량상태 일치여부
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="226"
                  pValue={params.vhclSttsCd}
                  handleChange={handleSearchChange}
                  pName="vhclSttsCd"
                  htmlFor={'sch-vhclSttsCd'}
                  addText="전체"
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-cardCnt"
                >
                카드보유여부              
                </CustomFormLabel>
                <select
                  id="ft-cardCnt"
                  className="custom-default-select"
                  name="cardCnt"
                  value={params.cardCnt ?? ''}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  {cardCode.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>  
            {/* 신청일자 datePicker */}
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-vhclNo"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField  name="vhclNo"
                  value={params.vhclNo ?? ''}
                  onChange={handleSearchChange}  type="text" id="ft-vhclNo" fullWidth 
                  inputProps={{maxLength : 9}}/>
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-bzentyNm"
                >
                  업체명
                </CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-bzentyNm"
                  name="bzentyNm"
                  fullWidth
                  value={params.bzentyNm ?? ''}
                  onChange={handleSearchChange}
                  inputProps={{
                    maxLength: 50
                  }}
                />
              </div>
              <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-crno"
              >
                사업자(법인)등록번호
              </CustomFormLabel>
              <CustomTextField  name="crno"
                value={params.crno ?? ''}
                onChange={handleSearchChange}  type="text" id="ft-crno" fullWidth 
                inputProps={{maxLength : 13}}/>
              </div>
              <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vonrRrno"
                  >
                    주민등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vonrRrno"
                    fullWidth
                    name="vonrRrno"
                    value={params.vonrRrno ?? ''}
                    onChange={handleSearchChange}
                    type="text"
                    inputProps={{maxLength : 13}}
                  />
              </div>  

          </div>
        </div>
      </Box>
        <Box className="table-bottom-button-group">
            <div className="button-right-align">
			<LoadingBackdrop open={loadingBackdrop} />
              <Button type="submit" variant="contained" color="primary">
                검색
              </Button>
              <Button variant="contained" color="success" onClick={() => excelDownload()} >
                엑셀
              </Button>
            </div>
          </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          customHeader={customHeader}
          headCells={stncnccarnetcmprinfoTrHc} // 테이블 헤더 값
          selectedRowIndex={selectedIndex}
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
		      caption={"화물 자동차망비교 조회 목록"}
        />
      </Box>
      {/* 테이블영역 끝 */}

      <>
      {selectedRow && (
          <DetailDataGrid  
            row={rows[selectedIndex]} 
            confirmData = {ConfirmData}
          />
      )}
      </>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default FreightPage
