'use client'
import React, { useContext, useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
// import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { SelectItem } from 'select'
import { getCtpvCd, getLocGovCd } from '@/utils/fsms/common/comm'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled'

interface FormDialogProps {
  open: boolean
  handleClickClose: () => void
  size?: DialogProps['maxWidth']
}

export interface userSearch {
  userNm?: string //사용자명
  ctpvCd?: string //시도코드
  locgovCd?: string //지자체코드
  lgnId?: string //사용자아이디
  pswd?: string //사용자패스워드
  pswdChk?: string //사용자패스워드 체크
  certYn?: string //
}

const FormDialogPw: React.FC<FormDialogProps> = ({
  open,
  handleClickClose,
  size,
}) => {
  // const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)
  const [isResultMode, setIsResultMode] = useState<boolean>(false) // 모드 상태 관리
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([])

  // // 회원정보
  const [params, setParams] = useState<userSearch>({
    userNm: '', // 사용자명
    ctpvCd: '', // 시도코드
    locgovCd: '', // 지자체코드
    lgnId: '', // 사용자아이디
    certYn: '', //
    pswd: '', //
    pswdChk: '', //
  })

  useEffect(() => {
    if (open) {
      getCtpvCd().then((itemArr) => {
        setCtpvCdItems(itemArr)
        setParams((prev) => ({ ...prev, ctpvCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
      }) // 시도코드
    }
    setIsResultMode(false)
  }, [open])

  useEffect(() => {
    // 시도 코드 변경시 관할관청 재조회
    // 관할관청
    if (params.ctpvCd) {
      getLocGovCd(params.ctpvCd).then((itemArr) => {
        setLocgovCdItems(itemArr)
        setParams((prev) => ({ ...prev, locgovCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
      })
    }
  }, [params.ctpvCd])

  // useEffect(() => {
  //   setParams((prev) => ({ ...prev, instCd: itemArr[0].value }))
  // }, [isResultMode])

  const resetParams = () => {
    setParams({
      userNm: '', // 사용자명
      ctpvCd: '', // 시도코드
      locgovCd: '51150', // 지자체코드
      lgnId: '', // 사용자아이디
      certYn: '', //
      pswd: '', //
      pswdChk: '', //
    })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = () => {
    if (params.lgnId == '') {
      alert('사용자 아이디를 입력해 주세요.')
      return
    }
    if (params.userNm == '') {
      alert('사용자 명을 입력해 주세요.')
      return
    }

    window.removeEventListener('message', messageHandler)
    const width = 420
    const height = 560
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const options = `
        width=${width},
        height=${height},
        top=${top},
        left=${left},
        location=no,
        menubar=no,
        toolbar=no,
        status=no,
        scrollbars=yes,
        resizable=no
        `

    const popup = window.open(
      `${process.env.NEXT_PUBLIC_API_DOMAIN}/gpkisecureweb/jsp/login.jsp`,
      '_blank',
      options,
    )

    window.addEventListener('message', messageHandler)
  }

  const messageHandler = async (event: MessageEvent) => {
    //if (event.origin !== process.env.NEXT_PUBLIC_API_DOMAIN) return
    window.removeEventListener('message', messageHandler)

    fetchData(event.data)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  //본인 확인
  const fetchData = async (subDn: String) => {
    try {
      let endpoint: string =
        `/fsm/cmm/ips/cm/getUserCertYn?subDn=` +
        subDn +
        `${params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${params.lgnId ? '&lgnId=' + params.lgnId : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      // setLoadingBackdrop(true)
      const response = await sendHttpRequest('GET', endpoint, null, false, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        if (response.data.certYn && response.data.certYn == 'Y') {
          // handleClickClose()
          setIsResultMode(true)
        } else {
          alert('사용자를 찾지 못했습니다. 다시 시도해 주세요.')
          // setIsResultMode(true)//테스트용
        }
      } else {
        alert('사용자를 찾지 못했습니다. 다시 시도해 주세요.')
        // setIsResultMode(true)//테스트용
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      // setLoadingBackdrop(false)
    }
  }

  //패스워드 변경
  const saveData = async () => {
    if (params.pswd == '') {
      alert('변경할 패스워드를 입력해 주세요.')
      return
    }
    if (params.pswdChk == '' || params.pswd != params.pswdChk) {
      alert('동일한 패스워드 입력해 주세요.')
      return
    }

    try {
      const jsonData = {
        pswd: params.pswd, // 사용자명
        lgnId: params.lgnId, //지자체코드
      }

      let endpoint: string = `/fsm/cmm/ips/cm/updatePassword`

      // setLoadingBackdrop(true)
      const response = await sendHttpRequest('PUT', endpoint, jsonData, false, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert('패스워드 변경을 완료 하였습니다.')
        setIsResultMode(false)
        clickClose()
      } else {
        alert('패스워드 변경을 실패하였습니다.')
        console.log('Error save data:', response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error save data:', error)
    } finally {
      // setLoadingBackdrop(false)
    }
  }

  //모달 닫기
  const clickClose = () => {
    setIsResultMode(false)
    handleClickClose()
    resetParams()
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open} onClose={clickClose}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>비밀번호변경</h2>
            <div className="button-right-align">
              <Button variant="contained" color="dark" onClick={clickClose}>
                취소
              </Button>
              {!isResultMode ? (
                <Button
                  onClick={() => handleSearch()}
                  variant="contained"
                  form="form-modal"
                  color="primary"
                >
                  {' '}
                  다음{' '}
                </Button>
              ) : (
                <Button
                  onClick={() => saveData()}
                  variant="contained"
                  form="form-modal"
                  color="primary"
                >
                  {' '}
                  변경{' '}
                </Button>
              )}
            </div>
          </Box>

          <Box
            id="form-modal"
            // component='form'
            // onSubmit={() => fetchData()}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            {!isResultMode ? (
              <TableContainer className="table table-bordered">
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>아이디
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="text"
                          id="lgnId"
                          name="lgnId"
                          value={params.lgnId}
                          fullWidth
                          onChange={handleChange}
                          // onKeyDown={handleKeyDown}
                          // style={{minWidth:'360px'}}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>사용자명
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="text"
                          id="userNm"
                          name="userNm"
                          value={params.userNm}
                          fullWidth
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          // style={{minWidth:'360px'}}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>지자체
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <div className="input_group">
                          <div className="input">
                            <label htmlFor="ft-select-01"></label>
                            <select
                              id="ft-select-01"
                              className="custom-default-select"
                              name="ctpvCd"
                              value={params.ctpvCd}
                              onChange={handleChange}
                              style={{ width: '100%' }}
                            >
                              {ctpvCdItems.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="input">
                            <label htmlFor="ft-select-02"></label>
                            <select
                              id="ft-select-02"
                              className="custom-default-select"
                              name="locgovCd"
                              value={params.locgovCd}
                              onChange={handleChange}
                              style={{ width: '100%' }}
                            >
                              {locgovCdItems.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer className="table table-bordered">
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>비밀번호
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="password"
                          id="pswd"
                          name="pswd"
                          value={params.pswd}
                          fullWidth
                          onChange={handleChange}
                          autoComplete={'off'}
                          // onKeyDown={handleKeyDown}
                          // style={{minWidth:'360px'}}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="td-head"
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>비밀번호 확인
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="password"
                          id="pswdChk"
                          name="pswdChk"
                          value={params.pswdChk}
                          fullWidth
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          autoComplete={'off'}
                          // style={{minWidth:'360px'}}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          {/* <LoadingBackdrop open={loadingBackdrop} /> */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FormDialogPw
