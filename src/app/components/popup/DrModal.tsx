import React, { useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { HeadCell, Pageable2 } from 'table'
import { isNumber } from '@/utils/fsms/common/comm'

const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '운전자명',
  },
  {
    id: 'rrnoSecure',
    numeric: false,
    disablePadding: false,
    label: '운전자 주민등록번호',
    format: 'rrno',
  },
  {
    id: 'ctrtBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '계약시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'ctrtEndYmd',
    numeric: false,
    disablePadding: false,
    label: '계약종료일',
    format: 'yyyymmdd',
  },
  {
    id: 'telno',
    numeric: false,
    disablePadding: false,
    label: '연락처',
    format: 'telno',
  },
]

export interface DriverRow {
  vhclNo: string // 차량번호
  locgovCd?: string // 지자체 코드
  vonrNm?: string // 소유자명
  flnm?: string // 운전자명
  rrno?: string // 운전자 주민등록번호(원본)
  rrnoS?: string // 운전자 주민등록번호(복호화)
  rrnoSecure?: string // 운전자 주민등록번호(별표)
  ctrtBgngYmd?: string // 계약시작일
  ctrtEndYmd?: string // 계약종료일
  fileId?: string // 파일아이디
  telno?: string // 연락처
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일시
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일시
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

interface DrModal {
  title: string
  url: string
  open: boolean
  onCloseClick: () => void
  onRowClick: (row: any) => void
}

export const DrModal = (props: DrModal) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<DriverRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [rrno, setRrno] = useState<string>('') //주민번호

  const { title, url, open, onRowClick, onCloseClick } = props

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준 추가
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    if (params.rrno) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    setSelectedIndex(-1)
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
      sort: '', // 정렬 기준 추가
    })
  }, [open])

  const handleRowClick = (row: DriverRow, index?: number) => {
    setSelectedIndex(index ?? -1)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedIndex(-1)

    try {
      if (!params.rrno || params.rrno === '') {
        alert('주민등록번호를 입력해주세요.')
        return
      }

      setRrno(params.rrno + '')

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}` +
        `${params.rrno ? '&rrno=' + params.rrno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
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

  //저장을하고 나가야함.
  const handleClickStore = () => {
    if (!params.rrno || params.rrno === '') {
      alert('주민등록번호를 입력해주세요.')
      return
    }
    if (params.rrno && typeof params.rrno === 'string' && params.rrno.length !== 13) {
      alert('주민등록번호는 13자리 숫자로 구성되어야 합니다.')
      return
    }
    onRowClick({ ...rows[selectedIndex], rrno: params.rrno })
    setRrno('')
    onCloseClick()
    setRows([])
    setTotalRows(0)
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(!flag)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (isNumber(value) || name !== 'rrno') {
      setParams((prev: any) => ({ ...prev, [name]: value }))
    } else {
      event.target.value = value.substring(0, value.length - 1)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={onCloseClick}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickStore}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => {
                  setRrno('')
                  onCloseClick()
                }}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-rrno"
                  >
                    <span className="required-text">*</span>주민등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-rrno"
                    name="rrno"
                    value={params.rrno}
                    onChange={handleSearchChange}
                    inputProps={{ maxLength: 13 }}
                  />
                </div>
              </div>
              <CustomFormLabel>
                    <span className="required-text">해당 주민번호로 타차량에 등록된 정보가 있는지 확인합니다.</span>
              </CustomFormLabel>
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
              // onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              // selectedRowIndex={selectedIndex}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              //onSortModelChange={handleSortModelChange} // 정렬 모델 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              // cursor={true}
              caption={'운전자정보 목록 조회'}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default DrModal
