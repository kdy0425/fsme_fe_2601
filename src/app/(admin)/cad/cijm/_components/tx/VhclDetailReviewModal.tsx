/* React */
import React, { useEffect, useState } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { BlankCard } from '@/utils/fsms/fsm/mui-imports';

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { toQueryParameter } from '@/utils/fsms/utils';
import { brNoFormatter, rrNoFormatter, getDateTimeString } from '@/utils/fsms/common/util';

/* 부모 컴포넌트에서 선언한 interface */
import { issueDetailInfoInterface } from './TxIfCardReqComponent';

/* interface 선언 */
interface rowInterface {  
  apBzmnSeNm:string,
  apLocgovNm:string,
  apKoiNm:string,
  apCustSeNm:string,
  exBzmnSeNm:string,
  exLocgovNm:string,
  exKoiNm:string,
  exCustSeNm:string,
  exSttsNm:string,
  exDscntNm:string,
  apBzentyNm:string,
  apBrno:string,
  apCrno:string,
  apRprsvNm:string,
  apRprsvRrno:string,
  apBzmnSeCd:string,
  apVhclNo:string,
  apLocgovCd:string,
  apKoiCd:string,
  apRrno:string,
  apFlnm:string,
  apAgncyDrvBgngYmd:string,
  apAgncyDrvEndYmd:string,
  apCustSeCd:string,
  exBzentyNm:string,
  exBrno:string,
  exCrno:string,
  exRprsvNm:string,
  exRprsvRrno:string,
  exBzmnSeCd:string,
  exVhclNo:string,
  exLocgovCd:string,
  exKoiCd:string,
  exRrno:string,
  exCustSeCd:string,
  exFlnm:string,
  exSttsCd:string,
  exDscntYn:string,
  bmSttsCd:string,
  cmSttsCd:string,
}

interface VhclDetailReviewInterface {
  issueDetailInfo:issueDetailInfoInterface|null
  open:boolean,
  setOpen:React.Dispatch<React.SetStateAction<boolean>>,
  pHandleApply:() => void
  setDetailResult:React.Dispatch<React.SetStateAction<boolean>>,
}

