'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { BlankCard, Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelectAll,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
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
    title: '권한관리',
  },
  {
    to: '/sym/ru',
    title: '역할별 사용자설정',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'roleCd',
    numeric: false,
    disablePadding: false,
    label: '역할코드',
  },
  {
    id: 'roleNm',
    numeric: false,
    disablePadding: false,
    label: '역할명',
  },
  {
    id: 'roleSeNm',
    numeric: false,
    disablePadding: false,
    label: '역할구분',
  },
  {
    id: 'userTypeCd',
    numeric: false,
    disablePadding: false,
    label: '사용자유형코드',
  },
  {
    id: 'typeNm',
    numeric: false,
    disablePadding: false,
    label: '사용자유형명',
  },
  {
    id: 'useNm',
    numeric: false,
    disablePadding: false,
    label: '사용여부',
  },
]

const headCells2: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '선택',
    format: 'checkbox',
  },
  {
    id: 'ctpvNm',
    numeric: false,
    disablePadding: false,
    label: '시도명',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '시군구명',
  },
  {
    id: 'userNm',
    numeric: false,
    disablePadding: false,
    label: '사용자명',
  },
  {
    id: 'lgnId',
    numeric: false,
    disablePadding: false,
    label: '사용자ID',
  },
]

export interface Row {
  roleCd: string
  roleNm: string
  roleSeCd: string
  roleExpln: string
  useYn: string
  prhibtRsnCn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  userTypeCd: string
  typeNm: string
  roleSeNm: string
  useNm: string
}

export interface UserRow {
  roleCd: string
  roleNm: string
  roleSeCd: string
  roleExpln: string
  userTypeCd: string
  typeNm: string
  lgnId: string
  userNm: string
  ctpvNm: string
  locgovNm: string
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
  const [userRows, setUserRows] = useState<UserRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [totalUserRows, setTotalUserRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loading2, setLoading2] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [checkedItems, setCheckedItems] = useState<UserRow[]>([])

  const [modalOpen, setModalOpen] = useState<boolean>(false)

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

