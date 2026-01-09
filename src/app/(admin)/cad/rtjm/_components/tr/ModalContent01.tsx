import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  DialogContent,
} from '@mui/material'
import { Row } from './page'
import Dialog from '@mui/material/Dialog'
import React, { useEffect, useState } from 'react'

// components
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

// utils
import { useMessageActions } from '@/store/MessageContext'
import {
  sendHttpRequest,
  sendFormDataWithJwt,
} from '@/utils/fsms/common/apiUtils'
import { ApiResponse, ApiError, getCombinedErrorMessage } from '@/types/message'
import {
  rfidTagJudgDtlTrHeadCells,
  rfidTagJudgCarTrHeadCells,
  rfidTagJudgBizTrHeadCells,
  rfidTagJudgCrdTrHeadCells,
} from '@/utils/fsms/headCells'

interface ModalProps {
  rcptSeqNo: string | undefined // row 속성을 선택적 속성으로 변경
  vonrBrno: string | undefined
  vhclNo: string | undefined
  submitHandler?: (param?: unknown) => void
}

const ModalForm = (props: ModalProps) => {
  const { rcptSeqNo, vonrBrno, vhclNo, submitHandler } = props

  const [mainRow, setMainRow] = useState<Row[]>([])
  const [cardRow, setCardRow] = useState<Row[]>([])

  const [flRsnCn, setFlRsnCn] = useState<string>('')
  const [flRsnCnLength, setFlRsnCnLength] = useState<number>(0)

  const [refuseModalOpen, setRefuseModalOpen] = useState(false) // 탈락처리모달 상태관리를 위한 플래그
  const { setMessage } = useMessageActions()

  const [loading, setLoading] = useState(false) // 로딩여부

  const fetchData = async () => {
    setLoading(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/cad/rtjm/tr/getOneRfidTagJdgmnMng` +
        `${rcptSeqNo ? '?rcptSeqNo=' + rcptSeqNo : ''}` +
        `${vonrBrno ? '&vonrBrno=' + vonrBrno : ''}` +
        `${vhclNo ? '&vhclNo=' + vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setMainRow(response.data.main)
        setCardRow(response.data.card)
      } else {
        setMainRow([])
        setCardRow([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setMainRow([])
      setCardRow([])
    } finally {
      setLoading(false)
      compareData()
    }
  }

  const compareData = () => {
    if (mainRow.length >= 2) {
      let fsms: Row = {}
      let rfid: Row = {}

      mainRow.map((item, idx) => {
        if (idx == 0) {
          fsms = item
        }
        if (idx == 1) {
          rfid = item
        }
      })

      document
        .getElementsByClassName('compareText')[0]
        .childNodes.forEach((item) => {
          document.getElementsByClassName('compareText')[0].removeChild(item)
        })

      if (fsms != null && rfid != null && fsms.vonrNm != rfid.vonrNm) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 성명(업체명) 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }

      if (fsms != null && rfid != null && fsms.vonrBrno != rfid.vonrBrno) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 사업자등록번호 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }

      if (fsms != null && rfid != null && fsms.vonrRrno != rfid.vonrRrno) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 주민등록번호 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }

      if (fsms != null && rfid != null && fsms.crno != rfid.crno) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 법인등록번호 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }

      if (fsms != null && rfid != null && fsms.vhclTonNm != rfid.vhclTonNm) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 톤수 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }

      if (fsms != null && rfid != null && fsms.locgovNm != rfid.locgovNm) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 지자체 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }

      if (fsms != null && rfid != null && fsms.rprsvNm != rfid.rprsvNm) {
        let o = document
          .createElement('P')
          .appendChild(document.createTextNode('- 대표자 변경'))
        document.getElementsByClassName('compareText')[0].appendChild(o)
      }
    }
  }

  // 데이터 갱신
  useEffect(() => {
    fetchData()
  }, [])

  const approveReceipt = async () => {
    const formData = new FormData()
    const endpoint: string = `/fsm/cad/rtjm/tr/approveRfidTagJdgmnMng`

    if (rcptSeqNo != undefined) {
      formData.append('rcptSeqNo', rcptSeqNo)

      try {
        const postResponseData: ApiResponse = await sendFormDataWithJwt(
          'PUT',
          endpoint,
          formData,
          true,
        )
        setMessage({
          resultType: postResponseData.resultType,
          status: postResponseData.status,
          message: postResponseData.message,
        })

        if (submitHandler) {
          submitHandler()
        }
      } catch (error) {
        if (error instanceof ApiError) {
          switch (error.resultType) {
            case 'fail':
              //유효성검사 오류
              setMessage({
                resultType: 'error',
                status: error.status,
                message: getCombinedErrorMessage(error),
              })
              break
            case 'error':
              // 'error'는 서버 측 오류
              setMessage({
                resultType: 'error',
                status: error.status,
                message: error.message,
              })
              break
          }
        }
      }
    }
  }

  const refuseReceipt = async () => {
    if (rcptSeqNo != undefined) {
      setFlRsnCn('')
      setFlRsnCnLength(0)
      setRefuseModalOpen(true)
    }
  }

  const refuseReceiptClose = () => {
    setRefuseModalOpen(false)
  }

  const refuseHandleEvent = (val: string) => {
    if (val.length <= 30) {
      setFlRsnCnLength(val.length)
      setFlRsnCn(val.replaceAll(/\n/g, '').replaceAll(/\t/g, ''))
    }
  }

  const refuseReceiptEvent = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (rcptSeqNo == undefined) return
    await refuseReceiptSubmit(event.target)
  }

  const refuseReceiptSubmit = async (target: any) => {
    const formData = new FormData(target)
    const endpoint: string = `/fsm/cad/rtjm/tr/rejectRfidTagJdgmnMng`

    try {
      const postResponseData: ApiResponse = await sendFormDataWithJwt(
        'PUT',
        endpoint,
        formData,
        true,
      )
      setMessage({
        resultType: postResponseData.resultType,
        status: postResponseData.status,
        message: postResponseData.message,
      })

      refuseReceiptClose()
      if (submitHandler) {
        submitHandler()
      }
    } catch (error) {
      if (error instanceof ApiError) {
        switch (error.resultType) {
          case 'fail':
            //유효성검사 오류
            setMessage({
              resultType: 'error',
              status: error.status,
              message: getCombinedErrorMessage(error),
            })
            break
          case 'error':
            // 'error'는 서버 측 오류
            setMessage({
              resultType: 'error',
              status: error.status,
              message: error.message,
            })
            break
        }
      }
    }
  }

  return (
    <Box>
      <div style={{ float: 'right' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => approveReceipt()}
        >
          승인
        </Button>
        &nbsp;
        <Button
          variant="contained"
          color="error"
          onClick={() => refuseReceipt()}
        >
          탈락
        </Button>
      </div>

      <TableContainer sx={{ minWidth: 900 }}>
        <CustomFormLabel
          className="input-label-display"
          style={{ margin: '10px 0 0 0' }}
        >
          수급자정보 검토
        </CustomFormLabel>

        <TableDataGrid
          headCells={rfidTagJudgDtlTrHeadCells}
          rows={mainRow}
          loading={loading}
          paging={false}
          cursor={true}
          caption={"수급자정보 목록"}
        />
      </TableContainer>

      <TableContainer
        sx={{ width: '50% !important', float: 'left !important' }}
      >
        <CustomFormLabel
          className="input-label-display"
          style={{ width: '50% !important', margin: '10px 0 0 0' }}
        >
          차량제원 및 지자체정보검토
        </CustomFormLabel>
        <TableDataGrid
          headCells={rfidTagJudgCarTrHeadCells}
          rows={mainRow}
          loading={loading}
          paging={false}
          cursor={true}
          split={true} // 테이블을 둘로 나눠야 하나, min-width가 고정으로 되어있어 어려워 수정
          caption={"차량제원 및 지자체정보 목록"}
        />
      </TableContainer>

      <TableContainer
        sx={{ width: '50% !important', float: 'right !important' }}
      >
        <CustomFormLabel
          className="input-label-display"
          style={{ width: '50% !important', margin: '10px 0 0 0' }}
        >
          업체정보 검토
        </CustomFormLabel>
        <TableDataGrid
          headCells={rfidTagJudgBizTrHeadCells}
          rows={mainRow}
          loading={loading}
          paging={false}
          cursor={true}
          split={true} // 테이블을 둘로 나눠야 하나, min-width가 고정으로 되어있어 어려워 수정
          caption={"업체정보 목록"}
        />
      </TableContainer>

      <TableContainer>
        <Table
          aria-labelledby="tableTitle"
          style={{ marginTop: '15px', minHeight: '80px', border: 0 }}
        >
          <TableBody style={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell style={{ border: 0 }}>
                ※ 사업자번호 또는 업체정보(지입회사)가 틀린 경우
                유류구매카드심사 화면의 사업자번호(지입사)변경 기능을 이용하여
                해당정보를 변경한 후 승인처리할 수 있습니다.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ border: 0 }}>
                ※ 톤수정보가 잘못 된 경우 유류구매카드심사 화면의 톤수변경
                기능을 이용하여 해당정보를 변경한 후 승인처리 할수 있습니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer
        style={{ minHeight: '150px' }}
        sx={{ width: '50% !important', float: 'left !important' }}
      >
        <CustomFormLabel
          className="input-label-display"
          style={{ width: '50% !important', margin: '10px 0 0 0' }}
        >
          승인처리시 말소대상 카드정보
        </CustomFormLabel>
        <TableDataGrid
          headCells={rfidTagJudgCrdTrHeadCells}
          rows={cardRow}
          loading={loading}
          paging={false}
          cursor={true}
          split={true} // 테이블을 둘로 나눠야 하나, min-width가 고정으로 되어있어 어려워 수정
          caption={"말소대상 카드 목록"}
        />
      </TableContainer>

      <TableContainer
        style={{ minHeight: '150px', marginLeft: '20px' }}
        sx={{ width: '48% !important', float: 'right !important' }}
      >
        <CustomFormLabel
          className="input-label-display"
          style={{ width: '50% !important', margin: '10px 0 0 0' }}
        >
          의사결정지원[상세검토내역]
        </CustomFormLabel>
        <Table
          aria-labelledby="tableTitle"
          style={{ minHeight: '150px', border: 0 }}
        >
          <TableBody style={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell
                className="compareText"
                style={{
                  textAlign: 'left',
                  verticalAlign: 'top',
                  border: 0,
                  padding: '20px',
                }}
              >
                - 내용없음
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 탈락처리 모달 시작 */}
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={refuseModalOpen}
        onClose={refuseReceiptClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h3>탈락처리</h3>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Box component="form">
                <Button
                  variant="contained"
                  color="error"
                  form="refuseForm"
                  type="submit"
                >
                  탈락
                </Button>{' '}
                &nbsp;
                <Button
                  variant="contained"
                  color="dark"
                  onClick={refuseReceiptClose}
                >
                  취소
                </Button>
              </Box>
            </div>
          </Box>
          <Box
            id="refuseForm"
            component="form"
            onSubmit={refuseReceiptEvent}
            sx={{ mb: 2, minWidth: 500 }}
          >
            <div className="table-scrollable">
              <table className="table table-bordered">
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      탈락사유
                    </th>
                    <td>
                      <input type="hidden" name="rcptSeqNo" value={rcptSeqNo} />
                      <textarea
                        name="flRsnCn"
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          marginTop: 5,
                        }}
                        maxLength={100}
                        onChange={(event) =>
                          refuseHandleEvent(event.target.value)
                        }
                        value={flRsnCn}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 15, textAlign: 'right', color: 'black' }}>
              {flRsnCnLength} / 100
            </div>
          </Box>
        </DialogContent>
      </Dialog>
      {/* 탈락처리 모달 종료 */}
    </Box>
  )
}

export default ModalForm
