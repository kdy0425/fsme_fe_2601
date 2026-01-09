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
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { brNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { VhclSearchModal, VhclRow } from '@/components/tr/popup/VhclSearchModal'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { ApiError } from '@/types/message'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'

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
  koiNm: string //유종명
  koiCd: string //유종코드
  aplcnYmd: string //적용일자
  orgAplcnYmd: string //이전 적용일자
  bfchgVhclTonCd: string //변경전 톤수코드
  aftchVhclTonCd: string //변경톤수 코드
  chgRsnCn: string //변경사유
  vhclSttsCd: string
  [key: string]: string | number
}

const TrModifyModal = (props: TrModifyModalProps) => {
  const { open, handleClickClose, row, type, reload } = props

  const [vhclOpen, setVhclOpen] = useState(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [koiItems, setKoiItems] = useState<SelectItem[]>([])
  const [vhclTonCode, setVhclTonCode] = useState<SelectItem[]>([])

  const [data, setData] = useState<data>({
    vhclNo: '',
    aplcnYmd: getForamtAddDay(1),
    vonrNm: '',
    koiNm: '',
    koiCd: '',
    orgAplcnYmd: '',
    bfchgVhclTonCd: '',
    aftchVhclTonCd: '',
    chgRsnCn: '',
    vhclSttsCd: '',
  })

  useEffect(() => {
    if (row && type === 'U') {
      setData({
        hstrySn: row.hstrySn,
        vhclNo: row.vhclNo,
        vonrNm: row.vonrNm,
        koiNm: row.aftchKoiCdNm,
        koiCd: row.aftchKoiCd,
        aplcnYmd: getDateFormatYMD(row.aplcnYmd), // 원래 적용일자를 가지고  바뀌는 적용일자 기본 세팅
        orgAplcnYmd: row.aplcnYmd, // 적용일자 이지만 이제 이전 적요일자가 된다.
        bfchgVhclTonCd: row.bfchgVhclTonCd,
        // 가져온 변정 톤수코드(row.aftchVhclTonCd)가
        //이제는 새로 요청하는 바디에서 이전 데이터(bfchgVhclTonCd)가 되니까 이렇게 매핑한다
        aftchVhclTonCd: row.aftchVhclTonCd, // 직전데이터로 우선 세팅
        chgRsnCn: row.chgRsnCn,
        vhclSttsCd: row.vhclSttsCd,
      })
    } else {
      setData({
        vhclNo: '',
        vonrNm: '',
        koiNm: '',
        koiCd: '',
        aplcnYmd: getForamtAddDay(0),
        orgAplcnYmd: '',
        bfchgVhclTonCd: '',
        aftchVhclTonCd: '',
        chgRsnCn: '',
        vhclSttsCd: '',
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
    if (vhclRow.isTodayStopCancel === 'Y') {
      alert(
        '이 차량은 당일 차량복원 내역이 있어 제원변경을 실행할 수 없습니다.\n하루가 지난 후 제원변경을 다시 실행해 주시기 바랍니다.',
      )
      return
    } else if (vhclRow.vhclSttsCd !== '00') {
      alert('말소된 차량은 제원변경을 할 수 없습니다.')
      return
    } else {
      setData((prev) => ({
        ...prev,
        vhclNo: vhclRow.vhclNo, // 차량번호
        vonrNm: vhclRow.vonrNm, // 소유자명
        koiNm: vhclRow.koiNm, // 유종 이름
        koiCd: vhclRow.koiCd, // 유종 코드
        bfchgVhclTonCd: vhclRow.vhclTonCd, // 이전 톤수
        aftchVhclTonCd: '',
        vhclSttsCd: vhclRow.vhclSttsCd,
        //aftchVhclTonCd: vhclRow.vhclTonCd,     // 이후 톤수
        aplcnYmd: getForamtAddDay(0), // 적용 일자
        chgRsnCn: '', // 변경 사유
      }))
    }
    setVhclOpen(false)
  }

  const saveData = async () => {
    if (!data.vhclNo) {
      alert('차량을 선택해주세요.')
      return
    }

    if (!data.aplcnYmd) {
      alert('적용일자 입력해주세요.');
      return
    }

    if(data.aplcnYmd < getFormatToday()){
      alert('적용일자는 현재날짜보다 이전일 수 없습니다.');
      return
    }

    if (!data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('변경사유를 입력해주세요.')
      return
    }

    if (data.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30) {
      alert('변경사유를 30자리 이하로 입력해주시기 바랍니다.')
      return
    }

    if (!data.aftchVhclTonCd) {
      alert('변경할 톤수를 선택해주세요.')
      return
    }

    if (data.bfchgVhclTonCd == data.aftchVhclTonCd) {
      alert('톤수가 변경되지 않았습니다.\n톤수를 변경 한 후 진행해 주십시오.')
      return
    }
    if (data.vhclSttsCd !== '00') {
      alert('말소된 차량은 제원변경을 할 수 없습니다.')
      return
    }

    // if (type === 'U') {
    //   if (
    //     data.pauseEndYmd < data.pauseBgngYmd ||
    //     data.pauseEndYmd < getFormatToday()
    //   ) {
    //     alert('종료일자는 시작일자 또는 오늘일자 이후여야 합니다.')
    //     return
    //   }
    // }

    if (
      !confirm(
        type == 'I'
          ? '차량제원을 등록하시겠습니까?'
          : '차량제원을 수정하시겠습니까?',
      )
    ) {
      return
    }
    let endpoint: string =
      type === 'I'
        ? `/fsm/stn/vdcm/tr/createVhcleDtaChangeMng`
        : `/fsm/stn/vdcm/tr/updateVhcleDtaChangeMng`

    let params

    if (type === 'I') {
      params = {
        vhclNo: data.vhclNo,
        aplcnYmd: data.aplcnYmd.replaceAll('-', ''),
        bfchgVhclTonCd: data.bfchgVhclTonCd, //신규 등록 시 유종코드는 차량 조회하는 것에 유종을 가져온다.
        aftchVhclTonCd: data.aftchVhclTonCd,
        chgRsnCn: data.chgRsnCn
          .replaceAll(/\n/g, '')
          .replaceAll(/\t/g, '')
          ,
      }
    } else {
      params = {
        vhclNo: data.vhclNo,
        aplcnYmd: data.aplcnYmd.replaceAll('-', ''),
        orgAplcnYmd: data.orgAplcnYmd,
        hstrySn: data.hstrySn,
        bfchgVhclTonCd: data.bfchgVhclTonCd,
        aftchVhclTonCd: data.aftchVhclTonCd,
        chgRsnCn: data.chgRsnCn
          .replaceAll(/\n/g, '')
          .replaceAll(/\t/g, '')
          ,
      }
    }

    console.log(params)

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
      console.error('Error modifying data:', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const parseKoiCd = (koiCd: string) => {
    if (koiCd) {
      let item = koiItems.find((code) => code.value === koiCd)
      return item ? item['label'] : koiCd
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
              <h2>차량제원{type === 'U' ? '수정' : '등록'}</h2>
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
                            <div className="button-right-align">
                              <Button
                                onClick={() => setVhclOpen(true)}
                                variant="contained"
                                color="dark"
                              >
                                선택
                              </Button>
                            </div>
                          </Box>
                        )}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.vonrNm}
                      </div>
                    </td>
                    <th className="td-head" scope="row"></th>
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%' }}
                      ></div>
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {parseKoiCd(data.koiNm)}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="sch-aftchVhclTonCd"
                        >
                          톤수
                        </CustomFormLabel>
                        <CommSelect
                          cdGroupNm={'971'}
                          pValue={data.aftchVhclTonCd}
                          handleChange={handleParamChange}
                          pName={'aftchVhclTonCd'}
                          htmlFor={'sch-aftchVhclTonCd'}
                          addText="전체"
                          defaultValue={data.aftchVhclTonCd}
                        />
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      적용일자
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-date-end"
                        >
                          적용일자
                        </CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="aplcnYmd"
                          value={data.aplcnYmd}
                          onChange={handleParamChange}
                          inputProps={{
                            min: getForamtAddDay(0),
                          }}
                          fullWidth
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      변경사유
                    </th>
                    <td colSpan={5}>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-fname-input-01"
                      >
                        변경사유
                      </CustomFormLabel>
                      <textarea
                        className="MuiTextArea-custom"
                        id="ft-fname-input-01"
                        name="chgRsnCn"
                        // multiline
                        rows={6}
                        // fullWidth
                        onChange={handleParamChange}
                        value={data.chgRsnCn ?? ''}
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
        // url="/fsm/stn/vdcm/tr/getUserVhcle"
        open={vhclOpen}
      />
    </Box>
  )
}

export default TrModifyModal
