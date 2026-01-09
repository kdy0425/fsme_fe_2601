'use client'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";

interface DetailDialogProps {
  title: string;
  isOpen: boolean
  children: ReactNode;
  // handleClickOpen: () => void;
  handleClickClose: () => void;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function DetailDialog(props : DetailDialogProps) {
  const { isOpen, title, children, size, handleClickClose } = props;

  return (
    <Dialog
      fullWidth={false}
      maxWidth={size}
      open={isOpen}
      // onClose={handleClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            m: 'auto',
            width: 'fit-content',
          }}
        >
          {children}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}