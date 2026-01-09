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
import { stnvmTxCalModalheadCells } from '@/utils/fsms/headCells'

interface TrUsedModalProps {
  title: string
  url: string
  open: boolean
  onRowClick: () => void
  onClickNew: () => void
  onCloseClick: () => void
}


export interface TrUsedRow {
  bzentyNm: string; // 업체명
  crno: string; // 법인등록번호
  crnoS: string; // 법인등록번호(복호화)
  rprsvNm: string; // 대표자명
  bzmnSeCd: string; // 사업자구분코드
  bzmnSeNm: string; // 사업자구분코드명
  vonrNm: string; // 차량소유자명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const TrUsedSearchModal = (props: TrUsedModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<TrUsedRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, url, open, onRowClick,onClickNew ,onCloseClick } = props

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

      // if (!params.bzentyNm) {
      //   alert('업체명을 입력해주세요.')
      //   return
      // }

      // if (!params.crno) {
      //   alert('법인등록번호를 입력해주세요.')
      //   return
      // }


      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}&` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.crno ? '&crno=' + params.crno : ''}` 

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
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
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
        //onClose={onCloseClick}
        >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained" color="primary"
                onClick={onClickNew}
              >
                등록
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={onCloseClick}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                  <span className="required-text">*</span>업체명
                  </CustomFormLabel>
                  <CustomTextField
                    name="bzentyNm"
                    value={params.bzentyNm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                  <span className="required-text">*</span>법인등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    name="crno"
                    value={params.crno}
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
              headCells={stnvmTxCalModalheadCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={onRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              cursor={false}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TrUsedSearchModal
