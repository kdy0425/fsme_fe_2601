import BlankCard from '@/components/shared/BlankCard';
import React from 'react';

import { brNoFormatter } from '@/utils/fsms/common/util';
import { Row } from './BsPage';

interface DetailProps {
  data: Row;
  reloadFunc?: () => void;
}

const BsDetailGrid: React.FC<DetailProps> = ({data,reloadFunc}) => {
  return (
    <BlankCard title='상세정보'>
      <>
        {/* 테이블영역 시작 */}
        <div className="table-scrollable">
          <table className="table table-bordered">
            <caption>상세 내용 시작</caption>
            <colgroup>
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
            </colgroup>
            <tbody>
              <tr>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}>
                  사업자등록번호 
                </th>
                <td>
                  {brNoFormatter(data.brno)}
                </td>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}>
                  주유(충전소)명 
                </th>
                <td colSpan={6}>
                  {data.frcsNm}
                </td>
              </tr>
              <tr>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}>
                  전화번호
                </th>
                <td style={{width:'12.5%'}}>
                  {data.telnoFull}
                </td>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}>
                  카드사
                </th>
                <td style={{width:'12.5%'}}>
                  {data.cdKornNm}
                </td>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}>
                  가맹점번호
                </th>
                <td style={{width:'12.5%'}}>
                  {data.frcsCdNo}
                </td>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}></th>
                <td style={{width:'12.5%'}}></td>
              </tr>
              <tr>
                <th className="td-head td-left" scope="row" style={{width:'12.5%'}}>
                  주소(소재지)
                </th>
                <td colSpan={7}>
                  {`(${data.zip}) ${data.daddr}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 테이블영역 끝 */}
      </>
    </BlankCard>
  )
}

export default BsDetailGrid
