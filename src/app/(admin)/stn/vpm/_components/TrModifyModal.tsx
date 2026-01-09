import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { VhclRow, VhclSearchModal } from '@/components/tr/popup/VhclSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getDateFormatYMD,
  getForamtAddDay,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './TrPage'

interface TrModifyModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  type: 'I' | 'U'
  reload: () => void
}

type data = {
  vhclNo: string //차량번호
  vonrNm: string //소유자명
  crno: string //사업자등록번호
  vonrRrno: string //주민등록번호
  vonrBrno: string //차주사업자등록번호
  vhclPsnCd: string //소유코드
  locgovCd: string //관할관청코드
  koiCd: string //유종코드
  koiCdNm: string //유종
  vhclTonCd: string //톤수코드
  vhclTonNm: string //톤수
  bgngYmd: string //휴지시작일
  endYmd: string //휴지종료일
  chgRsnCn: string //휴지사유
  hstrySn: string //순번
  vonrRrnoSecure: string
  locgovNm: string
  [key: string]: string | number
}

const TrModifyModal = (props: TrModifyModalProps) => {
  const { open, handleClickClose, row, type, reload } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const resetData = {
    vhclNo: '',
    vonrNm: '',
    crno: '',
    vonrRrno: '',
    vonrBrno: '',
    vhclPsnCd: '',
    locgovCd: '',
    koiCd: '',
    koiCdNm: '',
    vhclTonCd: '',
    vhclTonNm: '',
    bgngYmd: '',
    endYmd: '',
    chgRsnCn: '',
    hstrySn: '',
    vonrRrnoSecure: '',
    locgovNm: '',
  }

  const [data, setData] = useState<data>(resetData)

  useEffect(() => {
    if (row && type === 'U') {
      setData({
        vhclNo: row.vhclNo,
        vonrNm: row.vonrNm,
        crno: row.crno,
        vonrRrno: row.vonrRrno,
        vonrBrno: row.vonrBrno,
        vhclPsnCd: row.vhclPsnCd,
        locgovCd: row.locgovCd,
        koiCd: row.koiCd,
        koiCdNm: row.koiNm,
        vhclTonCd: row.vhclTonCd,
        vhclTonNm: row.vhclTonNm,
        bgngYmd: getDateFormatYMD(row.bgngYmd),
        endYmd: getDateFormatYMD(row.endYmd),
        chgRsnCn: row.chgRsnCn,
        hstrySn: row.hstrySn,
        vonrRrnoSecure: row.vonrRrnoSecure,
        locgovNm: row.locgovNm,
      })
    } else {
      setData(resetData)
    }
  }, [open])

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const setVhcl = (vhclRow: VhclRow) => {
    setData((prev) => ({
      ...prev,
      vhclNo: vhclRow.vhclNo,
      vonrNm: vhclRow.vonrNm,
      crno: vhclRow.crno,
      vonrRrno: vhclRow.vonrRrno,
      vonrBrno: vhclRow.vonrBrno,
      vhclPsnCd: vhclRow.vhclPsnCd,
      locgovCd: vhclRow.locgovCd,
      koiCd: vhclRow.koiCd,
      koiCdNm: vhclRow.koiNm,
      vhclTonCd: vhclRow.vhclTonCd,
      vhclTonNm: vhclRow.vhclTonNm,
      locgovNm: vhclRow.locgovNm,
      vonrRrnoSecure: vhclRow.vonrRrnoSecure,
      chgRsnCn: '',
      hstrySn: '',
    }))

    setVhclOpen(false)
  }

  const saveData = async () => {
    if (!data.vhclNo) {
      alert('차량을 선택해주세요.')
      return
    }

    if (!data.bgngYmd) {
      alert('휴지시작일자를 입력해주세요.')
      return
    }

    if (!data.endYmd) {
      alert('휴지종료일자를 입력해주세요.')
      return
    }

    if (!data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('휴지사유를 입력해주세요.')
      return
    }

    if (
      data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 100
    ) {
      alert('휴지사유를 100자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if (type === 'U') {
      if (data.endYmd < data.bgngYmd || data.endYmd < getFormatToday()) {
        alert('종료일자는 시작일자 또는 오늘일자 이후여야 합니다.')
        return
      }
    } else {
      if (data.bgngYmd <= getFormatToday()) {
        alert('휴지시작일자는 오늘일자 이후여야 합니다.')
        return
      } else if (data.endYmd < data.bgngYmd) {
        alert('종료일자는 시작일자 이후여야 합니다.')
        return
      }
    }

    if (
      !confirm(
        type == 'I'
          ? '차량휴지정보를 등록하시겠습니까?'
          : '차량휴지정보를 수정하시겠습니까?',
      )
    ) {
      return
    }

    let endpoint: string =
      type === 'I'
        ? `/fsm/stn/vpm/tr/createVhclePauseMng`
        : `/fsm/stn/vpm/tr/updateVhclePauseMng`

    let params = {
      vhclNo: data.vhclNo,
      vonrNm: data.vonrNm,
      crno: data.crno,
      vonrRrno: data.vonrRrno,
      vonrBrno: data.vonrBrno,
      vhclPsnCd: data.vhclPsnCd,
      locgovCd: data.locgovCd,
      koiCd: data.koiCd,
      koiCdNm: data.koiNm,
      vhclTonCd: data.vhclTonCd,
      vhclTonNm: data.vhclTonNm,
      bgngYmd: data.bgngYmd.replaceAll('-', ''),
      endYmd: data.endYmd.replaceAll('-', ''),
      chgRsnCn: data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      hstrySn: Number(data.hstrySn),
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

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '1100px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량휴지{type === 'U' ? '수정' : '등록'}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
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
                      차량번호
                    </th>
                    <td
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        border: 0,
                      }}
                    >
                      <span>{data.vhclNo}</span>
                      {type === 'U' ? (
                        <></>
                      ) : (
                        <Button
                          onClick={() => setVhclOpen(true)}
                          variant="contained"
                          color="dark"
                        >
                          선택
                        </Button>
                      )}
                    </td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.vonrNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {brNoFormatter(data.vonrBrno)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {rrNoFormatter(data.vonrRrnoSecure)}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.koiCdNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.vhclTonNm}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.locgovNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      휴지시작일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-start"
                        >
                          휴지시작일
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="bgngYmd"
                          value={data.bgngYmd}
                          onChange={handleParamChange}
                          inputProps={{
                            min: getForamtAddDay(1),
                          }}
                          fullWidth
                          disabled={
                            type == 'U' && data.bgngYmd < getFormatToday()
                          }
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      휴지종료일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-end"
                        >
                          휴지종료일
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="endYmd"
                          value={data.endYmd}
                          onChange={handleParamChange}
                          inputProps={{
                            min: data.bgngYmd,
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      휴지사유
                    </th>
                    <td colSpan={5}>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-fname-input-01"
                      >
                        휴지사유
                      </CustomFormLabel>
                      <textarea
                        className="MuiTextArea-custom"
                        id="ft-fname-input-01"
                        name="chgRsnCn"
                        // multiline
                        rows={6}
                        // fullWidth
                        onChange={handleParamChange}
                        value={data.chgRsnCn}
                        maxLength={100}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
      <VhclSearchModal
        onCloseClick={() => setVhclOpen(false)}
        onRowClick={setVhcl}
        title="차량번호 조회"
        //url="/fsm/stn/vpm/tr/getUserVhcle"
        open={vhclOpen}
      />
    </Box>
  )
}

export default TrModifyModal
