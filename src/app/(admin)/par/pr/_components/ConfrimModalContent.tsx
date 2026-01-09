import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import {
  CustomFormLabel,
  CustomRadio,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  FormControlLabel,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { Row } from '../page'
import FormModal from './FormModal'
import TableDataGrid from './TableDataGrid'
import {
  parPrRfidDecisionTrHeadCells,
  parPrDealDecisionTrHeadCells,
  parPrAccTrHeadCells,
} from '@/utils/fsms/headCells'

interface ModalContentProps {
  locgovCd: string
  crno: string
  lbrctYm: string
  vhclNo: string
  dpstrNm: string
  clclnYm: string
  dataSeCd: string
  vonrBrno: string
  giveCfmtnYn: string
  bzentyNm: string
  vonrNm: string
  bankCdItems: SelectItem[]
  reloadFn?: () => void
}

interface EditContentProps {
  vhclNo: string
  bankCdItems: SelectItem[]
  loadFn?: () => void
  onAccDataChange: (value: {}) => void
}

interface RfidConfirmBody {
  bankCd: string
  actno: string
  dpstrNm: string
  crno: string
  locgovCd: string
  vhclNo: string
  lbrctYmd: string
  lbrctTm: string
}

interface DealConfirmBody {
  bankCd: string
  actno: string
  dpstrNm: string
  vhclNo: string
  crno: string
  crdcoCd: string
  cardNo: string
  aprvYmd: string
  aprvTm: string
  aprvNo: string
  clclnSn: string
  prcsSeCd: string
}

const EditModalContent = (props: EditContentProps) => {
  const { vhclNo, loadFn, onAccDataChange } = props
  const [body, setBody] = useState({
    vhclNo: vhclNo,
    dpstrNm: '',
    bankCd: '',
    actno: '',
  })

  const handleBodyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setBody((prev) => ({ ...prev, [name]: value }))
  }

  const sendData = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!body.dpstrNm) {
      return alert('예금주명을 입력해주세요.')
    }

    if (!body.bankCd) {
      return alert('금융기관을 선택해주세요.')
    }

    if (!body.actno) {
      return alert('계좌번호를 입력해주세요.')
    }

    onAccDataChange(body)
    loadFn?.()
  }

  return (
    <Box component="form" id="edit-modal" onSubmit={sendData} sx={{ mb: 2 }}>
      <TableContainer>
        <Table className="table table-bordered">
          <TableBody>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ width: '100px' }}
              >
                <div className="table-head-text td-left">예금주명</div>
              </TableCell>
              <TableCell colSpan={4}>
                <CustomTextField
                  id="dpstrNm"
                  name="dpstrNm"
                  value={body.dpstrNm}
                  onChange={handleBodyChange}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ width: '100px' }}
              >
                <div className="table-head-text td-left">금융기관</div>
              </TableCell>
              <TableCell>
                <CustomFormLabel
                  className="input-label-none"
                  htmlFor="sch-bankCd"
                >
                  금융기관
                </CustomFormLabel>
                <CommSelect
                  cdGroupNm="973"
                  pValue={body.bankCd}
                  handleChange={handleBodyChange}
                  pName="bankCd"
                  htmlFor={'sch-bankCd'}
                />
              </TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ width: '100px' }}
              >
                <div className="table-head-text td-left">계좌번호</div>
              </TableCell>
              <TableCell>
                <CustomTextField
                  id="actno"
                  name="actno"
                  value={body.actno}
                  onChange={handleBodyChange}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const ConfirmModalContent = (props: ModalContentProps) => {
  const {
    locgovCd,
    crno,
    lbrctYm,
    vhclNo,
    dpstrNm,
    bankCdItems,
    clclnYm,
    vonrBrno,
    dataSeCd,
    giveCfmtnYn,
    reloadFn,
  } = props
  const [rows, setRows] = useState<Row[]>([])
  const [accountRows, setAccountRows] = useState<Row[]>([])
  const [selectedRow, setSelectedRow] = useState<number>(-1)
  //const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState(false) // 로딩여부
  const [params, setParams] = useState({
    bankCd: '',
    actno: '',
    crno: crno,
    vonrBrno: vonrBrno,
    locgovCd: locgovCd,
    vhclNo: vhclNo,
    dpstrNm: dpstrNm,
    lbrctYm: lbrctYm,
    lbrctYmd: '',
    lbrctTm: '',
    clclnYm: clclnYm,
    giveCfmtnYn: giveCfmtnYn,
    searchType: 'vhclNo',
    dataSeCd: dataSeCd,
  })
  const [papersReqstList, setPapersReqstList] = useState<any[]>()

  const [accRemoteFlag, setAccRemoteFlag] = useState<boolean>(false)

  // 상세내역 조회
  const fetchData = async () => {
    try {
      setLoading(true)

      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/getAllDelngPapersReqstRfid?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.lbrctYm ? '&lbrctYm=' + params.lbrctYm : ''}` +
            `${params.searchType == 'crno' && params.crno ? '&crno=' + params.crno : ''}` +
            `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`
          : `/fsm/par/pr/tr/getAllDelngPapersReqstDealCnfirm?` +
            `${params.locgovCd ? '&locgovCd=' + params.locgovCd : ''}` +
            `${params.clclnYm ? '&clclnYm=' + params.clclnYm : ''}` +
            `${params.searchType == 'crno' && params.vonrBrno ? '&vonrBrno=' + params.vonrBrno : ''}` +
            `${params.searchType == 'vhclNo' && params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
            `${params.giveCfmtnYn ? '&giveCfmtnYn=' + params.giveCfmtnYn : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  // 계좌조회
  const fetchAccountData = async () => {
    try {
      let endpoint: string =
        `/fsm/par/pr/tr/getAllAcnutPapersReqst?` +
        `${params.dataSeCd == 'RFID' ? '&dataSeCd=' + params.dataSeCd : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.dpstrNm ? '&dpstrNm=' + params.dpstrNm : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setAccountRows(response.data)
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        setAccountRows([])
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      setAccountRows([])
    }
  }

  const searchAccountData = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await fetchAccountData()
  }

  useEffect(() => {
    fetchAccountData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [params.searchType])

  const confirmGive = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!papersReqstList || papersReqstList.length < 1) {
      return alert('지급확정건을 선택해주세요.')
    }

    if (!accountRows[selectedRow]) {
      const accConfirm = confirm('지급계좌 선택을 생략 하시겠습니까?')

      if (!accConfirm) {
        return
      } else {
        sendConfirmGive()
      }
    } else {
      sendConfirmGive()
    }
  }

  const sendConfirmGive = async () => {
    try {
      let endpoint: string =
        dataSeCd == 'RFID'
          ? `/fsm/par/pr/tr/decisionPapersReqstRfid`
          : `/fsm/par/pr/tr/decisionPapersReqstDealCnfirm`

      let body = {
        papersReqstList: papersReqstList,
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        reloadFn?.()
      } else {
        alert(response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleRowClick = (index: number) => {
    setSelectedRow(index)
  }

  const openAccModal = () => {
    setAccRemoteFlag(true)
  }

  const load = () => {
    setAccRemoteFlag(false)
  }

  // useEffect(() => {
  //   if(!remoteFlag)
  //     setRemoteFlag(true)
  // }, [remoteFlag])

  const handleCheckChange = (rows: Row[]) => {
    let selectList: any[] = []
    if (rows) {
      dataSeCd == 'RFID'
        ? rows.map((row) => {
            let reqData: RfidConfirmBody = {
              bankCd: accountRows[selectedRow]?.bankCd
                ? accountRows[selectedRow]?.bankCd
                : '',
              actno: accountRows[selectedRow]?.actno
                ? accountRows[selectedRow]?.actno
                : '',
              dpstrNm: accountRows[selectedRow]?.dpstrNm
                ? accountRows[selectedRow]?.dpstrNm
                : '',
              crno: row.crno,
              locgovCd: row.locgovCd,
              vhclNo: row.vhclNo,
              lbrctYmd: row.lbrctYmd,
              lbrctTm: row.lbrctTm,
            }
            selectList.push(reqData)
          })
        : rows.map((row) => {
            let reqData: DealConfirmBody = {
              bankCd: accountRows[selectedRow]?.bankCd
                ? accountRows[selectedRow]?.bankCd
                : '',
              actno: accountRows[selectedRow]?.actno
                ? accountRows[selectedRow]?.actno
                : '',
              dpstrNm: accountRows[selectedRow]?.dpstrNm
                ? accountRows[selectedRow]?.dpstrNm
                : '',
              vhclNo: row.vhclNo,
              crno: row.crno,
              crdcoCd: row.crdcoCd,
              cardNo: row.cardNo,
              aprvYmd: row.aprvYmd,
              aprvTm: row.aprvTm,
              aprvNo: row.aprvNo,
              clclnSn: row.clclnSn,
              prcsSeCd: row.prcsSeCd,
            }

            selectList.push(reqData)
          })
    }
    setPapersReqstList(selectList)
  }

  const accountInfoSelector = () => {
    if (papersReqstList && papersReqstList.length > 0) {
      let copyArr: any[] = []

      papersReqstList?.map((item) => {
        let data = {
          ...item,
          actno: accountRows[selectedRow].actno,
          bankCd: accountRows[selectedRow].bankCd,
          dpstrNm: accountRows[selectedRow].dpstrNm,
        }

        copyArr.push(data)
      })
      setPapersReqstList(copyArr)
    }
  }

  const deleteAccRow = (index: number) => {
    if (papersReqstList && papersReqstList.length > 0) {
      let copyArr: any[] = []

      papersReqstList?.map((item) => {
        let data = {
          ...item,
          actno: '',
          bankCd: '',
          dpstrNm: '',
        }

        copyArr.push(data)
      })
      setPapersReqstList(copyArr)
    }

    setAccountRows((prevRows) => prevRows.filter((_, i) => i !== index)) // 선택된 index의 데이터 제거
  }

  const handleChildDataChange = (Row: any) => {
    let bankNm = bankCdItems.find((item) => item.value == Row.bankCd)?.label

    // Row 객체에 bankNm 속성을 추가
    const accRow = { ...Row, bankNm }

    setAccountRows((prevRows) => [...prevRows, accRow]) // 기존 데이터에 새 데이터 추가
  }

  useEffect(() => {
    //console.log(papersReqstList)
  }, [papersReqstList])

  useEffect(() => {
    accountInfoSelector()
  }, [selectedRow])

  return (
    <Box style={{ minWidth: 1200 }}>
      <Box
        component="form"
        id="confirm-modal"
        onSubmit={confirmGive}
        sx={{ mb: 2 }}
      >
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group" style={{ maxWidth: '30rem' }}>
              <CustomFormLabel className="input-label-display">
                대상선택
              </CustomFormLabel>
              <RadioGroup
                row
                id="chk"
                className="mui-custom-radio-group"
                onChange={handleSearchChange}
                value={params.searchType}
              >
                <FormControlLabel
                  control={
                    <CustomRadio id="chk_02" name="searchType" value="crno" />
                  }
                  label="선택된 사업자"
                />
                <FormControlLabel
                  control={
                    <CustomRadio id="chk_02" name="searchType" value="vhclNo" />
                  }
                  label="선택된 차량"
                />
              </RadioGroup>
            </div>
          </div>
        </Box>
      </Box>
      <>
        {/* 테이블영역 시작 */}
        <table
          className="table table-bordered"
          style={{ maxWidth: 500, marginBottom: 10 }}
        >
          <caption>상세 내용 시작</caption>
          <colgroup>
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            <tr>
              <th
                className="td-head"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                소유자명
              </th>
              <td>{dataSeCd == 'RFID' ? props.bzentyNm : props.vonrNm}</td>
              <th
                className="td-head"
                scope="row"
                style={{ whiteSpace: 'nowrap' }}
              >
                법인등록번호
              </th>
              <td>{dataSeCd == 'RFID' ? props.crno : props.vonrBrno}</td>
            </tr>
          </tbody>
        </table>
      </>
      <Box>
        <TableDataGrid
          headCells={
            dataSeCd == 'RFID'
              ? parPrRfidDecisionTrHeadCells
              : parPrDealDecisionTrHeadCells
          }
          rows={rows}
          totalRows={-1}
          loading={loading}
          onPaginationModelChange={() => {}}
          onSortModelChange={() => {}}
          onRowClick={() => {}}
          onCheckChange={handleCheckChange}
          paging={false}
          pageable={{
            pageNumber: 0,
            pageSize: 0,
            sort: '',
          }}
        />
      </Box>

      <Box className="table-bottom-button-group">
        <CustomFormLabel className="input-label-display">
          <h3>계좌정보</h3>
        </CustomFormLabel>
        <div className=" button-right-align">
          <Button
            variant="outlined"
            type="submit"
            form="search-modal"
            color="primary"
          >
            검색
          </Button>
        </div>
      </Box>
      <Box
        component="form"
        id="search-modal"
        onSubmit={searchAccountData}
        sx={{ mb: 2 }}
      >
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-vhclNo"
              >
                차량번호
              </CustomFormLabel>
              <CustomTextField
                id="ft-vhclNo"
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel
                className="input-label-display"
                htmlFor="ft-dpstrNm"
              >
                예금주명
              </CustomFormLabel>
              <CustomTextField
                id="ft-dpstrNm"
                name="dpstrNm"
                value={params.dpstrNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
      </Box>

      <TableContainer style={{ margin: '16px 0 4em 0', maxHeight: 300 }}>
        <Table
          sx={{ minWidth: 500 }}
          aria-labelledby="tableTitle"
          size={'small'}
        >
          <caption>계좌 목록 테이블</caption>
          <TableHead>
            <TableRow key={'thRow'}>
              {parPrAccTrHeadCells.map((headCell) => (
                <React.Fragment key={'th' + headCell.id}>
                  <TableCell
                    align={'left'}
                    padding={headCell.disablePadding ? 'none' : 'normal'}
                  >
                    <div className="table-head-text">{headCell.label}</div>
                  </TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {accountRows.map((row: any, index) => {
              return (
                <TableRow
                  key={'tr' + index}
                  selected={index === selectedRow}
                  onClick={() => handleRowClick(index)}
                >
                  <TableCell>{row.vhclNo}</TableCell>
                  <TableCell>{row.bankNm}</TableCell>
                  <TableCell>{row.dpstrNm}</TableCell>
                  <TableCell>{row.actno}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box className="table-bottom-button-group" sx={{ mb: 2 }}>
        <div className=" button-right-align">
          <Button variant="outlined" onClick={() => openAccModal()}>
            신규등록
          </Button>
          <FormModal
            buttonLabel={''}
            title={'계좌신규등록'}
            formId="edit-modal"
            formLabel="저장"
            remoteFlag={accRemoteFlag}
            closeHandler={() => setAccRemoteFlag(false)}
            children={
              <EditModalContent
                vhclNo={vhclNo}
                bankCdItems={bankCdItems}
                onAccDataChange={handleChildDataChange}
                loadFn={load}
              />
            }
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={() => deleteAccRow(selectedRow)}
          >
            계좌정보 삭제
          </Button>
        </div>
      </Box>

      <TableContainer>
        <Table className="table table-bordered">
          <TableBody>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ width: '100px' }}
              >
                <div className="table-head-text td-left">예금주명</div>
              </TableCell>
              <TableCell colSpan={4}>
                {accountRows[selectedRow]?.dpstrNm}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className="td-head"
                scope="row"
                style={{ width: '100px' }}
              >
                <div className="table-head-text td-left">금융기관</div>
              </TableCell>
              <TableCell>{accountRows[selectedRow]?.bankNm}</TableCell>
              <TableCell
                className="td-head"
                scope="row"
                style={{ width: '100px' }}
              >
                <div className="table-head-text td-left">계좌번호</div>
              </TableCell>
              <TableCell>{accountRows[selectedRow]?.actno}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ConfirmModalContent
