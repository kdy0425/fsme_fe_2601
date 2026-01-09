import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import {
  Button,
  DialogContent,
  FormControlLabel,
  Grid,
  RadioGroup,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import { Table } from '@mui/material'
import { Box, Dialog, TableContainer } from '@mui/material'
import {
  CustomRadio,
  CustomFormLabel,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'

import OilStationModal from '@/app/components/tr/popup/OilStationModal'
import { CommSelect } from '../../tx/commSelect/CommSelect'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { closeIlgIsdModal } from '@/store/popup/IlgIsdSlice'
import {
  clearOilStationInfo,
  openOilStationModal,
} from '@/store/popup/OilStationSlice'
import TrVhclModal from './TrVhclModal'
import { clearCarInfo, openCarModal } from '@/store/popup/CarInfoSlice'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import {
  addDays,
  dateToString,
  getAddDay,
  getDateCustomFormatYMD,
  getDateFormatYMD,
  stringToDate,
} from '@/utils/fsms/common/dateUtils'
import { getToday } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { StatusType } from '@/types/message'
import { clearIsdSelectedData, setIsdSearchTrue } from '@/store/page/IsdSlice'
import {
  calYearsDate,
  calMonthsDate,
  calDaysDate,
  nowDate,
} from '@/utils/fsms/common/comm'
import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox'
import { log } from 'console'
const IlgIsdModal = () => {
  const IlgIsdInfo = useSelector((state: AppState) => state.IlgIsdInfo)
  const isdInfo = useSelector((state: AppState) => state.isdInfo)
  const oilStationInfo = useSelector((state: AppState) => state.oilStationInfo)
  const vhclInfo = useSelector((state: AppState) => state.carInfo)
  const dispatch = useDispatch()

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  // 행정처분에 따른 input disable state
  const [disable, setDisable] = useState<boolean>(true)
  const [disableStopEndYmd, setDisableStopEndYmd] = useState<boolean>(false)
  const [disableStopBgngYmd, setDisableStopBgngYmd] = useState<boolean>(false)
  const [disableCpeaChck, setDisableCpeaChck] = useState<boolean>(true)

  const [params, setParams] = useState({
    vhclNo: '',
    vonrNm: '',
    locgovCd: '',
    locgovNm: '',
    bzmnSeCd: '',
    tpbizSeCd: '',
    droperYn: '',
    rdmAmt: '',
    totlAprvAmt: '',
    totlAsstAmt: '',
    rdmActnAmt: '',
    rdmActnAmtDown: '',
    rdmTrgtNocs: '',
    rdmYn: '',
    dspsDt: '',
    admdspSeCd: '',
    admdspRsnCn: '',
    admdspBgngYmd: '',
    admdspEndYmd: '',
    oltPssrpPrtiYn: '',
    unlawStrctChgYnCd: '',
    dsclMthdCd: '',
    dsclMthdNm: '',
    vonrRrno: '',
    ruleVltnCluCd: '',
    ruleVltnCluNm: '',
    oltPssrpPrtiOltNm: '',
    oltPssrpPrtiBrno: '',
    dsclMthdEtcMttrCn: '',
    ruleVltnCluEtcCn: '',
    rdmDt: '',
    vonrBrno: '',
    koiCd: '',
    vhclTonCd: '',
    instcSpldmdTypeCd: '',
    dlngDsctnInptSeCd: '',
    useLiter: '',
    instcSpldmdAmt: '',
    warnYn: 'N',
    giveStopYn: '',
    prcsSeCd: '',
    rlRdmAmt: '',
    dspsPrdCd: '',
    rdmActnYmd: '',
    bgngYmd: '',
    endYmd: '',
    trsmYn: '',
    cpeaChckYn: '',
    cpeaChckCyclVl: '',
    dlngNocs: '',
    vhclRestrtYmd: '',
    exmnRegNocs: '',
    ttmKoiCd: '',
    instcSpldmdRsnCn: '',
    stopChangeRsn: '',
    pbadmsPrcsSeCd: 'N',
    vonrRrnoSe: '',
    vonrRrnoD: '',
    tpbizCd: '',
    dwGb: '',
  })

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      vhclNo: vhclInfo.vhclNoCM,
      vonrNm: vhclInfo.vonrNmCM,
      vonrRrnoSe: vhclInfo.vonrRrnoSeCM,
      vonrBrno: vhclInfo.vonrBrnoCM,
      vonrRrno: vhclInfo.vonrRrnoCM,
      locgovCd: vhclInfo.locgovCdCM,
      locgovNm: vhclInfo.locgovNmCM,
    }))
  }, [vhclInfo])

  useEffect(() => {
    if (disable) {
      setParams((prev) => ({
        ...prev,
        ...returnInitialState(),
      }))
    } else {
      setParams((prev) => ({
        ...prev,
        dspsDt: nowDate(),
        admdspBgngYmd: calDaysDate(new Date(), 1),
        admdspEndYmd: calMonthsDate(new Date(), 6),
        admdspSeCd: 'H',
        rdmYn: 'Y',
      }))
    }
  }, [disable])

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      oltPssrpPrtiBrno: oilStationInfo.frcsBrnoOSM,
      oltPssrpPrtiOltNm: oilStationInfo.frcsNmOSM,
    }))
  }, [oilStationInfo])

  useEffect(() => {
    const { admdspSeCd } = params
    let admdspEndYmd = ''
    let stopBgngYmdReset = false
    let stopEndYmdReset = false
    let disableStopEndYmd = false
    let disableStopBgngYmd = false
    if (admdspSeCd === 'H') {
      // admdspEndYmd = getDateFormatYMD(getAddDay(181))
      admdspEndYmd = calMonthsDate(new Date(), 6)
    } else if (admdspSeCd === 'S') {
      // admdspEndYmd = getDateFormatYMD(getAddDay(366))
      admdspEndYmd = calYearsDate(new Date(), 1)
    } else if (admdspSeCd === 'C') {
      admdspEndYmd = '9999-12-31'
      disableStopEndYmd = true
    } else {
      admdspEndYmd = ''
      stopBgngYmdReset = true
      stopEndYmdReset = true
      disableStopEndYmd = true
      disableStopBgngYmd = true
    }

    setParams((prev) => ({
      ...prev,
      ...(stopBgngYmdReset
        ? { admdspBgngYmd: '' }
        : // : { admdspBgngYmd: getDateFormatYMD(getAddDay(1)) }),
          { admdspBgngYmd: calDaysDate(new Date(), 1) }),
      ...(stopBgngYmdReset ? { admdspEndYmd: '' } : { admdspEndYmd }),
    }))
    setDisableStopEndYmd((prev) => disableStopEndYmd)
    setDisableStopBgngYmd((prev) => disableStopBgngYmd)
  }, [params.admdspSeCd])

  useEffect(() => {
    const { admdspBgngYmd, admdspSeCd } = params
    if (admdspBgngYmd.replaceAll('-', '').length === 8) {
      const stopBgngYmdStr = admdspBgngYmd.replaceAll('-', '')
      if(params.pbadmsPrcsSeCd === 'Y'){
        if (admdspSeCd === 'H') {
        // const addDateString = dateToString(addDays(bgngDate, 180))
        const addDateString = calMonthsDate(new Date(), 6)
        setParams((prev) => ({
          ...prev,
          admdspEndYmd: getDateCustomFormatYMD(addDateString, '-'),
        }))
      } else if (admdspSeCd === 'S') {
        // const addDateString = dateToString(addDays(bgngDate, 365))
        const addDateString = calYearsDate(new Date(), 1)
        setParams((prev) => ({
          ...prev,
          admdspEndYmd: getDateCustomFormatYMD(addDateString, '-'),
        }))
      }
      }
    }
  }, [params.admdspBgngYmd])

  useEffect(() => {
    const { cpeaChckYn } = params

    if (cpeaChckYn === 'Y') {
      setDisableCpeaChck((prev) => false)
    } else {
      setDisableCpeaChck((prev) => true)
    }
  }, [params.cpeaChckYn])

  useEffect(() => {
    const { rdmYn } = params

    if (rdmYn === 'Y') {
      setParams((prev) => ({
        ...prev,
        rdmActnAmtDown: params.rdmActnAmt,
        rdmYn : 'Y',
      }))
    } else {
      setParams((prev) => ({
        ...prev,
        rdmActnAmtDown: '',
        rdmYn : 'N',
      }))
    }
  }, [params.rdmYn])

  useEffect(() => {
    dispatch(clearCarInfo())
    dispatch(clearOilStationInfo())
  }, [])

  useEffect(() => {
    if (params.pbadmsPrcsSeCd === 'Y') {
      setDisable(false)
    } else {
      setDisable(true)
    }
  }, [params.pbadmsPrcsSeCd])

  useEffect(() => {
    const { oltPssrpPrtiYn } = params
    if (oltPssrpPrtiYn === 'N') {
      setParams((prev) => ({
        ...prev,
        oltPssrpPrtiBrno: '',
        oltPssrpPrtiOltNm: '',
      }))
    }
  }, [params.oltPssrpPrtiYn])

  const handleParamsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'ttmKoiCd') {
      //당시 유종
      setParams((prev) => ({ ...prev, koiCd: value, [name]: value }))
    } else if (name === 'rdmActnAmt') {
      if (params.pbadmsPrcsSeCd === 'Y') {
        setParams((prev) => ({
          ...prev,
          [name]: value,
          rdmYn: 'Y',
          ['rdmActnAmtDown']: value,
        }))
      } else {
        setParams((prev) => ({ ...prev, [name]: value , rdmYn : 'N'}))
      }
    } else if(name === 'rdmYn'){
      let val = params.rdmYn === 'N' ? 'Y' : 'N'
      if(val === 'N'){
        setParams((prev) => ({
          ...prev,
          [name]: val, rdmActnAmt: '', rdmDt : '' , rlRdmAmt: ''
        }))
      }else{
        setParams((prev) => ({
        ...prev,
        [name]: val,
        }))
      }
      
    } else if(name === 'pbadmsPrcsSeCd'){
      if( value === 'Y'){
        setParams((prev) => ({ ...prev, [name]: value, rdmYn: 'Y' }))
      }else{
        setParams((prev) => ({ ...prev, [name]: value, rdmYn: 'N', rdmActnAmt: '', rdmDt : '' , rlRdmAmt: '',admdspBgngYmd: '', admdspEndYmd: ''  }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleTextareaChange = (val: string) => {
    setParams((prev) => ({
      ...prev,
      admdspRsnCn: val.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
    }))
  }

  const handleClickClose = () => {
    dispatch(closeIlgIsdModal())
  }

  const openOilModal = () => {
    dispatch(openOilStationModal())
  }

  const openVhclModal = () => {
    dispatch(openCarModal())
  }

  const returnInitialState = () => {
    return {
      admdspSeCd: '',
      rdmYn: '',
      rdmActnAmt: '',
      admdspBgngYmd: '',
      admdspEndYmd: '',
      admdspRsnCn: '',
      oltPssrpPrtiYn: '',
      oltPssrpPrtiOltNm: '',
      oltPssrpPrtiBrno: '',
      unlawStrctChgYnCd: '',
      dsclMthdCd: '',
      dsclMthdEtcMttrCn: '',
      ruleVltnCluCd: '',
      ruleVltnCluEtcCn: '',
      cpeaChckYn: '',
      cpeaChckCyclVl: '',
      instcSpldmdTypeCd: '',
    }
  }

  useEffect(() => {
    console.log('params', params)  
  }, [params]);

  const validation = () => {
    if (!params.vhclNo) {
      alert('차량번호는 필수 입니다.')
      return false
    }

    if (!params.vonrNm) {
      alert('차량소유자명은 필수 입니다.')
      return false
    }

    if (!params.vonrBrno) {
      alert('사업자등록번호를 입력해주세요')
      return false
    }

    if (!params.ttmKoiCd) {
      alert('당시 유종을 선택해주세요')
      return false
    }

    if (!params.vhclTonCd) {
      alert('당시 톤수를 선택해주세요')
      return false
    }

    if (!params.bgngYmd) {
      alert('부정수급 거래시작일을 입력해주세요')
      return false
    }

    if (!params.endYmd) {
      alert('부정수급 거래종료일을 입력해주세요')
      return false
    }

    if (params.bgngYmd > params.endYmd) {
      alert('부정수급 거래기간 시작일이 종료일보다 나중일 수 없습니다.')
      return
    }

    if (!params.dlngNocs || Number(params.dlngNocs) === 0) {
      alert('거래건수를 입력해주세요')
      return
    }

    if (!params.totlAprvAmt || Number(params.totlAprvAmt) === 0) {
      alert('거래금액를 입력해주세요')
      return
    }

    if (!params.rdmTrgtNocs || Number(params.rdmTrgtNocs) === 0) {
      alert('부정수급건수를 입력해주세요')
      return
    }

    if (params.dlngNocs < params.rdmTrgtNocs) {
      alert('부정수급건수는 거래건수보다 많을 수 없습니다.')
      return
    }

    if (!params.instcSpldmdAmt || Number(params.instcSpldmdAmt) === 0) {
      alert('부정수급액을 입력해주세요')
      return
    }

    if (Number(params.totlAprvAmt) < Number(params.instcSpldmdAmt)) {
      alert('부정수급액은 거래금액보다 많을 수 없습니다.')
      return
    }

    if (!params.totlAsstAmt || Number(params.totlAsstAmt) === 0) {
      alert('유가보조금액을 입력해주세요')
      return
    }

    if (Number(params.totlAsstAmt) < Number(params.rdmActnAmt)) {
      alert('유가보조금액 이상의 금액으로 환수할 수 없습니다.')
      return
    }

    // 행정처분당시 환수한금액 정확하지 않아 validation x
    if (params.rdmYn && params.rdmYn === 'Y' && (!params.rlRdmAmt || Number(params.rlRdmAmt) === 0)) {
      if (!confirm('환수한금액을 입력하지 않았습니다. 계속 진행하시겠습니까?')){
        return
      }
    }

    if (!params.bzmnSeCd) {
      alert('법인/개인을 선택해주세요')
      return
    }

    if (!params.tpbizCd) {
      alert('업종을 선택해주세요')
      return
    }

    if (!params.droperYn) {
      alert('직영여부를 선택해주세요')
      return
    }

    if (!params.tpbizSeCd) {
      alert('업종구분을 선택해주세요')
      return
    }

    if (!params.dspsDt) {
      alert('조치일을 선택해주세요')
      return
    }

    if (params.rdmYn && params.rdmYn === 'Y' && (!params.rdmActnAmt || Number(params.rdmActnAmt) === 0)) {
      alert('환수할금액을 입력해주세요')
      return
    }

    if (!params.rdmActnAmt && params.rlRdmAmt != 0 && !params.rdmDt) {
      alert('환수한일자를 입력해주세요')
      return
    }

    if (params.pbadmsPrcsSeCd && params.pbadmsPrcsSeCd === 'Y') {
      if (params.rdmYn === 'Y' && !params.rdmActnAmt) {
        alert(
          '환수를 체크했으나, 환수금액을 입력하지 않았습니다. 계속 진행하시겠습니까?',
        )
        return false
      }
      if(params.admdspSeCd != 'G' && params.admdspSeCd != 'A'){
        if (params.admdspBgngYmd.replaceAll('-', '') <= getToday()) {
          alert('행정처분 시작일은 오늘 이후로 등록할 수 있습니다.')
          return false
        }

        if (params.admdspBgngYmd > params.admdspEndYmd) {
          alert('행정처분 시작일이 종료일보다 나중일 수 없습니다.')
          return
        }
      }

      if (!params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
        alert('조사내용 및 행정처분사유를 입력해주세요.')
        return false
      }

      if (
        params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 70
      ) {
        alert('조사내용 및 행정처분사유를 70자리 이하로 입력해주시기 바랍니다.')
        return false
      }

      if (params.oltPssrpPrtiYn === 'Y' && !params.oltPssrpPrtiOltNm) {
        alert('공모한 주유소를 입력하지 않았습니다.')
        return false
      }

      if (params.oltPssrpPrtiYn === 'Y' && !params.oltPssrpPrtiBrno) {
        alert('공모한 주유소를 입력하지 않았습니다.')
        return false
      }

      if (!params.dsclMthdCd) {
        alert('적발방법을 선택하지 않았습니다.')
        return false
      }

      if (params.dsclMthdCd === 'S' && !params.dsclMthdEtcMttrCn) {
        alert('기타 적발방법을 입력하지 않았습니다.')
        return false
      }

      if (!params.ruleVltnCluCd) {
        alert('규정위반조항을 선택하지 않았습니다.')
        return false
      }

      if (params.ruleVltnCluCd === '99' && !params.ruleVltnCluEtcCn) {
        alert('기타 규정위반조항을 입력하지 않았습니다.')
        return false
      }

      if (!params.cpeaChckYn) {
        alert('합동점검여부를 선택하지 않았습니다.')
        return false
      }

      if (params.cpeaChckYn === 'Y' && !params.cpeaChckCyclVl) {
        alert('합동점검차시를 선택하지 않았습니다.')
        return false
      }

      if (!params.instcSpldmdTypeCd) {
        alert('부정수급유형을 선택하지 않았습니다.')
        return false
      }
    }

    return true
  }

  const createExaathrInfo = async () => {
    if (!validation()) {
      return
    }

    if (!confirm('부정수급 행정처리 정보를 등록하시겠습니까?')) {
      return
    }


    try {
      setIsDataProcessing(true)

      const requestParam = {
        ...params,
        admdspRsnCn: params.admdspRsnCn
          .replaceAll(/\n/g, '')
          .replaceAll(/\t/g, ''),
        bgngYmd: params.bgngYmd.replaceAll('-', ''),
        dspsDt: params.dspsDt.replaceAll('-', ''),
        endYmd: params.endYmd.replaceAll('-', ''),
        rdmDt: params.rdmDt.replaceAll('-', ''),
        admdspBgngYmd: params.admdspBgngYmd.replaceAll('-', ''),
        admdspEndYmd: params.admdspEndYmd.replaceAll('-', ''),
      }
      // console.log(requestParam)

      let endpoint: string = `/fsm/ilg/isd/tr/createInstcSpldmdDsps`
      const response = await sendHttpRequest(
        'POST',
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
        dispatch(setIsdSearchTrue())
        handleClickClose()
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

  return (
    <Box>
      <Dialog
        PaperProps={{
          style: {
            maxWidth: 'none',
            width: '100%', // 필요에 따라 너비 지정
          },
        }}
        open={IlgIsdInfo.IISModalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return
          }
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>부정수급행정처리등록</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={createExaathrInfo}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickClose}
              >
                닫기
              </Button>
            </div>
          </Box>
          <TableContainer>
            <Table className="table table-bordered">
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    차량번호
                  </TableCell>
                  <TableCell>
                    <Grid
                      display="inline-flex"
                      alignItems={'center'}
                      justifyContent={'space-between'}
                      width={'100%'}
                    >
                      <Grid item display="flex" alignItems="center">
                        {params.vhclNo}
                      </Grid>
                      <Button
                        onClick={openVhclModal}
                        variant="contained"
                        color="dark"
                      >
                        선택
                      </Button>
                    </Grid>
                    {vhclInfo.modalOpen ? <TrVhclModal /> : null}
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    소유자명
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      name="vonrNm"
                      value={params.vonrNm}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    주민등록번호
                  </TableCell>
                  <TableCell>{rrNoFormatter(params.vonrRrnoSe)}</TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    사업자등록번호
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      id="ft-vonrBrno"
                      name="vonrBrno"
                      value={params.vonrBrno}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    당시 유종
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-ttmKoiCd"
                    >
                      당시 유종
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'599'}
                      pName="ttmKoiCd"
                      pValue={params.ttmKoiCd}
                      handleChange={handleParamsChange}
                      addText="선택"
                      htmlFor={'sch-ttmKoiCd'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    당시 톤수
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-vhclTonCd"
                    >
                      당시 톤수
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'971'}
                      pName="vhclTonCd"
                      pValue={params.vhclTonCd}
                      handleChange={handleParamsChange}
                      addText="선택"
                      htmlFor={'sch-vhclTonCd'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    패턴
                  </TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-dwGb"
                    >
                      패턴
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'164'}
                      pName="dwGb"
                      pValue={params.dwGb || '99'}
                      pDisabled={true}
                      handleChange={handleParamsChange}
                      addText="선택"
                      htmlFor={'sch-dwGb'}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    부정수급 거래기간
                  </TableCell>
                  <TableCell colSpan={7}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CustomTextField
                        type="date"
                        id="ft-bgngYmd"
                        name="bgngYmd"
                        value={params.bgngYmd}
                        onChange={handleParamsChange}
                      />{' '}
                      ~{' '}
                      <CustomTextField
                        type="date"
                        id="ft-endYmd"
                        name="endYmd"
                        value={params.endYmd}
                        onChange={handleParamsChange}
                      />
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    거래건수
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-dlngNocs"
                      name="dlngNocs"
                      value={params.dlngNocs}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    거래금액
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-totlAprvAmt"
                      name="totlAprvAmt"
                      value={params.totlAprvAmt}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    부정수급건수
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-rdmTrgtNocs"
                      name="rdmTrgtNocs"
                      value={params.rdmTrgtNocs}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    부정수급액
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-instcSpldmdAmt"
                      name="instcSpldmdAmt"
                      value={params.instcSpldmdAmt}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    유가보조금
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-totlAsstAmt"
                      name="totlAsstAmt"
                      value={params.totlAsstAmt}
                      onChange={handleParamsChange}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    환수할금액
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-rdmActnAmt"
                      name="rdmActnAmt"
                      value={params.rdmActnAmt}
                      onChange={handleParamsChange}
                      fullWidth
                      disabled={params.pbadmsPrcsSeCd !== 'Y' || params.rdmYn !== 'Y'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    환수한일자
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="date"
                      id="ft-rdmDt"
                      name="rdmDt"
                      value={params.rdmDt}
                      onChange={handleParamsChange}
                      fullWidth
                      disabled={params.pbadmsPrcsSeCd !== 'Y' || params.rdmYn !== 'Y'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    환수한금액
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-rlRmdAmt"
                      name="rlRdmAmt"
                      value={params.rlRdmAmt}
                      onChange={handleParamsChange}
                      fullWidth
                      disabled={params.pbadmsPrcsSeCd !== 'Y' || params.rdmYn !== 'Y'}
                    />
                  </TableCell>
                </TableRow>

                <TableRow
                  style={{ height: '20px', border: '1px solid #fff' }}
                ></TableRow>

                <TableRow>
                  <TableCell className="td-head">법인/개인</TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-bzmnSeCd"
                    >
                      법인/개인인
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm="152"
                      pValue={params.bzmnSeCd}
                      handleChange={handleParamsChange}
                      pName="bzmnSeCd"
                      htmlFor={'sch-bzmnSeCd'}
                      addText="전체"
                    />
                  </TableCell>
                  <TableCell className="td-head">업종</TableCell>
                  <TableCell className="td-center">
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-tpbizCd"
                    >
                      업종
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm="151"
                      pValue={params.tpbizCd}
                      handleChange={handleParamsChange}
                      pName="tpbizCd"
                      htmlFor={'sch-tpbizCd'}
                      addText="전체"
                    />
                  </TableCell>
                  <TableCell className="td-head">직영여부</TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-droperYn"
                    >
                      직영여부
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm="154"
                      pValue={params.droperYn}
                      handleChange={handleParamsChange}
                      pName="droperYn"
                      htmlFor={'sch-droperYn'}
                      addText="전체"
                    />
                  </TableCell>
                  <TableCell className="td-head">업종구분</TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-tpbizSeCd"
                    >
                      업종구분
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm="153"
                      pValue={params.tpbizSeCd}
                      handleChange={handleParamsChange}
                      pName="tpbizSeCd"
                      htmlFor={'sch-tpbizSeCd'}
                      addText="전체"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className="td-head td-center"
                    scope="row"
                    rowSpan={2}
                  >
                    행정처리
                  </TableCell>
                  <TableCell colSpan={3}>
                    <RadioGroup
                      row
                      id="rdo_adminGb"
                      name="pbadmsPrcsSeCd"
                      className="mui-custom-radio-group"
                      onChange={handleParamsChange}
                      value={params.pbadmsPrcsSeCd}
                    >
                      <FormControlLabel
                        value="N"
                        control={<CustomRadio />}
                        label="해당없음"
                      />
                      <FormControlLabel
                        value="P"
                        control={<CustomRadio />}
                        label="진행중"
                      />
                      <FormControlLabel
                        value="Y"
                        control={<CustomRadio />}
                        label="행정상제재"
                      />
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="td-head td-center">조치일</TableCell>
                  <TableCell colSpan={3}>
                    <CustomTextField
                      type="date"
                      id="ft-dspsDt"
                      name="dspsDt"
                      value={params.dspsDt}
                      onChange={handleParamsChange}
                      // disabled={disableFlag}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7}>
                    <RadioGroup
                      row
                      id="chk_admdspSeCd"
                      name="admdspSeCd"
                      className="mui-custom-radio-group"
                      value={params.admdspSeCd}
                      onChange={handleParamsChange}
                    >
                      <FormControlLabel
                        value="A"
                        control={<CustomRadio />}
                        label="환수만"
                        disabled={disable || params.rdmYn !== 'Y'}
                      />
                      <FormControlLabel
                        value="G"
                        control={<CustomRadio />}
                        label="처분유예"
                        disabled={disable}
                      />
                      <FormControlLabel
                        value="H"
                        control={<CustomRadio />}
                        label="지급정지 6개월"
                        disabled={disable}
                      />
                      <FormControlLabel
                        value="S"
                        control={<CustomRadio />}
                        label="지급정지 1년"
                        disabled={disable}
                      />
                      <FormControlLabel
                        value="C"
                        control={<CustomRadio />}
                        label="감차"
                        disabled={disable}
                      />
                    </RadioGroup>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    환수여부
                  </TableCell>
                  <TableCell>
                    <CustomCheckbox
                      name="rdmYn"
                      value={params.rdmYn}
                      defaultValue={'N'}
                      checked={
                        params.rdmYn === 'Y' ? true : false
                      }
                      onChange={handleParamsChange}
                      disabled={disable}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    환수금액
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-rdmAcntAmtDown"
                      name="rdmActnAmtDown"
                      value={params.rdmActnAmt}
                      onChange={handleParamsChange}
                      disabled={disable || params.rdmYn !== 'Y'}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    행정처분 시작일
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="date"
                      id="ft-admdspBgngYmd"
                      name="admdspBgngYmd"
                      value={params.admdspBgngYmd}
                      onChange={handleParamsChange}
                      disabled={disable || disableStopBgngYmd}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    행정처분 종료일
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="date"
                      id="ft-admdspEndYmd"
                      name="admdspEndYmd"
                      value={params.admdspEndYmd}
                      onChange={handleParamsChange}
                      disabled={disable || disableStopEndYmd}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow style={{ height: '100px' }}>
                  <TableCell className="td-head td-center" scope="row">
                    조사내용 및<br />
                    행정처분사유
                  </TableCell>
                  <TableCell colSpan={7}>
                    <textarea
                      id="ft-admdspRsnCn"
                      name="admdspRsnCn"
                      value={params.admdspRsnCn}
                      onChange={(e) => handleTextareaChange(e.target.value)}
                      disabled={disable}
                      className="MuiTextArea-custom"
                      style={{ width: '100%', resize: 'none' }}
                      rows={5}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    주유소공모
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-oltPssrpPrtiYn"
                    >
                      주유소공모
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'157'}
                      pName="oltPssrpPrtiYn"
                      pValue={params.oltPssrpPrtiYn}
                      handleChange={handleParamsChange}
                      pDisabled={disable}
                      addText="선택"
                      htmlFor={'sch-oltPssrpPrtiYn'}
                    />
                  </TableCell>
                  <TableCell
                    className="td-head td-center"
                    scope="row"
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    주유소명
                    <Button
                      id=""
                      variant="contained"
                      color="dark"
                      onClick={openOilModal}
                      disabled={disable || params.oltPssrpPrtiYn !== 'Y'}
                    >
                      <IconSearch size={20} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {params.oltPssrpPrtiOltNm}
                    <OilStationModal />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    사업자등록번호
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="number"
                      id="ft-oltPssrpPrtiBrno"
                      name="oltPssrpPrtiBrno"
                      value={params.oltPssrpPrtiBrno}
                      onChange={handleParamsChange}
                      disabled={disable || params.oltPssrpPrtiYn !== 'Y'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    불법구조변경여부
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-unlawStrctChgYnCd"
                    >
                      불법구조변경여부
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'159'}
                      pName="unlawStrctChgYnCd"
                      pValue={params.unlawStrctChgYnCd}
                      handleChange={handleParamsChange}
                      pDisabled={disable}
                      addText="선택"
                      htmlFor={'sch-unlawStrctChgYnCd'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    적발방법
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-dsclMthdCd"
                    >
                      적발방법
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'160'}
                      pName="dsclMthdCd"
                      pValue={params.dsclMthdCd}
                      handleChange={handleParamsChange}
                      addText="선택"
                      pDisabled={disable}
                      htmlFor={'sch-dsclMthdCd'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    기타
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      id="ft-dsclMthdEtcMttrCn"
                      name="dsclMthdEtcMttrCn"
                      value={params.dsclMthdEtcMttrCn}
                      onChange={handleParamsChange}
                      disabled={disable || params.dsclMthdCd !== 'S'}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    규정 위반 조항
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-ruleVltnCluCd"
                    >
                      규정 위반 조항
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'171'}
                      pName="ruleVltnCluCd"
                      pValue={params.ruleVltnCluCd}
                      handleChange={handleParamsChange}
                      addText="선택"
                      pDisabled={disable}
                      htmlFor={'sch-ruleVltnCluCd'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    기타
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      id="ft-ruleVltnCluEtcCn"
                      name="ruleVltnCluEtcCn"
                      value={params.ruleVltnCluEtcCn}
                      onChange={handleParamsChange}
                      disabled={disable || params.ruleVltnCluCd !== '99'}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    합동점검여부
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="rdo_cpeakChckYn"
                    >
                      합동점검여부
                    </CustomFormLabel>
                    <select
                      id={'rdo_cpeaChckYn'}
                      name={'cpeaChckYn'}
                      className="custom-default-select"
                      value={params.cpeaChckYn}
                      onChange={handleParamsChange}
                      style={{ width: '100%' }}
                      disabled={disable}
                    >
                      <option value={''}>선택</option>
                      <option value={'N'}>아니다</option>
                      <option value={'Y'}>맞다</option>
                    </select>
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    합동점검차시
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-cpeaChckCyclVl"
                    >
                      합동점검차시
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'121'}
                      pValue={params.cpeaChckCyclVl}
                      pName={'cpeaChckCyclVl'}
                      handleChange={handleParamsChange}
                      pDisabled={disable || disableCpeaChck}
                      addText="선택"
                      htmlFor={'sch-cpeaChckCyclVl'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    부정수급유형
                  </TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-instcSpldmdTypeCd"
                    >
                      부정수급유형
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'986'}
                      pName="instcSpldmdTypeCd"
                      pValue={params.instcSpldmdTypeCd}
                      handleChange={handleParamsChange}
                      addText="선택"
                      pDisabled={disable}
                      width="35%"
                      htmlFor={'sch-instcSpldmdTypeCd'}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
    </Box>
  )
}

export default IlgIsdModal
