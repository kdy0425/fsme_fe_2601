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
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// import TableDataGrid from './_components/TableDataGrid'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell } from 'table'
import ModalContent from './_components/ModalContent'
import { SelectItem } from 'select'
import { getCityCodes, getCodesByGroupNm, getLocalGovCodes } from '@/utils/fsms/common/code/getCode'
import UserAuthContext, { UserAuthInfo } from '@/app/components/context/UserAuthContext'
import FormDialog from '@/app/components/popup/FormDialog'
import ModifyDialog from './_components/ModifyDialog'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import ModifyModalContent from './_components/ModifyModalContent'
import { Pageable2 } from 'table'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { getFormatToday, getToday, getDateRange } from '@/utils/fsms/common/dateUtils'
import { getUserInfo } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '업무일반',
  },
  {
    to: '/sup/rr',
    title: '소급요청',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'regYmd',
    numeric: false,
    disablePadding: false,
    label: '등록일자',
    format: 'yyyymmdd'
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체',
  },
  {
    id: 'taskSeCdNm',
    numeric: false,
    disablePadding: false,
    label: '업무구분',
  },
  {
    id: 'rtroactDmndSeCdNm',
    numeric: false,
    disablePadding: false,
    label: '소급요청구분',
    
  },
  {
    id: 'rtroactDmndNm',
    numeric: false,
    disablePadding: false,
    label: '소급요청명',
    
  },
  {
    id: 'prcsSttsCdNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
    
  },
]


export interface CustomFile {
  atchSn?: string;  //첨부일련번호
  rfrncGroupSn?: string; //게시글일련번호
  physFileNm?: string; // 물리파일명
  lgcFileNm?: string; //논리파일명
  fileSize?: string; //파일용량
  uldFile?: string; //업로드파일
  rfrncId?: string; //참조아이디
  regDt?: string; // 등록일시
  rgtrId?: string;  // 등록자아이디
}

export interface Row {
  //리스트
  rtroactDmndTsid?: string; // 소급요청식별번호
  regYmd?: string; // 등록일자
  rtroactDmndNm?: string; // 화물 소급요청
  taskSeCd: string; // 업무구분코드   
  rtroactDmndSeCd: string; // 소급요청구분코드
  rtroactDmndSeCdNm?: string; // 소급요청구분명
  locgovCd?: string; // 지자체코드
  locgovNm?: string; // 지자체코드명
  rtroactDmndCn?: string; // 소급요청내용
  prcsSttsCd?: string; // 처리상태코드
  prcsSttsCdNm?: string; // 처리상태명

  //상세
  clrId?: string; // 접수자ID
  clrNm?: string; // 접수자명
  rcptPrcsDt?: string; // 접수처리일시
  rjctTrprId?: string; // 반려대상자아이디
  rjctTrprNm?: string; // 반려자명
  rjctPrcsDt?: string; // 반려처리일시
  rjctRsn?: string; // 반려사유
  prcrId?: string; // 처리자아이디
  prcrNm?: string; // 처리자명
  taskPrcsDt?: string; // 업무처리일시
  rgtrId?: string; // 신청자아이디
  rgtrNm?: string; // 신청자명
  regDt?: string; // 등록일시
  mdfrId?: string; // 수정자아이디
  mdfcnDt?: string; // 수정일시\

