'use client'

import { CustomFormLabel, CustomRadio } from '@/utils/fsms/fsm/mui-imports'
import {
  Button,
  Dialog,
  DialogContent,
  Box,
  FormControlLabel,
  RadioGroup,
  DialogProps,
  Grid,
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { HeadCell } from 'table'
import TableDataGrid from '@/app/components/tables/CommDataGrid'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import VhclSearchModal from '@/app/components/bs/popup/VhclSearchModal'
import CarNumberSearchModal from './CarNumberSearchModal'
import RrBrNumSearchModal from './RrBrNumSearchModal'
import CarManageInfoSysModal from './CarManageInfoSysModal'

interface FormModalProps {
  size?: DialogProps['maxWidth'] | 'lg'
  isOpen: boolean
  setClose: () => void
}

export default function SearchRadioModal(props: FormModalProps) {
  const { size, isOpen, setClose } = props

  const [radio, setRadio] = useState<'A' | 'B' | 'C'>('A') // 초기값과 타입 지정
  const [showNextModal, setShowNextModal] = useState<boolean>(false)
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false)

  //모든 모달 닫힘.
  const handleClose = () => {
    setClose()
    setShowNextModal(false) // Close the secondary modal as well when the main modal is closed
    setShowSearchModal(false)
  }

  // 창을 선택하는 라디오 동작
  const handleRadio = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setRadio(value as 'A' | 'B' | 'C') // 타입 캐스팅으로 'A', 'B', 'C' 중 하나로 제한
  }

  // 다음 모달 오픈
  const handleNextButtonClick = () => {
    setShowNextModal(true)
  }

  const componentMap: Record<'A' | 'B' | 'C', JSX.Element> = {
    A: <CarNumberSearchModal open={showNextModal} onCloseClick={handleClose} />,
    B: <RrBrNumSearchModal open={showNextModal} onCloseClick={handleClose} />,
    C: (
      <CarManageInfoSysModal open={showNextModal} onCloseClick={handleClose} />
    ),
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={isOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>검색유형 선택</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                type="button"
                color="primary"
                onClick={handleNextButtonClick}
              >
                확인
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              border: '1px solid #d3d3d3',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <div className="form-group" style={{ width: 'inherit' }}>
              <RadioGroup
                name="useYn"
                onChange={handleRadio}
                value={radio} // 상태 변수를 value로 설정
                className="mui-custom-radio-group"
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      value="A"
                      control={<CustomRadio />}
                      label="유가보조금관리시스템-화물 (차량번호 검색)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      value="B"
                      control={<CustomRadio />}
                      label="유가보조금관리시스템-화물 (주민/법인/사업자등록번호 검색)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      value="C"
                      control={<CustomRadio />}
                      label="자동차관리정보시스템-버스/택시/화물"
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
            </div>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 다음 모달 렌더링 */}
      {showNextModal && componentMap[radio]}
    </Box>
  )
}
