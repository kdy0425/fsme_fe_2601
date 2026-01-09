/* React */
import { memo, useState } from 'react'

/* mui component */
import { Grid, Button } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'
import { getDateTimeString, brNoFormatter } from '@/utils/fsms/common/util'
import {
  cardNoFormatter,
  rrNoFormatter,
  formatDay,
} from '@/utils/fsms/common/util'
import BsChgVhclSeModal from './BsChgVhclSeModal'
import BsChgLocgovModal from './BsChgLocgovModal'
import BsVhclStopSearchModal from './BsVhclStopSearchModal'
import { Row } from './BsIfCardReqComponent'

/* 주민번호보기 모달 */
import ShowRrnoModal from '@/app/components/popup/ShowRrnoModal'
import { toQueryParameter } from '@/utils/fsms/utils'

interface propsInterface {
  data: Row
  reload: () => void
}

const DetailComponent = (props: propsInterface) => {
  const { data, reload } = props
  const [locgovOpen, setLocgovOpen] = useState<boolean>(false)
  const [vhclSeOpen, setVhclSeOpen] = useState<boolean>(false)
  const [vhclStopOpen, setVhclStopOpen] = useState<boolean>(false)
  const [detailOpen, setDetailOpen] = useState<boolean>(false)  
  const [rrnoModalOpen, setRrnoModalOpen] = useState<boolean>(false); // 주민번호보기 모달

  return (
    <>
      <Grid item xs={4} sm={4} md={4}>
        <Grid container spacing={2} className="card-container">
          <Grid item xs={12} sm={12} md={12}>
            <BlankCard className="contents-card" title="발급심사 상세정보">
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
                        업체명
                      </th>
                      <td>{data.bzentyNm}</td>
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>{brNoFormatter(data.brno)}</td>
                      <th className="td-head" scope="row">
                        법인등록번호
                      </th>
                      <td>{rrNoFormatter(data.crno)}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        대표자명
                      </th>
                      <td>{data.rprsvNm}</td>
                      <th className="td-head" scope="row">
                        대표자주민등록번호
                      </th>
                        <td>
                          <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => setRrnoModalOpen(true)}
                          >
                            {rrNoFormatter(data.rrnoS)}
                          </Button>                        
                        </td>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>{data.koiCdNm}</td>
                      <th className="td-head" scope="row">
                        주유형태
                      </th>
                      <td>{data.lbrctStleNm}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        지자체명
                      </th>
                      <td colSpan={2}>
                        {data.locgovNm}
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setLocgovOpen(true)}
                          disabled={
                            data.crdtCeckSeCd === '3' ||
                            data.crdtCeckSeCd === '4' ||
                            data.crdtCeckSeCd === '5'
                              ? true
                              : false
                          }
                        >
                          지자체변경
                        </Button>
                      </td>
                      <th className="td-head" scope="row">
                        면허업종
                      </th>
                      <td colSpan={2}>
                        {data.vhclSeCdNm}
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setVhclSeOpen(true)}
                          disabled={
                            data.crdtCeckSeCd === '3' ||
                            data.crdtCeckSeCd === '4' ||
                            data.crdtCeckSeCd === '5'
                              ? true
                              : false
                          }
                        >
                          면허업종변경
                        </Button>
                      </td>
                      <th className="td-head" scope="row">
                        발급구분
                      </th>
                      <td>{data.issuSeNm}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        카드사
                      </th>
                      <td>{data.crdcoNm}</td>
                      <th className="td-head" scope="row">
                        카드구분
                      </th>
                      <td>{data.crdtCeckSeCdNm}</td>
                      <th className="td-head" scope="row">
                        카드번호
                      </th>
                      <td colSpan={3}>{cardNoFormatter(data.cardNoS)}</td>
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
                      <td>{rrNoFormatter(data.netNo)}</td>
                      <th className="td-head" scope="row">
                        성명(업체명)
                      </th>
                      <td>{data.netFlnm}</td>
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
      <BsChgLocgovModal
        open={locgovOpen}
        data={data}
        handleClickClose={() => setLocgovOpen(false)}
        reload={() => reload()}
      />
      <BsChgVhclSeModal
        open={vhclSeOpen}
        data={data}
        handleClickClose={() => setVhclSeOpen(false)}
        reload={() => reload()}
      />

      {/* 주민번호보기 모달 */}
      {rrnoModalOpen ? (
        <ShowRrnoModal
          open={rrnoModalOpen}
          setOpen={setRrnoModalOpen}
          procData={{
            rrno: data.rrno,
            paramtrInfoCn: toQueryParameter({ vhclNo:data.vhclNo, brno:data.brno, crdcoCd:data.crdcoCd, rcptSeqNo:data.rcptSn }).replace('?',''),
            defaultValue: '1'
          }}
        />
      ) : null}
    </>
  )
}

export default memo(DetailComponent)
