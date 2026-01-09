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
import BsDetail from './BsDetail'
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
import {
  stnVemBsHC,
  stnVemUserBsHC,
  stnVemCardBsHC,
} from '@/utils/fsms/headCells'
import BsErsrModal from './BsErsrModal'

export interface Row {
  vhclNo: string //차량번호
  brno: string //사업자번호
  bzentyNm: string //업체명
  koiCdNm: string //유종
  koiCd: string //유종코드
  vhclSeCdNm: string //면허업종
  vhclSeCd: string //면허업종코드
  dscntYnNm: string //할인여부
  dscntYn: string //할인여부코드
  vhclSttsCdNm: string //차량상태
  vhclSttsCd: string //차량상태코드
  rfidYn: string //RFID차량여부
  ersrYn: string //말소여부
  ersrYmd: string //말소일자
  ersrRsnNm: string //말소사유
  ersrRsnCd: string //말소사유코드
  rgtrId: string //등록자아이디
  regDt: string //등록일자
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일자
  rprsvRrno: string //주민번호
}

interface UserRow {
  rprsvNm: string //수급자명
  rprsvRrno: string //주민등록번호
  delYnNm: string //말소여부
  delYn: string //말소여부코드
}

interface CardRow {
  cardNoHid: string //카드번호
  crdtCeckSeCdNm: string //카드구분
  dscntYnNm: string //할인여부
  cardSttsCdNm: string //카드상태
  aprvYmd: string //카드발급승인일자
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BsPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

    const [flag, setFlag] = useState<boolean | null >(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [userRows, setUserRows] = useState<UserRow[]>([]) // 가져온 로우 데이터
  const [userTotalRows, setUserTotalRows] = useState(0) // 총 수
  const [userLoading, setUserLoading] = useState(false) // 로딩여부

  const [cardRows, setCardRows] = useState<CardRow[]>([]) // 가져온 로우 데이터
  const [cardTotalRows, setCardTotalRows] = useState(0) // 총 수
  const [cardLoading, setCardLoading] = useState(false) // 로딩여부
  const [open, setOpen] = useState<boolean>(false)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

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

  useEffect(() => {
    if(flag !=null){
      if (params.ctpvCd && params.locgovCd) {
        fetchData()
      }
    }
    setSelectedRowIndex(-1)
  }, [flag])

  useEffect(() => {
    if (selectedRowIndex > -1) {
      fetchUserData()
      fetchCardData()
    }
  }, [selectedRowIndex])

  useEffect(() => {
    //첫행조회
    setUserRows([])
    setUserTotalRows(0)
    setCardRows([])
    setCardTotalRows(0)
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
        `/fsm/stn/vem/bs/getAllVhcleErsrMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}`

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
        `/fsm/stn/vem/bs/getExcelVhcleErsrMng?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.vhclSttsCd ? '&vhclSttsCd=' + params.vhclSttsCd : ''}`

      await  getExcelFile(endpoint, '차량말소관리_버스' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchUserData = async () => {
    setUserLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vem/bs/getAllVhcleErsrMngUser?page=0&size=9999` +
        `${rows[selectedRowIndex]?.vhclNo ? '&vhclNo=' + rows[selectedRowIndex].vhclNo : ''}` +
        `${rows[selectedRowIndex]?.brno ? '&brno=' + rows[selectedRowIndex].brno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setUserRows(response.data)
        setUserTotalRows(response.data.length)
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
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/vem/bs/getAllVhcleErsrMngCard?page=0&size=9999` +
        `${rows[selectedRowIndex]?.vhclNo ? '&vhclNo=' + rows[selectedRowIndex].vhclNo : ''}` +
        `${rows[selectedRowIndex]?.brno ? '&brno=' + rows[selectedRowIndex].brno : ''}` +
        `${rows[selectedRowIndex]?.rprsvRrno ? '&rrno=' + rows[selectedRowIndex].rprsvRrno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setCardRows(response.data)
        setCardTotalRows(response.data.length)
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
    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return
    }

    if (!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return
    }
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
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
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRowIndex(index ?? -1)
  }, [])
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  const handleClickClose = () => {
    setOpen(false)
  }

  const handleClickErsr = () => {
    if (selectedRowIndex < 0) {
      alert('선택된 차량정보가 없습니다.')
      return
    }
    if (rows[selectedRowIndex].vhclSttsCd === '99') {
      alert('말소된 차량입니다.')
      return
    }
    setOpen(true)
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
                type="number"
                inputProps={{maxLength:10, type:'number'}}
                onInput={(e: { target: { value: string; maxLength: number | undefined; }; })=>{
                e.target.value = Math.max(0, parseInt(e.target.value) ).toString().slice(0,e.target.maxLength)
                }}
                placeholder="숫자만 입력 가능합니다."
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
                cdGroupNm="506"
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
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
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
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnVemBsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          selectedRowIndex={selectedRowIndex}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"버스 차량말소관리 조회 목록"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRowIndex > -1 && (
        <BlankCard className="contents-card" title="수급자목록">
          <TableDataGrid
            headCells={stnVemUserBsHC} // 테이블 헤더 값
            rows={userRows} // 목록 데이터
            totalRows={userTotalRows} // 총 로우 수
            loading={userLoading} // 로딩여부
            caption={"수급자 조회 목록"}
          />
        </BlankCard>
      )}
      {selectedRowIndex > -1 && (
        <BlankCard className="contents-card" title="카드목록">
          <TableDataGrid
            headCells={stnVemCardBsHC} // 테이블 헤더 값
            rows={cardRows} // 목록 데이터
            totalRows={cardTotalRows} // 총 로우 수
            loading={cardLoading} // 로딩여부
            caption={"카드 조회 목록"}
          />
        </BlankCard>
      )}
      {selectedRowIndex > -1 && (
        <BlankCard
          className="contents-card"
          title="상세정보"
          buttons={[
            {
              label: '차량말소',
              color: 'outlined',
              onClick: handleClickErsr,
            },
          ]}
        >
          <BsDetail data={rows[selectedRowIndex]} />
        </BlankCard>
      )}
      <BsErsrModal
        open={open}
        row={rows[selectedRowIndex]}
        handleClickClose={handleClickClose}
        reload={() => fetchData()}
      />
    </Box>
  )
}

export default BsPage
