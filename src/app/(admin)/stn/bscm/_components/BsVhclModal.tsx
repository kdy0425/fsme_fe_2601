import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getDateRange,
  isValidDateRange,
  sortChange,
  getExcelFile,
  getToday,
} from '@/utils/fsms/common/comm'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { SelectItem } from 'select'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface BsVhclModal {
  buttonLabel: string
  title: string
  url: string
  reload: () => void
}

const headCells: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '',
    format: 'checkbox',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclSeNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
]

export interface BsVhclRow {
  vhclNo: string //차량번호
  locgovNm: string //관할관청
  brno: string //사업자번호
  bzentyNm: string //업체명
  rprsvRrno: string //수급자주민번호
  koiCd: string //유종코드
  vhclSeCd: string //면허업종코드
  delYn: string //삭제여부
  dscntYn: string //할인여부
  locgovAprvYn: string //지자체승인여부
  crno: string //법인등록번호
  rprsvNm: string //대표자명
  zip: string //우편번호
  addr: string //주소
  telno: string //전화번호
  locgovCd: string //관할관청코드
  vhclSttsCd: string //차량상태코드
  rfidYn: string //RFID차량여부
  rgtrId: string //등록자아이디
  regDt: string //등록일자
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일자
  vhclSttsNm: string //차량상태
  dscntNm: string //할인여부
  koiNm: string //유종
  vhclSeNm: string //면허업종
  bzmnSeNm: string //개인법인구분
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  dsgnBgngYmd: string
  endYmd: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BsVhclModal = (props: BsVhclModal) => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<BsVhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩

  const { buttonLabel, title, url, reload } = props

  const [open, setOpen] = useState(false)

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    dsgnBgngYmd: '',
    endYmd: '',
  })

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 5, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    setSelectedRows([])
  }, [open])

  useEffect(() => {
    if (params.ctpvCd || params.locgovCd) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber +1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 5,
          totalPages: response.data.totalPages,
        })
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClickOpen = () => {
    setOpen(true)
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 5,
      totalPages: 0,
    })
  }

  const handleClickClose = () => {
    setOpen(false)
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 5,
      totalPages: 0,
    })
  }

  // 페이지 이동 감지 시작 //
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
        page: page ,
        size: pageSize,
      }))
      setFlag(!flag)
    },
    [],
  )

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  const createCode = async () => {
    if (!(params.dsgnBgngYmd.length > 0 && params.endYmd.length > 0)) {
      alert('준공영제일자를 선택하여 주세요.')
      return
    }
    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    setLoadingBackdrop(true)

    let param: any[] = []
    selectedRows.map((id) => {
      const row = rows[Number(id.replace('tr', ''))]
      param.push({
        vhclNo: row.vhclNo,
        brno: row.brno,
        locgovCd: row.locgovCd,
        dsgnBgngYmd: params.dsgnBgngYmd.replaceAll('-', ''),
        endYmd: params.endYmd.replaceAll('-', ''),
      })
    })
    const updatedRows = { list: param }

    let endpoint: string = `/fsm/stn/bscm/bs/createBusSeytCarMng`

    const userConfirm = confirm('선택된 차량을 준공영제로 등록하시겠습니까?')

    if (userConfirm) {
      const response = await sendHttpRequest(
        'POST',
        endpoint,
        updatedRows,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        alert(response.message)
        reload()
        setOpen(false)
        setLoadingBackdrop(false)
      } else {
        alert(response.message)
        setLoadingBackdrop(false)
      }
    } else {
      setLoadingBackdrop(false)
      return
    }
  }

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        //onClose={handleClickClose}
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
              <Button variant="contained" color="primary" onClick={createCode}>
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
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
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                    사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-brno"
                    name="brno"
                    value={params.brno}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    <span className="required-text">*</span>준공영제시작일자
                  </CustomFormLabel>
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="ft-date-start"
                  >
                    준공영제월일 시작
                  </CustomFormLabel>
                  <CustomTextField
                    type="date"
                    id="ft-date-start"
                    name="dsgnBgngYmd"
                    onChange={handleSearchChange}
                    inputProps={{ max: params.endYmd }}
                    value={params.dsgnBgngYmd}
                    fullWidth
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    <span className="required-text">*</span>준공영제종료일자
                  </CustomFormLabel>
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="ft-date-end"
                  >
                    준공영제월일 종료
                  </CustomFormLabel>
                  <CustomTextField
                    type="date"
                    id="ft-date-end"
                    name="endYmd"
                    onChange={handleSearchChange}
                    inputProps={{ min: params.dsgnBgngYmd }}
                    value={params.endYmd}
                    fullWidth
                  />
                </div>
                <LoadingBackdrop open={loadingBackdrop} />
              </div>
            </Box>
            <br></br>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={() => {}} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              onCheckChange={handleCheckChange}
              caption={"버스차량목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsVhclModal
