'use client'
import {
  Box,
  Button
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import SuccessionInfoModal from '@/app/components/tr/popup/SuccessionInfoModal'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { getCtpvCd, getDateRange, getExcelFile, getLocGovCd, getToday } from '@/utils/fsms/common/comm'
import { IconSearch } from '@tabler/icons-react'
import { SelectItem } from 'select'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
import DetailDataGrid from './_components/DetailDataGrid'
import FormModal from '@/app/components/popup/FormDialog'
import HistoryModalContent from './_components/HistoryModalContent'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
  CtpvSelectAll,
  LocgovSelectAll,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { isNumber } from '@/utils/fsms/common/comm';
import {ilgEshExaathrSucHisTrHc} from '@/utils/fsms/headCells'
import { useDispatch, useSelector } from "react-redux";
import {clearLocgovInfo, closeLocgovModal, closeModalAndClearLocgovInfo}  from "@/store/popup/LocgovInfoSlice";


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '부정수급관리',
  },
  {
    title: '행정처분',
  },
  {
    to: '/ilg/esh',
    title: '행정처분승계이력관리',
  },
]

export interface Row {
  vhclNo: string;
  hstrySn: number;
  crno: string;
  crnoS: string;
  vonrBrno: string;
  vonrNm: string;
  vhclPsnCd: string;
  vonrRrno: string;
  vonrRrnoSecure: string;
  vonrRrnoS: string;
  locgovCd: string;
  bgngYmd: string;
  endYmd: string;
  chgRsnCn: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  locgovNm: string;
  bfrVhclNo: string;
  exsLocgovCd: string;
  exsLocgovNm: string;
  ctpvNm: string;
  
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}


