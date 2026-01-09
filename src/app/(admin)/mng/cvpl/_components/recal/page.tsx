'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { HeadCell, Pageable2 } from 'table'
import { getToday } from '@/utils/fsms/common/comm'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const headCells: HeadCell[] = [
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'aprvYmd',
    numeric: false,
    disablePadding: false,
    label: '거래일자',
    format: 'yyyymmdd',
  },
  {
    id: 'aprvNo',
    numeric: false,
    disablePadding: false,
    label: '승인번호',
  },
  {
    id: 'cardNoSe',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'clclnYnNm',
    numeric: false,
    disablePadding: false,
    label: '정산여부',
  },
]

export interface Row {
  vhclNo?: string
  aprvYmd?: string
  aprvNo?: string
  cardNoSe?: string
  clclnYnNm?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  aprvYmd: string
  vhclNo: string
  clclnYm: string
  aprvNo: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    aprvYmd: '',
    vhclNo: '',
    clclnYm: '',
    aprvNo: '',
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

  // 초기 데이터 로드
  useEffect(() => {
    // const date = getToday();
    // setParams((prev) => ({ ...prev, aprvYmd: date }));
  }, [])

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
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cvpl/tr/getAllDelngCnfirmReqst?` +
        `${params.aprvYmd ? '&aprvYmd=' + params.aprvYmd.replaceAll('-', '') : ''}` +
        `${params.aprvNo ? '&aprvNo=' + params.aprvNo : ''}` +
        `${params.clclnYm ? '&clclnYm=' + params.clclnYm.replaceAll('-', '') : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

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
      setInitialState()
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  const reqData = async (row: Row | undefined) => {
    if (row == undefined) {
      alert('재정산 요청 할 데이터를 선택하지 않았습니다.')
      return
    }

    const userConfirm = confirm(
      '해당 데이터의 보조금 재정산을 요청하시겠습니까?',
    )

    if (!userConfirm) {
      return
    } else {
      try {
        let body = {
          vhclNo: row.vhclNo,
          clclnYm: params.clclnYm,
          aprvYmd: row.aprvYmd,
        }

        let endpoint: string = '/fsm/mng/cvpl/tr/requestDelngCnfirmReqst'
        setIsDataProcessing(true)
        const response = await sendHttpRequest('POST', endpoint, body, true, {
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
    <PageContainer
      title="거래확인카드 보조금 재정산"
      description="거래확인카드 보조금 재정산"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-aprv-ymd"
              >
                거래일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-aprv-ymd"
                name="aprvYmd"
                value={params.aprvYmd}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhcl-no"
              >
                <span className="required-text">*</span>차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhcl-no"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                정산년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-clcln-ym"
              >
                정산년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-clcln-ym"
                name="clclnYm"
                value={params.clclnYm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-aprv-no"
              >
                승인번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-aprv-no"
                name="aprvNo"
                value={params.aprvNo}
                onChange={handleSearchChange}
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
          headCells={headCells}
          rows={rows}
          totalRows={totalRows}
          onRowClick={handleRowClick}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          cursor={true}
          selectedRowIndex={selectedIndex}
        />
      </Box>
      {/* 테이블영역 끝 */}
      <LoadingBackdrop open={isDataProcessing} />
    </PageContainer>
  )
}

export default DataList
