import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  RadioGroup,
} from '@mui/material'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { HeadCell, Pageable, Pageable2 } from 'table'
import { Row } from '../page'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { parHprDelngHydroPapersReqstHC } from '@/utils/fsms/headCells'

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

interface HyChDeModalProps {
  open: boolean
  data: Row
  onCloseClick: () => void
}

export const HyChDeModal = (props: HyChDeModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([])
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    chk: '01',
  })

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  const { open, onCloseClick, data } = props

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, page: 1, [name]: value }))
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag(true)
  }

  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  useEffect(() => {
    fetchData()
  }, [params.chk])

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  // Fetch를 통해 데이터 갱신, 템플릿을 가져온다
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      // 01 : 전체  02 : 지급확정 03 : 미지급
      let endpoint: string =
        `/fsm/par/hpr/tr/getAllDelngHydroPapersReqst?page=${params.page}&size=${params.size}` +
        `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
        `${data.aplyYm ? '&aplyYm=' + data.aplyYm : ''}` +
        `${data.aplySn ? '&aplySn=' + data.aplySn : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
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
      //setList([]);
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    try {
      setLoadingBackdrop(true)
      let endpoint: string =
        `/fsm/par/hpr/tr/getExcelDelngHydroPapersReqst?` +
        `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}` +
        `${data.aplyYm ? '&aplyYm=' + data.aplyYm : ''}` +
        `${data.aplySn ? '&aplySn=' + data.aplySn : ''}` +
        `${params.chk ? '&chk=' + params.chk : ''}`

      await getExcelFile(
        endpoint,
        '수소충전상세내역' + '_' + getToday() + '.xlsx',
      )
    } catch (error) {
      console.error('ERROR :: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const handleClose = () => {
    setRows([])
    setPageable({
      pageNumber: 1, // 페이지 번호는 1부터 시작
      pageSize: 10, // 기본 페이지 사이즈 설정
      totalPages: 1,
    })
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
      chk: '01',
    })
    onCloseClick()
  }

  return (
    <>
      <Box>
        <Dialog
          fullWidth={true}
          maxWidth={'lg'}
          open={open}
          onClose={onCloseClick}
        >
          <DialogTitle>
            <Box className="table-bottom-button-group">
              <DialogTitle id="alert-dialog-title1">
                <span className="popup-title">{'수소충전상세내역'}</span>
              </DialogTitle>
              <div className=" button-right-align">
                <LoadingBackdrop open={loadingBackdrop} />
                <Button
                  variant="contained"
                  color="success"
                  onClick={excelDownload}
                >
                  엑셀
                </Button>
                <Button variant="contained" color="dark" onClick={handleClose}>
                  닫기
                </Button>
              </div>
            </Box>
          </DialogTitle>
          <DialogContent>
            {/* 검색영역 시작 */}
            <Box
              component="form"
              onSubmit={handleAdvancedSearch}
              sx={{ mb: 2 }}
            >
              <Box className="sch-filter-box">
                <div className="filter-form">
                  <div className="form-group" style={{ marginLeft: '30px' }}>
                    <CustomFormLabel
                      htmlFor="ft-fname-radio-01"
                      className="input-label-none"
                    >
                      보조금 지급여부
                    </CustomFormLabel>
                    <RadioGroup
                      row
                      id="status"
                      name="status"
                      className="mui-custom-radio-group"
                      onChange={handleSearchChange}
                      value={params.chk || ''}
                    >
                      <FormControlLabel
                        control={
                          <CustomRadio id="rdo2_1" name="chk" value="01" />
                        }
                        label="전체"
                      />
                      <FormControlLabel
                        control={
                          <CustomRadio id="rdo2_2" name="chk" value="02" />
                        }
                        label="지급확정"
                      />
                      <FormControlLabel
                        control={
                          <CustomRadio id="rdo2_3" name="chk" value="03" />
                        }
                        label="미지급"
                      />
                    </RadioGroup>
                  </div>
                </div>
              </Box>
            </Box>
            {/* 검색영역 시작 */}

            {/* 테이블영역 시작 */}
            <Box sx={{ mb: 5 }}>
              <TableDataGrid
                headCells={parHprDelngHydroPapersReqstHC} // 테이블 헤더 값
                rows={rows} // 목록 데이터
                totalRows={totalRows} // 총 로우 수
                loading={loading} // 로딩여부
                //onRowClick={() => {}} // 행 클릭 핸들러 추가
                onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
                pageable={pageable}
                paging={true}
                cursor={false}
              />
            </Box>

            {/* 테이블영역 끝 */}
          </DialogContent>
        </Dialog>
      </Box>
    </>
  )
}
export default HyChDeModal
