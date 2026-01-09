'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect
} from '@/app/components/tx/commSelect/CommSelect'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { ilgSspTrMainHC } from '@/utils/fsms/headCells'
import { SelectItem } from 'select'
import { Pageable2 } from 'table'
import TrDetail from './TrDetail'
import TrModalContent from './TrModalContent'

export interface Row {
  hstrySn: string
  transNm: string
  brno: string
  vhclNo: string
  locgovCd: string
  locgovNm: string
  koiCd: string
  koiNm: string
  rprsvNm: string
  rprsvRrno: string
  delYn: string
  delNm: string
  dscntYn: string
  souSourcSeCd: string
  rfidYn: string
  bscInfoChgYn: string
  locgovAprvYn: string
  stopBgngYmd: string
  stopEndYmd: string
  stopRsnCn: string
  cardNo: string
  crno: string
  cardNm: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  vonrRrno: string
  vonrRrnoSecure: string
  crnoS: string
  vonrBrno: string
  vonrNm: string
  vhclPsnCd: string
  vonrRrnoS: string
  vhclTonCd: string
  vhclTonNm: string
  bgngYmd: string
  endYmd: string
  chgSeCd: string
  chgRsnCn: string
  trsmYn: string
  trsmDt: string
  localNm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  vonrNm: string
  bgngDt: string
  endDt: string
  stopGb: string
  vonrRrno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state

  const [stopGbCodes, setStopGbCodes] = useState<SelectItem[]>([]) // 진행상태 코드
  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)
  const [excelEnable, setExcelEnable] = useState<boolean>(false)
  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
    bgngDt: '',
    endDt: '',
    stopGb: '',
    vonrRrno: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) {
      setSelectedIndex(-1)
      setSelectedRow(null)
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    setExcelEnable(false)
  }, [params])

  // 초기 데이터 로드
  useEffect(() => {
    /** AS-IS : 공통코드 없이 하드코딩 세팅함 */
    const stopGbCodes: SelectItem[] = [
      {
        label: '전체',
        value: '',
      },
      {
        label: '지급정지 진행',
        value: '01',
      },
      {
        label: '지급정지 종료',
        value: '02',
      },
    ]
    setStopGbCodes(stopGbCodes)
    const dateRange = getDateRange('d', 30)
    setParams((prev) => ({
      ...prev,
      endDt: dateRange.endDate,
      bgngDt: dateRange.startDate,
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
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/ssp/tr/getAllSbsidyStopPymnt?page=${params.page}&size=${params.size}` +
        `${params.stopGb ? '&stopGb=' + params.stopGb : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
        `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

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
      setFlag(false)
      setExcelEnable(true)
    }
  }

  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('조회 건수가 없어 엑셀다운로드를 할 수 없습니다.')
      return
    }

    if (!excelEnable) {
      alert('조회 후 엑셀다운로드 해주시기 바랍니다.')
      return
    }

    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/ilg/ssp/tr/getExcelSbsidyStopPymnt?` +
      `${params.stopGb ? '&stopGb=' + params.stopGb : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
      `${params.bgngDt ? '&bgngDt=' + params.bgngDt.replaceAll('-', '') : ''}` +
      `${params.endDt ? '&endDt=' + params.endDt.replaceAll('-', '') : ''}`

    await getExcelFile(endpoint, '화물보조금지급정지_' + getToday() + '.xlsx')
    setIsExcelProcessing(false)
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    if(!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return;
    }

    if(!params.locgovCd) {
      alert('관할관청을 선택해주세요.')
      return;
    }

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(selectedRow)
    if (selectedIndex === index) {
      setIsDetailOpen(!isDetailOpen)
    } else {
      setIsDetailOpen(true)
    }
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    console.log('변경')
    const { name, value } = event.target
    if (name === 'bgngDt' || name === 'endDt') {
      setParams((prev) => ({ ...prev, [name]: value }))
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleReload = () => {
    setRemoteFlag(false)
    setFlag(true)
  }

  const handleModalClose = () => {
    setRemoteFlag(false)
  }

  const openModifyModal = () => {
    if (!selectedRow || selectedIndex < 0) {
      alert('수정할 정보를 선택해주세요.')
      return
    } else {
      setRemoteFlag(true)
    }
  }

  return (
    <>
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
                required
              >
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                htmlFor={'sch-ctpv'}
                handleChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
                required
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
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                placeholder=""
                fullWidth
                name="vhclNo"
                value={params.vhclNo} // 빈 문자열로 초기화
                onChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrNm"
                placeholder=""
                fullWidth
                name="vonrNm"
                text={params.vonrNm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                정지일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                정지 시작일
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
                정지 종료일
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
                htmlFor="ft-stopGb"
              >
                진행상태
              </CustomFormLabel>
              <select
                id="ft-stopGb"
                className="custom-default-select"
                name="stopGb"
                value={params.stopGb}
                onChange={handleSearchChange}
                style={{ width: '70%' }}
              >
                {stopGbCodes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vonrRrno"
              >
                주민등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrRrno"
                type="number"
                placeholder=""
                name="vonrRrno"
                value={params.vonrRrno}
                onChange={handleSearchChange}
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
              variant="contained"
              color="primary"
              onClick={() => openModifyModal()}
            >
              수정
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
            <FormModal
              buttonLabel={''}
              title={'보조금지급정지수정'}
              size={'xl'}
              formLabel="저장"
              formId="send-tr-modify"
              closeHandler={handleModalClose}
              remoteFlag={remoteFlag}
            >
              <TrModalContent data={selectedRow as Row} reload={handleReload} />
            </FormModal>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilgSspTrMainHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          cursor
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedIndex !== -1 && isDetailOpen ? (
        <TrDetail
          row={selectedRow as Row} // 목록 데이터
        />
      ) : null}
      <LoadingBackdrop open={isExcelProcessing} />
    </>
  )
}

export default DataList
