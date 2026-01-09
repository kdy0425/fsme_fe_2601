import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

interface BsFlModalProps {
  open: boolean
  handleClickClose: () => void
  saveData: (flRsnCd: string, flRsnCn: string) => void
  isBackdrop: boolean
}
const BsFlModal = (props: BsFlModalProps) => {
  const { open, handleClickClose, saveData, isBackdrop } = props

  const [flRsnCd, setFlRsnCd] = useState<string>('')
  const [flRsnCn, setFlRsnCn] = useState<string>('')
  useEffect(() => {
    setFlRsnCd('')
    setFlRsnCn('')
  }, [open])

  const handleFlClick = () => {
    saveData(flRsnCd, flRsnCn)
  }
  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>탈락처리</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="red" onClick={handleFlClick}>
                탈락
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
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>태그발급요청 탈락처리</caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락유형
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-flRsnCd"
                        >
                          탈락유형
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="533"
                          pValue={flRsnCd}
                          handleChange={(
                            event: React.ChangeEvent<
                              HTMLInputElement | HTMLSelectElement
                            >,
                          ) => setFlRsnCd(event.target.value)}
                          pName="flRsnCd"
                          htmlFor={'sch-flRsnCd'}
                          addText="선택"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="fr-flRsnCn"
                      >
                        탈락사유
                      </CustomFormLabel>
                      <textarea
                        className="MuiTextArea-custom"
                        id="ft-flRsnCn"
                        name="flRsnCn"
                        // multiline
                        rows={6}
                        // fullWidth
                        onChange={(
                          event: React.ChangeEvent<
                            | HTMLInputElement
                            | HTMLSelectElement
                            | HTMLTextAreaElement
                          >,
                        ) => setFlRsnCn(event.target.value)}
                        value={flRsnCn}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={isBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsFlModal
