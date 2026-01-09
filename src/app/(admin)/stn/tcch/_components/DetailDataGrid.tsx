import BlankCard from '@/app/components/shared/BlankCard'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm'
import { CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Button, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { once } from 'events'
import { brNoFormatter, getDateTimeString } from '@/utils/fsms/common/util'
import { Row } from '../page'
import { formatPhoneNumber } from '@/utils/fsms/common/convert'

type DetailDataGridProps = {
  detail: Row
}



const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail  } = props




  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '12px',
            }}
          >
            
          </div>
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <tbody>


                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      처리상태
                    </th>
                    <td>{detail?.prcsSttsCdNm ?? ''}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      차량번호
                    </th>
                    <td>{detail?.vhclNo}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      소유자명
                    </th>
                    <td>{detail?.vonrNm}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      사업자등록번호
                    </th>
                    <td>{brNoFormatter( detail?.vonrBrno)}</td>
                  </tr>


                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      관할관청
                    </th>
                    <td>{detail?.locgovNm}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      연락처
                    </th>
                    <td>{formatPhoneNumber(detail?.mbtlnum)}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      톤수
                    </th>
                    <td>{detail?.vhclTonNm}</td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      차량형태
                    </th>
                    <td>{detail?.carSts}</td>
                  </tr>



                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      차명
                    </th>
                    <td colSpan={3}>
                      {detail?.vhclNm}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      요청일자
                    </th>
                    <td>
                      {getDateTimeString(detail?.dmndYmd, "date")?.dateString}
                    </td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>
                      {getDateTimeString(detail?.prcsYmd, "date")?.dateString}
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      탱크용량변경일자
                    </th>
                    <td>
                      {getDateTimeString(detail?.crtrYmd, "date")?.dateString}  
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      변경전 탱크용량(ℓ)
                    </th>
                    <td style={{textAlign:"right"}}>
                      {Number(detail?.bfchgTnkCpcty).toLocaleString(undefined, {
                            // minimumFractionDigits: 2,
                            // maximumFractionDigits: 2,
                          })}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      변경후 탱크용량(ℓ)
                    </th>
                    <td style={{textAlign:"right"}}>
                      {Number(detail?.tnkCpcty).toLocaleString(undefined, {
                            // minimumFractionDigits: 2,
                            // maximumFractionDigits: 2,
                          })}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}></th>
                    <td />
                  </tr>


                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      탱크용량변경사유
                    </th>
                    <td colSpan={3}>
                      {detail?.tankRsnNm}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      비고
                    </th>
                    <td colSpan={3}>
                    {detail?.rmrkCn}
                    </td>
                  </tr>


                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      탈락유형
                    </th>
                    <td colSpan={3}>
                    {detail?.rejectNm}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      탈락사유
                    </th>
                    <td colSpan={4}>
                    {detail?.flRsnCn}
                    </td>
                  </tr>


                  <tr>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      등록자아이디
                    </th>
                    <td>
                      {detail?.rgtrId}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      등록일자
                    </th>
                    <td>
                    {getDateTimeString(detail?.regDt, "date")?.dateString}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      수정자아이디
                    </th>
                    <td>
                      {detail?.mdfrId}
                    </td>
                    <th className="td-head" scope="row" style={{whiteSpace:'nowrap'}}>
                      수정일자
                    </th>
                    <td>
                      {getDateTimeString(detail?.mdfcnDt, "date")?.dateString}
                    </td>
                  </tr>


                </tbody>
              </table>
            </div>
          </>
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
