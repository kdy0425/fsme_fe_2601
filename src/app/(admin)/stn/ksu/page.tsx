'use client'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryParameter, toQueryString } from '@/utils/fsms/utils'
import { getUserInfo } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'

import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { getExcelFile } from '@/utils/fsms/common/comm'
import Buttons from './_components/Buttons'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { stnksuheadCells } from '@/utils/fsms/headCells'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '보조금지급시행기준',
  },
  {
    to: '/stn/ksu',
    title: '유종별 보조금단가관리',
  },
]

export interface Row {
  brno?: string // 사업자등록번호
  lcnsTpbizCd?: string // 면허업종코드
  lcnsTpbizNm?: string // 면허업종명
  koiCd?: string // 유종코드
  koiNm?: string // 유종명
  aplcnYmd?: string // 고시기준일
  oilUntprc?: string // 단가
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  aplcnYmd: string
  searchStDate: string
  searchEdDate: string
  lcnsTpbizCd : string
  koiCd : string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const DataList = () => {

  const userInfo = getUserInfo();
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [rowIndex, setRowIndex] = useState<number>(-1)

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [aplcnYmdCode, setAplcnYmdCode] = useState<SelectItem[]>([]) // 관할관청 코드

  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  //선택된 행

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    aplcnYmd: '',
    lcnsTpbizCd : '',
    koiCd : '',
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })
  //

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    fetchData()
    fetchAplcnYmd()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)

    // const dateRange = getDateRange('d', 30)
    // let startDate = dateRange.startDate
    setParams((prev) => ({
      ...prev,
      //searchStDate: startDate,
    }))
  }, [])

  // 저장 삭제 수정시 고시기준일 및 재조회
  const reload = (type?: 'reload') => {
    if (type === 'reload') {
      fetchAplcnYmd()
    }
    handleAdvancedSearch()
  }

  // 조회클릭시
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setRowIndex(index ?? -1)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRow(null)
    setRowIndex(-1)
    setExcelFlag(true)
    setLoading(true)
    try {
      let endpoint: string =
        `/fsm/stn/ksu/cm/getAllKoiSbsidyUntpc?page=${params.page}&size=${params.size}` +
        `${params.lcnsTpbizCd ? '&lcnsTpbizCd=' + params.lcnsTpbizCd : ''}` +
        `${params.koiCd ? '&koiCd=' + params.koiCd : ''}` +
        `${params.aplcnYmd ? '&aplcnYmd=' + params.aplcnYmd.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        handleRowClick(response.data.content[0], 0)
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

  // Fetch를 통해 데이터 갱신
  const fetchAplcnYmd = async () => {
    setLoading(true)
    try {
      let endpoint: string = `/fsm/stn/ksu/cm/getAllAplcnYmd?`

      let aplcnYmd: SelectItem[] = [
        {
          label: '전체',
          value: '',
        },
      ]
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        response.data.map((code: any) => {
          let item: SelectItem = {
            label: code['aplcnYmdHyp'],
            value: code['aplcnYmd'],
          }
          aplcnYmd.push(item)
        })
        setAplcnYmdCode(aplcnYmd)
      } else {
        setAplcnYmdCode(aplcnYmd)
        alert('고시기준일이 없습니다.')
      }
    } catch (error) {
      alert('고시기준일이 없습니다.')
    } finally {
    }
  }

  //엑셀 다운르도
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

      const searchObj = {
        ...params,
        strRcptYmd: params.aplcnYmd.replaceAll('-', ''),
      }

      const endpoint: string =
        '/fsm/stn/ksu/cm/getExcelKoiSbsidyUntpc' + toQueryParameter(searchObj)
      await  getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
  
    setParams((prev) => {
      // 기존 값과 새 값이 다를 경우에만 setExcelFlag(false) 호출
      if (prev[name as keyof listSearchObj] !== value) {
        setExcelFlag(false);
      }
      return { ...prev, page: 1, [name]: value };
    });
  };

  // 데이터 삭제 API 요청  
  const handleDelete = async () => {
    
    const crtrAplcnYmd = selectedRow?.aplcnYmd?.replaceAll('-', '');

    if (userInfo.roles[0] != 'ADMIN') {
      alert('관리자권한만 사용 가능합니다.');
      return;
    }

    if (!selectedRow) {
      alert('선택된 데이터가 없습니다.');
      return;
    }

    if (Number(crtrAplcnYmd) <= Number(getToday())) {
      alert('고시기준일이 금일 이후일 경우에만 삭제 가능합니다.');
      return;
    }

    if (confirm('삭제 하시겠습니까?')) {

      setLoadingBackdrop(true)

      try {
        const body = {          
          lcnsTpbizCd: selectedRow?.lcnsTpbizCd,
          koiCd: selectedRow?.koiCd,
          aplcnYmd: selectedRow?.aplcnYmd?.replaceAll('-',''),
        }
        const endpoint = '/fsm/stn/ksu/cm/deleteKoiSbsidyUntpc';        
        const response = await sendHttpRequest('DELETE', endpoint, body, true, { cache: 'no-store' })
        
        if (response && response.resultType === 'success' ) {
          alert('삭제되었습니다.');
          reload('reload');
        } else {
          alert(response.message);
          reload('reload');
        }
      } catch (error) {
        console.log('Error modifying data:', error);
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <PageContainer
      title="유종별 보조금단가관리"
      description="유종별 보조금단가관리"
    >
      {/* breadcrumb */}
      <Breadcrumb title="유종별 보조금단가관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                고시기준일
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-aplcnYmd"
              >
                고시기준일
              </CustomFormLabel>
              <select
                id="ft-aplcnYmd"
                className="custom-default-select"
                name="aplcnYmd"
                value={params.aplcnYmd}
                onChange={handleSearchChange}
                style={{ width: '100%' }}
              >
                {aplcnYmdCode.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-lcnsTpbizCd"
              >
                면허업종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="499"
                pValue={params.lcnsTpbizCd ?? ''}
                handleChange={handleSearchChange}
                pName="lcnsTpbizCd"
                htmlFor={'sch-lcnsTpbizCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-koiCd"
              >
                유종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="977"
                pValue={params.koiCd ?? ''}
                handleChange={handleSearchChange}
                pName="koiCd"
                htmlFor={'sch-koiCd'}
                addText="전체"
              />
            </div>
          </div>
        </Box>
        <LoadingBackdrop open={loadingBackdrop} />
        <Buttons
          reload={reload}
          excelDownload={excelDownload}
          handleDelete={handleDelete}
          rows={rows}
        />
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnksuheadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 페이지 정보
          selectedRowIndex={rowIndex}
          paging={true}
          cursor={true}
          caption={"유종별 보조금단가관리 목록 조회"}
        />
      </Box>

      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
