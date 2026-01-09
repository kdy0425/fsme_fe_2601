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
  TableRow,
} from '@mui/material'
import { useEffect, useState } from 'react'

interface Data {
  roleCd: string
  roleNm: string
  roleSeCd: string
  roleExpln: string
  useYn: string
  prhibtRsnCn: string
  rgtrId: string
  regDt: string
  mdfrId: string
  mdfcnDt: string
  userTypeCd: string
  typeNm: string
  roleSeNm: string
  useNm: string
}

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
  userTypeCd: string
  roleCd: string
  regType: 'DETAIL' | 'UPDATE'
}

const DetailModalContent = (props: ModalProperties) => {
  const userInfo = getUserInfo()

  const { reload, userTypeCd, roleCd, regType } = props

  const [data, setData] = useState<Data>({
    roleCd: '',
    roleNm: '',
    roleSeCd: '',
    roleExpln: '',
    useYn: '',
    prhibtRsnCn: '',
    rgtrId: '',
    regDt: '',
    mdfrId: '',
    mdfcnDt: '',
    userTypeCd: '',
    typeNm: '',
    roleSeNm: '',
    useNm: '',
  })

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

  useEffect(() => {
    getRoleData()

    if (userInfo.lgnId) {
      setBody((prev) => ({
        ...prev,
        rgtrId: userInfo.lgnId,
      }))
    }
  }, [])

  useEffect(() => {
    if (regType === 'DETAIL') {
      getRoleData()
    } else if (regType === 'UPDATE') {
      setBody((prev) => ({
        ...prev,
        roleCd: data.roleCd,
        roleNm: data.roleNm,
        roleSeCd: data.roleSeCd,
        useYn: data.useYn,
        prhibtRsnCn: data.prhibtRsnCn,
        userTypeCd: data.userTypeCd,
        typeNm: data.typeNm,
      }))
    }
  }, [regType])

  useEffect(() => {
    console.log('body ::: ', body)
  }, [body])

  const getRoleData = async () => {
    try {
      let endpoint: string = `/fsm/sym/role/cm/getOneRoleUserType?userTypeCd=${userTypeCd}&roleCd=${roleCd}`

      const res = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (res.resultType === 'success' && res.data) {
        setData(res.data)
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

  const updateData = async () => {
    try {
      const userConfirm = confirm('해당 역할정보를 수정하시겠습니까?')

      if (!userConfirm) return

      let endpoint: string = `/fsm/sym/role/cm/updateRole`

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        reload()
      }
    } catch (error) {
      console.error('Error ::: ', error)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    updateData()
  }

  return (
    <>
      <Box
        component={'form'}
        id="update-role"
        onSubmit={handleSubmit}
        sx={{ minWidth: '800px' }}
      >
        <TableContainer>
          <CustomFormLabel className="input-label-display">
            <h3>역할정보</h3>
          </CustomFormLabel>
          <Table className="table table-bordered">
            <TableBody>
              <TableRow style={{ minHeight: '44px' }}>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>역할코드
                </TableCell>
                <TableCell style={{ width: '80%' }}>{data.roleCd}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="td-head td-center"
                  style={{ width: '20%' }}
                >
                  <span className="required-text">*</span>역할명
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  {regType === 'DETAIL' ? (
                    data.roleNm
                  ) : (
                    <CustomTextField
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
                  {regType === 'DETAIL' ? (
                    data.roleSeNm
                  ) : (
                    <CommSelect
                      cdGroupNm={'102'}
                      pName={'roleSeCd'}
                      pValue={body.roleSeCd}
                      defaultValue={data.roleSeCd}
                      handleChange={handleBodyChange}
                      addText="선택"
                      width="20%"
                    />
                  )}
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
                  {regType === 'DETAIL' ? (
                    data.prhibtRsnCn
                  ) : (
                    <CustomTextField
                      name="prhibtRsnCn"
                      value={body.prhibtRsnCn}
                      onChange={handleBodyChange}
                      fullWidth
                    />
                  )}
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
                  {data.userTypeCd}
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
                  {regType === 'DETAIL' ? (
                    data.typeNm
                  ) : (
                    <CustomTextField
                      name="typeNm"
                      value={body.typeNm}
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
                  사용여부
                </TableCell>
                <TableCell style={{ width: '80%' }}>
                  {regType === 'DETAIL' ? (
                    data.useNm
                  ) : (
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
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

export default DetailModalContent
