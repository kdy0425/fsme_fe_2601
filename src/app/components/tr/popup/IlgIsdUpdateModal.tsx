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
import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox'
import OilStationModal from '@/app/components/tr/popup/OilStationModal'
import { CommSelect } from '../../tx/commSelect/CommSelect'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { closeIlgIsdUpdateModal } from '@/store/popup/IlgIsdSlice'
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
import { Row } from '@/app/(admin)/ilg/isd/_components/tr/TrPage'
import { VolcanoRounded, VolcanoTwoTone } from '@mui/icons-material'
import { ro } from 'date-fns/locale'
import { calYearsDate, calMonthsDate, calDaysDate, nowDate } from '@/utils/fsms/common/comm'

interface propType {
  row: Row
}

const IlgIsdUpdateModal = ({ row }: propType) => {
  const IlgIsdInfo = useSelector((state: AppState) => state.IlgIsdInfo)
  const isdInfo = useSelector((state: AppState) => state.isdInfo)
  const oilStationInfo = useSelector((state: AppState) => state.oilStationInfo)
  const vhclInfo = useSelector((state: AppState) => state.carInfo)
  const dispatch = useDispatch()

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  // 행정처분에 따른 input disable state
  const [disable, setDisable] = useState<boolean>(true)
  const [disable2, setDisable2] = useState<boolean>(true)
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
    rdmYn: 'N',
    dspsDt: '',
    admdspSeCd: '',
    admdspRsnCn: '',
    admdspBgngYmd: '',
    admdspEndYmd: '',
    oltPssrpPrtiYn: '',
    unlawStrctChgYnCd: '',
    dsclMthdCd: '',
    dsclMthdNm: '',
    subVhclNo: '',
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
    pbadmsPrcsSeCd: '',
    vonrRrnoSe: '',
    vonrRrnoD: '',
    tpbizCd: '',
    dwGb: '',
    exmnNo: '',
    giveStopSn: '',
  })

  //   useEffect(() => {
  //     console.log('useEffect 1')
  //     const { isdSelectedData } = isdInfo
  //     console.log('disable changed ', disable)
  //     if (!disable) {
  //       setParams((prev) => ({
  //         ...prev,
  //         dspsDt: isdSelectedData.dspsDt,
  //         admdspBgngYmd: isdSelectedData.admdspBgngYmd,
  //         admdspEndYmd: isdSelectedData.admdspEndYmd,
  //         admdspSeCd: String(isdSelectedData.admdspSeCd).trim() || 'H',
  //         rdmYn: String(isdSelectedData.rdmYn).trim() || 'Y',
  //       }))
  //     }
  //   }, [disable])

  const handleCpeaChckYn = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (value === 'Y') {
      setDisableCpeaChck((prev) => false)
    } else {
      setDisableCpeaChck((prev) => true)
    }
    setParams((prev) => ({
      ...prev,
      [name]: value,
      ...(value === 'N' ? { cpeaChckCyclVl: '' } : {}),
    }))
  }

  const handleOltPssrpPrtiYn = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (value === 'N') {
      setParams((prev) => ({
        ...prev,
        [name]: value,
        oltPssrpPrtiBrno: '',
        oltPssrpPrtiOltNm: '',
      }))
    } else {
      setParams((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handlePbadmsPrcsSeCd = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (value === 'Y' && row.pbadmsPrcsSeCd !== 'Y') {
      setDisable((prev) => false)
      setParams((prev) => ({...prev, rdmYn: 'Y' }))
    }else {
      setDisable((prev) => true)
      setParams((prev) => ({...prev, rdmYn: 'N', rdmActnAmtDown: '', rdmActnAmt: '', rdmDt : '' , rlRdmAmt: '' }))
    }
    setParams((prev) => ({
      ...prev,
      [name]: value,
      ...(value === 'Y'
        ? {
            admdspSeCd: 'H',
            //rdmYn: 'Y',
            // admdspBgngYmd: getDateFormatYMD(getAddDay(1)),
            // admdspEndYmd: getDateFormatYMD(getAddDay(181)),
            admdspBgngYmd: calDaysDate(new Date(), 1),
            admdspEndYmd: calMonthsDate(new Date(), 6),
          }
        : {}),
    }))
  }

  const handleRuleVltnCluCd = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({
      ...prev,
      [name]: value,
      ...(value !== '99' ? { ruleVltnCluEtcCn: '' } : {}),
    }))
  }

  const handleDsclMthdCd = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({
      ...prev,
      [name]: value,
      ...(value !== 'S' ? { dsclMthdEtcMttrCn: '' } : {}),
    }))
  }

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      oltPssrpPrtiBrno: oilStationInfo.frcsBrnoOSM,
      oltPssrpPrtiOltNm: oilStationInfo.frcsNmOSM,
    }))
  }, [oilStationInfo])

  //   useEffect(() => {
  //     console.log('useEffect 5')
  //     const { admdspBgngYmd, admdspSeCd } = params
  //     if (admdspBgngYmd.replaceAll('-', '').length === 8) {
  //       const stopBgngYmdStr = admdspBgngYmd.replaceAll('-', '')
  //       const bgngDate = stringToDate(stopBgngYmdStr)

  //       if (admdspSeCd === 'H') {
  //         const addDateString = dateToString(addDays(bgngDate, 180))
  //         setParams((prev) => ({
  //           ...prev,
  //           admdspEndYmd: getDateCustomFormatYMD(addDateString, '-'),
  //         }))
  //       } else if (admdspSeCd === 'S') {
  //         const addDateString = dateToString(addDays(bgngDate, 365))
  //         setParams((prev) => ({
  //           ...prev,
  //           admdspEndYmd: getDateCustomFormatYMD(addDateString, '-'),
  //         }))
  //       }
  //     }
  //   }, [params.admdspBgngYmd])

  useEffect(() => {
    if (Object.keys(row).length !== 0) {
      setParams({
        bgngYmd: getDateFormatYMD(row.bgngYmd),
        endYmd: getDateFormatYMD(row.endYmd),
        rdmDt: getDateFormatYMD(row.rdmDt),
        dspsDt: getDateFormatYMD(row.dspsDt),
        admdspBgngYmd:
          String(row.admdspBgngYmd).trim() !== ''
            ? getDateFormatYMD(row.admdspBgngYmd)
            : '',
        admdspEndYmd:
          String(row.admdspBgngYmd).trim() !== ''
            ? getDateFormatYMD(row.admdspEndYmd)
            : '',
        vhclNo: row.vhclNo,
        vonrNm: row.vonrNm,
        locgovCd: row.locgovCd,
        locgovNm: row.locgovNm,
        bzmnSeCd: row.bzmnSeCd,
        tpbizSeCd: row.tpbizSeCd,
        droperYn: row.droperYn,
        rdmAmt: row.rlRdmAmt,
        totlAprvAmt: row.totlAprvAmt,
        totlAsstAmt: row.totlAsstAmt,
        rdmActnAmt: row.rdmActnAmt,
        rdmActnAmtDown: row.rdmActnAmt,
        rdmTrgtNocs: row.rdmTrgtNocs,
        rdmYn: row.rdmYn,
        admdspSeCd: row.admdspSeCd,
        admdspRsnCn: row.admdspRsnCn,
        oltPssrpPrtiYn: row.oltPssrpPrtiYn,
        unlawStrctChgYnCd: row.unlawStrctChgYnCd,
        dsclMthdCd: row.dsclMthdCd,
        dsclMthdNm: row.dsclMthdNm,
        subVhclNo: row.subVhclNo,
        vonrRrno: row.vonrRrno,
        ruleVltnCluCd: row.ruleVltnCluCd,
        ruleVltnCluNm: row.ruleVltnCluNm,
        oltPssrpPrtiOltNm: row.oltPssrpPrtiOltNm,
        oltPssrpPrtiBrno: row.oltPssrpPrtiBrno,
        dsclMthdEtcMttrCn: row.dsclMthdEtcMttrCn,
        ruleVltnCluEtcCn: row.ruleVltnCluEtcCn,
        vonrBrno: row.vonrBrno,
        koiCd: row.koiCd,
        vhclTonCd: row.vhclTonCd,
        instcSpldmdTypeCd: row.instcSpldmdTypeCd,
        dlngDsctnInptSeCd: row.dlngDsctnInptSeCd,
        useLiter: row.useLiter,
        instcSpldmdAmt: row.instcSpldmdAmt,
        warnYn: 'N',
        giveStopYn: row.giveStopYn,
        prcsSeCd: row.prcsSeCd,
        rlRdmAmt: row.rlRdmAmt,
        dspsPrdCd: row.dspsPrdCd,
        rdmActnYmd: row.rdmActnYmd,
        trsmYn: '',
        cpeaChckYn: row.cpeaChckYn,
        cpeaChckCyclVl: row.cpeaChckCyclVl,
        dlngNocs: row.dlngNocs,
        vhclRestrtYmd: '',
        exmnRegNocs: '',
        ttmKoiCd: row.ttmKoiCd,
        instcSpldmdRsnCn: row.instcSpldmdRsnCn,
        stopChangeRsn: '',
        pbadmsPrcsSeCd: row.pbadmsPrcsSeCd,
        vonrRrnoSe: row.vonrRrnoSe,
        vonrRrnoD: '',
        tpbizCd: row.tpbizCd,
        dwGb: '',
        exmnNo: row.exmnNo,
        giveStopSn: row.giveStopSn,
      })

      setDisable((prev) => (row.pbadmsPrcsSeCd === 'Y' ? false : true))
      setDisable2((prev) => (row.pbadmsPrcsSeCd === 'Y' ? true : false))
    }
    dispatch(clearCarInfo())
    dispatch(clearOilStationInfo())
  }, [])

  const handleAdmdspSeCdData = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    let admdspEndYmd = ''
    let stopBgngYmdReset = false
    let stopEndYmdReset = false
    let disableStopEndYmd = false
    let disableStopBgngYmd = false

    //if((value === 'G' || value === 'A') && row.pbadmsPrcsSeCd === 'Y'){
    if((value === 'G' || value === 'A') && row.admdspSeCd === 'H' || row.pbadmsPrcsSeCd === 'S' || row.pbadmsPrcsSeCd === 'C'){
      alert('행정처리가 선택되어있는 경우 환수만 또는 처분유예로 변경이 불가능합니다.');
      return
    }

    if (value === 'H') {
      // admdspEndYmd = getDateFormatYMD(getAddDay(181))
      admdspEndYmd = calMonthsDate(new Date(), 6)
    } else if (value === 'S') {
      // admdspEndYmd = getDateFormatYMD(getAddDay(366))
      admdspEndYmd = calYearsDate(new Date(), 1)
    } else if (value === 'C') {
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
      [name]: value,
      ...(stopBgngYmdReset
        ? { admdspBgngYmd: '' }
        // : { admdspBgngYmd: getDateFormatYMD(getAddDay(1)) }),
        : { admdspBgngYmd: calDaysDate(new Date(), 1) }),
      ...(stopEndYmdReset ? { admdspEndYmd: '' } : { admdspEndYmd }),
    }))
    setDisableStopEndYmd((prev) => disableStopEndYmd)
    setDisableStopBgngYmd((prev) => disableStopBgngYmd)
  }

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
          ['rdmActnAmtDown']: value,
        }))
      } else {
        setParams((prev) => ({ ...prev, [name]: value }))
      }
    } else if(name === 'rdmYn'){
      console.log('rdmYn' , value, row.admdspSeCd);
      let val = params.rdmYn === 'N' ? 'Y' : 'N'
      if(val === 'N'){
        setParams((prev) => ({ ...prev, [name]: val, rdmActnAmtDown: '', rdmActnAmt: '', rdmDt : '' , rlRdmAmt: ''}));
      }else{
        setParams((prev) => ({ ...prev, [name]: val}));
      }
      
    } else {
      setParams((prev) => ({ ...prev, [name]: value}))
    }
  }

  const handleTextareaChange = (val:string) => {
    setParams((prev) => ({ ...prev, admdspRsnCn: val.replaceAll(/\n/g, '').replaceAll(/\t/g, '') }))
  }

  const handleClickClose = () => {
    dispatch(clearIsdSelectedData())
    dispatch(closeIlgIsdUpdateModal())
  }

  const openOilModal = () => {
    dispatch(openOilStationModal())
  }

  //   const returnInitialState = () => {
  //     return {
  //       admdspSeCd: 'H',
  //       rdmYn: 'Y',
  //       rdmActnAmt: '',
  //       admdspBgngYmd: '',
  //       admdspEndYmd: '',
  //       admdspRsnCn: '',
  //       oltPssrpPrtiYn: '',
  //       oltPssrpPrtiOltNm: '',
  //       oltPssrpPrtiBrno: '',
  //       unlawStrctChgYnCd: '',
  //       dsclMthdCd: '',
  //       dsclMthdEtcMttrCn: '',
  //       ruleVltnCluCd: '',
  //       ruleVltnCluEtcCn: '',
  //       cpeaChckYn: '',
  //       cpeaChckCyclVl: '',
  //       instcSpldmdTypeCd: '',
  //     }
  //   }
  const validation = () => {
    if (!params.vhclNo) {
      alert('차량번호는 필수 입니다.')
      return false
    }

    if (!params.vonrNm) {
      alert('차량소유자명은 필수 입니다.')
      return false
    }

    if (params.subVhclNo && !params.vonrBrno) {
      alert('사업자등록번호를 입력해주세요')
      return false
    }

    if (params.subVhclNo && !params.ttmKoiCd) {
      alert('당시 유종을 선택해주세요')
      return false
    }

    if (params.subVhclNo && !params.vhclTonCd) {
      alert('당시 톤수를 선택해주세요')
      return false
    }

    if (params.subVhclNo && !params.bgngYmd) {
      alert('부정수급 거래시작일을 입력해주세요')
      return false
    }

    if (params.subVhclNo && !params.endYmd) {
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

    if (params.rdmYn === 'Y' && (!params.rdmActnAmt || Number(params.rdmActnAmt) === 0)) {
      alert('환수할금액을 입력해주세요')
      return
    }

    if (Number(params.totlAsstAmt) < Number(params.rdmActnAmt)) {
      alert('유가보조금액 이상의 금액으로 환수할 수 없습니다.')
      return
    }

    if (params.rdmYn === 'Y' && !params.rdmDt) {
      alert('환수한일자를 입력해주세요')
      return
    }

    if (params.rdmYn === 'Y' &&  (!params.rlRdmAmt || Number(params.rlRdmAmt) === 0)) {
      alert('환수한금액을 입력해주세요')
      return
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

    if (params.pbadmsPrcsSeCd && params.pbadmsPrcsSeCd === 'Y') {
      if (params.rdmYn === 'Y' && !params.rdmActnAmt) {
        alert('환수를 체크했으나, 환수금액을 입력하지 않았습니다.')
        return false
      }

      if (params.rdmYn === 'Y' && Number(params.rlRdmAmt) > Number(params.rdmActnAmt)) {
        alert('환수한금액은 환수할금액보다 클 수 없습니다.')
        return false
      }

      if (params.rdmYn === 'Y' && Number(params.rdmActnAmtDown) > Number(params.rdmActnAmt)) {
        alert('환수금액은 환수할금액보다 클 수 없습니다.')
        return false
      }

      if (params.admdspBgngYmd > params.admdspEndYmd) {
        alert('행정처분 시작일이 종료일보다 나중일 수 없습니다.')
        return
      }

      if(!params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
        alert('조사내용 및 행정처분사유를 입력해주세요.')
        return false
      }

      if(params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 60){
        alert('조사내용 및 행정처분사유를 60자리 이하로 입력해주시기 바랍니다.')
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

    if(params.rdmYn === 'N' && (params.admdspSeCd === 'H' || params.admdspSeCd === 'S' || params.admdspSeCd === 'C')){
      if(!confirm('행정처리를 선택하셨지만 환수여부에 환수안함으로 선택되어있습니다. 계속 진행하시겠습니까?')){
        return false
      }
    }
   

    return true
  }

  const updateExaathrInfo = async () => {
    if (!validation()) {
      return
    }

    if (!confirm('부정수급 행정처리 정보를 수정하시겠습니까?')) {
      return
    }

    const requestParam =
      params.pbadmsPrcsSeCd === 'Y'
        ? {
            ...params,
            admdspRsnCn: params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
            bgngYmd: params.bgngYmd.replaceAll('-', ''),
            endYmd: params.endYmd.replaceAll('-', ''),
            dspsDt: params.dspsDt.replaceAll('-', ''),
            rdmDt: params.rdmDt.replaceAll('-', ''),
            admdspBgngYmd: String(params.admdspBgngYmd)
              .trim()
              .replaceAll('-', ''),
            admdspEndYmd: String(params.admdspEndYmd)
              .trim()
              .replaceAll('-', ''),
          }
        : {
            vhclNo: params.vhclNo,
            vonrNm: params.vonrNm,
            vonrBrno: params.vonrBrno,
            vornRrno: params.vonrRrno,
            ttmKoiCd: params.ttmKoiCd,
            vhclTonCd: params.vhclTonCd,
            bgngYmd: params.bgngYmd.replaceAll('-', ''),
            endYmd: params.endYmd.replaceAll('-', ''),
            dlngNocs: params.dlngNocs,
            totlAprvAmt: params.totlAprvAmt,
            rdmTrgtNocs: params.rdmTrgtNocs,
            instcSpldmdAmt: params.instcSpldmdAmt,
            totlAsstAmt: params.totlAsstAmt,
            rlRdmAmt: params.rlRdmAmt,
            rdmDt: params.rdmDt.replaceAll('-', ''),
            bzmnSeCd: params.bzmnSeCd,
            tpbizCd: params.tpbizCd,
            droperYn: params.droperYn,
            exmnNo: params.exmnNo,
            tpbizSeCd: params.tpbizSeCd,
            pbadmsPrcsSeCd: params.pbadmsPrcsSeCd,
            dspsDt: String(params.dspsDt).trim().replaceAll('-', ''),
          }
    try {
      setIsDataProcessing(true)

      let endpoint: string = `/fsm/ilg/isd/tr/updateInstcSpldmdDsps`
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
        open={IlgIsdInfo.IISUpdateModalOpen}
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
              <h2>부정수급행정처리수정</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={updateExaathrInfo}
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

                      <></>
                    </Grid>
                    {vhclInfo.modalOpen ? <TrVhclModal /> : null}
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    소유자명
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      id="ft-vonrNm"
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
                    <CustomFormLabel className="input-label-none" htmlFor="sch-ttmKoiCd">당시 유종</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'599'}
                      pName="ttmKoiCd"
                      pValue={params.ttmKoiCd || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.ttmKoiCd || ''}
                      addText="선택"
                      htmlFor={'sch-ttmKoiCd'}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    당시 톤수
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-vhclTonCd">당시 톤수</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'971'}
                      pName="vhclTonCd"
                      pValue={params.vhclTonCd || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.vhclTonCd || ''}
                      addText="선택"
                      htmlFor={"sch-vhclTonCd"}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    패턴
                  </TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-dwGb">패턴</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'164'}
                      pName="dwGb"
                      pValue={params.dwGb || '99'}
                      pDisabled={true}
                      defaultValue={'99'}
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
                      disabled={params.rdmYn === 'N' ? true : false}
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
                      disabled={params.rdmYn === 'N' ? true : false}
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    환수한금액
                  </TableCell>
                  <TableCell className="td-right">
                    <CustomTextField
                      type="number"
                      id="ft-rlRdmAmt"
                      name="rlRdmAmt"
                      value={params.rlRdmAmt}
                      onChange={handleParamsChange}
                      fullWidth
                      disabled={params.rdmYn === 'N' ? true : false}
                    />
                  </TableCell>
                </TableRow>

                <TableRow
                  style={{ height: '20px', border: '1px solid #fff' }}
                ></TableRow>

                <TableRow>
                  <TableCell className="td-head">법인/개인</TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-bzmnSeCd">법인/개인</CustomFormLabel>
                    <CommSelect
                      cdGroupNm="152"
                      pValue={params.bzmnSeCd || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.bzmnSeCd || ''}
                      pName="bzmnSeCd"
                      htmlFor={'sch-bzmnSeCd'}
                      addText="전체"
                    />
                  </TableCell>
                  <TableCell className="td-head">업종</TableCell>
                  <TableCell className="td-center">
                    <CustomFormLabel className="input-label-none" htmlFor="sch-tpbizCd">업종</CustomFormLabel>
                    <CommSelect
                      cdGroupNm="151"
                      pValue={params.tpbizCd || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.tpbizCd || ''}
                      pName="tpbizCd"
                      htmlFor={'sch-tpbizCd'}
                      addText="전체"
                    />
                  </TableCell>
                  <TableCell className="td-head">직영여부</TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-droperYn">직영여부</CustomFormLabel>
                    <CommSelect
                      cdGroupNm="154"
                      pValue={params.droperYn || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.droperYn || ''}
                      pName="droperYn"
                      htmlFor={'sch-droperYn'}
                      addText="전체"
                    />
                  </TableCell>
                  <TableCell className="td-head">업종구분</TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-tpbizSeCd">업종구분</CustomFormLabel>
                    <CommSelect
                      cdGroupNm="153"
                      pValue={params.tpbizSeCd || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.tpbizSeCd || ''}
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
                      onChange={handlePbadmsPrcsSeCd}
                      value={params.pbadmsPrcsSeCd}
                      defaultValue={params.pbadmsPrcsSeCd}
                    >
                      <FormControlLabel
                        value="N"
                        control={<CustomRadio />}
                        label="해당없음"
                        disabled={row.pbadmsPrcsSeCd === 'Y'}
                      />
                      <FormControlLabel
                        value="P"
                        control={<CustomRadio />}
                        label="진행중"
                        disabled={row.pbadmsPrcsSeCd === 'Y'}
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
                      value={params.admdspSeCd || ''}
                      defaultValue={params.admdspSeCd || ''}
                      onChange={handleAdmdspSeCdData}
                    >
                      <FormControlLabel
                        value="A"
                        control={<CustomRadio />}
                        label="환수만"
                        disabled={params.rdmYn === 'N' ? true : false}
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
                  {/* 
                  <TableCell> 
                    <RadioGroup
                      row
                      id="chk_rdmYn"
                      className="mui-custom-radio-group"
                      name="rdmYn"
                      value={params.rdmYn || ''}
                      // defaultValue={params.rdmYn || ''}
                      onChange={handleParamsChange}
                    >
                      <FormControlLabel
                        control={
                          <CustomRadio
                            id="chk_Y"
                            value="Y"
                            disabled={disable}
                          />
                        }
                        label="환수"
                      />
                      <FormControlLabel
                        control={
                          <CustomRadio
                            id="chk_N"
                            value="N"
                            disabled={disable}
                          />
                        }
                        label="환수안함"
                      />
                    </RadioGroup>
                  </TableCell>
                  */}
                  <TableCell>
                    <CustomCheckbox
                      name="rdmYn"
                      value={params.rdmYn}
                      //defaultValue={'N'}
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
                      id="ft-rdmActnAmtDown"
                      name="rdmActnAmtDown"
                      value={params.rdmActnAmtDown }
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
                      // inputProps={{min: formType === 'CREATE' ? getFormatTomorrow() : formatDate(data?.admdspBgngYmd)}}
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
                    <CustomFormLabel className="input-label-none" htmlFor="sch-oltPssrpPrtiYn">주유소공모</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'157'}
                      pName="oltPssrpPrtiYn"
                      pValue={params.oltPssrpPrtiYn || ''}
                      handleChange={handleOltPssrpPrtiYn}
                      defaultValue={params.oltPssrpPrtiYn || ''}
                      htmlFor={'sch-oltPssrpPrtiYn'}
                      pDisabled={disable}
                      addText="선택"
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
                      disabled={
                        disable ||
                        (params.oltPssrpPrtiYn ||
                          isdInfo.isdSelectedData.oltPssrpPrtiYn) !== 'Y'
                      }
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
                      id="oltPssrpPrtiBrno"
                      name="oltPssrpPrtiBrno"
                      value={params.oltPssrpPrtiBrno}
                      onChange={handleParamsChange}
                      disabled={
                        disable ||
                        (params.oltPssrpPrtiYn ||
                          isdInfo.isdSelectedData.oltPssrpPrtiYn) !== 'Y'
                      }
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    불법구조변경여부
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-unlawStrctChgYnCd">불법구조변경여부</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'159'}
                      pName="unlawStrctChgYnCd"
                      pValue={params.unlawStrctChgYnCd || ''}
                      handleChange={handleParamsChange}
                      defaultValue={params.unlawStrctChgYnCd || ''}
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
                    <CustomFormLabel className="input-label-none" htmlFor="sch-dsclMthdCd">적발방법</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'160'}
                      pName="dsclMthdCd"
                      pValue={params.dsclMthdCd || ''}
                      handleChange={handleDsclMthdCd}
                      defaultValue={params.dsclMthdCd || ''}
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
                      disabled={
                        disable ||
                        (params.dsclMthdCd ||
                          isdInfo.isdSelectedData.dsclMthdCd) !== 'S'
                      }
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className="td-head td-center" scope="row">
                    규정 위반 조항
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="sch-ruleVltnCluCd">규정 위반 조항</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'171'}
                      pName="ruleVltnCluCd"
                      pValue={params.ruleVltnCluCd || ''}
                      handleChange={handleRuleVltnCluCd}
                      defaultValue={params.ruleVltnCluCd || ''}
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
                      disabled={
                        disable ||
                        (params.ruleVltnCluCd ||
                          isdInfo.isdSelectedData.ruleVltnCluCd) !== '99'
                      }
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head td-center" scope="row">
                    합동점검여부
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel className="input-label-none" htmlFor="rdo_cpeaChckYn">합동점검여부</CustomFormLabel>
                    <select
                      id={'rdo_cpeaChckYn'}
                      name={'cpeaChckYn'}
                      className="custom-default-select"
                      value={params.cpeaChckYn || ''}
                      onChange={handleCpeaChckYn}
                      defaultValue={params.cpeaChckYn || ''}
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
                    <CustomFormLabel className="input-label-none" htmlFor="sch-cpeaChckCyclVl">합동점검차시</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'121'}
                      pValue={params.cpeaChckCyclVl || ''}
                      defaultValue={params.cpeaChckCyclVl || ''}
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
                    <CustomFormLabel className="input-label-none" htmlFor="sch-instcSpldmdTypeCd">부정수급유형</CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'986'}
                      pName="instcSpldmdTypeCd"
                      pValue={params.instcSpldmdTypeCd || ''}
                      defaultValue={params.instcSpldmdTypeCd || ''}
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

export default IlgIsdUpdateModal
