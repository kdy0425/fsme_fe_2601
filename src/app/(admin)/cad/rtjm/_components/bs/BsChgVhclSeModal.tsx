import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

interface BsChgVhclSeModalProps {
  open: boolean
  handleClickClose: () => void
  data: Row
  reload: () => void
}
const BsChgVhclSeModalModal = (props: BsChgVhclSeModalProps) => {
  const { open, handleClickClose, data, reload } = props

  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [chgVhclSeCd, setChgVhclSeCd] = useState('')

  useEffect(() => {
    setChgVhclSeCd('')
  }, [open])

  const saveData = async () => {
    if (!chgVhclSeCd) {
      alert('변경 면허업종을 선택해주세요.')
      return
    }
    if (!confirm('면허업종을 변경 하시겠습니까?')) return

    let endpoint: string = `/fsm/cad/rtjm/bs/changeVhclCd`
    let body = {
      vhclSeCd: chgVhclSeCd,
      vhclNo: data.vhclNo,
      rcptYmd: data.rcptYmd,
      rcptSn: data.rcptSn,
    }
    try {
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('면허업종 변경처리되었습니다.')
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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setChgVhclSeCd(event.target.value)
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
              <h2>면허업종변경</h2>
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

          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box" style={{ padding: 0 }}>
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel className="label-display">
                    유류구매카드 발급승인정보의 면허업종을 변경합니다.
                    <br />
                    <br />
                    발급승인요청정보의 면허업종정보가 잘못된 경우
                    <br />
                    면허업종정보를 변경한 후 승인처리를 계속진행할 수 있습니다.
                  </CustomFormLabel>
                </div>
              </div>
            </Box>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>면허업종변경</caption>
                <colgroup>
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '65%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="td-head" scope="row">
                      변경전 면허업종
                    </td>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-vhclSeCd">변경전 면허업종</CustomFormLabel>
                        <CommSelect
                          cdGroupNm="505"
                          pValue={data?.vhclSeCd}
                          handleChange={() => {}}
                          pName="vhclSeCd"
                          pDisabled={true}
                          htmlFor={"sch-vhclSeCd"}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="td-head" scope="row">
                      변경후 면허업종
                    </td>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-chgVhclSeCd">변경후 면허업종</CustomFormLabel>
                        <CommSelect
                          cdGroupNm="505"
                          pValue={chgVhclSeCd}
                          handleChange={handleChange}
                          pName="chgVhclSeCd"
                          htmlFor={'sch-chgVhclSeCd'}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsChgVhclSeModalModal
