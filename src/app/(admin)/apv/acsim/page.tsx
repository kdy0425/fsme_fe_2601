'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateRange, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { apvAcsimTrHeadCells } from '@/utils/fsms/headCells'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import FormDialog from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import DeleteModalContent from './_components/DeleteModalContent'
import DetailDataGrid from './_components/DetailDataGrid'
import RegisterModalContent from './_components/RegisterModalContent'
import UpdateModalContent from './_components/UpdateModalContent'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '거래정보',
  },
  {
    title: '주유(충전소)소 관리',
  },
  {
    to: '/apv/acsim',
    title: '주유량확인시스템 설치관리',
  },
]

export interface Row {
  aogIdntySysIdSn: number;
  frcsBrno: string;
  shFrcsCdNo: string;
  wrFrcsCdNo: string;
  kbFrcsCdNo: string;
  ssFrcsCdNo: string;
  hdFrcsCdNo: string;
  rprsvNm: string;
  frcsTlphonDddCd: string;
  telno: string;
  telnoFull: string;
  zip: string;
  daddr: string;
  frcsNm: string;
  aplcntMbtlnum: string;
  aogIdntySysInstlDmndYmd: string;
  aogIdntySysSttsCd: string;
  aogIdntySysSttsCdNm: string;
  aogIdntySysInstlYmd: string;
  delYn: string;
  delRsnCd: string;
  delRsnCdNm: string;
  idfrNm: string;
  idntyYmd: string;
  locgovCd: string;
  locgovNm: string;
  trsmYn: string;
  trsmDt: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  chk: string;
  crdcoCd: string;
  frcsCdNo: string;
  ornCmpnyPoleNm: string;
  cstdyLbrctFrcsYn: string;
  bltOltDsgnNmtm: string;
  prcsSeCd: string;
  color: string;
  daddrFull: string;
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
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [registerRemoteFlag, setRegisterRemoteFlag] = useState<boolean>(false);
  const [updateRemoteFlag, setUpdateRemoteFlag] = useState<boolean>(false);
  const [deleteRemoteFlag, setDeleteRemoteFlag] = useState<boolean>(false);

  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태
  
