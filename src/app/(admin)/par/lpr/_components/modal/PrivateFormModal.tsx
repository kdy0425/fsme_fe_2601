import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { Row } from '../../page'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import BrnoModal, { BrnoRow } from './ChildModal'
import React, { useEffect, useState } from 'react'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  toSelectItem,
  toSelectItem2,
} from '@/app/components/tx/commSelect/_util/Utils'
import { SelectItem } from 'select'
import { cAssoCodeList, pAssoCodeList } from './util'
import { getUserInfo, toQueryParameter } from '@/utils/fsms/utils'
import { isNumber } from '@/utils/fsms/common/comm'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { rrNoFormatter } from '@/utils/fsms/common/util'

interface PrivateFormModalProps {
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
  agdrvrYn: string
  agdrvrRrno: string
  agdrvrNm: string
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

const PrivateFormModal = (props: PrivateFormModalProps) => {
  const { open, handleClickClose, row, type, reload } = props
  const userInfo = getUserInfo()
  const [alertOpen, setAlertOpen] = useState(false)
  const [brnoOpen, setBrnoOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [pAssoCdItems, setPAssoCdItems] = useState<SelectItem[]>([])
  const [cAssoCdItems, setCAssoCdItems] = useState<SelectItem[]>([])

  const [strText, setStrText] = useState<string>('');
  const [endText, setEndText] = useState<string>('');

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
    bzmnSeCd: '1',
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
    if (open) {
      pAssoCodeList().then((res) => {
        const result: SelectItem[] = toSelectItem2(
          res,
          'cdKornNm',
          'cdNm',
          false,
        )

        setPAssoCdItems(result)
        const event = {
          target: {
            value: row?.passoCd ? row.passoCd : result[0].value,
            name: 'passoCd',
          },
        } as React.ChangeEvent<HTMLSelectElement>
        handleBodyChange(event)
      })
    }

    if (row && type === 'U') {
      setData({
        brno: row.brno,
        rrno: row.rrno,
        flnm: row.flnm,
        addr: row.addr,
        asctCd: row.asctCd,
        telno: row.telno,
        agdrvrYn: row.agdrvrYn,
        agdrvrRrno: row.agdrvrRrno,
        agdrvrNm: row.agdrvrNm,
        locgovCd: row.locgovCd,
        bzmnSeCd: '1',
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

  useEffect(() => {
    if (open) {
      if (data.passoCd) {
        cAssoCodeList(data.passoCd).then((res) => {
          if (res != null) {
            const result: SelectItem[] = toSelectItem2(
              res,
              'cdKornNm',
              'cdNm',
              false,
            )
            setCAssoCdItems(result)

            const event = {
              target: {
                value: row?.asctCd ? row.asctCd : result[0].value,
                name: 'asctCd',
              },
            } as React.ChangeEvent<HTMLSelectElement>
            handleBodyChange(event)
          } else {
            setCAssoCdItems([])
          }
        })
      }
    }
  }, [data.passoCd])

  useEffect(() => {
    // M001 통장압류 추가로 통장압류시작일, 통장압류종료일 추가
    if (data.regSeCd === '0') {
      setStrText('면허개시일');
      setEndText('카드첫사용일');
    } else if (data.regSeCd === '1') {
      setStrText('분실훼손일');
      setEndText('카드첫사용일');
    } else if (data.regSeCd === '3') {
      setStrText('카드정지일');
      setEndText('카드첫사용일');
    } else {
      setStrText('등록구분일자');
      setEndText('카드첫사용일');
    }  
  }, [data.regSeCd])

  const handleBodyChange = ( event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    if (name === 'brno' || name === 'rrno' || name === 'useAmt' || name === 'moliatAsstAmt' || name === 'telno' || name === 'agdrvrRrno') {
      if (isNumber(value)) {
        setData((prev) => ({ ...prev, [name]: value}))
      }
    } else if (name === 'actno' ) {
      if (isNumber(value, ['-'])) {
        setData((prev) => ({ ...prev, [name]: value}))
      }
    } else if (name === 'qty') {
      if (isNumber(value, ['.'])) {
        setData((prev) => ({ ...prev, [name]: parseFloat(value).toString()}))      
      }
    } else {
      setData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAlertClose = () => {
    setAlertOpen(false)
  }

  const handleBrnoClose = () => {
    setBrnoOpen(false)
  }

  const setBrno = async (brnoRow: BrnoRow) => {

    // 최신서면신청 내역 가져오기
    const recentHistoryList = await getRecentHistory(brnoRow.brno);
    
    let temp:any = {
      brno: brnoRow.brno.replaceAll('-',''),
      rrno: brnoRow.rrno.replaceAll('-',''),
      flnm: brnoRow.flnm,
      agdrvrYn: brnoRow.agdrvrYn,
      agdrvrRrno: brnoRow.secureAgdrvrRrno.replaceAll('-',''),
      agdrvrNm: brnoRow.agdrvrNm,
      vhclNo: brnoRow.vhclNo,
      koiCd: brnoRow.koiCd,
      cardFrstUseYmd: getDateFormatYMD(brnoRow.cardFrstUseYmd),
    }

    if (recentHistoryList && confirm('해당차량의 제일 최신 서면신청내역정보를 가져오시겠습니까?')) {      
      temp = {
        ...temp,
        addr:recentHistoryList.addr,
        bankCd:recentHistoryList.bankCd,
        dpstrNm:recentHistoryList.dpstrNm,
        regSeCd:recentHistoryList.regSeCd,
        regSeCdAcctoYmd:getDateFormatYMD(recentHistoryList.regSeCdAcctoYmd),
        cardFrstUseYmd:getDateFormatYMD(recentHistoryList.cardFrstUseYmd),
      }

      if (recentHistoryList.actno && isNumber(recentHistoryList.actno)) {
        temp = {
          ...temp,
          actno:recentHistoryList.actno
        }
      }

      if (recentHistoryList.telno && isNumber(recentHistoryList.telno)) {
        temp = {
          ...temp,
          telno:recentHistoryList.telno
        }
      }

      if (recentHistoryList.asctCd) {
        temp = {
          ...temp,
          asctCd:recentHistoryList.asctCd,
          passoCd:recentHistoryList.passoCd,
        }
      }
    }
    
    setData((prev) => ({
      ...prev,
      ...temp
    }))

    setBrnoOpen(false)
  }

  const getRecentHistory = async (brno:string) => {
    
    try {

      const searchObj = {
        page: 1,
        size: 1,
        brno: brno,
        bzmnSeCd:'1'
      }

      // 검색 조건에 맞는 endpoint 생성
      const endpoint: string = '/fsm/par/lpr/cm/getAllLocgovPapersReqst' + toQueryParameter(searchObj)
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })
      
      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        return response.data.content[0]
      } else {
        return null;
      }

    } catch (error) {
      console.error('Error fetching data:', error)      
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
      const userConfirm = confirm(
        type === 'I'
          ? '서면신청을 등록하시겠습니까?'
          : '서면신청을 수정하시겠습니까?',
      )

      if (!userConfirm) {
        return
      } else {
        let endpoint: string =
          type === 'I'
            ? `/fsm/par/lpr/cm/createLocgovPapersReqst`
            : `/fsm/par/lpr/cm/updateLocgovPapersReqst`

        let params = {
          brno: data.brno,
          rrno: data.rrno.replaceAll('-',''),
          flnm: data.flnm,
          addr: data.addr,
          asctCd: data.asctCd,
          telno: data.telno,
          agdrvrYn: data.agdrvrYn,
          agdrvrRrno: data.agdrvrRrno.replaceAll('-',''),
          agdrvrNm: data.agdrvrNm,
          locgovCd: userInfo.locgovCd,
          bzmnSeCd: data.bzmnSeCd,
          vhclNo: data.vhclNo,
          koiCd: data.koiCd,
          regSeCd: data.regSeCd,
          regSeCdAcctoYmd: data.regSeCdAcctoYmd.replaceAll('-', ''),
          cardFrstUseYmd: data.cardFrstUseYmd.replaceAll('-', ''),
          rcptYmd: data.rcptYmd.replaceAll('-', ''),
          bankCd: data.bankCd,
          actno: data.actno,
          dpstrNm: data.dpstrNm,          
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
            alert(response.message)
            handleClickClose()
            reload()
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
              <h3>서면신청{type === 'U' ? '수정' : '등록'}</h3>
            </CustomFormLabel>
            <div className=" button-right-align">
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
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '12%' }}></col>
                  <col style={{ width: '13%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      소유자명
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
                          inputProps={{ maxLength: 10 }}
                        />
                        {type === 'I' ? (
                          <>
                            <Button
                              variant="contained"
                              color="dark"
                              onClick={() => setBrnoOpen(true)}
                            >
                              선택
                            </Button>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-rrno"
                          name="rrno"
                          value={data.rrno}
                          onChange={handleBodyChange}
                          inputProps={{ maxLength: 13 }}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      원차주여부
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-agdrvrYn">원차주여부</CustomFormLabel>
                        <CommSelect
                          defaultValue={data.agdrvrYn}
                          cdGroupNm="AGDR"
                          pValue={data.agdrvrYn}
                          handleChange={handleBodyChange}
                          pName="agdrvrYn"
                          htmlFor={'sch-agdrvrYn'}
                          addText="전체"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      대리운전자성명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-agdrvrNm"
                          name="agdrvrNm"
                          value={data.agdrvrNm}
                          onChange={handleBodyChange}
                          inputProps={{ maxLength: 13 }}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      대리운전자
                      <br />
                      주민등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-agdrvrRrno"
                          name="agdrvrRrno"
                          value={data.agdrvrRrno}
                          onChange={handleBodyChange}
                          inputProps={{ maxLength: 13 }}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomTextField
                          id="ft-vhclNo"
                          name="vhclNo"
                          value={data.vhclNo}
                          onChange={handleBodyChange}
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
                          cdGroupNm="977"
                          pValue={data.koiCd}
                          handleChange={handleBodyChange}
                          pName="koiCd"
                          htmlFor={'sch-koiCd'}
                          addText="선택"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      주소
                    </th>
                    <td colSpan={7}>
                      <CustomTextField
                        id="ft-addr"
                        name="addr"
                        value={data.addr}
                        onChange={handleBodyChange}
                        fullWidth
                      />
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
                          htmlFor={'sch-bankCd'}
                          addText="전체"
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
                    <td colSpan={3}>
                      <CustomFormLabel className="input-label-none" htmlFor="sch-regSeCd">등록구분</CustomFormLabel>
                      <CommSelect
                        defaultValue={data.regSeCd}
                        cdGroupNm="CDG1"
                        pValue={data.regSeCd}
                        handleChange={handleBodyChange}
                        pName="regSeCd"
                        htmlFor={'sch-regSeCd'}
                        addText="전체"
                      />
                    </td>
                    <th className="td-head" scope="row">
                      {strText}
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
                      {endText}
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
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      조합
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="passoCd">조합</CustomFormLabel>
                        <select
                          id="passoCd"
                          name="passoCd"
                          value={data.passoCd}
                          className="custom-default-select"
                          onChange={handleBodyChange}
                          style={{ width: '100%' }}
                        >
                          {pAssoCdItems.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      지부
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="asctCd">지부</CustomFormLabel>
                        <select
                          id="asctCd"
                          name="asctCd"
                          value={data.asctCd}
                          className="custom-default-select"
                          onChange={handleBodyChange}
                          style={{ width: '100%' }}
                        >
                          {cAssoCdItems.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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
                    <th className="td-head" scope="row"></th>
                    <td></td>
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
      {/* 사업자정보조회 모달 */}
      {brnoOpen ? (
        <>
          <BrnoModal
            title="사업자정보조회"
            open={brnoOpen}
            url={'/fsm/par/lpr/cm/getBsnesMngBeforeCreate'}
            onRowClick={setBrno}
            onCloseClick={handleBrnoClose}
          />
        </>
      ) : (
        <></>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={alertOpen} onClose={handleAlertClose}>
        <DialogContent>
          <DialogContentText>
            * 모든 서면신청은 충전(주유)일로부터 2개월 이내
            <br />
            <br />
            1. 면허개시일로부터 신규발급 유류구매카드 최초사용일까지(15일 이내)
            <br />
            2. 분실-훼손일부터 재발급 유류구매카드 최초사용일까지(15일 이내)
            <br />
            3. 카드정지일부터 정지일 이후 발급된 유류구매카드 최초사용일까지
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

export default PrivateFormModal
