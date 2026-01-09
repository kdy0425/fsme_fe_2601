'use client'
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import {
  getDateRange,
  getToday,
  getExcelFile,
  openReport,
} from '@/utils/fsms/common/comm'
import { parGprTrHeadCells } from '@/utils/fsms/headCells'

// components
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import PaperDetailAprvModal from '@/app/components/tr/popup/PaperDetailAprvModal'
import RegisterGuideModal from './_components/RegisterGuideModal'
import ModalContent from './_components/ModalContent'
import DetailDataGrid from './_components/DetailDataGrid'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import CustomTableDataGrid from './_components/CustomTableDataGrid2'
// types
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { Pageable2 } from 'table'
import { CheckBox } from '@mui/icons-material'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '서면신청',
  },
  {
    title: '화물서면신청',
  },
  {
    to: '/par/gpr',
    title: '서면신청(일반)',
  },
]

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell
          style={{ whiteSpace: 'nowrap', width: '56px' }}
          rowSpan={2}
          className="table-head-text">
          {/* <CustomCheckbox>
          
          </CustomCheckbox> */}
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          처리상태
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          주유월
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          소유자명
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          차량번호
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          유류사용량
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          정산리터
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          colSpan={3}
          className="table-head-text"
        >
          유가보조금
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          유종
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          톤수
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          예금주명
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          금융기관
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          계좌번호
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          사업자등록번호
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          생년월일
        </TableCell>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          rowSpan={2}
          className="table-head-text"
        >
          수정일자
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} className="table-head-text">
          합계
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} className="table-head-text">
          유류세연동
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} className="table-head-text">
          유가연동
        </TableCell>
      </TableRow>
    </TableHead>
  )
}

