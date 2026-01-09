'use client'
import {
  Box,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import BlankCard from '@/app/components/shared/BlankCard'

import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

import { BsVhclModal, BsVhclRow } from './_components/BsVhclModal'

import ModalContent from './_components/ModalContent'

// utils
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { toQueryString } from '@/utils/fsms/utils'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// types
import FormDialog from '@/app/components/popup/FormDialog'
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { HeadCell, Pageable2 } from 'table'
import {
  getCtpvCd,
  getCommCd,
  getLocGovCd,
  getDateRange,
  isValidDateRange,
  sortChange,
  getExcelFile,
  getToday,
} from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { listClasses } from '@mui/material'
import { stnBscmHC } from '@/utils/fsms/headCells'
import { isNumber } from '@/utils/fsms/common/comm'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '기준관리',
  },
  {
    title: '자격관리',
  },
  {
    to: '/stn/bscm',
    title: '준공영제차량관리',
  },
]

export interface Row {
  seqNo: string // 순번
  locgovCd: string // 관할관청코드
  locgovNm: string // 관할관청
  vhclNo: string // 차량번호
  brno: string // 사업자등록번호
  bzentyNm: string // 업체명
  koiCd: string // 유종코드
  koiNm: string // 유종
  vhclSeCd: string // 면허업종코드
  vhclSeNm: string // 면허업종
  dsgnBgngYmd: string // 시작일자
  endYmd: string // 종료일자
  rgtrId: string // 등록자아이디
  regDt: string // 등록일자
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일자
}

export interface ModalRow {
  seqNo: string // 순번
  locgovCd: string // 관할관청코드
  locgovNm: string // 관할관청
  vhclNo: string // 차량번호
  brno: string // 사업자등록번호
  bzentyNm: string // 업체명
  koiCd: string // 유종코드
  koiNm: string // 유종
  vhclSeCd: string // 면허업종코드
  vhclSeNm: string // 면허업종
  dsgnBgngYmd: string // 시작일자
  endYmd: string // 종료일자
  rgtrId: string // 등록자아이디
  regDt: string // 등록일자
  mdfrId: string // 수정자아이디
  mdfcnDt: string // 수정일자
}

export interface selectRow {
  vhclNo: string //차량번호
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
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
  //const [list, setList] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부

  const [open, setOpen] = useState<boolean>(false)
  const [detailData, setDetailData] = useState<ModalRow | null>(null)

  const [selectedRows, setSelectedRows] = useState<string[]>([]) // 체크 로우 데이터

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (params.ctpvCd) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)
    let startDate = dateRange.startDate
    let endDate = dateRange.endDate
    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))

    //getCommCd('505', '전체').then((itemArr) => setVhclSeCdItems(itemArr))// 면허업종코드
  }, [])

  useEffect(() => {
    // 시도 코드 변경시 관할관청 재조회
  }, [params.ctpvCd])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      // if(!params.locgovCd) {
      //   alert("관할관청을 선택해주세요.");
      //   return;
      // }
      setExcelFlag(true) // 엑셀기능 동작여부
      setLoading(true)

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/bscm/bs/getAllBusSeytCarMng?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        //setList(response.data.list);
        //setTotalRows(response.data.list.totalElements)
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setSelectedRows([])
      } else {
        // 데이터가 없거나 실패
        //setList([]); // 데이터가 없을 경우 초기화
        //setTotalRows(0);
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
        setSelectedRows([])
      }
    } catch (error) {
      // 에러시
      //setList([]);
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
      setSelectedRows([])
    } finally {
      setLoading(false)
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
        `/fsm/stn/bscm/bs/getAllBusSeytCarMng?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclSeCd ? '&vhclSeCd=' + params.vhclSeCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.bzentyNm ? '&bzentyNm=' + params.bzentyNm : ''}` +
        `${params.brno ? '&brno=' + params.brno : ''}`

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
    setFlag(!flag)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 정렬시 데이터 갱신
  const setVhcl = (row: BsVhclRow) => {
    // 정렬 기준을 params에 업데이트
    console.log(row)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((data: ModalRow) => {
    //alert(row.vhclNo);
    setDetailData(data)
    setOpen(true)
  }, [])
  // 페이지 이동 감지 종료 //

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    // setParams((prev) => ({ ...prev, [name]: value }))
    if (isNumber(value) || name !== 'brno') {
      setExcelFlag(false)
      setParams((prev: any) => ({ ...prev, page: 1, [name]: value }))
    } else {
      setExcelFlag(false)
      event.target.value = value.substring(0, value.length - 1)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  const handleCheckChange = (selected: string[]) => {
    setSelectedRows(selected)
  }

  const deleteCode = async () => {
    if (selectedRows.length < 1) {
      alert('선택항목이 없습니다.')
      return
    }

    setLoadingBackdrop(true)

    let endpoint: string = `/fsm/stn/bscm/bs/deleteBusSeytCarMng`

    const userConfirm = confirm('선택된 준공영제 차량정보를 삭제하시겠습니까?')

    if (userConfirm) {
      let param: any[] = []
      selectedRows.map((id) => {
        const row = rows[Number(id.replace('tr', ''))]
        param.push({
          vhclNo: row.vhclNo,
          brno: row.brno,
          locgovCd: row.locgovCd,
          seqNo: row.seqNo,
        })
      })
      const updatedRows = { list: param }
      const response = await sendHttpRequest(
        'DELETE',
        endpoint,
        updatedRows,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        alert(response.message)
        setLoadingBackdrop(false)
        setSelectedRows([])
        fetchData()
      } else {
        setLoadingBackdrop(false)
        alert(response.message)
      }
    } else {
      setLoadingBackdrop(false)
      return
    }
  }

  return (
    <PageContainer title="준공영제차량관리" description="준공영제차량관리">
      {/* breadcrumb */}
      <Breadcrumb title="준공영제차량관리" items={BCrumb} />
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
                <span className="required-text">*</span>시도명
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
                <span className="required-text">*</span>관할관청
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
                htmlFor="sch-crdcoCd"
              >
                면허업종
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="505"
                pValue={params.vhclSeCd}
                handleChange={handleSearchChange}
                pName="vhclSeCd"
                htmlFor={'sch-crdcoCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-bzentyNm"
              >
                업체명
              </CustomFormLabel>
              <CustomTextField
                id="ft-bzentyNm"
                name="bzentyNm"
                value={params.bzentyNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-brno"
              >
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-brno"
                name="brno"
                value={params.brno}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                type="number"
                inputProps={{ maxLength: 10, type: 'number' }}
                onInput={(e: {
                  target: { value: string; maxLength: number | undefined }
                }) => {
                  e.target.value = Math.max(0, parseInt(e.target.value))
                    .toString()
                    .slice(0, e.target.maxLength)
                }}
                placeholder="숫자만 입력 가능합니다."
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <BsVhclModal
              buttonLabel="등록"
              title="준공영제차량등록"
              url="/fsm/stn/bscm/bs/getAllBusSeytCarMngPop"
              reload={() => fetchData()}
            />
            <ModalContent
              size={'lg'}
              title="준공영제차량수정"
              isOpen={open}
              setOpen={setOpen}
              data={detailData}
              reload={() => fetchData()}
            />
            <LoadingBackdrop open={loadingBackdrop} />
            <Button variant="contained" color="error" onClick={deleteCode}>
              삭제
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={stnBscmHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          paging={true}
          cursor={true}
          onCheckChange={handleCheckChange}
          caption={'버스-준공영제차량관리 목록 조회'}
        />
      </Box>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList
