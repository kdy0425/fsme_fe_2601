import React, { useEffect, useState } from 'react'

import FormModal from '@/app/components/popup/FormDialog'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { VhclRow } from '@/app/components/tr/popup/VhclSearchModal'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  parGprAccTrHeadCells,
  parGprDlngTrHeadCells,
} from '@/utils/fsms/headCells'
import { getUserInfo } from '@/utils/fsms/utils'
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { formatDate } from '../../../../../utils/fsms/common/convert'
import { rrNoFormatter } from '../../../../../utils/fsms/common/util'
import { Row } from '../page'
import CardIssuedHistoryModal from './CardIssuedHistoryModal'
import VhclNoSearchModal from './VhclNoSearchModal'
import { isNumber } from '@/utils/fsms/common/comm'
import { read } from 'fs'

interface Parameter {
  actno: string
  bankCd: string
  bankNm: string
  dpstrNm: string
  vhclNo: string
  crno: string
  locgovCd: string
  clclnYm: string
  koiCd: string
  vhclTonCd: string
  vhclPsnCd: string
  useLiter: number | string
  drvngDstnc: number | null
  tclmLiter: number
  tclmAmt: number
  vonrBrno: string
  vonrRrno: string
  vonrRrnoS: string
  vonrNm: string
  vhclTonNm: string
  docmntAplyRsnCn: string
  prcsSttsCd: string
  aplySn: number
}

interface OilingInfo {
  dlngYm: string
  useLiter: number | string
  docmntAplyRsnCn: string
}

interface AccountInfo {
  vhclNo: string
  bankCd: string
  bankNm: string
  dpstrNm: string
  actno: string
}

interface ModalProperties {
  formType: 'CREATE' | 'UPDATE'
  data: Row | null
  reload: () => void
}

