import { Grid, Button, Select } from '@mui/material'
import { HistoryRow, Row } from './page'
import BlankCard from '@/app/components/shared/BlankCard'
import { getDateTimeString } from '@/utils/fsms/common/util'
import { formatDate } from '@/utils/fsms/common/convert'
import { getToday } from '@/utils/fsms/common/comm'
import { SelectItem } from 'select'
import FormDialog from './FormDialog'
import { useState } from 'react'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

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

const rrNoFormatter = (rrNo?: string) => {
  if (rrNo) {
    // '-'가 있을 경우 호환을 위해 제거
    rrNo = rrNo.replaceAll('-', '')

    const rrNo1 = rrNo.substring(0, 6)
    const rrNo2 = rrNo.substring(6, 13)

    return `${rrNo1}-${rrNo2}`
  }
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail } = props

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

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
                  <col style={{ width: '150px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>{detail['vhclNo']}</td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>{detail['rprsvNm']}</td>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter(detail['brno'])}</td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>{rrNoFormatter(detail['rprsvRrno'])}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      지급정지시작일
                    </th>
                    <td>{formatDate(detail['stopBgngYmd'])}</td>
                    <th className="td-head" scope="row">
                      지급정지종료일
                    </th>
                    <td>{formatDate(detail['stopEndYmd'])}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      지급정지사유
                    </th>
                    <td colSpan={7}>{detail['stopRsnCn']}</td>
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
            <FormDialog
              detail={detail}
              size={'lg'}
              open={open}
              handleClose={handleClose}
            />
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
