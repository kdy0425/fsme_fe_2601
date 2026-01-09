import React, { memo, useState } from 'react'
import { Grid } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './TxPage'
import { formatMinDate } from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import { useRouter } from 'next/navigation'

interface DetailDataGridProps {
  data: Row
}

const CarDetailDataGrid = (props:DetailDataGridProps) => {

  const { data } = props;

  const router = useRouter();

  return (
    <>
      <Grid container spacing={2} className="card-container">
        <Grid item xs={12} sm={12} md={12}>
          <BlankCard className="contents-card" title="차량정보 (할인)">
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
                        차량번호
                      </th>
                      <td>{data?.vhclNo}</td>
                      <th className="td-head" scope="row">
                        차량상태
                      </th>
                      <td>{data?.cmSttsNm}</td>                      
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        수급자명
                      </th>
                      <td>{data?.rprsvNm}</td>
                      <th className="td-head" scope="row">
                        수급자주민등록번호
                      </th>
                      <td>{rrNoFormatter(data?.rprsvRrnoS ?? '')}</td>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>{data?.koiNm}</td>
                      <td scope="row" colSpan={2}></td>
                    </tr>                                        
                    <tr>
                      <th className="td-head" scope="row">
                        등록자아이디
                      </th>
                      <td>{data?.rgtrId}</td>
                      <th className="td-head" scope="row">
                        등록일자
                      </th>
                      <td>{formatMinDate(data?.regDt ?? '')}</td>
                      <th className="td-head" scope="row">
                        수정자아이디
                      </th>
                      <td>{data?.mdfrId}</td>
                      <th className="td-head" scope="row">
                        수정일자
                      </th>
                      <td>{formatMinDate(data?.mdfcnDt ?? '')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </>
          </BlankCard>
        </Grid>
      </Grid>
    </>
  )
}

export default memo(CarDetailDataGrid)