  const [params2, setParams2] = useState<listSearchObj>({
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

  const [pageable2, setPageable2] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.roleNm && params.typeNm) {
      setSelectedRow(undefined)
      setSelectedIndex(-1)
      setCheckedItems([])
      setPageable2({
        pageNumber: 1, // 페이지 번호는 1부터 시작
        pageSize: 10, // 기본 페이지 사이즈 설정
        totalPages: 1,
      })
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
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/ru/cm/getAllRoleUserType?page=${params.page}&size=${params.size}` +
        `${params.roleNm ? '&roleNm=' + params.roleNm : ''}` +
        `${params.typeNm ? '&typeNm=' + params.typeNm : ''}`

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

  // 승인된 사용자 조회
  const fetchUserData = async (
    page: number,
    size: number,
    userTypeCd: string,
  ) => {
    setLoading2(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        // `/fsm/sym/ru/cm/getAllRoleUser?page=${params2.page - 1}&size=${params2.size}` +
        `/fsm/sym/ru/cm/getAllRoleUser?page=${page}&size=${size}` +
        `${userTypeCd ? '&userTypeCd=' + userTypeCd : ''}` +
        `${params2.ctpvCd ? '&ctpvCd=' + params2.ctpvCd : ''}` +
        `${params2.locgovCd ? '&locgovCd=' + params2.locgovCd : ''}` +
        `${params2.userNm ? '&userNm=' + params2.userNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setUserRows(response.data.content)
        setTotalUserRows(response.data.totalElements)
        setPageable2({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setUserRows([])
        setTotalUserRows(0)
        setPageable2({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setUserRows([])
      setTotalUserRows(0)
      setPageable2({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading2(false)
    }
  }

  // 역할별 사용자정보 삭제
  const deleteUserData = async () => {
    try {
      if (checkedItems.length === 0) {
        alert('삭제할 사용자를 선택해주세요.')
        return
      }

      const userConfirm = confirm(
        '선택한 사용자를 해당 역할에서 삭제하시겠습니까?',
      )

      if (!userConfirm) {
        return
      }

      let endpoint: string = `/fsm/sym/ru/cm/deleteRoleUser`

      let userArr = checkedItems.map((item) => {
        return {
          lgnId: item.lgnId,
          userTypeCd: item.userTypeCd,
        }
      })

      let formData = {
        roleUserList: userArr,
      }

      const response = await sendHttpRequest(
        'DELETE',
        endpoint,
        formData,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success' && response.data) {
        alert(response.message)
        fetchUserData(1, params2.size, selectedRow?.userTypeCd ?? '')
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()

    if (!params.roleNm) {
      alert('역할명을 입력하세요.')
      return
    }

    if (!params.typeNm) {
      alert('사용자유형명을 입력하세요.')
      return
    }

    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
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

  const handlePaginationModelChange2 = (page: number, pageSize: number) => {
    setParams2((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    fetchUserData(page, pageSize, selectedRow?.userTypeCd ?? '')
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setCheckedItems([])
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)

    fetchUserData(1, params2.size, row.userTypeCd)
  }

  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchChange2 = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams2((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckChange = (selected: string[]) => {
    let checkedRows: UserRow[] = []

    selected.map((item) => {
      let index: number = Number(item.replace('tr', ''))
      checkedRows.push(userRows[index])
    })

    setCheckedItems(checkedRows)
  }

  const reload = () => {
    setModalOpen(false)
    setFlag(!flag)
  }

  useEffect(() => {
    console.log('checkedItems:', checkedItems)
  }, [checkedItems])

  const openRegisterModal = () => {
    if (!selectedRow) {
      alert('추가할 역할을 선택해주세요.')
      return
    }

    setModalOpen(true)
  }

  return (
    <PageContainer title="역할별 사용자설정" description="역할별 사용자설정">
      {/* breadcrumb */}
      <Breadcrumb title="역할별 사용자설정" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-role-name"
              >
                역할명
              </CustomFormLabel>
              <CustomTextField
                name="roleNm"
                id="ft-role-name"
                value={params.roleNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-role-type-name"
              >
                사용자유형명
              </CustomFormLabel>
              <CustomTextField
                name="typeNm"
                id="ft-role-type-name"
                value={params.typeNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                시도명
              </CustomFormLabel>
              <CtpvSelectAll
                pName="ctpvCd"
                htmlFor={'sch-ctpv'}
                pValue={params2.ctpvCd}
                handleChange={handleSearchChange2}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-locgov"
              >
                관할관청
              </CustomFormLabel>
              <LocgovSelectAll
                pName="locgovCd"
                pValue={params2.locgovCd}
                ctpvCd={params2.ctpvCd}
                handleChange={handleSearchChange2}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-car-name"
              >
                사용자명
              </CustomFormLabel>
              <CustomTextField
                name="userNm"
                id="ft-car-name"
                value={params2.userNm}
                onChange={handleSearchChange2}
                fullWidth
              />
            </div>
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
              onClick={openRegisterModal}
            >
              추가
            </Button>
            <Button variant="contained" color="error" onClick={deleteUserData}>
              삭제
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
          selectedRowIndex={selectedIndex}
          cursor
        />
      </Box>

      {selectedRow && selectedIndex > -1 ? (
        <>
          <BlankCard title="허가된 사용자 목록">
            <Box>
              <TableDataGrid
                headCells={headCells2} // 테이블 헤더 값
                rows={userRows} // 목록 데이터
                totalRows={totalUserRows} // 총 로우 수
                loading={loading2} // 로딩여부
                onPaginationModelChange={handlePaginationModelChange2} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={pageable2} // 현재 페이지 / 사이즈 정보
                onCheckChange={handleCheckChange}
              />
            </Box>
          </BlankCard>
          <FormModal
            buttonLabel={''}
            title={'사용자설정'}
            size="lg"
            remoteFlag={modalOpen}
            closeHandler={() => setModalOpen(false)}
            submitBtn={false}
            btnSet={
              <>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  form="search-user"
                >
                  검색
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  form="register-user"
                >
                  저장
                </Button>
              </>
            }
          >
            <ModalContent
              userTypeCd={selectedRow.userTypeCd}
              typeNm={selectedRow.typeNm}
              reloadFn={reload}
            />
          </FormModal>
        </>
      ) : (
        <></>
      )}

      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
