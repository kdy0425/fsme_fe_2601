'use client'
import {
  Box,
  Button,
  FormControlLabel,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  MenuItem,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'

// import TableDataGrid from './_components/TableDataGrid'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
import { SelectItem } from 'select'
import {
  getCityCodes,
  getCodesByGroupNm,
  getLocalGovCodes,
} from '@/utils/fsms/common/code/getCode'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import FormDialog from '@/app/components/popup/FormDialog'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { width } from '@amcharts/amcharts4/.internal/core/utils/Utils'
import { Height } from '@mui/icons-material'
import ModifyDialog from './_components/ModifyDialog'
import ExcelDialog from './_components/ExcelDialog'

import { supTmHC, supTmTotalHC, supTmDetailHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '예산관리',
  },
  {
    to: '/sup/tm',
    title: '세입액관리',
  },
]

export interface Row {
  //id:string;
  rtNo?: string // 비율번호
  crtrYm: string // 기준년도
  anlrveAmtNo: string // 세입금액번호
  totlAnlrveAmt?: string // 세입총액
  ctpvCd?: string
  ctpvNm?: string
  locgovCd?: string // 지자체코드
  locgovNm?: string // 지자체명
  anlrveAmt: number // 세입액
  aplcnRt: string // 세입비율
}

const rowData: Row[] = []

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

