'use client'
import { Box, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// utils
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { StatusType } from '@/types/message'

// components
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

// types
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { getDateRange } from '@/utils/fsms/common/util'
import { Pageable2 } from 'table'
import DetailDataGrid from './TrDetailDataGrid'
import { ilgIsdTrHeadCells } from '@/utils/fsms/headCells'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import IlgIsdModal from '@/app/components/tr/popup/IlgIsdModal'
import {
  openIlgIsdModal,
  openIlgIsdUpdateModal,
  setCreateModalMode,
} from '@/store/popup/IlgIsdSlice'
import {
  clearIsdSelectedData,
  setIsdSearchFalse,
  setIsdSelectedData,
} from '@/store/page/IsdSlice'
import IlgIsdUpdateModal from '@/app/components/tr/popup/IlgIsdUpdateModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
  openAdmdspNotieModal,
  setAdmdspNotieInfo,
} from '@/store/popup/AdmdspNotieSlice'
import AdmdspNotieModal from '@/app/components/tr/popup/AdmdspNotieModal'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'

export interface Row {
  no: string
  locgovCd: string
  locgovNm: string
  vhclNo: string
  vonrNm: string
  bizGb: string
  bzmnSeCd: string
  tpbizSeCd: string
  droperYn: string
  apvlCnt: string
  totlAprvAmt: string
  totlAsstAmt: string
  rdmActnAmt: string
  rdmTrgtNocs: string
  exmnRsltCn: string
  exmnRegYn: string
  exmnRegInptId: string
  exmnRegInptDt: string
  exmnRegMdfcnId: string
  exmnRegMdfcnDt: string
  rdmYn: string
  dspsDt: string
  admdspSeCd: string
  admdspRsnCn: string
  admdspBgngYmd: string
  admdspEndYmd: string
  oltPssrpPrtiYn: string
  unlawStrctChgYnCd: string
  dsclMthdCd: string
  pbadmsPrcsYn: string
  pbadmsPrcsRegId: string
  pbadmsPrcsRegDt: string
  pbadmsPrcsMdfcnId: string
  pbadmsPrcsMdfcnDt: string
  aprvYm: string
  giveStopSn: string
  rgtrId: string
  regDt: string
  subVhclNo: string
  vonrRrno: string
  ruleVltnCluCd: string
  oltPssrpPrtiOltNm: string
  oltPssrpPrtiBrno: string
  dsclMthdEtcMttrCn: string
  ruleVltnCluEtcCn: string
  rdmDt: string
  vonrBrno: string
  koiCd: string
  vhclTonCd: string
  instcSpldmdTypeCd: string
  dlngDsctnInptSeCd: string
  useLiter: string
  instcSpldmdAmt: string
  warnYn: string
  giveStopYn: string
  prcsSeCd: string
  handleNm: string
  delYn: string
  rlRdmAmt: string
  dspsPrdCd: string
  cmlcAcstnYn: string
  rdmActnYmd: string
  stopBgngYmd: string
  regEndDt: string
  subInputId: string
  subInputDt: string
  subUpdateId: string
  subUpdateDt: string
  admdspNotieDspsTtl: string
  admdspNotieAddr: string
  admdspNotieClmPrdCn: string
  admdspNotieDspsRsnCn: string
  admdspNotieLglBssCn: string
  admdspNotieClmProcssCn: string
  admdspNotieRegId: string
  admdspNotieMdfcnYmd: string
  admdspNotieRgnMayerNm: string
  trsmYn: string
  cpeaChckYn: string
  cpeaChckCyclVl: string
  exmnNo: string
  dlngNocs: string
  vhclRestrtYmd: string
  stopEndYmd: string
  exmnRegNocs: string
  brno: string
  ttmKoiCd: string
  regBgngDt: string
  instcSpldmdRsnCn: string
  moliatOtspyYn: string
  bgngYmd: string
  endYmd: string
  pbadmsPrcsSeCd: string
  dsclMthdNm: string
  ruleVltnCluNm: string
  tpbizCd: string
  vonrRrnoSe: string
  admdspSeNm: string
  bfdnAddr: string
  bfdnDspsRsnCn: string
  bfdnDspsTtl: string
  bfdnLglBssCn: string
  changeRegDt: string
}

// 목록 조회시 필요한 조건
type listSearchObj = {
  regBgngDt: string
  regEndDt: string
  ctpvCd: string
  locgovCd: string
  vhclNo: string
  vonrNm: string
  admdspRsnCn: string
  dwGb: string
  instcSpldmdTypeCd: string
  page: number
  size: number
  [key: string]: string | number // 인덱스 시그니처 추가
}

