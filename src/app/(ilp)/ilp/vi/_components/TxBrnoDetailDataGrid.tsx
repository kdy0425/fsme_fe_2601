import React from 'react'
import { Grid } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import {Row} from './TxPage'
import { formatDate, formatPhoneNumber, formBrno } from '@/utils/fsms/common/convert'
import { trim } from 'lodash'


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
                    <td>{formBrno(data?.brno) }
                    </td>
                    <th className="td-head" scope="row">
                    업체명
                    </th>
                    <td>
                      {data?.bzentyNm }
                    </td>
                    <th className="td-head" scope="row">
                    법인등록번호
                    </th>
                    <td>{data?.crno }</td>
                    <th className="td-head" scope="row">
                    개인법인
                    </th>
                    <td>{data?.bzmnSeNm }</td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                    대표자명
                    </th>
                    <td>{data?.rprsvNm}</td>
                    <th className="td-head" scope="row">
                    전화번호
                    </th>
                    <td >
                    <td>{formatPhoneNumber( data?.telno)}</td>
                    </td>
                    <th className="td-head" scope="row">
                    국세청변경일자
                    </th>
                    <td>{formatDate(trim(data?.ntsChgYmd))}</td>
                    <th className="td-head" scope="row">
                    관할관청
                    </th>
                    <td >
                    {data?.locgovNm}
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

export default React.memo(BrnoDetailDataGrid)
