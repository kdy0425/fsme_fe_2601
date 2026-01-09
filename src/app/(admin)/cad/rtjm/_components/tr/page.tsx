'use client'
import {
  Box,
  DialogContent,
} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import {
  sendHttpRequest,
  sendFormDataWithJwt,
} from '@/utils/fsms/common/apiUtils'
import { useMessageActions } from '@/store/MessageContext'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import {
  CommSelect,
  CtpvSelectAll,
  LocgovSelectAll,
} from '@/app/components/tx/commSelect/CommSelect'

// types
import { listParamObj } from '@/types/fsms/fsm/listParamObj'
import { ApiResponse, ApiError, getCombinedErrorMessage } from '@/types/message'
import {
  rfidTagJudgTrHeadCells,
} from '@/utils/fsms/headCells'
import {
  getDateRange,
  getExcelFile,
  getToday,
  getFormatToday,
} from '@/utils/fsms/common/comm'
import { Pageable2 } from 'table'
import TrDetailDataGrid from './TrDetailDataGrid'

export interface Row {
  rcptYmd: string
  rcptSeqNo: string
  rcptSn: string
  locgovCd: string
  locgovNm: string
  vhclNo: string
  koiCd: string
  koiNm: string
  vhclTonCd: string
  vhclTonNm: string
  vhclSeCd: string
  vhclSeNm: string
  lcnsTpbizCd: string
  lcnsTpbizNm: string
  lbrctStleCd: string
  lbrctStleNm: string
  telno: string
  vonrRrno: string
  vonrRrnoSc: string
  vonrBrno: string
  vonrNm: string
  bzmnSeCd: string
  bzmnSeNm: string
  bzentyNm: string
  rprsvNm: string
  rprsvRrno: string
  crnoEncpt: string
  idntyYmd: string
  flRsnCn: string
  flRsnCd: string
  flRsnNm: string
  brno: string
  crno: string
  rrno: string
  flnm: string
  prcsSttsCd: string
  prcsSttsNm: string
  aprvYn: string
  aprvNm: string
  aprvYmd: string
  errCd: string
  etcCn: string
  delYn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  preVhclNo: string
  preVhclSeCd: string
  preVhclSeNm: string
  preVhclSttsCd: string
  preVhclSttsNm: string
  preLocgovCd: string
  preLocgovNm: string
  preBrno: string
  preCrno: string
  preBzentyNm: string
  preBzmnSeCd: string
  preBzmnSeNm: string
  preRprsvNm: string
  preRprsvRrno: string
  prePrsvRrno: string
  preDscntYn: string
  preKoiCd: string
  preKoiNm: string
  netVhclNo: string
  netNoLbl: string
  netReowUserNo: string
  netReowNm: string
  netLocgovCd: string
  netLocgovNm: string
  netKoiCd: string
  netKoiNm: string
  netUsgDtlSeNm: string
  netScrapNm: string
  netLastUpdate: string
  crdcoCd: string
  crdcoNm: string
  cardNo: string
  cardVldYm: string
  cardSttsCd: string
  crdtCeckSeCd: string
  crdtCeckSeNm: string
  dscntYn: string
  confTyp: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  sort: string
  page: number
  size: number
  searchValue: string
  searchSelect: string
  searchStDate: string
  searchEdDate: string
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TruckPage = () => {
  const querys = useSearchParams() // 쿼리스트링을 가져옴
  const allParams: listParamObj = Object.fromEntries(querys.entries()) // 쿼리스트링 값을 오브젝트 형식으로 담음

  const [flag, setFlag] = useState<boolean | undefined>(undefined) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [excelFlag, setExcelFlag] = useState<boolean>(false)

  const [selectedRow, setSelectedRow] = useState<Row>()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [flRsnCn, setFlRsnCn] = useState<string>('')
  const [flRsnCnLength, setFlRsnCnLength] = useState<number>(0)

  const [refuseModalOpen, setRefuseModalOpen] = useState(false) // 탈락처리모달 상태관리를 위한 플래그

  const { setMessage } = useMessageActions()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: Number(allParams.page ?? 1), // 페이지 번호는 1부터 시작
    size: Number(allParams.size ?? 10), // 기본 페이지 사이즈 설정
    searchValue: allParams.searchValue ?? '', // 검색어
    searchSelect: allParams.searchSelect ?? 'ttl', // 종류
    searchStDate: allParams.searchStDate ?? '', // 시작일
    searchEdDate: allParams.searchEdDate ?? '', // 종료일
    sort: allParams.sort ?? '', // 정렬 기준 추가
  })

  // 페이징 처리를 위한 객체
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  useEffect(() => {
    if (flag != undefined) {
      fetchData()
    }
  }, [flag])

  // 초기 데이터 로드
  useEffect(() => {
    const dateRange = getDateRange('d', 30)

    let startDate = dateRange.startDate
    let endDate = dateRange.endDate

    setParams((prev) => ({
      ...prev,
      searchStDate: startDate,
      searchEdDate: endDate,
    }))
  }, [])

  const schValidation = () => {
    if (!params.ctpvCd) {
      alert('시도명을 선택해주세요.')
    } else if (!params.searchStDate || !params.searchEdDate) {
      alert('접수일자를 입력해주세요.')
    } else {
      return true
    }
    return false
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setSelectedRow(undefined)
    setSelectedIndex(-1)
    setLoading(true)
    try {
      if (schValidation()) {
        // 검색 조건에 맞는 endpoint 생성
        let endpoint: string =
          `/fsm/cad/rtjm/tr/getAllRfidTagJdgmnMng?page=${params.page}&size=${params.size}` +
          `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
          `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
          `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
          `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
          `${params.searchStDate ? '&startRcvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
          `${params.searchEdDate ? '&endRcvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`

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
            totalPages: response.data.totalPages, // totalCount는 pageable 객체 밖에
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
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
      setExcelFlag(true)
    }
  }

  // 데이터 상세조회
  const fetchDetailData = async (row: Row) => {
    setSelectedRow(row)
  }

  const approveReceiptTr = async (selectedRow: Row | undefined) => {
    if (selectedRow == undefined) {
      alert('행을 선택해주시기 바랍니다.')
      return
    } else {
      if (selectedRow?.prcsSttsCd != '02') {
        alert('심사처리상태가 심사요청인 데이터만 승인처리 할 수 있습니다.')
        return
      }
    }

    if (confirm('태그 발급을 승인하시겠습니까?')) {
      await approveReceiptSubmitTr(selectedRow)
    }
  }

  const approveReceiptSubmitTr = async (row: Row | undefined) => {
    const formData = new FormData()
    const endpoint: string = `/fsm/cad/rtjm/tr/approveRfidTagJdgmnMng`

    if (row != undefined) {
      formData.append('rcptSeqNo', row?.rcptSeqNo as string)

      try {
        const postResponseData: ApiResponse = await sendFormDataWithJwt(
          'PUT',
          endpoint,
          formData,
          true,
        )
        setMessage({
          resultType: postResponseData.resultType,
          status: postResponseData.status,
          message: postResponseData.message,
        })

        //router.push('/cad/rtjm')
        setFlag((prev) => !prev)
      } catch (error) {
        if (error instanceof ApiError) {
          switch (error.resultType) {
            case 'fail':
              //유효성검사 오류
              setMessage({
                resultType: 'error',
                status: error.status,
                message: getCombinedErrorMessage(error),
              })
              break
            case 'error':
              // 'error'는 서버 측 오류
              setMessage({
                resultType: 'error',
                status: error.status,
                message: error.message,
              })
              break
          }
        }
      }
    }
  }

  const refuseReceiptTr = async (selectedRow: Row | undefined) => {
    if (selectedRow == undefined) {
      alert('행을 선택해주시기 바랍니다.')
      return
    } else {
      if (selectedRow?.prcsSttsCd != '02') {
        alert('심사처리상태가 심사요청인 데이터만 탈락처리 할 수 있습니다.')
        return
      }
    }

    setFlRsnCn('')
    setFlRsnCnLength(0)
    setRefuseModalOpen(true)
  }

  const refuseReceiptClose = () => {
    setFlRsnCnLength(0)
    setFlRsnCn('')
    setRefuseModalOpen(false)
  }

  const refuseHandleEvent = (val: string) => {
    if (val.length <= 30) {
      setFlRsnCnLength(val.length)
      setFlRsnCn(val.replaceAll(/\n/g, '').replaceAll(/\t/g, ''))
    }
  }

  const refuseReceiptEvent = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (selectedRow == undefined) return
    await refuseReceiptSubmitTr(event.target)
  }

  const refuseReceiptSubmitTr = async (target: any) => {
    const formData = new FormData(target)
    const endpoint: string = `/fsm/cad/rtjm/tr/rejectRfidTagJdgmnMng`

    try {
      const postResponseData: ApiResponse = await sendFormDataWithJwt(
        'PUT',
        endpoint,
        formData,
        true,
      )
      setMessage({
        resultType: postResponseData.resultType,
        status: postResponseData.status,
        message: postResponseData.message,
      })

      //router.push('/cad/rtjm')
      refuseReceiptClose()
      setFlag((prev) => !prev)
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.resultType) {
          case 'fail':
            //유효성검사 오류
            setMessage({
              resultType: 'error',
              status: error.status,
              message: getCombinedErrorMessage(error),
            })
            break
          case 'error':
            // 'error'는 서버 측 오류
            setMessage({
              resultType: 'error',
              status: error.status,
              message: error.message,
            })
            break
        }
      }
    }
  }

  // 엑셀 다운로드
  const excelDownload = async () => {
    if (rows.length === 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    let endpoint: string =
      `/fsm/cad/rtjm/tr/getExcelRfidTagJdgmnMng?` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
      `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
      `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
      `${params.prcsSttsCd ? '&prcsSttsCd=' + params.prcsSttsCd : ''}` +
      `${params.startRcvYmd ? '&startRcvYmd=' + params.searchStDate.replaceAll('-', '') : ''}` +
      `${params.endRcvYmd ? '&endRcvYmd=' + params.searchEdDate.replaceAll('-', '') : ''}`

      await  getExcelFile(
      endpoint,
      'RFID태그심사관리_화물_' + getToday() + '.xlsx',
    )
  }

  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag((prev) => !prev)
    setExcelFlag(false)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = (page: number, pageSize: number) => {
    setParams((prev) => ({
      ...prev,
      page: page,
      size: pageSize,
    }))
    setFlag((prev) => !prev)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    setSelectedIndex(index ?? -1)
    setSelectedRow(row)
    fetchDetailData(row) // data loading
  }

  // 시작일과 종료일 비교 후 일자 변경
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
    /*if (name === 'searchStDate' || name === 'searchEdDate') {
      const otherDateField =
        name === 'searchStDate' ? 'searchEdDate' : 'searchStDate'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }*/
    setExcelFlag(false)
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'searchStDate') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <>
      {/* 검색영역 시작 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-ctpv"
              >
                <span className="required-text">*</span>
                시도명&nbsp;&nbsp;&nbsp;&nbsp;
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
                htmlFor={'sch-prcsSttsCd'}
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'087'}
                pValue={params.prcsSttsCd}
                handleChange={handleSearchChange}
                pName={'prcsSttsCd'}
                /* width */
                htmlFor={'sch-prcsSttsCd'}
                addText="- 전체 -"
              />
            </div>
          </div><hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" required>
                접수일자
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="searchStDate"
                value={params.searchStDate}
                onChange={handleSearchChange}
                inputProps={{ max: getFormatToday() }}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료일자
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="searchEdDate"
                value={params.searchEdDate}
                onChange={handleSearchChange}
                inputProps={{ min: params.searchStDate, max: getFormatToday() }}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" type="submit" color="primary">
              검색
            </Button>
            <Button variant="contained" color="primary" onClick={() => approveReceiptTr(selectedRow)}>
              승인
            </Button>
            <Button variant="contained" color="error" onClick={() => refuseReceiptTr(selectedRow)}>
              탈락
            </Button>
            <Button variant="contained" color="success" onClick={() => excelDownload()}>
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={
            rfidTagJudgTrHeadCells
          } // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          //onSortModelChange={handleSortModelChange} // 정렬 모델 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={selectedIndex}
          paging={true}
          cursor={true}
          caption={"화물 RFID카드심사 목록 조회"}
        />
      </Box>
      {/* 테이블영역 끝 */}

      {selectedRow && selectedIndex > -1 ? (
        <>
          <CustomFormLabel className="input-label-display">
            <h3>상세정보</h3>
          </CustomFormLabel>
          <TrDetailDataGrid
            row={selectedRow}
            reloadFn={() => fetchData()}
          />
        </>
      ) : (
        <></>
      )}

      {/* 탈락처리 모달 시작 */}
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={refuseModalOpen}
        onClose={refuseReceiptClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h3>탈락처리</h3>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Box component="form">
                <Button
                  variant="contained"
                  color="error"
                  form="refuseForm"
                  type="submit"
                >
                  탈락
                </Button>{' '}
                &nbsp;
                <Button
                  variant="contained"
                  color="dark"
                  onClick={refuseReceiptClose}
                >
                  취소
                </Button>
              </Box>
            </div>
          </Box>
          <Box
            id="refuseForm"
            component="form"
            onSubmit={refuseReceiptEvent}
            sx={{ mb: 2, minWidth: 500 }}
          >
            <div className="table-scrollable">
              <table className="table table-bordered">
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td>
                      <input
                        type="hidden"
                        name="rcptSeqNo"
                        value={selectedRow?.rcptSeqNo}
                      />
                      <textarea
                        name="flRsnCn"
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          marginTop: 5,
                        }}
                        maxLength={100}
                        onChange={(event) =>
                          refuseHandleEvent(event.target.value)
                        }
                        value={flRsnCn}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 15, textAlign: 'right', color: 'black' }}>
              {flRsnCnLength} / 100
            </div>
          </Box>
        </DialogContent>
      </Dialog>
      {/* 탈락처리 모달 종료 */}
    </>
  )
}

export default TruckPage