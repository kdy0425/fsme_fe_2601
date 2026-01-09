import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'

import { Row } from './TrPage'
import {
  dateTimeFormatter,
  brNoFormatter,
  getCommaNumber,
} from '@/utils/fsms/common/util'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

interface DetailProps {
  data: Row
}

const TrDetail: React.FC<DetailProps> = ({ data }) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <>
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
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
                    유종
                  </th>
                  <td>{data.aftchKoiCdNm}</td>
                  <th className="td-head" scope="row">
                    톤수
                  </th>
                  <td>{data.aftchVhclTonCdNm}</td>
                  <th className="td-head" scope="row">
                  적용일자
                  </th>
                  <td>
                  {getDateFormatYMD(data.aplcnYmd ? data.aplcnYmd : '') }
                  </td>
                  <th className="td-head" scope="row">
                  </th>
                  <td></td>
                </tr>

                <tr>
                  <th className="td-head" scope="row">
                    변경사유 
                  </th>
                  <td  colSpan={7}>
                    {data.chgRsnCn}
                  </td>
                </tr>
            
                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td>{data.rgtrId}</td>
                  <th className="td-head" scope="row">
                    등록일자
                  </th>
                  <td>
                  {getDateFormatYMD(data.regDt ? data.regDt : '') }
                  </td>
                  <th className="td-head" scope="row">
                    수정자아이디
                  </th>
                  <td>{data.mdfrId}</td>
                  <th className="td-head" scope="row">
                    수정일자
                  </th>
                  <td>
                  {getDateFormatYMD(data.mdfcnDt ? data.mdfcnDt : '') }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
      </Grid>
    </Grid>
  )
}

export default TrDetail
