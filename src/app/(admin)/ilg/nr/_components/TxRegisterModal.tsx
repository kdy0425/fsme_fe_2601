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
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogProps,
    Tooltip,
    FormGroup,
    FormControlLabel,
  } from '@mui/material'
  import React, { useEffect, useState } from 'react'
  import { Row } from '../page'
  import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
  import {
    getForamtAddDay,
    getDateFormatYMD,
    getFormatToday,
  } from '@/utils/fsms/common/dateUtils'
  import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
  import { getUserInfo } from '@/utils/fsms/utils'
  import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
  import { VhclSearchModal, VhclRow } from '@/components/tx/popup/VhclSearchModal'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import { getToday } from '@/utils/fsms/common/comm'

  
  interface RegisterModalProps {
    open: boolean
    handleClickClose: () => void
    row: Row | null
    type: 'I' | 'U'
    reload: () => void
  }
  
  interface data {
    locgovCd: string
    vhclNo: string
    vonrNm: string
    vonrRrno: string
    brno: string
    crno: string
    koiCd: string
    bzmnSeCd: string
    rdmAmt: string
    enfcYmd: string
    regRsnCn: string
    locgovNm: string
    bzmnSeNm: string
    koiNm: string
    vonrRrnoS: string
    sn: string    
  }
  
  const TxRegisterModal = (props: RegisterModalProps) => {
    
    const { open, handleClickClose, row, type, reload } = props  
    const [vhclOpen, setVhclOpen] = useState<boolean>(false)
    const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)
    const [inputEnable, setInputEnable] = useState<boolean>(false)

    const [data, setData] = useState<data>({
      locgovCd: '',
      vhclNo: '',
      vonrNm: '',
      vonrRrno: '',
      brno: '',
      crno: '',
      koiCd: '',
      bzmnSeCd: '',
      rdmAmt: '',
      enfcYmd: '',
      regRsnCn: '',
      locgovNm: '',
      bzmnSeNm: '',
      koiNm: '',
      vonrRrnoS: '',
      sn: '',
    });
  
    useEffect(() => {
      if (open && type === 'U') {
        setData(prev => ({
          ...prev,
          vhclNo: row?.vhclNo ?? '',
          locgovNm: row?.locgovNm ?? '',
          locgovCd: row?.locgovCd ?? '',
          vonrNm: row?.vonrNm ?? '',
          brno: row?.brno ?? '',
          vonrRrnoS: row?.vonrRrnoS ?? '',
          crnoS: row?.crnoS ?? '',
          koiNm: row?.koiNm ?? '',
          rdmAmt: row?.rdmAmt ?? '',
          enfcYmd: getDateFormatYMD(row?.enfcYmd ?? ''),
          regRsnCn: row?.regRsnCn ?? '',
          sn: row?.sn ?? ''
        }));

        if (row?.regDt !== getToday()) {
          setInputEnable(true);
        }
      }
    }, [open])
  
    const handleParamChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const { name, value } = event.target
      setData((prev) => ({ ...prev, [name]: value }))
    }
  
    const setVhcl = (vhclRow: VhclRow) => {
      console.log(vhclRow);
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
      if (!data.vhclNo) {
        alert('차량을 선택해주세요.')
      } else if (!data.rdmAmt.trim()) {
        alert('체납환수금액을 입력해주세요.')
      } else if (data.rdmAmt.startsWith('0')) {
        alert("금액을 확인해주세요.")
      } else if (!data.enfcYmd) {
        alert('시행일자를 입력해주세요.')
      } else if (data.enfcYmd <= getFormatToday()) {
        alert("시행일자는 오늘일자 이후여야 합니다.")
      } else if (!data.regRsnCn.trim()) {
        alert("등록사유를 입력해주세요.")
      } else {
        return true;
      }
      return false;
    };
  
    const saveData = async () => {
      
      if (validation()) {

        if (confirm(type == 'I' ? '체납환수금정보를 등록하시겠습니까?' : '체납환수금정보를 수정하시겠습니까?')) {
        
          const endpoint: string = type === 'I' ? `/fsm/ilg/nr/tx/createNpymRedemp` : `/fsm/ilg/nr/tx/updateNpymRedemp`;
      
          let params = {}

          if (type == 'U') {
            params = {              
              locgovCd: data.locgovCd,
              vhclNo: data.vhclNo,
              sn: data.sn,
              rdmAmt: data.rdmAmt,
              enfcYmd: data.enfcYmd.replaceAll("-", ""),
              regRsnCn: data.regRsnCn,              
            }
          } else {
            params = {
              locgovCd: data.locgovCd,
              vhclNo: data.vhclNo,
              vonrNm: data.vonrNm,
              vonrRrno: data.vonrRrno,
              brno: data.brno,
              brnoEncpt: data.crno,
              koiCd: data.koiCd,
              bzmnSeCd : data.bzmnSeCd,
              rdmAmt: data.rdmAmt,
              enfcYmd: data.enfcYmd.replaceAll("-", ""),
              regRsnCn: data.regRsnCn,              
            }
          }

          try {

            setLoadingBackdrop(true)

            const response = await sendHttpRequest(type === 'I' ? 'POST' : 'PUT', endpoint, params, true, {cache: 'no-store' });
      
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
          fullWidth={true}
          maxWidth={'lg'}
          open={open}
        >
          <DialogContent>
            <Box className="table-bottom-button-group">
              <CustomFormLabel className="input-label-display">
                <h2>체납환수금{type === 'I' ? '등록' : '수정'}</h2>
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
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.vhclNo}
                          {type === 'I' ? (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
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
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.locgovNm}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        소유자명
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.vonrNm}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {brNoFormatter(data.brno)}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        주민등록번호
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {rrNoFormatter(data.vonrRrnoS)}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {rrNoFormatter(data.crno)}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.koiNm}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        체납환수금액
                      </th>
                      <td>
                          <CustomFormLabel className="input-label-none" htmlFor="ft-rdmAmt">체납환수금액</CustomFormLabel>
                          <CustomTextField 
                            type="number" 
                            id="ft-rdmAmt" 
                            name="rdmAmt" 
                            value={data.rdmAmt}
                            onChange={handleParamChange}
                            inputProps={{maxLength:20, type:'number'}}
                            onInput={(e: { target: { value: string; maxLength: number | undefined } })=>{
                              e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0,e.target.maxLength)
                            }}
                            placeholder="숫자만 입력 가능합니다."
                            fullWidth
                            disabled={inputEnable}
                          />
                      </td>
                      <th className="td-head" scope="row">
                        시행일자
                      </th>
                      <td>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-date-end">시행일자</CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="enfcYmd"
                          value={data.enfcYmd}
                          onChange={handleParamChange}
                          inputProps={{
                            min: getForamtAddDay(1),
                          }}
                          fullWidth
                          disabled={inputEnable}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        등록사유
                      </th>
                      <td colSpan={5}>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-fname-input-01">등록사유</CustomFormLabel>
                        <CustomTextField
                          id="ft-fname-input-01"
                          name="regRsnCn"
                          fullWidth
                          onChange={handleParamChange}
                          value={data.regRsnCn}
                          disabled={inputEnable}
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
  
  export default TxRegisterModal
  