import { Grid, Button, Select } from '@mui/material'
import { Row } from './page'
import BlankCard from '@/app/components/shared/BlankCard'
import { getDateTimeString } from '@/utils/fsms/common/util'
import { formatDate } from '@/utils/fsms/common/convert'
import { getToday } from '@/utils/fsms/common/comm'
import { rrNoFormatter, cardNoFormatter } from '@/utils/fsms/common/util'

type DetailDataGridProps = {
  detail: Row
}

const brNoFormatter = (brNo?: string) => {
  if (brNo && brNo.length == 10) {
    const brNo1 = brNo.substring(0, 3)
    const brNo2 = brNo.substring(3, 5)
    const brNo3 = brNo.substring(5, 10)

    return `${brNo1}-${brNo2}-${brNo3}`
  }
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail } = props

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>{detail['vhclNo']}</td>
                    <th className="td-head" scope="row">
                      수급자명
                    </th>
                    <td>{detail['flnm']}</td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(detail['brno'])}</td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>{rrNoFormatter(detail['rrnoS'] ?? '')}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>{detail['bzentyNm']}</td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>{detail['locgovNm']}</td>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>{detail['bzmnSeNm']}</td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{detail['koiNm']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      카드사
                    </th>
                    <td>{detail['crdcoNm']}</td>
                    <th className="td-head" scope="row">
                      카드구분
                    </th>
                    <td>{detail['cardSeNm']}</td>
                    <th className="td-head" scope="row">
                      발급구분
                    </th>
                    <td>{detail['issuSeNm']}</td>
                    <th className="td-head" scope="row">
                      카드번호
                    </th>
                    <td>{cardNoFormatter(detail['cardNoS'] ?? '')}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      처리상태
                    </th>
                    <td>{detail['moliatAprvNm']}</td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>{formatDate(detail['moliatAprvDt'])}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락사유코드
                    </th>
                    <td colSpan={3}>{detail['flRsnNm']}</td>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td colSpan={3}>{detail['flRsnCn']}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>{detail['rgtrId']}</td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>{formatDate(detail['regDt'])}</td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>{detail['mdfrId']}</td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>{formatDate(detail['mdfcnDt'])}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
