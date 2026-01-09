import React, { useEffect, useState } from 'react';

import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import VhclSearchModal, { VhclRow } from '@/app/components/tx/popup/VhclSearchModal';
import { formatDate } from '@/utils/fsms/common/convert';
import { rrNoFormatter } from '@/utils/fsms/common/util';
import { CustomFormLabel, CustomRadio, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, FormControlLabel, Grid, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { SelectItem } from 'select';

import OilStationModal from '@/app/components/tr/popup/OilStationModal';
import { useDispatch, useSelector } from '@/store/hooks';
import { openOilStationModal } from '@/store/popup/OilStationSlice';
import { AppState } from '@/store/store';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode';
import { IconSearch } from '@tabler/icons-react';
import { Row } from './TrPage';
import { getDateRange, getToday, getTomorrow } from '@/utils/fsms/common/comm';
import { getFormatTomorrow } from '@/utils/fsms/common/comm'; 

// interface Parameters {
//   no: string;
//   hstrySn: string;
//   locgovCd: string;
//   locgovNm: string;
//   vhclNo: string;
//   vonrNm: string;
//   bizGb: string;
//   bzmnSeCd: string;
//   tpbizSeCd: string;
//   droperYn: string;
//   apvlCnt: string;
//   rdmAmt: string;
//   totlAprvAmt: string;
//   totlAsstAmt: string;
//   rdmActnAmt: string;
//   rdmTrgtNocs: string;
//   exmnRsltCn: string;
//   exmnRegYn: string;
//   exmnRegInptId: string;
//   exmnRegInptDt: string;
//   exmnRegMdfcnId: string;
//   exmnRegMdfcnDt: string;
//   rdmYn: string;
//   dspsDt: string;
//   admdspSeCd: string;
//   admdspRsnCn: string;
//   admdspBgngYmd: string;
//   admdspEndYmd: string;
//   oltPssrpPrtiYn: string;
//   unlawStrctChgYnCd: string;
//   dsclMthdCd: string;
//   dsclMthdNm: string;
//   pbadmsPrcsYn: string;
//   pbadmsPrcsRegId: string;
//   pbadmsPrcsRegDt: string;
//   pbadmsPrcsMdfcnId: string;
//   pbadmsPrcsMdfcnDt: string;
//   aprvYm: string;
//   giveStopSn: string;
//   rgtrId: string;
//   mdfrId: string;
//   regDt: string;
//   vonrRrno: string;
//   ruleVltnCluCd: string;
//   ruleVltnCluNm: string;
//   oltPssrpPrtiOltNm: string;
//   oltPssrpPrtiBrno: string;
//   dsclMthdEtcMttrCn: string;
//   ruleVltnCluEtcCn: string;
//   rdmDt: string;
//   vonrBrno: string;
//   koiCd: string;
//   vhclTonCd: string;
//   instcSpldmdTypeCd: string;
//   dlngDsctnInptSeCd: string;
//   useLiter: string;
//   instcSpldmdAmt: string;
//   warnYn: string;
//   giveStopYn: string;
//   prcsSeCd: string;
//   handleNm: string;
//   delYn: string;
//   rlRdmAmt: string;
//   dspsPrdCd: string;
//   cmlcAcstnYn: string;
//   rdmActnYmd: string;
//   stopBgngYmd: string;
//   endYmd: string;
//   subInputId: string;
//   subInputDt: string;
//   subUpdateId: string;
//   subUpdateDt: string;
//   admdspNotieDspsTtl: string;
//   admdspNotieAddr: string;
//   admdspNotieClmPrdCn: string;
//   admdspNotieDspsRsnCn: string;
//   admdspNotieLglBssCn: string;
//   admdspNotieClmProcssCn: string;
//   admdspNotieRegId: string;
//   admdspNotieMdfcnYmd: string;
//   admdspNotieRgnMayerNm: string;
//   trsmYn: string;
//   cpeaChckYn: string;
//   cpeaChckCyclVl: string;
//   exmnNo: string;
//   dlngNocs: string;
//   vhclRestrtYmd: string;
//   stopEndYmd: string;
//   exmnRegNocs: string;
//   brno: string;
//   ttmKoiCd: string;
//   bgngYmd: string;
//   instcSpldmdRsnCn: string;
//   moliatOtspyYn: string;
//   stopChangeRsn: string;
//   pbadmsPrcsSeCd: string;
//   chargeYn: string;
//   vonrRrnoS: string;
//   vonrRrnoD: string;
//   tpbizCd: string;
//   koiNm: string;
//   vhclTonNm: string;
//   droperNm: string;
//   tbizSeNm: string;
//   tbizNm: string;
//   bzmnSeNm: string;
//   instcSpldmdTypeNm: string;
//   prcsSeNm: string;
//   frcsBrno: string;
//   frcsNm: string;
//   frcsTelno: string;
//   frcsAddr: string;
//   cinputDt: string;
//   ntsOtspyYn: string;
// }

interface ModalProps {
  formType: "CREATE" | "UPDATE";
  reloadFn: () => void;
  data: Row | null
}

const ModalContent = (props : ModalProps) => {
  const { formType, reloadFn, data } = props;

  const [openVhclModal, setOpenVhclModal] = useState<boolean>(false);
  const [admdspSeCdItems, setAdmdspSeCdItems] = useState<any[]>([]);
  const [params, setParams] = useState</*Row*/any>({
    no: '',
    hstrySn: '',
    locgovCd: '',
    locgovNm: '',
    vhclNo: '',
    vonrNm: '',
    bizGb: '',
    bzmnSeCd: '',
    tpbizSeCd: '',
    droperYn: '',
    apvlCnt: '',
    rdmAmt: '',
    totlAprvAmt: '',
    totlAsstAmt: '',
    rdmActnAmt: '',
    rdmTrgtNocs: '',
    exmnRsltCn: '',
    exmnRegYn: '',
    exmnRegInptId: '',
    exmnRegInptDt: '',
    exmnRegMdfcnId: '',
    exmnRegMdfcnDt: '',
    rdmYn: 'N',
    dspsDt: '',
    admdspSeCd: 'N',
    admdspRsnCn: '',
    admdspBgngYmd: '',
    admdspEndYmd: '',
    oltPssrpPrtiYn: '',
    unlawStrctChgYnCd: '',
    dsclMthdCd: '',
    dsclMthdNm: '',
    pbadmsPrcsYn: '',
    pbadmsPrcsRegId: '',
    pbadmsPrcsRegDt: '',
    pbadmsPrcsMdfcnId: '',
    pbadmsPrcsMdfcnDt: '',
    aprvYm: '',
    giveStopSn: '',
    rgtrId: '',
    mdfrId: '',
    regDt: '',
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
    warnYn: '',
    giveStopYn: '',
    prcsSeCd: '',
    handleNm: '',
    delYn: '',
    rlRdmAmt: '',
    dspsPrdCd: '',
    cmlcAcstnYn: '',
    rdmActnYmd: '',
    stopBgngYmd: '',
    endYmd: '',
    subInputId: '',
    subInputDt: '',
    subUpdateId: '',
    subUpdateDt: '',
    admdspNotieDspsTtl: '',
    admdspNotieAddr: '',
    admdspNotieClmPrdCn: '',
    admdspNotieDspsRsnCn: '',
    admdspNotieLglBssCn: '',
    admdspNotieClmProcssCn: '',
    admdspNotieRegId: '',
    admdspNotieMdfcnYmd: '',
    admdspNotieRgnMayerNm: '',
    trsmYn: '',
    cpeaChckYn: '',
    cpeaChckCyclVl: '',
    exmnNo: '',
    dlngNocs: '',
    vhclRestrtYmd: '',
    stopEndYmd: '',
    exmnRegNocs: '',
    brno: '',
    ttmKoiCd: '',
    ttmKoiNm: '',
    bgngYmd: '',
    instcSpldmdRsnCn: '',
    moliatOtspyYn: 'N',
    stopChangeRsn: '',
    pbadmsPrcsSeCd: '',
    chargeYn: '',
    vonrRrnoS: '',
    vonrRrnoD: '',
    tpbizCd: '',
    koiNm: '',
    vhclTonNm: '',
    droperNm: '',
    tbizSeNm: '',
    tbizNm: '',
    bzmnSeNm: '',
    instcSpldmdTypeNm: '',
    prcsSeNm: '',
    frcsBrno: '',
    frcsNm: '',
    frcsTelno: '',
    frcsAddr: '',
    cinputDt: '',
    ntsOtspyYn: ''
  });

  const dispatch = useDispatch()
  const oilStationInfo = useSelector((state : AppState ) => state.oilStationInfo)

  // 행정처분에 따른 input disable state
  const [disableFlag, setDisableFlag] = useState<boolean>(true);

  useEffect(() => {
    // 행정처분 공통코드 불러오기 ( 라디오버튼 렌더링용 )
    getCodesByGroupNm('367').then(list => setAdmdspSeCdItems(list));

    if(formType === 'UPDATE' && data) {
      setParams({
        ...data,
        dspsDt: formatDate(data.dspsDt),
        bgngYmd: formatDate(data.bgngYmd),
        endYmd: formatDate(data.endYmd),
        rdmActnYmd: formatDate(data.rdmActnYmd),
        stopBgngYmd: formatDate(data.stopBgngYmd),
        stopEndYmd: formatDate(data.stopEndYmd),
      });
    }
  }, [])

  useEffect(() => {
    console.log('oilStationInfo :: ', oilStationInfo);
/*
    setParams((prev) => ({
      ...prev,
      oltPssrpPrtiBrno: oilStationInfo.frcsBrnoOSM,
      oltPssrpPrtiOltNm: oilStationInfo.frcsNmOSM,
    }))
    */

  }, [oilStationInfo])

  useEffect(() => {
    // (N:협의없음, W:경고, H:6개월지급정지, S:1년지급정지, A:행정처분, B:지금정지)
    
    // 혐의없음, 경고는 적발방법 부터 아래로 다 비활성화
    const value = formType === 'CREATE' ? params.admdspSeCd : data?.admdspSeCd;

    if(value === 'N' || value === 'W' || !value) {
      setDisableFlag(true)
      setParams({
        ...params,
        dsclMthdCd: '',
        dsclMthdEtcMttrCn: '',
        ruleVltnCluCd: '',
        ruleVltnCluEtcCn: '',
        dspsDt: '',
        exmnRegNocs: '',
        rdmYn: '',
        rdmActnAmt: '',
        stopBgngYmd: '',
        stopEndYmd: '',
        admdspRsnCn: '',
        oltPssrpPrtiYn: '',
        oltPssrpPrtiOltNm: '',
        oltPssrpPrtiBrno: '',
        moliatOtspyYn: 'N'
      })
    }else {
      setDisableFlag(false)

      // 6개월 지급정지 시 행정처분일 세팅
      if(formType === 'CREATE') {
        if(value === 'H') {
          /*
          setParams((prev) => ({
            ...prev,
            stopBgngYmd: getFormatTomorrow(),
            stopEndYmd: getDateRange('d', -181).startDate
          }))
          */
        }
  
        // 1년 지급정지 시 행정처분일 세팅
        if(value === 'S') {
          /*
          setParams((prev) => ({
            ...prev,
            stopBgngYmd: getFormatTomorrow(),
            stopEndYmd: getDateRange('d', -366).startDate
          }))
          */
        }
      }
    }

  }, [params.admdspSeCd])

  useEffect(() => {
    console.log("PARAMS ::: ", params, " FORM ::: ", formType );
  }, [params])


  const handleParamsChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target
/*
    if (event.target instanceof HTMLInputElement && name === 'moliatOtspyYn') {
      const isChecked = event.target.checked;

      setParams(prev => ({ ...prev, [name]: isChecked ? 'Y' : 'N' }));
    } else {
      setParams(prev => ({ ...prev, [name]: value }));
    }
      */
  }
  
  const handleClickVhclRow = (row :VhclRow) => {
    console.log("VHCL ::: " , row);
    /*
    setParams((prev) => ({
      ...prev,
      locgovCd: row.locgovCd,
      locgovNm: row.locgovNm,
      vhclNo: row.vhclNo,
      vonrNm: row.rprsvNm,
      brno: row.brno,
      vonrRrno: row.rprsvRrno,
      vonrRrnoS: row.rprsvRrno
    }))
      */
    setOpenVhclModal(false);
  }

  const openOilStationInfoModal= async () => {
    dispatch(openOilStationModal())
  }
  
  const sendData = async () => {

    if(params.instcSpldmdRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
      alert('기타 내용을 30자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if(params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 60){
      alert('조사내용 및 행정처분사유를 60자리 이하로 입력해주시기 바랍니다.')
      return
    }

    try {
      let endpoint:string = 
        formType === 'CREATE' ? `/fsm/ilg/isd/tx/createInstcSpldmdDsps` : `/fsm/ilg/isd/tx/updateInstcSpldmdDsps`

      let body = {
        locgovCd: params.locgovCd,
        locgovNm: params.locgovNm,
        vhclNo: params.vhclNo,
        vonrNm: params.vonrNm,
        vonrRrno: params.vonrRrno,
        brno: params.brno,
        ttmKoiCd: params.ttmKoiCd,
        bzmnSeCd: params.bzmnSeCd,
        instcSpldmdTypeCd: params.instcSpldmdTypeCd,
        instcSpldmdTypeCn: params.instcSpldmdRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        bgngYmd: params.bgngYmd.replaceAll('-', ''),
        endYmd: params.endYmd.replaceAll('-', ''),
        dlngNocs: params.dlngNocs,
        totlAprvAmt: params.totlAprvAmt,
        rdmTrgtNocs: params.rdmTrgtNocs,
        instcSpldmdAmt: params.instcSpldmdAmt,
        totlAsstAmt: params.totlAsstAmt,
        rdmAmt: params.rdmAmt,
        rdmDt: params.rdmDt.replaceAll('-', ''),
        rlRdmAmt: params.rlRdmAmt,
        dsclMthdCd: params.dsclMthdCd,
        dsclMthdEtcMttrCn: params.dsclMthdEtcMttrCn,
        ruleVltnCluCd: params.ruleVltnCluCd,
        ruleVltnCluEtcCn: params.ruleVltnCluEtcCn,
        dspsDt: params.rdmDt.replaceAll('-', ''),
        exmnRegNocs: params.exmnRegNocs,
        admdspSeCd: params.admdspSeCd,
        rdmYn: params.rdmYn,
        rdmActnAmt: params.rdmActnAmt,
        stopBgngYmd: params.stopBgngYmd.replaceAll('-', ''),
        stopEndYmd: params.stopEndYmd.replaceAll('-', ''),
        admdspRsnCn: params.admdspRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        oltPssrpPrtiYn: params.oltPssrpPrtiYn,
        oltPssrpPrtiOltNm: params.oltPssrpPrtiOltNm,
        oltPssrpPrtiBrno: params.oltPssrpPrtiBrno,
        moliatOtspyYn: params.moliatOtspyYn
      }

      const response = await sendHttpRequest(formType === 'CREATE' ? 'POST' : 'PUT', endpoint, body, true, {
        cache:'no-store'
      })

      if(response && response.resultType === 'success') {
        alert(response.message);
        reloadFn();
      }else {
        console.log(response.message);
      }

    }catch(error) {
      console.error('Error ::: ', error)
    }
  }

  const submitData = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    sendData();
  }

  return (
    <Box component='form' id='send-data' onSubmit={submitData} style={{minWidth:'1400px'}}>
      <TableContainer>
        <Table className="table table-bordered">
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
              <TableCell className="td-head td-left" scope="row">
                차량번호
              </TableCell>
              <TableCell>
                <Grid container spacing={2}>
                  <Grid item xs={7.5} display="flex" alignItems="center">
                    {params.vhclNo}
                  </Grid>
                  <Grid item xs={4} display="flex" alignItems="center">
                    {formType === 'CREATE' ? 
                      <Button variant='contained' color='dark' onClick={() => setOpenVhclModal(true)}>선택</Button>
                    : ''}
                  </Grid>
                  <VhclSearchModal 
                    open={openVhclModal} 
                    onRowClick={handleClickVhclRow} 
                    onCloseClick={() => setOpenVhclModal(false)}
                  />
                </Grid>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                소유자명
              </TableCell>
              <TableCell>
                <CustomTextField name='vonrNm' value={params.vonrNm} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                주민등록번호
              </TableCell>
              <TableCell>
                {rrNoFormatter(params.vonrRrnoS)}
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                사업자등록번호
              </TableCell>
              <TableCell>
                <CustomTextField name='brno' value={params.brno} onChange={handleParamsChange} fullWidth/>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                당시 유종
              </TableCell>
              <TableCell>
                <CommSelect
                  cdGroupNm={'599'}
                  pName='ttmKoiCd'
                  pValue={params.ttmKoiCd}
                  handleChange={handleParamsChange}
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                법인/개인
              </TableCell>
              <TableCell>
                <CommSelect
                  cdGroupNm={'140'}
                  pName='bzmnSeCd'
                  pValue={params.bzmnSeCd}
                  handleChange={handleParamsChange}
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                부정수급유형
              </TableCell>
              <TableCell>
                <CommSelect
                  cdGroupNm={'363'}
                  pName='instcSpldmdTypeCd'
                  pValue={params.instcSpldmdTypeCd}
                  handleChange={handleParamsChange}
                  addText='선택'
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                기타
              </TableCell>
              <TableCell >
                <CustomTextField name='instcSpldmdRsnCn' value={params.instcSpldmdRsnCn} onChange={handleParamsChange} disabled={params.instcSpldmdTypeCd !== '99'} />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                부정수급 거래 기간
              </TableCell>
              <TableCell colSpan={7} className='td-left'>
                <CustomTextField type='date' name='bgngYmd' value={params.bgngYmd} onChange={handleParamsChange}/>
                ~
                <CustomTextField type='date' name='endYmd' value={params.endYmd} onChange={handleParamsChange}/>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                거래건수
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='dlngNocs' value={params.dlngNocs} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                거래금액
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='totlAprvAmt' value={params.totlAprvAmt} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                부정수급건수
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='rdmTrgtNocs' value={params.rdmTrgtNocs} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                부정수급액
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='instcSpldmdAmt' value={params.instcSpldmdAmt} onChange={handleParamsChange} fullWidth/>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                유가보조금
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='totlAsstAmt' value={params.totlAsstAmt} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                환수할금액
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='rdmAmt' value={params.rdmAmt} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                환수한일자
              </TableCell>
              <TableCell>
                <CustomTextField type='date' name='rdmDt' value={params.rdmDt} onChange={handleParamsChange} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                환수한금액
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='rlRdmAmt' value={params.rlRdmAmt} onChange={handleParamsChange} fullWidth/>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                적발방법
              </TableCell>
              <TableCell>
                <CommSelect
                  cdGroupNm={'160'}
                  pName='dsclMthdCd'
                  pValue={params.dsclMthdCd}
                  handleChange={handleParamsChange}
                  addText='선택'
                  pDisabled={disableFlag}
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                기타
              </TableCell>
              <TableCell>
                <CustomTextField name='dsclMthdEtcMttrCn' value={params.dsclMthdEtcMttrCn} onChange={handleParamsChange} disabled={disableFlag || params.dsclMthdCd !== 'S'} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                규정 위반 조항
              </TableCell>
              <TableCell>
                <CommSelect
                  cdGroupNm={'365'}
                  pName='ruleVltnCluCd'
                  pValue={params.ruleVltnCluCd}
                  handleChange={handleParamsChange}
                  addText='선택'
                  pDisabled={disableFlag}
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                기타
              </TableCell>
              <TableCell>
                <CustomTextField name='ruleVltnCluEtcCn' value={params.ruleVltnCluEtcCn} onChange={handleParamsChange} disabled={disableFlag || params.ruleVltnCluCd !== '99'} fullWidth/>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                행정처분일
              </TableCell>
              <TableCell>
                <CustomTextField type='date' name='dspsDt' value={params.dspsDt} onChange={handleParamsChange} disabled={disableFlag} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                위반횟수
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField type='number' name='exmnRegNocs' value={params.exmnRegNocs} onChange={handleParamsChange} disabled={disableFlag} fullWidth/>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                행정처분
              </TableCell>
              <TableCell colSpan={3}>
                <RadioGroup
                    row
                    id="chk_admdspSeCd"
                    name="admdspSeCd"
                    className="mui-custom-radio-group"
                    value={params.admdspSeCd}
                    onChange={handleParamsChange}
                  >
                    {admdspSeCdItems.map((item) => (
                      <FormControlLabel
                        key={item.cdNm}
                        control={<CustomRadio id={item.cdNm} value={item.cdNm} />}
                        label={item.cdKornNm}
                      />
                    ))}
                </RadioGroup>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                환수금
              </TableCell>
              <TableCell>
                <RadioGroup
                  row
                  id="chk_rdmYn"
                  className="mui-custom-radio-group"
                  name='rdmYn'
                  value={params.rdmYn}
                  onChange={handleParamsChange}
                >
                  <FormControlLabel
                    control={<CustomRadio id="chk_Y" value="Y" disabled={disableFlag} />}
                    label="환수"
                  />
                  <FormControlLabel
                    control={<CustomRadio id="chk_N" value="N" disabled={disableFlag} />}
                    label="환수안함"
                  />
                </RadioGroup>
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                환수금액
              </TableCell>
              <TableCell className="td-right">
                <CustomTextField 
                  type='number' 
                  name='rdmActnAmt' 
                  value={params.rdmActnAmt} 
                  onChange={handleParamsChange} 
                  disabled={disableFlag || params.rdmYn !== 'Y'} 
                  fullWidth
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                행정처분 시작일
              </TableCell>
              <TableCell>
                <CustomTextField 
                  type='date' 
                  name='stopBgngYmd' 
                  value={params.stopBgngYmd} 
                  onChange={handleParamsChange} 
                  disabled={disableFlag}
                  inputProps={{min: formType === 'CREATE' ? getFormatTomorrow() : formatDate(data?.stopBgngYmd)}}
                  fullWidth
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                행정처분 종료일
              </TableCell>
              <TableCell>
                <CustomTextField 
                  type='date' 
                  name='stopEndYmd' 
                  value={params.stopEndYmd} 
                  onChange={handleParamsChange} 
                  disabled={disableFlag} 
                  fullWidth
                />
              </TableCell>
            </TableRow>
            
            <TableRow style={{height: '100px'}}>
              <TableCell className="td-head td-left" scope="row" >
                조사내용 및<br/>행정처분사유
              </TableCell>
              <TableCell colSpan={7}>
                <CustomFormLabel className="input-label-none" htmlFor="admdspRsnCn">조사내용 및 행정처분사유</CustomFormLabel>
                <textarea className="MuiTextArea-custom"
                  id="admdspRsnCn"
                  name='admdspRsnCn' 
                  value={params.admdspRsnCn} 
                  onChange={handleParamsChange} 
                  disabled={disableFlag} 
                  // multiline 
                  rows={5} 
                  style={{width:'80%'}}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head td-left" scope="row">
                주유소 공모
              </TableCell>
              <TableCell>
               <CommSelect
                  cdGroupNm={'157'}
                  pName='oltPssrpPrtiYn'
                  pValue={params.oltPssrpPrtiYn}
                  handleChange={handleParamsChange}
                  pDisabled={disableFlag}
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row" sx={{position:'relative'}}>
                주유소명
                <Button 
                  id=''
                  variant='contained' 
                  color='dark' 
                  onClick={openOilStationInfoModal} 
                  disabled={disableFlag || params.oltPssrpPrtiYn !== 'Y'}
                  sx={{
                    position:'absolute', 
                    right:'7px', 
                    bottom:'7px', 
                    padding: '6px 7px'
                  }}
                >
                  <IconSearch size={20}/>
                </Button>
              </TableCell>
              <TableCell>
                {params.oltPssrpPrtiOltNm}
                <OilStationModal />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                사업자등록번호
              </TableCell>
              <TableCell>
                <CustomTextField 
                  type='number'
                  name='oltPssrpPrtiBrno' 
                  value={params.oltPssrpPrtiBrno} 
                  onChange={handleParamsChange} 
                  disabled={disableFlag || params.oltPssrpPrtiYn !== 'Y'} 
                  fullWidth
                />
              </TableCell>
              <TableCell className="td-head td-left" scope="row">
                국토부보조금
              </TableCell>
              <TableCell>
                <FormControlLabel 
                  label="미지급" 
                  control={
                    <CustomCheckbox 
                      name='moliatOtspyYn'
                      value={params.moliatOtspyYn}
                      onChange={handleParamsChange}
                    />
                  } 
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ModalContent;