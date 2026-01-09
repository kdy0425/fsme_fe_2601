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
import React, { useEffect, useState } from 'react'
import { Row } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { number } from '@amcharts/amcharts4/core'
import { isAlphaNum } from '@/utils/fsms/common/comm'

interface ModalFormProps {
  data?: Row
  formType: 'create' | 'update'
  title?: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  reloadFunc?: () => void
}

type reData = {
  clsfCd: string // 코드그룹명
  clsfCdNm: string // 코드명
  clsfSeCd: string // 코드그룹한글명
  clsfPrntCd: string // 코드설명
  clsfPrntNm: string // 코드구분명
  sortSeq: number // 코드 순서
  useYn: 'Y' // 사용여부
}

const RegisterModalForm = (props: ModalFormProps) => {
  const {
    data,
    formType,
    title,
    isOpen,
    setOpen,
    reloadFunc,
  } = props

  const [params, setParams] = useState<Row>({
    clsfCd: '', // 코드그룹명
    clsfCdNm: '', // 코드명
    clsfSeCd: 'A', // 코드그룹한글명
    clsfPrntCd: '', // 코드설명
    clsfPrntNm: '',
    sortSeq: 0, // 코드 순서
    useYn: 'Y', // 사용여부
    useNm: '',
  })

  const resetData: reData = {
    clsfCd: '', // 분류코드
    clsfCdNm: '', // 분류코드명
    clsfSeCd: 'A', // 분류구분코드
    clsfPrntCd: '', // 분류부모코드
    clsfPrntNm: '', // 분류부모코드명
    sortSeq: 0, // 코드 순서
    useYn: 'Y', // 사용여부
  }

  // 🔹 화면에는 안 보이고, 접근성/검사도구용 라벨에만 쓰는 스타일
  const srOnlyStyle: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  }

  // 부모코드 옵션을 위한 상태
  const [parentCodeOptions, setParentCodeOptions] = useState([
    { value: '', label: '선택하세요' },
  ])

  // 부모코드 목록을 DB(API)에서 가져오기
  useEffect(() => {
    async function fetchParentCodes() {
      try {
        let endpoint: string =
          `/fsm/star/cm/cm/getAllStatsClsfCd?clsfSeCd=A&useYn=Y`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })
        // 예시: [{ code: 'A', name: 'A 코드' }, ...]
        if (response && response.resultType === 'success') {
          const options = (response.data.content as Array<{
            clsfCd: string
            clsfCdNm: string
            clsfPrntCd?: string | null
          }>)
            .filter(
              item =>
                item.clsfPrntCd === null ||
                item.clsfPrntCd === '' ||
                item.clsfPrntCd === undefined,
            ) // 부모코드가 없는 애들만
            .filter(item => item.clsfCd !== params.clsfCd) // 본인 코드 제외
            .map(item => ({
              value: item.clsfCd,
              label: item.clsfCdNm,
            }))
          setParentCodeOptions([{ value: '', label: '선택하세요' }, ...options])
        }
      } catch (error) {
        // 에러 처리
        console.error('Error get parrent Code data:', error)
        setParentCodeOptions([{ value: '', label: '선택하세요' }])
      }
    }
    fetchParentCodes()
  }, [params.clsfCd]) // 본인 코드가 바뀌면 다시 불러오기

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    console.log('FormModal data:', data)
    if (formType == 'update' && data) {
      setParams(data)
    } else {
      setParams(resetData as any)
    }
  }, [isOpen, data])

  useEffect(() => {
    console.log('FormModal isOpen:', isOpen, 'data:', data, 'formType:', formType)
  }, [isOpen, data, formType])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const MAX_CLSF_CD_LEN = 10
  const MAX_CLSF_CD_NM_LEN = 50

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    // 분류코드: 영문/숫자만 + 10자리 제한
    if (name === 'clsfCd') {
      // 길이 제한(먼저 컷)
      if (value.length > MAX_CLSF_CD_LEN) {
        alert(`분류코드는 최대 ${MAX_CLSF_CD_LEN}자리까지 입력 가능합니다.`)
        return
      }
      // 문자 제한
      if (value && !isAlphaNum(value)) {
        alert('분류코드는 영문 및 숫자 조합으로만 가능합니다.')
        return
      }
    }

    // 분류코드명: 50자리 제한
    if (name === 'clsfCdNm') {
      if (value.length > MAX_CLSF_CD_NM_LEN) {
        alert(`분류코드명은 최대 ${MAX_CLSF_CD_NM_LEN}자리까지 입력 가능합니다.`)
        return
      }
    }
    setParams(prev => ({ ...prev, [name]: value }))
  }

  const createCode = async () => {

    if (!validation()) {
      return
    }

    let endpoint: string = `/fsm/star/cm/cm/createClsfCd`

    const userConfirm = confirm(`분류코드정보를 등록하시겠습니까?`)

    if (userConfirm) {
      try {
        const response = await sendHttpRequest('POST', endpoint, params, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert(response.message)
          reloadFunc?.()
          setOpen(false)
        } else {
          alert(response.message)
        }
      } catch (error) {
        alert('등록오류 입니다.')
        setOpen(false)
      }
    } else {
      return
    }
  }
  const updateCode = async () => {

    if (!validation()) {
      return
    }

    let endpoint: string = `/fsm/star/cm/cm/updateClsfCd`

    const userConfirm = confirm('분류코드정보를 수정하시겠습니까?')

    if (userConfirm) {
      try {
        console.log('FormModal update data:', data)
        const response = await sendHttpRequest('PUT', endpoint, params, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          console.log('update response:', response)
          alert(response.message)
          reloadFunc?.()
          setOpen(false)
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Error updating code:', error)
        alert('수정오류 입니다.')
        setOpen(false)
      }
    } else {
      return
    }
  }
  const deleteCode = async () => {
    let endpoint: string = `/fsm/star/cm/cm/deleteClsfCd`

    const userConfirm = confirm('분류코드정보를 삭제하시겠습니까?')

    if (userConfirm) {
      try {
        const response = await sendHttpRequest(
          'DELETE',
          endpoint,
          params,
          true,
          {
            cache: 'no-store',
          },
        )

        if (response && response.resultType === 'success') {
          alert(response.message)
          if (reloadFunc) reloadFunc()
          setOpen(false)
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error(error)
        alert('삭제오류 입니다.')
        setOpen(false)
      }
    } else {
      return
    }
  }

  const validation = (): boolean => {
    if (!params.clsfCd.trim()) {
      alert('분류코드를 입력해 주세요.')
    } else if (!isAlphaNum(params.clsfCd)) {
      alert('분류코드는 영문 및 숫자 조합으로만 가능합니다.')
    } else if (!params.clsfCdNm.trim()) {
      alert('분류코드명을 입력해 주세요.')
    } else if (params.sortSeq === '' || params.sortSeq === null) {
      alert('정렬순서를 입력해 주세요.')
    } else {
      return true
    }
    return false
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={isOpen}
        onClose={handleClose}
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
                onClick={
                  formType == 'create'
                    ? () => createCode()
                    : () => updateCode()
                }
              >
                저장
              </Button>
              {formType == 'update' ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deleteCode()}
                >
                  삭제
                </Button>
              ) : (
                ''
              )}
              <Button variant="contained" color="dark" onClick={handleClose}>
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
                    style={{ width: '150px', minWidth: '150px' }}
                    align={'left'}
                  >
                    <span className="required-text">*</span>분류코드
                  </TableCell>
                  <TableCell
                    style={{
                      width: '500px',
                      minWidth: '300px',
                      textAlign: 'left',
                    }}
                  >
                    {formType == 'update' ? (
                      params.clsfCd
                    ) : (
                      <CustomTextField
                        type="text"
                        id="modal-clsfCd"
                        name="clsfCd"
                        onChange={handleParamChange}
                        value={params.clsfCd}
                        fullWidth
                        inputProps={{ maxLength: 10 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <span className="required-text">*</span>분류코드명
                  </TableCell>
                  <TableCell
                    style={{
                      width: '500px',
                      minWidth: '300px',
                      textAlign: 'left',
                    }}
                  >
                    <CustomTextField
                      type="text"
                      id="modal-clsfCdNm"
                      name="clsfCdNm"
                      onChange={handleParamChange}
                      value={params.clsfCdNm}
                      fullWidth
                      variant="outlined"
                      size="small"
                      margin="dense"
                      inputProps={{ maxLength: 50 }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    부모코드
                  </TableCell>
                  {/* 🔹 부모코드 셀: 숨김 라벨 + aria-label 추가 */}
                  <TableCell style={{ position: 'relative' }}>
                    <label
                      htmlFor="modal-clsfPrntCd"
                      style={srOnlyStyle}
                    >
                      부모코드
                    </label>
                    <CustomSelect
                      id="modal-clsfPrntCd"
                      name="clsfPrntCd"
                      value={params.clsfPrntCd}
                      onChange={handleParamChange}
                      fullWidth
                      inputProps={{
                        'aria-label': '부모코드',
                        title: '부모코드',
                      }}
                    >
                      {parentCodeOptions
                        .filter(option => option.value !== params.clsfCd) // 본인 코드 제외
                        .map(option => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                    </CustomSelect>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <span className="required-text"></span>정렬순서
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="number"
                      id="modal-sortSeq"
                      name="sortSeq"
                      onChange={handleParamChange}
                      value={params.sortSeq}
                      fullWidth
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
                          <CustomRadio
                            id="chk_Y"
                            name="useYn"
                            value="Y"
                          />
                        }
                        label="사용"
                      />
                      <FormControlLabel
                        control={
                          <CustomRadio
                            id="chk_N"
                            name="useYn"
                            value="N"
                          />
                        }
                        label="미사용"
                      />
                    </RadioGroup>
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

export default RegisterModalForm
