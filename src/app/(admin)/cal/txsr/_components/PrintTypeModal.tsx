/* React */
import React, { useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { CustomFormLabel, CustomRadio, CustomTextField, FormControlLabel, Grid, RadioGroup } from '@/utils/fsms/fsm/mui-imports';

/* interface 선언 */
interface propsInterface {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleReport:(type:string) => void
}

const PrintTypeModal = (props:propsInterface) => {

  const { open, setOpen, handleReport} = props

  const [radio, setRadio] = useState<string>('O');
  
  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>청구서출력</h2>
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={() => { handleReport(radio); setOpen(false);}}>
                출력
              </Button>

              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>
                  청구서출력
                </caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      청구서출력
                    </th>
                    <td>
                      <div className="form-group" style={{ width: "inherit" }}>
                        <RadioGroup
                          id="type"
                          name="type"
                          className="mui-custom-radio-group"
                          onChange={(event) => setRadio(event.target.value)}
                          value={radio}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={<CustomRadio id="rdo3_1" name="type" value="O" />}
                                label="청구월 카드사 출력"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={<CustomRadio id="rdo3_2" name="type" value="A" />}
                                label="청구월 카드사 전체 출력(해당월)"
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
            {/* 테이블영역 끝 */}
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default PrintTypeModal
