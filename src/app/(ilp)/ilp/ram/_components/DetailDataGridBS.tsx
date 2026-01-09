import BlankCard from '@/app/components/shared/BlankCard'
import { Button, Grid } from '@mui/material'
import React, { useState } from 'react'
import { formatDate, getNumtoWon } from '@/utils/fsms/common/convert'
import { Row } from '../page'
import BsRegisterInfoModal from "./BsRegisterInfoModal"
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
        <BlankCard className="contents-card" title="상세 정보"buttons={[
                    {
                    label: '환수금 납부정보',
                    onClick: () => setOpen(true),
                    color: 'outlined',
                    },
                    ]}
                >
          {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              환수금 납부정보
            </Button>
          </div> */}
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
                     <th className="td-head" scope="row">사업자등록번호</th>
                    <td>{tabIndex === '0' ? brNoFormatter(row?.vonrBrno) : brNoFormatter(row?.brno)}</td>
                    <th className="td-head" scope="row">업체명</th>
                    <td>{row?.bzentyNm}</td>
                    <th className="td-head" scope="row">의심거래패턴</th>
                    <td>{row?.pttrnSeNm}</td>
                  </tr>                 
                  <tr>
                    <th className="td-head" scope="row">환수조치액</th>
                    <td>{getNumtoWon(row?.rdmActnAmt)}</td>
                    <th className="td-head" scope="row">환수금액</th>
                    <td>{getNumtoWon(row?.rdmAmt)}</td>
                    <th className="td-head" scope="row">환수일자</th>
                    <td>{formatDate(row?.rdmYmd)}</td>
                    <th className="td-head" scope="row">환수여부</th>
                    <td>{row?.rdmYnNm}</td>
                  </tr>
                  {/* <tr>
                    <th className="td-head" scope="row">은행</th>
                    <td>{row?.bankNm}</td>
                    <th className="td-head" scope="row">계좌번호</th>
                    <td>{row?.actno}</td>
                    <th className="td-head" scope="row">예금주명</th>
                    <td>{row?.dpstrNm}</td>
                    <th className="td-head" scope="row"></th>
                    <td></td>
                  </tr> */}
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
        {open ? (
          <BsRegisterInfoModal 
            row={row}
            open={open}
            handleClickClose={handleClickClose}
            type={'U'}
            reload={reload}
            origin="detail"
          />
        ) : null}        
      </Grid>
    </Grid>
  )
}

export default DetailDataGrid
