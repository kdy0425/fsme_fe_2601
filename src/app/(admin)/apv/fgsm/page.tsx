'use client'

/* react */
import { useCallback, useEffect, useState } from "react"

/* mui component */
import { CustomFormLabel, CustomTextField, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { Button, Box } from '@mui/material'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* type */
import { HeadCell, Pageable2 } from "table"

/* _component */
import MrchIssueDetailInfo from './_component/MrchIssueDetailInfo'
import MrchnetInfo from './_component/MrchnetInfo'
import MrchRegisterModal from './_component/MrchRegisterModal'

/* 공통 js */
import { getDateRange } from '@/utils/fsms/common/dateUtils'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { isNumber } from '@/utils/fsms/common/comm'

export interface Row {
  /* hidden 값 */
  frcsNo: string // 가맹점 번호
  hstrySn?: number // 이력일련 번호
  sttsCd?: string		// 상태 코드
  locgovCd?: string    // 지자체코드
  frcsTelno: string // 가맹점 전화번호

  /* 가맹점 상세정보 */
  frcsBrno: string	// 가맹점 사업자 등록 번호
  frcsNm: string 		// 가맹점명
  frcsAddr?: string 	// 가맹점 주소

  /* 가맹점 지급정지 상세정보 */
  sttsNm?: string 		    // 상태명
  stopBgngYmd?: string 	// 정지 시작 일자
  stopEndYmd?: string 	  // 정지 종료 일자
  locgovNm?: string 	    // 지자체명
  rgtrId?: string 		    // 입력자(등록자) 아이디
  regDt?: string 		      // 입력(등록)일시
  mdfrId?: string 		    // 수정자아이디
  mdfcnDt?: string 	  	// 수정일시
  stopRsnCn?: string    	// 정지 사유 내용
}

/* type 선언 */
const headCells: HeadCell[] = [
  {
    id: 'frcsBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'frcsNo',
    numeric: false,
    disablePadding: false,
    label: '가맹점번호',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '가맹점명',
  },
  {
    id: 'stopBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'stopEndYmd',
    numeric: false,
    disablePadding: false,
    label: '지급정지종료일',
    format: 'yyyymmdd',
  },
  {
    id: 'sttsNm',
    numeric: false,
    disablePadding: false,
    label: '지급정지상태',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '등록지자체명',
  },
]

//내비게이션
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
    to: '/apv/fgsm',
    title: '가맹점 지급 정지 관리',
  },
]

/* 검색조건 */
type listSearchObj = {
  page: number
  size: number
  frcsBrno: string
  frcsNo: string
  stopBgngYmd: string
  stopEndYmd: string
  frcsNm: string
}

