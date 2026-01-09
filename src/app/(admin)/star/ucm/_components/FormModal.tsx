/* React */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

/* mui component */
import { CustomFormLabel, CustomRadio, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { isAlphaNum, isNumber } from '@/utils/fsms/common/comm'
import { toQueryParameter } from '@/utils/fsms/utils'

/* type */
import { Row, form } from '../page'
import { SelectItem } from 'select'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

type ModalFormProps = {
  selectedRow?: Row
  formType: form
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  reloadFunc: () => void
}

type procDataType = {
  clsfCd: string // 단위코드
  clsfCdNm: string // 단위코드명
  clsfSeCd: string // 단위구분코드
  clsfPrntCd: string // 단위부모구분코드
  sortSeq: string | number // 코드 순서
  useYn: string // 사용여부
}

const RegisterModalForm = (props: ModalFormProps) => {
  const { selectedRow, formType, isOpen, setIsOpen, reloadFunc } = props

  const [params, setParams] = useState<procDataType>({
    clsfCd: '',
    clsfCdNm: '',
    clsfSeCd: 'C',
    clsfPrntCd: '',
    sortSeq: 0,
    useYn: 'Y',
  })

  // 부모코드 옵션을 위한 상태
  const [parentCodeOptions, setParentCodeOptions] = useState<SelectItem[]>([
    { value: '', label: '선택하세요' },
  ])

  // 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    if (formType == 'update' && selectedRow) {
      setParams((prev) => ({
        ...prev,
        clsfCd: selectedRow.clsfCd,
        clsfCdNm: selectedRow.clsfCdNm,
        clsfPrntCd: selectedRow.clsfPrntCd,
        sortSeq: selectedRow.sortSeq,
        useYn: selectedRow.useYn,
      }))
    }
    fetchParentCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // 부모코드 목록을 DB(API)에서 가져오기
  const fetchParentCodes = async (): Promise<void> => {
    try {
      const searchObj = { clsfSeCd: 'C', useYn: 'Y' }
      const endpoint =
        '/fsm/star/cm/cm/getAllStatsClsfCd' + toQueryParameter(searchObj)
      const response = await sendHttpRequest(
        'GET',
        endpoint,
        null,
        true,
        { cache: 'no-store' },
      )

      // 예시: [{ code: 'A', name: 'A 코드' }, ...]
      if (
        response &&
        response.resultType === 'success' &&
        response.data.content.length !== 0
      ) {
        const options: SelectItem[] = (response.data.content as Row[])
          .filter((item) => !item.clsfPrntCd) // 부모코드가 없는 애들만
          .filter((item) => item.clsfCd !== params.clsfCd) // 본인 코드 제외
          .map((item) => ({
            value: item.clsfCd,
            label: item.clsfCdNm,
          }))
        setParentCodeOptions([{ value: '', label: '선택하세요' }, ...options])
      }
    } catch (error) {
      console.error('Error get parrent Code data:', error)
      alert('[부모코드 채번오류 c] 관리자에게 문의부탁드립니다')
    }
  }

  const MAX_CLSF_CD_LEN = 10
  const MAX_CLSF_CD_NM_LEN = 50
  // 값 변경
  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = event.target
    if (name === 'sortSeq') {
      if (isNumber(value)) {
        const tempValue = value !== '' ? Number(value).toString() : value
        setParams((prev) => ({ ...prev, [name]: tempValue }))
      }
      return
    }

    if (name === 'clsfCd') {
      if (value.length > MAX_CLSF_CD_LEN) {
        alert(`단위코드는 최대 ${MAX_CLSF_CD_LEN}자리까지 입력 가능합니다.`)
        return
      }
      if (value && !isAlphaNum(value)) {
        alert('단위코드는 영문 및 숫자 조합으로만 가능합니다.')
        return
      }
      setParams((prev) => ({ ...prev, [name]: value }))
      return
    }

    if (name === 'clsfCdNm') {
      if (value.length > MAX_CLSF_CD_NM_LEN) {
        alert(`단위코드명은 최대 ${MAX_CLSF_CD_NM_LEN}자리까지 입력 가능합니다.`)
        return
      }
      setParams((prev) => ({ ...prev, [name]: value }))
      return
    }

    setParams((prev) => ({ ...prev, [name]: value }))

    // if (name === 'sortSeq') {
    //   if (isNumber(value)) {
    //     const tempValue = value !== '' ? Number(value).toString() : value
    //     setParams((prev) => ({ ...prev, [name]: tempValue }))
    //   }
    // } else if (name === 'clsfCd') {
    //   if (value && !isAlphaNum(value)) {
    //     alert('단위코드는 영문 및 숫자 조합으로만 가능합니다.')
    //   } else {
    //     setParams((prev) => ({ ...prev, [name]: value }))
    //   }
    // } else {
    //   setParams((prev) => ({ ...prev, [name]: value }))
    // }
  }

  // 데이터 검증
  const validation = (): boolean => {
    if (!params.clsfCd) {
      alert('단위코드를 입력해 주세요.')
    } else if (!isAlphaNum(params.clsfCd)) {
      alert('단위코드는 영문 및 숫자 조합으로만 가능합니다.')
    } else if (!params.clsfCdNm) {
      alert('단위코드명을 입력해 주세요.')
    } else if (!params.useYn) {
      alert('사용여부를 선택해 주세요.')
    } else {
      return true
    }
    return false
  }

  // 등록 & 저장
  const handleSave = async (): Promise<void> => {
    if (validation()) {
      const endpoint =
        formType === 'create'
          ? '/fsm/star/cm/cm/createClsfCd'
          : '/fsm/star/cm/cm/updateClsfCd'
      const method = formType === 'create' ? 'POST' : 'PUT'
      const msg = formType === 'create' ? '등록' : '수정'

      if (confirm('단위코드정보를 ' + msg + '하시겠습니까?')) {
        try {
          setLoadingBackdrop(true)
          const response = await sendHttpRequest(
            method,
            endpoint,
            params,
            true,
            { cache: 'no-store' },
          )

          if (response && response.resultType === 'success') {
            alert(msg + '되었습니다.')
            reloadFunc()
            setIsOpen(false)
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.error(error)
          alert(msg + '오류 입니다.')
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }
  }

  // 삭제
  const deleteCode = async (): Promise<void> => {
    if (confirm('단위코드정보를 삭제하시겠습니까?')) {
      try {
        setLoadingBackdrop(true)
        const endpoint = '/fsm/star/cm/cm/deleteClsfCd'
        const response = await sendHttpRequest(
          'DELETE',
          endpoint,
          params,
          true,
          { cache: 'no-store' },
        )

        if (response && response.resultType === 'success') {
          alert('삭제 되었습니다.')
          reloadFunc()
          setIsOpen(false)
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error(error)
        alert('삭제오류 입니다.')
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  return (
    <Box>
      <Dialog fullWidth={false} maxWidth={'lg'} open={isOpen}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>단위코드 {formType === 'create' ? '등록' : '수정'}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={handleSave}>
                저장
              </Button>
              {formType == 'update' ? (
                <Button variant="contained" color="error" onClick={deleteCode}>
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
                {/* 단위코드 */}
                <TableRow>
                  <TableCell
                    className="td-head table-title-column"
                    style={{ width: '150px', minWidth: '150px' }}
                    align={'left'}
                  >
                    <label htmlFor="modal-clsfCd">
                      <span className="required-text">*</span>단위코드
                    </label>
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

                {/* 단위코드명 */}
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <label htmlFor="modal-clsfCdNm">
                      <span className="required-text">*</span>단위코드명
                    </label>
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

                {/* 부모코드 – native select 사용 */}
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <label htmlFor="modal-clsfPrntCd">부모코드</label>
                  </TableCell>
                  <TableCell>
                    <select
                      id="modal-clsfPrntCd"
                      name="clsfPrntCd"
                      value={params.clsfPrntCd}
                      onChange={handleParamChange as any}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '8px',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                    >
                      {parentCodeOptions
                        .filter(
                          (option) =>
                            !option.value || option.value !== params.clsfCd,
                        ) // 본인 코드 제외
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </TableCell>
                </TableRow>

                {/* 정렬순서 */}
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <label htmlFor="modal-sortSeq">
                      <span className="required-text"></span>정렬순서
                    </label>
                  </TableCell>
                  <TableCell>
                    <CustomTextField
                      type="text"
                      id="modal-sortSeq"
                      name="sortSeq"
                      onChange={handleParamChange}
                      value={params.sortSeq}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                {/* 사용여부 – RadioGroup + aria-labelledby */}
                <TableRow>
                  <TableCell className="td-head table-title-column">
                    <label id="modal-useYn-label">
                      <span className="required-text">*</span>사용여부
                    </label>
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      row
                      id="modal-radio-useYn"
                      name="useYn"
                      value={params.useYn}
                      onChange={handleParamChange as any}
                      className="mui-custom-radio-group"
                      aria-labelledby="modal-useYn-label"
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
              </TableBody>
            </Table>
          </TableContainer>

          {/* 로딩 */}
          {loadingBackdrop && <LoadingBackdrop open={loadingBackdrop} />}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default RegisterModalForm
