import React from 'react'
import { Grid } from '@mui/material'
import BlankCard from '@/app/components/shared/BlankCard'
import { Row } from '../page'
import { brNoFormatter } from '@/utils/fsms/common/util'

interface DetailDataGridProps {
  row: Row
}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({ row }) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
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
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">
                    차량번호
                  </th>
                  <td>{row?.vhclNo}</td>

                  <th className="td-head" scope="row">
                    사업자등록번호
                  </th>
                  <td>{brNoFormatter(row?.brno)}</td>

                  <th className="td-head" scope="row">
                    업체명
                  </th>
                  <td>{row?.vonrNm}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