  //신규 등록시 
  fileList? : [CustomFile] | [] // 첨부파일 
  files?: [File] | [];
}


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
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>()  //선택된 Row를 담음 
  const [detailMoalFlag ,setDetailModalFlag] = useState(false);

  const [leadCnCode, setLeadCnCode] = useState<SelectItem[]>([])  //        공지구분 코드 
  const [workCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드 
  const [sear, setSear] = useState<SelectItem[]>([]) //          검색 구분 코드

  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false);
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([]); // 시도 코드
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]); // 관할관청 코드

  const { authInfo } = useContext(UserAuthContext);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // 관리자여부

  useEffect(() => {
    // authInfo에서 roles의 첫 번째 값이 "Admin"인지 확인
    console.log(authInfo)
    if ("roles" in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles[0] === "ADMIN");
    }
  }, [authInfo]); 

  // 회원정보
  const userInfo = getUserInfo();
  
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
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
    setSelectedRow(undefined)
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }


  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    // console.log('params.searchStDate : ', params.searchStDate)
    // console.log('params.searchEdDate : ', params.searchEdDate)
    // console.log('params.taskSeCd : ', params.taskSeCd)
    // console.log('params.locgovCd : ', params.locgovCd)
    if(params.searchStDate && params.searchEdDate){
      fetchData()
    }
  }, [flag])


  

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    console.log(startDate)
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    // setFlag(!flag)

    // select item setting
    let noti: SelectItem[] = [

    ]
    let work: SelectItem[] = [
    
    ]
    let sear: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
    ]


    //구분
    getCodesByGroupNm("115").then((res) => {

    if (res) {
      res.map((code: any) => {
        let item: SelectItem = {
          label: code['cdKornNm'],
          value: code['cdNm'],
        }
        noti.push(item)
      })
    }
    setLeadCnCode(noti)
  })

  //업무구분
  getCodesByGroupNm("117").then((res) => {

    if (res) {
      res.map((code: any) => {
        let item: SelectItem = {
          label: code['cdKornNm'],
          value: code['cdNm'],
        }

        work.push(item)
      })
    }
    setWorkCode(work)
  })

  //검색
  getCodesByGroupNm("898").then((res) => {

    if (res) {


      res.map((code: any) => {
        let item: SelectItem = {
          label: code['cdKornNm'],
          value: code['cdNm'],
        }
        sear.push(item)
      })
    }
    setSear(sear)
  })


  // // 시도코드 
  // getCityCodes().then((res) => {
  //   let itemArr:SelectItem[] = [];
  //   if (res) {
  //     res.map((code: any) => {
  //       let item: SelectItem = {
  //         label: code['locgovNm'],
  //         value: code['ctpvCd'],
  //       }

  //       itemArr.push(item)
  //     })
  //   }
  //   setCtpvCdItems(itemArr);

  //   setParams((prev) => ({...prev, ctpvCd: itemArr[0].value})); // 첫번째 아이템으로 기본값 설정
  // })

  // // 관할관청
  // getLocalGovCodes().then((res) => {
  //   let itemArr:SelectItem[] = [];
  //   if (res) {
  //     res.map((code: any) => {
  //       let item: SelectItem = {
  //         label: code['locgovNm'],
  //         value: code['locgovCd'],
  //       }

  //       itemArr.push(item)
  //     })
  //   }
  //   setLocgovCdItems(itemArr)
  // })

  }, [])


  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // useEffect(() => { // 시도 코드 변경시 관할관청 재조회
  //   // 관할관청
  //   if(params.ctpvCd) {
  //     getLocalGovCodes(params.ctpvCd).then((res) => {
  //       let itemArr:SelectItem[] = [];
  //       if (res) {
  //         res.map((code: any) => {
  //           let item: SelectItem = {
  //             label: code['locgovNm'],
  //             value: code['locgovCd'],
  //           }
  
  //           itemArr.push(item)
  //         })
  //       }
  //       setLocgovCdItems(itemArr)
  //       setParams((prev) => ({...prev, locgovCd: itemArr[0].value}));
  //     })
  //   }
  // }, [params.ctpvCd])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/rr/getAllRtroactReq?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${params.searchStDate ? '&bgngRegDt=' + params.searchStDate.replaceAll('-','') : ''}` +
        `${params.searchEdDate ? '&endRegDt=' + params.searchEdDate.replaceAll('-','') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` + 
        `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
        `${params.rtroactDmndSeCd ? '&rtroactDmndSeCd=' + params.rtroactDmndSeCd : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
        `${params.rtroactDmndNm ? '&rtroactDmndNm=' + params.rtroactDmndNm : ''}` 
        // `${'&locgovUsrYn=' + (isLocgovCdAll ? 'Y' : 'N')}`+
        // `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` 

        // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것 


        const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber +1,
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


  // Fetch를 통해 데이터 갱신
  const fetchDetailData = async (row : Row) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/rr/getAllRtroactReq/` + row?.rtroactDmndTsid

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSelectedRow(response.data)
      
      } else {
        // 데이터가 없거나 실패
        console.log('선택된 데이터가 없습니다. ',response)

      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)

    } finally {
    }
  }



  // 페이지 이동 감지 시작 //

  const  handleDetailCloseModal= () => {
      setDetailModalFlag((prev) => false) 
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
  const handleRowClick = async (row: Row) => {
    //선택된 행을 담음
    //선택된 행에 대한 상세정보를 보여주는 모달을 띄움 
    await fetchDetailData(row)
    setDetailModalFlag(true)
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
    <PageContainer title="소급요청" description="소급요청">
      {/* breadcrumb */}
      <Breadcrumb title="소급요청" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        {/* {/* <Box>{authInfo.issas UserAuthInfo}</Box> */}
        <Box className="sch-filter-box"> 
        
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                등록일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                등록일자
              </CustomFormLabel>
              <CustomTextField type="date" value={params.searchStDate} onChange={handleSearchChange}
                  name="searchStDate"  id="ft-date-start" fullWidth />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              ></CustomFormLabel>
              ~<CustomTextField  value={params.searchEdDate} onChange={handleSearchChange}
                  name="searchEdDate" type="date" id="ft-date-end" fullWidth />
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
              <CustomFormLabel className="input-label-display" htmlFor="sch-taskSeCd">
                업무구분
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='801'
                pValue={params.taskSeCd}
                handleChange={handleSearchChange}
                pName='taskSeCd'
                htmlFor={'sch-taskSeCd'}
                addText='전체'
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">

          <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-rtroactDmndSeCd">
                소급요청구분
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='769'
                pValue={params.rtroactDmndSeCd}
                handleChange={handleSearchChange}
                pName='rtroactDmndSeCd'
                htmlFor={'sch-rtroactDmndSeCd'}
                addText='전체'
                width='200px'
              />
            </div>
            <div className="form-group" style={{ maxWidth:'20rem'}}>
              <CustomFormLabel className="input-label-display" htmlFor="sch-prcsSttsCd">
                처리상태
              </CustomFormLabel>
              <CommSelect                
                cdGroupNm='780'
                pValue={params.prcsSttsCd}
                handleChange={handleSearchChange}
                pName='prcsSttsCd'
                htmlFor={'sch-prcsSttsCd'}
                addText='전체'
                width='200px'
              />
            </div>
            <div className="form-group" >
              <CustomFormLabel className="input-label-display" htmlFor="ft-rtroactDmndNm">
                소급요청명
              </CustomFormLabel>
              <CustomTextField  
                    name="rtroactDmndNm"               
                    style={{ width: '100%' }}
                    value={params.rtroactDmndNm ?? ''}
                    onChange={handleSearchChange}  type="text" id="ft-rtroactDmndNm" fullWidth />
            </div>
    
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button  type='submit' variant="contained" color="primary" 
              onClick={()=>fetchData()}
            >
              검색
            </Button>
            {/* {authInfo && "roles" in authInfo && Array.isArray(authInfo.roles) && authInfo.roles[0] === "ADMIN" ? (
            <ModalContent
            reloadFunc={handleReload}
              size="lg"
              buttonLabel="등록"
              title="소급요청 등록"
            />
          ) : null} */}
           <ModalContent
            reloadFunc={handleReload}
              size="lg"
              buttonLabel="등록"
              title="소급요청 등록"
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption="소급요청 목록"
        />

        
        {/* 상세 모달 */}
        <div>
            {detailMoalFlag && selectedRow && (
                <ModifyDialog
                    size="lg"
                    title="소급요청"
                    reloadFunc={handleReload}
                    handleDetailCloseModal={handleDetailCloseModal}
                    selectedRow={selectedRow}
                    open={detailMoalFlag}
                >
                </ModifyDialog>
            )}
        </div>
      </Box>
      {/* 테이블영역 끝 */}

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
