'use client'
import { Box, Button, FormControlLabel, RadioGroup } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { uniqueId } from 'lodash'
import { HeadCell, Pageable2 } from 'table'
import UserFormModal from './_components/UserFormModal'
import UserInfoModal from './_components/UserInfoModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '권한관리',
  },
  {
    to: '/sym/user',
    title: '사용자관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'lgnId',
    numeric: false,
    disablePadding: false,
    label: '아이디',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '사용자명',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체명',
  },
  {
    id: 'roleNm',
    numeric: false,
    disablePadding: false,
    label: '권한',
  },
  {
    id: 'telno',
    numeric: false,
    disablePadding: false,
    label: '내선번호',
    format: 'telno',
  },
  {
    id: 'lastLgnDt',
    numeric: false,
    disablePadding: false,
    label: '최근접속일시',
    format: 'yyyymmddhh24miss',
  },
  {
    id: 'useYn',
    numeric: false,
    disablePadding: false,
    label: '사용구분',
  },
  {
    id: 'confirmYn',
    numeric: false,
    disablePadding: false,
    label: '처리여부',
  },
]

export interface Row {
  userTsid: string
  lgnId: string
  userNm: string
  mngNo: string
  ctpvCd: string
  ctpvNm: string
  instCd: string
  instNm: string
  deptCd: string
  deptNm: string
  jbgdCd: string
  jbgdNm: string
  zip: string
  part1Addr: string
  part2Addr: string
  telno: string
  fxno: string
  emlAddr: string
  issuDt: string
  userAcntSttsCd: string
  prhibtRsnCn: string
  ahrztKeyNo: string
  regDt: string
  rgtrId: string
  mdfcnDt: string
  mdfrId: string
  tkcgTaskNm: string
  lastLgnDt: string
  subDnEncpt: string
  pswdChgYnCd: string
  ipAddr: string
  aplyBgngYmd: string
  aplyEndYmd: string
  newYn: string
  newPswd: string
  lgnFailNmtm: string
  mbtlnum: string
  smsRcptnYn: string
  locgovNm: string
  userTypeCdList: string
  roleNm: string
  bsCardYn: string
  bsPaperYn: string
  bsInstcYn: string
  txCardYn: string
  txPaperYn: string
  txInstcYn: string
  trCardYn: string
  trPaperYn: string
  trInstcYn: string
  scrapYn: string
  pswd: string
  useYn: string
  confirmYn: string
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

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [modalType, setModalType] = useState<'CREATE' | 'UPDATE'>('CREATE')
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false)
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false)

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
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/user/cm/getAllUser?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
        `${params.confirmYn ? '&confirmYn=' + params.confirmYn : ''}` +
        `${params.userAcntSttsCd ? '&userAcntSttsCd=' + params.userAcntSttsCd : ''}` +
        `${params.useYn ? '&useYn=' + params.useYn : ''}`

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

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size:10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
    setInfoModalOpen(true)
  }

  const handleOpenModal = (type: 'CREATE' | 'UPDATE') => {
    setModalType(type)
    setFormModalOpen(true)
  }

  // 페이지 이동 감지 종료 //
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormReload = () => {
    setFormModalOpen(false)
    setFlag(!flag)
  }

  const handleInfoReload = () => {
    setInfoModalOpen(false)
    setFlag(!flag)
  }

  return (
    <PageContainer title="사용자관리" description="사용자관리">
      {/* breadcrumb */}
      <Breadcrumb title="사용자관리" items={BCrumb} />
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
                시도명
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
                관할관청
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
                htmlFor="ft-car-name"
              >
                담당자명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                name="userNm"
                id="ft-car-name"
                value={params.userNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-car-name"
              >
                아이디
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-car-name"
                name="lgnId"
                value={params.lgnId}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                처리여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="ft-confirmYn-radio"
                name="confirmYn"
                value={params.confirmYn || ''}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={
                    <CustomRadio id="chk_All" name="confirmYn" value="" />
                  }
                  label="전체"
                />
                <FormControlLabel
                  control={
                    <CustomRadio id="chk_Y" name="confirmYn" value="Y" />
                  }
                  label="처리"
                />
                <FormControlLabel
                  control={
                    <CustomRadio id="chk_N" name="confirmYn" value="N" />
                  }
                  label="미처리"
                />
              </RadioGroup>
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-taskSeCd"
              >
                사용구분
              </CustomFormLabel>
              <CommSelect
                addText="전체"
                htmlFor={'sch-taskSeCd'}
                cdGroupNm={'880'}
                pName="userAcntSttsCd"
                pValue={params.userAcntSttsCd}
                handleChange={handleSearchChange}
              />
            </div>
            <div className="form-group"></div>
            <div className="form-group"></div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal('CREATE')}
            >
              사용자등록
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
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          cursor
        />
      </Box>
      <UserFormModal
        key={uniqueId()}
        remoteFlag={formModalOpen}
        type={'CREATE'}
        title={'사용자 등록'}
        row={null}
        closeHandler={() => setFormModalOpen(false)}
        reload={handleFormReload}
      />
      <UserInfoModal
        key={selectedRow?.lgnId}
        remoteFlag={infoModalOpen}
        title={'사용자 정보'}
        row={selectedRow}
        closeHandler={() => setInfoModalOpen(false)}
        reload={handleInfoReload}
      />
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
