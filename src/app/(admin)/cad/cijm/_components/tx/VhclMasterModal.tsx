/* React */
import React, { useEffect, useState } from 'react';

/* mui component */
import { Box, Button, Dialog, DialogContent, DialogTitle, TableHead, TableRow, TableCell } from '@mui/material';
import { BlankCard } from '@/utils/fsms/fsm/mui-imports';

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { toQueryParameter } from '@/utils/fsms/utils';
import { brNoFormatter, rrNoFormatter, cardNoFormatter } from '@/utils/fsms/common/util';
import { trim } from 'lodash';

/* 공통 type, interface */
import { HeadCell } from 'table'

/* 부모 컴포넌트에서 선언한 interface */
import { issueDetailInfoInterface } from './TxIfCardReqComponent';

/* interface 선언 */
const headCells: HeadCell[] = [
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '지자체명',
  },
  {
    id: 'vhclNoTag',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'brnoTag',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
  },
  {
    id: 'vhclSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  },
  {
    id: 'carDscntYnNm',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
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
    id: 'flnm',
    numeric: false,
    disablePadding: false,
    label: '수급자명',
  },
  {
    id: 'rrno',
    numeric: false,
    disablePadding: false,
    label: '주민번호',
    format:'rrno',
  },
  {
    id: 'cardDscntYnNm',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
  },
];

interface rowInterface {  
  dataGb:string,
  locgovCd:string,
  locgovNm:string,
  vhclNo:string
  vhclNoTag:React.ReactNode,
  brnoTag:React.ReactNode,
  brno:string
  vhclSttsNm:string,
  carDscntYnNm:string,
  crdcoNm:string,
  cardNo:string,
  flnm:string,
  rrno:string,
  cardDscntYnNm:string,
}

interface VhclMasterInterface {
  issueDetailInfo:issueDetailInfoInterface|null
  open:boolean
  setOpen:React.Dispatch<React.SetStateAction<boolean>>
  setErsrResult:React.Dispatch<React.SetStateAction<boolean>>
}

