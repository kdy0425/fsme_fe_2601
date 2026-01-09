'use client'
import {
  Box,
  Button
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import FormModal from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { symProgHC } from '@/utils/fsms/headCells'
import { Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '메뉴관리',
  },
  {
    to: '/sym/progrm',
    title: '프로그램관리',
  },
]

export interface Row {
  prgrmCdSn: string; // 프로그램코드 일련번호
  prgrmNm: string; // 프로그램명 
  urlAddr: string; // URL주소
  httpDmndMethNm: string; // HTTP 요청 메소드명
  useYn: string; // 사용여부
  prhibtRsnCn: string | null; // 미사용사유
  useNm: string; // 사용여부명
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
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

  const [selectedRow, setSelectedRow] = useState<Row>();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'CREATE' | 'UPDATE'>('CREATE');

  const [checkedRows, setCheckedRows] = useState<string[]>([]) // 체크 로우 데이터

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, 
  })
  
  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/progrm/cm/getAllProgrm?page=${params.page}&size=${params.size}` +
        `${params.prgrmNm ? '&prgrmNm=' + params.prgrmNm : ''}`;
        

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
        setCheckedRows([]);
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setCheckedRows([]);
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
      setCheckedRows([]);
    } finally {
      setLoading(false)
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
  const handleRowClick = (row: Row, index?: number) => {
    setModalType('UPDATE');
    setSelectedIndex(index ?? -1);
    setSelectedRow(row);

    setModalOpen(true);
  }

  const handleCheckChange = (selected:string[]) => {
    setCheckedRows(selected)
   }

  const deleteProgrm = async () => {

    if (checkedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    try {
      setLoading(true);

      let endpoint: string = `/fsm/sym/progrm/cm/deleteProgrm`;

      const userConfirm = confirm("선택한 프로그램 정보를 삭제하시겠습니까?")

      if(userConfirm) {

      let param: any[] = []
      checkedRows.map((id) => {
        const row = rows[Number(id.replace('tr', ''))]
        param.push({
          prgrmCdSn: row.prgrmCdSn
        })
      })
      const updatedRows = { progrmList: param }

        const response = await sendHttpRequest("DELETE", endpoint, updatedRows, true, {
          'cache': 'no-store'
        })

        if(response && response.resultType === 'success') {
          alert(response.message);
          setFlag(!flag)
          setCheckedRows([]);
        }
      } else {
        return;
      }
    } catch(error) {
      console.error('Error fetching data:', error)
    }
  }

  // 페이지 이동 감지 종료 //
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  
  const createModalOpen = () => {
    setModalType('CREATE');
    setModalOpen(true);
  }

  const reload = () => {
    setModalOpen(false);
    setFlag(!flag)
  }

  return (
    <PageContainer title="프로그램관리" description="프로그램관리">
      {/* breadcrumb */}
      <Breadcrumb title="프로그램관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group" style={{maxWidth: '70%'}}>
              <CustomFormLabel className="input-label-display">
                프로그램명
              </CustomFormLabel>
              <CustomTextField type="text" id="ft-prgrmNm" name="prgrmNm" value={params.prgrmNm} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" onClick={() => fetchData()}>
              검색
            </Button>
            <Button variant="contained" color="primary" onClick={createModalOpen}>
              등록
            </Button>
            <Button variant="contained" color="error" onClick={deleteProgrm}>
              삭제
            </Button>
          </div>
        </Box>
        <FormModal 
          buttonLabel={''}
          submitBtn={false}
          size='xl'
          title={modalType === 'CREATE' ? '프로그램 정보 등록' : '프로그램 정보 수정'} 
          remoteFlag={modalOpen}
          closeHandler={() => setModalOpen(false)}
          btnSet={
            <Button variant='contained' color='primary' type='submit' form='send-data'>저장</Button>
          }
        >
          <ModalContent 
            type={modalType}
            data={selectedRow ?? undefined}
            reload={reload}
          />
        </FormModal>
      </Box>
      {/* 검색영역 끝 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={symProgHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          onCheckChange={handleCheckChange}
          selectedRowIndex={selectedIndex}
         />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
