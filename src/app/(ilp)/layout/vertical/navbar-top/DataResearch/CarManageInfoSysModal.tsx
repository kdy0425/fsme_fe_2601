import { BlankCard, CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState, useCallback } from 'react'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { HeadCell } from 'table'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { formatDate } from '@/utils/fsms/common/convert'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { rrNoFormatter, getCommaNumber } from '@/utils/fsms/common/util'
import { toQueryParameter } from '@/utils/fsms/utils'

interface TxBeneInfoModalProps {
  open: boolean
  onCloseClick: () => void
  vhclNo?: string
  searchStDate?: string
  searchEdDate?: string
  dataSeCd?: string
}

interface DetailRow {
  vhclNo?: string // 차량번호
  startChgDt?: string // 등록시작일자
  ehdChgDt?: string // 등록종료일자
  dataSeCd?: string // 업종구분
  mdfcnDt?: string // 수신일자
  dataSeNm?: string // 구분
  rntlVhclNm?: string // 대차구분
  reowNm?: string // 소유자명(업체명)
  reowUserNoSe?: string // 법인등록번호(부분복호화)
  reowUserSeNm?: string // 구분
  koiNm?: string // 경유
  vhclTonNm?: string // 톤수
  usgDtlSeNm?: string // 차량구분
  vhclStleNm?: string // 차량형태
  vhclNm?: string // 차명
  locgovNm?: string // 지자체명
  usgsrhldAddr?: string // 사용본거지
  frstRegYmd?: string | null // 차량최초등록일
  regYmd?: string | null // 차량등록일
  lastChgRegYmd?: string // 최종변경일
  vin?: string // 차대번호
  frmNm?: string // 형식
  dtaMngNo?: string // 제원관리번호
  yridnw?: string // 연식
  len?: string // 길이
  cbdBt?: string // 너비
  maxLoadQty?: string // 적재량
  totlWt?: string // 총중량
  rdcpctCntVl?: string // 승차정원
}

