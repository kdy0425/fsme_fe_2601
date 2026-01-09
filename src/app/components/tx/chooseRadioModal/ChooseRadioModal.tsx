/* react */
import { Dispatch, SetStateAction, useEffect } from 'react'

/* mui component */
import { Button, Dialog, DialogContent, Box, RadioGroup, Grid, FormControlLabel } from '@mui/material'
import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'

type propsType = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  maxWidth?: 'lg' | 'md' | 'sm' | 'xl' | 'xs'
  title: string
  confirmTxt?: string
  handleConfirm: () => void
  cancleTxt?: string
  handleCancle?: () => void
  radioValue: string
  setRadioValue: Dispatch<SetStateAction<string>>
  radioList: radioListType[]
}

export type radioListType = {
  value: string
  label: string
}

const ChooseRadioModal = (props: propsType) => {

  const { open, setOpen, maxWidth, title, confirmTxt, handleConfirm, cancleTxt, handleCancle, radioValue, setRadioValue, radioList } = props

  useEffect(() => {
    if (open) {
      setRadioValue(radioList[0].value)
    }
  }, [open])

  const confirm = (): void => {
    handleConfirm()
    setOpen(false)
  }

  const close = (): void => {
    handleCancle?.()
    setOpen(false)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRadioValue(event.target.value)
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth={maxWidth ? maxWidth : 'sm'}
      open={open}
    >
      <DialogContent>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>{title}</h2>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button
              variant="contained"
              type="button"
              color="primary"
              onClick={confirm}
            >
              {confirmTxt ? confirmTxt : '다음'}
            </Button>
            <Button
              variant="contained"
              type="button"
              color="dark"
              onClick={close}
            >
              {cancleTxt ? cancleTxt : '닫기'}
            </Button>
          </div>
        </Box>
        <Box
          sx={{
            border: '1px solid #d3d3d3',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px',
          }}
        >
          <div className="form-group" style={{ width: 'inherit' }}>
            <RadioGroup
              name="useYn"
              onChange={handleChange}
              value={radioValue}
              className="mui-custom-radio-group"
            >
              <Grid container spacing={2}>
                {radioList.map((item, index) => (
                  <Grid
                    item
                    xs={12}
                    key={index}
                  >
                    <FormControlLabel
                      value={item.value}
                      label={item.label}
                      control={<CustomRadio />}
                    />
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ChooseRadioModal