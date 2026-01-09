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
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* ./component */
import DetailDataGrid from './_components/DetailDataGrid'
import ModalContent from './_components/ModalContent'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getToday, getDateRange } from '@/utils/fsms/common/dateUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { HeadCell, Pageable2 } from 'table'

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
    to: '/sup/iidm',
    title: '개인정보열람사후관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'inqYmd',
    numeric: false,
    disablePadding: false,
    label: '열람일자',
    format: 'yyyymmdd',
  },
  {
    id: 'menuNm',
    numeric: false,
    disablePadding: false,
    label: '메뉴명',
  },
  {
    id: 'inclNm',
    numeric: false,
    disablePadding: false,
    label: '개인정보 유형',
  },
  {
    id: 'inqNocs',
    numeric: false,
    disablePadding: false,
    label: '조회건수',
    format: 'number',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '담당자명',
  },
  {
    id: 'actnNm',
    numeric: false,
    disablePadding: false,
    label: '확인여부',
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
  mdfrId: string
  mdfcnDt: string
  userNm: string
  actnYn: string
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
  inclYnCd: string
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
    inclYnCd: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [open, setOpen] = useState<boolean>(false)

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
  const fetchData = async () => {

    if (searchValidation()) {

      try {

        const searchObj: listSearchObj = {
          ...params,
          bgngDt: params.bgngDt.replaceAll('-', ''),
          endDt: params.endDt.replaceAll('-', '')
        }

        resetData()
        setLoading(true)

        let url = ''

        // 전체 또는 주민번호시
        if (!params.inclYnCd || params.inclYnCd === '00') {
          url = '/fsm/sup/iidm/cm/getAllIndvInfoDownloadMng'
        // 이외는 개인정보엑셀다운로드현황 쿼리
        } else {
          url = '/fsm/sup/iid/cm/getAllIndvInfoDownload'
        }

        const endpoint = url + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

        if (response && response.resultType === 'success' && response.data.content.length !== 0) {
          // 데이터 조회 성공시
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // 클릭이벤트 발생시키기
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
      let url = ''
      // 전체 또는 주민번호시
      if (!params.inclYnCd || params.inclYnCd === '00') {
        url = '/fsm/sup/iidm/cm/getExcelIndvInfoDownloadMng'
      // 이외는 개인정보엑셀다운로드현황 쿼리
      } else {
        url = '/fsm/sup/iid/cm/getExcelIndvInfoDownload'
      }
      const searchObj: listSearchObj = {
        ...params,
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', '')
      }
      const endpoint = url + toQueryParameter(searchObj)
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

  const handleOpen = (): void => {
    if (validation('C')) {
      setOpen(true)
    }
  }

  const validation = (type: 'N' | 'Y' | 'C'): boolean => {
    if (selectedRowData === undefined || selectedRowIndex === -1) {
      alert('처리할 데이터가 없습니다')
    } else if (type === 'N' && selectedRowData.actnYn === 'N') {
      alert('취소된 건입니다.')
    } else if (type === 'Y' && selectedRowData.actnYn !== 'N') {
      alert('이미 처리된 건입니다.')
    } else if (type === 'C' && selectedRowData.actnYn === 'C') {
      alert('조치된 건입니다.')
    } else {
      return true
    }

    return false
  }

  const handleProcess = async (type: 'N' | 'Y' | 'C', actnRsltCn?: string) => {

    if (validation(type)) {

      const msg = {
        N: '취소처리 하시겠습니까?',
        Y: '확인처리 하시겠습니까?',
        C: '조치결과를 저장 하시겠습니까?',
      }

      if (confirm(msg[type])) {

        try {

          setLoadingBackdrop(true)

          const endpoint: string = `/fsm/sup/iidm/cm/updateConfirmIndvInfoDownloadMng`
          const body = {
            actnYn: type,
            sn: selectedRowData?.sn,
            actnRsltCn: type === 'C' ? actnRsltCn : null
          }

          const response = await sendHttpRequest("PUT", endpoint, body, true, { cache: 'no-store' })

          if (response && response.resultType == 'success') {
            alert('완료되었습니다.')
            /* 모달 */
            if (type === 'C') {
              setOpen(false)
            }
            reload();
          } else {
            alert(response.message);
          }
        } catch (error) {
          console.error("ERROR ::: ", error)
        } finally {
          setLoadingBackdrop(false);
        }
      }
    }
  }

  return (
    <PageContainer title="개인정보열람 사후관리" description="개인정보열람 사후관리">
      <>
        {/* breadcrumb */}
        <Breadcrumb title="개인정보열람 사후관리" items={BCrumb} />

        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
          {/* 검색영역 시작 */}
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
                  관할관청
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
                  htmlFor="sch-inclYnCd"
                  className="input-label-display"
                >
                  개인정보유형
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="231"
                  pValue={params.inclYnCd}
                  handleChange={handleSearchChange}
                  pName="inclYnCd"
                  htmlFor={'sch-inclYnCd'}
                  addText="전체"
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  htmlFor="sch-actnYn"
                  className="input-label-display"
                >
                  확인여부
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="232"
                  pValue={params.actnYn}
                  handleChange={handleSearchChange}
                  pName="actnYn"
                  htmlFor={'sch-actnYn'}
                  addText="전체"
                />
              </div>

              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-rgtrId"
                >
                  ID
                </CustomFormLabel>
                <CustomTextField
                  id="ft-rgtrId"
                  name="rgtrId"
                  value={params.rgtrId}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>

              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-userNm"
                >
                  담당자명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-userNm"
                  name="userNm"
                  value={params.userNm}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>


            </div>
          </Box>

          {/* 버튼영역 시작 */}
          <Box className="table-bottom-button-group">
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                검색
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleProcess('Y')}
              >
                확인
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
              >
                조치
              </Button>

              <Button
                variant="contained"
                color="red"
                onClick={() => handleProcess('N')}
              >
                취소
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

        {/* 테이블영역 시작 */}
        <Box>
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            selectedRowIndex={selectedRowIndex}
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            caption={"개인정보열람사후관리 목록 조회"}
          />
        </Box>

        {/* 상세영역 */}
        {selectedRowData !== undefined ? (
          <Box>
            <DetailDataGrid selectedRow={selectedRowData} />
          </Box>
        ) : null}

        {/* 등록수정모달 */}
        {open && selectedRowData ? (
          <ModalContent
            open={open}
            setOpen={setOpen}
            row={selectedRowData}
            handleProcess={handleProcess}
          />
        ) : null}

        <LoadingBackdrop open={loadingBackdrop} />

      </>
    </PageContainer>
  )
}

export default DataList
