'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Row } from './page'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import {
  closeVhclBzmnPrmsnModal,
  openVhclBzmnPrmsnModal,
} from '@/store/popup/VhclBzmnPrmsnSlice'
interface FormDialogProps {
  buttonLabel: string
  title: string
  detail: Row
  onClickUpdateBtn: (row: Row, bzmnPrmsnYmd: string) => void
}

const FormDialog: React.FC<FormDialogProps> = ({
  buttonLabel,
  title,
  detail,
  onClickUpdateBtn,
}) => {
  const [bzmnPrmsnYmd, setBzmnPrmsnYmd] = useState<string>('')

  const dispatch = useDispatch()
  const vhclBzmnPrmsnInfo = useSelector(
    (state: AppState) => state.vhclBzmnPrmsnInfo,
  )

  useEffect(() => {
    if (vhclBzmnPrmsnInfo.vbpModalOpen) {
      setBzmnPrmsnYmd('')
    }
  }, [vhclBzmnPrmsnInfo.vbpModalOpen])

  const handleOpen = () => {
    dispatch(openVhclBzmnPrmsnModal())
  }

  const handleClose = () => {
    dispatch(closeVhclBzmnPrmsnModal())
  }

  const handleDate = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let { name, value } = event.target
    setBzmnPrmsnYmd(value)
  }

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={vhclBzmnPrmsnInfo.vbpModalOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: '850px'
          }
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>{title}</h2>
            <div className="button-right-align">
              <Button
                onClick={() => onClickUpdateBtn(detail, bzmnPrmsnYmd)}
                variant="contained"
                type="submit"
                form="form-modal"
                color="primary"
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
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
                    <th className="td-head" scope="row">허가일</th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-bzmn-prmsn-ymd"
                        >
                          허가일
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-bzmn-prmsn-ymd"
                          name="bzmnPrmsnYmd"
                          value={bzmnPrmsnYmd}
                          onChange={handleDate}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FormDialog
