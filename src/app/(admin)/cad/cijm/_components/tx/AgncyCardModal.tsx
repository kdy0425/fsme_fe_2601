/* React */
import React, { useEffect, useState, memo } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { BlankCard } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { toQueryParameter } from '@/utils/fsms/utils';

/* 공통 type, interface */
import { HeadCell } from 'table'

/* 부모 컴포넌트에서 선언한 interface */
import { issueDetailInfoInterface } from './TxIfCardReqComponent';

/* interface 선언 */
// 대리운전 신청정보 헤드셀
const agncyHeadCells: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardNo',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
    format:'cardNo',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno'
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'rrno',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format:'rrno',
  },
  {
    id: 'agncyDrvBgngYmd',
    numeric: false,
    disablePadding: false,
    label: '대리운전시작일',
    format: 'yyyymmdd',
  },
  {
    id: 'agncyDrvEndYmd',
    numeric: false,
    disablePadding: false,
    label: '대리운전종료일',
    format: 'yyyymmdd',
  },
];

// 개인택시 소유주 카드정보 헤드셀
const ownerHeadCells: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno'
  },
  {
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '성명',
  },
  {
    id: 'rrno',
    numeric: false,
    disablePadding: false,
    label: '주민등록번호',
    format:'rrno',
  },
  {
    id: 'dscntNm',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
  },
];

interface agncyRowInterface {  
  locgovNm:string,
  crdcoNm:string,
  cardNo:string,
  vhclNo:string,
  brno:string,
  koiNm:string,
  flnm:string,
  rrno:string,
  agncyDrvBgngYmd:string,
  agncyDrvEndYmd:string,
}

interface ownerRowInterface {  
  locgovNm:string,  
  vhclNo:string,
  brno:string,
  flnm:string,
  rrno:string,
  dscntNm:string,
  dscntYn:'N'|'Y',
}

interface RegisterModal {
  issueDetailInfo:issueDetailInfoInterface|null
  open:boolean,
  setOpen:React.Dispatch<React.SetStateAction<boolean>>,
  pHandleApply:() => void,
}

const AgncyCardModal = (props:RegisterModal) => {

  const { issueDetailInfo, open, setOpen, pHandleApply } = props;

  /* 대리운전 신청정보 */
  const [agncyRows, setAgncyRows] = useState<agncyRowInterface[]>([]);
  const [agncyLoading, setAgncyLoading] = useState<boolean>(false);  

  /* 개인택시 소유주 카드정보 */
  const [ownerRows, setOwnerRows] = useState<ownerRowInterface[]>([]);
  const [ownerLoading, setOwnerLoading] = useState<boolean>(false);
  const [dcCnt, setDcCnt] = useState<number>(0);

  // 승인가능여부
  const [enableApply, setEnableApply] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      dataValidation();
    }    
  }, [open]);

  useEffect(() => {
    if(dcCnt > 0) {
      setEnableApply(false);
    }
  }, [dcCnt]);

  const dataValidation = () => {
    if (!issueDetailInfo?.brno || !issueDetailInfo?.vhclNo) {
      alert('차량데이터가 로드되지 않았습니다.\n재조회 후 이용 부탁드립니다.');
      setOpen(false);
      return;
    } else {
      getAgncyList();
      getOwnerList();
    }
  };

  const getAgncyList = async () => {

    setAgncyLoading(true)

    try {
      
      const searchObj = {
        brno:issueDetailInfo?.brno,
        vhclNo:issueDetailInfo?.vhclNo
      }

      const endpoint = '/fsm/cad/cijm/tx/getAgncyDrvCardIssuJdgmnMng' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data) {
        setAgncyRows(response.data);
      }

    } catch (error) {
      // 에러시      
      alert(error);
    } finally {
      setAgncyLoading(false)
    }
  };

  const getOwnerList = async () => {

    setOwnerLoading(true)

    try {
      
      const searchObj = {
        brno:issueDetailInfo?.brno,
        vhclNo:issueDetailInfo?.vhclNo
      }

      const endpoint = '/fsm/cad/cijm/tx/getOwnerCardIssuJdgmnMng' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data) {
        
        setOwnerRows(response.data);
        
        // 원차주의 할인여부가 있는지 판별
        let result = 0;

        for (let i=0; i<response.data.length; i++) {
          if(response.data[i].dscntYn === 'Y') {
            result++;
          }          
        }

        setDcCnt(result);
      }

    } catch (error) {
      // 에러시      
      alert(error);
    } finally {
      setOwnerLoading(false)
    }
  };

  // 승인
  const handleApply = () => {

    if (!enableApply) {
      alert('원차주의 카드정보가 할인상태이므로 승인처리 할 수 없습니다') ;
      return;
    }

    pHandleApply();
    setOpen(false);
  };

  // 닫기
  const handleClose = () => {
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
                택시 - 대리운전정보 조회
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
                onClick={handleClose}
              >
                닫기
              </Button>
            </div>
          </Box>

          {/* 발급요청정보 */}
          <BlankCard className="contents-card" title="대리운전 신청정보">
            <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <TableDataGrid
                headCells={agncyHeadCells}
                rows={agncyRows}
                loading={agncyLoading}
                caption={"대리운전 신청 정보 목록 조회"}                
              />
            </Box>            
          </BlankCard>

          <BlankCard className="contents-card" title="개인택시 소유주 카드정보">
            
            <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <TableDataGrid
                headCells={ownerHeadCells}
                rows={ownerRows}
                loading={ownerLoading}
                caption={"개인택시 소유주 카드 정보 목록 조회"}
              />
            </Box>

            {/* 하단 안내문구 */}
            <Box mt={'2%'}>
              
              <Box fontWeight={600} mb={0.5}>
                ※ 원차주의 정보와 대리운전 카드발급 신청정보를 확인하시고 승인처리하여 주시기 바랍니다.
              </Box>

              {/* 원차주의 할인여부가 Y일 경우에만 */}
              {!enableApply ? (
                <Box fontWeight={600}>
                  ※ 원차주의 카드정보가 할인상태입니다
                  ※ '보조금수급자격말소' 기능을 통해 원차주 카드정보를 미할인으로 변경해야 대리운전 카드발급이 가능합니다.
                </Box>
              ) : null}

            </Box>
          </BlankCard>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AgncyCardModal;