const headCells: HeadCell[] = [
  {
    id: 'mdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '수신일자',
    format: 'yyyymmdd',
  },
  {
    id: 'dataSeNm',
    numeric: false,
    disablePadding: false,
    label: '구분',
  },
  {
    id: 'rntlVhclNm',
    numeric: false,
    disablePadding: false,
    label: '대차구분',
  },
  {
    id: 'usgDtlSeNm',
    numeric: false,
    disablePadding: false,
    label: '차량구분',
  },
  {
    id: 'reowNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명(업체명)',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
  {
    id: 'usgDtlSeNm',
    numeric: false,
    disablePadding: false,
    label: '차량구분',
  },
]

// 목록 조회시 필요한 조건
type listSearchObj = {
  dataSeCd:string
  vhclNo:string
}

export const CarManageInfoSysModal = (props: TxBeneInfoModalProps) => {
  
  const { open, onCloseClick, vhclNo, searchStDate, searchEdDate, dataSeCd } = props
  
  const [flag, setFlag] = useState<boolean|null>(null) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<DetailRow[]>([]) // 가져온 로우 데이터
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedIndex, setSelectedIndex] = useState<number>()
  const [selectedRow, setSelectedRow] = useState<DetailRow>() // 선택된 Row를 저장할 state
  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [excelLoading, setExcelLoading] = useState<boolean>(false)
  const [params, setParams] = useState<listSearchObj>({ dataSeCd: '', vhclNo: '' })
  
  useEffect(() => {
    if (flag !== null) {
      fetchData();
    }
  }, [flag])
  
  useEffect(() => {
    if (open && vhclNo) {
      setParams((prev) => ({ ...prev, vhclNo:vhclNo, dataSeCd:dataSeCd ?? '' }))
      setFlag((prev) => !prev)
    }
  }, [open])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {

    if (!params.vhclNo) {
      alert('차량번호를 입력해주세요')
      return;
    }

    setRows([])
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    setLoading(true)
    setExcelFlag(true) // 엑셀기능 동작여부

    try {
      const endpoint: string = '/fsm/cmm/cmmn/cp/getAllCarnetList' + toQueryParameter(params);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
        handleRowClick(response.data[0], 0)
      }
    } catch (error) {
      console.log(error)
    } finally {      
      setLoading(false)
    }
  }

  const excelDownload = async () => {
    if (rows.length == 0) {
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return
    }

    if (!excelFlag) {
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try {
      
      setExcelLoading(true)
      const endpoint: string = '/fsm/cmm/cmmn/cp/getAllCarnetExcel' + toQueryParameter(params);        
      await getExcelFile(endpoint, '자동차관리정보시스템' + getToday() + '.xlsx')
      
    } catch (error) {
      console.log(error)
    } finally {
      setExcelLoading(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setExcelFlag(false)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setParams((prev) => ({
      ...prev
      , vhclNo:''
      , dataSeCd:''
    }))
    setFlag(null);
    setExcelFlag(false)
    setRows([])
    setSelectedIndex(-1)
    setSelectedRow(undefined)
    onCloseClick()
  }

  const handleRowClick = useCallback((selectedRow: DetailRow, index?: number) => {
    setSelectedRow(selectedRow)
    setSelectedIndex(index)
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>자동차관리정보시스템 검색</h2>
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
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          {/* 검색영역 시작 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-dataSeCd"
                  >
                    업종구분
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm="067"
                    pValue={params.dataSeCd}
                    handleChange={handleSearchChange}
                    pName="dataSeCd"
                    htmlFor={'sch-dataSeCd'}
                    addText="전체"
                    defaultValue={params.dataSeCd}
                  />
                </div>
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-vhclNo"
                  >
                    <span className="required-text">*</span>차량번호                    
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-vhclNo"
                    name="vhclNo"
                    value={params.vhclNo}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    fullWidth
                  />
                </div>                
              </div>
            </Box>
          </Box>
          {/* 검색영역 시작 */}

          {/* 테이블영역 시작 */}
          <Box sx={{ mb: 5 }}>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              loading={loading} // 로딩여부
              onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
              caption={'자동차망 상세 목록 조회'}
            />
          </Box>
          <>
            {selectedRow && (
              <BlankCard className="contents-card" title="상세정보">
                <div id="alert-dialog-description1">
                  {/* 테이블영역 시작 */}
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>상세 내용 시작</caption>
                      <colgroup>
                        <col style={{ width: '8%' }}></col>
                        <col style={{ width: '7%' }}></col>
                        <col style={{ width: '7%' }}></col>
                        <col style={{ width: '6%' }}></col>
                        <col style={{ width: '8%' }}></col>
                        <col style={{ width: '6%' }}></col>
                        <col style={{ width: '8%' }}></col>
                        <col style={{ width: '12%' }}></col>
                        <col style={{ width: '11%' }}></col>
                        <col style={{ width: '7%' }}></col>
                        <col style={{ width: '7%' }}></col>
                        <col style={{ width: '7%' }}></col>
                        <col style={{ width: '7%' }}></col>
                      </colgroup>
                      <tbody>
                        <tr>
                          <th className="td-head" scope="row" colSpan={1}>
                            차량번호
                          </th>
                          <td colSpan={2}>{selectedRow?.vhclNo}</td>
                          <th className="td-head" scope="row" colSpan={2}>
                            소유자명(업체명)
                          </th>
                          <td colSpan={3}>{selectedRow?.reowNm}</td>
                          <th
                            style={{ whiteSpace: 'nowrap' }}
                            colSpan={1}
                            className="td-head"
                            scope="row"
                          >
                            법인등록번호
                          </th>
                          <td colSpan={2}>
                            {rrNoFormatter(selectedRow?.reowUserNoSe ?? '')}
                          </td>
                          <th colSpan={1} className="td-head" scope="row">
                            구분
                          </th>
                          <td colSpan={2}>{selectedRow?.reowUserSeNm}</td>
                        </tr>

                        <tr>
                          <th className="td-head" scope="row" colSpan={1}>
                            차량형태
                          </th>
                          <td colSpan={6}>{selectedRow?.vhclStleNm}</td>
                          <th colSpan={1} className="td-head" scope="row">
                            차명
                          </th>
                          <td colSpan={5}>{selectedRow?.vhclNm}</td>
                        </tr>

                        <tr>
                          <th className="td-head" scope="row" colSpan={1}>
                            지자체명
                          </th>
                          <td colSpan={2}>{selectedRow?.locgovNm}</td>
                          <th colSpan={2} className="td-head" scope="row">
                            사용본거지
                          </th>
                          <td colSpan={9}>{selectedRow?.usgsrhldAddr}</td>
                        </tr>

                        <tr>
                          <th className="td-head" scope="row" colSpan={1}>
                            차량등록일
                          </th>
                          <td colSpan={2}>
                            {formatDate(selectedRow?.regYmd ?? '')}
                          </td>
                          <th colSpan={2} className="td-head" scope="row">
                            최종변경일
                          </th>
                          <td colSpan={2}>
                            {formatDate(selectedRow?.lastChgRegYmd)}
                          </td>
                          <th colSpan={1} className="td-head" scope="row">
                            차대번호
                          </th>
                          <td colSpan={6}>{selectedRow?.vin}</td>
                        </tr>
                        <tr>
                          <th className="td-head" scope="row" colSpan={1}>
                            형식
                          </th>
                          <td colSpan={6}>{selectedRow?.frmNm}</td>
                          <th colSpan={1} className="td-head" scope="row">
                            제원관리번호
                          </th>
                          <td colSpan={6}>{selectedRow?.dtaMngNo}</td>
                        </tr>
                      </tbody>
                      <tbody>
                        <tr>
                          <th colSpan={1} className="td-head" scope="row">
                            연식
                          </th>
                          <td colSpan={2}>{selectedRow?.yridnw}</td>
                          <th colSpan={1} className="td-head" scope="row">
                            길이
                          </th>
                          <td colSpan={1}>
                            {getCommaNumber(Number(selectedRow?.len))}
                          </td>
                          <th colSpan={1} className="td-head" scope="row">
                            너비
                          </th>
                          <td colSpan={1}>
                            {getCommaNumber(Number(selectedRow?.cbdBt))}
                          </td>
                          <th colSpan={1} className="td-head" scope="row">
                            적재량
                          </th>
                          <td colSpan={1}>
                            {getCommaNumber(Number(selectedRow?.maxLoadQty))}
                          </td>
                          <th colSpan={1} className="td-head" scope="row">
                            총중량
                          </th>
                          <td colSpan={1}>
                            {getCommaNumber(Number(selectedRow?.totlWt))}
                          </td>
                          <th colSpan={1} className="td-head" scope="row">
                            승차정원
                          </th>
                          <td colSpan={1}>
                            {getCommaNumber(Number(selectedRow?.rdcpctCntVl))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* 테이블영역 끝 */}
                </div>
              </BlankCard>
            )}
          </>
        </DialogContent>
        <LoadingBackdrop open={excelLoading} />
      </Dialog>
    </Box>
  )
}

export default CarManageInfoSysModal
