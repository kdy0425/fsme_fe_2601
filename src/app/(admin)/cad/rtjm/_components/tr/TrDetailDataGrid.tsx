import { Box, Grid, Table, TableBody, TableCell, TableRow ,Button} from "@mui/material"
import { Row } from "./page"
import { useState } from "react"
import FormDialog from "@/app/components/popup/FormDialog"
import BlankCard from "@/app/components/shared/BlankCard"
import ModalContent01 from "./ModalContent01"
import ModalContent02 from "./ModalContent02"
import { telnoFormatter } from "@/utils/fsms/common/comm"
import { brNoFormatter, getDateTimeString } from "@/utils/fsms/common/util"
import CarManageInfoSysModal from '@/app/(admin)/layout/vertical/navbar-top/DataResearch/CarManageInfoSysModal'
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
            {row?.prcsSttsCd == '02' ? (
              <>
              <Button color="primary" variant="contained" onClick={handleOpen}>
                자동차망-차량조회
              </Button>
              <CarManageInfoSysModal
                open={carManageOpen}
                onCloseClick={handleClose}
                //vhclNo={issueDetailInfo?.vhclNo}
              />
              </>
            ) : (
              ''
            )}
            &nbsp;
            {row?.prcsSttsCd == '02' ? (
              <FormDialog
                buttonLabel={'보조금지급정지 및 차량휴지'}
                title={'보조금지급정지/거절 및 차량휴지 내역 조회'}
                size={'lg'}
                submitBtn={false}
              >
                <ModalContent02
                  vonrRrno={row?.vonrRrno}
                  vonrBrno={row?.vonrBrno}
                  vhclNo={row?.vhclNo}
                  type={"tr"}
                />
              </FormDialog>
            ) : (
              ''
            )}
            &nbsp;
            {row?.prcsSttsCd == '02' ? (
              <FormDialog
                buttonLabel={'상세검토'}
                title={'화물자동차 RFID 발급심사 상세검토'}
                size={'lg'}
                submitBtn={false}
                remoteFlag={remoteFlag}
              >
                <ModalContent01
                  rcptSeqNo={row?.rcptSeqNo}
                  vonrBrno={row?.vonrBrno}
                  vhclNo={row?.vhclNo}
                  submitHandler={submitFn}
                />
              </FormDialog>
            ) : (
              ''
            )}
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
        <BlankCard className="contents-card fit" title="심사정보">
          <>
            {/* 테이블영역 시작 */}
            <Box className="table-scrollable">
              <Table className="table table-bordered">
                <TableBody>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '11.5%' }}
                    >
                      처리상태
                    </TableCell>
                    <TableCell style={{ width: '12.5%' }}>
                      {row?.prcsSttsNm}
                    </TableCell>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      심사일자
                    </TableCell>
                    <TableCell colSpan={5} style={{ width: 'auto' }}>
                      {row?.idntyYmd != null
                        ? getDateTimeString(String(row?.idntyYmd), 'date')
                            ?.dateString
                        : ''}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head td-left"
                      scope="row"
                      style={{ whiteSpace: 'nowrap', width: '12.5%' }}
                    >
                      탈락사유
                    </TableCell>
                    <TableCell colSpan={7} style={{ width: '87.5%' }}>
                      {row?.flRsnCn}
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