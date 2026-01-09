'use client'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { ReactNode, useEffect, useState } from 'react'

interface FormModalProps {
  buttonLabel: string
  title: string
  children: ReactNode
  formId?: string
  formLabel?: string | '저장' | '조회'
  size?: DialogProps['maxWidth'] | 'lg'
  remoteFlag?: boolean
  submitBtn?: boolean
  printBtn?: boolean
  btnSet?: ReactNode
  openHandler?: (param?: unknown) => void
  closeHandler?: (param?: unknown) => void
  varient?: string
}

export default function FormModal(props: FormModalProps) {
  const { openHandler, closeHandler } = props
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    if (openHandler) {
      openHandler()
    }
    setOpen(true)
  }

  const handleClose = () => {
    if (closeHandler) {
      closeHandler()
    }
    setOpen(false)
  }

  useEffect(() => {
    if (props.remoteFlag !== undefined) {
      setOpen(props.remoteFlag)
    }
  }, [props.remoteFlag])

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
        // onClose={handleClose}
        aria-modal={true}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{props.title}</h2>
            </CustomFormLabel>
            <Box className=" button-right-align">
              {props.submitBtn ||
              props.submitBtn == null ||
              props.submitBtn !== false ? (
                <Button
                  variant="contained"
                  type="submit"
                  form={props.formId}
                  color="primary"
                >
                  {props.formLabel}
                </Button>
              ) : (
                ''
              )}
              {props.printBtn ? <Button>출력</Button> : ''}
              {props.btnSet}
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </Box>
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
  )
}
