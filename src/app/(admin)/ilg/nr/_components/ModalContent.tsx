import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField"
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import { Row } from "../page"

interface RegisterModalProps {
  rows?: Row[] | null
  rowIndex: number
  regFlag: string
}


const RegisterModalForm = (props: RegisterModalProps) => {
  const { rows, rowIndex, regFlag } = props;
  

  return (
    <Box component="form" id="save" onSubmit={() => {}} sx={{ mb: 2 }}>
      <TableContainer style={{ margin: '16px 0 4em 0' }}>
        <Table
          sx={{ minWidth: 1024 }}
          aria-labelledby="tableTitle"
          size={'medium'}
        >
          <TableBody>
            <TableRow>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>차량번호</TableCell>
              <TableCell>
                <CustomTextField type="hidden" name="vhclNo" value={rows ? rows[rowIndex].vhclNo : ''} />
                <span>{rows ? rows[rowIndex].vhclNo : ''}</span>
                {regFlag === '1' ? (
                <><Button variant="contained" color="primary">선택</Button></>
                ) : (
                <></>
                )}
              </TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>관할관청</TableCell>
              <TableCell></TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>소유자명</TableCell>
              <TableCell></TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>사업자등록번호</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>주민등록번호</TableCell>
              <TableCell></TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>법인등록번호</TableCell>
              <TableCell></TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>유종</TableCell>
              <TableCell></TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>톤수</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>체납환수금액</TableCell>
              <TableCell>
                <CustomTextField type="text" name="rdmAmt" value="" onChange={() => {}} fullWidth />
              </TableCell>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>시행일자</TableCell>
              <TableCell>
                <CustomTextField type="date" name="enfcYmd" value="" onChange={() => {}} fullWidth />
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="td-head" scope="row" style={{ textAlign:'left', width:'10%' }}>등록사유</TableCell>
              <TableCell colSpan={7}>
                <CustomTextField type="text" name="regRsnCn" value="" onChange={() => {}} fullWidth />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default RegisterModalForm
