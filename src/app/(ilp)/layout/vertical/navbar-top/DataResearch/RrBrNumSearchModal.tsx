import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { HeadCell, Pageable2 } from 'table'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import CarNumberSearchModal, { Row } from './CarNumberSearchModal'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import HaveCardHisModal from './HaveCardHisModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface TxBeneInfoModalProps {
  open: boolean
  onCloseClick: () => void
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const RrBrNumSearchModal = (props: TxBeneInfoModalProps) => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [excelLoading, setExcelLoading] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row>()

  const { open, onCloseClick } = props

  const [openHaveCardSearchModal, setOpenHaveCardSearchModal] =
    useState<boolean>(false)

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })

  const headCells: HeadCell[] = [
    {
      id: 'Detail',
      numeric: false,
      disablePadding: false,
      label: '소유카드조회',
      format: 'button',
      button: {
        label: 'Q',
        color: 'primary', // 버튼 색상
        onClick: (row: Row) => {
          setSelectedRow(row)
          setOpenHaveCardSearchModal(true)
        },
      },
    },
    {
      id: 'locgovNm',
      numeric: false,
      disablePadding: false,
      label: '관할관청',
    },
    {
      id: 'vhclNo',
      numeric: false,
      disablePadding: false,
      label: '차량번호',
    },
    {
      id: 'vhclNm',
      numeric: false,
      disablePadding: false,
      label: '성명',
    },
    {
      id: 'vhclPsnNm',
      numeric: false,
      disablePadding: false,
      label: '소유구분',
    },
    {
      id: 'vonrBrno',
      numeric: false,
      disablePadding: false,
      label: '사업자등록번호',
      format: 'brno'
    },
    {
      id: 'vonrRrnoSe',
      numeric: false,
      disablePadding: false,
      label: '주민등록번호',
      format: 'rrno'
    },
    {
      id: 'vhclTonNm',
      numeric: false,
      disablePadding: false,
      label: '톤수',
    },
    {
      id: 'koiNm',
      numeric: false,
      disablePadding: false,
      label: '유종',
    },
    {
      id: 'dcNm',
      numeric: false,
      disablePadding: false,
      label: '할인상태',
    },
    {
      id: 'vhclSttsNm',
      numeric: false,
      disablePadding: false,
      label: '차량상태',
    },
  ]

  useEffect(() => {
    setRows([])
    if (open == true) setFlag((prev) => !prev)
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    if (!(params.vonrRrno || params.vonrBrno)) {
      alert('주민등록번호 혹은 사업자등록번호 중 최소 1개는 입력해주세요.')
      return
    }
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      ///fsm/stn/vm/tx/getVhcleFlnmMngTx
      let endpoint: string =
        `/fsm/cmm/cmmn/cp/getAllCarList?` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}`

      console.log(' 법인주민 endpoint ', endpoint)

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        console.log(' 법인주민 결과 데이터 ', response.data)
        setRows(response.data)
        setTotalRows(response.data.length)
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
  const excelDownload = async () => {

    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      setExcelLoading(true)

      let endpoint: string =
        `/fsm/cmm/cmmn/cp/getAllCarExcel?` +
        `${params.vonrRrno ? '&vonrRrno=' + params.vonrRrno : ''}` +
        `${params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}`
      await  getExcelFile(endpoint, '주민/법인등록번호_' + getToday() + '.xlsx')

      setExcelLoading(false)
  } catch (error) {
    alert(error)
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

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={onCloseClick}
        >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>주민/법인등록번호 검색</h2>
            </CustomFormLabel>

            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => excelDownload()}
              >
                엑셀
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
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
                    htmlFor="ft-vonrRrno"
                  >
                    <span className="required-text">*</span>주민/법인등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vonrRrno"
                    name="vonrRrno"
                    value={params.vonrRrno}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vonrBrno"
                  >
                    <span className="required-text">*</span>사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vonrBrno"
                    name="vonrBrno"
                    value={params.vonrBrno}
                    onChange={handleSearchChange}
                    fullWidth
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
              loading={loading} // 로딩여부
              // totalRows={totalRows}
              // onRowClick={onRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              paging={false}
              cursor={false}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
        <LoadingBackdrop open={excelLoading} />
        
      </Dialog>

      {selectedRow && (
        <HaveCardHisModal
          open={openHaveCardSearchModal}
          vonrRrno={selectedRow?.vonrRrno ?? ''}
          onCloseClick={() => {
            setSelectedRow(undefined)
            setOpenHaveCardSearchModal(false)
          }}
        />
      )}
    </Box>
  )
}

export default RrBrNumSearchModal
