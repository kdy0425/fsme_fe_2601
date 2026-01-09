import { Row } from './page'
import { Grid } from '@mui/material'
import BlankCard from '@/app/components/shared/BlankCard'
import { rrNoFormatter, formatDay, brNoFormatter } from '@/utils/fsms/common/util'

interface BsDetailProps {
  data: Row
  reload: () => void
}

const BsDetail = (props: BsDetailProps) => {
  const { data, reload } = props

  return (
    <>
      <Grid item xs={4} sm={4} md={4}>
        <Grid container spacing={2} className="card-container">
          <Grid item xs={12} sm={12} md={12}>
            <BlankCard className="contents-card" title="심사상세정보">
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>심사상세정보</caption>
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
                        지자체명
                      </th>
                      <td>
                        {data.locgovNm}
                      </td>
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>{brNoFormatter(data.brno)}</td>
                      <th className="td-head" scope="row">
                        업체명
                      </th>
                      <td>{data.bzentyNm}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td>{data.rprsvNm}</td>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>{data.koiNm}</td>
                      <th className="td-head" scope="row">
                        주유형태
                      </th>
                      <td>{data.lbrctStleNm}</td>
                      <th className="td-head" scope="row">
                        면허업종
                      </th>
                      <td>
                        {data.vhclSeNm}
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        차량상태
                      </th>
                      <td>{data.preVhclSttsNm}</td>
                      <th className="td-head" scope="row">
                        할인
                      </th>
                      <td colSpan={5}>
                        {data.preDscntYn === 'Y' ? '할인' : '미할인'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </BlankCard>
          </Grid>
        </Grid>
        <Grid container spacing={2} className="card-container">
          <Grid item xs={12} sm={12} md={12}>
            <BlankCard className="contents-card" title="자동차망 연계정보">
              {/* 테이블영역 시작 */}
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>자동차망 연계정보</caption>
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
                        차량정보
                      </th>
                      <td>{data.netVhclNo}</td>
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td>{rrNoFormatter(data.netReowUserNo)}</td>
                      <th className="td-head" scope="row">
                        성명(업체명)
                      </th>
                      <td>{data.netReowNm}</td>
                      <th className="td-head" scope="row">
                        지자체명
                      </th>
                      <td>{data.netLocgovNm}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>{data.netKoiNm}</td>
                      <th className="td-head" scope="row">
                        면허업종
                      </th>
                      <td>{data.netUsgDtlSeNm}</td>
                      <th className="td-head" scope="row">
                        폐차여부
                      </th>
                      <td>{data.netScrapNm}</td>
                      <th className="td-head" scope="row">
                        최종변경일
                      </th>
                      <td>{formatDay(data.netLastUpdate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </BlankCard>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default BsDetail
