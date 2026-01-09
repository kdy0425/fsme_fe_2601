import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getCommCd,
  getCommCdContent,
  getExcelFile,
  getToday,
} from '@/utils/fsms/common/comm'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { HeadCell, Pageable2 } from 'table'
import { Row } from '../page'
import { stnTccTnkCpctyApproveTrHc } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

export interface SearchRow {
  mnfctrNm: string // 제작사명
  vhclNm: string // 차명
  frmNm: string // 형식
  yridnw: string // 연식
  dtaMngNo: string // 제원관리번호
  tnkCpcty: string // 탱크용량
  vhclTonNm: string // 톤수
}

const tonData = [
  // 코드그룹 /fsm/cmm/cmmn/cm/getAllCmmnCd [971]
  {
    value: '',
    label: '전체',
  },
  {
    value: '01',
    label: '1톤이하',
  },
  {
    value: '02',
    label: '3톤이하',
  },
  {
    value: '03',
    label: '5톤이하',
  },
  {
    value: '04',
    label: '8톤이하',
  },
  {
    value: '05',
    label: '10톤이하',
  },
  {
    value: '06',
    label: '12톤이하',
  },
  {
    value: '07',
    label: '12톤초과',
  },
]

const makerData = [
  {
    value: '',
    label: '전체',
  },
  {
    value: 'Volvo',
    label: 'Volvo',
  },
  {
    value: '다임러',
    label: '다임러',
  },
  {
    value: '만트럭버스코리아',
    label: '만트럭버스코리아',
  },
  {
    value: '스카니아',
    label: '스카니아',
  },
  {
    value: '쌍용',
    label: '쌍용',
  },
  {
    value: '이베코',
    label: '이베코',
  },
  {
    value: '타타대우',
    label: '타타대우',
  },
  {
    value: '한국지엠',
    label: '한국지엠',
  },
  {
    value: '현대/기아',
    label: '현대/기아',
  },
]

interface ModalFormProps {
  buttonLabel: string
  size: DialogProps['maxWidth'] | 'lg'
  title: string
  detail: Row
}

