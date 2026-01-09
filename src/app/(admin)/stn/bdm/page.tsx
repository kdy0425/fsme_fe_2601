'use client'
import { Box, Button, FormControlLabel } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { DayoffDivModal } from './_components/DayoffDivModal'
import { serverCheckTime } from '@/utils/fsms/common/comm'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import DayoffSearchModal from './_components/DayoffSearchModal'
import DayoffCarReserveModal from './_components/DayoffCarReserveModal'
import DayoffMemoModal from './_components/DayoffMemoModal'
import DayoffGroupDetailModal from './_components/DayoffGroupDetailModal'
import ModalCalendar from './_components/ModalCalendar'

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
    to: '/stn/bdm',
    title: '차량별 부제관리',
  },
]

export interface Row {
  dayoffLocgovCd?: string // 부제 지자체 코드
  chkAllYmdYn?: string // 연결일자 전체 체크 여부
  bgngDt?: string // 시작일
  endDt?: string // 종료일
  vhclNo?: string // 차량번호
  brno?: string // 사업자번호
  groupNm?: string // 부제 그룹명
  locgovNm?: string // 지자체명
  rprsvNm?: string // 대표자명
  registDt?: string // 등록일자

  uType?: string //부제 그룹 정보가 없으면 > 'NEW'  아닐 경우 아무 문자열이나 전달 ;
  rgtrId?: string

  mdfrId?: string // 수정자 ID
  rsvtPrcsSeCd?: string // 예약 처리 구분 코드
  rsvtId?: string // 예약 ID
  rsvtAplcnYmd?: string // 예약 적용 일자
  groupExpln?: string // 그룹 설명
  chgYmd?: string // 변경 일자
  groupId?: string // 그룹 ID
  //dayoffMemoCn?: string // 부제 메모 내용
  dayoffSeCd?: string // 부제 구분 코드
  //dayoffSeNm?: string | null // 부제 구분 명
  dayoffSeExpln?: string | null // 부제 구분 설명
  bookDt?: string | null // 예약 일자
  bookReserve?: string // 예약 여부

  dayoffNo?: string // 부제번호
  dayoffNm?: string // 부제명
  indctNm?: string // 표시명
  dayoffStand?: string // 부제기준
  dayoffTm?: string // 부제시각
  reProYn?: string // 재수행여부
  vhclSttsCd?: string // 차량상태

  dayoffTypeNm?: string

  number?: number
}

export interface selectRow {
  vhclNo: string //차량번호
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  dayoffLocgovCd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const headCells: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '',
    format: 'checkbox',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체명',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'groupNm',
    numeric: false,
    disablePadding: false,
    label: '그룹 부제명',
  },
  {
    id: 'groupExpln',
    numeric: false,
    disablePadding: false,
    label: '그룹 설명',
  },
  {
    id: 'chgYmd', // 연결일자라는건 없음.
    numeric: false,
    disablePadding: false,
    label: '연결일자',
    format: 'yyyymmdd',
  },
  /*
    {
      id: 'dayoffSeNm',
      numeric: false,
      disablePadding: false,
      label: '부제구분명',
    },    
    {
      id: 'dayoffMemoCn',
      numeric: false,
      disablePadding: false,
      label: '부제메모',
      format: 'button',
      button: {
        label: '메모',
        color: 'primary', // 버튼 색상
        onClick: (row: Row) => {
          setOpenDayoffCarMemoModal(true)
          setSelectedRow(row)
          // 추가적으로 버튼 클릭 시 동작 정의
        },
      },
    },
    */
  {
    id: 'bookReserve',
    numeric: false,
    disablePadding: false,
    label: '예약여부',
  },
  {
    id: 'bookDt',
    numeric: false,
    disablePadding: false,
    label: '예약일자',
    format: 'yyyymmdd',
  },
]

const DataList = () => {
  const headCellsDe: HeadCell[] = [
    {
      id: 'check',
      numeric: false,
      disablePadding: false,
      label: '',
      format: 'checkbox',
    },
    {
      id: 'locgovNm',
      numeric: false,
      disablePadding: false,
      label: '지자체명',
    },
    {
      id: 'groupId',
      numeric: false,
      disablePadding: false,
      label: '부제그룹ID',
    },
    {
      id: 'groupNm',
      numeric: false,
      disablePadding: false,
      label: '부제그룹명',
    },
    {
      id: 'groupExpln',
      numeric: false,
      disablePadding: false,
      label: '부제그룹설명',
    },
    {
      id: 'vhclCnt',
      numeric: false,
      disablePadding: false,
      label: '연결된 차량수',
    },
    {
      id: 'bujeMemo',
      numeric: false,
      disablePadding: false,
      label: '부제기준',
      format: 'button',
      button: {
        label: '조회',
        color: 'primary', // 버튼 색상
        onClick: (row: Row) => {
          setOpenDayoffGroupDetailSearch(true)
          setSelectedRowDe(row)
          // 추가적으로 버튼 클릭 시 동작 정의
        },
      },
    },
  ]
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [flagDe, setFlagDe] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [rowsDe, setRowsDe] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRowsDe, setTotalRowsDe] = useState(0) // 총 수
  const [loadingDe, setLoadingDe] = useState(false) // 로딩여부

  const [open, setOpen] = useState<boolean>(false)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)

  const { authInfo, setUserAuthInfo } = useContext(UserAuthContext)
  const [authContext, setAuthContext] = useState<UserAuthInfo | {}>()

  const [openDe, setOpenDe] = useState<boolean>(false)
  const [selectedRowDe, setSelectedRowDe] = useState<Row | null>(null)

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedIndexDe, setSelectedIndexDe] = useState<number>(-1)

  const [searchDayoffLocgovCd, setSearchDayoffLocgovCd] = useState<string>('')

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

  const [selectedRowsDe, setSelectedRowsDe] = useState<string[]>([]) // 체크 로우 데이터

  // 유저 정보를 가져오는 함수
  const userInfo = getUserInfo()

  //부제구분 모달
  const [openDayoffDivModal, setOpenDayoffDivModal] = useState<boolean>(false)
  //부제 조회 모달
  const [openDayoffSearchModal, setOpenDayoffSearchModal] =
    useState<boolean>(false)
  //부제차량예약등록 모달
  const [openDayoffCarReserveModal, setOpenDayoffCarReserveModal] =
    useState<boolean>(false)
  //부제차량메모 모달
  const [openDayoffCarMemoModal, setOpenDayoffCarMemoModal] =
    useState<boolean>(false)
  //부제그룹 상세조회
  const [openDayoffGroupDetailSearch, setOpenDayoffGroupDetailSearch] =
    useState<boolean>(false)
  //
  const [openDayoffCal, setOpenDayoffCal] = useState<boolean>(false)

  //미등록 차량에 대해서 선택 해제
  const [regYn, setRegYn] = useState<boolean>(false)
  const [chkAllYmdYn, setChkAllYmdYn] = useState<boolean>(true) // 로딩여부

  // 부제그룹명
  const [groupNmCode, setGroupNmCode] = useState<SelectItem[]>([])

  const [authLocalNm, setAuthLocalNm] = useState<string>('')
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    dayoffLocgovCd: '',
  })

  const [paramsDe, setParamsDe] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    dayoffLocgovCd: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [pageableDe, setPageableDe] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
      fetchDataDe()
    }
  }, [flagDe])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    const fetchAuthInfo = async () => {
      if (userInfo.locgovCd || userInfo.locgovCd != '') {
        setUserAuthInfo(await getAllTaxiDayoffAuthInfo(authInfo))
      }
    }
    fetchAuthInfo()
  }, [])

  // 택시해제부제 권한체크
  const getAllTaxiDayoffAuthInfo = async (authSttus: any) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/stn/tdrm/tx/getAllTaxiDayoffAuthInfo?locgovCd=${authSttus.locgovCd}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        // 데이터 조회 성공시
        if (response.data) {
          //부제해제관리 가능 한경우
          authSttus.rollYn = response.data.rollYn
          authSttus.authLocgovNm = response.data.authLocgovNm
        } else {
          authSttus.rollYn = ''
        }
        // authSttus
        // setRtcnCnt(rows.length)
      } else {
        // 데이터가 없거나 실패 테스트용
        authSttus.rollYn = ''
        console.error('Error fetching data:', response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
    }
    return authSttus
  }

  // 부제그룹명을 설정함.
  const fetchGroupNm = async () => {
    let groupCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]
    //setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bdm/tx/getAllDayoffGroupNmList?` +
        `${params.locgovCd ? '&dayoffLocgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setGroupNmCode(response.data)

        response.data.map((code: any) => {
          let item: SelectItem = {
            label: code['groupNm'],
            value: code['groupNm'],
          }
          groupCodes.push(item)
        })
        setGroupNmCode(groupCodes)
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      //setLoading(false)
    }
  }

  const createDayoffConnect = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요')
      return
    }

    if (selectedRowsDe.length !== 1 || selectedRowsDe[0] === undefined) {
      alert('부제그룹정보를 선택하셔야합니다.')
      return
    }

    if (selectedRows.length < 1) {
      alert('차량별부제정보를 선택하셔야합니다.')
      return
    }

    //부제 권한체크
    if (userInfo.rollYn === '') {
      alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
      return
    } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
      alert(userInfo.authLocgovNm + '만 가능합니다.')
      return
    } else if (
      userInfo.locgovCd &&
      userInfo.locgovCd.length == 5 &&
      params.dayoffLocgovCd &&
      params.dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
    ) {
      //타겟정보
      const ctpvCd = params.dayoffLocgovCd?.substring(0, 2)
      //유저정보
      const userCtpvCd = userInfo.locgovCd.substring(0, 2)
      const userInstCd = userInfo.locgovCd.substring(2, 5)

      if (
        userCtpvCd == '11' &&
        (userInstCd == '000' || userInstCd == '001' || userInstCd == '009')
      ) {
        //서울 시도 담당자
        if (userCtpvCd != ctpvCd) {
          alert(userInfo.authLocgovNm + '만 가능합니다.')
          return
        }
      } else if (
        userCtpvCd == '11' &&
        userInstCd != '000' &&
        userInstCd != '001' &&
        userInstCd == '009'
      ) {
        //서울 시도 담당자 아님
        if (userInfo.locgovCd != params.dayoffLocgovCd) {
          alert('소속 지자체만 등록 가능합니다.')
          return
        }
      } else if (userInstCd == '000' || userInstCd == '001') {
        //서울외 시도 담당자
        if (userCtpvCd != ctpvCd) {
          alert(userInfo.authLocgovNm + '만 가능합니다.')
          return
        }
      } else if (userInstCd != '000' && userInstCd != '001') {
        //서울외 시도 담당자 아님
        if (userInfo.locgovCd != params.dayoffLocgovCd) {
          alert('소속 지자체만 등록 가능합니다.')
          return
        }
      }
    }

    const connectConfirm: boolean =
      confirm(`선택하신 ${selectedRows.length}대의 차량이 "${rowsDe[Number(selectedRowsDe[0].replace('tr', ''))].groupNm}" 부제그룹에 연결됩니다. 
    부제차량 연결시 기존에 연결된 부제정보는 자동으로 해제됩니다. 
    부제등록 하시겠습니까?`)

    if (!connectConfirm) return

    try {
      setLoadingBackdrop(true)

      //부제그룹1 차령별 부제정보 N을 엮어서 요청을 보내야한다.

      let rGroupId = rowsDe[Number(selectedRowsDe[0].replace('tr', ''))].groupId

      let param: any[] = []
      selectedRows.map((id) => {
        const row = rows[Number(id.replace('tr', ''))]
        param.push({
          vhclNo: row.vhclNo,
          dayoffLocgovCd:
            !row.dayoffLocgovCd || row.dayoffLocgovCd === ''
              ? params.locgovCd
              : row.dayoffLocgovCd,
          chgYmd: !row.groupNm || row.groupNm === '' ? getToday() : row.chgYmd,
          uType: !row.groupNm || row.groupNm === '' ? 'NEW' : '-',
          rgtrId: authContext?.lgnId,
          mdfrId: authContext?.lgnId,
          groupId: !row.groupId || row.groupId === '' ? rGroupId : row.groupId,
          afGroupId: rGroupId,
        })
      })

      const body = {
        byveDayoffMngReqstDto: param,
      }

      const endpoint: string = `/fsm/stn/bdm/tx/createDayoffVhcleConn`
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('부제차량 연결이 완료 됐습니다.')
      } else {
        alert('부제차량 연결이 실패했습니다..')
      }
    } catch (error) {
      alert('부제차량 연결 처리에 실패하였습니다.')
      console.error('ERROR POST DATA : ', error)
    } finally {
      setSelectedIndexDe(-1)
      setSelectedRowDe(null)
      setSelectedRowsDe([])
      setSelectedIndex(-1)
      setSelectedRows([])
      setLoadingBackdrop(false)
      setFlag(!flag)
      setFlagDe(!flagDe)
    }
  }

  useEffect(() => {
    setAuthContext(authInfo)
  }, [authInfo])

  useEffect(() => {
    // 시도 코드 변경시 관할관청 재조회
    fetchGroupNm()
  }, [params.locgovCd])

  //차량별 부제정보 조회

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }
      setLoading(true)
      setSelectedRows([])
      setSelectedRowsDe([])
      setSelectedRow(null)
      setSelectedRowDe(null)
      setSelectedIndex(-1)
      setSelectedIndexDe(-1)
      setExcelFlag(true) // 엑셀기능 동작여부

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bdm/tx/getAllDayoffVeInfoList?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&dayoffLocgovCd=' + params.locgovCd : ''}` +
        `${chkAllYmdYn ? '&chkAllYmdYn=Y' : '&chkAllYmdYn=N'}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.groupNm ? '&groupNm=' + params.groupNm : ''}` +
        `${regYn ? '&regYn=Y' : '&regYn=N'}` //미등록 차량 파라미터 추가 요망

      let log = params.locgovCd + ''
      setSearchDayoffLocgovCd(log)

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
        //setList([]); // 데이터가 없을 경우 초기화
        //setTotalRows(0);
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
      //setList([]);
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setSelectedRows([])
      setLoading(false)
    }
  }

  // Fetch를 통해 권한관련 데이터를 가져온다.

  // Fetch를 통해 데이터 갱신
  const fetchDataDe = async () => {
    if (!params.ctpvCd) {
      return
    }

    if (!params.locgovCd) {
      return
    }
    setLoadingDe(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bdm/tx/getAllDayoffGroupInfoList?page=${paramsDe.page}&size=${paramsDe.size}` +
        `${params.locgovCd ? '&dayoffLocgovCd=' + params.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        //setList(response.data.list);
        //setTotalRows(response.data.list.totalElements)

        setRowsDe(response.data.content)
        setTotalRowsDe(response.data.totalElements)
        setPageableDe({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setSelectedRowsDe([])
      } else {
        // 데이터가 없거나 실패
        //setList([]); // 데이터가 없을 경우 초기화
        //setTotalRows(0);
        setRowsDe([])
        setTotalRowsDe(0)
        setPageableDe({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setSelectedRowsDe([])
      }
    } catch (error) {
      // 에러시
      //setList([]);
      setRowsDe([])
      setTotalRowsDe(0)
      setPageableDe({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      setSelectedRowsDe([])
    } finally {
      setLoadingDe(false)
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
        `/fsm/stn/bdm/tx/getExcelAllDayoffVeInfoList?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&dayoffLocgovCd=' + params.locgovCd : ''}` +
        `${chkAllYmdYn ? '&chkAllYmdYn=Y' : '&chkAllYmdYn=N'}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.groupNm ? '&groupNm=' + params.groupNm : ''}` +
        `${regYn ? '&regYn=Y' : '&regYn=N'}` //미등록 차량 파라미터 추가 요망

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setParamsDe((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChangeDe = useCallback(
    (page: number, pageSize: number) => {
      setParamsDe((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlagDe((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClickDe = (rowDe: Row, indexDe?: number) => {
    if (indexDe === selectedIndexDe) {
      setSelectedRowDe(null)
      setSelectedIndexDe(-1)
    } else {
      setSelectedRowDe(rowDe)
      setSelectedIndexDe(indexDe ?? -1)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    setParamsDe((prev) => ({ ...prev, page: 1 }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
      fetchDataDe()
    }
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  const handleCheckChangeDe = (selectedDe: string[]) => {
    setSelectedRowsDe([selectedDe[selectedDe.length - 1]])
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    if (index === selectedIndex) {
      setSelectedRow(null)
      setSelectedIndex(-1)
    } else {
      setSelectedRow(row)
      setSelectedIndex(index ?? -1)
    }
  }

  const handleSearchCalendar = () => {
    if (!selectedRowDe && selectedRowsDe[0] === undefined) {
      alert('스케쥴을 조회할 그룹을 선택해주세요.')
      setOpenDayoffCal(false)
      return
    }
    setOpenDayoffCal(true)
  }

  return (
    <PageContainer title="차량별 부제관리" description="차량별 부제관리">
      {/* breadcrumb */}
      <Breadcrumb title="차량별 부제관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
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
                htmlFor="ft-groupNm"
              >
                부제그룹명
              </CustomFormLabel>
              <select
                id="ft-groupNm"
                className="custom-default-select"
                name="groupNm"
                value={params.groupNm}
                onChange={handleSearchChange}
                style={{ width: '70%' }}
              >
                {groupNmCode.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>

            <div className="form-group" style={{ maxWidth: '8rem' }}>
              <CustomFormLabel className="input-label-display">
                미등록차량
              </CustomFormLabel>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="regYn"
                    value={regYn}
                    onChange={() => setRegYn(!regYn)}
                  />
                }
                label=""
              />

              <div className="form-group" style={{ maxWidth: '9rem' }}>
                <CustomFormLabel className="input-label-display">
                  연결일자
                </CustomFormLabel>
                <FormControlLabel
                  sx={{ whiteSpace: 'nowrap' }}
                  control={
                    <CustomCheckbox
                      name="chkAllYmdYn"
                      value={chkAllYmdYn}
                      checked={chkAllYmdYn}
                      onChange={() => {
                        setChkAllYmdYn(!chkAllYmdYn)
                      }}
                    />
                  }
                  label="전체"
                />
              </div>

              <div className="form-group">
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  연결일자 시작
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="searchStDate"
                  value={params.searchStDate}
                  onChange={handleSearchChange}
                  inputProps={{}}
                  fullWidth
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  연결일자 종료
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="searchEdDate"
                  value={params.searchEdDate}
                  onChange={handleSearchChange}
                  inputProps={{
                    min: params.searchStDate,
                  }}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              onClick={() => {
                fetchData()
                fetchDataDe()
              }}
              variant="contained"
              color="primary"
              type="submit"
            >
              검색
            </Button>
          </div>
          <Button
            onClick={() => excelDownload()}
            variant="contained"
            color="success"
          >
            엑셀
          </Button>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 차량별부제정보 시작 */}
      <BlankCard
        sx={{ mb: 5 }}
        className="contents-card"
        title="차량별부제정보"
        buttons={[]}
      >
        <Box>
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            selectedRowIndex={selectedIndex}
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onCheckChange={handleCheckChange}
            caption={'택시-차량별 부제정보 목록 조회'}
          />
        </Box>
      </BlankCard>
      {/* 차량별부제정보 끝 */}

      {/* 부제그룹정보 시작 */}

      <BlankCard
        className="contents-card"
        title="부제그룹정보"
        buttons={[
          /*
          {
            label: '부제구분설정',
            onClick: () => {
              if(!params.locgovCd){
                alert('검색 이후 설정이 가능합니다.')
                return
              }
              setOpenDayoffDivModal(true)
            },
            color: 'outlined',
          },
          */
          {
            label: '부제차량연결',
            onClick: () => {
              createDayoffConnect()
            },
            color: 'outlined',
          },
          {
            label: '부제차량조회',
            onClick: () => {
              setOpenDayoffSearchModal(true)
            },
            color: 'outlined',
          },
          {
            label: '부제차량예약',
            onClick: () => {
              //선택된 차량 없을 경우 alert하고 종료

              if (selectedRows.length < 1) {
                alert('부제차량예약을 하기 위해서는 차량을 선택하셔야합니다.')
                return
              }
              setOpenDayoffCarReserveModal(true)
            },
            color: 'outlined',
          },
          {
            label: '부제스케쥴',
            onClick: () => {
              handleSearchCalendar()
            },
            color: 'outlined',
          },
        ]}
      >
        <Box>
          <TableDataGrid
            headCells={headCellsDe} // 테이블 헤더 값
            rows={rowsDe} // 목록 데이터
            totalRows={totalRowsDe} // 총 로우 수
            loading={loadingDe} // 로딩여부
            onRowClick={handleRowClickDe} // 행 클릭 핸들러 추가
            selectedRowIndex={selectedIndexDe}
            onPaginationModelChange={handlePaginationModelChangeDe} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageableDe} // 현재 페이지 / 사이즈 정보
            paging={true}
            oneCheck={true}
            cursor={true}
            onCheckChange={handleCheckChangeDe}
            checkAndRowClick={true}
            caption={'부제그룹정보 목록 조회'}
          />
        </Box>
      </BlankCard>

      <DayoffDivModal
        title={'부제구분 조회'}
        open={openDayoffDivModal}
        authLocalNm={authLocalNm}
        onCloseClick={() => setOpenDayoffDivModal(false)}
        dayoffLocgovCd={searchDayoffLocgovCd}
        dayoffSeCd={selectedRow?.dayoffSeCd ?? ''}
        reload={() => {
          setFlag(!flag)
          setFlagDe(!flagDe)
        }}
      />

      <DayoffSearchModal
        title={'부제차량조회'}
        authLocalNm={authLocalNm}
        open={openDayoffSearchModal}
        dayoffLocgovCd={searchDayoffLocgovCd}
        onCloseClick={() => setOpenDayoffSearchModal(false)}
        reload={() => {
          setFlag(!flag)
          setFlagDe(!flagDe)
        }}
      />

      <DayoffCarReserveModal
        title={'부제차량예약등록'}
        open={openDayoffCarReserveModal}
        //추후에 배열 전달 예정
        authLocalNm={authLocalNm}
        dayoffLocgovCd={searchDayoffLocgovCd}
        rows={selectedRows.map((id, index) => ({
          ...rows[Number(id.replace('tr', ''))],
          number: index + 1, // 순번 추가
        }))}
        onCloseClick={() => setOpenDayoffCarReserveModal(false)}
        reload={() => {
          setFlag(!flag)
          setFlagDe(!flagDe)
        }}
      />
      <>
        {selectedRow && (
          <DayoffMemoModal
            open={openDayoffCarMemoModal}
            onCloseClick={() => setOpenDayoffCarMemoModal(false)}
            row={selectedRow as Row}
            //dayoffSeCd={selectedRow?.dayoffSeCd ?? ''}
            dayoffLocgovCd={selectedRow?.dayoffLocgovCd ?? ''}
            reload={() => {
              setFlag(!flag)
              setFlagDe(!flagDe)
            }}
          />
        )}
      </>

      <DayoffGroupDetailModal
        title={'부제그룹 상세조회'}
        open={openDayoffGroupDetailSearch}
        onCloseClick={() => setOpenDayoffGroupDetailSearch(false)}
        groupId={selectedRowDe?.groupId ?? ''}
        reload={() => {
          setFlag(!flag)
          setFlagDe(!flagDe)
        }}
      />

      <>
        {openDayoffCal ? (
          <ModalCalendar
            title={'부제일달력'}
            buttonLabel={'부제일달력'}
            data={
              selectedRowDe ??
              rowsDe[Number(selectedRowsDe[0].replace('tr', ''))]
            }
            onCloseClick={() => setOpenDayoffCal(false)}
            open={openDayoffCal}
          />
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
