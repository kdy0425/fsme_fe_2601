import React, { useState } from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './TrPage'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { formBrno } from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'
import ShowRrnoModal from '@/app/components/popup/ShowRrnoModal'
import { toQueryParameter } from '@/utils/fsms/utils'
interface DetailDataType {
  vhclNo?: string // 차량번호
  locgov?: string // 관할관청
  vhclSeCd?: string // 면허업종

  brno?: string // 차주사업자등록번호
  rprsvRrno?: string // 차주주민등록번호
  rprsvNm?: string // 차주명
  koiCd?: string // 유종
  tons?: string // 톤수
  rfidYn?: string // 소유구분

  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
}

interface DetailDataGridProps {
  data?: Row
  onClickCheckVehicleHistoryBtn: () => void // 차량이력보기 버튼 action
  onClickChangeBrnoBtn: () => void // 차주사업자변경 버튼 action
  onClickChangeCarBtn: () => void // 차량정보 변경 버튼 action
  onClickCarHisBtn: () => void
  onClickTransferLocalGovernmentBtn: () => void // 지자체이관 버튼 action
  onClickChangeKoiTonCountBtn: () => void // 유종/톤수 변경 버튼 action
  onClickCarRestBtn: () => void // 차량휴지 버튼 action
  onClickStopPaymentBtn: () => void // 지급정지 버튼 action
  onClickVehicleCancellationBtn: () => void // 지급정지 버튼 action
}

const CarDetailDataGrid: React.FC<DetailDataGridProps> = ({
  data,
  onClickCheckVehicleHistoryBtn,
  onClickChangeBrnoBtn,
  onClickChangeCarBtn,
  onClickCarHisBtn,
  onClickTransferLocalGovernmentBtn,
  onClickChangeKoiTonCountBtn,
  onClickCarRestBtn,
  onClickStopPaymentBtn,
  onClickVehicleCancellationBtn,
}) => {
  // 주민번호보기 모달
  const [rrnoModalOpen, setRrnoModalOpen] = useState<boolean>(false);

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard
          className="contents-card"
          title={'화물차량정보 ( ' + data?.dscntYnNm + ' )'}
        >
          <>
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>상세 내용 시작</caption>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      차량번호
                    </th>
                    <td colSpan={3}>
                      {data?.vhclNo}
                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickCheckVehicleHistoryBtn}
                      >
                        차량이력보기
                      </Button>
                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickChangeCarBtn}
                      >
                        차량정보변경
                      </Button>
                    </td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>{data?.locgovNm}</td>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>{data?.lcnsTpbizNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차주사업자등록번호
                    </th>
                    <td colSpan={3}>
                      {formBrno(data?.vonrBrno)}

                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickChangeBrnoBtn}
                      >
                        차주사업자변경
                      </Button>
                    </td>
                    <th className="td-head" scope="row">
                      차주주민등록번호
                    </th>
                    <td colSpan={3}>
                      <Button
                        variant="outlined"
                        style={{ marginLeft: '6px' }}
                        onClick={() => setRrnoModalOpen(true)}
                      >
                        {rrNoFormatter(data?.vonrRrnoSecure ?? '')}
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      차주성명
                    </th>
                    <td>{data?.vonrNm}</td>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{data?.koiNm}</td>
                    <th className="td-head" scope="row">
                      톤수
                    </th>
                    <td>{data?.vhclTonNm}</td>
                    <th className="td-head" scope="row">
                      소유구분
                    </th>
                    <td>{data?.vhclPsnNm}</td>
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
                        onClick={onClickTransferLocalGovernmentBtn}
                      >
                        지자체이관
                      </Button>
                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickChangeKoiTonCountBtn}
                      >
                        유종/톤수변경
                      </Button>
                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickCarRestBtn}
                      >
                        차량휴지
                      </Button>
                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickStopPaymentBtn}
                      >
                        지급정지
                      </Button>
                      <Button
                        variant="contained"
                        color="dark"
                        style={{ marginLeft: '8px' }}
                        onClick={onClickVehicleCancellationBtn}
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
                    <td>{getDateFormatYMD(data?.regDt ?? '')}</td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>{data?.mdfrId}</td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>{getDateFormatYMD(data?.mdfcnDt ?? '')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
      </Grid>
      {/* 주민번호보기 모달 */}
      {rrnoModalOpen ? (
        <ShowRrnoModal
          open={rrnoModalOpen}
          setOpen={setRrnoModalOpen}
          procData={{
            rrno: data?.vonrRrnoS ?? '',
            paramtrInfoCn: toQueryParameter({ vhclNo:data?.vhclNo }).replace('?',''),
            defaultValue: '6'
          }}
        />
      ) : null}
    </Grid>
  )
}

export default CarDetailDataGrid
