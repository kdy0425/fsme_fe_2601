'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
// types
import { Pageable2 } from 'table'

import TxDetail from './TxDetail'
import { getToday } from '@/utils/fsms/common/dateUtils'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import {
  stnVemTxHC,
  stnVemUserTxHC,
  stnVemCardTxHC,
} from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TxSbsidyQflyErsrModal from './TxSbsidyQflyErsrModal'
import TxAgdrvrErsrModal from './TxAgdrvrErsrModal'
import TxErsrModal from './TxErsrModal'

export interface Row {
  vhclNo: string //차량번호
  brno: string //사업자등록번호
  bzentyNm: string //업체명
  koiCd: string //유종
  bzmnSeCd: string //사업자구분
  dscntYn: string //차량할인여부
  vhclSttsCd: string //차량상태
  locgovCd: string //지자체코드
  ersrYmd: string //말소일자
  ersrRsnCd: string //말소코드
  rgtrId: string //등록자ID
  regDt: string //등록일자
  mdfrId: string //수정자ID
  mdfcnDt: string //수정일자
  currPossYn: string //최근차량상태
  sttsCd: string //사업자 상태코드
  txtnTypeCd: string //과세구분코드
  ntsChgYmd: string //국세청 변경일자
  ntsDclrYmd: string //국세청 신고일자
  bizSttsNm: string //사업자 상태명
  vhclSttsNm: string //차량상태명
  bzmnSeNm: string //사업자구분명
  dscntNm: string //차량할인여부
  ersrRsnNm: string //말소사유명
}

export interface UserRow {
  rrno: string //주민번호
  spid: string //암호화된 주민번호
  flnm: string //수급자명
  custSeNm: string //대리운전여부 출력용
  custSeCd: string //대리운전여부
  vhclNo: string //차량번호
  brno: string //사업자번호
  dcCount: string //할인중인 카드수
}

export interface CardRow {
  cardNoS: string //암호화된 카드번호
  crdcoCd: string //카드사코드
  cardNo: string //카드번호
  vhclNo: string //차량번호
  brno: string //사업자번호
  rrno: string //주민등록번호
  cardSeCd: string //카드사 구분코드
  cardSts: string //카드상태
  dscntYn: string //할인여부
  custSeCd: string //고객구분코드
  dscntChgAplcnDscntYn: string //할인변경적용할인여부
  dscntChgAplcnYmd: string //할인변경적용일자
  rgtrId: string //등록자ID
  agncyDrvBgngYmd: string //대리운전시작일
  agncyDrvEndYmd: string //대리운전종료일
  regDt: string //등록일
  mdfrId: string //수정자ID
  mdfcnDt: string //수정일
  crdcoNm: string //카드사명
  cardSeNm: string //카드구분
  cardSttsNm: string //카드상태명
  dscntChgNm: string //할인변경명
  cardDscntNm: string //카드할인여부명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TxPage = () => {
  const userInfo = getUserInfo()