// 조회하여 가져온 정보를 Table에 넘기는 객체
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 년도 로우 데이터
  const [selectedMainRow, setSelectedMainRow] = useState<Row>() // 선택된 년도 Row를 담음
  const [selectedMainIndex, setSelectedMainIndex] = useState<number>(-1)
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [detailRows, setDetailRows] = useState<Row[]>([]) // 시도정보 데이터
  const [selecteDetailIndex, setSelectedDetailIndex] = useState<number>(-1)
  const [selectedDetailRow, setSelectedDetailRow] = useState<Row>() //시도정보 선택된 Row를 담음

  const [ctpvRows, setCtpvRows] = useState<Row[]>([]) // 지자체 데이터
  const [selectedRow, setSelectedRow] = useState<Row>() //지자체 선택된 Row를 담음

  const [detailModalFlag, setDetailModalFlag] = useState(false)
  const [excelModalFlag, setExcelModalFlag] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedRows, setSelectedRows] = useState<Row[]>([]) //선택된 Row를 담음

  const [leadCnCode, setLeadCnCode] = useState<SelectItem[]>([]) //        공지구분 코드
  const [workCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드
  const [sear, setSear] = useState<SelectItem[]>([]) //          검색 구분 코드

  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // null 초기값 설정

  useEffect(() => {
    // authInfo에서 roles의 첫 번째 값이 "Admin"인지 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles[0] === 'ADMIN')
    }
  }, [authInfo])

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? '1', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const handleReload = () => {
    // setSelectedRow(undefined)
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
    if(selectedMainRow){
      fetchDetailData(selectedMainRow)
      if(selectedDetailRow){
        fetchCtpvDetailData(selectedDetailRow)
      }
    }
  }

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(params.searchStDate && params.searchEdDate){
      fetchData()
    }
  }, [flag])

  const [selectYear, setSelectYear] = useState<
    { value: number; label: number }[]
  >([])

  // 초기 데이터 로드
  useEffect(() => {
    // setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    console.log(startDate)
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    setRows([])
    setDetailRows([])
    setCtpvRows([])
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    // setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedMainIndex(-1)
    setDetailRows([])
    setCtpvRows([])
    setSelectedRows([])
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/tm/cm/getAllTxrvamtMngYear?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`
      // `${params.relateTaskSeCd ? '&relateTaskSeCd=' + params.relateTaskSeCd : ''}`
      // `${'&locgovUsrYn=' + (isLocgovCdAll ? 'Y' : 'N')}`+
      // `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        // console.log(response.data)
        // console.log(rows)
        setRows(response.data)
        setSelectedMainRow(undefined)
        // if(response.data.length > 0){
        //   handleRowClick(response.data[0], 0)
        // }
        // setTotalRows(response.data.totalElements)
        // setPageable({
        //   pageNumber: response.data.pageable.pageNumber +1,
        //   pageSize: response.data.pageable.pageSize,
        //   totalPages: response.data.totalPages,
        // })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setDetailRows([])
        setCtpvRows([])
        setTotalRows(0)
        setSelectedMainRow(undefined)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setDetailRows([])
      setCtpvRows([])
      setTotalRows(0)
      setSelectedMainRow(undefined)
    } finally {
      setLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchDetailData = async (row: Row) => {
    setSelectedDetailIndex(-1)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/tm/cm/getAllTxrvamtMng?` +
        `${row.crtrYm ? 'crtrYm=' + row.crtrYm : ''}` +
        `${row.anlrveAmtNo ? '&anlrveAmtNo=' + row.anlrveAmtNo : ''}`

      // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data)
      } else {
        // 데이터가 없거나 실패
        console.log('선택된 데이터가 없습니다. ', response)
        setDetailRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
    } finally {
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchCtpvDetailData = async (row: Row) => {
    setSelectedIndex(-1)
    try {
      if (row.locgovCd) {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/sup/tm/cm/getAllTxrvamtMngDtl?` +
          `${row.crtrYm ? 'crtrYm=' + row.crtrYm : ''}` +
          `${row.anlrveAmtNo ? '&anlrveAmtNo=' + row.anlrveAmtNo : ''}` +
          `${row.locgovCd ? '&locgovCd=' + row.locgovCd : ''}`

        // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success' && response.data) {
          // 데이터 조회 성공시
          setCtpvRows(response.data)
        } else {
          // 데이터가 없거나 실패
          console.log('선택된 데이터가 없습니다. ', response)
          setCtpvRows([])
        }
      } else {
        setCtpvRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setCtpvRows([])
    } finally {
    }
  }

  // 지자체 지자체 항목 삭제
  const deleteCtpvDetailData = async () => {
    try {
      if (selectedRows[0]) {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string = `/fsm/sup/tm/cm/deleteSelectTxrvamtMng`

        // selectedRows
        type anlrveAmtNoItem = {
          anlrveAmtNo?: string
          locgovCd?: string
        }

        let param: anlrveAmtNoItem[] = []

        selectedRows.map((row) => {
          param.push({ anlrveAmtNo: row.anlrveAmtNo, locgovCd: row.locgovCd })
        })

        let body = { list: param }

        // console.log(body)
        const userConfirm = confirm('선택한 세입 정보를 삭제하시겠습니까?')
        if (!userConfirm) {
          return
        }
        if (userConfirm) {
          const response = await sendHttpRequest(
            'DELETE',
            endpoint,
            body,
            true,
            {
              cache: 'no-store',
            },
          )
          if (response && response.resultType === 'success') {
            alert('삭제되었습니다')
            fetchData()
          } else {
            alert(response.message)
          }
        }
      }else{
        alert('삭제할 세입정보를 선택해 주세요')
        return
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setCtpvRows([])
    } finally {
    }
  }

  // 선택 년도 차수 전체 항목 삭제
  const deleteCtpvAllData = async () => {
    if (!selectedMainRow) {
      alert('삭제할 세입정보를 선택해 주세요')
      return
    }
    try {
      if (selectedMainRow) {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string = `/fsm/sup/tm/cm/deleteTxrvamtMng`

        //
        type anlrveAmtNoItem = {
          anlrveAmtNo?: string
        }
        let param: anlrveAmtNoItem[] = [
          { anlrveAmtNo: selectedMainRow?.anlrveAmtNo },
        ]

        let body = { list: param }

        console.log(body)
        const userConfirm = confirm(
          selectedMainRow.crtrYm +
            '년 ' +
            selectedMainRow.crtrYm +
            '월의 세입 정보를 삭제하시겠습니까?',
        )
        if (!userConfirm) {
          return
        }
        if (userConfirm) {
          const response = await sendHttpRequest(
            'DELETE',
            endpoint,
            body,
            true,
            {
              cache: 'no-store',
            },
          )
          if (response && response.resultType === 'success') {
            alert('삭제되었습니다')
            fetchData()
          } else {
            alert(response.message)
          }
        }
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setCtpvRows([])
    } finally {
    }
  }

  // 모달 클로즈 //
  const handleDetailCloseModal = () => {
    setDetailModalFlag((prev) => false)
  }

  const handleExcelCloseModal = () => {
    setExcelModalFlag((prev) => false)
  }

  // 엑셀 모달 오픈
  const handleExcelOpenModal = () => {
    setExcelModalFlag(true)
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    // setFlag(!flag)
    fetchData()
    setDetailRows([])
    setCtpvRows([])
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?: number) => {
    //선택된 행을 담음
    await fetchDetailData(row)
    setSelectedMainRow(row)
    setSelectedMainIndex(index ?? -1)

    setCtpvRows([]) // 지자체별 로우 초기화
  }

  // 행 클릭 시 호출되는 함수
  const handleDetailRowClick = async (row: Row, index?: number) => {
    //선택된 행을 담음
    await fetchCtpvDetailData(row)
    setSelectedDetailRow(row)
    setSelectedDetailIndex(index ?? -1)
    // setDetailModalFlag(true)
  }

  // 행 클릭 시 호출되는 함수
  const handleCtpvRowClick = async (row: Row, index?: number) => {
    //선택된 행을 담음
    //선택된 행에 대한 지자체 정보 수정 모달을 띄움
    row.anlrveAmt = Number(row.anlrveAmt)
    setSelectedRow(row)
    setDetailModalFlag(true)
    setSelectedIndex(index ?? -1)
  }

  //체크 로우
  const handleCheckChange = (selected: string[]) => {
    let selectedRows: Row[] = []
    selected.map((id) =>
      selectedRows.push(ctpvRows[Number(id.replace('tr', ''))]),
    )

    setSelectedRows(selectedRows)
  }

  // 글쓰기 페이지로 이동하는 함수
  const handleWriteClick = () => {
    router.push(`./create${qString}`) // '/create'는 글쓰기 페이지의 경로입니다.
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
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

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  // 조건 검색 변환 매칭
  const sortChange = (sort: String): String => {
    if (sort && sort != '') {
      let [field, sortOrder] = sort.split(',') // field와 sortOrder 분리하여 매칭
      if (field === 'regYmd') field = 'regDt' // DB -> regDt // DTO -> regYmd ==> 매칭 작업
      return field + ',' + sortOrder
    }
    return ''
  }

  return (
    <PageContainer title="세입관리" description="세입관리">
      {/* breadcrumb */}
      <Breadcrumb title="세입관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        {/* {/* <Box>{authInfo.issas UserAuthInfo}</Box> */}
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                기준년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기준년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              ></CustomFormLabel>
              ~
              <CustomTextField
                type="month"
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
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <ModalContent
              size="sm"
              title="세입정보 등록"
              reloadFunc={fetchData}
              buttonLabel={'등록'}
              data={selectedMainRow}
            ></ModalContent>
            <Button
              variant="contained"
              color="success"
              onClick={handleExcelOpenModal}
            >
              엑셀업로드
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              onClick={deleteCtpvAllData}
            >
              전체삭제
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}

      <Box style={{ width: '50%' }}>
        <CustomFormLabel className="input-label-display">
          <h2>세입정보</h2>
        </CustomFormLabel>
        <TableDataGrid
          headCells={supTmTotalHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          // totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          // pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={false}
          cursor={true}
          selectedRowIndex={selectedMainIndex}
        />
      </Box>
      <Grid container spacing={2} className="card-container">
        {/* <Box style={{width: '50%'}}> */}
        <Grid item xs={6} sm={6} md={6}>
          <CustomFormLabel className="input-label-display">
            <h2>시도별 세입정보</h2>
          </CustomFormLabel>
          <TableDataGrid
            headCells={supTmHC} // 테이블 헤더 값
            rows={detailRows} // 목록 데이터
            // totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleDetailRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            // pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={false}
            cursor={true}
            selectedRowIndex={selecteDetailIndex}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={6}>
          <CustomFormLabel className="input-label-display">
            <h2>지자체별 세입정보</h2>
          </CustomFormLabel>
          <Box
            className="table-bottom-button-group"
            style={{ marginTop: '-40px', marginBottom: '5px' }}
          >
            <div className="button-right-align">
              <Button
                type="submit"
                variant="contained"
                color="error"
                onClick={deleteCtpvDetailData}
              >
                삭제
              </Button>
            </div>
          </Box>
          <TableDataGrid
            headCells={supTmDetailHC} // 테이블 헤더 값
            rows={ctpvRows} // 목록 데이터
            // totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleCtpvRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            // pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={false}
            cursor={true}
            onCheckChange={handleCheckChange}
            selectedRowIndex={selectedIndex}
          />
        </Grid>
      </Grid>
      {/* 테이블영역 끝 */}
      {/* 상세수정 모달 */}
      <div>
        {detailModalFlag && selectedRow && (
          <ModifyDialog
            size="sm"
            title="세입정보 수정"
            reloadFunc={fetchData}
            selectedRow={selectedRow}
            open={detailModalFlag}
            handleDetailCloseModal={handleDetailCloseModal}
          ></ModifyDialog>
        )}
      </div>

      {/* 엑셀 모달 */}
      <div>
        {excelModalFlag && (
          <ExcelDialog
            size="sm"
            title="세입정보 엑셀등록"
            reloadFunc={fetchData}
            open={excelModalFlag}
            handleDetailCloseModal={handleExcelCloseModal}
          ></ExcelDialog>
        )}
      </div>

      {/* <Box className="table-bottom-button-group">
          <div className="button-right-align">
              <Button variant="contained" color="primary"
              onClick={handleWriteClick}
              >
                등록
              </Button>
          </div>
      </Box> */}
    </PageContainer>
  )
}

export default DataList
