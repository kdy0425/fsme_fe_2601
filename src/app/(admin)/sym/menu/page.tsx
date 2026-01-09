'use client'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
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

// types
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { SelectItem } from 'select'
import ProgramSearchModal from './_components/ProgramSearchModal'

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
    to: 'sym/menu',
    title: '메뉴관리',
  },
]

//트리 구조의 메뉴
export type MenuItem = {
  id?: string
  label?: string
  hasChildren?: boolean
  children?: MenuItem[]
  menuGroupCd?: string // 메뉴그룹코드
  menuTsid?: string //메뉴ID
  menuNm?: string //메뉴명
  upMenuTsid?: string //상위메뉴
  urlAddr?: string //URL주소
  menuSeq?: string // 메뉴순서
  menuExpln?: string //메뉴설명
  useYn?: string
  npagYn?: string // 새창여부
  httpDmndMethNm?: string // HTTP요청메소드명
  upMenuNm?: string // 상위메뉴명
}
// API로 부터 받는 urlAddr의 경로중에서 /fsm,   /** 를 제거해서 올바른 경로를 매핑하기 우
function cleanUrl(url: string): string {
  return url.replace('/fsm', '').replace('/**', '')
}

//menu ------>  MenuitemsType로 바꾸기 위한 함수
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
    useYn: menu.useYn,
    npagYn: menu.npagYn,
    httpDmndMethNm: menu.httpDmndMethNm,
    upMenuNm: menu.upMenuNm,
  }
}

// 메뉴 리스트들
export interface Menu {
  children?: Menu[] // 하위 메뉴
  menuTsid?: string // 메뉴ID
  menuNm?: string // 메뉴명
  upMenuTsid?: string // 상위메뉴
  menuSeq?: string // 메뉴 순서
  useYn?: string // 사용 여부
  menuExpln?: string //메뉴 설명
  npagYn?: string //새창여부
  httpDmndMethNm?: string // Http 요청 메서드명

  urlAddr?: string //  URL 주소
  prgrmNm?: string
  upMenuNm?: string
}

//프로그램명
export interface Program {
  prgrmNm?: string //프로그램명
  urlAddr?: string //URL주소
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

// 조회하여 가져온 정보를 Table에 넘기는 객체
type pageable = {
  pageNumber: number
  pageSize: number
  sort: string
}

const DataList = () => {
  const router = useRouter() // 화면이동을 위한객체
  const querys = useSearchParams() // 쿼리스트링을 가져옴

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [menus, setMenus] = useState<Menu[]>([]) // 가져온 메뉴 데이터
  const [menuItem, setMenuItem] = useState<MenuItem[]>([]) // 가져온 로우 데이터

  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [httpMethodItems, setHttpMethodItems] = useState<SelectItem[]>([])
  const [npagYnItems, setNpagYnItems] = useState<SelectItem[]>([])

  //선택된 메뉴 (모달용)
  const [selectedMenuModal, setSelectedMenuModal] = useState<Menu>()

  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchValue: '', // 검색어
    searchSelect: 'ttl', // 종류
    searchStDate: '', // 시작일
    searchEdDate: '', // 종료일
    sort: '', // 정렬 기준 추가
    // 여기에 추가된 필드들은 빈 문자열로 초기화해 줍니다.
    upMenuTsid: '',
    menuSeq: '',
    menuNm: '',
    httpDmndMethNm: '',
    urlAddr: '',
    npagYn: '',
    menuExpln: '',
    upMenuNm: '',
  })
  //
  const [pageable, setPageable] = useState<pageable>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    sort: '', // 정렬 기준
  })

  // 나중에 쓸 수도 있음.
  // // 모달 내에서 트리 항목을 더블 클릭 시 (상위 메뉴 값만 업데이트하고 모달 닫기)
  // const handleDoubleClickMenuFromModal = (event: React.MouseEvent,menu: MenuItem) => {
  //   event.stopPropagation(); // 이벤트 전파를 막음

  //   // *이 아닐 경우 안 됨
  //   // ex apv/tdd같은 실제 경로일경우 리턴
  //   if(menu.urlAddr !== '*'){
  //     return
  //   }

  //   setParams((prev) => ({
  //     ...prev,
  //     upMenuTsid: menu.menuTsid ?? '', // 상위 메뉴 ID만 업데이트
  //   }));
  //    handleCloseModal(); // 메뉴 선택 후 모달 닫기 보류
  // };

  // 모달 내에서 트리 항목을 더블 클릭 시 (상위 메뉴 값만 업데이트하고 모달 닫기)
  const handleClickMenuFromModal = (
    event: React.MouseEvent,
    menu: MenuItem,
  ) => {
    event.stopPropagation() // 이벤트 전파를 막음

    if (menu.urlAddr !== '*') {
      return
    }

    setSelectedMenuModal(menu)
    // setParams((prev) => ({
    //   ...prev,
    //   upMenuTsid: menu.menuTsid ?? '', // 상위 메뉴 ID만 업데이트
    // }));
    //handleCloseModal(); // 메뉴 선택 후 모달 닫기 보류
  }

  // 원하는 신규 내용을 받으려고 세팅한다.
  const handleClickNew = () => {
    //선택된 메뉴 없애기
    setSelectedMenuItem(null)
    //Params 값 초기화
    setParams({
      ...params, // 이전 값을 유지
      upMenuTsid: '', //상위메뉴
      menuSeq: '', // 메뉴순서
      menuNm: '', // 메뉴명
      httpDmndMethNm: '', // HTTP 요청 메서드명
      urlAddr: '', // URL 주소
      npagYn: '', // 새창여부
      menuExpln: '', // 메뉴설명
      upMenuNm: '', // 상위메뉴명
      // 다른 필드들도 이전 상태에서 유지합니다.
    })
  }
  const handleRegister = () => {
    postData()
  }

  const postData = async () => {
    setLoading(true)

    if (!params.upMenuTsid && params.upMenuTsid === '') {
      alert('상위메뉴를 입력해주세요')
      return
    }
    if (!params.menuSeq && params.menuSeq === '') {
      alert('메뉴순서를 입력해주세요')
      return
    }
    if (!params.menuNm && params.menuNm === '') {
      alert('메뉴명을 입력해주세요')
      return
    }
    // if(!params.httpDmndMethNm && params.httpDmndMethNm  === ''){
    //   alert('HTTP요청메소드명을 입력해주세요')
    //   return
    // }
    if (!params.urlAddr && params.urlAddr === '') {
      alert('URL주소를 입력해주세요')
      return
    }
    if (!confirm('해당 메뉴를 등록하시겠습니까?')) {
      return
    }

    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sym/menu/cm/createFsmMenuMng`
      const response = await sendHttpRequest(
        'POST',
        endpoint,
        {
          menuNm: params.menuNm,
          upMenuTsid: params.upMenuTsid,
          urlAddr: params.urlAddr,
          menuSeq: params.menuSeq,
          menuExpln: params.menuExpln,
          npagYn: params.npagYn,
          httpDmndMethNm: params.httpDmndMethNm,
        },
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        // 데이터 조회 성공시
        alert('메뉴 등록 완료되었습니다.')
        setSelectedMenuItem(undefined)
        setParams({
          page: 1, // 페이지 번호는 1부터 시작
          size: 10, // 기본 페이지 사이즈 설정
          searchValue: '', // 검색어
          searchSelect: 'ttl', // 종류
          searchStDate: '', // 시작일
          searchEdDate: '', // 종료일
          sort: '', // 정렬 기준 추가
          // 여기에 추가된 필드들은 빈 문자열로 초기화해 줍니다.
          upMenuTsid: '',
          menuSeq: '',
          menuNm: '',
          httpDmndMethNm: '',
          urlAddr: '',
          npagYn: '',
          menuExpln: '',
          upMenuNm: '',
        })
        setSelectedMenuItem(undefined)
        setFlag((prev) => !prev)
        return 'success'
      } else {
        // 데이터가 없거나 실패
        return 'failed'
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      return 'failed'
    } finally {
      setLoading(false)
    }
  }

  // 메뉴 삭제
  const deleteMenu = async () => {
    if (!selectedMenuItem || !selectedMenuItem?.menuTsid) {
      alert('선택된 항목이 없거나 메뉴ID가 없습니다')
      return
    }

    if (!confirm('해당 메뉴를 삭제하시겠습니까?')) {
      return
    }

    try {
      const endPoint = '/fsm/sym/menu/cm/deleteFsmMenuMng'
      const body = {
        menuTsid: selectedMenuItem.menuTsid,
      }

      const response = await sendHttpRequest('DELETE', endPoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('메뉴 삭제 완료되었습니다.')
        setParams({
          page: 1, // 페이지 번호는 1부터 시작
          size: 10, // 기본 페이지 사이즈 설정
          searchValue: '', // 검색어
          searchSelect: 'ttl', // 종류
          searchStDate: '', // 시작일
          searchEdDate: '', // 종료일
          sort: '', // 정렬 기준 추가
          // 여기에 추가된 필드들은 빈 문자열로 초기화해 줍니다.
          upMenuTsid: '',
          menuSeq: '',
          menuNm: '',
          httpDmndMethNm: '',
          urlAddr: '',
          npagYn: '',
          menuExpln: '',
          upMenuNm: '',
        })
        setSelectedMenuItem(undefined)
        setFlag((prev) => !prev)
      } else {
        console.error('메뉴 삭제 실패했습니다.')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // 메뉴 수정
  const modifyMenu = async () => {
    if (!selectedMenuItem || !selectedMenuItem?.menuTsid) {
      alert('선택된 항목이 없거나 메뉴ID가 없습니다')
      return
    }

    if (params.upMenuTsid && params.upMenuTsid === '') {
      alert('상위메뉴를 입력해주세요')
      return
    }
    if (params.menuSeq && params.menuSeq === '') {
      alert('메뉴순서를 입력해주세요')
      return
    }
    if (params.menuNm && params.menuNm === '') {
      alert('메뉴명을 입력해주세요')
      return
    }
    if (params.httpDmndMethNm && params.httpDmndMethNm === '') {
      alert('HTTP요청메소드명을 입력해주세요')
      return
    }
    if (params.urlAddr && params.urlAddr === '') {
      alert('URL주소를 입력해주세요')
      return
    }

    if (!confirm('해당 메뉴를 수정하시겠습니까?')) {
      return
    }

    try {
      const endPoint = '/fsm/sym/menu/cm/updateFsmMenuMng'
      const body = {
        menuTsid: selectedMenuItem.menuTsid ?? '',
        menuNm: params.menuNm,
        upMenuTsid: params.upMenuTsid,
        urlAddr: params.urlAddr,
        menuExpln: params.menuExpln,
        menuSeq: params.menuSeq,
        httpDmndMethNm: params.httpDmndMethNm,
        npagYn: params.npagYn,
      }

      const response = await sendHttpRequest('PUT', endPoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('메뉴 수정 완료되었습니다.')
        setParams({
          page: 1, // 페이지 번호는 1부터 시작
          size: 10, // 기본 페이지 사이즈 설정
          searchValue: '', // 검색어
          searchSelect: 'ttl', // 종류
          searchStDate: '', // 시작일
          searchEdDate: '', // 종료일
          sort: '', // 정렬 기준 추가
          // 여기에 추가된 필드들은 빈 문자열로 초기화해 줍니다.
          upMenuTsid: '',
          menuSeq: '',
          menuNm: '',
          httpDmndMethNm: '',
          urlAddr: '',
          npagYn: '',
          menuExpln: '',
          upMenuNm: '',
        })
        setSelectedMenuItem(undefined)

        setFlag((prev) => !prev)
      } else {
        console.error('메뉴 삭제 실패했습니다.')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
      label={
        <Box display="flex" alignItems="center">
          {nodes.hasChildren ? (
            <FolderIcon sx={{ color: '#FFD700', marginRight: 1 }} /> // 폴더 아이콘
          ) : (
            <InsertDriveFileIcon
              sx={{ color: '#E0E0E0', marginRight: 1, borderRadius: '4px' }}
            /> // 파일 아이콘
          )}
          {nodes.label}
        </Box>
      }
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!fromModal) {
          handleSelectMenu(nodes)
        } else {
          handleClickMenuFromModal(event, nodes) // 모달에서 더블 클릭 시 handleDoubleClickMenuFromModal 실행
        } // 모달이 아닌 경우에만 handleClickMenu 실행
      }}
      // onDoubleClick={(event) => {
      //   if (fromModal) handleDoubleClickMenuFromModal(event, nodes); // 모달에서 더블 클릭 시 handleDoubleClickMenuFromModal 실행
      // }}
      sx={{ paddingLeft: depth * 2 }}
    >
      {nodes.children &&
        nodes.children.map((node) => renderTree(node, depth + 1, fromModal))}
    </TreeItem>
  )

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    fetchData()
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(!flag)
    // HTTP요청메소드 코드그룹 세팅
    getCodesByGroupNm('787').then((res) => {
      if (res) {
        let httpMethodCodes: SelectItem[] = []

        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          httpMethodCodes.push(item)
        })

        setHttpMethodItems(httpMethodCodes)
      }
    })

    // 사용여부 코드그룹 세팅
    getCodesByGroupNm('116').then((res) => {
      if (res) {
        let npagYnCodes: SelectItem[] = []

        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          npagYnCodes.push(item)
        })
        setNpagYnItems(npagYnCodes)
      }
    })
  }, [])

  // 검색 조건을 쿼리스트링으로 변환하기 위한 객체
  const [qString, setQString] = useState<string>('')

  // 검색 조건이 변경되면 자동으로 쿼리스트링 변경
  useEffect(() => {
    setQString(toQueryString(params))
  }, [params])

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `/fsm/sym/menu/cm/getAllFsmMenu`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터를 저장
        setMenus(response.data)
        setMenuItem(
          response.data.map((menu: Menu) => convertRowToMenuitemsType(menu)),
        )
        //데이터를 Tree구조 형식에 맞게 변환
      } else {
        // 데이터가 없거나 실패
        console.error('No Menu System data found or request failed')
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (program: Menu) => {
    // setProgram(program)

    setParams((prev) => ({
      ...prev,
      urlAddr: program.urlAddr ?? '', // 상위 메뉴 ID만 업데이트
    }))
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  const [openModal, setOpenModal] = useState(false)
  const [openProgramModal, setOpenProgramModal] = useState(false)

  // 메뉴 조회 모달 열기
  const handleOpenModal = () => {
    setOpenModal(true)
  }

  // 메뉴 조회 모달 닫기
  const handleCloseModal = () => {
    setSelectedMenuModal(undefined)
    setOpenModal(false)
  }

  // 메뉴 조회 모달 확정
  const handleConfirm = () => {
    //selectedMenuModal
    if (!selectedMenuModal) {
      alert('선택된 항목이 없습니다')
      return
    }
    setParams((prev) => ({
      ...prev,
      upMenuNm: selectedMenuModal.menuNm ?? '',
      upMenuTsid: selectedMenuModal.menuTsid ?? '', // 상위 메뉴 ID만 업데이트
    }))

    setOpenModal(false)
  }

  const handleProgamSearchOpen = () => {
    setOpenProgramModal(true)
  }

  // 메뉴 선택 시 데이터 세팅
  const handleSelectMenu = (menu: MenuItem) => {
    setSelectedMenuItem(menu)
    setParams((prev) => ({
      ...prev,
      menuTsid: menu.menuTsid ?? '',
      upMenuNm: menu.upMenuNm ?? '',
      upMenuTsid: menu.upMenuTsid ?? '',
      menuSeq: menu.menuSeq ?? '',
      menuNm: menu.menuNm ?? '',
      httpDmndMethNm: menu.httpDmndMethNm ?? '',
      urlAddr: menu.urlAddr ?? '',
      npagYn: menu.npagYn ?? '',
      menuExpln: menu.menuExpln ?? '',
    }))
  }

  return (
    <PageContainer title="메뉴관리" description="메뉴관리">
      {/* breadcrumb */}
      <Breadcrumb title="메뉴관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={handleClickNew}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <Button
              onClick={handleRegister}
              variant="contained"
              color="primary"
            >
              저장
            </Button>
            <Button variant="contained" onClick={modifyMenu} color="primary">
              수정
            </Button>
            <Button variant="contained" onClick={deleteMenu} color="error">
              삭제
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* Flex 컨테이너를 사용하여 TreeView와 Table을 가로로 배치 */}
      <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
        <Box sx={{ flex: 1, border: '1px solid lightgray', p: 2 }}>
          <SimpleTreeView
            aria-label="menu-tree"
            slots={{ collapseIcon: RemoveIcon, expandIcon: AddIcon }}
            sx={{
              height: 'auto',
              flexGrow: 1,
              maxWidth: 400,
              overflowY: 'auto',
              border: '1px solid lightgray',
              p: 1,
            }}
          >
            {menuItem.map((menu) => renderTree(menu))}
          </SimpleTreeView>

          {/* Other components like Table, Button, etc. */}
        </Box>

        <Box sx={{ flex: 1, border: '1px solid lightgray', p: 2 }}>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell
                    className="table-title-column"
                    style={{ minWidth: '300px', width: '25%' }}
                  >
                    <span className="required-text">*</span>상위메뉴
                  </TableCell>
                  <TableCell colSpan={2}>
                    <CustomTextField
                      disabled="true"
                      id="ft-upMenuNm"
                      name="upMenuNm"
                      value={params.upMenuNm ?? ''}
                      onChange={handleParamChange}
                      required
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={handleOpenModal}
                      variant="contained"
                      color="primary"
                    >
                      메뉴조회
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    className="table-title-column"
                    style={{ minWidth: '300px', width: '25%' }}
                  >
                    <span className="required-text">*</span>메뉴순서
                  </TableCell>
                  <TableCell colSpan={3}>
                    <CustomTextField
                      id="ft-menuSeq"
                      name="menuSeq"
                      value={params.menuSeq}
                      onChange={handleParamChange}
                      required
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell
                    className="table-title-column"
                    style={{ minWidth: '300px', width: '25%' }}
                  >
                    <span className="required-text">*</span>메뉴명
                  </TableCell>
                  <TableCell colSpan={3}>
                    <CustomTextField
                      id="ft-menuNm"
                      name="menuNm"
                      value={params.menuNm}
                      onChange={handleParamChange}
                      required
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="table-title-column">
                    <span className="required-text">*</span>HTTP요청메소드명
                  </TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-httpDmndMethNm">HTTP요청메소드명</CustomFormLabel>
                    <select
                      id="ft-httpDmndMethNm"
                      name="httpDmndMethNm"
                      className="custom-default-select"
                      style={{ width: '100%' }}
                      value={params.httpDmndMethNm} // 추가
                      onChange={handleParamChange} // 추가
                    >
                      {httpMethodItems.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="table-title-column">
                    <span className="required-text">*</span>URL주소
                  </TableCell>
                  <TableCell colSpan={2}>
                    <CustomTextField
                      id="ft-urlAddr"
                      name="urlAddr"
                      value={params.urlAddr}
                      onChange={handleParamChange}
                      required
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={handleProgamSearchOpen}
                      variant="contained"
                      color="primary"
                    >
                      프로그램조회
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="table-title-column">새창여부</TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-npagYn">새창여부</CustomFormLabel>
                    <select
                      id="ft-npagYn"
                      name="npagYn"
                      className="custom-default-select"
                      style={{ width: '100%' }}
                      value={params.npagYn} // 추가
                      onChange={handleParamChange} // 추가
                    >
                      {npagYnItems.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="table-title-column">메뉴설명</TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="modal-menuExpln"
                    >
                      내용
                    </CustomFormLabel>
                    <textarea
                      className="MuiTextArea-custom"
                      id="modal-menuExpln"
                      name="menuExpln"
                      value={params.menuExpln}
                      // multiline
                      rows={4} // 원하는 초기 줄 수
                      onChange={handleParamChange}
                      style={{ width: '100%' }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* 테이블영역 끝 */}
      </Box>

      <ProgramSearchModal
        onCloseClick={() => setOpenProgramModal(false)}
        onRowClick={handleRowClick}
        title="프로그램조회"
        url="/fsm/sym/menu/cm/getAllProgrm"
        open={openProgramModal}
      />

      {/* 모달 컴포넌트 */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>메뉴 선택</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
              >
                확정
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleCloseModal}
              >
                취소
              </Button>
            </div>
          </Box>
          <Box sx={{ ml: 6 }}>
            폴더 아이콘을 선택하고 확정을 누르시면 선택됩니다..
          </Box>
          <SimpleTreeView
            aria-label="menu-tree-modal"
            slots={{ collapseIcon: RemoveIcon, expandIcon: AddIcon }}
            sx={{
              height: 'auto',
              flexGrow: 1,
              maxWidth: 700,
              overflowY: 'auto',
              border: '1px solid lightgray',
              p: 1,
            }}
          >
            {menuItem.map((menu) => renderTree(menu, 0, true))}{' '}
            {/* fromModal 플래그를 true로 설정 */}
          </SimpleTreeView>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default DataList
