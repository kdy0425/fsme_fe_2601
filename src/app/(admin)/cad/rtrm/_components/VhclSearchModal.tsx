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
  DialogTitle,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import React, { use, useEffect, useState } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'

interface VhclSearchModal {
  title: string
  url: string
  open: boolean
  row?: any
  vhclNo?: string
  setVhcl?: (row: any) => void | undefined
  onCloseClick: () => void
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
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '주민사업자번호',
    format: 'rrno',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
]

export interface VhclRow {
  hstrySn: string
  mdfcnDt: string
  vhclNo: string
  locgovNm: string
  vhclSttsNm: string
  koiNm: string
  vhclSeNm: string
  dscntYn: string
  rfidNm: string
}

export const VhclSearchModal = (props: VhclSearchModal) => {
  const [flag, setFlag] = useState<boolean>() // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<VhclRow[]>([]) // 가져온 로우 데이터
  const [selectedRow, setSelectedRow] = useState<VhclRow>()
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [params, setParams] = useState({
    vhclNo:  '',
  })
  const { title, url, open, row,vhclNo, onCloseClick , setVhcl} = props

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*_\-+=(){}[\]|\\:;"'<>,.?/]/g
    setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ', '').replaceAll(/\t/g, "") }))
  }

  const handleRowClick = (row: VhclRow, index?: number) => {
    setSelectedRow(row)
    if(confirm(row.vhclNo + ' 차량번호로 선택하시겠습니까?')) {
      setVhcl && setVhcl(row) // 선택된 행을 상위 컴포넌트로 전달
      onCloseClick();
    }
  }

  const searchFlag = (totalRows : number) =>{
    if(totalRows === 0){
      if(confirm('검색된 차량이 없습니다. 검색하신 차량번호로 RFID태그요청 등록하시겠습니까?')) {
        setVhcl && setVhcl({ 
          vhclNo: params.vhclNo, 
          vonrNm: '', // 소유자명
          vhclTonCd: '', // 톤수코드
          locgovCd: '', // 지자체코드
          locgovNm: '', // 지자체코드명
          vonrBrno: '', // 사업자번호
          koiCd: '', // 유종
          brno: '', // 주민사업자번호
          bzentyNm: '', // 업체명
          rprsvNm: '', // 대표자명
          vonrRrno: '', // 주민등록번호
        }) // 상위 컴포넌트로 차량번호 전달
        onCloseClick();
      }
    }
  }

  const onSearch = (event: React.FormEvent) => {
    setFlag(!flag)
  }

  useEffect(() => {
    // 초기 로우 데이터 설정
    if(!props.open){
      setRows([]) // 모달이 닫힐 때 로우 데이터 초기화
      setParams({ vhclNo: '' }) // 검색 조건 초기화
      setSelectedRow(undefined) // 선택된 행 초기화
    }
  }, [props.open])

  useEffect(() => {
    if(flag !== undefined) {
      fetchData()
    } 
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if(params.vhclNo === null || params.vhclNo === '') {
      alert('차량번호를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `${url}?vhclNo=${params.vhclNo}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        setTotalRows(response.data.length)
        setSelectedRow(undefined)
        if(response.data.length === 0){
          setLoading(false) // 데이터가 없을 경우 로딩 상태 해제
          searchFlag(response.data.length);
        } 
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setSelectedRow(undefined)
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
      setSelectedRow(undefined)
    } finally {
      setLoading(false)
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
              <Button variant="contained" color="primary" onClick={onSearch}>
                검색
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box component="form" sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel htmlFor="ft-vhclNo" className="input-label-display">
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField id="ft-vhclNo" name="vhclNo" value={params?.vhclNo} onChange={handleSearchChange} inputProps={{ maxLength: 9 }}  />
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
              loading={loading} // 로딩여부
              onRowClick={handleRowClick} // 행 클릭 이벤트
              cursor={false}
              caption={"차량이력 조회 목록"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default VhclSearchModal
