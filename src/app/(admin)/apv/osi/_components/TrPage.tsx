'use client'
import { Box, Button, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { apvOsiTrHeadCells } from '@/utils/fsms/headCells'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import TrDetail from './TrDetail'


export interface Row {  
  frcsBrno: string;
  frcsNm: string;
  crdcoCd: string;
  crdcoCdNm: string;
  frcsCdNo: string;
  frcsTlphonDddCd: string;
  telno: string;
  telnoFull: string;
  zip: string;
  daddr: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  frcsBrno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}


const TrPage = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row | null>() // 클릭로우
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);


  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    detailPage: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    detailSize: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    frcsBrno: '',
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  //초기데이터 로드 
  useEffect(() =>{
    //setFlag(prev => !prev)  
  },[])

  useEffect(()=>{
    if(flag != null){
      setSelectedIndex(-1)
      setSelectedRow(null)
      fetchData()
    }
  },[flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {

      if(!params.frcsBrno.replaceAll('-','') && !params.frcsNm && !params.frcsCdNo) {
        alert('사업자등록번호, 주유소명, 가맹점번호 중 1개 항목은 필수입니다.');
        return;
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/osi/tr/getAllOltStdrInfo?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-','') : ''}`+
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.frcsCdNo ? '&frcsCdNo=' + params.frcsCdNo : ''}` +
        `${params.daddr ? '&daddr=' + params.daddr : ''}` 


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
        alert(response.message);
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?:number) => {
    setSelectedIndex(index ?? -1);
    setSelectedRow(row)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  
  return (
    <Box>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsBrno" required>
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsBrno" name="frcsBrno" value={params.frcsBrno ?? ""} onChange={handleSearchChange} fullWidth />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsNm" required>
                주유소명
              </CustomFormLabel>
              <CustomTextField id="ft-frcsNm" name="frcsNm" value={params.frcsNm ?? ""} onChange={handleSearchChange} fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsCdNo" required>
                가맹점번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsCdNo" name="frcsCdNo" value={params.frcsCdNo ?? ""} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-daddr">
                소재지
              </CustomFormLabel>
              <CustomTextField id="ft-daddr" name="daddr" value={params.daddr ?? ""} onChange={handleSearchChange} fullWidth />
            </div>
            <div className="form-group">
              <Typography><b>(구군명 또는 읍면동명)</b></Typography>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type='submit' color="primary">
              검색
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvOsiTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"화물 주유(충전)소 기준정보조회 목록"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRow &&
        <>
          <TrDetail data={selectedRow} />
        </>
      }
    </Box>
  )
}

export default TrPage
