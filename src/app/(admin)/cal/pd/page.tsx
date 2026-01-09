'use client'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'

import { calPdPayHC } from '@/utils/fsms/headCells'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { diffDate } from '@/utils/fsms/common/util'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '보조금청구',
  },
  {
    title: '택시청구',
  },
  {
    to: '/cal/pd',
    title: '지급확정관리',
  },
]

export interface Row {
  //안 보여줄것
  clclnLocgovCd?: string // 정산지자체코드
  icectxRmbrAmt?: string // 개별소비세 환급금액
  vatRmbrAmt?: string // 부가가치세 환급금액
  sumRmbrAmt?: string // 합계환급금액
  mdfrId?: string // 수정자

  //보유줄것
  clclnYm?: string // 청구월 // 정산 년월
  crdcoCd?: string // 카드사코드
  crdcoNm?: string // 카드사명
  bzmnSeCd?: string // 업종구분
  bzmnSeNm?: string // 업종명
  koiCd?: string // 유종
  koiNm?: string // 유종명
  ddlnYn?: string // 지급확정여부
  ddlnNm?: string // 지급확정여부명
  ddlnYmd?: string // 확정일자
  clmAprvYn?: string // 구분
  clmAprvNm?: string // 구분명
  dlngNocs?: string // 매출건수
  userCnt?: string // 회원수
  useLiter?: string // 국토부사용량
  usageUnit?: string // 단위
  slsAmt?: string // 매출금액
  indvBrdnAmt?: string // 개인부담금액
  moliatAsstAmt?: string // 국토부보조금
}

