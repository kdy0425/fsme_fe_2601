/* React */
import React, { useState } from 'react';

/* 공통 component */
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material';

/* type */
import { Row } from '../page';

type ModalProps = {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  row: Row,
  handleProcess: (type: 'N' | 'Y' | 'C', actnRsltCn?: string) => void,
}

const RegisterModalForm = (props: ModalProps) => {

  const { open, setOpen, row, handleProcess } = props;

  const [actnRsltCn, setActnRsltCn] = useState<string>(row.actnRsltCn)

  const handleSearchChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const { value } = event.target
    setActnRsltCn(value)
  }

  const sendData = async () => {
    if (!actnRsltCn.trim()) {
      alert("조치결과를 입력해 주세요")
      return;
    }
    handleProcess('C', actnRsltCn)
  }

  return (
    <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
      <DialogContent>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>조치결과</h2>
          </CustomFormLabel>
          <div className=" button-right-align">
            <Button variant="contained" color="primary" onClick={sendData}>
              저장
            </Button>
            <Button
              variant="contained"
              color="dark"
              onClick={() => setOpen(false)}
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
              <caption>조치결과</caption>
              <colgroup>
                <col style={{ width: '25%' }}></col>
                <col style={{ width: '75%' }}></col>
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    조치결과
                  </th>
                  <td>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="fr-flRsnCn"
                    >
                      조치결과
                    </CustomFormLabel>
                    <textarea
                      className="MuiTextArea-custom"
                      id="actnRsltCn"
                      name="actnRsltCn"
                      rows={6}
                      onChange={handleSearchChange}
                      value={actnRsltCn}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterModalForm;