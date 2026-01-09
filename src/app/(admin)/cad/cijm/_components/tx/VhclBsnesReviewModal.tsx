/* React */
import React, { useEffect, useState } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { BlankCard } from '@/utils/fsms/fsm/mui-imports';

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { toQueryParameter } from '@/utils/fsms/utils';
import { getDateTimeString } from '@/utils/fsms/common/util';

/* 부모 컴포넌트에서 선언한 interface */
import { issueDetailInfoInterface } from './TxIfCardReqComponent';

/* interface 선언 */
interface propsInterface {
  issueDetailInfo:issueDetailInfoInterface|null
  open:boolean,
  setOpen:React.Dispatch<React.SetStateAction<boolean>>,
  pHandleApply:() => void,
}

const VhclBsnesReviewModal = (props:propsInterface) => {

  const { issueDetailInfo, open, setOpen, pHandleApply } = props;

  const [bsnesTitle, setBsnesTitle] = useState<React.ReactNode>(''); // 사업자정보 검토내역 내용
  const [vhclTitle1, setVhclTitle1] = useState<React.ReactNode>(''); // 차량정보 검토내역 내용1
  const [vhclTitle2, setVhclTitle2] = useState<React.ReactNode>(''); // 차량정보 검토내역 내용2

  // 모달 오픈시
  useEffect(() => {
    if(open) {
      getVhclBsnesReviewList();
    }    
  }, [open]);

  // 에러시 모달 강제종료
  const errModalClose = () => {
    alert('차량데이터가 로드되지 않았습니다.\n재조회 후 이용 부탁드립니다.');
    setOpen(false);
    
  };

  // 카드발급 검토승인 데이터 가져오기
  const getVhclBsnesReviewList = async () => {

    if (!issueDetailInfo?.brno || !issueDetailInfo?.vhclNo) {
      errModalClose();
      return;
    }

    try {
            
      const searchObj = {
        brno:issueDetailInfo?.brno,
        vhclNo:issueDetailInfo?.vhclNo,
      }

      const endpoint = '/fsm/cad/cijm/tx/getAllVhclBsnesReviewTx' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data.length !== 0) {

        const result = response.data[0];

        // 데이터 조회 성공시        
        let cmSttsNm = '';
        let chgRsnNm = '';
        let rMdfcnDt = '';

        if (!result.cmSttsNm) {
          cmSttsNm = '신규';
          chgRsnNm = '신규';
          rMdfcnDt = getDateTimeString(result.rcptYmd, 'date')?.dateString ?? '';
        } else {
          cmSttsNm = result.cmSttsNm;
          chgRsnNm = result.chgRsnNm;
          rMdfcnDt = getDateTimeString(result.mdfcnDt, 'date')?.dateString ?? '';
        }

        const bTitle = <>{'※ 발급요청 내역의 '+ result.flnm + '의 사업자 상태는 '} <Box sx={{display:'inline'}} color={'#f44336'}>{result.bmSttsNm}</Box> {' 입니다.'} </>;
        const vTitle1 = <>{'※ 발급요청 내역의 ' + result.vhclNo + '의 차량상태는 '} <Box sx={{display:'inline'}} color={'#f44336'}>{cmSttsNm}</Box> {' 입니다.'} </>;
        const vTitle2 = <>{'※ 상태변경사유는 '} <Box sx={{display:'inline'}} color={'#f44336'}>{chgRsnNm}</Box> {' 이며 변경일자는 '} <Box sx={{display:'inline'}} color={'#f44336'}>{rMdfcnDt}</Box> {' 입니다.'} </>;

        setBsnesTitle(bTitle);
        setVhclTitle1(vTitle1);
        setVhclTitle2(vTitle2);

      }

    } catch (error) {
      errModalClose();
      console.log('error', error);
    }
  };

  // 모달 클로즈
  const handleClose = () => {
    setOpen(false);
  };

  // 승인
  const handleApply = async () => {
    if (confirm('차량번호 ' + issueDetailInfo?.vhclNo + ' 의 보조금카드발급 요청건을 승인하시겠습니까?')) {
      handleClose();
      pHandleApply();
    }    
  };

  // 탈락
  const handleOut = async () => {
    alert('카드발급 심사관리화면에서 탈락 처리해 주시기 바랍니다.');
    handleClose();
  };

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <DialogTitle id='alert-dialog-title1'>
              <span className='popup-title'>
                택시 - 카드발급 검토승인
              </span>
            </DialogTitle>

            {/* 버튼 */}            
            <div className=' button-right-align'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleApply}
              >
                승인
              </Button>

              <Button
                variant='contained'
                color='red'
                onClick={handleOut}
              >
                탈락
              </Button>

              <Button
                variant='contained'
                color='dark'
                onClick={handleClose}
              >
                보류 / 닫기
              </Button>
            </div>
          </Box>

          <BlankCard className='contents-card' title='사업자정보 검토내역'>
            <Box fontWeight={600}>
              {bsnesTitle}
            </Box>
          </BlankCard>

          <BlankCard className='contents-card' title='차량정보 검토내역'>
            <Box fontWeight={600}>
              {vhclTitle1}
            </Box>
            <Box fontWeight={600} mt={1}>
              {vhclTitle2}
            </Box> 
          </BlankCard>

          <Box mt={3}>
            <Box fontWeight={600} color={'#f44336'}>
              ※ 위 정보를 확인하시고 발급절차를 진행해 주시기 바랍니다.
            </Box>
            <Box fontWeight={600} mt={0.5} color={'#f44336'}>
              ※ 승인처리시, 차량상태는 정상으로 변경됩니다.
            </Box>
            <Box fontWeight={600} mt={0.5} color={'#f44336'}>
              ※ 상단의 처리 형태를 선택하여 주시기 바랍니다.
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VhclBsnesReviewModal;