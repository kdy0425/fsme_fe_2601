'use client'
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest, sendHttpFileRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid' //custom 사용을 위한 ilp 공통

import { fdqiHeadCells, dtlDrliHeadCells, dtlQualfInfoHeadCells } from '@/utils/fsms/ilp/headCells'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { SelectItem } from 'select'

import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급정보',
  },
  {
    title: '자격정보',
  },
  {
    to: '/ilp/fdqi',
    title: '화물 운전자 자격정보',
  },
]

// 날짜 숫자 변환
const toNumDate = (s?: string) => {
  if (!s) return undefined;
  const v = s.replace(/-/g, '').slice(0, 8);
  return v.length === 8 ? Number(v) : undefined;
};

// 유효/무효 텍스트 렌더러
const renderCtrtValidity = (row: any) => {
  const now = new Date();
  const todayNum = Number(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}`,
  );

  const begin = toNumDate(row.ctrtBgngYmd) ?? -Infinity; // 시작일 없으면 항상 시작한 것으로 처리
  const end   = toNumDate(row.ctrtEndYmd)   ?? 99991231;  // 종료일 없으면 무기한

  const valid = begin <= todayNum && todayNum <= end;
  return <>{valid ? '유효' : '유효하지않음'}</>;
};

// 파일 셀 커스텀 렌더러
const fileDownloadRender = (row: any) => (
  <>
    {(row.fileList ?? []).map((file: any, idx: number) => (
      <span
        key={idx}
        onClick={(e) => {
          e.stopPropagation();     // ← 행 클릭으로 전파 차단
          fetchFilesDown(file);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            fetchFilesDown(file);
          }
        }}
        style={{ display: 'block', cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
        role="button"
        tabIndex={0}
      >
        {file.lgcFileNm}
      </span>
    ))}
  </>
);

//파일 다운로드 - tip:사용이 추가로 더 있는 경우 공통기능으로
const fetchFilesDown = async (row: any) => {
  if (row == undefined) {
    return
  }
  try {
    let endpoint: string =
      `/ilp/fdqi/tr/getDrverFileDownload?` +
      `physFileNm=${row.physFileNm}` +
      `&lgcFileNm=${row.lgcFileNm}`

    const response = await sendHttpFileRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', row.lgcFileNm as string)
    document.body.appendChild(link)
    link.click()
  } catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
  } finally {
  }
}

//커스텀 헤드셀 주입
const customHeadCells = fdqiHeadCells.map((cell) => {
  if (cell.id === 'lgcFileNm') {
    return {
      ...cell,
      customRender: fileDownloadRender,
      style: { ...(cell.style ?? {}), whiteSpace: 'normal' }, // 줄바꿈 허용
    };
  }
  if (cell.id === 'ctrtVal') {
    return {
      ...cell,
      customRender: renderCtrtValidity,
    };
  }
  return cell;
});

export interface Row {
  //화물 운전 자격정보 
  brno: string // 사업자번호
  locgovCd: string // 시도명 + 관할관청 코드
  locgovNm: string // 관할관청
  vhclNo: string // 차량번호
  flnm: string // 운전자명
  vonrNm: string // 차주명
  rrno: string // 운전자 주민등록번호(원본)
  rrnoSecure: string // 운전자 주민등록번호(별표)
  ctrtBgngYmd: string // 계약시작일
  ctrtEndYmd: string // 계약종료일
  fileId: string // 첨부파일아이디
  telno: string // 연락처
  rgtrId: string // 등록자아이디
  regDt: string // 등록일시
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일시
  koiCd: string // 유종코드
  koiCdNm: string // 유종명
  vhclTonCd: string // 톤수코드
  vhclTonCdNm: string // 톤수명
  CRNO: string // 법인등록번호(원본)
  crnoS: string // 법인등록번호(복호화)
  vonrRrno: string // 차주 주민등록번호(원본)
  vonrRrnoS: string // 차주 주민등록번호(복호화)
  rrnoS: string
  vonrRrnoSecure: string // 차주 주민등록번호(별표)
  lcnsTpbizCd: string // 업종코드
  vhclSeCd: string // 차량구분코드
  vhclRegYmd: string // 차량등록일자
  YRIDNW: string // 연식
  LEN: string // 길이
  BT: string // 너비
  maxLoadQty: string // 최대적재수량
  vhclSttsCd: string // 차량상태코드
  vonrBrno: string // 차주사업자등록번호
  vhclPsnCd: string // 차량소유코드
  delYn: string // 삭제여부
  dscntYn: string // 할인여부
  souSourcSeCd: string // 원천소스구분코드
  bscInfoChgYn: string // 기본정보변경여부
  locgovAprvYn: string // 지자체승인여부
  prcsSttsCd: string // 처리상태코드
  fileList: []

  //운전면허정보
  driverVonrNm?: string // 운전자명
  driverVonrRrno?: string // 운전자주민등록번호(원본)
  driverVonrRrnoSecure?: string // 운전자주민등록번호(별표)
  psnSeCdNm?: string // 면허보유여부
  stopBgngYmd?: string // 정지시작일자
  stopEndYmd?: string // 정지종료일자
  rtrcnYmd?: string // 취소일자
  knpaRgtrId?: string // 등록자아이디
  knpaRegDt?: string // 등록일자
  knpaMdfrId?: string // 수정자아이디
  knpaMdfcnDt?: string // 수정일자

  //운수종사자 정보
  driverVonrRrnoS?: string // 운전자주민등록번호(별표)
  driverRegDt?: string // 운전자등록일자
  sttsCd?: string // 운수종사상태코드
  frghtQlfcNo?: string // 화물자격번호
  frghtQlfcSttsNm?: string // 자격보유여부
  frghtQlfcSttsCdNm?: string // 자격보유여부
  frghtQlfcAcqsYmd?: string // 화물자격취득일자
  frghtQlfcRtrcnYmd?: string // 화물자격취소일자
  kotsaRgtrId?: string // 등록자아이디
  kotsaRegDt?: string // 등록일시
  kotsaMdfrId?: string // 수정자아이디
  kotsaMdfcnDt?: string // 수정일시
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [drlFlag, setDrlFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정 - 운전면허정보
  const [qualfFlag, setQualfFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정 - 운수종사자정보

  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)

  const [drlRows, setDrlRows] = useState<Row[]>([]) // 운전면허정보에 대한 Row
  const [drlTotalRows, setDrlTotalRows] = useState(0) // 총 수
  const [drlLoading, setDrlLoading] = useState(false) // 로딩여부

  const [qualfRows, setQualfRows] = useState<Row[]>([]) // 운수종사자정보에 대한 Row
  const [qualfTotalRows, setQualfTotalRows] = useState(0) // 총 수
  const [qualfLoading, setQualfLoading] = useState(false) // 로딩여부

  const [ctrtCode, setCtrtCode] = useState<SelectItem[]>([]) // 계약기간 코드
  
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  //계약기간 코드
  const ctrtCd: SelectItem[] = [
    {
      label: '전체',
      value: '',
    },
    {
      label: '유효',
      value: '01',
    },
    {
      label: '유효하지않음',
      value: '02',
    },
  ]

  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (selectedRow !== null) {
      fetchDrlData()
      fetchQualfData()
    }
  }, [qualfFlag, drlFlag])

  // 초기 데이터 로드
  useEffect(() => {
    setCtrtCode(ctrtCd)
  }, [])

  useEffect(() => {
    //첫행조회
    if (rows.length > 0) {
      handleRowClick(rows[0])
      setSelectedRowIndex(0)
    }
  }, [rows])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    setSelectedRow(null)
    setSelectedRowIndex(-1)
    setLoading(true)
    setExcelFlag(true) //엑셀기능 동작여부
    
    try {
      // 검색 조건에 맞는 endpoint 생성  
      let endpoint: string =
        `/ilp/fdqi/tr/getAllDrverMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.flnm ? '&flnm=' + params.flnm : ''}` +
        `${params.ctrtCd ? '&ctrtCd=' + params.ctrtCd : ''}`

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
        `/ilp/fdqi/tr/getExcelDrverMng?` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.ctrtCd ? '&ctrtCd=' + params.ctrtCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.flnm ? '&flnm=' + params.flnm : ''}` +
        `${params.ctrtCd ? '&ctrtCd=' + params.ctrtCd : ''}`

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

  // Fetch를 통해 운전면허정보 데이터 갱신
  const fetchDrlData = async () => {
    if (selectedRow == undefined) {
      return
    }
    setDrlLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
       `/ilp/fdqi/tr/drliInfo?` +
       `${selectedRow.rrno ? '&vonrRrno=' + selectedRow.rrno : ''}`
      //`${selectedRow.rrno ? '&vonrRrno=' + 'QF6mle2VJXsWyixezdmSPvno' : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setDrlRows(response.data.content)
        setDrlTotalRows(response.data.length)
      } else {
        setDrlRows([])
        setDrlTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setDrlRows([])
      setDrlTotalRows(0)

      console.error('Error fetching data:', error)
    } finally {
      setDrlLoading(false)
    }
  }

  // Fetch를 통해 데이터 갱신
  const fetchQualfData = async () => {
    if (selectedRow == undefined) {
      return
    }
    setQualfLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
       `/ilp/fdqi/tr/ddpsQualfInfo?` +
       `${selectedRow.rrno ? '&vonrRrno=' + selectedRow.rrno : ''}`
       //`${selectedRow.rrno ? '&vonrRrno=' + '8906120000000' : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setQualfRows(response.data.content)
        setQualfTotalRows(response.data.length)
      } else {
        setQualfRows([])
        setQualfTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setQualfRows([])
      setQualfTotalRows(0)

      console.error('Error fetching data:', error)
    } finally {
      setQualfLoading(false)
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = async (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedRowIndex(index ?? -1)
    setDrlFlag((prev) => !prev)
    setQualfFlag((prev) => !prev)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  return (
    <PageContainer title="화물 운전자 자격정보" description="화물 운전자 자격정보">
      {/* breadcrumb */}
      <Breadcrumb title="화물 운전자 자격정보" items={BCrumb} />
      <Box>
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
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-vhclNo"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  id="ft-vhclNo"
                  name="vhclNo"
                  value={params.vhclNo}
                  onChange={handleSearchChange}
                  //onKeyDown={handleKeyDown}
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-flnm"
                >
                  운전자명
                </CustomFormLabel>
                <CustomTextField
                  id="ft-flnm"
                  name="flnm"
                  value={params.flnm}
                  onChange={handleSearchChange}
                  // onKeyDown={handleKeyDown}
                  fullWidth
                />
              </div>
            </div>
            <hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-select-02"
                >
                  계약기간
                </CustomFormLabel>
                <select
                  id="ft-select-02"
                  className="custom-default-select"
                  name="ctrtCd"
                  value={params.ctrtCd}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  {ctrtCode.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
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
            headCells={customHeadCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            paging={true}
            cursor={true}
            selectedRowIndex={selectedRowIndex}
            caption={'화물-운전자관리 목록 조회'}
          />
        </Box>
        {/* 테이블영역 끝 */}
        {/* 상세 영역 시작 - 운전면허정보 */}
        {selectedRow && (
          <BlankCard
            className='contents-card'
            title='운전면허정보'          
          > 
              <TableDataGrid
                headCells={dtlDrliHeadCells}
                rows={drlRows} // 목록 데이터
                totalRows={drlTotalRows} // 총 로우 수
                loading={drlLoading} // 로딩여부
                //onRowClick={() => {}} // 행 클릭 핸들러 추가
                //paging={false}
                //cursor={true}
                caption={"운전면허정보 조회"}
              />
            </BlankCard>
            
        )}
        {/* 상세 영역 시작 - 운수종사자정보 */}
        {selectedRow && (
          <BlankCard
            className='contents-card'
            title='운수종사자정보'          
          > 
            <TableDataGrid
              headCells={dtlQualfInfoHeadCells}
              rows={qualfRows}
              totalRows={qualfTotalRows}
              loading={qualfLoading}
              caption={'운수종사자정보 조회'}
            />
          </BlankCard>
            
        )}
      </Box>
    </PageContainer>
  )
}

export default DataList
