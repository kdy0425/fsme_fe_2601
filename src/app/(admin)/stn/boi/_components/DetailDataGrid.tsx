import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from '../page'
import { formBrno } from '@/utils/fsms/common/convert'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

interface DetailDataGridProps {
  data?: Row
}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({
  data,
}) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="버스운행정보">
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
                      관할관청
                    </th>
                    <td>
                      {data?.locgovNm}
                    </td>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>
                      {data?.vhclNo}
                    </td>
                    <th className="td-head" scope="row">
                      사업자번호
                    </th>
                    <td>
                      {formBrno(data?.brno)}
                    </td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>
                      {data?.bzentyNm}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      운행일자
                    </th>
                    <td>
                      {getDateFormatYMD(data?.oprYmd ?? '')}
                    </td>
                    <th className="td-head" scope="row">
                      제출일자
                    </th>
                    <td>
                      {getDateFormatYMD(data?.sbmsnYmd ?? '')}
                    </td>
                    <th className="td-head" scope="row">
                      운행거리
                    </th>
                    <td  className="t-right">
                      {data?.oprDstnc}
                    </td>
                    <th className="td-head" scope="row">
                      운행시간(분)
                    </th>
                    <td className="t-right">
                      {data?.oprMnCnt}
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
  )
}

export default DetailDataGrid
