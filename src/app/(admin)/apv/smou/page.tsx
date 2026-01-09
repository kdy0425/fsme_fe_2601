'use client'
import {
  Box,
  Button
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { apvSmouFrcsTrHeadCells, apvSmouUserTrHeadCells } from '@/utils/fsms/headCells'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '주유(충전)소 관리',
  },
  {
    to: '/apv/smou',
    title: '특별관리주유소 이용자조회',
  },
]

export interface Row {
  frcsBrno: string;
  bltSn: number;
  frcsNm: string;
  shFrcsCdNo: string;
  kbFrcsCdNo: string;
  wrFrcsCdNo: string;
  ssFrcsCdNo: string;
  hdFrcsCdNo: string;
  bltBgngYmd: string;
  bltEndYmd: string;
  bltSttsCd: string;
  bltSttsCdNm: string;
  bltRmvRsnCd: string;
  bltRmvRsnCdNm: string;
  bltRmvYmd: string;
  locgovCd: string;
  locgovNm: string;
  bltRsnCn: string;
  trsmYn: string;
  trsmDt: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  crdcoCd: string;
  crdcoCdNm: string;
  frcsCdNo: string;
  cardNo: string;
  cardNoS: string;
  prcsSeCd: string;
  prcsSeCdNm: string;
  frstDlngYmd: string;
  lastDlngYmd: string;
  vhclNo: string;
  vonrBrno: string;
  vonrNm: string;
  vonrRrno: string;
  vonrRrnoS: string;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  frcsBrno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [dFlag, setDflag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수

  const [selectedRow, setSelectedRow] = useState<Row>();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [detailRows, setDetailRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [detailTotalRows, setDetailTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    frcsBrno: '',
    frcsNm: '',
    vonrBrno: '',
    vonrNm: '',
  })

  const [detailParams, setDetailParams] = useState<listSearchObj>({
    page: Number(1), // 상세 이용자정보 페이징
    size: Number(10), // 상세 이용자정보 사이즈
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    frcsBrno: '',
  })

  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [detailPageable, setDetailPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      fetchData()
      setSelectedIndex(-1);
      setDetailRows([]);
    }
  }, [flag])
  
  useEffect(() => {
    if(selectedRow) {
      fetchDetailData(selectedRow)
      setDetailParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    }
  }, [dFlag])

  // 초기 데이터 로드
  useEffect(() => {
    // 초기데이터 로드 후 조회하지 않음
    // setFlag(prev => !prev)
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])


  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if(!params.frcsBrno.replaceAll('-','') && !params.frcsNm) {
      alert("사업자등록번호 또는 가맹점명 중 1개 항목은 필수 입력해주세요");
      return;
    }

    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/smou/tr/getAllSpeclMngOlt?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-','') : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.prcsSeCd ? '&prcsSeCd=' + params.prcsSeCd : ''}` 

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

  const fetchDetailData = async (row: Row) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/smou/tr/getAllSpeclMngOltUser?page=${detailParams.page}&size=${detailParams.size}` +
        `${row.frcsBrno ? '&frcsBrno=' + row.frcsBrno : ''}` +
        `${row.bltSn ? '&bltSn=' + row.bltSn : ''}`  +
        `${params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.prcsSeCd ? '&prcsSeCd=' + params.prcsSeCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDetailRows(response.data.content)
        setDetailTotalRows(response.data.totalElements)
        setDetailPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        alert(response.message);
        setDetailRows([])
        setDetailTotalRows(0)
        setDetailPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
      setDetailTotalRows(0)
      setDetailPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    }
  }

  const excelDownload = async () => { 

    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try{
      setLoadingBackdrop(true)
      let endpoint: string =
        `/fsm/apv/smou/tr/getExcelSpeclMngOlt?` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-','') : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.prcsSeCd ? '&prcsSeCd=' + params.prcsSeCd : ''}` 

      await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
    }
}

  const detailExcelDownload = async (row: Row) => { 

    if(detailRows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try{
      let endpoint: string =
      `/fsm/apv/smou/tr/getExcelSpeclMngOltUser?` +
      `${row.frcsBrno ? '&frcsBrno=' + row.frcsBrno : ''}` +
      `${row.bltSn ? '&bltSn=' + row.bltSn : ''}`  +
      `${params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
      `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
      `${params.prcsSeCd ? '&prcsSeCd=' + params.prcsSeCd : ''}`

    await  getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
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

  const handleDetailPagenationChange = (page: number, pageSize: number) => {
    setDetailParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setDflag(!dFlag);
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedIndex(index?? -1);
    setSelectedRow(row);
    setDflag(!dFlag);
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  return (
    <PageContainer
      title="특별관리주유소 이용자조회"
      description="특별관리주유소 이용자조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="특별관리주유소 이용자조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-frcsBrno" required>
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
                <CustomFormLabel className="input-label-display" htmlFor="ft-frcsNm" required>
                  가맹점명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-frcsNm"
                  name="frcsNm"
                  value={params.frcsNm}
                  onChange={handleSearchChange}
                  inputProps={{
                    inputMode: 'text',
                    maxLength: 100,
                  }}
                  fullWidth
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-vonrBrno">
                  소유자사업자등록번호
                </CustomFormLabel>
                <CustomTextField
                  id="ft-vonrBrno"
                  name="vonrBrno"
                  value={params.vonrBrno}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-vonrNm">
                  소유자명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-vonrBrno"
                  name="vonrNm"
                  value={params.vonrNm}
                  onChange={handleSearchChange}
                  inputProps={{
                    inputMode: 'text',
                    maxLength: 100,
                  }}
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-prcsSeCd">
                  이용구분
                </CustomFormLabel>
                <CommSelect                
                  cdGroupNm='082'
                  pValue={params.prcsSeCd}
                  handleChange={handleSearchChange}
                  pName='prcsSeCd'
                  htmlFor={'ft-prcsSeCd'}
                  addText='- 전체 -'
                />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant="contained" color="success" onClick={() => excelDownload()} >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvSmouFrcsTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor
          caption={"특별관리주유소 이용자 조회 목록"}
        />
      </Box>

      {selectedRow && selectedIndex > -1 ?
      <Box>
        <BlankCard className="contents-card" title="특별관리주유소 이용자 조회"
          buttons={[
            {
              label: '엑셀',
              color: 'success',
              onClick: () => detailExcelDownload(selectedRow),
            },
          ]}
        >
          <TableDataGrid
            headCells={apvSmouUserTrHeadCells} // 테이블 헤더 값
            rows={detailRows} // 목록 데이터
            totalRows={detailTotalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={() => {}} // 행 클릭 핸들러 추가
            onPaginationModelChange={handleDetailPagenationChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={detailPageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            caption={"특별관리주유소 이용자 상세 목록 조회"}
          />
        </BlankCard>
      </Box>
      : <></>}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
