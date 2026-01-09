'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Grid, Button } from '@mui/material'
import PageContainer from '@/components/container/PageContainer'
import { Pageable2 } from 'table'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/ilp/CommDataGrid'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday, isNumber } from '@/utils/fsms/common/comm'
import { toQueryParameter } from '@/utils/fsms/utils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnvmTxMainheadCells } from '@/utils/fsms/headCells'
import { cmDutyInsrSbscInfoHeadCells, txVqiQualfInfoHeadCells  } from '@/utils/fsms/ilp/headCells'
import { BlankCard } from '@/utils/fsms/fsm/mui-imports'

import { useInsrncJoinInfo } from '@/utils/fsms/ilp/hooks/useInsrncJoinInfo' 
import { useQualfInfo } from '@/utils/fsms/ilp/hooks/useQualfInfo' 

export interface Row {
  locgovCd?: string // 지자체코드
  vhclNo: string // 차량번호
  sttsCd?: string // 차량상태
  bzmnSeCd?: string // 개인법인구분
  bzentyNm?: string // 업체명
  brno?: string // 사업자등록번호
  bzmnSeNm?: string // 개인법인구분 이름
  bmSttsNm?: string // 사업자상태
  rprsvNm?: string // 수급자명
  rprsvRrno?: string //수급자주민등록번호(암호화)
  rprsvRrnoS?: string // 수급자주민등록번호
  koiNm?: string // 유종명
  dayoffYn?: string // 부제여부
  dayoffGroupNm?: string // 부제그룹명
  dscntNm?: string // 할인여부
  crno?: string // 법인등록번호
  telno?: string // 전화번호
  ntsChgYmd?: string // 국세청변경일자
  locgovNm?: string // 관할관청
  cmSttsNm?: string // 차량상태
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  brno: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const BasicTable = () => {
  
  const [flag, setFlag] = useState<boolean | null >(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [selectedRow, setSelectedRow] = useState<Row|null>(null);

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    brno: '',
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
    setExcelFlag(true)
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        brno: params.brno.replaceAll('-', ''),
      }

      const endpoint = '/ilp/vqi/tx/getAllVhcleMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      
      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        handleRowClick(response.data.content[0], 0)
      }
    } catch (error) {
      console.log('error', error)
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

      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        brno: params.brno.replaceAll('-', ''),
      }

      const endpoint: string = '/ilp/vqi/tx/getExcelVhcleMng' + toQueryParameter(searchObj)
      await  getExcelFile(endpoint, '택시_차량자격_' + getToday() + '.xlsx')
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }, [])

  // 선택 행과 검색 파라미터를 훅에 (의무보험가입정보)
  const insrncParams = useMemo(() => {
    if (!selectedRow) return undefined;
    return {
      endpoint: '/ilp/vqi/tx/getAllDutyInsrSbscInfo', // 기본이면 생략 가능
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

  // 선택 행과 검색 파라미터를 훅에 (운수종사자정보)
  const qualfParams = useMemo(() => {
    if (!selectedRow) return undefined;
    return {
      endpoint: `/ilp/vqi/tx/getAllDdpsQualfInfo`, // 기본이면 생략 가능
      vonrRrno: selectedRow.rprsvRrno,
      vhclNo: selectedRow.vhclNo,
      //vonrRrno: '8906120000000', //test
      //ctpvCd: (params.ctpvCd as string) || undefined,
      //locgovCd: (params.locgovCd as string) || undefined,
      page: 1,
      size: 10,
    };
  }, [selectedRow?.rprsvRrnoS, params.ctpvCd, params.locgovCd]);
  
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExcelFlag(false)
    const { name, value } = event.target
    if (name === 'brno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, page: 1, [name]: value }))
      }
    } else {
      setParams((prev) => ({ ...prev, page: 1, [name]: value })) 
    }    
  }

  // 검색조건 바뀔 때 마다 재호출 이건 다시 고민해보기
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  // 조회클릭시
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  return (
    <PageContainer title="차량관리" description="차량관리 페이지">

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
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="sch-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-bzmnSeCd"
              >
                개인법인구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CBG0"
                pValue={params.bzmnSeCd}
                handleChange={handleSearchChange}
                pName="bzmnSeCd"
                htmlFor={'sch-bzmnSeCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>

        {/* 검색영역 끝 */}

        <Grid style={{ marginBottom: '8px' }}>
          <Box className="table-bottom-button-group">
            <div className="button-right-align">            
              <Button
                type='submit'
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
        </Grid>
        {/* 검색영역 끝 */}
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnvmTxMainheadCells}
          rows={rows}
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          selectedRowIndex={selectedRowIndex}
          caption={"택시 차량 자격정보 목록 조회"}
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
            title='운수종사자정보'          
          > 
            <TableDataGrid
              headCells={txVqiQualfInfoHeadCells}
              rows={qualfRows}
              //totalRows={qualfTotalRows}
              loading={qualfLoading}
              caption={'운수종사자정보 조회'}
            />
          </BlankCard>
            
        )}
      </>
      {/* 상세 영역 끝 */}

      <LoadingBackdrop open={loadingBackdrop} />

    </PageContainer>
  )
}

export default BasicTable
