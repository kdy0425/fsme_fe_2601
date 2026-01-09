'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import PageContainer from '@/components/container/PageContainer'

// utils
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { apvNpomTrHeadCells } from '@/utils/fsms/headCells'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import FormDialog from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import ModalContent from './_components/ModalContent'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
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
    title: '주유(충전)소 관리',
  },
  {
    to: '/apv/npom',
    title: '신규 POS 주유소 관리',
  },
]

export interface Row {
  newOltSn: number
  frcsBrno: string
  frcsNm: string
  oltNm: string
  daddr: string
  telno: string
  regSttsCdNm: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  instlYn: string
  posCoNm: string
  posNm: string
  instlYmd: string
  locgovNm: string
  locgovCd: string
  xcrd: string
  ycrd: string
  ornCmpnyNm: string
  ornCmpnyNmS: string
  frcsTelnoCn: string
  salsSeNm: string
  stopBgngYmd: string
  stopEndYmd: string
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

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    frcsBrno: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [checkedRows, setCheckedRows] = useState<number[]>([])

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag != null) {
      fetchData()
      setSelectedIndex(-1)
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    setParams((prev) => ({ ...prev, regSttsCd: '00' }))
    setFlag((prev) => !prev)
  }, [])

  useEffect(() => {
    // 같은 사업자등록번호 row가 아니면 체크박스 disabled 처리
    console.log(checkedRows)

    if (checkedRows && checkedRows.length > 0) {
      if (checkedRows.length !== params.size) {
        // 전체체크는 제외
        const checkedFrcsBrno = rows.find(
          (item) => checkedRows[0] === item.newOltSn,
        )?.frcsBrno

        rows.map((item, index) => {
          if (item.frcsBrno !== checkedFrcsBrno) {
            disableCheckBox(index)
          }
        })
      }
    } else {
      rows.map((item, index) => {
        document.getElementById('tr' + index)?.removeAttribute('disabled')
      })
    }
  }, [checkedRows])

  const disableCheckBox = (index: number) => {
    document.getElementById('tr' + index)?.setAttribute('disabled', 'true')
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/apv/npom/tr/getAllNewPosOltMng?page=${params.page}&size=${params.size}` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
        `${params.regSttsCd ? '&regSttsCd=' + params.regSttsCd : ''}`

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
        alert(response.message)
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
      if (!checkedRows || checkedRows.length < 1) {
        alert('선택한 신규 주유소 항목이 없습니다.')
        return
      }

      let endpoint: string = `/fsm/apv/npom/tr/deleteNewPosOltMng`

      let body = {
        arrNewOltSn: checkedRows,
      }

      const userConfirm = confirm('선택한 신규 주유소 항목을 삭제하시겠습니까?')

      if (!userConfirm) {
        return
      }

      if (userConfirm) {
        const response = await sendHttpRequest('DELETE', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          setFlag((prev) => !prev)
        } else {
          alert(response.message)
        }
      }
    } catch (error) {
      console.error('Delete Error ::: ', error)
    }
  }

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
      let endpoint: string =
        `/fsm/apv/npom/tr/getExcelNewPosOltMng?` +
        `${params.frcsBrno ? '&frcsBrno=' + params.frcsBrno.replaceAll('-', '') : ''}` +
        `${params.regSttsCd ? '&regSttsCd=' + params.regSttsCd : ''}`

      await getExcelFile(
        endpoint,
        BCrumb[BCrumb.length - 1].title + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 페이지 이동 감지 시작 //

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    if (index === selectedIndex) {
      setSelectedRow(null)
      setSelectedIndex(-1)
    } else {
      setSelectedRow(row)
      setSelectedIndex(index ?? -1)
    }
  }

  const handleCheckChange = (selected: string[]) => {
    let selectedRows: number[] = [] // index arr

    selected.map((item) => {
      let index: number = Number(item.replace('tr', ''))
      selectedRows.push(rows[index].newOltSn)
    })

    setCheckedRows(selectedRows)
  }

  // 페이지 이동 감지 종료 //

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setExcelFlag(false)
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const openInsertModal = () => {
    if (selectedIndex > -1 && selectedRow) {
      setRemoteFlag(true)
    } else {
      alert('선택된 데이터가 없습니다')
    }
  }

  const reloadFn = () => {
    setRemoteFlag(false)
    setFlag((prev) => !prev)
  }

  return (
    <PageContainer title="신규 POS 주유소 관리">
      {/* breadcrumb */}
      <Breadcrumb title="신규 POS 주유소 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-frcsBrno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-frcsBrno"
                name="frcsBrno"
                value={params.frcsBrno}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-regSttsCd"
              >
                상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="321"
                pValue={params.regSttsCd}
                handleChange={handleSearchChange}
                pName="regSttsCd"
                htmlFor={'ft-regSttsCd'}
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant="contained" onClick={() => openInsertModal()}>
              등록
            </Button>
            {selectedRow && selectedIndex > -1 ? (
              <FormDialog
                size={'lg'}
                buttonLabel=""
                formLabel="등록"
                formId="frcs-sendData"
                title="신규 POS 주유소 등록"
                remoteFlag={remoteFlag}
                closeHandler={() => setRemoteFlag(false)}
                children={
                  <ModalContent
                    frcsBrno={selectedRow ? selectedRow.frcsBrno : ''}
                    daddr={selectedRow ? selectedRow.daddr : ''}
                    newOltSn={selectedRow ? selectedRow.newOltSn : -1}
                    reloadFn={reloadFn}
                  />
                }
              />
            ) : (
              <></>
            )}
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteData()}
            >
              삭제
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => excelDownload()}
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={apvNpomTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onCheckChange={handleCheckChange}
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          disableAllCheck
          caption={"신규 POS 주유소 관리 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
