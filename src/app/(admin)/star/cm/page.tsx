'use client'
import { Box, Button, FormControlLabel, RadioGroup, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import FormModal from './_components/FormModal'

import { starCmHc } from '@/utils/fsms/headCells2'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '통계보고서',
  },
  {
    title: '코드관리',
  },
  {
    to: '/star/cm',
    title: '분류코드관리',
  },
]

export interface Row {
  clsfCd: string // 분류코드
  clsfCdNm: string // 코드명
  clsfSeCd: string // 분류구분코드
  clsfPrntCd: string //분류구분코드
  clsfPrntNm: string //분류구분명
  sortSeq: string | number // 코드 순서
  useYn: string // 사용여부
  useNm?: string //사용여부 한글 (사용 / 미사용)
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  page_c: number
  size_c: number
  clsfCd: string
  clsfCdNm: string
  useYn: 'Y' | 'N' | ''
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  // 코드 그룹
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  // 공통 코드
  const [rows_c, setRows_c] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows_c, setTotalRows_c] = useState(0) // 총 수
  const [loading_c, setLoading_c] = useState(false) // 로딩여부

  const [open, setOpen] = useState<boolean>(false)
  const [open_c, setOpen_c] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'create' | 'update'>('create')
  const [titleNm, setTitleNm] = useState('') // 총 수

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    page_c: 1, // 페이지 번호는 1부터 시작
    size_c: 10, // 기본 페이지 사이즈 설정
    clsfCd: '',
    clsfCdNm: '',
    useYn: '',
  })

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  const [pageable_c, setPageable_c] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })


  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
      fetchData()
  }, [flag])


  // 쿼리스트링, endpoint, 메서드(로딩), 페이지, 파싱할때 타입 (rowtype 채택한 타입으로 아무거나 되게 )
  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/star/cm/cm/getAllStatsClsfCd?page=${params.page}&size=${params.size}` +
        '&clsfSeCd=A' +
        `${params.clsfCd ? '&clsfCd=' + params.clsfCd : ''}` +
        `${params.clsfCdNm ? '&clsfCdNm=' + params.clsfCdNm : ''}` +
        `${params.useYn ? '&useYn=' + params.useYn : ''}`

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
      console.error('Error fetching data:', error)
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
    setParams((prev) => ({ ...prev, page: 1 }))
    setFlag(!flag)
  }


  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page,
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

  // 사용여부 라디오 (RadioGroup onChange 시그니처 대응)
  const handleUseYnChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setParams((prev) => ({ ...prev, useYn: value as 'Y' | 'N' }))
  }

  function handleReload(): void {
    fetchData() // 리스트를 다시 조회하는 함수
    setOpen(false) // 모달 닫기
    setOpen_c(false) // 수정 모달 닫기
    setFlag(!flag) // 플래그 변경으로 데이터 갱신
  }
  
  useEffect(() => {
    console.log('open_c changed:', open_c)
  }, [open_c])

  const handleActionClick = (row: Row, id: string) => {
    // row가 몇 번째 행인지 찾기
    const index = rows.findIndex(r => r.clsfCd === row.clsfCd);
    if (id === 'edit') {
      console.log('수정 클릭', index, row, rows[index], rows);
      setSelectedRowIndex(index);
      setModalType('update');
      setTitleNm('분류코드수정');
      setOpen_c(true);
    }
  };

  return (
    <PageContainer title="분류코드 관리" description="분류코드 관리">
      {/* breadcrumb */}
      <Breadcrumb title="분류코드 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-clsfCd"
              >
                분류코드
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-clsfCd"
                name="clsfCd"
                value={params.clsfCd || ''}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-clsfCdNm"
              >
                분류코드명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-clsfCdNm"
                name="clsfCdNm"
                value={params.clsfCdNm || ''}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 50 }}
              />
            </div>
            <div className="form-group" style={{ width: 'inherit' }}>
              <CustomFormLabel className="input-label-display">
                사용여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="useYn"
                name="useYn"
                value={params.useYn || ''}
                onChange={handleUseYnChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                   control={<CustomRadio id="chk_ALL" name="useYn" value="" />}
                   label="전체"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_Y" name="useYn" value="Y" />}
                  label="사용"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_N" name="useYn" value="N" />}
                  label="미사용"
                />
              </RadioGroup>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h3>분류코드</h3>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              onClick={() => {
                setModalType('create')
                setTitleNm('코드그룹등록')
                setOpen(true)
              }}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <FormModal
              title='분류코드 등록'
              formType="create"
              reloadFunc={handleReload}
              isOpen={open} // ← 상태값으로 변경
              setOpen={setOpen} // ← 실제 setOpen 함수 연결
            />  
            <FormModal
              title='분류코드 수정'
              formType="update"
              reloadFunc={handleReload}
              isOpen={open_c}
              setOpen={setOpen_c}
              data={selectedRowIndex >= 0 ? rows[selectedRowIndex] : undefined}
              key={selectedRowIndex}
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 코드그룹 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={starCmHc}
          rows={rows}
          totalRows={totalRows}
          selectedRowIndex={selectedRowIndex}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          onActionClick={handleActionClick} // ← 이 부분 추가!
        />
      </Box>
      {/* 분류코드 테이블영역 끝 */}


    </PageContainer>
  )
}

export default DataList
