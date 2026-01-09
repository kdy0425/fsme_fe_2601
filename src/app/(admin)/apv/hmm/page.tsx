'use client'
import { Box, Button } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { HeadCell, Pageable2 } from 'table'
import DetailDataGrid from './_components/DetailDataGrid'
import ModalContent from './_components/ModalContent'
import { isNumber } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '수소충전소 관리',
  },
  {
    to: '/apv/hmm',
    title: '수소 가맹점 관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'frcsBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'frcsNo',
    numeric: false,
    disablePadding: false,
    label: '가맹점번호',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
  {
    id: 'sttsNm',
    numeric: false,
    disablePadding: false,
    label: '보조금 지급여부',
  },
  {
    id: 'frcsTelno',
    numeric: false,
    disablePadding: false,
    format: 'telno',
    label: '전화번호',
  },
  {
    id: 'frcsAddr',
    numeric: false,
    disablePadding: false,
    label: '주소',
    align: 'td-left',
  },
]

export interface Row {
  crdcoCd: string
  crdcoNm: string
  frcsNm: string
  frcsNo: string
  frcsAddr: string
  frcsBrno: string
  frcsTelno: string
  frcsZip: string
  sttsCd: string
  sttsNm: string
  errCd: string
  errNm: string
  trsmYn: string
  regDt: string
  mdfrYn: string
  delYn: string
  compositeYn: string
  dataType: string
}

// 목록 조회시 필요한 조건
interface listSearchObj {
  page: number
  size: number
  frcsBrno: string
  frcsNm: string
  frcsTelno: string
  frcsAddr: string
}

const DataList = () => {
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이지객체
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 행의 인덱스
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    frcsBrno: '',
    frcsNm: '',
    frcsTelno: '',
    frcsAddr: '',
  }) // 조회조건

  const [open, setOpen] = useState<boolean>(false)
  const [type, setType] = useState<'create' | 'update'>('create')
  const [modalData, setModalData] = useState<Row | null>(null)

  useEffect(() => {
    // 최초 검색 막기
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedIndex(-1)
    setLoading(true)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        frcsBrno: params.frcsBrno.replaceAll('-', ''),
      }

      const endPoint =
        '/fsm/apv/hmm/cm/getAllHydMrhstMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endPoint, null, true, {
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

        // 클릭이벤트 발생시키기
        handleRowClick(response.data.content[0], 0)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
        setSelectedIndex(-1)
        setSelectedRow(null)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setSelectedIndex(-1)
      setSelectedRow(null)
    } finally {
      setLoading(false)
    }
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = () => {
    if (!params.frcsBrno && !params.frcsNm) {
      alert('가맹점 사업자등록번호 또는 가맹점명을 입력해주세요.')
      return
    }

    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }, [])

  // 조회조건 변경시
  const handleSearchChange = ( event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
    const { name, value } = event.target

    if (name === 'frcsBrno' || name === 'frcsTelno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }    
  }

  const handleClick = (pType: 'create' | 'update') => {
    if (pType == 'update' && !selectedRow) {
      alert('수정할 데이터를 선택 해주세요.')
      return
    }

    setOpen(true)
    setType(pType)
    setModalData(pType == 'create' ? null : selectedRow)
  }

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    handleAdvancedSearch()
  }

  return (
    <PageContainer title="수소 가맹점 관리" description="수소 가맹점 관리">
      {/* breadcrumb */}
      <Breadcrumb title="수소 가맹점 관리" items={BCrumb} />

      <Box component="form" onSubmit={submitSearch} sx={{ mb: 2 }}>
        {/* 검색영역 시작 */}
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsBrno"
                required
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-frcsBrno"
                name="frcsBrno"
                value={params.frcsBrno}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsNm"
                required
              >
                가맹점명
              </CustomFormLabel>
              <CustomTextField
                id="ft-frcsNm"
                name="frcsNm"
                value={params.frcsNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsTelno"
              >
                전화번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-frcsTelno"
                name="frcsTelno"
                value={params.frcsTelno}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsAddr"
              >
                주소
              </CustomFormLabel>
              <CustomTextField
                id="ft-frcsAddr"
                name="frcsAddr"
                value={params.frcsAddr}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>

        {/* 버튼영역 시작 */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              // onClick={handleAdvancedSearch}
              type="submit"
            >
              검색
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleClick('create')}
            >
              등록
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleClick('update')}
            >
              수정
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption={"수소 가맹정 관리 목록 조회"}
        />
      </Box>

      {/* 상세영역 */}
      <>
        {selectedIndex > -1 && selectedRow ? (
          <Box>
            <DetailDataGrid selectedRow={selectedRow} />
          </Box>
        ) : null}
      </>

      {/* 등록수정모달 */}
      <>
        {open ? (
          <ModalContent
            open={open}
            setOpen={setOpen}
            type={type}
            row={modalData}
            handleAdvancedSearch={handleAdvancedSearch}
          />
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
