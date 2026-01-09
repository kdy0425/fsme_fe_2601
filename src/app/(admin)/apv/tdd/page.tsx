'use client'
import { Box, Button } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  getDateRange,
  getExcelFile,
  getToday,
  isNumber,
} from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'
import { toQueryParameter } from '@/utils/fsms/utils'
import { diffYYYYMMDD } from '@/utils/fsms/common/util'
import { apvTddTxHC, apvTddTxDetailHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '택시거래정보',
  },
  {
    to: '/apv/tdd',
    title: '거래내역',
  },
]

export interface Row {
  /* 법인 업체정보 */
  bzentyNm: string
  brno: string
  rprsvNm: string
  rprsvRrnoS: string

  /* 상세 거래내역 */
  cardNo: string
  trauYmd: string
  dlngTm: string
  dailUseAcmlNmtm: string
  vhclNo: string
  frcsNm: string
  frcsBrno: string
  literAcctoUntprc: string
  useLiter: string
  moliatUseLiter: string
  aprvAmt: string
  moliatAsstAmt: string
  rtrcnDlngDt: string
  vhclPorgnUntprc: string
  opisAmt: string
  literAcctoOpisAmt: string
  exsMoliatAsstAmt: string
  crdcoNm: string
  dlngSeNm: string
  literAcctoUntprcSeNm: string
  koiNm: string
  koiUnitNm: string
  aprvRspnsNm: string
  frcsLocgovNm: string
  pid: string
  pbillAmt: string
  ctpvCd: string
  locgovCd: string
  koiCd: string
}

// 법인 업체정보 목록 조회시 필요한 조건
interface listSearchObj {
  page: number
  size: number
  bzentyNm: string
  brno: string
  koiCd: string
  ctpvCd: string
  locgovCd: string
  vhclNo: string
}

// 법인 업체정보 목록 조회시 필요한 조건
interface detailListSearchObj {
  page: number
  size: number
  crdcoCd: string
  bgngDt: string
  endDt: string
  dlngSeCd: string
  frcsNm: string
}

