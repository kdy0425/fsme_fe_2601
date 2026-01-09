'use client'
import { Box, Button, FormControlLabel } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'
import { getExcelFile, getToday, calMonthsDate, nowDate } from '@/utils/fsms/common/comm'
import { apvAisddFrcsTrHeadCells, apvAisddAprvTrHeadCells } from '@/utils/fsms/headCells'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// components
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
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
    to: '/apv/aisdd',
    title: '주유량확인시스템 거래내역',
  },
]

const selectData = [
  {
    value: '',
    label: '전체',
  },
  {
    value: '01',
    label: '주유량시스템 설치 거래내역',
  },
  {
    value: '02',
    label: '주유량시스템 미설치 거래내역',
  },
];

export interface Row {
  aogIdntySysIdSn: number;
  frcsBrno: string;
  shFrcsCdNo: string;
  wrFrcsCdNo: string;
  kbFrcsCdNo: string;
  ssFrcsCdNo: string;
  hdFrcsCdNo: string;
  rprsvNm: string;
  frcsTlphonDddCd: string;
  telno: string;
  telnoFull: string;
  zip: string;
  daddr: string;
  frcsNm: string;
  aplcntMbtlnum: string;
  aogIdntySysInstlDmndYmd: string;
  aogIdntySysSttsCd: string;
  aogIdntySysSttsCdNm: string;
  aogIdntySysInstlYmd: string;
  delYn: string;
  delRsnCd: string;
  delRsnCdNm: string;
  idfrNm: string;
  idntyYmd: string;
  locgovCd: string;
  locgovNm: string;
  trsmYn: string;
  trsmDt: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  vhclNo: string;
  vonrNm: string;
  crdcoCdNm: string;
  cardNoS: string;
  crdcoCd: string;
  cardNo: string;
  aprvYmd: string;
  aprvTm: string;
  aprvYmdTm: string;
  aprvNo: string;
  aprvYn: string;
  stlmYn: string;
  aprvAmt: string;
  useLiter: string;
  asstAmt: string;
  asstAmtLiter: string;
  unsetlLiter: string;
  unsetlAmt: string;
  frcsCdNo: string;
  cardSeCdNm: string;
  cardSttsCdNm: string;
  stlmCardNo: string;
  stlmAprvNo: string;
  ceckStlmYn: string;
  origTrauTm: string;
  origTrauYmdTm: string;
  asstCdNm: string;
  colorGb: string;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  vhclNo: string
  frcsBrno: string
  frcsCdNo: string
  frcsNm: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingDtl, setLoadingDtl] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [detailRows, setDetailRows] = useState<Row[]>([]);

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
    vhclNo: '',
    frcsBrno: '',
    frcsCdNo: '',
    frcsNm: '',
    aprvCd: '01',
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
    if(flag != null){
      setRows([])
      setSelectedIndex(-1)
      setDetailRows([])
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    let startDate = calMonthsDate(new Date(), -1);
    let endDate = nowDate();

    setParams((prev) => ({...prev, 
      searchStDate: startDate,
      searchEdDate: endDate
    }))

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

    if (!isValidDateIn3Month(params.searchStDate ,params.searchEdDate)) {
      alert('조회기간은 3개월 이내이어야 합니다.')
      return
    }
    
    if(!params.frcsBrno.replaceAll('-', '') && !params.frcsCdNo && !params.frcsNm) {
      alert("가맹점사업자등록번호 또는 가맹점번호 또는 가맹점명 중 1개 항목은 필수 입력해주세요");
      return;
    }

    try {
      setLoading(true)
      setExcelFlag(true) // 엑셀기능 동작여부

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/aisdd/tr/getAllAogIdSysDelngs?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
        `${params.frcsCdNo ? '&frcsCdNo=' + params.frcsCdNo : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`

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

  const fetchDetailData = async (row:Row) => {
    
    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다시 선택해주세요.')
      return
    }

    try {
      setLoadingDtl(true)
      setExcelFlag(true)

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/aisdd/tr/getAllAogIdSysDelngDtls?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.aprvCd ? '&aprvCd=' + params.aprvCd : ''}` + 
        `${params.apvlYn ? '&apvlYn=' + params.apvlYn : ''}` +
        `${row.frcsBrno ? '&frcsBrno=' + row.frcsBrno.replaceAll('-', '') : ''}` +
        `${row.aogIdntySysIdSn ? '&aogIdntySysIdSn=' + row.aogIdntySysIdSn : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        const responseData = response.data.map((item: any) => ({
          ...item,
          color: item.colorGb === '일반' ? 'black'
               : item.colorGb === '취소' ? 'blue'
               : item.colorGb === '결제' ? 'brown'
               : item.colorGb === '휴지' ? 'green'
               : item.colorGb === '누락' ? 'red'
               : 'purple'
        }));

        setDetailRows(responseData);
      } else {
        // 데이터가 없거나 실패
        alert(response.message);
        setDetailRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setDetailRows([])
    } finally {
      setLoadingDtl(false)
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
      `/fsm/apv/aisdd/tr/getExcelAogIdSysDelngs?` +
      `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
      `${params.frcsCdNo ? '&frcsCdNo=' + params.frcsCdNo : ''}` +
      `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
      `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`

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
      setLoadingBackdrop(true)

      let endpoint: string =
      `/fsm/apv/aisdd/tr/getExcelAogIdSysDelngDtls?` +
      `${params.searchStDate ? '&bgngAprvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endAprvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.aprvCd ? '&aprvCd=' + params.aprvCd : ''}` + 
      `${params.apvlYn ? '&apvlYn=' + params.apvlYn : ''}` +
      `${row.frcsBrno ? '&frcsBrno=' + row.frcsBrno.replaceAll('-', '') : ''}` +
      `${row.aogIdntySysIdSn ? '&aogIdntySysIdSn=' + row.aogIdntySysIdSn : ''}`

      await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')

    }catch(error){
      console.error("ERROR :: ", error);
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?:number) => {
    setSelectedIndex(index ?? -1);
    setSelectedRow(row);

    fetchDetailData(row);
  }

  // 페이지 이동 감지 종료 //

  // 검색조건 변경 시 호출되는 함수
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const isValidDateIn3Month = (stDate: string, edDate: string): boolean => {
    const iDate: Date = new Date(stDate)
    const oDate: Date = new Date(edDate)

    let compare1: boolean = true;
    let compare2: boolean = true;
    
    const plus3Month: Date = new Date(calMonthsDate(new Date(iDate), 3));
    const minus3Month: Date = new Date(calMonthsDate(new Date(oDate), -3));

    // 시작일자 + 3개월이 종료일자보다 클 때 정상
    compare1 = plus3Month >= oDate ? true : false

    // 종료일자 - 3개월이 시작일자보다 작을 때 정상
    compare2 = minus3Month <= iDate ? true : false

    return (compare1 && compare2 ? true : false)
  }

  return (
    <PageContainer
      title="주유량확인시스템 거래내역조회"
      description="주유량확인시스템 거래내역조회"
    >
      {/* breadcrumb */}
      <Breadcrumb title="주유량확인시스템 거래내역조회" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                거래일자
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start" required>시작일자</CustomFormLabel>
              <CustomTextField type="date" id="ft-date-start" name="searchStDate" value={params.searchStDate} onChange={handleSearchChange} inputProps={{max: params.searchEdDate}} fullWidth />
              ~
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-end" required>종료일자</CustomFormLabel>
              <CustomTextField type="date" id="ft-date-end" name="searchEdDate" value={params.searchEdDate} onChange={handleSearchChange} inputProps={{min: params.searchStDate}} fullWidth />
            </div>
            <div className="form-group" style={{maxWidth:'6rem'}}>
              <FormControlLabel control={<CustomCheckbox name='apvlYn' value={params.apvlYn} onChange={handleSearchChange}/>} label="취소포함"/>
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField id="ft-vhclNo" name="vhclNo" value={params.vhclNo} onChange={handleSearchChange} fullWidth/>
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-select-01">
                거래구분
              </CustomFormLabel>
              <select
                id="ft-select-01"
                className="custom-default-select"
                name="aprvCd"
                value={params.aprvCd}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {selectData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsBrno" required>
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsBrno" name="frcsBrno" value={params.frcsBrno} onChange={handleSearchChange} fullWidth/>
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsCdNo" required>
                가맹점번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsCdNo" name="frcsCdNo" value={params.frcsCdNo} onChange={handleSearchChange} fullWidth/>
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsNm" required>
                가맹점명
              </CustomFormLabel>
              <CustomTextField id="ft-frcsNm" name="frcsNm" value={params.frcsNm} onChange={handleSearchChange} fullWidth/>
            </div> 
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type='submit' color="primary">
              검색
            </Button>
            <Button variant="contained" color="success" onClick={() => excelDownload()}>
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvAisddFrcsTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          paging={true}
          cursor
          caption={"주유량확인시스템 거래내역조회 목록"}
        />
      </Box>
      {selectedRow && selectedIndex > -1 ? 
      <Box>
        <BlankCard title='상세내역'
          buttons={[
            {
              label: '엑셀',
              color: 'success',
              onClick: () => detailExcelDownload(selectedRow),
            },
          ]}
        >
            <Box style={{display:'flex', padding:'1rem 1rem', gap:'1rem'}}>
              <span>■ 일반거래</span>
              <span style={{color: 'blue'}}>■ 취소거래</span>
              <span style={{color: 'green'}}>■ 차량휴지/보조금지급정지기간 거래건</span>
              <span style={{color: 'purple'}}>■ 유종/단가불량/특별관리주유소 거래건</span>
              <span style={{color: 'red'}}>■ 주유량확인시스템 누락 거래건</span>
            </Box>
          <TableDataGrid
            headCells={apvAisddAprvTrHeadCells} // 테이블 헤더 값
            rows={detailRows} // 목록 데이터
            loading={loadingDtl} // 로딩여부
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            paging={false}
            caption={"상세내역 조회 목록"}
          />
        </BlankCard>
      </Box>
      : <></>}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