export interface Row {
  locgovCd: string
  locgovNm: string
  vhclNo: string
  clclnYm: string
  aplySn: number
  koiCd: string
  koiNm: string
  vhclTonCd: string
  vhclTonNm: string
  useLiter: number
  drvngDstnc: number | null
  tclmAmt: number
  opisAmt: number
  ftxAsstAmt: number
  oriTclmAmt: number
  oriOpisAmt: number
  oriFtxAsstAmt: number
  tclmLiter: number
  vhclPsnCd: string
  vhclPsnNm: string
  crno: string
  vonrBrno: string
  vonrRrno: string
  vonrRrnoS: string
  vonrNm: string
  prcsSttsCd: string
  prcsSttsNm: string
  clclnCmptnYmd: string
  giveCfmtnYmd: string
  docmntAplyRsnCn: string
  bacntInfoSn: string
  bankCd: string
  bankNm: string
  actno: string
  dpstrNm: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  birthDay: string
  crdcoCd: string
  crdcoNm: string
  cardNo: string
  cardNoS: string
  aprvYmd: string
  aprvTm: string
  aprvYmdTm: string
  aprvNo: string
  aprvYn: string
  stlmYn: string
  aprvAmt: number
  asstAmt: number
  asstAmtLiter: number
  unsetlLiter: number
  unsetlAmt: number
  frcsNm: string
  frcsCdNo: string
  cardSeCd: string
  cardSeNm: string
  cardSttsCd: string
  cardSttsNm: string
  stlmCardNo: string
  stlmCardNoS: string
  stlmAprvNo: string
  ceckStlmYn: string
  origTrauTm: string
  origTrauYmdTm: string
  colorGb: string
  subsGb: string
  regYmd: string
  cardIssuYmd: string
  cardAplyYmd: string
  col01: string
  col02: string
  col03: string
  col04: string
  col05: string
  col06: string
  col07: string
  col08: string
  col09: string
  col10: string
  col11: string
  col12: string
}

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

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우 데이터
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 인덱스
  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false) // 등록모달 오픈 여부
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    vhclNo: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const handleCheckChange = (selected: string[]) => {
      setSelectedRows(selected)
  }

  useEffect(() =>{
    console.log('selectedRows ::: ', selectedRows);
  } ,[selectedRows])

  const paperDetailAprvInfo = useSelector(
    (state: AppState) => state.paperDetailAprvInfo,
  )
  const dispatch = useDispatch()

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    // 조회조건 세팅
    setParams((prev) => ({
      ...prev,
      searchStDate: getDateRange('m', 1).startDate,
      searchEdDate: getDateRange('m', 1).endDate,
    }))
  }, [])

  useEffect(() => {
    if (params.searchStDate && params.searchEdDate) {
      setSelectedIndex(-1)
      setSelectedRow(undefined)
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (
      params.searchStDate.replaceAll('-', '').length != 6 ||
      params.searchEdDate.replaceAll('-', '').length != 6
    ) {
      alert('거래년월을 입력해주세요.')
    }

    try {
      setLoading(true)
      setExcelFlag(true) // 엑셀기능 동작여부

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/par/gpr/tr/getAllGnrlPapersReqst?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.searchStDate ? '&startClclnYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endClclnYm=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
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
        alert(response.message)
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

  const deleteData = async () => {
    try {
      if (selectedRow && selectedIndex > -1) {
        // 신규등록, 정산요청, 정산완료 건만 삭제요청
        if (selectedRow.prcsSttsCd === '01' ||selectedRow.prcsSttsCd === '02') {
          const userConfirm = confirm('해당 서면신청건을 삭제하시겠습니까?')
          if (!userConfirm) return

        } else if(selectedRow.prcsSttsCd === '04'){
          const userConfirm = confirm('해당 서면신청건을 정산취소요청 하시겠습니까?')
          if (!userConfirm) return

        } else{
          alert('서면신청삭제가 불가능한 상태입니다.\n\n'
            + '서면신청삭제는 처리상태가 \n[신규등록], [정산요청], [정산완료]일 \n경우에만 가능합니다.\n\n'
            + '서면신청건에 대한 삭제가 필요할 경우 \n운영팀으로 연락해 주십시오.'
          )
          return
        }

        let endpoint: string = `/fsm/par/gpr/tr/deleteGnrlPapersReqst`

        let body = {
          locgovCd: selectedRow.locgovCd,
          vhclNo: selectedRow.vhclNo,
          clclnYm: selectedRow.clclnYm,
          aplySn: Number(selectedRow.aplySn),
          prcsSttsCd: selectedRow.prcsSttsCd,
          tclmAmt: selectedRow.tclmAmt,
        }

        const response = await sendHttpRequest('DELETE', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          setFlag((prev) => !prev)
        } else {
          alert(response.message)
        }
      } else {
        alert('삭제할 서면신청건을 선택해주세요.')
      }
    } catch (error) {
      console.log('Error ::: ', error)
    }
  }

 // 지급확정
  const assessmentData = async (rows: Row[]) => {
    console.log('rows ::: ', rows);

    if(rows.length == 0){
      alert('확정할 서면신청건을 선택해주세요.')
      return
    }
    const invalidRows = rows.filter((row) => row.prcsSttsCd !== '04')

    if (invalidRows.length > 0) {
      alert('확정할 서면신청건중 처리상태가 [정산완료]가 아닙니다.\n\n'
        + '서면신청건에 대한 지급확정은 [정산완료] 상태에서만 가능합니다.')
      return
    }

    try {
      let body = rows.map((row) => ({
        locgovCd: row.locgovCd,
        vhclNo: row.vhclNo,
        clclnYm: row.clclnYm,
        aplySn: Number(row.aplySn),
        prcsSttsCd: row.prcsSttsCd,
        tclmAmt: row.tclmAmt,
      })) 

      if(!confirm('선택한 서면신청건에 대한 지급확정을 하시겠습니까?')) {
        return
      }
      let endpoint: string = '/fsm/par/gpr/tr/decisionGnrlPapersReqstList'

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
        reload()
      } else {
        // 실패
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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

    if (
      params.searchStDate.replaceAll('-', '').length != 6 ||
      params.searchEdDate.replaceAll('-', '').length != 6
    ) {
      alert('거래년월을 입력해주세요.')
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        `/fsm/par/gpr/tr/getExcelGnrlPapersReqst?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.searchStDate ? '&startClclnYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endClclnYm=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

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

  const print = async () => {
    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 출력이 가능합니다.')
      return
    }

    if(!params.ctpvCd || params.ctpvCd == ''){
      alert("시도명을 선택해주세요.")
      return
    }
    if(!params.locgovCd || params.locgovCd == ''){
      alert("관할관청을 선택해주세요.")
      return
    }

    if (
      params.searchStDate.replaceAll('-', '').length != 6 ||
      params.searchEdDate.replaceAll('-', '').length != 6
    ) {
      alert('거래년월을 입력해주세요.')
      return
    }

    const printGb = confirm('지급월 기준으로 보조금정산내역을 출력 하시겠습니까?\n' +
      '취소 시 주유월 기준으로 보조금정산내역을 출력됩니다.')

    try {
      let endpoint: string =
        `/fsm/par/gpr/tr/printGnrlPapersReqst?` +
        `${printGb ? '&printGb=' + '02' : '01'}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.searchStDate ? '&startClclnYm=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endClclnYm=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        
        if (response.data.length == 0) {
          alert('보조금정산내역이 없습니댜.')
          return
        }

        const responseData = response.data.map((item: any) => ({
          ...item,
          bgngYm: params.searchStDate,
          endYm: params.searchEdDate,
          printGb: printGb ? '(지급월 기준)' : '(주유월 기준)',
        }))

        const jsonData = { papersReqst: responseData }
        // 리포트
        openReport('papersReqstGnrl', JSON.stringify(jsonData))
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
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
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const openUpdateModal = () => {
    if (selectedIndex < 0 || !selectedRow) {
      alert('수정할 데이터를 선택해주세요')
      return
    }

    if (selectedRow.prcsSttsCd !== '01') {
      alert('처리상태가 신규등록일 때만 수정 할 수 있습니다.')
      return
    }

    setUpdateModalOpen(true)
  }

  const reload = () => {
    setRegisterModalOpen(false)
    setUpdateModalOpen(false)
    setFlag((prev) => !prev)
  }

  return (
    <PageContainer title="서면신청(일반)" description="서면신청(일반)">
      {/* breadcrumb */}
      <Breadcrumb title="서면신청(일반)" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv" required>
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov" required>
                관할관청
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
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{ max: params.searchEdDate }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{ min: params.searchStDate }}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-prcsSttsCd">
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'046'}
                pValue={params.prcsSttsCd}
                handleChange={handleSearchChange}
                pName={'prcsSttsCd'}
                htmlFor={"sch-prcsSttsCd"}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
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
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              onClick={() => setRegisterModalOpen(true)}
              color="primary"
            >
              등록
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={openUpdateModal}
            >
              수정
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteData()}
            >
              삭제
            </Button>
              <Button
              variant="contained"
              color="primary"
              onClick={
                () => 
                  assessmentData(
                    selectedRows.map(id => (rows[Number(id.replace('tr', ''))]))
                  )
              }
            >
              확정
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
            <Button variant="contained" color="success" onClick={() => print()}>
              출력
            </Button>
          </div>
          <RegisterGuideModal
            remoteFlag={registerModalOpen}
            closeHandler={() => setRegisterModalOpen(false)}
            reload={reload}
          />
          {selectedIndex > -1 && selectedRow && (
            <FormModal
              buttonLabel={''}
              title={'서면신청수정'}
              formLabel="저장"
              formId="register-data"
              remoteFlag={updateModalOpen}
              closeHandler={() => setUpdateModalOpen(false)}
              size="xl"
            >
              <ModalContent
                formType="UPDATE"
                data={selectedRow}
                reload={reload}
              />
            </FormModal>
          )}
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        {/* <TableDataGrid
          headCells={parGprTrHeadCells} // 테이블 헤더 값
          customHeader={customHeader}
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex} // 선택된 인덱스
        /> */}
        <CustomTableDataGrid
          onCheckChange={handleCheckChange}
          caption={"화물 서면신청 일반 조회 목록"}
          headCells={parGprTrHeadCells} // 테이블 헤더 값
          //customHeader={customHeader}
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex} // 선택된 인덱스
          paging={true}
          cursor={true}
        />
        <PaperDetailAprvModal />
      </Box>
      {selectedRow && selectedIndex > -1 ? (
        <Box>
          <DetailDataGrid
            key={selectedRow.aplySn}
            detail={selectedRow}
            reload={reload}
          />
        </Box>
      ) : (
        <></>
      )}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
