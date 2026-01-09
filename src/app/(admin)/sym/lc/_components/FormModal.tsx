'use client'

import { CtpvSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControlLabel,
  RadioGroup,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from '../page'
import SearchModal from './SearchModal'

interface FormModalProps {
  type: 'I' | 'U'
  buttonLabel?: string
  title: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  row: Row | null
  size?: DialogProps['maxWidth'] | 'lg'
  reload: () => void
}

type data = {
  locgovCd: string
  locgovNm: string
  ctpvCd: string
  ctpvNm: string
  locgovSeCd: string
  clclnLocgovCd: string
  clclnLocgovNm: string
  [key: string]: string | number
}

export default function FormModal(props: FormModalProps) {
  const { buttonLabel, title, row, size, isOpen, setOpen, type, reload } = props
  const [params, setParams] = useState({
    locgovCd: '',
    locgovNm: '',
    ctpvCd: '',
    ctpvNm: '',
    locgovSeCd: '01',
    clclnLocgovCd: '',
    clclnLocgovNm: '',
  })

  const resetData: data = {
    locgovCd: '',
    locgovNm: '',
    ctpvCd: '',
    ctpvNm: '',
    locgovSeCd: '01',
    clclnLocgovCd: '',
    clclnLocgovNm: '',
  }

  const [data, setData] = useState<data>(resetData)
  const [LoadingBackdrop, setLoadingBackdrop] = useState(false) // 데이터처리시 로딩

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (row && type === 'U') {
      setParams({
        locgovCd: row.locgovCd,
        locgovNm: row.locgovNm,
        ctpvCd: row.ctpvCd,
        ctpvNm: row.ctpvNm,
        locgovSeCd: '01',
        clclnLocgovCd: row.clclnLocgovCd,
        clclnLocgovNm: row.clclnLocgovNm,
      })
    } else {
      setParams(resetData)
    }
  }, [isOpen])

  const handleRowClick = (rowData: Row) => {
    setParams((prev) => ({
      ...prev,
      clclnLocgovCd: rowData['locgovCd'],
      clclnLocgovNm: rowData['locgovNm'],
    }))
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const createLocgovCd = async () => {
    let endpoint: string =
      type === 'I'
        ? `/fsm/sym/lc/cm/createLocgovCd`
        : `/fsm/sym/lc/cm/updateLocgovCd`
    let body = {
      locgovCd: params.locgovCd,
      locgovNm: params.locgovNm,
      ctpvCd: params.ctpvCd,
      clclnLocgovCd: params.clclnLocgovCd
        ? params.clclnLocgovCd
        : params.locgovCd,
    }

    const regex = /^\d{5}$/

    if (!regex.test(params.locgovCd)) {
      alert('지자체코드는 숫자 5자리로 입력해야 합니다.')
      return
    }

    const userConfirm = confirm('지자체코드를 저장하시겠습니까?')

    if (userConfirm) {
      const response = await sendHttpRequest(
        type === 'I' ? 'POST' : 'PUT',
        endpoint,
        body,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        alert(response.message)
        reload()
        setOpen(false)
      } else {
        alert(response.message)
      }
    } else {
      return
    }
  }

  const deleteData = async () => {
    try {
      let endpoint: string = `/fsm/sym/lc/cm/deleteLocgovCd`

      let body = {
        locgovCd: params.locgovCd,
        locgovNm: params.locgovNm,
        ctpvCd: params.ctpvCd,
        clclnLocgovCd: params.clclnLocgovCd
          ? params.clclnLocgovCd
          : params.locgovCd,
      }

      const regex = /^\d{5}$/

      if (!regex.test(params.locgovCd)) {
        alert('지자체코드는 숫자 5자리로 입력해야 합니다.')
        return
      }

      const userConfirm = confirm('지자체코드를 삭제하시겠습니까?')
      setLoadingBackdrop(true)

      if (userConfirm) {
        const response = await sendHttpRequest('DELETE', endpoint, body, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          reload()
          setOpen(false)
          setLoadingBackdrop(false)
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      console.error('Error Post Data : ', error)
    }
  }

  return (
    <React.Fragment>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        {buttonLabel}
      </Button> */}
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={isOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              {type === 'U' ? (
                <h2>지자체코드 수정</h2>
              ) : (
                <>
                  <h2>지자체코드 등록</h2>
                </>
              )}
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                form="form-modal"
                color="primary"
                onClick={createLocgovCd}
              >
                저장
              </Button>
              {type === 'U' ? (
                <Button
                  variant="contained"
                  form="form-modal"
                  color="error"
                  onClick={deleteData}
                >
                  삭제
                </Button>
              ) : (
                <></>
              )}
              <Button onClick={handleClose} variant="contained" color="dark">
                취소
              </Button>
            </div>
          </Box>
          <Box
            id="form-modal"
            onSubmit={createLocgovCd}
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <div id="alert-dialog-description1">
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>사업자 정보 테이블 요약</caption>
                  <colgroup>
                    <col style={{ width: '16%' }}></col>
                    <col style={{ width: '17%' }}></col>
                    <col style={{ width: '16%' }}></col>
                    <col style={{ width: '17%' }}></col>
                    <col style={{ width: '16%' }}></col>
                    <col style={{ width: '17%' }}></col>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row" colSpan={2}>
                        <span className="required-text">*</span>시도명
                      </th>
                      <td colSpan={4}>
                        <div className="form-group" style={{ width: '100%' }}>
                          {type === 'U' ? (
                            params.ctpvNm
                          ) : (
                            <>
                              <CtpvSelect
                                pValue={params.ctpvCd}
                                handleChange={handleParamChange}
                                htmlFor={'sch-ctpv'}
                              />
                              {/* <CustomSelect
                              id="ft-select-01"
                              name="ctpvCd"
                              className="custom-default-select"
                              value={params.ctpvCd}
                              onChange={handleParamChange}
                              required
                              fullWidth
                            >
                              {cityCode.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </CustomSelect> */}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row" colSpan={2}>
                        <span className="required-text">*</span>지자체구분
                      </th>
                      <td colSpan={4}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <RadioGroup
                            row
                            id="modal-radio-useYn"
                            name="locgovSeCd"
                            value={params.locgovSeCd}
                            onChange={handleParamChange}
                            className="mui-custom-radio-group"
                          >
                            {/* <FormControlLabel
                          control={<CustomRadio id="locgovSeCd_1" name="locgovSeCd" value="1" />}
                          label="시도"
                        /> */}
                            <FormControlLabel
                              control={
                                <CustomRadio
                                  id="locgovSeCd_0"
                                  name="locgovSeCd"
                                  value="01"
                                />
                              }
                              label="관할관청"
                            />
                          </RadioGroup>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row" colSpan={2}>
                        <span className="required-text">*</span>지자체코드
                      </th>
                      <td colSpan={4}>
                        <div className="form-group" style={{ width: '100%' }}>
                          {type === 'U' ? (
                            params.locgovCd
                          ) : (
                            <>
                              <CustomTextField
                                required
                                type="text"
                                id="modal-locgovCd"
                                name="locgovCd"
                                value={params.locgovCd}
                                onChange={handleParamChange}
                                fullWidth
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row" colSpan={2}>
                        <span className="required-text">*</span>지자체명
                      </th>
                      <td colSpan={4}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomTextField
                            required
                            type="text"
                            id="modal-locgovNm"
                            name="locgovNm"
                            value={params.locgovNm}
                            onChange={handleParamChange}
                            fullWidth
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row" colSpan={2}>
                        정산지자체
                      </th>
                      <td colSpan={4}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomTextField
                            type="text"
                            id="modal-clclnLocgovCd"
                            name="clclnLocgovCd"
                            value={params.clclnLocgovCd}
                            onChange={handleParamChange}
                          />
                          <SearchModal
                            selectedCtpvCd={params.ctpvCd}
                            handleRowClick={handleRowClick}
                          />
                          <CustomTextField
                            type="text"
                            id="modal-clclnLocgovNm"
                            name="clclnLocgovNm"
                            value={params.clclnLocgovNm}
                            onChange={handleParamChange}
                            inputProps={{
                              readOnly: true,
                              placeholder: '등록지자체가 자동으로 매핑됩니다.',
                            }}
                            fullWidth
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
