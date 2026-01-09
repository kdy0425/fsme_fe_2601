import React, { ReactNode, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Row } from '../page';
import { SelectItem } from 'select';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 예산정보
export interface bgtFrmtInfo {
  crtrYear : string // 기준년도
  // rtNo : string //비율번호
  ctpvCd: string // 시도코드
  locgovCd: string //지자체코드
  // rtSeqNo : string // 차수
  bgtFrmtAmt : string // 예산액
  // bgtRt : string // 예산비율
}

// 신규 등록 모달창의 경우 당장에 받아야할 것들이 없음.
interface ModalFormProps {
  buttonLabel: string;
  title: string;
  size?: DialogProps['maxWidth'] | 'lg';
  reloadFunc: () => void;
  // data?: Row;
  // handleOpen?: () => any
  // handleClose?: () => any
}

const RegisterModalForm = (props: ModalFormProps) => {
  const {reloadFunc} = props;

  const [isLocgovCdAll, setIsLocgovCdAll] = useState<boolean>(false);
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([]); // 시도 코드
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([]); // 관할관청 코드

  const [content, setContent] = useState<string>(''); // 저장 내용 상태

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const [params, setParams] = useState<bgtFrmtInfo>({
    crtrYear: '',
    // rtNo : '', //비율번호
    ctpvCd: '', //
    locgovCd: '', //지자체코드
    // rtSeqNo: '', // 차수
    bgtFrmtAmt : '', // 예산액
    // bgtRt : '', // 예산비율
  });

  const handleClose = () => {
    setParams({
      crtrYear: '',
      // rtNo : '', //비율번호
      ctpvCd: '', //
      locgovCd: '', //지자체코드
      // rtSeqNo: '', // 차수
      bgtFrmtAmt : '', // 예산액
      // bgtRt : '', // 예산비율
    })
    setOpen(false);
  };

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    
  }, []);

  useEffect(() => {
    
  }, [params]);

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정


  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setParams((prev) => ({ ...prev, [name]: value }));
  };

   const handleSaveModal =  async (event: React.FormEvent) =>{
    event.preventDefault();
    saveInfo();
  }

  const saveInfo = async () => {
    try {
      // 필수 값 확인
      if (!params.crtrYear) {
        alert('기준년도를 입력해야 합니다.');
        return;
      }
      if (!params.locgovCd) {
        alert('지자체 정보를 선택해야 합니다.');
        return;
      }
      if (!params.bgtFrmtAmt) {
        alert('예산액을 입력해야 합니다.');
        return;
      }

      // 사용자 확인
      const userConfirm = confirm('예산정보를 등록하시겠습니까?');
      if (!userConfirm) {
        return;
      }

      const endpoint = '/fsm/sup/bm/cm/createBudgetMng';

      // FormData 생성
      const jsonData = {
        crtrYear: params.crtrYear, // 
        locgovCd: params.locgovCd, // 게시글 제목
        bgtFrmtAmt: params.bgtFrmtAmt, // 팝업공지여부
      };

      // 서버 요청
      const response = await sendHttpRequest(
        'POST',
        endpoint,
        jsonData,
        true // JWT 사용 여부
      );

      // 응답 처리
      if (response?.resultType === 'success') {
        alert('정상적으로 저장되었습니다.');
        handleClose();
        reloadFunc?.();
        
        console.log('Success Response:', response);
      } else {
        console.error('Response Error:', response);
        alert(`등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`);
        handleClose();
        reloadFunc?.();
      }
    } catch (error) {
       // error를 Error로 캐스팅
      //const errorMessage = (error as Error).message || '알 수 없는 오류가 발생했습니다.';
      alert(`Error : 등록에 실패했습니다. `)
      handleClose();

    }
  };


  return (


    <React.Fragment>
    <Button variant="contained" color="primary" onClick={handleClickOpen}>
      {props.buttonLabel}
    </Button>
    <Dialog
      fullWidth={false}
      maxWidth={props.size}
      open={open}
      onClose={handleClose}
    >
      <DialogContent>
      <Box className='table-bottom-button-group'>
        <CustomFormLabel className="input-label-display">
          <h2>{props.title}</h2>
        </CustomFormLabel>
        <div className=" button-right-align">
          <Button variant="contained" type='submit' form='form-modal' color="primary">저장</Button>
          <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
        </div>
      </Box>
        <Box
          id='form-modal'
          component='form'
          onSubmit={(e) => handleSaveModal(e)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            m: 'auto',
            width: 'full',
          }}
        >
          <Box sx={{ maxWidth:'fullWidth' ,
            margin: '0 auto', // 중앙 정렬

          }}>
          <TableContainer style={{ margin: '16px 0 4em 0' }}>
            <Table  className="table table-bordered" style={{ tableLayout: 'fixed', width: '100%' }}>
              <TableBody>
                <TableRow>
                  <TableCell className="td-head" style={{ width: '120px', verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>기준년도
                  </TableCell>
                  <TableCell style={{ textAlign: 'left' }}>
                    <CustomTextField
                        type="text"
                        inputProps={{maxLength:4, type:'number'}}
                        onInput={(e: { target: { value: string; maxLength: number | undefined; }; })=>{
                            e.target.value = Math.max(0, parseInt(e.target.value) ).toString().slice(0,e.target.maxLength)
                        }}
                        id="modal-crtrYear"
                        name="crtrYear"
                        onChange={handleParamChange}
                        value={params.crtrYear}
                        placeholder="숫자만 입력 가능합니다."
                        fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head" style={{ width: '120px', verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>시도
                  </TableCell>
                  <TableCell style={{ textAlign: 'left' }}>
                  <CustomFormLabel className="input-label-none" htmlFor="sch-ctpv"/>
                    <CtpvSelect
                      pValue={params.ctpvCd}
                      handleChange={handleParamChange}
                      htmlFor={'sch-ctpv'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head" style={{ width: '150px',verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>지자체
                  </TableCell>
                  <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                  <CustomFormLabel className="input-label-none" htmlFor="sch-locgovCd"/>
                    <LocgovSelect
                      ctpvCd={params.ctpvCd}
                      pValue={params.locgovCd}
                      handleChange={handleParamChange}
                      htmlFor={'sch-locgovCd'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head" style={{ width: '120px', verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>예산액(원)
                  </TableCell>
                  <TableCell style={{ textAlign: 'left' }}>
                    <CustomTextField
                        type="number"
                        id="modal-bgtFrmtAmt"
                        name="bgtFrmtAmt"
                        onChange={handleParamChange}
                        value={params.bgtFrmtAmt}
                        placeholder="숫자만 입력 가능합니다."
                        fullWidth
                    />
                  </TableCell>
                </TableRow>               
              
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default RegisterModalForm;