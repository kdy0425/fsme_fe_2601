import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'

import { Row } from './BsPage'
import {
  dateTimeFormatter,
  getDateTimeString,
  brNoFormatter,
  getCommaNumber,
  rrNoFormatter,
} from '@/utils/fsms/common/util'

import BsnesSignModifyModal from './BsnesSignModifyModal'
import { formatDate, formBrno } from '@/utils/fsms/common/convert'

interface DetailProps {
  data: Row
  reloadFunc?: () => void
}

const BsDetailGrid: React.FC<DetailProps> = ({ data, reloadFunc }) => {
  return (
    <>
      <BlankCard title="사업자정보">
        <Grid container spacing={2} className="card-container">
          <Grid item xs={12} sm={12} md={12}>
            <>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>상세 내용 시작</caption>

                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>{formBrno(data.brno)}</td>
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td>{rrNoFormatter(data?.crno ?? '')}</td>
                      <th className="td-head" scope="row">
                        업체명
                      </th>
                      <td>{data.bzentyNm}</td>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td>{data.rprsvNm}</td>
                    </tr>

                    <tr>
                      <th className="td-head" scope="row">
                        대표자주민등록번호
                      </th>
                      <td>
                        {rrNoFormatter(data?.rprsvRrno ?? '')}
                        {/* {getDateTimeString(data.rprsvRrno, 'date')?.dateString} */}
                      </td>
                      <th className="td-head" scope="row">
                        개인법인구분
                      </th>
                      <td>{data.bzmnSeNm}</td>
                      <th className="td-head" scope="row">
                        전화번호
                      </th>
                      <td>{data.telno}</td>
                      <th className="td-head" scope="row">
                        직인
                      </th>
                      <td>
                        {data.origFileNm}
                        <BsnesSignModifyModal
                          data={data as Row}
                          buttonLabel={'직인변경'}
                          reloadFunc={reloadFunc}
                          title={'직인 변경'}
                        />
                      </td>
                    </tr>

                    <tr>
                      <th className="td-head" scope="row">
                        주소
                      </th>
                      <td colSpan={7}>{data.addr}</td>
                    </tr>

                    <tr>
                      <th className="td-head" scope="row">
                        등록자아이디
                      </th>
                      <td>{data.rgtrId}</td>
                      <th className="td-head" scope="row">
                        등록일자
                      </th>
                      <td>{formatDate(data.regDt)}</td>
                      <th className="td-head" scope="row">
                        수정자아이디
                      </th>
                      <td>{data.mdfrId}</td>
                      <th className="td-head" scope="row">
                        수정일자
                      </th>
                      <td>{formatDate(data.regDt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          </Grid>
        </Grid>
      </BlankCard>
      <BlankCard title="보조금 입금계좌정보">
        <Grid container spacing={2} className="card-container">
          <Grid item xs={12} sm={12} md={12}>
            <>
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>상세 내용 시작</caption>
                  <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '50%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row" colSpan={1}>
                        예금주명
                      </th>
                      <td colSpan={1}>{data.giveBacntNm}</td>
                      <th className="td-head" scope="row" colSpan={1}>
                        금융기관
                      </th>
                      <td colSpan={1}>{data.bankNm}</td>
                      <th className="td-head" scope="row" colSpan={1}>
                        지급계좌번호
                      </th>
                      <td colSpan={3}>{data.giveActno}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          </Grid>
        </Grid>
      </BlankCard>
    </>
  )
}

export default BsDetailGrid
