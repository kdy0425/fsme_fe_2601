import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from '../page'
import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint
} from '@/utils/fsms/common/convert'
import {
  rrNoFormatter
  , phoneNoFormatter
  , brNoFormatter
} from '@/utils/fsms/common/util'



interface DetailReportDataGrid {
  row?: Row
}

const DetailReportDataGrid: React.FC<DetailReportDataGrid> = ({ row }) => {

  if (!row) return null; // row가 없을 때 null 반환

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="신고정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                    성명(법인명 및 대표자명)
                    </th>
                    <td>
                      {row?.flnm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                    생년월일(법인등록번호)
                    </th>
                    <td>
                      {rrNoFormatter(row?.crnoS ?? '')}
                    </td>
                    <th className="td-head" scope="row">
                    연락처
                    </th>
                    <td>
                      {phoneNoFormatter(row?.telno ?? '')}
                    </td>
                    <th className="td-head" scope="row">
                    차량번호
                    </th>
                    <td>
                      {row?.vhclNo ?? ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    주소
                    </th>
                    <td colSpan={7}>
                      {row?.partAddr ?? ''}
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                    대폐차기간
                    </th>
                    <td>
                      {formatDate(row?.scrapPeriodYmd) ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                    사업종류
                    </th>
                    <td >
                      {row?.bizKndCdNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                    사업자등록번호
                    </th>
                    <td>
                      {brNoFormatter(row?.vonrBrno ?? '')}
                    </td>
                    <th className="td-head" scope="row">
                    위수탁성명
                    </th>
                    <td>
                      {row?.cosiNm ?? ''}
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

export default DetailReportDataGrid
