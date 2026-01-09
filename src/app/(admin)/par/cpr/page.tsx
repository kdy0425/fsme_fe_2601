'use client'

/* React */
import React, { useCallback, useEffect, useState, useRef } from 'react'

/* 공통js */
import { toQueryParameter, getUserInfo } from '@/utils/fsms/utils'
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  addDays,
  getDateFormatYMD,
  dateToString,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { getExcelFile, isNumber } from '@/utils/fsms/common/comm'

/* 공통 type, interface */
import { Pageable2, HeadCell } from 'table'
import { parCprReqHC, parCprDealHC } from '@/utils/fsms/headCells'

/* 공통 component */
import PageContainer from '@/components/container/PageContainer'
import { Breadcrumb, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* mui component */
import { Box, Button } from '@mui/material'

/* _component */
import SearchCondition from './_components/SearchCondition'
import DetailDataGrid from './_components/DetailDataGrid'
import DealDataGrid from './_components/DealDataGrid'

/* type 선언 */
export type listSearchObj = {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  strRcptYmd: string
  endRcptYmd: string
  brno: string
  rrno: string
  vhclNo: string
  aprvCd: string
}

/* interface 선언 */
export interface CardReqstRow {
  /* 목록 */
  rcptYmd: string
  flnm: string
  brno: string
  rrno: string
  rrnoS: string //주민번호 복호화
  vhclNo: string
  koiNm: string
  qty: number
  useAmt: number
  moliatAsstAmt: number
  aprvNm: string
  aprvDt: string
  /* 상세 */
  agdrvrYnNm: string // 대리운전여부명
  agdrvrNm: string // 대리운전자명
  agdrvrRrno: string // 대리운전자 주민등록번호
  agdrvrRrnoS: string //대리운전자 주민등록번호 복호화
  addr: string // 주소
  telno: string // 전화번호
  locgovCd: string // 지자체코드
  locgovNm: string // 지자체코드명
  regSeNm: string // 등록구분명
  regSeCd: string // 등록구분코드
  regSeCdAcctoYmd: string // 등록구분코드별일자
  cardFrstUseYmd: string // 카드첫사용일
  pasctNm: string // 조합
  casctNm: string // 지부
  docmntAplyUnqNo: string // 서면신청고유번호
  regSeCdAcctoEndYmd: string // 등록구분코드별종료일자
  aprvCd: string // 상태코드
}

export interface dealRow {
  icon: React.ReactNode // 아이콘
  errMsg: string // 거래 에러메세지
  chk: React.ReactNode | string // 체크박스
  giveYn: string // 지급여부코드
  giveNm: string // 지급여부
  useSeNm: string // 사용구분
  useDay: string // 사용일시
  dayoffDayNm: string // 부제여부
  frcsBrno: string // 가맹점사업자번호
  chrstnNm: string // 가맹점명
  koiNm: string // 유종
  literAcctoUntprcSeNm: string // 사용량당단가구분
  literAcctoUntprc: string // 사용량당단가
  qty: string // 가맹점사용량
  moliatUseLiter: string // 국토부사용량
  unitNm: string // 단위
  aprvNo: string // 승인번호
  vhclPorgnUntprc: string // 차량등록지지역별평균단가
  literAcctoOpisAmt: string // 유가연동보조금사용량당단가
  exsMoliatAsstAmt: string // 유류세연동보조금(a)
  opisAmt: string // 유가연동보조금(b)
  moliatAsstAmt: string // 국토부보조금(a+b)
  crdcoStopIdntyNm: string // 카드사검증
  docmntAplyRsnCn: string // 지급거절사유/비고
  docmntAplyRsnTag: React.ReactNode // 지급거절사유/비고 입력용
  seqNo: string // 서면신청 상세번호
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: '서면신청',
  },
  {
    title: '택시서면신청',
  },
  {
    to: '/par/cpr',
    title: '서면신청(카드사)',
  },
]

