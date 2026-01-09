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
import React, { useEffect, useState } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'

interface VhclHisSearchModal {
  title: string
  url: string
  open: boolean
  row: any
  onCloseClick: (row: any) => void
}

const headCells: HeadCell[] = [
  {
    id: 'hstrySn',
    numeric: false,
    disablePadding: false,
    format: 'number',
    label: '순번',
  },
  {
    id: 'mdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '변경일자',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
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
  {
    id: 'dscntYn',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
  },
  {
    id: 'rfidNm',
    numeric: false,
    disablePadding: false,
    label: 'RFID차량여부',
  },
]

export interface VhclHisRow {
  hstrySn: string
  mdfcnDt: string
  locgovNm: string
  vhclSttsNm: string
  koiNm: string
  vhclSeNm: string
  dscntYn: string
  rfidNm: string
}

export const VhclHisSearchModal = (props: VhclHisSearchModal) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<VhclHisRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, url, open, row, onCloseClick } = props

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 5, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `${url}?vhclNo=${row.vhclNo}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        setTotalRows(response.data.length)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
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
                  <CustomTextField id="ft-vhclNo" name="vhclNo" value={row?.vhclNo} disabled />
                </div>
                <div className="form-group">
                  <CustomFormLabel htmlFor="ft-bzentyNm" className="input-label-display">
                    업체명
                  </CustomFormLabel>
                  <CustomTextField
                    name="bzentyNm"
                    id="ft-bzentyNm"
                    value={row?.bzentyNm}
                    disabled
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
              loading={loading} // 로딩여부
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

export default VhclHisSearchModal
