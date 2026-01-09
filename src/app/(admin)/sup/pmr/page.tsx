'use client'

/* mui component */
import { Box, Button, TableCell, TableHead, TableRow } from '@mui/material'

/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getDateRange } from '@/utils/fsms/common/comm'

/* 공통 component */
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* type */
import { Pageable2 } from 'table'
import { supPmrHC } from '@/utils/fsms/headCells'

/* ModalContent */
import ModalContent from './_components/ModalContent'
import ModifyDialog from './_components/ModifyDialog'
import PrintModal from './_components/PrintModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '예산관리',
  },
  {
    to: '/sup/pmr',
    title: '지급실적관리',
  },
]

export interface Row {
  locgovCd: string //관할관청
  crtrYm: string //기준년월
  carmdlCd: string //차종코드
  carmdlNm: string //업무구분
  anlrveAmt: string //월세입금액
  totalPayAmt: string //총지급금액
  totalPayLit: string //총유류사용량
  totalBalAmt: string //과,부족액
  cardGiveAmt: string //카드지급금액
  cardGiveAog: string //카드지급유류사용량
  orgLocgovCd: string //원관할관청
  orgCrtrYm: string //원거래년월
  orgCarmdlCd: string //원차종코드
  cardClmAmt: string //카드청구금액
  cardClmAog: string //카드청구주유량
  cardClmVhclCnt: string //카드청구차량대수
  cardGiveVhclCnt: string //카드지급차량대수
  docmntAplyClmAmt: string //서면청구금액
  docmntAplyClmLbrctQty: string //서면청구주유량
  docmntAplyClmVhclCnt: string //서면청구차량대수
  docmntAplyGiveAmt: string //서면지급금액
  docmntAplyGiveLbrctQty: string //서면지급주유량
  docmntAplyGiveVhclCnt: string //서면지급차량대수
  rgtrId: string //등록자아이디
  regDt: string //등록시간
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정시간
  locgovNm: string
  ctpvNm: string

  ctpvCd: string //시도코드 표시용
}

// 목록 조회시 필요한 조건
export type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  carmdlCd: string
  startAplcnYmd: string
  endAplcnYmd: string
}

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2}>기준년월</TableCell>
        <TableCell rowSpan={2}>월세입액</TableCell>
        <TableCell rowSpan={2}>업무구분</TableCell>
        <TableCell colSpan={3}>카드사 지급</TableCell>
        <TableCell colSpan={3}>서면신청 지급</TableCell>
        <TableCell rowSpan={2}>총 유류사용량</TableCell>
        <TableCell rowSpan={2}>총 지급금액</TableCell>
        <TableCell rowSpan={2}>과,부족액</TableCell>
        <TableCell rowSpan={2}>출력</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>지급대수</TableCell>
        <TableCell>유류사용량</TableCell>
        <TableCell>지급금액</TableCell>
        <TableCell>지급대수</TableCell>
        <TableCell>유류사용량</TableCell>
        <TableCell>지급금액</TableCell>
      </TableRow>
    </TableHead>
  )
}

const DataList = () => {

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [modifyRow, setModifyRows] = useState<Row>() // 수정할 행
  const [totalRows, setTotalRows] = useState<number>(0) // 총 수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [detailMoalFlag, setDetailModalFlag] = useState<boolean>(false)
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false)
  const [selectedRow, setSelectedRow] = useState<Row[]>([])

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    carmdlCd: '',
    startAplcnYmd: '',
    endAplcnYmd: '',
  })
  
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    const dateRange = getDateRange('m', 1)
    const startDate = dateRange.startDate
    const endDate = dateRange.endDate
    setParams((prev) => ({ ...prev, startAplcnYmd: startDate, endAplcnYmd: endDate }))
  }, [])

  const resetData = (): void => {
    setRows([])
    setModifyRows(undefined)
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  const handleReload = (): void => {
    resetData()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag(prev => !prev)
  }

  const searchValidation = (): boolean => {
    if (!params.carmdlCd) {
      alert('시도군은 필수값입니다.')
    } else if (!params.locgovCd) {
      alert('관할관청은 필수값입니다.')
    } else if (!params.startAplcnYmd) {
      alert('시작일은 필수값입니다.')
    } else if (!params.endAplcnYmd) {
      alert('종료일은 필수값입니다.')
    } else if (params.startAplcnYmd > params.endAplcnYmd) {
      alert('시작일이 종료일보다 큽니다.')
    } else {
      return true
    }
    return false
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async (): Promise<void> => {
    
    if (searchValidation()) {

      resetData
      setLoading(true)
      
      try {
        
        // 검색 조건에 맞는 endpoint 생성
        const searchObj: listSearchObj = {
          ...params,
          startAplcnYmd: params.startAplcnYmd.replaceAll('-', ''),
          endAplcnYmd: params.endAplcnYmd.replaceAll('-', ''),
        }
        const endpoint = '/fsm/sup/pmr/cm/getAllPerfMng' + toQueryParameter(searchObj)
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
        }
        else
        {
          // 데이터 조회 실패시
          setRows([])
        }
      } catch (error) {
        // 에러시
        console.log('fetch error : ' + error)
        setRows([])
      } finally {
        setLoading(false)
      }
    }
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag(prev => !prev)
  }, [])

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((modifyRow: Row): void => {
    setModifyRows(modifyRow)
    setDetailModalFlag(true)
  }, [])

  const handleDetailCloseModal = (): void => {
    setDetailModalFlag(false)
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 출력버튼 클릭
  const handleActionClick = useCallback((row: Row, id: string): void => {
    setSelectedRow([row])
    setIsPrintOpen(true)
  }, [])

  return (
    <PageContainer title="지급확정관리" description="지급확정관리">
      {/* breadcrumb */}
      <Breadcrumb title="지급확정관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                기준년월
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                기준 시작년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-start"
                name="startAplcnYmd"
                value={params.startAplcnYmd}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                기준 종료 년월
              </CustomFormLabel>
              <CustomTextField
                type="month"
                id="ft-date-end"
                name="endAplcnYmd"
                value={params.endAplcnYmd}
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
                htmlFor="sch-locgovCd"
              >
                <span className="required-text">*</span>관할관청
              </CustomFormLabel>
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgovCd'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-carmdlCd"
              >
                <span className="required-text">*</span>업무구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm='92H' // 필수 O, 가져올 코드 그룹명
                pValue={params.carmdlCd} // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                handleChange={handleSearchChange} // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                pName="carmdlCd" // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                /* width */ // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                htmlFor={'sch-carmdlCd'} // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
              />
              {/* // 다음줄  */}
            </div>
            {/* // 다음줄  */}
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button type="submit" variant="contained" color="primary">
              검색
            </Button>            
            <ModalContent
              reloadFunc={handleReload}
              size="lg"
              buttonLabel="등록"
              title="지급실적등록"
            />
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          customHeader={customHeader}
          headCells={supPmrHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          onActionClick={handleActionClick} // 출력버튼 클릭
        />
      </Box>

      {/* 상세 모달 */}
      <div>
        {detailMoalFlag && modifyRow && (
          <ModifyDialog
            size="lg"
            title="지급실적수정"
            reloadFunc={handleReload}
            handleDetailCloseModal={handleDetailCloseModal}
            selectedRow={modifyRow}
            open={detailMoalFlag}
          />
        )}
      </div>

      <>
        {isPrintOpen && (
          <PrintModal
            open={isPrintOpen}
            setOpen={setIsPrintOpen}
            rows={selectedRow}
          />
        )}
      </>

      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
