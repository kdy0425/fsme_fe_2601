'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getExcelFile,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import TrDetail from './TrDetail'
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { stnVemCardTrHC } from '@/utils/fsms/headCells'
import TrModifyModal from './TrModifyModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils'

export interface Row {
  vhclNo: string //차량번호
  aplcnYmd: string //처리일자
  exsCrno: string //법인등록번호(원본)
  exsCrnoS: string //법인등록번호(암호화)
  exsVonrRrno: string //주민등록번호(원본)
  exsVonrRrnoSecure: string //주민등록번호(별표)
  exsVonrNm: string //소유자명
  exsVonrBrno: string //사업자등록번호
  exsVhclPsnCd: string //소유구분코드
  exsVhclPsnNm: string //소유구분
  chgRsnCd: string //처리구분코드
  chgRsnNm: string //처리구분
  chgRsnCn: string //사유
  rgtrId: string //등록자아이디
  regDt: string //등록일시
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일시
  trsmYn: string //전송여부
  vonrSn: string //차량소유자일련번호
  vhclSttsCd: string //차량상태코드
  vhclSttsNm: string //차량상태
  locgovCd: string //관할관청
  locgovNm: string //관할관청
  vonrNm: string //차량 소유자명
  vhclPsnNm: string
  exsCardNoS: string
  exsCardNoHid: string
  exsVonrRrnoS: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  // ctpvCd: string
  //locgovCd:string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TrPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'I' | 'U'>('I')
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [eraseRsn, setEraseRsn] = useState<string>('')
  const [ersrCancelFlag, setErsrCancelFlag] = useState<boolean>(true)
  const userInfo = getUserInfo()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

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
    if (flag != null) {
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
    setSelectedRowIndex(-1)
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vem/tr/getAllVhcleErsrMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.exsVonrNm ? '&exsVonrNm=' + params.exsVonrNm : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.chgRsnCd ? '&chgRsnCd=' + params.chgRsnCd : ''}`

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
      setLoading(false)
    }
  }
  const excelDownload = async () => {
    if (!excelFlag) {
      alert('조회 후 이용해주시기 바랍니다.')
      return
    }

    if (rows.length <= 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        `/fsm/stn/vem/tr/getExcelVhcleErsrMng?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.exsVonrNm ? '&exsVonrNm=' + params.exsVonrNm : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.chgRsnCd ? '&chgRsnCd=' + params.chgRsnCd : ''}`

      await getExcelFile(endpoint, '차량말소관리_' + getToday() + '.xlsx')
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
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedRowIndex(index ?? -1)
    if (params.locgovCd !== '') {
      if (
        row.vhclSttsCd == '99' &&
        (row.chgRsnCd == '12' || row.chgRsnCd == '06')
      ) {
        if (row.locgovCd == params.locgovCd && row.exsVonrNm == row.vonrNm) {
          setErsrCancelFlag(false)
        }
        //나중에 유저 권한 시스템 관리자면 localcd 는 안봄 이부분 추가하기
        //if(){
        //
        //}
      } else {
        setErsrCancelFlag(true)
      }
    } else {
      setErsrCancelFlag(true)
    }
  }

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    const regex2 = /[\-~`!@#$%^&*_+={}[\]|\\:;"'<>,.?/]/g
    if (name == 'vhclNo') {
      setParams((prev) => ({
        ...prev,
        page: 1,
        [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
      }))
    } else if (name == 'vonrNm') {
      setParams((prev) => ({
        ...prev,
        page: 1,
        [name]: value.replaceAll(regex2, '').replaceAll(' ', ''),
      }))
    } else {
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    }
    setExcelFlag(false)
  }

  const handleClickErsrCancel = async () => {
    if (eraseRsn.length === 0) {
      alert('사유를 입력해주시기 바랍니다.')
      return
    }

    if (eraseRsn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 50) {
      alert('사유를 50자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if (rows[selectedRowIndex]?.vhclSttsCd !== '99') {
      alert('말소된차량이 아닙니다.')
      return
    }

    if (!confirm('차량말소 취소 하시겠습니까?')) {
      return
    }

    let endpoint: string = `/fsm/stn/vem/tr/deleteVhcleErsrMng`

    let body = {
      vhclNo: rows[selectedRowIndex].vhclNo,
      aplcnYmd: rows[selectedRowIndex].aplcnYmd.replaceAll('-', ''),
      chgRsnCn: eraseRsn,
      trsmYn: rows[selectedRowIndex].trsmYn,
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        setConfirmOpen(false)
        setEraseRsn('')
        fetchData()
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleClickModify = () => {
    if (selectedRowIndex < 0) {
      alert('선택된 말소정보가 없습니다.')
      return
    }

    //if (selectedRow?.trsmYn != 'N' || selectedRow.regDt != getToday()) {
    if (selectedRow?.trsmYn != 'N') {
      alert('금일 말소 등록된 차량이 아닌 경우 수정이 불가능합니다.')
      return
    }
    setModalType('U')
    setOpen(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  const handleCloseConfirm = () => {
    // setSelectedRow(rows.length > 0 ? rows[selectedRowIndex] : null)
    setConfirmOpen(false)
  }

  const handleChangeReason = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setEraseRsn(value)
  }

  return (
    <Box>
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
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
                inputProps={{
                  maxLength: 9,
                }}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-exsVonrNm"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-exsVonrNm"
                name="exsVonrNm"
                value={params.exsVonrNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
                inputProps={{
                  maxLength: 50,
                }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                말소일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                말소일자 시작
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
                말소일자 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                  // max: getFormatToday(),
                }}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-chgRsnCd"
              >
                처리구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="035"
                pValue={params.chgRsnCd}
                handleChange={handleSearchChange}
                pName="chgRsnCd"
                htmlFor={'sch-chgRsnCd'}
                addText="전체"
              />
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
              onClick={() => {
                setModalType('I')
                setOpen(true)
              }}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <Button
              onClick={() => handleClickModify()}
              variant="contained"
              color="primary"
            >
              수정
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
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnVemCardTrHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={'화물 차량말소관리 목록 조회'}
        />
      </Box>
      {selectedRow && selectedRowIndex > -1 && (
        <BlankCard
          className="contents-card"
          title="상세정보"
          buttons={[
            {
              label: '말소취소',
              color: 'outlined',
              //onClick: handleClickErsrCancel,
              onClick: () => setConfirmOpen(true),
              disabled: ersrCancelFlag,
              //disabled: false
            },
          ]}
        >
          <TrDetail data={selectedRow} />
        </BlankCard>
      )}
      <TrModifyModal
        open={open}
        row={rows[selectedRowIndex]}
        handleClickClose={handleClickClose}
        type={modalType}
        reload={() => fetchData()}
      />
      <LoadingBackdrop open={loadingBackdrop} />

      <Dialog open={confirmOpen}>
        <DialogTitle>말소취소 확인</DialogTitle>
        <DialogContent>
          <div className="form-group">
            <CustomFormLabel
              className="input-label-display"
              htmlFor="ft-cancelReason"
            >
              <span className="required-text">*</span>취소사유
            </CustomFormLabel>
            <CustomTextField
              id="ft-cancelReason"
              name="cancelReason"
              onChange={handleChangeReason}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickErsrCancel} color="primary">
            확인
          </Button>
          <Button onClick={handleCloseConfirm} color="primary">
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TrPage
