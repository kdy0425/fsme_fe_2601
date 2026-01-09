import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material'
import { Row } from '../../page'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import React, { useEffect, useState } from 'react'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { isNumber } from '@/utils/fsms/common/comm'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

interface PublicFormModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  type: 'I' | 'U'
  reload: () => void
}

type data = {
  brno: string
  rrno: string
  flnm: string
  addr: string
  asctCd: string
  telno: string
  locgovCd: string
  bzmnSeCd: string
  vhclNo: string
  koiCd: string
  regSeCd: string
  regSeCdAcctoYmd: string
  cardFrstUseYmd: string
  rcptYmd: string
  bankCd: string
  actno: string
  dpstrNm: string
  regSeCdAcctoEndYmd: string
  qty: string
  useAmt: string
  moliatAsstAmt: string
  docmntAplyRsnCn: string
  passoCd: string
  rgtrId: string
  mdfrId: string
  docmntAplyUnqNo: string
  seqNo: string
  giveYn: string
}

const PublicFormModal = (props: PublicFormModalProps) => {
  const { open, handleClickClose, row, type, reload } = props

  const userInfo = getUserInfo()
  const [alertOpen, setAlertOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const resetData = {
    brno: '',
    rrno: '',
    flnm: '',
    addr: '',
    asctCd: '',
    telno: '',
    agdrvrYn: '',
    agdrvrRrno: '',
    agdrvrNm: '',
    locgovCd: '',
    bzmnSeCd: '0',
    vhclNo: '',
    koiCd: '',
    regSeCd: '',
    regSeCdAcctoYmd: '',
    cardFrstUseYmd: '',
    rcptYmd: '',
    bankCd: '',
    actno: '',
    dpstrNm: '',
    regSeCdAcctoEndYmd: '',
    rgtrId: '',
    mdfrId: '',
    qty: '',
    useAmt: '',
    moliatAsstAmt: '',
    docmntAplyRsnCn: '',
    passoCd: '',
    docmntAplyUnqNo: '',
    seqNo: '',
    giveYn: '',
  }

  const [data, setData] = useState<data>(resetData)

  useEffect(() => {
    if (row && type === 'U') {
      setData({
        brno: row.brno,
        rrno: row.rrno,
        flnm: row.flnm,
        addr: row.addr,
        asctCd: row.asctCd,
        telno: row.telno,
        locgovCd: '',
        bzmnSeCd: '0',
        vhclNo: row.vhclNo,
        koiCd: row.koiCd,
        regSeCd: row.regSeCd,
        regSeCdAcctoYmd: getDateFormatYMD(row.regSeCdAcctoYmd),
        cardFrstUseYmd: getDateFormatYMD(row.cardFrstUseYmd),
        rcptYmd: getDateFormatYMD(row.rcptYmd),
        bankCd: row.bankCd,
        actno: row.actno,
        dpstrNm: row.dpstrNm,
        regSeCdAcctoEndYmd: getDateFormatYMD(row.regSeCdAcctoEndYmd),
        qty: row.qty,
        useAmt: row.useAmt,
        moliatAsstAmt: row.moliatAsstAmt,
        docmntAplyRsnCn: row.docmntAplyRsnCn,
        passoCd: row.passoCd,
        docmntAplyUnqNo: row.docmntAplyUnqNo,
        seqNo: row.seqNo,
        giveYn: row.giveYn,
        rgtrId: '',
        mdfrId: '',
      })
    } else {
      setData(resetData)
    }
  }, [open])

  const handleAlertClose = () => {
    setAlertOpen(false)
  }

  const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    
    const { name, value } = event.target
    
    if(name === 'brno' || name === 'rrno' || name === 'useAmt' || name === 'moliatAsstAmt' || name === 'telno'){
      if(isNumber(value)){
        setData((prev) => ({ ...prev, [name]: value}))
      }
    } else if (name === 'actno') {
      if (isNumber(value, ['-'])) {
        setData((prev) => ({ ...prev, [name]: parseFloat(value).toString()}))      
      }
    } else if (name === 'qty') {   
      if (isNumber(value, ['.'])) {
        setData((prev) => ({ ...prev, [name]: parseFloat(value).toString()}))      
      }
    } else {
      setData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validation = () => {
    if (!data.flnm) {
      alert('상호명을 입력해주세요.')
    } else if (!data.brno) {
      alert('사업자등록번호를 입력해주세요.')
    } else if (!data.rrno) {
      alert('대표자주민등록번호를 입력해주세요.')
    } else if (!data.koiCd) {
      alert('유종을 선택해주세요.')
    } else if (!data.qty) {
      alert('주유-충전량을 입력해주세요.')
    } else if (!data.useAmt) {
      alert('주유-충전금액을 입력해주세요.')
    } else if (!data.moliatAsstAmt) {
      alert('보조금액을 입력해주세요.')
    } else if (!data.rcptYmd) {
      alert('신청일자를 입력해주세요.')
    } else {
      return true
    }
    return false
  }

  const saveData = async () => {
    if (validation()) {
      if (
        confirm(
          type === 'I'
            ? '서면신청을 등록하시겠습니까?'
            : '서면신청을 수정하시겠습니까?',
        )
      ) {
        let endpoint: string =
          type === 'I'
            ? `/fsm/par/lpr/cm/createLocgovPapersReqst`
            : `/fsm/par/lpr/cm/updateLocgovPapersReqst`

        let params = {
          brno: data.brno,
          rrno: data.rrno.replaceAll('-',''),
          flnm: data.flnm,
          addr: data.addr,
          telno: data.telno,
          locgovCd: userInfo.locgovCd,
          bzmnSeCd: '0',
          vhclNo: data.vhclNo,
          koiCd: data.koiCd,
          regSeCd: data.regSeCd,
          regSeCdAcctoYmd: data.regSeCdAcctoYmd.replaceAll('-', ''),
          cardFrstUseYmd: data.cardFrstUseYmd.replaceAll('-', ''),
          rcptYmd: data.rcptYmd.replaceAll('-', ''),
          bankCd: data.bankCd,
          actno: data.actno,
          dpstrNm: data.dpstrNm,
          regSeCdAcctoEndYmd: data.regSeCdAcctoEndYmd.replaceAll('-', ''),
          qty: data.qty,
          useAmt: data.useAmt,
          moliatAsstAmt: data.moliatAsstAmt,
          docmntAplyRsnCn: data.docmntAplyRsnCn,
          rgtrId: '',
          mdfrId: '',
          docmntAplyUnqNo: '',
          seqNo: '',
          giveYn: '',
        }

        if (type === 'I') {
          params = {
            ...params,
            rgtrId: userInfo.lgnId,
            mdfrId: userInfo.lgnId,
          }
        } else {
          params = {
            ...params,
            mdfrId: userInfo.lgnId,
            docmntAplyUnqNo: data.docmntAplyUnqNo,
            seqNo: data.seqNo,
            giveYn: data.giveYn,
          }
        }

        try {
          setLoadingBackdrop(true)
          const response = await sendHttpRequest(
            type === 'I' ? 'POST' : 'PUT',
            endpoint,
            params,
            true,
            {
              cache: 'no-store',
            },
          )

          if (response && response.resultType === 'success') {
            reload()
            alert(response.message)
            handleClickClose()
          } else {
            alert(response.message)
          }
        } catch (error) {
          alert(error)
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '2000px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>서면신청{type === 'U' ? '수정' : '등록'}</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="inherit"
                onClick={() => setAlertOpen(true)}
              >
                서면신청기간 조건
              </Button>
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                취소
              </Button>
            </div>
          </Box>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>서면신청 등록 및 수정</caption>
                <colgroup>
                  <col style={{ width: '11%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '14%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '11%' }}></col>
                  <col style={{ width: '13%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      상호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-flnm"
                          name="flnm"
                          value={data.flnm}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-brno"
                          name="brno"
                          value={data.brno}
                          onChange={handleBodyChange}
                          inputProps={{
                            maxLength: 10,
                          }}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      대표자주민등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-rrno"
                          name="rrno"
                          value={data.rrno}
                          onChange={handleBodyChange}
                          inputProps={{
                            maxLength: 13,
                          }}
                          type="text"
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-koiCd">유종</CustomFormLabel>
                        <CommSelect
                          defaultValue={data.koiCd}
                          cdGroupNm="KOI3"
                          pValue={data.koiCd}
                          handleChange={handleBodyChange}
                          pName={'koiCd'}
                          addText="선택"
                          htmlFor={"sch-koiCd"}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      주유-충전량
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-qty"
                          name="qty"
                          value={data.qty}
                          onChange={handleBodyChange}
                          type='number'
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      주유-충전금액
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-useAmt"
                          name="useAmt"
                          value={data.useAmt}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      보조금액
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-moliatAsstAmt"
                          name="moliatAsstAmt"
                          value={data.moliatAsstAmt}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      연락처
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-telno"
                          name="telno"
                          value={data.telno}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      금융기관
                    </th>
                    <td colSpan={3}>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-bankCd">금융기관</CustomFormLabel>
                        <CommSelect
                          defaultValue={data.bankCd}
                          cdGroupNm="973"
                          pValue={data.bankCd}
                          handleChange={handleBodyChange}
                          pName="bankCd"
                          htmlFor={"sch-bankCd"}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      계좌번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-actno"
                          name="actno"
                          value={data.actno}
                          onChange={handleBodyChange}
                          inputProps={{ maxLength: 14 }}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      예금주
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-dpstrNm"
                          name="dpstrNm"
                          value={data.dpstrNm}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      등록구분
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-regSeCd">등록구분</CustomFormLabel>
                        <CommSelect
                          defaultValue={data.regSeCd}
                          cdGroupNm="CDG3"
                          pValue={data.regSeCd}
                          handleChange={handleBodyChange}
                          pName="regSeCd"
                          htmlFor={"sch-regSeCd"}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      {data.regSeCd === '0' ? (
                        <>면허개시일</>
                      ) : (
                        <>등록구분일자</>
                      )}
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          type="date"
                          id="ft-regSeCdAcctoYmd"
                          name="regSeCdAcctoYmd"
                          value={data.regSeCdAcctoYmd}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      카드첫사용일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          type="date"
                          id="ft-cardFrstUseYmd"
                          name="cardFrstUseYmd"
                          value={data.cardFrstUseYmd}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      신청일자
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          type="date"
                          id="ft-rcptYmd"
                          name="rcptYmd"
                          value={data.rcptYmd}
                          onChange={handleBodyChange}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      서면신청사유
                    </th>
                    <td colSpan={7}>
                      <CustomTextField
                        id="ft-docmntAplyRsnCn"
                        name="docmntAplyRsnCn"
                        value={data.docmntAplyRsnCn}
                        onChange={handleBodyChange}
                        fullWidth
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
        <LoadingBackdrop open={loadingBackdrop} />
      </Dialog>
      {/* 서면신청기간 조건 다이얼로그 */}
      <Dialog open={alertOpen} onClose={handleAlertClose}>
        <DialogContent>
          <DialogContentText>
            * 모든 서면신청은 충전(주유)일로부터 2개월 이내
            <br />
            <br />
            1. 면허개시일로부터 신규발급 유류구매카드 최초사용일까지(15일 이내)
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PublicFormModal
