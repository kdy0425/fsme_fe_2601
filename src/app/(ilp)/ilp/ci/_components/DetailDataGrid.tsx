import { memo } from 'react'
import { DetailRow } from '../page'
import { Grid } from '@mui/material'
import BlankCard from '@/app/components/shared/BlankCard'
import { formatDate } from '@/utils/fsms/common/convert'
import { brNoFormatter, cardNoFormatter } from '@/utils/fsms/common/util'

interface DetailDataGridProps {
  detail: DetailRow
  tabIndex: string
}

const DetailDataGrid = (props: DetailDataGridProps) => {
  const { detail, tabIndex } = props

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="카드정보상세">
          {/* 테이블영역 시작 */}
          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>상세 내용 시작</caption>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <tbody>
                {tabIndex == '0' ? (
                  <>
                    <tr>
                      <th className="td-head" scope="row">
                        차량정보
                      </th>
                      <td>{detail.vhclNo}</td>
                      <th className="td-head" scope="row">
                        소유자명
                      </th>
                      <td colSpan={3}>{detail.vonrNm}</td>
                      <th className="td-head" scope="row">
                        차주사업자등록번호
                      </th>
                      <td>{brNoFormatter(detail.carBid)}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        카드번호
                      </th>
                      <td colSpan={1}>{cardNoFormatter(detail.cardNoSe)}</td>
                      <th className="td-head" scope="row">
                        변경사유
                      </th>
                      <td colSpan={3}>{detail.chgRsnCn}</td>
                      <th className="td-head" scope="row">
                        카드사업자등록번호
                      </th>
                      <td>{brNoFormatter(detail.cardBid)}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        등록자아이디
                      </th>
                      <td>{detail.rgtrId}</td>
                      <th className="td-head" scope="row">
                        등록일자
                      </th>
                      <td>{formatDate(detail.regDt)}</td>
                      <th className="td-head" scope="row">
                        수정자아이디
                      </th>
                      <td>{detail.mdfrId}</td>
                      <th className="td-head" scope="row">
                        수정일자
                      </th>
                      <td>{formatDate(detail.mdfcnDt)}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <th className="td-head" scope="row">
                        차량정보
                      </th>
                      <td>{detail.vhclNo}</td>
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>{brNoFormatter(detail.brno)}</td>
                      {tabIndex == '1' ? (
                        <>
                          <th className="td-head" scope="row">
                            고객구분
                          </th>
                          <td>{detail.custSeNm}</td>
                          <th className="td-head" scope="row">
                            소유자명
                          </th>
                          <td>{detail.flnm}</td>
                        </>
                      ) : (
                        <>
                          <th className="td-head" scope="row">
                            소유자명
                          </th>
                          <td>{detail.flnm}</td>
                          <th className="td-head" scope="row">
                            관할관청
                          </th>
                          <td>{detail.locgovNm}</td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        카드사명
                      </th>
                      <td>{detail.crdcoNm}</td>
                      <th className="td-head" scope="row">
                        카드구분
                      </th>
                      <td>
                        {tabIndex == '2'
                          ? detail.crdtCeckSeNm
                          : detail.cardSeNm}
                      </td>
                      {tabIndex == '1' ? (
                        <>
                          <th className="td-head" scope="row">
                            카드상태
                          </th>
                          <td>{detail.crdcoSttsNm}</td>
                          <th className="td-head" scope="row">
                            카드번호
                          </th>
                          <td>{cardNoFormatter(detail.cardNoS)}</td>
                        </>
                      ) : (
                        <>
                          <th className="td-head" scope="row">
                            카드상태
                          </th>
                          <td>{detail.cardSttsNm}</td>
                          <th className="td-head" scope="row">
                            카드번호
                          </th>
                          <td>{cardNoFormatter(detail.cardNoS)}</td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        접수일자
                      </th>
                      <td>{formatDate(detail.rcptYmd)}</td>
                      {tabIndex == '1' ? (
                        <>
                          <th className="td-head" scope="row">
                            차량할인여부
                          </th>
                          <td>{detail.dscntNm}</td>
                          <th className="td-head" scope="row">
                            대리운전시작일
                          </th>
                          <td>{formatDate(detail.agncyDrvBgngYmd)}</td>
                          <th className="td-head" scope="row">
                            대리운전종료일
                          </th>
                          <td>{formatDate(detail.agncyDrvEndYmd)}</td>
                        </>
                      ) : (
                        <>
                          <th className="td-head" scope="row">
                            유종
                          </th>
                          <td>{detail.koiNm}</td>
                          <th className="td-head" scope="row">
                            발급구분
                          </th>
                          <td>{detail.issuSeNm}</td>
                          <th className="td-head" scope="row">
                            결제카드번호
                          </th>
                          <td>
                            {tabIndex == '2'
                              ? cardNoFormatter(detail.stlmCardNo)
                              : cardNoFormatter(detail.stlmCardNoVe)}
                          </td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        등록자아이디
                      </th>
                      <td>{detail.rgtrId}</td>
                      <th className="td-head" scope="row">
                        등록일자
                      </th>
                      <td>{formatDate(detail.regDt)}</td>
                      <th className="td-head" scope="row">
                        수정자아이디
                      </th>
                      <td>{detail.mdfrId}</td>
                      <th className="td-head" scope="row">
                        수정일자
                      </th>
                      <td>{formatDate(detail.mdfcnDt)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          {/* 테이블영역 끝 */}
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default memo(DetailDataGrid)
