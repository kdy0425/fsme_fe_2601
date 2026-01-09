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
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import RemoveIcon from '@mui/icons-material/Remove'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import { HeadCell, Pageable2 } from 'table'
import { Menu, MenuItem } from '../menu/page'

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
    to: '/sym/ra',
    title: '역할별 권한관리',
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
  {
    id: 'btn',
    numeric: false,
    disablePadding: false,
    label: '권한매핑',
    format: 'button',
    button: {
      label: '권한매핑',
      color: 'primary',
      variant: 'contained',
      onClick: (row: Row) => {},
    },
  },
]

export interface Row {
  roleCd: string
  roleNm: string
  roleSeCd: string
  roleExpln: string
  useYn: string
  prhibtRsnCn: string
  userTypeCd: string
  typeNm: string
  roleSeNm: string
  useNm: string
}

interface AuthMenu {
  menuTsid: string //메뉴ID
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
    {
      id: 'btn',
      numeric: false,
      disablePadding: false,
      label: '',
      format: 'button',
      button: {
        label: '권한매핑',
        color: 'primary',
        variant: 'contained',
        onClick: (row: Row) => {
          openMappingModal(row)
        },
      },
    },
  ]

  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [menuItem, setMenuItem] = useState<MenuItem[]>([]) // 메뉴 데이터를 Tree구조로 변환

  const [checkedItems, setCheckedItems] = useState<AuthMenu[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row>()

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
        `/fsm/sym/ra/cm/getAllRoleUserType?page=${params.page}&size=${params.size}` +
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

  // 사용자 권한 가져오기
  const getAuthItems = async (userTypeCd: string) => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sym/ra/cm/getAllFsmMenu?&userTypeCd=${userTypeCd}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        console.log('RESPONSE ::: ', response.data)

        setMenuItem(
          response.data.map((menu: Menu) => convertRowToMenuitemsType(menu)),
        )

        let checkedItems: AuthMenu[] = []

        let MenuDepth1: MenuItem[] = response.data.filter(
          (item: MenuItem) => item.useYn === 'Y',
        )

        let MenuDepth2: MenuItem[] = response.data
          .map((item: MenuItem) => item.children)
          .flat()
          .filter((item: MenuItem) => item.useYn === 'Y') // 2depth 체크 리스트

        let MenuDepth3: MenuItem[] = response.data
          .map((item: MenuItem) => item.children)
          .flat()
          .map((item: MenuItem) => item.children)
          .flat()
          .filter((item: MenuItem) => item.useYn === 'Y') // 3depth 체크 리스트

        let MenuDepth4: MenuItem[] = response.data
          .map((item: MenuItem) => item.children)
          .flat()
          .map((item: MenuItem) => item.children)
          .flat()
          .map((item: MenuItem) => item.children)
          .flat()
          .filter((item: MenuItem) => item.useYn === 'Y') // 4depth 체크 리스트

        MenuDepth1.forEach((item) => {
          checkedItems.push({ menuTsid: item.menuTsid ?? '' })
        })

        MenuDepth2.forEach((item) => {
          checkedItems.push({ menuTsid: item.menuTsid ?? '' })
        })

        MenuDepth3.forEach((item) => {
          checkedItems.push({ menuTsid: item.menuTsid ?? '' })
        })

        MenuDepth4.forEach((item) => {
          checkedItems.push({ menuTsid: item.menuTsid ?? '' })
        })

        console.log('CHECKED ITEMS :: ', checkedItems)

        setCheckedItems(checkedItems)
      } else {
        // 데이터가 없거나 실패
        console.error('No Auth data found or request failed')
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  // 사용자 메뉴정보 매핑
  const saveAuthItems = async () => {
    try {
      let endpoint: string = `/fsm/sym/ra/cm/createRoleAuthor`

      const formData = {
        userTypeCd: selectedRow?.userTypeCd,
        roleAuthorList: checkedItems,
      }

      const response = await sendHttpRequest('POST', endpoint, formData, true, {
        cache: 'no-store',
      })

      if (response && response.resultType == 'success') {
        alert(response.message)
        closeMappingModal()
      }
    } catch (error) {
      console.error('ERROR :: ', error)
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
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(!flag)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectMenu = (
    e: React.ChangeEvent<HTMLInputElement>,
    menu: MenuItem,
  ) => {
    const { checked } = e.target

    let authMenuArr: AuthMenu[] = []

    if (menu.hasChildren && menu.children && menu.children.length > 0) {
      if (checked) {
        authMenuArr = [
          ...checkedItems,
          { menuTsid: menu.menuTsid ?? '' },
          ...menu.children.map((item) => ({ menuTsid: item.menuTsid ?? '' })), // depth2
        ]

        menu.children.map((child2) => {
          // depth3
          let depth3 = child2.children

          if (depth3) {
            authMenuArr = [
              ...authMenuArr,
              ...depth3.map((item) => ({ menuTsid: item.menuTsid ?? '' })),
            ]

            depth3.map((child3) => {
              // depth4
              let depth4 = child3.children

              if (depth4) {
                authMenuArr = [
                  ...authMenuArr,
                  ...depth4.map((item) => ({ menuTsid: item.menuTsid ?? '' })),
                ]
              }
            })
          }
        })
      } else {
        // 체크 해제
        authMenuArr = checkedItems.filter(
          (item) =>
            item.menuTsid !== menu.menuTsid && // depth1
            !menu.children
              ?.map((item) => item.menuTsid)
              .includes(item.menuTsid) && //depth2
            !menu.children
              ?.map((child) => child.children)
              .flatMap((child2) => child2?.map((child3) => child3.menuTsid))
              .includes(item.menuTsid) && // depth3
            !menu.children
              ?.map((child) => child.children)
              .flatMap((child2) => child2?.map((child3) => child3.children))
              .flatMap((child3) => child3?.map((child4) => child4.menuTsid))
              .includes(item.menuTsid), // depth4
        )
      }
    } else {
      if (checked) {
        authMenuArr = [...checkedItems, { menuTsid: menu.menuTsid ?? '' }]
      } else {
        authMenuArr = checkedItems.filter(
          (item) => item.menuTsid !== menu.menuTsid,
        )
      }
    }

    console.log(authMenuArr)

    setCheckedItems(authMenuArr)
  }

  function convertRowToMenuitemsType(menu: Menu): MenuItem {
    return {
      id: menu.menuTsid,
      label: menu.menuNm,
      hasChildren: menu.children && menu.children.length > 0,
      children:
        menu.children && menu.children.length > 0
          ? menu.children.map(convertRowToMenuitemsType)
          : undefined,
      // 최상위 메뉴 인지  판단하는 기준  upMenuTsid가 없으면 된다.
      menuTsid: menu.menuTsid,
      menuNm: menu.menuNm,
      upMenuTsid: menu.upMenuTsid,
      urlAddr: menu.urlAddr,
      menuSeq: menu.menuSeq,
      menuExpln: menu.menuExpln,
      npagYn: menu.npagYn,
      useYn: menu.useYn,
      httpDmndMethNm: menu.httpDmndMethNm,
      upMenuNm: menu.upMenuNm,
    }
  }

  const renderTree = (
    nodes: MenuItem,
    depth: number = 0,
    fromModal: boolean = false,
  ) => (
    <TreeItem
      key={nodes.id}
      itemId={nodes.id as string}
      aria-expanded={true}
      label={
        <Box display="flex" alignItems="center">
          {nodes.hasChildren ? (
            <>
              <CustomCheckbox
                id={nodes.menuTsid}
                checked={
                  checkedItems.find(
                    (item) => item.menuTsid === nodes.menuTsid,
                  ) !== undefined
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectMenu(e, nodes)
                }
              />
              <FolderIcon sx={{ color: '#FFD700', marginRight: 1 }} />
            </>
          ) : (
            <>
              <CustomCheckbox
                id={nodes.menuTsid}
                checked={
                  checkedItems.find(
                    (item) => item.menuTsid === nodes.menuTsid,
                  ) !== undefined
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSelectMenu(e, nodes)
                }
              />
              <InsertDriveFileIcon
                sx={{ color: '#E0E0E0', marginRight: 1, borderRadius: '4px' }}
              />
            </>
          )}
          {nodes.label}
        </Box>
      }
      sx={{ paddingLeft: depth * 2 }}
    >
      {nodes.children &&
        nodes.children.map((node) => renderTree(node, depth + 1, fromModal))}
    </TreeItem>
  )

  const openMappingModal = async (row: Row) => {
    await getAuthItems(row.userTypeCd)
    setSelectedRow(row)
    setModalOpen(true)
  }

  const closeMappingModal = () => {
    setSelectedRow(undefined)
    setModalOpen(false)
  }

  return (
    <PageContainer title="역할별 권한관리" description="역할별 권한관리">
      {/* breadcrumb */}
      <Breadcrumb title="역할별 권한관리" items={BCrumb} />
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
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
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
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>

      <FormModal
        buttonLabel={''}
        title={'권한매핑'}
        remoteFlag={modalOpen}
        closeHandler={closeMappingModal}
        submitBtn={false}
        btnSet={
          <Button variant="contained" color="primary" onClick={saveAuthItems}>
            저장
          </Button>
        }
        size="lg"
      >
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                사용자유형명
              </CustomFormLabel>
              <CustomTextField
                name="typeNm"
                value={selectedRow?.typeNm}
                readOnly
                inputProps={{ readOnly: true }}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <CustomFormLabel className="input-label-display">
          <h3>메뉴목록</h3>
        </CustomFormLabel>
        <SimpleTreeView
          aria-label="menu-tree"
          slots={{ collapseIcon: RemoveIcon, expandIcon: AddIcon }}
          expansionTrigger={'iconContainer'}
          sx={{
            height: '600px',
            width: '500px',
            flexGrow: 1,
            overflowY: 'auto',
            p: 1,
          }}
          defaultExpandedItems={menuItem
            .filter((item) => item.hasChildren)
            .map((item) => item.id)
            .filter((id): id is string => id !== undefined)}
          multiSelect
        >
          {menuItem.map((menu) => renderTree(menu))}
        </SimpleTreeView>
      </FormModal>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
