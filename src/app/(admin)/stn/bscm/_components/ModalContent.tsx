'use client'

import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from "@/utils/fsms/fsm/mui-imports";
import { Button, Dialog, DialogContent, Box, TableContainer, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableRow, DialogProps } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SelectItem } from "select";
import { ModalRow } from "../page";
import { sendHttpRequest } from "@/utils/fsms/common/apiUtils";
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'


interface FormModalProps {
  buttonLabel?: string;
  title: string;
  isOpen: boolean
  setOpen: (isOpen: boolean) => void;
  data: ModalRow| null;
  size?: DialogProps['maxWidth'] | 'lg';
  reload: () => void;
}

type params = {
      seqNo: string
      locgovCd: string
      locgovNm: string
      vhclNo: string
      brno: string
      bzentyNm: string
      koiCd: string
      koiNm: string
      vhclSeCd: string
      vhclSeNm: string
      dsgnBgngYmd: string
      endYmd: string
      rgtrId: string
      regDt: string
      mdfrId: string
      mdfcnDt: string
}


export default function FormModal(props : FormModalProps) {
  const { buttonLabel, title, data, size, isOpen, setOpen,reload} = props;
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩

  const [params, setParams] = useState<params>(
    {
      seqNo: "",
      locgovCd: "",
      locgovNm: "",
      vhclNo: "",
      brno: "",
      bzentyNm: "",
      koiCd: "",
      koiNm: "",
      vhclSeCd: "",
      vhclSeNm: "",
      dsgnBgngYmd: "",
      endYmd: "",
      rgtrId: "",
      regDt: "",
      mdfrId: "",
      mdfcnDt: "",
    }
  );

  useEffect(() => {
    if (data && isOpen) {
      setParams({
        seqNo: data.seqNo,
        locgovCd: data.locgovCd,
        locgovNm: data.locgovNm,
        vhclNo: data.vhclNo,
        brno: data.brno,
        bzentyNm: data.bzentyNm,
        koiCd: data.koiCd,
        koiNm: data.koiNm,
        vhclSeCd: data.vhclSeCd,
        vhclSeNm: data.vhclSeNm,
        dsgnBgngYmd: getDateFormatYMD(data.dsgnBgngYmd),
        endYmd: getDateFormatYMD(data.endYmd),
        rgtrId: data.rgtrId,
        regDt: data.regDt,
        mdfrId: data.mdfrId,
        mdfcnDt: data.mdfcnDt
      })
    } else {
      setParams({
        seqNo: '',
        locgovCd: '',
        locgovNm: '',
        vhclNo: '',
        brno: '',
        bzentyNm: '',
        koiCd: '',
        koiNm: '',
        vhclSeCd: '',
        vhclSeNm: '',
        dsgnBgngYmd: '',
        endYmd: '',
        rgtrId: '',
        regDt: '',
        mdfrId: '',
        mdfcnDt: '',
      })
    }
  }, [isOpen])
  

  const handleClose = () => {
    setOpen(false);
     };

    const handleSearchChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const { name, value } = event.target
             setParams((prev) => ({ ...prev, [name]: value }))
    }

  const createSbsidyRcpmnyAcnut = async () => {
      let endpoint: string =  `/fsm/stn/bscm/bs/updateBusSeytCarMng`;

      let body = {
        dsgnBgngYmd: params.dsgnBgngYmd.replaceAll('-',''),
        endYmd: params.endYmd.replaceAll('-',''),
        vhclNo: params.vhclNo,
        brno: params.brno,
        locgovCd: params.locgovCd,
        seqNo: params.seqNo
      }
      
     const userConfirm = confirm("준공영제 정보를 변경하시겠습니까?");

     setLoadingBackdrop(true);

     if(userConfirm) {
       const response = await sendHttpRequest('PUT', endpoint, body, true, {
         cache: 'no-store',
       })
    
       if (response && response.resultType === 'success') {
         alert(response.message);
         reload();
         setOpen(false);
         setLoadingBackdrop(false);
       }else {
         alert(response.message);
       }
     }else {
       return;
     }

  }

  return (
    <React.Fragment>
      { buttonLabel ?  
      <Button variant="outlined">
        {buttonLabel}
      </Button> : ''
      }
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={isOpen}
        //onClose={handleClose}
      >
        <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h2>{title}</h2>
          </CustomFormLabel>
          <div className=" button-right-align">
            <Button variant="contained" form='form-modal' color="primary"  onClick={(createSbsidyRcpmnyAcnut)}>저장</Button>
            <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
          </div>
        </Box>
        <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>사업자 정보 테이블 요약</caption>
                <colgroup>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '17%' }}></col>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '17%' }}></col>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '17%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                    지자체
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.locgovNm
                      }
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    차량번호
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.vhclNo
                      }
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    사업자번호
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.brno
                      }
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    업체명
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.bzentyNm
                      }
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    유종
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.koiNm
                      }
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    면허업종
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.vhclSeNm
                      }
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    <span className="required-text">*</span>준공영제 시작일자
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">준공영제 시작일자</CustomFormLabel>
                      <CustomTextField type="date" id="ft-date-start" name="dsgnBgngYmd" onChange={handleSearchChange} inputProps={{max: params.endYmd}} value={params.dsgnBgngYmd}  fullWidth />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    <span className="required-text">*</span>준공영제 종료일자
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">준공영제 종료일자</CustomFormLabel>
                      <CustomTextField type="date" id="ft-date-end" name="endYmd" onChange={handleSearchChange} inputProps={{min: params.dsgnBgngYmd}}value={params.endYmd}  fullWidth />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    등록자아이디
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.rgtrId
                      }
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    등록일자
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.regDt
                      }
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    수정자아이디
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.mdfrId
                      }
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                    수정일자
                    </th>
                    <td colSpan={2}>
                      <div className="form-group" style={{ width: '100%' }}>
                      {
                      params.mdfcnDt
                      }
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}