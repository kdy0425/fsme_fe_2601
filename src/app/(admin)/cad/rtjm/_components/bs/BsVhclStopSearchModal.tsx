import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'
import { Row } from './page'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface BsVhclStopSearchModalProps {
  open: boolean
  handleClickClose: () => void
  data: Row
}

const headCells: HeadCell[] = [
  {
    id: 'statusType',
    numeric: false,
    disablePadding: false,
    label: '구분',
  },
  {
    id: 'bgngYmd',
    numeric: false,
    disablePadding: false,
    label: '시작일자',
    format: 'yyyymmdd',
  },
  {
    id: 'endYmd',
    numeric: false,
    disablePadding: false,
    label: '종료일자',
    format: 'yyyymmdd',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'rprsvRrno',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format: 'rrno',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '등록지자체',
  },
  {
    id: 'rsnCn',
    numeric: false,
    disablePadding: false,
    label: '비고',
  },
]

export interface LocgovRow {
  ctpvCd: string //시도코드
  ctpvNm: string //시도명
  locgovNm: string //관할관청명
  locgovCd: string //관할관청코드
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BsVhclStopSearchModal = (props: BsVhclStopSearchModalProps) => {
  const { open, handleClickClose, data } = props

  const [rows, setRows] = useState<LocgovRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    locgovNm: '',
  })

  useEffect(() => {
    setRows([])
  }, [open])

  useEffect(() => {
    if (open) fetchData()
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cad/rtjm/bs/getAllPymntStopRfidTagJdgmnMng?` +
        `&vhclNo=${data.vhclNo}` +
        `&brno=${data.brno}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.content.length)
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({
        ...prev,
        page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
        size: pageSize,
      }))
    },
    [],
  )

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={handleClickClose}
        PaperProps={{
          style: {
            width: '1100px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>보조금지급정지/거절 및 차량휴지 내역 조회</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vhclNo"
                    text={data?.vhclNo}
                    value={data?.vhclNo}
                  />
                </div>
              </div>
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
              caption={"보조금지급정지/거절 및 차량 휴지 목록 조회"}
            />
          </Box>
          {/* 테이블영역 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsVhclStopSearchModal
