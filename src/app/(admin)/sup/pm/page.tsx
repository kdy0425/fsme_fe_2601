'use client'

/* React */
import React, { useCallback, useEffect, useMemo, useState } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import BlankCard from '@/app/components/shared/BlankCard'
import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getExcelFile, getToday, isNumber } from '@/utils/fsms/common/comm'
import { getDateRange } from '@/utils/fsms/common/dateUtils'

/* types */
import { HeadCell, Pageable2 } from 'table'
import { supPmHC } from '@/utils/fsms/headCells'

/* _components */
import CreateModal from './_components/CreateModal'
import { FirstHalfHeader, SecondHalfHeader } from './_components/CustomHeaders'
import PrintModal from './_components/PrintModal'
import RmtAmtModal from './_components/RmtAmtModal'

/* redux-toolkit */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@/store/store'
import { handleCreateModalOpen, handleSetViewRate, handleSetImplDate } from '@/store/popup/PrdvMngSlice'

/* prdvJs */
import { getHeadCell, isSumLocgovCd } from './prdvJs'

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
    to: '/sup/pm',
    title: '안분관리',
  },
]

export interface Row {
  sn: string
  crtrYear: string
  crtrYearNm: string
  halfYear: string
  halfYearNm: string
  prdvRate: string
  rcntImplPrfmnc: string
  frstHalfImplRate: string
  hcfhNeedRate: string
  ajmtPrdvRate: string
  sttsCd: string
  sttsNm: string
  implBgngYm: string
  implEndYm: string
  regDt: string
  userNm: string
}

export interface DetailRow {
  locgovCd: string            // 시군별
  locgovNm: string            // 시군별명
  totHcfhGiveExpcAmt: string  // 총계_향후 지급예상액
  bsHcfhGiveExpcAmt: string   // 버스_향후 지급예상액
  txHcfhGiveExpcAmt: string   // 택시_향후 지급예상액
  trHcfhGiveExpcAmt: string   // 화물_향후 지급예상액
  prdvRate: string            // 기존안분률
  rcntImplPrfmnc: string      // 최근4년집행실적
  frstHalfImplRate: string    // 상반기집행률
  hcfhNeedRate: string        // 향후요구율
  ajmtPrdvRate: string        // 조정안분율
  prdvRateIcdc: string        // 안분율증감
  backgroundColor: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  bgngDt: string
  endDt: string
  halfYear: string
  sttsCd: string
}

