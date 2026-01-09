'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'

/* mui component */
import { Box, Button, Grid } from '@mui/material'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getDateRange, brNoFormatter } from '@/utils/fsms/common/util'

/* type */
import { Pageable2 } from 'table'
import { SelectItem } from 'select'
import { vddHc } from '@/utils/fsms/ilp/headCells'

import VndcDmndModal from './_components/VndcDmndDataModal'
import DetailDataGrid from './_components/DetailDataGrid'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '부정수급관리',
  },
  {
    to: '/ilp/vdd',
    title: '소명요청자료',
  },
]

export interface Row {
  exmnNo: string;           // 연번
  vndcNo?: string;          // 소명번호 (없으면 CREATE로 판단)
  regYmd?: string;          // 등록일자 (yyyymmdd)
  locgovNm?: string;        // 지자체
  reateTaskSeNm?: string;   // 업무구분
  vndcReqNm?: string;       // 소명요청구분
  vndcCn?: string;          // 소명등록내용
  vhclNo: string;
  brno: string;
  vonrNm:string;

  // 화면 로직에서 쓰는 보조 필드
  popupNtcYn?: 'Y' | 'N' | string; // 색상 계산용
  color?: string;                   // setRows에서 주입

  // 서버 응답에 남아있는 기타 필드는 허용(경고 방지용)
  [key: string]: any;
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchStDate: string
  searchEdDate: string
  ctpvCd: string
  locgovCd: string
  relateTaskSeCd: string //화물/버스/택시 업무구분
  vndcReqSeCd: string //소명요청구분
  prcsSttsCd: string //처리상태
  vndcCn: string //소명등록내용
}

const DataList = () => {

  //const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [flag, setFlag] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false) // 로딩여부
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징 객체

  const [prcsSttsCode, setPrcsSttsCode] = useState<SelectItem[]>([]) // 처리상태 코드

  // VndcDmndModal 제어용
  const [vndcOpen, setVndcOpen] = useState(false)
  const [vndcMode, setVndcMode] = useState<'CREATE'|'UPDATE'>('UPDATE')
  const [selRow, setSelRow] = useState<Row | null>(null)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    searchStDate: '',
    searchEdDate: '',
    ctpvCd:'',
    locgovCd:'',
    relateTaskSeCd: '',
    vndcReqSeCd:'', //소명요청구분
    prcsSttsCd:'', //처리상태
    vndcCn: '', //소명등록내용
  })

  //처리상태 코드
  const prcsSttsCd: SelectItem[] = [
    {
      label: '전체',
      value: '',
    },
    {
      label: '소명요청',
      value: '01',
    },
    {
      label: '소명완료',
      value: '02',
    },
  ]

  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
    setPrcsSttsCode(prcsSttsCd)
  }, [])

  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    try {
      setLoading(true)
      setRows([]) 
      setSelRow(null) 
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })

      const searchObj: listSearchObj = {
        ...params
      }

      const endpoint = '/ilp/vdd/cm/getVndcDataList' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
          // 데이터 조회 성공시
          const newRows: Row[] = response.data.content.map((row: Row) => ({
            color: row.popupNtcYn === 'Y' ? 'orange' : 'black',
            ...row,
          }))

          setRows(newRows)
          setSelRow(newRows[0])

          // setRows(
          //   response.data.content.map((row: Row) => {
          //     return {
          //       ...row,
          //       color: row.popupNtcYn === 'Y' ? 'orange' : 'black',
          //     }
          //   }),
          // )
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
        }
      } catch (error) {
        console.log('fetchData error : ' + error)
      } finally {
        setLoading(false)
      }
    }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 검색조건 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

   // 검색
  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // row클릭시
  const handleRowClick = useCallback((row: Row): void => {
    setSelRow(row)
    setVndcMode(row.vndcNo ? 'UPDATE' : 'CREATE')
    setVndcOpen(true)
  }, [])

  // 등록
  const handleOpen = (): void => {
     if (!selRow?.exmnNo) {
      alert('등록할 행(연번)을 먼저 선택해 주세요.')
      return
    }
    setVndcMode('CREATE')
    setVndcOpen(true)
  }

  // 재조회
  const handleReload = useCallback((): void => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }, [])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('month', 30)

    const startDate = dateRange.startDate
    const endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }

  return (
    <PageContainer title="소명요청" description="소명요청">
      {/* breadcrumb */}
      <Breadcrumb title="소명요청" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form"
         onSubmit={handleAdvancedSearch} 
         sx={{ mb: 2 }}
      >
        {/* 검색영역 시작 */}
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                등록일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                등록 시작
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                //onKeyDown={handleKeyDown}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                동록 종료
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
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
            {/* <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koi"
              >
                업무구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="096"
                pValue={params.relateTaskSeCd as any}
                handleChange={handleSearchChange}
                pName="relateTaskSeCd"           
                htmlFor={'sch-relateTaskSeCd'}
                addText="전체"
              />
            </div> */}
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vndcReqSeCd"
              >
                소명요청구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="ILPBDD"
                pValue={params.vndcReqSeCd as any}
                handleChange={handleSearchChange}
                pName="vndcReqSeCd"           
                htmlFor={'sch-vndcReqSeCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-select-02"
              >
                처리상태
              </CustomFormLabel>
              <select
                  id="ft-select-02"
                  className="custom-default-select"
                  name="prcsSttsCd"
                  value={params.prcsSttsCd}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  {prcsSttsCode.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vndcCn"
              >
                소명등록내용
              </CustomFormLabel>
              <CustomTextField
                id="ft-vndcCn"
                name="vndcCn"
                value={params.vndcCn}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              검색
            </Button>
            {/* <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
            >
              등록
            </Button>            */}
          </div>
        </Box>
      </Box>


      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={vddHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={'소명요청자료 조회'}
        />
      </Box>
      
      <>
        {vndcOpen && (
          <VndcDmndModal
            open={vndcOpen}
            mode={vndcMode}
            exmnNo={selRow?.exmnNo || ''}      // 필수
            vhclNo={selRow?.vhclNo || ''}
            brno={brNoFormatter(selRow?.brno ?? '') || ''}
            vonrNm={selRow?.vonrNm || ''}
            vndcNo={vndcMode === 'CREATE' ? '' : (selRow?.vndcNo || '')}
            vndcCn={vndcMode === 'CREATE' ? '' : (selRow?.vndcCn ?? '')}
            onClose={() => setVndcOpen(false)}
            onReload={handleReload}
          />
        )}
      </>       
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList