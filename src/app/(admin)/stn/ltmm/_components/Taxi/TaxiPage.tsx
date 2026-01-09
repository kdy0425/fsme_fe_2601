'use client'

/* react */
import React, { useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button } from '@mui/material'
import { BlankCard } from '@/utils/fsms/fsm/mui-imports'

/* ./component */
import FormModal from './FormModal'
import ConfirmModal from '../../../lttm/_components/Taxi/ConfirmModal'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import DetailDataGrid from './DetailDataGrid'
import { CommSelect, CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import ChooseRadioModal, { radioListType } from '@/app/components/tx/chooseRadioModal/ChooseRadioModal'
import LocalChangeModal from '@/app/components/tx/localChangeModal/LocalChangeModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* type */
import { HeadCell, Pageable2 } from 'table'

/* 공통 js */
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { getDateRange } from '@/utils/fsms/common/util'
import _ from 'lodash'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/ltmm',
    title: '지자체이관전출관리',
  },
]

export interface Row {
  ctpvCd?: string // 시도코드
  locgovCd?: string // 관할관청코드
  bgngDt?: string // 신청시작일자
  endDt?: string // 신청종료일자
  vhclNo: string // 차량번호
  brno: string // 사업자등록번호
  prcsYmd?: string // 요청일자
  bzentyNm?: string // 업체명
  chgLocgovNm?: string // 전입관청
  exsLocgovNm?: string // 전출관청
  locgovNm?: string // 요청관청
  prcsSttsNm?: string // 처리상태
  bzmnSeCd?: string // 면허업종(개인법인구분)
  rprsvNm?: string // 대표자명
  rprsvRrno?: string // 대표자 주민등록번호
  vhclSttsNm?: string // 차량상태
  koiNm?: string // 유종
  rfslRsnCn?: string // 거절사유
  rgtrId?: string // 등록자 아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자 아이디
  mdfcnDt?: string // 수정일자
  aplySn: string // 신청일련번호
  prcsSttsCd?: string // 이관요청상태
  chgLocgovCd: string // 변경지자체 코드
  exsLocgovCd?: string
  dmndSeNm?: string

  bzmnSeNm?: string
  rprsvRrnoS?: string
  koiCd?: string
  regYmd?: string
  dmndSeCd?: string
  chk: string
}

type ButtonGroupActionProps = {
  onClickMultiBtn: (actionType: '01' | '02' | '04') => void // 일괄(승인, 거절, 취소) action
  onClickSingleBtn: (actionType: '01' | '02' | '04') => void // (승인, 거절, 취소) action
}

const headCells: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '',
    format: 'checkbox',
  },
  {
    id: 'regYmd',
    numeric: false,
    disablePadding: false,
    label: '요청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'exsLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '전출관청',
  },
  {
    id: 'chgLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '전입관청',
  },
  {
    id: 'dmndSeNm',
    numeric: false,
    disablePadding: false,
    label: '요청구분명',
  },
  {
    id: 'dmndLocgovNm',
    numeric: false,
    disablePadding: false,
    label: '요청관할관청',
  },
  {
    id: 'prcsSttsNm',
    numeric: false,
    disablePadding: false,
    label: '처리상태',
  },
]

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  bgngDt: string
  endDt: string
  vhclNo: string
  prcsSttsCd: string
}

type procDataType = {
  brno: string
  vhclNo: string
  aplySn: string
  chgLocgovCd: string
  prcsSttsCd: string
  rfslRsnCn: string
}

