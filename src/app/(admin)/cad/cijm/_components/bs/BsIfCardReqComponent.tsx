/* React */
import React, { useState, useCallback, useEffect } from 'react'

/* mui component */
import { Grid, Button, RadioGroup, FormControlLabel, Box } from '@mui/material'

/* 공통 component */
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  CommSelect,
  CtpvSelect,
  LocgovSelect,
} from '@/components/tx/commSelect/CommSelect'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* .component */
import BsDetail from './BsDetail'
import BsFlModal from './BsFlModal'
import BsDetailModal from './BsDetailModal'
import BsVhclStopSearchModal from './BsVhclStopSearchModal'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { getDateRange } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { cadCijmBsHC } from '@/utils/fsms/headCells'
import {
  cardNoFormatter,
  rrNoFormatter,
  formatDay,
  brNoFormatter,
} from '@/utils/fsms/common/util'

/* 공통 type, interface */
import { Pageable2 } from 'table'

/* type 선언 */

/* 검색조건 */
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  aprvYn: string
  srchDtGb: string
  bgngDt: string
  endDt: string
  vhclNo: string
  bzentyNm: string
}

export interface Row {
  crdcoCd: string //카드사코드
  issuSeNm: string //발급구분
  rcptYmd: string //접수일자
  locgovNm: string //지자체명
  vhclNo: string //차량번호
  bzentyNm: string //업체명
  brno: string //사업자번호
  crno: string //법인번호
  rprsvNm: string //대표자
  koiCdNm: string //유종
  crdcoNm: string //카드사
  crdtCeckSeCd: string //카드구분
  crdtCeckSeCdNm: string //카드구분명
  cardNoS: string //카드번호
  rcptSn: string //요청일자
  rrnoS: string //대표자주민번호
  rrno: string
  vhclSeCd: string //면허업종
  vhclSeCdNm: string //면허업종명
  stlmCardNo: string //카드번호
  netVhclNo: string //자동차망차량번호
  netNo: string //자동차망법인등록번호
  netFlnm: string //자동차망성명(업체명)
  netLocgovNm: string //자동차망지자체명
  netKoiCd: string //자동차망유종코드
  netKoiNm: string //자동차망유종이름
  netUsgDtlSeCd: string //자동차망면허업종코드
  netUsgDtlSeNm: string //자동차망면허업종
  netScrapNm: string //자동차망폐착여부
  netLastUpdate: string //자동차망최종변경일
  aprvYn: string //승인여부
  detailConfirmYn: string //검토여부
  canconfirmYn: string // 거래, 대체카드일경우 결제카드존재여부
  pauseYn: string //휴지여부
  stopYn: string //정지여부
  lbrctStleNm: string // 주유형태
}

