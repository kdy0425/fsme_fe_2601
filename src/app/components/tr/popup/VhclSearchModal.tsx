/* React */
import React, { useEffect, useState } from 'react'

/* 공통 component */
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect,
  CtpvSelectAll,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'

/* mui */
import { Box, Button, Dialog, DialogContent } from '@mui/material'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* 공통 type, interface */
import { HeadCell, Pageable2 } from 'table'

/* interface, type 선언 */
interface VhclSearchModalProps {
  title?: string
  open: boolean
  onRowClick: (row: any) => void
  onCloseClick: (row: any) => void
  RowClickClose?: boolean
  ctpvAllVisable?: boolean
  locgovAllVisable?: boolean
}

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
    id: 'vonrRrnoSecure',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
  },
]

export interface VhclRow {
  vhclNo: string //차량번호
  locgovCd: string //관할관청 코드
  koiCd: string //유종코드
  koiNm: string //유종
  vhclTonCd: string //톤수코드
  vhclTonNm: string //톤수

  /* 현재 차량정보모달 데이터 가지고 오는형식 */
  crno: string //법인등록번호(원본)
  crnoS: string //법인등록번호(복호화)
  crnoSecure: string //법인등록번호(복호화)
  vonrRrno: string //주민등록번호(원본)
  vonrRrnoS: string //주민등록번호(복호화)
  vonrRrnoSecure: string //주민등록번호(별표)

  lcnsTpbizCd: string //업종코드
  vhclSeCd: string //차량구분코드
  vhclRegYmd: string //차량등록일자
  yridnw: string //연식
  len: string //길이
  bt: string //너비
  maxLoadQty: string //최대적재수량
  vhclSttsCd: string //차량상태코드
  vonrNm: string //차량소유자명
  vonrBrno: string //차주사업자등록번호
  vhclPsnCd: string //차량소유코드
  vhclPsnNm: string
  delYn: string //삭제여부
  dscntYn: string //할인여부
  souSourcSeCd: string //원천소스구분코드
  bscInfoChgYn: string //기본정보변경여부
  locgovAprvYn: string //지자체승인여부
  rgtrId: string //등록자아이디
  regDt: string //등록일시
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일시
  locgovNm: string //관할관청
  prcsSttsCd: string //차량상태코드
  isTodayStopCancel: string // 당일 복원여부
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const VhclSearchModal = (props: VhclSearchModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<VhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const {
    title,
    open,
    onRowClick,
    onCloseClick,
    RowClickClose,
    ctpvAllVisable,
    locgovAllVisable,
  } = props

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
    if (flag) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    if (open) {
    } else {
      setRows([])
    }
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
      }

      // 검색 조건에 맞는 endpoint 생성
      const endpoint =
        '/fsm/stn/vm/tr/getAllVhcleMng' + toQueryParameter(searchObj)
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

  const handleRowClick = (row: any) => {
    onRowClick(row)
    if (RowClickClose) {
      onCloseClick({})
    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag(true)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
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
              <h2>{title ?? '차량번호 조회'}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdvancedSearch}
              >
                검색
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>시도명
                  </CustomFormLabel>
                  {ctpvAllVisable ? (
                    <CtpvSelectAll
                      pValue={params.ctpvCd}
                      handleChange={handleSearchChange}
                      htmlFor={'sch-ctpv'}
                    />
                  ) : (
                    <CtpvSelect
                      pValue={params.ctpvCd}
                      handleChange={handleSearchChange}
                      htmlFor={'sch-ctpv'}
                    />
                  )}
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-locgov"
                  >
                    <span className="required-text">*</span>관할관청
                  </CustomFormLabel>
                  {locgovAllVisable ? (
                    <LocgovSelectAll
                      ctpvCd={params.ctpvCd}
                      pValue={params.locgovCd}
                      handleChange={handleSearchChange}
                      htmlFor={'sch-locgov'}
                    />
                  ) : (
                    <LocgovSelect
                      ctpvCd={params.ctpvCd}
                      pValue={params.locgovCd}
                      handleChange={handleSearchChange}
                      htmlFor={'sch-locgov'}
                    />
                  )}
                </div>
              </div>
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
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vonrNm"
                  >
                    소유자명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vonrNm"
                    name="vonrNm"
                    value={params.vonrNm}
                    onChange={handleSearchChange}
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
              onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              caption={'차량번호 목록 조회'}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default VhclSearchModal
