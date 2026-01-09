'use client'
import React, { useContext, useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Button,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableContainer,
  TableBody,
  TableRow,
  TableHead,
  TableSortLabel,
} from '@mui/material'
import { Label } from '@mui/icons-material'

import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import { useRouter, useSearchParams } from 'next/navigation'
import { visuallyHidden } from '@mui/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import DetailDialog from '@/app/components/popup/DetailDialog'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  getCityCodes,
  getCodesByGroupNm,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'
import { toQueryString } from '@/utils/fsms/utils'
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import DetailDataGrid from './DetailDataGrid'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import FormModal from './FormModal'
import { Table } from '@mui/material'
import { TableCell } from '@mui/material'
import {
  getCtpvCd,
  getExcelFile,
  getLocGovCd,
  getToday,
} from '@/utils/fsms/common/comm'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import LocHistoryModal from '../LocHistoryModal'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { getDateRange } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

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
    to: '/stn/ltmm',
    title: '지자체이관전출관리',
  },
]

export interface Row {
  ctpvCd?: string // 시도코드
  locgovCd?: string // 관할관청코드
  bgngDt?: string // 신청시작일자
  endDt?: string // 신청종료일자
  vhclNo?: string // 차량번호
  brno?: string // 사업자등록번호
  prcsYmd?: string // 요청일자
  bzentyNm?: string // 업체명
  chgLocgovCd?: string // 전입관청코드
  chgLocgovNm?: string // 전입관청명
  exsLocgovCd?: string // 전출관청코드
  exsLocgovNm?: string // 전출관청명
  locgovNm?: string // 요청관청
  prcsSttsCd?: string // 처리상태
  dmndLocalCd?: string // 요청지자체코드
  dmndLocalNm?: string // 요청지자체명
  dmndSeCd?: string // 전입전출상태코드

  prcsSttsNm?: string // 처리상태
  vhclSeNm?: string // 면허업종
  rprsvNm?: string // 대표자명
  rprsvRrno?: string // 대표자주민등록번호
  vhclSttsNm?: string // 차량상태
  koiNm?: string // 유종
  mdfcnDt?: string // 처리일자
  rfslRsnCn?: string // 거절사유
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  aplySn?: string // 신청일련번호
}

export interface ButtonGroupActionProps {
  onClickApproveBtn: (row: Row) => void // 승인 버튼 action
  onClickDeclineBtn: (row: Row) => void // 거절 버튼 action
  onClickCancelBtn: (row: Row) => void // 취소 버튼 action
  onClickCheckMoveCenterHistoryBtn: (row: Row) => void // 관할관청 이관이력 버튼 action
}