const DataList = () => {
  /* 법인 업체정보 */
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bzentyNm: '',
    brno: '',
    koiCd: '',
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
  })

  /* 상세 거래내역 */
  const [detailFlag, setDetailFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [detailRows, setDetailRows] = useState<Row[]>([]) // 가져온 로우 디테일 데이터
  const [detailTotalRows, setDetailTotalRows] = useState(0) // 총 수
  const [DetailLoading, setDetailLoading] = useState(false) //
  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })
  const [detailParams, setDetailParams] = useState<detailListSearchObj>({
    page: 1,
    size: 10,
    crdcoCd: '',
    bgngDt: getDateRange('sm', 0).startDate,
    endDt: getDateRange('sm', 0).endDate,
    dlngSeCd: '',
    frcsNm: '',
  })

  /* 공통 */
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 플래그를 통한 데이터 갱신
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (detailFlag != null) {
      fetchDetailData()
    }
  }, [detailFlag])

  const resetData = () => {
    setSelectedIndex(-1)
    setSelectedRow(null)
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  const resetDetailData = () => {
    setDetailRows([])
    setDetailTotalRows(0)
    setDetailPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  const validation = () => {
    if (!params.ctpvCd) {
      alert('시도명을 선택 해주세요')
    } else if (!params.locgovCd) {
      alert('관할관청을 선택 해주세요')
    } else if (!detailParams.bgngDt) {
      alert('거래시작일자를 입력 해주세요')
    } else if (!detailParams.endDt) {
      alert('거래종료일자를 입력 해주세요')
    } else if (detailParams.bgngDt > detailParams.endDt) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
      return
    } else if (
      detailParams.bgngDt.replaceAll('-', '') <= '20191231' &&
      detailParams.endDt.replaceAll('-', '') >= '20200101'
    ) {
      alert('2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.')
      return
    } else {
      if (!params.vhclNo) {
        if (diffYYYYMMDD(detailParams.endDt, detailParams.bgngDt, 1)) {
          return true
        }
      } else {
        if (diffYYYYMMDD(detailParams.endDt, detailParams.bgngDt, 6)) {
          return true
        }
      }
    }

    return false
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (validation()) {
      resetData()
      resetDetailData()
      setLoading(true)
      setExcelFlag(true)

      try {
        // 검색 조건에 맞는 endpoint 생성
        const endpoint: string =
          '/fsm/apv/tdd/tx/getAllTaxiBzentyDtls' + toQueryParameter(params)
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length !== 0
        ) {
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          handleRowClick(response.data.content[0], 0)
        }
      } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  // 상세 정보 fetch
  const fetchDetailData = async () => {
    if (validation()) {
      resetDetailData()
      setDetailLoading(true)

      try {
        const searchObj = {
          ...detailParams,
          bgngDt: detailParams.bgngDt.replaceAll('-', ''),
          endDt: detailParams.endDt.replaceAll('-', ''),
          bzentyNm: selectedRow?.bzentyNm,
          brno: selectedRow?.brno,
          koiCd: selectedRow?.koiCd,
          ctpvCd: selectedRow?.ctpvCd,
          locgovCd: selectedRow?.locgovCd,
          vhclNo: selectedRow?.vhclNo,
        }

        // 검색 조건에 맞는 endpoint 생성
        const endpoint: string =
          '/fsm/apv/tdd/tx/getAllTaxiDelngDtls' + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length !== 0
        ) {
          // 데이터 조회 성공시
          setDetailRows(response.data.content)
          setDetailTotalRows(response.data.totalElements)
          setDetailPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
        }
      } catch (error) {
        // 에러시
        console.error('Error fetching Details data:', error)
      } finally {
        setDetailLoading(false)
      }
    }
  }

  const excelDownload = async () => {
    if (
      detailParams.bgngDt.replaceAll('-', '') <= '20191231' &&
      detailParams.endDt.replaceAll('-', '') >= '20200101'
    ) {
      alert('2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.')
      return
    }

    if (detailParams.bgngDt > detailParams.endDt) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
      return
    }

    if (selectedIndex === -1) {
      alert('업체정보가 조회되지 않았습니다.')
      return
    }

    if (detailRows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      const searchObj = {
        ...detailParams,
        bgngDt: detailParams.bgngDt.replaceAll('-', ''),
        endDt: detailParams.endDt.replaceAll('-', ''),
        bzentyNm: selectedRow?.bzentyNm,
        brno: selectedRow?.brno,
        koiCd: selectedRow?.koiCd,
        ctpvCd: selectedRow?.ctpvCd,
        locgovCd: selectedRow?.locgovCd,
        vhclNo: selectedRow?.vhclNo,
      }

      const endpoint: string =
        '/fsm/apv/tdd/tx/getExcelTaxiDelngDtls' + toQueryParameter(searchObj)
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

  // 조회
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  // 상단 업체정보 페이징
  const handlePaginationModelChange1 = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 하단 거래정보 페이징
  const handlePaginationModelChange2 = useCallback(
    (page: number, pageSize: number) => {
      setDetailParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setDetailFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(row)
    setDetailParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setDetailFlag((prev) => !prev)
  }, [])

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target

    if (
      name === 'bzentyNm' ||
      name === 'brno' ||
      name === 'koiCd' ||
      name === 'ctpvCd' ||
      name === 'locgovCd' ||
      name === 'vhclNo'
    ) {
      if (name === 'brno') {
        if (isNumber(value)) {
          setParams((prev) => ({ ...prev, [name]: value }))
        }
      } else {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setDetailParams((prev) => ({ ...prev, [name]: value }))
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

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer title="택시거래내역" description="택시거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="택시거래내역" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="form-list">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-ctpvCd"
                  className="input-label-display"
                  required
                >
                  시도명
                </CustomFormLabel>
                <CtpvSelect
                  pName="ctpvCd"
                  pValue={params.ctpvCd}
                  handleChange={handleSearchChange}
                  htmlFor={'sch-ctpvCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-locgovCd"
                  className="input-label-display"
                  required
                >
                  관할관청
                </CustomFormLabel>
                <LocgovSelect
                  pName="locgovCd"
                  pValue={params.locgovCd}
                  handleChange={handleSearchChange}
                  ctpvCd={params.ctpvCd}
                  htmlFor={'sch-locgovCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  거래일자
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  시작일
                </CustomFormLabel>
                <CustomTextField
                  value={detailParams.bgngDt}
                  onChange={handleSearchChange}
                  name="bgngDt"
                  type="date"
                  id="ft-date-start"
                  fullWidth
                />

                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  종료일
                </CustomFormLabel>
                <CustomTextField
                  value={detailParams.endDt}
                  name="endDt"
                  onChange={handleSearchChange}
                  type="date"
                  id="ft-date-end"
                  fullWidth
                />
              </div>
            </div>
            <hr></hr>

            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="ft-vhclNo"
                  className="input-label-display"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  placeholder=""
                  fullWidth
                  id="ft-vhclNo"
                  name="vhclNo"
                  value={params.vhclNo}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="ft-brno"
                  className="input-label-display"
                >
                  사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  placeholder=""
                  fullWidth
                  id="ft-brno"
                  name="brno"
                  value={params.brno}
                  onChange={handleSearchChange}
                  inputProps={{
                    maxLength: 12,
                  }}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-dlngSeCd"
                  className="input-label-display"
                >
                  거래구분
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'DLNG'}
                  pValue={detailParams.dlngSeCd}
                  handleChange={handleSearchChange}
                  pName={'dlngSeCd'}
                  addText="전체"
                  htmlFor={'sch-dlngSeCd'}
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-crdcoCd"
                  className="input-label-display"
                >
                  카드사명
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'CCGC'}
                  pValue={detailParams.crdcoCd}
                  handleChange={handleSearchChange}
                  pName={'crdcoCd'}
                  addText="전체"
                  htmlFor={'sch-crdcoCd'}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="ft-bzentyNm"
                  className="input-label-display"
                >
                  업체명
                </CustomFormLabel>
                <CustomTextField
                  placeholder=""
                  id="ft-bzentyNm"
                  name="bzentyNm"
                  value={params.bzentyNm}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="ft-frcsNm"
                  className="input-label-display"
                >
                  가맹점명
                </CustomFormLabel>
                <CustomTextField
                  placeholder=""
                  fullWidth
                  id="ft-frcsNm"
                  name="frcsNm"
                  value={detailParams.frcsNm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-koiCd"
                  className="input-label-display"
                >
                  유종
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm={'KOI3'}
                  pValue={params.koiCd}
                  handleChange={handleSearchChange}
                  pName={'koiCd'}
                  addText="전체"
                  htmlFor={'sch-koiCd'}
                />
              </div>
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
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 종료 */}

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard className="contents-card" title="법인 업체정보">
          <TableDataGrid
            headCells={apvTddTxHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            totalRows={totalRows} // 총 로우 수
            selectedRowIndex={selectedIndex} // 선택된 로우 인덱스
            onPaginationModelChange={handlePaginationModelChange1} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable}
            caption={'택시거래내역 조회 목록'}
          />
        </BlankCard>
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 시작 */}
      <BlankCard className="contents-card" title="상세 거래내역">
        <TableDataGrid
          headCells={apvTddTxDetailHC}
          rows={detailRows}
          loading={DetailLoading}
          totalRows={detailTotalRows}
          onPaginationModelChange={handlePaginationModelChange2} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={detailPageable} // 현재 페이지 / 사이즈 정보
          caption={'상세 거래내역 조회 목록'}
        />
      </BlankCard>

      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default DataList
