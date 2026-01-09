'use client'

/* react */
import React, { useEffect, useState, useCallback } from 'react'

/* mui component */
import { BlankCard } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, FormControlLabel, RadioGroup } from '@mui/material'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { Pageable2 } from 'table'
import { ilpCmGroupHC, ilpCmCmmnHC } from '@/utils/fsms/headCells2'

/* ./component */
import FormModal from './_components/FormModal'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '시스템관리',
  },
  {
    title: '시스템관리',
  },
  {
    to: '/ilp/cm',
    title: '코드관리',
  },
]

interface GroupRow {
  cdGroupNm: string // 코드그룹명
  cdKornNm: string // 코드그룹한글명
  cdSeNm: string // 코드구분명?
  cdExpln: string // 코드설명
  useYn: string // 사용여부
  useNm: string // 사용여부 한글 (사용 / 미사용)
  comCdYn: string // 공통코드여부
}

interface CmmnRow {
  cdGroupNm: string // 코드그룹명
  cdNm: string // 코드명
  cdKornNm: string // 코드그룹한글명
  cdExpln: string // 코드설명
  cdSeq: string // 코드 순서
  useYn: string // 사용여부
  useNm: string // 사용여부 한글 (사용 / 미사용)
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  cdGroupNm: string
  groupCdKornNm: string
  groupUseYn: string
  cmmnUseYn: string
  cdNm: string
  cmmnCdKornNm: string
}

export type modalDataType = {
  cdGroupNm: string
  cdNm: string
  cdKornNm: string
  cdExpln: string
  cdSeNm: string
  cdSeq: string
  useYn: string
  comCdYn: string
}

export type formType = 'create' | 'update'
export type dataType = 'group' | 'code'