  const dateRange = getDateRange('d', 180)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    frcsBrno: '',
    frcsNm: '',
    rprsvNm: '',
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
    setSelectedIndex(-1);
    setSelectedRow(null);
    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(prev => !prev)
  }, [])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/acsim/tr/getAllAogCnfirmSysInstlMng?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
        `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
        `${params.rprsvNm ? '&rprsvNm=' + params.rprsvNm : ''}` +
        `${params.aogIdntySysSttsCd ? '&aogIdntySysSttsCd=' + params.aogIdntySysSttsCd : ''}` +
        `${params.searchStDate ? '&bgngRegDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&endRegDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        response.data.content.map((res: Row) => {
          res.daddrFull = '(' + res.zip + ') ' + res.daddr;
        })

        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        alert(response.message);
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

  const sendData = async () => {
    try {
      let endpoint: string = `/fsm/apv/acsim/tr/updateSetupComplete`;

      let formData = {
        aogIdntySysIdSn: selectedRow?.aogIdntySysIdSn,
        aogIdntySysInstlYmd: getToday()
      }
      const response = await sendHttpRequest('PUT', endpoint, formData, true, {
        cache: 'no-store'
      })
      if(response && response.resultType == 'success') {
        alert(response.message);
      }else{
        alert(response.message);
      }
    
    }catch(error) {
      console.error("ERROR :: ", error);
    }finally {
      setFlag(prev => !prev)
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

      let endpoint: string = `/fsm/apv/acsim/tr/getExcelAogCnfirmSysInstlMng?` +
      `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
      `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}` +
      `${params.rprsvNm ? '&rprsvNm=' + params.rprsvNm : ''}` +
      `${params.aogIdntySysSttsCd ? '&aogIdntySysSttsCd=' + params.aogIdntySysSttsCd : ''}` +
      `${params.searchStDate ? '&bgngRegDt=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.searchEdDate ? '&endRegDt=' + params.searchEdDate.replaceAll('-', '') : ''}`

      await getExcelFile(endpoint, BCrumb[BCrumb.length-1].title + '_'+getToday()+'.xlsx')
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
    setSelectedRow(row);
    setSelectedIndex(index ?? -1);
  }

  // 페이지 이동 감지 종료 //

  // 검색조건 변경 시 호출되는 함수
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const openRegisterModal = () => {
    setRegisterRemoteFlag(true);
  }

  const openUpdateModal = () => {
    if(selectedIndex > -1 && selectedRow) {
      setUpdateRemoteFlag(true);
    }else{
      alert('선택된 데이터가 없습니다')
    }
  }

  const openDeleteModal = () => {
    if(selectedIndex > -1 && selectedRow) {
      setDeleteRemoteFlag(true);
    }else{
      alert('선택된 데이터가 없습니다')
    }
  }

  const reload = () => {
    setRegisterRemoteFlag(false);
    setUpdateRemoteFlag(false);
    setDeleteRemoteFlag(false);
    setFlag(prev => !prev);
  }
  
  return (
    <PageContainer
      title="주유량확인시스템 설치관리"
      description="주유량확인시스템 설치관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="주유량확인시스템 설치관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsBrno">
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField 
                id="ft-frcsBrno" 
                name='frcsBrno' 
                value={params.frcsBrno} 
                onChange={handleSearchChange} 
                fullWidth 
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsNm">
                가맹점명
              </CustomFormLabel>
              <CustomTextField 
                id="ft-frcsNm" 
                name='frcsNm' 
                value={params.frcsNm} 
                onChange={handleSearchChange} 
                inputProps={{
                  inputMode: 'text',
                }}
                fullWidth 
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-rprsvNm">
                대표자명
              </CustomFormLabel>
              <CustomTextField 
                id="ft-rprsvNm" 
                name='rprsvNm'
                value={params.rprsvNm} 
                onChange={handleSearchChange} 
                inputProps={{
                  inputMode: 'text',
                }}
                fullWidth
              />
            </div>
          </div><hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                등록일자
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">시작일</CustomFormLabel>
              <CustomTextField 
                type="date" 
                id="ft-date-start" 
                name='searchStDate' 
                value={params.searchStDate} 
                onChange={handleSearchChange} 
                inputProps={{max: params.searchEdDate}} 
                fullWidth 
              />
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">종료일</CustomFormLabel>
              <CustomTextField 
                type="date" 
                id="ft-date-end" 
                name='searchEdDate' 
                value={params.searchEdDate} 
                onChange={handleSearchChange} 
                inputProps={{min: params.searchStDate}} 
                fullWidth 
              />
            </div>
            <div className="form-group">
              <CustomFormLabel htmlFor="sch-aogIdntySysSttsCd" className="input-label-display">
                이용구분
              </CustomFormLabel>
              <CommSelect 
                cdGroupNm={'083'} 
                pValue={params.aogIdntySysSttsCd} 
                handleChange={handleSearchChange} 
                pName={'aogIdntySysSttsCd'}
                addText='전체'
                htmlFor={"sch-aogIdntySysSttsCd"}
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
            <Button variant="contained" color="primary" onClick={() => openRegisterModal()}>
              등록
            </Button>
            <FormDialog
              size={'lg'}
              buttonLabel=""
              title="주유량확인시스템등록"
              formLabel='검색'
              formId='search-data'
              remoteFlag={registerRemoteFlag}
              btnSet={
                <>              
                  <Button variant='contained' type='submit' form='register-data'>저장</Button>
                </>
              }
              closeHandler={() => setRegisterRemoteFlag(false)}
              children={
              <RegisterModalContent 
                reloadFn={reload} 
              />}
            />
            <Button variant='contained' onClick={() => openUpdateModal()}>
              수정
            </Button>
            {selectedRow && selectedIndex > -1 ? 
              <FormDialog
                size={'lg'}
                buttonLabel=""
                title="주유량확인시스템수정"
                formLabel='저장'
                formId='update-data'
                remoteFlag={updateRemoteFlag}
                closeHandler={() => setUpdateRemoteFlag(false)}
                children={
                <UpdateModalContent 
                  data={selectedRow}
                  reloadFn={reload}
                />}
              />
              : <></>}
            <Button variant="contained" color="error" onClick={() => openDeleteModal()}>
              삭제
            </Button>
            {selectedRow && selectedIndex > -1 ? 
              <FormDialog
                size={'lg'}
                buttonLabel=""
                title="주유량확인시스템삭제"
                formLabel='저장'
                formId='delete-data'
                remoteFlag={deleteRemoteFlag}
                closeHandler={() => setDeleteRemoteFlag(false)}
                children={
                <DeleteModalContent 
                  data={selectedRow}
                  reloadFn={reload}
                />}
              />
              : <></>}
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
          headCells={apvAcsimTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          cursor
          caption={"주유량확인시스템 설치관리 목록 조회회"}
        />
      </Box>
      {selectedRow && selectedIndex > -1 ? 
      <Box>
        <BlankCard className="contents-card" title="상세정보" buttons={
          selectedRow.aogIdntySysSttsCd === '1' ? [
          {
            label: '설치완료',
            color: 'outlined',
            onClick: () => sendData(),
          },]
          : 
          []}>
          <DetailDataGrid
            row={selectedRow}
          />
        </BlankCard>
      </Box>
      :<></>}
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
