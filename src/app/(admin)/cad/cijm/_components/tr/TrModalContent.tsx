import {
  BlankCard,
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogContentText,
} from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { HeadCell, Pageable2 } from 'table'
import { Row } from './TrIfCardReqComponent'
import { formBrno } from '@/utils/fsms/common/convert'
import { CommSelect, CtpvSelect } from '@/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import TableDataGrid from '@/components/tables/CommDataGrid2'
import { toQueryParameter } from '@/utils/fsms/utils'
import {
  brNoFormatter,
  rrNoFormatter,
  cardNoFormatter,
} from '@/utils/fsms/common/util'
import CarManageInfoSysModal from '@/app/(admin)/layout/vertical/navbar-top/DataResearch/CarManageInfoSysModal'
import { getDateRange } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { StatusType } from '@/types/message'
import {
  TrCardListHC,
  TrCardReqHistHC,
  TrCarListHC,
  TrCarStopListHC,
  TrDrverListHC,
  TrDrverRejectListHC,
} from '@/utils/fsms/headCells'

interface ModalFormProps {
  open: boolean
  data?: Row
  onCloseClick?: () => void
  title?: string
  reloadFunc?: () => void
  openModal?: () => void
  reload?: () => void
}
/**
 * 탈락 모달창(완)
 * @param props
 * @constructor
 */
