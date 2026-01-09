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
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import { getDateRange } from '@/utils/fsms/common/comm'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const headCells: HeadCell[] = [
  {
    id: 'clclnYm',
    numeric: false,
    disablePadding: false,
    label: '정산월',
    format: 'yyyymm',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'totCnt',
    numeric: false,
    disablePadding: false,
    label: '주유건수',
  },
  {
    id: 'totSelAmt',
    numeric: false,
    disablePadding: false,
    label: '거래금액',
    format: 'number',
  },
  {
    id: 'totUseLit',
    numeric: false,
    disablePadding: false,
    label: '주유량(L)',
    format: 'lit',
  },
  {
    id: 'totSubsAmt',
    numeric: false,
    disablePadding: false,
    label: '유가보조금',
    format: 'number',
  },
  {
    id: 'payAmt',
    numeric: false,
    disablePadding: false,
    label: '지급금액',
    format: 'number',
  },
  {
    id: 'payNotAmt',
    numeric: false,
    disablePadding: false,
    label: '미지급금액',
    format: 'number',
  },
]

export interface Row {
  vhclNo?: string
  clclnYm?: string
  totCnt?: string
  totSelAmt?: string
  totSubsAmt?: string
  totUseLit?: string
  payAmt?: string
  payNotAmt?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  clclnYm: string
  vhclNo: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [isDataProcessing, setIsDataProcessing] = useState(false)

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    clclnYm: '',
    vhclNo: '',
  })

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    // setFlag(!flag)

    const dateRange = getDateRange('m', 1)
    setParams((prev) => ({ ...prev, clclnYm: dateRange.endDate }))
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      setLoading(true)
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cvpl/tr/getAllDelngCnfirmPymntDcsn?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.clclnYm ? '&clclnYm=' + params.clclnYm.replaceAll('-', '') : ''}`

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
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }

  const removeData = async (row: Row | undefined) => {
    if (row == undefined) {
      alert('보조금 지급확정을 취소할 데이터를 선택하지 않았습니다.')
      return
    }

    const userConfirm = confirm(
      '해당 데이터의 보조금 지급확정을 취소하시겠습니까?',
    )
    if (!userConfirm) {
      return
    } else {
      try {
        let body = {
          vhclNo: row.vhclNo,
          clclnYm: row.clclnYm,
        }

        let endpoint: string = '/fsm/mng/cvpl/tr/cancelCnfirmPymntDcsn'

        setIsDataProcessing(true)

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
    setFlag(!flag)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  // 행 더블 클릭 시 호출되는 함수
  const handleRowDoubleClick = (row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    removeData(row)
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
      title="거래확인카드 보조금 지급확정 취소"
      description="거래확인카드 보조금 지급확정 취소"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
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
              <CustomFormLabel className="input-label-display" required>
                차량번호
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-vhcl-no"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-vhcl-no"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <span>조회 후, 취소할 대상을 더블클릭</span>
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
              style={{ marginLeft: '1rem' }}
            >
              검색
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
          loading={loading}
          onRowDoubleClick={handleRowDoubleClick}
          selectedRowIndex={selectedIndex}
          cursor={true}
        />
      </Box>
      <LoadingBackdrop open={isDataProcessing} />
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
