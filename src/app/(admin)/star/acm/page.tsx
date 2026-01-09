'use client'

/* react */
import React, { useEffect, useState, useCallback } from 'react'

/* mui component */
import { Box, Button, FormControlLabel, RadioGroup } from '@mui/material'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* _component */
import FormModal from './_components/FormModal'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { Pageable2 } from 'table'
import { starAcmHc } from '@/utils/fsms/headCells2'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '통계보고서',
  },
  {
    title: '코드관리',
  },
  {
    to: '/star/ucm',
    title: '항목코드관리',
  },
]

export interface Row {
  clsfCd: string // 항목코드
  clsfCdNm: string // 항목코드명
  clsfSeCd: string // 항목구분코드
  clsfPrntCd: string // 항목부모구분코드
  clsfPrntNm: string // 항목부모구분코드명
  sortSeq: string | number // 코드 순서
  useYn: string // 사용여부
  useNm: string //사용여부 한글 (사용 / 미사용)
}

export type form = 'create' | 'update'

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  clsfSeCd: 'B'
  clsfCd: string
  clsfCdNm: string
  useYn: string
}

const DataList = () => {

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 총 수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부

  // 모달상태관리
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [formType, setFormType] = useState<form>('create')
  const [selectedRow, setSelectedRow] = useState<Row>()

  // 검색조건
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    clsfSeCd: 'B',
    clsfCd: '',
    clsfCdNm: '',
    useYn: 'Y',
  })

  // 페이징객체
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  useEffect(() => {
    fetchData()
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async (): Promise<void> => {

    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setLoading(true)

    try {

      const endpoint = '/fsm/star/cm/cm/getAllStatsClsfCd' + toQueryParameter(params)
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
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 검색
  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 검색조건 수정
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 재조회
  const handleReload = (): void => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag(prev => !prev)
  }

  // 로우의 수정버튼 클릭시
  const handleActionClick = useCallback((row: Row, id: string): void => {
    setIsOpen(true)
    setFormType('update')
    setSelectedRow(row)
  }, [])

  // 등록
  const handleOpen = (): void => {
    setIsOpen(true)
    setFormType('create')
    setSelectedRow(undefined)
  }

  return (
    <PageContainer title="항목코드 관리" description="항목코드 관리">
      {/* breadcrumb */}
      <Breadcrumb title="항목코드 관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-clsfCd"
              >
                항목코드
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-clsfCd"
                name="clsfCd"
                value={params.clsfCd}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-clsfCdNm"
              >
                항목코드명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-clsfCdNm"
                name="clsfCdNm"
                value={params.clsfCdNm}
                onChange={handleSearchChange}
                fullWidth
                inputProps={{ maxLength: 50 }}
              />
            </div>
            <div className="form-group" style={{ width: 'inherit' }}>
              <CustomFormLabel className="input-label-display">
                사용여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="useYn"
                value={params.useYn}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={<CustomRadio id="chk_Y" name="useYn" value="Y" />}
                  label="사용"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_N" name="useYn" value="N" />}
                  label="미사용"
                />
              </RadioGroup>
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button
              onClick={handleOpen}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      <Box>
        <TableDataGrid
          headCells={starAcmHc}
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          onPaginationModelChange={handlePaginationModelChange}
          pageable={pageable}
          onActionClick={handleActionClick}
        />
      </Box>

      <>
        {isOpen && (
          <FormModal
            selectedRow={selectedRow}
            formType={formType}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            reloadFunc={handleReload}
          />
        )}
      </>
    </PageContainer>
  )
}

export default DataList
