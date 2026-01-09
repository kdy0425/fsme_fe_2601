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
import React, { useContext, useEffect, useState } from 'react'
import { TrUsedRow } from './TrUsedSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { SelectItem } from 'select'
import { isNumber } from '@/utils/fsms/common/comm'
import { rrNoFormatter } from '@/utils/fsms/common/util'

interface ModalFormProps {
  open: boolean
  title?: string
  data?: TrUsedRow
  reloadFunc: () => void
  onCloseClick: () => void
  onModalClose: () => void
}

const TrNUsedModal = (props: ModalFormProps) => {
  const { open, title, data, reloadFunc, onCloseClick, onModalClose } = props

  const [bzmnSeCdCode, setBzmnSeCd] = useState<SelectItem[]>([]) //  사업자 구분 코드

   const [params, setParams] = useState<TrUsedRow>({
    vhclNo: data?.vhclNo??'',
    bzmnSeCd: data?.bzmnSeCd??'', // 개인법인 구분
    bzmnSeNm: data?.bzmnSeNm??'',
    vonrRrno: data?.vonrRrno??'',
    vonrNm: data?.vonrNm??'',
    chgBfrCrno: data?.chgBfrCrno??'',
    chgBfrCoNm: data?.chgBfrCoNm??'',
    chgBfrRprsvNm: data?.chgBfrRprsvNm??'',
    crno: data?.crnoS??'',
    crnoS: data?.crnoS??'',
    bzentyNm: data?.bzentyNm??'',
    rprsvNm: data?.rprsvNm??'',
  })

  useEffect(() => {
    //사업자 구분
    let BzmnSeCodes: SelectItem[] = []
    getCodesByGroupNm('301').then((res) => {
      if (res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }
          BzmnSeCodes.push(item)
        })
      }
      setBzmnSeCd(BzmnSeCodes)
    })
  }, [])

  const handleClose = () => {
    setParams({
        vhclNo: '',
        bzentyNm: '',
        crno: '',
        crnoS: '',
        rprsvNm: '',
        bzmnSeCd: '',
        bzmnSeNm: '',
        vonrNm: '',
        chgBfrCrno: '',
        chgBfrCoNm: '',
        chgBfrRprsvNm: '',
        vonrRrno: '',
      })
    onCloseClick();
    reloadFunc();
  }

  const closeClick = () => {
    onModalClose();
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const regex = /[~`!@#$%^&*_\-+={}[\]|\\:;"'<>,.?/]/g
    if (name == 'crno') {
      if (isNumber(value)) {
        setParams((prev) => ({ ...prev, [name]: value.replaceAll(regex, '') }))
      }
    } else{
        setParams((prev) => ({ ...prev, [name]: value }))
    } 
  }

  const modifiyTrBuInfo = async () => {
    if (!params.crno) {
      alert('법인등록번호를 입력해주세요.')
      return
    }

    if (!params.bzentyNm) {
      alert('업체명을 입력해주세요.')
      return
    }

    if (!params.rprsvNm) {
      alert('대표자명을 입력해주세요.')
      return
    }

    if (!params.bzmnSeCd) {
      alert('개인법인구분을 선택해주세요.')
      return
    }

    try {
      let endpoint: string = `/fsm/stn/vm/tr/updateVhcleBiz`
      const userConfirm = confirm('신규 지입사변경를 저장하시겠습니까?')

      if (userConfirm) {
        const response = await sendHttpRequest(
          'PUT',
          endpoint,
          {
            vhclNo: data?.vhclNo,
            bzmnSeCd: params.bzmnSeCd,
            vonrRrno: data?.vonrRrno,
            vonrNm: data?.vonrNm,
            chgBfrCrno: data?.chgBfrCrno,
            chgBfrCoNm: data?.chgBfrCoNm,
            chgBfrRprsvNm: data?.chgBfrRprsvNm,
            crno: params.crno,
            bzentyNm: params.bzentyNm,
            rprsvNm: params.rprsvNm,
          },
          true,
          {
            cache: 'no-store',
          },
        )

        if (response && response.resultType === 'success') {
          alert(response.message)
          handleClose()
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      alert('신규 지입사변경 도중 에러가 발생했습니다.')
      console.log(error)
    }
  }
  return (
    <Box>
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
              <Button variant="contained" color="dark" onClick={closeClick}>
                취소
              </Button>
            </div>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>신규 지입사변경</caption>
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="td-head" scope="row">
                      법인등록번호
                    </td>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="modal-crno">법인등록번호</CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-crno"
                          name="crno"
                          value={
                            params?.crno?.length === 13
                              ? rrNoFormatter(params?.crno ?? '')
                              : (params?.crno ?? '')
                          }
                          onChange={handleParamChange}
                          fullWidth
                          inputProps={{ maxLength: 14 }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="modal-bzentyNm">업체명</CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-bzentyNm"
                          name="bzentyNm"
                          value={params.bzentyNm}
                          onChange={handleParamChange}
                          fullWidth
                          inputProps={{
                            maxLength:50
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="modal-rprsvNm">대표자명</CustomFormLabel>
                        <CustomTextField
                          type="text"
                          id="modal-rprsvNm"
                          name="rprsvNm"
                          value={params.rprsvNm}
                          onChange={handleParamChange}
                          fullWidth
                          inputProps={{
                            maxLength:50
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      개인법인구분
                    </th>
                    <td>
                      <RadioGroup
                        row
                        id="status"
                        className="mui-custom-radio-group"
                        onChange={handleParamChange}
                        value={params.bzmnSeCd ?? ''} // 현재 상태값을 RadioGroup에 연결
                      >
                        {bzmnSeCdCode.map((code) => (
                          <FormControlLabel
                            key={code.value} // 각 코드 값에 고유한 키 할당
                            control={
                              <CustomRadio
                                id={`rdo_${code.value}`}
                                name="bzmnSeCd"
                                value={code.value}
                              />
                            }
                            label={code.label} // 각 항목의 라벨 설정
                          />
                        ))}
                      </RadioGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TrNUsedModal
