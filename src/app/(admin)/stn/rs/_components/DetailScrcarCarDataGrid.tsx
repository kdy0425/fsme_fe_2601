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

interface DetailScrcarCarDataGrid {
  row?: Row
}

const DetailScrcarCarDataGrid: React.FC<DetailScrcarCarDataGrid> = ({ row }) => {

  if (!row) return null; // row가 없을 때 null 반환

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="폐차정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '18%' }} />
                </colgroup>
                <tbody>
                <tr>
                    <th className="td-head" scope="row">
                      차명
                    </th>
                    <td>{row?.scrcarVhclNm ??''}</td>
                    <th className="td-head" scope="row">
                      차종
                    </th>
                    <td>{row?.scrcarCarmdlCdNm ?? ''}</td>
                    <th className="td-head" scope="row">
                      유형(구분)
                    </th>
                    <td>
                      {row?.scrcarTypeCdNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                    세부유형
                    </th>
                    <td>{row?.scrcarDetailTypeCdNm ?? ''}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차대번호 
                    </th>
                    <td>{row?.scrcarVin ?? ''}</td>
                    <th className="td-head" scope="row">
                      연식
                    </th>
                    <td>
                      {formatDate(row?.scrcarYridnw) ?? ''}
                    </td>
                    <th className="td-head" scope="row" >
                      최대적재량
                    </th>
                    <td style={{textAlign:"right"}}>
                      {getNumtoWon(row?.scrcarMaxLoadQty) ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      총중량
                    </th>
                    <td style={{textAlign:"right"}}>
                      {getNumtoWon(row?.scrcarScrcarTotlWt) ?? ''}
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

export default DetailScrcarCarDataGrid