const BsIfCardReqComponent = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    aprvYn: '',
    srchDtGb: '',
    bgngDt: '',
    endDt: '',
    vhclNo: '',
    bzentyNm: '',
  })

  const [rows, setRows] = useState<Row[]>([]) // 조회결과
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [rowIndex, setRowIndex] = useState<number>(-1) // 현재 선택된 로우
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean>(false) // 검색 flag
  const [modalData, setModalData] = useState<Record<string, any>>({}) // 모달 데이터
  const [flOpen, setFlOpen] = useState<boolean>(false)
  const [detailOpen, setDetailOpen] = useState<boolean>(false)
  const [vhclStopOpen, setVhclStopOpen] = useState<boolean>(false)

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  let vhclStopFlag = false

  // 화면 최초로드시
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      bgngDt: getDateRange('d', 30).startDate,
      endDt: getDateRange('d', 30).endDate,
      srchDtGb: '01',
    }))
  }, [])

  // 검색flag
  useEffect(() => {
    if (searchFlag) {
      fetchData()
    }
  }, [searchFlag])

  useEffect(() => {
    vhclStopFlag = false
  }, [rowIndex])

  useEffect(() => {
    if (!vhclStopOpen && rowIndex > -1) {
      vhclStopFlag = true
      handleAprvClick()
    }
  }, [vhclStopOpen])

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // row클릭시
  const handleClick = useCallback((row: Row, index?: number) => {
    setRowIndex(index ?? -1)
  }, [])

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag(true)
    },
    [],
  )
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setSearchFlag(true)
  }

  // 조회정보 가져오기
  const fetchData = async () => {
    setRows([])
    setRowIndex(-1)
    setLoading(true)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
      }

      const endpoint =
        '/fsm/cad/cijm/bs/getAllCardIssuJdgmnMng' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (
        response &&
        response.resultType === 'success' &&
        response.data.content.length != 0
      ) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })

        // click event 발생시키기
        handleClick(response.data.content[0], 0)
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
      console.log(error)
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false)
      setSearchFlag(false)
    }
  }

  //엑셀 다운로드
  const handleExcelDownload = async () => {
    if (rowIndex === -1) {
      alert('조회된 내역이 없습니다.')
      return
    }

    const searchObj = {
      ...params,
      excelYn: 'Y',
      bgngDt: params.bgngDt.replaceAll('-', ''),
      endDt: params.endDt.replaceAll('-', ''),
    }

    const endpoint =
      '/fsm/cad/cijm/bs/getExcelCardIssuJdgmnMng' + toQueryParameter(searchObj)
    const title = '카드발급 심사 관리_버스_' + getToday() + '.xlsx'

    await getExcelFile(endpoint, title)
  }

  const handleAprvClick = async () => {
    if (rowIndex === -1) {
      alert('선택된 내역이 없습니다.')
      return
    }
    if (rows[rowIndex].aprvYn !== 'X') {
      alert('심사요청 상태인 카드만 승인가능합니다.')
      return
    }

    if (
      !vhclStopFlag &&
      (rows[rowIndex].stopYn === 'Y' || rows[rowIndex].pauseYn === 'Y')
    ) {
      setVhclStopOpen(true)
      return
    }

    if (rows[rowIndex].detailConfirmYn === 'Y') {
      setDetailOpen(true)
      return
    }

    aprvData()
  }

  const aprvData = async () => {
    if (rows[rowIndex].canconfirmYn !== 'Y') {
      alert(
        '거래카드, 대체카드는 해당카드사의 결제카드 승인 후 승인가능합니다.',
      )
      return
    }

    if (!confirm('해당카드를 승인 하시겠습니까?')) {
      setLoadingBackdrop(false)
      return
    }

    let endpoint: string = `/fsm/cad/cijm/bs/updateAprvYnCardIssuJdgmnMngBs`

    let body = {
      rcptYmd: rows[rowIndex].rcptYmd,
      rcptSn: rows[rowIndex].rcptSn,
      vhclNo: rows[rowIndex].vhclNo,
      aprvYn: 'Y',
      flRsnCd: '000',
      errCd: '000',
      etcCn: null,
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('승인처리 되었습니다.')
        if (detailOpen) setDetailOpen(false)
      } else {
        alert('승인처리 오류입니다.')
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
      fetchData()
    }
  }

  return (
    <>
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
                pName="ctpvCd"
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
                pName="locgovCd"
                htmlFor={'sch-locgov'}
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-cardSe"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="360"
                pValue={params.aprvYn}
                handleChange={handleSearchChange}
                pName="aprvYn"
                htmlFor={'sch-cardSe'}
                addText="전체"
                defaultValue={'X'}
              />
            </div>
          </div>

          <hr />

          <div className="filter-form">
            <div className="form-group" style={{ maxWidth: '35.5rem' }}>
              <CustomFormLabel className="input-label-display" htmlFor="sch-dt">
                <span className="required-text">*</span>기간
              </CustomFormLabel>

              <RadioGroup
                id="srchDtGb"
                name="srchDtGb"
                className="mui-custom-radio-group"
                onChange={handleSearchChange}
                value={params.srchDtGb || ''}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                }}
              >
                <FormControlLabel
                  control={
                    <CustomRadio id="rdo3_1" name="srchDtGb" value="01" />
                  }
                  label="접수일자"
                />
                <FormControlLabel
                  control={
                    <CustomRadio id="rdo3_2" name="srchDtGb" value="02" />
                  }
                  label="처리일자"
                />
              </RadioGroup>
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-start"
              >
                시작일자
              </CustomFormLabel>
              <CustomTextField
                value={params.bgngDt}
                onChange={handleSearchChange}
                inputProps={{ max: params.endDt }}
                name="bgngDt"
                type="date"
                id="ft-date-start"
                fullWidth
              />
              <CustomFormLabel
                className="input-label-none"
                htmlFor="ft-date-end"
              >
                종료일자
              </CustomFormLabel>
              <CustomTextField
                value={params.endDt}
                name="endDt"
                onChange={handleSearchChange}
                inputProps={{ min: params.bgngDt }}
                type="date"
                id="ft-date-end"
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
                placeholder=""
                fullWidth
                name="vhclNo"
                text={params.vhclNo}
                onChange={handleSearchChange}
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
                placeholder=""
                fullWidth
                name="bzentyNm"
                text={params.bzentyNm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            {/* 조회 */}
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>

            {/* 탈락 */}
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (rowIndex === -1) {
                  alert('선택된 내역이 없습니다.')
                  return
                }
                rows[rowIndex].aprvYn === 'X'
                  ? setFlOpen(true)
                  : alert('심사요청 상태인 카드만 탈락가능합니다.')
              }}
            >
              탈락
            </Button>

            {/* 승인 */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAprvClick()}
            >
              승인
            </Button>

            {/* 엑셀 */}
            <Button
              variant="contained"
              color="success"
              onClick={handleExcelDownload}
            >
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      <Box>
        <TableDataGrid
          headCells={cadCijmBsHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={rowIndex}
          caption={'버스 카드발급 심사 관리 목록 조회'}
        />
      </Box>

      {rowIndex !== -1 ? (
        <Grid item xs={4} sm={4} md={4}>
          {/* 발급심사 상세정보 */}
          <BsDetail data={rows[rowIndex]} reload={fetchData} />
        </Grid>
      ) : null}
      <BsFlModal
        open={flOpen}
        data={rows[rowIndex]}
        handleClickClose={() => setFlOpen(false)}
        reload={() => fetchData()}
      />

      <BsDetailModal
        open={detailOpen}
        data={rows[rowIndex]}
        handleClickClose={() => setDetailOpen(false)}
        reload={() => fetchData()}
        aprvData={() => aprvData()}
      />

      <BsVhclStopSearchModal
        open={vhclStopOpen}
        data={rows[rowIndex]}
        handleClickClose={() => setVhclStopOpen(false)}
      />
      <LoadingBackdrop open={loadingBackdrop} />
    </>
  )
}

export default BsIfCardReqComponent
