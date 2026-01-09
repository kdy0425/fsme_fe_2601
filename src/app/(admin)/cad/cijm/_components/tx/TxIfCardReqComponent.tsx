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
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 모달 component */
import VhclMasterModal from './VhclMasterModal'
import VhclStopDelModal from '@/app/components/tx/vhclStopDelModal/VhclStopDelModal'
import VhclBsnesReviewModal from './VhclBsnesReviewModal'
import RejectModal from './RejectModal'

/* 상세 component */
import TxIssueDetailInfo from './TxIssueDetailInfo'
import TxCarnetInfo from './TxCarnetInfo'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { getExcelFile } from '@/utils/fsms/common/comm'
import { getDateRange, getToday } from '@/utils/fsms/common/dateUtils'

/* 공통 type, interface */
import { Pageable2, HeadCell } from 'table'
import { vhclStopData } from '@/app/components/tx/vhclStopDelModal/VhclStopDelModal'

/* type 선언 */
const headCells: HeadCell[] = [
  {
    id: 'issuSeNm',
    numeric: false,
    disablePadding: false,
    label: '발급구분',
  },
  {
    id: 'confTypNmTag',
    numeric: false,
    disablePadding: false,
    label: '검토유형',
  },
  {
    id: 'rcptYmd',
    numeric: false,
    disablePadding: false,
    label: '접수일자',
    format: 'yyyymmdd',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'bzmnSeNm',
    numeric: false,
    disablePadding: false,
    label: '개인법인',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자명',
  },
  {
    id: 'pidS',
    numeric: false,
    disablePadding: false,
    label: '수급자주민번호',
    format: 'rrno',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'rprsvNm',
    numeric: false,
    disablePadding: false,
    label: '대표자',
  },
  {
    id: 'crno',
    numeric: false,
    disablePadding: false,
    label: '법인번호',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format: 'cardNo',
  },
  {
    id: 'custSeNm',
    numeric: false,
    disablePadding: false,
    label: '대리운전',
  },
  {
    id: 'agncyDrvBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '대리시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'agncyDrvEndYmd',
    numeric: false,
    disablePadding: false,
    label: '대리종료일',
    format: 'yyyymmdd',
  },
  {
    id: 'regDt',
    numeric: false,
    disablePadding: false,
    label: '요청일자',
    format: 'yyyymmdd',
  },
  {
    id: 'moliatAprvYnNm',
    numeric: false,
    disablePadding: false,
    label: '처리여부',
  },
  {
    id: 'moliatAprvDt',
    numeric: false,
    disablePadding: false,
    label: '처리일자',
    format: 'yyyymmdd',
  },
  {
    id: 'mdfrId',
    numeric: false,
    disablePadding: false,
    label: '승인자ID',
  },
]

/* 검색조건 */
interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  srchDtGb: '01' | '02'
  bgngRegDt: string
  endRegDt: string
  vhclNo: string
  bzentyNm: string
  moliatAprvYn: string
}

export interface Row {
  /* hidden 값 */
  koiCd: string
  locgovCd: string
  alotQty: number
  bmSttsCd: string
  cmSttsCd: string
  bmMdfrId: string
  custSeCd: string
  oneCarNBidYn: string
  oneBidNCarYn: string
  bzmnSeCd: string
  moliatAprvYn: 'X' | 'N' | 'Y'
  otherChuseYn: 'N' | 'Y'
  carStopYn: 'N' | 'Y'
  carPauseYn: 'N' | 'Y'
  confTyp: string
  confTypNm: string
  confTypNmTag: React.ReactNode
  crdcoCd: string
  rcptYmd: string
  rcptSeqNo: string
  seqNo: string

  /* 차량마스터 조회 */
  rrno: string
  crdcoNm: string

  /* 발급심사 상세정보 */
  vhclNo: string
  bzmnSeNm: string
  flnm: string
  pidS: string
  brno: string
  bzentyNm: string
  rprsvNm: string
  crno: string
  locgovNm: string
  koiNm: string
  issuSeNm: string
  cardSeNm: string
  cardNo: string
  custSeNm: string
  agncyDrvBgngYmd: string
  agncyDrvEndYmd: string
  moliatAprvYnNm: string
  moliatAprvDt: string
  flRsnCd: string
  flRsnCn: string