const SearchModal = (props: ModalFormProps) => {
  const { buttonLabel, size, title, detail } = props
  const [loading, setLoading] = useState(false) // 로딩여부

  const [params, setParams] = useState({
    page: Number(1), // 페이지 번호는 1부터 시작
    size: Number(10),
    mnfctrNm: '', // 제작사명
    vhclNm: '', // 차명
    ctpvCd: '',
    locgovCd: '',
    vhclTonCd: '',
  })

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<SearchRow[]>([])
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [excelLoading, setExcelLoading] = useState<boolean>(false)
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setParams({
      page: Number(1), // 페이지 번호는 1부터 시작
      size: Number(10),
      mnfctrNm: '', // 제작사명
      vhclNm: '', // 차명
      ctpvCd: '',
      locgovCd: '',
      vhclTonCd: '',
    })
    setPageable({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 10, // 기본 페이지 사이즈 설정
      totalPages: 1,
    })
    setTotalRows(0)
    setRows([])
    setOpen(false)
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  useEffect(() => {
    // if(!params.mnfctrNm && !params.vhclNm && !params.frmNm && !params.yridnw && !params.vhclTonNm) {
    //   return
    // }
    if (flag != undefined) {
      fetchData()
    }
  }, [flag])

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
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
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, page: 1, size: 10, [name]: value }))
  }

  const fetchData = async () => {
    // if(!params.vhclNm && !params.frmNm && !params.dtaMngNo && ! params.vhclTonNm){
    //   alert('조회 시 검색 조건 하나는 필수로 입력해야 합니다.')
    //   return
    // }
    setLoading(true)
    setExcelFlag(true)
    try {
      let endpoint: string =
        `/fsm/stn/tcc/tr/tnkCpctyApprove?page=${params.page}&size=${params.size}` +
        `${params.mnfctrNm ? '&mnfctrNm=' + params.mnfctrNm : ''}` +
        `${params.vhclNm ? '&vhclNm=' + params.vhclNm.replaceAll(' ', '').replaceAll(/\n/g, '').replaceAll(/\t/g, '') : ''}` +
        `${params.vhclTonCd ? '&vhclTonCd=' + params.vhclTonCd : ''}`

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
      console.error('ERROR ::: ', error)
    } finally {
      setLoading(false)
    }
  }

  // 전체 엑셀 다운로드 처리
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
      setExcelLoading(true)
      let endpoint: string =
        `/fsm/stn/tcc/tr/tnkCpctyApproveExcel?` +
        `${params.mnfctrNm ? '&mnfctrNm=' + params.mnfctrNm : ''}` +
        `${params.vhclNm ? '&vhclNm=' + params.vhclNm.replaceAll(' ', '').replaceAll(/\n/g, '').replaceAll(/\t/g, '') : ''}` +
        `${params.vhclTonCd ? '&vhclTonCd=' + params.vhclTonCd : ''}`

      await getExcelFile(
        endpoint,
        '탱크용량 변경심사 통계 정보' + '_' + getToday() + '.xlsx',
      )
      setExcelLoading(false)
    } catch (error) {
      alert(error)
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        style={{ marginRight: '6px' }}
        onClick={handleClickOpen}
      >
        {props.buttonLabel}
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={props.size}
        open={open}
        //onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{props.title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                type="submit"
                form="search-form"
                color="primary"
              >
                검색
              </Button>
              <Button
                variant="contained"
                onClick={() => excelDownload()}
                color="success"
              >
                엑셀
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <TableContainer style={{ margin: '16px 0 4em 0' }}>
            <Box
              component="form"
              id="search-form"
              onSubmit={handleAdvancedSearch}
              sx={{ mb: 2 }}
            >
              <Box className="sch-filter-box">
                {/* <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text"></span>시도명
                  </CustomFormLabel>
                  <CtpvSelectAll
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
                    <span className="required-text"></span>관할관청
                  </CustomFormLabel>
                  <LocgovSelectAll
                    ctpvCd={params.ctpvCd}
                    pValue={params.locgovCd}
                    handleChange={handleSearchChange}
                    htmlFor={'sch-locgov'}
                  />
                </div>
              </div><hr></hr> */}
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-mnfctrNm"
                  >
                    <span className="required-text" ></span>제작사명
                  </CustomFormLabel>
                  <select
                    id="ft-mnfctrNm"
                    className="custom-default-select"
                    name="mnfctrNm"
                    value={params.mnfctrNm}
                    onChange={handleSearchChange}
                    style={{ width: '80%' }}
                    
                  >
                    {makerData.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* <CustomTextField  style={{ width: '80%' }} type="text" name='mn' 
                  onChange={handleSearchChange} value={params.vhclNm} id="ft-car-name" fullWidth 
                  inputProps={{
                    maxLength: 50,
                  }}
                  /> */}
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-car-name">
                    <span className="required-text" ></span>차명</CustomFormLabel>
                  <CustomTextField  style={{ width: '130%' }} type="text" name='vhclNm' 
                  onChange={handleSearchChange} value={params.vhclNm} id="ft-car-name" fullWidth 
                  inputProps={{
                    maxLength: 50,
                  }}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-tons"
                  >
                    톤수
                  </CustomFormLabel>
                  <select
                    id="ft-tons"
                    className="custom-default-select"
                    name="vhclTonCd"
                    value={params.vhclTonCd}
                    onChange={handleSearchChange}
                    style={{ width: '100%' }}
                  >
                    {tonData.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-car-dtaMngNo"><span className="required-text" >*</span>제원관리번호</CustomFormLabel>
                  <CustomTextField style={{ width: '80%' }} type="text" name='dtaMngNo' 
                  onChange={handleSearchChange} value={params.dtaMngNo} id="ft-car-name" fullWidth 
                  inputProps={{
                    maxLength: 50,
                  }}/>
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-tons"
                  >
                  <span className="required-text" >*</span>톤수
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="971"
                    pValue={params.vhclTonNm}
                    handleChange={handleSearchChange}
                    pName="vhclTonNm"
                    htmlFor={'sch-vhclTonNm'}
                    addText="전체"
                  />
                </div> */}
              </div>
              </Box>
            </Box>

            {/* 테이블영역 시작 */}
            <Box>
              <TableDataGrid
                headCells={stnTccTnkCpctyApproveTrHc} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                totalRows={totalRows} // 총 로우 수
                loading={loading} // 로딩여부
                onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={pageable} // 현재 페이지 / 사이즈 정보
                paging={true}
                cursor={false}
                caption={'모델별 탱크용량 조회 목록'}
              />
            </Box>
            {/* 테이블영역 끝 */}
          </TableContainer>
        </DialogContent>
        <LoadingBackdrop open={excelLoading} />
      </Dialog>
    </>
  )
}

export default SearchModal
