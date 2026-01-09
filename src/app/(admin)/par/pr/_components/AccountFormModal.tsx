'use client'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button } from '@mui/material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState, useRef } from 'react';
import { SelectItem } from 'select';
import AccountModalContent from './AccountModalContent'

interface AccountModalProps {
  title: string;
  formLabel?: string
  size?: DialogProps['maxWidth'] | 'lg';
  remoteFlag?: boolean
  reloadFn?: () => void
  closeHandler?: () => void

  dataSeCd: string
  vhclNo: string
  locgovCd: string
  crno: string
  lbrctYm: string
  vonrBrno: string
  clclnYm: string
  bankCdItems: SelectItem[]
}


const AccountModal = (props : AccountModalProps) => {
  const [open, setOpen] = useState(false);
  const {dataSeCd, vhclNo, locgovCd, crno, lbrctYm, vonrBrno, clclnYm, bankCdItems, remoteFlag, reloadFn, closeHandler} = props // CONTENT PROPS

  const childRef = useRef<any>(null); // 자식 컴포넌트를 참조하는 ref 생성

  const handleClose = () => {
    if (closeHandler) {
      closeHandler()
    }
    setOpen(false)
  };

  const saveClick = async() => {
    
    if (childRef.current) {
      // 자식 컴포넌트의 메서드 호출
      await childRef.current.childSaveClickHandler();
      reloadFn?.()
      closeHandler?.()
    }
  }

  useEffect(() => {
    if (remoteFlag !== undefined) {
      setOpen(remoteFlag)
    }
  }, [props.remoteFlag])

  return (
    <React.Fragment>
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
            <Button variant="contained" color='primary' type='submit' form='search-modal'>검색</Button>
            <Button variant="contained" color='primary' onClick={saveClick}>저장</Button>
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
          <AccountModalContent
            dataSeCd={dataSeCd}
            vhclNo={vhclNo}
            locgovCd={locgovCd} 
            crno={crno} 
            lbrctYm={lbrctYm}
            vonrBrno={vonrBrno} 
            clclnYm={clclnYm}
            bankCdItems={bankCdItems}
            ref={childRef}
            //reload는 saveClick애서 함
          />
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default AccountModal