  /* 자동차망 연계정보 */
  netBrno: string
  netPid: string
  netName: string
  netLocalNm: string
  netKoiNm: string
  netScrcarNm: string
  netMdfcnDt: string
}

export interface carnetInfoInterface extends Row {}

export interface issueDetailInfoInterface extends Row {}

export interface flRsnDataInterface {
  flRsnCd: string
  flRsnCn: string
}

const TrIfCardReqComponent = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    moliatAprvYn: '',
    srchDtGb: '01',
    bgngRegDt: getDateRange('d', 30).startDate,
    endRegDt: getDateRange('d', 30).endDate,
    vhclNo: '',
    bzentyNm: '',
  }) // 검색조건

  const [rows, setRows] = useState<Row[]>([]) // 조회결과
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [rowIndex, setRowIndex] = useState<number>(-1) // 현재 선택된 로우인덱스
  const [issueDetailInfo, setIssueDetailInfo] =
    useState<issueDetailInfoInterface | null>(null) // 발급심사 상세정보
  const [carnetInfo, setCarnetInfo] = useState<carnetInfoInterface | null>(null) // 자동차망연계정보
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // 발급심사 상세정보 탈락사유 데이터
  const [flRsnData, setFlRsnData] = useState<flRsnDataInterface>({
    flRsnCd: '000',
    flRsnCn: '',
  })

  const [rejectOpen, setRejectOpen] = useState<boolean>(false)

  // 차량마스터조회 모달 상태관리 변수
  const [vhclMasterOpen, setVhclMasterOpen] = useState<boolean>(false)
  const [ersrResult, setErsrResult] = useState<boolean>(false) // 말소대기/승인 확인여부

  // 택시 보조금지급정지/거절 및 차량휴지 내역 조회 결과
  const [carStopYnResult, setCarStopYnResult] = useState<boolean>(false)

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

  // 택시 차량, 사업자 검토내역 모달 상태관리 변수
  const [vhclBsnesReviewOpen, setVhclBsnesReviewOpen] = useState<boolean>(false)

  // 검색flag
  useEffect(() => {
    if (searchFlag != null) {
      fetchData()
    }
  }, [searchFlag])

  // 택시 차량마스터에서 승인가능상태일경우 나머지 로직처리
  useEffect(() => {
    if (ersrResult) {
      handleApply()
    }
  }, [ersrResult])

  // 택시 보조금지급정지/거절 및 차량휴지 내역 조회 결과에서 alert 확인 이후 나머지 로직처리
  useEffect(() => {
    if (carStopYnResult) {
      handleApply()
    }
  }, [carStopYnResult])

  // 택시 차량정지 모달데이터 셋 이후 나머지 로직처리
  useEffect(() => {
    if (delResult) {
      handleApply()
    }
  }, [delResult])

  const resetData = (page: number, pageSize: number) => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
    setParams((prev) => ({ ...prev, page: page, size: pageSize }))
    setIssueDetailInfo(null)
    setCarnetInfo(null)
    setRowIndex(-1)
  }

  // 조회클릭시
  const handleAdvancedSearch = () => {
    resetData(1, 10)
    setSearchFlag((prev) => !prev)
  }

  // 조회조건 변경시
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  // row클릭시
  const handleClick = useCallback((row: Row, index?: number) => {
    setIssueDetailInfo(row)
    setCarnetInfo(row)
    setRowIndex(index ?? -1)
  }, [])

  // row index 변경시 데이터 초기화
  useEffect(() => {
    // 벨리데이션 용도
    setErsrResult(false)
    setFlRsnData({ flRsnCd: '000', flRsnCn: '' })
    setDelResult(false)
    setVhclStopData({
      brno: '',
      vhclNo: '',
      bgngYmd: '',
      endYmd: '',
      type: '',
      vhclRestrtYmd: '',
    })
  }, [rowIndex])

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      resetData(page, pageSize)
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  // 조회정보 가져오기
  const fetchData = async () => {
    if (searchValidation()) {
      setLoading(true)

      try {
        const searchObj = {
          ...params,
          page: params.page,
          size: params.size,
          bgngRegDt: params.bgngRegDt.replaceAll('-', ''),
          endRegDt: params.endRegDt.replaceAll('-', ''),
        }

        const endpoint =
          '/fsm/cad/cijm/tx/getAllCardIssuJdgmnMng' +
          toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length != 0
        ) {
          const result: Row[] = []
          const temp: Row[] = [...response.data.content]

          temp.map((item) => {
            let color = ''

            if (item.confTyp === '000') {
              color = '#000'
            } else {
              color = '#f44336'
            }

            result.push({
              ...item,
              confTypNmTag: (
                <Box fontWeight={800} color={color}>
                  {item.confTypNm}
                </Box>
              ),
            })
          })

          setRows(result)
          setTotalRows(response.data.totalElements)
          setPageable({
            pageNumber: response.data.pageable.pageNumber + 1,
            pageSize: response.data.pageable.pageSize,
            totalPages: response.data.totalPages,
          })

          // click event 발생시키기
          handleClick(response.data.content[0], 0)
        }
      } catch (error) {
        // 에러시
        console.log(error)
      } finally {
        setLoading(false)
      }
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
      bgngRegDt: params.bgngRegDt.replaceAll('-', ''),
      endRegDt: params.endRegDt.replaceAll('-', ''),
    }

    const endpoint =
      '/fsm/cad/cijm/tx/getExcelCardIssuJdgmnMng' + toQueryParameter(searchObj)
    const title = '카드발급 심사 관리_택시_' + getToday() + '.xlsx'

    await getExcelFile(endpoint, title)
  }

  const searchValidation = () => {
    const msg = params.srchDtGb == '01' ? '접수' : '처리'

    if (!params.bgngRegDt) {
      alert(msg + '시작일자를 입력 해주세요')
    } else if (!params.endRegDt) {
      alert(msg + '종료일자를 입력 해주세요')
    } else if (params.bgngRegDt > params.endRegDt) {
      alert(msg + '시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
    } else if (params.bgngRegDt && params.endRegDt) {
      const startDate = new Date(params.bgngRegDt)
      const endDate = new Date(params.endRegDt)
      const diffDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

      if (diffDays > 365) {
        alert(msg + '조회 기간은 1년을 초과할 수 없습니다.\n다시 확인해주세요.')
      } else {
        return true
      }
    } else {
      return true
    }
    return false
  }

  // 경유차량대수 가져오기(승인 벨리데이션 용도)
  const getDieselCnt = async () => {
    let result = 0

    const searchObj = { locgovCd: issueDetailInfo?.locgovCd }
    const endpoint =
      '/fsm/cad/cijm/tx/getDieselCntMng' + toQueryParameter(searchObj)

    const response = await sendHttpRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })

    if (response && response.resultType === 'success' && response.data) {
      result = response.data
    }

    return result
  }

  // 택시 보조금지급정지/거절 및 차량휴지 내역 조회(승인 벨리데이션 용도)
  const getAllPymntStopCardIssuJdgmnMng = async () => {
    const searchObj = { vhclNo: issueDetailInfo?.vhclNo }
    const endpoint =
      '/fsm/cad/cijm/tx/getAllPymntStopCardIssuJdgmnMng' +
      toQueryParameter(searchObj)

    const response = await sendHttpRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })

    if (response && response.resultType === 'success' && response.data) {
      const stopList = response.data

      let msg =
        '해당 요청건의 보조금지급정지 내역이 존재합니다.\n종료일 이전에는 승인시에도 내역이 유지됩니다.\n\n'

      for (let i = 0; i < stopList.length; i++) {
        if (stopList[i].chgSeCd === '21') {
          msg += '행정처리 : ' + stopList[i].endYmd + '\n\n'
          break
        }

        if (stopList[i].chgSeCd === '27') {
          msg += '지급정지 : ' + stopList[i].endYmd + '\n\n'
          break
        }
      }

      msg +=
        '조기종료시 [부정수급관리]-[행정처분]-[부정수급행정처리] 메뉴에서 삭제해야 합니다.'
      alert(msg)
    }

    setCarStopYnResult(true)
  }

  const tempHandleApply = () => {
    if (rowIndex === -1) {
      alert('선택된 내역이 없습니다.')
    } else if (issueDetailInfo?.moliatAprvYn === 'Y') {
      alert('이미 승인처리된 요청건입니다.')
    } else if (issueDetailInfo?.moliatAprvYn === 'N') {
      alert('이미 탈락처리된 요청건입니다.')
    } else if (issueDetailInfo?.custSeCd === '3') {
      alert(
        '발급심사 상세정보의 [대리운전 카드발급] 버튼을 통해 승인 가능합니다.',
      )
    } else if (issueDetailInfo?.confTyp !== '000') {
      alert('발급심사 상세정보의 [상세검토] 버튼을 통해 승인 가능합니다.')
    } else {
      handleApply()
    }
  }

  // 승인 클릭
  const handleApply = useCallback(() => {
    if (rowIndex === -1) {
      alert('선택된 내역이 없습니다.')
      return
    }

    if (issueDetailInfo?.moliatAprvYn === 'Y') {
      alert('이미 승인처리된 요청건입니다.')
      return
    }

    if (issueDetailInfo?.moliatAprvYn === 'N') {
      alert('이미 탈락처리된 요청건입니다.')
      return
    }

    const vKoiCd = issueDetailInfo?.koiCd

    // 경유
    if (vKoiCd === 'D') {
      const alotQty = issueDetailInfo?.alotQty ?? 0
      const vDieselCnt = Number(getDieselCnt())

      if (alotQty - vDieselCnt <= 0) {
        if (
          !confirm(
            '카드발급 승인시 [시도명]의 총 경유차량 할당대수를 초과합니다. 승인처리 하시겠습니까?\n(시도별 경유택시 대수 : 유가보조금 지급지침 별표1)',
          )
        ) {
          return
        }
      }

      if (
        !confirm(
          "해당 승인요청 건은 '경유' 택시입니다.\n\n경유택시 승인처리시 사업자의 정보는 '정상'으로 변경되며, 차량정보의 유종은 “경유”로 변경됩니다.\n\n계속하시겠습니까?",
        )
      ) {
        return
      }
    }

    // 국세청 사업자 정보 체크
    if (
      vKoiCd === 'L' &&
      issueDetailInfo?.bmSttsCd !== '000' &&
      issueDetailInfo?.bmMdfrId === 'CCC816'
    ) {
      alert(
        '해당 승인요청건의 사업자상태(국세청)가 정상이 아닙니다.\n승인처리 할 수 없습니다.',
      )
      return
    }

    // 대리운전 기간이 금일 이전건에 대한 처리로직
    const vCustSeCd = issueDetailInfo?.custSeCd

    if (vCustSeCd === '3') {
      const vAgncyDrvEndYmd = issueDetailInfo?.agncyDrvEndYmd ?? '0'
      const today = getToday()

      if (Number(vAgncyDrvEndYmd) < Number(today)) {
        alert(
          '해당 승인요청건의 대리운전종료 기간이 금일보다 작습니다.\n승인처리할 수 없습니다.',
        )
        return
      }
    }

    const vOneCarNBidYn = issueDetailInfo?.oneCarNBidYn
    const vOneBidNCarYn =
      issueDetailInfo?.bzmnSeCd === '0' ? 'X' : issueDetailInfo?.oneBidNCarYn

    // 기존 다른 사업자 정보 있을 때
    if (vOneCarNBidYn === 'Y' || vOneBidNCarYn === 'Y') {
      // 차량마스터 모달 오픈
      if (!ersrResult) {
        setVhclMasterOpen(true)
        return
      }

      setErsrResult(false)
    }

    /* 발급요청건에 대한 대리운전카드 유무에 따른 CONFIRM 창 표시*************************2011.04.25 추가*/
    if (issueDetailInfo?.otherChuseYn === 'Y') {
      alert(
        '해당 요청건의 차량번호에 대한 대리운전 카드정보가 할인상태인 카드가 존재합니다.\n\n기준관리-자격관리-차량말소관리 메뉴에서 대리운전말소 처리후 승인해야 합니다.',
      )
      return
    }

    if (issueDetailInfo?.carStopYn === 'Y') {
      if (!carStopYnResult) {
        getAllPymntStopCardIssuJdgmnMng()
        return
      }

      setCarStopYnResult(false)
    }

    if (issueDetailInfo?.carPauseYn === 'Y') {
      // 택시차량정지삭제 모달 오픈
      if (!delResult) {
        setVhclStopData({
          brno: issueDetailInfo?.brno ?? '',
          vhclNo: issueDetailInfo?.vhclNo ?? '',
          bgngYmd: getToday(),
          endYmd: getToday(),
          type: 'CARD_P',
          vhclRestrtYmd: '',
        })
        setVhclStopDelOpen(true)
        return
      }

      setDelResult(false)
    }

    /* M001 */
    if (
      issueDetailInfo?.bmSttsCd === '010' ||
      issueDetailInfo?.bmSttsCd === '020' ||
      issueDetailInfo?.cmSttsCd === '010' ||
      issueDetailInfo?.cmSttsCd === '020'
    ) {
      setVhclBsnesReviewOpen(true)
      return
    } else {
      let msg = ''

      // 승인처리시 안내화면
      if (issueDetailInfo?.confTyp !== '000') {
        msg =
          '카드발급승인시 해당 차량의 기존수급자와 카드가 말소처리 되며 말소 이후엔 복구할 수 없습니다.\n\n카드발급을 승인 하시겠습니까?'
      } else {
        msg =
          '신규카드 발급에 대해 승인처리합니다.\n요청정보의 차량 및 수급자정보로 등록합니다.\n\n카드발급을 승인 하시겠습니까?'
      }

      if (confirm(msg)) {
        processing('Y')
      }
    }
  }, [rowIndex, ersrResult, carStopYnResult, delResult, vhclStopData])

  // 거절
  const handleReject = () => {
    if (rowIndex === -1) {
      alert('선택된 내역이 없습니다.')
      return
    }

    // 기 승인 / 탈락된 정보일때
    if (issueDetailInfo?.moliatAprvYn === 'Y') {
      alert('이미 승인처리된 요청건입니다.')
      return
    }

    if (issueDetailInfo?.moliatAprvYn === 'N') {
      alert('이미 탈락처리된 요청건입니다.')
      return
    }

    setRejectOpen(true)
  }

  const processing = useCallback(
    async (result: 'N' | 'Y') => {
      setLoadingBackdrop(true)

      try {
        const endPoint = '/fsm/cad/cijm/tx/updateAprvYnCardIssuJdgmnMng'
        const body = {
          crdcoCd: issueDetailInfo?.crdcoCd,
          rcptYmd: issueDetailInfo?.rcptYmd,
          rcptSeqNo: issueDetailInfo?.rcptSeqNo,
          seqNo: issueDetailInfo?.seqNo,
          instCd: 'MLTM',
          moliatAprvYn: result,
          flRsnCd: result === 'N' ? flRsnData.flRsnCd : '000',
          flRsnCn: result === 'N' ? flRsnData.flRsnCn : '',
          vhclStopData: vhclStopData.vhclRestrtYmd ? vhclStopData : null,
        }

        const response = await sendHttpRequest('PUT', endPoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert('완료되었습니다')
          handleAdvancedSearch()
        } else {
          alert('[발급실패] 관리자에게 문의부탁드립니다')
        }
      } catch (error) {
        console.log(error)
        alert('[error] 관리자에게 문의부탁드립니다')
      } finally {
        setLoadingBackdrop(false)
      }
    },
    [rowIndex, flRsnData, vhclStopData],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAdvancedSearch()
    }
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          {/* 검색조건 1열 */}
          <div className="filter-form">
            {/* 검색조건 - 시도 */}
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
                htmlFor="sch-ctpv"
              />
            </div>

            {/* 검색조건 - 관할관청 */}
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

            {/* 검색조건 - 처리상태 */}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-moliatAprvYn"
              >
                처리상태
              </CustomFormLabel>
              <CommSelect
                cdGroupNm="CUGU"
                pValue={params.moliatAprvYn}
                handleChange={handleSearchChange}
                pName="moliatAprvYn"
                htmlFor={'sch-moliatAprvYn'}
                addText="전체"
                defaultValue={'X'}
              />
            </div>
          </div>

          <hr />

          <div className="filter-form">
            {/* 검색조건 - 기간 */}
            <div className="form-group" style={{ maxWidth: '40.5rem' }}>
              <CustomFormLabel className="input-label-display" htmlFor="sch-dt">
                <span className="required-text">*</span>기간
              </CustomFormLabel>
              <RadioGroup
                id="srchDtGb"
                name="srchDtGb"
                className="mui-custom-radio-group"
                onChange={handleSearchChange}
                value={params.srchDtGb}
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
                value={params.bgngRegDt}
                onChange={handleSearchChange}
                name="bgngRegDt"
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
                value={params.endRegDt}
                name="endRegDt"
                onChange={handleSearchChange}
                type="date"
                id="ft-date-end"
                fullWidth
              />
            </div>
            {/* 검색조건 - 차량번호 */}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="sch-vhclNo"
                fullWidth
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* 검색조건 - 업체명 */}
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="sch-bzentyNm"
              >
                업체명
              </CustomFormLabel>
              <CustomTextField
                id="sch-bzentyNm"
                fullWidth
                name="bzentyNm"
                value={params.bzentyNm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </Box>

        {/* Buttons */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            {/* 조회 */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdvancedSearch}
            >
              검색
            </Button>

            {/* 탈락 */}
            <Button variant="contained" color="error" onClick={handleReject}>
              탈락
            </Button>

            {/* 승인 */}
            <Button
              variant="contained"
              color="primary"
              onClick={tempHandleApply}
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

      {/* 조회 그리드 */}
      <Box>
        <TableDataGrid
          headCells={headCells} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={rowIndex}
          caption={'택시 카드발급 심사 관리 목록 조회'}
        />
      </Box>

      {rowIndex !== -1 ? (
        <Grid item xs={4} sm={4} md={4}>
          {/* 발급심사 상세정보 */}
          <TxIssueDetailInfo
            issueDetailInfo={issueDetailInfo}
            handleApply={handleApply}
            processing={processing}
            handleAdvancedSearch={handleAdvancedSearch}
          />

          <Box mt={2} />

          {/* 자동차망 연계정보 */}
          <TxCarnetInfo carnetInfo={carnetInfo} />
        </Grid>
      ) : null}

      {/* 차량마스터조회 */}
      {vhclMasterOpen ? (
        <VhclMasterModal
          issueDetailInfo={issueDetailInfo}
          open={vhclMasterOpen}
          setOpen={setVhclMasterOpen}
          setErsrResult={setErsrResult}
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

      {/* 택시 차량, 사업자 검토내역 */}
      {vhclBsnesReviewOpen ? (
        <VhclBsnesReviewModal
          issueDetailInfo={issueDetailInfo}
          open={vhclBsnesReviewOpen}
          setOpen={setVhclBsnesReviewOpen}
          pHandleApply={() => processing('Y')}
        />
      ) : null}

      {/* 탈락모달 */}
      {rejectOpen ? (
        <RejectModal
          flRsnData={flRsnData}
          setFlRsnData={setFlRsnData}
          open={rejectOpen}
          setOpen={setRejectOpen}
          pReject={() => processing('N')}
        />
      ) : null}

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </>
  )
}

export default TrIfCardReqComponent
