'use client'
import BlankCard from '@/app/components/shared/BlankCard'
import { Box, Button } from '@mui/material'
import React, { useCallback, useEffect, useState, ReactNode } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { getExcelFile } from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'

import { prdvHc, prdvDtHc } from '@/utils/fsms/headCells'

import { getDateRange, getToday } from '@/utils/fsms/common/dateUtils'
import CreateModal from './_components/CreateModal'
import { setBackgroundColor } from './_components/CreateModal'

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
    to: '/sup/prdv',
    title: '집행정보조회',
  },
]

interface Row {
  crtrYm: string //기준년월
  rmtAmtTotal: string //송금총액(원)
  userNm: string //등록자
  regDt: string //등록일자
}

export interface DetailRow {
  locgovCd: string //지역코드
  locgovNm: string //시군명
  prdvRt: string //안분율
  rmtAmt: string //안분액
  backgroundColor: string //배경색
  prdvRtErr: boolean //안분율 에러플래그
  rmtAmtErr: boolean //안분액 에러플래그
  prdvRtTag: ReactNode //안분율 표시용 태그
  rmtAmtTag: ReactNode //안분액 표시용 태그
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
}

const DataList = () => {

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngDt: '', // 시작일
    endDt: '', // 종료일
  })

  const [detailParams, setDetailParams] = useState({
    crtrYm: '',
  })

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null)
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const [detailRows, setDetailRows] = useState<DetailRow[]>([])
  const [detailTotalRows, setDetailTotalRows] = useState(0)
  const [detailLoading, setDetailLoading] = useState(false) // 로딩여부

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [openCreateModal, setOpenCreateModal] = useState(false) // 등록 모달

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
  const handleCloseModal = () => setOpenCreateModal(false)

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (searchFlag !== null) {
      fetchData()
    }
  }, [searchFlag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('m', 6)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    // 초기값은 세팅만 해주고, 검색은 하지 않음
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

  useEffect(() => {
    if (detailParams.crtrYm) {
      fetchDetailData()
    }
  }, [detailParams])

  // 날짜 유효성 검사
  const searchValidation = (): boolean => {
    if (!params.bgngDt) {
      alert('시작일자를 입력 해주세요')
    } else if (!params.endDt) {
      alert('종료일자를 입력 해주세요')
    } else if (params.bgngDt > params.endDt) {
      alert('시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
    } else {
      return true
    }
    return false
  }

  // 공통 데이터 초기화 함수
  const resetData = () => {
    setRows([])
    setTotalRows(0)
    setDetailRows([])
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setErrorMsg('')
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {

    setDetailParams((prev) => ({
      ...prev,
      crtrYm: row.crtrYm.replace(/-/g, ''),
    }))
    setSelectedRowIndex(index ?? -1)
  }, [])

  // 재조회
  const reload = (): void => {
    resetData()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 조회클릭시
  const handleAdvancedSearch = (event?: React.FormEvent) => {
    if (event) event.preventDefault()
    setSearchFlag((prev) => !prev)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if (!searchValidation()) return
    resetData()

    setSelectedRowIndex(-1)
    setLoading(true)
    setErrorMsg('')
    try {

      const searchObj: listSearchObj = {
        ...params,
        bgngDt: params.bgngDt.replace(/-/g, ''),
        endDt: params.endDt.replace(/-/g, ''),
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sup/prdv/getAllRmtAmt` + toQueryParameter(searchObj)

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data.content.length) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setErrorMsg('')
        handleRowClick(response.data.content[0], 0)
      }
    } catch (error) {
      setErrorMsg('데이터 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const excelDownload = async () => {

    if (!excelFlag) {
      alert('검색 후 다운로드가 가능합니다.')
      return
    }

    let endpoint: string =
      `/fsm/sup/prdv/getRmtAmtDtlExcel` + toQueryParameter(detailParams)

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      let endpoint =
        `/fsm/sup/prdv/getAllRmtAmtDtl` + toQueryParameter(detailParams)

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data.length) {
        const rawData: DetailRow[] = response.data

        // 배경색 설정 함수 사용
        const temp = setBackgroundColor(rawData)

        // 데이터 조회 성공시
        setDetailRows(temp)

      }
    } catch (error) {
      console.error('데이터 조회 중 오류:', error)
    } finally {
      setDetailLoading(false)
      setExcelFlag(true)
    }
  }

  const deletePrdvData = async (): Promise<void> => {

    if (selectedRowIndex === -1) {
      alert('선택된 행이 없습니다.')
      return
    }

    if (confirm('삭제 하시겠습니까?')) {
      setLoadingBackdrop(true)
      try {
        let endpoint =
          `/fsm/sup/prdv/deleteRmtAmt` + toQueryParameter(detailParams)

        const response = await sendHttpRequest('DELETE', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert('삭제 되었습니다.')
          reload()
        } else {
          alert(response.message)
        }
      } catch (error) {
        setErrorMsg('삭제 중 오류가 발생했습니다.');
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <PageContainer title="집행정보조회" description="집행정보조회">
      {/* breadcrumb */}
      <Breadcrumb title="집행정보조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                기준년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기준년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                기준년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenCreateModal(true)}
            >
              등록
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={deletePrdvData}
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
        <BlankCard
          className="contents-card"
          title="집행정보"
        >
          <TableDataGrid
            headCells={prdvHc} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            selectedRowIndex={selectedRowIndex}
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            caption={'집행정보 목록'}
          />
        </BlankCard>

        {detailRows && detailRows.length > 0 && (
          <BlankCard
            className="contents-card"
            title="집행정보 상세"
          >
            <TableDataGrid
              headCells={prdvDtHc}
              rows={detailRows}
              loading={detailLoading}
              caption={'집행정보 상세 목록'}
            />
          </BlankCard>
        )}
      </Box>
      {/* 테이블영역 끝 */}

      <>
        {/* 로딩 */}
        {loadingBackdrop && (
          <LoadingBackdrop open={loadingBackdrop} />
        )}

        {openCreateModal && (
          <CreateModal
            onClose={handleCloseModal}
            reload={reload}
          />
        )}
      </>
    </PageContainer>
  )
}

export default DataList
