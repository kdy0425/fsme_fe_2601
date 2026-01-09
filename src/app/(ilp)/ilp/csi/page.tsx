'use client'
import { Box, Button, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid' //custom 사용을 위한 ilp 공통

import { cmOiHeadCells } from '@/utils/fsms/ilp/headCells'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '주유정보',
  },
  {
    to: '/ilp/csi',
    title: '충전소정보',
  },
]

export interface Row {
  //충전소정보
  frcsBrno: string;
  frcsNm: string;
  crdcoCd: string;
  crdcoNm: string;
  frcsNo: string;
  frcsTelno: string;
  frcsAddr: string;
  seNm: string; //화물,택시,버스 구분
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  frcsBrno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
 
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    frcsBrno: '', // 사업자등록번호
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    setSelectedRowIndex(-1)
    setLoading(true)
    setExcelFlag(true) //엑셀기능 동작여부
    
    try {
      if(!params.frcsBrno.replaceAll('-','') && !params.frcsNm && !params.frcsCdNo) {
        alert('사업자등록번호, 가맹점명 중 1개 항목은 필수입니다.');
        return;
      }

      // 검색 조건에 맞는 endpoint 생성  
      let endpoint: string =
        `/ilp/csi/cm/getAllOltStdrInfoCm?page=${params.page}&size=${params.size}` +
        `${typeof params.frcsBrno === 'string' ? '&frcsBrno=' + params.frcsBrno.replace(/-/g, '') : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${typeof params.frcsTelno === 'string' ? '&frcsTelno=' + params.frcsTelno.replace(/-/g, '') : ''}` +
        `${params.frcsAddr ? '&frcsAddr=' + params.frcsAddr : ''}`

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

  //추후 필요시 처리
  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      setLoadingBackdrop(true)

      let endpoint: string =
        `/ilp/csi/cm/getExcelAllOltStdrInfoCm?` +
         `${typeof params.frcsBrno === 'string' ? '&frcsBrno=' + params.frcsBrno.replace(/-/g, '') : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${typeof params.frcsTelno === 'string' ? '&frcsTelno=' + params.frcsTelno.replace(/-/g, '') : ''}` +
        `${params.frcsAddr ? '&frcsAddr=' + params.frcsAddr : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
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
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(!flag)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  return (
    <PageContainer title="주유소정보" description="주유소정보">
      {/* breadcrumb */}
      <Breadcrumb title="주유소정보" items={BCrumb} />
      <Box>
        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-brno"
                  required
                >
                  사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  id="ft-brno"
                  name="frcsBrno"
                  value={params.frcsBrno ?? ''}
                  onChange={handleSearchChange}
                  //type="number"
                  inputProps={{ maxLength: 12 }}
                  // onInput={(e: {
                  //   target: { value: string; maxLength: number | undefined }
                  // }) => {
                  //   // 하이픈을 포함하여 값을 유지합니다.
                  //   const inputValue = e.target.value.replace(/[^0-9-]/g, '') // 숫자와 하이픈만 허용
                  //   e.target.value = inputValue.slice(0, e.target.maxLength)
                  // }}
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
                  value={params.frcsNm ?? ''}
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
                  htmlFor="ft-frcsTelno">
                  전화번호
                </CustomFormLabel>
                <CustomTextField 
                  id="ft-frcsTelno" 
                  name="frcsTelno" 
                  value={params.frcsTelno ?? ""} 
                  onChange={handleSearchChange} 
                  fullWidth 
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-frdaddrcsBrno"
                >
                  주소
                </CustomFormLabel>
                <CustomTextField
                  id="ft-daddr"
                  name="frcsAddr"
                  value={params.frcsAddr ?? ''}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>
              {/* <div className="form-group">
                <Typography>
                  <b>(구군명 또는 읍면동명)</b>
                </Typography>
              </div> */}
            </div>
          </Box>
          <Box className="table-bottom-button-group">
            <div className="button-right-align">
              <LoadingBackdrop open={loadingBackdrop} />
              <Button type="submit" variant="contained" color="primary">
                검색
              </Button>
              <Button
                onClick={() => excelDownload()}
                variant="contained"
                color="success"
              >
                엑셀
              </Button>
            </div>
          </Box>
        </Box>
        {/* 검색영역 끝 */}

        {/* 테이블영역 시작 */}
        <Box>
          <TableDataGrid
            headCells={cmOiHeadCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            //onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            selectedRowIndex={selectedRowIndex}
            caption={'충전소정보 조회'}
          />
        </Box>
        {/* 테이블영역 끝 */}
      </Box>
    </PageContainer>
  )
}

export default DataList
