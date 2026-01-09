'use client'
import {
  Box,
  Button,
  FormControlLabel,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import {
  BlankCard,
  Breadcrumb,
  CustomRadio,
} from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'

import { HeadCell, Pageable2 } from 'table'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import FormModal from '@/app/components/popup/FormDialog'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '권한관리',
  },
  {
    to: '/sym/',
    title: '접근권한관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'ctpvNm',
    numeric: false,
    disablePadding: false,
    label: '시도',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체명',
  },
  {
    id: 'lgnId',
    numeric: false,
    disablePadding: false,
    label: '사용자ID',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'roleNm',
    numeric: false,
    disablePadding: false,
    label: '담당업무',
  },
  {
    id: 'ipAddr',
    numeric: false,
    disablePadding: false,
    label: '신청IP',
  },
  {
    id: 'telno',
    numeric: false,
    disablePadding: false,
    label: '연락처',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '생성일자',
    format: 'yyyymmdd',
  },
  {
    id: 'mdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '말소일자',
    format: 'yyyymmdd',
  },
]

const detailHeadCell: HeadCell[] = [
  {
    id: 'hstrySn',
    numeric: false,
    disablePadding: false,
    label: '번호',
    format: 'number',
  },
  {
    id: 'lgnId',
    numeric: false,
    disablePadding: false,
    label: '사용자ID',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'roleNm',
    numeric: false,
    disablePadding: false,
    label: '담당업무',
  },
  {
    id: 'ipAddr',
    numeric: false,
    disablePadding: false,
    label: '신청IP',
  },
  {
    id: 'chgRsnNm',
    numeric: false,
    disablePadding: false,
    label: '변경사유',
  },
  {
    id: 'mdfrId',
    numeric: false,
    disablePadding: false,
    label: '변경ID',
  },
  {
    id: 'mdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '변경일자',
    format: 'yyyymmdd',
  },
]

export interface Row {
  ctpvNm?: string // 시도명
  locgovNm?: string // 지자체명
  lgnId?: string // 사용자ID
  userNm?: string // 성명
  ipAddr?: string // 신청IP
  telno?: string // 연락처
  roleNm?: string // 담당업무
  regDt?: string // 생성일자
  mdfrId?: string // 변경ID
  mdfcnDt?: string // 말소일자 / 변경일자
  hstrySn?: string // 번호
  chgRsnNm?: string // 변경사유
  chgRsnCn?: string //
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
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 인덱스

  const [detailRows, setDetailRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [detailLoading, setDetailLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [modalOpen, setModalOpen] = useState(false) // 모달 오픈 여부

  const dateRange = getDateRange('d', 30)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
    prdSeCd: '1',
    excelType: '1',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) {
      setSelectedRow(undefined)
      setSelectedIndex(-1)
      setDetailRows([])
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0], 0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setExcelFlag(true)
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/aa/cm/getAllAccesAuthor?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
        `${params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${params.prdSeCd ? '&prdSeCd=' + params.prdSeCd : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

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
      setFlag(false)
    }
  }

  const fetchDetailData = async (lgnId: string) => {
    setExcelFlag(true)
    setDetailLoading(true)

    try {
      if (lgnId === '') {
        return
      }
      let endpoint: string = `/fsm/sym/aa/cm/getAllAccesAuthorHst?lgnId=${lgnId}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setDetailRows(response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDetailLoading(false)
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

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        `/fsm/sym/aa/cm/getExcelAccesAuthor?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
        `${params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${params.prdSeCd ? '&prdSeCd=' + params.prdSeCd : ''}` +
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

  const excelDownloadDetail = async () => {
    if (detailRows.length === 0) {
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
        `/fsm/sym/aa/cm/getExcelAccesAuthorHst?` +
        `${selectedRow?.lgnId ? '&lgnId=' + selectedRow.lgnId : ''}`

      await getExcelFile(endpoint, '접근권한관리상세_' + getToday() + '.xlsx')
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
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)

    await fetchDetailData(row.lgnId ?? '')
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name !== 'excelType') {
      setExcelFlag(false)
    }
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
    <PageContainer title="접근권한관리" description="접근권한관리">
      {/* breadcrumb */}
      <Breadcrumb title="접근권한관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
                required
              >
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pName="ctpvCd"
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
                required
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                pName="locgovCd"
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                ctpvCd={params.ctpvCd}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                ID
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-lgnId"
                name="lgnId"
                value={params.lgnId}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                성명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-userNm"
                name="userNm"
                value={params.userNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group" style={{ width: 'inherit' }}>
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <RadioGroup
                row
                id="radio-group-prdSeCd"
                name="prdSeCd"
                value={params.prdSeCd}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={
                    <CustomRadio id="prdSeCd_1" name="prdSeCd" value="1" />
                  }
                  label="생성일자"
                />
                <FormControlLabel
                  control={
                    <CustomRadio id="prdSeCd_2" name="prdSeCd" value="2" />
                  }
                  label="말소일자"
                />
              </RadioGroup>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기간 시작일
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
                기간 종료일
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
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
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
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>

      {selectedRow && selectedIndex > -1 ? (
        <Box>
          <BlankCard
            title="상세정보"
            buttons={[
              {
                label: '엑셀',
                color: 'success',
                onClick: () => excelDownloadDetail(),
              },
            ]}
          >
            <TableDataGrid
              headCells={detailHeadCell} // 테이블 헤더 값
              rows={detailRows} // 목록 데이터
              loading={detailLoading} // 로딩여부
            />
          </BlankCard>
        </Box>
      ) : (
        <></>
      )}

      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
