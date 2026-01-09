'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { SelectChangeEvent } from '@mui/material/Select'
import React, { ReactNode, useState } from 'react'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
  FormControlLabel,
  Grid,
  RadioGroup,
} from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import { formatDate } from '@/utils/fsms/common/convert'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'

interface FormDialogProps {
  buttonLabel: string
  title: string
  size?: DialogProps['maxWidth']

  clclnLocgovCd: string | number

  locgovCd: string | number

  bzmnSeCd: string | number

  crdcoCd: string | number
  bgngDt: string | undefined
  endDt: string | undefined

  detailClclnLocgovCd: string | undefined
  detailBzmnSeCd: string | undefined
  detailClmAprvYn: string | undefined
  detailClclnYm: string | undefined
  detailCrdcoCd: string | undefined
  rowsLength: string | number
}

const FormDialog: React.FC<FormDialogProps> = ({
  buttonLabel,
  title,
  size,
  clclnLocgovCd,
  locgovCd,
  bzmnSeCd,
  crdcoCd,
  bgngDt,
  endDt,
  detailClclnLocgovCd,
  detailBzmnSeCd,
  detailClmAprvYn,
  detailClclnYm,
  detailCrdcoCd,
  rowsLength,
}) => {
  const [open, setOpen] = useState(false)
  const [radio, setRadio] = useState<string>()

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleRadio = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setRadio(value)
  }

  const excelDownload = async () => {
    let type = radio
    console.log(radio)

    let endpoint: string = ''

    if (type === 'card') {
      if (rowsLength === undefined || rowsLength === 0) {
        alert('조회 후 엑셀 다운로드가 가능합니다.')
        return
      }

      endpoint =
        `/fsm/cal/txsr/tx/getExcelAllSbsidyCardRqest?` +
        `${locgovCd ? '&' + 'clclnLocgovCd' + '=' + locgovCd : ''}` +
        `${bzmnSeCd ? '&' + 'bzmnSeCd' + '=' + bzmnSeCd : ''}` +
        `${crdcoCd ? '&' + 'crdcoCd' + '=' + crdcoCd : ''}` +
        `${bgngDt ? '&bgngDt=' + bgngDt.replace('-', '') : ''}` +
        `${endDt ? '&endDt=' + endDt.replace('-', '') : ''}`
    } else if (type === 'detail') {
      if (!detailBzmnSeCd) {
        alert('상세 내역을 조회 후 엑셀 다운로드가 가능합니다.')
        return
      }

      endpoint =
        `/fsm/cal/txsr/tx/getExcelAllSbsidyRqest?` +
        `${locgovCd ? '&' + 'clclnLocgovCd' + '=' + locgovCd : ''}` +
        `${detailCrdcoCd ? '&crdcoCd=' + detailCrdcoCd : ''}` +
        `${detailClmAprvYn ? '&clmAprvYn=' + detailClmAprvYn : ''}` +
        `${detailClclnYm ? '&clclnYm=' + detailClclnYm.replace('-', '') : ''}` +
        `${detailBzmnSeCd ? '&bzmnSeCd=' + detailBzmnSeCd : ''}`
    } else {
      alert('데이터 유형을 선택하시기 바랍니다.')
      return
    }

    await  getExcelFile(endpoint, '청구서 출력_' + getToday() + '.xlsx')
  }

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>{title}</h2>
            <div className="button-right-align">
              <Button
                onClick={() => excelDownload()}
                variant="contained"
                type="submit"
                form="form-modal"
                color="primary"
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
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
                    <td>데이터 선택</td>
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
                                value="card"
                                control={<CustomRadio />}
                                label="카드사별 청구내역"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                value="detail"
                                control={<CustomRadio />}
                                label="카드사별 청구 상세내역"
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
    </>
  )
}

export default FormDialog
