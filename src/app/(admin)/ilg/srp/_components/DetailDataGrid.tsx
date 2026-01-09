/* React */
import React, { memo } from 'react'

/* mui */
import { Grid } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'

/* 공통 js */
import {
  getDateTimeString,
  brNoFormatter,
  rrNoFormatter,
} from '@/utils/fsms/common/util'

/* 부모 컴포넌트에서 선언한 interface */
import { detailInfoInterface } from '../page'

/* interface선언 */
interface DetailDataGridProps {
  detailInfo: detailInfoInterface
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detailInfo } = props

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="보조금지급거절 상세정보">
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    차량번호
                  </th>
                  <td>{detailInfo.vhclNo}</td>
                  <th className="td-head" scope="row">
                    소유자명
                  </th>
                  <td>{detailInfo.vonrNm}</td>
                  <th className="td-head" scope="row">
                    사업자등록번호
                  </th>
                  <td>{brNoFormatter(detailInfo.vonrBrno)}</td>
                  <th className="td-head" scope="row">
                    주민등록번호
                  </th>
                  <td>{rrNoFormatter(detailInfo.vonrRrnoSe)}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    지급거절시작일
                  </th>
                  <td>
                    {getDateTimeString(detailInfo.bgngYmd, 'date')?.dateString}
                  </td>
                  <th className="td-head" scope="row">
                    지급거절종료일
                  </th>
                  <td colSpan={5}>
                    {getDateTimeString(detailInfo.endYmd, 'date')?.dateString}
                  </td>
                </tr>
                <tr style={{ height: '180px' }}>
                  <th className="td-head" scope="row">
                    지급거절사유
                  </th>
                  <td colSpan={7}>{detailInfo.chgRsnCn}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td>{detailInfo.rgtrId}</td>
                  <th className="td-head" scope="row">
                    등록일자
                  </th>
                  <td>
                    {getDateTimeString(detailInfo.regDt, 'date')?.dateString}
                  </td>
                  <th className="td-head" scope="row">
                    수정자아이디
                  </th>
                  <td>{detailInfo.mdfrId}</td>
                  <th className="td-head" scope="row">
                    수정일자
                  </th>
                  <td>
                    {getDateTimeString(detailInfo.mdfcnDt, 'date')?.dateString}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default memo(DetailDataGrid)
