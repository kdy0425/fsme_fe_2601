'use client'
import { Box, Button, Grid } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import { getExcelFile, isNumber } from '@/utils/fsms/common/comm'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import TxSearchHeaderTab from '@/app/components/tx/txSearchHeaderTab/TxSearchHeaderTab'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { getDateRange, getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import DetailDataGrid from './_components/DetailDataGrid'
import PublicFormModal from './_components/modal/PublicFormModal'
import PrivateFormModal from './_components/modal/PrivateFormModal'
import { toQueryParameter } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '서면신청',
  },
  {
    title: '택시서면신청',
  },
  {
    to: '/par/lpr',
    title: '서면신청(지자체)',
  },
]

// 개인 HeadCell 영역
const privateHeadCells: HeadCell[] = [
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '신청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'secureRrno',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'qty',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'useAmt',
    numeric: false,
    disablePadding: false,
    label: '주유·충전금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'bankNm',
    numeric: false,
    disablePadding: false,
    label: '금융기관',
  },
  {
    id: 'actno',
    numeric: false,
    disablePadding: false,
    label: '계좌번호',
  },
  {
    id: 'dpstrNm',
    numeric: false,
    disablePadding: false,
    label: '예금주',
  },
  {
    id: 'giveYnNm',
    numeric: false,
    disablePadding: false,
    label: '상태',
  },
]

// 법인 HeadCell 영역
const publicHeadCells: HeadCell[] = [
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '신청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '상호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'secureRrno',
    numeric: false,
    disablePadding: false,
    label: '대표자 주민등록번호',
    format: 'rrno',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'qty',
    numeric: false,
    disablePadding: false,
    label: '주유·충전량',
    format: 'lit',
    align: 'td-right',
  },
  {
    id: 'useAmt',
    numeric: false,
    disablePadding: false,
    label: '주유·충전금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'moliatAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'bankNm',
    numeric: false,
    disablePadding: false,
    label: '금융기관',
  },
  {
    id: 'actno',
    numeric: false,
    disablePadding: false,
    label: '계좌번호',
  },
  {
    id: 'dpstrNm',
    numeric: false,
    disablePadding: false,
    label: '예금주',
  },
  {
    id: 'giveYnNm',
    numeric: false,
    disablePadding: false,
    label: '상태',
  },
]

export interface Row {
  locgovCd: string
  bzmnSeCd: string
  brno: string
  rrno: string
  vhclNo: string
  docmntAplyUnqNo: string
  flnm: string
  addr: string
  asctCd: string
  asctNm: string
  pasctNm: string
  telno: string
  agdrvrYn: string
  agdrvrYnNm: string
  agdrvrRrno: string
  agdrvrNm: string
  koiCd: string
  koiNm: string
  regSeCd: string
  regSeCdNm: string
  regSeCdAcctoYmd: string
  cardFrstUseYmd: string
  rcptYmd: string
  giveYn: string
  giveYnNm: string
  bankCd: string
  bankNm: string
  actno: string
  dpstrNm: string
  regSeCdAcctoEndYmd: string
  seqNo: string
  qty: string
  useAmt: string
  moliatAsstAmt: string
  docmntAplyRsnCn: string
  secureRrno: string
  secureAgdrvrRrno: string
  agncyDrvBgngYmd: string
  agncyDrvEndYmd: string
  passoCd: string
}

// 목록 조회시 필요한 조건
interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  brno: string
  rrno: string
  vhclNo: string
  strRcptYmd: string
  endRcptYmd: string
  giveYn: string
  bzmnSeCd: string
}

const DataList = () => {
  const tabList = useMemo(() => ['법인', '개인'], [])
  const userInfo = getUserInfo()
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [tabIndex, setTabIndex] = useState('0') // 탭 관리
  const [excelFlag, setExcelFlag] = useState(false)

  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [rowIndex, setRowIndex] = useState<number>(-1)
  const [open, setOpen] = useState<boolean>(false)
  const [type, setType] = useState<'I' | 'U'>('I')

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    brno: '',
    rrno: '',
    vhclNo: '',
    strRcptYmd: '',
    endRcptYmd: '',
    giveYn: '',
    bzmnSeCd: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  })

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  // 플래그를 통한 데이터 갱신
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 탭 변경 시 조회된 데이터 초기화
  useEffect(() => {
    if (tabIndex) {
      const dateRange = getDateRange('d', 30)
      const startDate = dateRange.startDate
      const endDate = dateRange.endDate
      setParams((prev) => ({
        ...prev,
        page: 1,
        size: 10,
        brno: '',
        rrno: '',
        vhclNo: '',
        strRcptYmd: startDate,
        endRcptYmd: endDate,
        giveYn: '',
        bzmnSeCd: tabIndex,
      }))

      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setSelectedRow(null)
      setRowIndex(-1)
    }
  }, [tabIndex])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    setLoading(true)
    setRows([])
    setRowIndex(-1)
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setSelectedRow(null)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        brno: params.brno.replaceAll('-', ''),
        rrno:params.rrno.replaceAll('-', ''),
        strRcptYmd: params.strRcptYmd.replaceAll('-', ''),
        endRcptYmd: params.endRcptYmd.replaceAll('-', ''),
      }

      // 검색 조건에 맞는 endpoint 생성
      const endpoint: string = '/fsm/par/lpr/cm/getAllLocgovPapersReqst' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
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
      console.error('Error fetching data:', error)      
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  const removeData = async () => {

    if (!selectedRow || rowIndex === -1) {
      alert('삭제할 데이터를 선택해주세요.')
      return
    }

    if (selectedRow.giveYn === 'Y') {
      alert('지급확정된 데이터는 삭제할 수 없습니다.')
      return
    }

    if (confirm('해당 정보를 삭제하시겠습니까?')) {
      
      try {
        
        setLoadingBackdrop(true)

        const body = { docmntAplyUnqNo: selectedRow.docmntAplyUnqNo }
        const endpoint: string = '/fsm/par/lpr/cm/deleteLocgovPapersReqst'

        const response = await sendHttpRequest('DELETE', endpoint, body, true, { cache: 'no-store' });

        if (response && response.resultType === 'success') {
          alert(response.message)
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

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 로우클릭시
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setRowIndex(index ?? -1)
  }, [])

  // 엔터키 입력 시 조회
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
      setFlag((prev) => !prev)
    }
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'strRcptYmd' || name === 'endRcptYmd') {
      const otherDateField = name === 'strRcptYmd' ? 'endRcptYmd' : 'strRcptYmd'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else if (name === 'rrno' || name === 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
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

    if (changedField === 'strRcptYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleModalOpen = (type: 'I' | 'U') => {
    if (type === 'U') {
      if (rowIndex === -1) {
        alert('서면신청 수정 할 데이터를 선택해주세요.')
        return
      }

      if (selectedRow?.giveYn === 'Y') {
        alert('지급확정된건은 수정 불가합니다.')
        return
      }
    }

    setType(type)
    setOpen(true)
  }

  const saveData = async () => {
    if (rowIndex === -1) {
      alert('선택된 행이 없습니다.')
      return
    }

    if (selectedRow?.giveYn === 'Y') {
      alert('지급확정된 건입니다.')
      return
    }

    if (confirm('지급확정 시 수정이 불가능합니다\n지급확정 하시겠습니까?')) {
      const endpoint: string = '/fsm/par/lpr/cm/updateLocgovPapersReqst'
      const body = {
        ...selectedRow,
        locgovCd: userInfo.locgovCd,
        mdfrId: userInfo.lgnId,
        giveYn: 'Y',
      }

      try {
        setLoadingBackdrop(true)
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleAdvancedSearch()
        } else {
          alert(response.message)
        }
      } catch (error) {
        alert(error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('조회 후 이용부탁드립니다')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    const searchObj = {
      ...params,
      strRcptYmd: params.strRcptYmd.replaceAll('-', ''),
      endRcptYmd: params.endRcptYmd.replaceAll('-', ''),
      bzmnSeCd: tabIndex.toString(),
    }

    const type = tabIndex == '0' ? '법인' : '개인'
    const endpoint =
      '/fsm/par/lpr/cm/getExcelLocgovPapersReqst' + toQueryParameter(searchObj)
    await getExcelFile(
      endpoint,
      type + '_지자체서면신청관리' + '_' + getToday() + '.xlsx',
    )
  }

  return (
    <PageContainer title="지자체서면신청관리" description="지자체서면신청관리">
      {/* breadcrumb */}
      <Breadcrumb title="지자체서면신청관리" items={BCrumb} />

      {/* 탭영역 시작 */}
      <TxSearchHeaderTab
        tabList={tabList}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      />

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpvCd"
              >
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpvCd'}
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
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                신청일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                신청일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="strRcptYmd"
                value={params.strRcptYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                신청일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endRcptYmd"
                value={params.endRcptYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
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
                htmlFor="sch-rrno"
              >
                주민등록번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="sch-rrno"
                name="rrno"
                value={params.rrno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            {tabIndex === '1' ? (
              <>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-vhclNo"
                  >
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    type="text"
                    id="sch-vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    fullWidth
                  />
                </div>
              </>
            ) : null}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-giveYn"
              >
                상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CDS1"
                pValue={params.giveYn}
                handleChange={handleSearchChange}
                pName="giveYn"
                htmlFor={'sch-giveYn'}
                addText="전체"
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
              variant="contained"
              color="primary"
              onClick={() => handleModalOpen('I')}
            >
              등록
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleModalOpen('U')}
            >
              수정
            </Button>
            <Button
              onClick={() => removeData()}
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
        {/* 법인일 경우와 개인일 경우를 분리하여 HeadCell을 삽입 */}
        <TableDataGrid
          headCells={tabIndex === '0' ? publicHeadCells : privateHeadCells}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          selectedRowIndex={rowIndex}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 상세 영역 */}
      <>
        {rowIndex !== -1 ? (
          <DetailDataGrid
            detail={rows[rowIndex]}
            tabIndex={tabIndex}
            saveData={saveData}
          />
        ) : null}
      </>

      <>
        {tabIndex === '0' && open ? (
          <PublicFormModal
            open={open}
            handleClickClose={() => setOpen(false)}
            type={type}
            reload={handleAdvancedSearch}
            row={selectedRow}
          />
        ) : null}
      </>

      <>
        {tabIndex === '1' && open ? (
          <PrivateFormModal
            open={open}
            handleClickClose={() => setOpen(false)}
            type={type}
            reload={handleAdvancedSearch}
            row={selectedRow}
          />
        ) : null}
      </>

      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList
