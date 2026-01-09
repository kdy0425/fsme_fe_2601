/* React */
import React, { useState } from 'react'

/* mui component */
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'

/* 공통 js */
import { cardNoFormatter } from '@/utils/fsms/common/util'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { getFormatToday, getToday } from '@/utils/fsms/common/comm'

/* util/interface.ts */
import { AagncyDrvYmdModalInterface, agncyDrvYmdInterface } from '../util/interface'

const AagncyDrvYmdModal = (props:AagncyDrvYmdModalInterface) => {
  
  const { open, setOpen, processData, selectedCardRows } = props

  const [agncyDrvYmd, setAgncyDrvYmd] = useState<agncyDrvYmdInterface>({
    agncyDrvBgngYmd:getDateFormatYMD(selectedCardRows?.agncyDrvBgngYmd ?? ''),
    agncyDrvEndYmd:getDateFormatYMD(selectedCardRows?.agncyDrvEndYmd ?? '')
  });

  const handleSearchChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target    
    setAgncyDrvYmd((prev) => ({ ...prev, [name]:value }));
  };
  
  const saveData = () => {

    if (dataValidation()) {

      if (confirm('대리운전 기간을 변경 하시겠습니까?')) {
        
        const procData = {
          endPoint:'/fsm/mng/tvcm/cm/updateAgncyDrvYmd',
          body:{
            crdcoCd:selectedCardRows?.crdcoCd,
            cardNo:selectedCardRows?.cardNo,
            vhclNo:selectedCardRows?.vhclNo,
            brno:selectedCardRows?.brno,
            agncyDrvBgngYmd:agncyDrvYmd.agncyDrvBgngYmd.replaceAll('-', ''),
            agncyDrvEndYmd:agncyDrvYmd.agncyDrvEndYmd.replaceAll('-', ''),
          }
        }
        
        processData(procData);
        setOpen(false);
      }
    }
  };

  const dataValidation = () => {

    const bgngYmd = agncyDrvYmd.agncyDrvBgngYmd.replaceAll('-', '');
    const endYmd = agncyDrvYmd.agncyDrvEndYmd.replaceAll('-', '');

    if (!endYmd) {
      alert('대리운전 종료일을 입력해주세요.');
    } else if (bgngYmd > endYmd) {
      alert('대리운전 시작일이 종료일보다 큽니다.');
    } else if (endYmd < getToday()) {
      alert('대리운전 종료일은 금일 이후만 가능합니다.');
    } else {
      return true;
    }
    return false
  };
  
  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'lg'} open={open}>
        <DialogContent>

          {/* 모달헤더 시작 */}
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2>대리운전 기간변경</h2>
            </CustomFormLabel>

            <div className='button-right-align'>
              <Button variant='contained' color='primary' onClick={() => saveData()}>
                변경
              </Button>
              <Button variant='contained' color='dark' onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          <BlankCard className="contents-card" title="대리운전자 정보">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>대리운전자 정보</caption>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                </colgroup>
                <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    카드사
                  </th>
                  <td>
                    <CustomTextField fullWidth value={selectedCardRows?.crdcoNm} disabled={true}/>
                  </td>
                  <th className="td-head" scope="row">
                    카드번호
                  </th>
                  <td>
                    <CustomTextField fullWidth value={cardNoFormatter(selectedCardRows?.cardNoD ?? '')} disabled={true}/>
                  </td>
                  <th className="td-head" scope="row">
                    차량번호
                  </th>
                  <td>
                    <CustomTextField fullWidth value={selectedCardRows?.vhclNo} disabled={true}/>
                  </td>                  
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    대리운전자명
                  </th>
                  <td>
                    <CustomTextField fullWidth value={selectedCardRows?.flnm} disabled={true}/>
                  </td>
                  <th className="td-head" scope="row">
                    대리운전시작일
                  </th>
                  <td>
                    <CustomTextField
                      name='agncyDrvBgngYmd'
                      value={agncyDrvYmd.agncyDrvBgngYmd}
                      type="date"
                      fullWidth
                      disabled={true}
                    />
                  </td>
                  <th className="td-head" scope="row">
                    대리운전종료일
                  </th>
                  <td>
                    <CustomTextField
                      name='agncyDrvEndYmd'
                      value={agncyDrvYmd.agncyDrvEndYmd}
                      onChange={handleSearchChange}
                      type="date"
                      fullWidth
                    />
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </BlankCard>

        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default AagncyDrvYmdModal