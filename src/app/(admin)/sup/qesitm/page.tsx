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
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

// types
import SurveyModal from '@/app/components/popup/SurveyModal'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { useDispatch } from '@/store/hooks'
import { openServeyModal, setSurveyInfo } from '@/store/popup/SurveySlice'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { getDateRange } from '@/utils/fsms/common/comm'
import { HeadCell, Pageable2 } from 'table'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '설문조사',
  },
  {
    to: '/sup/qesitm',
    title: '문항관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '선택',
    format: 'checkbox'
  },
  {
    id: 'srvyCycl',
    numeric: false,
    disablePadding: false,
    label: '회차',
    format: 'number',
    align: 'td-right'
  },
  {
    id: 'srvyTtl',
    numeric: false,
    disablePadding: false,
    label: '설문제목',
  },
  {
    id: 'srvyBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '설문시작일자',
    format: 'yyyymmdd'
  },
  {
    id: 'srvyEndYmd',
    numeric: false,
    disablePadding: false,
    label: '설문종료일자',
    format: 'yyyymmdd'
  },
  {
    id: 'srvyGdMsgCn',
    numeric: false,
    disablePadding: false,
    label: '설문안내메시지',
    align: 'td-left'
  },
  {
    id: 'srvyTrgtNmprCnt',
    numeric: false,
    disablePadding: false,
    label: '설문대상인원',
    format: 'number',
    align: 'td-right'
  },
]

export interface Row {
  srvyCycl: number; // 회차
  srvyTtl: string; // 제목
  srvyGdMsgCn: string; // 설문안내메시지내용
  srvyBgngYmd: string; // 설문시작일자
  srvyEndYmd: string; // 설문종료일자
  srvyTrgtNmprCnt: number; // 설문대상인원수
  resList1: any[];
  resList2: any[];
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

  const dispatch = useDispatch();

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row | null>(null)

  const dateRange = getDateRange('d', 30)

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? dateRange.startDate, // 시작일
    searchEdDate: allParams.searchEdDate ?? dateRange.endDate, // 종료일
    // searchStDate: allParams.searchStDate ?? '', // 시작일
    // searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    setSelectedRow(null)
    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(prev => !prev)
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
        `/fsm/sup/qesitm/getAllQesitm?page=${params.page}&size=${params.size}` +
        `${params.searchStDate ? '&srvyBgngYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
        `${params.searchEdDate ? '&srvyEndYmd=' + params.searchEdDate.replaceAll('-', '') : ''}` +
        `${params.srvyTtl ? '&srvyTtl=' + params.srvyTtl : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
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

  const copySrvy = async () => {
    try {
      if(!selectedRow){
        alert('복사할 설문항목을 체크해주세요.');
        return;
      }

      setLoadingBackdrop(true);
      let endpoint:string = `/fsm/sup/qesitm/copyQesitm`

      let body = {
        srvyCycl: selectedRow?.srvyCycl
      }

      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
      }else {
        alert(response.message);
      }

    }catch(error) {
      console.error("Error ::: ", error);
    }finally {
      setLoadingBackdrop(false);
      setFlag(prev => !prev)
    }
  }

  const deleteData = async () => {
    try {
      if(!selectedRow){
        alert('삭제할 설문항목을 체크해주세요.');
        return;
      }

      setLoadingBackdrop(true);
      let endpoint:string = `/fsm/sup/qesitm/deleteQesitm`

      let body = {
        srvyCycl: selectedRow?.srvyCycl
      }

      const response = await sendHttpRequest('DELETE', endpoint, body, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
        fetchData()
      }else {
        alert(response.message);
      }

    }catch(error) {
      console.error('delete error ::: ', error);
    }finally {
      setLoadingBackdrop(false);
      setFlag(prev => !prev)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
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
  const handleRowClick = (row: Row) => {
    router.push(`/sup/qesitm/update/${row.srvyCycl}`) // 조회 페이지 경로
  }

  // 글쓰기 페이지로 이동하는 함수
  const handleWriteClick = () => {
    router.push(`/sup/qesitm/create`)
  }

  const handleCheckChange = (selected:string[]) => {
    if(selected && selected.length > 0) {
      let index: number = Number(selected[0].replace('tr', ''));
    
      console.log(index);
      
      setSelectedRow(rows[index]);
    }else {
      setSelectedRow(null);
    }
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const openPreview = () => {
    if(selectedRow !== null) {
      dispatch(setSurveyInfo(selectedRow.srvyCycl));
      dispatch(openServeyModal());
    }else {
      alert('미리보기할 설문항목을 체크해주세요.')
    }
  }

  const deleteItem = async (event: React.FormEvent) => {
    event.preventDefault();

    if(!selectedRow){
      alert('삭제할 설문항목을 체크해주세요.');
      return;
    }

    const userConfirm = confirm('선택한 설문항목을 삭제하시겠습니까?');
    if(!userConfirm) return;

    await deleteData();
    setFlag(prev => !prev);
  }

  const copyItem = async (event: React.FormEvent) => {
    event.preventDefault();

    if(!selectedRow){
      alert('복사할 설문항목을 체크해주세요.');
      return;
    }

    await copySrvy();
  }

  return (
    <PageContainer title="문항관리" description="문항관리">
      {/* breadcrumb */}
      <Breadcrumb title="문항관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                설문조사기간
              </CustomFormLabel>
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">
                시작일
              </CustomFormLabel>
              <CustomTextField type="date" id="ft-date-start" name='searchStDate' value={params.searchStDate} onChange={handleSearchChange} fullWidth />
              <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">
                종료일
              </CustomFormLabel>
              <CustomTextField type="date" id="ft-date-end" name='searchEdDate' value={params.searchEdDate} onChange={handleSearchChange} fullWidth />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-srvyTtl" required>
                설문제목
              </CustomFormLabel>
              <CustomTextField id="ft-srvyTtl" name='srvyTtl' value={params.srvyTtl} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type='submit'>
              검색
            </Button>
            <Button variant="contained" color="primary" onClick={handleWriteClick}>
              등록
            </Button>
            <Button variant="contained" color="primary" onClick={copyItem}>
              복사
            </Button>
            <Button variant="contained" color="error" onClick={deleteItem}>
              삭제
            </Button>
            <Button variant="contained" color="primary" onClick={() => openPreview()}>
              미리보기
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
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          onCheckChange={handleCheckChange}
          oneCheck
          cursor
        />
      </Box>
      <SurveyModal />
      {/* 테이블영역 끝 */}

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList
