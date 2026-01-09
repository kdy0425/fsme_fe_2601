import React from 'react';

// MUI 그리드 한글화 import
import BlankCard from '@/app/components/shared/BlankCard';
import {
  formBrno
} from '@/utils/fsms/common/convert';

import { getDateTimeString } from '@/utils/fsms/common/util';
import { Row } from '../page';
import { Button } from '@mui/material';

interface DetailDataGridProps {
  row: Row; // row 속성을 선택적 속성으로 변경
}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({
  row,
}) => {
  return (
        <>
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head td-left" scope="row">
                    사업자등록번호
                  </th>
                  <td>
                    {formBrno(row.frcsBrno)}
                  </td>
                  <th className="td-head td-left" scope="row">
                    가맹점명
                  </th>
                  <td>
                    {row.frcsNm}
                  </td>
                  <th className="td-head td-left" scope="row">
                    연락처
                  </th>
                  <td>
                    {formBrno(row.telnoFull)}
                  </td>
                </tr>

                <tr>
                  <th className="td-head td-left" scope="row">
                    주소
                  </th>
                  <td colSpan={5}>
                    {row.daddrFull}
                  </td>
                </tr>

                <tr>
                  <th className="td-head td-left" scope="row">
                    등록일자
                  </th>
                  <td> 
                    {getDateTimeString(row.regDt, 'date')?.dateString}
                  </td>
                  <th className="td-head td-left" scope="row">
                    설치일자
                  </th>
                  <td>
                    {getDateTimeString(row.aogIdntySysInstlYmd, 'date')?.dateString}
                  </td>
                  <th className="td-head td-left" scope="row">
                    
                  </th>
                  <td>
                    
                  </td>
                </tr>

                <tr>
                  <th className="td-head td-left" scope="row">
                    신한 가맹점번호
                  </th>
                  <td> 
                    {row.shFrcsCdNo}
                  </td>
                  <th className="td-head td-left" scope="row">
                    KB 가맹점번호
                  </th>
                  <td>
                    {row.kbFrcsCdNo}
                  </td>
                  <th className="td-head td-left" scope="row">
                    우리 가맹점번호
                  </th>
                  <td>
                    {row.wrFrcsCdNo}
                  </td>
                </tr>

                <tr>
                  <th className="td-head td-left" scope="row">
                    삼성 가맹점번호
                  </th>
                  <td> 
                    {row.ssFrcsCdNo}
                  </td>
                  <th className="td-head td-left" scope="row">
                    현대 가맹점번호
                  </th>
                  <td>
                    {row.hdFrcsCdNo}
                  </td>
                  <th className="td-head td-left" scope="row">
                    
                  </th>
                  <td>
                    
                  </td>
                </tr>
                
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
  );
};

export default DetailDataGrid;
