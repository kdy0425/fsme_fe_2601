import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import {Row} from './TrPage'
import { formatPhoneNumber } from '@/utils/fsms/common/convert'
import {
  rrNoFormatter
} from '@/utils/fsms/common/util'

interface DetailProps {
  data: Row
  onClickUsedModify: () => void 
}

const BrnoDetailDataGrid: React.FC<DetailProps> = ({ data,onClickUsedModify }) => {
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={15} sm={15} md={15}>
        <BlankCard className="contents-card" title="사업자정보">
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '10%' }} />  
                <col style={{ width: '20%' }} />  
                <col style={{ width: '10%' }} />   
                <col style={{ width: '20%' }} />   
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      법인등록번호                       
                    </th>
                    <td>{rrNoFormatter(data?.crnoS ?? '') }
                    <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickUsedModify}
                      >
                        지입사변경
                      </Button>
                    </td>
                    <th className="td-head" scope="row">
                      업체명
                    </th>
                    <td>
                      {data?.bzentyNm }
                    </td>
                    <th className="td-head" scope="row">
                      대표자명
                    </th>
                    <td>{data?.rprsvNm }</td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      전화번호
                    </th>
                    <td>{formatPhoneNumber( data?.carTelno)}</td>
                    <th className="td-head" scope="row">
                      주소
                    </th>
                    <td colSpan={3}>
                      {data?.zip}
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

export default BrnoDetailDataGrid
