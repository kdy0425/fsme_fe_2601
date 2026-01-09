'use client'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DetailModalContent from './DetailModalContent'
import React, { useEffect, useState, useRef } from 'react';
import { Row } from '../page';


interface FormModalProps {
  buttonLabel: string;
  title: string;
  formLabel?: string
  size?: DialogProps['maxWidth'] | 'lg';
  remoteFlag?: boolean
  detail: Row | null
  dataSeCd: string
}


export default function FormModal(props : FormModalProps) {
  const {detail, dataSeCd} = props;
  const [open, setOpen] = useState(false);

  const childRef = useRef<any>(null); // 자식 컴포넌트를 참조하는 ref 생성

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if(props.remoteFlag !== undefined && props.remoteFlag == false) {
      setOpen(false);
    }
  }, [props.remoteFlag])

  const printClick = () => {
    
    if (childRef.current) {
      // 자식 컴포넌트의 메서드 호출
      childRef.current.childPrintClickHandler();
    }
  }

  return (
    <React.Fragment>
      <Button 
        variant="outlined" 
        onClick={handleClickOpen}
      >
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
            <Button variant="contained" type='submit' form="detail-modal" color="success">엑셀</Button>
            <Button variant="contained" color='success' onClick={printClick}>출력</Button>
            <Button variant="contained" color='dark' onClick={handleClose}>취소</Button>
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
          <DetailModalContent
            detail={detail}
            dataSeCd={dataSeCd}
            ref={childRef}
          />
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}