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

interface FormDialogProps {
  open: boolean
  handleClickClose: () => void
  size?: DialogProps['maxWidth']
  lgnId?: String
}

export interface userSearch {
  userNm?: string //사용자명
  ctpvCd?: string //시도코드
  locgovCd?: string //지자체코드
  lgnId?: string //사용자아이디
  certYn?: string //
}

const FormDialogId: React.FC<FormDialogProps> = ({
  open,
  handleClickClose,
  lgnId,
}) => {
  // const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)
  const [isResultMode, setIsResultMode] = useState<boolean>(false) // 모드 상태 관리
  const [ctpvCdItems, setCtpvCdItems] = useState<SelectItem[]>([])
  const [locgovCdItems, setLocgovCdItems] = useState<SelectItem[]>([])
  const [searchLgnId, setSearchLgnId] = useState<String | undefined>(lgnId)

  // // 회원정보
  const [params, setParams] = useState<userSearch>({
    userNm: '', // 사용자명
    ctpvCd: '', // 시도코드
    locgovCd: '51150', // 지자체코드
    lgnId: '', // 사용자아이디
    certYn: '', //
  })

  useEffect(() => {
    // console.log('open : ', open)
    if (open) {
      getCtpvCd().then((itemArr) => {
        setCtpvCdItems(itemArr)
        setParams((prev) => ({ ...prev, ctpvCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
      }) // 시도코드
    }
  }, [open])

  useEffect(() => {
    // 시도 코드 변경시 관할관청 재조회
    // 관할관청
    // console.log('params.ctpvCd : ', params.ctpvCd)
    if (params.ctpvCd) {
      getLocGovCd(params.ctpvCd).then((itemArr) => {
        setLocgovCdItems(itemArr)
        setParams((prev) => ({ ...prev, locgovCd: itemArr[0].value })) // 첫번째 아이템으로 기본값 설정
      })
    }
  }, [params.ctpvCd])

  const resetParams = () => {
    setParams({
      userNm: '', // 사용자명
      ctpvCd: '', // 시도코드
      locgovCd: '', // 지자체코드
      lgnId: '', // 사용자아이디
      certYn: '', //
    })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const validation = () => {
    if (params.userNm == '') {
      return false
    }
    return true
  }

  const handleSearch = () => {
    if (!validation()) {
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

  const fetchData = async (subDn: string) => {
    try {
      let endpoint: string =
        `/fsm/cmm/ips/cm/findIdSearch?subDn=` +
        subDn +
        `${params.userNm ? '&userNm=' + params.userNm : ''}` +
        `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}`

      // setLoadingBackdrop(true)
      const response = await sendHttpRequest('GET', endpoint, null, false, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // handleClickClose()
        if (response.data.lgnId) {
          setIsResultMode(true)
          setParams((prev) => ({ ...prev, lgnId: response.data.lgnId }))
          setSearchLgnId(response.data.lgnId)
        } else {
          alert('사용자정보를 찾지 못했습니다. 다시 시도해 주세요.')
        }
      } else {
        alert('사용자정보를 찾지 못했습니다. 다시 시도해 주세요.')
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      // setLoadingBackdrop(false)
    }
  }

  //모달 닫기
  const clickClose = () => {
    setIsResultMode(false)
    handleClickClose()
    resetParams()
    // console.log('modal lgnId : ', lgnId)
    // console.log('modal searchLgnId : ', searchLgnId)
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open} onClose={clickClose}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <h2>아이디찾기</h2>
            <div className="button-right-align">
              {!isResultMode ? (
                <>
                  <Button variant="contained" color="dark" onClick={clickClose}>
                    취소
                  </Button>
                  <Button
                    onClick={() => handleSearch()}
                    variant="contained"
                    form="form-modal"
                    color="primary"
                  >
                    다음
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => clickClose()}
                  variant="contained"
                  form="form-modal"
                  color="primary"
                >
                  확인
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
              <div className="box-con-col" style={{ padding: '5px 30px' }}>
                <Box sx={{ textAlign: 'center' }}>
                  {' '}
                  아이디를 확인하였습니다.{' '}
                </Box>
                <div className="contents-explanation-cc">
                  <div className="contents-explanation-inner">
                    <div
                      className="contents-explanation-text"
                      style={{ textAlign: 'center', padding: '25px' }}
                    >
                      아이디 &nbsp; : &nbsp; {params.lgnId}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Box>
          {/* <LoadingBackdrop open={loadingBackdrop} /> */}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default FormDialogId