const VhclDetailReviewModal = (props:VhclDetailReviewInterface) => {
  
  const { issueDetailInfo, open, setOpen, pHandleApply, setDetailResult } = props;

  const [rows, setRows] = useState<rowInterface>(); // 조회결과

  // 모달 오픈시
  useEffect(() => {
    if(open) {
      getAllVhclDetailReviewTx();
    }    
  }, [open]);

  // 에러시 모달 강제종료
  const errModalClose = () => {
    alert('차량데이터가 로드되지 않았습니다.\n재조회 후 이용 부탁드립니다.');
    handleClose(false);
    return;
  };
  
  const getAllVhclDetailReviewTx = async () => {
    
    if (!issueDetailInfo?.rcptYmd || !issueDetailInfo?.rcptSeqNo || !issueDetailInfo?.vhclNo) {
      errModalClose();
      return;
    }
  
    try {

      const searchObj = {
        rcptYmd:issueDetailInfo?.rcptYmd,
        rcptSeqNo:issueDetailInfo?.rcptSeqNo,
        vhclNo:issueDetailInfo?.vhclNo,        
      };
      
      const endpoint = '/fsm/cad/cijm/tx/getAllVhclDetailReviewTx' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
      
      if (response && response.resultType === 'success' && response.data) {                  
        setRows(response.data[0]);
      }
      
    } catch (error) {
      // 에러시
      errModalClose();
    }
  }

  // 승인
  const handleApply = () => {

    if (rows?.bmSttsCd !== '000' || rows?.cmSttsCd !== '000') {      
      handleClose(true);
    } else {
      pHandleApply();
      handleClose(false);
    }    
  }  

  // 모달 클로즈
  const handleClose = (result:boolean) => {    
    setDetailResult(result)
    setOpen(false);
  };

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <DialogTitle id="alert-dialog-title1">
              <span className="popup-title">
                택시 - 카드발급 검토승인
              </span>
            </DialogTitle>

            {/* 버튼 */}            
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={handleApply}
              >
                승인
              </Button>

              <Button
                variant="contained"
                color="dark"
                onClick={() => handleClose(false)}
              >
                닫기
              </Button>
            </div>
          </Box>
          
          {/* 사업자정보 검토내역 */}
          <BlankCard className="contents-card" title="사업자정보 검토내역">
            <div style={{display:'flex'}}>            
              {/* 기존사업자정보 */}
              <div style={{width:'100%', marginInline:'0.7%'}}>
                <Box fontWeight={600} mb={1}>
                  → 기존사업자정보
                </Box>
                <div className="table-scrollable">
                  <table className="table table-bordered">
                    <caption>기존사업자정보</caption>
                    <colgroup>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                    </colgroup>
                    <tbody>
                      <tr>
                        <th className="td-head" scope="row">업체명</th>
                        <td colSpan={3}>{rows?.exBzentyNm}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">사업자등록번호</th>
                        <td>{brNoFormatter(rows?.exBrno ?? '')}</td>
                        <th className="td-head" scope="row">법인등록번호</th>
                        <td>{rows?.exCrno}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">대표자명</th>
                        <td>{rows?.exRprsvNm}</td>
                        <th className="td-head" scope="row">대표자주민번호</th>
                        <td>{rrNoFormatter(rows?.exRprsvRrno ?? '')}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">개인법인구분</th>
                        <td colSpan={3}>{rows?.exBzmnSeNm}</td>
                      </tr>
                    </tbody>
                  </table>                
                </div>            
              </div>

              {/* 승인요청사업자정보 */}
              <div style={{width:'100%', marginInline:'0.7%'}}>
                <Box fontWeight={600} mb={1}>
                  → 승인요청사업자정보
                </Box>
                <div className="table-scrollable">
                  <table className="table table-bordered">
                    <caption>승인요청사업자정보</caption>
                    <colgroup>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                    </colgroup>
                    <tbody>
                      <tr>
                        <th className="td-head" scope="row">업체명</th>
                        <td colSpan={3}>{rows?.apBzentyNm}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">사업자등록번호</th>
                        <td>{brNoFormatter(rows?.apBrno ?? '')}</td>
                        <th className="td-head" scope="row">법인등록번호</th>
                        <td>{rows?.apCrno}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">대표자명</th>
                        <td>{rows?.apRprsvNm}</td>
                        <th className="td-head" scope="row">대표자주민번호</th>
                        <td>{rrNoFormatter(rows?.apRprsvRrno ?? '')}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">개인법인구분</th>
                        <td colSpan={3}>{rows?.apBzmnSeNm}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>  

            <Box fontWeight={600} mt={1.5} color={'#f44336'}>
              ※ 승인요청 차량의 사업자번호가 기존과 다릅니다. 승인시 승인요청 사업자정보로 변경되어 관리됩니다.
            </Box>

          </BlankCard>

          {/* 차량정보 검토내역 */}
          <BlankCard className="contents-card" title="차량정보 검토내역">
            <div style={{display:'flex'}}>

              {/* 기존차량정보 */}
              <div style={{width:'100%', marginInline:'0.7%'}}>
                <Box fontWeight={600} mb={1}>
                  → 기존차량정보
                </Box>
                <div className="table-scrollable">
                  <table className="table table-bordered">
                    <caption>기존차량정보</caption>
                    <colgroup>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                    </colgroup>
                    <tbody>
                      <tr>
                        <th className="td-head" scope="row">차량번호</th>
                        <td>{rows?.exVhclNo}</td>
                        <th className="td-head" scope="row">관할관청</th>
                        <td>{rows?.exLocgovNm}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">유종</th>
                        <td>{rows?.exKoiNm}</td>
                        <th className="td-head" scope="row">주민등록번호</th>
                        <td>{rrNoFormatter(rows?.exRrno ?? '')}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">면허업종</th>
                        <td>{rows?.exCustSeNm}</td>
                        <th className="td-head" scope="row">수급자명</th>
                        <td>{rows?.exFlnm}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">할인여부</th>
                        <td>{rows?.exDscntNm}</td>
                        <th className="td-head" scope="row">차량상태</th>
                        <td>{rows?.exSttsNm}</td>
                      </tr>
                    </tbody>
                  </table>                
                </div>            
              </div>

              {/* 승인요청차량정보 */}
              <div style={{width:'100%', marginInline:'0.7%'}}>
                <Box fontWeight={600} mb={1}>
                  → 승인요청차량정보
                </Box>
                <div className="table-scrollable">
                  <table className="table table-bordered">
                    <caption>승인요청차량정보</caption>
                    <colgroup>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                      <col style={{width:'23%'}}></col>
                      <col style={{width:'27%'}}></col>
                    </colgroup>
                    <tbody>
                    <tr>
                        <th className="td-head" scope="row">차량번호</th>
                        <td>{rows?.apVhclNo}</td>
                        <th className="td-head" scope="row">관할관청</th>
                        <td>{rows?.apLocgovNm}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">유종</th>
                        <td>{rows?.apKoiNm}</td>
                        <th className="td-head" scope="row">주민등록번호</th>
                        <td>{rrNoFormatter(rows?.apRrno ?? '')}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">면허업종</th>
                        <td>{rows?.apCustSeNm}</td>
                        <th className="td-head" scope="row">수급자명</th>
                        <td>{rows?.apFlnm}</td>
                      </tr>
                      <tr>
                        <th className="td-head" scope="row">대리시작일</th>
                        <td>{getDateTimeString(rows?.apAgncyDrvBgngYmd ?? '', 'date')?.dateString}</td>
                        <th className="td-head" scope="row">대리종료일</th>
                        <td>{getDateTimeString(rows?.apAgncyDrvEndYmd ?? '', 'date')?.dateString}</td>                        
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>  

            <Box fontWeight={600} mt={1.5} color={'#f44336'}>
              ※ 승인요청 차량의 유종, 면허업종정보, 수급자주민번호가 기존차량과 다를경우, 기존 수급자 카드가 말소처리됩니다.
            </Box>
          </BlankCard>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VhclDetailReviewModal;