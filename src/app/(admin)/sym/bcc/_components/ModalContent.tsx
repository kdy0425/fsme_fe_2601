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

interface ModalContent {
  title: string
  url: string
  open: boolean
  row: any
  onCloseClick: (row: any) => void
}

const headCells: HeadCell[] = [
  {
    id: 'procNm',
    numeric: false,
    disablePadding: false,
    label: '프로세스명',
  },
  {
    id: 'procKornNm',
    numeric: false,
    disablePadding: false,
    label: '전문내용',
  },
  {
    id: 'dlngNm',
    numeric: false,
    disablePadding: false,
    label: '송수신여부',
  },
  {
    id: 'excnBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '실행시작일자',
    format:'yyyymmdd'
  },
  {
    id: 'schdulExcnTm',
    numeric: false,
    disablePadding: false,
    label: '실행시작시간',
    format: 'hh24miss',
  },
  {
    id: 'excnEndYmd',
    numeric: false,
    disablePadding: false,
    label: '실행종료일자',
    format:'yyyymmdd'
  },
  {
    id: 'excnEndTm',
    numeric: false,
    disablePadding: false,
    label: '실행종료시간',
    format: 'hh24miss',
  },
  {
    id: 'schdulPrgrsSttsNm',
    numeric: false,
    disablePadding: false,
    label: '오류내용',
  },
  {
    id: 'prcsNocs',
    numeric: false,
    disablePadding: false,
    label: '처리건수',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'errorNocs',
    numeric: false,
    disablePadding: false,
    label: '오류건수',
    format: 'number',
    align: 'td-right',
  },
];

export interface ProcHisRow {
  procNm: string;
  procKornNm: string;
  dlngCd: string;
  dlngNm: string;
  useYn: string;
  schdulSeCd: string;
  schdulExcnYmd: string;
  schdulExcnTm: string;
  excnBgngYmd: string;
  excnBgngTm: string;
  excnEndYmd: string;
  excnEndTm: string;
  excnNocs: string;
  schdulPrgrsSttsCd: string;
  schdulPrgrsSttsNm: string;
  prcsNocs: string;
  errorNocs: string;
}

export const ModalContent = (props: ModalContent) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<ProcHisRow[]>([]) // 가져온 로우 데이터
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
      let endpoint: string = `${url}?procNm=${row.procNm}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data)
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

          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              cursor={false}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ModalContent
