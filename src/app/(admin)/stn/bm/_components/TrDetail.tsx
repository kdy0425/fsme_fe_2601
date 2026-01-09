import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'

import { Row } from './TrPage';
import { dateTimeFormatter, getDateTimeString, brNoFormatter, getCommaNumber} from '@/utils/fsms/common/util';
import { formatMinDate } from '@/utils/fsms/common/convert';
import {
  rrNoFormatter
  , phoneNoFormatter
} from '@/utils/fsms/common/util'



interface DetailProps {
  data: Row;
}

const TrDetailGrid: React.FC<DetailProps> = ({data}) => {
  return (
    <BlankCard title='사업자정보'>

    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <>

          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <tbody>

                <tr>
                  <th className="td-head" scope="row">
                    법인등록번호 
                  </th>
                  <td colSpan={1}>
                    {rrNoFormatter(data.crnoSecure??'')}
                  </td>
                  <th className="td-head" scope="row">
                    업체명 
                  </th>
                  <td colSpan={5}>
                    {data.bzentyNm}
                  </td>
                </tr>

                <tr>
                  <th className="td-head" scope="row">
                    대표자명
                  </th>
                  <td colSpan={1}>
                    {data.rprsvNm}
                  </td>
                  <th className="td-head" scope="row" colSpan={1}>
                    대표자주민등록번호
                  </th>
                  <td colSpan={1}>
                    {rrNoFormatter(data.rprsvRrnoSecure?? '')}

                    {/* {getDateTimeString(data.rprsvRrno, 'date')?.dateString} */}
                  </td>
                  <th className="td-head" scope="row" colSpan={1}>
                    전화번호
                  </th>
                  <td colSpan={3}>
                    {phoneNoFormatter(data.telno??'')}
                  </td>
                </tr>

                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td colSpan={1}>
                    {data.rgtrId}
                  </td>
                  <th className="td-head" scope="row" colSpan={1}>
                    등록일자
                  </th>
                  <td colSpan={1}>
                    {formatMinDate(data.regDt)}
                  </td>
                  <th className="td-head" scope="row" colSpan={1}>
                    수정자아이디
                  </th>
                  <td colSpan={1}>
                    {data.mdfrId}
                  </td>
                  <th className="td-head" scope="row" colSpan={1}>
                    수정일자
                  </th>
                  <td colSpan={1}>
                    {formatMinDate(data.mdfcnDt)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
      </Grid>
    </Grid>
    </BlankCard>
  )
}

export default TrDetailGrid
