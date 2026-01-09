'use client'
import { Box, Button, FormControlLabel } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

import BusSetleTrauModal from '@/app/components/bs/popup/BusSetleTrauModal' // 외상결제 거래내역 모달
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { getCommCd, getExcelFile } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { calSdHC } from '@/utils/fsms/headCells'
import { getFormatToday, getToday } from '@/utils/fsms/common/dateUtils'
import VhclHisSearchModal from '@/app/components/bs/popup/VhclHisSearchModal'
import { getDateRange } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '보조금청구',
  },
  {
    title: '버스청구',
  },
  {
    to: '/cal/sd',
    title: '결제내역',
  },
]

const remarks = [
  {
    name: '일반거래',
    color: '#000000',
  },
  {
    name: '취소거래',
    color: '#FF0000',
  },
  {
    name: '취소된원거래',
    color: '#0000FF',
  },
  {
    name: '대체카드거래',
    color: '#00B050',
  },
  {
    name: '보조금지급정지/휴지',
    color: '#7030A0',
  },
  {
    name: '유종없음',
    color: '#FF3399',
  },
  {
    name: '유종불일치',
    color: '#00CC99',
  },
  {
    name: '1시간이내재주유',
    color: '#0099FF',
  },
  {
    name: '1일4회이상주유',
    color: '#663300',
  },
  {
    name: '사용리터없음',
    color: '#92D050',
  },
]

export interface Rows {
  remark?: string // 보조금정산
  cnptSeCd?: string // 거래원
  brno?: string // 사업자번호
  bzentyNm?: string // 업체명
  vhclNo?: string // 차량번호
  vhclSeNm?: string // 면허업종
  dlngYmdtm?: string // 거래일시
  origDlngYmdtm?: string // 원거래일시
  dlngSeNm?: string // 거래구분(코드값이므로 거래구분명을 가져올 함수 필요)
  cardSeNm?: string // 카드구분
  crdcoNm?: string // 카드사
  cardNoS?: string // 카드번호
  frcsNm?: string // 가맹점(주유소/충전소명)
  aprvAmt?: string // 승인금액
  koiNm?: string // 거래유종
  lbrctStleNm?: string // 주유형태
  fuelQty?: string // 연료량
  asstAmt?: string // 보조금
  fxtAsstAmt?: string // 유류세연동보조금
  opisAmt?: string // 유가연동보조금
  koiCd?: string // 유종코드
  splitYn?: string // 분할결제 여부
  sltmAprvNo?: string // 결제승인번호
  sltmCardNo?: string // 결제카드번호
  sltmAprvYmd?: string // 결제승인일자
  dlngYmd?: string //승인일자
  dlngTm?: string //승인시간
  cardNo?: string //카드번호
  aprvNo?: string //승인번호
}

type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [rows, setRows] = useState<Rows[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>()
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false)
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Rows>() // 선택된 Row를 저장할 state
  const [vhclHisOpen, setVhclHisOpen] = useState(false)
  const [busSetleOpen, setBusSetleOpen] = useState(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
    includeCancel: 'N',
  })

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('date', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
  }, [])

  function formatDate(dateString: string) {
    // 입력 형식이 YYYY-MM-DD인지 확인
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // "-" 제거하고 반환
    return dateString.replace(/-/g, '')
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRowIndex(-1)
    setLoading(true)
    try {
      if (
        (params.searchStDate.replace('-', '') <= '20191231' &&
          params.searchEdDate.replace('-', '') >= '20200101') ||
        (params.searchStDate.replace('-', '') <= '201912' &&
          params.searchEdDate.replace('-', '') >= '202001')
      ) {
        alert('2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.')
        return
      }

      if (!params.vhclNo && !params.brno) {
        alert('차량번호 혹은 사업자등록번호를 입력해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cal/sd/bs/getAllSetleDtls?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngDt=' + formatDate(params.searchStDate) : ''}` +
        `${params.searchEdDate ? '&endDt=' + formatDate(params.searchEdDate) : ''}` +
        `${params.includeCancel ? '&includeCancel=' + params.includeCancel : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        ``

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
      setExcelFlag(true)
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    if (
      (params.searchStDate.replace('-', '') <= '20191231' &&
        params.searchEdDate.replace('-', '') >= '20200101') ||
      (params.searchStDate.replace('-', '') <= '201912' &&
        params.searchEdDate.replace('-', '') >= '202001')
    ) {
      alert('2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/sd/bs/getExcelAllSetleDtls?` +
      `${params.includeCancel ? '&includeCancel=' + params.includeCancel : ''}` +
      `${params.searchStDate ? '&bgngDt=' + formatDate(params.searchStDate) : ''}` +
      `${params.searchEdDate ? '&endDt=' + formatDate(params.searchEdDate) : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
      `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
      `${params.cardSeCd ? '&cardSeCd=' + params.cardSeCd : ''}` +
      `${params.cardNo ? '&cardNo=' + params.cardNo : ''}`

    await getExcelFile(
      endpoint,
      BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
    )
    setIsExcelProcessing(false)
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
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
  const handleRowClick = useCallback((selectedRow: Rows, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedRowIndex(index)
  }, [])

  // 페이지 이동 감지 종료 //

  //시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    }

    if (name === 'includeCancel') {
      if (value === 'on' || value === 'Y') {
        setParams((prev) => ({ ...prev, [name]: 'N' }))
      } else {
        setParams((prev) => ({ ...prev, [name]: 'Y' }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }

    setExcelFlag(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
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

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleVhclHisButtonClick = () => {
    if (!selectedRow || !selectedRow.vhclNo) {
      alert('차량번호가 없습니다.')
      return
    }
    setVhclHisOpen(true)
  }

  const handleSetleButtonClick = () => {
    if (
      !selectedRow ||
      (selectedRow.cardSeNm !== '결제체크' &&
        selectedRow.cardSeNm !== '결제신용')
    ) {
      alert('결체체크, 결체신용만 조회 가능합니다.')
      return
    }
    setBusSetleOpen(true)
  }

  return (
    <PageContainer title="결제내역조회" description="결제내역조회">
      {/* breadcrumb */}
      <Breadcrumb title="결제내역조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                결제일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                결제일자 시작일
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
              <span>~</span>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                결제일자 종료일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{
                  min: params.searchStDate,
                  max: getFormatToday(),
                }}
                fullWidth
              />
            </div>

            <div className="form-group" style={{ maxWidth: '10rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="includeCancel"
                    value={params.includeCancel}
                    onChange={handleSearchChange}
                  />
                }
                label="취소 포함"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="599"
                pValue={params.koiCd}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdcoCd"
              >
                카드사구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="543"
                pValue={params.crdcoCd}
                handleChange={handleSearchChange}
                pName="crdcoCd"
                htmlFor={'sch-crdcoCd'}
                addText="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardSeCd"
              >
                카드구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="545"
                pValue={params.cardSeCd}
                handleChange={handleSearchChange}
                pName="cardSeCd"
                htmlFor={'sch-cardSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
                required
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
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
                required
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                type="number"
                inputProps={{ maxLength: 10, type: 'number' }}
                onInput={(e: {
                  target: { value: string; maxLength: number | undefined }
                }) => {
                  e.target.value = Math.max(0, parseInt(e.target.value))
                    .toString()
                    .slice(0, e.target.maxLength)
                }}
                placeholder="숫자만 입력 가능합니다."
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>
            <Button
              onClick={() => excelDownload()}
              variant="contained"
              color="success"
            >
              엑셀
            </Button>
            <Button variant="outlined" onClick={handleSetleButtonClick}>
              결제된 외상거래
            </Button>
            <Button variant="outlined" onClick={handleVhclHisButtonClick}>
              차량이력조회
            </Button>
            <VhclHisSearchModal
              size="lg"
              buttonLabel="차량이력조회"
              onCloseClick={() => setVhclHisOpen(false)}
              title="차량이력 조회"
              url="/fsm/apv/vddd/bs/getAllVhcleMngHis"
              open={vhclHisOpen}
              row={selectedRow}
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={calSdHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
          caption={'버스 결제내역 조회 목록'}
        />
        <BusSetleTrauModal
          size="lg"
          onCloseClick={() => setBusSetleOpen(false)}
          title="외상거래 결제내역"
          url="/fsm/cal/sd/bs/getAllBusSetleTrauDtls"
          excelUrl="/fsm/cal/sd/bs/getExcelBusSetleTrauDtls"
          open={busSetleOpen}
          row={selectedRow}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isExcelProcessing} />

      {/* 범례 영역 시작 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '1rem 1rem',
        }}
      >
        {remarks.map((remark) => (
          <span style={{ color: remark.color }}>■ {remark.name}</span>
        ))}
      </Box>
      {/* 범례 영역 끝*/}
    </PageContainer>
  )
}

export default DataList
