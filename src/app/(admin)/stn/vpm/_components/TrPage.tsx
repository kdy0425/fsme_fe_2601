'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getExcelFile,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import TrDetail from './TrDetail'
import TrModifyModal from './TrModifyModal'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import { stnVpmTrHC } from '@/utils/fsms/headCells'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils'

export interface Row {
  vhclNo: string //차량번호
  hstrySn: string //순번
  crno: string //법인등록번호(원본)
  crnoS: string //법인등록번호(복호화)
  vonrBrno: string //차량소유자사업자등록번호
  vonrNm: string //소유자명
  vhclPsnCd: string //차량소유코드
  vonrRrno: string //주민등록번호(암호화)
  vonrRrnoSecure: string //주민등록번호(별표표시)
  vonrRrnoS: string //주민등록번호(복호화)
  locgovCd: string //관할관청 코드
  koiCd: string //유종코드
  koiNm: string //유종
  vhclTonCd: string //톤수코드
  vhclTonNm: string //톤수
  bgngYmd: string //휴지시작일
  endYmd: string //휴지종료일
  chgSeCd: string //변경구분코드
  chgRsnCn: string //휴지사유
  trsmYn: string //전송여부
  trsmDt: string //전송일시
  delYn: string //삭제여부
  rgtrId: string //등록자아이디
  regDt: string //등록일시
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일시
  locgovNm: string //관할관청 코드
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TrPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [dtFlag, setDtFlag] = useState<boolean>(false) // 전체날짜조회를 위한 플래그
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [open, setOpen] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'I' | 'U'>('I')
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    const dateRange2 = getDateRange('d', -30)
    let startDate = dateRange.startDate
    let endDate = dateRange2.startDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
    // setFlag((prev) => !prev)
    setExcelFlag(false)
  }, [])

  useEffect(() => {
    if (flag != undefined) {
      fetchData()
    }
    // setSelectedRowIndex(-1)
  }, [flag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    setLoading(true)
    try {
      if (!params.searchStDate || !params.searchEdDate) {
        alert('휴지기간을 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vpm/tr/getAllVhclePauseMng?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}`
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
        setExcelFlag(true)
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
        `/fsm/stn/vpm/tr/getExcelVhclePauseMng?` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}`

      await getExcelFile(endpoint, '화물_차량휴지관리_' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRowIndex(index ?? -1)
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    const regex2 = /[\-~`!@#$%^&*_+={}[\]|\\:;"'<>,.?/]/g
    if (name == 'vhclNo') {
      setParams((prev) => ({
        ...prev,
        [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
      }))
    } 
    // else if (name == 'vonrNm') {
    //   setParams((prev) => ({
    //     ...prev,
    //     [name]: value.replaceAll(regex2, '').replaceAll(' ', ''),
    //   }))
    // } 
    else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
    setExcelFlag(false)
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleClickModify = () => {
    if (selectedRowIndex < 0) {
      alert('선택된 휴지정보가 없습니다.')
      return
    }
    setModalType('U')
    setOpen(true)
  }

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     fetchData()
  //   }
  // }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    fetchData()
    //setFlag(prev => !prev)
  }

  return (
    <Box>
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
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
			  	id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 9 }}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vonrNm">
                소유자명
              </CustomFormLabel>
              <CustomTextField
			  	id="ft-vonrNm"
                name="vonrNm"
                value={params.vonrNm}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength : 50
                }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                휴지일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                휴지일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ max: params.searchEdDate }}
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                휴지일자 종료
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
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              // onClick={() => fetchData()}
              variant="contained"
              color="primary"
              type="submit"
            >
              검색
            </Button>
            <Button
              onClick={() => {
                setModalType('I')
                setOpen(true)
              }}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <Button
              onClick={() => handleClickModify()}
              variant="contained"
              color="primary"
            >
              수정
            </Button>
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
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnVpmTrHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
		  caption={"화물 차량휴지관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRowIndex > -1 && (
        <BlankCard className="contents-card" title="상세정보">
          <TrDetail data={rows[selectedRowIndex]} />
        </BlankCard>
      )}
      <TrModifyModal
        open={open}
        row={rows[selectedRowIndex]}
        handleClickClose={handleClickClose}
        type={modalType}
        reload={() => fetchData()}
      />
    </Box>
  )
}

export default TrPage
