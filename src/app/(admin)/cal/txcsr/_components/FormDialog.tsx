'use client'
import React, { useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getUserInfo } from '@/utils/fsms/utils'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

interface FormDialogProps {
  open: boolean
  handleClickClose: () => void
  size?: DialogProps['maxWidth']
  reqDataList?: any[]
  getData?: () => void
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  handleClickClose,
  size,
  reqDataList,
  getData,
}) => {
  const [flRsnCn, setFlRsnCn] = useState<string>()
  const [CsbySbsidyRqestList, setCsbySbsidyRqestList] = useState<any[]>([])
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  // 회원정보
  const userInfo = getUserInfo()

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFlRsnCn(value)
  }

  const validation = () => {
    CsbySbsidyRqestList.map((data) => {
      if (data.ddlnYn === 'Y') {
        return false
      }
    })
    return true
  }

  const fetchData = async (reqDataList?: Row[], flRsnCn?: string) => {
    if (!validation()) {
      alert('미확정 데이터만 거절이 가능합니다.')
      return
    }

    try {
      let selectList: any[] = []
      if (reqDataList) {
        reqDataList.map((row) => {
          let reqData = {
            crdcoCd: row.crdcoCd,
            clclnSeCd: row.clclnSeCd,
            cardNo: row.cardNo,
            clclnYm: row.clclnYm,
            aprvNo: row.aprvNo,
            aprvYmd: row.aprvYmd,
            aprvTm: row.aprvTm,
            clmAprvYn: 'N',
            flRsnCn: flRsnCn,
            mdfrId: userInfo.lgnId,
          }

          selectList.push(reqData)
        })
      }
      // setCsbySbsidyRqestList(selectList)

      let body = {
        CsbySbsidyRqestList: selectList,
      }

      let endpoint: string = `/fsm/cal/txcsr/tx/updateRejCsbySbsidyRqest`
      setLoadingBackdrop(true)
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        handleClickClose()
        getData?.()
      } else {
        alert('실패 :: ' + response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={handleClickClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>거절사유입력</h2>
            <div className="button-right-align">
              <Button
                onClick={() => fetchData(reqDataList, flRsnCn)}
                variant="contained"
                form="form-modal"
                color="primary"
              >
                거절
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

          <Box
            id="form-modal"
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <TableContainer className="table table-bordered">
              <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableBody>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    >
                      <span className="required-text">*</span>거절사유
                    </TableCell>
                    <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                      <textarea className="MuiTextArea-custom"
                        // type="text"
                        id="flRsnCn"
                        name="flRsnCn"
                        // multiline
                        rows={5}
                        // fullWidth
                        onChange={handleChange}
                        // style={{minWidth:'360px'}}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FormDialog
