'use client'

/* React */
import React, { useCallback, useEffect, useState } from 'react'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import VhclStopDelModal from '@/app/components/tx/vhclStopDelModal/VhclStopDelModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { getDateRange } from '@/utils/fsms/common/comm'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* 공통 interface */
import { HeadCell, Pageable2 } from 'table'
import { vhclStopData } from '@/app/components/tx/vhclStopDelModal/VhclStopDelModal'

/* mui component */
import { Box, Button } from '@mui/material'

/* _components */
import TxSearchCondition from './TxSearchCondition'
import TxDetailDataGrid from './TxDetailDataGrid'
import TxDetailDataGrid2 from './TxDetailDataGrid2'
import TxModalContent from './TxModalContent'

const headCells: HeadCell[] = [
  {
    id: 'admdspSeNm',
    numeric: false,
    disablePadding: false,
    label: '행정처리',
  },
  {
    id: 'exmnNo',
    numeric: false,
    disablePadding: false,
    label: '연번',
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
    id: 'vonrNm',
    numeric: false,
    disablePadding: false,
    label: '소유자명',
  },
  {
    id: 'instcSpldmdAmt',
    numeric: false,
    disablePadding: false,
    label: '부정수급액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'rdmActnAmt',
    numeric: false,
    disablePadding: false,
    label: '환수금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'instcSpldmdTypeNm',
    numeric: false,
    disablePadding: false,
    label: '부정수급유형',
  },
  {
    id: 'delYnNm',
    numeric: false,
    disablePadding: false,
    label: '삭제여부',
  },
]

export interface Row {
  /* row */
  admdspSeNm: string // 행정처리
  exmnNo: string // 연번
  locgovNm: string // 관할관청
  vhclNo: string // 차량번호
  vonrNm: string // 소유자명
  instcSpldmdAmt: string // 부정수급액
  rdmActnAmt: string // 환수금액, 환수할금액
  instcSpldmdTypeNm: string // 부정수급유형

  /* 상세정보 */
  ttmKoiNm: string // 당시유종명
  bzmnSeNm: string // 개인법인명
  vonrRrnoS: string // 주민등록번호
  brno: string // 사업자등록번호
  bgngYmd: string // 부정수급거래 시작기간
  endYmd: string // 부정수급거래 종료기간
  instcSpldmdRsnCn: string // 부정수급유형 기타
  dlngNocs: string // 거래건수
  totlAprvAmt: string // 거래금액
  totlAsstAmt: string // 유가보조금
  rdmDt: string // 환수한 일자
  rdmTrgtNocs: string // 부정수급건수
  rlRdmAmt: string // 환수한금액

  /* 조사 및 행정처리 */
  dsclMthdNm: string // 적발방법 코드명
  dsclMthdEtcMttrCn: string // 적발방법 기타
  ruleVltnCluNm: string // 규정위반조항 코드명
  ruleVltnCluEtcCn: string // 규정위반조항 기타
  exmnRegNocs: string // 위반횟수
  dspsDt: string // 행정처분일
  stopBgngYmd: string // 행정처분시작일
  stopEndYmd: string // 행정처분종료일
  rdmYn: string // 환수금 환수여부
  moliatOtspyYn: string // 국토부보조금 지급여부
  admdspRsnCn: string // 조사내용 및 행정처분사유
  oltPssrpPrtiYnNm: string // 주유소 공모 코드명
  oltPssrpPrtiOltNm: string // 주유소명
  oltPssrpPrtiBrno: string // 주유소 사업자등록번호

  /* hidden */
  instcSpldmdTypeCd: string // 부정수급유형 코드
  bzmnSeCd: string // 개인법인코드
  ruleVltnCluCd: string // 규정위반조항 코드
  vonrRrno: string // 주민등록번호 디크립트
  dsclMthdCd: string // 적발방법 코드
  oltPssrpPrtiYn: string // 주유소 공모코드
  admdspSeCd: string // 행정처리 코드명
  locgovCd: string // 지자체코드명
  ttmKoiCd: string // 기존유종코드
  giveStopSn: string // 지급정지 일련번호
  delYn: string // 삭제여부
  delYnNm: string // 삭제여부명
  vhclRestrtYmd: string // 실제운행게시일
  color: string
}

