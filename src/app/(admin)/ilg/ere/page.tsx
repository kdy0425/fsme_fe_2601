'use client'
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  getCommCd,
  getCtpvCd,
  getDateRange,
  getExcelFile,
  getLocGovCd,
  getToday,
} from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'
import { IconSearch } from '@tabler/icons-react'
import FormModal from '@/app/components/popup/FormDialog'
import ModalContent, { ModalRow } from './_components/ModalContent'
import {
  CommSelect,
  CtpvSelect,
  CtpvSelectAll,
  LocgovSelect,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import { ilgEreMainHC } from '@/utils/fsms/headCells'
import { StatusType } from '@/types/message'
import { handleKeyDown } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '화물의심거래상시점검',
  },
  {
    to: '/ilg/ere',
    title: '조사결과 조회 및 행정처분',
  },
]

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={5}>
          기본정보{' '}
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={14}>
          조사결과
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={11}>
          행정처분
        </TableCell>
      </TableRow>
      <TableRow>
        {/* 기본정보 */}
        <TableCell style={{ whiteSpace: 'nowrap' }} padding="checkbox">
          의심거래
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>연번</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>관할관청</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>소유자명</TableCell>

        {/* 조사결과 */}
        <TableCell style={{ whiteSpace: 'nowrap' }}>업종</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>개인/법인</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>업종구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>직영여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>거래건수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>거래금액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>유가보조금</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>환수조치액</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>조사등록건수</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>조사결과등록일</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>조사결과</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>조사등록유무</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>환수여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>조치일</TableCell>

        {/* 행정처분 */}
        <TableCell style={{ whiteSpace: 'nowrap' }}>행정처분구분</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>행정처분시작일</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>행정처분종료일</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          주유소공모,가담여부
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>불법구조변경여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>수사의뢰여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>행정처리등록일</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>행정처리유무</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>행정처리사유</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합동점검여부</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>합동점검차시</TableCell>
      </TableRow>
    </TableHead>
  )
}

export interface Row {
  exmnNo: string
  dwNo: string
  locgovCd: string
  locgovNm: string
  vhclNo: string
  vonrNm: string
  exmnRegYn: string
  exmnRegYnNm: string
  pbadmsPrcsYn: string
  pbadmsPrcsYnNm: string
  bzmnSeCd: string
  bzmnSeNm: string
  tpbizSeCd: string
  tpbizSeNm: string
  tpbizCd: string
  tpbizNm: string
  droperYn: string
  droperYnNm: string
  exmnRsltCn: string
  dlngNocs: number
  totlAprvAmt: number
  totlAsstAmt: number
  rdmActnAmt: number
  rdmTrgtNocs: number
  exmnRegMdfcnDt: string
  rdmYn: string
  rdmYnNm: string
  dspsDt: string
  admdspSeCd: string
  admdspSeNm: string
  admdspRsnCn: string
  admdspBgngYmd: string
  admdspEndYmd: string
  oltPssrpPrtiYn: string
  oltPssrpPrtiYnNm: string
  unlawStrctChgYnCd: string
  unlawStrctChgYnNm: string
  dsclMthdCd: string
  dsclMthdNm: string
  pbadmsPrcsMdfcnDt: string
  cpeaChckYn: string
  cpeaChckCyclVl: string
  cpeaChckCyclVlNm: string
  sn: number
  seqNo: number
  vonrBrno: string
  crtrLimLiter: number
  crtrLiter: number
  aprvYmd: string
  aprvTm: string
  aprvAmt: number
  useLiter: number
  asstAmtLiter: number
  asstAmt: number
  trgtAsstAmt: number
  cardNo: string
  cardSeNm: string
  vhclTonNm: string
  frcsCdNo: string
  frcsNm: string
  frcsBrno: string
  cardSeCd: string
  vhclTonCd: string
  crdcoCd: string
  crdcoNm: string
  frcsZip: string
  frcsAddr: string
  prvtYn: string
  delYn: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  dwNo: string
  admsCd: string
  bgngAprvYmd: string
  endAprvYmd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  // 의심거래내역 모달
  const onClickBtn = (row: Row) => {
    setModalParams({
      exmnNo: row.exmnNo,
      vhclNo: row.vhclNo,
      locgovCd: row.locgovCd,
      dwNo: row.dwNo,
    })
    setModalOpen(true)
  }

  const ilgEreMainGridHC = [
    {
      id: 'btn',
      numeric: false,
      disablePadding: false,
      label: '의심거래',
      format: 'button',
      button: {
        label: <IconSearch size={18} />,
        color: 'dark',
        onClick: onClickBtn,
      },
    },
    ...ilgEreMainHC,
  ]

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [enableExcel, setEnableExcel] = useState<boolean>(false)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [isModalProcessing, setIsModalProcessing] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngAprvYmd: '', // 시작일
    endAprvYmd: '', // 종료일
    vhclNo: '',
    dwNo: '',
    ctpvCd: '',
    locgovCd: '',
    admsCd: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const [modalParams, setModalParams] = useState({
    exmnNo: '',
    vhclNo: '',
    locgovCd: '',
    dwNo: '',
  })
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalRows, setModalRows] = useState<ModalRow[]>([])

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    setEnableExcel(false)
  }, [params])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('m', 1)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngAprvYmd: startDate,
      endAprvYmd: endDate,
    }))
  }, [])

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/ere/tr/getAllExamResExaathr?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.dwNo ? '&dwNo=' + params.dwNo : ''}` +
        `${params.admsCd ? '&admsCd=' + params.admsCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}`

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
        setInitialState()
      }
    } catch (error: StatusType | any) {
      // 에러시
      alert(error.errors?.[0].reason)
      console.error('Error fetching data:', error)
      setInitialState()
    } finally {
      setLoading(false)
      setFlag(false)
      setEnableExcel(true)
    }
  }

  const fetchModalData = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/ere/tr/getAllDoubtDelngDtls?` +
        `${modalParams.exmnNo ? '&exmnNo=' + modalParams.exmnNo : ''}` +
        `${modalParams.locgovCd ? '&locgovCd=' + modalParams.locgovCd : ''}` +
        `${modalParams.vhclNo ? '&vhclNo=' + modalParams.vhclNo : ''}` +
        `${modalParams.dwNo ? '&dwNo=' + modalParams.dwNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setModalRows(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setModalRows([])
      }
    } catch (error: StatusType | any) {
      // 에러시
      alert(error.errors?.[0].reason)
      console.error('Error fetching data:', error)
      setModalRows([])
    }
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('조회 건 수가 없어 엑셀다운로드를 할 수가 없습니다.')
      return
    }

    if (!enableExcel) {
      alert('조회 후 엑셀 다운로드 하시기 바랍니다.')
      return
    }

    setIsDataProcessing(true)

    try {
      let endpoint: string =
        `/fsm/ilg/ere/tr/examResExaathrExcel?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.dwNo ? '&dwNo=' + params.dwNo : ''}` +
        `${params.admsCd ? '&admsCd=' + params.admsCd : ''}` +
        `${params.bgngAprvYmd ? '&bgngAprvYmd=' + params.bgngAprvYmd.replaceAll('-', '') : ''}` +
        `${params.endAprvYmd ? '&endAprvYmd=' + params.endAprvYmd.replaceAll('-', '') : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + getToday() + '.xlsx',
      )
    } catch (error) {
      alert(error)
    }

    setIsDataProcessing(false)
  }

  const excelModalDownload = async () => {
    if (modalRows.length === 0) {
      alert('조회된 정보가 없어 엑셀다운로드를 할 수 없습니다.')
      return
    }

    try {
      setIsModalProcessing(true)

      let endpoint: string =
        `/fsm/ilg/ere/tr/popup/doubtDelngDtlsExcel?` +
        `${modalParams.exmnNo ? '&exmnNo=' + modalParams.exmnNo : ''}` +
        `${modalParams.locgovCd ? '&locgovCd=' + modalParams.locgovCd : ''}` +
        `${modalParams.vhclNo ? '&vhclNo=' + modalParams.vhclNo : ''}` +
        `${modalParams.dwNo ? '&dwNo=' + modalParams.dwNo : ''}`

      await getExcelFile(endpoint, '의심거래내역_' + getToday() + '.xlsx')
    } catch (error) {
      alert(error)
    }
    setIsModalProcessing(false)
  }

  useEffect(() => {
    if (modalParams.exmnNo) {
      fetchModalData()
    }
  }, [modalParams])

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

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngAprvYmd' || name === 'endAprvYmd') {
      const otherDateField =
        name === 'bgngAprvYmd' ? 'endAprvYmd' : 'bgngAprvYmd'
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

    if (changedField === 'bgngAprvYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <PageContainer
      title="조사결과 조회 및 행정처분 조회"
      description="조사결과 조회 및 행정처분 조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="조사결과 조회 및 행정처분 조회" items={BCrumb} />
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
                width="70%"
                pValue={params.ctpvCd}
                htmlFor={'sch-ctpv'}
                handleChange={handleSearchChange}
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
                width="70%"
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                거래년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래년월 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="bgngAprvYmd"
                value={params.bgngAprvYmd}
                onChange={handleSearchChange}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(event, fetchData)
                }
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래년월 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endAprvYmd"
                value={params.endAprvYmd}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                placeholder=""
                fullWidth
                name="vhclNo"
                value={params.vhclNo} // 빈 문자열로 초기화
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dwNo"
              >
                부정수급유형
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="164"
                pValue={params.dwNo}
                handleChange={handleSearchChange}
                pName="dwNo"
                htmlFor={'sch-dwNo'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-admsCd"
              >
                등록구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="168"
                pValue={params.admsCd}
                handleChange={handleSearchChange}
                pName="admsCd"
                htmlFor={'sch-admsCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
            <Button variant="contained" color="success" onClick={excelDownload}>
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box width={'100%'}>
        <TableDataGrid
          customHeader={customHeader}
          headCells={ilgEreMainGridHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      <FormModal
        size={'xl'}
        buttonLabel={''}
        title={'의심거래내역'}
        remoteFlag={modalOpen}
        submitBtn={false}
        closeHandler={() => setModalOpen(false)}
        btnSet={
          <Button
            variant="contained"
            color="success"
            onClick={excelModalDownload}
          >
            엑셀
          </Button>
        }
      >
        <ModalContent rows={modalRows} />
        <LoadingBackdrop open={isModalProcessing} />
      </FormModal>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
