'use client'
import {
  Box,
  Button,
  FormControlLabel,
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { getExcelFile } from '@/utils/fsms/common/comm'

// utils
import {
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import {
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
//import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { ilpApvlBddHC } from '@/utils/fsms/ilp/headCells'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { isNumber } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

import { getUserInfo } from '@/utils/fsms/utils'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '주유정보',
  },
  {
    to: '/ilp/bli',
    title: '버스주유정보',
  },
]

export interface Row {
  dlngDt: string
  dlngYmd: string
  dlngTm: string
  brno: string
  vhclNo: string
  cardNoEncpt: string
  cardNo: string
  stlmCardNo: string
  asstAmtClclnCd: string
  frcsNm: string
  aprvAmt: number
  fuelQty: number
  asstAmt: number
  ftxAsstAmt: number
  opisAmt: string
  aprvNo: string
  imgRecog1VhclNo: string
  imgRecog2VhclNo: string
  vcf: string
  crctBfeFuelQty: string
  asstAmtClclnNm: string
  locgovNm: string
  bzentyNm: string
  dlngSeNm: string
  stlmNm: string
  lbrctStleNm: string
  koiNm: string
  vhclSeNm: string
  cnptSeNm: string
  cardSeNm: string
  crdcoNm: string
  unsetlAmt: string
  prttnYn: string
  prttnNm: string
  hstrySn: string
  mdfcnDt: string
  vhclSttsNm: string
  dscntYnNm: string
  rfidNm: string
  stlmAprvNo: string
  koiCd: string
  stlmCardNoEncpt: string
  stlmAprvYmd: string
  stlmAprvTm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  bgngDt: string
  endDt: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 Row를 저장할 state
  const [selectedIndex, setSelectedIndex] = useState<number>()

  const [open, setOpen] = useState<boolean>(false)
  const [openH, setOpenH] = useState<boolean>(false)
  const [modalRowData, setModalRowData] = useState<Row[]>([])

  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false)

  const [rtrcnYn, setRtrcnYn] = useState<boolean>(false) // 취소포함 flag

  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  const userInfo = getUserInfo()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    bgngDt: String(allParams.bgngDt ?? ''), // 시작일
    endDt: String(allParams.endDt ?? ''), // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //

  // 조회하여 가져온 정보를 Table에 넘기는 객체
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      bgngDt: startDate,
      endDt: endDate,
    }))
  }, [])

  useEffect(() => {
    if (rtrcnYn) {
      setParams((prev) => ({ ...prev, rtrcnYn: 'Y' }))
    } else {
      setParams((prev) => ({ ...prev, rtrcnYn: 'N' }))
    }
  }, [rtrcnYn])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (((params.bgngDt.replace('-', '') <= "20191231" && params.endDt.replace('-', '') >= "20200101") 
      || (params.bgngDt.replace('-', '') <= "201912" && params.endDt.replace('-', '') >= "202001"))) {
      alert("2020년 이전과 이후의 날짜를 함께 조회할 수 없습니다.");
      return;
    }
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setLoading(true)
    setExcelFlag(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/ilp/bli/bs/getAllBusDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${!isLocgovCdAll && params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${!isLocgovCdAll && params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.rtrcnYn ? '&rtrcnYn=' + params.rtrcnYn : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.asstAmtClclnCd ? '&asstAmtClclnCd=' + params.asstAmtClclnCd : ''}` +
        `${params.lbrctStleCd ? '&lbrctStleCd=' + params.lbrctStleCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {

        // 데이터 조회 성공시
        //setRows(response.data.content)
        setRows(
          response.data.content.map((row: Row) => {
            let color = undefined;
            if (row.asstAmtClclnNm === '취소거래') color = 'red';
            else if (row.asstAmtClclnNm === '취소된원거래') color = 'blue';
            else if (row.asstAmtClclnNm === '대체카드거래') color = 'green';
            // '일반거래'는 color를 undefined로 두어 기본색(검정) 사용
            return { ...row, color };
          })
        )

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
      setIsExcelProcessing(true)

      let endpoint: string =
        `/ilp/bli/bs/getExcelBusDelngDtls?` +
        `${params.sort ? '&sort=' + sortChange(params.sort) : ''}` +
        `${!isLocgovCdAll && params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${!isLocgovCdAll && params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}` +
        `${params.rtrcnYn ? '&rtrcnYn=' + params.rtrcnYn : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.crdcoCd ? '&crdcoCd=' + params.crdcoCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.asstAmtClclnCd ? '&asstAmtClclnCd=' + params.asstAmtClclnCd : ''}` +
        `${params.lbrctStleCd ? '&lbrctStleCd=' + params.lbrctStleCd : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setIsExcelProcessing(false)
    }
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
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

  // 정렬시 데이터 갱신
  const handleSortModelChange = (sort: string) => {
    // 정렬 기준을 params에 업데이트
    setParams((prev) => ({ ...prev, sort: sort })) // 예: "ttl,asc"
    setFlag(!flag) // 정렬 기준이 변경되었으므로 데이터 재조회
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((selectedRow: Row, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedIndex(index)
  }, [])

  // 페이지 이동 감지 종료 //
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (isNumber(value) || name !== 'brno') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
    }
    setExcelFlag(false)
  }

  // 조건 검색 변환 매칭
  const sortChange = (sort: String): String => {
    if (sort && sort != '') {
      let [field, sortOrder] = sort.split(',') // field와 sortOrder 분리하여 매칭
      if (field === 'regYmd') field = 'regDt' // DB -> regDt // DTO -> regYmd ==> 매칭 작업
      return field + ',' + sortOrder
    }
    return ''
  }

  return (
    <PageContainer title="버스거래내역" description="버스거래내역">
      {/* breadcrumb */}
      <Breadcrumb title="버스거래내역" items={BCrumb} />
      {/* end breadcrumb */}

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
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
                pDisabled={isLocgovCdAll}
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
                pDisabled={isLocgovCdAll}
              />
            </div>

            <div className="form-group" style={{ maxWidth: '5rem' }}>
              <FormControlLabel
                sx={userInfo.roles[0] == 'LOGV' ? { display: 'none' } : {}}
                control={
                  <CustomCheckbox
                    name="isLocgovCdAll"
                    value={isLocgovCdAll}
                    onChange={() => setIsLocgovCdAll(!isLocgovCdAll)}
                  />
                }
                label="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                거래시작일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="bgngDt"
                onChange={handleSearchChange}
                inputProps={{ max: params.endDt }}
                value={params.bgngDt}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                거래종료일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="endDt"
                onChange={handleSearchChange}
                inputProps={{ min: params.bgngDt }}
                value={params.endDt}
                fullWidth
              />
            </div>
            <div className="form-group" style={{ maxWidth: '6rem' }}>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="rtrcnYn"
                    value={params.rtrcnYn}
                    onChange={() => setRtrcnYn(!rtrcnYn)}
                  />
                }
                label="취소포함"
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
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-crdcoCd"
              >
                카드사
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
                htmlFor="ft-car-name"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                type="text"
                id="ft-car-name"
                fullWidth
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
                value={params.brno}
                onChange={handleSearchChange}
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
                id="ft-brno"
                fullWidth
              />
            </div>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-asstAmtClclnCd"
              >
                보조금정산
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="544"
                pValue={params.asstAmtClclnCd}
                handleChange={handleSearchChange}
                pName="asstAmtClclnCd"
                htmlFor={'sch-asstAmtClclnCd'}
                addText="전체"
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-lbrctStleCd"
              >
                주유형태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="550"
                pValue={params.lbrctStleCd}
                handleChange={handleSearchChange}
                pName="lbrctStleCd"
                htmlFor={'sch-lbrctStleCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclSeCd"
              >
                면허업종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="505"
                pValue={params.vhclSeCd}
                handleChange={handleSearchChange}
                pName="vhclSeCd"
                htmlFor={'sch-vhclSeCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              type="submit"
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
            {/* 테이블영역 끝 */}
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilpApvlBddHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedIndex}
          caption={'버스거래내역 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <Box style={{ display: 'flex', padding: '1rem 1rem', gap: '1rem' }}>
        <span>■ 일반거래</span>
        <span style={{ color: 'red' }}>■ 취소거래</span>
        <span style={{ color: 'blue' }}>■ 취소된원거래</span>
        <span style={{ color: 'green' }}>■ 대체카드거래</span>
      </Box>
      <LoadingBackdrop open={isExcelProcessing} />
    </PageContainer>
  )
}

export default DataList
