/* React */
import React, { useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* interface 선언 */
interface propsInterface {
  refusalType: 'single' | 'multi'
  handleRefusal:(type: 'single' | 'multi', rfslRsnCn: string) => void
  confirmOpen:boolean
  setConfirmOpen:React.Dispatch<React.SetStateAction<boolean>>
}

const ConfirmModal = (props: propsInterface) => {

  const { refusalType, handleRefusal, confirmOpen, setConfirmOpen } = props

  const [rfslRsnCn, setRfslRsnCn] = useState<string>('');

  const handleClick = () => {
    
    if (!rfslRsnCn.trim()) {
      alert('거절사유를 입력하세요.')
      return
    }

    const msg = refusalType === 'single' ? '관할관청 이관 거절 하시겠습니까?' : '관할관청 이관 일괄거절 하시겠습니까?'

    if (confirm(msg)) {
      handleRefusal(refusalType, rfslRsnCn)
      setConfirmOpen(false)
    }
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={confirmOpen}>
        <DialogContent>          
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{refusalType === 'single' ? '관할관청 이관 거절' : '관할관청 이관 일괄거절'}</h2>              
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">
              <Button variant="contained" color="red" onClick={handleClick}>
                {refusalType === 'single' ? '거절' : '일괄거절'}
              </Button>

              <Button variant="contained" color="dark" onClick={() => setConfirmOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>
                  {refusalType === 'single' ? '관할관청 이관 거절 처리' : '관할관청 이관 일괄거절 처리'}
                </caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '75%' }}></col>
                </colgroup>
                <tbody>                  
                  <tr>
                    <th className="td-head" scope="row">
                      거절사유
                    </th>
                    <td>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-rfslRsnCn">거절사유</CustomFormLabel>
                      <textarea className="MuiTextArea-custom"
                        id="ft-rfslRsnCn"
                        name="rfslRsnCn"
                        value={rfslRsnCn}
                        onChange={(e) => setRfslRsnCn(e.target.value)}
                        rows={6}
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

export default ConfirmModal