const DataList = () => {

  // 코드 그룹
  const [groupFlag, setGroupFlag] = useState<boolean | null>(null) // 데이터 갱신을 위한 플래그 설정
  const [groupRows, setGroupRows] = useState<GroupRow[]>([]) // 가져온 로우 데이터
  const [groupTotalRows, setGroupTotalRows] = useState<number>(0) // 총 수
  const [groupLoading, setGroupLoading] = useState<boolean>(false) // 로딩여부
  const [groupSelectedRowIndex, setGroupSelectedRowIndex] = useState<number>(0) // 선택된 로우 인덱스
  const [groupSelectedRow, setGroupSelectedRow] = useState<GroupRow | undefined>(undefined) // 선택된 로우
  const [groupPageable, setGroupPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징객체

  // 공통 코드
  const [cmmnRows, setCmmnRows] = useState<CmmnRow[]>([]) // 가져온 로우 데이터
  const [cmmnTotalRows, setCmmnTotalRows] = useState<number>(0) // 총 수
  const [cmmnLoading, setCmmnLoading] = useState<boolean>(false) // 로딩여부
  const [cmmnPageable, setCmmnPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }) // 페이징객체

  // 검색조건
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    cdGroupNm: '',
    groupCdKornNm: '',
    cmmnUseYn: 'Y',
    groupUseYn: 'Y',
    cdNm: '',
    cmmnCdKornNm: '',
  })

  // 모달 상태관리
  const [modalData, setModalData] = useState<modalDataType>({
    cdGroupNm: '',
    cdExpln: '',
    useYn: '',
    cdKornNm: '',
    cdSeNm: '',
    comCdYn: '',
    cdSeq: '',
    cdNm: '',
  })
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [formType, setFormType] = useState<formType>('create')
  const [dataType, setDataType] = useState<dataType>('group')

  // 플래그를 통한 데이터 갱신
  useEffect(() => {
    if (groupFlag !== null) {
      fetchData()
    }
  }, [groupFlag])

  useEffect(() => {
    if (groupSelectedRow) {
      fetchCodeData(1, 10)
    }
  }, [groupSelectedRow])

  useEffect(() => {
    if (!isOpen) {
      setModalData({
        cdGroupNm: '',
        cdExpln: '',
        useYn: '',
        cdKornNm: '',
        cdSeNm: '',
        comCdYn: '',
        cdSeq: '',
        cdNm: '',
      })
    }
  }, [isOpen])

  // 그룹데이터 삭제
  const resetGroupData = (): void => {
    setGroupRows([])
    setGroupTotalRows(0)
    setGroupSelectedRowIndex(-1)
    setGroupSelectedRow(undefined)
    setGroupPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // 공통코드 삭제
  const resetCmmnData = (): void => {
    setCmmnRows([])
    setCmmnTotalRows(0)
    setCmmnPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    resetGroupData()
    resetCmmnData()
    setGroupLoading(true)

    try {

      // 검색 조건에 맞는 endpoint 생성
      const searchObj = {
        page: params.page,
        size: params.size,
			  cdGroupNm: params.cdGroupNm,
			  cdKornNm: params.groupCdKornNm,
			  useYn: params.groupUseYn,
      }

      const endpoint = '/fsm/sym/cc/cm/getAllCmmnCdGroup' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length !== 0) {
        // 데이터 조회 성공시
        setGroupRows(response.data.content)
        setGroupTotalRows(response.data.totalElements)
        setGroupPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        handleRowClick(response.data.content[0], 0)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setGroupLoading(false)
    }
  }

  // row클릭시
  const handleRowClick = useCallback((row: GroupRow, index?: number) => {
    setGroupSelectedRow(row)
    setGroupSelectedRowIndex(index ?? -1)
  }, [])

  const fetchCodeData = useCallback(async (page: number, pageSize: number) => {

    if (groupSelectedRow) {

      resetCmmnData()
      setCmmnLoading(true)

      try {

        const searchObj = {
          page: page,
          size: pageSize,
          cdGroupNm: groupSelectedRow.cdGroupNm,
          cdNm: params.cdNm,
          cdKornNm: params.cmmnCdKornNm,
          useYn: params.cmmnUseYn,
        }

        const endpoint = '/fsm/sym/cc/cm/getAllCmmnCd' + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

        if (response && response.resultType === 'success' && response.data.content.length !== 0) {
          // 데이터 조회 성공시
          setCmmnRows(response.data.content)
          setCmmnTotalRows(response.data.totalElements)
          setCmmnPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })
        }
      } catch (error) {
        // 에러시
        console.error('Error fetching data:', error)
      } finally {
        setCmmnLoading(false)
      }
    }
  }, [groupSelectedRow, groupFlag])

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setGroupFlag(prev => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const groupHandlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setGroupFlag((prev) => !prev)
  }, [])

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const cmmnHandlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    fetchCodeData(page, pageSize)
  }, [groupSelectedRow, groupFlag])

  // 검색조건수정
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // 코드그룹 수정버튼 클릭
  const onGroupActionClick = useCallback((row: GroupRow, id: string): void => {
    handleOpen('group', 'update', row)
  }, [])

  // 공통코드 수정버튼 클릭
  const onCmmnActionClick = useCallback((row: CmmnRow, id: string): void => {
    handleOpen('code', 'update', row)
  }, [])

  // 재조회
  const handleReload = (): void => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 })) // 첫 페이지로 이동
    setGroupFlag(prev => !prev)
  }

  // 모달오픈
  const handleOpen = (dataType: dataType, formType: formType, row?: any): void => {
    setIsOpen(true)
    setDataType(dataType)
    setFormType(formType)

    // 공통코드 등록시 코드그룹의 코드그룹명을 넣어줌
    if (dataType === 'code' && formType === 'create') {
      setModalData((prev) => ({ ...prev, cdGroupNm: groupSelectedRow?.cdGroupNm ?? '' }))
    }
    
    if (formType === 'update') {
      setModalData({
        cdGroupNm: row?.cdGroupNm ?? '',
        cdExpln: row?.cdExpln ?? '',
        useYn: row?.useYn ?? '',
        cdKornNm: row?.cdKornNm ?? '',
        cdSeNm: row?.cdSeNm ?? '',
        comCdYn: row?.comCdYn ?? '',
        cdSeq: row?.cdSeq ?? '',
        cdNm: row?.cdNm ?? '',
      })
    }
  }

  return (
    <PageContainer title="코드관리" description="코드관리">
      {/* breadcrumb */}
      <Breadcrumb title="코드관리" items={BCrumb} />
      {/* end breadcrumb */}

      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cdGroupNm"
              >
                코드그룹명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdGroupNm"
                name="cdGroupNm"
                value={params.cdGroupNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-groupCdKornNm"
              >
                코드그룹한글명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdKornNm"
                name="groupCdKornNm"
                value={params.groupCdKornNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group" style={{ width: 'inherit' }}>
              <CustomFormLabel className="input-label-display">
                코드그룹 사용여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="groupUseYn"
                value={params.groupUseYn}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={<CustomRadio id="chk_Y" name="groupUseYn" value="Y" />}
                  label="사용"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_N" name="groupUseYn" value="N" />}
                  label="미사용"
                />
              </RadioGroup>
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cdNm"
              >
                코드명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cdNm"
                name="cdNm"
                value={params.cdNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-cmmnCdKornNm"
              >
                코드한글명
              </CustomFormLabel>
              <CustomTextField
                type="text"
                id="ft-cmmnCdKornNm"
                name="cmmnCdKornNm"
                value={params.cmmnCdKornNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group" style={{ width: 'inherit' }}>
              <CustomFormLabel className="input-label-display">
                공통코드 사용여부
              </CustomFormLabel>
              <RadioGroup
                row
                id="cmmnUseYn"
                value={params.cmmnUseYn}
                onChange={handleSearchChange}
                className="mui-custom-radio-group"
              >
                <FormControlLabel
                  control={<CustomRadio id="chk_Y" name="cmmnUseYn" value="Y" />}
                  label="사용"
                />
                <FormControlLabel
                  control={<CustomRadio id="chk_N" name="cmmnUseYn" value="N" />}
                  label="미사용"
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
          </div>
        </Box>
      </Box>
      {/* 검색영역 끝 */}

      {/* 코드그룹 테이블영역 시작 */}
      <BlankCard
        className="contents-card"
        title="코드그룹"
        buttons={[
          {
            label: '등록',
            onClick: () => handleOpen('group', 'create'),
            color: 'outlined',
          },
        ]}
      >
        <Box>
          <TableDataGrid
            headCells={ilpCmGroupHC} // 테이블 헤더 값
            rows={groupRows} // 목록 데이터
            totalRows={groupTotalRows} // 총 로우 수
            selectedRowIndex={groupSelectedRowIndex}
            loading={groupLoading} // 로딩여부
            onRowClick={handleRowClick} // 행 클릭 핸들러 추가
            onPaginationModelChange={groupHandlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            pageable={groupPageable} // 현재 페이지 / 사이즈 정보
            onActionClick={onGroupActionClick}
            caption={"코드그룹 조회 목록"}
          />
        </Box>
      </BlankCard>
      {/* 코드그룹 테이블영역 끝 */}

      {/* 공통코드 테이블영역 시작 */}
      <BlankCard
        className="contents-card"
        title="공통코드"
        buttons={[
          {
            label: '등록',
            disabled: groupSelectedRow === undefined || groupSelectedRowIndex === -1,
            onClick: () => handleOpen('code', 'create'),
            color: 'outlined',
          },
        ]}
      >
        <Box>
          <TableDataGrid
            headCells={ilpCmCmmnHC} // 테이블 헤더 값
            rows={cmmnRows} // 목록 데이터
            loading={cmmnLoading} // 로딩여부
            onPaginationModelChange={cmmnHandlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
            totalRows={cmmnTotalRows} // 총 로우 수
            pageable={cmmnPageable} // 현재 페이지 / 사이즈 정보
            onActionClick={onCmmnActionClick}
            caption={"공통코드 조회 목록"}
          />
        </Box>
      </BlankCard>

      <>
        {isOpen ? (
          <FormModal
            modalData={modalData}
            dataType={dataType}
            formType={formType}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            reloadFunc={handleReload}
          />
        ) : null}
      </>
    </PageContainer>
  )
}

export default DataList
