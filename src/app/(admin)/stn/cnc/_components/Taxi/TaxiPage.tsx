'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Box, Grid, Button, MenuItem, Stack, TableRow } from '@mui/material'
import { Label } from '@mui/icons-material'

import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import { useRouter, useSearchParams } from 'next/navigation'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import BlankCard from '@/components/shared/BlankCard'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable, Pageable2 } from 'table'

import { SelectItem } from 'select'

import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getCommCd,
  getCtpvCd,
  getExcelFile,
  getLocGovCd,
  getToday,
  isNumber,
} from '@/utils/fsms/common/comm'
import { TableHead } from '@mui/material'
import { TableCell } from '@mui/material'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import CarReviveModal from './CarReviveModal'
import { hisstncncheadCells, stncncheadCells } from '@/utils/fsms/headCells'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TaxiDetailDataGrid from './TaxiDetailDataGrid'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { isArray, trim } from 'lodash'

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
    to: '/stn/cnc',
    title: '자동차망비교조회',
  },
]

export interface Row {

  carBrnoTag:React.ReactNode
  vonrNmTag:React.ReactNode
  vhclNoTag:React.ReactNode
  carRrnoHidTag:React.ReactNode
  koiNmTag:React.ReactNode
  carLocgovNmTag:React.ReactNode
  vhclSttsNmTag:React.ReactNode

  vhclNo: string // 차량번호
  brno: string // 사업자등록번호
  bzentyNm: string // 업체명
  locgovCd: string // 지자체코드
  vhclSttsCd: string // 차량상태
  carBrno: string // 사업자번호
  vonrNm: string // 차주명
  carRrno: string // 주민번호
  carRrnoHid: string // 주민번호 암호화
  carKoiCd: string // 유종
  carBzmnSeCd: string // 사업자구분
  carLocgovCd: string // 지자체코드
  carLocgovNm: string // 지자체명
  vhclSttsNm: string // 차량상태명
  bzmnSeNm: string // 사업자구분명
  koiNm: string // 유종명
  mdfcnDt: string // 수정일자
  carDscntYn: string // 차량할인상태여부
  netKoiCd: string | null // 자동차망 유종
  netKoiNm: string // 자동차망 유종명
  netLocgovCd: string | null // 자동차망 지자체정보
  netReowUserSeCd: string | null // 자동차망 대표사용자구분코드
  netReowNm: string // 자동차망 소유자명
  newLocgovNm: string // 변경된 지자체명
  netCarBrno: string // 자동차망 사업자번호
  netCarRrno: string // 자동차망 주민번호
  netVhclSttsCd: string | null // 자동차망 차량상태
  netVhclSttsNm: string //자동차망 차량상태명
  carReowNmChangeYn: string // 대표자명 변경여부
  carBrnoChangeYn: string // 사업자번호 변경여부
  carRrnoChangeYn: string // 주민번호 변경여부
  koiCdChangeYn: string // 유종 변경여부
  locgovCdChangeYn: string // 지자체코드 변경여부
  vhclSttsCdChangeYn: string // 차량상태 변경여부
  gbFsms: string // FSMS 구분
  reowNm: string // 업체명
  rrno: string // 주민번호
  koiCd: string // 유종
  locgovNm: string // 지자체명
  sttsCd: string // 차량상태
  ersrYmd: string // 말소일자
  gbCar: string // 차량구분
  netVhclNo: string // 자동차망 차량번호
  netBrno: string // 자동차망 사업자번호
  netRrno: string // 자동차망 주민번호
  netErsrYmd: string | null // 자동차망 말소일자
  crdcoSttsNm: string // 카드사상태
  crdcoCd: string
  cardNo: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd:string
  locgovCd:string
  vhclSttsCd:string
  vhclNo:string
  bzentyNm:string
  brno:string
}
export interface ButtonGroupActionProps {
  onClickFSMSApproAllBtn: () => void // FSMS 일괄 승인 버튼 action
  onClickFSMSCanCelAllBtn: () => void // FSMS 일괄 말소 버튼 action
}

export const TaxiPage = () => {

  const userInfo = getUserInfo();
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [hisRows, setHisRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [historyLoading, setHistoryLoading] = useState(false) // 로딩여부
  const [selectedChekcedRows, setSelectedChekcedRows] = useState<string[]>([]) // 체크 로우 데이터
  const [historyflag, setHistoryFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [openCarReviveModal, setOpenCarReviveModal] = useState<boolean>(false)
  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [searchedSttsCd, setSearchedSttsCd] = useState<string>('') // 검색한 자동차망 차량상태
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd:'',
    locgovCd:'',
    vhclSttsCd:'',
    vhclNo:'',
    bzentyNm:'',
    brno:'',
  })

   // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
   useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (selectedRow !== undefined) {
      fetchHistoryData()
    }    
  }, [historyflag])

  // 상세정보에 있는 Button actions
  const buttonGroupActions: ButtonGroupActionProps = {

    onClickFSMSApproAllBtn: function (): void {
      if (dataValid('010')) {      
        if (selectedChekcedRows.length > 1) {
          alert('단일데이터만 처리 가능합니다.'); 
        } else {
          setOpenCarReviveModal(true)
        }        
      }
    },

    onClickFSMSCanCelAllBtn: function (): void {
      if (dataValid('000')) {
        modifiyFsmsErsrMng()
      }      
    },
  }

  const dataValid = (type:'000'|'010') => {

    if (isArray(selectedChekcedRows) && selectedChekcedRows.length === 0) {
      alert('선택된 행이 없습니다.')
      return false;
    } else {

      let rst = true;

      for(let i=0; i<selectedChekcedRows.length; i++) {
        const valiId = Number(selectedChekcedRows[i].replace('tr', ''));
        if (rows[valiId].vhclSttsCd !== type) {
          rst = false;
          alert('처리 할 데이터가 올바르지 않습니다.');
          break;
        }
      }

      return rst;
    }
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()    
    setParams((prev) => ({ ...prev, page:1, size:10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setExcelFlag(false)
    if (name === 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, page: 1, size:10, [name]: value }))
      }      
    } else {
      setParams((prev) => ({ ...prev, page: 1, size:10, [name]: value }))
    }    
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedIndex(index ?? -1)
    setHistoryFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 체크박스 이벤트
  const handleCheckChange = (selected: string[]) => {
    setSelectedChekcedRows(selected)
  }

  const fetchHistoryData = async () => {
    
    setHisRows([])

    try {

      setHistoryLoading(true)

      if (selectedRow == null)return

      const searchObj = {
        vhclNo:trim(selectedRow?.vhclNo),
        brno:selectedRow?.carBrno.replaceAll('-', ''),
        netVhclSttsCd:selectedRow?.netVhclSttsCd,
      }

      const endpoint: string = '/fsm/stn/cnc/tx/getCarNetCmprHist' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data) {
        setHisRows(response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const modifiyFsmsErsrMng = async () => {

    if (!confirm('해당 차량을 말소하시겠습니까?')) {
      return
    }

    if (!(userInfo && 'lgnId' in userInfo && userInfo.lgnId)) {
      alert('로그인 정보가 없습니다. 다시 시도하세요')
      return
    }

    try {

      setLoadingBackdrop(true)
      let endpoint: string = `/fsm/stn/cnc/tx/updateCarNetCmprErsrMng`
      // 요청시 코드 정상적으로 돌아감. 파라미터정의서 거꾸로 나와있음.
      //차량 복원이 차량 말소임
      // 아래 하드코딩은 파라미터정의서에서 따옴
      let selectedData: any[] = []
      selectedChekcedRows.forEach((id) => {
        const row = rows[Number(id.replace('tr', ''))]

        if (row.mdfcnDt?.replaceAll('-', '').substring(0, 8) === getToday()) {
          alert(
            `금일 수정된 차량(${row.vhclNo})은 말소할 수 없습니다.\n다시 요청해주세요`,
          )
          throw Error
          return // 현재 반복만 건너뛴다.
        }

        selectedData.push({
          vhclNo: row.vhclNo,
          brno: row.carBrno,
          koiCd: row.carKoiCd,
          locgovCd: row.carLocgovCd,
          dscntYn: row?.carDscntYn,
          sttsCd: row?.vhclSttsCd,
          ersrYmd: getToday(),
          ersrRsnCd: '12',
          chgRsnCd: '008',
          mdfrId: userInfo.lgnId,
          ersrType: 'ERASURE',
        })
      })

      if (selectedData.length === 0) {
        alert('선택하신 데이터는 금일 수정되어 처리할 수 없습니다.')
        return
      }

      // 명칭 나중에 바뀔 수 있음.
      const updatedRows = { vhcleErsrMngReqstDto: selectedData }
      const response = await sendHttpRequest('PUT', endpoint, updatedRows, true, {cache: 'no-store' })

      if (response && response.resultType === 'success') {
        alert(response.message)
        setFlag((prev) => !prev)
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(true)      
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setSelectedChekcedRows([])    
    setHisRows([])    
    setRows([])
    setTotalRows(0)
    setPageable({pageNumber: 1, pageSize: 10, totalPages: 1 })

    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return
    }

    if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return
    }

    setSearchedSttsCd(params.vhclSttsCd);
    setLoading(true)
    setExcelFlag(true)

    try {
      
      const endpoint: string = '/fsm/stn/cnc/tx/getAllCarNetCmpr' + toQueryParameter(params);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data) {      
        mkRows(response.data.content)
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
    }
  }

  const mkRows = (row:Row[]) => {

    const temp:Row[] = [];

    row.map((item) => {

      const carBrno = compareVal(item.carBrno, item.netBrno) ? brNoFormatter(item.carBrno) : <Box color={'#f44336'}>{brNoFormatter(item.carBrno)}</Box>
      const vonrNm = compareVal(item.vonrNm, item.netReowNm) ? item.vonrNm : <Box color={'#f44336'}>{item.vonrNm}</Box>
      const vhclNo = compareVal(item.vhclNo, item.netVhclNo) ? item.vhclNo : <Box color={'#f44336'}>{item.vhclNo}</Box>
      const carRrnoHid = compareVal(item.carRrnoHid, item.netRrno) ? rrNoFormatter(item.carRrnoHid) : <Box color={'#f44336'}>{rrNoFormatter(item.carRrnoHid)}</Box>
      const koiNm = compareVal(item.koiNm, item.netKoiNm) ? item.koiNm : <Box color={'#f44336'}>{item.koiNm}</Box>
      const carLocgovNm = compareVal(item.carLocgovCd, item.newLocgovNm) ? item.carLocgovNm : <Box color={'#f44336'}>{item.carLocgovNm}</Box>
      const vhclSttsNm = compareVal(item.vhclSttsNm, item.netVhclSttsNm) ? item.vhclSttsNm : <Box color={'#f44336'}>{item.vhclSttsNm}</Box>

      temp.push({
        ...item
        , carBrnoTag:carBrno
        , vonrNmTag:vonrNm
        , vhclNoTag:vhclNo
        , carRrnoHidTag:carRrnoHid
        , koiNmTag:koiNm
        , carLocgovNmTag:carLocgovNm
        , vhclSttsNmTag:vhclSttsNm
      })
    });

    setRows(temp)
  }

  const compareVal = (fsmData:string, carnetData: string) => {
    
    if (carnetData) {      
      if (fsmData !== carnetData) {
        return false
      }
    }
    
    return true
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
        `/fsm/stn/cnc/tx/getExcelAllCarNetCmpr?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}`

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

  // 선택된 selectedRows에 접근해야해서 page 내부에 있음.
  const customHeader = (
    handleSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ): React.ReactNode => {
    return (
      <TableHead>
        <TableRow>
          <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={9}>
            FSMS 차량 정보
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={6}>
            변경사항
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            <CustomFormLabel className="input-label-none" htmlFor="all">
              전체선택
            </CustomFormLabel>
            <CustomCheckbox
              id="all"
              indeterminate={
                selectedChekcedRows.length > 0 && selectedChekcedRows.length < rows.length
              }
              checked={selectedChekcedRows.length === rows.length}
              onChange={handleSelectAll}
              tabIndex={-1}
              inputProps={{
                'aria-labelledby': 'select all desserts',
              }}
            />
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>사업자번호</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>업체명</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>차량번호</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            주민(법인)번호{' '}
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>유종</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>구분</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>지자체명</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태</TableCell>

          <TableCell style={{ whiteSpace: 'nowrap' }}>업체명 변경</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            사업자번호 변경
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>주민번호 변경</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>유종 변경</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>지자체 변경</TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>차량상태 변경</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return (
    <PageContainer
      title="자동차망비교조회"
      description="자동차망비교조회 페이지"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="form-list">
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
              {/* 자동차망 차량상태는 전체, 정상, 말소만 가능 (CTS0에서 받아온 값 수정) */}
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-vhclSttsCd"
                >
                  자동차망 차량상태
                </CustomFormLabel>
                <CommSelect                
                  cdGroupNm='CTS1'                   
                  pValue={params.vhclSttsCd}          
                  handleChange={handleSearchChange} 
                  pName='vhclSttsCd'                                      
                  htmlFor={'sch-vhclSttsCd'}
                  addText='전체'
                />
              </div>
            </div>
            {/* 신청일자 datePicker */}
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-vhclNo"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  name="vhclNo"
                  value={params.vhclNo ?? ''}
                  onChange={handleSearchChange}
                  type="text"
                  id="ft-vhclNo"
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-bzentyNm"
                >
                  업체명
                </CustomFormLabel>
                <CustomTextField
                  type="text"
                  id="ft-bzentyNm"
                  name="bzentyNm"
                  fullWidth
                  value={params.bzentyNm ?? ''}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-brno"
                >
                  사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  name="brno"
                  value={params.brno ?? ''}
                  onChange={handleSearchChange}
                  type="text"
                  id="ft-brno"
                  fullWidth
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
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      {/* 검색영역 끝 */}

      {/* 검색영역 끝 */}
      <Box>
        <TableDataGrid
          headCells={stncncheadCells}
          customHeader={customHeader}
          rows={rows}
          totalRows={totalRows}
          selectedRowIndex={selectedIndex}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          onRowClick={handleRowClick}
          onCheckChange={handleCheckChange}
          caption={'택시 자동차망비교 목록 조회'}
          pageable={pageable}
        />
      </Box>

      <>
        <>
          <BlankCard
            className="contents-card"
            title={`택시차량비교정보 ${selectedRow?.bzmnSeNm ? `(${selectedRow?.bzmnSeNm})` : ''}`}
            buttons={
              searchedSttsCd ? [
                {
                  label: 'FSMS 차량복원',
                  disabled: !(totalRows > 0 && params.vhclSttsCd === '000' && params.vhclSttsCd === searchedSttsCd),
                  onClick: () => buttonGroupActions?.onClickFSMSApproAllBtn(),
                  color: 'outlined',
                },
                {
                  label: 'FSMS 차량말소',
                  disabled: !(totalRows > 0 && params.vhclSttsCd === '010'),
                  onClick: () => buttonGroupActions?.onClickFSMSCanCelAllBtn(),
                  color: 'outlined',
                }
              ] : []
            }
          >
            <TaxiDetailDataGrid 
              hisRows={hisRows} 
              loading={historyLoading} 
            />
          </BlankCard>
        </>
      </>
      {/* 상세 영역 끝 */}
      <>
        {openCarReviveModal ? (
          <CarReviveModal
            title={'차량복원'}
            open={openCarReviveModal}
            data={rows[Number(selectedChekcedRows[0].replace('tr', ''))]}
            onCloseClick={() => setOpenCarReviveModal(false)}
            reload={() => setFlag(!flag)}
          />
        ) : null}
      </>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default TaxiPage
