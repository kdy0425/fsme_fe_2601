'use client'

import { Box, Dialog, DialogContent, Radio, RadioGroup, FormControlLabel, Paper, Alert,Button, FormControl, Stack, Typography } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel'
import { useDispatch, useSelector } from '@/store/hooks'
import { AppState } from '@/store/store'
import { useEffect, useState } from 'react'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import { closeExmnOptModal } from '@/store/popup/ilp/ExmnOptSlice'

type ExmnOption = 'plan' | 'result'

type Props = {
  onProceed: (option: ExmnOption) => void; // 부모 콜백
  onClose?: () => void;
};

const ExmnOptModal: React.FC<Props> = ({ onProceed, onClose }) => {
  const dispatch = useDispatch()
  const { eoModalOpen } = useSelector((state: AppState) => state.ExmnOptInfo)

  const [loading] = useState<boolean>(false)
  const [value, setValue] = useState<ExmnOption>('plan')

  useEffect(() => {
    if (eoModalOpen) {
      setValue('plan') // 모달 열릴 때 기본값 초기화
    }
  }, [eoModalOpen])

  const handleClose = () => {
    dispatch(closeExmnOptModal())
  }

  const handleConfirm = () => {
     onProceed(value);
     dispatch(closeExmnOptModal())
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={eoModalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick') return
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleConfirm()
          }
        }}
      >
        <DialogContent>
          {/* 상단 영역: 제목 + 버튼 */}
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>조사 처리 선택</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={handleConfirm}>
                진행
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                닫기
              </Button>
            </div>
          </Box>

          {/* 본문 폼 영역 */}
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              {/* 1) 처리유형 + 라디오 : 라벨을 라디오 박스 높이에 맞춰 가운데 정렬 */}
              <div className="form-group" style={{ alignItems: 'center', width: '100%' }}>
                <CustomFormLabel className="input-label-display" required>
                  처리유형
                </CustomFormLabel>

                {/* 오른쪽 필드 영역 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (t) => t.palette.action.hover,

                      /* 라벨 캡슐 제거 */
                      '& .MuiFormControlLabel-root, & .MuiFormControlLabel-root *': {
                        border: 'none !important',
                        outline: 'none !important',
                        boxShadow: 'none !important',
                        background: 'transparent !important',
                      },
                      '& .MuiFormControlLabel-root': { m: 0, px: 0, py: 0.25 },
                      '& .MuiFormControlLabel-root::before, & .MuiFormControlLabel-root::after': {
                        content: '""',
                        display: 'none',
                      },

                      /* 라디오 버튼 주변의 작은 박스(의사요소/hover 배경) 제거 */
                      '& .MuiRadio-root': {
                        p: 0.25,
                        border: '0 !important',
                        background: 'transparent !important',
                        boxShadow: 'none !important',
                        '&:hover': { backgroundColor: 'transparent !important' },
                        '&.Mui-focusVisible': { outline: 'none' },
                        '&::before, &::after': { content: '""', display: 'none' },
                      },
                      '& .MuiRadio-root .MuiTouchRipple-root': { display: 'none !important' },
                    }}
                  >
                    <FormControl>
                      <RadioGroup
                        name="exmnOption"
                        value={value}
                        onChange={(e) => setValue(e.target.value as 'plan' | 'result')}
                      >
                        <FormControlLabel
                          value="plan"
                          control={<Radio size="small" />}
                          label="현장조사계획 등록 (선택)"
                        />
                        <FormControlLabel
                          value="result"
                          control={<Radio size="small" />}
                          label="조사대상 확정 (필수)"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Paper>
                </Box>
              </div>

              {/* 안내 문구 */}
              <div className="form-group" style={{ width: '100%' }}>
                {/* 라벨 폭 정렬 유지용 (시각적으로는 숨김) */}
                <CustomFormLabel className="input-label-display" sx={{ visibility: 'hidden' }} aria-hidden>
                  처리유형
                </CustomFormLabel>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Alert
                    icon={<InfoOutlined sx={{ fontSize: 18 }} />}
                    severity="info"
                    variant="standard"
                    sx={{
                      mt: 1.25,
                      px: 1.25,
                      py: 0.6,
                      bgcolor: 'transparent',
                      border: 'none',
                      color: (t) => t.palette.info.main,
                      alignItems: 'flex-start',
                      '& .MuiAlert-icon': {
                        mr: 1,
                        mt: '2px',                // 필요하면 0~4px 사이로 미세 조정
                        alignSelf: 'flex-start',
                        color: 'inherit',
                      },
                      '& .MuiAlert-message': { p: 0, m: 0 }, // 메시지 기본 패딩 제거
                    }}
                  >
                    <Stack spacing={0.25} sx={{ lineHeight: 1.28 /* ← 더 줄이고 싶으면 1.24~1.26 */ }}>
                      <Typography variant="body2" sx={{ m: 0, fontSize: 13 }}>
                        현장조사계획을 선택하면 현장조사계획 등록을 완료한 뒤 ‘조사대상 확정’ 단계로 이동합니다.
                      </Typography>
                      <Typography variant="body2" sx={{ m: 0, fontSize: 13 }}>
                        ‘조사대상 확정’을 선택하면 현장조사계획 등록 없이 바로 해당 단계로 이동합니다.
                      </Typography>
                    </Stack>
                  </Alert>
                </Box>
              </div>
            </Box>
          </Box>

          <LoadingBackdrop open={loading} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ExmnOptModal