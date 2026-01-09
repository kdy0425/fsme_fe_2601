'use client'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { sendHttpFileRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { getToday } from '@/utils/fsms/common/dateUtils'
import { getDateRange } from '@/utils/fsms/common/util'
import { getUserInfo } from '@/utils/fsms/utils'; // 로그인 유저 정보

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// table
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { Pageable2 } from 'table'

//Dialog
import PosDetailDialog from './_components/PosDetailDialog'

// card
import BlankCard from '@/app/components/shared/BlankCard'

// 시도, 시군구, 개인법인구분 선택
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';

// 백앤드 처리시 로딩
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// headCells
import { apvRpdmPosDclrTrHC } from '@/utils/fsms/headCells'

import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '주유(충전)소 관리',
  },
  {
    to: '/apv/rpdm',
    title: 'POS신고',
  },
]

export interface Row {
  posDclrTsid: string
  locgovNm: string
  instlYmd: string
  posDclrCnCd: string
  posDclrCnNm: string
  prcsSttsCd: string
  prcsSttsNm: string
  brno: string
  oltNm: string
  daddr: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  ctpvCd: string
  locgovCd: string
  posDclrCnCd: string
  prcsSttsCd: string
  ornCmpnyCd: string
  oltNm: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

// 엑셀다운로드
export const getExcelFile = async (endpoint: string, name: string) => {
  try {
    const response = await sendHttpFileRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })

    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', name)
    document.body.appendChild(link)
    link.click()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const DataList = () => {
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수

  const [regRows, setRegRows] = useState<Row[]>([]) // 조사결과 등록할 로우 데이터

  const [selectedRows, setSelectedRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [initFlag, setInitFlag] = useState<boolean>(false) // 초기화시 자동 조회를 막기 위한 플래그 설정

  const [posDetailModalFlag, setPosDetailModalFlag] = useState(false);  // POS신고 상세 모달

  // 목록 조회를 위한 객체
  const [params, setParams] = useState<listSearchObj>({
    page        : 1,    // 페이지 번호는 1부터 시작
    size        : 10,   // 기본 페이지 사이즈 설정
    bgngDt      : '',   // 요청일자 시작일
    endDt       : '',   // 요청일자 종료일
    ctpvCd      : '',   // 시도
    locgovCd    : '',   // 지자체
    posDclrCnCd : '',   // 신고구분 
    prcsSttsCd  : '',   // 처리상태
    ornCmpnyCd  : '',   // 정유사
    oltNm       : '',   // 주유소명
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 로그인 아이디 조회
  const userInfo = getUserInfo();
  const userLoginId = userInfo.lgnId;
  const userLocgovCd = userInfo.locgovCd;

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()  // 기본 요청일자 설정
    setFlag(!flag); // 조회
  }, [])

  // 탭 영역 조회
  useEffect(() => {
    setRegRows([])
    setSelectedRows([])
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })

    if (!initFlag) {
      setInitFlag(true)
    } else {
      fetchData()
    }
  }, [!flag])