const headCells: HeadCell[] = [
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '요청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'exsLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '전출관청',
  },
  {
    id: 'chgLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '전입관청',
  },
  {
    id: 'dmndLocalNm',
    numeric: false,
    disablePadding: false,
    label: '요청관청',
  },
  {
    id: 'prcsSttsNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
  },
]

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BusPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 관할관청 이관이력 모달
  const [locOpen, setLocOpen] = useState(false) // 이관이력 Dialog 상태

  const [confirmOpen, setConfirmOpen] = useState(false) // 다이얼로그 상태
  const [dialogContent, setDialogContent] = useState<string>('') // 다이얼로그 내용
  const [dialogActionType, setDialogActionType] = useState<string>('') // 다이얼로그 액션 타입

  const [selectedRow, setSelectedRow] = useState<Row | undefined>() // 선택된 Row를 저장할 state
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [open, setOpen] = useState<boolean>(false)

  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([]) // 관할관청 코드
  const [locgovNm, setLocgvNm] = useState<string>() // 사용자 코드
  const [curSearchLocgCd, setCurSearchLocgCd] = useState<string>('') // 현재 검색된 지역코드
  const [isCurrSamelocgov, setIsCurrSameLocgov] = useState<boolean>(false) // 현재랑 같은지

  const [isExsFlag, setIsExsFlag] = useState<boolean>(false)
  const { authInfo } = useContext(UserAuthContext)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const handleCloseLocDialog = () => {
    setLocOpen(false)
  }

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('date', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({ ...prev, bgngDt: startDate, endDt: endDate }))
  }, [])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      if (params.ctpvCd && params.locgovCd) {
        fetchData()
      }
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setCurSearchLocgCd(params.locgovCd + '')
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/ltmm/bs/getAllLgovMvtRequst?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngDt ? (('&bgngDt=' + (params.bgngDt + '').replaceAll('-', '')) as string) : ''}` +
        `${params.endDt ? (('&endDt=' + (params.endDt + '').replaceAll('-', '')) as string) : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}`

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
    let locgovCodes: SelectItem[] = []

    // 관할관청 select item setting
    getLocalGovCodes().then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['locgovNm'],
            value: code['locgovCd'],
          }
          locgovCodes.push(item)
        })
      }
      setLocalGovCode(locgovCodes)
    })
  }, [])

  useEffect(() => {
    if (
      localGovCode.length > 0 &&
      'locgovCd' in authInfo &&
      authInfo.locgovCd
    ) {
      const matchedItem = localGovCode.find(
        (item) => item.value === authInfo.locgovCd,
      )
      if (matchedItem) {
        setLocgvNm(matchedItem.label) // Assuming `setLocgvNm` sets the label of the matched item
      }
    }
  }, [authInfo, localGovCode])

  useEffect(() => {
    if (
      localGovCode.length > 0 &&
      'locgovCd' in authInfo &&
      authInfo.locgovCd &&
      selectedIndex > -1
    ) {
      if (authInfo.locgovCd != rows[selectedIndex].chgLocgovCd) {
        setIsCurrSameLocgov(
          authInfo.locgovCd === rows[selectedIndex].exsLocgovCd &&
            rows[selectedIndex].prcsSttsCd === '01' &&
            rows[selectedIndex].dmndSeCd === '2',
        )
        setIsCurrSameLocgov(
          authInfo.locgovCd === rows[selectedIndex].exsLocgovCd &&
            rows[selectedIndex].prcsSttsCd === '01' &&
            rows[selectedIndex].dmndSeCd === '2',
        )
      } else {
        setIsCurrSameLocgov(false)
      }

      setIsExsFlag(
        authInfo.locgovCd === rows[selectedIndex].dmndLocalCd &&
          rows[selectedIndex].dmndSeCd === '1',
      )
    } else {
      setIsCurrSameLocgov(false)
    }
  }, [authInfo, selectedIndex])

  // 상세정보에 있는 Button actions
  const buttonGroupActions: ButtonGroupActionProps = {
    // 승인 버튼 클릭 시 다이얼로그 오픈
    onClickApproveBtn: async function (row: Row): Promise<void> {
      handleActionClick(row, 'approve')
    },

    //거절 버튼 클릭 시 다이얼로그 오픈
    onClickDeclineBtn: async function (row: Row): Promise<void> {
      handleActionClick(row, 'decline')
    },

    // 취소 버튼 클릭 시 다이얼로그 오픈
    onClickCancelBtn: async function (row: Row): Promise<void> {
      handleActionClick(row, 'cancel')
    },
    onClickCheckMoveCenterHistoryBtn: function (row: Row): void {
      setSelectedRow(row)
      setLocOpen(true)
    },
  }

  // 데이터 수정하는 메서드
  const putData = async (row: Row, sttCode: string) => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성

      let endpoint = ''
      // 승인,거절,취소인지에 따라서 다르게 구성하자.

      //승인
      if (sttCode === '02') endpoint = `/fsm/stn/ltmm/bs/approveLgovMvtRequst`

      //거절
      if (sttCode === '03') endpoint = `/fsm/stn/ltmm/bs/rejectLgovMvtRequst`

      //취소
      if (sttCode === '04') endpoint = `/fsm/stn/ltmm/bs/cancelLgovMvtRequst`

      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        {
          brno: row.brno,
          vhclNo: row.vhclNo,
          aplySn: row.aplySn,
        },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        // 데이터 조회 성공시
        console.log('response.data.content', response.resultType)
        return 'success'
      } else {
        // 데이터가 없거나 실패
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

  // 승인/거절/취소 버튼 클릭 시 다이얼로그 오픈
  const handleActionClick = (row: Row, actionType: string) => {
    'locgovCd' in authInfo && authInfo.locgovCd

    setSelectedRow(row) // 선택한 Row 설정
    setDialogActionType(actionType)

    // 다이얼로그에 표시할 내용을 설정합니다.
    switch (actionType) {
      case 'approve':
        setDialogContent('관할관청 이관을 승인 하시겠습니까?')
        break
      case 'decline':
        setDialogContent('관할관청 이관을 거절 하시겠습니까?')
        break
      case 'cancel':
        setDialogContent('관할관청 전출요청을 취소 하시겠습니까??')
        break
      default:
        break
    }
    setConfirmOpen(true) // 다이얼로그 오픈
  }

  // 확인 다이얼로그에서 확인 버튼을 누를 때 승인 요청 처리
  // 확인 다이얼로그에서 확인 버튼을 누를 때 데이터 수정 처리
  const handleConfirm = async () => {
    if (!selectedRow) return

    // 00 이관 요청
    let sttCode = ''
    switch (dialogActionType) {
      case 'approve':
        sttCode = '02' // 승인 코드
        break
      case 'decline':
        sttCode = '03' // 거절 코드
        break
      case 'cancel':
        sttCode = '04' // 취소 코드
        break
      default:
        break
    }

    // 이관 요청 == 01
    // 이관 승인 == 02
    // 이관 거절 == 03
    // 이관 취소 == 04
    // 승인 : 이관요청이고 사용자 관할관청과 전입관청이 같을 경우 확인창 -> 진행
    // 거절 : 이관요청이고 사용자 관할관청과 전입관청이 같을 경우 확인창 -> 진행
    // 취소 : 이관요청이고 사용자 관할 관청과 전입관청이 같을 경우 확인창 -> 진행
    try {
      if (sttCode === selectedRow.prcsSttsCd) {
        alert('이미 처리된 요청입니다.')
        return
      }

      setLoading(true)
      const result = await putData(selectedRow, sttCode)

      if (result === 'success') {
        alert('요청이 성공적으로 처리되었습니다.')
      } else {
        alert('요청 처리에 실패했습니다.')
      }
      setFlag((prev) => !prev) // 데이터 갱신을 위한 플래그 토글
    } catch (error) {
      console.error('Error processing data:', error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setConfirmOpen(false) // 다이얼로그 닫기
    }
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

    try {
      setLoadingBackdrop(true)
      let endpoint: string =
        `/fsm/stn/ltmm/bs/getExcelLgovMvtRequst?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngDt ? (('&bgngDt=' + (params.bgngDt + '').replaceAll('-', '')) as string) : ''}` +
        `${params.endDt ? (('&endDt=' + (params.endDt + '').replaceAll('-', '')) as string) : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(selectedRow)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField = name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setExcelFlag(false)
        setParams((prev) => ({ ...prev, page: 1, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setExcelFlag(false)
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    }
  }

  const handleCloseConfirm = () => {
    setConfirmOpen(false)
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

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer
      title="지자체이관전출관리"
      description="지자체이관전출관리 페이지"
    >      
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                시도명
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
                관할관청
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
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                style={{ width: '50%' }}
                value={params.vhclNo ?? ''}
                onChange={handleSearchChange}
                type="text"
                id="ft-vhclNo"
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          {/* 신청일자 datePicker */}
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                신청일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                신청 시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                신청종료일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-prcsSttsCd"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="038"
                pValue={params.prcsSttsCd}
                handleChange={handleSearchChange}
                pName="prcsSttsCd"
                htmlFor={'sch-prcsSttsCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              type="submit"
              onClick={fetchData}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <FormModal
              reload={() => setFlag((prev) => !prev)}
              size={'lg'}
              buttonLabel="등록"
              title="전출등록"
              isOpen={open}
              setOpen={setOpen}
            />
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      <LocHistoryModal
        title="관할관청 이관 이력"
        open={locOpen}
        onCloseClick={handleCloseLocDialog}
        data={selectedRow as {}}
        url={'/fsm/stn/ltmm/bs/getAllLgovMvtHst'}
        type={'bs'}
      />

      {/* 확인 다이얼로그 */}
      <Dialog
        open={confirmOpen}
        //onClose={handleCloseConfirm}
      >
        <DialogTitle>관할관청 이관</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            취소
          </Button>
          <Button onClick={handleConfirm} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
      {/* 테이블영역 시작 */}
      <TableDataGrid
        headCells={headCells} // 테이블 헤더 값
        rows={rows} // 목록 데이터
        totalRows={totalRows} // 총 로우 수
        loading={loading} // 로딩여부
        onRowClick={handleRowClick} // 행 클릭 핸들러 추가
        selectedRowIndex={selectedIndex}
        onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
        pageable={pageable} // 현재 페이지 / 사이즈 정보
        paging={true}
        cursor={true}
        caption={"버스 지자체이관전출관리 조회 목록"}
      />
      {/* 테이블영역 끝 */}
      <>
        {/* 상세 영역 시작*/}
        {selectedRow && (
          <BlankCard
            className="contents-card"
            title="상세 정보"
            buttons={[
              {
                label: '승인',
                disabled: !isCurrSamelocgov,
                onClick: () =>
                  buttonGroupActions.onClickApproveBtn(selectedRow),
                color: 'outlined',
              },
              {
                label: '거절',
                disabled: !isCurrSamelocgov,
                onClick: () =>
                  buttonGroupActions.onClickDeclineBtn(selectedRow),
                color: 'outlined',
              },
              {
                label: '취소',
                disabled: !isExsFlag,
                onClick: () => buttonGroupActions.onClickCancelBtn(selectedRow),
                color: 'outlined',
              },
              {
                label: '관할관청 이관이력',
                onClick: () =>
                  buttonGroupActions.onClickCheckMoveCenterHistoryBtn(
                    selectedRow,
                  ),
                color: 'outlined',
              },
            ]}
          >
            <DetailDataGrid data={selectedRow} />
          </BlankCard>
        )}
        {/* 상세 영역 끝 */}
      </>
    </PageContainer>
  )
}

export default BusPage
