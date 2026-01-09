'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  getCommCd,
  getCtpvCd,
  getDateRange,
  getLocGovCd,
} from '@/utils/fsms/common/comm'
import DetailDataGrid from './DetailDataGrid'
import {
  CommSelect,
  CtpvSelect,
  CtpvSelectAll,
  LocgovSelect,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import { StatusType } from '@/types/message'
import { closeVhclBzmnPrmsnModal } from '@/store/popup/VhclBzmnPrmsnSlice'
import { mngCijcTrMainHC } from '@/utils/fsms/headCells'
import { useDispatch } from '@/store/hooks'

export interface Row {
  trsmYn?: string // 전송상태
  rcptYmd?: string // 접수일자
  locgovAprvYnNm: string //처리상태
  locgovAprvYn: string
  vhclNo?: string // 차량번호
  vhclPsnCd?: string // 소유구분
  bzmnPrmsnYmd?: string // 허가일
  vonrNm?: string // 소유자명
  vonrRrno?: string // 주민등록번호
  vonrRrnoS?: string // 주민등록번호
  vonrBrno?: string // 사업자등록번호
  brnoD?: string
  crno?: string // 법인등록번호
  bzentyNm?: string // 업체명
  rprsvNm?: string //대표자명
  koiCd?: string // 유종
  vhclTonCd?: string // 톤수
  crdcoCd?: string // 카드사
  cardSeCd?: string // 카드구분
  issuSeCd?: string // 발급구분
  cardNo?: string // 카드번호(암호화)
  cardNoS?: string // 카드번호(복호화)
  mdfrDt?: string // 처리일자
  rissuRsnNm?: string // 기존카드 말소여부
  flRsnCd?: string // 탈락유형
  flRsnCn?: string // 탈락사유
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
  locgovNm?: string // 지자체명
  koiNm?: string // 유종명
  vhclTonNm?: string // 톤수명
  vhclPsnNm?: string // 차량소유구분명
  crdcoNm?: string // 카드사명
  cardSeNm?: string // 카드구분명
  flRsnNm?: string // 탈락유형명
  issuSeNm?: string // 발급구분명
  telno: string // 연락처
  rcptSeqNo?: string // 접수일련번호
  aplySn?: string // 신청일련번호
  idntyYmd: string //처리일자
  reissueNm: string //기존카드말소여부
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  locgovAprvYn: string
  startRegDt: string
  endRegDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const CargoPage = () => {
  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우 데이터
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    locgovAprvYn: '',
    startRegDt: '', // 시작일
    endRegDt: '', // 종료일
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const dispatch = useDispatch()

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != undefined) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    //setFlag(!flag)

    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      startRegDt: startDate,
      endRegDt: endDate,
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
    setSelectedRow(undefined)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cijc/tr/getAllCardIssuJdgmn?page=${params.page}&size=${params.size}` +
        `${params.startRegDt ? '&startRegDt=' + params.startRegDt.replaceAll('-', '') : ''}` +
        `${params.endRegDt ? '&endRegDt=' + params.endRegDt.replaceAll('-', '') : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.locgovAprvYn ? '&locgovAprvYn=' + params.locgovAprvYn : ''}`

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
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setInitialState()
    } finally {
      setLoading(false)
    }
  }

  const cancelCardIssuJdgmn = async (row?: Row) => {
    if (!row) {
      return
    }

    if (
      row.trsmYn === 'N' &&
      (row.locgovAprvYn === 'Y' || row.locgovAprvYn === 'N')
    ) {
      const userConfirm = confirm('해당 카드발급심사건을 취소하시겠습니까?')
      if (!userConfirm) {
        return
      } else {
        try {
          let body = {
            crdcoCd: row.crdcoCd,
            rcptYmd: row.rcptYmd,
            rcptSeqNo: row.rcptSeqNo,
            aplySn: Number(row.aplySn),
          }
          let endpoint: string = '/fsm/mng/cijc/tr/cancelCardIssuJdgmn'
          const response = await sendHttpRequest('PUT', endpoint, body, true, {
            cache: 'no-store',
          })
          // console.log(response)
          if (response && response.resultType === 'success') {
            // 성공
            alert(response.message)
            setFlag(!flag)
          } else {
            // 실패
            alert('실패 :: ' + response.message)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    } else {
      alert('카드발급심사를 취소할 수 없습니다.')
      return
    }
  }

  const updateBzmnPrmsnYmd = async (row: Row, bzmnPrmsnYmd: string) => {
    if (!bzmnPrmsnYmd) {
      alert('허가일을 입력해 주시기 바랍니다.')
      return
    }

    try {
      let body = {
        crdcoCd: row.crdcoCd,
        rcptYmd: row.rcptYmd,
        rcptSeqNo: row.rcptSeqNo,
        aplySn: Number(row.aplySn),
        bzmnPrmsnYmd: bzmnPrmsnYmd.replaceAll('-', ''),
      }

      let endpoint: string = '/fsm/mng/cijc/tr/updatePrmisnDeChange'

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
        dispatch(closeVhclBzmnPrmsnModal())
        setFlag(!flag)
      } else {
        // 실패
        alert('실패 :: ' + response.message)
      }
    } catch (error: StatusType | any) {
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 0 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row) => {
    setSelectedRow(row)
    if (row !== selectedRow) {
      setIsDetailOpen(true)
    } else {
      setIsDetailOpen(!isDetailOpen)
    }
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'startRegDt' || name === 'endRegDt') {
      const otherDateField = name === 'startRegDt' ? 'endRegDt' : 'startRegDt'
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

    if (changedField === 'startRegDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <PageContainer
      title="카드발급심사 변경관리"
      description="카드발급심사 변경관리"
    >
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
              >
                <span className="required-text">*</span>관할관청
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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgovAprvYn"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="088"
                pValue={params.locgovAprvYn}
                handleChange={handleSearchChange}
                pName="locgovAprvYn"
                htmlFor={'sch-locgovAprvYn'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhcl-no"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhcl-no"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기간 시작
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="startRegDt"
                value={params.startRegDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                기간 종료
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endRegDt"
                value={params.endRegDt}
                onChange={handleSearchChange}
                fullWidth
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
              onClick={() => cancelCardIssuJdgmn(selectedRow)}
              variant="contained"
              color="primary"
            >
              취소
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={mngCijcTrMainHC}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          onRowClick={handleRowClick}
          pageable={pageable}
          paging={true}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {/* 상세 영역 시작 */}
      <>
        {selectedRow && isDetailOpen ? (
          <DetailDataGrid
            detail={selectedRow}
            onClickUpdateBtn={updateBzmnPrmsnYmd}
          />
        ) : (
          <></>
        )}
      </>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default CargoPage
