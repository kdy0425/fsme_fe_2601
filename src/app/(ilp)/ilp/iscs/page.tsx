'use client'

/* React */
import React, { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* mui component */
import { Box, Button } from '@mui/material'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { Pageable2 } from 'table'
import { ilpIscsHC } from '@/utils/fsms/headCells2'

/* redux-toolkit */
import { useSelector, useDispatch } from '@/store/hooks'
import { handleIlpBoardOpen } from '@/store/popup/IlpBoardSlice'

/* 게시판 컴포넌트 */
import BoardModal from '../../_components/board/BoardModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '커뮤니티',
  },
  {
    title: '커뮤니티',
  },
  {
    to: '/ilp/iscs',
    title: '부정수급 사례 공유',
  },
]

interface Row {
  ttl: string
  leadCnCd: string
  relateTaskSeCd: string
  bbscttSn: string
  bbsSn: string
  cn: string
  inqCnt: string
  rgtrId: string
  regDt: string
  userNm: string
  roleNm: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  leadCnCd: string
  relateTaskSeCd: string
  srchDtGb: string
  srchDtVal: string
}

const DataList = () => {

  const pathname = usePathname()

  // 데이터 상태관리
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [loading, setLoading] = useState(false) // 로딩여부  
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수  
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징 객체

  // redux-toolkit
  const { ilpBoardOpen } = useSelector(state => state.IlpBoard)
  const dispatch = useDispatch()

  // 목록 조회를 위한 객체
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    leadCnCd: '',
    relateTaskSeCd: '',
    srchDtGb: '',
    srchDtVal: '',
  })

  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async (): Promise<void> => {

    try {

      setLoading(true)
      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })

      const searchObj: listSearchObj = {
        ...params
        , srchDtGb: params.srchDtVal.trim() !== '' ? params.srchDtGb : ''
      }

      const endpoint = '/ilp/iscs/getAllInstcSpldmdCaseShrn' + toQueryParameter(searchObj)
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
      console.log('fetchData error : ' + error)
    } finally {
      setLoading(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number): void => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setFlag((prev) => !prev)
  }, [])

  // 검색조건 변경
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 검색
  const handleAdvancedSearch = (event: React.FormEvent): void => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }

  // row클릭시
  const handleRowClick = useCallback((row: Row): void => {
    dispatch(handleIlpBoardOpen({ boardType: 'ISCS', openType: 'VIEW', bbscttSn: row.bbscttSn }))
  }, [])

  // 등록
  const handleOpen = (): void => {
    dispatch(handleIlpBoardOpen({ boardType: 'ISCS', openType: 'CREATE', bbscttSn: '' }))
  }

  // 재조회
  const handleReload = useCallback((): void => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }, [])

  return (
    <PageContainer title="부정수급 사례 공유" description="부정수급 사례 공유">
      {/* breadcrumb */}
      <Breadcrumb title="부정수급 사례 공유" items={BCrumb} />

      <Box
        component="form"
        onSubmit={handleAdvancedSearch}
        sx={{ mb: 2 }}
      >
        {/* 검색영역 시작 */}
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-leadCnCd"
                className="input-label-display"
              >
                구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="ISCS"
                pValue={params.leadCnCd}
                handleChange={handleSearchChange}
                pName="leadCnCd"
                htmlFor={'sch-leadCnCd'}
                addText="전체"
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-relateTaskSeCd"
                className="input-label-display"
              >
                업무구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="ILP117"
                pValue={params.relateTaskSeCd}
                handleChange={handleSearchChange}
                pName="relateTaskSeCd"
                htmlFor={'sch-relateTaskSeCd'}
                addText="전체"
              />
            </div>
          </div>
          <hr />
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                htmlFor="sch-srchDtGb"
                className="input-label-display"
              >
                검색
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="898"
                pValue={params.srchDtGb}
                handleChange={handleSearchChange}
                pName="srchDtGb"
                htmlFor={'sch-srchDtGb'}
              />
            </div>
            <div className="form-group">
              <CustomTextField
                id="ft-srchDtVal"
                name="srchDtVal"
                value={params.srchDtVal}
                onChange={handleSearchChange}
                fullWidth
                style={{ width: '193%' }}
              />
            </div>
          </div>
        </Box>

        {/* 버튼영역 시작 */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              검색
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
            >
              등록
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilpIscsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption={"부정수급 사례 공유"}
          onRowClick={handleRowClick}
        />
      </Box>

      <>
        {ilpBoardOpen && pathname === '/ilp/iscs' && (
          <BoardModal handleReload={handleReload} />
        )}
      </>

    </PageContainer>
  )
}

export default DataList
