'use client'
import {
  Box,
  Button,
  FormControlLabel,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb , CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { SelectItem } from 'select'
import SetledAprvModal from '@/app/components/tr/popup/SetledAprvModal'
import { useDispatch } from '@/store/hooks'
import { openSetledAprvModal } from '@/store/popup/SetledAprvInfoSlice'
import SetlCardAprvModal from '@/app/components/tr/popup/SetlCardAprvModal'
import { openSetlCardAprvModal } from '@/store/popup/SetlCardAprvSlice'
import ModalContent01 from './_components/ModalContent01'
import FormModal from '@/app/components/popup/FormDialog'
import { getExcelFile, getToday, getDateRange } from '@/utils/fsms/common/comm'
import RfIdHistoryModal from '@/app/components/tr/popup/RfIdHistoryModal'
import { openRfIdHistoryModal } from '@/store/popup/RfIdHistorySlice'
import ModalContent02 from './_components/ModalContent02'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import {getFormatToday} from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {apvFddDelngMonsTrHc, apvFddDelngDtlsTrHc} from '@/utils/fsms/headCells'
import { isNumber } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '화물거래정보',
  },
  {
    to: '/apv/fdd',
    title: '거래내역',
  },
]

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          차량번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          소유자명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          거래월
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          승인금액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사용리터
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={3}>
          보조금
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          보조리터
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          유종
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          톤수
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사업자등록번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          관할관청
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유류세연동</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가연동</TableCell>
      </TableRow>
    </TableHead>
  )
}

const customHeader2 = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          소급
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          차량번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          소유자명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          카드사
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          카드번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          구분
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          거래구분
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          결제구분
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          승인금액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          사용리터
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={3}>
          보조금액
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          보조리터
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          승인일시
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          취소 원거래일시
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          승인번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          가맹점명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          가맹점코드
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          소급결과
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          비고
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합계</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유류세연동</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가연동</TableCell>
      </TableRow>
    </TableHead>
  )
}