const DataList = () => {

  const handleRowBtnClick = (row: Row) => {
    setModalOpen2(true);
    setSearchVhclNo(row.vhclNo);
  }
  
    const headCells: HeadCell[] = [
      {
        id: 'btn',
        numeric: false,
        disablePadding: false,
        label: '이력',
        format: 'button',
        button: {
          label: <IconSearch />,
          color: 'dark',
          onClick: handleRowBtnClick
        }
      },
      {
        id: 'vhclNo',
        numeric: false,
        disablePadding: false,
        label: '차량번호',
      },
      {
        id: 'vonrNm',
        numeric: false,
        disablePadding: false,
        label: '소유자명',
      },
      {
        id: 'vonrRrnoSecure',
        numeric: false,
        disablePadding: false,
        label: '주민등록번호',
        format: 'rrno'
      },
      {
        id: 'vonrBrno',
        numeric: false,
        disablePadding: false,
        label: '사업자등록번호',
        format: 'brno'
      },
      {
        id: 'bgngYmd',
        numeric: false,
        disablePadding: false,
        label: '정지시작일',
        format: 'yyyymmdd'
      },
      {
        id: 'endYmd',
        numeric: false,
        disablePadding: false,
        label: '정지종료일',
        format: 'yyyymmdd'
      },
      {
        id: 'locgovNm',
        numeric: false,
        disablePadding: false,
        label: '관할관청',
      },
      {
        id: 'bfrVhclNo',
        numeric: false,
        disablePadding: false,
        label: '이전차량번호',
      },
      {
        id: 'exsLocgovNm',
        numeric: false,
        disablePadding: false,
        label: '이전관할관청',
      },
    ]

 
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])
  const [localGovCode, setLocalGovCode] = useState<SelectItem[]>([])

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'CREATE' | 'UPDATE'>('CREATE');
  
  const [modalOpen2, setModalOpen2] = useState<boolean>(false);
  const [searchVhclNo, setSearchVhclNo] = useState<string>('');

  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const dateRange = getDateRange('d', 60)
  const dateRange2 = getDateRange('d', -60)
  const [excelFlag, setExcelFlag] = useState<boolean>(false);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange2.startDate, // 종료일
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != undefined){
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
    setLoading(true)
    setSelectedIndex(-1)
    setSelectedRow(null)
    setExcelFlag(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/esh/tr/getAllExaathrSucHis?page=${params.page}&size=${params.size}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}` +
        `${params.rrno ? '&rrno=' + params.rrno : ''}` +
        `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '')  : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber : response.data.pageable.pageNumber+1,
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
      `/fsm/ilg/esh/tr/getExcelExaathrSucHis?` +
      `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.brno ? '&brno=' + params.brno : ''}` +
      `${params.rrno ? '&rrno=' + params.rrno : ''}` +
      `${params.searchStDate ? '&bgngDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endDt=' + params.searchEdDate.replaceAll('-', '')  : ''}`

      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + getToday() + '.xlsx')
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
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setExcelFlag(true)
    setFlag(prev => !prev)
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row);
    setSelectedIndex(index ?? -1)
  }, [])

  const handleModalOpen = (type: 'CREATE' | 'UPDATE') => {
    if(type == 'UPDATE') {
      if(selectedRow && selectedIndex > -1) {
        setModalType(type);
        setModalOpen(true)
      }else {
        alert('수정할 정보를 선택해주세요.')
        return;
      }
    }else {
      setModalType(type);
      setModalOpen(true)
    }
  }

  const dispatch = useDispatch();
  const handleReload = () => {
    setModalOpen(false)
    dispatch(clearLocgovInfo());
    setFlag(prev => !prev);
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    const regex2 = /[\-~`!@#$%^&*_+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'rrno' || name == 'brno' ){
      if(isNumber(value)){
        setParams((prev) => ({ ...prev, [name]: value }))  
      }
    }
    // else if(name == 'vonrNm'){
    //   setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex2, '').replaceAll(' ','') }))
    // }
    else if(name == 'vhclNo'){
      setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '').replaceAll(' ','') }))
    }else{
      setParams((prev) => ({ ...prev, [name]: value}))
    }
    setExcelFlag(false)
  }


  const closeHistoryModal = () => {
    setModalOpen2(false);
    setSearchVhclNo('')
  }

  const closeHandleModal = () =>{
    setModalOpen(false)
    dispatch(closeLocgovModal());
    dispatch(closeModalAndClearLocgovInfo());
  }

  return (
    <PageContainer
      title="행정처분승계이력관리"
      description="행정처분승계이력관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="행정처분승계이력관리" items={BCrumb} />
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
              <CtpvSelectAll
                //pValue={params.ctpvCd}
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
              <LocgovSelectAll
                ctpvCd={params.ctpvCd}
                //pValue={params.locgovCd}
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
                placeholder=""
                fullWidth
                name="vhclNo"
                value={params.vhclNo} // 빈 문자열로 초기화
                onChange={handleSearchChange}
                type="text"
                inputProps={{maxLength : 9}}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vonrNm"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrNm"
                fullWidth
                name="vonrNm"
                value={params.vonrNm} // 빈 문자열로 초기화
                onChange={handleSearchChange}
                type="text"
                inputProps={{
                  maxLength: 50
                }}
              />
            </div>
          </div><hr></hr>
          <div className='filter-form'>
          <div className="form-group">
                <CustomFormLabel className="input-label-display">
                  정지일자
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  정지일자 시작
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="searchStDate"
                  value={params.searchStDate}
                  onChange={handleSearchChange}
                  fullWidth
                  inputProps={{max : params.searchEdDate}}
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  정지일자 종료
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="searchEdDate"
                  value={params.searchEdDate}
                  onChange={handleSearchChange}
                  fullWidth
                  inputProps={{min : params.searchStDate}}
                />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-rrno"
              >
                주민등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-rrno"
                placeholder=""
                fullWidth
                name="rrno"
                value={params.rrno}
                onChange={handleSearchChange}
                type="text"
                inputProps={{maxLength : 13}}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                placeholder=""
                fullWidth
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                type="text"
                inputProps={{maxLength : 10}}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" color="primary" type='submit'>
              검색
            </Button>
            <Button variant='contained' color='primary' onClick={() => handleModalOpen('CREATE')}>등록</Button>
            <Button variant='contained' color='primary' onClick={() => handleModalOpen('UPDATE')}>수정</Button>
            <FormDialog
              size={'xl'}
              buttonLabel=""
              remoteFlag={modalOpen}
              title={modalType == 'CREATE' ? "승계이력등록" : '승계이력수정'}
              formLabel={modalType == 'CREATE' ? "등록" : '수정'}
              formId='submit-data'
              //closeHandler={() => setModalOpen(false)}
              closeHandler={() => closeHandleModal()}
              children={
                <ModalContent 
                  data={modalType == 'UPDATE' && selectedRow ? selectedRow : null} 
                  reload={handleReload} 
                  type={modalType}
                />
              }
            />
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
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable}
          paging={true}
          cursor
        />
      </Box>
      {selectedIndex > -1 && selectedRow ? 
        <>
          <DetailDataGrid 
            row={selectedRow as Row}
          />
        </>
      : <></>}  
      <FormDialog 
        remoteFlag={modalOpen2} 
        size={'lg'}
        title={'지급정지이력조회'} 
        submitBtn={false} 
        closeHandler={closeHistoryModal}
        buttonLabel={''}
      >
        <HistoryModalContent 
          vhclNo={searchVhclNo}
        />
      </FormDialog>
      {/* 테이블영역 끝 */}
      {/* <SuccessionInfoModal /> */}
    </PageContainer>
  )
}

export default DataList
