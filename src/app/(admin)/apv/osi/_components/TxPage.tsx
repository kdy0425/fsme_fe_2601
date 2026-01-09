'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { apvOsiTxHeadCells } from '@/utils/fsms/headCells'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import TxDetail from './TxDetail'

export interface Row {
  crdcoCd: string;
  cdKornNm: string;
  frcsCdNo: string;
  frcsNm: string;
  brno: string;
  frcsTlphonDddCd: string;
  telno: string;
  telnoFull: string;
  orgFrcsZip: string;
  zip: string;
  daddr: string;
  delYn: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  crdcoNm: string;
  frcsNo: string;
  frcsAddr: string;
  frcsBrno: string;
  frcsTelno: string;
  frcsZip: string;
  trauYmd: string;
  dlngTm: string;
  dlngSeNm: string;
  koiNm: string;
  vhclNo: string;
  useLiter: string;
  aprvAmt: string;
  moliatAsstAmt: string;
  literAcctoUntprc: string;
  literAcctoUntprcSeNm: string;
  moliatUseLiter: string;
  aprvRspnsNm: string;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TxPage = () => {
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
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(()=>{
    if(flag != null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedIndex(-1)
    setSelectedRow(null);
    setLoading(true)
    try {

      if(!params.frcsBrno && !params.frcsNm) {
        alert('사업자등록번호, 주유소명 중 1개 항목은 필수입니다.');
        return;
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/osi/tx/getAllOltStdrInfo?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno : ''}`+
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.frcsTelno ? '&frcsTelno=' + params.frcsTelno : ''}` +
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
        handleRowClick(response.data.content[0], 0);
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

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(prev => !prev)    
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag(prev => !prev)    
  }, []);

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?:number) => {
    setSelectedIndex(index ?? -1);
    setSelectedRow(row)
  }, []);
  
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
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsTelno">
                전화번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsTelno" name="frcsTelno" value={params.frcsTelno ?? ""} onChange={handleSearchChange} fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsAddr">
                소재지
              </CustomFormLabel>
              <CustomTextField id="ft-frcsAddr" name="frcsAddr" value={params.frcsAddr ?? ""} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type='submit' variant="contained" color="primary">
              검색
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvOsiTxHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption={"택시 주유(충전)소 기준정보조회 목록록"}
        />
      </Box>
      {/* 테이블영역 끝 */}
      {selectedRow &&
        <>
          <TxDetail data={selectedRow} />
        </>
      }
    </Box>
  )
}

export default TxPage
