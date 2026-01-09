import { useDispatch, useSelector } from '@/store/hooks'
import { closeExaathrModal } from '@/store/popup/ExaathrSlice'
import { AppState } from '@/store/store'
import {
  Button,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableRow,
  FormControlLabel,
  RadioGroup,
  IconButton,
} from '@mui/material'
import { Box, Dialog, DialogContent } from '@mui/material'
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel'
import CustomTextField from '../../forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { ilgCommExaathrPopHC } from '@/utils/fsms/headCells'
import BlankCard from '@/app/components/shared/BlankCard'
import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox'
import CustomRadio from '@/components/forms/theme-elements/CustomRadio'
import { CommSelect } from '../../tx/commSelect/CommSelect'
import { IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import {
  getAddDay,
  getDateFormatYMD,
  getToday,
} from '@/utils/fsms/common/dateUtils'
import {
  clearOilStationInfo,
  openOilStationModal,
} from '@/store/popup/OilStationSlice'
import OilStationModal from './OilStationModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { usePathname } from 'next/navigation'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import {
  clearLpavSelectedData,
  setLpavSearchTrue,
} from '@/store/page/LpavSlice'
import {
  callRefetch,
  commClearReduxData,
  useIlgSelectors,
} from '@/types/fsms/common/ilgData'
import {
  calYearsDate,
  calMonthsDate,
  calDaysDate,
} from '@/utils/fsms/common/comm'

interface targetInfo {
  adminGb: string //행정처분 - 해당없음,행정상재제
  exceptVhcl: boolean //추후 해당차량 제외
  dspsDt: string //조치일
  rdmYn: string //행정처분 - 환수, 환수안함
  rdmYnNm: string //행정처분 - 환수, 환수안함 라벨값
  admdspSeCd: string //행정처분 - 환수만, 처분유예, 지급정지6개월, 지급정지1년, 감차
  admdspSeNm: string //행정처분 - 환수만, 처분유예, 지급정지6개월, 지급정지1년, 감차 라벨값
  rdmActnAmt: number //환수금액
  admdspRsnCn: string //행정처분사유
  admdspBgngYmd: string //행정처분시작일
  admdspEndYmd: string //행정처분종료일
  oltPssrpPrtiYn: string //주유소공모, 가담여부
  oltPssrpPrtiYnNm: string //주유소공모, 가담여부 라벨값
  oltPssrpPrtiOltNm: string //주유소공모, 가담여부 - 주유소명
  oltPssrpPrtiBrno: string //주유소공모, 가담여부 - 사업자번호
  unlawStrctChgYnCd: string //불법구조변경여부
  unlawStrctChgYnNm: string //불법구조변경여부 라벨값
  dsclMthdCd: string //적발방법
  dsclMthdNm: string //적발방법 라벨값
  dsclMthdEtcMttrCn: string //적발방법 기타
  ruleVltnCluCd: string //규정위반조항
  ruleVltnCluNm: string //규정위반조항 라벨값
  ruleVltnCluEtcCn: string //규정위반조항 기타
  cpeaChckYn: string //합동점검여부
  cpeaChckYnNm: string //합동점검여부 라벨값
  cpeaChckCyclVl: string //합동점검차시
  cpeaChckCyclVlNm: string //합동점검차시 라벨값
  instcSpldmdTypeCd: string //부정수급유형 코드값
  [key: string]: string | number | boolean | null // 인덱스 시그니처 추가
}

