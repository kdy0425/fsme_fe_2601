'use client'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent, IconButton } from '@mui/material'
import { IconSearch } from '@tabler/icons-react'
import React, { useState } from 'react'
import { HeadCell, Pageable2 } from 'table'
import { Row } from '../page'

const headCells: HeadCell[] = [
  {
    id: 'ctpvCd',
    numeric: false,
    disablePadding: false,
    label: '시도코드',
  },
  {
    id: 'ctpvNm',
    numeric: false,
    disablePadding: false,
    label: '시도명',
  },
  {
    id: 'sggCd',
    numeric: false,
    disablePadding: false,
    label: '기관코드',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '기관명',
  },
]

interface SearchModalProps {
  selectedCtpvCd?: string
  handleRowClick: (row: Row) => void
}

export default function SearchModal(props: SearchModalProps) {
  const { selectedCtpvCd, handleRowClick } = props
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [params, setParams] = useState({
    locgovCd: '',
    locgovNm: '',
    ctpvCd: '',
    locgovSeCd: '01',
    clclnLocgovCd: '',
    clclnLocgovNm: '',
  })
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [rows, setRows] = useState<Row[]>([])
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
    // searchLocgov();
  }

  const handleClose = () => {
    setOpen(false)
    setRows([])
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchLocgov()
    }
  }

  const handleSelRowClick = (row: any) => {
    handleRowClick(row)
    setOpen(false)
  }

  const searchLocgov = async () => {
    setLoading(true)
    try {
      let endpoint: string = `/fsm/sym/lc/cm/getAllLocgovCd?&locgovSeCd=1&locgovNm=${params.locgovNm}`
      // + `${selectedCtpvCd ? '&ctpvCd=' + selectedCtpvCd : ''}`;

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <React.Fragment>
      <IconButton onClick={handleClickOpen}>
        <IconSearch />
      </IconButton>

      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지자체조회</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                onClick={searchLocgov}
                color="primary"
              >
                검색
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="search-locgovNm-01"
                  >
                    지자체명
                  </CustomFormLabel>
                  <CustomTextField
                    type="text"
                    id="search-locgovNm-01"
                    name="locgovNm"
                    value={params.locgovNm || ''}
                    onChange={handleParamChange}
                    onKeyDown={handleKeyDown}
                    fullWidth
                  />
                </div>
              </div>
            </Box>
          </Box>

          <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              onRowClick={handleSelRowClick} // 행 클릭 핸들러 추가
            />
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
