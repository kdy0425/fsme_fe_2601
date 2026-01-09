import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Row } from './TrPage';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import UserAuthContext from '@/app/components/context/UserAuthContext';
import { formBrno } from '@/utils/fsms/common/convert';
import { isNumber } from '@/utils/fsms/common/comm';

interface ModalFormProps {
  open: boolean
  data?: Row 
  onCloseClick: () => void;
  title?: string
  reloadFunc?: () => void;
}

const TrCarBrnoModal = (props: ModalFormProps) => {
  const {open, onCloseClick, title, reloadFunc,data
    
  } = props;
  
  
  const {authInfo} = useContext(UserAuthContext);
  
  const [params, setParams] = useState<Row>({
    vhclNo: "",     // 차량번호
    chgBfrVhclOwnrBrno: "", // 변경전 사업자등록번호
    vonrBrno: "",   //변경할 사업자등록번호
    vonrRrno: "",   // 주민등록번호
    vonrNm: "",    // 차주명
  }); 
  
  const handleClose = () => {
    setParams({
      vhclNo: "",     // 차량번호
      chgBfrVhclOwnrBrno: "", // 변경전 사업자등록번호
      vonrBrno: "",   //변경할 사업자등록번호
      vonrRrno: "",   // 주민등록번호
      vonrNm: "",    // 차주명
    })
    onCloseClick();
  };

  // useEffect(() => {
  //   setParams((prev) => ({...prev
  //     , vhclNo : data?.vhclNo 
  //     , chgBfrVhclOwnrBrno : data?.vonrBrno
  //     , vonrRrno : data?.vonrRrno
  //     , vonrNm : data?.vonrNm
  //   }))
  // },[data])


  const handleBrnoChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    // 숫자만 필터링
    if (isNumber(value)) {
      const regex = /[~`!@#$%^&*_\-+={}[\]|\\:;"'<>,.?/]/g
      setParams(prev => ({ ...prev, [name]: value.replaceAll(regex, '') }));
    }

  };
  



  const modifiyTrBuInfo = async () => {
    try{
    let endpoint: string  = `/fsm/stn/vm/tr/updateVonrBrno`;
    const userConfirm = confirm("차주사업자등록번호변경를 변경하시겠습니까?");

    if(!params?.vonrBrno || params.vonrBrno?.replaceAll('-','').length !== 10){
      alert(`변경할 사업자등록번호를 확인해주세요 '-'제외 10자리 숫자입니다.`)
      return 
      }
    if(userConfirm) {
      const response = await sendHttpRequest('PUT', endpoint, {
        vhclNo: data?.vhclNo,     // 차량번호
        chgBfrVhclOwnrBrno: data?.vonrBrno ? data?.vonrBrno.replaceAll('-','') : '', // 변경전 사업자등록번호
        vonrBrno: params?.vonrBrno.replaceAll('-',''),   //변경할 사업자등록번호
        vonrRrno: data?.vonrRrno,   // 주민등록번호
        vonrNm: data?.vonrNm,    // 차주명
      }, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message);
        reloadFunc?.();
        handleClose();

      
      }else {
        alert(response.message);
      }
    }else {
      return;
    }
  }catch(error){
    console.error('Error modifying data:', error);
  }finally{
    setParams({
      brno: "",     // 사업자등록번호
      crno: "", // 법인등록번호
      bzentyNm: "",   //업체명
      rprsvNm: "",   // 대표자명
      telno: "",    // 전화번호
      mdfrId: "",   // 수정자아이디

    })
  }
  }

  return (
      <Box>

      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        //onClose={handleClose}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
        >
        <DialogContent>
        <Box className='table-bottom-button-group'>
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
          <div className=" button-right-align">
              <Button variant="contained" color="primary" 
              onClick={() => modifiyTrBuInfo()}>저장</Button>
              <Button variant="contained"
              color="dark" onClick={(handleClose)}>취소</Button>
          </div>
        </Box>

        <Box sx={{ textAlign: 'center', border: 'solid 1px grey', mb:1, backgroundColor: '#f5f5f5' }}>
          <h4 style={{ color: 'red' }}>
            <p style={{ color: 'red' }}>
              {'차주 사업자등록번호를 잘못 입력할경우,\n '}
            </p>
            <br></br>
            <p style={{ color: 'red' }}>
            {'국세청 부가세신고시 불이익을 받을 수 있습니다.'}
            </p>
          </h4>
        </Box>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
              <table className="table table-bordered">
                  <caption>사업자 수정 테이블</caption>
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '75%' }} />
                  </colgroup>

                  <tbody>
                    <tr>
                      <td className='td-head' scope="row">
                      변경전사업자등록번호
                      </td>
                      <td>
                        <div className="form-group" style={{ width: '100%' }}>
                          {formBrno(data?.vonrBrno)}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                      변경할사업자등록번호
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel className="input-label-none" htmlFor="modal-vonrBrno">변경할사업자등록번호</CustomFormLabel>
                          <CustomTextField
                            type="text"
                            id="modal-vonrBrno"
                            name="vonrBrno"
                            value={
                              params.vonrBrno?.length == 10 ? formBrno(params?.vonrBrno)?? '' : params?.vonrBrno
                            }
                            onChange={handleBrnoChange}
                            fullWidth
                            inputProps={{
                              maxLength : 12
                            }}
                          />
                        </div>
                      </td>
                  </tr>


                  </tbody>
                </table>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TrCarBrnoModal;