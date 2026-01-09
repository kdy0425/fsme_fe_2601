'use client'

/* react */
import React, { useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button, FormControlLabel, RadioGroup, TableCell, TableHead, TableRow } from '@mui/material'

/* 공통컴포넌트 */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { CtpvSelectAll, LocgovSelectAll } from '@/app/components/tx/commSelect/CommSelect'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { symUsercHC } from '@/utils/fsms/headCells'
import { Pageable2 } from 'table'

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
    to: '/sym/userc',
    title: '사용자정보변경관리',
  },
]

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          아이디
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          사용자명
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          관할관청
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          권한
        </TableCell>
        <TableCell rowSpan={2} style={{ whiteSpace: 'nowrap' }}>
          변경여부
        </TableCell>
        <TableCell colSpan={4}>이전정보</TableCell>
        <TableCell colSpan={4}>현재정보</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          전체기관명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>기관코드</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>부서명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>부서코드</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          전체기관명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>기관코드</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>부서명</TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>부서코드</TableCell>
      </TableRow>
    </TableHead>
  )
}

interface Row {
  lgnId: string
  userNm: string
  locgovNm: string
  roleNm: string
  changeNm: string
  beInstNm: string
  beInstCd: string
  beDeptNm: string
  beDeptCd: string
  mngNo: string
  nowInstNm: string
  nowInstCd: string
  nowDeptNm: string
  nowDeptCd: string  
  nowMngNo: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  userNm: string
  lgnId: string
  changeNm: string
}

const DataList = () => {

  const [flag, setFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 총 수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | undefined>(undefined);  // 선택된 Row를 저장할 state  
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    userNm: '',
    lgnId: '',
    changeNm: ''
  })

  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  const resetData = (): void => {
    setRows([])
    setTotalRows(0)
    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    console.log('fetchData in')
    resetData()
    setLoading(true)

    try {

      const endpoint = '/fsm/sym/user/cm/getAllUserChange' + toQueryParameter(params)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        handleRowClick(response.data.content[0], 0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row);
    setSelectedIndex(index ?? -1);
  }, [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const userChange = async (): Promise<void> => {
    
    if (!selectedRow) {
      alert('선택된 데이터가 없습니다.')
      return
    }

    if (selectedRow.changeNm === '동일') {
      alert('변경되지 않은 데이터입니다.')
      return
    }

    if (confirm("선택된 사용자정보를 현재정보로 변경 하시겠습니까?")) {
            
      try {

        setLoadingBackdrop(true)

        const endpoint = '/fsm/sym/user/cm/changeUser';
        const body = {
          lgnId: selectedRow.lgnId,
          mngNo: selectedRow.nowMngNo,
          deptNm: selectedRow.nowDeptNm,
          deptCd: selectedRow.nowDeptCd,
        }

        const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          fetchData()
          alert('변경 되었습니다.')          
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.log(error)
        alert('[userChange error] 관리자에게 문의부탁드립니다')
      } finally {
        setLoadingBackdrop(false)
      }
    }
  };

  const userDelete = async (): Promise<void> => {
    
    if (!selectedRow) {
      alert('선택된 데이터가 없습니다.')
      return
    }

    if (confirm("선택된 사용자정보를 정지 처리 하시겠습니까?")) {
      
      try {

        setLoadingBackdrop(true)

        const endpoint = '/fsm/sym/user/cm/changeUserStop'
        const body = {
          lgnId: selectedRow.lgnId
        }

        const response = await sendHttpRequest('PUT', endpoint, body, true, { cache: 'no-store' })

        if (response && response.resultType === 'success') {
          fetchData()
          alert("정지처리 되었습니다.")          
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.log(error)
        alert('[userDelete error] 관리자에게 문의부탁드립니다')
      } finally {
        setLoadingBackdrop(false)
      }
    }
  };  

  return (
    <PageContainer title="사용자정보변경관리" description="사용자정보변경관리">
      {/* breadcrumb */}
      <Breadcrumb title="사용자정보변경관리" items={BCrumb} />
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
              <CtpvSelectAll
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
              <LocgovSelectAll
                ctpvCd={params.ctpvCd}
                pValue={params.locgovCd}
                handleChange={handleSearchChange}
                htmlFor={'sch-locgov'}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-userNm"
              >
                사용자명
              </CustomFormLabel>
              <CustomTextField
                id='sch-userNm'
                name="userNm"
                value={params.userNm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-lgnId"
              >
                아이디
              </CustomFormLabel>
              <CustomTextField
                id='sch-lgnId'
                name="lgnId"
                value={params.lgnId}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <hr></hr>

          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                변경여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="ft-changeNm-radio"
                name="changeNm"
                value={params.changeNm || ""}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={<CustomRadio id="chk_All" name="changeNm" value="" />}
                  label="전체"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_Y" name="changeNm" value="변경" />}
                  label="변경"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_N" name="changeNm" value="동일" />}
                  label="동일"
                />
              </RadioGroup>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              검색
            </Button>
            <Button
              onClick={userChange}
              variant="contained"
              color="primary"
            >
              변경
            </Button>
            <Button
              onClick={userDelete}
              variant="contained"
              color="error"
            >
              정지
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={symUsercHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          customHeader={customHeader}
          caption={"사용자정보변경관리"}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList
