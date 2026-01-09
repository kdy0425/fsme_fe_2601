import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Grid,
  Button,
  Link,
  Dialog,
  DialogContent,
  DialogActions,
  DialogProps,
  Tooltip,
  FormGroup,
  FormControlLabel,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './TrPage'
import { VhclSearchModal, VhclRow } from '@/components/tr/popup/VhclSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
  getToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { isNumber } from '@/utils/fsms/common/comm'

interface TrModifyModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  type: 'I' | 'U'
  reload: () => void
}

type data = {
  vhclNo: string //차량번호
  exsVonrNm: string //소유자명
  exsVonrRrnoSecure: string //주민등록번호
  exsVonrBrno: string //사업자등록번호
  vhclPsnNm: string //소유구분
  chgRsnNm: string //처리구분
  aplcnYmd: string //처리일자
  chgRsnCn: string
  [key: string]: string | number
}

const TrModifyModal = (props: TrModifyModalProps) => {
  const { open, handleClickClose, row, type, reload } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const [data, setData] = useState<data>({
    vhclNo: '',
    exsVonrNm: '',
    exsVonrRrnoSecure: '',
    exsVonrBrno: '',
    vhclPsnNm: '',
    chgRsnNm: '',
    aplcnYmd: '',
    chgRsnCn: '',
  })

  useEffect(() => {
    if (row && type === 'U') {
      setData({
        vhclNo: row.vhclNo,
        exsVonrNm: row.exsVonrNm,
        exsVonrRrnoSecure: row.exsVonrRrnoSecure,
        exsVonrBrno: row.exsVonrBrno,
        vhclPsnNm: row.vhclPsnNm,
        chgRsnNm: row.chgRsnNm,
        chgRsnCn: row.chgRsnCn,
        aplcnYmd:
          row.aplcnYmd.substring(0, 4) +
          '-' +
          row.aplcnYmd.substring(4, 6) +
          '-' +
          row.aplcnYmd.substring(6, 8),
      })
    } else {
      setData({
        vhclNo: '',
        exsVonrNm: '',
        exsVonrRrnoSecure: '',
        exsVonrBrno: '',
        vhclPsnNm: '',
        chgRsnNm: '',
        //aplcnYmd: getDateFormatYMD(getToday()),
        aplcnYmd: '',
        chgRsnCn: '',
      })
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
      exsVonrNm: vhclRow.vonrNm,
      exsVonrRrnoSecure: vhclRow.vonrRrnoSecure,
      exsVonrBrno: vhclRow.vonrBrno,
      vhclPsnNm: vhclRow.vhclPsnNm,
      chgRsnNm: '차량말소(지자체)',
      chgRsnCd: '12',
      aplcnYmd: getDateFormatYMD(getToday()),
    }))

    setVhclOpen(false)
  }

  const saveData = async () => {
    if (!data.vhclNo) {
      alert('차량을 선택해주세요.')
      return
    }

    if (!data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('말소 사유를 입력해주세요.')
      return
    }

    if (
      data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 100
    ) {
      alert('말소 사유를 100자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if (
      !confirm(
        type == 'I'
          ? '차량말소정보를 등록하시겠습니까?'
          : '차량말소정보를 수정하시겠습니까?',
      )
    ) {
      return
    }
    let endpoint: string =
      type === 'I'
        ? `/fsm/stn/vem/tr/createVhcleErsr`
        : `/fsm/stn/vem/tr/updateVhcleErsrMng`

    let params = {
      vhclNo: data.vhclNo,
      aplcnYmd: data.aplcnYmd.replaceAll('-', ''),
      chgRsnCn: data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
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
            width: '1500px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량말소{type === 'U' ? '수정' : '등록'}</h2>
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
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '13%' }}></col>
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '13%' }}></col>
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
                        {type === 'U' ? (
                          <></>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              width: '100%',
                            }}
                          >
                            <Button
                              onClick={() => setVhclOpen(true)}
                              variant="contained"
                              color="dark"
                            >
                              선택
                            </Button>
                          </Box>
                        )}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.exsVonrNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {rrNoFormatter(data.exsVonrRrnoSecure ?? '')}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {brNoFormatter(data.exsVonrBrno)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      소유구분
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.vhclPsnNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      처리구분
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.chgRsnNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.aplcnYmd}
                      </div>
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      말소 사유
                    </th>
                    <td colSpan={7}>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-fname-input-01"
                      >
                        말소 사유
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
        //url="/fsm/stn/vem/tr/getUserVhcle"
        open={vhclOpen}
      />
    </Box>
  )
}

export default TrModifyModal
