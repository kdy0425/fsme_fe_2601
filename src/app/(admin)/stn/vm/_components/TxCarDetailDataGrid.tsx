import React, { memo, useState } from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './TxPage'
import { formatMinDate } from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import TxVehHisSearchModal from './TxVehHisSearchModal'
import TxBeneInfoModal from './TxBeneInfoModal'
import TxSubHisModal from './TxSubHisModal'
import ModalCaldendar from './TxModalCalendar'
import { useRouter } from 'next/navigation'
import TxSalesInfoModal from './TxSalesInfoModal'

interface DetailDataGridProps {
  data: Row
}

const CarDetailDataGrid = (props:DetailDataGridProps) => {

  const { data } = props;

  const router = useRouter();

  //각종 모달 닫기 열기 버튼
  const [vehHisOpen, setVehHisOpen] = useState(false)
  const [beneInfoOpen, setBeneInfoOpen] = useState(false)
  const [subModiOpen, setSubModiOpen] = useState(false)
  const [subCalOpen, setSubCalOpen] = useState(false)
  const [salesModalOpen, setSalesModalOpen] = useState<boolean>(false);

  // 화면 경로로 이동
  const handleCartPubClick = (url: string) => {
    router.push(url)
  }

  return (
    <>
      <Grid container spacing={2} className="card-container">
        <Grid item xs={12} sm={12} md={12}>
          <BlankCard className="contents-card" title="차량정보 (할인)">
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
                      <td>{data?.vhclNo}</td>
                      <th className="td-head" scope="row">
                        차량상태
                      </th>
                      <td>{data?.cmSttsNm}</td>
                      <td scope="row" colSpan={4}>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setVehHisOpen(true)}
                        >
                          차량이력보기
                        </Button>
                        {/*
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setSalesModalOpen(true)}
                        >
                          운행정보시스템 보기
                        </Button>
                        */}
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        수급자명
                      </th>
                      <td>{data?.rprsvNm}</td>
                      <th className="td-head" scope="row">
                        수급자<br/>주민등록번호
                      </th>
                      <td>{rrNoFormatter(data?.rprsvRrnoS ?? '')}</td>
                      <td scope="row" colSpan={4}>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setBeneInfoOpen(true)}
                        >
                          수급자정보보기
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        유종
                      </th>
                      <td>{data?.koiNm}</td>
                      <th className="td-head" scope="row">
                        부제여부
                      </th>
                      <td>{data?.dayoffYn}</td>
                      <td scope="row" colSpan={4}>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setSubModiOpen(true)}
                        >
                          부제이력보기
                        </Button>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => setSubCalOpen(true)}
                        >
                          부제캘린더
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        바로가기
                      </th>
                      <td colSpan={7}>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => handleCartPubClick('/stn/ltmm')}
                        >
                          지자체이관
                        </Button>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => handleCartPubClick('/stn/vpm')}
                        >
                          차량휴지
                        </Button>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => handleCartPubClick('/mng/sspc')}
                        >
                          지급정지
                        </Button>
                        <Button
                          variant="contained"
                          color="dark"
                          style={{ marginLeft: '8px' }}
                          onClick={() => handleCartPubClick('/stn/vem')}
                        >
                          차량말소
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        등록자아이디
                      </th>
                      <td>{data?.rgtrId}</td>
                      <th className="td-head" scope="row">
                        등록일자
                      </th>
                      <td>{formatMinDate(data?.regDt ?? '')}</td>
                      <th className="td-head" scope="row">
                        수정자아이디
                      </th>
                      <td>{data?.mdfrId}</td>
                      <th className="td-head" scope="row">
                        수정일자
                      </th>
                      <td>{formatMinDate(data?.mdfcnDt ?? '')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 테이블영역 끝 */}
            </>
          </BlankCard>
        </Grid>
      </Grid>

      <>
        {vehHisOpen && (
          <TxVehHisSearchModal
            title="차량정보 변경이력"
            onCloseClick={() => setVehHisOpen(false)}
            data={data}
            url="/fsm/stn/vm/tx/getAllVhcleMngHisTx"
            open={vehHisOpen}
          />
        )}
      </>

      <>
        {beneInfoOpen && (
          <TxBeneInfoModal
            title="수급자정보"
            onCloseClick={() => setBeneInfoOpen(false)}
            data={data}
            url="/fsm/stn/vm/tx/getVhcleFlnmMngTx"
            open={beneInfoOpen}
          />
        )}
      </>

      <>
        {subModiOpen && (
          <TxSubHisModal
            title="부제 변경이력"
            onCloseClick={() => setSubModiOpen(false)}
            data={data}
            url="/fsm/stn/vm/tx/getDayoffHisTx"
            open={subModiOpen}
          />
        )}
      </>

      <>
        {subCalOpen && (
          <ModalCaldendar
            title={'부제 캘린더'}
            buttonLabel={'부제 캘린더'}
            data={data}
            url="/fsm/stn/vm/tx/getDayoffHisTx"
            onCloseClick={() => setSubCalOpen(false)}
            open={subCalOpen}
          />
        )}
      </>

      <>
        {salesModalOpen && (
          <TxSalesInfoModal
            vhclNo={data.vhclNo}
            open={salesModalOpen}
            setOpen={setSalesModalOpen}
          />
        )}
      </>
    </>
  )
}

export default memo(CarDetailDataGrid)