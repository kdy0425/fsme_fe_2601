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
import { Row } from './TxPage'
import { VhclSearchModal, VhclRow } from '@/components/tx/popup/VhclSearchModal'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { getToday } from '@/utils/fsms/common/comm'

interface TxModifyModalProps {
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
  rprsvRrnoS: string
}

const TxModifyModal = (props: TxModifyModalProps) => {

  const { open, handleClickClose, row, type, reload } = props

  const [bgngDisabled, setBgngDisabled] = useState<boolean>(false);
  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [data, setData] = useState<data>({
    brno: '',
    vhclNo: '',
    pauseBgngYmd: '',
    pauseEndYmd: '',
    pauseRsnCn: '',
    hstrySn: '',
    rprsvNm: '',
    koiCdNm: '',
    rprsvRrnoS: '',
  })

  useEffect(() => {
    if (open && type === 'U') {
      setData({
        brno: row?.brno ?? '',
        vhclNo: row?.vhclNo ?? '',
        pauseBgngYmd: getDateFormatYMD(row?.pauseBgngYmd ?? ''),
        pauseEndYmd: getDateFormatYMD(row?.pauseEndYmd ?? ''),
        pauseRsnCn: row?.pauseRsnCn ?? '',
        rprsvNm: row?.rprsvNm ?? '',
        koiCdNm: row?.koiCdNm ?? '',
        rprsvRrnoS: row?.rprsvRrnoS ?? '',
        hstrySn: row?.hstrySn ?? '',
      });
      
      if (Number(row?.pauseBgngYmd ?? '0') <= Number(getToday())) {
        setBgngDisabled(true);
      }
    }
  }, [open])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const setVhcl = (vhclRow: VhclRow) => {

    if (vhclRow.cmSttsCd !== '000') {
      alert('[' + vhclRow.vhclNo + ' 차량상태 : ' + vhclRow.cmSttsNm + ']\n\n차량상태가 정상이 아닙니다.\n정상 차량에 한하여 차량휴지 등록이 가능합니다.');
    } else {
      setData((prev) => ({
        ...prev,
        brno: vhclRow.brno,
        vhclNo: vhclRow.vhclNo,
        rprsvNm: vhclRow.rprsvNm,
        koiCdNm: vhclRow.koiNm,
        rprsvRrnoS: vhclRow.rprsvRrnoS,
      }))
      setVhclOpen(false)
    }    
  }

  const validation = () => {

    if (type === 'U') {

      if (!data.pauseBgngYmd) {
        alert('시작일자를 입력해주세요.')
      } else if (!data.pauseEndYmd) {
        alert('종료일자를 입력해주세요.')
      } else if (!bgngDisabled && data.pauseBgngYmd <= getFormatToday()) {
        alert('휴지 시작일자는 금일 이후로 가능합니다.')
      } else if (data.pauseEndYmd < getFormatToday()) {
        alert('휴지 종료일자는 금일이전 날짜로 수정 불가합니다.')
      } else if (data.pauseEndYmd <= data.pauseBgngYmd) {
        alert('휴지 종료일자는 휴지 시작일자 이후로 가능합니다.')
      } else {
        return true;
      }

    } else {

      if (!data.vhclNo) {
        alert('차량을 선택해주세요.')
      } else if (!data.pauseBgngYmd) {
        alert('시작일자를 입력해주세요.')
      } else if (!data.pauseEndYmd) {
        alert('종료일자를 입력해주세요.')
      } else if (data.pauseBgngYmd <= getFormatToday()) {
        alert('휴지 시작일자는 금일 이후로 가능합니다.')
      } else if (data.pauseEndYmd <= data.pauseBgngYmd) {
        alert('휴지 종료일자는 휴지 시작일자 이후로 가능합니다.')
      } else {
        return true;
      }
    }   

    return false;
  }

  const saveData = async () => {

    if (validation()) {

      if (confirm('차량휴지 신규등록 및 변경 될 경우\n입력한 일자에 포함되는 해당차량의 수급자 및 거래카드는 보조금 지급정지 처리 됩니다.\n\n차량휴지 신규등록 및 변경을 하시겠습니까?')) {
        
        let endpoint: string = type === 'I' ? `/fsm/stn/vpm/tx/createVhclePauseMng` : `/fsm/stn/vpm/tx/updateVhclePauseMng`

        let params = {
          brno: data.brno,
          vhclNo: data.vhclNo,
          pauseBgngYmd: data.pauseBgngYmd.replaceAll('-', ''),
          pauseEndYmd: data.pauseEndYmd.replaceAll('-', ''),
          pauseRsnCn: data.pauseRsnCn,
          hstrySn: type === 'U' ? Number(data.hstrySn) : null,
        }

        try {

          setLoadingBackdrop(true)
          
          const response = await sendHttpRequest(type === 'I' ? 'POST' : 'PUT', endpoint, params, true, { cache: 'no-store' })

          if (response && response.resultType === 'success') {
            alert(response.message)
            handleClickClose()
            reload()
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
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
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '10%' }}></col>
                  <col style={{ width: '15%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td
                      colSpan={3}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        border: 0,
                      }}                      
                    >
                      <span>{data.vhclNo}</span>
                      {type === 'I' ? (
                        <Button
                          onClick={() => setVhclOpen(true)}
                          variant="contained"
                          color="dark"
                        >
                          선택
                        </Button>
                      ) : null}
                    </td>
                    <th className="td-head" scope="row">
                      수급자명
                    </th>
                    <td>
                      {data.rprsvNm}
                    </td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>
                      {brNoFormatter(data.brno)}
                    </td>
                    <th className="td-head" scope="row">
                    </th>
                    <td>
                    </td>
                  </tr>
                  <tr>   
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>
                      {rrNoFormatter(data.rprsvRrnoS)}
                    </td>                 
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      {data.koiCdNm}
                    </td>
                    <th className="td-head" scope="row">
                      휴지시작일
                    </th>
                    <td>
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
                        disabled={bgngDisabled}
                      />
                    </td>
                    <th className="td-head" scope="row">
                      휴지종료일
                    </th>
                    <td>
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
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      휴지사유
                    </th>
                    <td colSpan={7}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-fname-input-01">휴지사유</CustomFormLabel>
                      <textarea className="MuiTextArea-custom"
                        id="ft-fname-input-01"
                        name="pauseRsnCn"
                        rows={6}
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

export default TxModifyModal