  // 기본 날짜 세팅 (91일)
  const setDateRange = () => {
    const dateRange = getDateRange("date", 365)

    const startDate = dateRange.startDate
    const endDate = dateRange.endDate

    setParams((prev) => ({ ...prev, bgngDt: startDate, endDt: endDate }))
  }

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])


  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleSearchButton = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag);
  }

  // 파라미터 변경시 설정
  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }));
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

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField =
        name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
        return
      }
    }

    // 시도명이 전체일 때 관할관청도 전체로 초기화
    if(params.ctpvCd === '' && params.locgovCd !== '') {
      setParams((prev) => ({ ...prev, locgovCd: '' }))
      return
    }

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (selectedRow: Row) => {
    console.log("selectedRow.posDclrTsid: ", selectedRow.posDclrTsid)
    let selectedRows: Row[] = []
    selectedRows.push(selectedRow)
    setSelectedRows(selectedRows)
    openPosDetailModal()  // POS신고 상세 모달 열기
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

  // POS신고 목록 조회
  const fetchData = async () => {
    setLoading(true)
    try {
      const endpoint: string = 
        `/fsm/apv/rpdm/tr/getAllReportPosDclrMng?` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll("-", "") : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll("-", "") : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.posDclrCnCd ? '&posDclrCnCd=' + params.posDclrCnCd : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
        `${params.ornCmpnyCd ? '&ornCmpnyCd=' + params.ornCmpnyCd : ''}` +
        `${params.oltNm ? '&oltNm=' + params.oltNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      console.log("endpoint: ", endpoint)

      if (response && response.resultType === 'success' && response.data) {
        console.log("response.data: ", response.data)
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber,
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

  // POS 신고 목록조회 엑셀 다운로드
  const excelDownload = async () => {
    const endpoint: string =
      `/fsm/apv/rpdm/tr/getExcelAllReportPosDclrMng?` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll("-", "") : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll("-", "") : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.posDclrCnCd ? '&posDclrCnCd=' + params.posDclrCnCd : ''}` +
      `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
      `${params.ornCmpnyCd ? '&ornCmpnyCd=' + params.ornCmpnyCd : ''}` +
      `${params.oltNm ? '&oltNm=' + params.oltNm : ''}`

      await  getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  // POS신고 상세 모달 열기
  const openPosDetailModal = async () => {
    setPosDetailModalFlag(true)
  }

  // POS신고 상세 모달 닫기
  const closePosDetailModal = (saveFlag: boolean) => {
    setPosDetailModalFlag((prev) => false)
    if (saveFlag) {
      setFlag(!flag)
    }
  }

  // 모달 새고로침
  const handleModalReload = () => {
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
  }

  return (
    <PageContainer title="POS신고" description="POS신고">
      {/* breadcrumb */}
      <Breadcrumb title="POS신고" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleSearchButton} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                <span className="required-text" >*</span> 요청일자
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="cal-bgng">요청일자 시작</CustomFormLabel>
              <CustomTextField type="date" id="cal-bgng" name="bgngDt" value={params.bgngDt} onChange={handleSearchChange} fullWidth />
              ~ 
              <CustomFormLabel className="input-label-none" htmlFor="cal-end">요청일자 종료</CustomFormLabel>
              <CustomTextField type="date" id="cal-end" name="endDt" value={params.endDt} onChange={handleSearchChange} fullWidth />
            </div>
            <div className="form-group" style={{  marginLeft:'50px' }}>
              <CustomFormLabel className="input-label-display" htmlFor="cmb-ctpv">
                <span className="required-text" >*</span> 시도명
              </CustomFormLabel>
              <CtpvSelect
                pName={'ctpvCd'}
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                width={'60%'}
                htmlFor={'cmb-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="cmb-locgov">
                <span className="required-text" >*</span> 관할관청
              </CustomFormLabel>
              <LocgovSelect
                pName={'locgovCd'}
                pValue={params.locgovCd}
                ctpvCd={params.ctpvCd}
                handleChange={handleSearchChange}
                width={'60%'}
                htmlFor={'cmb-locgov'}
              />
            </div>
          </div><hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display" htmlFor="cmb-posDclrCn"
              >
                신고구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'pos_dclr_cn_cd'}
                pValue={params.posDclrCnCd}
                pName={'posDclrCnCd'}
                width={'60%'}
                handleChange={handleSearchChange}
                htmlFor={'cmb-posDclrCn'}
                addText='전체'
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display" htmlFor="cmb-prcsStts"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'prcs_stts_cd'}
                pValue={params.prcsSttsCd}
                pName={'prcsSttsCd'}
                width={'60%'}
                handleChange={handleSearchChange}
                htmlFor={'cmb-prcsStts'}
                addText='전체'
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display" htmlFor="cmb-ornCmpny"
              >
                정유사
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'orn_cmpny_cd'}
                pValue={params.ornCmpnyCd}
                pName={'ornCmpnyCd'}
                width={'60%'}
                handleChange={handleSearchChange}
                htmlFor={'cmb-ornCmpny'}
                addText='전체'
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display" htmlFor="txt-oltNm"
              >
                주유소명
              </CustomFormLabel>
              <CustomTextField 
                id="txt-oltNm"
                name="oltNm" 
                value={params.oltNm}
                onChange={handleSearchChange}
                width={'100%'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group" style={{ padding:'0px 0px 0px 0px' }} >
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary" >검색</Button>
            {/* <Button variant="contained" color="success" onClick={() => excelDownload()}>엑셀</Button> */}
          </div>
        </Box>
      </Box>
      
      {/* 검색영역 종료 */}

      {/* 테이블영역 시작 */}
      <div style={{ marginTop:'20px'}}>
        <BlankCard>
          <Box className="table-bottom-button-group" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-6px', paddingBottom: '14px' }}>
            <div className="data-grid-top-toolbar">
              <div className="data-grid-search-count">
                검색 결과 <span className="search-count">{totalRows}</span>건
              </div>
            </div>
          </Box>
          <TableDataGrid
            headCells={apvRpdmPosDclrTrHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            caption={"POS신고 목록 조회"}
          />
        </BlankCard>
      </div>
      {/* 테이블영역 끝 */}
      {/* POS신고 상세 모달 */}
      <div>
        {posDetailModalFlag && (
          <PosDetailDialog
            size="lg"
            title="POS신고 상세"
            reloadFunc={handleModalReload}
            closePosDetailModal={closePosDetailModal}
            selectedRows={selectedRows}
            open={posDetailModalFlag}
          ></PosDetailDialog>
        )}
      </div>
    </PageContainer>
  )
}

export default React.memo(DataList)
