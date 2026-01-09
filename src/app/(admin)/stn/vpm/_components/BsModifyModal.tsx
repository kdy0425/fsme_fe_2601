import {
  CustomFormLabel,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './BsPage'
import { VhclSearchModal, VhclRow } from '@/components/bs/popup/VhclSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface BsModifyModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  type: 'I' | 'U'
  reload: () => void
}

type data = {
  brno: string
  vhclNo: string
  pauseBgngYmd: string
  pauseEndYmd: string
  pauseRsnCn: string
  hstrySn: string
  rprsvNm: string
  koiCdNm: string
  rprsvRrno: string
  [key: string]: string | number
}

const BsModifyModal = (props: BsModifyModalProps) => {
  const { open, handleClickClose, row, type, reload } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  const resetData: data = {
    brno: '',
    vhclNo: '',
    pauseBgngYmd: '',
    pauseEndYmd: '',
    pauseRsnCn: '',
    hstrySn: '',
    rprsvNm: '',
    koiCdNm: '',
    rprsvRrno: '',
  }

  const [data, setData] = useState<data>(resetData)

  useEffect(() => {
    if (row && type === 'U') {
      setData({
        brno: row.brno,
        vhclNo: row.vhclNo,
        pauseBgngYmd: getDateFormatYMD(row.pauseBgngYmd),
        pauseEndYmd: getDateFormatYMD(row.pauseEndYmd),
        pauseRsnCn: row.pauseRsnCn,
        rprsvNm: row.rprsvNm,
        koiCdNm: row.koiCdNm,
        rprsvRrno: row.rprsvRrno,
        hstrySn: row.hstrySn,
      })
    } else {
      setData(resetData)
    }
  }, [open])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const setVhcl = (vhclRow: VhclRow) => {
    setData((prev) => ({
      ...prev,
      brno: vhclRow.brno,
      vhclNo: vhclRow.vhclNo,
      rprsvNm: vhclRow.rprsvNm,
      koiCdNm: vhclRow.koiNm,
      rprsvRrno: vhclRow.rprsvRrno,
    }))
    setVhclOpen(false)
  }

  const saveData = async () => {
    if (!data.vhclNo) {
      alert('차량을 선택해주세요.')
      return
    }

    if (!data.pauseBgngYmd) {
      alert('시작일자를 입력해주세요.')
      return
    }

    if (!data.pauseEndYmd) {
      alert('종료일자를 입력해주세요.')
      return
    }

    if (type === 'U') {
      if (
        data.pauseEndYmd < data.pauseBgngYmd ||
        data.pauseEndYmd < getFormatToday()
      ) {
        alert('종료일자는 시작일자 또는 오늘일자 이후여야 합니다.')
        return
      }
    }
    if (
      !confirm(
        type === 'I'
          ? '차량휴지정보를 등록하시겠습니까?'
          : '차량휴지정보를 수정하시겠습니까?',
      )
    ) {
      return
    }
    let endpoint: string =
      type === 'I'
        ? `/fsm/stn/vpm/bs/createVhclePauseMng`
        : `/fsm/stn/vpm/bs/updateVhclePauseMng`

    let params = {
      brno: data.brno,
      vhclNo: data.vhclNo,
      pauseBgngYmd: data.pauseBgngYmd.replaceAll('-', ''),
      pauseEndYmd: data.pauseEndYmd.replaceAll('-', ''),
      pauseRsnCn: data.pauseRsnCn,
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
            width: '1200px',
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
                          sx={{ marginRight: '2%' }}
                          onClick={() => setVhclOpen(true)}
                          variant="contained"
                          color="dark"
                        >
                          선택
                        </Button>
                      )}
                    </td>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.rprsvNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      수급자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.rprsvNm}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {brNoFormatter(data.brno)}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {rrNoFormatter(data.rprsvRrno)}
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
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      휴지시작일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-start">휴지시작일</CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-start"
                          name="pauseBgngYmd"
                          value={data.pauseBgngYmd}
                          onChange={handleParamChange}
                          inputProps={{
                            min: getForamtAddDay(1),
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      휴지종료일
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">휴지종료일</CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="pauseEndYmd"
                          value={data.pauseEndYmd}
                          onChange={handleParamChange}
                          inputProps={{
                            min: data.pauseBgngYmd,
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      휴지사유
                    </th>
                    <td colSpan={5}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-fname-input-01">휴지사유</CustomFormLabel>
                      <textarea className="MuiTextArea-custom"
                        id="ft-fname-input-01"
                        name="pauseRsnCn"
                        // multiline
                        rows={6}
                        // fullWidth
                        onChange={handleParamChange}
                        value={data.pauseRsnCn}
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
        url="/fsm/stn/vpm/bs/getAllVhcleMng"
        open={vhclOpen}
      />
    </Box>
  )
}

export default BsModifyModal
