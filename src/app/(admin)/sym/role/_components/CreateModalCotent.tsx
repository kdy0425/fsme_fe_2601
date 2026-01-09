'use client'

import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  Box,
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { getUserInfo } from '@/utils/fsms/utils'
import {
  FormControlLabel,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Row } from '../page'

interface Body {
  roleCd: string
  roleNm: string
  roleSeCd: string
  useYn: string
  prhibtRsnCn: string
  rgtrId: string
  userTypeCd: string
  typeNm: string
}

interface ModalProperties {
  reload: () => void
}

const CreateModalContent = (props: ModalProperties) => {
  const userInfo = getUserInfo()

  const { reload } = props

  const [regType, setRegType] = useState<string>('01')
  const [body, setBody] = useState<Body>({
    roleCd: '',
    roleNm: '',
    roleSeCd: '01',
    useYn: 'Y',
    prhibtRsnCn: '',
    rgtrId: '',
    userTypeCd: '',
    typeNm: '',
  })

  const [roleCdItems, setRoleCdItems] = useState<Row[]>([]) // 조회 라디오 클릭 시 역할코드 콤보박스

  useEffect(() => {
    if (userInfo.lgnId) {
      setBody((prev) => ({
        ...prev,
        rgtrId: userInfo.lgnId,
      }))
    }
  }, [])

  useEffect(() => {
    if (regType === '02') {
      getRoleCdItems()
    } else {
      setBody({
        roleCd: '',
        roleNm: '',
        roleSeCd: '01',
        useYn: 'Y',
        prhibtRsnCn: '',
        rgtrId: '',
        userTypeCd: '',
        typeNm: '',
      })
    }
  }, [regType])

  useEffect(() => {
    if (body.roleCd !== '') {
      setBody((prev) => ({
        ...prev,
        userTypeCd: body.roleCd + '_',
      }))

      if (regType === '02') {
        roleCdItems.find((item) => {
          if (item.roleCd === body.roleCd) {
            setBody((prev) => ({
              ...prev,
              roleNm: item.roleNm,
            }))
          }
        })
      }
    }
  }, [body.roleCd])

  const getRoleCdItems = async () => {
    try {
      let endpoint: string = `/fsm/sym/role/cm/getAllRole`

      const res = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (res.resultType === 'success' && res.data) {
        setRoleCdItems(res.data)

        if (res.data.length > 0) {
          setBody((prev) => ({
            ...prev,
            roleCd: res.data[0].roleCd,
            roleNm: res.data[0].roleNm,
          }))
        }
      }
    } catch (error) {
      console.error('Error ::: ', error)
    }
  }

  const createRole = async () => {
    try {
      if (body.roleCd === '') {
        alert('역할코드를 입력해주세요.')
        return
      }

      if (body.roleNm === '') {
        alert('역할명을 입력해주세요.')
        return
      }

      if (body.roleSeCd === '') {
        alert('역할구분을 선택해주세요.')
        return
      }

      if (body.userTypeCd === '') {
        alert('사용자유형코드를 입력해주세요.')
        return
      }

      if (body.typeNm === '') {
        alert('사용자유형명을 입력해주세요.')
        return
      }

      let endpoint: string = `/fsm/sym/role/cm/createRole`

      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        reload()
      } else {
        alert('등록에 실패하였습니다.')
      }
    } catch (error) {
      console.error('Error ::: ', error)
    }
  }

  const handleBodyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    setBody((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    createRole()
  }

  return (
    <>
      <Box
        component={'form'}
        id="create-role"
        onSubmit={handleSubmit}
        sx={{ minWidth: '800px' }}
      >
        <TableContainer>
          <CustomFormLabel className="input-label-display">
            <h3>역할정보</h3>
          </CustomFormLabel>
          <Table className="table table-bordered">
            <TableBody>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>등록구분
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <RadioGroup
                      row
                      id="radio-regType"
                      value={regType}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRegType(e.target.value)
                      }
                      className="mui-custom-radio-group"
                      style={{ marginRight: '16px' }}
                    >
                      <FormControlLabel
                        control={<CustomRadio id="chk_01" value="01" />}
                        label="신규등록"
                      />
                      <FormControlLabel
                        control={<CustomRadio id="chk_02" value="02" />}
                        label="조회"
                      />
                    </RadioGroup>
                    {regType === '02' ? (
                      <select
                        id="select-roleCd"
                        className="custom-default-select"
                        name="roleCd"
                        value={body.roleCd}
                        onChange={handleBodyChange}
                        style={{ width: '20%' }}
                      >
                        {roleCdItems.map((option) => (
                          <option key={option.roleCd} value={option.roleCd}>
                            {option.roleNm}
                          </option>
                        ))}
                      </select>
                    ) : (
                      ''
                    )}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow style={{ minHeight: '44px' }}>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>역할코드
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  {regType === '02' ? (
                    body.roleCd
                  ) : (
                    <CustomTextField
                      id="ft-roleCd"
                      name="roleCd"
                      value={body.roleCd}
                      onChange={handleBodyChange}
                      fullWidth
                    />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>역할명
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  {regType === '02' ? (
                    body.roleNm
                  ) : (
                    <CustomTextField
                      id="ft-roleNm"
                      name="roleNm"
                      value={body.roleNm}
                      onChange={handleBodyChange}
                      fullWidth
                    />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>역할구분
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  <CustomFormLabel className="input-label-none" htmlFor={'sch-roleSeCd'}>역할구분</CustomFormLabel>
                  <CommSelect
                    cdGroupNm={'102'}
                    pName={'roleSeCd'}
                    htmlFor={'sch-roleSeCd'}
                    pValue={body.roleSeCd}
                    handleChange={handleBodyChange}
                    width="20%"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  사유
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  <CustomTextField
                    id="ft-prhibtRsnCn"
                    name="prhibtRsnCn"
                    value={body.prhibtRsnCn}
                    onChange={handleBodyChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer>
          <CustomFormLabel className="input-label-display">
            <h3>사용자유형정보</h3>
          </CustomFormLabel>
          <Table className="table table-bordered">
            <TableBody>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>사용자유형코드
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  <CustomTextField
                    id="ft-userTypeCd"
                    name="userTypeCd"
                    value={body.userTypeCd}
                    onChange={handleBodyChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>사용자유형명
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  <CustomTextField
                    id="ft-type"
                    name="typeNm"
                    value={body.typeNm}
                    onChange={handleBodyChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  사용여부
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  <RadioGroup
                    row
                    id="radio-useYn"
                    name="useYn"
                    value={body.useYn}
                    onChange={handleBodyChange}
                    className="mui-custom-radio-group"
                    style={{ marginRight: '16px' }}
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
      </Box>
    </>
  )
}

export default CreateModalContent
