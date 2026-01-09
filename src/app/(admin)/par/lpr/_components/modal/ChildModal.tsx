import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, TableCell, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

import { Pageable2, HeadCell } from 'table'

interface BrnoModal {
  title: string
  open: boolean
  url: string
  onRowClick: (row: any) => void
  onCloseClick: (row: any) => void
}

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2}>원차주여부</TableCell>
        <TableCell rowSpan={2}>차량번호</TableCell>
        <TableCell rowSpan={2}>유종</TableCell>
        <TableCell rowSpan={2}>카드번호</TableCell>
        <TableCell rowSpan={2}>카드첫사용일</TableCell>
        <TableCell colSpan={3}>원차주정보</TableCell>
        <TableCell colSpan={4}>대리운전자정보</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>성명</TableCell>
        <TableCell>사업자등록번호</TableCell>
        <TableCell>주민등록번호</TableCell>
        <TableCell>성명</TableCell>
        <TableCell>주민등록번호</TableCell>
        <TableCell>시작일</TableCell>
        <TableCell>종료일</TableCell>
      </TableRow>
    </TableHead>
  )
}

const headCell : HeadCell[] = [
  {
    id: 'agdrvrYnNm',
    numeric: false,
    disablePadding: false,
    label: '원차주여부',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종'
  },
  {
    id: 'secureCardNo',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'cardFrstUseYmd',
    numeric: false,
    disablePadding: false,
    label: '카드첫사용일',
    format: 'yyyymmdd',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '원차주정보-성명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '원차주정보-사업자등록번호',
    format: 'brno'
  },
  {
    id: 'secureRrno',
    numeric: false,
    disablePadding: false,
    label: '원차주정보-주민등록번호',
    format: 'rrno'
  },
  {
    id: 'agdrvrNm',
    numeric: false,
    disablePadding: false,
    label: '대리운전자정보-성명',
  },
  {
    id: 'secureAgdrvrRrno',
    numeric: false,
    disablePadding: false,
    label: '대리운전자정보-주민등록번호',
    format: 'rrno',
  },
  {
    id: 'agncyDrvBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '대리운전자정보-시작인',
    format: 'yyyymmdd'
  },
  {
    id: 'agncyDrvEndYmd',
    numeric: false,
    disablePadding: false,
    label: '대리운전자정보-종료일',
    format: 'yyyymmdd'
  }
]

export interface BrnoRow {
  brno: string
  rrno: string
  flnm: string
  agdrvrYn: string
  agdrvrYnNm: string
  agdrvrNm: string
  vhclNo: string
  koiCd: string
  koiNm: string
  cardFrstUseYmd: string
  crdcoCd: string
  secureCardNo: string
  secureRrno: string
  secureAgdrvrRrno: string
  agncyDrvBgngYmd: string
  agnctDrvEndYmd: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BrnoModal = (props: BrnoModal) => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<BrnoRow[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, open, url, onRowClick, onCloseClick } = props;

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    sort: '' // 정렬 기준 추가
  });

  useEffect(() => {
      fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag) 
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.rrno ? '&rrno=' + params.rrno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)

      } else {
        // 데이터가 없거나 실패
        setRows([])
      }
    } catch (error) {
      // 에러시
      setRows([])
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
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

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
      <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h2>{title}</h2>
          </CustomFormLabel>
          <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={(fetchData)}>검색</Button>
              <Button variant="contained" color="dark" onClick={(onCloseClick)}>취소</Button>
          </div>
        </Box>
        {/* 검색영역 시작 */}
        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
          <Box className="sch-filter-box">       
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                >
                  <span className="required-text" >*</span>사업자등록번호
                </CustomFormLabel>
                <CustomTextField name="brno" value={params.brno} onChange={handleSearchChange} onKeyDown={handleKeyDown} />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                >주민등록번호
                </CustomFormLabel>
                <CustomTextField name="rrno" value={params.rrno} onChange={handleSearchChange} onKeyDown={handleKeyDown} />
              </div>
            </div>
          </Box>
        </Box>
        {/* 검색영역 시작 */}

        {/* 테이블영역 시작 */}
        <Box>
          <TableDataGrid
            headCells={headCell} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            loading={loading} // 로딩여부
            onRowClick={onRowClick} // 행 클릭 핸들러 추가
            customHeader={customHeader}
          />
        </Box>
        {/* 테이블영역 끝 */}
      </DialogContent>
    </Dialog>
  </Box>
  );
}

export default BrnoModal;