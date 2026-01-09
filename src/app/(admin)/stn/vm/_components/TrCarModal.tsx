import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Row } from './TrPage'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

interface ModalFormProps {
  open: boolean
  data: Row
  onCloseClick: () => void
  title?: string
  reloadFunc?: () => void
}

const TrCarModal = (props: ModalFormProps) => {
  const { open, onCloseClick, title, reloadFunc, data } = props

  const [body, setBody] = useState({
    vhclNo: '', // 차량번호
    vhclPsnCd: '', // 소유구분
    lcnsTpbizCd: '', // 면허업종구분
  })

  useEffect(() => {
    //  console.log(data)
    if (open) {
      setBody((prev) => ({
        ...prev,
        vhclNo: data?.vhclNo,
        vhclPsnCd: data?.vhclPsnCd,
        lcnsTpbizCd: data?.lcnsTpbizCd,
      }))
    }
  }, [open])

  const handleClose = () => {
    setBody({
      vhclNo: '', // 차량번호
      vhclPsnCd: '', // 소유구분
      lcnsTpbizCd: '', // 면허업종구분
    })

    onCloseClick()
  }

  const handleBodyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setBody((prev) => ({ ...prev, [name]: value }))
  }

  const checkPsnCd = (vhclPsnCd: string, chgPsnCd: string): boolean => {
    const compPsnCdArr = ['2', '4']
    const indiviPsnCdArr = ['1', '3', '5', '6', '7']

    if (compPsnCdArr.includes(vhclPsnCd)) {
      if (indiviPsnCdArr.includes(chgPsnCd)) {
        alert('법인(지입)에서 개인 또는 지입으로 변경할 수 없습니다.')
        return false
      }
    }

    if (indiviPsnCdArr.includes(vhclPsnCd)) {
      if (compPsnCdArr.includes(chgPsnCd)) {
        alert('개인 또는 지입에서 법인(지입)으로 변경할 수 없습니다.')
        return false
      }
    }

    return true
  }

  const sendData = async () => {
    if (!checkPsnCd(data.vhclPsnCd, body.vhclPsnCd)) return

    try {
      const userConfirm = confirm('차량정보를 변경하시겠습니까?')
      if (!userConfirm) return

      let endpoint: string = `/fsm/stn/vm/tr/updateVhcleMng`

      const sendData = {
        ...body,
        vhclPsnCd: body.vhclPsnCd, // 소유구분
        lcnsTpbizCd: body.lcnsTpbizCd, // 면허업종구분
      }

      const response = await sendHttpRequest('PUT', endpoint, sendData, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        reloadFunc?.()
        handleClose()
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error modifying data:', error)
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        //onClose={handleClose}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => sendData()}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <TableContainer className="table-scrollable">
            <Table className="table table-bordered">
              <TableBody>
                <TableRow>
                  <TableCell
                    className="td-head td-left"
                    style={{ whiteSpace: 'nowrap', width: '100px' }}
                  >
                    면허업종
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-lcnsTpbizCd"
                    >
                      면허업종
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'005'}
                      pValue={body.lcnsTpbizCd}
                      handleChange={handleBodyChange}
                      pName={'lcnsTpbizCd'}
                      htmlFor={'sch-lcnsTpbizCd'}
                      defaultValue={body.lcnsTpbizCd}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className="td-head td-left"
                    style={{ whiteSpace: 'nowrap', width: '100px' }}
                  >
                    소유구분
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="sch-vhclPsnCd"
                    >
                      소유구분
                    </CustomFormLabel>
                    <CommSelect
                      cdGroupNm={'036'}
                      pValue={body.vhclPsnCd}
                      handleChange={handleBodyChange}
                      pName={'vhclPsnCd'}
                      htmlFor={'sch-vhclPsnCd'}
                      defaultValue={body.vhclPsnCd}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TrCarModal
