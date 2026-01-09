/* React */
import React, { memo } from 'react'

/* mui component */
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

/* 공통 component */
import BlankCard from '@/app/components/shared/BlankCard'

/* 공통 js */
import { formatDate } from '@/utils/fsms/common/convert'
import {
  brNoFormatter,
  getCommaNumber,
  rrNoFormatter,
} from '@/utils/fsms/common/util'

/* 부모페이지에서 선언한 interface */
import { Row } from './TxPage'

/* interface 선언 */
interface DetailDataGridProps {
  selectedRow: Row
}

const TxDetailDataGrid = (props: DetailDataGridProps) => {
  const { selectedRow } = props

  return (
    <BlankCard className="contents-card" title="상세 정보">
      <TableContainer>
        <Table className="table table-bordered">
          <caption>상세 정보 테이블</caption>
          <colgroup>
            <col style={{ width: '13%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <TableBody>
            <TableRow>
              <TableCell className="td-head" scope="row">
                차량번호
              </TableCell>
              <TableCell>{selectedRow.vhclNo}</TableCell>
              <TableCell className="td-head" scope="row">
                당시 유종
              </TableCell>
              <TableCell>{selectedRow.ttmKoiNm}</TableCell>
              <TableCell className="td-head" scope="row">
                법인/개인
              </TableCell>
              <TableCell>{selectedRow.bzmnSeNm}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head" scope="row">
                성명
              </TableCell>
              <TableCell>{selectedRow.vonrNm}</TableCell>
              <TableCell className="td-head" scope="row">
                주민등록번호
              </TableCell>
              <TableCell>{rrNoFormatter(selectedRow.vonrRrnoS)}</TableCell>
              <TableCell className="td-head" scope="row">
                사업자등록번호
              </TableCell>
              <TableCell>{brNoFormatter(selectedRow.brno)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head" scope="row">
                부정수급 거래 기간
              </TableCell>
              <TableCell>
                {selectedRow.bgngYmd && selectedRow.endYmd ? (
                  <>
                    {`${formatDate(selectedRow.bgngYmd)} ~ ${formatDate(selectedRow.endYmd)}`}
                  </>
                ) : null}
              </TableCell>
              <TableCell className="td-head" scope="row">
                부정수급유형
              </TableCell>
              <TableCell>{selectedRow.instcSpldmdTypeNm}</TableCell>
              <TableCell className="td-head" scope="row">
                부정수급유형 기타 사유
              </TableCell>
              <TableCell>{selectedRow.instcSpldmdRsnCn}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head" scope="row">
                거래건수
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.dlngNocs))}
              </TableCell>
              <TableCell className="td-head" scope="row">
                거래금액
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.totlAprvAmt))}
              </TableCell>
              <TableCell className="td-head" scope="row">
                유가보조금
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.totlAsstAmt))}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head" scope="row">
                부정수급건수
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.rdmTrgtNocs))}
              </TableCell>
              <TableCell className="td-head" scope="row">
                부정수급액
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.instcSpldmdAmt))}
              </TableCell>
              <TableCell className="td-head" scope="row">
                실제운행게시일
              </TableCell>
              <TableCell>
                <Box color="#f44336">
                  {formatDate(selectedRow.vhclRestrtYmd)}
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="td-head" scope="row">
                환수한일자
              </TableCell>
              <TableCell className="td-right">
                {formatDate(selectedRow.rdmDt)}
              </TableCell>
              <TableCell className="td-head" scope="row">
                환수할금액
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.rdmActnAmt))}
              </TableCell>
              <TableCell className="td-head" scope="row">
                환수한금액
              </TableCell>
              <TableCell className="td-right">
                {getCommaNumber(Number(selectedRow.rlRdmAmt))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </BlankCard>
  )
}

export default memo(TxDetailDataGrid)