const DataList = () => {

  const userInfo = getUserInfo();

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    frcsBrno: '',
    frcsNo: '',
    stopBgngYmd: getDateRange('d', 30).startDate,
    stopEndYmd: getDateRange('d', 30).endDate,
    frcsNm: ''
  }) // 검색조건

  const [mrchnetDetailInfo, setMrchnetDetailInfo] = useState<Row | null>(null) // 가맹점  상세정보
  const [rowIndex, setRowIndex] = useState<number>(-1) // 현재 선택된 로우인덱스
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [rows, setRows] = useState<Row[]>([]) // 조회결과
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  /* 등록 및 수정모달 상태관리 */
  const [type, setType] = useState<'update' | 'new'>('new');
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (searchFlag != null) {
      fetchData()
    }
  }, [searchFlag])

  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setSearchFlag((prev) => !prev)
  }, [])

  // 조회클릭시
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  // reload 용도
  const reloadAdvancedSearch = useCallback(() => {
    resetData()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }));
    setSearchFlag((prev) => !prev)
  }, [])

  // 조회조건 변경시
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'frcsBrno' || name === 'frcsNo') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  };

  // row클릭시
  const handleClick = useCallback((row: Row, index?: number) => {
    setMrchnetDetailInfo(row)
    setRowIndex(index ?? -1)
  }, [])

  const searchValidation = (): boolean => {
    
    if (!params.stopBgngYmd) {
      alert('시작일자를 입력 해주세요')
    } else if (!params.stopEndYmd) {
      alert('종료일자를 입력 해주세요')
    } else if (params.stopBgngYmd > params.stopEndYmd) {
      alert('시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
    } else {
      return true
    }
    return false
  }

  const handleOpen = (type: 'new' | 'update') => {

    if (type === 'update') {

      if (rowIndex === -1) {
        alert('선택된 행이 없습니다.');
        return
      }

      if (userInfo.locgovCd !== mrchnetDetailInfo?.locgovCd) {
        alert('등록한 지자체만 수정 가능합니다.');
        return
      }

      if (mrchnetDetailInfo?.sttsCd === '20' || mrchnetDetailInfo?.sttsCd === '99') {
        alert('지급정지 시작전 또는 종료전 가맹점만 수정 가능합니다.');
        return;
      }
    }

    setOpen(true);
    setType(type)
  }
  const handleClickClose = () => {
    setOpen(false);
  }
  
  const resetData = (): void => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setMrchnetDetailInfo(null)
    setRowIndex(-1)
  }

  const fetchData = async () => {

    if (searchValidation()) {

      resetData()
      setLoading(true)

      try {

        const searchObj = {
          ...params,
          stopBgngYmd: params.stopBgngYmd.replaceAll('-', ''),
          stopEndYmd: params.stopEndYmd.replaceAll('-', ''),
        }

        const endpoint = '/fsm/apv/fgsm/cm/getAllFrcsGiveStopMng' + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

        if (response && response.resultType === 'success' && response.data.content.length != 0) {
          setRows(response.data.content)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // click event 발생시키기
          handleClick(response.data.content[0], 0)
        }
      } catch (error) {
        // 에러시
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <PageContainer title="가맹점 지급정지관리" description="가맹점 지급정지관리">
      <>
        <Breadcrumb title="가맹점 지급정지관리" items={BCrumb} />

        <Box component='form' onSubmit={handleAdvancedSearch} sx={{ mb: 2 }} >
          <Box className="sch-filter-box">
            {/* 검색조건 1열 */}
            <div className="filter-form">
              {/* 검색조건 - 사업자번호 */}
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-frcsBrno"
                >
                  사업자번호
                </CustomFormLabel>
                <CustomTextField
                  id="sch-frcsBrno"
                  fullWidth
                  name="frcsBrno"
                  value={params.frcsBrno}
                  onChange={handleSearchChange}
                  inputProps={{
                    maxLength: 10
                  }}
                />
              </div>

              {/* 검색조건 - 가맹점번호 */}
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-frcsNo"
                >
                  가맹점번호
                </CustomFormLabel>
                <CustomTextField
                  id="sch-frcsNo"
                  fullWidth
                  name="frcsNo"
                  value={params.frcsNo}
                  onChange={handleSearchChange}
                  inputProps={{
                    maxLength: 10
                  }}
                />
              </div>
            </div>

            <hr />

            <div className="filter-form">
              {/* 검색조건 - 기간 */}
              <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  정지기간
                </CustomFormLabel>

                <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">시작일자</CustomFormLabel>
                <CustomTextField
                  value={params.stopBgngYmd}
                  onChange={handleSearchChange}
                  name="stopBgngYmd"
                  type="date"
                  id="ft-date-start"
                  fullWidth
                />
                ~
                <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">종료일자</CustomFormLabel>
                <CustomTextField
                  value={params.stopEndYmd}
                  name="stopEndYmd"
                  onChange={handleSearchChange}
                  type="date"
                  id="ft-date-end"
                  fullWidth
                />
              </div>
              {/* 검색조건 - 가맹점명 */}
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-frcsNm"
                >
                  가맹점명
                </CustomFormLabel>
                <CustomTextField
                  id="sch-frcsNm"
                  fullWidth
                  name="frcsNm"
                  value={params.frcsNm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </Box>

          {/* Buttons */}
          <Box className="table-bottom-button-group">
            <div className="button-right-align">
              {/* 조회 */}
              <Button variant='contained' type='submit' color='primary'>
                검색
              </Button>

              {/* 신규 */}
              <Button variant="contained" color="primary" onClick={() => handleOpen('new')}>
                등록
              </Button>

              {/* 수정 */}
              <Button variant="contained" color="primary" onClick={() => handleOpen('update')}>
                수정
              </Button>
            </div>
          </Box>
        </Box>

        {/* 조회 그리드 */}
        <Box>
          <TableDataGrid
            headCells={headCells} // 테이블 헤더 값
            rows={rows} // 목록 데이터
            totalRows={totalRows} // 총 로우 수
            loading={loading} // 로딩여부
            onRowClick={handleClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={pageable} // 현재 페이지 / 사이즈 정보
            selectedRowIndex={rowIndex}
            caption={"가맹점 지급정지관리 조회"}
          />
        </Box>

        {rowIndex !== -1 ? (
          <>
            <MrchIssueDetailInfo
              issueDetailInfo={mrchnetDetailInfo}
            />
            <Box mt={2} />
            <MrchnetInfo
              issueDetailInfo={mrchnetDetailInfo}
              reload={reloadAdvancedSearch}
            />
          </>
        ) : null}

        {/* 등록 및 수정 */}
        {open ? (
          <MrchRegisterModal
            open={open}
            type={type}
            mrchnetDetailInfo={mrchnetDetailInfo}
            onCloseClick={handleClickClose}
            reload={reloadAdvancedSearch}
          />
        ) : null}
      </>
    </PageContainer >
  )
}

export default DataList