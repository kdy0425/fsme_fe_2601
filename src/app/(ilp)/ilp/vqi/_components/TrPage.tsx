'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button } from '@mui/material'

import { BlankCard} from '@/utils/fsms/fsm/mui-imports'
import PageContainer from '@/components/container/PageContainer'
import { Pageable2 } from 'table'


// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { trVhclQlfcInfoHc, cmDutyInsrSbscInfoHeadCells, cmStnbiheadCells, cmVqiDrliHeadCells, trVqiQualfInfoHeadCells } from '@/utils/fsms/ilp/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { isNumber } from '@/utils/fsms/common/comm';

import { useInsrncJoinInfo } from '@/utils/fsms/ilp/hooks/useInsrncJoinInfo' 
import { useDrlInfo } from '@/utils/fsms/ilp/hooks/useDrlInfo'
import { useBsnInfo } from '@/utils/fsms/ilp/hooks/useBsnInfo'
import { useQualfInfo } from '@/utils/fsms/ilp/hooks/useQualfInfo' 
 

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '정보',
  },
  {
    title: '자격정보',
  },
  {
    to: '/ilp/vqi',
    title: '차량 자격정보',
  },
]

export interface Row {
  vhclNo: string; // 차량번호
  locgovCd: string; // 시도명 + 관할관청
  locgovNm: string; // 관할관청명
  crno: string; // 법인등록번호(암호화)
  crnoS: string; // 법인등록번호(복호화)
  crnoSecure: string; // 법인등록번호(별표)
  brno: string; // 사업자등록번호
  bzentyNm: string; // 업체명
  rprsvNm: string; // 대표자명
  rprsvRrno: string; // 대표자 주민등록번호(원본)
  rprsvRrnoS: string; // 대표자 주민등록번호(복호화)
  rprsvRrnoSecure: string; // 대표자 주민등록번호(별표)
  rrno: string; // 주민등록번호
  vonrRrno: string; // 주민등록번호(원본)
  vonrRrnoS: string; // 주민등록번호(복호화)
  vonrRrnoSecure: string; // 주민등록번호(별표)
  vonrNm: string; // 차주명
  vonrBrno: string; // 차주 사업자등록번호(원본)
  vonrBrnos: string; // 차주 사업자등록번호(복호화)
  vonrSn: string; // 차량 소유자 일련번호
  vhclSttsCd: string; // 차량상태코드
  vhclPsnCd: string; // 차량소유코드
  vhclPsnNm: string; // 소유구분
  koiCd: string; // 유종코드
  koiNm: string; // 유종명
  vhclTonCd: string; // 톤수코드
  vhclTonNm: string; // 톤수명
  lcnsTpbizCd: string; // 면허업종코드
  lcnsTpbizNm: string; // 면허업종명
  vhclSeCd: string; // 차량구분코드
  vhclRegYmd: string; // 차량등록일자
  yridnw: string; // 연식
  len: string; // 길이
  bt: string; // 너비
  maxLoadQty: string; // 최대적재량
  delYn: string; // 삭제여부
  dscntYn: string; // 할인여부
  dscntYnNm: string; // 할인여부명
  souSourcSeCd: string; // 원천소스구분코드
  souSourcSeCdBiz: string; // 사업자의 원천소스구분코드
  bscInfoChgYn: string; // 기본정보변경여부
  locgovAprvYn: string; // 지자체승인여부
  locgovAprvYnNm: string; // 지자체승인여부명
  rgtrId: string; // 등록자아이디
  regDt: string; // 등록일자
  mdfrId: string; // 수정자아이디
  mdfcnDt: string; // 수정일자
  bzmnSeCd: string; // 사업자 구분 코드
  crnoEncpt: string; // 법인등록번호암호화(원본)
  crnoEncpts: string; // 법인등록번호암호화(복호화)
  zip: string; // 주소
  part1Addr: string; // 부분1주소
  part2Addr: string; // 부분2주소
  telno: string;
  carTelno: string; // 차량의 전화번호
  chgBfrCrno: string // 변경전 법인등록번호
  chgBfrCoNm: string // 변경전 업체명
  chgBfrRprsvNm: string // 변경전 대표자명

