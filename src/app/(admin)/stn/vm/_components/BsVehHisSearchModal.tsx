import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { Row } from './TxPage'
import { stnvmBsVeHisSeModalheadCells } from '@/utils/fsms/headCells'

/**
 *  차량정보 변경이력 (버스)
 */

interface BsVehHisSearchModalProps {
  title: string
  url: string
  open: boolean
  data: Row
  onRowClick: () => void
  onCloseClick: () => void
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

//
export const BsVehHisSearchModal = (props: BsVehHisSearchModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const { title, url, open, data, onRowClick, onCloseClick } = props

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
    if (open) {
      fetchData()
    } else {
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
    }
  }, [open])

  useEffect(() => {
    fetchData()
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!data) {
      return
    }
    setLoading(true)
    try {
      // fsm/stn/vm/bs/getAllVhcleMngHis
      let endpoint: string =
        `${url}?page=${params.page}&size=${params.size}` +
        `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
        `${data.bzentyNm ? '&bzentyNm=' + data.bzentyNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        // setTotalRows(0)
        // setPageable({
        //   pageNumber: 1,
        //   pageSize: 10,
        //   totalPages: 1,
        // })
      }
    } catch (error) {
      // 에러시
      setRows([])
      // setTotalRows(0)
      // setPageable({
      //   pageNumber: 1,
      //   pageSize: 10,
      //   totalPages: 1,
      // })
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
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>

          {/* 검색영역 시작 */}
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                    차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={data.vhclNo}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display" htmlFor="ft-bzentyNm">
                    업체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-bzentyNm"
                    name="bzentyNm"
                    value={data.bzentyNm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
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
              headCells={stnvmBsVeHisSeModalheadCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              //totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={onRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              //pageable={pageable}
              paging={false}
              cursor={false}
              caption={"버스 차량정보 변경이력 목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsVehHisSearchModal
