'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { Breadcrumb, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { ilgDdupdTrHeadCells } from '@/utils/fsms/headCells'

// components
import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '화물의심거래상시점검',
  },
  {
    to: '/ilg/ddupd',
    title: '의심거래미처리내역',
  },
]

export interface Row {
  vhclNo: string
  locgovCd: string
  locgovNm: string
  confirmCnt: string
  uncompCnt: string
  apyCnt: string
  fakeNo: string
  fakeNm: string
  aprvYmd: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀,출력 기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })
  
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd && params.locgovCd) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(prev => !prev)
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      setLoading(true)
      setExcelFlag(true)

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/ddupd/tr/getAllDoubtDelngUnProcDtls?page=${params.page}&size=${params.size}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.dwNo ? '&dwNo=' + params.dwNo : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

        console.log('endpoint : ', endpoint);
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
        alert(response.message)
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

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }
    
    try{
      setLoadingBackdrop(true)

      let endpoint: string =
      `/fsm/ilg/ddupd/tr/doubtDelngUnProcDtlsExcel?` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.dwNo ? '&dwNo=' + params.dwNo : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + getToday() + '.xlsx')  
    }catch(error){
      console.error('ERROR :: ', error)
    }finally{
      setLoadingBackdrop(true)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(prev => !prev)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    console.log('name : ', name)
    console.log('value : ', value)
    setParams((prev) => ({ ...prev, page:1, [name]: value }))
  }

  return (
    <PageContainer title="의심거래미처리내역" description="의심거래미처리내역">
      {/* breadcrumb */}
      <Breadcrumb title="의심거래미처리내역" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <LoadingBackdrop open={loadingBackdrop} />
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
                required
              >
                시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
                required
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dwNo"
                required
              >
                패턴
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'181'}
                pValue={params.dwNo}
                pName={'dwNo'}
                width={'100%'}
                handleChange={handleSearchChange}
                htmlFor={'sch-dwNo'}
                addText="전체"
              />
            </div>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                placeholder=""
                name="vhclNo"
                value={params.vhclNo} // 빈 문자열로 초기화
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilgDdupdTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={() => {}} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