const ExaathrModal = () => {
  const dispatch = useDispatch()
  const pathname = usePathname()

  const oilStationInfo = useSelector((state: AppState) => state.oilStationInfo)
  const exaathrInfo = useSelector((state: AppState) => state.ExaathrInfo)

  /** 페이지별 리덕스 변수 선언 */
  const {
    lpavInfo,
    shlInfo,
    dmalInfo,
    tcelInfo,
    taavelInfo,
    dvhalInfo,
    nblInfo,
    ddalInfo,
  } = useIlgSelectors()

  const [manipulatedData, setManipulatedData] = useState<any[]>([])

  const sixMonths: number = 180
  const oneYear: number = 365
  const tomorrow: number = 1

  //비활성화 제어 변수
  const [disableAll, setDisableAll] = useState<boolean>(false)
  const [disableRdmAmt, setDisableRdmAmt] = useState<boolean>(false) // 환수금액입력창
  const [disableAdmdspBgng, setDisableAdmdspBgng] = useState<boolean>(false) //행정처분시작일
  const [disableAdmdspEnd, setDisableAdmdspEnd] = useState<boolean>(false) //행정처분종료일
  const [disableOltPssrpPrti, setDisableOltPssrpPrti] = useState<boolean>(false) //주유소공모,가담여부
  const [disabledDsclMthd, setDisabledDsclMthd] = useState<boolean>(false) //적발방법
  const [disabledRuleVltnClu, setDisabledRuleVltnClu] = useState<boolean>(false) // 규정위반조항
  const [disabledCpeaChck, setDisableCpeaChck] = useState<boolean>(false)

  const [showBeforeChangeVhcl, setShowBeforeChangeVhcl] =
    useState<boolean>(false)

  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)

  const [targetInfo, setTargetInfo] = useState<targetInfo>({
    adminGb: 'N',
    exceptVhcl: false,
    dspsDt: '',
    rdmYn: 'N',
    rdmEnable: true,
    rdmYnNm: '환수안함',
    admdspSeCd: 'A',
    admdspSeNm: '',
    rdmActnAmt: 0,
    admdspRsnCn: '',
    admdspBgngYmd: '',
    admdspEndYmd: '',
    oltPssrpPrtiYn: '',
    oltPssrpPrtiYnNm: '',
    oltPssrpPrtiOltNm: '',
    oltPssrpPrtiBrno: '',
    unlawStrctChgYnCd: '',
    unlawStrctChgYnNm: '',
    dsclMthdCd: '',
    dsclMthdNm: '',
    dsclMthdEtcMttrCn: '',
    ruleVltnCluCd: '',
    ruleVltnCluNm: '',
    ruleVltnCluEtcCn: '',
    cpeaChckYn: 'N',
    cpeaChckYnNm: '아니오',
    cpeaChckCyclVl: '',
    cpeaChckCyclVlNm: '',
    instcSpldmdTypeCd: '',
  })

  const pageUrl = pathname.split('/')[2]

  // 모달 최초 로딩후
  useEffect(() => {
    // setTargetInfo((prev) => ({ ...prev, adminGb: 'N' }))
    dispatch(clearOilStationInfo())
  }, [])

  // 주유소공모, 가담여부 콤보박스 변경시
  useEffect(() => {
    if (targetInfo.oltPssrpPrtiYn !== 'Y') {
      setTargetInfo((prev) => ({
        ...prev,
        oltPssrpPrtiOltNm: '',
        oltPssrpPrtiBrno: '',
      }))
    }
    setDisableOltPssrpPrti(targetInfo.oltPssrpPrtiYn !== 'Y')
  }, [targetInfo.oltPssrpPrtiYn])

  //모달이 열릴 때
  useEffect(() => {
    if (exaathrInfo.exaModalOpen) {
      // console.log('exaathrInfo.startFromErModal ', exaathrInfo.startFromErModal)
      if (exaathrInfo.startFromErModal) {
        handleExamTrgtData()
      } else {
        handleExamResultData()
      }
    }
  }, [exaathrInfo.exaModalOpen])

  // 행정처분의 [해당없음, 행정상제재] 선택시
  useEffect(() => {
    setDisableAll(targetInfo.adminGb === 'N' ? true : false)
    setTargetInfo((prev) =>
      targetInfo.adminGb === 'N' //해당없음
        ? {
            ...prev,
            dspsDt: '',
            rdmYn: 'N',
            rdmYnNm: '환수안함',
            admdspRsnCn: '',
            admdspSeCd: '',
            admdspSeNm: '',
          }
        : manipulatedData[selectedIndex].subsChangeVhclNo !== '' &&
            manipulatedData[selectedIndex].vhclNo ===
              manipulatedData[selectedIndex].subsChangeVhclNo
          ? {
              /*
               * 현재 진행중인 차량번호의 지급정지정보가 있는 경우
               * 지급정지구분, 행정처분 사유, 행정처분시작일, 행정처분 종료일, 부정수급유형을 세팅한다.
               */

              ...prev,
              dspsDt: getDateFormatYMD(getToday()),
              rdmYn: 'Y',
              rdmYnNm: '환수',
              admdspSeCd: calcAdmdspSeCd(
                manipulatedData[selectedIndex].bgngYmd,
                manipulatedData[selectedIndex].endYmd,
              )[0],
              admdspSeNm: calcAdmdspSeCd(
                manipulatedData[selectedIndex].bgngYmd,
                manipulatedData[selectedIndex].endYmd,
              )[1],
              admdspRsnCn: manipulatedData[selectedIndex].chgRsnCn,
              admdspBgngYmd: getDateFormatYMD(
                manipulatedData[selectedIndex].bgngYmd,
              ),
              admdspEndYmd: getDateFormatYMD(
                manipulatedData[selectedIndex].endYmd,
              ),
              instcSpldmdTypeCd:
                manipulatedData[selectedIndex].instcSpldmdTypeCd,
            }
          : {
              ...prev,
              dspsDt: getDateFormatYMD(getToday()),
              rdmYn: 'Y',
              rdmYnNm: '환수',
              admdspRsnCn: '',
              admdspSeCd: 'H',
              admdspSeNm: '지급정지 6개월',
              // admdspBgngYmd: getAddDateFormat(tomorrow),
              // admdspEndYmd: getAddDateFormat(sixMonths + tomorrow),
              admdspBgngYmd: calDaysDate(new Date(), 1),
              admdspEndYmd: calMonthsDate(new Date(), 6),
            },
    )
    setShowBeforeChangeVhcl(
      (manipulatedData[selectedIndex]?.subsChangeVhclNo ?? '') !== '' &&
        manipulatedData[selectedIndex].vhclNo ===
          (manipulatedData[selectedIndex]?.subsChangeVhclNo ?? ''),
    )
  }, [targetInfo.adminGb])

  // 라디오박스, 체크박스, 인풋박스 등 입력값 변경 시
  useEffect(() => {
    setManipulatedData((prevRows) => {
      const newRows = [...prevRows]
      newRows[selectedIndex] = {
        ...newRows[selectedIndex],
        // [name]: value,
        ...targetInfo,
      }
      return newRows
    })
  }, [targetInfo])

  //주유소 검색 팝업에서 값을 끌어오는 경우
  useEffect(() => {
    setTargetInfo((prev) => ({
      ...prev,
      oltPssrpPrtiOltNm: oilStationInfo.frcsNmOSM,
      oltPssrpPrtiBrno: oilStationInfo.frcsBrnoOSM,
    }))
  }, [oilStationInfo])

  //행정처분 - [환수, 환수안함]을 누른 경우
  useEffect(() => {
    // alert('rdmYn 변경' + targetInfo.rdmYn)
    if (
      typeof targetInfo.rdmYn === 'string'
        ? targetInfo.rdmYn === 'N'
        : targetInfo.rdmYn
    ) {
      setTargetInfo((prev) => ({
        ...prev,
        rdmYnNm: '환수안함',
        rdmActnAmt: 0,
      }))
    } else {
      setTargetInfo((prev) => ({
        ...prev,
        rdmYnNm: '환수',
      }))
    }
    setDisableRdmAmt(
      typeof targetInfo.rdmYn === 'string'
        ? targetInfo.rdmYn === 'N'
        : targetInfo.rdmYn,
    )
  }, [targetInfo.rdmYn])

  //행정처분 - [환수만, 처분유예, 지급정지6개월, 지급정지1년, 감차]을 누른 경우
  useEffect(() => {
    // 환수만 : A, 처분유예 : G, 지급정지 6개월 : H, 지급정지 1년 : S, 감차 : C
    let changeValueObj = {
      admdspBgngYmd: '',
      admdspEndYmd: '',
      rdmYn: 'N',
      rdmEnable: true,
      disableBgngYmd: false,
      disableEndYmd: false,
    }

    switch (targetInfo.admdspSeCd) {
      case 'A': //환수만
        changeValueObj = {
          admdspBgngYmd: '',
          admdspEndYmd: '',
          rdmYn: 'Y',
          rdmEnable: false,
          disableBgngYmd: true,
          disableEndYmd: true,
        }
        break
      case 'G': //처분유예
        changeValueObj = {
          admdspBgngYmd: '',
          admdspEndYmd: '',
          rdmYn: 'N',
          rdmEnable: true,
          disableBgngYmd: true,
          disableEndYmd: true,
        }
        break
      case 'H': //지급정지 6개월
        changeValueObj = {
          // admdspBgngYmd: getAddDateFormat(tomorrow),
          // admdspEndYmd: getAddDateFormat(sixMonths + tomorrow),
          admdspBgngYmd: calDaysDate(new Date(), 1),
          admdspEndYmd: calMonthsDate(new Date(), 6),
          rdmYn: 'Y',
          rdmEnable: true,
          disableBgngYmd: false,
          disableEndYmd: false,
        }
        break
      case 'S': //지급정지 1년
        changeValueObj = {
          // admdspBgngYmd: getAddDateFormat(tomorrow),
          // admdspEndYmd: getAddDateFormat(oneYear + tomorrow),
          admdspBgngYmd: calDaysDate(new Date(), 1),
          admdspEndYmd: calYearsDate(new Date(), 1),
          rdmYn: 'N',
          rdmEnable: true,
          disableBgngYmd: false,
          disableEndYmd: false,
        }
        break
      case 'C': //감차
        changeValueObj = {
          // admdspBgngYmd: getAddDateFormat(tomorrow),
          admdspBgngYmd: calDaysDate(new Date(), 1),
          admdspEndYmd: '9999-12-31',
          rdmYn: 'N',
          rdmEnable: true,
          disableBgngYmd: false,
          disableEndYmd: true,
        }
        break
      default:
        break
    }

    setTargetInfo((prev) => ({
      ...prev,
      [`admdspBgngYmd`]: changeValueObj.admdspBgngYmd,
      [`admdspEndYmd`]: changeValueObj.admdspEndYmd,
      [`rdmYn`]: changeValueObj.rdmYn,
      [`rdmEnable`]: changeValueObj.rdmEnable,
    }))

    setDisableAdmdspBgng(changeValueObj.disableBgngYmd)
    setDisableAdmdspEnd(changeValueObj.disableEndYmd)
  }, [targetInfo.admdspSeCd])

  //적발방법 콤보박스 선택시 (기타일때만 활성화)
  useEffect(() => {
    if (targetInfo.dsclMthdCd !== 'S') {
      setTargetInfo((prev) => ({
        ...prev,
        dsclMthdEtcMttrCn: '',
      }))
    }
    setDisabledDsclMthd(targetInfo.dsclMthdCd !== 'S')
  }, [targetInfo.dsclMthdCd])

  // 규정위반조항 콤보박스 선택시 ( 기타일때만 활성화 )
  useEffect(() => {
    if (targetInfo.ruleVltnCluCd !== '99') {
      setTargetInfo((prev) => ({
        ...prev,
        ruleVltnCluEtcCn: '',
      }))
    }
    setDisabledRuleVltnClu(targetInfo.ruleVltnCluCd !== '99')
  }, [targetInfo.ruleVltnCluCd])

  //합동점검여부 라디오버튼 변경시 ( '예'일때 합동점검차시 활성화 )
  useEffect(() => {
    if (targetInfo.cpeaChckYn === 'N') {
      setTargetInfo((prev) => ({
        ...prev,
        cpeaChckCyclVlNm: '',
      }))
    }
    setDisableCpeaChck(targetInfo.cpeaChckYn === 'N')
  }, [targetInfo.cpeaChckYn])

  /** ***************************************** 데이터 비즈니스 로직 함수 **************************************** */

  const getExamResultDataByUrl = (): any[] => {
    const url = pageUrl //lpav, shl, dmal...
    switch (url) {
      case 'lpav':
        return lpavInfo.lpavExamResultData
      case 'shl':
        return shlInfo.shlExamResultData
      case 'dmal':
        return dmalInfo.dmalExamResultData
      case 'tcel':
        return tcelInfo.tcelExamResultData
      case 'taavel':
        return taavelInfo.taavelExamResultData
      case 'dvhal':
        return dvhalInfo.dvhalExamResultData
      case 'nbl':
        return nblInfo.nblExamResultData
      case 'ddal':
        return ddalInfo.ddalExamResultData
      default:
        return []
    }
  }

  /**
   * 팝업오픈시에 최초 데이터 설정하기
   * 조사결과등록 모달에서 넘어오는 경우
   */
  const handleExamTrgtData = () => {
    const manipulateData = getExamResultDataByUrl().map((value, index) => {
      // if (!value.rdmTrgtNocs) value.rdmTrgtNocs = value.dlngNocs
      return {
        ...value,
        chk: '0',
        rdmActnAmt: value.rdmActnAmt,
        rdmTrgtNocs: value.rdmTrgtNocs || value.dlngNocs,
        adminGb: 'N',
        exceptVhcl: false,
        dspsDt: '',
        rdmYn: 'N',
        rdmYnNm: '환수안함',
        admdspSeCd: 'A',
        admdspSeNm: '',
        admdspRsnCn: '',
        admdspBgngYmd: '',
        admdspEndYmd: '',
        oltPssrpPrtiYn: '',
        oltPssrpPrtiYnNm: '',
        oltPssrpPrtiOltNm: '',
        oltPssrpPrtiBrno: '',
        unlawStrctChgYnCd: '',
        unlawStrctChgYnNm: '',
        dsclMthdCd: '',
        dsclMthdNm: '',
        dsclMthdEtcMttrCn: '',
        ruleVltnCluCd: '',
        ruleVltnCluNm: '',
        ruleVltnCluEtcCn: '',
        cpeaChckYn: 'N',
        cpeaChckYnNm: '아니오',
        cpeaChckCyclVl: '',
        cpeaChckCyclVlNm: '',
        instcSpldmdTypeCd: '',
      }
    })

    setManipulatedData(manipulateData)
  }

  /**
   * 팝업오픈시에 최초 데이터 설정하기
   * 조사결과조회 화면에서 행정처분 등록버튼을 누른 경우
   */
  const handleExamResultData = () => {
    const manipulateData = getExamResultDataByUrl().map((value, index) => {
      // if (!value.rdmTrgtNocs) value.rdmTrgtNocs = value.dlngNocs
      return {
        ...value,
        chk: '0',
        aprvAmt: value.totlAprvAmt,
        asstAmt: value.totlAsstAmt,
        rdmActnAmt: value.rdmActnAmt,
        rdmTrgtNocs: value.rdmTrgtNocs || value.dlngNocs,
        adminGb: 'N',
        exceptVhcl: false,
        dspsDt: '',
        rdmYn: 'N',
        rdmYnNm: '환수안함',
        admdspSeCd: 'A',
        admdspSeNm: '',
        admdspRsnCn: '',
        admdspBgngYmd: '',
        admdspEndYmd: '',
        oltPssrpPrtiYn: '',
        oltPssrpPrtiYnNm: '',
        oltPssrpPrtiOltNm: '',
        oltPssrpPrtiBrno: '',
        unlawStrctChgYnCd: '',
        unlawStrctChgYnNm: '',
        dsclMthdCd: '',
        dsclMthdNm: '',
        dsclMthdEtcMttrCn: '',
        ruleVltnCluCd: '',
        ruleVltnCluNm: '',
        ruleVltnCluEtcCn: '',
        cpeaChckYn: 'N',
        cpeaChckYnNm: '아니오',
        cpeaChckCyclVl: '',
        cpeaChckCyclVlNm: '',
        instcSpldmdTypeCd: '',
      }
    })

    setManipulatedData(manipulateData)
  }

  const getAddDateFormat = (addDays: number) => {
    return getDateFormatYMD(getAddDay(addDays))
  }

  const calcAdmdspSeCd = (bgngYmd: string, endYmd: string) => {
    const bgngDate = new Date(
      Number(bgngYmd.substring(0, 4)),
      Number(bgngYmd.substring(4, 6)),
      Number(bgngYmd.substring(6, 8)),
    )
    const endDate = new Date(
      Number(endYmd.substring(0, 4)),
      Number(endYmd.substring(4, 6)),
      Number(endYmd.substring(6, 8)),
    )

    let duringTime = endDate.getTime() - bgngDate.getTime() //밀리초를 반환
    let duringDays = duringTime / (1000 * 60 * 60 * 24) // 1000밀리초 * 60초 * 60분 * 24시간 = 하루

    if (duringDays > 365) {
      return ['C', '감차']
    } else if (duringDays > 180) {
      return ['S', '지급정지 1년']
    } else {
      return ['H', '지급정지 6개월']
    }
  }

  const getCarCnt = () => {
    const carDuplCnt = new Map()
    let isDupl = false

    manipulatedData.forEach((value: any, index: number) => {
      const { vhclNo, admdspSeCd } = value

      if (carDuplCnt.get(`${vhclNo}`)) {
        const value: number = carDuplCnt.get(`${vhclNo}`)
        if (admdspSeCd === 'H' || admdspSeCd === 'S') {
          carDuplCnt.set(`${vhclNo}`, value + 1)
        }
      } else {
        carDuplCnt.set(`${vhclNo}`, 1)
      }
    })

    carDuplCnt.keys().forEach((key, index) => {
      if (carDuplCnt.get(`${key}`) > 1) {
        isDupl = true
      }
    })
    return isDupl
  }

  /** ***************************************** 화면 조작핸들러 함수 **************************************** */

  /**
   * 해당없음, 행정상재제 선택시
   * @param event
   */
  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedIndex < 0) {
      alert('값을 입력할 행을 선택해주세요')
      return
    }

    const labelText = event.target.closest('label')?.textContent || '' // 라벨 텍스트 가져오기

    const { name, value } = event.target
    /** 내부데이터 변경 */
    setTargetInfo((prev) => ({
      ...prev,
      [name]: value,
      ...(name.includes('Cd')
        ? { [`${name.substring(0, name.length - 2)}Nm`]: labelText }
        : { [`${name}Nm`]: labelText }),
    }))
    //컴포넌트의 name값이 Cd가 있는 경우 Cd를 제거하고 Nm을 입력
    //컴포넌트의 name값이 Cd가 없는 경우 Nm을 추가
    console.log(targetInfo)
  }

  const handleCheckCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedIndex < 0) {
      alert('값을 입력할 행을 선택해주세요')
      return
    }

    const { name, value, checked } = event.target
    console.log(name, checked)

    setManipulatedData((prevRows) => {
      const newRows = [...prevRows]
      if (checked) {
        newRows[selectedIndex] = {
          ...newRows[selectedIndex],
          [name]: checked,
        }
      } else {
        newRows[selectedIndex] = {
          ...newRows[selectedIndex],
          [name]: checked,
        }
      }
      return newRows
    })
    console.log('manipulatedData : ', manipulatedData)
    setTargetInfo((prev) => ({
      ...prev,
      [name]: checked,
    }))
    console.log('targetInfo : ', targetInfo)
  }

  /**
   * 콤보박스 변경 이벤트
   * @param event
   * @returns
   */
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const selectElement = event.target as HTMLSelectElement // <select> 요소로 캐스팅
    if (!selectElement.selectedIndex) {
      return
    }
    const selectedOption = selectElement.options[selectElement.selectedIndex] // 선택된 <option>
    const displayedText = selectedOption.textContent // 화면에 보이는 텍스트 가져오기

    const { name, value } = event.target
    /** 화면의 콤보박스 값 설정 */

    setTargetInfo((prev) => ({
      ...prev,
      [name]: value,
      ...(name.includes('Cd')
        ? { [`${name.substring(0, name.length - 2)}Nm`]: displayedText }
        : { [`${name}Nm`]: displayedText }),
    }))
    //컴포넌트의 name값이 Cd가 있는 경우 Cd를 제거하고 Nm을 입력
    //컴포넌트의 name값이 Cd가 없는 경우 Nm을 추가
  }

  /**
   * 텍스트필드 입력 이벤트
   * @param event
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (selectedIndex < 0) {
      alert('값을 입력할 행을 선택해주세요')
      return
    }

    const { name, value } = event.target

    /** 화면의 콤보박스 값 설정 */
    setTargetInfo((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * 행 선택 이벤트
   * @param row
   * @param rowIndex
   */
  const onRowClick = (row: any, rowIndex?: number) => {
    const idx = rowIndex ? rowIndex : 0
    // 선택한 행의 색깔 처리를 위함
    setSelectedIndex(idx)

    // 이전에 선택했던 값을 표시해주기 위함
    setTargetInfo((prev) => ({ ...prev, ...manipulatedData[idx] }))
  }

  /**
   * 체크박스 선택 이벤트
   * @param IDs
   */
  const onCheckChange = (IDs: string[]) => {
    setManipulatedData((prevRows) => {
      const rows = [...prevRows]
      const newRows = rows.map((value: any, index: number) => {
        if (IDs.includes('tr' + index)) return { ...value, chk: '1' }
        else return { ...value, chk: '0' }
      })
      return newRows
    })
  }

  //일괄버튼을 누르는 경우
  const handleApplyData = () => {
    if (selectedIndex < 0) {
      alert('적용 기준이 되는 행을 선택해주세요')
      return
    }

    const {
      adminGb,
      dspsDt,
      rdmYn,
      rdmYnNm,
      admdspSeCd,
      admdspSeNm,
      rdmActnAmt,
      admdspRsnCn,
      admdspBgngYmd,
      admdspEndYmd,
      oltPssrpPrtiYn,
      oltPssrpPrtiYnNm,
      oltPssrpPrtiOltNm,
      oltPssrpPrtiBrno,
      unlawStrctChgYnCd,
      unlawStrctChgYnNm,
      dsclMthdCd,
      dsclMthdNm,
      dsclMthdEtcMttrCn,
      ruleVltnCluCd,
      ruleVltnCluNm,
      ruleVltnCluEtcCn,
      cpeaChckYn,
      cpeaChckYnNm,
      cpeaChckCyclVl,
      cpeaChckCyclVlNm,
      instcSpldmdTypeCd,
    } = manipulatedData[selectedIndex]
    setManipulatedData((prevRows) => {
      const newRows = [...prevRows]
      manipulatedData.forEach((value: any, index: number) => {
        if (newRows[index].chk === '1') {
          newRows[index].adminGb = adminGb
          newRows[index].dspsDt = dspsDt
          newRows[index].rdmYn = rdmYn
          newRows[index].rdmYnNm = rdmYnNm
          newRows[index].admdspSeCd = admdspSeCd
          newRows[index].admdspSeNm = admdspSeNm
          newRows[index].rdmActnAmt = rdmActnAmt
          newRows[index].admdspRsnCn = admdspRsnCn
          newRows[index].admdspBgngYmd = admdspBgngYmd
          newRows[index].admdspEndYmd = admdspEndYmd
          newRows[index].oltPssrpPrtiYn = oltPssrpPrtiYn
          newRows[index].oltPssrpPrtiYnNm = oltPssrpPrtiYnNm
          newRows[index].oltPssrpPrtiOltNm = oltPssrpPrtiOltNm
          newRows[index].oltPssrpPrtiBrno = oltPssrpPrtiBrno
          newRows[index].unlawStrctChgYnCd = unlawStrctChgYnCd
          newRows[index].unlawStrctChgYnNm = unlawStrctChgYnNm
          newRows[index].dsclMthdCd = dsclMthdCd
          newRows[index].dsclMthdNm = dsclMthdNm
          newRows[index].dsclMthdEtcMttrCn = dsclMthdEtcMttrCn
          newRows[index].ruleVltnCluCd = ruleVltnCluCd
          newRows[index].ruleVltnCluNm = ruleVltnCluNm
          newRows[index].ruleVltnCluEtcCn = ruleVltnCluEtcCn
          newRows[index].cpeaChckYn = cpeaChckYn
          newRows[index].cpeaChckYnNm = cpeaChckYnNm
          newRows[index].cpeaChckCyclVl = cpeaChckCyclVl
          newRows[index].cpeaChckCyclVlNm = cpeaChckCyclVlNm
          newRows[index].instcSpldmdTypeCd = instcSpldmdTypeCd
        }
      })
      return newRows
    })
  }

  const handleClose = () => {
    dispatch(closeExaathrModal())
    dispatch(clearLpavSelectedData())
  }

  /** ***************************************** 서버요청관련 함수 **************************************** */
  const validation = () => {
    // console.log(manipulatedData)
    // manipulatedData.forEach((value: any, index: number) => {
    let validOk = true
    for (let index = 0; index < manipulatedData.length; index++) {
      const {
        vhclNo,
        adminGb,
        dspsDt,
        rdmYn,
        asstAmt,
        rdmActnAmt,
        admdspSeCd,
        admdspRsnCn,
        oltPssrpPrtiYn,
        oltPssrpPrtiOltNm,
        oltPssrpPrtiBrno,
        unlawStrctChgYnCd,
        dsclMthdCd,
        dsclMthdEtcMttrCn,
        ruleVltnCluCd,
        ruleVltnCluEtcCn,
        instcSpldmdTypeCd,
        subsChangeReject,
        subsChangeRest,
      } = manipulatedData[index]

      if (adminGb === 'Y') {
        if (!dspsDt) {
          alert(`조치일을 입력하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (rdmYn === 'Y' && Number(rdmActnAmt) === 0) {
          alert(
            `환수를 체크했으나 금액을 입력하지 않은 행이 있습니다. ${index + 1}번째`,
          )
          validOk = false
          return
        }

        if (Number(asstAmt) < Number(rdmActnAmt)) {
          alert(
            `유가보조금 보다 더 많이 입력한 환수 금액이 있습니다. ${index + 1}번째`,
          )
          validOk = false
          return
        }

        if (!admdspSeCd) {
          alert(`행정처분구분을 선택하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (admdspSeCd === 'C' || admdspSeCd === 'H' || admdspSeCd === 'S') {
          if (subsChangeRest === 'Y') {
            if (
              !confirm(
                `${vhclNo} 차량이 휴지 상태입니다.${'\n'}휴지기간과 행정처분 기간은 중복이 불가능합니다. ${'\n'}행정처분 등록을 계속하시겠습니까?`,
              )
            ) {
              validOk = false
              return
            }
          }

          if (subsChangeReject === 'Y') {
            if (
              !confirm(
                `${vhclNo} 차량이 지급거절 상태입니다.${'\n'}지급거절기간과 행정처분 기간은 중복이 불가능합니다. ${'\n'} 행정처분 등록을 계속하시겠습니까?`,
              )
            ) {
              validOk = false
              return
            }
          }
        }

        if (!admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
          alert(`행정처분사유를 입력하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (
          admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 60
        ) {
          alert(
            `행정처분사유를 60자 이하로 입력해주시기 바랍니다. 행 ${index + 1}번째`,
          )
          validOk = false
          return
        }

        if (
          oltPssrpPrtiYn === 'Y' &&
          (oltPssrpPrtiOltNm === '' || oltPssrpPrtiBrno === '')
        ) {
          alert(
            `주유소공모,가담여부 한 주유소 정보를 입력되지 않은 행이 있습니다. ${index + 1}번째`,
          )
          validOk = false
          return
        }

        if (!unlawStrctChgYnCd) {
          alert(
            `불법구조변경여부를 선택하지 않은 행이 있습니다. ${index + 1}번째`,
          )
          validOk = false
          return
        }

        if (!dsclMthdCd) {
          alert(`적발방법을 선택하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (dsclMthdCd === 'S' && dsclMthdEtcMttrCn === '') {
          alert(`적발방법기타를 입력하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (!ruleVltnCluCd) {
          alert(`규정위반조항을 선택하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (ruleVltnCluCd === '99' && ruleVltnCluEtcCn === '') {
          alert(`규정위반기타를 입력하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }

        if (!instcSpldmdTypeCd) {
          alert(`부정수급유형을 선택하지 않은 행이 있습니다. ${index + 1}번째`)
          validOk = false
          return
        }
      }
    }

    return validOk
  }

  const handleCreateData = async () => {
    const { startFromErModal } = exaathrInfo
    // 조사결과 등록 부터 온 경우 두개 다 호출
    // 행정처분 등록 만 하는 경우 handleCreateExaathr만 호출
    let isDone: boolean = false
    if (startFromErModal) {
      isDone = await handleCreateExamResult()
      if (isDone) {
        await handleCreateExaathr()
      }
    } else {
      await handleCreateExaathr()
    }
  }

  //조사결과 등록기능
  const handleCreateExamResult = async () => {
    /**
     * 조사결과 등록 부터 온 경우
     * 조사결과 등록요청시 지급정지를 적용햐려는 중복된 차량이 있는지 확인
     *
     * 행정처분 등록만 하는 경우
     * 행정처분 등록요청시 지급정지를 적용햐려는 중복된 차량이 있는지 확인
     */
    const { startFromErModal } = exaathrInfo
    if (startFromErModal) {
      const isInsertBefore = manipulatedData.every((value, index) => {
        return value.subsChangeVhclNo !== ''
      })

      if (!isInsertBefore) {
        if (getCarCnt()) {
          alert('동일한 차량번호 확인으로 등록이 중지됩니다.')
          return false
        }
      }
    }

    try {
      const list = manipulatedData.map((value: any, index: number) => {
        return {
          exmnNo: value.exmnNo,
          vonrNm: value.vonrNm,
          tpbizCd: value.tpbizCd,
          bzmnSeCd: value.bzmnSeCd,
          tpbizSeCd: value.tpbizSeCd,
          droperYn: value.droperYnCd,
          rdmActnAmt: value.rdmActnAmt,
          exmnRsltCn: value.exmnRsltCn
            .replaceAll(/\n/g, '')
            .replaceAll(/\t/g, ''),
        }
      })

      let endPoint: string = `/fsm${pathname}/tr/createExamResult`

      setIsDataProcessing(true)

      const response = await sendHttpRequest('PUT', endPoint, { list }, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return false
        }
        return true
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return false
      }
    } catch (error) {
      alert(error)
      return false
    } finally {
      setIsDataProcessing(false)
    }
  }

  //행정처분 등록기능
  const handleCreateExaathr = async () => {
    /**
     * 조사결과 등록 부터 온 경우
     * 조사결과 등록요청시 지급정지를 적용햐려는 중복된 차량이 있는지 확인
     *
     * 행정처분 등록만 하는 경우
     * 행정처분 등록요청시 지급정지를 적용햐려는 중복된 차량이 있는지 확인
     */
    const { startFromErModal } = exaathrInfo
    if (!startFromErModal) {
      const isInsertBefore = manipulatedData.every((value, index) => {
        return value.subsChangeVhclNo !== ''
      })

      if (!isInsertBefore) {
        if (getCarCnt()) {
          alert('동일한 차량번호 확인으로 등록이 중지됩니다.')
          return
        }
      }
    }

    try {
      const list = manipulatedData.map((value: any, index: number) => {
        if (value.adminGb === 'N') {
          return {
            exmnNo: value.exmnNo,
            vhclNo: value.vhclNo,
            dspsDt: value.dspsDt.replaceAll('-', ''),
            rdmYn:
              typeof value.rdmYn === 'string'
                ? value.rdmYn
                : value.rdmYn == true
                  ? 'N'
                  : 'Y',
            hstrySn: value.hstrySn,
            admdspSeCd: '',
          }
        } else {
          return {
            exmnNo: value.exmnNo,
            vhclNo: value.vhclNo,
            dspsDt: value.dspsDt.replaceAll('-', ''),
            rdmYn:
              typeof value.rdmYn === 'string'
                ? value.rdmYn
                : value.rdmYn == true
                  ? 'N'
                  : 'Y',
            admdspSeCd: value.admdspSeCd,
            admdspRsnCn: value.admdspRsnCn
              .replaceAll(/\n/g, '')
              .replaceAll(/\t/g, ''),
            admdspBgngYmd: value.admdspBgngYmd.replaceAll('-', ''),
            admdspEndYmd: value.admdspEndYmd.replaceAll('-', ''),
            oltPssrpPrtiYn: value.oltPssrpPrtiYn,
            oltPssrpPrtiOltNm: value.oltPssrpPrtiOltNm,
            oltPssrpPrtiBrno: value.oltPssrpPrtiBrno,
            unlawStrctChgYnCd: value.unlawStrctChgYnCd,
            dsclMthdCd: value.dsclMthdCd,
            dsclMthdEtcMttrCn: value.dsclMthdEtcMttrCn,
            ruleVltnCluCd: value.ruleVltnCluCd,
            ruleVltnCluEtcCn: value.ruleVltnCluEtcCn,
            cpeaChckYn: value.cpeaChckYn,
            cpeaChckCyclVl: value.cpeaChckCyclVl,
            instcSpldmdTypeCd: value.instcSpldmdTypeCd,
            subsChangeVhclNo: value.subsChangeVhclNo,
            exceptYn: value.exceptVhcl ? 'Y' : 'N',
            hstrySn: value.hstrySn,
          }
        }
      })

      let endPoint: string = `/fsm${pathname}/tr/createExaathr`
      setIsDataProcessing(true)

      const response = await sendHttpRequest('PUT', endPoint, { list }, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return false
        }
        dispatch(closeExaathrModal())
        callRefetch(pageUrl, dispatch)
        commClearReduxData(pageUrl, dispatch)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return false
    } finally {
      setIsDataProcessing(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            height: '100%',
          },
        }}
        open={exaathrInfo.exaModalOpen}
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
              <h2>행정처분 등록</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (validation()) {
                    if (confirm('등록하시겠습니까?')) {
                      handleCreateData()
                    }
                  }
                }}
              >
                등록
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyData}
              >
                일괄
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                닫기
              </Button>
            </div>
          </Box>
          <Box>
            <TableDataGrid
              headCells={ilgCommExaathrPopHC} // 테이블 헤더 값
              rows={manipulatedData} // 목록 데이터
              // totalRows={rows.length} // 총 로우 수
              onRowClick={(row: any, rowIndex?: number) =>
                onRowClick(row, rowIndex)
              } // 행 클릭 핸들러 추가
              //onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              // pageable={tapPageable} // 현재 페이지 / 사이즈 정보
              selectedRowIndex={selectedIndex}
              onCheckChange={onCheckChange}
              loading={false}
            />
            <BlankCard>
              <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                <TableContainer style={{ margin: '0 0 0 0' }}>
                  <Table
                    className="table table-bordered"
                    aria-labelledby="tableTitle"
                    style={{ tableLayout: 'fixed', width: '100%' }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                          rowSpan={2}
                        >
                          행정처분
                        </TableCell>
                        {/* 행정처분 구분 */}
                        <TableCell colSpan={3}>
                          <RadioGroup
                            row
                            id="rdo_adminGb"
                            name="adminGb"
                            className="mui-custom-radio-group"
                            onChange={handleChangeRadio}
                            value={targetInfo.adminGb || ''}
                          >
                            <FormControlLabel
                              value="N"
                              control={
                                <CustomRadio disabled={selectedIndex < 0} />
                              }
                              label="해당없음"
                            />
                            <FormControlLabel
                              value="Y"
                              control={
                                <CustomRadio disabled={selectedIndex < 0} />
                              }
                              label="행정상제재"
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>조치일
                        </TableCell>
                        <TableCell colSpan={2}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <CustomTextField
                              type="date"
                              id="dspsDt"
                              name="dspsDt"
                              value={targetInfo.dspsDt}
                              onChange={handleChange}
                              disabled={disableAll}
                            />
                            {showBeforeChangeVhcl ? (
                              <div style={{ color: 'red' }}>
                                {
                                  '※ 이미 행정처분(보조금지급정지)이 걸려있는 차량입니다. '
                                }
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* 환수여부 */}
                      <TableRow>
                        <TableCell>
                          <FormControlLabel
                            value="rdmYn"
                            control={
                              <CustomCheckbox
                                name="rdmYn"
                                value="rdmYn"
                                checked={
                                  typeof targetInfo.rdmYn === 'string'
                                    ? targetInfo.rdmYn === 'N'
                                    : targetInfo.rdmYn
                                }
                                onChange={handleCheckCheckBox}
                                tabIndex={-1}
                                inputProps={{
                                  'aria-labelledby': 'select all desserts',
                                }}
                                disabled={!targetInfo.rdmEnable}
                              />
                            }
                            label="환수안함"
                          />
                        </TableCell>
                        {/* 행정처분 구분 */}
                        <TableCell colSpan={2}>
                          <RadioGroup
                            row
                            id="rdo_admdspSeCd"
                            name="admdspSeCd"
                            className="mui-custom-radio-group"
                            onChange={handleChangeRadio}
                            value={targetInfo.admdspSeCd || ''}
                          >
                            <FormControlLabel
                              value="A"
                              control={<CustomRadio />}
                              label="환수만"
                              disabled={disableAll}
                            />
                            <FormControlLabel
                              value="G"
                              control={<CustomRadio />}
                              label="처분유예"
                              disabled={disableAll}
                            />

                            <FormControlLabel
                              value="H"
                              control={<CustomRadio />}
                              label="지급정지 6개월"
                              disabled={disableAll}
                            />
                            <FormControlLabel
                              value="S"
                              control={<CustomRadio />}
                              label="지급정지 1년"
                              disabled={disableAll}
                            />
                            <FormControlLabel
                              value="C"
                              control={<CustomRadio />}
                              label="감차"
                              disabled={disableAll}
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>환수금액
                        </TableCell>
                        <TableCell colSpan={2}>
                          <CustomTextField
                            sx={{ '& input': { textAlign: 'right' } }}
                            type="number"
                            id="rdmActnAmt"
                            name="rdmActnAmt"
                            value={targetInfo.rdmActnAmt}
                            onChange={handleChange}
                            disabled={disableAll || disableRdmAmt}
                          />
                        </TableCell>
                      </TableRow>
                      {/* 행정처분 사유 */}
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>행정처분사유
                        </TableCell>
                        <TableCell colSpan={6}>
                          <CustomTextField
                            type="text"
                            id="admdspRsnCn"
                            name="admdspRsnCn"
                            value={targetInfo.admdspRsnCn}
                            onChange={handleChange}
                            disabled={disableAll}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                      {/* 행정처분시작일 행정처분종료일 */}
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          행정처분시작일
                        </TableCell>
                        <TableCell colSpan={2}>
                          <CustomTextField
                            type="date"
                            id="admdspBgngYmd"
                            name="admdspBgngYmd"
                            value={targetInfo.admdspBgngYmd}
                            onChange={handleChange}
                            disabled={disableAll || disableAdmdspBgng}
                          />
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          행정처분종료일
                        </TableCell>
                        <TableCell colSpan={3}>
                          <CustomTextField
                            type="date"
                            id="admdspEndYmd"
                            name="admdspEndYmd"
                            value={targetInfo.admdspEndYmd}
                            onChange={handleChange}
                            disabled={disableAll || disableAdmdspEnd}
                          />
                        </TableCell>
                      </TableRow>
                      {/* 주유소공모, 가담여부 불법구조변경여부 */}
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>주유소공모,
                          {'\n'}가담여부
                        </TableCell>
                        <TableCell colSpan={4}>
                          <div className="form-group">
                            <CustomFormLabel
                              className="input-label-none"
                              htmlFor="sch-oltPssrpPrtiYn"
                            >
                              주유소공모,가담여부
                            </CustomFormLabel>
                            <CommSelect
                              cdGroupNm={'157'}
                              pValue={targetInfo.oltPssrpPrtiYn}
                              pName={'oltPssrpPrtiYn'}
                              width={'30%'}
                              handleChange={handleSelectChange}
                              pDisabled={disableAll}
                              addText="선택"
                              htmlFor={'sch-oltPssrpPrtiYn'}
                            />
                            <IconButton
                              disabled={disableOltPssrpPrti}
                              style={{
                                marginLeft: '10px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '5px',
                                border: '2px solid black',
                              }}
                              onClick={() => {
                                dispatch(openOilStationModal())
                              }}
                            >
                              <IconSearch stroke={'grey'} strokeWidth={4} />
                            </IconButton>
                            <div
                              className="form-group"
                              style={{ marginLeft: '10px' }}
                            >
                              <CustomFormLabel
                                className="input-label-display"
                                htmlFor="lbl_oltPssrpPrtiOltNm"
                              >
                                주유소명
                              </CustomFormLabel>
                              <CustomTextField
                                type="text"
                                id="txt_oltPssrpPrtiOltNm"
                                name="oltPssrpPrtiOltNm"
                                value={targetInfo.oltPssrpPrtiOltNm}
                                style={{ marginLeft: '5px' }}
                                onChange={handleChange}
                                disabled={disableOltPssrpPrti}
                              />
                            </div>
                            <div
                              className="form-group"
                              style={{ marginLeft: '10px' }}
                            >
                              <CustomFormLabel
                                className="input-label-display"
                                htmlFor="lbl_oltPssrpPrtiBrno"
                              >
                                사업자번호
                              </CustomFormLabel>
                              <CustomTextField
                                type="text"
                                id="txt_oltPssrpPrtiBrno"
                                name="oltPssrpPrtiBrno"
                                onChange={handleChange}
                                value={targetInfo.oltPssrpPrtiBrno}
                                style={{ marginLeft: '5px' }}
                                disabled={disableOltPssrpPrti}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>불법구조변경
                          여부
                        </TableCell>
                        <TableCell>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="sch-unlawStrctChgYnCd"
                          >
                            불법구조변경
                          </CustomFormLabel>
                          <CommSelect
                            cdGroupNm={'159'}
                            pValue={targetInfo.unlawStrctChgYnCd}
                            pName={'unlawStrctChgYnCd'}
                            handleChange={handleSelectChange}
                            pDisabled={disableAll}
                            addText="선택"
                            htmlFor={'sch-unlawStrctChgYnCd'}
                          />
                        </TableCell>
                      </TableRow>
                      {/* 적발방법, 규정위반조항 */}
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>적발방법
                        </TableCell>
                        <TableCell colSpan={3}>
                          <div className="form-group">
                            <CustomFormLabel
                              className="input-label-none"
                              htmlFor="sch-dsclMthdCd"
                            >
                              적발방법
                            </CustomFormLabel>
                            <CommSelect
                              cdGroupNm={'160'}
                              pValue={targetInfo.dsclMthdCd}
                              pName={'dsclMthdCd'}
                              handleChange={handleSelectChange}
                              pDisabled={disableAll}
                              addText="선택"
                              htmlFor={'sch-dsclMthdCd'}
                            />
                            <CustomFormLabel
                              className="input-label-display"
                              htmlFor="ft-dsclMthdNm"
                            >
                              기타
                            </CustomFormLabel>
                            <CustomTextField
                              type="text"
                              id="ft-dsclMthdEtcMttrCn"
                              name="dsclMthdEtcMttrCn"
                              value={targetInfo.dsclMthdEtcMttrCn}
                              style={{ marginLeft: '5px' }}
                              disabled={disableAll || disabledDsclMthd}
                              onChange={handleChange}
                            />
                          </div>
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>규정위반조항
                        </TableCell>
                        <TableCell colSpan={2}>
                          <div className="form-group">
                            <CustomFormLabel
                              className="input-label-none"
                              htmlFor="sch-ruleVltnCluCd"
                            >
                              규정위반조항
                            </CustomFormLabel>
                            <CommSelect
                              cdGroupNm={'171'}
                              pValue={targetInfo.ruleVltnCluCd}
                              pName={'ruleVltnCluCd'}
                              handleChange={handleSelectChange}
                              addText="선택"
                              pDisabled={disableAll}
                              htmlFor={'sch-ruleVltnCluCd'}
                            />
                            <CustomFormLabel
                              className="input-label-display"
                              htmlFor="ft-ruleVltnCluNm"
                            >
                              기타
                            </CustomFormLabel>
                            <CustomTextField
                              type="text"
                              id="ft-ruleVltnCluEtcCn"
                              name="ruleVltnCluEtcCn"
                              value={targetInfo.ruleVltnCluEtcCn}
                              style={{ marginLeft: '5px' }}
                              disabled={disableAll || disabledRuleVltnClu}
                              onChange={handleChange}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* 합동점검여부, 부정수급유형 */}
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          합동점검여부
                        </TableCell>
                        <TableCell colSpan={3}>
                          <div className="form-group" style={{ width: '100%' }}>
                            <RadioGroup
                              row
                              id="rdo_cpeaChckYn"
                              name="cpeaChckYn"
                              className="mui-custom-radio-group"
                              onChange={handleChangeRadio}
                              value={targetInfo.cpeaChckYn || 'N'}
                              style={{ width: '100%' }}
                            >
                              <FormControlLabel
                                value="Y"
                                control={<CustomRadio />}
                                label="예"
                                disabled={disableAll}
                              />
                              <FormControlLabel
                                value="N"
                                control={<CustomRadio />}
                                label="아니오"
                                disabled={disableAll}
                              />
                            </RadioGroup>
                            <CustomFormLabel
                              className="input-label-display"
                              htmlFor="sch-cpeaChckCyclVl"
                            >
                              합동점검차시
                            </CustomFormLabel>
                            <CommSelect
                              cdGroupNm={'121'}
                              pValue={targetInfo.cpeaChckCyclVl}
                              pName={'cpeaChckCyclVl'}
                              handleChange={handleSelectChange}
                              addText="선택"
                              pDisabled={disableAll || disabledCpeaChck}
                              htmlFor={'sch-cpeaChckCyclVl'}
                            />
                          </div>
                        </TableCell>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          <span className="required-text">*</span>부정수급유형
                        </TableCell>
                        <TableCell colSpan={2}>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="sch-instcSpldmdTypeCd"
                          >
                            부정수급유형형
                          </CustomFormLabel>
                          <CommSelect
                            cdGroupNm={'986'}
                            pValue={targetInfo.instcSpldmdTypeCd}
                            pName={'instcSpldmdTypeCd'}
                            width="50%"
                            handleChange={handleSelectChange}
                            addText="선택"
                            pDisabled={disableAll}
                            htmlFor={'sch-instcSpldmdTypeCd'}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="td-head"
                          style={{ width: '120px', verticalAlign: 'middle' }}
                        >
                          추후 해당차량 제외
                        </TableCell>
                        <TableCell colSpan={6}>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-exceptVhcl"
                          >
                            추후 해당차량 제외
                          </CustomFormLabel>
                          <CustomCheckbox
                            id="ft-exceptVhcl"
                            name="exceptVhcl"
                            checked={targetInfo.exceptVhcl}
                            onChange={handleCheckCheckBox}
                            inputProps={{
                              'aria-labelledby': 'select all desserts',
                            }}
                            disabled={!disableAll}
                          />
                          제외
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </BlankCard>
          </Box>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
      <OilStationModal />
    </Box>
  )
}

export default ExaathrModal
