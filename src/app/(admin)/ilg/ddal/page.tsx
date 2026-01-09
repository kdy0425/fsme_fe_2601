'use client'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from './_components/TableDataGrid'

// types
import { HeadCell, Pageable2 } from 'table'
import HeaderTab, { Tab } from '@/app/components/tables/HeaderTab'
import { getDateRange } from '@/utils/fsms/common/util'
import { AppState } from '@/store/store'
import { useDispatch, useSelector } from '@/store/hooks'
import {
  callRefetchDisable,
  commClearReduxData,
  commSetExamResultData,
  commSetSelectedData,
  ddalTabHeadCells,
  excelEndpoints,
  ilgTabs,
  tabEndpoints,
} from '@/types/fsms/common/ilgData'
import { getExcelFile } from '../aavee/page'
import { getToday } from '@/utils/fsms/common/comm'
import {
  openBfdnDspsModal,
  setBfdnDspsTypeInfo,
} from '@/store/popup/BfdnDspsSlice'
import {
  openAdmdspNotieModal,
  setAdmdspNotieInfo,
} from '@/store/popup/AdmdspNotieSlice'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import DecisionBypeModal from '@/app/components/tr/popup/DecisionBypeModal'
import LgovTrfntfModal from '@/app/components/tr/popup/LgovTrfntfModal'
import ExamResultModal from '@/app/components/tr/popup/ExamResultModal'
import ExaathrModal from '@/app/components/tr/popup/ExaathrModal'
import BdfnDspsModal from '@/app/components/tr/popup/BdfnDspsModal'
import AdmdspNotieModal from '@/app/components/tr/popup/AdmdspNotieModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '화물의심거래상시점검',
  },
  {
    to: '/ilg/ddal',
    title: '주행거리 기반 주유량 의심주유',
  },
]

