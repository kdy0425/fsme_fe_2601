'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { SelectChangeEvent } from '@mui/material/Select'
import React, { ReactNode, useEffect, useState } from 'react'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
  FormControlLabel,
  Grid,
  RadioGroup,
} from '@/utils/fsms/fsm/mui-imports'
import { openReport } from '@/utils/fsms/common/comm'

type FormDialogProps = {
  buttonLabel: string
  title: string
  size: string
  open: boolean
  onClose: (selectedValue: string) => void
  crfName?: string
  crfData?: string
}

const FormDialog: React.FC<FormDialogProps> = ({
  buttonLabel,
  title,
  size,
  open,
  onClose,
  crfName,
  crfData,
}) => {
  const [radio, setRadio] = useState<string>('')

  useEffect(() => {
    if (open) {
      setRadio('O')
    }
  }, [open])

  const handleRadio = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { value } = event.target
    setRadio(value)
  }

  const handleClose = () => {
    onClose(radio)
  }

  const handleReport = (crfName?: string, crfData?: string) => {
    openReport(crfName, crfData)
  }

  return (
    <Dialog fullWidth={false} open={open} onClose={handleClose}>
      <DialogContent>
        <Box className="table-bottom-button-group">
          <h2>{title}</h2>
          <div className="button-right-align">
            <Button
              onClick={handleClose}
              variant="contained"
              form="form-modal"
              color="primary"
            >
              출력
            </Button>
            <Button onClick={() => onClose('')} variant="contained" color='dark'>취소</Button>
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
          <div className="table-scrollable">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td rowSpan={2}>청구서 선택</td>
                </tr>
                <tr>
                  <td>
                    <div className="form-group" style={{ width: 'inherit' }}>
                      <RadioGroup
                        name="type"
                        onChange={handleRadio}
                        value={radio}
                        className="mui-custom-radio-group"
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <FormControlLabel
                              value="O"
                              control={<CustomRadio />}
                              label="청구월 카드사 출력"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              value="T"
                              control={<CustomRadio />}
                              label="청구월 카드사 전체 출력(해당 월)"
                            />
                          </Grid>
                        </Grid>
                      </RadioGroup>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
export default FormDialog
