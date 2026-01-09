import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  sendHttpFileRequest,
  sendHttpRequest,
} from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { brNoFormatter, formatKorYearMonth } from '@/utils/fsms/common/util'

import { HeadCell, Pageable2 } from 'table'

interface BsnmSbsidySetlModal {
  title: string
  url: string
  open: boolean
  row: any
  onCloseClick: (row: any) => void
}

const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
    align: 'td-left',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vhclSeNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
  {
    id: 'dlngYmdtm',
    numeric: false,
    disablePadding: false,
    label: '거래일시',
    format: 'yyyymmddhh24miss',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '주유소명',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '거래유종',
  },
  {
    id: 'lbrctStleNm',
    numeric: false,
    disablePadding: false,
    label: '주유형태',
  },
  {
    id: 'fuelQty',
    numeric: false,
    disablePadding: false,
    label: '연료량',
    format: 'number',
    align: 'td-right,',
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'ftxAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'opisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'splitYn',
    numeric: false,
    disablePadding: false,
    label: '분할결제여부',
  },
  {
    id: 'unsetlAmt',
    numeric: false,
    disablePadding: false,
    label: '미결제금액',
    format: 'number',
    align: 'td-right',
  },
]

export interface SetleRow {
  brno: string
  bzentyNm: string
  vhclNo: string
  vhclSeNm: string
  dlngYmdtm: string
  cardSeNm: string
  crdcoNm: string
  cardNoS: string
  frcsNm: string
  koiNm: string
  lbrctStleNm: string
  fuelQty: string
  asstAmt: string
  ftxAsstAmt: string
  opisAmt: string
  splitYn: string
  unsetlAmt: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const BsnmSbsidySetlModal = (props: BsnmSbsidySetlModal) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<SetleRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [isExcelProcessing, setIsExcelProcessing] = useState<boolean>(false)

  const { title, url, open, row, onCloseClick } = props

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 5, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  useEffect(() => {
    setParams({
      page: 1, // 페이지 번호는 1부터 시작
      size: 10, // 기본 페이지 사이즈 설정
    })
    fetchData()
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string = `${url}?page=${params.page}&size=${params.size}&crdcoCd=${row.crdcoCd}&clclnYm=${row.clclnYm}&locgovCd=${row.locgovCd}&brno=${row.brno}&koiCd=${row.koiCd}&prttnYn=${row.prttnYn}`
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

  const excelDownload = async () => {
    setIsExcelProcessing(true)
    let endpoint: string =
      `/fsm/cal/lpd/bs/getExcelBsnmSbsidySetlCur?` +
      `${row.crdcoCd ? '&crdcoCd=' + row.crdcoCd : ''}` +
      `${row.clclnYm ? '&clclnYm=' + row.clclnYm : ''}` +
      `${row.locgovCd ? '&locgovCd=' + row.locgovCd : ''}` +
      `${row.brno ? '&brno=' + row.brno : ''}` +
      `${row.koiCd ? '&koiCd=' + row.koiCd : ''}` +
      `${row.prttnYn ? '&prttnYn=' + row.prttnYn : ''}`

    const response = await sendHttpFileRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '결제된 외상거래내역.xlsx')
    document.body.appendChild(link)
    link.click()
    setIsExcelProcessing(false)
  }

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

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={onCloseClick}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <DialogTitle id="alert-dialog-title1">
              <span className="popup-title">{title}</span>
            </DialogTitle>
            <div className=" button-right-align">
              <Button
                onClick={() => excelDownload()}
                variant="contained"
                color="success"
              >
                엑셀
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* 검색영역 시작 */}
          <Box component="form" sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    청구년월
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={formatKorYearMonth(row?.clclnYm)}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-brno"
                  >
                    사업자번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-brno"
                    name="brno"
                    value={brNoFormatter(row?.brno)}
                    disabled
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
                    value={row?.bzentyNm}
                    disabled
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
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
              cursor={false}
              caption={'commonPagingBs'}
            />
          </Box>
          {/* 테이블영역 끝 */}
          <LoadingBackdrop open={isExcelProcessing} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsnmSbsidySetlModal
