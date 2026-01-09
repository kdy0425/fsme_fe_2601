import FormModal from '@/app/components/popup/FormDialog'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { parPrAccTrHeadCells } from '@/utils/fsms/headCells'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { Row } from '../page'

interface ModalContentProps {
  locgovCd: string
  vhclNo: string
  clclnYm: string
  aplySn: number
  dpstrNm: string
  bankCdItems: SelectItem[]
  reload: () => void
}

interface EditContentProps {
  vhclNo: string
  onAccDataChange: (value: {}) => void
}

const EditModalContent = (props: EditContentProps) => {
  const { vhclNo, onAccDataChange } = props
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
                <CustomFormLabel className="input-label-none" htmlFor="sch-bankCd">금융기관</CustomFormLabel>
                <CommSelect
                  cdGroupNm="973"
                  pValue={body.bankCd}
                  handleChange={handleBodyChange}
                  pName="bankCd"
                  htmlFor={"sch-bankCd"}
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

const AccountModalContent = (props: ModalContentProps) => {
  const { locgovCd, vhclNo, clclnYm, aplySn, dpstrNm, bankCdItems, reload } =
    props
  const [rows, setRows] = useState<Row[]>([])
  const [selectedRow, setSelectedRow] = useState<number>(-1)
  const [remoteFlag, setRemoteFlag] = useState<boolean>(false)
  const [params, setParams] = useState({
    vhclNo: vhclNo ?? '',
    dpstrNm: dpstrNm ?? '',
  })
  const [body, setBody] = useState<{}>()

  const fetchData = async () => {
    try {
      let endpoint: string =
        `/fsm/par/gpr/tr/getAllAcnutGnrlPapersReqst?` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}` +
        `${params.dpstrNm ? '&dpstrNm=' + params.dpstrNm : ''}`

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
    }
  }

  const searchData = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await fetchData()
  }

  const updateData = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await updateAccountInfo()
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleRowClick = (index: number) => {
    setSelectedRow(index)
  }

  useEffect(() => {
    accountInfoSelector()
  }, [selectedRow])

  useEffect(() => {
    setSelectedRow(-1)
  }, [rows])

  // 파라미터 셋팅
  const accountInfoSelector = () => {
    let data = {
      locgovCd: locgovCd,
      clclnYm: clclnYm,
      aplySn: Number(aplySn),
      vhclNo: rows[selectedRow]?.vhclNo ?? '',
      actno: rows[selectedRow]?.actno ?? '',
      bankCd: rows[selectedRow]?.bankCd ?? '',
      dpstrNm: rows[selectedRow]?.dpstrNm ?? '',
    }
    setBody(data)
  }

  useEffect(() => {
    console.log('body ::: ', body)
  }, [body])

  const deleteAccRow = (index: number) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index)) // 선택된 index의 데이터 제거
  }

  const handleChildDataChange = (Row: any) => {
    let bankNm = bankCdItems.find((item) => item.value == Row.bankCd)?.label

    // Row 객체에 bankNm 속성을 추가
    const accRow = { ...Row, bankNm }

    setRows((prevRows) => [...prevRows, accRow]) // 기존 데이터에 새 데이터 추가
    setRemoteFlag(false)
  }

  // 자식 컴포넌트 이벤트 함수
  const updateAccountInfo = async () => {
    try {
      if (!rows[selectedRow]) {
        alert('계좌정보를 선택해주세요.')
        return
      }

      const userConfirm = confirm('계좌정보를 수정하시겠습니까')

      if (!userConfirm) return

      let endpoint: string = `/fsm/par/gpr/tr/updateAcnuntGnrlPapersReqst`

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        reload()
      } else {
        alert(response.message)
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  return (
    <Box>
      <Box
        component="form"
        id="search-data"
        onSubmit={searchData}
        sx={{ mb: 2 }}
      >
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                차량번호
              </CustomFormLabel>
              <CustomTextField
                name="vhclNo"
                value={params.vhclNo}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display">
                예금주명
              </CustomFormLabel>
              <CustomTextField
                name="dpstrNm"
                value={params.dpstrNm}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
        </Box>
      </Box>
      <TableContainer style={{ margin: '16px 0 2em 0', maxHeight: 300 }}>
        <Table sx={{ minWidth: 500 }} aria-labelledby="tableTitle">
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
            {rows.map((row: any, index) => {
              return (
                <TableRow
                  key={'tr' + index}
                  selected={index === selectedRow}
                  onClick={() => handleRowClick(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{row?.vhclNo}</TableCell>
                  <TableCell>{row?.bankNm}</TableCell>
                  <TableCell>{row?.dpstrNm}</TableCell>
                  <TableCell>{row?.actno}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Box className="table-bottom-button-group" sx={{ mb: 2 }}>
          <div className="button-right-align">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setRemoteFlag(true)}
            >
              신규등록
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => deleteAccRow(selectedRow)}
            >
              계좌정보 삭제
            </Button>
          </div>
        </Box>
        <FormModal
          buttonLabel=""
          title={'계좌신규등록'}
          submitBtn={false}
          remoteFlag={remoteFlag}
          closeHandler={() => setRemoteFlag(false)}
          btnSet={
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="edit-modal"
            >
              저장
            </Button>
          }
        >
          <EditModalContent
            vhclNo={vhclNo}
            onAccDataChange={handleChildDataChange}
          />
        </FormModal>
        <Box
          component="form"
          id="update-data"
          onSubmit={updateData}
          sx={{ mb: 2 }}
        >
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
                  {rows[selectedRow]?.dpstrNm ?? ''}
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
                <TableCell>{rows[selectedRow]?.bankNm ?? ''}</TableCell>
                <TableCell
                  className="td-head"
                  scope="row"
                  style={{ width: '100px' }}
                >
                  <div className="table-head-text td-left">계좌번호</div>
                </TableCell>
                <TableCell>{rows[selectedRow]?.actno ?? ''}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
    </Box>
  )
}

export default AccountModalContent