const TaxiPage = () => {

  const authInfo = getUserInfo();

  /* flag */
  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부

  /* 검색 row */
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  /* loading */
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  /* 검색조건 */
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    bgngDt: '',
    endDt: '',
    vhclNo: '',
    prcsSttsCd: ''
  })

  /* ChooseRadioModal 상태관리 */
  const [registOpen, setRegistOpen] = useState<boolean>(false)
  const [radioValue, setRadioValue] = useState<string>('')
  const radioList: radioListType[] = [{ label: '지자체이관 전출 단건등록', value: 'single' }, { label: '지자체이관 전출 일괄등록', value: 'multi' }]

  /* 모달상태관리 */
  const [confirmOpen, setConfirmOpen] = useState(false) // 다이얼로그 상태  
  const [open, setOpen] = useState<boolean>(false)
  const [locChgModalOpen, setLocChgModalOpen] = useState<boolean>(false)
  const [refusalType, setRefusalType] = useState<'single' | 'multi'>('single')

  /* 본인지자체 */
  const [authLocgovCd, setAuthLocgovCd] = useState<string>('');

  /* 체크 상태관리 */
  const [checkedRows, setCheckedRows] = useState<string[]>([]) // 체크 로우 데이터

  useEffect(() => {
    if (authInfo.locgovCd) {
      setAuthLocgovCd(authInfo.locgovCd);
    }
  }, [authInfo.locgovCd])

  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('date', 30)
    setParams((prev) => ({
      ...prev,
      bgngDt: dateRange.startDate,
      endDt: dateRange.endDate
    }))
  }, [])

  const resetData = (): void => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setSelectedRow(null)
    setSelectedIndex(-1)
    setExcelFlag(true) // 엑셀기능 동작여부
    setCheckedRows([])
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
      return
    }

    if (params.bgngDt > params.endDt) {
      alert('신청시작일자가 종료일자보다 큽니다.')
      return
    }

    resetData()
    setLoading(true)

    try {

      const searchObj = {
        ...params,
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
      }
      
      const endpoint = '/fsm/stn/ltmm/tx/getAllLgovMvtRequst' + toQueryParameter(searchObj)
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

        handleRowClick(response.data.content[0], 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상세정보에 있는 Button actions
  const buttonGroupActions: ButtonGroupActionProps = {
    // 일괄(승인, 거절, 취소) action
    onClickMultiBtn: (actionType: '01' | '02' | '04'): void => {
      handleMultiProcess(actionType)
    },

    // 승인 버튼 클릭 시 다이얼로그 오픈
    onClickSingleBtn: (actionType: '01' | '02' | '04'): void => {
      handleSingleProcess(actionType)
    },
  }

  // 데이터 수정하는 메서드
  const putData = async (actionType: string, procType: 'single' | 'multi', rfslRsnCn?: string) => {

    setLoadingBackdrop(true);

    try {

      const endpoint = procType === 'single' ? '/fsm/stn/ltmm/tx/updateLgovMvtRequst' : '/fsm/stn/ltmm/tx/updateLgovMvtMultiRequst'
      
      let body: any = {}
      
      if (procType === 'single') {
        const procData: procDataType = {
          brno: selectedRow?.brno ?? '',
          vhclNo: selectedRow?.vhclNo ?? '',
          aplySn: selectedRow?.aplySn ?? '',
          chgLocgovCd: selectedRow?.chgLocgovCd ?? '',
          prcsSttsCd: actionType,
          rfslRsnCn: rfslRsnCn ?? ''
        }

        body = procData
      } else {
        const procDataList: procDataType[] = []

        checkedRows.map(item => {
          const num = Number(item.replaceAll('tr', ''))

          if (isNaN(num)) {
            throw Error
          }

          procDataList.push({
            brno: rows[num].brno,
            vhclNo: rows[num].vhclNo,
            aplySn: rows[num].aplySn,
            chgLocgovCd: rows[num].chgLocgovCd,
            prcsSttsCd: actionType,
            rfslRsnCn: rfslRsnCn ?? ''
          })
        })

        body = { list: procDataList }
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' });

      if (response && response.resultType === 'success') {
        alert(response.message);
        reload()
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert('[PUTDATA E] 관리자에게 문의 부탁드립니다');
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(false);
    }
  }

  // 승인/거절/취소 버튼 클릭 시 다이얼로그 오픈
  const handleSingleProcess = (actionType: '01' | '02' | '04') => {

    if (!(selectedRow && (cancleValidation(selectedRow) || confirmValidation(selectedRow)))) {
      alert('처리할 수 없습니다. 관리자에게 문의 부탁드립니다')
      return
    }

    if (actionType === '01' || actionType === '04') {

      const msg = actionType === '01' ? '관할관청 이관을 승인 하시겠습니까?' : '관할관청 전입요청을 취소 하시겠습니까?';

      if (confirm(msg)) {
        putData(actionType, 'single')
      }
    } else {
      setRefusalType('single')
      setConfirmOpen(true) // 다이얼로그 오픈
    }
  }

  // 일괄처리
  const handleMultiProcess = (actionType: '01' | '02' | '04'): void => {

    try {

      const sucArr: string[] = []

      for (let i = 0; i < checkedRows.length; i++) {

        const num = Number(checkedRows[i].replaceAll('tr', ''))

        if (isNaN(num)) {
          throw Error
        }

        // 일괄취소이고 가능한 건
        if (actionType === '04' && cancleValidation(rows[num])) {
          sucArr.push(checkedRows[i])
        } 
        
        // 일괄승인거절 가능한건
        if (actionType !== '04' && confirmValidation(rows[num])) {
          sucArr.push(checkedRows[i])
        }
      }

      const cnt = checkedRows.length - sucArr.length

      if (cnt !== 0) {
        const type = actionType === '01' ? '일괄승인' : actionType === '02' ? '일괄거절' : '일괄취소'                
        alert(`체크된 건중 ${type} 불가능한 ${cnt}건은 대상에서 제외되었습니다.\n다시 ${type} 처리를 진행해 주세요.`)
        setRows(handleTableDataGridChecked(sucArr))
        setCheckedRows(sucArr)
        return
      }

      if (actionType === '01' || actionType === '04') {

        const msg = actionType === '01' ? '관할관청 이관을 일괄승인 하시겠습니까?' : '관할관청 전입요청을 일괄취소 하시겠습니까?';

        if (confirm(msg)) {
          putData(actionType, 'multi')
        }
      } else {
        setRefusalType('multi')
        setConfirmOpen(true) // 다이얼로그 오픈
      }

    } catch (error) {
      alert('[MultiProcess E] 관리자에게 문의 부탁드립니다');
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
        `/fsm/stn/ltmm/tx/getExcelLgovMvtRequst?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
        `${params.bgngDt ? (('&bgngDt=' + (params.bgngDt + '').replaceAll('-', '')) as string) : ''}` +
        `${params.endDt ? (('&endDt=' + (params.endDt + '').replaceAll('-', '')) as string) : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((selectedRow: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(selectedRow)
  }, []);

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }));
    setFlag(prev => !prev);
  }, []);

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  const reload = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    resetData()
    setFlag(prev => !prev)
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleConfirm = (): void => {
    if (radioValue === 'single') {
      setOpen(true)
    } else {
      setLocChgModalOpen(true)
    }
  }

  // 체크박스 변경시
  const handleCheckChange = useCallback((selected: string[]): void => {    
    setRows(handleTableDataGridChecked(selected))
    setCheckedRows(selected)
  }, [rows]);

  // 취소가능건
  const cancleValidation = (item: Row): boolean => {
    return item.prcsSttsCd === '00' && item.dmndSeCd === '2' && item.exsLocgovCd === authLocgovCd
  }

  // 승인, 거절 가능건
  const confirmValidation = (item: Row): boolean => {
    return item.prcsSttsCd === '00' && item.dmndSeCd === '1' && item.exsLocgovCd === authLocgovCd
  }

  // tableDataGrid 체크박스 핸들러
  const handleTableDataGridChecked = (checkedRow: string[]): Row[] => {    
    const temp: Row[] = _.cloneDeep(rows)
    temp.map((item, index) => {
      if (checkedRow.includes(`tr${index}`)) {
        item.chk = '1'
      } else {
        item.chk = '0'
      }          
    })
    return temp
  }

  // TableDataGrid컴포넌트 handleSelectAll 함수 실행 전 유효성 검사에 부합하는 로우만 리턴하여 체크하도록 함
  const handleSelectAllInterceptor = useCallback((pRows: Row[]): Row[] => {
    const resultRows: Row[] = pRows.filter(item => cancleValidation(item) || confirmValidation(item))
    if (resultRows.length === 0) {
      alert('선택 가능한 데이터가 없습니다.')
    }
    return resultRows
  }, [authLocgovCd])

  // TableDataGrid컴포넌트 handleSelect 함수 실행 전 유효성 검사에 부합하면 함수진행 아닐경우 return
  const handleSelectInterceptor = useCallback((pRow: Row): boolean => {
    if (cancleValidation(pRow) || confirmValidation(pRow)) {
      return true
    } else {
      const msg = '처리상태 [이관요청], 요청구분명 [전입요청], 전출관청 [본인 지자체]\n처리상태 [이관요청], 요청구분명 [전출요청], 전출관청 [본인 지자체]\n로 등록된 데이터만 선택 가능합니다.'
      alert(msg)
      return false
    }
  }, [authLocgovCd])

  // 거절 / 일괄거절
  const handleRefusal = (type: 'single' | 'multi', rfslRsnCn: string): void => {
    putData('02', type, rfslRsnCn)
  }

  return (
    <>
      <PageContainer
        title="지자체이관전출관리"
        description="지자체이관전출관리 페이지"
      >
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
                  htmlFor="ft-vhclNo"
                >
                  차량번호
                </CustomFormLabel>
                <CustomTextField
                  name="vhclNo"
                  value={params.vhclNo ?? ''}
                  onChange={handleSearchChange}
                  type="text"
                  id="ft-vhclNo"
                  fullWidth
                />
              </div>
            </div>
            <hr></hr>
            {/* 신청일자 datePicker */}
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  신청일자
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  신청 시작일
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="bgngDt"
                  value={params.bgngDt}
                  onChange={handleSearchChange}
                  fullWidth
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  신청종료일
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="endDt"
                  value={params.endDt}
                  onChange={handleSearchChange}
                  fullWidth
                />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="sch-prcsSttsCd"
                >
                  처리상태
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="ITL0"
                  pValue={params.prcsSttsCd}
                  handleChange={handleSearchChange}
                  pName="prcsSttsCd"
                  htmlFor={'sch-prcsSttsCd'}
                  addText='전체'
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
                variant="contained"
                color="primary"
                onClick={() => setRegistOpen(true)}
              >
                등록
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

        {/* 테이블영역 시작 */}
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          caption={"택시 지자체이관전출관리 조회 목록"}
          onCheckChange={handleCheckChange}
          handleSelectAllInterceptor={handleSelectAllInterceptor}
          handleSelectInterceptor={handleSelectInterceptor}
        />
        {/* 테이블영역 끝 */}

        <>
          {/* 상세 영역 시작*/}
          {selectedRow && (
            <BlankCard className="contents-card" title="상세 정보"
              buttons={[
                {
                  label: '일괄승인',
                  disabled: checkedRows.length === 0,
                  onClick: () => buttonGroupActions.onClickMultiBtn('01'),
                  color: 'outlined',
                },
                {
                  label: '일괄거절',
                  disabled: checkedRows.length === 0,
                  onClick: () => buttonGroupActions.onClickMultiBtn('02'),
                  color: 'outlined',
                },
                {
                  label: '일괄취소',
                  disabled: checkedRows.length === 0,
                  onClick: () => buttonGroupActions.onClickMultiBtn('04'),
                  color: 'outlined',
                },
                {
                  label: '승인',
                  disabled: !(selectedRow.prcsSttsCd == '00' && selectedRow.dmndSeCd == '1' && selectedRow.exsLocgovCd === authLocgovCd),
                  onClick: () => buttonGroupActions.onClickSingleBtn('01'),
                  color: 'outlined',
                },
                {
                  label: '거절',
                  disabled: !(selectedRow.prcsSttsCd == '00' && selectedRow.dmndSeCd == '1' && selectedRow.exsLocgovCd === authLocgovCd),
                  onClick: () => buttonGroupActions.onClickSingleBtn('02'),
                  color: 'outlined',
                },
                {
                  label: '취소',
                  disabled: !(selectedRow.prcsSttsCd == '00' && selectedRow.dmndSeCd == '2' && selectedRow.exsLocgovCd === authLocgovCd),
                  onClick: () => buttonGroupActions.onClickSingleBtn('04'),
                  color: 'outlined',
                },
              ]}
            >
              <DetailDataGrid
                data={selectedRow}
              />
            </BlankCard>
          )}
          {/* 상세 영역 끝 */}
        </>
      </PageContainer>

      {open ? (
        <FormModal
          isOpen={open}
          setOpen={setOpen}
          reload={() => reload()}
        />
      ) : null}

      {confirmOpen ? (
        <ConfirmModal
          refusalType={refusalType}
          handleRefusal={handleRefusal}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
        />
      ) : null}

      {registOpen ? (
        <ChooseRadioModal
          open={registOpen}
          setOpen={setRegistOpen}
          title='등록방법 선택'
          handleConfirm={handleConfirm}
          radioValue={radioValue}
          setRadioValue={setRadioValue}
          radioList={radioList}
        />
      ) : null}

      {locChgModalOpen ? (
        <LocalChangeModal
          open={locChgModalOpen}
          setOpen={setLocChgModalOpen}
          type='전출'
          reload={reload}
        />
      ) : null}
    </>
  )
}

export default TaxiPage
