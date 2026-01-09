import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import { Button, Dialog, DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Row } from './TxPage'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getForamtAddDay } from '@/utils/fsms/common/dateUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { getUserInfo } from '@/utils/fsms/utils'
import { getFormatToday } from '@/utils/fsms/common/comm'

interface TxErsrModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  reload: () => void
}
const TxErsrModal = (props: TxErsrModalProps) => {

  const { open, handleClickClose, row, reload } = props

  const userInfo = getUserInfo()
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [ersrRsnCd, setErsrRsnCd] = useState('')
  const [ersrYmd, setErsrYmd] = useState('')

  useEffect(() => {
    setErsrRsnCd('')
    setErsrYmd('')
  }, [open])

  const ersrYmdValidation = () => {

    if (!ersrYmd) {
      alert('말소일자를 선택해주세요.')
    } else if (ersrYmd.replaceAll('-','').length !== 8) {
      alert('말소일자를 확인해주세요.')
    } else if (ersrYmd < getFormatToday()) {
      alert('말소일자는 금일이전일 수 없습니다.')
    } else {
      return true
    }

    return false;
  };

  const saveData = async () => {

    if (ersrYmdValidation()) {

      if (!ersrRsnCd) {
        alert('말소사유를 선택해주세요.')
        return
      }
  
      if (
        ersrRsnCd === '00' ||
        ersrRsnCd === '06' ||
        ersrRsnCd === '07' ||
        ersrRsnCd === '08'
      ) {
        let msg = ''
        if (ersrRsnCd === '00') msg = '정상인 경우는 말소가 불가능합니다.'
        if (ersrRsnCd === '06')
          msg = '해당사유는 [차량휴지관리] 메뉴에서 등록하시길 바랍니다.'
        if (ersrRsnCd === '07')
          msg = '해당사유는 [보조금 지급정지관리] 메뉴에서 등록하시길 바랍니다.'
        if (ersrRsnCd === '08')
          msg =
            '대리운전으로 인한 수급자격 말소처리는' +
            '\n' +
            '[보조금수급자격말소] 버튼을 클릭하여 주시기 바랍니다.'
  
        alert(msg)
        return
      }
  
      
      if (
        !confirm(
          '차량말소시 해당 수급자 차량과 카드도 말소됩니다. \n' +
            '[' +
            row?.vhclNo +
            ']' +
            ' 차량말소를 진행하시겠습니까?',
        )
      )
        return
  
      let endpoint: string = `/fsm/stn/vem/tx/updateVhcleErsrMng`
  
      let body = {
        vhclNo: row?.vhclNo,
        brno: row?.brno,
        koiCd: row?.koiCd,
        locgovCd: row?.locgovCd,
        dscntYn: 'N',
        sttsCd: '010',
        ersrYmd: ersrYmd.replaceAll('-', ''),
        ersrRsnCd: ersrRsnCd,
        chgRsnCd: '008',
        ersrType: 'ERASURE',
        rgtrId: userInfo.lgnId,
        mdfrId: userInfo.lgnId,
      }
      try {
        setLoadingBackdrop(true)
        const response = await sendHttpRequest('PUT', endpoint, body, true, {
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
  }

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'ersrRsnCd') setErsrRsnCd(value)
    if (name === 'ersrYmd') setErsrYmd(value)
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        PaperProps={{
          style: {
            width: '500px',
          },
        }}
        >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>차량말소등록</h2>
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
                  <col style={{ width: '40%' }}></col>
                  <col style={{ width: '60%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      말소구분
                    </th>
                    <td>차량 말소</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      말소사유
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor="sch-ersrRsnCd">말소사유</CustomFormLabel>
                        <CommSelect
                          cdGroupNm="ITD0"
                          pValue={ersrRsnCd}
                          handleChange={handleSelectChange}
                          pName="ersrRsnCd"
                          htmlFor={'sch-ersrRsnCd'}
                          addText="선택"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      말소일자
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        <CustomFormLabel className="input-label-none" htmlFor='ft-date-end'>말소일자</CustomFormLabel>
                        <CustomTextField
                          type="date"
                          id="ft-date-end"
                          name="ersrYmd"
                          value={ersrYmd}
                          onChange={handleSelectChange}
                          inputProps={{
                            min: getFormatToday(),
                          }}
                          fullWidth
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
    </Box>
  )
}

export default TxErsrModal
