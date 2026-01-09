import { Box } from '@mui/material'
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from '../page'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getForamtAddDay, getDateFormatYMD, getFormatToday } from '@/utils/fsms/common/dateUtils'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { VhclSearchModal, VhclRow } from '@/components/tr/popup/VhclSearchModal'
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField'
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

  
  interface RegisterModalProps {
    open: boolean
    handleClickClose: () => void
    row: Row | null
    type: 'I' | 'U'
    reload: () => void
  }
  
  type data = {
    sn: string             // 순번(수정시)
    vhclNo: string         // 차량번호
    locgovCd: string       // 관할관청코드
    vonrNm: string         // 소유자명
    vonrBrno: string       // 사업자등록번호
    vonrRrno: string       // 주민등록번호
    crno: string           // 법인등록번호
    koiCd: string          // 유종코드
    koiNm: string          // 유종명
    vhclTonCd: string      // 톤수코드
    vhclTonNm: string      // 톤수명
    rdmAmt: string         // 체납환수금액
    enfcYmd: string        // 시행일자
    regRsnCn: string       // 등록사유
    locgovNm: string
    vonrRrnoS: string
    crnoS: string
    [key: string]: string | number
  }
  
  const TrRegisterModal = (props: RegisterModalProps) => {
    const { open, handleClickClose, row, type, reload } = props
  
    const [vhclOpen, setVhclOpen] = useState(false)
    const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  
    const resetData = {
      sn: '',             // 순번
      vhclNo: '' ,        // 차량번호
      locgovCd: '',       // 관할관청코드
      vonrNm: '',         // 소유자명
      vonrBrno: '',       // 사업자등록번호
      vonrRrno: '',       // 주민등록번호
      crno: '',           // 법인등록번호
      koiCd: '',          // 유종코드
      koiNm: '',          // 유종명
      vhclTonCd: '',      // 톤수코드
      vhclTonNm: '',      // 톤수명
      rdmAmt: '',         // 체납환수금액
      enfcYmd: '',        // 시행일자
      regRsnCn: '',       // 등록사유
      locgovNm: '',
      vonrRrnoS: '',
      crnoS: '',
    }
  
    const [data, setData] = useState<data>(resetData)
  
    useEffect(() => {
      if (row && type === 'U') {
        setData({
          sn: row.sn,                 // 순번
          vhclNo: row.vhclNo,        // 차량번호
          locgovCd: row.locgovCd,       // 관할관청코드
          vonrNm: row.vonrNm,         // 소유자명
          vonrBrno: row.vonrBrno,       // 사업자등록번호
          vonrRrno: row.vonrRrno,       // 주민등록번호
          crno: row.crno,           // 법인등록번호
          koiCd: row.koiCd,          // 유종코드
          koiNm: row.koiNm,          // 유종명
          vhclTonCd: row.vhclTonCd,      // 톤수코드
          vhclTonNm: row.vhclTonNm,      // 톤수명
          rdmAmt: row.rdmAmt,         // 체납환수금액
          enfcYmd: getDateFormatYMD(row.enfcYmd),        // 시행일자
          regRsnCn: row.regRsnCn,       // 등록사유
          locgovNm: row.locgovNm,
          vonrRrnoS: row.vonrRrnoS,
          crnoS: row.crnoS,
        })
      } else {
        setData(resetData)
      }
    }, [open])
  
    const handleParamChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const { name, value } = event.target
      setData((prev) => ({ ...prev, [name]: value }))
    }
  
    const setVhcl = (vhclRow: VhclRow) => {
      // 현재 차량정보모달 데이터 가지고 오는형식
      // vonrRrno -> 암호화데이터
      // vonrRrnoS -> 복호화데이터
      // vonrRrnoSecure -> 복호화데이터
      setData((prev) => ({
        ...prev,
        vhclNo: vhclRow.vhclNo,
        vonrNm: vhclRow.vonrNm,
        crno: vhclRow.crnoS,
        vonrRrno: vhclRow.vonrRrnoS,
        vonrBrno: vhclRow.vonrBrno,
        locgovCd: vhclRow.locgovCd,
        koiCd: vhclRow.koiCd,
        koiNm: vhclRow.koiNm,
        vhclTonCd: vhclRow.vhclTonCd,
        vhclTonNm: vhclRow.vhclTonNm,
        locgovNm: vhclRow.locgovNm,
        regRsnCn: '',
        vonrRrnoS: vhclRow.vonrRrnoSecure,
        crnoS: vhclRow.crnoSecure,
      }))
  
      setVhclOpen(false)
    }

    useEffect(() => {
      //console.log(data);
    },[data])
  
    const saveData = async () => {
      if (!data.vhclNo) {
        alert('차량을 선택해주세요.')
        return
      }
  
      if (!data.rdmAmt) {
        alert('체납환수금액을 입력해주세요.')
        return
      }
  
      if (!data.enfcYmd) {
        alert('시행일자를 입력해주세요.')
        return
      }

      if(!data.regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
        alert('등록사유를 입력해주세요.')
        return;
      }

      if(data.regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
        alert('등록사유를 30자리 이하로 입력해주시기 바랍니다.')
        return
      }
  
      if (data.enfcYmd.replaceAll("-", "") < getFormatToday().replaceAll("-", "")) {
        alert("시행일자는 오늘일자 이후여야 합니다.")
        return
      }
      
      if (!confirm(type == 'I' ? '체납환수금정보를 등록하시겠습니까?' : '체납환수금정보를 수정하시겠습니까?')) {
        return
      }

      let endpoint: string =
        type === 'I' ? `/fsm/ilg/nr/tr/createNpymRedemp` : `/fsm/ilg/nr/tr/updateNpymRedemp`
  
      let params = 
      type === 'I' ?
      {
        locgovCd: data.locgovCd,
        vhclNo: data.vhclNo,
        vonrNm: data.vonrNm,
        vonrRrno: data.vonrRrno,
        vonrBrno: data.vonrBrno,
        crno: data.crno,
        koiCd: data.koiCd,
        vhclTonCd: data.vhclTonCd,
        rdmAmt: data.rdmAmt.replaceAll(',', '').replaceAll('-', '').replaceAll(' ',''),
        rmndRdmAmt: data.rdmAmt.replaceAll(',', '').replaceAll('-', '').replaceAll(' ',''),
        enfcYmd: data.enfcYmd.replaceAll("-", ""),
        regRsnCn: data.regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')
      }
      :
      {
        locgovCd: data.locgovCd,
        vhclNo: data.vhclNo,
        sn: Number(data.sn),
        rdmAmt: data.rdmAmt.replaceAll(',', '').replaceAll('-', '').replaceAll(' ',''),
        rmndRdmAmt: data.rdmAmt.replaceAll(',', '').replaceAll('-', '').replaceAll(' ',''),
        enfcYmd: data.enfcYmd.replaceAll("-", ""),
        regRsnCn: data.regRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        regSttsCd: ''
      }

      try {

        setLoadingBackdrop(true)
        const response = await sendHttpRequest(type === 'I' ? 'POST' : 'PUT', endpoint, params, true, {
          cache: 'no-store',
        })
  
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
                  취소
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
                    <col style={{ width: '10%' }}></col>
                    <col style={{ width: '20%' }}></col>
                    <col style={{ width: '10%' }}></col>
                    <col style={{ width: '15%' }}></col>
                    <col style={{ width: '10%' }}></col>
                    <col style={{ width: '10%' }}></col>
                    <col style={{ width: '10%' }}></col>
                    <col style={{ width: '15%' }}></col>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">
                        차량번호
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.vhclNo}
                          {type === 'U' ? (
                            <></>
                          ) : (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                <div style={{ float: 'right' }}>
                                  <Button
                                    onClick={() => setVhclOpen(true)}
                                    variant="contained"
                                    color="primary"
                                  >
                                    선택
                                  </Button>
                                </div>
                              </Box>
                            </>
                          )}
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
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {brNoFormatter(data.vonrBrno)}
                        </div>
                      </td>
                    </tr>
                    <tr>
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
                          {rrNoFormatter(data.crnoS)}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.koiNm}
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        톤수
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          {data.vhclTonNm}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        체납환수금액
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                          <CustomTextField 
                            type="text" 
                            id="ft-rdmAmt" 
                            name="rdmAmt" 
                            value={data.rdmAmt}
                            onChange={handleParamChange}
                          />
                        </div>
                      </td>
                      <th className="td-head" scope="row">
                        시행일자
                      </th>
                      <td>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap' }}>
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
                          />
                        </div>
                      </td>
                      <th className="td-head" scope="row"></th>
                      <td></td>
                      <th className="td-head" scope="row"></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        등록사유
                      </th>
                      <td colSpan={7}>
                        <div className="form-group" style={{ width: '100%', whiteSpace: 'nowrap'}}>
                          <CustomTextField
                            id="ft-fname-input-01"
                            name="regRsnCn"
                            fullWidth
                            onChange={handleParamChange}
                            value={data.regRsnCn}
                          />
                        </div>
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
          open={vhclOpen}
        />
      </Box>
    )
  }
  
  export default TrRegisterModal
  