    const [flag, setFlag] = useState<boolean | null >(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [userRows, setUserRows] = useState<UserRow[]>([]) // 가져온 로우 데이터
  const [userTotalRows, setUserTotalRows] = useState(0) // 총 수
  const [userLoading, setUserLoading] = useState(false) // 로딩여부
  const [selectedUserRowIndex, setSelectedUserRowIndex] = useState<number>(-1)

  const [cardRows, setCardRows] = useState<CardRow[]>([]) // 가져온 로우 데이터
  const [cardTotalRows, setCardTotalRows] = useState(0) // 총 수
  const [cardLoading, setCardLoading] = useState(false) // 로딩여부
  const [selectedCardRowIndex, setSelectedCardRowIndex] = useState<number>(-1)

  const [ersrOpen, setErsrOpen] = useState<boolean>(false) //차량말소
  const [sbsidyQflyErsrOpen, setSbsidyQflyErsrOpen] = useState<boolean>(false) //보조금 수급자격말소
  const [agdrvrErsrOpen, setAgdrvrErsrOpen] = useState<boolean>(false) //대리운전말소
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [selectedVhclIndex, setSelectedVhclIndex] = useState<number>(-1)
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

  // 상세정보 버튼 비활성화, 활성화 객체
  const [agdrvrErsrDisabled, setAgdrvrErsrDisabled] = useState<boolean>(false) // 대리운전말소
  const [sbsidyQflyErsrDisabled, setSbsidyQflyErsrDisabled] = useState<boolean>(false) // 보조금수급자격말소
  const [ersrDisabled, setErsrDisabled] = useState<boolean>(false) // 차량말소
  const [vhcleErsrRstrDisabled, setVhcleErsrRstrDisabled] = useState<boolean>(false) // 차량말소복원

  useEffect(() => {
    if(flag != null){
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (selectedRowIndex > -1) {
      fetchUserData()
    }
  }, [selectedRowIndex])

  useEffect(() => {
    //첫행조회
    setUserRows([])
    setUserTotalRows(0)
    setCardRows([])
    setCardTotalRows(0)
  }, [rows])

  useEffect(() => {
    if (selectedUserRowIndex > -1) {
      fetchCardData()
    }
  }, [selectedUserRowIndex])

  useEffect(() => {
    //첫행조회
    setCardRows([])
    setCardTotalRows(0)
    if (userRows.length > 0) {
      handleUserRowClick(userRows[0], 0)
    }
  }, [userRows])

  useEffect(() => {
    //첫행조회
    if (cardRows.length > 0) {
      handleCardRowClick(cardRows[0], 0)
    }
  }, [cardRows])

  useEffect(() => {
    if (selectedRowIndex > -1 && selectedUserRowIndex > -1) {
      handleDisabled()
    }    
  }, [selectedRowIndex, selectedUserRowIndex, selectedCardRowIndex])

  // 상세정보 버튼 비활성화, 활성화 처리
  const handleDisabled = (): void => {
    setAgdrvrErsrDisabled(validAgdrvrErsr())
    setSbsidyQflyErsrDisabled(validSbsidyQflyErsr())
    setErsrDisabled(validErsr())
    setVhcleErsrRstrDisabled(validVhcleErsrRstr())
  }

  // 대리운전말소
  const validAgdrvrErsr = (): boolean => {
    const cardRow = cardRows[selectedCardRowIndex]
    if (!cardRow) {
      return true
    }
    const today = getToday()
    const adEndYmd = cardRows[selectedCardRowIndex].agncyDrvEndYmd
    if (rows[selectedRowIndex]?.vhclSttsCd === '010') {
      return true
    } else if (userRows[selectedUserRowIndex]?.custSeCd !== '3') {
      return true
    } else if (today >= adEndYmd) {
      return true
    } else {
      return false
    }
  }

  // 보조금수급자격말소
  const validSbsidyQflyErsr = (): boolean => {
    if (rows[selectedRowIndex]?.vhclSttsCd === '010') {
      return true
    } else if (cardRows[selectedCardRowIndex]?.dscntYn !== 'Y') {
      return true
    } else if (userRows[selectedUserRowIndex]?.custSeCd === '3') {
      return true
    } else {
      return false
    }
  }

  // 차량말소
  const validErsr = (): boolean => {
    const today = getToday()
    const currYn = rows[selectedRowIndex]?.currPossYn
    const mdfcnDt = rows[selectedRowIndex]?.mdfcnDt.replaceAll('-', '').substring(0, 8)
    if (currYn === 'Y' && today === mdfcnDt) {
      return true
    } else if (rows[selectedRowIndex]?.vhclSttsCd === '010') {
      return true
    } else if (userRows[selectedUserRowIndex]?.custSeCd === '3') {
      return true
    } else {
      return false
    }
  }

  // 차량말소복원
  const validVhcleErsrRstr = (): boolean => {
    const today = getToday()
    const currYn = rows[selectedRowIndex]?.currPossYn
    const mdfcnDt = rows[selectedRowIndex]?.mdfcnDt.replaceAll('-', '').substring(0, 8)
    if (rows[selectedRowIndex]?.vhclSttsCd === '020') {
      return true
    } else if (currYn === 'Y' && today === mdfcnDt) {
      return true
    } else if (rows[selectedRowIndex]?.vhclSttsCd !== '010') {
      return true
    } else if (userRows[selectedUserRowIndex]?.custSeCd === '3') {
      return true
    } else {
      return false
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    setSelectedRowIndex(-1)
    setLoading(true)
    setExcelFlag(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vem/tx/getAllVhcleErsrMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}`

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

        handleRowClick(response.data.content[0], 0);
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
  /*
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
      `/fsm/stn/vem/tx/getExcelVhcleErsrMng?page=0` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
      `${params.sttsCd ? '&sttsCd=' + params.sttsCd : ''}`

    await  getExcelFile(endpoint, '차량말소관리_' + getToday() + '.xlsx')
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

  */
  // Fetch를 통해 데이터 갱신
  const fetchUserData = async () => {
    setUserLoading(true)
    setSelectedUserRowIndex(-1)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vem/tx/getAllVhcleErsrMngUser?page=0&size=9999` +
        `${rows[selectedRowIndex]?.vhclNo ? '&vhclNo=' + rows[selectedRowIndex].vhclNo : ''}` +
        `${rows[selectedRowIndex]?.brno ? '&brno=' + rows[selectedRowIndex].brno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data.length !== 0) {
        // 데이터 조회 성공시
        setUserRows(response.data)
        setUserTotalRows(response.data.length)
        handleUserRowClick(response.data[0], 0)
      } else {
        // 데이터가 없거나 실패
        setUserRows([])
        setUserTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setUserRows([])
      setUserTotalRows(0)
    } finally {
      setUserLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchCardData = async () => {
    setCardLoading(true)
    setSelectedCardRowIndex(-1)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vem/tx/getAllVhcleErsrMngCard?page=0&size=9999` +
        `${userRows[selectedUserRowIndex]?.vhclNo ? '&vhclNo=' + userRows[selectedUserRowIndex].vhclNo : ''}` +
        `${userRows[selectedUserRowIndex]?.brno ? '&brno=' + userRows[selectedUserRowIndex].brno : ''}` +
        `${userRows[selectedUserRowIndex]?.custSeCd ? '&custSeCd=' + userRows[selectedUserRowIndex].custSeCd : ''}` +
        `${userRows[selectedUserRowIndex]?.flnm ? '&flnm=' + userRows[selectedUserRowIndex].flnm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data.length !== 0) {
        // 데이터 조회 성공시
        setCardRows(response.data)
        setCardTotalRows(response.data.length)
        handleCardRowClick(response.data[0], 0)
      } else {
        // 데이터가 없거나 실패
        setCardRows([])
        setCardTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setCardRows([])
      setCardTotalRows(0)
    } finally {
      setCardLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRowIndex(index ?? -1)
    setSelectedVhclIndex(index ?? -1)
  }, [])

  // 행 클릭 시 호출되는 함수
  const handleUserRowClick = useCallback((userRow: UserRow, index?: number) => {
    setSelectedUserRowIndex(index ?? -1)
  }, [])
  // 행 클릭 시 호출되는 함수
  const handleCardRowClick = useCallback((cardRow: CardRow, index?: number) => {
    setSelectedCardRowIndex(index ?? -1)
  }, [])
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  //차량복원
  const handleClickVhcleErsrRstr = async () => {
    if (confirm('차량말소 복원 시 해당 차량의 다른 사업자 존재할 경우\n다른 사업자 차량번호는 말소 처리됩니다.\n차량말소 복원 시 해당 차량의 카드는 복원되지 않습니다.\n\n해당차량에 대하여 차량말소복원을 하시겠습니까?')) {
 
      try {

        const searchObj = {
          vhclNo:rows[selectedRowIndex].vhclNo,
          brno:rows[selectedRowIndex].brno
        }
        
        // 복원시 중복건 조회
        const endPoint = '/fsm/stn/vem/tx/getVhcleErsrReviv' + toQueryParameter(searchObj);      
        const response = await sendHttpRequest('GET', endPoint, null, true, { cache: 'no-store' });

        if (response && response.resultType === 'success' && response.data) {
          
          // 중복건이 없는경우
          if (response.data.length === 0) {
            updateVhcleErsrRstrMng();
          } else {

            const vhclNo = response.data[0].vhclNo;
            const locgovNm = response.data[0].locgovNm;

            if (confirm('해당 차량에 대한 중복건 있습니다.\n' + '지자체 : ' + locgovNm + '\n차량번호 : ' + vhclNo + '\n\n해당 차량에 대한 말소복원을 하게 되면\n사업자가 다른 동일번호 차량은 말소처리가 됩니다. \n\n 계속하시겠습니까?') ){
              updateVhcleErsrRstrMng();
            }            
          }          

        } else {
          alert('[중복건 조회 실패] 관리자에게 문의 부탁드립니다.');    
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  //차량복원
  const updateVhcleErsrRstrMng = async () => {

    let endpoint: string = `/fsm/stn/vem/tx/updateVhcleErsrRstrMng`

    let body = {
      vhclNo: rows[selectedRowIndex].vhclNo,
      brno: rows[selectedRowIndex].brno,
      koiCd: rows[selectedRowIndex].koiCd,
      locgovCd: rows[selectedRowIndex].locgovCd,
      rgtrId: userInfo.lgnId,
      mdfrId: userInfo.lgnId,
      chgRsnCd: '010',
    }

    try {
      
      setLoadingBackdrop(true)
      
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
      fetchData()
    }
  }

  //차량말소
  const handleClickErsr = () => {
    setErsrOpen(true)
  }

  const handleClickErsrClose = () => {
    setErsrOpen(false)
  }
  //보조금수급자격말소
  const handleClickSbsidyQflyErsr = () => {
    setSbsidyQflyErsrOpen(true)
  }

  const handleClickSbsidyQflyErsrClose = () => {
    setSbsidyQflyErsrOpen(false)
  }
  //대리운전말소
  const handleClickAgdrvrErsr = () => {
    setAgdrvrErsrOpen(true)
  }

  const handleClickAgdrvrErsrClose = () => {
    setAgdrvrErsrOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
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
              <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                사업자번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-bzentyNm">
                업체명
              </CustomFormLabel>
              <CustomTextField
                id="ft-bzentyNm"
                name="bzentyNm"
                value={params.bzentyNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclSttsCd"
              >
                차량상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CTS0"
                pValue={params.vhclSttsCd}
                handleChange={handleSearchChange}
                pName="vhclSttsCd"
                htmlFor={'sch-vhclSttsCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              type='submit'
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            {/*
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            */}
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnVemTxHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          selectedRowIndex={selectedVhclIndex}
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"택시 차량말소관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRowIndex > -1 && (
        <BlankCard className="contents-card" title="수급자목록">
          <TableDataGrid
            headCells={stnVemUserTxHC} // 테이블 헤더 값
            rows={userRows} // 목록 데이터
            totalRows={userTotalRows} // 총 로우 수
            loading={userLoading} // 로딩여부
            onRowClick={handleUserRowClick} // 행 클릭 핸들러 추가
            paging={false}
            cursor={false}
            selectedRowIndex={selectedUserRowIndex}
            caption={"수급자 조회 목록"}
          />
        </BlankCard>
      )}
      {selectedRowIndex > -1 && selectedUserRowIndex > -1 && (
        <BlankCard className="contents-card" title="카드목록">
          <TableDataGrid
            headCells={stnVemCardTxHC} // 테이블 헤더 값
            rows={cardRows} // 목록 데이터
            totalRows={cardTotalRows} // 총 로우 수
            loading={cardLoading} // 로딩여부
            onRowClick={handleCardRowClick} // 행 클릭 핸들러 추가
            paging={false}
            cursor={false}
            selectedRowIndex={selectedCardRowIndex}
            caption={"카드 목록 조회"}
          />
        </BlankCard>
      )}
      {selectedRowIndex > -1 && selectedUserRowIndex > -1 && (
        <BlankCard
          className="contents-card"
          title="상세정보"
          buttons={[
            {
              label: '대리운전말소',
              color: 'outlined',
              onClick: handleClickAgdrvrErsr,
              disabled: agdrvrErsrDisabled,
            },
            {
              label: '보조금수급자격말소',
              color: 'outlined',
              onClick: handleClickSbsidyQflyErsr,
              disabled: sbsidyQflyErsrDisabled,
            },
            {
              label: '차량말소',
              color: 'outlined',
              onClick: handleClickErsr,
              disabled: ersrDisabled,
            },
            {
              label: '차량말소복원',
              color: 'outlined',
              onClick: handleClickVhcleErsrRstr,
              disabled: vhcleErsrRstrDisabled,
            },
          ]}
        >
          <TxDetail
            data={rows[selectedRowIndex]}
            cardData={cardRows[selectedCardRowIndex]}
          />
        </BlankCard>
      )}

      {ersrOpen ? (
        <TxErsrModal
          open={ersrOpen}
          row={rows[selectedRowIndex]}
          handleClickClose={handleClickErsrClose}
          reload={() => fetchData()}
        />
      ) : null}      

      {agdrvrErsrOpen ? (
        <TxAgdrvrErsrModal
          open={agdrvrErsrOpen}
          row={rows[selectedRowIndex]}
          cardRow={cardRows[selectedCardRowIndex]}
          userRow={userRows[selectedUserRowIndex]}
          handleClickClose={handleClickAgdrvrErsrClose}
          reload={() => fetchData()}
        />
      ) : null}
      
      {sbsidyQflyErsrOpen ? (
        <TxSbsidyQflyErsrModal
          open={sbsidyQflyErsrOpen}
          row={rows[selectedRowIndex]}
          cardRow={cardRows[selectedCardRowIndex]}
          handleClickClose={handleClickSbsidyQflyErsrClose}
          reload={() => fetchData()}
        />
      ) : null}
      
      <LoadingBackdrop open={loadingBackdrop} />

    </Box>
  )
}

export default TxPage
