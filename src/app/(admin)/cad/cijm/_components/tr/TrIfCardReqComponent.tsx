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
import TrdetailCompo from './TrdetailCompo'
import TrModalContent from './TrModalContent'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'
import { calMonthsDate, getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { getDateRange } from '@/utils/fsms/common/dateUtils'

/* 공통 type, interface */
import { Pageable2, HeadCell } from 'table'
import LocalTransDialog from '@/app/(admin)/ilg/aavee/_components/LocalTransDialog'
import CarManageInfoSysModal from '@/app/(admin)/layout/vertical/navbar-top/DataResearch/SearchRadioModal'
import { cadCijmTrHC } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* type 선언 */

/* 검색조건 */
export interface listSearchObj {
  page: number
  size: number
  ctpvCd: string
  locgovCd: string
  locgovAprvYn: string
  srchDtGb: string
  bgngDt: string
  endDt: string
  vhclNo: string
  bzentyNm: string
}

export interface Row {
  [key: string]: any
}

const TrIfCardReqComponent = () => {
  const [params, setParams] = useState<listSearchObj>({
    page: 1,
    size: 10,
    ctpvCd: '',
    locgovCd: '',
    locgovAprvYn: '',
    srchDtGb: '',
    bgngDt: '',
    endDt: '',
    vhclNo: '',
    bzentyNm: '',
  })

  const [rows, setRows] = useState<Row[]>([]) // 조회결과
  const [detail, setDetail] = useState<Row>()
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [rowIndex, setRowIndex] = useState<number>(-1) // 현재 선택된 로우
  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  }) // 페이징객체
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [searchFlag, setSearchFlag] = useState<boolean | null>(null) // 검색 flag
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)
  const [buttonYn, setButtonYn] = useState<boolean | null>(null) // 검색 flag
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [modalYn, setModalYn] = useState<boolean>(false)
  /**
   * 모달
   */
  const modalMap: Record<string, React.FC<any>> = {
    TrLocgovApvDeny: TrModalContent.TrLocgovApvDeny,
    TrChgTonCd: TrModalContent.TrChgTonCd,
    TrCrnoChg: TrModalContent.TrCrnoChg,
    LocalTransDialog: TrModalContent.LocalTransDialog,
    TrBzmtYmd: TrModalContent.TrBzmtYmd,
    TrCarList: TrModalContent.TrCarList,
    TrDrverList: TrModalContent.TrDrverList,
    //TrCarnetList : TrModalContent.TrCarnetList,
    TrCarStopList: TrModalContent.TrCarStopList,
    TrCardList: TrModalContent.TrCardList,
    TrDeatailConfirm: TrModalContent.TrDeatailConfirm,
    TrCardReqHistList: TrModalContent.TrCardReqHistList,
    CarManageInfoSysModal: TrModalContent.CarManageInfoSysModal,
    TrDrverRejectList: TrModalContent.TrDrverRejectList,
    //TrVhclSttsChg : TrModalContent.TrVhclSttsChg,
    // 추가 모달 컴포넌트 작성
  }
  const [activeModal, setActiveModal] = useState<string | null>(null) // 활성화된 모달 이름
  const ActiveModal = activeModal ? modalMap[activeModal] : null
  const [modalData, setModalData] = useState<Record<string, any>>({}) // 모달 데이터
  const [open, setOpen] = useState<boolean>(false)

  type ResolveFn = (value?: void | PromiseLike<void>) => void
  const [resolveFn, setResolveFn] = useState<ResolveFn | null>(null)
  const [bzmnPrmsnYmd, setBzmnPrmsnYmd] = useState<string | null>('')

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
    setDetail((prev) => ({
      ...prev,
      bzmnPrmsnYmd: bzmnPrmsnYmd,
    }))
  }, [bzmnPrmsnYmd])

  useEffect(() => {
    setModalData(detail)
  }, [detail])

  // 조회클릭시
  const handleAdvancedSearch = () => {
    setParams((prev) => ({ ...prev, page: 1 }))
    setSearchFlag(true)
  }

  // 조회조건 변경시
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  // row클릭시
  const handleClick = (row: Row, index?: number) => {
    if (row.locgovAprvYn === 'R') {
      setButtonYn(true)
    } else {
      setButtonYn(false)
    }
    setDetail(row)
    setRowIndex(index ?? -1)
    if (rowIndex === index) {
      setIsDetailOpen(!isDetailOpen)
    } else {
      setIsDetailOpen(true)
    }
  }

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page: page, size: pageSize }))
      setSearchFlag(true)
    },
    [],
  )

  const setInitial = () => {
    setRows([])
    setTotalRows(0)
    setPageable({
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    })
  }

  const isValidDateIn3Month = (stDate: string, edDate: string): boolean => {
    const iDate: Date = new Date(stDate)
    const oDate: Date = new Date(edDate)

    let compare1: boolean = true;
    let compare2: boolean = true;

    const plus3Month: Date = new Date(calMonthsDate(new Date(iDate), 3));
    const minus3Month: Date = new Date(calMonthsDate(new Date(oDate), -3));

    // 시작일자 + 3개월이 종료일자보다 클 때 정상
    compare1 = plus3Month >= oDate ? true : false

    // 종료일자 - 3개월이 시작일자보다 작을 때 정상
    compare2 = minus3Month <= iDate ? true : false

    return (compare1 && compare2 ? true : false)
  }
  // 조회정보 가져오기
  const fetchData = async () => {
    setLoading(true)

    try {
      const searchObj = {
        ...params,
        page: params.page,
        size: params.size,
        bgngDt: params.bgngDt.replaceAll('-', ''),
        endDt: params.endDt.replaceAll('-', ''),
        locgovCd: params.locgovCd,
      }

      if (parseInt(searchObj.bgngDt) > parseInt(searchObj.endDt)) {
        alert('시작일자는 종료일 이후의 날짜를 선택해주세요.')
      }
      if ( (params.vhclNo === null || params.vhclNo === '') && !isValidDateIn3Month(params.bgngDt ,params.endDt)) {
        alert('차량번호 미기입시 조회기간은 3개월 이내이어야 합니다.')
        return
      }

      const endpoint =
        '/fsm/cad/cijm/tr/getAllCardIssuJdgmnMng' + toQueryParameter(searchObj)
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
        // handleClick(response.data.content[0], 0)
      } else {
        // 데이터가 없거나 실패
        setInitial()
        setDetail(null)
      }
    } catch (error) {
      // 에러시
      console.log(error)
      setInitial()
    } finally {
      setLoading(false)
      setSearchFlag(false)
      setIsDetailOpen(false)
    }
  }

  //엑셀 다운로드
  const handleExcelDownload = async () => {
    if (rows.length === 0) {
      alert('조회된 내역이 없습니다.')
      return
    }

    const searchObj = {
      ...params,
      excelYn: 'Y',
      bgngDt: params.bgngDt.replaceAll('-', ''),
      endDt: params.endDt.replaceAll('-', ''),
    }

    setIsDataProcessing(true)

    const endpoint =
      '/fsm/cad/cijm/tr/getAllCardIssuJdgmnMngExcel' +
      toQueryParameter(searchObj)
    const title = '카드발급 심사 관리_화물_' + getToday() + '.xlsx'

    await getExcelFile(endpoint, title)

    setIsDataProcessing(false)
  }

  const handleModal = (type: boolean) => setOpen(type)
  /**
   * 모달 컨트롤
   */
  const openModal = (modalName: string, data: Record<string, any>) => {
    if (detail) {
      setActiveModal(modalName)
      setOpen(true)
    }
  }

  const closeModal = () => {
    setOpen(false)
    setActiveModal(null)
  }
  const cadCijmTrHeadCell: HeadCell[] = [
    {
      id: '',
      numeric: false,
      disablePadding: false,
      label: '변경이력',
      format: 'button',
      button: {
        label: '조회',
        color: 'dark',
        //onClick: {handleOpen}
        onClick: () => openModal('TrCardReqHistList'), // 화살표 함수로 함수 호출 지연
      },
    },
    ...cadCijmTrHC,
  ]

  const getDecision = (detail) => {
    let strMessage = ''

    // 부정수급자 신차 양수
    if (detail.illegalityYn === 'Y' && detail.ownerChgYn === 'Y') {
      strMessage += ' [부정수급자가 양수한 차량].'
    }

    //지입사변경
    if (detail.rentChgYn === 'Y') {
      strMessage += ' [지입사변경].'
    }

    //차주변경
    if (detail.ownerChgYn === 'Y') {
      strMessage += ' [차주변경],'
    }

    //차주사업자등록번호 변경
    if (detail.bizChgYn === 'Y') {
      strMessage += ' [사업자등록번호변경],'
    }

    //자자체변경
    if (detail.locgovChgYn === 'Y') {
      strMessage += ' [지자체변경].'
    }

    //톤수변경
    if (detail.tonCdChgYn === 'Y') {
      strMessage += ' [톤수변경].'
    }

    //유종변경
    if (detail.koiChgYn === 'Y') {
      strMessage += ' [유종변경].'
    }

    //이전카드존재여부
    if (detail.bfCardExistYn === 'Y') {
      if (detail.rissuRsnCd === '0' || detail.rissuRsnCd === '3') {
        strMessage += ' [유류구매카드존재(승인처리시말소됨)].'
      }
      if (detail.rissuRsnCd === '1' || detail.rissuRsnCd === '2') {
        strMessage +=
          ' [유류구매카드존재(승인시 말소되지않고 새카드 사용시 말소됨)].'
      }
    }

    //자동차망상태검증
    if (detail.carnetSts === '10') {
      strMessage += ' [자동차정보관리시스템 차량정보 없음].'
    }
    if (detail.carnetSts === '99') {
      strMessage += ' [자동차정보관리시스템 차량말소 상태].'
    }

    return strMessage
  }
  const bzmtYmdFunc = (modalId: string): Promise<void> => {
    return new Promise((resolve) => {
      openModal(modalId)
      // 모달이 열렸을 때, 나중에 resolve를 호출하기 위해 state에 저장
      setResolveFn(() => resolve)
    })
  }
  /**
   * 카드발급 승인
   * @constructor
   */
  let trLocgovApvAcc = async (detailData: Row | undefined) => {
    if (detailData?.locgovCd === '43710') {
      alert(
        '현재 지자체가 충북 청원군입니다. \n 지자체를 청주시로 변경하신 후 승인해주세요',
      )
      return
    }

    if (detailData?.carnetSts != '00') {
      alert(
        '선택차량은 자동차정보관리시스템 차량말소 상태입니다. \n' +
          '차량말소여부를 확인한 후 승인처리를 진행해 주십시오. \n\n' +
          '※ 자동차정보관리시스템에서 변동되는 차량변경정보는 처리 후 다음날(익일) 유가보조금관리시스템내에 반영됩니다.',
      )
    }

    let strMessage = getDecision(detailData)

    if (strMessage != '') {
      alert(
        '다음 차량은 아래와 같은 변동정보가 있습니다.\n\n' +
          strMessage +
          '\n\n상세검토화면에서 수급자정보를 비교검토한 후 승인처리를 진행해 주십시오.',
      )
      //await bzmtYmdFunc('TrBzmtYmd')
      openModal('TrDeatailConfirm')
    } else {
      let con = confirm(
        '발급승인에 필요한 서류(규정 제17조제2항)를 확인하시기 바랍니다.\n\n' +
          '유류구매카드 발급신청정보를 승인처리하시겠습니까?',
      )
      if (con) {
        if (detailData?.bidPermissionYn === 'Y') {
          //허가일 입력
          await bzmtYmdFunc('TrBzmtYmd')
        }

        const newParams = {
          crdcoCd: detailData?.crdcoCd,
          rcptYmd: detailData?.rcptYmd,
          rcptSeqNo: detailData?.rcptSeqNo,
          aplySn: detailData?.aplySn,
          locgovAprvYn: 'Y',
          bzmnPrmsnYmd: detailData?.bzmnPrmsnYmd,
        }

        let endpoint: string = `/fsm/cad/cijm/tr/updateAprvYnCardIssuJdgmnMng`
        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          newParams,
          true,
          {
            cache: 'no-store',
          },
        )
        if (response && response.resultType == 'success') {
          alert(response.message)
          reloadFunc()
          onCloseClick()
        } else {
          alert(response.message)
        }
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') fetchData()
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
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
                pDisableSelectAll={true}
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
                cdGroupNm="088"
                pValue={params.locgovAprvYn}
                handleChange={handleSearchChange}
                pName="locgovAprvYn"
                htmlFor={'sch-cardSe'}
                addText="전체"
                defaultValue={'R'}
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
                row
                id="srchDtGb"
                name="srchDtGb"
                className="mui-custom-radio-group"
                onChange={handleSearchChange}
                value={params.srchDtGb || ''}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  maxWidth: '40%',
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
                type="date"
                id="ft-date-end"
                fullWidth
              />
            </div>

            <div
              className="form-group"
              style={{ maxWidth: '200px', marginLeft: '2%' }}
            >
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
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="form-group" style={{ marginLeft: '2%' }}>
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
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </Box>

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
            {buttonYn ? (
              <>
                {/* 승인 */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (modalData?.bidPermissionYn === 'Y') {
                      openModal('TrDeatailConfirm', modalData)
                    } else {
                      trLocgovApvAcc(modalData)
                    }
                  }}
                >
                  승인
                </Button>
                {/* 탈락 */}
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => openModal('TrLocgovApvDeny')}
                >
                  탈락
                </Button>
              </>
            ) : null}

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
          headCells={cadCijmTrHeadCell} // 테이블 헤더 값
          rows={rows} // 목록 데이터
          totalRows={totalRows} // 총 로우 수
          loading={loading} // 로딩여부
          onRowClick={handleClick} // 행 클릭 핸들러 추가
          onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
          pageable={pageable} // 현재 페이지 / 사이즈 정보
          selectedRowIndex={rowIndex}
          caption={'화물 카드발급 심사 관리 목록 조회'}
        />
      </Box>
      {rowIndex !== -1 && isDetailOpen ? (
        <Grid item xs={4} sm={4} md={4}>
          <TrdetailCompo
            data={detail}
            openModal={openModal}
            buttonYn={buttonYn}
            reloadFunc={handleAdvancedSearch}
          />
        </Grid>
      ) : null}
      {ActiveModal && (
        <ActiveModal
          open={open}
          data={modalData}
          onCloseClick={closeModal}
          openModal={openModal}
          reloadFunc={handleAdvancedSearch}
          onReturnValue={(retVal) => {
            setBzmnPrmsnYmd(retVal)
            resolveFn()
          }}
          vhclNo={detail?.vhclNo}
          dataSeCd="3"
        />
      )}
      <LoadingBackdrop open={isDataProcessing} />
    </>
  )
}

export default TrIfCardReqComponent