export interface Row {
  seqNo: string
  exmnNo: string
  locgovCd: string // 관할구청 코드
  locgovNm: string // 관할구청명
  vonrBrno: string // 소유주사업자등록번호
  vhclNo: string // 차량번호
  vhclTonNm: string // 톤수
  crtrLiter: number // 기준리터
  aprvYmd: string // 승인일자
  aprvTm: string // 승인시각
  aprvAmt: number // 승인금액
  useLiter: number // 사용리터
  asstAmtLiter: number // 보조금액리터
  asstAmt: number // 보조금액
  trgtAsstAmt: number
  ceckStlmYn: string // 외상여부코드(Y/N)
  ceckStlmYnNm: string // 외상여부명 (예/아니요)
  cardNo: string // 카드번호 (암호화)
  cardNoDe: string // 카드번호 (복호화)
  crdcoNm: string // 카드사명
  cardSeNm: string // 카드구분명
  frcsCdNo: string // 가맹점코드
  frcsNm: string // 가맹점명
  frcsBrno: string // 가맹점 사업자번호
  frcsZip: string // 가맹점 우편번호
  frcsAddr: string // 가맹점 주소
  vonrNm: string // 소유자명
  mmUseLiter: number
  mmAsstLiter: number
  btmntUseLiter: number
  inmonUseLiter: number
  enmtUseLiter: number
  mmCrtrLiter: number
  limUseRt: number
  trgtCfmtnId: string | number
  cfmtnYmd: string | number
  chk: string
  illegalityDivCd: string
  exmnRegYn: string | number
  pbadmsPrcsYn: string | number
  admdspSeCd: string | number
  admdspSeNm: string | number
  giveStopSn: string | number
  subsChangeCarNo: string | number
  hstrySn: string | number
  chgRsnCn: string | number
  bgngYmd: string | number | null
  endYmd: string | number | null
  ruleVltnCluCd: string | number | null
  oltPssrpPrtiOltNm: string | number | null
  oltPssrpPrtiBrno: string | number | null
  dsclMthdEtcMttrCn: string | number | null
  ruleVltnCluEtcCn: string | number | null
  cnt: string | number | null
  instcSpldmdTypeCd: string | number | null
  delYn: string | number | null
  seqSn: string | number | null
  mvoutLocgovCd: string | number | null
  mvinLocgovCd: string | number | null
  sttsCd: string | number | null
  trnsfRsnCn: string | number | null
  rgtrId: string | number | null
  regDt: string | number | null
  mdfrId: string | number | null
  mdfcnDt: string | number | null
  bfCtpvNm: string | number | null
  bfLocgovNm: string | number | null
  afCtpvNm: string | number | null
  afLocgovNm: string | number | null
  ctpvNm: string | number | null
  bzmnSeCd: string | number | null
  tpbizSeCd: string | number | null
  tpbizCd: string | number | null
  droperYn: string | number | null
  exmnRsltCn: string | number | null
  dlngNocs: number
  totlAprvAmt: string | number | null
  totlAsstAmt: string | number | null
  rdmActnAmt: string | number | null
  exmnRegMdfcnid: string | number | null
  exmnRegMdfcnDt: string | number | null
  subsChangeVhclNo: string | number | null
  bfdnDspsTtl: string | number | null
  bfdnAddr: string | number | null
  bfdnDspsRsnCn: string | number | null
  bfdnDspsCn: string | number | null
  bfdnLglBssCn: string | number | null
  bfdnSbmsnOfficInstNm: string | number | null
  bfdnSbmsnOfficDeptNm: string | number | null
  bfdnSbmsnOfficPicNm: string | number | null
  bfdnSbmsnOfficAddr: string | number | null
  bfdnSbmsnOfficTelno: string | number | null
  bfdnSbmsnOfficFxno: string | number | null
  bfdnSbmsnTermCn: string | number | null
  bfdnRgnMayerNm: string | number | null
  bfdnRgtrId: string | number | null
  bfdnMdfcnYmd: string | number | null
  rdmTrgtNocs: number
  cpeaChckYn: string | number | null
  cpeaChckCyclVl: string | number | null
  aprvYm: string | number | null
  no: string | number | null
  rdmYn: string | number | null
  dspsDt: string | number | null
  admdspRsnCn: string | number | null
  admdspBgngYmd: string | number | null
  admdspEndYmd: string | number | null
  oltPssrpPrtiYn: string | number | null
  unlawStrctChgYnCd: string | number | null
  dsclMthdCd: string | number | null
  pbadmsPrcsMdfcnDt: string | number | null
  pbadmsPrcsRegDt: string | number | null
  pbadmsPrcsMdfcnId: string | number | null
  admdspNotieDspsTtl: string | number | null
  admdspNotieAddr: string | number | null
  admdspNotieClmPrdCn: string | number | null
  admdspNotieDspsRsnCn: string | number | null
  admdspNotieLglBssCn: string | number | null
  admdspNotieClmProcssCn: string | number | null
  admdspNotieRegId: string | number | null
  admdspNotieMdfcnYmd: string | number | null
  admdspNotieRgnMayerNm: string | number | null
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngAprvYmd: string
  endAprvYmd: string
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  frcsNm: string
  exmnNo: string
  pbadmsPrcsYn: string
  sttsCd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const pathname = usePathname()
  const pageUrl = pathname.split('/')[2]

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedTab, setSelectedTab] = useState<string>('1')
  const [printTabName, setPrintTabName] = useState<string>('')
  const [printObject, setPrintObject] = useState<Row | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngAprvYmd: '', // 시작일
    endAprvYmd: '', // 종료일
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    exmnNo: '',
    frcsNm: '',
    pbadmsPrcsYn: '',
    sttsCd: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const dispatch = useDispatch()
  const ddalInfo = useSelector((state: AppState) => state.ddalInfo)
  const examResultInfo = useSelector((state: AppState) => state.ExamResultInfo)
  const exaathrInfo = useSelector((state: AppState) => state.ExaathrInfo)
  const decisionBypeInfo = useSelector(
    (state: AppState) => state.decisionBypeInfo,
  )
  const lgovTrfntfInfo = useSelector((state: AppState) => state.LgovTrfntfInfo)
  const bfdnDspsInfo = useSelector((state: AppState) => state.BfdnDspsInfo)
  const admdspNotieInfo = useSelector(
    (state: AppState) => state.AdmdspNotieInfo,
  )

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (ddalInfo.ddalSearchDone || flag) {
      fetchData()
    }
  }, [ddalInfo.ddalSearchDone, flag])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
  }, [])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('date', 30 * 12)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      bgngAprvYmd: startDate,
      endAprvYmd: endDate,
    }))
  }

  /**
   * check변수의 값을 1로 모두 바꾼다.
   * check변수가 바뀐 배열을 사용해서 onCheckClick을 내부적으로 호출한다.
   * @param event
   */
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target

    const retRows = rows.map((value: Row, index: number) => {
      return { ...value, chk: checked ? '1' : '0' }
    })

    if (selectedTab === '4') {
      for (let idx = 0; idx < retRows.length; idx++) {
        if (
          retRows[idx]?.admdspSeCd === 'H' ||
          retRows[idx]?.admdspSeCd === 'S'
        ) {
          alert(
            `${retRows[idx]?.vhclNo} 차량은 보조금 지급정지가 되어있어 취소가 불가하므로 운영자에게 문의하십시오`,
          )
          return
        }
      }
    }

    setRows(retRows)

    handleCheckedData(retRows)
  }

  /**
   * rows의 값을 하나씩 비교하여 check변수의 값이 1인 데이터의 값을
   * 요청 파라미터 배열에 세팅한다.
   * @param event
   */
  const checkBoxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target
    const rowId: number = Number(id.substring(2))

    if (selectedTab === '4') {
      //행정처분조회 탭에서
      if (rows[rowId]?.admdspSeCd === 'H' || rows[rowId]?.admdspSeCd === 'S') {
        alert(
          '선택하신 차량은 보조금 지급정지가 되어있어 취소가 불가하므로 운영자에게 문의하십시오',
        )
        return
      }
    }

    const retRows = rows.map((value: Row, index: number) => {
      if (index == rowId) return { ...value, chk: checked ? '1' : '0' }
      else return value
    })

    setRows(retRows)

    handleCheckedData(retRows)
  }

  /**
   * 체크박스를 체크한 행의 데이터를 모두 redux 변수에 저장한다.
   */
  const handleCheckedData = (rows: Row[]) => {
    const checkedData = rows.filter((value: Row, index: number) => {
      if (value.chk == '1') return value
    })

    if (selectedTab === '3') {
      commSetExamResultData(pageUrl, dispatch, checkedData)
    } else {
      commSetSelectedData(pageUrl, dispatch, checkedData)
    }
  }

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpointPath = tabEndpoints[Number(selectedTab) - 1]

      let endpoint: string =
        `/fsm${pathname}/tr/${endpointPath}?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}` +
        `${params.exmnNo ? '&exmnNo=' + params.exmnNo : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.pbadmsPrcsYn ? '&pbadmsPrcsYn=' + params.pbadmsPrcsYn : ''}` +
        `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

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
        if (selectedTab === '2') {
          setPrintTabName('NOTI')
        } else if (selectedTab === '4') {
          setPrintTabName('ADMIN')
        } else {
          setPrintTabName('')
        }
      } else {
        // 데이터가 없거나 실패
        setInitialState()
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setInitialState()
    } finally {
      /**
       * 조회 후에 처리 할 것
       *  1. loading값 끄기
       *  2. flag값 끄기 ( 다음 조회 호출을 위해 )
       *  3. 모달 종료 후 자동 조회되도록 redux 변수 값 세팅
       *  4. 모달로 새로이 선택한 값을 넘기기 위해 redux 변수 값 세팅
       */
      setLoading(false)
      setFlag(false)
      callRefetchDisable(pageUrl, dispatch)
      commClearReduxData(pageUrl, dispatch)
    }
  }

  // 페이지 이동 감지 시작 //
  const excelDownload = async () => {
    let endpointPath = excelEndpoints[Number(selectedTab) - 1]

    try {
      let endpoint: string =
        `/fsm${pathname}/tr/${endpointPath}?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}` +
        `${params.exmnNo ? '&exmnNo=' + params.exmnNo : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.pbadmsPrcsYn ? '&pbadmsPrcsYn=' + params.pbadmsPrcsYn : ''}` +
        `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

      setIsDataProcessing(true)
      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title +
          '(' +
          ilgTabs[Number(selectedTab) - 1].label +
          ')' +
          getToday() +
          '.xlsx',
      )
    } catch (error) {
      alert(error)
    } finally {
      setIsDataProcessing(false)
    }
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'bgngAprvYmd' || name === 'endAprvYmd') {
      const otherDateField =
        name === 'bgngAprvYmd' ? 'endAprvYmd' : 'bgngAprvYmd'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else if (
      name === 'sttsCd' ||
      name === 'status' ||
      name === 'pbadmsPrcsYn'
    ) {
      setParams((prev) => ({ ...prev, [name]: value }))
      setFlag(true)
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'bgngAprvYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleRowClick = (postTsId: number) => {
    setSelectedIndex(postTsId)
    setPrintObject(rows[postTsId])
  }

  /**
   * 탭을 누를때 호출하는 함수
   *  1.tabIndex 변경
   *  2.세부조회조건 초기화
   *  3.탭 변경시 조회기능 실행
   *  4.redux변수 초기화( LpavSelectedData )
   * @param event
   * @param tabValue
   */
  const handleTabChange = (event: React.SyntheticEvent, tabValue: string) => {
    setSelectedTab(tabValue)
    setParams((prev) => ({
      ...prev,
      page: 1,
      size: 10,
      pbadmsPrcsYn: '',
      sttsCd: '',
    }))
    setFlag(true)
    commClearReduxData(pageUrl, dispatch)
  }

  const returnHeadCell = (tabValue: string): HeadCell[] => {
    return ddalTabHeadCells[Number(tabValue) - 1]
  }

  const showPrintPage = () => {
    if (!printTabName) {
      alert('조사대상내역 또는 행정처분조회 탭에서 출력이 가능합니다.')
      return
    }

    if (selectedIndex < 0) {
      alert('출력하려는 대상의 행을 선택해주시기 바랍니다.')
      return
    }

    //조사대상내역에서 출력을 누르는 경우
    if (printTabName === 'NOTI') {
      dispatch(openBfdnDspsModal())
      dispatch(
        setBfdnDspsTypeInfo({
          exmnNoBD: printObject?.exmnNo,
          vhclNoBD: printObject?.vhclNo,
          vonrNmBD: printObject?.vonrNm,
          bfdnMdfcnYmdBD: printObject?.bfdnMdfcnYmd,
          bfdnDspsTtlBD: printObject?.bfdnDspsTtl,
          bfdnAddrBD: printObject?.bfdnAddr,
          bfdnDspsRsnCnBD: printObject?.bfdnDspsRsnCn,
          bfdnDspsCnBD: printObject?.bfdnDspsCn,
          bfdnLglBssCnBD: printObject?.bfdnLglBssCn,
          bfdnSbmsnOfficInstNmBD: printObject?.bfdnSbmsnOfficInstNm,
          bfdnSbmsnOfficDeptNmBD: printObject?.bfdnSbmsnOfficDeptNm,
          bfdnSbmsnOfficPicNmBD: printObject?.bfdnSbmsnOfficPicNm,
          bfdnSbmsnOfficAddrBD: printObject?.bfdnSbmsnOfficAddr,
          bfdnSbmsnOfficTelnoBD: printObject?.bfdnSbmsnOfficTelno,
          bfdnSbmsnOfficFxnoBD: printObject?.bfdnSbmsnOfficFxno,
          bfdnSbmsnTermCnBD: printObject?.bfdnSbmsnTermCn,
          bfdnRgnMayerNmBD: printObject?.bfdnRgnMayerNm,
        }),
      )
    } else if (printTabName === 'ADMIN') {
      if (
        ['A', 'C', 'G', 'H', 'S', 'W'].findIndex(
          (value, index) => value === printObject?.admdspSeCd,
        ) < 0
      ) {
        alert('행정처분이 된 정보만 출력이 가능합니다.')
        return
      } else {
        dispatch(openAdmdspNotieModal())
        dispatch(
          setAdmdspNotieInfo({
            exmnNoAN: printObject?.exmnNo,
            vhclNoAN: printObject?.vhclNo,
            vonrNmAN: printObject?.vonrNm,
            bfdnAddrAN: printObject?.bfdnAddr,
            bfdnDspsRsnCnAN: printObject?.bfdnDspsRsnCn,
            bfdnDspsTtlAN: printObject?.bfdnDspsTtl,
            bfdnLglBssCnAN: printObject?.bfdnLglBssCn,
            admdspSeNmAN: printObject?.admdspSeNm,
            admdspNotieDspsTtlAN: printObject?.admdspNotieDspsTtl,
            admdspNotieMdfcnYmdAN: printObject?.admdspNotieMdfcnYmd,
            admdspNotieAddrAN: printObject?.admdspNotieAddr,
            admdspNotieDspsRsnCnAN: printObject?.admdspNotieDspsRsnCn,
            admdspNotieLglBssCnAN: printObject?.admdspNotieLglBssCn,
            admdspNotieClmPrdCnAN: printObject?.admdspNotieClmPrdCn,
            admdspNotieClmProcssCnAN: printObject?.admdspNotieClmProcssCn,
            admdspNotieRgnMayerNmAN: printObject?.admdspNotieRgnMayerNm,
            dspsDtAN: printObject?.dspsDt,
          }),
        )
      }
    }
    //행정처분조회에서 출력을 누르는 경우
  }

  return (
    <PageContainer
      title="주행거리 기반 주유량 의심주유"
      description="주행거리 기반 주유량 의심주유"
    >
      {/* breadcrumb */}
      <Breadcrumb title="주행거리 기반 주유량 의심주유" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-select-01"
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
                htmlFor="ft-select-02"
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
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기간 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngAprvYmd"
                value={params.bgngAprvYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                기간 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endAprvYmd"
                value={params.endAprvYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
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
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsNm"
              >
                가맹점명
              </CustomFormLabel>
              <CustomTextField
                id="ft-frcsNm"
                name="frcsNm"
                value={params.frcsNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
              >
                연번
              </CustomFormLabel>
              <CustomTextField
                id="ft-exmnNo"
                name="exmnNo"
                value={params.exmnNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant="contained" onClick={showPrintPage} color="primary">
              출력
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <HeaderTab
        tabs={ilgTabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      />
      <div style={{ marginTop: '-8px' }}>
        <BlankCard>
          <Box sx={{ mb: 2 }}>
            <TableDataGrid
              headCells={returnHeadCell(selectedTab)} // 테이블 헤더 값
              tabIndex={selectedTab}
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              checkBoxClick={checkBoxClick}
              handleSelectAllClick={handleSelectAllClick}
              handleRadioChange={handleSearchChange}
              excelDownload={excelDownload}
            />
          </Box>
        </BlankCard>
      </div>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
      <>
        {decisionBypeInfo.dbModalOpen ? <DecisionBypeModal dwNo="08" /> : null}
        {lgovTrfntfInfo.ltModalOpen ? <LgovTrfntfModal /> : null}
        {examResultInfo.erModalOpen ? <ExamResultModal /> : null}
        {exaathrInfo.exaModalOpen ? <ExaathrModal /> : null}
        {bfdnDspsInfo.BDModalOpen ? <BdfnDspsModal /> : null}
        {admdspNotieInfo.ANModalOpen ? <AdmdspNotieModal /> : null}
        <NotiDialog />
      </>
    </PageContainer>
  )
}

const NotiDialog = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true)

  return (
    <Dialog maxWidth={'xl'} open={isOpen}>
      <DialogContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // alignItems: 'center',
        }}
      >
        <BlankCard>
          <Box
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '2rem',
            }}
          >
            {`#1차 시행 
            (기준연비) 해당 차량의 제조사공인연비 
            (선정기준) 기준연비(제조사공인연비)의 1/10 미만 차량 
                              (공인연비를 기준으로 한 주유량의 10배 초과한 차량) 
                  (통보) '23.2 ('21.12 ~ '22.11월 기간동안 선정기준에 해당하는 차량 전체) 
              
#2차 시행 
            (기준연비) 주행연비 산출이 가능한 화물차 26만대('21.12 ~ '23.7)를 
                              분석하여 마련한 차종 및 톤급별 평균주행연비 
            (선정기준) 기준연비(차종 및 톤급별 평균주행연비)의 1/5배 미만 차량 
                              (평균주행연비를 기준으로 한 주유량의 5배를 초과한 차량)
                  (통보) 일일 단위로 통보(주행거리 연계시 마다) 
                        다만, 지난 조사대상 선정 이후 정기검사 받은 차량('22.12 ~ '23.10)은 일괄 통보`}
          </Box>
        </BlankCard>
        <Button
          style={{ marginTop: '10px' }}
          variant="contained"
          color="dark"
          onClick={() => setIsOpen(false)}
        >
          닫기
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default DataList
