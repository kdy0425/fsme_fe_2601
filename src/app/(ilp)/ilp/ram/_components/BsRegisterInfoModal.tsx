import { Box } from '@mui/material'
import { Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { VhclSearchModal, VhclRow } from '@/components/tx/popup/VhclSearchModal'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getToday } from '@/utils/fsms/common/comm'

interface RegisterModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  type: 'I' | 'U'
  reload: () => void
  origin: 'list' | 'detail'
}

interface data {
  // 공통(저장/삭제에 필요)
  exmnNo: string

  // 상단 표시용
  vhclNo: string
  locgovNm: string
  brno: string
  bzentyNm: string

  // 입력/수정(리스트에서 열릴 때)
  bankCd: string
  actno: string
  dpstrNm: string

  // 입력/수정(디테일에서 열릴 때)
  rdmAmt: string
  rdmYmd: string
}

const BsRegisterInfoModal = (props: RegisterModalProps) => {
  const { open, handleClickClose, row, type, reload, origin } = props

  // origin에 따라 필드 활성화 처리
  const isDisabled = (name?: string) => {
    // 디테일 화면에서 열렸다면 rdmAmt / rdmYmd만 수정 가능
    if (origin === 'detail') {
      if (!name) return true
      return !(name === 'rdmAmt' || name === 'rdmYmd')
    }

    if (origin === 'list') {
      if (!name) return inputEnable
      return name === 'rdmAmt' || name === 'rdmYmd'
    }
    // 리스트(버튼)에서 열렸다면 기존 로직
    return inputEnable
  }

  const [vhclOpen, setVhclOpen] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)
  const [inputEnable, setInputEnable] = useState<boolean>(false)

  const [data, setData] = useState<data>({
    exmnNo: '',
    vhclNo: '',
    locgovNm: '',
    brno: '',
    bzentyNm: '',
    bankCd: '',
    actno: '',
    dpstrNm: '',
    rdmAmt: '',
    rdmYmd: '',
  })

  useEffect(() => {
    if (open && type === 'U') {
      setData((prev) => ({
        ...prev,
        exmnNo: row?.exmnNo ?? '',
        vhclNo: row?.vhclNo ?? '',
        locgovNm: row?.locgovNm ?? '',
        brno: row?.brno ?? '',
        bzentyNm: row?.bzentyNm ?? '',
        bankCd: row?.bankCd ?? '',
        actno: row?.actno ?? '',
        dpstrNm: row?.dpstrNm ?? '',
        rdmAmt: row?.rdmAmt ? String(row.rdmAmt) : '',
        rdmYmd: getDateFormatYMD(row?.rdmYmd ?? ''),
      }))

      setInputEnable(false)
    }
  }, [open])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const setVhcl = (vhclRow: VhclRow) => {
    console.log(vhclRow)
    setData((prev) => ({
      ...prev,
      vhclNo: vhclRow.vhclNo,
      vonrNm: vhclRow.rprsvNm,
      crno: vhclRow.crno,
      vonrRrno: vhclRow.rprsvRrno,
      vonrRrnoS: vhclRow.rprsvRrnoS,
      brno: vhclRow.brno,
      locgovCd: vhclRow.locgovCd,
      koiCd: vhclRow.koiCd,
      koiNm: vhclRow.koiNm,
      locgovNm: vhclRow.locgovNm,
      bzmnSeCd: vhclRow.bzmnSeCd,
    }))
    setVhclOpen(false)
  }

  const validation = () => {
    if (origin == 'list') {
      if (!data.bankCd.trim()) {
        alert('은행코드를 입력해주세요.')
      } else if (!data.actno.trim()) {
        alert('계좌번호를 입력해주세요.')
      } else if (!data.dpstrNm.trim()) {
        alert('예금주명을 입력해주세요.')
      } else {
        return true
      }
    } else if (origin == 'detail') {
      if (!data.rdmAmt.trim()) {
        alert('환수금액을 입력해주세요.')
      } else if (data.rdmAmt.startsWith('0')) {
        alert('금액을 확인해주세요.')
      } else if (!data.rdmYmd) {
        alert('환수일자를 입력해주세요.')
      } else if (data.rdmYmd <= getFormatToday()) {
        alert('환수일자는 오늘일자 이후여야 합니다.')
      } else {
        return true
      }
    }

    return false
  }

  const saveData = async () => {
    if (validation()) {
      if (
        confirm(
          origin == 'list'
            ? '환수금정보를 수정하시겠습니까?'
            : '환수금 납부정보를 수정하시겠습니까?',
        )
      ) {
        const endpoint: string =
          origin === 'list'
            ? `/ilp/ram/bs/updateRdmAmtMng`
            : `/ilp/ram/bs/updateRdmAmtMngDetail`

        let params = {}

        if (origin == 'list') {
          params = {
            exmnNo: data.exmnNo,
            actno: data.actno,
            dpstrNm: data.dpstrNm,
            bankCd: data.bankCd,
          }
        } else {
          params = {
            exmnNo: data.exmnNo,
            rdmAmt: data.rdmAmt,
            rdmYmd: data.rdmYmd.replaceAll('-', ''), //환수일자
          }
        }

        try {
          setLoadingBackdrop(true)

          const response = await sendHttpRequest(
            'PUT',
            endpoint,
            params,
            true,
            { cache: 'no-store' },
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

  const handleDelete = async () => {
    if (!data.exmnNo) {
      alert('대상 조사번호가 없습니다.')
      return
    }
    if (
      !confirm(
        origin === 'list'
          ? '해당 환수건을 삭제처리 하시겠습니까?'
          : '해당 환수금 납부정보를 초기화하시겠습니까?',
      )
    ) {
      return
    }

    const endpoint: string =
      origin === 'list'
        ? `/ilp/ram/bs/updateRdmAmtMng`
        : `/ilp/ram/bs/updateRdmAmtMngDetail`

    // origin에 따라 다른 파라미터 전송
    const params = {
      exmnNo: data.exmnNo,
      delYn: 'Y',
    }

    try {
      setLoadingBackdrop(true)
      const res = await sendHttpRequest('PUT', endpoint, params, true, {
        cache: 'no-store',
      })
      if (res && res.resultType === 'success') {
        alert(res.message)
        handleClickClose()
        reload()
      } else {
        alert(res?.message ?? '처리에 실패했습니다.')
      }
    } catch (e: any) {
      alert(e?.message ?? String(e))
    } finally {
      setLoadingBackdrop(false)
    }
  }

  useEffect(() => {
    if (open) {
      setData((prev) => ({
        ...prev,
        bankCd: row?.bankCd ?? '',
      }))
    }
  }, [open, row?.bankCd])

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        onClose={handleClickClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>환수금 {origin === 'list' ? '정보' : '납부정보'}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                삭제
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={handleClickClose}
              >
                닫기
              </Button>
            </div>
          </Box>
          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>체납 환수금 등록 및 수정 영역</caption>
                <colgroup>
                  <col style={{ width: '11%' }}></col>
                  <col style={{ width: '22%' }}></col>
                  <col style={{ width: '11%' }}></col>
                  <col style={{ width: '22%' }}></col>
                  <col style={{ width: '11%' }}></col>
                  <col style={{ width: '22%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {data.vhclNo}
                        {type === 'I' ? (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              width: '100%',
                            }}
                          >
                            <div style={{ float: 'right' }}>
                              <Button
                                onClick={() => setVhclOpen(true)}
                                variant="contained"
                                color="dark"
                              >
                                선택
                              </Button>
                            </div>
                          </Box>
                        ) : null}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {data.locgovNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {brNoFormatter(data.brno)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {data.bzentyNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      환수금액
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-rdmAmt"
                      >
                        환수금액
                      </CustomFormLabel>
                      <CustomTextField
                        type="number"
                        id="ft-rdmAmt"
                        name="rdmAmt"
                        value={data.rdmAmt}
                        onChange={handleParamChange}
                        inputProps={{ maxLength: 20, type: 'number' }}
                        onInput={(e: {
                          target: {
                            value: string
                            maxLength: number | undefined
                          }
                        }) => {
                          e.target.value = Math.max(0, parseInt(e.target.value))
                            .toString()
                            .slice(0, e.target.maxLength)
                        }}
                        placeholder="숫자만 입력 가능합니다."
                        fullWidth
                        disabled={isDisabled('rdmAmt')}
                      />
                    </td>
                    <th className="td-head" scope="row">
                      환수일자
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-date-end"
                      >
                        환수일자
                      </CustomFormLabel>
                      <CustomTextField
                        type="date"
                        id="ft-date-end"
                        name="rdmYmd"
                        value={data.rdmYmd}
                        onChange={handleParamChange}
                        inputProps={{
                          min: getForamtAddDay(1),
                        }}
                        fullWidth
                        disabled={isDisabled('rdmYmd')}
                      />
                    </td>
                  </tr>
                  {/* <tr>
                      <th className="td-head" scope="row">
                        은행
                      </th>
                      <td>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-fname-input-01">은행코드</CustomFormLabel>
                        <CommSelect
                          key={`bankCd-${open}-${data.exmnNo}-${data.bankCd || ''}`}  // 리마운트
                          cdGroupNm="973"
                          pValue={data.bankCd || ''}                 
                          defaultValue={data.bankCd || ''}      
                          addText="선택하세요"      
                          handleChange={handleParamChange}     
                          pName="bankCd"
                          htmlFor="sch-bankCd"
                          pDisabled={isDisabled('bankCd')}
                        />
                      </td>
                      <th className="td-head" scope="row">
                        계좌번호
                      </th>
                      <td>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-fname-input-01">계좌번호</CustomFormLabel>
                        <CustomTextField
                          id="ft-fname-input-01"
                          name="actno"
                          fullWidth
                          onChange={handleParamChange}
                          value={data.actno}
                          disabled={isDisabled('actno')}
                        />
                      </td>
                      <th className="td-head" scope="row">
                        예금주명
                      </th>
                      <td>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-fname-input-01">예금주명</CustomFormLabel>
                        <CustomTextField
                          id="ft-fname-input-01"
                          name="dpstrNm"
                          fullWidth
                          onChange={handleParamChange}
                          value={data.dpstrNm}
                          disabled={isDisabled('dpstrNm')}
                        />
                      </td>
                    </tr> */}
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>

      {vhclOpen ? (
        <VhclSearchModal
          onCloseClick={() => setVhclOpen(false)}
          onRowClick={setVhcl}
          title="차량번호 조회"
          open={vhclOpen}
        />
      ) : null}
    </Box>
  )
}

export default BsRegisterInfoModal