const DataList = () => {
  const userInfo = getUserInfo()

  const rsnRef = useRef<any>([])

  /* 상태관리 */
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    strRcptYmd: '',
    endRcptYmd: '',
    brno: '',
    rrno: '',
    vhclNo: '',
    aprvCd: '',
  }) // 조회조건

  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  const [rows, setRows] = useState<CardReqstRow[]>([]) // 조회데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 조회데이터 총 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징객체

  const [detailInfo, setDetailInfo] = useState<CardReqstRow | null>(null) // 상세정보
  const [dealRow, setDealRow] = useState<dealRow[]>([]) // 거래정보
  const [cardUseText, setCardUseText] = useState<string>('')

  const [docmntAplyYmd, setDocmntAplyYmd] = useState({
    bgngDocmntAplyYmd: '',
    endDocmntAplyYmd: '',
  }) // 서면신청 벨리에디션을위한 일자

  const [rowIndex, setRowIndex] = useState<number>(-1)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  /* 화면로드시 */
  useEffect(() => {
    // 조회조건 세팅
    setParams((prev) => ({
      ...prev,
      strRcptYmd: getDateRange('d', 30).startDate,
      endRcptYmd: getDateRange('d', 30).endDate,
    }))
  }, [])

  /* 페이지 변경시 */
  useEffect(() => {
    if (searchFlag != null) {

      setRows([])
      setTotalRows(0)
      setPageable({ pageNumber: 1, pageSize: 10, totalPages: 1 })
      setDetailInfo(null)
      setDealRow([])
      setCardUseText('')
      setDocmntAplyYmd({ bgngDocmntAplyYmd: '', endDocmntAplyYmd: '' })
      setRowIndex(-1)

      getAllCardPapersReqst()
    }
  }, [searchFlag])

  useEffect(() => {
    if (detailInfo) {
      getAllDetailCardPapersReqst()
    }
  }, [detailInfo])

  /* 함수선언 */

  // 조회조건 변경시
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    
    const { name, value } = event.target

    if (name === 'strRcptYmd' || name === 'endRcptYmd') {
      
      const otherDateField = name === 'strRcptYmd' ? 'endRcptYmd' : 'strRcptYmd'
      const otherDate = params[otherDateField]
      
      if (name === 'strRcptYmd' && value <= otherDate) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else if (name === 'endRcptYmd' && value >= otherDate) {
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }

    } else if (name === 'brno' || name === 'rrno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value }))  
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
    
  };

  // 조회클릭시
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1, size: 10 }))
    setSearchFlag((prev) => !prev)
  }

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag((prev) => !prev)
    },
    [],
  )

  // row클릭시
  const handleClick = useCallback((row: CardReqstRow, index?: number) => {    
    setDetailInfo(row)
    getCardUseText(row)
    setRowIndex(index ?? -1)
  }, [])

  // 카드사 서면신청내역 가져오기
  const getAllCardPapersReqst = async () => {
      
    setLoading(true)

    try {

      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        strRcptYmd: params.strRcptYmd.replaceAll('-', ''),
        endRcptYmd: params.endRcptYmd.replaceAll('-', ''),
        brno: params.brno.replaceAll('-', ''),
        rrno: params.rrno.replaceAll('-', ''),
      }

      const endpoint =
        '/fsm/par/cpr/cm/getAllCardPapersReqst' + toQueryParameter(searchObj)
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
      }
    } catch (error) {
      // 에러시
      console.log(error)        
    } finally {
      setLoading(false)
    }
  }

  /**
   * 서면신청 가능기간 조건 확인
   * 1. 면허개시일로부터 신규발급 유류구매카드 최초사용일까지(15일이내)
   * 2. 분실-훼손일부터 재발급 유류구매카드 최초사용일까지(15일이내)
   * 3. 카드정지일부터 정지일 이후 발급된 유류구매카드 최초사용일까지
   * 4. 충전(주유)일로부터 2개월 이내
   */
  const getCardUseText = (res: CardReqstRow) => {

    let text = ''
    let bgngYmd = ''
    let endYmd = ''

    if (res.regSeCd != null && res.regSeCd != '9') {
      
      if (res.rcptYmd && res.regSeCdAcctoYmd && res.cardFrstUseYmd) {
        
        const tempDate = new Date(getDateFormatYMD(res.rcptYmd));
        const tempBgngYmd = dateToString(addDays(new Date(tempDate.setMonth(tempDate.getMonth() - 2)), 1))
        const vBgngYmd = tempBgngYmd;
        const vEndYmd = dateToString(addDays(new Date(getDateFormatYMD(res.regSeCdAcctoYmd)), 14))

        if (res.regSeCd == '0' || res.regSeCd == '1') {
          if (vEndYmd < res.cardFrstUseYmd) {
            endYmd = vEndYmd
          } else {
            endYmd = res.cardFrstUseYmd
          }
        } else if (res.regSeCd == '3') {
          endYmd = res.rcptYmd
        } else if (res.regSeCd == '4') {
          if (res.regSeCdAcctoEndYmd < res.rcptYmd) {
            endYmd = res.regSeCdAcctoEndYmd
          } else {
            endYmd = res.rcptYmd
          }
        } else {
          return
        }

        if (endYmd < vBgngYmd || res.regSeCdAcctoYmd > res.rcptYmd) {
          text = '서면신청 가능한 기간이 없습니다.'
          bgngYmd = vBgngYmd
        } else {
          if (res.regSeCdAcctoYmd < vBgngYmd) {
            bgngYmd = vBgngYmd
          } else {
            bgngYmd = res.regSeCdAcctoYmd
          }

          text =
            '* 서면신청 가능기간 : ' +
            bgngYmd.substring(0, 4) +
            '-' +
            bgngYmd.substring(4, 6) +
            '-' +
            bgngYmd.substring(6, 8) +
            ' ~ ' +
            endYmd.substring(0, 4) +
            '-' +
            endYmd.substring(4, 6) +
            '-' +
            endYmd.substring(6, 8)
        }
      }
    }

    setCardUseText(text)
    setDocmntAplyYmd({ bgngDocmntAplyYmd: bgngYmd, endDocmntAplyYmd: endYmd })
  }

  // 거래내역 가져오기
  const getAllDetailCardPapersReqst = async () => {
    
    setDealRow([])
    
    if (detailInfo?.docmntAplyUnqNo) {
      try {
        const endpoint =
          '/fsm/par/cpr/cm/getAllDetailCardPapersReqst?docmntAplyUnqNo=' +
          detailInfo?.docmntAplyUnqNo
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success' && response.data) {
          // 데이터 조회 성공시
          makeDealRow(response.data)
        }
      } catch (error) {
        // 에러시
        console.log(error)
      }
    }
  }

  // 거래내역 row데이터 세팅
  const makeDealRow = (res: dealRow[]) => {
    const result: dealRow[] = []

    res.map((item: dealRow, index: number) => {
      result.push(makeDealRowData(item, index))
    })

    setDealRow(result)
  }

  // 거래내역 로우 세팅
  const makeDealRowData = (item: dealRow, index: number) => {
    
    let errCnt = 0
    let errMsg = ''
    const regSeCd = detailInfo?.regSeCd ?? ''
    const useDay = dateToString(new Date(item.useDay));

    // 서면신청기간 검사
    if (docmntAplyYmd.bgngDocmntAplyYmd && docmntAplyYmd.endDocmntAplyYmd) {
      if (docmntAplyYmd.endDocmntAplyYmd < useDay || useDay < docmntAplyYmd.bgngDocmntAplyYmd) {
        errCnt++
        const regSeCdAcctoYmd = detailInfo?.regSeCdAcctoYmd ?? ''

        if (useDay < regSeCdAcctoYmd) {
          if (regSeCd == '0') {
            errMsg += errCnt + '. 면허개시일을 벗어납니다.\n'
          } else if (regSeCd == '1') {
            errMsg += errCnt + '. 분실-훼손일을 벗어납니다.\n'
          } else if (regSeCd == '3') {
            errMsg += errCnt + '. 카드정지일을 벗어납니다.\n'
          } else if (regSeCd == '4') {
            errMsg += errCnt + '. 통장압류 시작일을 벗어납니다.\n'
          }
        } else if (useDay < docmntAplyYmd.bgngDocmntAplyYmd) {
          errMsg +=
            errCnt + '. 충전(주유)일로부터 2개월 이내 조건을 벗어납니다.\n'
        } else if (useDay > docmntAplyYmd.endDocmntAplyYmd) {
          if (regSeCd == '0') {
            errMsg +=
              errCnt +
              '. 면허개시일부터 신규발급 유류구매카드 최초사용일까지(15일이내) 조건을 벗어납니다.\n'
          } else if (regSeCd == '1') {
            errMsg +=
              errCnt +
              '. 분실-훼손일부터 재발급 유류구매카드 최초사용일까지(15일이내) 조건을 벗어납니다.\n'
          } else if (regSeCd == '3') {
            errMsg +=
              errCnt +
              '. 카드정지일부터 정지일 이후 발급된 유류구매카드 최초사용일까지 조건을 벗어납니다.\n'
          }
        } else {
          errMsg += errCnt + '. 서면신청 가능기간을 벗어납니다.\n'
        }
      }
    }

    // 카드정지여부 확인
    let cardConfYN = item.crdcoStopIdntyNm

    if (regSeCd == '3' && cardConfYN == 'Y') {
      errCnt++
      errMsg += errCnt + '. 카드사 검증결과 해당일에 카드사용 가능합니다.\n'
    }

    let chk: React.ReactNode | string = ''
    let icon: React.ReactNode = ''

    if (errCnt > 0) {
      icon = <div style={{ color: 'red' }}>●</div>
      if (detailInfo?.aprvCd == '9') {
        chk = '0'
      }
    } else {
      icon = <div style={{ color: '#00cc00' }}>●</div>
      if (detailInfo?.aprvCd == '9') {
        chk = '1'
      }
    }

    if (detailInfo?.aprvCd == '0') {
      if (item.giveYn == 'Y') {
        chk = <CustomCheckbox checked={true} />
      } else {
        chk = <CustomCheckbox checked={false} />
      }
    }

    if (detailInfo?.aprvCd == '9') {
      const docmntAplyRsnTag: React.ReactNode = (
        <>
          <CustomFormLabel className="input-label-none" htmlFor={'tag' + index}>지급거절사유</CustomFormLabel>
          <input
            type="text"
            id={'tag' + index}
            ref={(element) => (rsnRef.current[index] = element)}
            onChange={(event) =>
              (rsnRef.current[index].value = event.target.value)
            }
          />
        </>
      )

      return {
        ...item,
        icon: icon,
        errMsg: errMsg,
        chk: chk,
        docmntAplyRsnTag: docmntAplyRsnTag,
        docmntAplyRsnCn: '',
      }
    } else {
      const docmntAplyRsnTag: string = item.docmntAplyRsnCn
      return {
        ...item,
        icon: icon,
        errMsg: errMsg,
        chk: chk,
        docmntAplyRsnTag: docmntAplyRsnTag,
      }
    }
  }

  // 타입에따라 헤드셀 수정
  const makeHeadCell = useCallback(() => {
    const temp: HeadCell[] = []

    if (detailInfo?.aprvCd == '0') {
      parCprDealHC.map((item, index) => {
        if (item.id == 'chk') {
          temp.push({ ...item, format: '', label: '', disablePadding: true })
        } else {
          temp.push({ ...item })
        }
      })

      return temp
    }

    return parCprDealHC
  }, [parCprDealHC, detailInfo])

  // 거래내역 체크박스 수정
  const onCheckChange = useCallback(
    (selected: string[], paramDealRow: dealRow[]) => {
      const temp: dealRow[] = []

      paramDealRow.map((item, index) => {
        const bfChk = 'tr' + index

        if (selected.includes(bfChk)) {
          temp.push({ ...item, chk: '1' })
        } else {
          temp.push({ ...item, chk: '0' })
        }
      })

      setDealRow(temp)
    },
    [],
  )

  const handleDownLoad = useCallback(async () => {
    
    if (rowIndex == -1) {
      alert('선택된 서면신청이 없습니다.')
      return
    }

    try {
      const endPoint = '/fsm/par/cpr/cm/getEncryptDocNo'
      const body = { docmntAplyUnqNo: detailInfo?.docmntAplyUnqNo }

      const response = await sendHttpRequest('POST', endPoint, body, true, {
        cache: 'no-store',
      })
      
      if (response && response.resultType === 'success' && response.data) {
        
          // 다운로드 개발하기
          const endPoint2 = `/fsm/par/cpr/cm/getCardPapersReqstDocmntAplyFile/` + response.data;
          const response2 = await sendHttpFileRequest('GET', endPoint2, null, true, { cache: 'no-store' })

          if (response2 instanceof Blob && response2.size === 0) {
            alert('등록된 파일이 없습니다.')
          } else {
            
            const url = window.URL.createObjectURL(new Blob([response2]));
            const link = document.createElement('a');

            const docmntAplyUnqNo = detailInfo?.docmntAplyUnqNo;
            let extension = '';
            
            if (response2.type === 'application/pdf') {
              extension = '.pdf';              
            } else {
              extension = '.tif';
            }

            link.href = url;
            link.setAttribute('download', `${docmntAplyUnqNo}${extension}`);
            document.body.appendChild(link);
            link.click();
          }
          
      } else {
        alert('관리자에게 문의부탁드립니다[handleDownLoad:notEncrypt]')
      }
    } catch (error) {
      alert('관리자에게 문의부탁드립니다[handleDownLoad:error]')
    }
  }, [rowIndex, detailInfo])

  // 승인처리
  const handleUpdate = async () => {

    if (dealRow == null || dealRow.length == 0) {
      alert('선택된 서면신청이 없습니다.')
      return
    }

    if (detailInfo?.aprvCd === '0') {
      alert('처리 완료된 건입니다.')
      return
    }

    let errMsg = ''

    for (let i = 0; i < dealRow.length; i++) {
      if (dealRow[i].chk == '0' && rsnRef.current[i].value == '') {
        errMsg = '거래내역 ' + (i + 1) + '행의 지급여부가 거절일 경우 지급거절사유는 필수입력 항목입니다.'
        break
      }
    }

    if (errMsg) {
      alert(errMsg)
      return
    }

    let chkCnt = 0

    dealRow.map((item, index) => {
      if (item.chk == 1 && item.errMsg != '') {
        chkCnt++
      }
    })

    if (chkCnt > 0) {
      if (!confirm('지급 거래내역 중 의심거래가 ' + chkCnt + '건 존재합니다.\n확인하셨습니까?')) {
        return
      }
    }

    if (!confirm('승인 시 카드사 지급절차에 들어가며 수정이 불가능 합니다.\n승인 하시겠습니까?')) {
      return
    }

    try {
      setLoadingBackdrop(true)
      const reqList: any[] = []

      dealRow.map((item, index) => {
        reqList.push({
          giveYn: item.chk == '1' ? 'Y' : 'N',
          seqNo: item.seqNo,
          docmntAplyRsnCn: rsnRef.current[index].value,
        })
      })

      const endPoint = '/fsm/par/cpr/cm/approveCardPapersReqst'
      const body = {
        docmntAplyUnqNo: detailInfo?.docmntAplyUnqNo,
        aprvCd: '0',
        mdfrId: userInfo.lgnId,
        reqList: reqList,
      }

      const response = await sendHttpRequest('POST', endPoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('완료되었습니다.');
        // 재조회
        setSearchFlag((prev) => !prev)
      } else {
        alert('관리자에게 문의부탁드립니다')
      }
    } catch (error) {
      alert('관리자에게 문의부탁드립니다')
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const excelDownload = async () => {
    const searchObj = {
      ...params,
      strRcptYmd: params.strRcptYmd.replaceAll('-', ''),
      endRcptYmd: params.endRcptYmd.replaceAll('-', ''),
      brno: params.brno.replaceAll('-', ''),
      rrno: params.rrno.replaceAll('-', ''),
      excelYn: 'Y',
    }

    const endpoint =
      '/fsm/par/cpr/cm/getAllCardPapersReqstExcel' + toQueryParameter(searchObj)

    await getExcelFile(
      endpoint,
      '카드서서면신청내역' + '_' + getToday() + '.xlsx',
    )
  }

  return (
    <PageContainer title="카드사서면신청관리" description="카드사서면신청관리">
      {/* 메뉴 경로명 */}
      <Breadcrumb title="카드사서면신청관리" items={BCrumb} />

      {/* 검색영역 */}
      <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
        {/* 조회조건 */}
        <SearchCondition
          params={params}
          handleSearchChange={handleSearchChange}
        />

        {/* CRUD Button */}
        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" color="primary" type="submit">
              검색
            </Button>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              승인
            </Button>
            <Button variant="contained" color="success" onClick={excelDownload}>
              엑셀
            </Button>
          </div>
        </Box>
      </Box>

      {/* 테이블영역 */}
      <Box>
        <TableDataGrid
          headCells={parCprReqHC} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={rowIndex}
        />
      </Box>

      {/* 상세영역 */}
      <>
        {detailInfo ? (
          <DetailDataGrid
            detailInfo={detailInfo}
            setReSearchFlag={setSearchFlag}
          />
        ) : null}
      </>

      {/* 거래내역 */}
      <>
        <DealDataGrid
          headCells={makeHeadCell()}
          cardUseText={cardUseText}
          dealRow={dealRow}
          setDealRow={setDealRow}
          loading={loading}
          onCheckChange={onCheckChange}
          handleDownLoad={handleDownLoad}
          rsnRef={rsnRef}
          aprvCd={detailInfo?.aprvCd ?? '0'}
        />
      </>

      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </PageContainer>
  )
}

export default DataList
