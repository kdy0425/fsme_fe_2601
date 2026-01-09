'use client'
import { Box, Button, Grid } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import {
  sendHttpRequest,
  sendFormDataWithJwt,
} from '@/utils/fsms/common/apiUtils'
import { useMessageActions } from '@/store/MessageContext'

// components
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { ApiResponse, ApiError, getCombinedErrorMessage } from '@/types/message'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import DetailDataGrid from './_components/DetailDataGrid'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '유류구매카드관리',
  },
  {
    title: 'RFID태그관리',
  },
  {
    to: '/cad/rtrm',
    title: 'RFID태그요청관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '접수일자',
    format: 'yyyymmdd',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'telno',
    numeric: false,
    disablePadding: false,
    label: '연락처',
    format: 'telno',
  },
  {
    id: 'prcsSttsNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
  },
]

export interface Row {
  rcptYmd?: string
  rcptSeqNo?: string
  locgovCd?: string
  locgovNm?: string
  vhclNo?: string
  crno?: string
  crnoEncpt?: string
  koiCd?: string
  koiNm?: string
  vhclTonCd?: string
  vhclTonNm?: string
  lcnsTpbizCd?: string
  lcnsTpbizNm?: string
  vonrNm?: string
  vonrRrno?: string
  vonrRrnoSc?: string
  vonrBrno?: string
  bzmnSeCd?: string
  bzmnSeNm?: string
  bzentyNm?: string
  rprsvNm?: string
  idntyYmd?: string
  flRsnCn?: string
  prcsSttsCd?: string
  prcsSttsNm?: string
  delYn?: string
  rgtrId?: string
  regDt?: string
  mdfrId?: string
  mdfcnDt?: string
  rfidTagId?: string
  telno?: string
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

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 엑셀 플래그 설정정

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const [isModalOn, setIsModalOn] = useState(false)
  const [isDetailOn, setIsDetailOn] = useState(false)
  const [body, setBody] = useState<any>()
  const { setMessage } = useMessageActions()

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

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (searchFlag != null) {
      fetchData()
    }
  }, [searchFlag])

  // 초기 데이터 로드
  useEffect(() => {
    setSearchFlag(false)

    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setLoading(true)

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cad/rtrm/tr/getAllRfidTagRequstMng?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&startRcvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endRcvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

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
      setExcelFlag(true)
    }
  }

  const handleDataFromChildren = (childData: any) => {
    setBody({
      rcptSeqNo: childData.rcptSeqNo ? childData.rcptSeqNo : '',
      vhclNo: childData.vhclNo,
      vonrNm: childData.vonrNm,
      vonrRrno: childData.vonrRrno,
      crno: childData.crno, // 법인등록번호
      locgovCd: childData.locgovCd,
      koiCd: childData.koiCd,
      vhclTonCd: childData.vhclTonCd,
      vonrBrno: childData.vonrBrno,
      bzentyNm: childData.bzentyNm,
      rprsvNm: childData.rprsvNm,
      lcnsTpbizCd: childData.lcnsTpbizCd,
      bzmnSeCd: childData.bzmnSeCd,
      crnoEncpt: childData.crnoEncpt,
      telNo: childData.telno,
      rfidTagId: childData.rfidTagId,
      prcsSttsCd: childData.prcsSttsCd,
    })
  }

  const reqData = async (body: any, row: Row | undefined) => {
    const formData = new FormData()

    if (!body?.vhclNo) {
      alert('자량번호를 입력해야 합니다.')
      return
    }
    if (!body?.vonrNm) {
      alert('소유자명을 입력해야 합니다.')
      return
    }
    if (!body?.crno) {
      alert('주민사업자번호를 입력해야 합니다.')
      return
    }
    if (!body?.vonrRrno) {
      alert('주민등록번호를 입력해야 합니다.')
      return
    }
    if (!body?.locgovCd) {
      alert('관할관청을 선택해야 합니다.')
      return
    }
    if (!body?.koiCd) {
      alert('유종을 선택해야 합니다.')
      return
    }
    if (!body?.vhclTonCd) {
      alert('톤수를 선택해야 합니다.')
      return
    }
    if (!body?.vonrBrno) {
      alert('사업자등록번호를 입력해야 합니다.')
      return
    }
    if (!body?.bzentyNm) {
      alert('업체명을 입력해야 합니다.')
      return
    }
    if (!body?.rprsvNm) {
      alert('대표자명을 입력해야 합니다.')
      return
    }
    if (!body?.lcnsTpbizCd) {
      alert('면허업종구분을 선택해야 합니다.')
      return
    }
    if (!body?.bzmnSeCd) {
      alert('사업자구분을 선택해야 합니다.')
      return
    }
    if (!body?.crnoEncpt) {
      alert('법인등록번호를 입력해야 합니다.')
      return
    }
    if (!body?.prcsSttsCd) {
      alert('처리상태를 선택해야 합니다.')
      return
    }
    if (!body?.rfidTagId) {
      alert('RFID태그ID를 입력해야 합니다.')
      return
    }

    let endpoint: string = ''

    if (selectedRow) {
      endpoint = '/fsm/cad/rtrm/tr/updateRfidTagRequstMng'
    } else {
      endpoint = '/fsm/cad/rtrm/tr/createRfidTagRequstMng'
    }
    if (body != null) {
      formData.append('rcptSeqNo', body?.rcptSeqNo as string)
      // if (!selectedRow) {
      //   formData.append('vhclNo', body?.vhclNo as string) // 차량번호
      //   formData.append('vonrNm', body?.vonrNm as string) // 소유자명
      //   formData.append('vonrRrno', body?.vonrRrno as string) // 주민등록번호
      //   formData.append('crno', body?.crno as string) // 주민사업번호
      //   formData.append('locgovCd', body?.locgovCd as string) // 관할관청
      // }
      formData.append('vhclNo', body?.vhclNo as string) // 차량번호
      formData.append('vonrNm', body?.vonrNm as string) // 소유자명
      formData.append('vonrRrno', body?.vonrRrno as string) // 주민등록번호
      formData.append('crno', body?.crno as string) // 주민사업번호
      formData.append('locgovCd', body?.locgovCd as string) // 관할관청
      formData.append('koiCd', body?.koiCd as string) // 유종
      formData.append('vhclTonCd', body?.vhclTonCd as string) // 톤수
      formData.append('vonrBrno', body?.vonrBrno as string) // 주민사업번호
      formData.append('bzentyNm', body?.bzentyNm as string) // 업체명
      formData.append('rprsvNm', body?.rprsvNm as string) // 대표자명
      formData.append('lcnsTpbizCd', body?.lcnsTpbizCd as string) // 면허업종구분
      formData.append('bzmnSeCd', body?.bzmnSeCd as string) // 사업자구분
      formData.append('crnoEncpt', body?.crnoEncpt as string) // 법인등록번호
      formData.append('telno', body?.telNo as string) // 전화번호
      formData.append('rfidTagId', body?.rfidTagId as string) // 태그명
      formData.append('prcsSttsCd', body?.prcsSttsCd as string) // 처리상태

      try {
        const postResponseData: ApiResponse = await sendFormDataWithJwt(
          selectedRow == undefined || selectedRow == null ? 'POST' : 'PUT',
          endpoint,
          formData,
          true,
        )
        setMessage({
          resultType: postResponseData.resultType,
          status: postResponseData.status,
          message: postResponseData.message,
        })

        remoteModal(false)
        setSearchFlag((prev) => !prev)
      } catch (error) {
        if (error instanceof ApiError) {
          switch (error.resultType) {
            case 'fail':
              //유효성검사 오류
              setMessage({
                resultType: 'error',
                status: error.status,
                message: getCombinedErrorMessage(error),
              })
              break
            case 'error':
              // 'error'는 서버 측 오류
              setMessage({
                resultType: 'error',
                status: error.status,
                message: error.message,
              })
              break
          }
        }
      }
    }
  }

  const removeData = async (row: Row | undefined) => {
    if (row == undefined) {
      alert('삭제할 태그요청을 선택해주세요.')
      return
    }

    const formData = new FormData()
    const endpoint: string = `/fsm/cad/rtrm/tr/deleteRfidTagRequstMng`

    const userConfirm = confirm('해당 태그요청건을 삭제하시겠습니까?')
    if (userConfirm) {
      if (row != undefined) {
        formData.append('rcptSeqNo', row?.rcptSeqNo as string)

        try {
          const postResponseData: ApiResponse = await sendFormDataWithJwt(
            'DELETE',
            endpoint,
            formData,
            true,
          )
          setMessage({
            resultType: postResponseData.resultType,
            status: postResponseData.status,
            message: postResponseData.message,
          })

          setSearchFlag((prev) => !prev)
        } catch (error) {
          if (error instanceof ApiError) {
            switch (error.resultType) {
              case 'fail':
                //유효성검사 오류
                setMessage({
                  resultType: 'error',
                  status: error.status,
                  message: getCombinedErrorMessage(error),
                })
                break
              case 'error':
                // 'error'는 서버 측 오류
                setMessage({
                  resultType: 'error',
                  status: error.status,
                  message: error.message,
                })
                break
            }
          }
        }
      }
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    let endpoint: string =
      `/fsm/cad/rtrm/tr/getExcelRfidTagRequstMng?` +
      `${params.searchStDate ? '&startRcvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endRcvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setSearchFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setSearchFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)

    if (selectedIndex === index) {
      setIsDetailOn(!isDetailOn)

      // 같은 행을 두번 선택할 경우 그냥 비운다.
      setSelectedRow(undefined)
      setSelectedIndex(-1)
    } else {
      setIsDetailOn(true)
    }
  }

  const remoteModal = (flag: boolean) => {
    if (flag) {
      setIsModalOn(true)
    } else {
      setIsModalOn(false)
    }
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
    setExcelFlag(false)
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
    <PageContainer title="RFID태그요청관리" description="RFID태그요청관리">
      {/* breadcrumb */}
      <Breadcrumb title="RFID태그요청관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기간 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료일
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
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <FormDialog
              formId={selectedRow != null && selectedRow != undefined
                ? 'update'
                : 'insert'}
              size={'xl'}
              buttonLabel={
                selectedRow != null && selectedRow != undefined
                  ? '수정'
                  : '등록'
              }
              submitBtn={false}
              remoteFlag={isModalOn}
              openHandler={() => {
                remoteModal(true)
              }}
              closeHandler={() => {
                remoteModal(false)
              }}
              btnSet={
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => reqData(body, selectedRow)}
                >
                  저장
                </Button>
              }
              title={
                selectedRow != null && selectedRow != undefined
                  ? 'RFID태그요청수정'
                  : 'RFID태그요청등록'
              }
              children={
                selectedRow != null && selectedRow != undefined ? (
                  <ModalContent
                    vhclNo={selectedRow?.vhclNo}
                    handleDataToParent={handleDataFromChildren}
                  />
                ) : (
                  <ModalContent handleDataToParent={handleDataFromChildren} 
                  isModalOn={isModalOn}/>
                )
              }
            />
            <Button
              onClick={() => removeData(selectedRow)}
              variant="contained"
              color="error"
            >
              삭제
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
          caption={"RFID태그요청관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <Box style={{ display: isDetailOn ? 'block' : 'none' }}>
        {!loading && rows.length > 0 && selectedIndex >= 0 ? (
          <Grid item xs={4} sm={4} md={4}>
            <DetailDataGrid detail={rows[selectedIndex]} />
          </Grid>
        ) : (
          ''
        )}
      </Box>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default DataList
