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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'
import { toQueryString } from '@/utils/fsms/utils'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

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
import TrDetail from './TrDetail'
import TrModifyModal from './TrModifyModal'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
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
import { Dialog } from '@mui/material'
import {stnVdcmVhcleDtaChange} from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'



export interface Row {
  vhclNo: string;          // 차량번호
  bgngDt: string;          // 적용시작일자
  endDt: string;           // 적용종료일자
  locgovCd: string;        // 시도명+관할관청
  vonrNm: string;          // 소유자명
  chgYn: string;           // 변경구분
  usgSeCd: string;         // 용도구분
  aplcnYmd: string;        // 적용일자
  orgAplcnYmd: string;     // 이전적용일자
  hstrySn: number;         // 이력순번
  vonrRrno: string;        // 주민등록번호
  bfchgVhclTonCd: string;  // 변경전톤수코드
  aftchVhclTonCd: string;  // 변경후톤수코드
  bfchgKoiCd: string;      // 변경전유종코드
  aftchKoiCd: string;      // 변경후유종코드
  bfchgVhclTonCdNm: string; // 변경전톤수
  aftchVhclTonCdNm: string; // 변경후톤수
  bfchgKoiCdNm: string;    // 변경전유종
  aftchKoiCdNm: string;    // 변경후유종
  tonCdChgYn: string;      // 톤수변경여부코드
  koiCdChgYn: string;      // 유종변경여부코드
  tonCdChgYnNm: string;    // 톤수변경여부
  koiCdChgYnNm: string;    // 유종변경여부
  trsmYn: string;          // 전송여부
  trsmDt: string;          // 전송일자
  vonrSn: string;          // 차량순번
  rgtrId: string;          // 등록자아이디
  regDt: string;           // 등록일자
  mdfrId: string;          // 수정자아이디
  mdfcnDt: string;         // 수정일자
  chgRsnCn: string;        // 변경사유
  delYn: string;           // 삭제여부
  vhclSttsCd: string;      // 차량상태
  // bfchgKoiCdNm?: string;
  // aftchKoiCdNm?: string;

  // bfchgVhclTonCdNm?: string;
  // aftchVhclTonCdNm?: string;
}


// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TrPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [dtFlag, setDtFlag] = useState<boolean>(false) // 전체날짜조회를 위한 플래그
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 클릭로우
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [confirmOpen, setConfirmOpen] = useState(false); // 다이얼로그 상태
  const [chgYnCode, setChgYnCode] = useState<SelectItem[]>([]) //변경 구분
  //  const [usgSeCode, setUsgSeCode] = useState<SelectItem[]>([]) //용도 구분 

  const [open, setOpen] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'I' | 'U'>('I')

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태


  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // useEffect(() => {
  //   setFlag((prev) => !prev)
  // },[params.locgovCd])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    const dateRangeEnd = getDateRange('d', -30)
    let startDate = dateRange.startDate
    let endDate = dateRangeEnd.startDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    //변경구분 데이터 셋팅 (코드함수 없음.)
    let chgYnCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
      {
        label: '유종변경만',
        value: '01',
      },
      {
        label: '톤수변경만',
        value: '02',
      },
    ]
    setChgYnCode(chgYnCodes)

    // //변경구분 데이터 셋팅 (코드함수 없음.)
    // let usgSeCodes: SelectItem[] = [
    //   {
    //     label: '전체',
    //     value: '',
    //   },
    //   {
    //     label: '택배차량',
    //     value: '01',
    //   },
    //   {
    //     label: '일반차량',
    //     value: '02',
    //   },
    // ]
    //setusgSeCode(usgSeCodes)
    // setFlag((prev) => !prev)
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  useEffect(() => {
    //if (params.ctpvCd && params.locgovCd) {
    if(flag != null){
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
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    setSelectedIndex(-1)
    setSelectedRow(null)
    try {

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vdcm/tr/getAllVhcleDtaChangeMng?page=${params.page}&size=${params.size}` +
      `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
      `${params.chgYn ? '&chgYn=' + params.chgYn : ''}` +
      `${params.usgSeCd ? '&usgSeCd=' + params.usgSeCd : ''}` 

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setSelectedRow(null)
        setSelectedIndex(-1)
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber : response.data.pageable.pageNumber+1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        alert('차량제원변경관리 조회에 실패하였습니다.')
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


  const excelDownload = async () => {
    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try{
      setLoadingBackdrop(true)

    let endpoint: string =
      `/fsm/stn/vdcm/tr/getExcelVhcleDtaChange?` +
      `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
      `${params.chgYn ? '&chgYn=' + params.chgYn : ''}` +
      `${params.usgSeCd ? '&usgSeCd=' + params.usgSeCd : ''}` 
    await getExcelFile(endpoint, '화물_차량제원변경관리_' + getToday() + '.xlsx')
  }catch(error){
    console.error("ERROR :: ", error)
  }finally{
    setLoadingBackdrop(false)
  }
}


  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, rowIndex?: number) => {
    setSelectedRow(row)
    setSelectedIndex(rowIndex??-1);
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g
    const regex2 = /[\-~`!@#$%^&*_+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'searchStDate' || name == 'searchEdDate'){
      setParams((prev) => ({ ...prev, page: 1, [name]: value }))
    }else if(name == 'vhclNo'){
      setParams((prev) => ({ ...prev, page: 1, [name]: value.replace(regex, '').replace(' ','') }))
    }
    // else if(name == 'vonrNm'){
    //   setParams((prev) => ({ ...prev, page: 1, [name]: value.replace(regex2, '').replace(' ','') }))
    // }
    else{
      setParams((prev) => ({ ...prev, page: 1, [name]: value}))
    }
    setExcelFlag(false)
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleClickInsert = () =>{
      setModalType('I')
      setOpen(true)
  }


  const handleClickModify = () => {
    if (!selectedRow) {
      alert('선택된 휴지정보가 없습니다.')
      return
    }
    if(selectedRow.tonCdChgYn != 'Y'){
      alert('톤수가 변경처리된 차량정보가 아닙니다.\n톤수를 변경한 후 진행해 주십시오.')
      return
    }
    if(selectedRow.aplcnYmd <= getToday()){
      alert('이미 지난 적용일자는 수정할 수 없습니다.')
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

  const ConfirmData = async ( deletedRow:Row) => {
    setLoading(true)
    try {

      let endpoint: string =
        `/fsm/stn/vdcm/tr/deleteVhcleDtaChangeMng`
      const response = await sendHttpRequest('DELETE', endpoint, {
        vhclNo: deletedRow.vhclNo,
        hstrySn: deletedRow.hstrySn,
        aplcnYmd: deletedRow.aplcnYmd ? deletedRow.aplcnYmd.replaceAll('-','') : '',

        // Include any additional fields as necessary
      }, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' ) {
        return 'success'
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error modifying data:', error);
      return 'false'
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async () => {
    setConfirmOpen(false);
    setLoading(true); // Start loading
  
    // Call the API request
    const result = await ConfirmData(selectedRow as Row);
  
    if (result === 'success') {
      // Success handling
      alert('삭제 요청이 완료되었습니다.');
      fetchData()
    } else {
      // Failure handling
      alert('삭제 요청이 실패했습니다.');
    }  
    setLoading(false); // Stop loading
  };



  const handleDeleteClick = () => {
    if (!selectedRow) return; // modifyRow 수정할 데이터 없으면 취소

    if(selectedRow?.delYn !== 'N' && selectedRow?.trsmYn !== 'N'){
      alert('삭제할 수 없는 차량제원정보 입니다.')
      return;
    }

      setConfirmOpen(true); // 미확정인 경우 확인 다이얼로그 열기
  }

  const handleCloseConfirm = () => {

    setSelectedRow(rows.length > 0 ? rows[selectedIndex] : null)
    setConfirmOpen(false);
  };

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)  
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
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
                onKeyDown={handleKeyDown}
                inputProps={{
                  maxLength:9
                }}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vonrNm">
                소유자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrNm"
                name="vonrNm"
                value={params.vonrNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
                inputProps={{
                  maxLength : 50
                }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                적용일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                적용일자 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ max: params.searchEdDate }}
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                적용일자 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                }}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-select-03"
              >
                변경구분
              </CustomFormLabel>
              <select
                id="ft-select-03"
                className="custom-default-select"
                name="chgYn"
                value={params.chgYn}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {chgYnCode.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-usgSeCd"
              >
                용도구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="810"
                pValue={params.usgSeCd}
                handleChange={handleSearchChange}
                pName="usgSeCd"
                htmlFor={'sch-usgSeCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button
              // onClick={() => fetchData()}
              type="submit"
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => handleClickInsert()}
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
              onClick={() => handleDeleteClick()}
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
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnVdcmVhcleDtaChange} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedIndex}
          caption={"화물 차량제원변경관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}

    {/* 확인 다이얼로그 */}
    <Dialog open={confirmOpen} 
    //onClose={handleCloseConfirm}
    >
          <DialogTitle>확정 확인</DialogTitle>
          <DialogContent>
            <DialogContentText>해당 정보를 삭제하시겠습니까??</DialogContentText>
          </DialogContent>
          <DialogActions>
          <Button onClick={handleDelete} color="primary">
              확인
            </Button>
            <Button onClick={handleCloseConfirm} color="primary">
              취소
            </Button>
          </DialogActions>
        </Dialog>


      {
        selectedRow && (
          <BlankCard className="contents-card" title="상세정보">
            <TrDetail data={selectedRow} />
          </BlankCard>
        )
      }
      <TrModifyModal
        open={open}
        row={selectedRow}
        handleClickClose={handleClickClose}
        type={modalType}
        reload={() => fetchData()}
      />
    </Box>
  )
}

export default TrPage
