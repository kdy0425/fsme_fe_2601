'use client'
import { Box, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange } from '@/utils/fsms/common/util'
import { serverCheckTime, isValidDateRange } from '@/utils/fsms/common/comm'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { Pageable2 } from 'table'
import { stnTdrmStandHC, stnTdrmDetailHC } from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import DayoffSearchModal from './_components/DayoffSearchModal'
import StandModifyDialog from './_components/ModifyDialog'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { getUserInfo } from '@/utils/fsms/utils'

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
    to: '/stn/tdrm',
    title: '부제해제관리',
  },
]

export interface StandRow {
  dayoffLocgovCd: string //부제 지자체코드
  dayoffRmvNo: string //부제해제번호
  locgovNm: string //지자체명
  dayoffNm: string //부제명
  dayoffExpln: string //부제설명
  rmvBgngYmd: string //해제시작일시
  rmvEndYmd: string //해제종료일시
  dayoffRtrcnSeCd: string //부제해제구분코드
  rtrcnBgngHr: string //해제 시작시간
  rtrcnEndHr: string //해제종료시간
  cfmtnSeCd: string //확정구분코드
  dayoffTypeCd: string //부제유형코드
  endHrNxtyYn: string //종료시간익일여부
  crtrYmd: string //기준일자
  prkCd: string //주차코드
  dowCd: string //요일코드
  delYn: string //삭제여부
  rgtrId: string //등록자ID
  regDt: string //등록일
  mdfrId: string //수정자ID
  mdfcnDt: string //수정일
  cancelStandStart: string //해제시작일시
  cancelStandEnd: string //해제종료일시
  cancelStandInfo: string //부제해제정보
  dayoffAll: boolean //전체해제 (표시용)
}

export interface DetailRow {
  dayoffLocgovCd: string //부제 지자체코드
  dayoffRmvNo: string //부제해제번호
  vhclNo: string //차량번호
  dayoffNm: string //부제명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

export type ReqItem = {
  id: string
  indctNm: string
  sn: string
  chgRsnCd: 'I' | 'D'
  dataType: 'I' | 'U'
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [detailFlag, setDetailFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<StandRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [groupLoading, setGroupLoading] = useState(false) // 로딩여부
  const [modalType, setModalType] = useState<'I' | 'U'>('I')
  const [dayoffCalOpen, setDayoffCalOpen] = useState(false)

  const [detailRow, setDetailRow] = useState<DetailRow[]>([])
  const [detailTotalRows, setDetailTotalRows] = useState(0)

  const [groupModalFlag, setGroupModalFlag] = useState(false)
  const [standModalFlag, setStandModalFlag] = useState(false)

  const { authInfo, setUserAuthInfo } = useContext(UserAuthContext)
  const [authContext, setAuthContext] = useState<UserAuthInfo | {}>()

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  //부제 조회 모달
  const [openDayoffSearchModal, setOpenDayoffSearchModal] =
    useState<boolean>(false)

  const [searchDayoffLocgovCd, setSearchDayoffLocgovCd] = useState<string>('')

  const userInfo = getUserInfo()

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    searchStDate: '',
    searchEdDate: '',
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovCd: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  //
  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [selecteDetailIndex, setSelectedDetailIndex] = useState<number>(-1)
  const [selectedDetailRow, setSelectedDetailRow] = useState<DetailRow>({
    dayoffLocgovCd: '', //부제 지자체코드
    dayoffRmvNo: '', //부제해제번호
    vhclNo: '', //차량번호
    dayoffNm: '', //부제명
  }) //선택된 Row를 담음

  const [selectedStandIndex, setSelectedStandIndex] = useState<number>(-1)
  const [selectedStandRow, setSelectedStandRow] = useState<StandRow>({
    dayoffLocgovCd: '', //부제 지자체코드
    dayoffRmvNo: '', //부제해제번호
    locgovNm: '', //지자체명
    dayoffNm: '', //부제명
    dayoffExpln: '', //부제설명
    rmvBgngYmd: '', //해제시작일시
    rmvEndYmd: '', //해제종료일시
    dayoffRtrcnSeCd: '', //부제해제구분코드
    rtrcnBgngHr: '', //해제 시작시간
    rtrcnEndHr: '', //해제종료시간
    cfmtnSeCd: '', //확정구분코드
    dayoffTypeCd: '', //부제유형코드
    endHrNxtyYn: '', //종료시간익일여부
    crtrYmd: '', //기준일자
    prkCd: '', //주차코드
    dowCd: '', //요일코드
    delYn: '', //삭제여부
    rgtrId: '', //등록자ID
    regDt: '', //등록일
    mdfrId: '', //수정자ID
    mdfcnDt: '', //수정일
    cancelStandStart: '', //해제시작일시
    cancelStandEnd: '', //해제종료일시
    cancelStandInfo: '', //부제해제정보
    dayoffAll: false,
  }) //선택된 Row를 담음

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (selectedStandRow) {
      fetchDetailData(selectedStandRow)
    }
  }, [detailFlag])

  useEffect(() => {
    setAuthContext(authInfo)
  }, [authInfo])

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
    setFlag(!flag)
    setDetailFlag(!detailFlag)
    setParams((prev) => ({
      ...prev,
    }))
    setDetailParams((prev) => ({
      ...prev,
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
        // console.log('getAllTaxiDayoffAuthInfo : ', response.data)
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

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('date', 30)

    const startDate = dateRange.startDate
    const endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }

      if (params.searchStDate > params.searchEdDate) {
        alert('시작일자가 종료일자보다 클 수 없습니다.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tdrm/tx/getAllTaxiDayoffRelisMngList?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&dayoffLocgovCd=' + params.locgovCd : ''}` +
        `${params.dayoffNm ? '&dayoffNm=' + params.dayoffNm : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      let locgovCode = params.locgovCd + ''
      setSearchDayoffLocgovCd(locgovCode)

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setDetailRow([])
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

  const fetchDetailData = async (standRow: StandRow) => {
    setGroupLoading(true)
    try {
      let endpoint =
        `/fsm/stn/tdrm/tx/getAllTaxiDayoffRelisConnCarList?page=${detailParams.page}&size=${detailParams.size}` +
        `${standRow.dayoffLocgovCd ? '&dayoffLocgovCd=' + standRow.dayoffLocgovCd : ''}` +
        `${standRow.dayoffRmvNo ? '&dayoffRmvNo=' + standRow.dayoffRmvNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRow(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setDetailRow([])
        setDetailTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      setDetailRow([])
      setDetailTotalRows(0)
      setDetailPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setGroupLoading(false)
    }
  }

  //차량정보 삭제
  const deleteData = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (userInfo.rollYn === '') {
      alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
      return
    } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
      alert(userInfo.authLocgovNm + '만 가능합니다.')
      return
    } else if (
      userInfo.locgovCd &&
      userInfo.locgovCd.length == 5 &&
      selectedStandRow.dayoffLocgovCd &&
      selectedStandRow.dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
    ) {
      //타겟정보
      const ctpvCd = selectedStandRow.dayoffLocgovCd.substring(0, 2)
      // console.log('ctpvCd : ', ctpvCd)
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
        if (userInfo.locgovCd != selectedStandRow.dayoffLocgovCd) {
          alert('소속 지자체만 삭제 가능합니다.')
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
        if (userInfo.locgovCd != selectedStandRow.dayoffLocgovCd) {
          alert('소속 지자체만 삭제 가능합니다.')
          return
        }
      }
    }

    if (!selectedStandRow || selectedStandRow.dayoffRmvNo === '') {
      alert('삭제할 부제해제정보가 선택되지 않았습니다.')
      return
    }
    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요')
      return
    }

    // 사용자 확인
    const userConfirm = confirm('해당 부제해제정보를 삭제하시겠습니까?')
    if (!userConfirm) {
      return
    }
    try {
      let endpoint = `/fsm/stn/tdrm/tx/deleteTaxiDayoffRelisStdr`

      const data = {
        dayoffRmvNo: selectedStandRow.dayoffRmvNo,
        mdfrId: userInfo.lgnId,
        dayoffLocgovCd: selectedStandRow.dayoffLocgovCd,
      }

      const response = await sendHttpRequest('DELETE', endpoint, data, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        // setDetailRow(response.data.content)
        alert('부제해제정보를 삭제 하였습니다.')
        handleReload()
      } else {
        // 데이터가 없거나 실패
        alert(
          `부제해제정보 데이터 삭제 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
      }
    } catch (error) {
    } finally {
      // setGroupLoading(false)
    }
  }

  //차량정보 등록
  const insertDetailData = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (!selectedStandRow.dayoffRmvNo) {
      alert('부제해제정보가 선택되지 않았습니다.')
      return
    }

    if (
      selectedStandRow.dayoffRtrcnSeCd &&
      selectedStandRow.dayoffRtrcnSeCd === '2'
    ) {
      alert('특수부제는 부제해제차량 추가 및 삭제를 할 수 없습니다')
      return
    }

    if (userInfo.rollYn === '') {
      alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
      return
    } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
      alert(userInfo.authLocgovNm + '만 가능합니다.')
      return
    } else if (
      userInfo.locgovCd &&
      userInfo.locgovCd.length == 5 &&
      selectedDetailRow.dayoffLocgovCd &&
      selectedDetailRow.dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
    ) {
      //타겟정보
      const ctpvCd = selectedDetailRow.dayoffLocgovCd.substring(0, 2)
      // console.log('ctpvCd : ', ctpvCd)
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
        if (userInfo.locgovCd != selectedDetailRow.dayoffLocgovCd) {
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
        if (userInfo.locgovCd != selectedDetailRow.dayoffLocgovCd) {
          alert('소속 지자체만 등록 가능합니다.')
          return
        }
      }
    }

    setOpenDayoffSearchModal(true)
  }

  //차량정보 삭제
  const deleteDetailData = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (
      selectedStandRow.dayoffRtrcnSeCd &&
      selectedStandRow.dayoffRtrcnSeCd === '2'
    ) {
      alert('특수부제는 부제해제차량 추가 및 삭제를 할 수 없습니다')
      return
    }

    // setGroupLoading(true)
    if (userInfo.rollYn === '') {
      alert('현재 부제 미사용 지자체입니다. 관리자에게 문의해주세요')
      return
    } else if (userInfo.rollYn === 'N' && userInfo.authLocgovNm) {
      alert(userInfo.authLocgovNm + '만 가능합니다.')
      return
    } else if (
      userInfo.locgovCd &&
      userInfo.locgovCd.length == 5 &&
      selectedDetailRow.dayoffLocgovCd &&
      selectedDetailRow.dayoffLocgovCd.length == 5 //타겟데이터 지자체코드 확인
    ) {
      //타겟정보
      const ctpvCd = selectedDetailRow.dayoffLocgovCd.substring(0, 2)
      // console.log('ctpvCd : ', ctpvCd)
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
        if (userInfo.locgovCd != selectedDetailRow.dayoffLocgovCd) {
          alert('소속 지자체만 삭제 가능합니다.')
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
        if (userInfo.locgovCd != selectedDetailRow.dayoffLocgovCd) {
          alert('소속 지자체만 삭제 가능합니다.')
          return
        }
      }
    }

    if (!selectedDetailRow.vhclNo) {
      alert('삭제할 차량정보가 선택되지 않았습니다.')
      return
    }
    if (!(authContext && 'lgnId' in authContext && authContext.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요')
      return
    }

    // 사용자 확인
    const userConfirm = confirm('해당 부제해제 차량정보를 삭제하시겠습니까?')
    if (!userConfirm) {
      return
    }
    try {
      let endpoint = `/fsm/stn/tdrm/tx/deleteTaxiDayoffRelisCar`

      //선택된 행을 저장하는 방식
      let param: any[] = []
      param.push({
        vhclNo: selectedDetailRow.vhclNo,
        dayoffRmvNo: selectedDetailRow.dayoffRmvNo,
        mdfrId: authContext.lgnId,
        rgtrId: authContext.lgnId,
        dayoffLocgovCd: selectedDetailRow.dayoffLocgovCd,
      })
      let body = {
        taxiDayoffRelisMngReqstDto: param,
      }

      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        // setDetailRow(response.data.content)
        alert('부제해제 차량정보를 삭제 하였습니다.')
        fetchDetailData(selectedStandRow)
      } else {
        // 데이터가 없거나 실패
        alert(
          `부제해제 차량정보 데이터 삭제 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
      }
    } catch (error) {
    } finally {
      // setGroupLoading(false)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    setDetailParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }
  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setDetailParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(!flag)
    setDetailFlag(!detailFlag)
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
  const detailhandlePaginationModelChange = (
    page: number,
    pageSize: number,
  ) => {
    setDetailParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setDetailFlag(!detailFlag)
  }
  // 페이지 이동 감지 종료 //

  // 행 클릭 시 호출되는 함수
  const handleGroupRowClick = (selectedGroupRow: DetailRow, index?: number) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움
    setSelectedDetailRow(selectedGroupRow)
    setSelectedDetailIndex(index ?? -1)

    handleGroupModalModifyOpen()
  }

  const handleStandRowClick = (selectedStandRow: StandRow, index?: number) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움
    setSelectedStandRow(selectedStandRow)
    fetchDetailData(selectedStandRow)
    setSelectedStandIndex(index ?? -1)
    // handleStandModalModifyOpen()
  }

  // 기준 그룹 모달창 오픈 함수
  const handleGroupModalOpen = () => {
    setModalType('I')
    setGroupModalFlag(true)
  }

  // 기준 그룹 모달창 오픈 함수
  const handleStandModalOpen = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    if (searchDayoffLocgovCd == '') {
      alert('검색 이후 등록이 가능합니다.')
      return
    }
    setModalType('I')
    setStandModalFlag(true)
  }

  // 기준 그룹 모달창 오픈 함수
  const handleGroupModalModifyOpen = () => {
    setModalType('U')
    setGroupModalFlag(true)
  }

  // 기준 그룹 모달창 오픈 함수
  const handleStandModalModifyOpen = () => {
    setModalType('U')
    setStandModalFlag(true)
  }

  const handleReload = () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setDetailParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    // setFlag(!flag)
    // setDetailFlag(!flag)
    fetchData()

    if (rows.length > 0) {
      setSelectedStandRow(rows[0])
      setSelectedStandIndex(0)
      fetchDetailData(rows[0])
    }
  }

  const handleDetailReload = () => {
    fetchDetailData(selectedStandRow)
  }

  const handleGroupCloseModal = () => {
    setGroupModalFlag((prev) => false)
  }

  const handleStandCloseModal = () => {
    setStandModalFlag((prev) => false)
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
        `/fsm/stn/tdrm/tx/getExcelAllTaxiDayoffRelisMngList?` +
        `${params.locgovCd ? 'dayoffLocgovCd=' + params.locgovCd : ''}` +
        `${params.dayoffNm ? '&dayoffNm=' + params.dayoffNm : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

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

  return (
    <PageContainer title="택시_부제그룹관리" description="택시_부제그룹관리">
      {/* breadcrumb */}
      <Breadcrumb title="택시_부제그룹관리" items={BCrumb} />
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
              <CustomFormLabel className="input-label-display" required>
                해제시작일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                해제년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                해제년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <LoadingBackdrop open={loadingBackdrop} />
          <div className="button-right-align">
            <Button
              onClick={() => {
                fetchData()
                // fetchDetailData()
              }}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={handleStandModalOpen}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <Button onClick={deleteData} variant="contained" color="error">
              삭제
            </Button>
            <Button
              variant="contained"
              onClick={() => excelDownload()}
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard className="contents-card" title="부제해제정보">
          <TableDataGrid
            headCells={stnTdrmStandHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleStandRowClick} // 행 클릭 핸들러 추가
            selectedRowIndex={selectedStandIndex}
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            caption={'택시-부제해제정보 목록 조회'}
          />
        </BlankCard>

        <Box sx={{ width: '50%', display: 'flex' }}>
          <BlankCard className="contents-card" title="부제해제대상차량">
            <TableDataGrid
              headCells={stnTdrmDetailHC}
              rows={detailRow}
              // totalRows={detailTotalRows}
              loading={groupLoading}
              onRowClick={handleGroupRowClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selecteDetailIndex}
              onPaginationModelChange={detailhandlePaginationModelChange}
              pageable={detailPageable}
              paging={true}
              cursor={true}
              caption={'부제해제 대상차량 목록 조회'}
            />
          </BlankCard>
          <Box className="table-bottom-button-group">
            <div
              className="button-right-align"
              style={{ alignItems: 'baseline', marginLeft: '20px' }}
            >
              <Button
                onClick={insertDetailData}
                variant="contained"
                color="secondary"
              >
                해제차량추가
              </Button>
              <Button
                onClick={deleteDetailData}
                variant="contained"
                color="secondary"
              >
                해제차량삭제
              </Button>
            </div>
          </Box>
        </Box>
      </Box>
      {/* 테이블영역 끝 */}
      {/* 부제해제기준등록 등록 모달 */}
      {/* <div>
        {groupModalFlag && (
          <GroupModifyDialog
            size="lg"
            title="부제그룹관리"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleGroupCloseModal}
            selectedRow={selectedGroupRow}
            open={groupModalFlag}
            type={modalType}
          ></GroupModifyDialog>
        )}
      </div> */}
      <div>
        {standModalFlag && (
          <StandModifyDialog
            size="md"
            title="부제해제기준등록"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleStandCloseModal}
            dayoffLocgovCd={searchDayoffLocgovCd}
            // selectedRow={selectedStandRow}
            open={standModalFlag}
            // type={modalType}
          ></StandModifyDialog>
        )}
      </div>
      {/* <>
        {dayoffCalOpen ? (
          <ModalCalendar
            title={'부제 캘린더'}
            buttonLabel={'부제 캘린더'}
            data={params.locgovCd.toString()}
            onCloseClick={() => setDayoffCalOpen(false)}
            open={dayoffCalOpen}
          />
        ) : null}
      </> */}
      <div>
        {openDayoffSearchModal && (
          <DayoffSearchModal
            title={'부제차량조회'}
            open={openDayoffSearchModal}
            dayoffLocgovCd={searchDayoffLocgovCd}
            selectedStandRow={selectedStandRow}
            onCloseClick={() => setOpenDayoffSearchModal(false)}
            reload={handleDetailReload}
          />
        )}
      </div>
    </PageContainer>
  )
}

export default DataList
