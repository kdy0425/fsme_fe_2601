/* React */
import React, { useEffect, useState, memo } from 'react'

/* 공통 component */
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'

/* mui */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'

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
  onCloseClick: () => void
  pDisableSelectAll?:boolean
  isNotRollCheck?:boolean
}

const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
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
  {
    id: 'cmSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  },
]

export interface VhclRow {
  vhclNo: string //차량번호
  brno: string //사업자등록번호
  bzentyNm: string //업체명
  bzmnSeNm: string //개인법인구분
  bmSttsNm: string //사업자상태
  rprsvNm: string //수급자명
  rprsvRrno: string //수급자주민등록번호 암호화
  rprsvRrnoS: string //수급자주민등록번호 복호화 및 마스킹
  koiNm: string //유종명
  dayoffYn: string //부제여부
  dayoffGroupNm: string //부제그룹명
  dscntNm: string //할인여부
  crno: string //법인등록번호
  telno: string //전화번호
  ntsChgYmd: string //국세청변경일자
  locgovNm: string //관할관청
  cmSttsNm: string //차량상태
  cmSttsCd: string //차량상태
  rgtrId: string //등록자아이디
  regDt: string //등록일자
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일자
  bzmnSeCd: string //개인법인구분
  locgovCd: string //관할관청
  koiCd: string //유종
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number,
  size: number,
  ctpvCd:string,
  locgovCd:string,
  vhclNo:string,
  brno:string
}

export const VhclSearchModal = (props: VhclSearchModalProps) => {
  
  const { title, open, onRowClick, onCloseClick, pDisableSelectAll, isNotRollCheck } = props
  
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<VhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [params, setParams] = useState<listSearchObj>({ page: 1, size: 10, ctpvCd:'', locgovCd:'', vhclNo:'', brno:'' });
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 });

  useEffect(() => {
    if(params.ctpvCd || params.locgovCd) {
      fetchData()
    }
  }, [flag])

  const resetParams = () => {
    setParams({
      page: 1,
      size: 10,
      ctpvCd: '',
      locgovCd: '',
      vhclNo: '',
      brno: ''
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    setLoading(true)
    
    try {
      
      if(!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if(!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }

      const searchObj = {
        ...params,
        page:params.page,
        size:params.size,
        brno:params.brno.replaceAll('-',''),
      };

      // 검색 조건에 맞는 endpoint 생성
      const endpoint = '/fsm/stn/vm/tx/getAllVhcleMng' + toQueryParameter(searchObj);  
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

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
    }
  }

  // 조회시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({...prev, page: page, size: pageSize}));
    setFlag(!flag)
  }

  // 검색조건 변경시
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 차량검색 모달 닫을 때 파라미터 초기화
  const onClose = () => {
    resetParams()
    onCloseClick()
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={onClose}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <DialogTitle id="alert-dialog-title1">
              <span className="popup-title">{title ?? '차량번호 조회'}</span>
            </DialogTitle>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={handleAdvancedSearch}>
                검색
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={onClose}
              >
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent>
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
                    pDisableSelectAll={pDisableSelectAll}
                    isNotRollCheck={isNotRollCheck}
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
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              caption={"차량번호 목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default memo(VhclSearchModal);
