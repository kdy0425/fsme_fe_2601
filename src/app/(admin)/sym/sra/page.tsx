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

// types
import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import ModalContent from './_components/ModalContent'
// import FormModal from './_components/FormModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '시스템일반',
  },
  {
    to: '/sym/sra',
    title: '보조금입금계좌관리',
  },
]

const headCells: HeadCell[] = [
  {
    id: 'dataSeNm',
    numeric: false,
    disablePadding: false,
    label: '업종구분',
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
    label: '관할관청',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'bankNm',
    numeric: false,
    disablePadding: false,
    label: '거래은행',
  },
  {
    id: 'actno',
    numeric: false,
    disablePadding: false,
    label: '계좌번호',
    align: 'td-left',
  },
]
export interface Row {
  dataSeCd: string // 업종구분코드
  locgovCd: string // 관할관청코드
  crdcoCd: string // 카드사코드
  crdcoNm: string // 카드사명
  actno: string // 계좌번호
  bankCd: string // 거래은행코드
  delYn: string // 삭제여부
  ctpvCd: string // 시도코드
  ctpvNm: string // 시도명
  locgovNm: string // 관할관청명
  bankNm: string // 거래은행명
  dataSeNm: string // 업종구분명
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

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [open, setOpen] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'CREATE' | 'UPDATE'>('CREATE')

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
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    if (params.ctpvCd) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/sym/sra/cm/getAllSbsidyRcpmnyAcnut?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.dataSeCd ? '&dataSeCd=' + params.dataSeCd : ''}`

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

  const deleteSbsidyRcpmnyAcnut = async () => {
    try {
      let endpoint: string = `/fsm/sym/sra/cm/deleteSbsidyRcpmnyAcnut`

      if (selectedRow) {
        let body = {
          dataSeCd: selectedRow.dataSeCd,
          locgovCd: selectedRow.locgovCd,
          crdcoCd: selectedRow.crdcoCd,
        }

        const userConfirm: boolean = confirm(
          '해당 보조금계좌정보를 삭제하시겠습니까?',
        )

        if (userConfirm) {
          const response = await sendHttpRequest(
            'DELETE',
            endpoint,
            body,
            true,
            {
              cache: 'no-store',
            },
          )

          if (response && response.resultType === 'success') {
            alert(response.message)
            reload()
          }
        } else {
          return
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!params.ctpvCd || params.ctpvCd === '') {
      alert('시도명을 선택해주세요.')
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
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }

  // 행 더블블클릭 시 호출되는 함수
  const handleRowDoubleClick = (row: Row, index?: number) => {
    if (row.actno === null || row.actno === '') {
      alert('등록된 계좌정보가 없습니다.')
    } else {
      setModalType('UPDATE')
      setSelectedRow(row)
      setSelectedIndex(index ?? -1)
      setOpen(true)
    }
  }

  const openCreateModal = () => {
    if (selectedRow && selectedIndex > -1) {
      setModalType('CREATE')
      setOpen(true)
    } else {
      alert('행 선택 후 등록할 수 있습니다.')
    }
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const reload = () => {
    setFlag(!flag)
    setOpen(false)
  }

  const deleteData = async () => {
    await deleteSbsidyRcpmnyAcnut()
    reload()
  }

  return (
    <PageContainer title="보조금입금계좌관리" description="보조금입금계좌관리">
      {/* breadcrumb */}
      <Breadcrumb title="보조금입금계좌관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor={'sch-ctpv'} required>
                시도
              </CustomFormLabel>
              <CtpvSelect
                pName="ctpvCd"
                pValue={params.ctpvCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-ctpv'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor={'sch-locgov'}>
                관할관청
              </CustomFormLabel>
              <LocgovSelect
                pName="locgovCd"
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                ctpvCd={params.ctpvCd}
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor={'sch-dataSeCd'}>
                업종구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'086'}
                pName={'dataSeCd'}
                pValue={params.dataSeCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-dataSeCd'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => openCreateModal()}
            >
              등록
            </Button>
          </div>
          {selectedRow && (
            <FormModal
              buttonLabel={''}
              submitBtn={false}
              size="lg"
              title={'보조금계좌정보'}
              remoteFlag={open}
              closeHandler={() => setOpen(false)}
              btnSet={
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    form="send-data"
                  >
                    저장
                  </Button>
                  {modalType === 'UPDATE' ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={deleteData}
                    >
                      삭제
                    </Button>
                  ) : (
                    ''
                  )}
                </>
              }
            >
              <ModalContent
                key={modalType + selectedRow.actno}
                data={selectedRow}
                type={modalType}
                reload={reload}
              />
            </FormModal>
          )}
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
          onRowClick={handleRowClick}
          onRowDoubleClick={handleRowDoubleClick}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
