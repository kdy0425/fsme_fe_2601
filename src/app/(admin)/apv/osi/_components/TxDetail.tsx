import BlankCard from '@/components/shared/BlankCard';
import React, { useState } from 'react';

import { telnoFormatter } from '@/utils/fsms/common/comm';
import { brNoFormatter } from '@/utils/fsms/common/util';
import { Row } from './TxPage';
import FormModal from '@/app/components/popup/FormDialog';
import TxModalContent from './TxModalContent';
import { Button } from '@mui/material';

interface DetailProps {
  data: Row;
}

const TxDetailGrid: React.FC<DetailProps> = ({data}) => {
  const [open, setOpen] = useState<boolean>(false); // 모달 open, close
  const [type, setType] = useState<'M'|'D'>('M'); // 월별, 일별 구분
  const [excelDown, setExcelDown] = useState<boolean|null>(null);

  const openDialog = (type: 'M' | 'D') => {
    setType(type);
    setOpen(true);
  }

  const handleExcelDown = () => {
    setExcelDown(false);
  }

  return (
    <BlankCard 
      title='상세정보'
      buttons={[
        {
          label: '가맹점 일별거래내역',
          color: 'outlined',
          onClick: () => openDialog('D'),
        },
        {
          label: '가맹점 월별거래내역',
          color: 'outlined',
          onClick: () => openDialog('M'),
        },
      ]}
    >
      <>
        {/* 테이블영역 시작 */}
        <div className="table-scrollable">
          <table className="table table-bordered">
            <caption>상세 내용 시작</caption>
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <tbody>
              <tr>
                <th className="td-head" scope="row">
                  사업자등록번호 
                </th>
                <td>
                  {brNoFormatter(data.frcsBrno)}
                </td>
                <th className="td-head" scope="row">
                  주유(충전소)명 
                </th>
                <td colSpan={3}>
                  {data.frcsNm}
                </td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  전화번호
                </th>
                <td>
                  {telnoFormatter(data.frcsTelno)}
                </td>
                <th className="td-head" scope="row">
                  카드사
                </th>
                <td>
                  {data.crdcoNm}
                </td>
                <th className="td-head" scope="row">
                  가맹점번호
                </th>
                <td>
                  {data.frcsNo}
                </td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  주소(소재지)
                </th>
                <td colSpan={5}>
                  {data.frcsAddr}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 테이블영역 끝 */}
      </>
      <FormModal 
        buttonLabel={''}
        size='xl'
        title={type == 'M' ? '가맹점 월별거래내역조회' : '가맹점 일별거래내역조회'}
        remoteFlag={open}
        formLabel='검색'
        formId='send-search'
        closeHandler={() => setOpen(false)}
        btnSet={
          <>
            <Button variant='contained' color='success' onClick={() => setExcelDown(true)}>엑셀</Button>
          </>
        }
      >
        <TxModalContent 
          type={type}
          frcsBrno={data.frcsBrno}
          excelDown={excelDown}
          onExcelDown={handleExcelDown}
        />
      </FormModal>
    </BlankCard>
  )
}

export default TxDetailGrid
