import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Row } from './TrPage';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { isNumber } from '@/utils/fsms/common/comm';

interface ModalFormProps {
  data?: Row;
  buttonLabel: string;
  title?: string
  reloadFunc?: () => void;
}

const RegisterModalForm = (props: ModalFormProps) => {
  const {data, buttonLabel, title, 
    reloadFunc
  } = props;

  const [open, setOpen] = useState(false);

  const [params, setParams] = useState<Row>({
    crno: "",     // 법인등록번호
    bzentyNm: "", // 업체명
    bossNm: "",   // 대표자명
    rprsvNm: "",
    telno: "",    // 전화번호
  }); 


  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    if(data) {
      setParams(data);
    }
  },[open])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setParams({
      crno: "",     // 법인등록번호
      bzentyNm: "", // 업체명
      bossNm: "",   // 대표자명
      rprsvNm: "",
      telno: "",    // 전화번호
    })
    setOpen(false);
  };

  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target
    const regex = /[~`!@#$%^&*_\-+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'telno'){
      if(!isNaN(Number(value)) && value.length > 11){
        return;
      }else if(!isNaN(Number(value))){
        setParams(prev => ({ ...prev, [name]: value.replace(regex,'').replace(' ', '') }));    
      }
    }else{
        setParams(prev => ({ ...prev, [name]: value.replace(' ', '').replace(regex,'') }));
    }
  }

  //업체명
  //대표자명
  //전화번호

  const modifiyTrBuInfo = async () => {
    if(!params.bzentyNm) {
        alert("업체명은 필수 입력 사항입니다.");
        return;
    }

    if(!params.rprsvNm){
      alert("대표자명은 필수 입력 사항입니다.")
      return;
    }

    if(!params.telno){
      alert("전화번호는 필수 입력 사항입니다.")
      return;
    }

    try{
    let endpoint: string  = `/fsm/stn/bm/tr/updateBsnesMng`;
    const userConfirm = confirm("사업자정보를 변경하시겠습니까?");
    // bzentyNm <- bzentyNm
    // bossNm <-  rprsvNm
    // telno <- telno
    setParams(prev => ({ ...prev, ['bossNm']: params.rprsvNm }));
    if(userConfirm) {
      const response = await sendHttpRequest('PUT', endpoint, params, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert(response.message);

        reloadFunc?.();
        setOpen(false);
      }else {
        alert(response.message);
      }
    }else {
      return;
    }
  }catch(error){

  }finally{
    // setParams({
    //   crno: "",     // 법인등록번호
    //   bzentyNm: "", // 업체명
    //   bossNm: "",   // 대표자명
    //   rprsvNm: "",
    //   telno: "",    // 전화번호
    // })
  }
  }


  return (
      <Box>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
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
                      <th className="td-head" scope="row">
                        업체명
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel className="input-label-none" htmlFor="modal-bzentyNm">업체명</CustomFormLabel>
                          <CustomTextField
                            type="text"
                            id="modal-bzentyNm"
                            name="bzentyNm"
                            value={params.bzentyNm}
                            onChange={handleParamChange}
                            fullWidth
                            inputProps={{
                              maxLength:40
                            }} 
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel className="input-label-none" htmlFor="modal-rprsvNm">대표자명</CustomFormLabel>
                          <CustomTextField
                            type="text"
                            id="modal-rprsvNm"
                            name="rprsvNm"
                            value={params.rprsvNm}
                            onChange={handleParamChange}
                            fullWidth
                            inputProps={{
                              maxLength:40
                            }} 
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        전화번호
                      </th>
                        <td>
                          <div className="form-group" style={{ width: '100%' }}>
                            <CustomFormLabel className="input-label-none" htmlFor="modal-telno">전화번호</CustomFormLabel>
                            <CustomTextField
                              type="text"
                              id="modal-telno"
                              name="telno"
                              value={params.telno}
                              onChange={handleParamChange}
                              fullWidth
                              inputProps={{
                                maxLength:12
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

export default RegisterModalForm;