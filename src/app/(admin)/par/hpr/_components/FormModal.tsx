'use client'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import { FormLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { ReactNode, useEffect, useState } from 'react';
import { Row } from '../page';

interface FormModalProps {
  buttonLabel: string;
  title: string;
  children: ReactNode;
  formId?: string;
  formLabel?: string | '저장';
  size?: DialogProps['maxWidth'] | 'lg';
  remoteFlag?: boolean
  pringBtn?: boolean
  flag?: boolean
  selectedIndex?: number
  aplySttsCd ?: string
  data?:Row
  locgovCd?: string;
}


export default function FormModal(props : FormModalProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {

    if(props.flag){
      alert('차량 조회 후 신규 계좌 등록이 가능합니다.')
      setOpen(false)
      return
    }else if(props.title == '수소서면신청 수정'){
      if(props.selectedIndex == -1) {
        alert('수정할 수소서면신청 정보를 선택해주세요.')
        setOpen(false)
        return
      }else if((props.data?.aplySttsCd != '2')){
        alert('정산요청 상태만 수정할 수 있습니다.')
        setOpen(false)
        return 
      }
    }else if(props.title == '수소서면신청 등록'){
      
      if((props.locgovCd === '')){
        alert('관할관청을 선택해주세요.')
        setOpen(false)
        return
      }
    }
    setOpen(true);  
  }
  

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if(props.remoteFlag !== undefined && props.remoteFlag == false) {
      //console.log('remoteFlag2', props.remoteFlag)
      setOpen(false);
    }
  }, [props.remoteFlag])

  return (
    <React.Fragment>
      {
        props.buttonLabel == '신규등록' ? 
        (
          <Button variant="outlined" onClick={handleClickOpen}>
          {props.buttonLabel}
          </Button>
        ) : 
        (
          <Button variant="contained" onClick={handleClickOpen}>
          {props.buttonLabel}
          </Button>
        )
      }
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
            <Button variant="contained" type='submit' form={props.formId} color="primary">{props.formLabel}</Button>
            {props.pringBtn ? <Button>출력</Button> : ''} 
            <Button onClick={handleClose} variant="contained" color='dark'>취소</Button>
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
            {props.children}
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}