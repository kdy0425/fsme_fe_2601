import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'

import { Row } from './BsPage'
import { getDateTimeString, brNoFormatter } from '@/utils/fsms/common/util'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'

interface DetailProps {
  data: Row
}

const BsDetailGrid: React.FC<DetailProps> = ({ data }) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
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
                  <td>{data.vhclNo}</td>
                  <th className="td-head" scope="row">
                    사업자등록번호
                  </th>
                  <td>{brNoFormatter(data.brno)}</td>
                  <th className="td-head" scope="row">
                    업체명
                  </th>
                  <td>{data.bzentyNm}</td>
                  <th className="td-head" scope="row">
                    유종
                  </th>
                  <td>{data.koiCdNm}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    면허업종
                  </th>
                  <td>{data.vhclSeCdNm}</td>
                  <th className="td-head" scope="row">
                    할인여부
                  </th>
                  <td>{data.dscntYnNm}</td>
                  <th className="td-head" scope="row">
                    RFID차량여부
                  </th>
                  <td>{data.rfidYn}</td>
                  <th className="td-head" scope="row">
                    차량상태
                  </th>
                  <td>{data.vhclSttsCdNm}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    말소여부
                  </th>
                  <td>{data.ersrYn}</td>
                  <th className="td-head" scope="row">
                    말소일자
                  </th>
                  <td>{getDateFormatYMD(data.ersrYmd)}</td>
                  <th className="td-head" scope="row">
                    말소사유
                  </th>
                  <td colSpan={3}>{data.ersrRsnNm}</td>
                </tr>
                <tr>
                  <th className="td-head" scope="row">
                    등록자아이디
                  </th>
                  <td>{data.rgtrId}</td>
                  <th className="td-head" scope="row">
                    등록일자
                  </th>
                  <td>{getDateFormatYMD(data.regDt)}</td>
                  <th className="td-head" scope="row">
                    수정자아이디
                  </th>
                  <td>{data.mdfrId}</td>
                  <th className="td-head" scope="row">
                    수정일자
                  </th>
                  <td>{getDateFormatYMD(data.mdfcnDt)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </>
      </Grid>
    </Grid>
  )
}

export default BsDetailGrid
