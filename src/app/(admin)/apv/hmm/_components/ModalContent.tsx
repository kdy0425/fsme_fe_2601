import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { Row } from '../page'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
/* 공통 js */
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { isNumber } from '@/utils/fsms/common/comm'
import AddrSearchModal, {
  AddrRow,
} from '@/app/components/popup/AddrSearchModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
interface formDataInterface {
  frcsNm: string
  frcsBrno: string
  frcsTelno: string
  frcsZip: string
  frcsAddr: string
}

interface ReqItem {
  crdcoCd: string
  crdcoNm: string
  frcsNo: string
  sttsCd: string
  sttsNm: string
  chgRsnCd: 'I' | 'D'
  dataType: 'I' | 'U'
}

interface ModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  type: 'create' | 'update'
  row: Row | null
  handleAdvancedSearch: () => void
}

const RegisterModalForm = (props: ModalProps) => {
  const { open, setOpen, type, row, handleAdvancedSearch } = props

  const userInfo = getUserInfo()
  const [crdcoCodeList, setCrdcoCodeList] = useState<SelectItem[]>([]) // 카드사 코드리스트
  const [sttsCodeList, setsttsCodeList] = useState<SelectItem[]>([]) // 보조금지급여부 코드리스트
  const [formData, setFormData] = useState<formDataInterface>({
    frcsNm: '',
    frcsBrno: '',
    frcsTelno: '',
    frcsZip: '',
    frcsAddr: '',
  }) // 처리데이터(단건)
  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false)
  const [reqList, setReqList] = useState<ReqItem[]>([]) // 처리데이터(다건)
  const [reqListFlag, setReqListFlag] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 모달창 오픈시 로직처리
  useEffect(() => {
    if (open) {
      settingCodeList()
      settingFormData()
    }
  }, [open])

  useEffect(() => {
    // 코드리스트 세팅 후 등록 및 수정 리스트 세팅
    if (reqListFlag) {
      settingReqList()
    }
  }, [reqListFlag])

  // 코드리스트 세팅
  const settingCodeList = async () => {
    setCrdcoCodeList(await getCodeList('CCGC'))
    setsttsCodeList(await getCodeList('HSTS'))
    setReqListFlag(true)
  }

  // 코드리스트 가져오기
  const getCodeList = async (code: string) => {
    const result: SelectItem[] = []

    await getCodesByGroupNm(code).then((res) => {
      if (res) {
        res.map((code: any) => {
          result.push({
            label: code['cdKornNm'],
            value: code['cdNm'],
          })
        })
      }
    })

    return result
  }

  // 수정일경우 현재 선택된 로우의 정보로 세팅
  const settingFormData = () => {
    setFormData({
      frcsNm: row?.frcsNm ?? '',
      frcsBrno: row?.frcsBrno ?? '',
      frcsTelno: row?.frcsTelno ?? '',
      frcsZip: row?.frcsZip ?? '',
      frcsAddr: row?.frcsAddr ?? '',
    })
  }

  // 로우세팅
  const settingReqList = async () => {
    const temp: ReqItem[] = []

    // 수정일경우 현재 선택된 로우의 가맹점번호로 등록된 모든 수소가맹점을 가져옴
    if (type == 'update') {
      try {
        const searchObj = {
          frcsBrno: row?.frcsBrno,
          searchType: 'All',
        }

        const endPoint =
          '/fsm/apv/hmm/cm/getAllHydMrhstMng' + toQueryParameter(searchObj)
        const response = await sendHttpRequest('GET', endPoint, null, true, {
          cache: 'no-store',
        })

        if (
          response &&
          response.resultType === 'success' &&
          response.data.content.length != 0
        ) {
          // 데이터 조회 성공시
          response.data.content.map((item: Row, index: number) => {
            temp.push({
              crdcoCd: item.crdcoCd,
              crdcoNm: item.crdcoNm,
              frcsNo: item.frcsNo,
              dataType: 'U',
              sttsCd: item.sttsCd,
              sttsNm: item.sttsNm,
              chgRsnCd: item.sttsCd == '000' ? 'I' : 'D',
            })
          })
        } else {
          alert('가맹점사업자번호를 다시 확인해주세요.')
          setOpen(false)
        }
      } catch (error) {
        // 에러시
        alert('관리자에게 문의 부탁드립니다.')
        setOpen(false)
      } finally {
        setReqListFlag(false)
      }
    }

    temp.push({
      crdcoCd: crdcoCodeList[0].value,
      crdcoNm: '',
      frcsNo: '',
      dataType: 'I',
      sttsCd: '000',
      sttsNm: '지급',
      chgRsnCd: 'I',
    })

    setReqList(temp)
  }

  // 정보 수정시
  const handleDataChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'frcsBrno' || name === 'frcsTelno') {
      if (isNumber(value)) {
        setFormData((prev: any) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  // 우편번호 클릭시
  const searchAddress = () => {
    setAddrModalOpen(true)
  }

  // 추가클릭시
  const addListItem = () => {
    const temp: ReqItem[] = reqList.slice()

    temp.push({
      crdcoCd: crdcoCodeList[0].value,
      crdcoNm: '',
      frcsNo: '',
      dataType: 'I',
      sttsCd: '000',
      sttsNm: '지급',
      chgRsnCd: 'I',
    })

    setReqList(temp)
  }

  // 삭제클릭시
  const deleteListItem = (rownum: number) => {
    const temp: ReqItem[] = []
    reqList.map((item, index) => {
      if (index != rownum) {
        temp.push(item)
      }
    })

    setReqList(temp)
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
  ) => {
    const { name, value } = event.target
    const temp: ReqItem[] = reqList.slice()

    if (name == 'sttsCd') {
      const chgRsnCd = value == '000' ? 'I' : 'D'
      temp.splice(index, 1, {
        ...reqList[index],
        [name]: value,
        chgRsnCd: chgRsnCd,
      })
    } else if (name == 'frcsNo') {
      if (isNumber(value)) {
        temp.splice(index, 1, { ...reqList[index], [name]: value })
      } else {
        return
      }
    } else {
      temp.splice(index, 1, { ...reqList[index], [name]: value })
    }

    setReqList(temp)
  }

  const checkDuplication = async (): Promise<boolean> => {
    try {
      const endpoint: string = `/fsm/apv/hmm/cm/getCompositeMrhstList`

      const resultList: any[] = []

      // 등록시에만 검증
      reqList.map((item) => {
        if (item.dataType == 'I') {
          resultList.push({
            crdcoCd: item.crdcoCd,
            frcsNo: item.frcsNo,
            dataType: item.dataType,
          })
        }
      })

      if (resultList.length == 0) {
        return true
      }

      const body = { frcsBrno: formData.frcsBrno, reqList: resultList }
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        let res = response.data

        let userConfirm: boolean

        if (res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            userConfirm = confirm(
              `카드사명: ${res[i].crdcoNm}\n` +
                `가맹점번호: ${res[i].frcsNo}\n` +
                `사업자등록번호: ${res[i].frcsBrno}\n\n` +
                `해당정보들의 가맹점은 현재 일반가맹점으로 등록 되어있습니다. 복합충전소로 등록하시겠습니까?`,
            )

            if (userConfirm === false) {
              return false
            }
          }
        }

        // 넘어오는 리스트 없거나 복합충전소로 등록하는 경우
        return true
      } else {
        alert(response.message)
        return false
      }
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const sendData = async () => {
    if (validation()) {
      const msg = type === 'create' ? '등록' : '수정'

      if (confirm(msg + ' 하시겠습니까?')) {
        try {
          const checkCompsite: boolean = await checkDuplication()

          setLoadingBackdrop(true)

          // 복합주유소 등록 체크
          if (checkCompsite === true) {
            const endpoint: string = `/fsm/apv/hmm/cm/createHydMrhstMng`
            const body = {
              frcsNm: formData.frcsNm,
              frcsBrno: formData.frcsBrno,
              frcsAddr: formData.frcsAddr,
              frcsZip: formData.frcsZip,
              frcsTelno: formData.frcsTelno,
              mdfrId: userInfo.lgnId,
              rgtrId: userInfo.lgnId,
              reqList: reqList,
            }

            const response = await sendHttpRequest(
              'POST',
              endpoint,
              body,
              true,
              { cache: 'no-store' },
            )

            if (response && response.resultType == 'success') {
              alert('완료되었습니다.')
              handleAdvancedSearch()

              setOpen(false)
            } else {
              alert(response.message)
            }
          }
        } catch (error) {
          console.error('ERROR ::: ', error)
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }
  }

  const validation = () => {
    const errMsg = getErrMsg()

    if (!formData.frcsNm) {
      alert('가맹점명을 입력해주세요')
    } else if (!formData.frcsBrno) {
      alert('사업자번호를 입력해주세요')
    } else if (formData.frcsBrno.length != 10) {
      alert('사업자번호를 확인해주세요')
    } else if (!formData.frcsTelno) {
      alert('전화번호를 입력해주세요')
    } else if (!formData.frcsAddr) {
      alert('가맹점주소를 입력해주세요')
    } else if (Array.isArray(reqList) && reqList.length === 0) {
      alert('등록 수정할 내역이 없습니다.')
    } else if (errMsg) {
      alert(errMsg)
    } else {
      return true
    }

    return false
  }

  const getErrMsg = () => {
    let errTxt = ''

    for (let i = 0; i < reqList.length; i++) {
      if (!reqList[i].crdcoCd) {
        errTxt = '카드사를 선택 해주세요'
        break
      } else if (!reqList[i].frcsNo) {
        errTxt = '가맹점번호를 입력 해주세요'
        break
      } else if (
        reqList[i].frcsNo.length != 10 &&
        reqList[i].frcsNo.length != 9
      ) {
        errTxt = '가맹점번호를 확인 해주세요'
        break
      } else if (!reqList[i].sttsCd) {
        errTxt = '보조금지급여부를 선택 해주세요'
        break
      } else {
        continue
      }
    }

    return errTxt
  }

  const getAddress = (row: AddrRow) => {
    setFormData((prev) => ({
      ...prev,
      frcsZip: row.zipNo,
      frcsAddr: `${row.roadAddr}`,
    }))

    setAddrModalOpen(false)
  }

  return (
    <React.Fragment>
      <Dialog fullWidth={false} maxWidth="lg" open={true}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>
                {type == 'update' ? '수소 가맹점 수정' : '수소 가맹점 등록'}
              </h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={sendData}>
                저장
              </Button>

              <Button variant="contained" color="primary" onClick={addListItem}>
                추가
              </Button>

              <Button
                variant="contained"
                color="dark"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <Box>
              <TableContainer sx={{ minWidth: 600 }}>
                <Table aria-labelledby="tableTitle">
                  <TableBody>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*&nbsp;</span>가맹점명
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="frcsNm"
                        >
                          가맹점명
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="frcsNm"
                          name="frcsNm"
                          onChange={handleDataChange}
                          value={formData.frcsNm}
                          readOnly={type == 'update'}
                          inputProps={{
                            readOnly: type == 'update',
                          }}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*&nbsp;</span>
                        사업자등록번호
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="frcsBrno"
                        >
                          사업자등록번호
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="frcsBrno"
                          name="frcsBrno"
                          onChange={handleDataChange}
                          value={formData.frcsBrno}
                          readOnly={type == 'update'}
                          fullWidth
                          inputProps={{
                            readOnly: type == 'update',
                            maxLength: 10,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="table-title-column td-left">
                        <span className="required-text">*&nbsp;</span>전화번호
                      </TableCell>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="frcsTelno"
                        >
                          전화번호
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="frcsTelno"
                          name="frcsTelno"
                          onChange={handleDataChange}
                          value={formData.frcsTelno}
                          readOnly={type == 'update'}
                          inputProps={{
                            readOnly: type == 'update',
                            maxLength: 12,
                          }}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className="table-title-column td-left"
                        rowSpan={2}
                      >
                        <span className="required-text">*&nbsp;</span>주소
                      </TableCell>
                      <TableCell className=" td-left">
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-frcsZip"
                        >
                          우편번호
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-frcsZip"
                          name="frcsZip"
                          onClick={type == 'update' ? null : searchAddress}
                          readOnly={type == 'update'}
                          value={formData.frcsZip}
                          inputProps={{ readOnly: true }}
                        />
                        <Button
                          variant="contained"
                          color="dark"
                          onClick={() => {
                            if (type === 'update') {
                              null
                            } else {
                              searchAddress()
                            }
                          }}
                          sx={{ ml: 0.5 }}
                        >
                          우편번호
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="frcsAddr"
                        >
                          주소
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="frcsAddr"
                          name="frcsAddr"
                          onChange={handleDataChange}
                          readOnly={type == 'update'}
                          value={formData.frcsAddr}
                          inputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Table className="table table-bordered" sx={{ mt: 1 }}>
                  <caption>카드 정보 테이블</caption>
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-title-column">
                        <span className="required-text">*&nbsp;</span>카드사
                      </TableCell>
                      <TableCell className="table-title-column">
                        <span className="required-text">*&nbsp;</span>가맹점번호
                      </TableCell>
                      <TableCell className="table-title-column">
                        보조금지급여부
                      </TableCell>
                      <TableCell className="table-title-column">삭제</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reqList.map((item: ReqItem, index: number) => (
                      <>
                        <TableRow>
                          <TableCell className="td-center">
                            {item.dataType == 'U' ? (
                              item.crdcoNm
                            ) : (
                              <>
                                <CustomFormLabel
                                  className="input-label-none"
                                  htmlFor="crdcoCd"
                                >
                                  카드사
                                </CustomFormLabel>
                                <select
                                  name="crdcoCd"
                                  id="crdcoCd"
                                  className="custom-default-select"
                                  value={reqList[index].crdcoCd}
                                  onChange={(event) =>
                                    handleSearchChange(event, index)
                                  }
                                  style={{ width: '100%' }}
                                >
                                  {crdcoCodeList.map(
                                    (data: SelectItem, index: number) => (
                                      <option key={index} value={data.value}>
                                        {data.label}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </>
                            )}
                          </TableCell>
                          <TableCell className="td-center">
                            {item.dataType == 'U' ? (
                              item.frcsNo
                            ) : (
                              <>
                                <CustomFormLabel
                                  className="input-label-none"
                                  htmlFor="frcsNo"
                                >
                                  가맹점번호
                                </CustomFormLabel>
                                <input
                                  type="text"
                                  name="frcsNo"
                                  id="frcsNo"
                                  value={item.frcsNo}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                  ) => handleSearchChange(event, index)}
                                  style={{
                                    width: '100%',
                                    height: '30px',
                                  }}
                                  maxLength={10}
                                />
                              </>
                            )}
                          </TableCell>
                          <TableCell className="td-center">
                            {item.dataType == 'I' ? (
                              '지급'
                            ) : (
                              <>
                                <CustomFormLabel
                                  className="input-label-none"
                                  htmlFor="sttsCd"
                                >
                                  지급여부
                                </CustomFormLabel>
                                <select
                                  id="sttsCd"
                                  name="sttsCd"
                                  className="custom-default-select"
                                  value={reqList[index].sttsCd}
                                  onChange={(event) =>
                                    handleSearchChange(event, index)
                                  }
                                  style={{ width: '100%' }}
                                >
                                  {sttsCodeList.map(
                                    (data: SelectItem, index: number) => (
                                      <option key={index} value={data.value}>
                                        {data.label}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </>
                            )}
                          </TableCell>
                          <TableCell className="td-center">
                            {item.dataType == 'I' ? (
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => deleteListItem(index)}
                              >
                                삭제
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {addrModalOpen ? (
              <AddrSearchModal
                open={addrModalOpen}
                onRowClick={getAddress}
                onCloseClick={() => setAddrModalOpen(false)}
              />
            ) : null}

            <LoadingBackdrop open={loadingBackdrop} />
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

export default RegisterModalForm
