import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row, CardRow, UserRow } from './TxPage'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getForamtAddDay } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils'
import { getFormatToday, getFormatTomorrow } from '@/utils/fsms/common/comm'

interface TxAgdrvrErsrModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  cardRow: CardRow | null
  userRow: UserRow | null
  reload: () => void
}

const TxAgdrvrErsrModal = (props: TxAgdrvrErsrModalProps) => {
  const { open, handleClickClose, row, cardRow, userRow, reload } = props

  const userInfo = getUserInfo()

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [dscntChgAplcnYmd, setDscntChgAplcnYmd] = useState('')

  useEffect(() => {
    setDscntChgAplcnYmd('')
  }, [open])

  const dscntChgAplcnYmdValidation = () => {
    
      if (!dscntChgAplcnYmd) {
        alert('할인변경예정일자를 선택해주세요.')
      } else if (dscntChgAplcnYmd.replaceAll('-','').length !== 8) {
        alert('할인변경예정일자를 확인해주세요.')
      } else if (dscntChgAplcnYmd < getFormatToday()) {
        alert('할인변경예정일자는 금일이후만 가능합니다.')
      } else {
        return true
      }
  
      return false;
    };

  const saveData = async () => {
    
    if (dscntChgAplcnYmdValidation()) {

      if (!confirm('해당 차량 대리운전 조기종료를 진행하시겠습니까?')) return

      let endpoint: string = `/fsm/stn/vem/tx/updateAgdrvrErsrMng`

      let body = {
        vhclNo: row?.vhclNo,
        brno: row?.brno,
        rrno: userRow?.rrno,
        dscntChgAplcnDscntYn: 'N',
        dscntChgAplcnYmd: dscntChgAplcnYmd.replaceAll('-', ''),
        ersrType: 'AGNCY',
        rgtrId: userInfo.lgnId,
        mdfrId: userInfo.lgnId,
      }
      try {
        setLoadingBackdrop(true)
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleClickClose()
          reload()
        } else {
          alert(response.message)
        }
      } catch (error) {
        alert(error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setDscntChgAplcnYmd(value)
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '500px',
          },
        }}
      >
          <DialogContent>
          <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h2>대리운전말소등록</h2>
              </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>사업자 정보 테이블 요약</caption>
                <colgroup>
                  <col style={{ width: '40%' }}></col>
                  <col style={{ width: '60%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      말소구분
                    </th>
                    <td>대리운전 말소</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      말소일자
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">말소일자</CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="dscntChgAplcnYmd"
                          value={dscntChgAplcnYmd}
                          onChange={handleSelectChange}
                          inputProps={{
                            min: getFormatToday(),
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TxAgdrvrErsrModal
