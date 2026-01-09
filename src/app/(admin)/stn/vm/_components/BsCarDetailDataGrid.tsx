import React from 'react'
import { Grid, Button } from '@mui/material'
import BlankCard from '@/components/shared/BlankCard'
import { Row } from './BsPage'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import {
  formatDate,
  formatMinDate,
  formBrno,
} from '@/utils/fsms/common/convert'
import { rrNoFormatter } from '@/utils/fsms/common/util'

interface DetailDataType {
  vhclNo?: string // 차량번호
  locgov?: string // 관할관청
  vhclSeCd?: string // 면허업종
  vhclSttsNm?: string // 차량상태
  brno?: string // 차주사업자등록번호
  rprsvRrno?: string // 차주주민등록번호
  rprsvNm?: string // 차주명
  koiCd?: string // 유종
  tons?: string // 톤수
  rfidYn?: string // 소유구분
  bzmnSeNm?: string // 개인법인구분
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일자
  mdfrId?: string // 수정자아이디
  mdfcnDt?: string // 수정일자
}

interface DetailDataGridProps {
  data?: Row
  onClickCheckVehicleHistoryBtn: () => void // 차량이력보기 버튼 action
  onClickTransferLocalGovernmentBtn: () => void // 지자체이관 버튼 action
  onClickChangeKoiLicCountBtn: () => void // 유종/면허 변경 버튼 action
  onClickCarRestBtn: () => void // 차량휴지 버튼 action
  onClickStopPaymentBtn: () => void // 지급정지 버튼 action
  onClickVehicleCancellationBtn: () => void // 차량 말소  버튼 action
}

const CarDetailDataGrid: React.FC<DetailDataGridProps> = ({
  data,
  onClickCheckVehicleHistoryBtn,
  onClickTransferLocalGovernmentBtn,
  onClickChangeKoiLicCountBtn,
  onClickCarRestBtn,
  onClickStopPaymentBtn,
  onClickVehicleCancellationBtn,
}) => {
  return (
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
                    </td>
                    <th className="td-head" scope="row">
                      관할관청
                    </th>
                    <td>
                      {data?.ctpvNm} {data?.locgovNm}
                    </td>
                    <th className="td-head" scope="row">
                      면허업종
                    </th>
                    <td>{data?.vhclSeNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      수급자명
                    </th>
                    <td>{data?.rprsvNm}</td>
                    <th className="td-head" scope="row">
                      수급자주민등록번호
                    </th>
                    <td>
                      {rrNoFormatter(
                        data?.rprsvRrno !== undefined ? data?.rprsvRrno : '',
                      )}
                    </td>
                    <th className="td-head" scope="row">
                      개인법인구분
                    </th>
                    <td>{data?.bzmnSeNm}</td>
                    <th className="td-head" scope="row">
                      차량상태
                    </th>
                    <td>{data?.vhclSttsNm}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">
                      유종
                    </th>
                    <td>{data?.koiNm}</td>
                    <th className="td-head" scope="row">
                      RFID차량여부
                    </th>
                    <td colSpan={5}>{data?.rfidYn}</td>
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
                        onClick={onClickChangeKoiLicCountBtn}
                      >
                        유종/면허변경
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
                    <td>{formatDate(data?.regDt ?? '')}</td>
                    <th className="td-head" scope="row">
                      수정자아이디
                    </th>
                    <td>{data?.mdfrId}</td>
                    <th className="td-head" scope="row">
                      수정일자
                    </th>
                    <td>{formatDate(data?.mdfcnDt ?? '')}</td>
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

export default CarDetailDataGrid
