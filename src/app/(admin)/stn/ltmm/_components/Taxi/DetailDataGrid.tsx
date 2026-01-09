import React from 'react'
import { Grid } from '@mui/material'
import { Row } from './TaxiPage'
import { formatDate } from '@/utils/fsms/common/convert'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'

// Detail Props
interface DetailDataGridProps {
  data?: Row
}

const DetailDataGrid = (props:DetailDataGridProps) => {

  const { data } = props;

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>  
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
                <td>{data?.vhclNo ?? ''}</td>
                <th className="td-head" scope="row">
                  유종
                </th>
                <td>{data?.koiNm ?? ''}</td>                
                <th className="td-head" scope="row">
                  사업자등록번호
                </th>
                <td>{brNoFormatter(data?.brno ?? '')}</td>
                <th className="td-head" scope="row">
                  개인법인
                </th>
                <td>{data?.bzmnSeNm ?? ''}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  대표자명
                </th>
                <td>{data?.rprsvNm ?? ''}</td>
                <th className="td-head" scope="row">
                  업체명
                </th>
                <td>{data?.bzentyNm ?? ''}</td>
                <th className="td-head" scope="row">
                  주민등록번호
                </th>
                <td>{rrNoFormatter(data?.rprsvRrnoS ?? '')}</td>
                <th className="td-head" scope="row">
                  차량상태
                </th>
                <td>{data?.vhclSttsNm ?? ''}</td>                
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  관할관청
                </th>
                <td>{data?.exsLocgovNm ?? ''}</td>                
                <th className="td-head" scope="row">
                  요청일자
                </th>
                <td>{formatDate(data?.regYmd) ?? ''}</td>
                <th className="td-head" scope="row">
                  전출관청
                </th>
                <td>{data?.exsLocgovNm ?? ''}</td>                
                <th className="td-head" scope="row">
                  전입관청
                </th>
                <td>{data?.chgLocgovNm ?? ''}</td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  처리상태
                </th>
                <td>{data?.prcsSttsNm ?? ''}</td>
                <th className="td-head" scope="row">
                  처리일자
                </th>
                <td>{formatDate(data?.mdfcnDt) ?? ''}</td>
                <th className="td-head" scope="row">
                  거절사유
                </th>
                <td colSpan={3}>
                  {data?.rfslRsnCn ?? ''}
                </td>
              </tr>
              <tr>
                <th className="td-head" scope="row">
                  등록자아이디
                </th>
                <td>{data?.rgtrId ?? ''}</td>
                <th className="td-head" scope="row">
                  등록일자
                </th>
                <td>{formatDate(data?.regDt) ?? ''}</td>
                <th className="td-head" scope="row">
                  수정자아이디
                </th>
                <td>{data?.mdfrId ?? ''}</td>
                <th className="td-head" scope="row">
                  수정일자
                </th>
                <td>{formatDate(data?.mdfcnDt) ?? ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 테이블영역 끝 */}
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
