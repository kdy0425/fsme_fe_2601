'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

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
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import ModifyDialog from './_components/ModifyDialog'
import { Pageable2 } from 'table'
import { getDateRange } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '커뮤니티',
  },
  {
    to: '/sup/notice',
    title: '공지사항',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'bbscttSn',
    numeric: false,
    disablePadding: false,
    label: '번호',
  },
  {
    id: 'oriTtl',
    numeric: false,
    disablePadding: false,
    label: '제목',
  },
  {
    id: 'inqCnt',
    numeric: false,
    disablePadding: false,
    label: '조회',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '등록일',
    format: 'yyyymmdd',
  },
]

export interface CustomFile {
  atchSn?: string //첨부일련번호
  bbscttSn?: string //게시글일련번호
  fileSize?: string //파일용량
  lgcFileNm?: string //논리파일명
  mdfcnDt?: string //수정일시
  mdfrId?: string //수정자아이디
  physFileNm?: string // 물리파일명
  regDt?: string // 등록일시
  rgtrId?: string // 등록자아이디
}

export interface Row {
  bbsSn?: string // 게시판일련번호
  bbscttSn?: string // 게시글일련번호
  relateTaskSeCd?: string // 관련업무구분코드
  leadCnCd?: string // 머릿글내용코드    // 공지사항 코드임.
  inclLocgovCd?: string // 포함지자체코드
  locgovNm?: string // 포함지자체명
  userNm?: string // 작성자명
  userInfo?: string // 지자체명_작성자명
  oriTtl?: string // 게시글제목
  ttl?: string // 분류_게시글제목
  cn?: string // 게시글내용
  popupNtcYn?: string // 팝업공지여부
  popupBgngYmd?: string // 팝업시작일자
  popupEndYmd?: string // 팝업종료일자
  oriInqCnt?: number // 실제조회수
  fileCount?: string
  inqCnt?: number // 조회수
  useYn?: string // 사용여부
  ltrTrsmYn?: string // 문자전송여부
  ltrCn?: string // 문자내용
  ltrTtl?: string // 문자제목
  msgSendOrder?: string // 문자전송요청여부
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일시
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일시\
  //신규 등록시
  fileList?: [CustomFile] | [] // 첨부파일

  files?: [File] | []
}

const rowData: Row[] = []

// 목록 조회시 필요한 조건
type listSearchObj = {
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

  const [selectedRow, setSelectedRow] = useState<Row>() //선택된 Row를 담음
  const [detailMoalFlag, setDetailModalFlag] = useState(false)

  const [leadCnCode, setLeadCnCode] = useState<SelectItem[]>([]) //        공지구분 코드
  const [workCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드
  const [sear, setSear] = useState<SelectItem[]>([]) //          검색 구분 코드

  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean>(false) // 관리자여부
  const [isMinistry, setIsMinistry] = useState<boolean>(false) // 국토부 담당자여부

  useEffect(() => {
    // authInfo에서 roles의 권한 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles.includes('ADMIN'))
      setIsMinistry(authInfo.roles.includes('MOLIT'))
    }
  }, [authInfo])

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    search: allParams.search ?? 'ttl', // 검색종류
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? '', // 머리말
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
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
    if (params.searchStDate) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    //초기날짜 세팅
    const dateRange = getDateRange('d', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    // select item setting
    let noti: SelectItem[] = [
      {
        label: '[전체]',
        value: '',
      },
    ]
    let work: SelectItem[] = []
    let sear: SelectItem[] = [
      // {
      //   label: '전체',
      //   value: '',
      // },
    ]

    //공지구분
    getCodesByGroupNm('112').then((res) => {
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
    getCodesByGroupNm('117').then((res) => {
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
      setParams((prev) => ({ ...prev, work: work[0].value })) // 첫 페이지로 이동
    })

    //검색
    getCodesByGroupNm('898').then((res) => {
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
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/notice?page=${params.page}&size=${params.size}` +
        `${params.searchValue ? '&' + params.search + '=' + params.searchValue : ''}` +
        `${params.searchSelect ? '&leadCnCd=' + params.searchSelect : ''}` +
        `${params.searchStDate ? '&startRegDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endRegDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.work ? '&relateTaskSeCd=' + params.work : ''}`
      // `${'&locgovUsrYn=' + (isLocgovCdAll ? 'Y' : 'N')}`+
      // `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        setRows(
          response.data.content.map((row: Row) => {
            return {
              ...row,
              color: row.popupNtcYn === 'Y' ? 'orange' : 'black',
            }
          }),
        )
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

  // Fetch를 통해 데이터 갱신
  const fetchDetailData = async (row: Row) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sup/notice/` + row?.bbscttSn

      // 날짜, 공지구분, 업무구분, 검색종류, 검색어 확실해지면 입력할 것

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSelectedRow(response.data)
      } else {
        // 데이터가 없거나 실패
        console.log('선택된 데이터가 없습니다. ', response)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  // 페이지 이동 감지 시작 //

  const handleDetailCloseModal = () => {
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

  return (
    <PageContainer title="공지사항" description="공지사항">
      {/* breadcrumb */}
      <Breadcrumb title="공지사항" items={BCrumb} />
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
              <CustomTextField
                type="date"
                value={params.searchStDate}
                onChange={handleSearchChange}
                name="searchStDate"
                id="ft-date-start"
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              ></CustomFormLabel>
              ~
              <CustomTextField
                value={params.searchEdDate}
                onChange={handleSearchChange}
                name="searchEdDate"
                type="date"
                id="ft-date-end"
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-searchSelect"
              >
                공지구분
              </CustomFormLabel>
              <select
                id="ft-searchSelect"
                className="custom-default-select"
                value={params.searchSelect}
                name="searchSelect"
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {leadCnCode.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-work"
              >
                업무구분
              </CustomFormLabel>
              <select
                id="ft-work"
                className="custom-default-select"
                value={params.work ?? ''}
                name="work"
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {workCode.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-search"
              >
                검색
              </CustomFormLabel>
              <select
                id="ft-search"
                className="custom-default-select"
                value={params.search ?? ''}
                name="search"
                onChange={handleSearchChange}
                style={{ width: '150px' }}
              >
                {sear.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <CustomTextField
                name="searchValue"
                style={{ width: '450px' }}
                value={params.searchValue ?? ''}
                onChange={handleSearchChange}
                type="text"
                id="ft-vhclNo"
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => fetchData()}
            >
              검색
            </Button>
            {/* 관리자/운영자/국토부 권한 등록가능 */}
            { isAdmin || isMinistry  ? (
              <ModalContent
                reloadFunc={handleReload}
                size="lg"
                buttonLabel="등록"
                title="공지사항 등록"
              />
            ) : null}
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
          caption="테이블 리스트"
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
        />

        {/* 상세 모달 */}
        <div>
          {detailMoalFlag && selectedRow && (
            <ModifyDialog
              size="lg"
              title="공지사항"
              reloadFunc={handleReload}
              handleDetailCloseModal={handleDetailCloseModal}
              selectedRow={selectedRow}
              isAdmin={isAdmin}
              isMinistry={isMinistry}
              open={detailMoalFlag}
            ></ModifyDialog>
          )}
        </div>
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
