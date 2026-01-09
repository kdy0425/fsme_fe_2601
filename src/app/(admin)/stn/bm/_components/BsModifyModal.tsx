import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
} from '@/utils/fsms/fsm/mui-imports'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
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
import React, { useContext, useEffect, useState } from 'react'
import { Row } from './BsPage'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { getCommCd } from '@/utils/fsms/common/comm'
import AddrSearchModal, {
  AddrRow,
} from '@/app/components/popup/AddrSearchModal'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { isNumber } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface ModalFormProps {
  data?: Row
  buttonLabel: string
  title?: string
  reloadFunc?: () => void
}

const RegisterModalForm = (props: ModalFormProps) => {
  const { data, buttonLabel, title, reloadFunc } = props

  const [open, setOpen] = useState(false)
  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false)

  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

  // const {authInfo} = useContext(UserAuthContext);
  const [params, setParams] = useState<Row>({
    brno: '', // 사업자등록번호
    crno: '', // 법인등록번호
    bzentyNm: '', //업체명
    rprsvNm: '', // 대표자명
    telno: '', // 전화번호
    zip: '', // 우편번혼
    part1Addr: '', // 주소
    part2Addr: '', // 상세주소
    bankCd: '', // 금융기관
    giveActno: '', // 지급계좌번호
  })

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    if (data) {
      setParams(data)
    }
  }, [open])

  const handleClickAddr = (row: AddrRow) => {
    setParams((prev) => ({
      ...prev,
      part1Addr: row.roadAddr,
      zip: row.zipNo,
    }))

    setAddrModalOpen(false)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setParams({
      brno: '', // 사업자등록번호
      crno: '', // 법인등록번호
      bzentyNm: '', //업체명
      rprsvNm: '', // 대표자명
      telno: '', // 전화번호
      zip: '', // 우편번호
      part1Addr: '', // 주소
      part2Addr: '', // 상세주소
      bankCd: '', // 금융기관
      giveActno: '', // 지급계좌번호
    })
    setOpen(false)
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]/g

    // setParams((prev) => ({
    //   ...prev,
    //   [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
    // }))
    setParams((prev) => ({
      ...prev,
      [name]: value.replaceAll(regex, '').replaceAll(' ', ''),
    }))
  }

  const modifiyTrBuInfo = async () => {
    try {
      if (!params.bzmnSeCd || !params.brno || !params.bzentyNm) {
        alert('사업자번호, 사업자구분, 업체명 입력은 필수입니다.')
        return
      }

      if (params.crno?.length !== 13) {
        alert('법인등록번호를 확인 해 주세요.(법인등록번호 13자리)')
        return
      }

      let endpoint: string = `/fsm/stn/bm/bs/updateBsnesMng`
      const userConfirm = confirm('버스 사업자정보를 변경하시겠습니까?')

      // 파라미터가 다를 경우 이렇게 한다.

      let body = {
        brno: params.brno,
        crno: params.crno,
        bzentyNm: params.bzentyNm,
        rprsvNm: params.rprsvNm,
        telno: params.telno,
        zip: params.zip,
        part1Addr: params.part1Addr,
        part2Addr: params.part2Addr,
        giveBacntNm: params.giveBacntNm,
        bankCd: params.bankCd,
        giveActno: params.giveActno,
      }
      if (userConfirm) {
        setLoadingBackdrop(true)
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
          cache: 'no-store',
        })
        if (response && response.resultType === 'success') {
          alert(response.message)
          reloadFunc?.()
          setOpen(false)
          setParams({
            brno: '', // 사업자등록번호
            crno: '', // 법인등록번호
            bzentyNm: '', //업체명
            rprsvNm: '', // 대표자명
            telno: '', // 전화번호
            zip: '', // 우편번호
            part1Addr: '', // 주소
            part2Addr: '', // 상세주소
            bankCd: '', // 금융기관
            giveActno: '', // 지급계좌번호
          })
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      console.error('Error modifying data:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        //onClose={handleClose}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
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
                onClick={() => modifiyTrBuInfo()}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <Box component="form">
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
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td colSpan={2}>
                        <div className="form-group" style={{ width: '100%' }}>
                          {/* <CustomTextField
                            id="ft-crno"
                            name="crno"
                            fullWidth
                            onChange={handleParamChange}
                            onKeyDown={isNumber}
                            value={params.crno ?? ''}
                          /> */}
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-crno"
                          >
                            법인등록번호
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-crno"
                            name="crno"
                            fullWidth
                            value={params.crno ?? ''}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                            }}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => {
                              const { name, value } = e.target
                              setParams((prev) => ({
                                ...prev,
                                [name]: e.target.value.replace(/[^0-9]/g, ''),
                              }))
                            }}
                          />
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        업체명
                      </th>
                      <td colSpan={2}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-bzentyNm"
                          >
                            업체명
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-bzentyNm"
                            name="bzentyNm"
                            fullWidth
                            onChange={handleParamChange}
                            value={params.bzentyNm ?? ''}
                          />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td colSpan={2}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-rprsvNm"
                          >
                            업체명
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-rprsvNm"
                            name="rprsvNm"
                            fullWidth
                            onChange={handleParamChange}
                            value={params.rprsvNm ?? ''}
                          />
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        전화번호
                      </th>
                      <td colSpan={2}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-telno"
                          >
                            전화번호
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-telno"
                            name="telno"
                            fullWidth
                            onChange={handleParamChange}
                            value={params.telno ?? ''}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        주소
                      </th>
                      <td colSpan={5}>
                        <div className="table-form">
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-zip"
                          >
                            우편번호
                          </CustomFormLabel>
                          <CustomTextField
                            onClick={() => setAddrModalOpen(true)}
                            id="ft-zip"
                            name="zip"
                            value={params?.zip}
                            onChange={handleParamChange}
                            readOnly
                            inputProps={{ readOnly: true }}
                          />
                          <Button onClick={() => setAddrModalOpen(true)}>
                            우편번호
                          </Button>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-part1Addr"
                          >
                            주소1
                          </CustomFormLabel>
                          <CustomTextField
                            onClick={() => setAddrModalOpen(true)}
                            id="ft-part1Addr"
                            name="part1Addr"
                            value={params?.part1Addr}
                            onChange={handleParamChange}
                            readOnly
                            inputProps={{ readOnly: true }}
                            sx={{ width: '50%' }}
                          />
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-part2Addr2"
                          >
                            주소2
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-part2Addr"
                            name="part2Addr"
                            value={params?.part2Addr}
                            onChange={handleParamChange}
                            sx={{ width: '50%' }}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        예금주명
                      </th>
                      <td colSpan={2}>
                        <div className="form-group" style={{ width: '100%' }}>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-giveBacntNm"
                          >
                            예금주명
                          </CustomFormLabel>
                          <CustomTextField
                            id="ft-giveBacntNm"
                            name="giveBacntNm"
                            fullWidth
                            value={params.giveBacntNm ?? ''}
                            inputProps={{
                              inputMode: 'text',
                              pattern: '[^0-9]*',
                            }}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => {
                              const { name, value } = e.target
                              setParams((prev) => ({
                                ...prev,
                                [name]: e.target.value.replace(/[0-9]/g, ''),
                              }))
                            }}
                          />
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        금융기관
                      </th>
                      <td colSpan={2}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-bankCd"
                        >
                          금융기관
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm="973"
                          pValue={params.bankCd ?? ''}
                          defaultValue={params.bankCd ?? ''}
                          handleChange={handleParamChange}
                          pName="bankCd"
                          htmlFor={'sch-bankCd'}
                          addText="전체"
                        />
                      </td>
                    </tr>

                    <tr>
                      <th className="td-head" scope="row">
                        지급계좌번호
                      </th>
                      <td colSpan={5}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-givaActno"
                        >
                          지급계좌번호
                        </CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="ft-giveActno"
                          name="giveActno"
                          value={params.giveActno ?? ''}
                          fullWidth
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                          }}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const { name, value } = e.target
                            setParams((prev) => ({
                              ...prev,
                              [name]: e.target.value.replace(/[^0-9-]/g, ''),
                            }))
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Box>
          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
      <AddrSearchModal
        open={addrModalOpen}
        onRowClick={handleClickAddr}
        onCloseClick={() => setAddrModalOpen(false)}
      />
    </Box>
  )
}

export default RegisterModalForm
