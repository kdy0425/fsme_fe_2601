'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import CreateModalContent from './_components/CreateModalCotent'
import DetailModalContent from './_components/DetailModalContent'

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
    to: '/sym/role',
    title: '역할(Role) 관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'check',
    numeric: false,
    disablePadding: false,
    label: '선택',
    format: 'checkbox',
  },
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

  const [checkedItems, setCheckedItems] = useState<Row[]>([])

  const [selectedRow, setSelectedRow] = useState<Row | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(true)
  const [regType, setRegType] = useState<'DETAIL' | 'UPDATE'>('DETAIL')

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
    totalPages: 1, // 정렬 기준
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.roleNm || params.typeNm) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/role/cm/getAllRoleUserType?page=${params.page}&size=${params.size}` +
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

  const deleteData = async () => {
    try {
      let endpoint: string = `/fsm/sym/role/cm/deleteRole`

      let roleArr: { roleCd: string; userTypeCd: string }[] = []

      checkedItems.map((item) => {
        let obj = {
          roleCd: item.roleCd,
          userTypeCd: item.userTypeCd,
        }
        roleArr.push(obj)
      })

      if (!(roleArr.length > 0)) {
        alert('선택된 목록이 없습니다.')
        return
      }

      let userConfirm = confirm('선택된 건을 탈락 처리하시겠습니까?')

      if (userConfirm) {
        const formData = {
          roleList: roleArr,
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

        if (response && response.resultType == 'success') {
          alert(response.message)
          setFlag(!flag)
        }
      } else {
        return
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

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row) => {
    setSelectedRow(row)
    setDetailModalOpen(true)
  }
  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckChange = (selected: string[]) => {
    let selectedRows: Row[] = []

    selected.map((item) => {
      let index: number = Number(item.replace('tr', ''))
      selectedRows.push(rows[index])
    })

    setCheckedItems(selectedRows)
  }

  const handleCreateReload = () => {
    setCreateModalOpen(false)

    setFlag(!flag)
  }

  const handleUpdateReload = () => {
    setRegType('DETAIL')
    setDetailModalOpen(false)
    setFlag(!flag)
  }

  const handleChangeRegType = (
    event: React.FormEvent,
    regType: 'DETAIL' | 'UPDATE',
  ) => {
    event.preventDefault()

    setRegType(regType)
  }

  return (
    <PageContainer title="역할(Role) 관리" description="역할(Role) 관리">
      {/* breadcrumb */}
      <Breadcrumb title="역할(Role) 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-role-name"
                required
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
                required
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
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateModalOpen(true)}
            >
              등록
            </Button>
            <Button variant="contained" color="error" onClick={deleteData}>
              삭제
            </Button>
          </div>
        </Box>
        <FormModal
          remoteFlag={createModalOpen}
          closeHandler={() => setCreateModalOpen(false)}
          buttonLabel={''}
          title={'역할신규등록'}
          size={'xl'}
          submitBtn={false}
          btnSet={
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="create-role"
            >
              저장
            </Button>
          }
        >
          <CreateModalContent reload={handleCreateReload} />
        </FormModal>

        {selectedRow && (
          <FormModal
            remoteFlag={detailModalOpen}
            closeHandler={() => setDetailModalOpen(false)}
            buttonLabel={''}
            title={regType === 'DETAIL' ? '역할상세조회' : '역할수정'}
            size={'xl'}
            submitBtn={false}
            btnSet={
              regType === 'DETAIL' ? (
                <>
                  <Button
                    variant="contained"
                    onClick={(e) => handleChangeRegType(e, 'UPDATE')}
                  >
                    수정
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    form="update-role"
                  >
                    저장
                  </Button>
                  <Button
                    variant="contained"
                    onClick={(e) => handleChangeRegType(e, 'DETAIL')}
                  >
                    뒤로
                  </Button>
                </>
              )
            }
          >
            <DetailModalContent
              reload={handleUpdateReload}
              userTypeCd={selectedRow.userTypeCd}
              roleCd={selectedRow.roleCd}
              regType={regType}
            />
          </FormModal>
        )}
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
          cursor
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
