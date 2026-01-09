/* react */
import React, { SetStateAction, useEffect, useState } from 'react'

/* mui component */
import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* ../page */
import { modalDataType, dataType, formType } from '../page'
import { isNumber } from '@/utils/fsms/common/comm'

interface ModalFormProps {
  modalData: modalDataType
  dataType: dataType
  formType: formType
  isOpen: boolean
  setIsOpen: React.Dispatch<SetStateAction<boolean>>
  reloadFunc: () => void
}

const RegisterModalForm = (props: ModalFormProps) => {
  const { modalData, dataType, formType, isOpen, setIsOpen, reloadFunc } = props

  const [params, setParams] = useState<modalDataType>({
    cdGroupNm: '', // 코드그룹명
    cdExpln: '', // 코드설명
    useYn: 'Y', // 사용여부
    cdKornNm: '', // 코드그룹한글명 / 코드한글명
    /* 코드그룹 */
    cdSeNm: '', // 코드구분명
    comCdYn: 'Y', // 공통코드여부
    /* 공통코드 */
    cdSeq: '', // 코드 순서
    cdNm: '', // 코드명
  })

  const [cdGroupNmDisabled, setCdGroupNmDisabled] = useState<boolean>(false) // 코드그룹명 활성화 여부
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false) // 저장시 로딩상태

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    if (isOpen) {
      if (formType === 'update') {
        setParams({
          cdGroupNm: modalData.cdGroupNm,
          cdExpln: modalData.cdExpln,
          useYn: modalData.useYn,
          cdKornNm: modalData.cdKornNm,
          cdSeNm: modalData.cdSeNm,
          comCdYn: modalData.comCdYn,
          cdSeq: modalData.cdSeq,
          cdNm: modalData.cdNm,
        })
      }

      // 수정 또는 공통코드 등록시 코드그룹명 비활성화 및 값 입력
      if (formType === 'update' || dataType === 'code') {
        setCdGroupNmDisabled(true)
        setParams((prev) => ({ ...prev, cdGroupNm: modalData.cdGroupNm }))
      }
    }
  }, [isOpen])

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    if (name === 'cdSeq') {
      if (isNumber(value)) {
        const tempValue = value !== '' ? Number(value).toString() : value
        setParams((prev) => ({ ...prev, [name]: tempValue }))
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validation = (): boolean => {
    if (!params.cdGroupNm.trim()) {
      alert('코드그룹명을 입력해 주세요.')
    } else if (!params.cdKornNm.trim()) {
      const msg =
        dataType === 'group'
          ? '코드그룹한글명을 입력해 주세요.'
          : '코드한글명을 입력해 주세요.'
      alert(msg)
    } else if (dataType === 'code' && !params.cdNm.trim()) {
      alert('코드명을 입력해 주세요.')
    } else if (dataType === 'code' && !params.cdExpln.trim()) {
      alert('코드설명을 입력해 주세요.')
    } else if (!params.useYn) {
      alert('사용여부를 선택해 주세요.')
    } else if (dataType === 'group' && !params.comCdYn) {
      alert('공통코드여부를 선택해 주세요.')
    } else {
      return true
    }
    return false
  }

  const handleSaveCode = async (isDel?: boolean) => {
    // 등록 및 저장시에만 데이터 검증
    if (!isDel && !validation()) {
      return
    }

    let userConfirm = false

    if (isDel) {
      userConfirm = confirm(
        dataType == 'group'
          ? '코드그룹정보를 삭제하시겠습니까?'
          : '공통코드를 삭제하시겠습니까?',
      )
    } else if (formType === 'create') {
      userConfirm = confirm(
        dataType === 'group'
          ? '코드그룹정보를 등록하시겠습니까?'
          : '공통코드를 등록하시겠습니까?',
      )
    } else {
      userConfirm = confirm(
        dataType == 'group'
          ? '코드그룹정보를 수정하시겠습니까?'
          : '공통코드를 수정하시겠습니까?',
      )
    }

    if (userConfirm) {
      try {
        setLoadingBackdrop(true)
        let endpoint = ''
        let method: 'DELETE' | 'POST' | 'PUT' = 'DELETE'

        if (isDel) {
          endpoint =
            dataType === 'group'
              ? '/fsm/sym/cc/cm/deleteCmmnCdGroup'
              : '/fsm/sym/cc/cm/deleteCmmnCd'
          method = 'DELETE'
        } else if (formType === 'create') {
          endpoint =
            dataType === 'group'
              ? '/fsm/sym/cc/cm/createCmmnCdGroup'
              : '/fsm/sym/cc/cm/createCmmnCd'
          method = 'POST'
        } else {
          endpoint =
            dataType === 'group'
              ? '/fsm/sym/cc/cm/updateCmmnCdGroup'
              : '/fsm/sym/cc/cm/updateCmmnCd'
          method = 'PUT'
        }

        const response = await sendHttpRequest(method, endpoint, params, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          reloadFunc()
          setIsOpen(false)
        } else {
          alert(response.message)
        }
      } catch (error) {
        alert('관리자에게 문의 부탁드립니다.')
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>
                {dataType === 'group' ? '코드그룹' : '공통코드'}
                {formType === 'create' ? '등록' : '수정'}
              </h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveCode()}
              >
                저장
              </Button>
              {formType == 'update' ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleSaveCode(true)}
                >
                  삭제
                </Button>
              ) : null}
              <Button
                variant="contained"
                color="dark"
                onClick={() => setIsOpen(false)}
              >
                취소
              </Button>
            </div>
          </Box>
          <TableContainer
            className="table-scrollable"
            style={{ margin: '16px 0 4em 0' }}
          >
            <Table
              className="table table-bordered"
              aria-labelledby="tableTitle"
            >
              <TableBody>
                <TableRow>
                  <TableCell
                    className="td-head table-title-column"
                    style={{ width: '150px' }}
                    align={'left'}
                  >
                    <span className="required-text">*</span>코드그룹명
                  </TableCell>
                  <TableCell style={{ width: '500px', textAlign: 'left' }}>
                    <CustomTextField
                      type="text"
                      id="modal-cdGroupNm"
                      name="cdGroupNm"
                      onChange={handleParamChange}
                      value={params.cdGroupNm}
                      fullWidth
                      inputProps={{
                        disabled: cdGroupNmDisabled,
                      }}
                      readOnly={cdGroupNmDisabled}
                    />
                  </TableCell>
                </TableRow>

                {dataType === 'group' ? (
                  <TableRow>
                    <TableCell className="td-head table-title-column">
                      코드구분명
                    </TableCell>
                    <TableCell>
                      <CustomTextField
                        type="text"
                        id="modal-cdSeNm"
                        name="cdSeNm"
                        onChange={handleParamChange}
                        value={params.cdSeNm}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell className="td-head table-title-column">
                      <span className="required-text">*</span>코드명
                    </TableCell>
                    <TableCell style={{ textAlign: 'left' }}>
                      <CustomTextField
                        type="text"
                        id="modal-cdNm"
                        name="cdNm"
                        onChange={handleParamChange}
                        value={params.cdNm}
                        fullWidth
                        inputProps={{
                          disabled: formType === 'update',
                        }}
                        readOnly={formType === 'update'}
                      />
                    </TableCell>
                  </TableRow>
                )}

                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <span className="required-text">*</span>
                    {dataType === 'group' ? '코드그룹한글명' : '코드한글명'}
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="text"
                      id="modal-cdKornNm"
                      name="cdKornNm"
                      onChange={handleParamChange}
                      value={params.cdKornNm}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    {dataType === 'code' ? (
                      <span className="required-text">*</span>
                    ) : null}
                    코드설명
                  </TableCell>
                  <TableCell>
                    <CustomFormLabel
                      className="input-label-none"
                      htmlFor="modal-cdExpln"
                    >
                      코드설명
                    </CustomFormLabel>
                    <textarea
                      className="MuiTextArea-custom"
                      id="modal-cdExpln"
                      name="cdExpln"
                      onChange={handleParamChange}
                      value={params.cdExpln}
                      rows={5}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <span className="required-text">*</span>사용여부
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      row
                      id="modal-radio-useYn"
                      name="useYn"
                      value={params.useYn}
                      onChange={handleParamChange}
                      className="mui-custom-radio-group"
                    >
                      <FormControlLabel
                        control={
                          <CustomRadio id="chk_Y" name="useYn" value="Y" />
                        }
                        label="사용"
                      />
                      <FormControlLabel
                        control={
                          <CustomRadio id="chk_N" name="useYn" value="N" />
                        }
                        label="미사용"
                      />
                    </RadioGroup>
                  </TableCell>
                </TableRow>

                {dataType === 'group' ? (
                  <TableRow>
                    <TableCell className="td-head table-title-column">
                      <span className="required-text">*</span>공통코드여부
                    </TableCell>
                    <TableCell style={{ textAlign: 'left' }}>
                      <CustomSelect
                        id="modal-select-comCdYn"
                        name="comCdYn"
                        value={params.comCdYn}
                        onChange={handleParamChange}
                        variant="outlined"
                        style={{ width: '150px' }}
                      >
                        <MenuItem key={'N'} value={'N'}>
                          N
                        </MenuItem>
                        <MenuItem key={'Y'} value={'Y'}>
                          Y
                        </MenuItem>
                      </CustomSelect>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell className="td-head table-title-column">
                      코드순서
                    </TableCell>
                    <TableCell style={{ textAlign: 'left' }}>
                      <CustomTextField
                        type="text"
                        id="modal-cdSeq"
                        name="cdSeq"
                        onChange={handleParamChange}
                        value={params.cdSeq}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RegisterModalForm
