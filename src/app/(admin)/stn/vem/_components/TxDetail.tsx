import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'

import { Row, CardRow } from './TxPage'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
} from '@/utils/fsms/common/util'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

interface DetailProps {
  data: Row
  cardData: CardRow | null
}

const TxDetailGrid: React.FC<DetailProps> = ({ data, cardData }) => {
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
                    차량말소여부
                  </th>
                  <td>{data.vhclSttsNm}</td>
                  <th className="td-head" scope="row">
                    차량말소일자
                  </th>
                  <td>{getDateFormatYMD(data.ersrYmd)}</td>
                  <th className="td-head" scope="row">
                    차량말소사유
                  </th>
                  <td colSpan={3}>{data.ersrRsnNm}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    카드할인여부
                  </th>
                  <td>{cardData?.cardDscntNm}</td>
                  <th className="td-head" scope="row">
                    할인변경예정
                  </th>
                  <td>{cardData?.dscntChgNm}</td>
                  <th className="td-head" scope="row">
                    할인변경예정일자
                  </th>
                  <td colSpan={3}>{getDateFormatYMD(cardData?.dscntChgAplcnYmd ?? '')}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td>{cardData?.rgtrId}</td>
                  <th className="td-head" scope="row">
                    등록일자
                  </th>
                  <td>{getDateFormatYMD(cardData?.regDt ?? '')}</td>
                  <th className="td-head" scope="row">
                    수정자아이디
                  </th>
                  <td>{cardData?.mdfrId}</td>
                  <th className="td-head" scope="row">
                    수정일자
                  </th>
                  <td>{getDateFormatYMD(cardData?.mdfcnDt ?? '')}</td>
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

export default TxDetailGrid
