import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'

import { Row } from './TxPage'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  rrNoFormatter,
  telnoFormatter,
} from '@/utils/fsms/common/util'
import { formatDate, formBrno } from '@/utils/fsms/common/convert'
import { trim } from 'lodash'

interface DetailProps {
  data: Row
}

const TxDetailGrid: React.FC<DetailProps> = ({ data }) => {
  return (
    <BlankCard title="사업자정보">
      <Grid container spacing={2} className="card-container">
        <Grid item xs={12} sm={12} md={12}>
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
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(data.brno ?? '')}</td>
                    <th className="td-head" scope="row">
                      법인등록번호
                    </th>
                    <td>{rrNoFormatter(data.crno ?? '')}</td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td colSpan={3}>{data.bzentyNm}</td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>{data.rprsvNm}</td>
                    <th className="td-head" scope="row">
                      대표자주민등록번호
                    </th>
                    <td>{rrNoFormatter(data.rprsvRrnoS ?? '')}</td>
                    <th className="td-head" scope="row">
                      개인법인구분
                    </th>
                    <td>{data.bzmnSeNm}</td>
                    <th className="td-head" scope="row">
                      과세구분
                    </th>
                    <td>{data.txtnTypeNm}</td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      전화번호
                    </th>
                    <td>{telnoFormatter(data.telno ?? '')}</td>
                    <th className="td-head" scope="row">
                      상태
                    </th>
                    <td>{data.sttsNm}</td>
                    <th className="td-head" scope="row">
                      국세청변경일자
                    </th>
                    <td colSpan={3}>{formatDate(trim(data.ntsChgYmd))}</td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>{data.rgtrId}</td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>{formatDate(data.regDt)}</td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>{data.mdfrId}</td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>{formatDate(data.regDt)}</td>
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

export default TxDetailGrid
