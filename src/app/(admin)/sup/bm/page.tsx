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
import { supBmHC,supBmDtlHC } from '@/utils/fsms/headCells'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import { CustomFormLabel, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';

// import TableDataGrid from './_components/TableDataGrid'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
import { SelectItem } from 'select'
import { getCityCodes, getCodesByGroupNm, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import UserAuthContext, { UserAuthInfo } from '@/app/components/context/UserAuthContext'
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

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

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
    to: '/sup/bm',
    title: '예산관리',
  },
]

export interface Row {
  //id:string;
  bgtFrmtNo?: string // 순번
  crtrYear?: string // 기준년도
  locgovCd?: string // 지자체코드
  locgovNm?: string // 지자체명
  bgtFrmtAmt?: string // 예산액
  ctpvCd?: string
  ctpvNm?: string
  cfmtnYn : string // 확정여부
}

const rowData: Row[] = [

]

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

  const [flag, setFlag] = useState<boolean>(true) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 예산조회 로우 데이터
  const [selectedMainRow, setSelectedMainRow] = useState<Row>()  // 선택된 지자체 Row를 담음
  const [loading, setLoading] = useState(false) // 로딩여부

  const [detailRows, setDetailRows] = useState<Row[]>([]) // 변경이력 조회 데이터
  // const [ctpvRows, setCtpvRows] = useState<Row[]>([]) // 지자체 데이터

  const [selectedRow, setSelectedRow] = useState<Row>()  //지자체 선택된 Row를 담음 
  const [detailModalFlag ,setDetailModalFlag] = useState(false);
  const [excelModalFlag ,setExcelModalFlag] = useState(false);
  const [selectedIndex ,setSelectedIndex] = useState<number>(-1);
  const [selectedRows, setSelectedRows] = useState<Row[]>([])  //선택된 Row를 담음 

  const [leadCnCode, setLeadCnCode] = useState<SelectItem[]>([])  //        공지구분 코드 
  const [workCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드 
  const [sear, setSear] = useState<SelectItem[]>([]) //          검색 구분 코드

  const { authInfo } = useContext(UserAuthContext);

  const [isEditMode, setIsEditMode] = useState<boolean>(false); // 수정/변경 모드 상태 관리  


  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 999), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? '1', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    ctpvCd: allParams.ctpvCd ?? '51', //시도코드
    locgovCd: allParams.locgovCd ?? '51150', //지자체코드
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })


    
  const handleReload = () => {
    if(selectedMainRow){
      setSelectedRow(selectedMainRow)
      fetchDetailData(selectedMainRow)
    }else{
      setSelectedRow(undefined)
    }
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }


  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    fetchData()
    setDetailRows([])
  }, [flag])


  const [selectYear, setSelectYear] = useState<{value:number, label:number}[]>([]);

  const setYearSelect = () => {
    const nowDate = new Date;
    let nowYear = nowDate.getFullYear(); // 올 해 년수

    // 올해 앞뒤로 +-5년
    setSelectYear([
      {value: nowYear-11, label: nowYear-11},
      {value: nowYear-10, label: nowYear-10},
      {value: nowYear-9, label: nowYear-9},
      {value: nowYear-8, label: nowYear-8},
      {value: nowYear-7, label: nowYear-7},
      {value: nowYear-6, label: nowYear-6},
      {value: nowYear-5, label: nowYear-5},
      {value: nowYear-4, label: nowYear-4},
      {value: nowYear-3, label: nowYear-3},
      {value: nowYear-2, label: nowYear-2},
      {value: nowYear-1, label: nowYear-1},
      {value: nowYear, label: nowYear},
      {value: nowYear+1, label: nowYear+1},
      {value: nowYear+2, label: nowYear+2},
      {value: nowYear+3, label: nowYear+3},
      {value: nowYear+4, label: nowYear+4},
      {value: nowYear+5, label: nowYear+5},
    ])
  }
  

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    const dateRange = getDateRange('y', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      ctpvCd: params.ctpvCd,
      locgovCd: params.locgovCd,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

  setYearSelect()

  setRows([])
  setDetailRows([])
  // setCtpvRows([])

  }, [])


  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    // setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/bm/cm/getAllBudgetMng?page=${params.page}&size=${params.size}` +
        // `${params.searchSelect ? '&rtSeqNo=' + params.searchSelect : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` 

        // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것 


        const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data && response.data != '') {
        // 데이터 조회 성공시
        setRows(response.data)
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
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setDetailRows([])
      // setTotalRows(0)
      // setPageable({
      //   pageNumber: 1,
      //   pageSize: 10,
      //   totalPages: 1,
      // })
    } finally {
      setLoading(false)
    }
  }


  // Fetch를 통해 데이터 갱신
  const fetchDetailData = async (row : Row) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/bm/cm/getOneBudgetMng?` +
        `${row.crtrYear ? 'crtrYear=' + row.crtrYear : ''}` +
        `${row.locgovCd ? '&locgovCd=' + row.locgovCd : ''}` 
        // `${row.rtSeqNo ? '&rtSeqNo=' + row.rtSeqNo : ''}`

        // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것 

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data)
      
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setDetailRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
    } finally {
    }
  }

  // 지자체 예산 항목 삭제
  const deleteRowData = async () => {
    try {
      if(selectedMainRow){
        // 검색 조건에 맞는 endpoint 생성
          let endpoint: string =
          `/fsm/sup/bm/cm/deleteBudgetMng`

          let body = {bgtFrmtNo: selectedMainRow.bgtFrmtNo};

          if(selectedMainRow.cfmtnYn == '미확정'){
            const userConfirm = confirm( '선택한 예산 정보를 삭제하시겠습니까?');
            if (!userConfirm) {
                return;
            }
            if(userConfirm) {
                const response = await sendHttpRequest('DELETE', endpoint, body, true, {
                    cache: 'no-store',
                })
                if (response && response.resultType === 'success') {
                  alert('삭제되었습니다');
                  handleReload();
                }else {
                  alert(response.message);
                }
            }
          }else{
            alert('확정된 예산정보는 삭제하실 수 없습니다');
          }
          
      }
      
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      // setCtpvRows([])
    } finally {
    }
  }

  // 지자체 예산 항목 확정
  const confirmRowData = async () => {
    try {
      if(selectedMainRow){
        // 검색 조건에 맞는 endpoint 생성
          let endpoint: string =
          `/fsm/sup/bm/cm/cfmtnBudgetMng`

          let body = {bgtFrmtNo: selectedMainRow.bgtFrmtNo, cfmtnYn: 'Y'};

          if(selectedMainRow.cfmtnYn == '미확정'){
            const userConfirm = confirm( '예산확정시 삭제가 불가능합니다. 예산정보를 확정하시겠습니까?');
            if (!userConfirm) {
                return;
            }
            if(userConfirm) {
                const response = await sendHttpRequest('PUT', endpoint, body, true, {
                    cache: 'no-store',
                })
                if (response && response.resultType === 'success') {
                  alert('확정되었습니다');
                  handleReload();
                }else {
                  alert(response.message);
                }
            }
          }else{
            alert('확정된 예산정보입니다.');
          }
          
      }
      
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      // setCtpvRows([])
    } finally {
    }
  }

  // // 선택 년도 차수 전체 항목 삭제
  // const deleteCtpvAllData = async () => {
  //   try {
  //     if(selectedMainRow){
  //       // 검색 조건에 맞는 endpoint 생성
  //         let endpoint: string =
  //         `/fsm/sup/bm/cm/deletePrpdvsMng`

  //         // 
  //         type rtNoItem ={
  //           rtNo?: string
  //         }
  //         let list:rtNoItem[] = [{rtNo:selectedMainRow?.rtNo}]

  //         let body = list;

  //         const userConfirm = confirm( selectedMainRow.crtrYear + '년도 '+ 
  //           selectedMainRow.rtSeqNo+ ' 차수의 예산 정보를 삭제하시겠습니까?');
  //         if (!userConfirm) {
  //             return;
  //         }
  //         if(userConfirm) {
  //             const response = await sendHttpRequest('DELETE', endpoint, body, true, {
  //                 cache: 'no-store',
  //             })
  //             if (response && response.resultType === 'success') {
  //             alert('삭제되었습니다');
  //             }else {
  //             alert(response.message);
  //             }
  //         }
  //     }
      
  //   } catch (error) {
  //     // 에러시
  //     console.error('Error fetching data:', error)
  //     setCtpvRows([])
  //   } finally {
  //   }
  // }



  // 모달 클로즈 //
  const  handleDetailCloseModal= () => {
      setDetailModalFlag((prev) => false) 
  }

  const  handleExcelCloseModal= () => {
    setExcelModalFlag((prev) => false) 
  }

  // 엑셀 모달 오픈
  const  handleExcelOpenModal= () => {
    setExcelModalFlag(true) 
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
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
  const handleRowClick = async (row: Row, index?:number) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움 
    await fetchDetailData(row)
    setSelectedIndex(index ?? -1);
    setSelectedMainRow(row)
    
    if(row.cfmtnYn === '미확정'){
      setIsEditMode(false)
    }else{
      setIsEditMode(true)
    }
  }

  useEffect(() => {
    // setQString(toQueryString(params))
    // if(selectedMainRow?.cfmtnYn == '확정'){
    //   setIsEditMode(true)
    // }else{
    //   setIsEditMode(false)
    // }
  }, [selectedMainRow])

  // 예산 미확정 항목 예산 변경 
  const handleRowDoubleClick = async (row: Row, index?:number) => {

    // await fetchDetailData(row)
    setSelectedIndex(index ?? -1);
    setSelectedMainRow(row)

    if(row.cfmtnYn === '미확정'){
      setIsEditMode(false)
    }else{
      setIsEditMode(true)
      alert('예산 확정 데이터입니다. ')
      return;
    }

    setDetailModalFlag(true)
  }

  // 예산 확정 항목 예산 변경 
  const changeModalOpen = async () => {
    
    if(selectedMainRow?.cfmtnYn == '미확정'){
      alert('예산 미확정 데이터입니다. ')
      return;
    }
    setDetailModalFlag(true)
  }


  // 행 클릭 시 호출되는 함수
  const handleDetailRowClick = async (row: Row) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움 
    // await fetchCtpvDetailData(row)
    // setDetailModalFlag(true)
  }

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
    <PageContainer title="예산관리" description="예산관리">
      {/* breadcrumb */}
      <Breadcrumb title="예산관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        {/* {/* <Box>{authInfo.issas UserAuthInfo}</Box> */}
        <Box className="sch-filter-box"> 
        
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                기준년도
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="searchStDate"
              >
                기준년도
              </CustomFormLabel>
              <select className="custom-default-select" style={{ width: '100%' }}
                id="searchStDate"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                // fullWidth
                // variant="outlined"
                title="시작년도"
                >
                  {selectYear.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="searchEdDate"
              ></CustomFormLabel>
              ~<select className="custom-default-select" style={{ width: '100%' }}
                id="searchEdDate"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                // fullWidth
                // variant="outlined"
                title="종료년도"
                >
                  {selectYear.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>

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

          </div>
          
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button  type='submit' variant="contained" color="primary">
              검색
            </Button>
            <ModalContent
                    size="sm"
                    title="예산정보 등록"
                    reloadFunc={handleReload}
                    buttonLabel={'등록'}
                >
            </ModalContent>
            <Button  variant="contained" color="error" onClick={deleteRowData}>
              삭제
            </Button>
            <Button  variant="contained" color="primary" onClick={confirmRowData}>
              확정
            </Button>
            <Button  variant="contained" color="primary" onClick={changeModalOpen}>
              예산변경
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Grid container spacing={2} className="card-container">
        {/* <Box style={{width: '50%'}}> */}
        <Grid item xs={6} sm={6} md={6}>
          <CustomFormLabel className="input-label-display">
            <h2>지자체별 예산정보</h2>
          </CustomFormLabel>
          <TableDataGrid
            headCells={supBmHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onRowDoubleClick={handleRowDoubleClick}
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            paging={false}
            cursor={true}
            selectedRowIndex={selectedIndex}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={6}>
          <Grid container  className="card-container" style={{width:"100%"}}>
            <CustomFormLabel className="input-label-display">
              <h2>예산변경내역</h2>
            </CustomFormLabel>
          </Grid>
          <TableDataGrid
            headCells={supBmDtlHC} // 테이블 헤더 값
            rows={detailRows} // 목록 데이터
            loading={loading} // 로딩여부
            onRowClick={handleDetailRowClick} // 행 클릭 핸들러 추가
            paging={false}
            cursor={true}
          />
        </Grid>
      </Grid>
      {/* 테이블영역 끝 */}
      {/* 상세수정 모달 */}
      <div>
            {detailModalFlag && selectedMainRow && (
                <ModifyDialog
                    size="sm"
                    title="예산정보 수정"
                    reloadFunc={handleReload}
                    selectedRow={selectedMainRow}
                    open={detailModalFlag}
                    editMode={isEditMode}
                    handleDetailCloseModal={handleDetailCloseModal}
                >
                </ModifyDialog>
            )}
      </div>

      {/* 엑셀 모달 */}
      <div>
            {/* {excelModalFlag && (
                <ExcelDialog
                    size="sm"
                    title="예산정보 엑셀업로드"
                    reloadFunc={handleReload}
                    open={excelModalFlag}
                    handleDetailCloseModal={handleExcelCloseModal}
                >
                </ExcelDialog>
            )} */}
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