  chgBfrVhclOwnrBrno: string // 변경전 사업자등록번호

  insrncSttsCd?: string // 당일수신상태
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BasicTable = () => {
  // const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴


  const [flag, setFlag] = useState<boolean | null >(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [excelFlag, setExcelFlag] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  const [selectedRow, setSelectedRow] = useState<Row|null>(null);

  const router = useRouter();

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  useEffect(() => {
    if (flag != null) {
      fetchData()
    }

  }, [flag])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      
      handleRowClick(rows[0], 0)
    }
  }, [rows])


    // Fetch를 통해 데이터 갱신
    const fetchData = async () => {
      setSelectedRowIndex(-1);
      setSelectedRow(null)
      setLoading(true)
      try {

        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/ilp/vqi/tr/getAllVhcleMng?page=${params.page}&size=${params.size}` +
          `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`       

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
          setExcelFlag(true);
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
        // 디테일 데이터 초기화하기.
        setLoading(false)
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
        `/ilp/vqi/tr/getExcelVhcleMng?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` 

      await getExcelFile(endpoint, '화물_차량자격_' + getToday() + '.xlsx')
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
    }
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

// 선택 행과 검색 파라미터를 훅에 (화물 의무보험정보)
const insrncParams = useMemo(() => {
  if (!selectedRow) return undefined;
  return {
    endpoint: '/ilp/vqi/tr/dutyInsrSbscInfo', // 기본이면 생략 가능
    vhclNo: selectedRow.vhclNo,
    ctpvCd: (params.ctpvCd as string) || undefined,
    locgovCd: (params.locgovCd as string) || undefined,
    page: 0,
    size: 10,
  };
}, [selectedRow?.vhclNo, params.ctpvCd, params.locgovCd]);

const {
  rows: insrncRows,
  total: insrncTotalRows,
  loading: insrncLoading,
  refetch: refetchInsrnc,
} = useInsrncJoinInfo(insrncParams, { enabled: !!insrncParams })

// 선택 행과 검색 파라미터를 훅에 (사업자)
  const bsnParams = useMemo(() => {
    if (!selectedRow) return undefined;
    return {
      endpoint: `/ilp/vqi/tr/bsnmesntlInfo`, // 기본이면 생략 가능
      brno: selectedRow.vonrBrno,
      //vonrRrno: '8906120000000',
      //ctpvCd: (params.ctpvCd as string) || undefined,
      //locgovCd: (params.locgovCd as string) || undefined,
      page: 1,
      size: 10,
    };
  }, [selectedRow?.vonrRrno, params.ctpvCd, params.locgovCd]);
  
  const {
    rows: bsnRows,
    total: bsnTotalRows,
    loading: bsnLoading,
    refetch: refetchBsn,
  } = useBsnInfo(bsnParams, { enabled: !!bsnParams })

// 선택 행과 검색 파라미터를 훅에 (운전면허정보)
  const drlParams = useMemo(() => {
    if (!selectedRow) return undefined;
    return {
      endpoint: `/ilp/vqi/tr/drliInfo`, // 기본이면 생략 가능
      vonrRrno: selectedRow.vonrRrno,
      //vonrRrno: '8906120000000',
      //ctpvCd: (params.ctpvCd as string) || undefined,
      //locgovCd: (params.locgovCd as string) || undefined,
      page: 1,
      size: 10,
    };
  }, [selectedRow?.vonrRrno, params.ctpvCd, params.locgovCd]);
  
  const {
    rows: drlRows,
    total: drlTotalRows,
    loading: drlLoading,
    refetch: refetchDrl,
  } = useDrlInfo(drlParams, { enabled: !!drlParams })

// 선택 행과 검색 파라미터를 훅에 (운수종사자정보)
  const qualfParams = useMemo(() => {
    if (!selectedRow) return undefined;
    return {
      endpoint: `/ilp/vqi/tr/ddpsQualfInfo`, // 기본이면 생략 가능
      vonrRrno: selectedRow.vonrRrno,
      //vonrRrno: 'QF6mle2VJXsWyixezdmSPvno', //'QF6mle2VJXsWyixezdmSPvno',//'8906120000000', //test
      //ctpvCd: (params.ctpvCd as string) || undefined,
      //locgovCd: (params.locgovCd as string) || undefined,
      page: 1,
      size: 10,
    };
  }, [selectedRow?.vonrRrno, params.ctpvCd, params.locgovCd]);
  
  const {
    rows: qualfRows,
    total: qualfTotalRows,
    loading: qualfLoading,
    refetch: refetchQualf,
  } = useQualfInfo(qualfParams, { enabled: !!qualfParams })
  
  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row);
    setSelectedRowIndex(index ?? -1)
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'crno' || name == 'rrno' || name == 'brno'){
      if(isNumber(value)){
        setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ','') }))  
      }
    }else{
      setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ','') })) 
    }
    setExcelFlag(false)
  }

  const handleRedirect = () =>{
    setFlag((prev)=>!prev); // flag 변경으로 useEffect 트리거
  }
    
  // 원하는 경로로 이동!
  const handleCartPubClick = (url:string) => {
    // useEffect 안에서 라우팅 기능을 실행
    router.push(url);
  };
  
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1})) // 첫 페이지로 이동
    setFlag((prev) => !prev)  
    setExcelFlag(true)
  }

  return (
    <PageContainer title="차량관리" description="차량관리 페이지">
      {/* breadcrumb */}

      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
      <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>시도명
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
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
              차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                // onKeyDown={handleKeyDown}
                fullWidth
                inputProps={{
                  maxLength:9
                }}
              />
            </div>
          </div>
        
      </Box>
      <Box className="table-bottom-button-group">
        <div className="button-right-align">
          <LoadingBackdrop open={loadingBackdrop} />
          <Button
              type="submit"
              variant="contained"
              color="primary"
            >
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
      {/* 검색영역 끝 */}
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid 
          headCells={trVhclQlfcInfoHc} 
          rows={rows} 
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
          caption={"화물 차량 자격정보 목록 조회"}
          />
      </Box>
      {/* 테이블영역 끝 */}
      {/* 상세 영역 시작 - 의무보험 가입 정보 */}
      <>
        {selectedRow && selectedRowIndex > -1 &&(
          <BlankCard
            className='contents-card'
            title='의무보험 가입 정보'          
          > 
            <TableDataGrid
              headCells={cmDutyInsrSbscInfoHeadCells}
              rows={insrncRows}
              //totalRows={insrncTotalRows}
              loading={insrncLoading}
              caption={'의무보험 가입 정보 조회'}
            />
          </BlankCard>
            
        )}
      </>
      <>
        {selectedRow && selectedRowIndex > -1 &&(
          <BlankCard
            className='contents-card'
            title='사업자정보'          
          > 
            <TableDataGrid
              headCells={cmStnbiheadCells}
              rows={bsnRows}
              //totalRows={bsnTotalRows}
              loading={bsnLoading}
              caption={'사업자정보 조회'}
            />
          </BlankCard>
            
        )}
      </>

      <>
        {selectedRow && selectedRowIndex > -1 &&(
          <BlankCard
            className='contents-card'
            title='운전면허정보'          
          > 
            <TableDataGrid
              headCells={cmVqiDrliHeadCells}
              rows={drlRows}
              //totalRows={drlTotalRows}
              loading={drlLoading}
              caption={'운전면허정보 조회'}
            />
          </BlankCard>
            
        )}
      </>

      <>
        {selectedRow && selectedRowIndex > -1 &&(
          <BlankCard
            className='contents-card'
            title='운수종사자정보'          
          > 
            <TableDataGrid
              headCells={trVqiQualfInfoHeadCells}
              rows={qualfRows}
              //totalRows={qualfTotalRows}
              loading={qualfLoading}
              caption={'운수종사자정보 조회'}
            />
          </BlankCard>
            
        )}
      </>
      {/* 상세 영역 끝 */}
    </PageContainer>
  )
}

export default BasicTable
