import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { HeadCell, Pageable2 } from 'table'

interface VhclSearchModalProps {
  title: string
  url: string
  open: boolean
  onRowClick: (row: VhclRow) => void
  onCloseClick: () => void
}

const headCells: HeadCell[] = [
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
]

export interface VhclRow {
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
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BsVhclSearchModal = (props: VhclSearchModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<VhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, url, open, onRowClick, onCloseClick } = props

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    setRows([])
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
    })
    setPageable({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 10, // 기본 페이지 사이즈 설정
      totalPages: 1, // 정렬 기준
    })
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
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}&vhclErsrYn=N` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      console.log('RESPONSE ::: ', response)

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        // setTotalRows(response.data.totalElements)
        // setPageable({
        //   pageNumber: response.data.pageable.pageNumber + 1,
        //   pageSize: response.data.pageable.pageSize,
        //   totalPages: response.data.totalPages,
        // })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        // setTotalRows(0)
        // setPageable({
        //   pageNumber: 1,
        //   pageSize: 10,
        //   totalPages: 1,
        // })
      }
    } catch (error) {
      // 에러시
      setRows([])
      // setTotalRows(0)
      // setPageable({
      //   pageNumber: 1,
      //   pageSize: 10,
      //   totalPages: 1,
      // })
    } finally {
      setLoading(false)
    }
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
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
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
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <DialogTitle id="alert-dialog-title1">
              <span className="popup-title">{title}</span>
            </DialogTitle>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent>
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
                  <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-brno">
                    사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-brno"
                    name="brno"
                    value={params.brno}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
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
              onRowClick={onRowClick} // 행 클릭 핸들러 추가
              // onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              // pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={false}
              cursor={true}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsVhclSearchModal
