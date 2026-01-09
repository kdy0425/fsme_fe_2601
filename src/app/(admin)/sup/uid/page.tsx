'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* ./component */
import DetailDataGrid from './_components/DetailDataGrid'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getToday, getDateRange } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { Pageable2 } from 'table'
import { supIidHC } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '업무일반',
  },
  {
    to: '/sup/uid',
    title: '교육식별정보 열람 현황',
  },
]

export interface Row {
	menuNm: string
	inclNm: string
  locgovNm: string
  actnNm: string
  sn: number
  inqYmd: string
	inqNocs: string
  inqRsnCd: string
	inqRsnNm: string
	inqRsnCn: string
  actnRsltCn: string
  rgtrId: string
  mdfrId: string
	mdfcnDt: string
	userNm: string
	type: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  ctpvCd: string
  locgovCd: string
  actnYn: string
  rgtrId: string
  userNm: string
  inclYnCd: '00'
}

const DataList = () => {

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [selectedRowData, setSelectedRowData] = useState<Row>()
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  // 목록 조회를 위한 객체
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngDt: '',
    endDt: '',
    ctpvCd: '',
    locgovCd: '',
    actnYn: '',
    rgtrId: '',
    userNm: '',
    inclYnCd: '00' // 개인정보 타입이 주민번호만 가져올수있게 고정
  })

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

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    setParams((prev) => ({
      ...prev,
      bgngDt: dateRange.startDate,
      endDt: dateRange.endDate,
    }))
  }, [])

  const searchValidation = (): boolean => {
    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
    } else if (!params.bgngDt) {
      alert('열람시작일자를 입력해주세요.')
    } else if (!params.endDt) {
      alert('열람종료일자를 입력해주세요.')
    } else if (params.bgngDt > params.endDt) {
      alert('열람시작일자가 열람종료일자보다 큽니다.')
    } else {
      return true
    }
    return false
  }

  const resetData = (): void => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setSelectedRowIndex(-1)
    setSelectedRowData(undefined)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async (): Promise<void> => {

    if (searchValidation()) {

      try {

        const searchObj: listSearchObj = {
          ...params,
          bgngDt: params.bgngDt.replaceAll('-', ''),
          endDt: params.endDt.replaceAll('-', '')
        }

        resetData()
        setLoading(true)

        // 검색 조건에 맞는 endpoint 생성
        const endpoint = '/fsm/sup/uid/cm/getAllUnqInfoDownload' + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

        if (response && response.resultType === 'success' && response.data.content.length !== 0) {
          // 데이터 조회 성공시

          const tempList: Row[] = response.data.content

          // 개인정보 유형은 주민번호로 고정
          tempList.map(item => {
            item.inclNm = '주민번호'
          })

          setRows(tempList)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          handleRowClick(response.data.content[0], 0)
        }
      } catch (error) {
        console.log('fetchData error : ' + error)
      } finally {
        setLoading(false)
        setExcelFlag(true)
      }
    }
  }

  const excelDownload = async (): Promise<void> => {
    
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드 할 데이터가 없습니다.')
    } else if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
    } else {
      const searchObj: listSearchObj = {
        ...params,
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', '')
      }
      const endpoint = '/fsm/sup/uid/cm/getExcelUnqInfoDownload' + toQueryParameter(searchObj)
      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx')
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number): void => {
    setSelectedRowData(row)
    setSelectedRowIndex(index ?? -1)
  }, [])

  // 검색조건 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  const reload = useCallback((): void => {
    resetData()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }, [])

  return (
    <PageContainer
      title="교육식별정보 열람 현황"
      description="교육식별정보 열람 현황"
    >
      <>
        {/* breadcrumb */}
        <Breadcrumb title="교육식별정보 열람 현황" items={BCrumb} />
        {/* end breadcrumb */}

        {/* 검색영역 시작 */}
        <Box component="form" sx={{ mb: 2 }} onSubmit={handleAdvancedSearch}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display" required>
                  열람일자
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  열람년월일 시작
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="bgngDt"
                  value={params.bgngDt}
                  onChange={handleSearchChange}
                  fullWidth
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  열람년월일 종료
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="endDt"
                  value={params.endDt}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>

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
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-koiCd"
                >
                  확인여부
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="232"
                  pValue={params.actnYn}
                  handleChange={handleSearchChange}
                  pName="actnYn"
                  htmlFor={'sch-koiCd'}
                  addText="전체"
                  width='80%'
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-rgtrId"
                >
                  ID
                </CustomFormLabel>
                <CustomTextField
                  id="sch-rgtrId"
                  name="rgtrId"
                  value={params.rgtrId}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-userNm"
                >
                  담당자명
                </CustomFormLabel>
                <CustomTextField
                  id="sch-userNm"
                  name="userNm"
                  value={params.userNm}
                  onChange={handleSearchChange}
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
          <TableDataGrid
            headCells={supIidHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            selectedRowIndex={selectedRowIndex}
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            caption={'교육식별정보 열람 조회 목록'}
          />
        </Box>
        {/* 테이블영역 끝 */}

        {selectedRowData !== undefined ? (
          <DetailDataGrid
            selectedRowData={selectedRowData}
            reload={reload}
          />
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
