'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { apvPsimPosTrHeadCells } from '@/utils/fsms/headCells'

// components
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import DetailDataGrid from './_components/DetailDataGrid'
import SearchModal from './_components/SearchModal'
import FormModal from '@/app/components/popup/FormDialog'
import RegisterModalForm from './_components/ModalContent'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'
import { SelectItem } from 'select'

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
    to: '/apv/psim',
    title: 'POS시스템설치 관리',
  },
]


export interface Row {
  frcsId: string;
  frcsBrno: string;
  frcsNm: string;
  daddr: string;
  instlYn: string;
  posCoNm: string;
  posNm: string;
  instlYmd: string;
  locgovNm: string;
  locgovCd: string;
  xcrd: string;
  ycrd: string;
  ornCmpnyNm: string;
  ornCmpnyNmS: string;
  frcsTelnoCn: string;
  salsSeNm: string;
  stopBgngYmd: string;
  stopEndYmd: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  authType: string;
  resType: string;
  resList: Row[];
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  frcsBrno: string
  frcsNm: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const salsSeNmItems: SelectItem[] = [
  {
    value: '',
    label: '전체'
  },
  {
    value: '영업',
    label: '영업'
  },
  {
    value: '휴업',
    label: '휴업'
  },
  {
    value: '영업취소',
    label: '영업취소'
  },
  {
    value: '영업정지',
    label: '영업정지'
  },
  {
    value: '폐업',
    label: '폐업'
  },
  {
    value: '확인불가',
    label: '확인불가'
  },
]

const instlYnItems: SelectItem[] = [
  {
    value: '',
    label: '전체'
  },
  {
    value: 'Y',
    label: '설치'
  },
  {
    value: 'N',
    label: '미설치'
  },
]

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [detailData, setDetailData] = useState<Row | null>();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [updateRemoteFlag, setUpdateRemoteFlag] = useState<boolean>(false);
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
    frcsNm: '',
    frcsBrno: '',
    instlYn: '',
    salsSeNm: '영업',
    daddr: '',
  })
  
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  
  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if(flag != null){
      setRows([])
      setDetailData(null)
      setSelectedIndex(-1)
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    //setFlag(prev => !prev)
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      console.log(params.locgovCd);
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/psim/tr/getAllPosSysInstlMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm.replaceAll(' ','') : ''}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
        `${params.instlYn ? '&instlYn=' + params.instlYn : ''}` +
        `${params.salsSeNm ? '&salsSeNm=' + params.salsSeNm : ''}` +
        `${params.daddr ? '&daddr=' + params.daddr : ''}`

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
          totalPages:response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        alert(response.message);
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1
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
        totalPages: 1
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
      `/fsm/apv/psim/tr/getExcelPosSysInstlMng?` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
      `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
      `${params.instlYn ? '&instlYn=' + params.instlYn : ''}` +
      `${params.salsSeNm ? '&salsSeNm=' + params.salsSeNm : ''}` +
      `${params.daddr ? '&daddr=' + params.daddr : ''}`

      await getExcelFile(endpoint, BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx')
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
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedIndex(index?? -1);
    setDetailData(row);
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const openUpdateModal = () => {
    if(selectedIndex > -1 && detailData) {
      setUpdateRemoteFlag(true);
    }else{
      alert('선택된 데이터가 없습니다')
    }
  }

  const reload = () => {
    setUpdateRemoteFlag(false);
    setFlag(prev => !prev);
  }

  return (
    <PageContainer title="POS시스템설치 관리" description="POS시스템설치 관리">
      {/* breadcrumb */}
      <Breadcrumb title="POS시스템설치 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-ctpv">
                <span className="required-text">*</span>시도명
              </CustomFormLabel>
              <CtpvSelect
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="sch-locgov">
                <span className="required-text" >*</span>관할관청
              </CustomFormLabel>              
              <LocgovSelect
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsNm">
                가맹점명
              </CustomFormLabel>
              <CustomTextField id="ft-frcsNm" name="frcsNm" value={params.frcsNm} onChange={handleSearchChange} fullWidth/>
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsBrno">
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsBrno" name="frcsBrno" value={params.frcsBrno} onChange={handleSearchChange} fullWidth/>
            </div>
          </div>

          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-select-03">
                처리상태
              </CustomFormLabel>
              <select
                id="ft-select-03"
                className="custom-default-select"
                name="instlYn"
                value={params.instlYn}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {instlYnItems.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-select-04">
                영업여부
              </CustomFormLabel>
              <select
                id="ft-select-04"
                className="custom-default-select"
                name="salsSeNm"
                value={params.salsSeNm}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {salsSeNmItems.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-daddr">
                주소
              </CustomFormLabel>
              <CustomTextField id="ft-daddr" name="daddr" value={params.daddr} onChange={handleSearchChange} fullWidth/>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <SearchModal
              size={'lg'}
              buttonLabel="등록"
              formLabel='검색'
              formId='frcs-search'
              title="POS시스템설치확인"
              reloadFn={reload}
            />
            <Button variant='contained' onClick={() => openUpdateModal()}>
              수정
            </Button>
            {detailData && selectedIndex > -1 ? 
              <FormModal 
                size={'lg'}
                buttonLabel=""
                title={'POS시스템설치수정'} 
                formId='send-posdata'
                formLabel='저장'
                remoteFlag={updateRemoteFlag}
                closeHandler={() => setUpdateRemoteFlag(false)}
                children={<RegisterModalForm 
                  formType='PUT'
                  frcsBrno={detailData?.frcsBrno ?? ''}
                  frcsId={detailData?.frcsId}
                  data={detailData ?? null}
                  reloadFn={reload}
                />}                
              /> 
              : <></>}
            <Button variant="contained" onClick={() => excelDownload()} color="success">
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box sx={{mb:3}}>
        <TableDataGrid
          headCells={apvPsimPosTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor
          caption={"POS시스템설치 관리 목록 조회"}
        />
      </Box>
      {selectedIndex > -1 && detailData ? 
      <Box>
        <DetailDataGrid
          row={detailData?? null}
        />
      </Box>
      : <></>}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
