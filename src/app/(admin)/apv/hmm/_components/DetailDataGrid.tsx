import React from 'react';

import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
// MUI 그리드 한글화 import
import BlankCard from '@/app/components/shared/BlankCard';
import { brNoFormatter, getDateTimeString } from '../../../../../utils/fsms/common/util';
import { Row } from '../page';
import { telnoFormatter } from '@/utils/fsms/common/comm';

interface DetailDataGridProps {
  selectedRow:Row|null // row 속성을 선택적 속성으로 변경
}

const DetailDataGrid = (props:DetailDataGridProps) => {
  
  const { selectedRow } = props;
  
  return (
    <Grid container spacing={2} className="card-container">
    <Grid item xs={12} sm={12} md={12}>
      <BlankCard className="contents-card" title="상세 정보">
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
                  <th className="td-head td-left" scope="row">
                    사업자등록번호
                  </th>
                  <td>
                    {brNoFormatter(String(selectedRow?.frcsBrno))}
                  </td>
                  <th className="td-head td-left" scope="row">
                    가맹점명
                  </th>
                  <td colSpan={3}>
                    {selectedRow?.frcsNm}
                  </td>
                </tr>
                <tr>
                  <th className="td-head td-left" scope="row">
                    전화번호
                  </th>
                  <td>
                    {selectedRow?.frcsTelno ? telnoFormatter(selectedRow?.frcsTelno) : ''}
                  </td>
                  <th className="td-head td-left" scope="row">
                    카드사
                  </th>
                  <td>
                    {selectedRow?.crdcoNm}
                  </td>
                  <th className="td-head td-left" scope="row">
                    가맹점번호
                  </th>
                  <td>
                    {selectedRow?.frcsNo}
                  </td>
                </tr>
                <tr>
                  <th className="td-head td-left" scope="row">
                    주소(소재지)
                  </th>
                  <td colSpan={3}>
                    {selectedRow?.frcsAddr}
                  </td>
                </tr>
                <tr>
                  <th className="td-head td-left" scope="row">
                    등록날짜
                  </th>
                  <td style={{ width: '12.5%' }}>
                    {getDateTimeString(String(selectedRow?.regDt), 'date')?.dateString}
                  </td>
                  <th className="td-head td-left" scope="row">
                    보조금 지급여부
                  </th>
                  <td style={{ width: '12.5%' }}>
                    {selectedRow?.sttsNm}
                  </td>
                  <th className="td-head td-left" scope="row">
                    처리상태
                  </th>
                  <td style={{ width: '12.5%', color:selectedRow?.errCd == '000' ? 'black' : 'red' }}>
                    {selectedRow?.errNm}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
      </BlankCard>
    </Grid>
  </Grid>
    
  );
};

export default DetailDataGrid;
