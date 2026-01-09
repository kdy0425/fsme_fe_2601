import React, { useContext, useEffect, useState } from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './FreightPage'
import {
  getLabelFromCode,
  getNumtoWon,
  formatDate,
  formatKorYearMonth,
  formBrno,
  getNumtoWonAndDecimalPoint
  
} from '@/utils/fsms/common/convert'
import { HeadCell, Pageable, Pageable2 } from 'table'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import {
  rrNoFormatter
} from '@/utils/fsms/common/util'


// Detail Props 
interface DetailDataGridProps {
  data?: Row
}


const DetailDataGrid: React.FC<DetailDataGridProps> = ({
  data,
}) => {


  if(data  === undefined)
    return null;


  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>


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
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td>{data?.vhclNo ?? ''}</td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>
                      {data?.carLocgovNm?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>{data?.vonrNm ?? ''}</td>
                    <th className="td-head" scope="row">
                      주민등록번호
                    </th>
                    <td>{rrNoFormatter(data?.vonrRrnoSecure ?? '')}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      사업자등록번호
                    </th>
                    <td>{formBrno(data?.vonrBrno) ?? ''}</td>
                    <th className="td-head" scope="row">
                      차량소유구분
                    </th>
                    <td>{data?.vhclPsnNm ?? ''}</td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{data?.koiNm ?? ''}</td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>{data?.vhclTonNm ?? ''}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>
                      {data?.lcnsTpbizNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      차량최종상태
                    </th>
                    <td>
                      {data?.vhclSttsNm ?? ''}
                    </td>
                    <th className="td-head" scope="row"></th>
                    <td />
                    <th className="td-head" scope="row"></th>
                    <td />
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      요청일자
                    </th>
                    <td>
                      {formatDate(data?.regDt) ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      전출관청
                    </th>
                    <td>
                      {data?.exsLocgovNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      전입관청
                    </th>
                    <td>
                      {data?.chgLocgovNm ?? ''}
                    </td>
                    <th className="td-head" scope="row"></th>
                    <td />
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      처리상태
                    </th>
                    <td>
                      {data?.prcsSttsCdNm ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      처리일자
                    </th>
                    <td>
                      {formatDate(data?.handleDt) ?? '' }
                    </td>
                    <th className="td-head" scope="row">
                      거절사유
                    </th>
                    <td>
                      {data?.rfslRsnCn ?? ''}
                    </td>
                    <th className="td-head" scope="row"></th>
                    <td />
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      등록자아이디
                    </th>
                    <td>
                      {data?.rgtrId ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      등록일자
                    </th>
                    <td>
                      {formatDate(data?.regDt) ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>
                      {data?.mdfrId ?? ''}
                    </td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>
                      {formatDate(data?.mdfcnDt) ?? ''}
                    </td>
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
