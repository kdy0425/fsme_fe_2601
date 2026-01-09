'use client'

/* React */
import React, { useEffect, useState, useCallback, useContext } from 'react'
import { usePathname } from 'next/navigation'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import UserAuthContext from '@/app/components/context/UserAuthContext'

/* mui component */
import { Box, Button } from '@mui/material'
import { Breadcrumb } from '@/utils/fsms/fsm/mui-imports'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'


/* type */
import { Pageable2 } from 'table'
import { ilpFaqeHc } from '@/utils/fsms/headCells2'

/* redux-toolkit */
import { useSelector, useDispatch } from '@/store/hooks'
import { handleIlpBoardOpen } from '@/store/popup/IlpBoardSlice'

import BoardModal from '../../_components/board/BoardModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '업무지원',
  },
  {
    title: '커뮤니티',
  },
  {
    to: 'ilp/faq',
    title: 'FAQ',
  },
]

export interface CustomFile {
  atchSn: string //첨부일련번호
  bbscttSn: string //게시글일련번호
  fileSize: string //파일용량
  lgcFileNm: string //논리파일명
  mdfcnDt: string //수정일시
  mdfrId: string //수정자아이디
  physFileNm: string // 물리파일명
  regDt: string // 등록일시
  rgtrId: string // 등록자아이디
}

export interface Row {
  bbsSn: string
  bbscttSn: string
  relateTaskSeCd: string
  leadCnCd: string    
  inclLocgovCd: string
  locgovNm: string
  userNm: string
  userInfo: string
  oriTtl: string
  ttl: string
  cn: string
  popupNtcYn: string
  popupBgngYmd: string
  popupEndYmd: string
  oriInqCnt: number
  fileCount: string
  inqCnt: number
  useYn: string
  ltrTrsmYn: string
  ltrCn: string
  ltrTtl: string
  msgSendOrder: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  //신규 등록시
  fileList: [CustomFile] | [] // 첨부파일
  files: [File] | []
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  relateTaskSeCd: string
  leadCnCd: string
  srchDtGb: string
  srchDtVal: string
}

const DataList = () => {

  const pathname = usePathname()
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [loading, setLoading] = useState(false) // 로딩여부
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징 객체

   // redux-toolkit
  const { ilpBoardOpen } = useSelector(state => state.IlpBoard)
  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean>(false) // 관리자여부
  const [isMinistry, setIsMinistry] = useState<boolean>(false) // 국토부 담당자여부
  const dispatch = useDispatch()

  useEffect(() => {
    // authInfo에서 roles의 권한 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles.includes('ADMIN'))
      setIsMinistry(authInfo.roles.includes('MOLIT'))
    }
  }, [authInfo])

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    relateTaskSeCd: '',
    leadCnCd: '',
    srchDtGb: '',
    srchDtVal: '',
  })

   useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    try {
      setLoading(true)
      setRows([]) 
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })

      const searchObj: listSearchObj = {
        ...params,
        srchDtGb: params.srchDtVal.trim() ? params.srchDtGb : '',
      }

      const endpoint = '/ilp/faq/getAllBoardDtl' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
          // 데이터 조회 성공시
          setRows(
            response.data.content.map((row: Row) => {
              return {
                ...row,
                color: row.popupNtcYn === 'Y' ? 'orange' : 'black',
              }
            }),
          )
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
    dispatch(handleIlpBoardOpen({ boardType: 'FAQ', openType: 'VIEW', bbscttSn: row.bbscttSn }))
  }, [])

  // 등록
  const handleOpen = (): void => {
    dispatch(handleIlpBoardOpen({ boardType: 'FAQ', openType: 'CREATE', bbscttSn: '' }))
  }

  // 재조회
  const handleReload = useCallback((): void => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
  }, [])

  return (
    <PageContainer title="FAQ" description="FAQ">
      {/* breadcrumb */}
      <Breadcrumb title="FAQ" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form"
         onSubmit={handleAdvancedSearch} 
         sx={{ mb: 2 }}
      >
        {/* 검색영역 시작 */}
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-leadCnCd"
              >
                구분
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="ILP115"
                pValue={params.leadCnCd}
                handleChange={handleSearchChange}
                pName="leadCnCd"
                htmlFor={'sch-leadCnCd'}
                addText='전체'
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-relateTaskSeCd"
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

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              검색
            </Button>
            { isAdmin || isMinistry  ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
            >
              등록
            </Button>
            ) : null}
          </div>
        </Box>
      </Box>


      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilpFaqeHc} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          caption="{FAQ}"
          paging={true}
          cursor={true}
        />
      </Box>

       <>
          {ilpBoardOpen && pathname === '/ilp/faq' && (
            <BoardModal handleReload={handleReload} />
          )}
        </>
      {/* 테이블영역 끝 */}
    </PageContainer>
  )
}

export default DataList