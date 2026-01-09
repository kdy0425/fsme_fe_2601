import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Dialog, DialogContent, FormControlLabel, MenuItem, RadioGroup, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Row } from './TxPage';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import UserAuthContext from '@/app/components/context/UserAuthContext';
import { isNumber } from '@/utils/fsms/common/comm';
import { getUserInfo } from '@/utils/fsms/utils';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

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
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
  const [params, setParams] = useState<Row>({
    brno: "",     // 사업자등록번호
    crno: "", // 법인등록번호
    bzentyNm: "",   //업체명
    rprsvNm: "",   // 대표자명
    telno: "",    // 전화번호
  }); 
  
  
  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    if(data) {
      setParams({
        brno:data.brno,
        crno:data.crno,
        bzentyNm:data.bzentyNm,
        rprsvNm:data.rprsvNm,
        telno:data.telno,
      });
    }
  },[open])
  
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setParams({
      brno: "",     // 사업자등록번호
      crno: "", // 법인등록번호
      bzentyNm: "",   //업체명
      rprsvNm: "",   // 대표자명
      telno: "",    // 전화번호
    })
    setOpen(false);
  };

  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    
    const {name, value} = event.target

    if(name == 'crno' || name == 'telno') {
      if(isNumber(value)) {
        setParams(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setParams(prev => ({ ...prev, [name]: value }));
    }    
  }

  //업체명
  //대표자명
  //전화번호
  
  const userinfo = getUserInfo();

  const modifiyTrBuInfo = async () => {
    
    try{
      
      setLoadingBackdrop(true);
      let endpoint: string  = `/fsm/stn/bm/tx/updateBsnesMng`;
      const userConfirm = confirm("택시 사업자정보를 변경하시겠습니까?");

      const body = {
        ...params
        , mdfrId:userinfo.lgnId
      }

      if (userConfirm) {
        
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          
          alert(response.message);
          reloadFunc?.();
          setOpen(false);
        } else {
          alert(response.message);
        }
      } else {
        return;
      }
    } catch(error){
      console.log('Error modifying data:', error);
    } finally{
      setLoadingBackdrop(false);
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
                      <td className='td-head' scope="row">
                        법인등록번호
                      </td>
                      <td>
                        <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="modal-crno">법인등록번호</CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-crno"
                          name="crno"
                          value={params.crno}
                          onChange={handleParamChange}
                          fullWidth
                          inputProps={{
                            maxLength:'13',
                          }}
                          disabled={data?.bzmnSeCd === '1'}
                        />
                        </div>
                      </td>
                    </tr>
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
                              maxLength:'20'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </div>
          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default RegisterModalForm;