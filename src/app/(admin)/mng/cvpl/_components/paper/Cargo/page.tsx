'use client'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import { Pageable2 } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { StatusType } from '@/types/message'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { mngCvplPaperHC } from '@/utils/fsms/headCells'

export interface Row {
  vhclNo?: string
  trsmYn?: string
  trsmNm?: string
  trsmDt?: string
  clclnYm?: string
  aplySn?: string
  prcsSttsCd?: string
  prcsSttsNm?: string
  locgovCd?: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  clclnYm: string
  vhclNo: string
  aplySn: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row>() // 선택된 로우 데이터
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 인덱스 값

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    clclnYm: '', // 시작일
    vhclNo: '',
    aplySn: '',
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
    setFlag(false)

    // const dateRange = getDateRange('m', 1)
    // setParams((prev) => ({ ...prev, clclnYm: dateRange.endDate }))
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
    if (!params.vhclNo) {
      alert('차량번호는 필수 입니다.')
      return
    }

    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/mng/cvpl/tr/getAllPaperCfmDtls?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.clclnYm ? '&clclnYm=' + params.clclnYm.replaceAll('-', '') : ''}` +
        `${params.aplySn ? '&aplySn=' + params.aplySn : ''}`

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
      alert('서면신청 지급확정을 취소할 데이터를 선택해주세요.')
      return
    }

    if (row.prcsSttsCd !== '05') {
      alert('지급확정 상태건만 요청할 수 있습니다.')
      return
    }

    const userConfirm = confirm('서면신청 지급확정 취소를 요청하시겠습니까?')
    if (!userConfirm) {
      return
    } else {
      try {
        let body = {
          vhclNo: row.vhclNo,
          clclnYm: row.clclnYm?.replaceAll('-', ''),
          aplySn: Number(row.aplySn),
          locgovCd: row.locgovCd,
        }

        let endpoint: string = '/fsm/mng/cvpl/tr/cancelPapersPymntDcsn'
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
      setIsDataProcessing(false)
    }
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
      title="서면신청 지급확정 취소"
      description="서면신청 지급확정 취소"
    >
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
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
              <CustomFormLabel className="input-label-display" required>
                청구일자
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date">
                청구일자
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date"
                name="clclnYm"
                value={params.clclnYm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-aply-sn"
              >
                <span className="required-text">*</span>순번
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-aply-sn"
                name="aplySn"
                value={params.aplySn}
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
          headCells={mngCvplPaperHC}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          pageable={pageable}
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange}
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
