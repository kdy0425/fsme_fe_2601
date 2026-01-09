'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { Pageable2 } from 'table'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { mngCvplTonsHC } from '@/utils/fsms/headCells'

export interface Row {
  vhclNo?: string
  aplcnYmd?: string
  hstrySn?: string
  bfVhclTonsNm?: string
  afVhclTonsNm?: string
  trsmYn?: string
  trsmNm?: string
  trsmDt?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  aplcnYmd: string
  vhclNo: string
  hstrySn: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 총 로우 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    aplcnYmd: '', // 시작일
    vhclNo: '',
    hstrySn: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!params.vhclNo) {
      alert('차량번호는 필수 입니다.')
      return
    }

    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cvpl/tr/getAllTonnChange?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aplcnYmd ? '&aplcnYmd=' + params.aplcnYmd.replaceAll('-', '') : ''}` +
        `${params.hstrySn ? '&hstrySn=' + Number(params.hstrySn) : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber +1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setInitialState()
      }
    } catch (error: StatusType | any) {
      alert(error.errors[0].reason)
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  const reqData = async (row: Row | undefined) => {
    if (row == undefined) {
      alert('변경전문 재전송할 데이터를 선택하지 않았습니다.')
      return
    }

    const userConfirm = confirm('해당 변경전문을 재전송하시겠습니까?')

    if (!userConfirm) {
      return
    } else {
      setIsDataProcessing(true)
      try {
        let body = {
          vhclNo: row.vhclNo,
          aplcnYmd: row.aplcnYmd?.replaceAll('-', ''),
          hstrySn: row.hstrySn,
        }

        let endpoint: string = '/fsm/mng/cvpl/tr/updateTonnChangeTrnsmit'

        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          alert(response.data)
          fetchData()
        } else {
          alert('실패 :: ' + response.message)
        }
      } catch (error: StatusType | any) {
        alert(error.errors[0].reason)
      }
    }
    setIsDataProcessing(false)
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  const handleKeyDown = ((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  })

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(row)
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <PageContainer title="톤수 전문 재전송" description="톤수 전문 재전송">
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-ton-vhcl-no"
              >
                <span className="required-text">*</span>차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-ton-vhcl-no"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                처리일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                처리일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="aplcnYmd"
                value={params.aplcnYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-hstry-sn"
              >
                순번
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-hstry-sn"
                name="hstrySn"
                value={params.hstrySn}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={() => reqData(selectedRow)}
              variant="contained"
              color="primary"
            >
              요청
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={mngCvplTonsHC}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onRowClick={handleRowClick}
          cursor={true}
          onPaginationModelChange={handlePaginationModelChange}
          selectedRowIndex={selectedIndex}
          pageable={pageable}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