const rowData: Row[] = []

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2}>청구월</TableCell>
        <TableCell rowSpan={2}>카드사</TableCell>
        <TableCell rowSpan={2}>업종구분</TableCell>
        <TableCell rowSpan={2}>유종</TableCell>
        <TableCell rowSpan={2}>지급확정</TableCell>
        <TableCell rowSpan={2}>확정일자</TableCell>
        <TableCell colSpan={8}>확정정보</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>구분</TableCell>
        <TableCell>매출건수</TableCell>
        <TableCell>회원수</TableCell>
        <TableCell>국토부사용량</TableCell>
        <TableCell>단위</TableCell>
        <TableCell>매출금</TableCell>
        <TableCell>개인부담금</TableCell>
        <TableCell>국토부보조금</TableCell>
      </TableRow>
    </TableHead>
  )
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  const pathname = usePathname() // 현재 경로를 가져옴

  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터

  const [modifyRow, setModifyRows] = useState<Row>() // 수정할 행
  const [confirmOpen, setConfirmOpen] = useState(false) // 다이얼로그 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false) // 스낵바 상태
  const [snackbarMessage, setSnackbarMessage] = useState('') // 스낵바 메시지
  const [confirmLoading, setConfirmLoading] = useState(false) // 로딩 인디케이터
  const [rowIndex, setRowIndex] = useState<number>(-1) // 선택 인덱스
  const [isExcelProcessing, setIsExcelProcessing] = useState(false)

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != undefined) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({ ...prev, bgngDt: startDate, endDt: endDate }))
  }, [])

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM인지 확인
    if (!/^\d{4}-\d{2}$/.test(dateString)) {
      throw new Error("Invalid format. Expected 'YYYY-MM'")
    }

    // "-" 제거하고 반환
    return dateString.replace('-', '')
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/pd/tx/getAllPymntDcsn?page=${params.page}&size=${params.size}` +
        `${params.locgovCd ? '&' + 'clclnLocgovCd' + '=' + params.locgovCd : ''}` +
        `${params.bzmnSeCd ? '&' + 'bzmnSeCd' + '=' + params.bzmnSeCd : ''}` +
        `${params.koiCd ? '&' + 'koiCd' + '=' + params.koiCd : ''}` +
        `${params.crdcoCd ? '&' + 'crdcoCd' + '=' + params.crdcoCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
        `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}`

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
      setRows(rowData)
      setTotalRows(rowData.length)
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

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    if (!params.ctpvCd || params.ctpvCd == '') {
      alert('시도군은 필수값입니다.')
      return
    }

    if (!params.locgovCd || params.locgovCd == '') {
      alert('관할관청은 필수값입니다.')
      return
    }

    if (!params.bgngDt || params.bgngDt == '') {
      alert('시작일은 필수값입니다.')
      return
    }

    if (!params.endDt || params.endDt == '') {
      alert('종료일은 필수값입니다.')
      return
    }

    if (params.bgngDt > params.endDt) {
      alert('시작일자가 종료일자보다 클 수 없습니다.')
      return
    }

    if (!diffDate(params.bgngDt, params.endDt, 1)) {
      alert('1개월 초과 데이터는 조회가 불가능합니다.')
      return
    }

    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (modifyRow: Row, index?: number) => {
    setModifyRows(modifyRow)
    setRowIndex(index ?? -1)
  }

  const handleConfirmClick = () => {
    if (!modifyRow) return // modifyRow 수정할 데이터 없으면 취소

    // 선택된 데이터가 확정 처리된 상태인지 확인
    if (modifyRow.ddlnYn === 'Y') {
      setSnackbarMessage('이미 확정이 처리된 청구건 입니다')
      setSnackbarOpen(true)
    } else {
      setConfirmOpen(true) // 미확정인 경우 확인 다이얼로그 열기
    }
  }

  const ConfirmData = async (modifyRow: Row) => {
    setConfirmLoading(true)
    try {
      let endpoint: string = `/fsm/cal/pd/tx/updateCfmtnPymntDcsn`
      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        {
          crdcoCd: modifyRow.crdcoCd,
          clclnYm: modifyRow.clclnYm,
          clclnLocgovCd: modifyRow.clclnLocgovCd,
          bzmnSeCd: modifyRow.bzmnSeCd,
          koiCd: modifyRow.koiCd,
          mdfrId: modifyRow.mdfrId,
          // Include any additional fields as necessary
        },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        return 'success'
      } else {
      }
    } catch (error) {
      return 'false'
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleConfirm = async () => {
    setConfirmOpen(false)

    // Call the API request
    const result = await ConfirmData(modifyRow as Row)

    if (result === 'success') {
      // Success handling
      setSnackbarMessage('해당 청구건이 확정처리되었습니다')
      //router.push(pathname)
      fetchData()
    } else {
      // Failure handling
      setSnackbarMessage('확정 처리에 실패했습니다. 다시 시도해주세요.')
    }

    setSnackbarOpen(true) // Open Snackbar with the message
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleCloseConfirm = () => {
    setConfirmOpen(false)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
    setExcelFlag(false)
  }

  // 추후에 액셀 다운로드 API 나오면 연동!
  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/pd/tx/getExcelAllPymntDcsn?` +
      `${params.locgovCd ? '&' + 'clclnLocgovCd' + '=' + params.locgovCd : ''}` +
      `${params.bzmnSeCd ? '&' + 'bzmnSeCd' + '=' + params.bzmnSeCd : ''}` +
      `${params.koiCd ? '&' + 'koiCd' + '=' + params.koiCd : ''}` +
      `${params.crdcoCd ? '&' + 'crdcoCd' + '=' + params.crdcoCd : ''}` +
      `${params.bgngDt ? '&bgngDt=' + formatDate(params.bgngDt) : ''}` +
      `${params.endDt ? '&endDt=' + formatDate(params.endDt) : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  return (
    <PageContainer title="지급확정관리" description="지급확정관리">
      {/* breadcrumb */}
      <Breadcrumb title="지급확정관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
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
                pName="ctpvCd"
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
                pName="locgovCd"
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
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
                청구 년월
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
                청구 종료 년월
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

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-bzmnSeCd"
              >
                사업자구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CBG0" // 필수 O, 가져올 코드 그룹명
                pValue={params.bzmnSeCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="bzmnSeCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-bzmnSeCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
              {/* // 다음줄  */}
            </div>
            {/* // 다음줄  */}
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="KOI3" // 필수 O, 가져올 코드 그룹명
                pValue={params.koiCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="koiCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-koiCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdcoCd"
              >
                카드사구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CCGC" // 필수 O, 가져올 코드 그룹명
                pValue={params.crdcoCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="crdcoCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-crdcoCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                addText="전체" // 필수 X, 조회조건 제일 최상단에 배치할 값
              />
            </div>
            {/* // 다음줄  */}
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              // onClick={() => handleAdvancedSearch()}
              variant="contained"
              color="primary"
              type="submit"
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
            <Button
              variant="contained"
              onClick={handleConfirmClick}
              color="primary"
            >
              확정
            </Button>
            <LoadingBackdrop open={isExcelProcessing} />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          customHeader={customHeader}
          headCells={calPdPayHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          selectedRowIndex={rowIndex}
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          caption={'지급확정관리 조회 목록'}
        />
      </Box>

      <Box>
        {/* 확인 다이얼로그 */}
        <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
          <DialogTitle>확정 확인</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <b style={{ fontSize: '14pt' }}>
                해당 청구건을 확정하시겠습니까?
                <br /> 현재 고도화 안정화 기간으로 다량의 데이터건을 처리하는
                경우 지연되는 현상이 있습니다. <br />
                완료실패 문구가 뜨더라도
                <b style={{ color: 'red' }}> 10분정도 후 </b>확정이 되었는지
                다시 한 번 확인 부탁드리겠습니다. <br />
                이용에 불편을 드려 대단히 죄송합니다.
              </b>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} color="primary">
              취소
            </Button>
            <Button onClick={handleConfirm} color="primary">
              확인
            </Button>
          </DialogActions>
        </Dialog>

        {/* 스낵바 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={confirmLoading} />
    </PageContainer>
  )
}

export default DataList
