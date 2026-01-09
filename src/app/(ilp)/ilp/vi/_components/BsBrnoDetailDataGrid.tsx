import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './BsPage'
import { formatPhoneNumber, formBrno } from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'

interface DetailProps {
  data: Row
}

const BrnoDetailDataGrid: React.FC<DetailProps> = ({ data }) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="사업자정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      사업자번호
                    </th>
                    <td>{formBrno(data?.brno)}</td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>{data?.bzentyNm}</td>
                    <th className="td-head" scope="row">
                      법인등록번호
                    </th>
                    <td>
                      {rrNoFormatter(
                        data?.crno !== undefined ? data?.crno : '',
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>{data?.rprsvNm}</td>
                    <th className="td-head" scope="row">
                      주소
                    </th>
                    <td>{data?.addr}</td>
                    <th className="td-head" scope="row">
                      전화번호
                    </th>
                    <td>{formatPhoneNumber(data?.telno)}</td>
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

export default BrnoDetailDataGrid