export interface Row {
  vhclNo: string
  aprvYmd: string
  vonrNm: string
  koiCdNm: string
  vhclTonCdNm: string
  brno: string
  vonrBrno : string
  locgovNm: string
  aprvAmt: string
  useLiter: string
  asstAmt: string
  opisAmt: string
  ftxAsstAmt: string
  asstAmtLiter: string
  rtroactYn: string
  chk: string
  retroactResult: string
  prcsSeCd: string
  aprvRtrcnYn: string
  vonrRrno: string
  locgovCd: string
  crdcoCdNm: string
  cardNo: string
  cardNoS: string
  cardNoSecure: string
  crdcoCd: string
  aprvTm: string
  aprvYmdTm: string
  aprvNo: string
  aprvYn: string
  stlmYn: string
  unsetlLiter: string
  unsetlAmt: string
  frcsNm: string
  frcsCdNo: string
  cardSeCdNm: string
  cardSeCd: string
  cardSttsCdNm: string
  stlmCardNo: string
  stlmCardNoS: string
  stlmAprvNo: string
  ceckStlmYn: string
  origTrauTm: string
  origTrauYmdTm: string
  asstAmtCmpttnSeNm: string
  trsmYn: string
  regDt: string
  subGb: string
  colorGb: string
  lbrctYmd: string
  stlmCardAprvYmd: string
  stlmCardAprvTm: string
  stlmCardAprvYmdTm: string
  stlmCardAprvNo: string
  orgAprvAmt: string
  aprvGb: string
  color: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  brno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const dispatch = useDispatch();
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [openReqModal, setOpenReqModal] = useState<boolean>(false);
  const [openCclModal, setOpenCclModal] = useState<boolean>(false);

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    brno: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const [pageable2, setPageable2] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const [detailRows, setDetailRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows2, setTotalRows2] = useState(0) // 총 수
  const [loading2, setLoading2] = useState(false) // 로딩여부

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)

  const [selectedDetailIndex, setSelectedDetailIndex] = useState<number>(-1)
  const [selectedDetailRow, setSelectedDetailRow] = useState<Row | null>(null)

  const [cardSeCdItems, setCardSeCdItems] = useState<SelectItem[]>([])

  const [chk, setChk] = useState<boolean>(false); // 취소포함 flag

  const [requestalble, setRequestalble] = useState<boolean>(false);
  const [cancelable, setCancelable] = useState<boolean>(false);
  
  const [disableCH, setDisableCH] = useState<boolean>(true);
  const [disableSH, setDisableSH] = useState<boolean>(true);

  const [checkedRows, setCheckedRows] = useState<Row[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [excelFlag, setExcelFlag] = useState<boolean>(false);

  const [excelModalOpen, setExcelModalOpen] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      setSelectedIndex(-1)
      setSelectedRow(null)
      setSelectedDetailIndex(-1)
      setSelectedDetailRow(null)
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {

    const dataRange = getDateRange('m', 1);

    let startDate = dataRange.startDate;
    let endDate = dataRange.endDate;

    setParams((prev) => ({...prev, 
      searchStDate: startDate,
      searchEdDate: endDate
    }))
  }, [])

  useEffect(() => {
    setSelectedDetailIndex(-1)
    setSelectedDetailRow(null)
  }, [selectedIndex])

  useEffect(() => {
      //첫행조회
      if (rows && rows.length > 0) {
        handleRowClick(rows[0], 0)
      }
    }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if(!params.vhclNo && !params.brno.replaceAll('-', '')) {
      alert("차량번호 또는 사업자등록번호 중 1개 항목은 필수 입력해주세요");
      return;
    }

    try {
      setLoading(true)
      setExcelFlag(true) // 엑셀기능 동작여부

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/fdd/tr/getAllDelngMons?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno.replaceAll('-', '') : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`

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
      } else if(response.resultType === 'fail'){
        alert(response.message);
      } else{
        // 데이터가 없거나 실패
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

  useEffect(() => {
    if(selectedRow){
      fetchDetail()  
    }
  }, [selectedRow])

  const fetchDetail = async (page?: number, size?: number) => {

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다시 선택해주세요.')
      return
    }

    if (selectedRow) {
      setLoading2(true)
      try {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/apv/fdd/tr/getAllDelngDtls?page=${page}&size=${size}` +
          `${selectedRow.vhclNo ? '&vhclNo=' + selectedRow.vhclNo : ''}` +
          `${selectedRow.brno ? '&brno=' + selectedRow.brno : ''}` +
          `${params.chk ? '&chk=' + params.chk : ''}` +
          `${selectedRow.aprvYmd ? '&aprvYmd=' + selectedRow.aprvYmd : ''}` +
          `${params.cardNo ? '&cardNo=' + params.cardNo : ''}` +
          `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
          `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success' && response.data) {
          // 데이터 조회 성공시
          const responseData = response.data.content.map((item: Row) => ({
            ...item,
            
            color: 
            item.colorGb === '일반' ? 'black'
            : item.stlmYn === '취소원거래' ? 'red'
            : item.colorGb === '취소' ? 'blue'
            : item.colorGb === '결제' ? 'brown'
            : item.colorGb === '휴지' ? 'forestgreen'
            : item.colorGb === '차감' ? 'magenta'
            : item.colorGb === '탱크' ? 'orange'
            : item.colorGb === '미경과' ? 'orange'
            : 'orange'
          }));
          
          //setDetailRows(response.data.content)
          setDetailRows(responseData);
          setTotalRows2(response.data.totalElements)
          setPageable2({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

        } else {
          // 데이터가 없거나 실패
          setDetailRows([])
          setTotalRows2(0)
          setPageable2({
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
          })
        }
      } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
        setDetailRows([])
        setTotalRows2(0)
        setPageable2({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      } finally {
        setLoading2(false)
      }
    }
  }

  const excelDownload = async () => {
    setIsFetching(true)
    setLoadingBackdrop(true)
    try{

      let endpoint: string = 
      params.excelType && params.excelType == 'M' ?
        `/fsm/apv/fdd/tr/getExcelDelngMons?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno.replaceAll('-', '') : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`
      : `/fsm/apv/fdd/tr/getExcelDelngDtls?` +
        `${selectedRow?.vhclNo ? '&vhclNo=' + selectedRow?.vhclNo : ''}` +
        `${selectedRow?.brno ? '&brno=' + selectedRow?.brno.replaceAll('-', '') : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}` +
        `${selectedRow?.aprvYmd ? '&aprvYmd=' + selectedRow?.aprvYmd : ''}` +
        `${params.cardNo ? '&cardNo=' + params.cardNo : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}`+
        (params.excelType == 'A' ? `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` + `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` : '')
  
      await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + `_${params.excelType == 'M' ? '월별 보조금현황_' : '카드거래 상세내역_'}`+getToday()+'.xlsx')
    }catch(error){
      console.error('Error : excelDownload', error)
    }finally{
      setIsFetching(false)
      setExcelModalOpen(false)
      setLoadingBackdrop(false)
    }
  }

  useEffect(() => {
    if(detailRows && detailRows.length > 0) {
      detailRows.map((item, index) => {

        /* 소급요청은 소급에 체크된 목록 갯수 > 0, rtroact_yn=N, asstAmtCmpttnSeNm=B, asstAmt=0, aprvRtrcnYn=N, prcsSeCd=1 
         일 경우 소급요청 모달 띄움 */
        if(checkedRows.length > 0
          && item.rtroactYn == 'N' 
          && item.asstAmtCmpttnSeNm == 'B' 
          && item.asstAmt == '0'
          && item.aprvRtrcnYn == 'N'
          && item.prcsSeCd == '1'
        ) {
          setRequestalble(true);
        }
  
        /**
         *  상세 조회 시 소급에 체크 된 목록이 1개 이상 있고 , 
            rtroact_yn = 'Y', TRSM_YN = 'N' , 
            REG_DT = 오늘날짜(yyyymmdd) 인 경우 소급취소 모달 뛰움
         *  */
        if(item.chk == '1'
          && item.rtroactYn == 'Y'
          && item.trsmYn == 'N'
          && item.regDt == getToday()
        ) {
          setCancelable(true);
        }
        
        if(item.rtroactYn == 'N'
          && item.asstAmtCmpttnSeNm == 'B'
          && item.asstAmt == '0'
          && item.aprvRtrcnYn == 'N'
          && item.prcsSeCd == '1'
        ) {
          // 조건 충족 시 체크박스 체크,해제 가능
          return;
        }else {
          if(item.chk == '1') {
            // 체크가 되어있으면 readonly
            readOnlyCheckBox(index)
          }else {
            // 체크 안되어있으면 disabled로 시각적 구분
            disableCheckBox(index);
          }
        }
      })
    }
  }, [detailRows])

  const disableCheckBox = (index:number) => {
    document.getElementById('tr'+index)?.setAttribute('disabled', 'true');
  }

  const readOnlyCheckBox = (index:number) => {
    document.getElementById('tr'+index)?.setAttribute('onclick', 'return false'); 
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
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

  const handlePaginationModelChange2 = async (
    page: number,
    pageSize: number,
  ) => {
    await fetchDetail(page, pageSize)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(row)
  }
  
  const handleDetailRowClick = (row: Row, index?: number) => {
    /**
     * 결제카드내역 버튼은 상세 정보에서 조회된 결과에서 선택된 행의 데이터 중 STLM_YN 값이 일부결제 또는 완결일 경우 
     * 버튼 활성화 나머지는 비활성화 되게 변경 또한 선택된 행이 없으면 버튼 비활성화
     */
    if(row.stlmYn == '일부결제' || row.stlmYn == '완결') {
      setDisableCH(false);
    }else {
      setDisableCH(true);
    }

    if(row.ceckStlmYn == 'Y') {
      setDisableSH(false);
    }else {
      setDisableSH(true);
    }

    setSelectedDetailIndex(index ?? -1)
    setSelectedDetailRow(row)
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    
    if(name == 'vhclNo'){
      setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))  
    }else if(name =='cardNo' || name == 'brno'){
      if(isNumber(value)){
        setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ', '') }))  
      }
    }else{
      setParams((prev) => ({ ...prev, [name]: value }))  
    }

    // 엑셀구분 선택시에는 엑셀플래그 변경하지 않음
    if(name != 'excelType'){
      setExcelFlag(false)
    }
  }

  useEffect(() => {
    if(chk) {
      setParams((prev) => ({...prev, chk: "01"}))
    }else {
      setParams((prev) => ({...prev, chk: ""}))
    }
  }, [chk])

  const openCardHistoryModal = () => {
    if(selectedDetailRow && selectedDetailIndex > -1) {
      dispatch(openSetlCardAprvModal());
    }
  }
  const openSettledHistoryModal = () => {
    if(selectedDetailRow && selectedDetailIndex > -1) {
      dispatch(openSetledAprvModal());
    }
  }
  const openRfIdModal = () => {
    dispatch(openRfIdHistoryModal());
  }
  const openRequestModal = () => {
    const temp = checkedRows.filter(item => (
      item.chk != '1'
      && item.rtroactYn === 'N'
      && item.asstAmtCmpttnSeNm == 'B' 
      && item.asstAmt == '0'
      && item.aprvRtrcnYn == 'N'
      && item.prcsSeCd == '1'
    ))

    //if(checkedRows.length > 0) {
    if(temp.length > 0) {
      setOpenReqModal(true);
    }else {
      alert('소급요청건을 선택해 주세요.');
      return;
    }
  }
  const openCancelModal = () => {
    const temp = detailRows.filter(item => (
      item.regDt === getToday()
      && item.chk === '1'
      && item.rtroactYn === 'Y'
      && item.asstAmtCmpttnSeNm == 'B' 
      && item.asstAmt == '0'
      && item.aprvRtrcnYn == 'N'
      && item.prcsSeCd == '1'
    ))
    //if((checkedRows.length > 0) || (temp.length > 0)) {
      if((temp.length > 0)) {
      setOpenCclModal(true);
    }else {
      alert('소급 취소 가능한 거래목록이 없습니다.');
      return;
    }
  }

  const handleCheckChange = (selected:string[]) => {
    let selectedRows:Row[] = []; // index arr
    
    selected.map( (item) => {
        let index: number = Number(item.replace('tr', ''));
        selectedRows.push( 
          detailRows[index]
        )
      }
    )

    setCheckedRows(selectedRows);
  }

  useEffect(() => {
    // console.log("CHECKROW ::: ", checkedRows);
  }, [checkedRows])


  const reloadReqModal = () =>{
    setOpenReqModal(false)
    fetchDetail()
  }
  
  const reloadCancelModal = () =>{
    setOpenCclModal(false)
    fetchDetail()
  }

  const handleExcelModalOpen = () => {
    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }
    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }
    setParams((prev) => ({...prev, excelType: 'M'}))
    setExcelModalOpen(true)
  }

  const excelSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if(( (params.excelType == 'C'|| params.excelType == 'A') && (!detailRows || detailRows.length == 0))) {
      alert('카드거래 상세내역 데이터가 없습니다.')
      return;
    }

    excelDownload();
  }

  return (
    <PageContainer title="화물거래내역" description="화물거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="화물거래내역" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                거래년월
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="sch-date-start">주유월 종료연월</CustomFormLabel>
              <CustomTextField type="month" id="sch-date-start" name="searchStDate" value={params.searchStDate} onChange={handleSearchChange} 
              inputProps={{
                max: getFormatToday(),
              }} fullWidth />
              ~              
              <CustomFormLabel className="input-label-none" htmlFor="sch-date-end">주유월 종료연월</CustomFormLabel>
              <CustomTextField type="month" id="sch-date-end" name="searchEdDate" value={params.searchEdDate} onChange={handleSearchChange} 
              inputProps={{
                min: params.searchStDate,
                max: getFormatToday(),
                }}fullWidth />
            </div>

            <div className="form-group" style={{ maxWidth: '6rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="chk"
                    value={params.chk}
                    onChange={() => setChk(!chk)}
                  />
                }
                label="취소포함"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
                required
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                type="text"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 9
                }}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
                required
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                type="text"
                value={params.brno}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 10
                }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdcoCd"
              >
                카드사
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='023'                   
                pValue={params.crdcoCd}          
                handleChange={handleSearchChange} 
                pName='crdcoCd'                                      
                htmlFor={'sch-crdcoCd'}           
                addText='전체'                
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardSeCd"
              >
                카드구분
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='974'                   
                pValue={params.cardSeCd}          
                handleChange={handleSearchChange} 
                pName='cardSeCd'                                      
                htmlFor={'sch-cardSeCd'}           
                addText='전체'                
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cardNo"
              >
                카드번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-cardNo"
                name="cardNo"
                type="text"
                value={params.cardNo}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 20
                }}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" 
            type="submit">
              검색
            </Button>
            {/* <Button variant="contained" color="success" onClick={() => excelDownload()}> */}
            <Button variant="contained" color="success" onClick={() => handleExcelModalOpen()}>
              엑셀
            </Button>
          </div>
        </Box>
        
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvFddDelngMonsTrHc} // 테이블 헤더 값
          customHeader={() => customHeader()}
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          cursor
          caption={"화물거래내역 조회 목록"}
        />
      </Box>
      {selectedRow && selectedIndex > -1 ? (
        <BlankCard className="contents-card" title="상세 정보"
        buttons={[
          {
            label: '소급요청',
            color: 'outlined',
            onClick: () => openRequestModal(),
          },
          {
            label: '소급취소',
            color: 'outlined',
            onClick: () => openCancelModal(),
          },
          {
            label: 'RFID주유내역',
            color: 'outlined',
            onClick: () => openRfIdModal(),
          },
          {
            label: '결제카드내역',
            color: 'outlined',
            onClick: () => openCardHistoryModal(),
            disabled : disableCH,
          },
          {
            label: '결제된 외상거래',
            color: 'outlined',
            onClick: () => openSettledHistoryModal(),
            disabled : disableSH 
          },
        ]}
        >
        
          <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
            <span>■ 일반거래</span>
            <span style={{ color: 'blue' }}>■ 취소거래</span>
            <span style={{ color: 'brown' }}>■ 외상결제</span>
            <span style={{ color: 'green' }}>
              ■ 차량휴지/보조금지급정지기간 거래건
            </span>
            <span style={{ color: 'magenta' }}>■ 체납환수금차감 거래건</span>
            <span style={{ color: 'orange' }}>■ 지급거절거래건 (비고참조)</span>
          </Box>
          <Box className='table-bottom-button-group' style={{marginTop:0, marginBottom:'16px'}}>
            <Box className='button-right-align'>
              {/* {requestBtn ? 
                <FormModal 
                  buttonLabel='' 
                  title={'소급요청'} 
                  formLabel="저장" 
                  formId="send-data"
                  remoteFlag={openReqModal}
                >
                  <ModalContent01
                    data={checkedRows[0]}
                  />
                </FormModal>
              : ''}

              {cancelBtn ? 
                <FormModal size="lg" buttonLabel={'소급취소'} title={'소급요청 취소'} formLabel="저장" children={undefined}>
                  
                </FormModal>
              : ''}            */}
              {/* {requestalble ?  */}
                <FormModal 
                  buttonLabel='' 
                  title={'소급요청'} 
                  formLabel="저장" 
                  formId="send-data"
                  remoteFlag={openReqModal}
                  closeHandler={() => setOpenReqModal(false)}
                >
                  <ModalContent01
                    data={checkedRows}
                    // reload={() => fetchDetail()}
                    reload={reloadReqModal}
                  />
                </FormModal>
              {/* : <></>} */}

              {/* {cancelable ?  */}
                <FormModal 
                  size="lg" 
                  buttonLabel='' 
                  title={'소급요청 취소'} 
                  formLabel="검색" 
                  formId='search-cancel'
                  remoteFlag={openCclModal}
                  closeHandler={() => setOpenCclModal(false)}
                  btnSet={
                    <Button variant='contained' type='submit' form='send-cancel'>저장</Button>
                  }
                >
                  <ModalContent02
                    data={selectedRow}
                    reload={reloadCancelModal}
                  />
                </FormModal>
              {/* : <></>} */}

            </Box>
          </Box>
          <TableDataGrid
            headCells={apvFddDelngDtlsTrHc}
            customHeader={() => customHeader2()}
            rows={detailRows}
            totalRows={totalRows2} // 총 로우 수
            loading={loading2} // 로딩여부
            onCheckChange={handleCheckChange}
            onPaginationModelChange={handlePaginationModelChange2} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable2} // 현재 페이지 / 사이즈 정보
            onRowClick={handleDetailRowClick}
            selectedRowIndex={selectedDetailIndex}
            cursor
            caption={"상세정보 조회 목록"}
          />

          {/* RFID 주유내역 */}
          <RfIdHistoryModal 
            searchParam={{
              page : 1,
              size : 10,
              aprvYmd: selectedRow.aprvYmd,
              vhclNo: selectedRow.vhclNo
            }}
          />
        </BlankCard>
      ) : (
        <></>
      )}
      {selectedDetailRow && selectedDetailIndex > -1 ? 
        <>
          {/* 결제카드내역 */}
          <SetlCardAprvModal 
            searchParams={{
              vhclNo: selectedDetailRow.vhclNo,
              crdcoCd: selectedDetailRow.crdcoCd,
              aprvNo: selectedDetailRow.aprvNo,
              aprvYmd: selectedDetailRow.aprvYmd,
              aprvTm: selectedDetailRow.aprvTm,
              cardNo: selectedDetailRow.cardNo,
              cardNoSecure: selectedDetailRow.cardNoSecure,
              cardNoS: selectedDetailRow.cardNoS,
              page : 1,
              size : 10,
              
            }}
          />

          {/* 결제된 외상거래 */}
          <SetledAprvModal searchParam={{
            vhclNo: selectedDetailRow.vhclNo,
            crdcoCd: selectedDetailRow.crdcoCd,
            aprvYmdTm: selectedDetailRow.aprvYmdTm,
            stlmCardAprvNo: selectedDetailRow.aprvNo,
            stlmCardNo: selectedDetailRow.cardNo,
            stlmCardNoS: selectedDetailRow.cardNoS,
            stlmCardNoSecure: selectedDetailRow.cardNoSecure,
            page : 1,
            size : 10,
          }} />

        </>
      : <></>}
          <FormModal 
            size={'lg'} 
            remoteFlag={excelModalOpen}
            buttonLabel={''}
            formLabel='저장'
            formId='excel-download'
            title={'엑셀 저장'}
            closeHandler={() => setExcelModalOpen(false)}
          >
            <Box component='form' id='excel-download' onSubmit={excelSubmit} sx={{minWidth:'400px'}}></Box>
            <LoadingBackdrop open={loadingBackdrop} />
            <TableContainer>
              <Table className="table table-bordered">
                <caption>엑셀 저장 테이블</caption>
                <TableBody>
                  <TableRow>
                    <TableCell className='td-head'>
                      데이터선택
                    </TableCell>
                    <TableCell>
                      <RadioGroup
                          row={false}
                          id="modal-radio-useYn"
                          name="excelType"
                          value={params.excelType}
                          onChange={handleSearchChange}
                          className="mui-custom-radio-group"
                          style={{ marginRight: '16px' }}
                      >
                        <FormControlLabel
                            control={<CustomRadio id="chk_M" name="excelType" value="M" />}
                            label="월별 보조금 현황"
                        />
                        <FormControlLabel
                            control={<CustomRadio id="chk_C" name="excelType" value="C" />}
                            label="카드거래 상세내역"
                        />
                        <FormControlLabel
                          control={<CustomRadio id="chk_C" name="excelType" value="A" />}
                          label="전체 카드거래 상세내역"
                        />
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </FormModal>
      {/* 테이블영역 끝 */}
      {/* <LoadingBackdrop open={isFetching}/> */}
    </PageContainer>
  )
}

export default DataList
