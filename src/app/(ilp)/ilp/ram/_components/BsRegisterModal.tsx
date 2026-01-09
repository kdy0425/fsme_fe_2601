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
import {
  VhclSearchModal,
  VhclRow,
} from '@/app/components/bs/popup/VhclSearchModal'
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
  locgovCd: string
  locgovNm: string
  brno: string
  bzentyNm: string

  // 입력/수정(리스트에서 열릴 때)
  bankCd: string
  actno: string
  dpstrNm: string

  // 입력/수정(디테일에서 열릴 때) - 기존
  rdmAmt: string
  rdmYmd: string

  // 신규 필드
  rdmActnAmt: string // 환수조치금액 NUMERIC(20,0)
  rdmTrgtNocs: string // 환수대상건수 NUMERIC(20,0)
  rdmActnYmd: string // 환수조치일자 (YYYY-MM-DD)
  rdmYn: string // 환수여부 'Y' | 'N'
  delYn: string // 삭제여부 'Y' | 'N'
  rdmDt: string // 환수일시 (datetime-local)
}

const BsRegisterModal = (props: RegisterModalProps) => {
  const { open, handleClickClose, row, type, reload, origin } = props

  // origin에 따라 필드 활성화 처리
  const [inputEnable, setInputEnable] = useState<boolean>(false)
  const isDisabled = (name?: string) => {
    // 디테일 화면에서 열렸다면 기존(rdmAmt/rdmYmd) + 신규 필드까지 수정 가능
    // if (origin === 'detail') {
    //   if (!name) return true
    //   return !(
    //     name === 'rdmAmt' ||
    //     name === 'rdmYmd' ||
    //     name === 'rdmActnAmt' ||
    //     name === 'rdmTrgtNocs' ||
    //     name === 'rdmActnYmd' ||
    //     name === 'rdmYn' ||
    //     name === 'delYn' ||
    //     name === 'rdmDt'
    //   )
    // }

    if (origin === 'list') {
      if (!name) return inputEnable
      // 리스트 모드: 기존 규칙 유지(금액/일자만)
      return name === 'rdmAmt' || name === 'rdmYmd'
    }
    // 리스트(버튼)에서 열렸다면 기존 로직
    return inputEnable
  }

  const [vhclOpen, setVhclOpen] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  const [data, setData] = useState<data>({
    exmnNo: '',
    vhclNo: '',
    locgovCd: '',
    locgovNm: '',
    brno: '',
    bzentyNm: '',
    bankCd: '',
    actno: '',
    dpstrNm: '',
    rdmAmt: '',
    rdmYmd: '',
    rdmActnAmt: '',
    rdmTrgtNocs: '',
    rdmActnYmd: '',
    rdmYn: '',
    delYn: '',
    rdmDt: '',
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
        // bankCd:   row?.bankCd ?? '',
        // actno:    row?.actno ?? '',
        // dpstrNm:  row?.dpstrNm ?? '',
        // rdmAmt:   row?.rdmAmt ? String(row.rdmAmt) : '',
        // rdmYmd:   getDateFormatYMD(row?.rdmYmd ?? ''),

        // 신규 필드 매핑(없으면 공백)
        rdmActnAmt: row?.rdmActnAmt ? String(row.rdmActnAmt) : '',
        rdmTrgtNocs: row?.rdmTrgtNocs ? String(row.rdmTrgtNocs) : '',
        rdmActnYmd: getDateFormatYMD((row as any)?.rdmActnYmd ?? ''),
        rdmYn: (row as any)?.rdmYn ?? '',
        delYn: (row as any)?.delYn ?? '',
        // datetime-local은 'YYYY-MM-DDTHH:mm' 형식을 권장, 원본이 다르면 그대로 주입
        rdmDt: (row as any)?.rdmDt ?? '',
      }))

      setInputEnable(false)
    }
  }, [open, type, row])

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
      bzentyNm: vhclRow.bzentyNm,
      brno: vhclRow.brno,
      locgovCd: vhclRow.locgovCd,
      locgovNm: vhclRow.locgovNm,
      // 아래 필드는 상단 표시/저장에 현재 사용되지 않으나 기존 패턴 유지
      // @ts-ignore
      // vonrNm: vhclRow.rprsvNm,
      // // @ts-ignore
      // crno: vhclRow.crno,
      // // @ts-ignore
      // vonrRrno: vhclRow.rprsvRrno,
      // // @ts-ignore
      // vonrRrnoS: vhclRow.rprsvRrnoS,

      // // @ts-ignore

      // // @ts-ignore
      // koiCd: vhclRow.koiCd,
      // // @ts-ignore
      // koiNm: vhclRow.koiNm,

      // // @ts-ignore
      // bzmnSeCd: vhclRow.bzmnSeCd,
    }))
    setVhclOpen(false)
  }

  const validation = () => {
    if (origin == 'list') {
      if (!data.vhclNo.trim()) {
        alert('차량번호를 선택해주세요.')
      } else if (!data.rdmActnAmt.trim()) {
        alert('환수조치금액을 입력해주세요.')
      } else if (data.rdmActnAmt.startsWith('0')) {
        alert('환수조치금액을 확인해주세요.')
      } else if (!data.rdmActnYmd.trim()) {
        alert('환수조치일자를 입력해주세요.')
      } else {
        return true
      }
      // } else if (origin == 'detail') {
      //   if (!data.rdmAmt.trim()) {
      //     alert('환수금액을 입력해주세요.')
      //   } else if (data.rdmAmt.startsWith('0')) {
      //     alert('금액을 확인해주세요.')
      //   } else if (!data.rdmYmd) {
      //     alert('환수일자를 입력해주세요.')
      //   } else if (data.rdmYmd <= getFormatToday()) {
      //     alert('환수일자는 오늘일자 이후여야 합니다.')
      //   } else {
      //     return true;
      //   }
    }

    return false
  }

  const saveData = async () => {
    if (validation()) {
      const isInsert = type === 'I'
      const endpoint = isInsert
        ? '/ilp/ram/bs/insertRdmResultDd'
        : '/ilp/ram/bs/updateRdmAmtMngDd'
      const method = isInsert ? 'POST' : 'PUT'

      if (
        confirm(
          isInsert
            ? '환수금 정보를 신규 등록하시겠습니까?'
            : origin === 'list'
              ? '환수금정보를 수정하시겠습니까?'
              : '환수금정보를 수정하시겠습니까?',
        )
      ) {
        // origin에 따라 파라미터 구성은 기존 유지
        let params: any = {}
        if (origin === 'list') {
          params = {
            exmnNo: data.exmnNo,
            vhclNo: data.vhclNo,
            locgovCd: data.locgovCd,
            brno: data.brno,
            bzentyNm: data.bzentyNm,
            rdmActnAmt: data.rdmActnAmt,
            rdmTrgtNocs: data.rdmTrgtNocs,
            rdmActnYmd: data.rdmActnYmd
              ? data.rdmActnYmd.replaceAll('-', '')
              : undefined,
          }
          // } else {
          //   params = {
          //     exmnNo: data.exmnNo,
          //     rdmAmt: data.rdmAmt,
          //     rdmYmd: data.rdmYmd?.replaceAll?.('-', '') ?? '',
          //     // 신규 필드(있을 때만 전송)
          //     rdmActnAmt:  data.rdmActnAmt || undefined,
          //     rdmTrgtNocs: data.rdmTrgtNocs || undefined,
          //     rdmActnYmd:  data.rdmActnYmd ? data.rdmActnYmd.replaceAll('-', '') : undefined,
          //     rdmYn:       data.rdmYn || undefined,
          //     delYn:       data.delYn || undefined,
          //     rdmDt:       data.rdmDt || undefined,
          //   };
        }

        try {
          setLoadingBackdrop(true)
          const res = await sendHttpRequest(method, endpoint, params, true, {
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
          ? '해당 환수 대상을 삭제처리 하시겠습니까?'
          : '해당 환수금 납부정보를 초기화하시겠습니까?',
      )
    ) {
      return
    }

    const endpoint: string =
      origin === 'list'
        ? `/ilp/ram/bs/updateRdmAmtMngDd`
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
              <h2>환수금 대상자</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
                저장
              </Button>
              {
                (type === 'U') ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                  >
                    삭제
                  </Button>
                ) : <></>
              }
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

                  {/* 신규 필드 1: 조치금액 / 대상건수 / 조치일자 */}
                  <tr>
                    <th className="td-head" scope="row">
                      환수조치금액
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-rdmActnAmt"
                      >
                        환수조치금액
                      </CustomFormLabel>
                      <CustomTextField
                        type="number"
                        id="ft-rdmActnAmt"
                        name="rdmActnAmt"
                        value={data.rdmActnAmt}
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
                        disabled={isDisabled('rdmActnAmt')}
                      />
                    </td>
                    <th className="td-head" scope="row">
                      환수대상건수
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-rdmTrgtNocs"
                      >
                        환수대상건수
                      </CustomFormLabel>
                      <CustomTextField
                        type="number"
                        id="ft-rdmTrgtNocs"
                        name="rdmTrgtNocs"
                        value={data.rdmTrgtNocs}
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
                        disabled={isDisabled('rdmTrgtNocs')}
                      />
                    </td>
                    <th className="td-head" scope="row">
                      환수조치일자
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-rdmActnYmd"
                      >
                        환수조치일자
                      </CustomFormLabel>
                      <CustomTextField
                        type="date"
                        id="ft-rdmActnYmd"
                        name="rdmActnYmd"
                        value={data.rdmActnYmd}
                        onChange={handleParamChange}
                        fullWidth
                        disabled={isDisabled('rdmActnYmd')}
                      />
                    </td>
                  </tr>

                  {/* 신규 필드 2: 환수일시 / 환수여부 / 삭제여부 */}
                  {/* <tr>
                    <th className="td-head" scope="row">환수일시</th>
                    <td>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-rdmDt">환수일시</CustomFormLabel>
                      <CustomTextField
                        type="datetime-local"
                        id="ft-rdmDt"
                        name="rdmDt"
                        value={data.rdmDt}
                        onChange={handleParamChange}
                        fullWidth
                        disabled={isDisabled('rdmDt')}
                      />
                    </td>
                    <th className="td-head" scope="row">환수여부</th>
                    <td>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-rdmYn">환수여부</CustomFormLabel>
                      <CustomTextField
                        select
                        SelectProps={{ native: true }}
                        id="ft-rdmYn"
                        name="rdmYn"
                        value={data.rdmYn}
                        onChange={handleParamChange}
                        fullWidth
                        disabled={isDisabled('rdmYn')}
                      >
                        <option value="">선택</option>
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </CustomTextField>
                    </td>
                    <th className="td-head" scope="row">삭제여부</th>
                    <td>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-delYn">삭제여부</CustomFormLabel>
                      <CustomTextField
                        select
                        SelectProps={{ native: true }}
                        id="ft-delYn"
                        name="delYn"
                        value={data.delYn}
                        onChange={handleParamChange}
                        fullWidth
                        disabled={isDisabled('delYn')}
                      >
                        <option value="">선택</option>
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </CustomTextField>
                    </td>
                  </tr> */}

                  {/* 은행/계좌/예금주 - 기존 주석 블록 (필요시 활성화) */}
                  {/*
                  <tr>
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
                  </tr>
                  */}
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
          onRowClick={setVhcl}
          onCloseClick={() => setVhclOpen(false)}
          // RowClickClose={true}
          //ctpvAllVisable={false}
          // locgovAllVisable={false}
          url={'/fsm/stn/vm/bs/getAllVhcleMng'}
          // onCloseClick={() => setVhclOpen(false)}
          // onRowClick={setVhcl}
          title="차량번호 조회"
          open={vhclOpen}
        />
      ) : null}
    </Box>
  )
}

export default BsRegisterModal
