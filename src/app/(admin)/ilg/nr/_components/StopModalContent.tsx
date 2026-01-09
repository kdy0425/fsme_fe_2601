import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Row } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface RegisterModalProps {
  tabIndex: string
  row:Row,
  open: boolean,
  handleClickClose: () => void,
  reload: () => void,
}

const RegisterModalForm = (props: RegisterModalProps) => {
  
  const { tabIndex, row, open, handleClickClose, reload } = props
  
  const [regRsnCn, setRegRsnCn] = useState<string>('');
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // back로딩상태

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = event.target
    setRegRsnCn(value)
  }

  const stopModal = async () => { 

    if(!regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('중지사유를 입력해주세요.')
      return;
    }

    if(regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
      alert('중지사유를 30자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if (confirm('체납환수금 차감 중지 하시겠습니까?\n신규등록 및 수정내용은 익일부터 시스템에 적용됩니다.')) {

      try {

        setLoadingBackdrop(true);

        let body = 
        tabIndex === '0' ?
        {
          "regSttsCd": "1",
          "regRsnCn": regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
          "sn": Number(row.sn).toLocaleString(),
          "locgovCd": row.locgovCd,
          "vhclNo": row.vhclNo
        }
        :
        {
          "rdmAmt": row?.rdmAmt,
          "enfcYmd": row?.enfcYmd,
          "regRsnCn": regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
          "sn": Number(row?.sn).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }),
          "locgovCd": row?.locgovCd,
          "vhclNo": row?.vhclNo
        }
    
        let endpoint: string =
          tabIndex === '0' ? '/fsm/ilg/nr/tr/updateNpymRedemp' : '/fsm/ilg/nr/tx/stopNpymRedemp'

        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store'
        })
        if (response && response.resultType === 'success') {
          alert(response.message)
          reload()
          handleClickClose()
        } else {
          alert("실패 :: " + response.message)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingBackdrop(false);
      }
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차감중지</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={(stopModal)}>저장</Button>
              <Button variant="contained" color="dark" onClick={handleClickClose}>닫기</Button>
            </div>
          </Box>
          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>차감중지 등록</caption>
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '85%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">중지사유</th>
                    <td>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-regRsnCn">중지사유</CustomFormLabel>
                      <textarea
                        className="MuiTextArea-custom"
                        id="ft-regRsnCn"
                        name="regRsnCn"
                        value={regRsnCn}
                        onChange={handleChange}
                        rows={6}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RegisterModalForm
  