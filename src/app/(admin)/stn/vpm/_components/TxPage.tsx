'use client'
import {
  Box,
  Button,
  FormControlLabel,
} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

// utils
import {
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { Pageable2 } from 'table'
import {
  getExcelFile,
  isNumber,
} from '@/utils/fsms/common/comm'
import TxDetail from './TxDetail'
import TxModifyModal from './TxModifyModal'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

import { stnVpmTxHC } from '@/utils/fsms/headCells'
import {
  getToday,
  getDateRange,
  getFormatToday,
  dateToString,
} from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { toQueryParameter } from '@/utils/fsms/utils'
import VhclStopDelModal from '@/app/components/tx/vhclStopDelModal/VhclStopDelModal'
import { vhclStopData } from '@/app/components/tx/vhclStopDelModal/VhclStopDelModal'

export interface Row {
  brno: string //사업자번호
  vhclNo: string //차량번호
  rprsvNm: string //수급자명
  rprsvRrnoS: string //수급자주민번호
  koiCdNm: string //유종
  koiCd: string //유종코드
  pauseBgngYmd: string //휴지시작일
  pauseEndYmd: string //휴지종료일
  pauseRsnCn: string //휴지사유
  rgtrId: string //등록자아이디
  regDt: string //등록일자
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일자
  hstrySn: string //순번
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  brno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TxPage = () => {

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [dtFlag, setDtFlag] = useState<boolean>(false) // 전체날짜조회를 위한 플래그
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [open, setOpen] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'I' | 'U'>('I')

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false) // 로딩상태

  const [delFlag, setDelFlag] = useState<boolean>(true) // 삭제버튼활성화 플래그

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    bgngDt: getDateRange('d', 30).startDate, // 시작일
    endDt: getDateRange('d', 30).endDate, // 종료일
    brno:'',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const [vhclStopDelOpen, setVhclStopDelOpen] = useState<boolean>(false)
  const [delResult, setDelResult] = useState<boolean>(false)
  const [vhclStopData, setVhclStopData] = useState<vhclStopData>({
    brno: '',
    vhclNo: '',
    bgngYmd: '',
    endYmd: '',
    type: '',
    vhclRestrtYmd: '',
  }) // 차량정지삭제 데이터

  useEffect(() => {
    if (flag != null) {
      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setSelectedRowIndex(-1)
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (delResult) {
      deleteData();
    }
  }, [delResult]);

  useEffect(() => {
    setDelResult(false);
    setVhclStopData({
      brno: '',
      vhclNo: '',
      bgngYmd: '',
      endYmd: '',
      type: '',
      vhclRestrtYmd: '',
    });

    if (selectedRowIndex === -1) {
      setDelFlag(true);
    } else {
      
      const pauseEndYmd = rows[selectedRowIndex].pauseEndYmd;
     
      // 휴지종료일자가 금일과 같거나 작을시 조기종료 불가
      if (Number(pauseEndYmd) <= Number(getToday())) {
        setDelFlag(true);
      } else {
        setDelFlag(false);
      }
    }

  }, [selectedRowIndex]);

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    try {
      
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }
      
      if (!params.bgngDt || !params.endDt) {
        alert('휴지기간을 입력해주세요.')
        return
      }
      
      setLoading(true)
      setExcelFlag(true) // 엑셀기능 동작여부

      // 검색 조건에 맞는 endpoint 생성
      const searchObj = {
        ...params,
        bgngDt:dtFlag ? null : params.bgngDt.replaceAll('-', ''),
        endDt:dtFlag ? null : params.endDt.replaceAll('-', ''),
        brno:params.brno.replaceAll('-', ''),
      };

      const endpoint: string = '/fsm/stn/vpm/tx/getAllVhclePauseMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store'});

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
      // 에러시
      console.log('error', error);
    } finally {
      setLoading(false)
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

    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return
    }

    if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return
    }

    if (!params.bgngDt || !params.endDt) {
      alert('휴지기간을 입력해주세요.')
      return
    }

    try {
      setLoadingBackdrop(true)

      const searchObj = {
        ...params,
        bgngDt:dtFlag ? null : params.bgngDt.replaceAll('-', ''),
        endDt:dtFlag ? null : params.endDt.replaceAll('-', ''),
        brno:params.brno.replaceAll('-', ''),
      };

      const endpoint: string = '/fsm/stn/vpm/tx/getExcelVhclePauseMng' + toQueryParameter(searchObj)      
      await getExcelFile(endpoint, '차량휴지관리_' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRowIndex(index ?? -1)
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {

    setExcelFlag(false)
    const { name, value } = event.target

    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField = name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]
      if (name === 'bgngDt' && value <= otherDate) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else if (name === 'endDt' && value >= otherDate) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else if (name === 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))  
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleClickModify = () => {
    if (selectedRowIndex < 0) {
      alert('선택된 휴지정보가 없습니다.')
      return
    }
    setModalType('U')
    setOpen(true)
  }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 삭제
  const handleReject = () => {
    if (selectedRowIndex === -1) {
      alert('선택된 내역이 없습니다.');
    } else {
      setVhclStopData({
        brno: rows[selectedRowIndex]?.brno ?? '',
        vhclNo: rows[selectedRowIndex]?.vhclNo ?? '',
        bgngYmd: rows[selectedRowIndex]?.pauseBgngYmd ?? '',
        endYmd: rows[selectedRowIndex]?.pauseEndYmd ?? '',
        type: 'PAUSE',
        vhclRestrtYmd: '',
      })
      setVhclStopDelOpen(true)
    }    
  }

  const deleteData = async () => {
    
    try {

      setLoadingBackdrop(true)
      
      const endpoint:string = '/fsm/stn/vpm/tx/deleteVhclePauseMng';  
      const params = { ...vhclStopData, hstrySn:Number(rows[selectedRowIndex]?.hstrySn) }

      const response = await sendHttpRequest('DELETE', endpoint, params, true, { cache: 'no-store' })

      if (response && response.resultType === 'success') {
        alert(response.message)
        setParams((prev) => ({ ...prev, page: 1, size: 10 }))
        setFlag((prev) => !prev)
      } else {        
        alert(response.message)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Box component="form" sx={{ mb: 2 }} onSubmit={handleAdvancedSearch}>
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
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                사업자번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group" style={{ maxWidth: '5rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="dtFlag"
                    value={dtFlag}
                    onChange={() => setDtFlag(prev => !prev)}
                  />
                }
                label="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                휴지일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                휴지일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngDt"
                value={params.bgngDt}
                onChange={handleSearchChange}
                disabled={dtFlag}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                휴지일자 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endDt"
                value={params.endDt}
                onChange={handleSearchChange}
                disabled={dtFlag}
                inputProps={{
                  min: params.bgngDt,
                }}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              type='submit'
              variant="contained"
              color="primary"
            >
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
              onClick={() => handleReject()}
              variant="contained"
              color="error"
              disabled={delFlag}
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
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnVpmTxHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"택시 차량휴지관리 목록 조회"}
        />
      </Box>

      {/* 테이블영역 끝 */}
      {selectedRowIndex > -1 && (
        <BlankCard className="contents-card" title="상세정보">
          <TxDetail data={rows[selectedRowIndex]} />
        </BlankCard>
      )}

      {open ? (
        <TxModifyModal
          open={open}
          row={rows[selectedRowIndex]}
          handleClickClose={handleClickClose}
          type={modalType}
          reload={fetchData}
        />
      ) : null}

      {vhclStopDelOpen ? (
        <VhclStopDelModal
          vhclStopData={vhclStopData}
          setVhclStopData={setVhclStopData}
          open={vhclStopDelOpen}
          setOpen={setVhclStopDelOpen}
          setDelResult={setDelResult}
        />
      ) : null}

    </Box>
  )
}

export default TxPage
