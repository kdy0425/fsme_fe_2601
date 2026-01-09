'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import {
  getCtpvCd,
  getDateRange,
  getExcelFile,
  getLocGovCd,
  getToday,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { HeadCell, Pageable2 } from 'table'
import BsDetail from './BsDetail'
import BsModalContent from './BsModalContent'
import {
  CtpvSelect,
  CtpvSelectAll,
  LocgovSelect,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'

const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '대표자명',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '수급자명',
  },
  {
    id: 'rprsvRrno',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'stopBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'stopEndYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지종료일',
    format: 'yyyymmdd',
  },
]

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
  sort: string
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state

  const [stopGbCodes, setStopGbCodes] = useState<SelectItem[]>([]) // 진행상태 코드

  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'CREATE' | 'UPDATE'>('CREATE')

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    // 조회조건 세팅
    setParams((prev) => ({
      ...prev,
      searchStDate: getDateRange('d', 30).startDate,
      searchEdDate: getDateRange('d', 30).endDate,
    }))
  }, [])

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    setSelectedIndex(-1)
    setSelectedRow(null)
    if (flag) fetchData()
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
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/ssp/bs/getAllSbsidyStopPymnt?page=${params.page}&size=${params.size}` +
        `${params.stopGb ? '&stopGb=' + params.stopGb : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      console.log(endpoint)
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
      setFlag(false)
    }
  }

  const excelDownload = async () => {
    let endpoint: string =
      `/fsm/ilg/ssp/bs/getExcelSbsidyStopPymnt?` +
      `${params.stopGb ? '&stopGb=' + params.stopGb : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
      `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

    await getExcelFile(endpoint, '버스보조금지급정지_' + getToday() + '.xlsx')
  }

  const deleteData = async () => {
    try {
      if (!selectedRow || selectedIndex < 0) {
        alert('')
        return
      }

      let endpoint: string = `/fsm/ilg/ssp/bs/deleteSbsidyStopPymnt`

      let body = {
        brno: selectedRow?.brno,
        vhclNo: selectedRow?.vhclNo,
        hstrySn: String(Number(selectedRow?.hstrySn)),
      }

      const userConfirm = confirm(
        '보조금지급정지 내역 삭제를 진행하시겠습니까?',
      )

      if (userConfirm) {
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType == 'success') {
          alert('정상적으로 삭제되었습니다.')
          setFlag(true)
        } else {
          console.log('삭제 오류입니다.')
        }
      } else {
        return
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (selectedRow: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(selectedRow)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bgngDt' || name === 'endDt') {
      const otherDateField = name === 'bgngDt' ? 'endDt' : 'bgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate as string)) {
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

    if (changedField === 'bgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const handleReload = () => {
    setRemoteFlag(false)
    setFlag(!flag)
  }

  const handleModalClose = () => {
    setRemoteFlag(false)
  }

  const openModifyModal = (type: string) => {
    // if(type == 'UPDATE'!selectedRow || selectedIndex < 0) {
    //   alert('수정할 정보를 선택해주세요.')
    //   return;
    // }else {
    //   setModalType('UPDATE');
    //   setRemoteFlag(true);
    // }

    if (type == 'UPDATE') {
      if (!selectedRow || selectedIndex < 0) {
        alert('수정할 정보를 선택해주세요.')
        return
      } else {
        setModalType('UPDATE')
        setRemoteFlag(true)
      }
    } else if (type == 'CREATE') {
      setModalType('CREATE')
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
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
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
                htmlFor="ft-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                text={params.brno}
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
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
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
                name="searchStDate"
                value={params.searchStDate}
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
                name="searchEdDate"
                value={params.searchEdDate}
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
              onClick={() => openModifyModal('CREATE')}
            >
              등록
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => openModifyModal('UPDATE')}
            >
              수정
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteData()}
            >
              삭제
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
              title={
                modalType == 'UPDATE'
                  ? '보조금지급정지수정'
                  : '보조금지급정지등록'
              }
              size={'xl'}
              formLabel="저장"
              formId="send-tr-modify"
              closeHandler={handleModalClose}
              remoteFlag={remoteFlag}
            >
              <BsModalContent
                data={modalType == 'UPDATE' ? (selectedRow as Row) : null}
                reload={handleReload}
                type={modalType}
              />
            </FormModal>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
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

      <BsDetail
        row={selectedRow as Row} // 목록 데이터
      />
    </>
  )
}

export default DataList
