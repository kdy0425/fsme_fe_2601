import { Grid, Button, Select } from '@mui/material'
import { Row } from './page'
import BlankCard from '@/app/components/shared/BlankCard'
import { getDateTimeString } from '@/utils/fsms/common/util'
import { formatDate } from '@/utils/fsms/common/convert'
import { getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import FormDialog from './FormDialog'
import { rrNoFormatter, brNoFormatter } from '@/utils/fsms/common/util'

type DetailDataGridProps = {
  detail: Row
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail } = props

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '11%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">차량번호</th>
                  <td>{detail['vhclNo']}</td>
                  <th className="td-head" scope="row">소유자명</th>
                  <td>{detail['vonrNm']}</td>
                  <th className="td-head" scope="row">사업자등록번호</th>
                  <td>{brNoFormatter(detail['vonrBrno'] ?? '')}</td>
                  <th className="td-head" scope="row">주민등록번호</th>
                  <td>{rrNoFormatter(detail['vonrRrnoSecure'] ?? '')}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">지급정지시작일</th>
                  <td>{formatDate(detail['bgngYmd'])}</td>
                  <th className="td-head" scope="row">지급정지종료일</th>
                  <td colSpan={5}>{formatDate(detail['endYmd'])}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">지급정지사유</th>
                  <td colSpan={7}>{detail['chgRsnCn']}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">등록자아이디</th>
                  <td>{detail['rgtrId']}</td>
                  <th className="td-head" scope="row">등록일자</th>
                  <td>{formatDate(detail['regDt'])}</td>
                  <th className="td-head" scope="row">수정자아이디</th>
                  <td>{detail['mdfrId']}</td>
                  <th className="td-head" scope="row">수정일자</th>
                  <td>{formatDate(detail['mdfcnDt'])}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
