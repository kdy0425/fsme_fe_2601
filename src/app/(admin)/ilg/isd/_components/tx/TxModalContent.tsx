/* React */
import React, { useEffect, useState } from 'react';

/* mui component */
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Grid, Box, Button, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { CustomTextField, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import VhclSearchModal, { VhclRow } from '@/app/components/tx/popup/VhclSearchModal';
import BlankCard from '@/app/components/shared/BlankCard';
import { IconSearch } from '@tabler/icons-react';
import TxOilStationModal from '@/app/components/tx/popup/TxOilStationModal';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { addYears, addMonths, addDays, dateToString, getForamtAddDay, getFormatToday, getToday, getDateFormatYMD } from '@/utils/fsms/common/dateUtils';
import { isNumber } from '@/utils/fsms/common/comm';
import { trim } from 'lodash';

/* 공통 interface */
import { OilStationSearchRow } from '@/app/components/tx/popup/TxOilStationModal';

/* 부모페이지에서 선언한 interface */
import { Row } from './TxPage';

/* _component */
import AdmdspSeRadio from './AdmdspSeRadio'

/* interface 선언 */
interface paramsInterface {
  vhclNo:string // 차량번호
  vonrNm:string // 성명
  vonrRrnoD:string // 주민등록번호 디크립트
  brno:string // 사업자등록번호
  ttmKoiCd:string // 기존유종코드
  bzmnSeCd:string // 개인법인코드
  bgngYmd:string // 부정수급거래 시작기간
  endYmd:string // 부정수급거래 종료기간
  instcSpldmdTypeCd:string // 부정수급유형 코드
  instcSpldmdRsnCn:string // 부정수급유형 기타
  dlngNocs:string // 거래건수
  totlAprvAmt:string // 거래금액
  rdmTrgtNocs:string // 부정수급건수
  instcSpldmdAmt:string // 부정수급액
  totlAsstAmt:string // 유가보조금
  rdmActnAmt:string // 환수금액, 환수할금액
  rdmDt:string // 환수한 일자
  rlRdmAmt:string // 환수한금액
  dsclMthdCd:string // 적발방법 코드
  dsclMthdEtcMttrCn:string // 적발방법 기타
  ruleVltnCluCd:string // 규정위반조항 코드
  ruleVltnCluEtcCn:string // 규정위반조항 기타
  admdspSeCd:string // 행정처리 코드
  exmnRegNocs:string // 위반횟수
  dspsDt:string // 행정처분일
  stopBgngYmd:string // 행정처분시작
  stopEndYmd:string // 행정처분종료
  rdmYn:string // 환수금 환수여부
  moliatOtspyYn:string // 국토부보조금 지급여부
  admdspRsnCn:string // 및 행정처분사유
  oltPssrpPrtiYn:string // 주유소 공모코드
  oltPssrpPrtiOltNm:string // 주유소
  oltPssrpPrtiBrno:string // 주유소 사업자등록번호
  exmnNo:string // 연번
  locgovCd:string // 지자체코드명
  ntsOtspyYn:string // 국세청지급여부
  warnYn:string // 경고여부
  locgovNm:string // 지자체명
  giveStopSn:string // 지급정지 일련번호
  vhclRestrtYmd:string // 삭제여부
}

interface propsInterface {
  open:boolean
  setOpen:React.Dispatch<React.SetStateAction<boolean>>,
  type: 'CREATE' | 'UPDATE'
  data: Row | null
  reload:() => void
}

const TxModalContent = (props:propsInterface) => {

  const { open, setOpen, type, data, reload } = props;

  const [params, setParams] = useState<paramsInterface>({
    
    /**************************************************
     * 상세 정보
     *************************************************/
    /* 1열 */
    vhclNo:'', // 차량번호
    vonrNm:'', // 성명
    vonrRrnoD:'', // 주민등록번호 디크립트
    brno:'', // 사업자등록번호
    
    /* 2열 */
    ttmKoiCd:'', // 기존유종코드
    bzmnSeCd:'', // 개인법인코드
    bgngYmd:'', // 부정수급거래 시작기간
    endYmd:'', // 부정수급거래 종료기간

    /* 3열 */
    instcSpldmdTypeCd:'', // 부정수급유형 코드
    instcSpldmdRsnCn:'', // 부정수급유형 기타
    
    /* 4열 */
    dlngNocs:'', // 거래건수
    totlAprvAmt:'', // 거래금액
    rdmTrgtNocs:'', // 부정수급건수
    instcSpldmdAmt:'', // 부정수급액

    /* 5열 */
    totlAsstAmt:'', // 유가보조금
    rdmActnAmt:'', // 환수금액, 환수할금액
    rdmDt:'', // 환수한 일자
    rlRdmAmt:'', // 환수한금액
    
    /**************************************************
     * 조사 및 행정처리
     *************************************************/
    /* 1열 */
    dsclMthdCd:'', // 적발방법 코드
    dsclMthdEtcMttrCn:'', // 적발방법 기타

    /* 2열 */
    ruleVltnCluCd:'', // 규정위반조항 코드
    ruleVltnCluEtcCn:'', // 규정위반조항 기타

    /* 3열 */
    admdspSeCd:'N', // 행정처리 코드명

    /* 4열 */
    exmnRegNocs:'', // 위반횟수
    dspsDt:'', // 행정처분일    
    stopBgngYmd:'', // 행정처분시작일
    stopEndYmd:'', // 행정처분종료일

    /* 5열 */
    rdmYn:'N', // 환수금 환수여부
    //rdmActnAmt:'', // 환수금액, 환수할금액
    moliatOtspyYn:'N', // 국토부보조금 지급여부

    /* 6열 */
    admdspRsnCn:'', // 조사내용 및 행정처분사유

    /* 7열 */
    oltPssrpPrtiYn:'', // 주유소 공모코드
    oltPssrpPrtiOltNm:'', // 주유소명
    oltPssrpPrtiBrno:'', // 주유소 사업자등록번호

    /* hidden */    
    exmnNo:'', // 연번    
    locgovCd:'', // 지자체코드명    
    ntsOtspyYn:'', // 국세청보조금 지급여부
    warnYn:'', // 경고여부
    locgovNm:'', // 지자체명
    giveStopSn:'', // 지급정지 일련번호
    vhclRestrtYmd:'', // 차량운행게시일
  });
  
  /* 활성화 상태변수 관리 */
  const [allDisable, setAllDisable] = useState(false); // 전체 인풋 활성화 관리
  const [instcSpldmdRsnCnFlag, setInstcSpldmdRsnCnFlag] = useState<boolean>(true); // 부정수급유형 기타 입력칸 활성화
  const [rdmActnAmtFlag, setRdmActnAmtFlag] = useState<boolean>(true); // 환수금액 입력칸 활성화
  const [rdmDtFlag, setRdmDtFlag] = useState<boolean>(true); // 환수한일자 입력칸 활성화
  const [rlRdmAmtFlag, setRlRdmAmtFlag] = useState<boolean>(true); // 환수한금액 입력칸 활성화
  const [dsclMthdCdFlag, setDsclMthdCdFlag] = useState<boolean>(true); // 적발방법 활성화
  const [dsclMthdEtcMttrCnFlag, setDsclMthdEtcMttrCnFlag] = useState<boolean>(true); // 적발방법 기타 입력칸 활성화
  const [ruleVltnCluCdFlag, setRuleVltnCluCdFlag] = useState<boolean>(true); // 규정위반조항 활성화
  const [ruleVltnCluEtcCnFlag, setRuleVltnCluEtcCnFlag] = useState<boolean>(true); // 규정위반조항 기타 입력칸 활성화
  const [stopBgngYmdFlag, setStopBgngYmdFlag] = useState<boolean>(true); // 행정처분시작일 활성화
  const [stopEndYmdFlag, setStopEndYmdFlag] = useState<boolean>(true); // 행정처분종료일 활성화
  const [rdmYnFalg, setRdmYnFalg] = useState<boolean>(true); // 환수금 체크박스 활성화  
  const [moliatOtspyYnFlag, setMoliatOtspyYnFlag] = useState<boolean>(true); // 국토부보조금 미지금 체크박스 이벤트 활성화
  const [oltPssrpPrtiYnFlag, setOltPssrpPrtiYnFlag] = useState<boolean>(true); // 주유소 공모 활성화
  const [oltPssrpPrtiOltNmFlag, setOltPssrpPrtiOltNmFlag] = useState<boolean>(true); // 주유소명 활성화
  const [oltPssrpPrtiBrnoFlag, setOltPssrpPrtiBrnoFlag] = useState<boolean>(true); // 주유소 사업자등록번호 활성화
  
  // 모달상태관리
  const [frcsOpen, setFrcsOpen] = useState<boolean>(false); // 주유소검색 모달
  const [openVhclModal, setOpenVhclModal] = useState<boolean>(false); // 차량검색 모달

  // 저장시 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState(false);

  useEffect(() => {
    
    if (open && type === 'UPDATE') {
      // await 사용으로 인해 부가 함수로 처리
      updateDataSet();

      if (data?.stopBgngYmd) {
        
        /*
         * 행정처분 시작일 - 1 이 금일보다 작거나 같을경우
         * 
         * CASE 1 : 행정처분이 종료되지 않았을경우
         * 환수금액(환수시), 행정처분종료일, 조사내용 및 행정처분사유 수정가능
         * 
         * CASE 2 : 행정처분이 종료되었을경우
         * 환수금액(환수시), 조사내용 및 행정처분사유 수정가능
         */
        if (data.stopBgngYmd && Number(data?.stopBgngYmd) - 1 <= Number(getToday())) {
          setAllDisable(true);
        }
      }
    }
  }, [open]);

  const updateDataSet = async () => {

    const vonrRrnoD = await getDecVonrRrnoD(data?.vonrRrno ?? '');

    setParams((prev) => ({
      ...prev,
      vhclNo:data?.vhclNo ?? '',
      vonrNm:data?.vonrNm ?? '',
      vonrRrnoD:vonrRrnoD,
      brno:data?.brno ?? '',
      ttmKoiCd:data?.ttmKoiCd ?? '',
      bzmnSeCd:data?.bzmnSeCd ?? '',
      bgngYmd:getDateFormatYMD(data?.bgngYmd ?? ''),
      endYmd:getDateFormatYMD(data?.endYmd ?? ''),
      instcSpldmdTypeCd:data?.instcSpldmdTypeCd ?? '',
      instcSpldmdRsnCn:data?.instcSpldmdRsnCn ?? '',
      dlngNocs:data?.dlngNocs ?? '',
      totlAprvAmt:data?.totlAprvAmt ?? '',
      rdmTrgtNocs:data?.rdmTrgtNocs ?? '',
      instcSpldmdAmt:data?.instcSpldmdAmt ?? '',
      totlAsstAmt:data?.totlAsstAmt ?? '',
      rdmActnAmt:data?.rdmActnAmt ?? '',
      rdmDt:getDateFormatYMD(data?.rdmDt ?? ''),
      rlRdmAmt:data?.rlRdmAmt ?? '',
      dsclMthdCd:data?.dsclMthdCd ?? '',
      dsclMthdEtcMttrCn:data?.dsclMthdEtcMttrCn ?? '',
      ruleVltnCluCd:data?.ruleVltnCluCd ?? '',
      ruleVltnCluEtcCn:data?.ruleVltnCluEtcCn ?? '',
      admdspSeCd:data?.admdspSeCd ?? '',
      exmnRegNocs:data?.exmnRegNocs ?? '',
      dspsDt:getDateFormatYMD(data?.dspsDt ?? ''),
      stopBgngYmd:getDateFormatYMD(data?.stopBgngYmd ?? ''),
      stopEndYmd:getDateFormatYMD(data?.stopEndYmd ?? ''),
      rdmYn:data?.rdmYn ?? '',      
      moliatOtspyYn:data?.moliatOtspyYn ?? '',
      admdspRsnCn:data?.admdspRsnCn ?? '',
      oltPssrpPrtiYn:data?.oltPssrpPrtiYn ?? '',
      oltPssrpPrtiOltNm:data?.oltPssrpPrtiOltNm ?? '',
      oltPssrpPrtiBrno:data?.oltPssrpPrtiBrno ?? '',
      exmnNo:data?.exmnNo ?? '',
      locgovCd:data?.locgovCd ?? '',
      locgovNm:data?.locgovNm ?? '',
      giveStopSn:data?.giveStopSn ?? '',
    }));

    settingInputEnable(data?.admdspSeCd ?? '', true);
  }

  // 부정수급유형 기타 선택 시 기타 입력칸 활성화
  useEffect(() => {
    if (params.instcSpldmdTypeCd === '99') {
      setInstcSpldmdRsnCnFlag(false);
    } else {
      setInstcSpldmdRsnCnFlag(true);
      setParams((prev) => ({ ...prev, instcSpldmdRsnCn:'' }));
    }
  }, [params.instcSpldmdTypeCd]);

  // 적발방법 기타 선택 시 기타 입력칸 활성화
  useEffect(() => {
    if (params.dsclMthdCd === 'S') {
      setDsclMthdEtcMttrCnFlag(false);
    } else {
      setDsclMthdEtcMttrCnFlag(true);
      setParams((prev) => ({ ...prev, dsclMthdEtcMttrCn:'' }));
    }
  }, [params.dsclMthdCd]);  

  // 규정위반조항 기타 선택 시 기타 입력칸 활성화
  useEffect(() => {
    if (params.ruleVltnCluCd === '99') {
      setRuleVltnCluEtcCnFlag(false);
    } else {
      setRuleVltnCluEtcCnFlag(true);
      setParams((prev) => ({ ...prev, ruleVltnCluEtcCn:'' }));
    }
  }, [params.ruleVltnCluCd]);

  // 환수금 환수선택시 환수금액, 환수한일자, 환수한금액 입력칸 활성화
  useEffect(() => {
    if (params.rdmYn === 'Y') {
      setRdmActnAmtFlag(false);
      setRdmDtFlag(false);
      setRlRdmAmtFlag(false);
    } else {
      setRdmActnAmtFlag(true);
      setRdmDtFlag(true);
      setRlRdmAmtFlag(true);
      setParams((prev) => ({ ...prev, rdmActnAmt:'', rdmDt:'', rlRdmAmt:'' }));
    }
  }, [params.rdmYn]);
  
  // 주유소 공모 네 선택시 주유소명 및 사업자등록번호 활성화
  useEffect(() => {
    if (params.oltPssrpPrtiYn === 'Y') {
      setOltPssrpPrtiOltNmFlag(false); // 주유소명
      setOltPssrpPrtiBrnoFlag(false); // 주유소 사업자번호
    } else {
      setOltPssrpPrtiOltNmFlag(true); // 주유소명
      setOltPssrpPrtiBrnoFlag(true); // 주유소 사업자번호
      setParams((prev) => ({ ...prev, oltPssrpPrtiOltNm:'', oltPssrpPrtiBrno:'' }));
    }
  }, [params.oltPssrpPrtiYn]);
  
  // 인풋 값 변경시
  const handleParamsChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    
    const { name, value } = event.target
    
    // 숫자만 입력가능한 name값 모음
    const onlyNumberName = [ 'vonrRrnoD', 'brno', 'dlngNocs', 'totlAprvAmt', 'rdmTrgtNocs', 'instcSpldmdAmt', 'totlAsstAmt', 'rdmActnAmt', 'rlRdmAmt', 'exmnRegNocs', 'oltPssrpPrtiBrno' ];

    if (onlyNumberName.includes(name)) {

      // 숫자형식만 입력가능한 name값 모음 ** 01 방지
      const stringToNumberName = [ 'dlngNocs', 'totlAprvAmt', 'rdmTrgtNocs', 'instcSpldmdAmt', 'totlAsstAmt', 'rdmActnAmt', 'rlRdmAmt', 'exmnRegNocs' ];

      if (stringToNumberName.includes(name)) {
        
        const result = Number(value);
        setParams(prev => ({ ...prev, [name]:result }));

      } else { 

        if (isNumber(value)) {
          setParams(prev => ({ ...prev, [name]:value }));
        }        
      }

    } else if (name === 'admdspSeCd') {
      setParams(prev => ({ ...prev, [name]: value }));
      settingStopYmd(value);
      settingInputEnable(value, false);
    } else {

      if (event.target instanceof HTMLInputElement && name === 'moliatOtspyYn') {
        const isChecked = event.target.checked;
        setParams(prev => ({ ...prev, [name]: isChecked ? 'Y' : 'N' }));
      } else if (event.target instanceof HTMLInputElement && name === 'rdmYn') {
        const isChecked = event.target.checked;
        setParams(prev => ({ ...prev, [name]: isChecked ? 'N' : 'Y' }));
      } else {
        setParams(prev => ({ ...prev, [name]: value }));
      }
    }    
  }

  // 행정처분 라디오값에 따라 행정처분 시작일 및 종료일 세팅
  const settingStopYmd = (value:string) => {

    let stopBgngYmd:any = dateToString(addDays(new Date(), 2), true);
    let stopEndYmd:any = '';
    
    if (value === 'H') { // 지급정지 6개월
      stopEndYmd = dateToString(addMonths(addDays(new Date(), 1), 6), true);
    } else if (value === 'S') { // 지급정지 1년
      stopEndYmd = dateToString(addYears(addDays(new Date(), 1), 1), true);
    } else { // 경고, 혐의없음
      stopBgngYmd = '';
      stopEndYmd = '';
    }

    setParams((prev) => ({
      ...prev,
      stopBgngYmd:stopBgngYmd,
      stopEndYmd:stopEndYmd,
    }));
  }

  // 행정처분 라디오값에 따라 인풋태그 활/비활성화 세팅
  const settingInputEnable = (value:string, init:boolean) => {

    if (value === 'N' || value === 'W') { // 혐의없음, 경고

      setDsclMthdCdFlag(true); // 적발방법
      setDsclMthdEtcMttrCnFlag(true); // 적발방법기타
      setRuleVltnCluCdFlag(true); // 규정위반조항
      setRuleVltnCluEtcCnFlag(true); // 규정위반조항기타
      setStopBgngYmdFlag(true); // 행정처분시작일
      setStopEndYmdFlag(true); // 행정처분 종료일
      setRdmYnFalg(value === 'N' ? true : false); // 환수금
      setMoliatOtspyYnFlag(true); // 국토부보조금
      setOltPssrpPrtiYnFlag(true); // 주유소공모
      setOltPssrpPrtiOltNmFlag(true); // 주유소명
      setOltPssrpPrtiBrnoFlag(true); // 주유소 사업자번호      

      setParams((prev) => ({
        ...prev,
        dsclMthdCd:'',
        dsclMthdEtcMttrCn:'',
        ruleVltnCluCd:'',
        ruleVltnCluEtcCn:'',
        moliatOtspyYn:'N',
        ntsOtspyYn:'N',
        oltPssrpPrtiYn:'',
        oltPssrpPrtiOltNm:'',
        oltPssrpPrtiBrno:'',
      }));

      if (!init) {
        // 수정모달 최초 세팅시에는 저장값으로만 세팅되도록 하기위함
        setParams((prev) => ({
          ...prev,
          rdmYn:value === 'N' ? 'N' : 'Y',
        }));
      }

    } else {

      setDsclMthdCdFlag(false); // 적발방법
      setRuleVltnCluCdFlag(false); // 규정위반조항
      setStopBgngYmdFlag(false); // 행정처분시작일
      setStopEndYmdFlag(false); // 행정처분 종료일
      setRdmYnFalg(false); // 환수금
      setMoliatOtspyYnFlag(false); // 국토부보조금
      setOltPssrpPrtiYnFlag(false); // 주유소공모
      
      setParams((prev) => ({
        ...prev,
        ntsOtspyYn:'Y',
      }));

      if (!init) {
        // 수정모달 최초 세팅시에는 저장값으로만 세팅되도록 하기위함
        setParams((prev) => ({
          ...prev,
          rdmYn:'Y',
          moliatOtspyYn:'Y',
        }));
      } else {
        // 행정처분 종료일이 지났을경우
        if (data?.stopEndYmd && Number(data.stopEndYmd) <= Number(getToday())) {
          setStopEndYmdFlag(true);
        } else {
          setStopEndYmdFlag(false);
        }
      }
    }
  }

  // 환수여부 체크박스 이벤트처리
  const rdmYnHandleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {    
    if (!allDisable && !rdmYnFalg) {
      handleParamsChange(event);
    }
  };

  // 국토부보조금 체크박스 이벤트처리
  const moliatOtspyYnHandleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {    
    if (!allDisable && !moliatOtspyYnFlag) {
      handleParamsChange(event);
    }
  };

  // 주유소 검색 모달에서 로우클릭시
  const frcsModalRowClick = (row:OilStationSearchRow) => {
    setParams((prev) => ({
      ...prev,
      oltPssrpPrtiOltNm:row.frcsNm,
      oltPssrpPrtiBrno:row.frcsBrno,
    }));
  }

  // 차량 검색 모달에서 로우 클릭시
  const handleClickVhclRow = async (row:VhclRow) => {
    
    if (row.cmSttsCd !== '000') {
      alert('[ ' + row.vhclNo + ' 차량상태 : ' + row.cmSttsNm + ' ]' + '\n\n차량상태가 정상이 아닙니다.\n정상 차량에 한하여 보조금지급정지 등록이 가능합니다.');
      return;
    }

    const vonrRrnoD = await getDecVonrRrnoD(row.rprsvRrno);
    
    setParams((prev) => ({
      ...prev,
      vhclNo:row.vhclNo,
      vonrNm:row.bzentyNm,
      vonrRrnoD:vonrRrnoD,
      brno:row.brno,
      ttmKoiCd:row.koiCd,
      bzmnSeCd:row.bzmnSeCd,
      locgovCd:row.locgovCd,
      locgovNm:row.locgovNm,
      warnYn:'N',
      rdmYn:'N',
      useLiter:'0.0',
      instcSpldmdAmt:'0',
      rlRdmAmt:'',
      dspsDt:getFormatToday(),
      admdspSeCd:'N',
      instcSpldmdTypeCd:'99',
      prcsSeCd:'0',
      totlAprvAmt:'0',
      rdmTrgtNocs:'0',
      exmnRegNocs:'1',
    }));

    // 차량선택시 행정처분을 혐의없음으로 초기화 하기에, 혐의없음 기준으로 값 세팅하도록 함
    settingStopYmd('N');
    settingInputEnable('N', false);

    setOpenVhclModal(false);
  }

  // 암호화된 주민번호 복호화 하여 받아오기
  const getDecVonrRrnoD = async (rprsvRrno:string) => {
    
    let result = '';

    try {
            
      const endpoint:string = '/fsm/ilg/isd/tx/getDecRrno?rrno=' + rprsvRrno;
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
    
      if (response && response.resultType === 'success' && response.data) {
        result = response.data;
      }
    } catch (error) {
      console.error('Error fetching data:', error)      
    }

    return result;
  }

  // 저장
  const save = async () => {

    if (dataValidation()) {     

      if (confirm('보조금지급정지카드의 신규등록 및 변경될 경우에는 정지시작일부터 해당차량의 수급자 및 거래카드는 보조금 지급정지 처리 됩니다.\n\n보조금지급정지 신규등록 및 변경을 하시겠습니까?')) {
        
        try {

          setLoadingBackdrop(true);

          const tempBgngYmd = trim(params.bgngYmd.replaceAll('-', ''));
          const tempEndYmd = trim(params.endYmd.replaceAll('-', ''));
          const tempRdmDt = trim(params.rdmDt.replaceAll('-', ''));
          const tempDspsDt = trim(params.dspsDt.replaceAll('-', ''));
          const tempStopBgngYmd = trim(params.stopBgngYmd.replaceAll('-', ''));
          const tempStopEndYmd = trim(params.stopEndYmd.replaceAll('-', ''));

          const endpoint:string = type === 'CREATE' ? '/fsm/ilg/isd/tx/createInstcSpldmdDsps' : '/fsm/ilg/isd/tx/updateInstcSpldmdDsps';    
          const body = {
            vhclNo:params.vhclNo,
            vonrNm:params.vonrNm,
            vonrRrno:params.vonrRrnoD,
            brno:params.brno,
            ttmKoiCd:params.ttmKoiCd,
            bzmnSeCd:params.bzmnSeCd,
            bgngYmd:tempBgngYmd ? tempBgngYmd : null,
            endYmd:tempEndYmd ? tempEndYmd : null,
            instcSpldmdTypeCd:params.instcSpldmdTypeCd,
            instcSpldmdRsnCn:params.instcSpldmdRsnCn,
            dlngNocs:params.dlngNocs,
            totlAprvAmt:params.totlAprvAmt,
            rdmTrgtNocs:params.rdmTrgtNocs,
            instcSpldmdAmt:params.instcSpldmdAmt,
            totlAsstAmt:params.totlAsstAmt,
            rdmActnAmt:params.rdmActnAmt,
            rdmDt:tempRdmDt ? tempRdmDt : null,
            rlRdmAmt:params.rlRdmAmt,
            dsclMthdCd:params.dsclMthdCd,
            dsclMthdEtcMttrCn:params.dsclMthdEtcMttrCn,
            ruleVltnCluCd:params.ruleVltnCluCd,
            ruleVltnCluEtcCn:params.ruleVltnCluEtcCn,
            admdspSeCd:params.admdspSeCd,
            exmnRegNocs:params.exmnRegNocs,
            dspsDt:tempDspsDt ? tempDspsDt : null,
            stopBgngYmd:tempStopBgngYmd ? tempStopBgngYmd : null,
            stopEndYmd:tempStopEndYmd ? tempStopEndYmd : null,
            rdmYn:params.rdmYn,
            moliatOtspyYn:params.moliatOtspyYn,
            admdspRsnCn:params.admdspRsnCn,
            oltPssrpPrtiYn:params.oltPssrpPrtiYn,
            oltPssrpPrtiOltNm:params.oltPssrpPrtiOltNm,
            oltPssrpPrtiBrno:params.oltPssrpPrtiBrno,
            locgovCd:params.locgovCd,
            ntsOtspyYn:params.ntsOtspyYn,
            warnYn:params.warnYn,
            locgovNm:params.locgovNm,
            exmnNo:type === 'UPDATE' ? params.exmnNo : null,
            giveStopSn:type === 'UPDATE' ? params.giveStopSn : null,
          }
    
          const response = await sendHttpRequest(type === 'CREATE' ? 'POST' : 'PUT', endpoint, body, true, { cache:'no-store' });
    
          if (response && response.resultType === 'success') {
            const msg = type === 'CREATE' ? '저장' : '수정';
            alert(msg + ' 되었습니다');
            reload();
            setOpen(false);
          } else {
            alert(response.message);            
          }

        } catch (error) {
          console.error('Error ::: ', error)
        } finally {
          setLoadingBackdrop(false);          
        }
      }
    }
  }

  // 데이터 검증
  const dataValidation = () => {

    if (allDisable) {      
      return startedDataValidation();        
    }

    if (!params.vhclNo) {
      alert('차량을 조회하여 차량번호를 선택해주세요.');
    } else if (!trim(params.brno)) {
      alert('차량을 조회하여 사업자번호를 입력해주세요.');
    } else if (!params.ttmKoiCd) {
      alert('당시유종을 선택해주세요.');
    } else if (!params.bzmnSeCd) {
      alert('차량을 조회하여 개인/법인 구분을 입력해주세요.');
    } else if (type === 'CREATE' && !params.bgngYmd) {
      alert('부정수급 시작기간을 입력 해주세요');
    } else if (type === 'UPDATE' && params.exmnNo.substring(0,2) === '99' && !params.bgngYmd) {
      alert('부정수급 시작기간을 입력 해주세요');
    } else if (params.bgngYmd.replaceAll('-', '').length !== 8) {
      alert('부정수급 시작기간 날짜형식이 잘못되었습니다.');
    } else if (params.bgngYmd.replaceAll('-', '') > getToday()) {
      alert('부정수급 시작기간은 금일보다 클 수 없습니다.');
    } else if (type === 'CREATE' && !params.endYmd) {
      alert('부정수급 종료기간을 입력 해주세요');
    } else if (type === 'UPDATE' && params.exmnNo.substring(0,2) === '99' && !params.endYmd) {
      alert('부정수급 종료기간을 입력 해주세요');
    } else if (params.endYmd.replaceAll('-', '').length !== 8) {
      alert('부정수급 종료기간 날짜형식이 잘못되었습니다.');
    } else if (params.endYmd.replaceAll('-', '') > getToday()) {
      alert('부정수급 종료기간은 금일보다 클 수 없습니다.');
    } else if (params.endYmd < params.bgngYmd) {
      alert('부정수급 종료기간은 시작기간보다 작을 수 없습니다.');
    } else if (!params.instcSpldmdTypeCd) {
      alert('부정수급유형을 선택 해주세요.');
    } else if (params.instcSpldmdTypeCd === '99' && !trim(params.instcSpldmdRsnCn)) {
      alert('부정수급유형 기타항목을 입력 해주세요.');
    } else if (!trim(params.dlngNocs)) {
      alert('거래건수를 입력해주세요.');
    } else if (!trim(params.totlAprvAmt)) {
      alert('거래금액을 입력해주세요.');
    } else if (!trim(params.rdmTrgtNocs)) {
      alert('부정수급건수를 입력해주세요.');
    } else if (!trim(params.instcSpldmdAmt)) {
      alert('부정수급액을 입력해주세요.');
    } else if (!trim(params.totlAsstAmt)) {
      alert('유가보조금을 입력해주세요.');
    } else if (params.rdmYn === 'Y' && trim(params.rdmActnAmt) === '') {
      alert('환수할금액을 입력해주세요.');
    } else if (params.rdmYn === 'Y' && !trim(params.rlRdmAmt)) {
      alert('환수한금액을 입력해주세요.');
    } else if (params.rdmYn === 'Y' && Number(params.rlRdmAmt) > Number(params.rdmActnAmt)) {
      alert('환수한금액이 환수할금액보다 큽니다. 다시 확인해주세요.');
    } else if ((params.admdspSeCd === 'H' || params.admdspSeCd == 'S') && !params.dsclMthdCd) {
      alert('적발방법을 선택 해주세요.');
    } else if (params.dsclMthdCd === 'S' && !trim(params.dsclMthdEtcMttrCn)) {
      alert('적발방법 기타항목을 입력 해주세요.');
    } else if ((params.admdspSeCd === 'H' || params.admdspSeCd == 'S') && !params.ruleVltnCluCd) {
      alert('규정위반조항을 선택 해주세요.');
    } else if (params.ruleVltnCluCd === '99' && !trim(params.ruleVltnCluEtcCn)) {
      alert('규정위반조항 기타항목을 입력 해주세요.');
    } else if ((params.admdspSeCd === 'H' || params.admdspSeCd == 'S') && !stopYmdValidation()) {
      // stopYmdValidation 에서 alert처리
    } else if (!trim(params.exmnRegNocs)) {
      alert('위반횟수를 입력 해주세요.');
    } else if (!params.dspsDt) {
      alert('행정처분일을 입력 해주세요.');
    } else if (params.dspsDt.replaceAll('-', '').length !== 8) {
      alert('행정처분일 날짜형식이 잘못되었습니다.');
    } else if ((params.admdspSeCd === 'H' || params.admdspSeCd == 'S') && params.stopBgngYmd.replaceAll('-', '').length !== 8) {
      alert('행정처분 시작일 날짜형식이 잘못되었습니다.');
    } else if ((params.admdspSeCd === 'H' || params.admdspSeCd == 'S') && params.stopEndYmd.replaceAll('-', '').length !== 8) {
      alert('행정처분 종료일 날짜형식이 잘못되었습니다.');
    } else if ((params.admdspSeCd === 'H' || params.admdspSeCd == 'S') && !params.oltPssrpPrtiYn) {
      alert('주유소 공모여부를 선택해주세요.');
    } else if (params.oltPssrpPrtiYn === 'Y' && !trim(params.oltPssrpPrtiOltNm)) {
      alert('주유소명을 입력 해주세요.');
    } else if (params.oltPssrpPrtiYn === 'Y' && !trim(params.oltPssrpPrtiBrno)) {
      alert('주유소 사업자등록번호를 입력 해주세요.');
    } else {
      return true;
    }

    return false;
  };

  // 수정시 행정처분 시작한 대상에 대한 벨리데이션
  const startedDataValidation = () => {
    
    if (params.rdmYn === 'Y' && trim(params.rdmActnAmt) === '') {
      alert('환수할금액을 입력해주세요.');
      return false;
    }

    if (params.rdmYn === 'Y' && Number(params.rlRdmAmt) > Number(params.rdmActnAmt)) {
      alert('환수금액이 환수한금액보다 작습니다. 다시 확인해주세요.');
      return false;
    }

    if (!stopEndYmdFlag) {
        
      const stopBgngYmd = params.stopBgngYmd.replaceAll('-', '');
      const stopEndYmd = params.stopEndYmd.replaceAll('-', '');

      if (!stopEndYmd) {
        alert('행정처분 종료일을 입력 해주세요');
      } else if (stopEndYmd <= getToday()) {
        alert('행정처분 종료일은 금일 이후로 가능합니다.');
      } else if (stopEndYmd <= stopBgngYmd) {
        alert('행정처분 종료일은 행정처분 시작일보다 같거나 빠를 수 없습니다.');
      } else {
        return true;
      }

      return false;
    }

    return true;
  }

  // 행정처분 코드값에 따른 행정처분 시작 및 종료일 검증 ( ** 6개월지급정지, 1년지급정지 만 검증 )
  const stopYmdValidation = () => {
      
    const stopBgngYmd = params.stopBgngYmd.replaceAll('-', '');
    const stopEndYmd = params.stopEndYmd.replaceAll('-', '');

    if (!stopBgngYmd) {
      alert('행정처분 시작일을 입력 해주세요');
    } else if (!stopEndYmd) {
      alert('행정처분 종료일을 입력 해주세요');
    } else if (stopBgngYmd <= getToday()) {
      alert('행정처분 시작일은 금일 이후로 가능합니다.');
    } else if (stopEndYmd <= stopBgngYmd) {
      alert('행정처분 종료일은 행정처분 시작일보다 같거나 빠를 수 없습니다.');
    } else {
      return true;
    }

    return false;
  };

  return (

    <Dialog
      fullWidth={false}
      maxWidth={'xl'}
      open={open}
      aria-modal={false}
    >
      <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className='input-label-display'>
            <h2>
              {type === 'UPDATE' ? '부정수급행정처리수정' : '부정수급행정처리등록'}
            </h2>
          </CustomFormLabel>
          <div className=' button-right-align'>
            
            <Button
              variant='contained'
              color='primary'
              onClick={save}
            >
              저장
            </Button>

            <Button
              variant='contained'
              color='dark'
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
          </div>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            m: 'auto',
            width: 'full',
          }}
        >
          <Box style={{minWidth:'1400px'}}>
            <BlankCard className='contents-card' title='상세 정보'>
              <TableContainer>
                <Table className='table table-bordered'>
                <colgroup>
                  <col style={{width: '8.5%' }} />
                  <col style={{width: '17.5%' }} />
                  <col style={{width: '7.5%' }} />
                  <col style={{width: '16.5%' }} />
                  <col style={{width: '10%' }} />
                  <col style={{width: '15%' }} />
                  <col style={{width: '10%' }} />
                  <col style={{width: '15%' }} />
                </colgroup>
                  <TableBody>
                    <TableRow>
                      <TableCell className='td-head td-left' scope='row' sx={{position:'relative'}}>
                        차량번호                        
                      </TableCell>
                      <TableCell>
                        <Grid container spacing={1}>
                          <Grid item xs={9.5} display="flex" alignItems="center">
                            <CustomTextField
                              id="ft-vhclNo"
                              name='vhclNo'
                              value={params.vhclNo}
                              fullWidth
                              readOnly={true}
                              disabled={true}
                            />
                          </Grid>
                          <Grid item xs={1} display="flex" alignItems="center">
                            {type === 'CREATE' ? (
                              <Button 
                                variant='contained' 
                                color='dark' 
                                onClick={() => setOpenVhclModal(true)} 
                                sx={{
                                  position:'absolute', 
                                  padding: '6px 9px'
                                }}
                              >
                                <IconSearch size={20}/>
                              </Button>
                            ) : null}                      
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        성명
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          id="ft-vonrNm"
                          name='vonrNm'
                          value={params.vonrNm}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={true}                          
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        주민등록번호
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          id="ft-vonrRrnoD"
                          name='vonrRrnoD'
                          value={params.vonrRrnoD}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        사업자등록번호
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          id="ft-brno"
                          name='brno'
                          value={params.brno}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={true}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        당시 유종
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-ttmKoiCd">당시 유종</CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'977'}
                          pName='ttmKoiCd'
                          pValue={params.ttmKoiCd}
                          handleChange={handleParamsChange}
                          addText='선택'
                          defaultValue={params.ttmKoiCd}
                          pDisabled={allDisable}
                          htmlFor={'sch-ttmKoiCd'}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        법인/개인
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-bzmnSeCd">법인/개인</CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'CBG0'}
                          pName='bzmnSeCd'
                          pValue={params.bzmnSeCd}
                          handleChange={handleParamsChange}
                          addText=' '
                          defaultValue={params.bzmnSeCd}
                          pDisabled={true}
                          htmlFor={'sch-bzmnSeCd'}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        부정수급 시작기간
                      </TableCell>
                      <TableCell className='td-left'>
                        <CustomTextField
                          type='date'
                          id="ft-bgngYmd"
                          name='bgngYmd'
                          value={params.bgngYmd}
                          onChange={handleParamsChange}
                          fullWidth
                          inputProps={{
                            max:getFormatToday()
                          }}
                          disabled={allDisable}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        부정수급 종료기간
                      </TableCell>
                      <TableCell className='td-left'>
                        <CustomTextField
                          type='date'
                          id="ft-endYmd"
                          name='endYmd'
                          value={params.endYmd}
                          onChange={handleParamsChange}
                          fullWidth
                          inputProps={{
                            max:getFormatToday()
                          }}
                          disabled={allDisable}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        부정수급유형
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-instcSpldmdTypeCd">부정수급유형</CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'363'}
                          pName='instcSpldmdTypeCd'
                          pValue={params.instcSpldmdTypeCd}
                          handleChange={handleParamsChange}
                          addText='선택'
                          defaultValue={params.instcSpldmdTypeCd}
                          pDisabled={allDisable}
                          htmlFor={'sch-instcSpldmdTypeCd'}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        기타
                      </TableCell>
                      <TableCell colSpan={5}>
                        <CustomTextField
                          id="ft-instcSpldmdRsnCn"
                          name='instcSpldmdRsnCn'
                          value={params.instcSpldmdRsnCn}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable ? allDisable : instcSpldmdRsnCnFlag}
                        />
                      </TableCell>                    
                    </TableRow>
                    
                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        거래건수
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-dlngNocs"
                          name='dlngNocs'
                          value={params.dlngNocs}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        거래금액
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-totlAprvAmt"
                          name='totlAprvAmt'
                          value={params.totlAprvAmt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        부정수급건수
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-rdmTrgtNocs"
                          name='rdmTrgtNocs'
                          value={params.rdmTrgtNocs}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        부정수급액
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-instcSpldmdAmt"
                          name='instcSpldmdAmt'
                          value={params.instcSpldmdAmt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        유가보조금
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-totlAsstAmt"
                          name='totlAsstAmt'
                          value={params.totlAsstAmt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        환수할금액
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-rdmActnAmt"
                          name='rdmActnAmt'
                          value={params.rdmActnAmt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable ? allDisable : rdmActnAmtFlag}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        환수한일자
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type='date'
                          id="ft-rdmDt"
                          name='rdmDt'
                          value={params.rdmDt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable ? allDisable : rdmDtFlag}
                          inputProps={{
                            max:getFormatToday()
                          }}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        환수한금액
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-rlRdmAmt"
                          name='rlRdmAmt'
                          value={params.rlRdmAmt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable ? allDisable : rlRdmAmtFlag}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </BlankCard>

            <BlankCard className='contents-card' title='조사 및 행정처리'>
              <TableContainer>
                <Table className='table table-bordered'>
                <colgroup>
                  <col style={{width: '10%' }} />
                  <col style={{width: '15%' }} />
                  <col style={{width: '10%' }} />
                  <col style={{width: '15%' }} />
                  <col style={{width: '10%' }} />
                  <col style={{width: '15%' }} />
                  <col style={{width: '10%' }} />
                  <col style={{width: '15%' }} />
                </colgroup>
                  <TableBody>                    
                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        적발방법
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-dsclMthdCd">적발방법</CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'364'}
                          pName='dsclMthdCd'
                          pValue={params.dsclMthdCd}
                          handleChange={handleParamsChange}
                          addText='선택'
                          pDisabled={allDisable ? allDisable : dsclMthdCdFlag}
                          defaultValue={params.dsclMthdCd}
                          htmlFor={'sch-dsclMthdCd'}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        기타
                      </TableCell>
                      <TableCell colSpan={5}>
                        <CustomTextField
                          id="ft-dsclMthdEtcMttrCn"
                          name='dsclMthdEtcMttrCn'
                          value={params.dsclMthdEtcMttrCn}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable ? allDisable : dsclMthdEtcMttrCnFlag}
                        />
                      </TableCell>                      
                    </TableRow>

                    <TableRow>                      
                      <TableCell className='td-head td-left' scope='row'>
                        규정 위반 조항
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-ruleVltnCluCd">규정 위반 조항</CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'365'}
                          pName='ruleVltnCluCd'
                          pValue={params.ruleVltnCluCd}
                          handleChange={handleParamsChange}
                          addText='선택'
                          pDisabled={allDisable ? allDisable : ruleVltnCluCdFlag}
                          defaultValue={params.ruleVltnCluCd}
                          htmlFor={'sch-ruleVltnCluCd'}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        기타
                      </TableCell>
                      <TableCell colSpan={5}>
                        <CustomTextField
                          id="ft-ruleVltnCluEtcCn"
                          name='ruleVltnCluEtcCn'
                          value={params.ruleVltnCluEtcCn}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable ? allDisable : ruleVltnCluEtcCnFlag}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>                      
                      <TableCell className='td-head td-left' scope='row'>
                        행정처분
                      </TableCell>
                      <TableCell colSpan={7}>
                        <AdmdspSeRadio
                          admdspSeCd={params.admdspSeCd}
                          onChange={allDisable ? () => null : handleParamsChange}
                        />                        
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        위반횟수
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField
                          id="ft-exmnRegNocs"
                          name='exmnRegNocs'
                          value={params.exmnRegNocs}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        행정처분일
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type='date'
                          id="dspsDt"
                          name='dspsDt'
                          value={params.dspsDt}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={allDisable}
                        />
                      </TableCell>                      
                      <TableCell className='td-head td-left' scope='row'>
                        행정처분 시작일
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          type='date' 
                          id="ft-stopBgngYmd"
                          name='stopBgngYmd' 
                          value={params.stopBgngYmd} 
                          onChange={handleParamsChange}                           
                          fullWidth
                          disabled={allDisable ? allDisable : stopBgngYmdFlag}
                          inputProps={{
                            min:getForamtAddDay(1)
                          }}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        행정처분 종료일
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          type='date' 
                          id="stopEndYmd"
                          name='stopEndYmd' 
                          value={params.stopEndYmd}
                          onChange={handleParamsChange}
                          fullWidth
                          disabled={stopEndYmdFlag}
                          inputProps={{
                            min:getForamtAddDay(2)
                          }}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className='td-head td-left' scope='row'>
                        환수금
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-rdmYn">환수여부선택</CustomFormLabel>
                        <CustomCheckbox 
                          id="ft-rdmYn"
                          name='rdmYn'
                          value={params.rdmYn}
                          onChange={rdmYnHandleChange}
                          checked={params.rdmYn === 'N'}
                          readOnly={allDisable ? allDisable : rdmYnFalg}
                        />
                        <span
                          className='MuiTypography-root MuiTypography-body1 MuiFormControlLabel-label mui-17uefe-MuiTypography-root'
                          style={{color:rdmYnFalg ? 'gray' : 'black'}}
                        >
                          환수안함
                        </span>
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        환수금액
                      </TableCell>
                      <TableCell className='td-right'>
                        <CustomTextField 
                          id="ft-rdmActnCmt"
                          name='rdmActnAmt'
                          value={params.rdmActnAmt} 
                          onChange={handleParamsChange} 
                          fullWidth
                          disabled={rdmActnAmtFlag}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        국토부보조금
                      </TableCell>
                      <TableCell colSpan={3}>   
                        <CustomFormLabel className="input-label-none" htmlFor="ft-moliatOtspyYn">국토부보조금지급선택</CustomFormLabel>                     
                        <CustomCheckbox 
                          id="ft-moliatOtspyYn"
                          name='moliatOtspyYn'
                          value={params.moliatOtspyYn}
                          onChange={moliatOtspyYnHandleChange}
                          checked={params.moliatOtspyYn === 'Y'}
                          readOnly={allDisable ? allDisable : moliatOtspyYnFlag}
                        />
                        <span
                          className='MuiTypography-root MuiTypography-body1 MuiFormControlLabel-label mui-17uefe-MuiTypography-root'
                          style={{color:moliatOtspyYnFlag ? 'gray' : 'black'}}
                        >
                          미지급
                        </span>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow style={{height: '100px'}}>
                      <TableCell className='td-head td-left' scope='row' >
                        조사내용 및<br/>행정처분사유
                      </TableCell>
                      <TableCell colSpan={7}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-admdspRsnCn">조사내용 및 행정처분사유</CustomFormLabel>
                        <textarea className="MuiTextArea-custom"
						              id="ft-admdspRsnCn"
                          name='admdspRsnCn'
                          value={params.admdspRsnCn}
                          onChange={handleParamsChange}
                          // multiline
                          rows={5}
                          style={{width:'100%', resize:'none'}}
                        />
                      </TableCell>
                    </TableRow>                    

                    <TableRow>                      
                      <TableCell className='td-head td-left' scope='row'>
                        주유소 공모
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-oltPssrpPrtiYn">주유소 공모</CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'366'}
                          pName='oltPssrpPrtiYn'
                          pValue={params.oltPssrpPrtiYn}
                          handleChange={handleParamsChange}
                          addText='선택'
                          pDisabled={allDisable ? allDisable : oltPssrpPrtiYnFlag}
                          defaultValue={params.oltPssrpPrtiYn}
                          htmlFor={'sch-oltPssrpPrtiYn'}
                        />
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row' sx={{position:'relative'}}>
                        주유소명            
                      </TableCell>
                      <TableCell colSpan={3}>
                        <Grid container spacing={1}>
                          <Grid item xs={10.9} display="flex" alignItems="center">
                            <CustomTextField 
                              id="ft-oltPssrpPrtiOltNm"
                              name='oltPssrpPrtiOltNm' 
                              value={params.oltPssrpPrtiOltNm} 
                              onChange={handleParamsChange} 
                              fullWidth
                              disabled={allDisable ? allDisable : oltPssrpPrtiOltNmFlag}
                            />
                          </Grid>
                          <Grid item xs={1} display="flex" alignItems="center">
                            {!allDisable && params.oltPssrpPrtiYn === 'Y' ? (
                              <Button 
                                variant='contained' 
                                color='dark' 
                                onClick={() => setFrcsOpen(true)} 
                                sx={{
                                  position:'absolute', 
                                  padding: '6px 9px'
                                }}
                              >
                                <IconSearch size={20}/>
                              </Button>
                            ) : null}                      
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell className='td-head td-left' scope='row'>
                        사업자등록번호
                      </TableCell>
                      <TableCell>
                        <CustomTextField 
                          id="ft-oltPssrpPrtiBrno"
                          name='oltPssrpPrtiBrno' 
                          value={params.oltPssrpPrtiBrno} 
                          onChange={handleParamsChange} 
                          fullWidth
                          disabled={allDisable ? allDisable : oltPssrpPrtiBrnoFlag}
                          inputProps={{
                            maxLength:10
                          }}
                        />
                      </TableCell>                      
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </BlankCard>
          </Box>
        </Box>

        {/* 차량검색모달 */}
        {openVhclModal ? (
          <VhclSearchModal 
            open={openVhclModal} 
            onRowClick={handleClickVhclRow} 
            onCloseClick={() => setOpenVhclModal(false)}
          />
        ) : null}        

        {/* 주유소 검색모달 */}
        {frcsOpen ? (
          <TxOilStationModal
            open={frcsOpen}
            setOpen={setFrcsOpen}
            rowClick={frcsModalRowClick}
          />
        ) : null}

        {/* 로딩 */}
        <LoadingBackdrop open={loadingBackdrop} />

      </DialogContent>
    </Dialog>
  );
}

export default TxModalContent;