const ModalContent = (props: ModalProperties) => {
  const { formType, data, reload } = props
  const [params, setParams] = useState<Parameter>({
    actno: '',
    bankCd: '',
    bankNm: '',
    dpstrNm: '',
    vhclNo: '',
    crno: '',
    locgovCd: '',
    clclnYm: '',
    koiCd: '',
    vhclTonCd: '',
    vhclPsnCd: '',
    useLiter: 0,
    drvngDstnc: 0,
    tclmLiter: 0,
    tclmAmt: 0,
    vonrBrno: '',
    vonrRrno: '',
    vonrRrnoS: '',
    vonrNm: '',
    vhclTonNm: '',
    docmntAplyRsnCn: '',
    prcsSttsCd: '',
    aplySn: 0,
  })
  const userInfo = getUserInfo()

  const [openVhclModal, setOpenVhclModal] = useState<boolean>(false)
  const [openAccountModal, setOpenAccountModal] = useState<boolean>(false)
  const [openCardIssuedInfoModal, setOpenCardIssuedInfoModal] =
    useState<boolean>(false)
  const [bankItems, setBankItems] = useState<any[]>([])

  const [oilingInfo, setOilingInfo] = useState<OilingInfo[]>([])
  const [checkedIndex, setCheckedIndex] = useState<number[]>([])

  const [acctSearchParams, setAcctSearchParams] = useState({
    vhclNo: '',
    dpstrNm: '',
  })
  const [acctParams, setAcctParams] = useState<AccountInfo>({
    vhclNo: '',
    actno: '',
    bankCd: '',
    bankNm: '',
    dpstrNm: '',
  })
  const [accountInfo, setAccountInfo] = useState<AccountInfo[]>([])
  const [selectedAccount, setSelectedAccount] = useState<number>(-1)

  // 은행코드로 은행명 구하기 위해 은행 codeitem 최초 호출 후 저장
  useEffect(() => {
    getCodesByGroupNm('973').then((res) => setBankItems(res))
  }, [])

  useEffect(() => {
    if (formType === 'UPDATE' && data) {
      setParams((prev) => ({
        ...prev,
        dpstrNm: data.dpstrNm,
        vhclNo: data.vhclNo,
        crno: data.crno,
        locgovCd: userInfo.locgovCd,
        koiCd: data.koiCd,
        vhclTonCd: data.vhclTonCd,
        vhclPsnCd: data.vhclPsnCd,
        drvngDstnc: data.drvngDstnc,
        tclmLiter: data.tclmLiter,
        tclmAmt: data.tclmAmt,
        vonrBrno: data.vonrBrno,
        vonrRrno: data.vonrRrno,
        vonrRrnoS: data.vonrRrnoS,
        vonrNm: data.vonrNm,
        vhclTonNm: data.vhclTonNm,
        clclnYm: formatDate(data.clclnYm),
        useLiter: data.useLiter,
        prcsSttsCd: data.prcsSttsCd,
        prcsSttsNm: data.prcsSttsNm,
        docmntAplyRsnCn: data.docmntAplyRsnCn,
        aplySn: data.aplySn,
      }))

      setOilingInfo([
        {
          dlngYm: data.clclnYm,
          useLiter: data.useLiter,
          docmntAplyRsnCn: data.docmntAplyRsnCn,
        },
      ])

      // 은행정보 조회
      getAccountInfo()
    }
  }, [data])

  useEffect(() => {
    // 수정 API는 단건만, 주유정보(oilinginfo)에 한건만 담는다.
    if (formType === 'UPDATE') {
      setOilingInfo([
        {
          dlngYm: params.clclnYm,
          useLiter: params.useLiter,
          docmntAplyRsnCn: params.docmntAplyRsnCn,
        },
      ])
    }
  }, [params.clclnYm, params.useLiter, params.docmntAplyRsnCn])

  // 계좌정보 조회
  const getAccountInfo = async () => {
    try {
      let endpoint: string =
        formType === 'CREATE'
          ? `/fsm/par/gpr/tr/getAllAcnutGnrlPapersReqst?vhclNo=${acctSearchParams.vhclNo}` +
            `${acctSearchParams.dpstrNm ? '&dpstrNm=' + acctSearchParams.dpstrNm : ''}`
          : `/fsm/par/gpr/tr/getAllAcnutGnrlPapersReqst?vhclNo=${data?.vhclNo}` +
            `${data?.dpstrNm ? '&dpstrNm=' + data.dpstrNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        let data: AccountInfo[] = response.data

        let userAccountArr: AccountInfo[] = []

        data.map((item) => {
          userAccountArr.push({
            vhclNo: item?.vhclNo,
            actno: item?.actno,
            bankCd: item?.bankCd,
            bankNm: item?.bankNm,
            dpstrNm: item?.dpstrNm,
          })
        })

        if (userAccountArr && userAccountArr.length > 0) {
          setParams((prev) => ({
            ...prev,
            actno: userAccountArr[0].actno,
            bankCd: userAccountArr[0].bankCd,
            bankNm: userAccountArr[0].bankNm,
            dpstrNm: userAccountArr[0].dpstrNm,
          }))

          setSelectedAccount(0)
          setAccountInfo(userAccountArr)
        }
        return false
      }
    } catch (error) {
      console.error('Error ::: ', error)
    }
  }
  const createGnrlPaperReqst = async (
    formData: OilingInfo,
    userConfirm: boolean,
  ): Promise<boolean> => {
    try {
      if (oilingInfo && oilingInfo.length > 0) {
        let endpoint: string =
          formType === 'CREATE'
            ? `/fsm/par/gpr/tr/createGnrlPapersReqst`
            : `/fsm/par/gpr/tr/updateGnrlPapersReqst`

        const body = {
          locgovCd: formType === 'CREATE' ? userInfo.locgovCd : data?.locgovCd,
          vhclNo: params.vhclNo,
          clclnYm: formData.dlngYm.replaceAll('-', ''),
          aplySn: formType === 'CREATE' ? 0 : data?.aplySn,
          koiCd: params.koiCd,
          vhclTonCd: params.vhclTonCd,
          useLiter: formData.useLiter,
          drvngDstnc: params.drvngDstnc,
          tclmAmt: params.tclmAmt,
          tclmLiter: params.tclmLiter,
          vhclPsnCd: params.vhclPsnCd,
          crno: params.crno,
          vonrBrno: params.vonrBrno,
          vonrNm: params.vonrNm,
          prcsSttsCd: userConfirm ? '02' : '01',
          vonrRrno: params.vonrRrno,
          docmntAplyRsnCn: formData.docmntAplyRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
          bankCd: params.bankCd,
          actno: params.actno,
          dpstrNm: params.dpstrNm,
        }

        const response = await sendHttpRequest(
          formType === 'CREATE' ? 'POST' : 'PUT',
          endpoint,
          body,
          true,
          {
            cache: 'no-store',
          },
        )

        if (response && response.resultType === 'success') {
          return true
        } else {
          alert(response.message)
          return false
        }
      } else {
        return false
      }
    } catch (error) {
      console.error('ERROR ::: ', error)
      return false
    }
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'useLiter') {
      // 맨앞에 0이 있으면 제거하고 입력
      if (value.length > 1 && value.startsWith('0')) {
        setParams((prev) => ({ ...prev, [name]: value.substring(1) }))
        return
      }

      // 소수점 2자리까지만 입력가능하도록
      if (value.includes('.')) {
        const splitValue = value.split('.')
        if (splitValue[1].length > 2) {
          return
        }
      }

      setParams((prev) => ({ ...prev, [name]: value }))
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleTextareaChange = (val: string) => {
    setParams((prev) => ({ ...prev, docmntAplyRsnCn: val.replaceAll(/\n/g, '').replaceAll(/\t/g, '') }))
  }

  // 계좌정보 등록 팝업용 onChange 함수
  const handleAcctParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setAcctParams((prev) => ({ ...prev, [name]: value }))
  }

  // 주유정보 추가
  const addOilingInfo = () => {
    if (!params.clclnYm) {
      alert('주유월을 입력해주세요.')
      return
    }

    if (!params.useLiter) {
      alert('주유량을 입력해주세요.')
      return
    }

    if(!params.docmntAplyRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('신청사유를 입력해주세요.')
      return;
    }

    if(params.docmntAplyRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 100){
      alert('신청사유를 100자리 이하로 입력해주시기 바랍니다.')
      return
    }

    let item: OilingInfo = {
      dlngYm: params.clclnYm.replaceAll('-', ''),
      useLiter: params.useLiter,
      docmntAplyRsnCn: params.docmntAplyRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
    }

    setOilingInfo((prev) => [...prev, item])

    setParams((prev) => ({
      ...prev,
      clclnYm: '',
      useLiter: 0,
      docmntAplyRsnCn: '',
    }))
  }

  // 주유정보 식제
  const removeOilingInfo = () => {
    if (checkedIndex.length < 1) {
      alert('삭제할 주유정보를 선택해주세요.')
      return
    }

    const userConfirm = confirm('선택한 주유정보를 삭제하시겠습니까?')
    if (!userConfirm) {
      return
    }

    let tempArr: OilingInfo[] = [...oilingInfo]

    checkedIndex.map((item) => {
      tempArr = tempArr.filter((temp, index) => index !== item)
    })

    setOilingInfo(tempArr)
  }

  // 체크버튼 변경시 설정
  const handleCheckChange = (selected: string[]) => {
    let selectedRows: number[] = []

    selected.map((id) => selectedRows.push(Number(id.replace('tr', ''))))

    setCheckedIndex(selectedRows)
  }

  // 계좌정보 저장
  const saveAccountInfo = () => {
    if (!acctParams.dpstrNm) {
      alert('예금주명을 입력해주세요.')
      return
    }

    if (!acctParams.bankCd) {
      alert('금융기관을 선택해주세요.')
      return
    }

    if (!acctParams.actno) {
      alert('계좌번호를 입력해주세요.')
      return
    }

    setAccountInfo((prev) => [...prev, acctParams])

    setParams((prev) => ({
      ...prev,
      actno: acctParams.actno,
      bankCd: acctParams.bankCd,
      bankNm: acctParams.bankNm,
      dpstrNm: acctParams.dpstrNm,
    }))

    setAcctParams({
      vhclNo: '',
      actno: '',
      bankCd: '',
      bankNm: '',
      dpstrNm: '',
    })

    setOpenAccountModal(false)
  }

  const removeAccountInfo = () => {
    if (selectedAccount < 0) {
      alert('삭제할 계좌정보를 선택해주세요.')
      return
    }

    const userConfirm = confirm('선택한 계좌정보를 삭제하시겠습니까?')

    if (!userConfirm) {
      return
    }

    let tempArr: AccountInfo[] = [...accountInfo]

    tempArr = tempArr.filter((item, index) => index !== selectedAccount)

    setAccountInfo(tempArr)
    setSelectedAccount(-1)
    setParams((prev) => ({
      ...prev,
      actno: '',
      bankCd: '',
      bankNm: '',
      dpstrNm: '',
    }))
  }

  useEffect(() => {
    const bankNm =
      bankItems.find((item) => item.cdNm === acctParams.bankCd)?.cdKornNm ?? ''

    setAcctParams((prev) => ({
      ...prev,
      bankNm: bankNm,
    }))
  }, [acctParams.bankCd])

  const handleClickVhclRow = (row: VhclRow) => {
    setParams((prev) => ({
      ...prev,
      vhclNo: row.vhclNo,
      vonrNm: row.vonrNm,
      vonrRrno: row.vonrRrno,
      vonrRrnoS: row.vonrRrnoS,
      vonrBrno: row.vonrBrno,
      vhclPsnCd: row.vhclPsnCd,
      vhclPsnNm: row.vhclPsnNm,
      koiCd: row.koiCd,
      vhclTonCd: row.vhclTonCd,
      vhclTonNm: row.vhclTonNm,
      crno: row.crno,
    }))

    setOpenVhclModal(false)
  }

  const handleClickAcctRow = (row: AccountInfo, index?: number) => {
    setSelectedAccount(index ?? -1)

    setParams((prev) => ({
      ...prev,
      actno: row.actno,
      bankCd: row.bankCd,
      bankNm: row.bankNm,
      dpstrNm: row.dpstrNm,
    }))
  }

  const openVhclNoModal = () => {
    if (!params.vhclNo) {
      alert('검색할 차량번호를 입력해주세요.')
      return
    }

    setOpenVhclModal(true)
  }

  const openCardInfoModal = () => {
    if (!params.vhclNo) {
      alert('검색할 차량번호를 입력해주세요.')
      return
    }

    setOpenCardIssuedInfoModal(true)
  }

  const searchAccountInfo = (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (acctSearchParams.vhclNo || acctSearchParams.dpstrNm) {
      getAccountInfo()
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!params.vhclNo) {
      alert('차량번호 항목은 필수입력사항 입니다.')
      return
    }

    if (!params.vonrNm) {
      alert('소유자명 항목은 필수입력사항 입니다.')
      return
    }

    if (!params.vonrRrno || !params.vonrRrnoS) {
      alert('주민등록번호 항목은 필수입력사항 입니다.')
      return
    }

    if (!params.vonrBrno) {
      alert('사업자등록번호 항목은 필수입력사항 입니다.')
      return
    }

    if (!params.vhclPsnCd) {
      alert('구분 항목은 필수입력사항 입니다.')
      return
    }

    if (!params.koiCd) {
      alert('유종 항목은 필수입력사항 입니다.')
      return
    }

    if (!params.vhclTonCd) {
      alert('톤수 항목은 필수입력사항 입니다.')
      return
    }

    if (oilingInfo.length === 0) {
      alert('주유정보가 없습니다.')
      return
    }

    if (!params.bankCd || !params.actno || !params.dpstrNm) {
      alert('선택된 계좌정보가 없습니다.')
      return
    }

    const userConfirm = confirm(
      '입력한 서면신청정보에 대한 [보조금정산]을 요청하시겠습니까?\n\n' +
        '입력한 정보를 확인 후 건별로 정산요청을 할 경우 [취소]를 눌러주세요.',
    )

    for (let i = 0; i < oilingInfo.length; i++) {
      const res = await createGnrlPaperReqst(oilingInfo[i], userConfirm)

      if (!res) {
        return
      } else if (res && i === oilingInfo.length - 1) {
        // 마지막
        alert('저장을 성공했습니다.')
        reload()
      }
    }
  }

  return (
    <Box sx={{ width: '1200px', height: '1100px'}}>
      <Box component="form" id="register-data" onSubmit={handleSubmit}>
        <CustomFormLabel className="input-label-display">
          <h3>신청자정보</h3>
        </CustomFormLabel>
        <TableContainer sx={{ mb: 5 }}>
          <Table className="table table-bordered">
            <colgroup>
              <col style={{ width: '10%' }}></col>
              <col style={{ width: '23%' }}></col>
              <col style={{ width: '10%' }}></col>
              <col style={{ width: '23%' }}></col>
              <col style={{ width: '10%' }}></col>
              <col style={{ width: '23%' }}></col>
            </colgroup>
            <TableBody>
              <TableRow>
                <TableCell className="td-head table-head-text">
                <span className="required-text" >*</span>차량번호
                </TableCell>
                <TableCell>
                  {formType === 'CREATE' ? (
                    <Grid container spacing={1}>
                      <Grid item xs={9}>
                        <CustomTextField
                          id="vhclNo"
                          name="vhclNo"
                          value={params.vhclNo}
                          onChange={handleParamChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <Button
                          variant="contained"
                          color="dark"
                          onClick={openVhclNoModal}
                        >
                          검색
                        </Button>
                        <VhclNoSearchModal
                          open={openVhclModal}
                          onRowClick={handleClickVhclRow}
                          onCloseClick={() => setOpenVhclModal(false)}
                          vhclNo={params.vhclNo}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <CustomTextField
                      id="vhclNo"
                      name="vhclNo"
                      value={params.vhclNo}
                      onChange={handleParamChange}
                      readOnly={formType === 'UPDATE'}
                      inputProps={{ readOnly: formType === 'UPDATE' }}
                      fullWidth
                    />
                  )}
                </TableCell>
                <TableCell className="td-head table-head-text">
                  <span className="required-text" >*</span>소유자명
                </TableCell>
                <TableCell>
                  <CustomTextField
                    id="vonrNm"
                    name="vonrNm"
                    value={params.vonrNm}
                    onChange={handleParamChange}
                    fullWidth
                  />
                </TableCell>
                <TableCell className="td-head table-head-text">
                  <span className="required-text" >*</span>주민등록번호
                </TableCell>
                <TableCell>{rrNoFormatter(params.vonrRrnoS) ?? ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="td-head table-head-text">
                  <span className="required-text" >*</span>사업자등록번호
                </TableCell>
                <TableCell>
                  <CustomTextField
                    id="vonrBrno"
                    name="vonrBrno"
                    value={params.vonrBrno}
                    onChange={handleParamChange}
                    fullWidth
                  />
                </TableCell>
                <TableCell className="td-head table-head-text">
                  <span className="required-text" >*</span>구분
                </TableCell>
                <TableCell>
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="sch-vhclPsnCd"
                  >
                    구분
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm={'036'}
                    pValue={params.vhclPsnCd}
                    handleChange={handleParamChange}
                    pName="vhclPsnCd"
                    htmlFor="sch-vhclPsnCd"
                  />
                </TableCell>
                <TableCell className="td-head table-head-text"></TableCell>
                <TableCell></TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="td-head table-head-text">
                <span className="required-text" >*</span>유종
                </TableCell>
                <TableCell>
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="sch-koiCd"
                  >
                    유종
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm={'599'}
                    pValue={params.koiCd}
                    handleChange={handleParamChange}
                    pName="koicCd"
                    htmlFor={'sch-koiCd'}
                  />
                </TableCell>
                <TableCell className="td-head table-head-text">
                  <span className="required-text" >*</span>톤수
                </TableCell>
                <TableCell>{params.vhclTonNm ?? ''}</TableCell>
                <TableCell className="td-head table-head-text"></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <CustomFormLabel className="input-label-display">
            <h3>주유정보</h3>
          </CustomFormLabel>
          {formType === 'UPDATE' ? (
            <Button
              variant="contained"
              color="primary"
              onClick={openCardInfoModal}
            >
              카드발급정보
            </Button>
          ) : (
            <></>
          )}
        </Box>
        {formType === 'CREATE' ? (
          <>
            <TableDataGrid
              headCells={parGprDlngTrHeadCells}
              rows={oilingInfo}
              loading={false}
              onCheckChange={handleCheckChange}
              emptyMessage="주유정보가 없습니다."
            />
            <Box className="table-bottom-button-group">
              <div className="button-right-align">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addOilingInfo}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={removeOilingInfo}
                >
                  삭제
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={openCardInfoModal}
                >
                  카드발급정보
                </Button>
              </div>
            </Box>
          </>
        ) : (
          <></>
        )}
        <CardIssuedHistoryModal
          open={openCardIssuedInfoModal}
          onCloseClick={() => setOpenCardIssuedInfoModal(false)}
          vhclNo={params.vhclNo}
        />
      </Box>

      <TableContainer sx={{ mt: 2, mb: 5 }}>
        <Table className="table table-bordered">
          <colgroup>
            <col style={{ width: '10%' }}></col>
            <col style={{ width: '23%' }}></col>
            <col style={{ width: '10%' }}></col>
            <col style={{ width: '23%' }}></col>
            <col style={{ width: '10%' }}></col>
            <col style={{ width: '23%' }}></col>
          </colgroup>
          <TableBody>
            <TableRow>
              <TableCell className="td-head table-head-text">주유월</TableCell>
              <TableCell>
                <CustomTextField
                  type="month"
                  id="clclnYm"
                  name="clclnYm"
                  value={params.clclnYm}
                  onChange={handleParamChange}
                  readOnly={formType === 'UPDATE'}
                  inputProps={{ readOnly: formType === 'UPDATE' }}
                  fullWidth
                  disabled={formType === 'UPDATE'}
                />
              </TableCell>
              <TableCell className="td-head table-head-text">주유량</TableCell>
              <TableCell>
                <CustomTextField
                  type="number"
                  inputProps={{
                    style: { textAlign: 'right' },
                  }}
                  id="useLiter"
                  name="useLiter"
                  value={params.useLiter}
                  onChange={handleParamChange}
                  fullWidth
                />
              </TableCell>
              <TableCell className="td-head table-head-text"></TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head table-head-text">
                신청사유
              </TableCell>
              <TableCell colSpan={5}>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="ft-docmntAplyRsnCn"
                >
                  신청사유
                </CustomFormLabel>
                <textarea
                  id="ft-docmntAplyRsnCn"
                  name="docmntAplyRsnCn"
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  value={params.docmntAplyRsnCn}
                  className="MuiTextArea-custom"
                  style={{ width: '100%' }}
                  rows={5}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <CustomFormLabel className="input-label-display">
        <h3>계좌정보</h3>
      </CustomFormLabel>

      <Box
        component="form"
        id="search-account"
        onSubmit={searchAccountInfo}
        sx={{ mb: 2 }}
      >
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={acctSearchParams.vhclNo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAcctSearchParams((prev) => ({
                    ...prev,
                    vhclNo: e.target.value,
                  }))
                }
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-dpstrNm"
              >
                예금주명
              </CustomFormLabel>
              <CustomTextField
                id="ft-dpstrNm"
                name="dpstrNm"
                value={acctSearchParams.dpstrNm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAcctSearchParams((prev) => ({
                    ...prev,
                    dpstrNm: e.target.value,
                  }))
                }
                fullWidth
              />
            </div>
          </div>
        </Box>

        <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button
              variant="contained"
              type="submit"
              color="primary"
              form="search-account"
            >
              검색
            </Button>
          </div>
        </Box>
      </Box>

      <TableDataGrid
        headCells={parGprAccTrHeadCells}
        rows={accountInfo}
        selectedRowIndex={selectedAccount}
        onRowClick={handleClickAcctRow}
        loading={false}
        emptyMessage="계좌정보가 없습니다."
      />
      <Box className="table-bottom-button-group">
        <div className="button-right-align">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAccountModal(true)}
          >
            신규등록
          </Button>
          <Button variant="contained" color="error" onClick={removeAccountInfo}>
            계좌정보 삭제
          </Button>
        </div>
      </Box>
      <TableContainer sx={{ mt: 2, mb: 10 }}>
        <Table className="table table-bordered">
          <colgroup>
            <col style={{ width: '10%' }}></col>
            <col style={{ width: '40%' }}></col>
            <col style={{ width: '10%' }}></col>
            <col style={{ width: '40%' }}></col>
          </colgroup>
          <TableBody>
            <TableRow>
              <TableCell className="td-head table-head-text">
                <span className="required-text" >*</span>예금주명
              </TableCell>
              <TableCell colSpan={3}>{params.dpstrNm}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="td-head table-head-text">
                <span className="required-text" >*</span>금융기관
              </TableCell>
              <TableCell>{params.bankNm}</TableCell>
              <TableCell className="td-head table-head-text">
                <span className="required-text" >*</span>계좌번호
              </TableCell>
              <TableCell>{params.actno}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <FormModal
        title={'계좌신규등록'}
        size={'xl'}
        buttonLabel=""
        submitBtn={false}
        remoteFlag={openAccountModal}
        closeHandler={() => setOpenAccountModal(false)}
        btnSet={
          <Button variant="contained" color="primary" onClick={saveAccountInfo}>
            저장
          </Button>
        }
      >
        <TableContainer sx={{ width: 700, mt: 2, mb: 5 }}>
          <Table className="table table-bordered">
            <colgroup>
              <col style={{ width: '15%' }}></col>
              <col style={{ width: '35%' }}></col>
              <col style={{ width: '15%' }}></col>
              <col style={{ width: '35%' }}></col>
            </colgroup>
            <TableBody>
              <TableRow>
                <TableCell className="td-head table-head-text">
                  예금주명
                </TableCell>
                <TableCell colSpan={3}>
                  <CustomTextField
                    id="dpstrNm"
                    name="dpstrNm"
                    value={acctParams.dpstrNm}
                    onChange={handleAcctParamChange}
                    style={{ width: '40%' }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="td-head table-head-text">
                  금융기관
                </TableCell>
                <TableCell>
                  <CustomFormLabel
                    className="input-label-none"
                    htmlFor="sch-bankCd"
                  >
                    금융기관
                  </CustomFormLabel>
                  <CommSelect
                    cdGroupNm={'973'}
                    pName="bankCd"
                    pValue={acctParams.bankCd}
                    handleChange={handleAcctParamChange}
                    htmlFor={'sch-bankCd'}
                  />
                </TableCell>
                <TableCell className="td-head table-head-text">
                  계좌번호
                </TableCell>
                <TableCell>
                  <CustomTextField
                    id="actno"
                    name="actno"
                    value={acctParams.actno}
                    onChange={handleAcctParamChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </FormModal>
    </Box>
  )
}

export default ModalContent