// 목록 조회시 필요한 조건
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string // 시도명
  locgovCd: string // 관할관청
  vhclNo: string // 차량번호
  vonrNm: string // 소유자명
  strFromYM: string // 등록시작기간
  strToYM: string // 등록종료기간
  instcSpldmdTypeCd: string // 부정수급유형
  admdspSeCd: string // 행정처분유형
  delYn: string // 삭제여부
}

const TxPage = () => {
  /* 조회조건 */
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    vhclNo: '',
    vonrNm: '',
    strFromYM: getDateRange('m', 1).startDate,
    strToYM: getDateRange('m', -1).startDate,
    instcSpldmdTypeCd: '',
    admdspSeCd: '',
    delYn: '',
  })

  /* 조회 데이터 상태관리 */
  const [flag, setFlag] = useState<boolean | null>(null)
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부
  const [selectedRow, setSelectedRow] = useState<Row | null>(null) // 상세정보
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // 선택된 행
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징객체

  /* 등록 및 수정모달 상태관리 */
  const [type, setType] = useState<'CREATE' | 'UPDATE'>('CREATE')
  const [open, setOpen] = useState<boolean>(false)

  // 택시차량정지삭제 모달 상태관리 변수
  const [vhclStopDelOpen, setVhclStopDelOpen] = useState<boolean>(false)
  const [delResult, setDelResult] = useState<boolean>(false)
  const [vhclStopData, setVhclStopData] = useState<vhclStopData>({
    brno: '',
    vhclNo: '',
    bgngYmd: '',
    endYmd: '',
    type: '',
    vhclRestrtYmd: '',
  }) // 차량정지삭제 데이터

  // 저장시 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  useEffect(() => {
    // 최초 렌더링시 조회방지
    if (flag != null) {
      setRows([])
      setTotalRows(0)
      setSelectedRow(null)
      setSelectedIndex(-1)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      fetchData()
    }
  }, [flag])

  // row index 변경시 데이터 초기화
  useEffect(() => {
    setDelResult(false)
    setVhclStopData({
      brno: '',
      vhclNo: '',
      bgngYmd: '',
      endYmd: '',
      type: '',
      vhclRestrtYmd: '',
    })
  }, [selectedIndex])

  useEffect(() => {
    // 차량정지삭제 모달에서 프로세스 완료시
    if (delResult) {
      handleDeleteContinue()
    }
  }, [delResult])

  const searchValidation = () => {
    if (!params.strFromYM) {
      alert('등록시작기간을 입력 해주세요')
    } else if (!params.strToYM) {
      alert('등록종료기간을 입력 해주세요')
    } else if (params.strFromYM > params.strToYM) {
      alert('등록시작기간이 등록종료기간보다 큽니다')
    } else {
      return true
    }

    return false
  }

  // 조회
  const fetchData = async () => {
    if (searchValidation()) {
      setLoading(true)

      try {
        const searchObj = {
          ...params,
          page: params.page,
          size: params.size,
          strFromYM: params.strFromYM.replaceAll('-', ''),
          strToYM: params.strToYM.replaceAll('-', ''),
        }

        // 검색 조건에 맞는 endpoint 생성
        const endpoint: string =
          '/fsm/ilg/isd/tx/getAllInstcSpldmdDsps' + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length !== 0
        ) {
          const temp: Row[] = response.data.content

          temp.map((item) => {
            if (item.delYn === 'Y') {
              item.color = '#f44336'
            } else {
              item.color = ''
            }
          })

          setRows(temp)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // click event 발생시키기
          handleRowClick(response.data.content[0], 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  // 검색
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setFlag((prev) => !prev)
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setFlag((prev) => !prev)
    },
    [],
  )

  // 행 클릭 시 호출되는 함수
  const handleRowClick = useCallback((row: Row, index?: number) => {
    setSelectedRow(row)
    setSelectedIndex(index ?? -1)
  }, [])

  // 모달오픈
  const openFormModal = (formType: 'CREATE' | 'UPDATE') => {
    if (formType === 'UPDATE' && selectedIndex === -1) {
      alert('수정할 데이터를 선택해주세요.')
      return
    }

    if (formType === 'UPDATE' && selectedRow?.delYn === 'Y') {
      alert('이미 삭제된 건은 수정이 불가능합니다.')
      return
    }

    setType(formType)
    setOpen(true)
  }

  const handleDelete = () => {
    if (selectedIndex === -1) {
      alert('삭제 할 데이터를 선택 해주세요')
      return
    }

    if (selectedRow?.delYn === 'Y') {
      alert('이미 삭제된 건은 삭제가 불가능합니다.')
      return
    }

    if (selectedRow?.exmnNo.substring(0, 2) !== '99') {
      alert(
        '선택된 ' +
          selectedRow?.vhclNo +
          '차량의 부정수급 조사대상건은\n삭제할 수 없습니다.\n\n행정처분 지급정지가 시작된 경우 조기종료시 행정처분 종료일을 변경해주시면 됩니다.',
      )
      return
    }

    setVhclStopData({
      brno: selectedRow?.brno ?? '',
      vhclNo: selectedRow?.vhclNo ?? '',
      bgngYmd: selectedRow?.stopBgngYmd ?? '',
      endYmd: selectedRow?.stopEndYmd ?? '',
      type: 'STOP',
      vhclRestrtYmd: '',
    })

    setVhclStopDelOpen(true)
  }

  // 택시 차량정지삭제 프로세스 완료이후 나머지 삭제로직처리
  const handleDeleteContinue = async () => {
    try {
      setLoadingBackdrop(true)

      const endPoint = '/fsm/ilg/isd/tx/deleteInstcSpldmdDsps'
      const body = {
        vhclRestrtYmd: vhclStopData.vhclRestrtYmd,
        vhclNo: selectedRow?.vhclNo,
        exmnNo: selectedRow?.exmnNo,
        giveStopSn: selectedRow?.giveStopSn,
        admdspSeCd: selectedRow?.admdspSeCd,
        VhclStopData: vhclStopData,
      }

      const response = await sendHttpRequest('DELETE', endPoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingBackdrop(false)
      handleAdvancedSearch()
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        {/* 조회조건 */}
        <TxSearchCondition
          params={params}
          setParams={setParams}
          fn={fetchData}
        />

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdvancedSearch}
            >
              검색
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => openFormModal('CREATE')}
            >
              등록
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => openFormModal('UPDATE')}
            >
              수정
            </Button>

            <Button variant="contained" color="error" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 시작 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleRowClick} // 행 클릭 핸들러 추가
          selectedRowIndex={selectedIndex}
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
        />
      </Box>

      {selectedRow && selectedIndex > -1 ? (
        <>
          {/* 대상자 정보 */}
          <TxDetailDataGrid selectedRow={selectedRow} />

          {/* 조사 및 행정처리 */}
          <TxDetailDataGrid2 selectedRow={selectedRow} />
        </>
      ) : null}

      {/* 등록 및 수정 */}
      {open ? (
        <TxModalContent
          open={open}
          setOpen={setOpen}
          type={type}
          data={selectedRow}
          reload={handleAdvancedSearch}
        />
      ) : null}

      {/* 택시차량정지삭제 */}
      {vhclStopDelOpen ? (
        <VhclStopDelModal
          vhclStopData={vhclStopData}
          setVhclStopData={setVhclStopData}
          open={vhclStopDelOpen}
          setOpen={setVhclStopDelOpen}
          setDelResult={setDelResult}
        />
      ) : null}

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </Box>
  )
}

export default TxPage
