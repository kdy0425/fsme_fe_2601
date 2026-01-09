'use client'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { ReactNode, useEffect, useState } from 'react';


interface FormModalProps {
  buttonLabel: string;
  title: string;
  children: ReactNode;
  formId?: string;
  formLabel?: string
  formColor?: string //버튼색
  size?: DialogProps['maxWidth'] | 'lg';
  remoteFlag?: boolean
  saveBtn?: boolean
  srchBtn?: boolean
  excelBtn?: boolean
  printBtn?: boolean
  openHandler?: (param?: unknown) => void
  closeHandler?: (param?: unknown) => void
  varient?: string
}

export default function FormModal(props : FormModalProps) {
  const [open, setOpen] = useState(false);
  const { openHandler, closeHandler } = props

  const handleClickOpen = () => {
    if (openHandler) {
      openHandler()
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (closeHandler) {
      closeHandler()
    }
    setOpen(false);
  };

  useEffect(() => {
    if(props.remoteFlag !== undefined) {
      setOpen(props.remoteFlag)
    }
  }, [props.remoteFlag])

  const printClick = (event: React.FormEvent) => {
    
  }

  return (
    <React.Fragment>
      {props.buttonLabel ? (
        props.varient == 'outlined' ? (
          <Button variant="outlined" onClick={handleClickOpen}>
            {props.buttonLabel}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleClickOpen}>
            {props.buttonLabel}
          </Button>
        )
      ) : (
        ''
      )}
      <Dialog
        fullWidth={false}
        maxWidth={props.size}
        open={open}
        //onClose={handleClose}
        aria-modal={true}
      >
        <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h2>{props.title}</h2>
          </CustomFormLabel>
          <div className=" button-right-align">
            <Button variant="contained" type='submit' form={props.formId} color={props.formLabel == '엑셀' ? 'success' : 'primary'}>{props.formLabel}</Button>
            {props.saveBtn ? <Button variant="contained" color='primary'>저장</Button> : ''} 
            {props.srchBtn ? <Button variant="contained" color='primary'>검색</Button> : ''} 
            {props.excelBtn ? <Button variant="contained" color='success'>엑셀</Button> : ''} 
            {props.printBtn ? <Button variant="contained" color='success' onClick={printClick}>출력</Button> : ''} 
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
            {props.children}
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}