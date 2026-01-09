'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { toQueryString } from '@/utils/fsms/utils'

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
import {
  apvDddHC,
  apvDddVhclHC,
  apvLdDtTrHC,
  apvLdDtTxHC,
  apvLdDtBsHC,
} from '@/utils/fsms/headCells'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'

import { getUserInfo } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '통합거래정보',
  },
  {
    to: '/apv/ddd',
    title: '일별거래내역',
  },
]

export interface Row {
  taskSeNm: string //구분
  dlngYmd: string //거래일
  locgovNm: string //지자체명
  brno: string //사업자번호
  vhclNo: string //차량번호
  bzentyNm: string //업체명
  asstAmtLiter: string //보조량
  ftxAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  asstAmt: string //유가보조금합계
  taskSeCd: string //업무구분코드
  locgovCd: string //관할관청코드
}

export interface DetailRow {
  cnptSeNm: string //거래방법
  dlngSeNm: string //거래구분
  dlngDt: string //거래일시
  vhclNo: string //차량번호
  brno: string //사업자번호
  bzentyNm: string //업체(차주명)
  koiNm: string //유종코드
  vhclTonNm: string //톤수
  bzmnSeNm: string //개인/법인
  vhclSeNm: string //면허업종
  aprvAmt: string //승인금액
  fuelQty: string //사용량
  asstAmtLiter: string //보조량
  asstAmt: string //유가보조금
  ftxAsstAmt: string //유류세연동보조금
  opisAmt: string //유가연동보조금
  frcsNm: string //가맹점명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [detailRows, setDetailRows] = useState<DetailRow[]>()
  const [detailTotalRows, setDetailTotalRows] = useState(0)
  const [detailLoading, setDetailLoading] = useState(false) // 로딩여부

  const [vhclFalg, setVhclFlag] = useState<boolean>(false) //차량번호플래그

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [detailParams, setDetailParams] = useState({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    taskSeCd: '',
    locgovCd: '',
    dlngYmd: '',
    vhclNo: '',
    brno: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })
  //
  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) fetchData()
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
  }, [])

  useEffect(() => {
    //상세내역 조회
    if (detailParams.locgovCd) {
      fetchDetailData()
    }
  }, [detailParams])

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
    setVhclFlag(false)
    if (params.vhclNo) {
      setVhclFlag(true)
    }
    try {
      if (userInfo.roles[0] == 'LOGV') {
        // 지자체 권한일때만 시도 및 관할관청 체크
        if (!params.ctpvCd) {
          alert('시도명을 선택해주세요.')
          return
        }

        if (!params.locgovCd) {
          alert('관할관청을 선택해주세요.')
          return
        }
      }

      if (!params.searchStDate || !params.searchEdDate) {
        alert('거래일자를 입력해주세요.')
        return
      }

      if (!params.brno && !params.vhclNo) {
        alert('사업자등록번호 또는 차량번호를 입력해주세요.')
        return
      }
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/ddd/cm/getAllDalyDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&dlngBgngYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&dlngEndYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
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
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setDetailRows([])
      setDetailTotalRows(0)
      setLoading(false)
      setFlag(false)
    }
  }

  const userInfo = getUserInfo()

  const excelDownload = async () => {
    if (userInfo.roles[0] == 'LOGV') {
      // 지자체 권한일때만 시도 및 관할관청 체크
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }
    }

    if (!params.searchStDate || !params.searchEdDate) {
      alert('거래일자를 입력해주세요.')
      return
    }

    if (!params.brno && !params.vhclNo) {
      alert('사업자등록번호 또는 차량번호를 입력해주세요.')
      return
    }
    let endpoint: string =
      `/fsm/apv/ddd/cm/getExcelDalyDelngDtls?` +
      `${params.searchStDate ? '&dlngBgngYmd=' + params.searchStDate : ''}` +
      `${params.searchEdDate ? '&dlngEndYmd=' + params.searchEdDate : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.taskSeCd ? '&taskSeCd=' + params.taskSeCd : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
  }

  const fetchDetailData = async () => {
    setDetailLoading(true)
    try {
      let endpoint =
        `/fsm/apv/ddd/cm/getAllDelngDtls?page=${detailParams.page}&size=${detailParams.size}` +
        `${detailParams.taskSeCd ? '&taskSeCd=' + detailParams.taskSeCd : ''}` +
        `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}` +
        `${detailParams.dlngYmd ? '&dlngYmd=' + detailParams.dlngYmd : ''}` +
        `${detailParams.vhclNo ? '&vhclNo=' + detailParams.vhclNo : ''}` +
        `${detailParams.brno ? '&brno=' + detailParams.brno : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setDetailRows([])
        setDetailTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      setDetailRows([])
      setDetailTotalRows(0)
      setDetailPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const detailExcelDownload = async () => {
    let endpoint: string =
      `/fsm/apv/ddd/cm/getExcelDelngDtls?` +
      `${detailParams.taskSeCd ? '&taskSeCd=' + detailParams.taskSeCd : ''}` +
      `${detailParams.locgovCd ? '&locgovCd=' + detailParams.locgovCd : ''}` +
      `${detailParams.dlngYmd ? '&dlngYmd=' + detailParams.dlngYmd : ''}` +
      `${detailParams.vhclNo ? '&vhclNo=' + detailParams.vhclNo : ''}` +
      `${detailParams.brno ? '&brno=' + detailParams.brno : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}`

await  getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '상세내역_' + getToday() + '.xlsx',
    )
  }
  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag(true)
    },
    [],
  )

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const detailhandlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setDetailParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setDetailParams((prev) => ({
      ...prev,
      page: 1,
      taskSeCd: row.taskSeCd ? row.taskSeCd : '',
      locgovCd: row.locgovCd ? row.locgovCd : '',
      dlngYmd: row.dlngYmd ? row.dlngYmd : '',
      vhclNo: row.vhclNo ? row.vhclNo : '',
      brno: row.brno ? row.brno : '',
    }))
    setSelectedRowIndex(index ?? -1)
  }, [])
  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <PageContainer title="일별거래내역" description="일별거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="일별거래내역" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{
                  max: getFormatToday,
                }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래일자 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                  max: getFormatToday(),
                }}
                fullWidth
              />
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

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-taskSeCd"
              >
                업무구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="096"
                pValue={params.taskSeCd}
                handleChange={handleSearchChange}
                pName="taskSeCd"
                htmlFor={'sch-taskSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-vhclNo" required>
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="sch-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-brno" required>
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="sch-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="599"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
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
          headCells={vhclFalg ? apvDddVhclHC : apvDddHC} // 테이블 헤더 값
          selectedRowIndex={selectedRowIndex}
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"일별거래내역 조회 목록"}
        />

        {detailRows && detailRows.length > 0 && (
          <BlankCard
            className="contents-card"
            title="상세 거래내역"
            buttons={[
              {
                label: '엑셀',
                color: 'success',
                onClick: () => detailExcelDownload(),
              },
            ]}
          >
            <TableDataGrid
              headCells={
                detailParams.taskSeCd == 'TR'
                  ? apvLdDtTrHC
                  : detailParams.taskSeCd == 'TX'
                    ? apvLdDtTxHC
                    : apvLdDtBsHC
              }
              rows={detailRows}
              totalRows={detailTotalRows}
              loading={detailLoading}
              onPaginationModelChange={detailhandlePaginationModelChange}
              pageable={detailPageable}
              caption={"상세 거래내역 조회 목록"}
            />
          </BlankCard>
        )}
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
