import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableContainer,
} from '@mui/material'
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel'

import { closeStdTnkCpctyModal } from '@/store/popup/StdTnkCpctySlice'

type stdTnkObj = {
  stdTnk: string
  tnkCpcty: string
}

const StdTnkModal = () => {
  const StdTnkInfo = useSelector((state: AppState) => state.StdTnkInfo)
  const dispatch = useDispatch()

  const stdTnkArr: stdTnkObj[] = [
    { stdTnk: '1톤이하', tnkCpcty: '130' },
    { stdTnk: '3톤이하', tnkCpcty: '200' },
    { stdTnk: '5톤이하', tnkCpcty: '400' },
    { stdTnk: '8톤이하', tnkCpcty: '400' },
    { stdTnk: '10톤이하', tnkCpcty: '400' },
    { stdTnk: '12톤이하', tnkCpcty: '600' },
    { stdTnk: '12톤초과', tnkCpcty: '800' },
  ]

  const handleCloseModal = () => {
    dispatch(closeStdTnkCpctyModal())
  }

  return (
    <Box>
      <Dialog
        PaperProps={{
          style: {
            maxWidth: 'none',
            width: '40%', // 필요에 따라 너비 지정
          },
        }}
        disableEscapeKeyDown
        open={StdTnkInfo.STCModalOpen}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>탱크용량 초과주유 기준용량</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseModal}
              >
                닫기
              </Button>
            </div>
          </Box>
          <TableContainer>
            <Table className="table table-bordered">
              <colgroup>
                <col style={{ width: '50%' }} />
                <col style={{ width: '50%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head">톤급구분</th>
                  <th className="td-head">기준용량(ℓ)</th>
                </tr>
                {stdTnkArr.map((v: stdTnkObj, i) => {
                  return (
                    <tr>
                      <td className="td-center">{v.stdTnk}</td>
                      <td className="td-center">{v.tnkCpcty}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default StdTnkModal