const DataList = () => {

  // redux-toolkit
  const { createModalOpen } = useSelector((state: AppState) => state.PrdvMng)
  const dispatch = useDispatch()

  // 안분관리 내역
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 총 수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1)
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })

  // 안분관리 상세 내역
  const [detailFlag, setDetailFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [detailRows, setDetailRows] = useState<DetailRow[]>([]) // 가져온 로우 데이터
  const [detailLoading, setDetailLoading] = useState<boolean>(false) // 로딩여부

  // 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  // 목록 조회를 위한 객체
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    bgngDt: '',
    endDt: '',
    halfYear: '',
    sttsCd: '',
  })

  // 모달 상태관리
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false) // 출력
  const [isAmtModalOpen, setIsAmtModalOpen] = useState<boolean>(false) // 송금액 및 집행실적

  // 헤드셀
  const headCell: HeadCell[] = useMemo(() => {
    if (selectedRowIndex > -1) {
      return getHeadCell(rows[selectedRowIndex].halfYear)
    } else {
      return []
    }
  }, [selectedRowIndex])

  // 커스텀 헤더
  const customHeader = useMemo(() => {
    if (selectedRowIndex > -1) {
      return rows[selectedRowIndex].halfYear === '1' ? () => FirstHalfHeader('view') : () => SecondHalfHeader('view')
    }
  }, [selectedRowIndex])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('y', 1)
    setParams((prev) => ({
      ...prev,
      bgngDt: dateRange.startDate,
      endDt: dateRange.endDate,
    }))
  }, [])

  // 안분관리 조회 플래그 값 변경시
  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // 안분관리 로우 클릭시 상세 조회
  useEffect(() => {
    if (detailFlag != null) {
      fetchDetailData()
    }
  }, [detailFlag])

  // 검색조건 변경
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    // 년도 입력시
    if (name === 'bgngDt' || name === 'endDt') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }, [])

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number): void => {
    setSelectedRowIndex(index ?? -1)
    // 비율세팅   
    dispatch(handleSetViewRate({
      frstHalfImplRate: row.frstHalfImplRate,
      hcfhNeedRate: row.hcfhNeedRate,
      prdvRate: row.prdvRate,
      rcntImplPrfmnc: row.rcntImplPrfmnc,
    }))
    // 집행일자세팅   
    dispatch(handleSetImplDate({
      name: 'view',
      value: {
        // 상반기일경우 년도.03 ~ 년도.12로 고정 / 하반기일경우 저장시 입력한 집행일자 세팅
        implBgngYm: row.halfYear === '1' ? `${row.crtrYear}03` : row.implBgngYm,
        implEndYm: row.halfYear === '1' ? `${row.crtrYear}12` : row.implEndYm,
      }
    }))
    setDetailFlag(prev => !prev)
  }, [])

  const searchValidation = (): boolean => {
    if (!params.bgngDt) {
      alert('시작기간을 입력해 주세요.')
    } else if (!params.endDt) {
      alert('종료기간을 입력해 주세요.')
    } else if (params.bgngDt > params.endDt) {
      alert('시작기간이 종료기간보다 큽니다.')
    } else {
      return true
    }
    return false
  }

  // 조회정보 가져오기
  const fetchData = async (): Promise<void> => {

    if (searchValidation()) {

      try {

        resetData()
        setLoading(true)

        const endpoint = '/fsm/sup/pm/cm/getPrdvMasterList' + toQueryParameter(params)
        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

        if (response && response.resultType === 'success' && response.data.content.length) {
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
          // click event 발생시키기
          handleRowClick(response.data.content[0], 0)
        }
      } catch (error) {
        console.log('fetchData', error)
      } finally {
        setLoading(false)
      }
    }
  }

  // 상세 조회정보 가져오기
  const fetchDetailData = async (): Promise<void> => {

    try {

      setDetailLoading(true)

      const selectedData: Row = rows[selectedRowIndex]
      const endpoint = '/fsm/sup/pm/cm/getPrdvDetailList' + toQueryParameter({ sn: selectedData.sn })
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.length) {
        const temp: DetailRow[] = response.data
        temp.map(item => {
          if (isSumLocgovCd(item.locgovCd)) {
            item.backgroundColor = 'lightgrey'
          }
        })
        // 반올림으로 인하여 값이 맞지 않기에 100%로 고정
        temp[0].prdvRate = '100.00'
        temp[0].rcntImplPrfmnc = '100.00'
        temp[0].frstHalfImplRate = '100.00'
        temp[0].hcfhNeedRate = '100.00'
        temp[0].ajmtPrdvRate = '100.00'
        setDetailRows(temp)
      }
    } catch (error) {
      console.log('fetchDetailData', error)
    } finally {
      setDetailLoading(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setDetailRows([])
    setFlag((prev) => !prev)
  }, [])

  // 조회시
  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag(prev => !prev)
  }

  // 조회전 데이터 초기화
  const resetData = (): void => {
    setRows([])
    setTotalRows(0)
    setSelectedRowIndex(-1)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setDetailRows([])
  }

  // 삭제
  const deletePrdvData = async (): Promise<void> => {

    if (selectedRowIndex === -1) {
      alert('선택된 데이터가 없습니다.')
      return
    }

    if (rows[selectedRowIndex].sttsCd === 'Y') {
      alert('확정된 건은 삭제 불가합니다.')
      return
    }

    if (confirm('삭제 하시겠습니까?')) {

      try {

        setLoadingBackdrop(true)

        const body = { sn: rows[selectedRowIndex].sn }
        const endpoint = '/fsm/sup/pm/cm/deletePrdvData'
        const response = await sendHttpRequest('DELETE', endpoint, body, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          alert('삭제 되었습니다.')
          reload()
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.log('deletePrdvData', error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  // 확정
  const updateSttsCd = async (): Promise<void> => {

    if (selectedRowIndex === -1) {
      alert('선택된 데이터가 없습니다.')
      return
    }

    if (rows[selectedRowIndex].sttsCd === 'Y') {
      alert('이미 확정된 건입니다.')
      return
    }

    if (confirm('확정 하시겠습니까?')) {

      try {

        setLoadingBackdrop(true)

        const body = { sn: rows[selectedRowIndex].sn }
        const endpoint = '/fsm/sup/pm/cm/updateSttsCd'
        const response = await sendHttpRequest('POST', endpoint, body, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          alert('확정 되었습니다.')
          reload()
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.log('deletePrdvData', error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  // 재조회
  const reload = (): void => {
    resetData()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag(prev => !prev)
  }

  // 엑셀 다운로드
  const handleExcelDownload = async (): Promise<void> => {
    if (!detailRows.length) {
      alert('선택된 데이터가 없습니다.')
    }
    const searchObj = {
      sn: rows[selectedRowIndex].sn,
      halfYear: rows[selectedRowIndex].halfYear,
    }
    const endpoint = '/fsm/sup/pm/cm/getPrdvDetailExcel' + toQueryParameter(searchObj)
    const title = '안분 관리_' + getToday() + '.xlsx'
    await getExcelFile(endpoint, title)
  }

  // 출력
  const print = (): void => {
    if (!detailRows.length) {
      alert('출력할 데이터가 없습니다.')
      return
    }
    setIsPrintOpen(true)
  }

  return (
    <PageContainer title='안분관리' description='안분관리'>
      {/* breadcrumb */}
      <Breadcrumb title='안분관리' items={BCrumb} />

      {/* 검색영역 시작 */}
      <Box component='form' onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className='sch-filter-box'>
          <div className='filter-form'>
            <div className='form-group'>
              <CustomFormLabel className='input-label-display' required>
                기간
              </CustomFormLabel>
              <CustomFormLabel
                className='input-label-none'
                htmlFor='ft-date-start'
              >
                기간 시작년
              </CustomFormLabel>
              <CustomTextField
                type='year'
                id='ft-date-start'
                name='bgngDt'
                value={params.bgngDt}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 4,
                }}
              />
              ~
              <CustomFormLabel
                className='input-label-none'
                htmlFor='ft-date-end'
              >
                기간 종료년
              </CustomFormLabel>
              <CustomTextField
                type='year'
                id='ft-date-end'
                name='endDt'
                value={params.endDt}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{
                  maxLength: 4,
                }}
              />
            </div>
            <div className='form-group'>
              <CustomFormLabel
                className='input-label-display'
                htmlFor='sch-halfYear'
              >
                반기
              </CustomFormLabel>
              <CommSelect
                cdGroupNm='PMHY'
                pValue={params.halfYear}
                handleChange={handleSearchChange}
                pName='halfYear'
                htmlFor={'sch-halfYear'}
                addText='전체'
              />
            </div>
            <div className='form-group'>
              <CustomFormLabel
                className='input-label-display'
                htmlFor='sch-sttsCd'
              >
                상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm='PMCF'
                pValue={params.sttsCd}
                handleChange={handleSearchChange}
                pName='sttsCd'
                htmlFor={'sch-sttsCd'}
                addText='전체'
              />
            </div>
          </div>
        </Box>
        <Box className='table-bottom-button-group'>
          <div className='button-right-align'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
            >
              검색
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => dispatch(handleCreateModalOpen())}
            >
              등록
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={deletePrdvData}
            >
              삭제
            </Button>
            <Button
              variant='contained'
              color='success'
              onClick={handleExcelDownload}
            >
              엑셀
            </Button>
            <Button
              variant='contained'
              color='success'
              onClick={print}
            >
              출력
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <BlankCard
          className='contents-card'
          title='안분관리'
        >
          <TableDataGrid
            headCells={supPmHC} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            selectedRowIndex={selectedRowIndex}
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            caption={'안분관리 조회 목록'}
          />
        </BlankCard>
      </Box>

      <>
        {Array.isArray(detailRows) && detailRows.length ? (
          <Box>
            <BlankCard
              className='contents-card'
              title='안분관리 상세'
              buttons={[
                {
                  label: '확정',
                  onClick: updateSttsCd,
                  color: 'outlined',
                  disabled: rows[selectedRowIndex].sttsCd === 'Y'
                },
                {
                  label: '송금액 및 집행실적',
                  onClick: () => setIsAmtModalOpen(true),
                  color: 'outlined',
                },
              ]}
            >
              <TableDataGrid
                customHeader={customHeader}
                headCells={headCell} // 테이블 헤더 값
                rows={detailRows} // 목록 데이터
                loading={detailLoading} // 로딩여부
                caption={'안분관리 상세 조회 목록'}
              />
            </BlankCard>
          </Box>
        ) : null}
      </>

      <>
        {/* 등록모달 */}
        {createModalOpen && (
          <CreateModal reload={reload} />
        )}
      
        {/* 로딩 */}
        {loadingBackdrop && (
          <LoadingBackdrop open={loadingBackdrop} />
        )}
      
        {/* 출력모달 */}
        {isPrintOpen && (
          <PrintModal
            open={isPrintOpen}
            setOpen={setIsPrintOpen}
            detailRows={detailRows}
            selectedData={rows[selectedRowIndex]}
          />
        )}
      
        {/* 송금액 및 집행실적 */}
        {isAmtModalOpen && (
          <RmtAmtModal
            open={isAmtModalOpen}
            setOpen={setIsAmtModalOpen}
            year={rows[selectedRowIndex].crtrYear}
          />
        )}
      </>
    </PageContainer>
  )
}

export default DataList