const TrPage = () => {
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 선택된 Row를 저장할 state
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [detailOpen, setDetailOpen] = useState<boolean>(false)

  const isdInfo = useSelector((state: AppState) => state.isdInfo)
  const ilgIsdInfo = useSelector((state: AppState) => state.IlgIsdInfo)
  const admdspNotieInfo = useSelector(
    (state: AppState) => state.AdmdspNotieInfo,
  )
  const dispatch = useDispatch()

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const [params, setParams] = useState<listSearchObj>({
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
    regEndDt: '',
    regBgngDt: '',
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
    admdspRsnCn: '',
    dwGb: '',
    instcSpldmdTypeCd: '',
  })
  //
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  // 플래그를 통한 데이터 갱신
  // 플래그의 변화를 통해 현재 정보를 기준으로 데이터를 가져오기위해 설정
  useEffect(() => {
    if (flag || isdInfo.isdSearchDone) {
      fetchData()
    }
  }, [flag, isdInfo.isdSearchDone])

  // 기본 날짜 세팅 (30일)
  const setDateRange = () => {
    const dateRange = getDateRange('date', 30)

    let regBgngDt = dateRange.startDate
    let regEndDt = dateRange.endDate

    setParams((prev) => ({ ...prev, regBgngDt, regEndDt }))
  }
  // 초기 데이터 로드
  useEffect(() => {
    setDateRange()
  }, [])

  const openCreateIsdModal = () => {
    dispatch(setCreateModalMode())
    dispatch(clearIsdSelectedData())
    dispatch(openIlgIsdModal())
  }

  const openUpdateIsdModal = () => {
    if (selectedIndex < 0) {
      alert('수정할 정보의 행을 선택해주세요')
      return
    }

    dispatch(setIsdSelectedData(rows[selectedIndex]))
    dispatch(openIlgIsdUpdateModal())
  }

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
    setSelectedIndex(-1)
  }

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    setLoading(true)
    setSelectedRow(null)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/ilg/isd/tr/getAllInstcSpldmdDsps?page=${params.page}&size=${params.size}` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.regBgngDt ? '&regBgngDt=' + params.regBgngDt.replaceAll('-', '') : ''}` +
        `${params.regEndDt ? '&regEndDt=' + params.regEndDt.replaceAll('-', '') : ''}` +
        `${params.admdspRsnCn ? '&admdspRsnCn=' + params.admdspRsnCn : ''}` +
        `${params.dwGb ? '&dwGb=' + params.dwGb : ''}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        console.log('성공', response.data.content)

        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
        setSelectedIndex(-1)
        dispatch(setIsdSearchFalse())
      } else {
        // 데이터가 없거나 실패
        console.log(response)

        setInitialState()
        if (response.resultType === 'error') {
          alert(JSON.stringify(response.errors?.[0].reason))
        }
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setInitialState()
    } finally {
      setLoading(false)
      setFlag(false)
    }
  }

  const handleDelete = async () => {
    if (selectedRow?.exmnNo.substring(0, 2) != '99') {
      alert('선택된 차량의 부정수급 조사대상건은 삭제할 수 없습니다.')
      return
    }

    if (!confirm('해당 부정수급 건을 삭제하시겠습니까?')) {
      return
    }

    const requestParam = {
      exmnNo: selectedRow?.exmnNo,
      vhclNo: selectedRow?.vhclNo,
      admdspSeCd: selectedRow?.admdspSeCd,
      bgngYmd: selectedRow?.bgngYmd,
      endYmd: selectedRow?.endYmd,
      changeRegDt: selectedRow?.changeRegDt,
      giveStopSn: selectedRow?.giveStopSn,
      trsmYn: selectedRow?.trsmYn,
    }

    try {
      setIsDataProcessing(true)

      let endpoint: string = `/fsm/ilg/isd/tr/deleteInstcSpldmdDsps`
      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        requestParam,
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        setFlag(true)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error: StatusType | any) {
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }
  // 페이지 이동 감지 시작 //

  const handlePrint = () => {
    if (selectedIndex < 0) {
      alert('행정처분 통지서를 출력 할 행을 선택해주세요')
      return
    }
    //console.log("selectedRow?.admdspNotieDspsRsnCn", selectedRow?.admdspNotieDspsRsnCn);
  
    if (
      ['A', 'C', 'G', 'H', 'S', 'W'].findIndex(
        (value, index) => value === selectedRow?.admdspSeCd,
      ) < 0
    ) {
      alert('행정처분이 된 정보만 출력이 가능합니다.')
      return
    } else {
      dispatch(openAdmdspNotieModal())
      dispatch(
        setAdmdspNotieInfo({
          exmnNoAN: selectedRow?.exmnNo,
          vhclNoAN: selectedRow?.vhclNo,
          vonrNmAN: selectedRow?.vonrNm,
          bfdnAddrAN: selectedRow?.bfdnAddr,
          bfdnDspsRsnCnAN: selectedRow?.bfdnDspsRsnCn,
          bfdnDspsTtlAN: selectedRow?.bfdnDspsTtl,
          bfdnLglBssCnAN: selectedRow?.bfdnLglBssCn,
          admdspSeNmAN: selectedRow?.admdspSeNm,
          admdspNotieDspsTtlAN: selectedRow?.admdspNotieDspsTtl,
          admdspNotieMdfcnYmdAN: selectedRow?.admdspNotieMdfcnYmd,
          admdspNotieAddrAN: selectedRow?.admdspNotieAddr,
          admdspNotieDspsRsnCnAN: selectedRow?.admdspNotieDspsRsnCn !== null ? selectedRow?.admdspNotieDspsRsnCn : '',
          admdspNotieLglBssCnAN: selectedRow?.admdspNotieLglBssCn,
          admdspNotieClmPrdCnAN: selectedRow?.admdspNotieClmPrdCn,
          admdspNotieClmProcssCnAN: selectedRow?.admdspNotieClmProcssCn,
          admdspNotieRgnMayerNmAN: selectedRow?.admdspNotieRgnMayerNm,
          dspsDtAN: selectedRow?.dspsDt,
        }),
      )
    }
  }

  const excelDownload = async () => {
    try {
      let endpoint: string =
        `/fsm/ilg/isd/tr/instcSpldmdDspsExcel?` +
        `${params.ctpvCd ? '&ctpvCd=' + params.ctpvCd : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.vonrNm ? '&vonrNm=' + params.vonrNm : ''}` +
        `${params.regBgngDt ? '&regBgngDt=' + params.regBgngDt.replaceAll('-', '') : ''}` +
        `${params.regEndDt ? '&regEndDt=' + params.regEndDt.replaceAll('-', '') : ''}` +
        `${params.admdspRsnCn ? '&admdspRsnCn=' + params.admdspRsnCn : ''}` +
        `${params.dwGb ? '&dwGb=' + params.dwGb : ''}`

      setIsDataProcessing(true)
      await getExcelFile(endpoint, '부정수급행정처리_' + getToday() + '.xlsx')
    } catch (error) {
      alert(error)
    } finally {
      setIsDataProcessing(false)
    }
  }

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
      page: page, // 실제 DB에서 조회시 -1을 하므로 +1 추가해서 넘겨야함. 페이지는 1로 보이지만 DB에선 0으로 조회
      size: pageSize,
    }))
    setFlag(true)
  }

  // 행 클릭 시 호출되는 함수
  const handleRowClick = (row: Row, index?: number) => {
    if (index === undefined) {
      return
    }
    if (index === selectedIndex) {
      setDetailOpen(!detailOpen)
    } else {
      setDetailOpen(true)
    }
    setSelectedRow(row)
    setSelectedIndex(index)
    dispatch(setIsdSelectedData(row))
  }

  // 페이지 이동 감지 종료 //
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'regBgngDt' || name === 'regEndDt') {
      const otherDateField = name === 'regBgngDt' ? 'regEndDt' : 'regBgngDt'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') fetchData()
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

    if (changedField === 'regBgngDt') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  return (
    <Box>
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
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
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                placeholder=""
                fullWidth
                name="vhclNo"
                value={params.vhclNo} // 빈 문자열로 초기화
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vonrNm"
              >
                소유자명
              </CustomFormLabel>
              <CustomTextField
                id="ft-vonrNm"
                placeholder=""
                fullWidth
                name="vonrNm"
                text={params.vonrNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                등록기간
              </CustomFormLabel>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                등록기간 시작일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-start"
                name="regBgngDt"
                value={params.regBgngDt}
                onChange={handleSearchChange}
                fullWidth
              />
              ~
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                등록기간 종료일
              </CustomFormLabel>
              <CustomTextField
                type="date"
                id="ft-date-end"
                name="regEndDt"
                value={params.regEndDt}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-admdspRsnCn"
              >
                조사내용
              </CustomFormLabel>
              <CustomTextField
                id="ft-admdspRsnCn"
                placeholder=""
                fullWidth
                name="admdspRsnCn"
                value={params.admdspRsnCn}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-dwGb"
              >
                패턴
              </CustomFormLabel>
              <CommSelect
                cdGroupNm={'164'}
                pValue={params.dwGb}
                pName={'dwGb'}
                // width={'30%'}
                handleChange={handleSearchChange}
                addText="선택"
                htmlFor={'sch-dwGb'}
              />
            </div>
          </div>
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button onClick={fetchData} variant="contained" color="primary">
              검색
            </Button>
            <Button
              onClick={openCreateIsdModal}
              variant="contained"
              color="primary"
            >
              등록
            </Button>
            <Button
              onClick={openUpdateIsdModal}
              variant="contained"
              color="primary"
            >
              수정
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              삭제
            </Button>
            <Button onClick={excelDownload} variant="contained" color="success">
              엑셀
            </Button>
            <Button onClick={handlePrint} variant="contained" color="success">
              출력
            </Button>
          </div>
        </Box>
      </Box>
      {/* 검색영역 시작 */}
      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={ilgIsdTrHeadCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>
      {/* 테이블영역 끝 */}

      {selectedIndex > -1 && detailOpen ? (
        <DetailDataGrid
          row={selectedRow as Row} // 목록 데이터
        />
      ) : null}
      {ilgIsdInfo.IISModalOpen ? <IlgIsdModal /> : <></>}
      {ilgIsdInfo.IISUpdateModalOpen ? (
        <IlgIsdUpdateModal row={selectedRow as Row} />
      ) : (
        <></>
      )}
      {admdspNotieInfo.ANModalOpen ? <AdmdspNotieModal /> : <></>}
      <LoadingBackdrop open={isDataProcessing} />
    </Box>
  )
}

export default TrPage
