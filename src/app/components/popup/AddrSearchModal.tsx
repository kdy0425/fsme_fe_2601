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
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { SelectItem } from 'select'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

interface AddrSearchModalProps {
  open: boolean
  onRowClick: (row: AddrRow) => void
  onCloseClick: () => void
}

const headCells: HeadCell[] = [
  {
    id: 'zipNo',
    numeric: false,
    disablePadding: false,
    label: '우편번호',
  },
  {
    id: 'roadAddr',
    numeric: false,
    disablePadding: false,
    label: '도로명주소',
  },
]

export interface AddrRow {
  roadAddr: string
  roadAddrPart1: string
  roadAddrPart2: string
  jibunAddr: string
  engAddr: string
  zipNo: string
  admCd: string
  rnMgtSn: string
  bdMgtSn: string
  detBdNmList: string
  bdNm: string
  bdKdcd: string
  siNm: string
  sggNm: string
  emdNm: string
  liNm: string
  rn: string
  udrtYn: string
  buldMnnm: string
  buldSlno: string
  mtYn: string
  lnbrMnnm: string
  lnbrSlno: string
  emdNo: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const AddrSearchModal = (props: AddrSearchModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<AddrRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const { open, onRowClick, onCloseClick } = props

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 20, // 기본 페이지 사이즈 설정
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 20, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    setRows([])
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 20, // 기본 페이지 사이즈 설정
    })
    setPageable({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 20, // 기본 페이지 사이즈 설정
      totalPages: 1, // 정렬 기준
    })
  }, [open])

  useEffect(() => {
    if (params.keyword) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.keyword) {
        alert('검색 할 주소를 입력해주세요.')
        return
      }
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `https://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=${params.page}&countPerPage=${params.size}` +
        `&confmKey=U01TX0FVVEgyMDI1MDIxMTEwNTc0NjExNTQ2MDI=` +
        `&firstSort=road` +
        `&resultType=json` +
        `${params.keyword ? '&keyword=' + params.keyword : ''}`
      //`&confmKey=devU01TX0FVVEgyMDI0MTIwNDEzMDgwNjExNTI5NTM=` + 로컬에서 할거면 juso.go.kr 가서 본인 아이피로 발급받아야함
      //`&confmKey=devU01TX0FVVEgyMDI0MTIwNDExMzQzNjExNTI5NTI=` + 210.206.251.44 서버 키
      //`&confmKey=U01TX0FVVEgyMDI1MDIxMTEwNTc0NjExNTQ2MDI=` 행정망
      // 10.182.60.20:433 10.182.60.20:80 행정망
      const response = await fetch(endpoint)
      const data: any = await response.json()

      if (data.results.juso) {
        setRows(data.results.juso)
        setTotalRows(data.results.common.totalCount)
        setPageable({
          pageNumber: data.results.common.currentPage,
          pageSize: data.results.common.countPerPage,
          totalPages: Math.ceil(
            data.results.common.totalCount / data.results.common.countPerPage,
          ),
        })
      } else {
        alert(data.results.common.errorMessage)
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
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
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <DialogTitle id="alert-dialog-title1">
              <span className="popup-title">주소검색</span>
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
                    htmlFor="keyword"
                  >
                    주소
                  </CustomFormLabel>
                  <CustomTextField
                    id="keyword"
                    name="keyword"
                    value={params.keyword}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    fullWidth
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
              // totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={onRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              cursor={true}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default AddrSearchModal