const VhclMasterModal = (props:VhclMasterInterface) => {

  const { issueDetailInfo, open, setOpen, setErsrResult } = props;

  const [rows, setRows] = useState<rowInterface[]>([]); // 조회결과
  const [loading, setLoading] = useState<boolean>(false); // 로딩여부

  // 모달 오픈시
  useEffect(() => {
    if(open) {
      getOneCardIssuJdgmnMngTx();
    }    
  }, [open]);

  // 에러시 모달 강제종료
  const errModalClose = () => {
    alert('차량데이터가 로드되지 않았습니다.\n재조회 후 이용 부탁드립니다.');
    setOpen(false);
    return;
  };

  const getOneCardIssuJdgmnMngTx = async () => {

    if (!issueDetailInfo?.brno || !issueDetailInfo?.vhclNo || !issueDetailInfo?.locgovCd) {
      errModalClose();
      return;
    }
  
    setLoading(true);

    try {

      const searchObj = {
        brno:issueDetailInfo?.brno,
        vhclNo:issueDetailInfo?.vhclNo
      };

      const endpoint = '/fsm/cad/cijm/tx/getOneCardIssuJdgmnMng' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });
      
      if (response && response.resultType === 'success' && response.data) {
        
        const temp:rowInterface[] = response.data.slice();
        const result:rowInterface[] = [];
        
        temp.map(item => {

          if (item.dataGb === 'VHCL_NO') {
            result.push({
              ...item
              , vhclNoTag:<Box color={'#f44336'}>{item.vhclNo}</Box>
              , brnoTag:<Box>{brNoFormatter(item.brno)}</Box>
            });
          } else if (item.dataGb === 'BRNO') {
            result.push({
              ...item
              , vhclNoTag:<Box>{item.vhclNo}</Box>
              , brnoTag:<Box color={'#f44336'}>{brNoFormatter(item.brno)}</Box>
            });
          } else {
            result.push({
              ...item
              , vhclNoTag:<Box>{item.vhclNo}</Box>
              , brnoTag:<Box>{brNoFormatter(item.brno)}</Box>
            });
          }

        });
        
        setRows(result); // 데이터 조회 성공시
      }
      
    } catch (error) {
      // 에러시
      errModalClose();
    } finally {
      setLoading(false)
    }
  }

  // 말소대기/승인 클릭시
  const handleClick = () => {
    
    setErsrResult(true);

    let msg = '';
    const dataLocgovCd = issueDetailInfo?.locgovCd;

    rows.map((item:rowInterface) => {

      const rowsLocgovCd = item.locgovCd;
      const rowsLocgovNm = item.locgovNm;
      const rowsVhclNo = item.vhclNo;
      const rowsBrno = brNoFormatter(item.brno);

      if(dataLocgovCd !== rowsLocgovCd) {
        msg += '차량번호 : ' + rowsVhclNo + '\n사업자번호 : ' + rowsBrno + '\n지자체명 : ' +  rowsLocgovNm + '\n\n';
      }
    });

    if(msg){
      msg += "다른 지자체 차량이므로 '말소대기'로 상태 변경을 할 수 없습니다.\n\n해당 지자체로 차량말소(양도/양수) 또는 지자체이관(수급자 동일) 처리를 요청하셔야 합니다.";
      alert(msg);
      handleClose(false);
    } else {
      alert("카드발급 승인 처리시 '말소대기' 상태로 변경된 차량은 국세청 응답이 승인이면 말소처리 되며 탈락이면 이전 상태로 복원됩니다.");
      handleClose(true);
    }
  };

  // 모달 클로즈
  const handleClose = (result:boolean) => {
    setErsrResult(result);
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
                차량마스터 조회
              </span>
            </DialogTitle>

            {/* 버튼 */}            
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={handleClick}
              >
                말소대기/승인
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

          {/* 발급요청정보 */}
          <BlankCard className="contents-card" title="발급요청정보">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>발급요청정보 요약</caption>
                <colgroup>
                  <col style={{ width: '7.5%' }}></col>
                  <col style={{ width: '17%' }}></col>
                  <col style={{ width: '8%' }}></col>
                  <col style={{ width: '18%' }}></col>
                  <col style={{ width: '7.5%' }}></col>
                  <col style={{ width: '17%' }}></col>
                  <col style={{ width: '8%' }}></col>
                  <col style={{ width: '17%' }}></col>
                </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">차량번호</th>
                      <td>{issueDetailInfo?.vhclNo}</td>
                      <th className="td-head" scope="row">사업자번호</th>
                      <td>{brNoFormatter(issueDetailInfo?.brno ?? '')}</td>
                      <th className="td-head" scope="row">수급자명</th>
                      <td>{issueDetailInfo?.flnm}</td>
                      <th className="td-head" scope="row">주민번호</th>
                      <td>{rrNoFormatter(issueDetailInfo?.rrno ?? '')}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">카드사</th>                      
                      <td>{trim(issueDetailInfo?.crdcoNm)}</td>
                      <th className="td-head" scope="row">카드번호</th>                      
                      <td>{cardNoFormatter(issueDetailInfo?.cardNo ?? '')}</td>
                      <th className="td-head" scope="row">면허구분</th>                      
                      <td>{issueDetailInfo?.bzmnSeNm}</td>
                      <th className="td-head" scope="row">유종</th>                      
                      <td>{issueDetailInfo?.koiNm}</td>
                    </tr>
                  </tbody>
              </table>
            </div>
          </BlankCard>

          <BlankCard className="contents-card" title="FSMS 정보">
            
            {/* FSMS 정보 */}
            <Box style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <TableDataGrid
                customHeader={customHeader}
                headCells={headCells}
                rows={rows}
                loading={loading}
                caption={"FSMS 정보 조회 목록"}
              />
            </Box>

            {/* 하단 안내문구 */}
            <Box mt={'2%'}>
              <Box fontWeight={600} color={'#f44336'}>
                ※ 발급요청 차량번호, 사업자번호에 대하여 FSMS와 다른 정보가 조회되었습니다.
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

const customHeader = (): React.ReactNode => {
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={5}>
          차량번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }} colSpan={5}>
          소유자명
        </TableCell>       
      </TableRow>
      <TableRow>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          지자체명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          차량번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          사업자번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          차량상태
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          할인여부
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          카드사
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          카드번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          수급자명
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          주민번호
        </TableCell>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          할인여부
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default VhclMasterModal;