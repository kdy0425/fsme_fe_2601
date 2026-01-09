/* React */
import { memo } from 'react';

/* mui component */
import { Grid } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'

/* 공통 js */
import { getDateTimeString, brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'

/* 부모 페이지에서 선언한 interface */
import { carnetInfoInterface } from './TxIfCardReqComponent';

interface propsInterface {
  carnetInfo:carnetInfoInterface|null
}

const TxCarnetInfo = (props:propsInterface) => {
  
  const { carnetInfo } = props;

  return(
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="자동차망 연계정보">
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>자동차망 연계정보</caption>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <tbody>
              <tr>
                <th className="td-head" scope="row">
                  사업자번호
                </th>
                <td>
                  {brNoFormatter(carnetInfo?.netBrno ?? '')}
                </td>
                <th className="td-head" scope="row">
                  주민등록번호
                </th>
                <td>                
                  {rrNoFormatter(carnetInfo?.netPid ?? '')}
                </td>
                <th className="td-head" scope="row">
                  성명(업체명)
                </th>
                <td>
                  {carnetInfo?.netName}
                </td>
                <th className="td-head" scope="row">
                  지자체명
                </th>
                <td>
                  {carnetInfo?.netLocalNm}
                </td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  유종
                </th>
                <td>
                  {carnetInfo?.netKoiNm}
                </td>
                <th className="td-head" scope="row">
                  폐차여부
                </th>
                <td>
                  {carnetInfo?.netScrcarNm}
                </td>
                <th className="td-head" scope="row">
                  최종변경일
                </th>
                <td colSpan={3}>
                  {getDateTimeString(carnetInfo?.netMdfcnDt ?? '', 'date')?.dateString}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </BlankCard>
      </Grid>
    </Grid>
  )
};

export default memo(TxCarnetInfo);