'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { HeadCell, Pageable2 } from 'table'
import { getCtpvCd, getLocGovCd, getExcelFile } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import BsDetail from './_components/Detail'
import BsModifyModal from './_components/ModifyModal'
import { getToday, getDateRange, getForamtAddDay, getFormatToday } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { stndmheadCells } from '@/utils/fsms/headCells'

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
    to: '/stn/dm',
    title: '운전자관리',
  },
]

export interface Row {
  brno: string // 사업자번호
  locgovCd: string // 시도명 + 관할관청 코드
  locgovNm: string // 관할관청
  vhclNo: string // 차량번호
  flnm: string // 운전자명
  vonrNm: string // 차주명
  rrno: string // 운전자 주민등록번호(원본)
  rrnoSecure: string // 운전자 주민등록번호(별표)
  ctrtBgngYmd: string // 계약시작일
  ctrtEndYmd: string // 계약종료일
  fileId: string // 첨부파일아이디
  telno: string // 연락처
  rgtrId: string // 등록자아이디
  regDt: string // 등록일시
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일시
  koiCd: string // 유종코드
  koiCdNm: string // 유종명
  vhclTonCd: string // 톤수코드
  vhclTonCdNm: string // 톤수명
  CRNO: string // 법인등록번호(원본)
  crnoS: string // 법인등록번호(복호화)
  vonrRrno: string // 차주 주민등록번호(원본)
  vonrRrnoS: string // 차주 주민등록번호(복호화)
  rrnoS: string
  vonrRrnoSecure: string // 차주 주민등록번호(별표)
  lcnsTpbizCd: string // 업종코드
  vhclSeCd: string // 차량구분코드
  vhclRegYmd: string // 차량등록일자
  YRIDNW: string // 연식
  LEN: string // 길이
  BT: string // 너비
  maxLoadQty: string // 최대적재수량
  vhclSttsCd: string // 차량상태코드
  vonrBrno: string // 차주사업자등록번호
  vhclPsnCd: string // 차량소유코드
  delYn: string // 삭제여부
  dscntYn: string // 할인여부
  souSourcSeCd: string // 원천소스구분코드
  bscInfoChgYn: string // 기본정보변경여부
  locgovAprvYn: string // 지자체승인여부
  prcsSttsCd: string // 처리상태코드
  fileList: []
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BsPage = () => {
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 클릭로우

  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([]) // 시도 코드
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]) // 관할관청 코드
  const [ctrtCode, setCtrtCode] = useState<SelectItem[]>([]) // 계약기간 코드
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

  const ctrtCd: SelectItem[] = [
    {
      label: '전체',
      value: '',
    },
    {
      label: '유효',
      value: '01',
    },
    {
      label: '유효하지않음',
      value: '02',
    },
  ]

  useEffect(() => {
    if (flag != null) {
      // if (params.ctpvCd || params.locgovCd) {
      fetchData()
      //}
    }
  }, [flag])

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

    setCtrtCode(ctrtCd)
  }, [])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0])
      setSelectedRowIndex(0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    try {
      // if (!params.ctpvCd) {
      //   alert('시도명을 선택해주세요.')
      //   return
      // }

      // if (!params.locgovCd) {
      //   alert('관할관청을 선택해주세요.')
      //   return
      // }
      setSelectedRow(null)
      setLoading(true)
      setExcelFlag(true)

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/dm/tr/getAllDrverMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.flnm ? '&flnm=' + params.flnm : ''}` +
        `${params.ctrtCd ? '&ctrtCd=' + params.ctrtCd : ''}`

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

  // 운전자 정보를 삭제
  const deleteDriver = async () => {
    if (!selectedRow) {
      alert('선택된 운전자가 없습니다.')
      return
    }

    if(selectedRow?.regDt.replaceAll('-', '') !== getFormatToday().replaceAll('-','')){
      return
    }

    let endpoint: string = `/fsm/stn/dm/tr/deleteDrverMng`
    let body = {
      vhclNo: selectedRow.vhclNo,
      rrno: selectedRow.rrno,
      flnm: selectedRow.flnm,
      ctrtBgngYmd: selectedRow.ctrtBgngYmd,
    }

    const userConfirm = confirm('해당 정보를 삭제하시겠습니까?')
    if (!userConfirm) {
      return
    }
    if (userConfirm) {
      const response = await sendHttpRequest('DELETE', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert('삭제되었습니다')
        setRows([])
        fetchData()
      } else {
        alert(response.message)
      }
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
        `/fsm/stn/dm/tr/getExcelDrverMng?` +
        `${params.searchStDate ? '&bgngYmd=' + params.searchStDate : ''}` +
        `${params.searchEdDate ? '&endYmd=' + params.searchEdDate : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.ctrtCd ? '&ctrtCd=' + params.ctrtCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`

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
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedRowIndex(index ?? -1)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleClickModify = () => {
    if (!selectedRow) {
      alert('선택된 운전자정보가 없습니다.')
      return
    }
    setModalType('U')
    setOpen(true)
  }

  const handleClickDelete = () => {
    if (!selectedRow) {
      alert('선택된 운전자 정보 없습니다.')
      return
    }

    if(selectedRow?.regDt.replaceAll('-', '') !== getFormatToday().replaceAll('-','')){
      alert('오늘 등록한 운전자만 삭제가 가능합니다.');
      return
    }
    //삭제 요청 메서드를 호출
    deleteDriver()
  }

  return (
    <PageContainer title="운전자관리" description="운전자관리">
      {/* breadcrumb */}
      <Breadcrumb title="운전자관리" items={BCrumb} />
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
                  //onKeyDown={handleKeyDown}
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-flnm"
                >
                  운전자명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-flnm"
                  name="flnm"
                  value={params.flnm}
                  onChange={handleSearchChange}
                  // onKeyDown={handleKeyDown}
                  fullWidth
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-select-02"
                >
                  계약기간
                </CustomFormLabel>
                <select
                  id="ft-select-02"
                  className="custom-default-select"
                  name="ctrtCd"
                  value={params.ctrtCd}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  {ctrtCode.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Box>
          <Box className="table-bottom-button-group">
            <div className="button-right-align">
              <LoadingBackdrop open={loadingBackdrop} />
              <Button type="submit" variant="contained" color="primary">
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
                onClick={() => handleClickDelete()}
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

              <BsModifyModal
                open={open}
                row={selectedRow}
                handleClickClose={handleClickClose}
                type={modalType}
                reload={() => fetchData()}
              />
            </div>
          </Box>
        </Box>
        {/* 검색영역 끝 */}

        {/* 테이블영역 시작 */}
        <Box>
          <TableDataGrid
            headCells={stndmheadCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            selectedRowIndex={selectedRowIndex}
            caption={'화물-운전자관리 목록 조회'}
          />
        </Box>
        {/* 테이블영역 끝 */}
        {selectedRow && (
          <BlankCard className="contents-card" title="상세정보">
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '12px',
              }}
            >
              <BsDetail data={selectedRow} />
            </div>
          </BlankCard>
        )}
      </Box>
    </PageContainer>
  )
}

export default BsPage
