'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* 공통 component */
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 type, interface */
import { mngRpdcHC } from '@/utils/fsms/headCells'
import { Pageable2 } from 'table'

/* mui component */
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange } from '@/utils/fsms/common/comm'
import { getFormatToday } from '@/utils/fsms/common/dateUtils'
import { getFormatToday_yyyymm } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '운영관리',
  },
  {
    to: '/mng/rpdc',
    title: '청구 지급확정 취소',
  },
]

/* interface, type 선언 */
interface Row {
  clclnYm: string // 청구월
  crdcoNm: string // 카드사
  bzmnSeNm: string // 업종구분
  koiNm: string // 유종
  ddlnNm: string // 지급확정
  ddlnYmd: string // 확정일자
  clmAprvNm: string // 구분
  dlngNocs: string // 거래건수
  userCnt: string // 회원수
  useLiter: string // 거래량(L)
  slsAmt: string // 총거래금액
  indvBrdnAmt: string // 개인청구액
  moliatAsstAmt: string // 유가보조금
  locgovCd: string // 지자체코드
  crdcoCd: string // 카드사코드
  bzmnSeCd: string // 사업자구분코드
  koiCd: string // 유종코드
  clmAprvYn: string // 구분코드
  ddlnYn: string // 지급확정코드
}

// 목록 조회시 필요한 조건
interface listSearchObj {
  page: number
  size: number
  ctpvCd: string // 시도명
  locgovCd: string // 관할관청
  strClclnYm: string // 청구시작년월
  endClclnYm: string // 청구종료년월
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우 데이터
  const [selectedIndex, setSelectedIndex] = useState(-1) // 선택된 로우의 인덱스 값
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    strClclnYm: '',
    endClclnYm: '',
  }) // 조회조건
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이지객체

  useEffect(() => {
    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      strClclnYm: getDateRange('m', 1).startDate,
      endClclnYm: getDateRange('m', 1).endDate,
    }))
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (params.strClclnYm > params.endClclnYm) {
      alert('청구년월 시작조건이 종료조건보다 큽니다.\n다시확인해주세요.')
      return
    }

    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setLoading(true)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        strClclnYm: params.strClclnYm.replaceAll('-', ''),
        endClclnYm: params.endClclnYm.replaceAll('-', ''),
      }

      const endpoint: string =
        '/fsm/mng/rpdc/cm/getAllRqestPymntDcsn' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (
        response &&
        response.resultType === 'success' &&
        response.data.content.length != 0
      ) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        // click event 발생시키기
        handleRowClick(response.data.content[0], 0)
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

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 조회클릭시
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  // row클릭시
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }, [])

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  const cancelData = async () => {
    if (selectedRow == undefined) {
      alert('청구 지급확정 취소할 데이터를 선택해주세요.')
      return
    }

    if (selectedRow.ddlnYn == 'N') {
      alert('아직 지급확정(마감) 처리되지 않았습니다.')
      return
    }

    const confirmMsg = `청구월 : ${selectedRow.clclnYm}\n카드사 : ${selectedRow.crdcoNm}\n업종구분 : ${selectedRow.bzmnSeNm}\n유종 : ${selectedRow.koiNm}\n\n해당내역을 취소 하시겠습니까?`

    if (confirm(confirmMsg)) {
      try {
        setLoadingBackdrop(true)

        const body = {
          locgovCd: selectedRow.locgovCd,
          crdcoCd: selectedRow.crdcoCd,
          clclnYm: selectedRow.clclnYm,
          bzmnSeCd: selectedRow.bzmnSeCd,
          koiCd: selectedRow.koiCd,
        }

        const endpoint: string = '/fsm/mng/rpdc/cm/rqestPymntDcsnCancl'
        const response = await sendHttpRequest('POST', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert('취소되었습니다.')
          handleAdvancedSearch()
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <PageContainer title="청구 지급확정 취소" description="청구 지급확정 취소">
      {/* breadcrumb */}
      <Breadcrumb title="청구 지급확정 취소" items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            {/* 시도 조회조건 */}
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

            {/* 관할관청 조회조건 */}
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
              <CustomFormLabel className="input-label-display" required>
                청구년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                청구년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="strClclnYm"
                value={params.strClclnYm}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  max: getFormatToday(),
                }}
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                청구년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endClclnYm"
                value={params.endClclnYm}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  max: getFormatToday(),
                }}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => handleAdvancedSearch()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => cancelData()}
              variant="contained"
              color="error"
            >
              취소
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={mngRpdcHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          customHeader={customHeader}
        />
      </Box>

      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          청구월
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          카드사
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          업종구문
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          유종
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          지급확정
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={2}>
          확정일자
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={7}>
          확정정보
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>거래건수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>회원수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>거래량(L)</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>총거래금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>개인청구액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가보조금</TableCell>
      </TableRow>
    </TableHead>
  )
}
