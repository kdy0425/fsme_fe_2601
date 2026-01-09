import { Box, Grid, Table, TableBody, TableCell, TableRow ,Button} from "@mui/material"
import { Row } from "./page"
import { useState } from "react"
import BlankCard from "@/app/components/shared/BlankCard"
import { telnoFormatter } from "@/utils/fsms/common/comm"
import { brNoFormatter } from "@/utils/fsms/common/util"
interface DetailDataGridProps {
  row: Row | null // row 속성을 선택적 속성으로 변경
  reloadFn?: () => void
}

const TrDetailDataGrid : React.FC<DetailDataGridProps> = ({
  row,
  reloadFn,
}) => {
  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)
  const [carManageOpen, setCarManageOpen] = useState<boolean>(false);
  const submitFn = () => {
    setRemoteFlag(false)
    if (reloadFn) {
      reloadFn()
    }
  }

  const handleClose = () =>{
    console.log('닫힘');
    setCarManageOpen(false);
  }

  const handleOpen = () => {
    console.log('열림');
    setCarManageOpen(true);
  }

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card fit" title="수급자 차량정보">
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '12px',
            }}
          >
          </div>
          <>
            {/* 테이블영역 시작 */}
            <Box className="table-scrollable">
              <Table className="table table-bordered">
                <TableBody>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      차량번호
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.vhclNo}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      수급자명
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.vonrNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      주민등록번호
                    </TableCell>
                    <TableCell colSpan={3} style={{ width: '12.5%' }}>
                      {row?.vonrRrno}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      지자체명
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.locgovNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      유종
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.koiNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      톤수
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.vhclTonNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      법인등록번호
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.crnoEncpt}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
        <BlankCard className="contents-card fit" title="수급자 사업자정보">
          <>
            {/* 테이블영역 시작 */}
            <Box className="table-scrollable">
              <Table className="table table-bordered">
                <TableBody>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      사업자등록번호
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {brNoFormatter(String(row?.vonrBrno))}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      업체명
                    </TableCell>
                    <TableCell colSpan={3} style={{ width: '12.5%' }}>
                      {row?.bzentyNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      대표자명
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.rprsvNm}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      면허업종구분
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.lcnsTpbizNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      사업자구분
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.bzmnSeNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      법인등록번호
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.crnoEncpt}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      전화번호
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.telno != null ? telnoFormatter(row?.telno) : ''}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            {/* 테이블영역 끝 */}
          </>
        </BlankCard>
      </Grid>
    </Grid>
  )
}

export default TrDetailDataGrid