const TrLocgovApvDeny: React.FC<SearchConditionProps> = (
  props: ModalFormProps,
) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data } = props
  // 목록 조회를 위한 객체 (초기값 설정)
  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd || '',
    rcptYmd: data?.rcptYmd || '',
    rcptSeqNo: data?.rcptSeqNo || '',
    aplySn: parseInt(data?.aplySn) || '',
    locgovAprvYn: data?.locgovAprvYn || '',
    flRsnCn: data?.flRsnCn || '',
    flRsnCd: data?.flRsnCd || '',
  })

  // data 변경 시 params 업데이트
  useEffect(() => {
    setParams({
      crdcoCd: data?.crdcoCd || '',
      rcptYmd: data?.rcptYmd || '',
      rcptSeqNo: data?.rcptSeqNo || '',
      aplySn: parseInt(data?.aplySn) || '',
      locgovAprvYn: data?.locgovAprvYn || '',
      flRsnCn: data?.flRsnCn || '',
      flRsnCd: data?.flRsnCd || '',
    })
  }, [data])

  // 조회조건 변경시
  const handleParamChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  const fetchData = async () => {
    if (params.chgVhclTonCd === '' || data.vhclTonCd === params.chgVhclTonCd) {
      return
    }

    if (params.flRsnCn.length > 60) {
      alert('탈락사유를 60자리 이하로 입력해주시기 바랍니다.')
      return
    }

    const userConfirm = confirm(data.vhclNo + '차량을 탈락처리 하시겠습니까?')

    if (!userConfirm) {
      return
    }

    const newParams = {
      crdcoCd: params.crdcoCd,
      rcptYmd: params.rcptYmd,
      rcptSeqNo: params.rcptSeqNo,
      aplySn: params.aplySn,
      locgovAprvYn: 'N',
      flRsnCn: params.flRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      flRsnCd: params.flRsnCd,
    }
    let endpoint: string = `/fsm/cad/cijm/tr/updateAprvYnCardIssuJdgmnMng`
    const response = await sendHttpRequest('PUT', endpoint, newParams, true, {
      cache: 'no-store',
    })

    if (response && response.resultType == 'success') {
      alert(response.message)
      reloadFunc()
      onCloseClick()
    } else {
      alert(response.message)
    }
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>탈락처리</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="red"
                onClick={() => fetchData()}
              >
                탈락
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                닫기
              </Button>
            </div>
          </Box>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>카드발급요청 탈락처리</caption>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="td-head" scope="row">
                      탈락유형
                    </td>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-flRsnCd"
                        >
                          탈락유형
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="032"
                          pValue={params.flRsnCd}
                          handleChange={handleParamChange}
                          pName="flRsnCd"
                          htmlFor={'sch-flRsnCd'}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="modal-flRsnCn"
                      >
                        탈락사유
                      </CustomFormLabel>
                      <CustomTextField
                        id="modal-flRsnCn"
                        fullWidth
                        name="flRsnCn"
                        value={params?.flRsnCn}
                        onChange={handleParamChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

/**
 * 톤급정보 변경(완)
 * @param props
 * @constructor
 */
const TrChgTonCd: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data } = props
  // 목록 조회를 위한 객체 (초기값 설정)
  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd || '',
    rcptYmd: data?.rcptYmd || '',
    rcptSeqNo: data?.rcptSeqNo || '',
    aplySn: parseInt(data?.aplySn) || '',
    vhclTonCd: data?.vhclTonCd || '',
    chgVhclTonCd: data?.vhclTonCd || '',
    chgVhclTonNm: '',
  })

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      vhclTonCd: data?.vhclTonCd || '',
      chgVhclTonCd: data?.vhclTonCd || '',
    }))
  }, [data])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'chgVhclTonCd' && event.target.options) {
      setParams((prev) => ({
        ...prev,
        chgVhclTonNm: event.target.options[event.target.selectedIndex].text,
      }))
    }
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const fetchData = async () => {
    if (params.chgVhclTonCd === '' || data.vhclTonCd === params.chgVhclTonCd) {
      alert('변경전 톤급정보와 다른 톤급정보를 선택해주세요')
      return
    }

    const userConfirm = confirm(
      data.vhclNo +
        '차량의 톤수를 ' +
        params.chgVhclTonNm +
        '로 변경하시겠습니까?',
    )

    if (!userConfirm) {
      return
    }

    setIsDataProcessing(true)
    try {
      const newParams = {
        crdcoCd: params.crdcoCd,
        rcptYmd: params.rcptYmd,
        rcptSeqNo: params.rcptSeqNo,
        aplySn: params.aplySn,
        vhclTonCd: params.chgVhclTonCd,
        tonCdChgYn: 'Y',
      }
      let endpoint: string = `/fsm/cad/cijm/tr/updateAprvYnCardIssuJdgmnMng`
      const response = await sendHttpRequest('PUT', endpoint, newParams, true, {
        cache: 'no-store',
      })

      if (response && response.resultType == 'success') {
        alert(response.message)
        reloadFunc()
        onCloseClick()
      } else {
        alert(response.message)
      }
    } catch (error: StatusType | any) {
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>톤급정보변경</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => fetchData()}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>

        <Box sx={{ mb: 2 }} style={{ padding: 10 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="label-display">
                  유류구매카드 발급승인정보의 톤급정보를 변경합니다.
                  <br />
                  <br />
                  발급승인요청정보의 톤급정보가 잘못된 경우
                  <br />
                  톤급정보를 변경한 후 승인처리를 계속진행할 수 있습니다.
                </CustomFormLabel>
              </div>
            </div>
          </Box>
        </Box>

        <DialogContent>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>톤급정보변경</caption>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="td-head" scope="row">
                      변경전 톤급정보
                    </td>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CommSelect
                          cdGroupNm="971"
                          pValue={params.vhclTonCd}
                          handleChange={handleParamChange}
                          pName="vhclTonCd"
                          htmlFor={'sch-vhclTonCd'}
                          addText="전체"
                          defaultValue={data.vhclTonCd}
                          pDisabled="true"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      변경후 톤급정보
                    </td>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CommSelect
                          cdGroupNm="971"
                          pValue={params.chgVhclTonCd}
                          handleChange={handleParamChange}
                          pName="chgVhclTonCd"
                          htmlFor={'sch-chgVhclTonCd'}
                          addText="전체"
                          defaultValue={data.vhclTonCd}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
    </Box>
  )
}

/**
 * 차량소유구분/지입사/사업자번호 수정(완)
 * @param props
 * @constructor
 */
const TrCrnoChg: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data } = props
  // 목록 조회를 위한 객체 (초기값 설정)
  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd || '',
    rcptYmd: data?.rcptYmd || '',
    rcptSeqNo: data?.rcptSeqNo || '',
    aplySn: parseInt(data?.aplySn) || '',
    vhclPsnCd: data?.vhclPsnCd || '',
    vhclPsnNm: data?.vhclPsnNm || '',
    crnoD: data?.crnoD || '',
    crno: data?.crno || '',
    bzentyNm: data?.bzentyNm || '',
    rprsvNm: data?.rprsvNm || '',
    vonrBrno: data?.vonrBrno || '',
    vonrBrnoD: data?.vonrBrnoD || '',
  })

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  // 조회조건 변경시
  const handleParamChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  const fetchData = async () => {
    // if (
    //   !(
    //     (params.vhclPsnCd != '' && data.vhclPsnCd != params.vhclPsnCd) ||
    //     (params.crnoD != '' && data.crnoD != params.crnoD) ||
    //     (params.bzentyNm != '' && data.bzentyNm != params.bzentyNm) ||
    //     (params.rprsvNm != '' && data.rprsvNm != params.rprsvNm) ||
    //     (params.vonrBrno != '' &&
    //       data.vonrBrno.replaceAll('-', '') !=
    //         params.vonrBrno.replaceAll('-', ''))
    //   )
    // ) {
    //   return
    // }

    if (
      data.vhclPsnCd == params.vhclPsnCd &&
      data.crnoD.replaceAll('-', '') == params.crnoD.replaceAll('-', '') &&
      data.bzentyNm == params.bzentyNm &&
      data.rprsvNm == params.rprsvNm &&
      data.vonrBrno.replaceAll('-', '') == params.vonrBrno.replaceAll('-', '')
    ) {
      alert('발급요청정보와 동일한 정보입니다.')
      return
    } else if (params.crnoD == '') {
      alert('주민(사업자)번호는 필수입력항목 입니다.')
      return
    } else if (params.vhclPsnCd == '') {
      alert('차량소유구분은 필수입력 항목입니다.')
      return
    } else if (params.vonrBrno == '') {
      alert('차주 사업자등록번호는 필수 입력항목입니다.')
      return
    }

    const userConfirm = confirm(
      data.vhclNo + '차량의 소유구분/사업자번호를 변경하시겠습니까?',
    )

    if (!userConfirm) {
      return
    }

    try {
      setIsDataProcessing(true)

      const newParams = {
        crdcoCd: params.crdcoCd,
        rcptYmd: params.rcptYmd,
        rcptSeqNo: params.rcptSeqNo,
        aplySn: params.aplySn,
        vhclPsnCd: params.vhclPsnCd,
        crno: params.crnoD,
        bzentyNm: params.bzentyNm,
        rprsvNm: params.rprsvNm,
        vonrBrno: params.vonrBrno.replaceAll('-', ''),
      }
      let endpoint: string = `/fsm/cad/cijm/tr/updateAprvYnCardIssuJdgmnMng`
      const response = await sendHttpRequest('PUT', endpoint, newParams, true, {
        cache: 'no-store',
      })

      if (response && response.resultType == 'success') {
        alert(response.message)
        reloadFunc()
        onCloseClick()
      } else {
        alert(response.message)
      }
    } catch (error: StatusType | any) {
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량소유구분(사업자번호)변경</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => fetchData()}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>

        <Box sx={{ mb: 2 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="label-display">
                  유류구매카드 발급승인정보의 지입사정보 및 법인(사업자)번호를
                  변경합니다
                  <br />
                  <br />
                  발급승인요청정보의 정보가 잘못된 경우
                  <br />
                  해당정보를 변경한 후 승인처리를 계속 진행할수 있습니다.
                  <br />
                  <br />
                  법인(사업자)번호는 자동차등록증상의 법인(사업자)번호입니다.
                </CustomFormLabel>
              </div>
            </div>
          </Box>
        </Box>

        <DialogContent
          sx={{
            display: 'flex', // Flexbox를 활성화
            justifyContent: 'space-between', // 두 div 사이 간격 조절
            gap: 2, // 간격 조절
            width: '100%', // 전체 너비 사용
          }}
        >
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1" style={{ width: '48%' }}>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>카드사요청정보</caption>
                <colgroup>
                  <col style={{ width: '45%' }} />
                  <col style={{ width: '55%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      style={{ textAlign: 'center', verticalAlign: 'middle' }}
                    >
                      카드사요청정보
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      차량소유구분
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        disabled
                        placeholder=""
                        fullWidth
                        name="vhclPsnNm"
                        text={data?.vhclPsnNm}
                        value={data?.vhclPsnNm}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      주민(사업자)번호
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        disabled
                        placeholder=""
                        fullWidth
                        name="crnoD"
                        text={rrNoFormatter(data?.crnoD)}
                        value={rrNoFormatter(data?.crnoD)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      지입사 회사명
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        disabled
                        placeholder=""
                        fullWidth
                        name="bzentyNm"
                        text={data?.bzentyNm}
                        value={data?.bzentyNm}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      지입사 대표성명
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        disabled
                        placeholder=""
                        fullWidth
                        name="rprsvNm"
                        text={data?.rprsvNm}
                        value={data?.rprsvNm}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      차주 사업자번호
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        disabled
                        placeholder=""
                        fullWidth
                        name="vonrBrno"
                        text={brNoFormatter(data?.vonrBrno)}
                        value={brNoFormatter(data?.vonrBrno)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1" style={{ width: '48%' }}>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>카드사요청정보</caption>
                <colgroup>
                  <col style={{ width: '45%' }} />
                  <col style={{ width: '55%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      style={{ textAlign: 'center', verticalAlign: 'middle' }}
                    >
                      카드사요청정보
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      차량소유구분
                    </td>
                    <td>
                      <CommSelect
                        cdGroupNm="036"
                        pValue={params.vhclPsnCd}
                        handleChange={handleParamChange}
                        pName="vhclPsnCd"
                        htmlFor={'sch-cardSe'}
                        addText="전체"
                        defaultValue={params.vhclPsnCd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      주민(사업자)번호
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        placeholder=""
                        fullWidth
                        name="crnoD"
                        text={rrNoFormatter(params.crnoD)}
                        value={rrNoFormatter(params.crnoD)}
                        onChange={handleParamChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      지입사 회사명
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        placeholder=""
                        fullWidth
                        name="bzentyNm"
                        text={params.bzentyNm}
                        value={params.bzentyNm}
                        onChange={handleParamChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      지입사 대표성명
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        placeholder=""
                        fullWidth
                        name="rprsvNm"
                        text={params.rprsvNm}
                        value={params.rprsvNm}
                        onChange={handleParamChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      차주 사업자번호
                    </td>
                    <td>
                      <CustomTextField
                        id="ft-fname"
                        placeholder=""
                        fullWidth
                        name="vonrBrno"
                        text={brNoFormatter(params.vonrBrno)}
                        value={brNoFormatter(params.vonrBrno)}
                        onChange={handleParamChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
    </Box>
  )
}

/**
 * 지자체 변경(완)
 * @param props
 * @constructor
 */
const LocalTransDialog: React.FC<SearchConditionProps> = (
  props: ModalFormProps,
) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const headCells: HeadCell[] = [
    {
      id: 'ctpvCd',
      numeric: false,
      disablePadding: false,
      label: '시도코드',
    },
    {
      id: 'ctpvNm',
      numeric: false,
      disablePadding: false,
      label: '시도명',
    },
    {
      id: 'locgovCd',
      numeric: false,
      disablePadding: false,
      label: '관할관청코드',
    },
    {
      id: 'locgovNm',
      numeric: false,
      disablePadding: false,
      label: '관할관청명',
    },
  ]
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  // 검색 조건에 맞는 endpoint 생성

  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd,
    rcptYmd: data?.rcptYmd,
    rcptSeqNo: data?.rcptSeqNo,
    aplySn: parseInt(data?.aplySn),
    vhclNo: data?.vhclNo,
    locgovNm: data?.locgovNm,
    locgovCd: '',
    locgovCdChgYn: 'Y',
    locgovChgRsnCn: '',
    page: 1, // 페이지 번호는 1부터 시작
    size: 10, // 기본 페이지 사이즈 설정
  })

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1,
  })

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  // row클릭시
  const handleClick = async (row: Row, index?: number) => {
    if (data.locgovCd === row.locgovCd) {
      alert('현재 차량의 소속 지자체와 동일합니다.')
      return
    }

    const newParams = {
      ...params,
      locgovCd: row.locgovCd,
      ctpvNm: row.ctpvNm,
      locgovNm: row.locgovNm,
    }
    setParams(newParams)
    setSelectedIndex(index ?? -1)
    // updateLocgovCd(newParams)
  }

  // 조회조건 변경시
  const handleParamChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )
  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
    // 검색 조건에 맞는 endpoint 생성
    let endpoint: string =
      `/fsm/stn/ltmm/tr/pop/getLocgovInfo?page=0&size=9999` +
      `${params.locgovNm ? '&locgovNm=' + params.locgovNm : ''}`
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
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  const updateLocgovCd = async () => {
    const newParams: Row = params

    if (newParams.locgovChgRsnCn === '') {
      alert('변경사유를 입력해주시기 바랍니다.')
      return
    }

    if (newParams.locgovChgRsnCn.length > 30) {
      alert('변경사유를 30자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if (
      !confirm(
        `${params.vhclNo} 차량의 지자체를 ${newParams.ctpvNm} ${newParams.locgovNm} 지자체로 변경하시겠습니까?`,
      )
    ) {
      return
    }

    console.log(newParams)

    setIsDataProcessing(true)

    try {
      let endpoint: string = `/fsm/cad/cijm/tr/updateAprvYnCardIssuJdgmnMng`

      const body = {
        crdcoCd: newParams.crdcoCd,
        rcptYmd: newParams.rcptYmd,
        rcptSeqNo: newParams.rcptSeqNo,
        aplySn: newParams.aplySn,
        vhclNo: newParams.vhclNo,
        locgovNm: newParams.locgovNm,
        locgovCd: newParams.locgovCd,
        locgovCdChgYn: newParams.locgovCdChgYn,
        locgovChgRsnCn: newParams.locgovChgRsnCn
          .replaceAll(/\n/g, '')
          .replaceAll(/\t/g, ''),
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType == 'success') {
        alert(response.message)
        reloadFunc()
        onCloseClick()
      } else {
        alert(response.message)
      }
    } catch (error: StatusType | any) {
      console.error('Error fetching data:', error)
      alert(error.errors[0].reason)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지자체 변경</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => fetchData()}
              >
                검색
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={updateLocgovCd}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={onCloseClick}>
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>지자체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    placeholder=""
                    fullWidth
                    name="locgovNm"
                    text={params.locgovNm}
                    onChange={handleParamChange}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box style={{ paddingBottom: 4 }}>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={handleClick} // 행 클릭 핸들러 추가
              selectedRowIndex={selectedIndex}
            />
          </Box>
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>카드 신청정보 차량 지자체 변경</caption>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      변경사유
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          type="text"
                          id="modal-locgovChgRsnCn"
                          name="locgovChgRsnCn"
                          value={params.locgovChgRsnCn}
                          onChange={handleParamChange}
                          fullWidth
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
    </>
  )
}
/**
 * 신규차량 영업허가일 등록(완)
 * @param props
 * @constructor
 */
const TrBzmtYmd: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, onReturnValue } = props
  // 목록 조회를 위한 객체 (초기값 설정)
  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd || '',
    rcptYmd: data?.rcptYmd || '',
    rcptSeqNo: data?.rcptSeqNo || '',
    aplySn: data?.aplySn || '',
    bzmnPrmsnYmd: data?.bzmnPrmsnYmd || '',
  })

  // data 변경 시 params 업데이트
  useEffect(() => {
    setParams({
      crdcoCd: data?.crdcoCd || '',
      rcptYmd: data?.rcptYmd || '',
      rcptSeqNo: data?.rcptSeqNo || '',
      aplySn: data?.aplySn || '',
      bzmnPrmsnYmd: data?.bzmnPrmsnYmd || '',
    })
  }, [data])

  // 조회조건 변경시
  const handleParamChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  const modifiyTrBuInfo = async () => {
    onReturnValue(params.bzmnPrmsnYmd)
    onCloseClick()
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title1">
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>신규차량 영업허가일 등록</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => modifiyTrBuInfo()}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => onCloseClick()}
              >
                취소
              </Button>
            </div>
          </Box>
        </DialogTitle>

        <Box sx={{ mb: 2 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="label-display">
                  신규로 사업을 허가받은 화물차주는 허가부서에서 허가받은
                  날(양수, 법인합병, 상속의 경우 신고수리일)을
                  <br />
                  위수탁계약(지입)의 경우 계약 체결일을
                  <br />
                  위수탁 후 직영으로 운행하는 경우 위수탁계약 종료일을 허가일로
                  등록하시면 됩니다.
                  <br />
                  [규정 제17조 1항 참고]
                  <br />
                  <br />
                  허가일을 기준으로 해당 월의 지급한도량이 일할계산됩니다.
                  <br />
                  (현 차주의 잔여리터가 일할계산 한도보다 적은 경우 남긴
                  잔여리터가 그대로 승계됩니다.)
                  <br />
                  [규정 제7조 4할 참고]
                  <br />
                  <br />
                  일할계산 식<br />
                  해당차량의 월 한도량X허가일 이후 잔여일수 / 해당 월의 총 일수
                  <br />
                  예)1톤 차량(한도량:683ℓ), 11월 26일 양도·양수한 경우,
                  <br />
                  683ℓ X 5일 / 30일 113.83ℓ
                  <br />.
                </CustomFormLabel>
              </div>
            </div>
          </Box>
        </Box>

        <DialogContent>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>신규차량 영업허가일 등록</caption>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="td-head" scope="row">
                      허가일
                    </td>
                    <td>
                      <CustomTextField
                        value={params.bzmnPrmsnYmd}
                        onChange={handleParamChange}
                        name="bzmnPrmsnYmd"
                        type="date"
                        id="ft-date-start"
                        fullWidth
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

/**
 * 화물 개인/지입 차량목록 조회(완)
 * @param props
 * @constructor
 */
const TrCarList: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const headCells: HeadCell[] = [
    {
      id: '',
      numeric: false,
      disablePadding: false,
      label: '소유카드조회',
      format: 'button',
      button: {
        label: '조회',
        color: 'primary',
        onClick: () => openModal('TrCardList'), // 화살표 함수로 함수 호출 지연
      },
    },
    ...TrCarListHC,
  ]
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/getAllCarCardIssuJdgmnMng?vonrRrno=' + data?.vonrRrnoD

  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
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
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogContent style={{ minWidth: '800px' }}>
          <DialogTitle id="alert-dialog-title1" style={{ paddingRight: '0px' }}>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h3>개인/지입차량확인</h3>
              </CustomFormLabel>
              <div className=" button-right-align">
                <Button variant="contained" color="dark" onClick={onCloseClick}>
                  취소
                </Button>
              </div>
            </Box>
          </DialogTitle>
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>
                    주민등록번호/법인등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vonrRrnoS"
                    text={rrNoFormatter(data?.vonrRrnoS)}
                    value={rrNoFormatter(data?.vonrRrnoS)}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 화물 운전자목록 조회(완)
 * @param props
 * @constructor
 */
const TrDrverList: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/getAllDrverCardIssuJdgmnMng?vhclNo=' + data?.vhclNo

  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
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
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogContent style={{ minWidth: '800px' }}>
          <DialogTitle id="alert-dialog-title1" style={{ paddingRight: '0px' }}>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h3>운전자목록 조회</h3>
              </CustomFormLabel>
              <div className=" button-right-align">
                <Button variant="contained" color="dark" onClick={onCloseClick}>
                  취소
                </Button>
              </div>
            </Box>
          </DialogTitle>
          {/* <DialogContent> */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vonrRrno"
                    text={data?.vhclNo}
                    value={data?.vhclNo}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={TrDrverListHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 자동차망조회
 * @param props
 * @constructor
 */
const TrCarnetList: React.FC<SearchConditionProps> = (
  props: ModalFormProps,
) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const headCells: HeadCell[] = [
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
      label: '현재차주명',
    },
    {
      id: 'flnm',
      numeric: false,
      disablePadding: false,
      label: '운전자성명',
    },
    {
      id: 'rrnoS',
      numeric: false,
      disablePadding: false,
      label: '주민등록번호',
    },
    {
      id: 'ctrtBgngYmd',
      numeric: false,
      disablePadding: false,
      label: '계약시작일자',
    },
    {
      id: 'ctrtEndYmd',
      numeric: false,
      disablePadding: false,
      label: '계약종료일자',
    },
    {
      id: 'telno',
      numeric: false,
      disablePadding: false,
      label: '연락처',
    },
    {
      id: 'regDt',
      numeric: false,
      disablePadding: false,
      label: '등록일자',
    },
    {
      id: 'mdfcnDt',
      numeric: false,
      disablePadding: false,
      label: '수정일자',
    },
  ]
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/getAllDrverCardIssuJdgmnMng?vhclNo=' + data?.vhclNo

  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
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
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogContent>
          <CustomFormLabel className="input-label-display" htmlFor="ft-fname">
            운전자목록 조회
          </CustomFormLabel>
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vonrRrno"
                    text={data?.vhclNo}
                    value={data?.vhclNo}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={headCells} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 정지 및 휴지조회
 * @param props
 * @constructor
 */
const TrCarStopList: React.FC<SearchConditionProps> = (
  props: ModalFormProps,
) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/tr/getAllPymntStopCardIssuJdgmnMng?vhclNo=' + data?.vhclNo

  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
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
      console.log(response.data.content)
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        {/* <DialogContent> */}
        <DialogContent style={{ minWidth: '800px' }}>
          <DialogTitle id="alert-dialog-title1" style={{ paddingRight: '0px' }}>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h3>보조금지급정지/거절 및 차량휴지 내역 조회</h3>
              </CustomFormLabel>
              <div className=" button-right-align">
                <Button variant="contained" color="dark" onClick={onCloseClick}>
                  취소
                </Button>
              </div>
            </Box>
          </DialogTitle>
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vhclNo"
                    text={data?.vhclNo}
                    value={data?.vhclNo}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={TrCarStopListHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 소유카드(완)
 * @param props
 * @constructor
 */
const TrCardList: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/tr/getAllPosesnCardCardIssuJdgmnMng?vonrRrno=' +
    data?.vonrRrnoD
  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
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
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogContent style={{ minWidth: '800px' }}>
          <DialogTitle id="alert-dialog-title1" style={{ paddingRight: '0px' }}>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h3>소유카드목록</h3>
              </CustomFormLabel>
              <div className=" button-right-align">
                <Button variant="contained" color="dark" onClick={onCloseClick}>
                  취소
                </Button>
              </div>
            </Box>
          </DialogTitle>
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>주민번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vonrRrnoS"
                    text={rrNoFormatter(data?.vonrRrnoS)}
                    value={rrNoFormatter(data?.vonrRrnoS)}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={TrCardListHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 카드발급승인상세검토
 * 보조금지급정지/거절 및 차량휴지 내역 이력의 유무에 따라 조회 후 닫기 누르면 출력됨
 * @param props
 * @constructor
 */
const TrDeatailConfirm: React.FC<SearchConditionProps> = (
  props: ModalFormProps,
) => {
  type detailVhclInfo = {
    dataSeCd: string
    koiCdNm: string
    vhclTonNm: string
    locgovNm: string
    vhclPsnNm: string
  }

  type detailVonrInfo = {
    dataSeCd: string
    vonrNm: string
    crnoS: string
    vonrRrnoS: string
    vonrBrno: string
    vhclPsnNm: string
  }

  type detailBizInfo = {
    dataSeCd: string
    bzentyNm: string
    rprsvNm: string
  }

  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/tr/getOneCardIssuJdgmnMng?crdcoCd=' +
    data?.crdcoCd +
    '&rcptYmd=' +
    data?.rcptYmd +
    '&rcptSeqNo=' +
    data?.rcptSeqNo +
    '&aplySn=' +
    parseInt(data?.aplySn) +
    '&vhclNo=' +
    data?.vhclNo +
    '&isStop=' +
    data?.isStop +
    (data.ownerChgYn === 'Y' || data.koiCghYn === 'Y'
      ? '&cardRejectGb=ALL'
      : '&cardRejectGb=' + data.cardSeCd)

  const [modalYn, setModalYn] = useState<boolean>(false)
  const [cardData, setCardData] = useState<Row[]>([]) // 조회용
  const [deVhclInfo, setDeVhclInfo] = useState<detailVhclInfo[]>([]) // 조회용
  const [deVonrInfo, setDeVonrInfo] = useState<detailVonrInfo[]>([]) // 조회용
  const [debizInfo, setDeBizInfo] = useState<detailBizInfo[]>([]) // 조회용
  const [deciHelp, setDeciHelp] = useState<string>('')
  const [deciColor, setDeciColor] = useState<string[]>(
    Array.from({ length: 12 }, () => 'N'),
  )
  const [params, setParams] = useState<Row>({
    crdcoCd: data?.crdcoCd || '',
    rcptYmd: data?.rcptYmd || '',
    rcptSeqNo: data?.rcptSeqNo || '',
    aplySn: data?.aplySn || '',
    bzmnPrmsnYmd: data?.bzmnPrmsnYmd || '',
  })

  const makeBizInfo = (carList: any, carnetList: any): detailBizInfo[] => {
    let detailBizInfo: detailBizInfo[] = carList.map(
      (value: any, index: number) => {
        return {
          dataSeCd: value.dataSeCd,
          bzentyNm: value.bzentyNm,
          rprsvNm: value.rprsvNm,
        }
      },
    )

    return detailBizInfo
  }

  const makeVhclVonrInfo = (
    carList: any,
    carnetList: any,
  ): detailVonrInfo[] => {
    let detailVonrInfo: detailVonrInfo[] = carList.map(
      (value: any, index: number) => {
        return {
          dataSeCd: value.dataSeCd,
          vonrNm: value.vonrNm,
          crnoS: value.crnoS,
          vonrRrnoS: value.vonrRrnoS,
          vonrBrno: value.vonrBrno,
          vhclPsnNm: value.vhclPsnNm,
        }
      },
    )

    detailVonrInfo.push(
      ...carnetList.map((value: any, index: number) => {
        return {
          dataSeCd: value.dataSeCd,
          vonrNm: value.vonrNm,
          crnoS: value.crnoS,
          vonrRrnoS: value.vonrRrnoS,
          vonrBrno: value.vonrBrno,
          vhclPsnNm: value.vhclPsnNm,
        }
      }),
    )

    return detailVonrInfo
  }

  const makeVhclInfoList = (
    carList: any,
    carnetList: any,
  ): detailVhclInfo[] => {
    let detailVhclInfo: detailVhclInfo[] = carList.map(
      (value: any, index: number) => {
        return {
          dataSeCd: value.dataSeCd,
          koiCdNm: value.koiCdNm,
          vhclTonNm: value.vhclTonNm,
          locgovNm: value.locgovNm,
          vhclPsnNm: value.vhclPsnNm,
        }
      },
    )

    detailVhclInfo.push(
      ...carnetList.map((value: any, index: number) => {
        return {
          dataSeCd: value.dataSeCd,
          koiCdNm: value.koiCdNm,
          vhclTonNm: value.vhclTonNm,
          locgovNm: value.locgovNm,
          vhclPsnNm: value.vhclSttsNm,
        }
      }),
    )

    return detailVhclInfo
  }

  const makeDeciArrToStr = (deciArr: string[], strArr: string[]): string => {
    let deciStr = ''

    for (let index = 0; index < deciArr.length; index++) {
      if (deciArr[index] === 'Y') deciStr += strArr[index]
    }

    return deciStr
  }

  const makeDeciHelp = (carList: any, carnetList: any): any[] => {
    const fsmsInfo = carList[0]
    const reqInfo = carList[1]

    let checkDiffArr = Array.from({ length: 12 }, () => 'N')
    let diffStrArr = [
      '- 수급자명 변경\n',
      '- 차주(사업자번호) 변경\n',
      '- 수급자 주민등록번호 변경\n',
      '- 지입사 변경\n',
      '- 차량소유구분 변경\n',
      '- 유종 변경\n',
      '- 톤수 변경\n',
      '- 지자체 변경\n',
      '- 업체명 변경\n',
      '- 업체-대표자명 변경\n',
      '- 자동차정보관리시스템 차량정보 없음\n',
      '- 자동차정보관리시스템 차량말소 상태\n',
    ]

    if (fsmsInfo.vonrNm !== reqInfo.vonrNm) {
      checkDiffArr[0] = 'Y'
    }
    if (fsmsInfo.vonrBrno !== reqInfo.vonrBrno) {
      checkDiffArr[1] = 'Y'
    }
    if (fsmsInfo.vonrRrnoS !== reqInfo.vonrRrnoS) {
      checkDiffArr[2] = 'Y'
    }
    if (fsmsInfo.crnoS !== reqInfo.crnoS) {
      checkDiffArr[3] = 'Y'
    }
    if (fsmsInfo.vhclPsnNm !== reqInfo.vhclPsnNm) {
      checkDiffArr[4] = 'Y'
    }
    if (fsmsInfo.koiCdNm !== reqInfo.koiCdNm) {
      checkDiffArr[5] = 'Y'
    }
    if (fsmsInfo.vhclTonNm !== reqInfo.vhclTonNm) {
      checkDiffArr[6] = 'Y'
    }
    if (fsmsInfo.locgovNm !== reqInfo.locgovNm) {
      checkDiffArr[7] = 'Y'
    }
    if (fsmsInfo.bzentyNm !== reqInfo.bzentyNm) {
      checkDiffArr[8] = 'Y'
    }
    if (fsmsInfo.rprsvNm !== reqInfo.rprsvNm) {
      checkDiffArr[9] = 'Y'
    }

    if (!carnetList[0].vhclNo) {
      checkDiffArr[10] = 'Y'
    } else {
      if (carnetList[0].vhclSttsNm === '말소') {
        checkDiffArr[11] = 'Y'
      }
    }

    return [makeDeciArrToStr(checkDiffArr, diffStrArr), checkDiffArr]
  }

  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
    const response = await sendHttpRequest('GET', endpoint, null, true, {
      cache: 'no-store',
    })
    if (response && response.resultType === 'success') {
      // 데이터 조회 성공시
      const { cardResult, carResult, carNetResult } = response.data

      setDeVonrInfo(makeVhclVonrInfo(carResult, carNetResult))
      setDeVhclInfo(makeVhclInfoList(carResult, carNetResult))
      setDeBizInfo(makeBizInfo(carResult, carNetResult))

      const [deciHelp, deciColor] = makeDeciHelp(carResult, carNetResult)
      setDeciHelp(deciHelp)
      setDeciColor(deciColor)

      setCardData(cardResult)
    }
  }

  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  /*
    허가일 입력구분 N 이면
    승인버튼의 기능이 달라짐
      - 허가일 입력 후 승인호출
      - 일반승인
    승인기능
    허가일 입력 후 저장시 승인으로, 닫기 누르면 허가일 비우기
   */
  let trLocgovApvAcc = async (data) => {
    const userConfirm = confirm(
      data.vhclNo + '차량의 카드발급을 승인하시겠습니까?',
    )

    if (!userConfirm) {
      return
    }

    const newParams = {
      crdcoCd: data.crdcoCd,
      rcptYmd: data.rcptYmd,
      rcptSeqNo: data.rcptSeqNo,
      aplySn: parseInt(data.aplySn),
      locgovAprvYn: 'Y',
      bzmnPrmsnYmd: params.bzmnPrmsnYmd
        ? params.bzmnPrmsnYmd.replaceAll('-', '')
        : '',
    }
    if (data?.bidPermissionYn === 'Y' && newParams.bzmnPrmsnYmd.trim() === '') {
      alert('허가일은 필수로 입력되어야 합니다.')
      return
    }
    let endpoint: string = `/fsm/cad/cijm/tr/updateAprvYnCardIssuJdgmnMng`
    const response = await sendHttpRequest('PUT', endpoint, newParams, true, {
      cache: 'no-store',
    })
    if (response && response.resultType == 'success') {
      setModalYn(false)
      alert(response.message)
      reloadFunc()
      onCloseClick()
      endpoint = '/fsm/cad/cijm/getAllDrverCardIssuJdgmnMng?vhclNo=' + data?.vhclNo
      const driverResponse = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (driverResponse && driverResponse.resultType === 'success' && driverResponse.data.content.length != 0) {
        openModal('TrDrverRejectList')
      }
    } else {
      alert(response.message)
    }
  }

  // 조회조건 변경시
  const handleParamChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setParams((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1024px',
          },
        }}
      >
        <DialogContent
          sx={{
            justifyContent: 'space-between', // 두 div 사이 간격 조절
            gap: 2, // 간격 조절
            width: '100%', // 전체 너비 사용
            borderBottom: '0px !important',
            padding: '15px !important',
          }}
        >
          <DialogTitle id="alert-dialog-title1" style={{ borderBottom: '0px' }}>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h2>화물자동차 유류구매카드 발급심사 상세검토</h2>
              </CustomFormLabel>
              <div className=" button-right-align">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openModal('TrLocgovApvDeny')}
                >
                  탈락
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (data?.bidPermissionYn === 'Y') {
                      setModalYn(true)
                    } else {
                      trLocgovApvAcc(data)
                    }
                  }}
                >
                  승인
                </Button>
                <Button variant="contained" color="dark" onClick={onCloseClick}>
                  취소
                </Button>
              </div>
            </Box>
          </DialogTitle>
          <BlankCard>
            <>
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-fname"
              >
                수급자정보 검토
              </CustomFormLabel>
              {/* 수급자정보 검토 */}
              <DialogContent
                sx={{
                  display: 'flex', // Flexbox를 활성화
                  justifyContent: 'space-between', // 두 div 사이 간격 조절
                  gap: 2, // 간격 조절
                  width: '100%', // 전체 너비 사용
                  borderBottom: '0px !important',
                  padding: '15px !important',
                }}
              >
                {/* 모달팝업 내용 시작 */}
                <div id="alert-dialog-description1" style={{ width: '100%' }}>
                  {/* 테이블영역 시작 */}
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>수급자정보 검토</caption>
                      <colgroup>
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '10%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>구분</th>
                          <th>차주명(업체명)</th>
                          <th>사업자등록번호</th>
                          <th>주민등록번호</th>
                          <th>주민사업자번호</th>
                          <th>차량소유</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deVonrInfo.map(
                          (value: detailVonrInfo, index: number) => {
                            return (
                              <>
                                {index === 2 && (
                                  <tr
                                    key={`vonr-none${index}`}
                                    style={{ height: '5px' }}
                                  ></tr>
                                )}
                                <tr key={`vonr${index}`}>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    {value.dataSeCd}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[0] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {value.vonrNm}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[3] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {brNoFormatter(value.vonrBrno)}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[2] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {rrNoFormatter(value.vonrRrnoS)}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[1] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {rrNoFormatter(value.crnoS)}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[4] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {value.vhclPsnNm}
                                  </td>
                                </tr>
                              </>
                            )
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogContent>

              {/* 차량제원 및 지자체정보검토  업체정보 검토 제목*/}
              <DialogContent
                sx={{
                  display: 'flex', // Flexbox를 활성화
                  justifyContent: 'space-between', // 두 div 사이 간격 조절
                  gap: 2, // 간격 조절
                  width: '100%', // 전체 너비 사용
                  border: '0px !important',
                  padding: '0px !important',
                }}
              >
                <div id="alert-dialog-description1" style={{ width: '48%' }}>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fname"
                  >
                    차량제원 및 지자체정보검토
                  </CustomFormLabel>
                </div>
                <div id="alert-dialog-description1" style={{ width: '48%' }}>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fname"
                  >
                    업체정보 검토
                  </CustomFormLabel>
                </div>
              </DialogContent>

              {/* 차량제원 및 지자체정보검토  업체정보 검토 내용*/}
              <DialogContent
                sx={{
                  display: 'flex', // Flexbox를 활성화
                  justifyContent: 'space-between', // 두 div 사이 간격 조절
                  gap: 2, // 간격 조절
                  width: '100%', // 전체 너비 사용
                  borderBottom: '0px !important',
                  padding: '15px !important',
                }}
              >
                {/* 모달팝업 내용 시작 */}
                <div id="alert-dialog-description1" style={{ width: '48%' }}>
                  {/* 테이블영역 시작 */}
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>차량제원 및 지자체정보검토</caption>
                      <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>데이터구분</th>
                          <th>유종</th>
                          <th>톤수</th>
                          <th>지자체</th>
                          <th>차량상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deVhclInfo.map(
                          (value: detailVhclInfo, index: number) => {
                            return (
                              <>
                                {index === 2 && (
                                  <tr
                                    key={`vhcl-none`}
                                    style={{ height: '5px' }}
                                  ></tr>
                                )}
                                <tr key={`vhcl${index}`}>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    {value.dataSeCd}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[5] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {value.koiCdNm}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[6] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {value.vhclTonNm}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index !== 2
                                          ? deciColor[7] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {value.locgovNm}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      color:
                                        index === 2
                                          ? deciColor[11] === 'Y'
                                            ? 'orange'
                                            : 'black'
                                          : 'black',
                                    }}
                                  >
                                    {value.vhclPsnNm}
                                  </td>
                                </tr>
                              </>
                            )
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 모달팝업 내용 시작 */}
                <div id="alert-dialog-description1" style={{ width: '48%' }}>
                  {/* 테이블영역 시작 */}
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>업체정보 검토</caption>
                      <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '39%' }} />
                        <col style={{ width: '39%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>데이터구분</th>
                          <th>업체명</th>
                          <th>대표자명</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debizInfo.map(
                          (value: detailBizInfo, index: number) => {
                            return (
                              <tr key={`biz${index}`}>
                                <td
                                  style={{
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  {value.dataSeCd}
                                </td>
                                <td
                                  style={{
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                    color:
                                      index !== 2
                                        ? deciColor[8] === 'Y'
                                          ? 'orange'
                                          : 'black'
                                        : 'black',
                                  }}
                                >
                                  {value.bzentyNm}
                                </td>
                                <td
                                  style={{
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                    color:
                                      index !== 2
                                        ? deciColor[9] === 'Y'
                                          ? 'orange'
                                          : 'black'
                                        : 'black',
                                  }}
                                >
                                  {value.rprsvNm}
                                </td>
                              </tr>
                            )
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogContent>

              {/* 안내문구 */}
              <Box sx={{ mb: 2 }}>
                <Box className="sch-filter-box">
                  <div className="filter-form">
                    <div className="form-group">
                      <CustomFormLabel className="label-display">
                        ※ 사업자번호 또는 업체정보(지입회사)가 틀린 경우
                        유류구매카드심사 화면의 사업자번호(지입사)변경 기능을
                        <br />
                        이용하여 해당정보를 변경한 후 승인처리할 수 있습니다.
                        <br />
                        ※ 톤수정보가 잘못 된 경우 유류구매카드심사 화면의
                        톤수변경 기능을 이용하여 해당정보를 변경하 후 승인처리
                        할수 있습니다.
                        <br />
                      </CustomFormLabel>
                    </div>
                  </div>
                </Box>
              </Box>

              {/*  */}
              <DialogContent
                sx={{
                  display: 'flex', // Flexbox를 활성화
                  justifyContent: 'space-between', // 두 div 사이 간격 조절
                  gap: 2, // 간격 조절
                  width: '100%', // 전체 너비 사용
                  border: '0px !important',
                  padding: '0px !important',
                }}
              >
                <div id="alert-dialog-description1" style={{ width: '68%' }}>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fname"
                  >
                    승인처리시 말소대상 카드정보
                  </CustomFormLabel>
                </div>
                <div id="alert-dialog-description1" style={{ width: '30%' }}>
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="ft-fname"
                  >
                    의사결정지원(상세검토내역)
                  </CustomFormLabel>
                </div>
              </DialogContent>
              <DialogContent
                sx={{
                  display: 'flex', // Flexbox를 활성화
                  justifyContent: 'space-between', // 두 div 사이 간격 조절
                  gap: 2, // 간격 조절
                  width: '100%', // 전체 너비 사용
                  borderBottom: '0px !important',
                  padding: '15px !important',
                }}
              >
                {/* 모달팝업 내용 시작 */}
                <div id="alert-dialog-description1" style={{ width: '68%' }}>
                  {/* 테이블영역 시작 */}
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>승인처리시 말소대상 카드정보</caption>
                      <colgroup>
                        <col style={{ width: '27%' }} />
                        <col style={{ width: '19%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '11%' }} />
                        <col style={{ width: '25%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>수급자명</th>
                          <th>사업자번호</th>
                          <th>카드사</th>
                          <th>카드구분</th>
                          <th>카드번호</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cardData != null && cardData.length > 0 ? (
                          cardData.map((item) => (
                            <tr key={item.id}>
                              <td>{item.vonrNm}</td>
                              <td>{item.vonrBrno}</td>
                              <td>{item.crdcoNm}</td>
                              <td>{item.cardSeNm}</td>
                              <td>{cardNoFormatter(item.cardNoS)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                textAlign: 'center',
                                verticalAlign: 'middle',
                              }}
                            >
                              조회된 자료가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 모달팝업 내용 시작 */}
                <div id="alert-dialog-description1" style={{ width: '30%' }}>
                  {/* 테이블영역 시작 */}
                  <div className="table-scrollable">
                    <table className="table table-bordered">
                      <caption>업체정보 검토</caption>
                      <colgroup>
                        <col style={{ width: '100%' }} />
                        <col style={{ width: '39%' }} />
                        <col style={{ width: '39%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              verticalAlign: 'middle',
                              whiteSpace: 'pre-line',
                              fontSize: 14,
                              height: '7rem',
                              overflowY: 'auto',
                              display: 'block',
                            }}
                          >
                            {`${deciHelp}`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogContent>
            </>
          </BlankCard>
        </DialogContent>
      </Dialog>
      {modalYn ? (
        <Box>
          <Dialog
            fullWidth={false}
            maxWidth={'md'}
            open={open}
            onClose={onCloseClick}
            PaperProps={{
              style: {
                width: '700px',
              },
            }}
          >
            <DialogTitle id="alert-dialog-title1">
              <Box className="table-bottom-button-group">
                <CustomFormLabel className="input-label-display">
                  <h2>신규차량 영업허가일 등록</h2>
                </CustomFormLabel>
                <div className=" button-right-align">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => trLocgovApvAcc(data)}
                  >
                    승인
                  </Button>
                  <Button
                    variant="contained"
                    color="dark"
                    onClick={() => setModalYn(false)}
                  >
                    취소
                  </Button>
                </div>
              </Box>
            </DialogTitle>

            <Box sx={{ mb: 2 }}>
              <Box className="sch-filter-box">
                <div className="filter-form">
                  <div className="form-group">
                    <CustomFormLabel className="label-display">
                      신규로 사업을 허가받은 화물차주는 허가부서에서 허가받은
                      날(양수, 법인합병, 상속의 경우 신고수리일)을
                      <br />
                      위수탁계약(지입)의 경우 계약 체결일을
                      <br />
                      위수탁 후 직영으로 운행하는 경우 위수탁계약 종료일을
                      허가일로 등록하시면 됩니다.
                      <br />
                      [규정 제17조 1항 참고]
                      <br />
                      <br />
                      허가일을 기준으로 해당 월의 지급한도량이 일할계산됩니다.
                      <br />
                      (현 차주의 잔여리터가 일할계산 한도보다 적은 경우 남긴
                      잔여리터가 그대로 승계됩니다.)
                      <br />
                      [규정 제7조 4할 참고]
                      <br />
                      <br />
                      일할계산 식<br />
                      해당차량의 월 한도량X허가일 이후 잔여일수 / 해당 월의 총
                      일수
                      <br />
                      예)1톤 차량(한도량:683ℓ), 11월 26일 양도·양수한 경우,
                      <br />
                      683ℓ X 5일 / 30일 113.83ℓ
                      <br />.
                    </CustomFormLabel>
                  </div>
                </div>
              </Box>
            </Box>

            <DialogContent>
              {/* 모달팝업 내용 시작 */}
              <div id="alert-dialog-description1">
                {/* 테이블영역 시작 */}
                <div className="table-scrollable">
                  <table className="table table-bordered">
                    <caption>신규차량 영업허가일 등록</caption>
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '75%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td className="td-head" scope="row">
                          허가일
                        </td>
                        <td>
                          <CustomTextField
                            value={params?.bzmnPrmsnYmd}
                            onChange={handleParamChange}
                            name="bzmnPrmsnYmd"
                            type="date"
                            id="ft-date-start"
                            fullWidth
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Box>
      ) : null}
    </Box>
  )
}

/**
 * 카드발급요청 변경이력 조회
 * @param props
 * @constructor
 */
const TrCardReqHistList: React.FC<SearchConditionProps> = (
  props: ModalFormProps,
) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const endpoint =
    '/fsm/cad/cijm/tr/getAllHistCardIssuJdgmnMng?cardNo=' +
    data?.cardNo +
    '&crdcoCd=' +
    data?.crdcoCd +
    '&vhclNo=' +
    data?.vhclNo

  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
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
    }
  }
  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogContent>
          <CustomFormLabel className="input-label-display" htmlFor="ft-fname">
            카드발급심사 변경이력조회
          </CustomFormLabel>
          <Box>
            <TableDataGrid
              headCells={TrCardReqHistHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * 카드발급승인시 운전자 말소창
 * @param props
 * @constructor
 */
const TrDrverRejectList: React.FC<SearchConditionProps> = (props: ModalFormProps) => {
  // 목록 조회를 위한 객체 (쿼리스트링에서 조건 유무를 확인 하고 없으면 초기값 설정)
  const { open, onCloseClick, title, reloadFunc, data, openModal } = props
  const [rows, setRows] = useState<Row[]>([]) // 조회용
  const [totalRows, setTotalRows] = useState<number>(0) // 조회결과 갯수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [checkedRows, setCheckedRows] = useState<string[]>([]) // 체크 로우 데이터


  // 목록 조회를 위한 객체 (초기값 설정)
  const fetchData = async () => {
    const endpoint = '/fsm/cad/cijm/getAllDrverCardIssuJdgmnMng?vhclNo=' + data?.vhclNo
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
    }
  }
  const rejectDriver = async () => {

    if (!confirm("운전자의 계약을 종료하시겠습니까?")) {
      return
    }

    let driverList = checkedRows.map(str => rows[Number(str.replaceAll('tr', ''))])
    //setIsDataProcessing(true)
    let endpoint: string = `/fsm/cad/cijm/tr/updateDriverInfoForReject`
    const response = await sendHttpRequest('PUT', endpoint, driverList, true, {
      cache: 'no-store',
    })
    if (response && response.resultType == 'success') {
      alert(response.message)
      reloadFunc()
      onCloseClick()
    } else {
      alert(response.message)
    }
  }

  useEffect(() => {
    // 컴포넌트가 로드되면 fetchData 실행
    fetchData()
  }, []) // 빈 배열을 전달하여 컴포넌트 로드 시 한 번만 실행

  return (
    <>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        onClose={onCloseClick}
        PaperProps={{
          style: {
            width: '1400px',
          },
        }}
      >
        <DialogContent style={{ minWidth: '800px' }}>
          <DialogTitle id="alert-dialog-title1" style={{ paddingRight: '0px' }}>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h3>운전자목록 조회</h3>
              </CustomFormLabel>
              <div className=" button-right-align">
                <Button variant="contained" color="dark" onClick={rejectDriver}>
                  계약종료
                </Button>
                <Button variant="contained" color="dark" onClick={onCloseClick}>
                  건너뛰기
                </Button>
              </div>
            </Box>
          </DialogTitle>
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="label-display">
                    유가보조금 수급자가 변경될 경우 전차주가 신고한 운전자의 계약종료일자를 오늘 날짜로 변경하여 계약을 종료시킵니다.<br/>
                    새로운 차주와도 계약이 연장되어 종료시키지 않아도 되는 운전자는 체크를 해제하고 계약종료 버튼을 눌러주세요.<br/>
                    계약종료가 불필요한 경우 건너뛰기 버튼을 눌러주세요.<br/>
                    이후 추가적인 변경은 기준관리 > 화물차 자격관리 > 운전자관리 메뉴에서 할 수 있습니다.
                  </CustomFormLabel>
                </div>
              </div>
            </Box>
          </Box>
          {/* <DialogContent> */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    htmlFor="sch-ctpv"
                  >
                    <span className="required-text">*</span>차량번호
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-fname"
                    disabled
                    placeholder=""
                    fullWidth
                    name="vhclNo"
                    text={data?.vhclNo}
                    value={data?.vhclNo}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={TrDrverRejectListHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              checkAndRowClick={true}
              onSelectedKeysChange={setCheckedRows}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

//리턴
const TrModalContent = {
  //탈락(완)
  TrLocgovApvDeny,
  //톤급변경(완)
  TrChgTonCd,
  //사업자(지입사)변경(완)
  TrCrnoChg,
  //지자체변경(완)
  LocalTransDialog,
  //허가일(완)
  TrBzmtYmd,
  //개인/지입 차량확인(완)
  TrCarList,
  //운전자 조회(완)
  TrDrverList,
  //자망조회(완)
  CarManageInfoSysModal,
  //정지 및 휴지조회(완)
  TrCarStopList,
  //소유카드(완)
  TrCardList,
  //상세검토
  TrDeatailConfirm,
  //카드발급심사 변경이력(완)
  TrCardReqHistList,
  //운전자 말소요청 차량
  TrDrverRejectList,
}

export default TrModalContent
