import BlankCard from '@/app/components/shared/BlankCard'
import { Button, Grid } from '@mui/material'
import React, { useState } from 'react'
import { formatDate, getNumtoWon } from '@/utils/fsms/common/convert'
import { Row } from '../page'
import FormDialog from '@/app/components/popup/FormDialog'
import RedempListModalForm from './RedempListModalContent'
import StopModalContent from './StopModalContent'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'


interface DetailDataGridProps {
  row: Row
  tabIndex: string
  reload: () => void
}

const DetailDataGrid: React.FC<DetailDataGridProps> = ({
  row,
  tabIndex,
  reload
}) => {
  
  const [detailOpen, setDetailOpen] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const handleClickClose = () => {
    setOpen(false)
  }
  
  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12}>
        <BlankCard className="contents-card" title="상세 정보">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <Button variant="outlined" onClick={() => setDetailOpen(true)}>
              환수금 차감내역
            </Button>
            &nbsp;&nbsp;
            {row?.regSttsCd === '0' ? (
              <Button variant="outlined" onClick={() => setOpen(true)}>
                차감중지
              </Button>
            ) : null}
          </div>
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
                    <th className="td-head" scope="row">차량번호</th>
                    <td>{row?.vhclNo}</td>
                    <th className="td-head" scope="row">소유자명</th>
                    <td>{row?.vonrNm}</td>
                    <th className="td-head" scope="row">사업자등록번호</th>
                    <td>{tabIndex === '0' ? brNoFormatter(row?.vonrBrno) : brNoFormatter(row?.brno)}</td>
                    <th className="td-head" scope="row">주민등록번호</th>
                    <td>{rrNoFormatter(row?.vonrRrnoS)}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">법인등록번호</th>
                    <td>{tabIndex === '0' ? rrNoFormatter(row?.crnoS) : rrNoFormatter(row?.brnoEncpt)}</td>
                    <th className="td-head" scope="row">체납환수금액</th>
                    <td>{getNumtoWon(row?.rdmAmt)}</td>
                    <th className="td-head" scope="row">시행일자</th>
                    <td>{formatDate(row?.enfcYmd)}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">등록사유</th>
                    <td colSpan={7}>{row?.regRsnCn}</td>
                  </tr>
                  <tr>
                    <th className="td-head" scope="row">등록자아이디</th>
                    <td>{row?.rgtrId}</td>
                    <th className="td-head" scope="row">등록일자</th>
                    <td>{formatDate(row?.regDt)}</td>
                    <th className="td-head" scope="row">수정자아이디</th>
                    <td>{row?.mdfrId}</td>
                    <th className="td-head" scope="row">수정일자</th>
                    <td>{formatDate(row?.mdfcnDt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>

        {detailOpen ? (
          <RedempListModalForm 
            row={row}
            tabIndex={tabIndex}
            detailOpen={detailOpen}
            setDetailOpen={setDetailOpen}
          />
        ) : null}

        {open ? (
          <StopModalContent 
            tabIndex={tabIndex}
            row={row}
            open={open}
            handleClickClose={handleClickClose}
            reload={reload}
          />
        ) : null}        
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
