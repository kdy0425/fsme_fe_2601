'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { Row } from './page'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { formatDate } from '@/utils/fsms/common/convert'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface FormDialogProps {
  buttonLabel: string
  title: string
  size?: DialogProps['maxWidth']
  detail?: Row
  reload: () => void
}

const FormDialog: React.FC<FormDialogProps> = ({
  buttonLabel,
  title,
  size,
  detail,
  reload,
}) => {
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState({
    stopBgngYmd: '',
    stopEndYmd: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setParams({
      stopBgngYmd: formatDate(detail?.['stopBgngYmd']),
      stopEndYmd: formatDate(detail?.['stopEndYmd']),
    })
  }, [detail])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    console.log(name + ', ' + value)
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const brNoFormatter = (brNo?: string) => {
    if (brNo && brNo.length == 10) {
      const brNo1 = brNo.substring(0, 3)
      const brNo2 = brNo.substring(3, 5)
      const brNo3 = brNo.substring(5, 10)

      return `${brNo1}-${brNo2}-${brNo3}`
    }
  }

  const rrNoFormatter = (rrNo?: string) => {
    if (rrNo) {
      // '-'가 있을 경우 호환을 위해 제거
      rrNo = rrNo.replaceAll('-', '')

      const rrNo1 = rrNo.substring(0, 6)
      const rrNo2 = rrNo.substring(6, 13)

      return `${rrNo1}-${rrNo2}`
    }
  }

  const modifyData = async (detail?: Row) => {
    setIsProcessing(true)
    try {
      let body = {
        vhclNo: detail?.['vhclNo'],
        hstrySn: Number(detail?.['hstrySn']).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
        brno: detail?.['brno'],
        stopRsnCn: detail?.['stopRsnCn'],
        stopBgngYmd: params.stopBgngYmd.replaceAll('-', ''),
        stopEndYmd: params.stopEndYmd.replaceAll('-', ''),
      }

      let endpoint: string = '/fsm/mng/sspc/bs/updateSbsidyStopPymnt'

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        // 성공
        alert(response.message)
        reload()
        handleClose()
      } else {
        // 실패
        alert('실패 :: ' + response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setIsProcessing(false)
  }

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>{title}</h2>
            <div className="button-right-align">
              <Button onClick={() => modifyData(detail)}>저장</Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '130px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>{detail?.['vhclNo']}</td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>{detail?.['rprsvNm']}</td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(detail?.['brno'])}</td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>{rrNoFormatter(detail?.['rprsvRrno'])}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      지급정지시작일
                    </th>
                    <td>
                      <CustomTextField
                        type="date"
                        id="stopBgngYmd"
                        name="stopBgngYmd"
                        value={params.stopBgngYmd}
                        onChange={handleDateChange}
                        fullWidth
                      />
                    </td>
                    <th className="td-head" scope="row">
                      지급정지종료일
                    </th>
                    <td>
                      <CustomTextField
                        type="date"
                        id="stopEndYmd"
                        name="stopEndYmd"
                        value={params.stopEndYmd}
                        onChange={handleDateChange}
                        fullWidth
                      />
                    </td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      지급정지사유
                    </th>
                    <td colSpan={7}>{detail?.['stopRsnCn']}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Box>
        </DialogContent>
        <LoadingBackdrop open={isProcessing} />
      </Dialog>
    </>
  )
}

export default FormDialog
