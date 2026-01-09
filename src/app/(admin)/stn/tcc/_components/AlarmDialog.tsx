'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { ReactNode, useEffect, useState } from 'react';

interface FormDialogProps {
  buttonLabel: string;
  title: string;
  children: ReactNode;
  size?: DialogProps['maxWidth'] | 'lg';
  remote?: boolean
}


export default function AlarmDialog(props : FormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    document.getElementById("crtrYmd")?.click();
  };

  useEffect(() => {
    if(props.remote !== undefined) {
      setOpen(props.remote);
    }
  }, [props.remote])

  return (
    <Box sx={{zIndex: 'tooltip'}}>
    <React.Fragment>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        {props.buttonLabel}
        </Button> */}
      <Dialog
        fullWidth={false}
        maxWidth={props.size}
        open={open}
        //onClose={handleClose}
        aria-modal
        >
        <DialogContent>
          <Box
              style={{minHeight:200, minWidth: 200}}
              sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
            >
            {props.children}
            <Box className='table-bottom-button-group' style={{justifyContent: 'center'}}>
              <div>
                <Button onClick={handleClose}>확인</Button>
              </div>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
            </Box>
  );
}