/* React */
import React, { useEffect, useState } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { BlankCard, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import { CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통js */
import { getFormatTomorrow, getToday } from '@/utils/fsms/common/comm';
import { brNoFormatter } from '@/utils/fsms/common/util';

/* interface 선언 */
export interface vhclStopData {
  brno:string,
  vhclNo:string,
  bgngYmd:string,
  endYmd:string,
  type:'PAUSE' | 'STOP' | 'CARD_P' | 'CARD_S' | '',
  vhclRestrtYmd:string,
}

interface propsInterface {
  vhclStopData:vhclStopData
  setVhclStopData?:React.Dispatch<React.SetStateAction<vhclStopData>>,
  open:boolean,
  setOpen:React.Dispatch<React.SetStateAction<boolean>>,
  setDelResult:React.Dispatch<React.SetStateAction<boolean>>,
}

const VhclStopDelModal = (props:propsInterface) => {

  const { vhclStopData, setVhclStopData, open, setOpen, setDelResult } = props;

  const [title, setTitle] = useState<string>(''); // 모달제목
  const [footerTitle, setFooterTitle] = useState<string>(''); // 하단안내문구
  const [vhclRestrtYmd, setVhclRestrtYmd] = useState<string>(''); // 실제운행게시일

  // 모달 오픈시
  useEffect(() => {
    if(open) {
      dataValidation();
      settingTitle();
    }    
  }, [open]);

  const dataValidation = () => {    
    if (!vhclStopData.brno || !vhclStopData.vhclNo) {
      alert('데이터가 로드되지 않았습니다.\n재조회 이후 부탁드립니다.');
      handleClose(false);
    }
  }

  const settingTitle = () => {
    if (vhclStopData.type === 'PAUSE') {
      setTitle('차량휴지 삭제');
      setFooterTitle('※ 차량휴지 내역이 금일자로 삭제됩니다.');
    }	else if (vhclStopData.type === 'STOP') {
      setTitle('보조금지급정지 삭제');
      setFooterTitle('※ 보조금지급정지 내역이 금일자로 삭제됩니다.');
    }	else if (vhclStopData.type === 'CARD_P') {
      setTitle('차량휴지 삭제');
      setFooterTitle('※ 차량휴지 내역이 존재하며, 최종 승인시 삭제됩니다.');
    } else {
      setTitle('보조금지급정지 삭제');
      setFooterTitle('※ 보조금지급정지 내역이 존재하며, 최종 승인시 삭제됩니다.');
    }
  }

  // 실제운행게시일 변경시
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVhclRestrtYmd(event.target.value);
  };

  // 모달 클로즈
  const handleClose = (result:boolean) => {
    setOpen(false);
    setDelResult(result);
  };

  const handleClick = async () => {

    if (!vhclRestrtYmd) {
      alert('해당 차량의 실제 운행개시일을 입력하십시오.');
      return;
    }

    if (vhclRestrtYmd.replaceAll('-','').length !== 8) {
      alert('운행개시일을 날짜형식이 잘못되었습니다.');
      return;
    }

    if (confirm(title + '처리 하시겠습니까?')) {

      setVhclStopData?.((prev) => ({
        ...prev,
        vhclRestrtYmd:vhclRestrtYmd.replaceAll('-', '')
      }));
      
      handleClose(true);
    }
  };

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <DialogTitle id='alert-dialog-title1'>
              <span className='popup-title'>
                {title}
              </span>
            </DialogTitle>

            {/* 버튼 */}            
            <div className=' button-right-align'>
              <Button
                variant='contained'
                color='red'
                onClick={handleClick}
              >
                삭제
              </Button>

              <Button
                variant='contained'
                color='dark'
                onClick={() => handleClose(false)}
              >
                닫기
              </Button>
            </div>
          </Box>

          <BlankCard className='contents-card'>
            <div className='table-scrollable'>
              <table className='table table-bordered'>
                <caption>{title}</caption>
                <colgroup>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '25%' }}></col>
                  <col style={{ width: '25%' }}></col>
                </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">차량번호</th>
                      <td>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-vhclNo">차량번호</CustomFormLabel>
                        <CustomTextField
                          fullWidth
                          value={vhclStopData.vhclNo}
                          readOnly={true}
                          inputProps={{
                            readOnly:true
                          }}
                          id="ft-vhclNo"
                        />
                      </td>
                      <th className="td-head" scope="row">사업자번호</th>
                      <td>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-brno">사업자번호</CustomFormLabel>
                        <CustomTextField
                          fullWidth
                          value={brNoFormatter(vhclStopData.brno)}
                          readOnly={true}
                          inputProps={{
                            readOnly:true
                          }}
                          id="ft-brno"
                        />
                      </td>
                    </tr>
                    <tr>                      
                      <th className="td-head" scope="row">실제운행게시일</th>
                      <td colSpan={3}>
                        <CustomFormLabel className="input-label-none" htmlFor="ft-vhclRestrtYmd">실제운행게시일</CustomFormLabel>
                        <CustomTextField
                          value={vhclRestrtYmd}
                          id="ft-vhclRestrtYmd"
                          name="vhclRestrtYmd"
                          onChange={handleSearchChange}
                          type="date"
                          fullWidth
                        />
                      </td>
                    </tr>
                  </tbody>
              </table>
            </div>

            {/* 하단 안내문구 */}
            <Box mt={'2%'}>
              <Box fontWeight={600} color={'#f44336'}>
                {footerTitle}
              </Box>
              <Box fontWeight={600} color={'#f44336'}>
                ※ 발급요청 정보의 승인처리를 하면 조회된 FSMS 정보의 차량은 말소대기 상태로 변경됩니다.
              </Box>
            </Box>
          </BlankCard>          
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VhclStopDelModal;