import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

import { Pageable2 } from 'table'
import { vhclModalTrHC } from '@/utils/fsms/headCells'
import {
  CtpvSelect,
  CtpvSelectAll,
  LocgovSelect,
  LocgovSelectAll,
} from '../../tx/commSelect/CommSelect'
import { useDispatch, useSelector } from '@/store/hooks'
import {
  setCarInfo,
  clearCarInfo,
  closeCarModal,
} from '@/store/popup/CarInfoSlice'
import { AppState } from '@/store/store'
import { usePathname } from 'next/navigation'

export interface TrVhclRow {
  vhclNo: string //차량번호
  locgovNm: string //관할관청
  brno: string //사업자번호
  bzentyNm: string //업체명
  rprsvRrno: string //수급자주민번호
  koiCd: string //유종코드
  vhclSeCd: string //면허업종코드
  delYn: string //삭제여부
  dscntYn: string //할인여부
  locgovAprvYn: string //지자체승인여부
  crno: string //법인등록번호
  rprsvNm: string //대표자명
  zip: string //우편번호
  addr: string //주소
  telno: string //전화번호
  locgovCd: string //관할관청코드
  vhclSttsCd: string //차량상태코드
  vhclTonCd: string //차량톤수코드
  rfidYn: string //RFID차량여부
  rgtrId: string //등록자아이디
  regDt: string //등록일자
  mdfrId: string //수정자아이디
  mdfcnDt: string //수정일자
  vhclSttsNm: string //차량상태
  dscntNm: string //할인여부
  koiNm: string //유종
  vhclSeNm: string //면허업종
  bzmnSeNm: string //개인법인구분
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  vonrNm: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

export const TrVhclModal = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<TrVhclRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const carInfo = useSelector((state: AppState) => state.carInfo)
  const dispatch = useDispatch()

  const reduxString =
    'vhclNo$locgovCd$crnoDe$koiCd$koiNm$vhclTonCd$lcnsTpbizCd$vhclSeCd$vhclRegYmd$yridnw$len$bt$maxLoadQty$vhclSttsCd$vonrRrnoSe$vonrRrnoDe$vonrRrno$vonrNm$delYn$dscntYn$souSourcSeCd$bscInfoChgYn$locgovAprvYn$locgovNm$vonrBrno$vhclPsnCd$prcsSttsCd$isTodayStopCancel'

  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 5, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    if (carInfo.modalOpen) {
      setInitialState()
      dispatch(clearCarInfo())
    }
  }, [carInfo.modalOpen])

  useEffect(() => {
    if (flag) {
      fetchData()
    }
  }, [flag])

  const handleReturnData = (row: any) => {
    const obj: { [key: string]: string } = {}
    reduxString.split('$').forEach((value: string, index: number) => {
      obj[`${value}CM`] = row[`${value}`]
    })
    /**
     * {
     *  vhclNoCM: '',
     *  locgovCdCM: '',
     *  crnoDeCM: '',
     *  ...
     *  }
     *  방식으로 객체가 생성됨
     */
    dispatch(setCarInfo(obj))
  }

  const handleReturnDataAndClose = (row: any) => {
    handleReturnData(row)
    dispatch(closeCarModal())
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setInitialState()
    try {
      if (!params.ctpvCd) {
        alert('시도명을 선택해주세요.')
        return
      }

      if (!params.locgovCd) {
        alert('관할관청을 선택해주세요.')
        return
      }

      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/ltmm/tr/pop/getUserVhclInfo?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber +1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setInitialState()
      }
    } catch (error) {
      // 에러시
      setInitialState()
    } finally {
      setLoading(false)
    }
  }

  const handleClickClose = () => {
    dispatch(closeCarModal())
    setInitialState()
  }

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  // 페이지 이동 감지 시작 //
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(true)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={carInfo.modalOpen}
        onClose={() => handleClickClose()}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량검색</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={fetchData}>
                검색
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => handleClickClose()}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                {/* 시도 조회조건 */}
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

                {/* 관할관청 조회조건 */}
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
              </div>
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel className="input-label-display">
                    <span className="required-text">*</span>소유자명
                  </CustomFormLabel>
                  <CustomTextField
                    name="vonrNm"
                    value={params.vonrNm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={vhclModalTrHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={(row: any) => handleReturnData(row)} // 행 클릭 핸들러 추가
              onRowDoubleClick={(row: any) => handleReturnDataAndClose(row)}
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              paging={true}
            />
          </Box>
          {/* 테이블영역 끝 */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TrVhclModal
