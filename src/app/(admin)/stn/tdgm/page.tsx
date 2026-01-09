'use client'
import { Box, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import { serverCheckTime } from '@/utils/fsms/common/comm'
// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { Pageable2 } from 'table'
import { stnTdgmStandHC, stnTdgmGroupHC } from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import GroupModifyDialog from './_components/GroupModifyDialog'
import StandModifyDialog from './_components/StandModifyDialog'
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
    to: '/stn/tdgm',
    title: '부제그룹관리',
  },
]

export interface StandRow {
  rowNum: string //숫자
  locgovNm: string //지자체명
  dayoffSeNm: string //부제구분명
  dayoffSeCd: string //부제구분
  dayoffTypeNm: string //부제유형명
  dayoffTypeCd: string //부제유형
  dayoffNm: string //부제기준명
  dayoffNo: string //부제번호
  sn: string // 순번
  indctNm: string //부제조
  bgngHr: string //부제기준
  bzmnSeCd: string //사업자구분
  dayoffExpln: string //기준설명
  endHrNxtyYn: string //부제종료시간명
  endHr: string //부제종료시간
  crtrYmd: string //기준일자
  prkCd: string //주차코드
  dowCd: string //요일코드
  dayoffLocgovCd: string //관할관청코드
  locgovCd: string //지자체코드
}

export interface DetailRow {
  rowNum: string //번호
  locgovNm: string //지자체명
  dayoffLocgovCd: string //부제 지자체코드
  groupId: string //부제그룹ID
  groupNm: string //부제그룹명
  groupExpln: string //부제그룹설명
  regDt: string //입력일자
  mdfcnDt: string //수정일자
  btn: string //등록
}

interface AuthInfo {
  rollYn: string // 권한여부
  authLocgovNm: string //권한지자체명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
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

  const userInfo = getUserInfo()
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [detailFlag, setDetailFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<StandRow[]>([]) // 가져온 로우 데이터
  const [authInfo, setAuthInfo] = useState<AuthInfo[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [groupLoading, setGroupLoading] = useState(false) // 로딩여부
  const [modalType, setModalType] = useState<'I' | 'U'>('I')
  const [dayoffCalOpen, setDayoffCalOpen] = useState(false)
  const [editTime, setEditTime] = useState('180000') // 편집가능시간

  const [groupRows, setGroupRows] = useState<DetailRow[]>([])
  const [groupTotalRows, setGroupTotalRows] = useState(0)

  const [groupModalFlag, setGroupModalFlag] = useState(false)
  const [standModalFlag, setStandModalFlag] = useState(false)

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
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
  const [groupPageable, setGroupPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [selectedGroupRow, setSelectedGroupRow] = useState<DetailRow>({
    rowNum: '', //번호
    locgovNm: '', //지자체명
    dayoffLocgovCd: '', //부제 지자체코드
    groupId: '', //부제그룹ID
    groupNm: '', //부제그룹명
    groupExpln: '', //부제그룹설명
    regDt: '', //입력일자
    mdfcnDt: '', //수정일자
    btn: '', //등록
  }) //선택된 Row를 담음

  const [selectedStandRow, setSelectedStandRow] = useState<StandRow>({
    rowNum: '',
    locgovNm: '',
    dayoffSeNm: '',
    dayoffTypeNm: '',
    dayoffNm: '',
    dayoffNo: '',
    sn: '',
    indctNm: '',
    bgngHr: '',
    endHrNxtyYn: '',
    endHr: '',
    dayoffLocgovCd: '',
    dayoffSeCd: '',
    dayoffTypeCd: '',
    crtrYmd: '',
    dayoffExpln: '',
    bzmnSeCd: '',
    dowCd: '',
    prkCd: '',
    locgovCd: '',
  }) //선택된 Row를 담음

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
      fetchDetailData()
    }
  }, [detailFlag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
    setDetailFlag(!detailFlag)
    setParams((prev) => ({
      ...prev,
    }))
    setDetailParams((prev) => ({
      ...prev,
    }))

    setFetchAuthInfo()
  }, [])

  const setFetchAuthInfo = async () => {
    try {
      let endpoint: string = `/fsm/stn/tdgm/tx/getAllTaxiDayoffAuthInfo?locgovCd=${userInfo.locgovCd}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setAuthInfo(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setAuthInfo([])
      }
    } catch (error) {
      // 에러시
      setAuthInfo([])
    } finally {
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)

    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/tdgm/tx/getTaxiDayoffStandMngList?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

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

  const fetchDetailData = async () => {
    setGroupLoading(true)
    try {
      let endpoint =
        `/fsm/stn/tdgm/tx/getAllTaxiDayoffGroupMngList?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setGroupRows(response.data.content)
        setGroupTotalRows(response.data.totalElements)
        setGroupPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setGroupRows([])
        setGroupTotalRows(0)
        setGroupPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      setGroupRows([])
      setGroupTotalRows(0)
      setGroupPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setGroupLoading(false)
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
  const handleGroupRowClick = async (selectedGroupRow: DetailRow) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움
    setSelectedGroupRow(selectedGroupRow)

    handleGroupModalModifyOpen()
  }

  const handleStandRowClick = async (selectedStandRow: StandRow) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움
    setSelectedStandRow(selectedStandRow)

    handleStandModalModifyOpen()
  }

  // 기준 그룹 모달창 오픈 함수
  const handleGroupModalOpen = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }
    setSelectedGroupRow({
      rowNum: '', //번호
      locgovNm: '', //지자체명
      dayoffLocgovCd: params.locgovCd.toString(), //부제 지자체코드
      groupId: '', //부제그룹ID
      groupNm: '', //부제그룹명
      groupExpln: '', //부제그룹설명
      regDt: '', //입력일자
      mdfcnDt: '', //수정일자
      btn: '', //등록
    })
    setModalType('I')
    setGroupModalFlag(true)
  }

  // 기준 그룹 모달창 오픈 함수
  const handleStandModalOpen = async () => {
    if (!(await serverCheckTime('dayoff'))) {
      return
    }

    setSelectedStandRow({
      rowNum: '',
      locgovNm: '',
      dayoffSeNm: '',
      dayoffTypeNm: '',
      dayoffNm: '',
      dayoffNo: '',
      sn: '',
      indctNm: '',
      bgngHr: '',
      endHrNxtyYn: '',
      endHr: '',
      dayoffLocgovCd: '',
      dayoffSeCd: '',
      dayoffTypeCd: '',
      crtrYmd: '',
      dayoffExpln: '',
      bzmnSeCd: '',
      dowCd: '',
      prkCd: '',
      locgovCd: params.locgovCd.toString(),
    })
    setModalType('I')
    setStandModalFlag(true)
  }

  const handleCalendarOpen = async () => {
    setDayoffCalOpen(true)
  }

  // 기준 그룹 모달창 오픈 함수
  const handleGroupModalModifyOpen = async () => {
    setModalType('U')
    setGroupModalFlag(true)
  }

  // 기준 그룹 모달창 오픈 함수
  const handleStandModalModifyOpen = async () => {
    setModalType('U')
    setStandModalFlag(true)
  }

  const handleReload = () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setDetailParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    setDetailFlag(!flag)
  }

  const handleGroupCloseModal = () => {
    setGroupModalFlag((prev) => false)
  }

  const handleStandCloseModal = () => {
    setStandModalFlag((prev) => false)
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
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => {
                fetchData()
                fetchDetailData()
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
            <Button
              onClick={handleCalendarOpen}
              variant="contained"
              color="primary"
            >
              부제캘린더
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard className="contents-card" title="부제기준정보">
          <TableDataGrid
            headCells={stnTdgmStandHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleStandRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            caption={'택시-부제기준정보 목록 조회'}
          />
        </BlankCard>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={handleGroupModalOpen}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
          </div>
        </Box>

        <BlankCard className="contents-card" title="부제그룹정보">
          <TableDataGrid
            headCells={stnTdgmGroupHC}
            rows={groupRows}
            totalRows={groupTotalRows}
            loading={groupLoading}
            onRowClick={handleGroupRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={detailhandlePaginationModelChange}
            pageable={groupPageable}
            paging={true}
            cursor={true}
            caption={'부제그룹정보 목록 조회'}
          />
        </BlankCard>
      </Box>
      {/* 테이블영역 끝 */}
      {/* 부제그룹정보 등록/수정 모달 */}
      <div>
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
      </div>
      <div>
        {standModalFlag && (
          <StandModifyDialog
            size="lg"
            title="부제기준관리"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleStandCloseModal}
            selectedRow={selectedStandRow}
            open={standModalFlag}
            type={modalType}
          ></StandModifyDialog>
        )}
      </div>
      <>
        {dayoffCalOpen ? (
          <ModalCalendar
            title={'부제 캘린더'}
            buttonLabel={'부제 캘린더'}
            data={params.locgovCd.toString()}
            onCloseClick={() => setDayoffCalOpen(false)}
            open={dayoffCalOpen}
          />
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
