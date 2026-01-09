import React, { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { getDateRange } from '@/utils/fsms/common/comm'

interface ReportDateModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (start: string, end: string) => void
}

const searchValidation = (start: string, end: string) => {
  if (!start) {
    alert('시작일자를 입력 해주세요')
    return false
  }
  if (!end) {
    alert('종료일자를 입력 해주세요')
    return false
  }
  if (start > end) {
    alert('시작일자가 종료일자보다 큽니다.\n다시 확인해주세요.')
    return false
  }
  return true
}

const ReportDateModal = ({
  open,
  onClose,
  onConfirm,
}: ReportDateModalProps) => {
  const getDefaultDate = () => getDateRange('d', 0)
    const [start, setStart] = useState(getDefaultDate().startDate)
    const [end, setEnd] = useState(getDefaultDate().endDate)
  
    useEffect(() => {
      if (open) {
        const { startDate, endDate } = getDefaultDate()
        setStart(startDate)
        setEnd(endDate)
      }
    }, [open])

  const handleConfirm = () => {
    if (searchValidation(start, end)) {
      onConfirm(start, end)
    }
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogContent>
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>화물카드 연계정보 출력</h2>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirm}
            >
              출력
            </Button>
            <Button
              variant="contained"
              color="dark"
              onClick={onClose}
              sx={{ ml: 1 }}
            >
              취소
            </Button>
          </div>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display" required>
                  기간
                </CustomFormLabel>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-start"
                >
                  시작
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-start"
                  name="start"
                  value={start}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)}
                  fullWidth
                />
                ~
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-date-end"
                >
                  종료
                </CustomFormLabel>
                <CustomTextField
                  type="date"
                  id="ft-date-end"
                  name="end"
                  value={end}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)}
                  fullWidth
                />
              </div>
            </div>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ReportDateModal