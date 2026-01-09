import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './BsIfCardReqComponent'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

interface BsFlModalProps {
  open: boolean
  handleClickClose: () => void
  data: Row | null
  reload: () => void
}
const BsFlModal = (props: BsFlModalProps) => {
  const { open, handleClickClose, data, reload } = props

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [flRsnCd, setFlRsnCd] = useState('')
  const [etcCn, setEtcCn] = useState('')

  useEffect(() => {
    setFlRsnCd('')
    setEtcCn('')
  }, [open])

  const saveData = async () => {
    if (!flRsnCd) {
      alert('탈락유형을 선택해주세요.')
      return
    }
    if (!confirm('탈락처리 하시겠습니까?')) return

    let endpoint: string = `/fsm/cad/cijm/bs/updateAprvYnCardIssuJdgmnMngBs`

    let body = {
      rcptYmd: data?.rcptYmd,
      rcptSn: data?.rcptSn,
      vhclNo: data?.vhclNo,
      aprvYn: 'N',
      flRsnCd: flRsnCd,
      errCd: '000',
      etcCn: etcCn,
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('탈락처리 되었습니다.')
        handleClickClose()
        reload()
      } else {
        alert('탈락처리 오류입니다.')
      }
    } catch (error) {
      alert(error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>탈락처리</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="red" onClick={saveData}>
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
                <caption>
                  카드발급요청 탈락처리
                </caption>
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
                        <CustomFormLabel className="input-label-none" htmlFor="sch-ersrRsnCd">탈락유형</CustomFormLabel>
                        <CommSelect
                          cdGroupNm="533"
                          pValue={flRsnCd}
                          handleChange={(
                            event: React.ChangeEvent<
                              HTMLInputElement | HTMLSelectElement
                            >,
                          ) => setFlRsnCd(event.target.value)}
                          pName="ersrRsnCd"
                          htmlFor={'sch-ersrRsnCd'}
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
                      <CustomFormLabel className="input-label-none" htmlFor="ft-etcCn">탈락사유</CustomFormLabel>
                      <CustomTextField
                        id="ft-etcCn"
                        name="etcCn"
                        fullWidth
                        value={etcCn}
                        onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setEtcCn(event.target.value)}
                      />
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

export default BsFlModal
