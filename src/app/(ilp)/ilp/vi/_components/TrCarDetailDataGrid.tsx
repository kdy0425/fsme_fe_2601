import React from 'react'
import { Grid } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './TrPage'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { formBrno } from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'

interface DetailDataType {
  vhclNo?: string // 차량번호
  locgov?: string // 관할관청
  vhclSeCd?: string // 면허업종

  brno?: string // 차주사업자등록번호
  rprsvRrno?: string // 차주주민등록번호
  rprsvNm?: string // 차주명
  koiCd?: string // 유종
  tons?: string // 톤수
  rfidYn?: string // 소유구분

  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
}

interface DetailDataGridProps {
  data?: Row
}

const CarDetailDataGrid: React.FC<DetailDataGridProps> = ({
  data
}) => {
  
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard
          className="contents-card"
          title={'화물차량정보 ( ' + data?.dscntYnNm + ' )'}
        >
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td colSpan={3}>
                      {data?.vhclNo}
                    </td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>{data?.locgovNm}</td>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>{data?.lcnsTpbizNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차주사업자등록번호
                    </th>
                    <td colSpan={3}>
                      {formBrno(data?.vonrBrno)}
                    </td>
                    <th className="td-head" scope="row">
                      차주주민등록번호
                    </th>
                    <td colSpan={3}>
                      {rrNoFormatter(data?.vonrRrnoSecure ?? '')}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차주성명
                    </th>
                    <td>{data?.vonrNm}</td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{data?.koiNm}</td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>{data?.vhclTonNm}</td>
                    <th className="td-head" scope="row">
                      소유구분
                    </th>
                    <td>{data?.vhclPsnNm}</td>
                  </tr>
                  
                  <tr>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>{data?.rgtrId}</td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>{getDateFormatYMD(data?.regDt ?? '')}</td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>{data?.mdfrId}</td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>{getDateFormatYMD(data?.mdfcnDt ?? '')}</td>
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

export default CarDetailDataGrid
