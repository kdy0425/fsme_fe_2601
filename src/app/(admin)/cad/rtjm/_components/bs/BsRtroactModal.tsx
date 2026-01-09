import {
  CustomFormLabel,
  CustomTextField,
  CustomRadio,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getFormatToday } from '@/utils/fsms/common/comm'

interface BsRtroactModalProps {
  open: boolean
  handleClickClose: () => void
  saveData: (rtroactYmd: string, etcCn: string) => void
  isBackdrop: boolean
  defaultRtroactYmd?: string
}
const BsRtroactModal = (props: BsRtroactModalProps) => {
  const { open, handleClickClose, saveData, isBackdrop, defaultRtroactYmd } =
    props

  const [rtroactYmd, setRtroactYmd] = useState<string>('')
  const [etcCn, setEtcCn] = useState<string>('')
  const [rtroactYn, setRtroactYn] = useState<string>('Y')
  useEffect(() => {
    setRtroactYmd('')
    setEtcCn('')
    setRtroactYn('Y')
    if (open && defaultRtroactYmd) setRtroactYmd(defaultRtroactYmd)
  }, [open])

  const handleAprvClick = () => {
    if (rtroactYn === 'Y' && !rtroactYmd) {
      alert('소급일자 선택바랍니다.')
      return
    }
    saveData(rtroactYmd, etcCn)
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '600px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h3>소급처리여부</h3>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAprvClick}
              >
                승인
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                닫기
              </Button>
            </div>
          </Box>
          <Box>
            <div className="table-scrollable">
              <table className="table table-bordered">
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head td-left">소급처리구분</th>
                    <td>
                      <RadioGroup
                        id="rtroactYn"
                        name="rtroactYn"
                        className="mui-custom-radio-group"
                        onChange={(event) => setRtroactYn(event.target.value)}
                        value={rtroactYn}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'nowrap',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <CustomRadio
                              id="rdo3_1"
                              name="rtroactYn"
                              value="N"
                            />
                          }
                          label="미처리"
                        />
                        <FormControlLabel
                          control={
                            <CustomRadio
                              id="rdo3_2"
                              name="rtroactYn"
                              value="Y"
                            />
                          }
                          label="처리"
                        />
                      </RadioGroup>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">소급처리일자</CustomFormLabel>
                      <CustomTextField
                        value={rtroactYmd}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setRtroactYmd(event.target.value)}
                        name="rtroactYmd"
                        type="date"
                        id="ft-date-start"
                        inputProps={{ max: getFormatToday() }}
                        fullWidth
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head td-left">비고</th>
                    <td>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-etcCn">비고</CustomFormLabel>
                      <textarea
                        id="ft-etcCn"
                        name="etcCn"
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          marginTop: 5,
                        }}
                        maxLength={100}
                        onChange={(event) => setEtcCn(event.target.value)}
                        value={etcCn}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="box-con-col">
              <div className="contents-explanation">
                <div className="contents-explanation-inner">
                  <div className="contents-explanation-text">
                    소급처리구분을 처리로 하였을 때 선택한 날짜부터 자동
                    소급처리 됩니다.
                  </div>
                </div>
              </div>
            </div>
          </Box>
          <LoadingBackdrop open={isBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsRtroactModal
