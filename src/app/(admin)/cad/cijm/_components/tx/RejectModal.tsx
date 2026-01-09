/* React */
import React, { useCallback, useEffect } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

/* 부모 컴포넌트에서 선언한 interface */
import { flRsnDataInterface } from './TxIfCardReqComponent'

/* interface 선언 */
interface propsInterface {
  flRsnData: flRsnDataInterface
  setFlRsnData: React.Dispatch<React.SetStateAction<flRsnDataInterface>>
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  pReject: () => void
}

const RejectModal = (props: propsInterface) => {
  const { flRsnData, setFlRsnData, open, setOpen, pReject } = props

  useEffect(() => {
    if (open) {
      setFlRsnData({ flRsnCd: '000', flRsnCn: '' })
    }
  }, [open])

  // 탈락사유코드, 탈락사유 변경시
  const handleSearchChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = event.target
      setFlRsnData((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  // 모달 클로즈
  const handleClose = () => {
    setFlRsnData({ flRsnCd: '000', flRsnCn: '' })
    setOpen(false)
  }

  // 탈락
  const handleReject = () => {
    if (flRsnData.flRsnCd === '000') {
      alert('탈락사유코드를 선택하세요.')
      return
    }

    if (confirm('탈락처리 하시겠습니까?')) {
      pReject()
      setOpen(false)
    }
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>탈락처리</h2>
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">
              <Button variant="contained" color="red" onClick={handleReject}>
                탈락
              </Button>

              <Button variant="contained" color="dark" onClick={handleClose}>
                닫기
              </Button>
            </div>
          </Box>

          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>카드발급요청 탈락처리</caption>
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
                          htmlFor="sch-ersrRsnCd"
                        >
                          탈락유형
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="IUE0"
                          pValue={flRsnData.flRsnCd}
                          handleChange={handleSearchChange}
                          pName="flRsnCd"
                          htmlFor={'sch-flRsnCd'}
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
                        htmlFor="ft-etcCn"
                      >
                        탈락사유
                      </CustomFormLabel>
                      <CustomTextField
                        id="ft-flRsnCn"
                        fullWidth
                        name="flRsnCn"
                        value={flRsnData.flRsnCn}
                        onChange={handleSearchChange}
                        inputProps={{
                          maxLength: 20,
                        }}
                      />
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

export default RejectModal
