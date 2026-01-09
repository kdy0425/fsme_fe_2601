'use client'
import { Box, DialogContent, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import React, { ReactNode, useState } from 'react';
import CustomFormLabel from '../forms/theme-elements/CustomFormLabel';
import { IconSearch } from '@tabler/icons-react';

interface CustomDialogProps {
  button?: ReactNode;
  title?: string;
  btnSet?: ReactNode;
  onSubmit?: any;
  children: ReactNode;
  size: DialogProps['maxWidth'];
}


export default function CustomDialog(props : CustomDialogProps) {
  const {button, btnSet, onSubmit, children, size, title} = props;

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      {button ? button 
      : <IconButton onClick={handleClickOpen} ><IconSearch /></IconButton>
      }
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className="input-label-display">
              <h3>{title}</h3>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Box component='form' onSubmit={(e) => onSubmit(e)}>
                {btnSet}
                <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
              </Box>
            </div>
          </Box>
          {children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}