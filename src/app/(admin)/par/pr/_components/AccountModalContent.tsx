import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { SelectItem } from 'select';
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { parPrAccTrHeadCells } from '@/utils/fsms/headCells';
import { Row } from '../page';
import FormModal from './FormModal';

interface ModalContentProps {
  dataSeCd: string
  vhclNo: string
  locgovCd: string
  crno: string
  lbrctYm: string
  vonrBrno: string
  clclnYm: string
  bankCdItems: SelectItem[]
}

interface EditContentProps {
  vhclNo: string;
  bankCdItems: SelectItem[]
  onAccDataChange: (value: {}) => void
  remoteClose: () => void
}

const EditModalContent = (props: EditContentProps) => {
  const {vhclNo, bankCdItems, onAccDataChange, remoteClose} = props
  const [body, setBody] = useState({
    vhclNo: vhclNo,
    dpstrNm: '',
    bankCd: '',
    actno:'',
  });

  const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target
    
    setBody(prev => ({ ...prev, [name]: value }));
  }
  
  const sendData = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if(!body.dpstrNm) {
      return alert('예금주명을 입력해주세요.')
    }

    if(!body.bankCd) {
      return alert('금융기관을 선택해주세요.')
    }

    if(!body.actno) {
      return alert('계좌번호를 입력해주세요.')
    }

    onAccDataChange(body)
    remoteClose()
  }
  return (
    <Box component="form" id="edit-modal" onSubmit={sendData} sx={{mb:2}}>
      <TableContainer>
        <Table className="table table-bordered">
          <TableBody>
            <TableRow>
              <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                예금주명
              </div>
              </TableCell>
              <TableCell colSpan={4}>
                <CustomTextField name="dpstrNm" value={body.dpstrNm} onChange={handleBodyChange}/>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                금융기관
              </div>
              </TableCell>
              <TableCell >
              <CommSelect
                cdGroupNm="973"
                pValue={body.bankCd}
                handleChange={handleBodyChange}
                pName="bankCd"
              />
              </TableCell>
              <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                계좌번호
              </div>
              </TableCell>
              <TableCell >
                <CustomTextField name="actno" value={body.actno} onChange={handleBodyChange}/>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const AccountModalContent = forwardRef((props: ModalContentProps, forwardRef) => {
  const {dataSeCd, vhclNo, locgovCd, crno, lbrctYm, vonrBrno, clclnYm, bankCdItems} = props;
  const [rows , setRows] = useState<Row[]>([]);
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>(undefined);
  const [params, setParams] = useState({
    vhclNo: vhclNo,
    dpstrNm: '',
  });
  const [body, setBody] = useState<{}>()

  const fetchData = async () => {
    try {
      let endpoint: string =
      `/fsm/par/pr/tr/getAllAcnutPapersReqst?dataSeCd=RFID` +
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
    }catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    setRows([])
    }
  }

  const searchData = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await fetchData();
  }

  useEffect(() => {
    fetchData();
  }, [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target

    setParams(prev => ({ ...prev, [name]: value }));
  }

  const handleRowClick = (index: number) => {
    setSelectedRow(index);
  }

  useEffect(() => {
    accountInfoSelector()
  }, [selectedRow])

  const remoteClose = () => {
    setRemoteFlag(false);
  }

  // 파라미터 셋팅
  const accountInfoSelector = () => {

    let data = {
      locgovCd: locgovCd,
      crno: crno,
      lbrctYm: lbrctYm,
      vonrBrno: vonrBrno,
      clclnYm: clclnYm,
      vhclNo: rows[selectedRow]?.vhclNo ?? '',
      actno: rows[selectedRow]?.actno ?? '',
      bankCd: rows[selectedRow]?.bankCd ?? '',
      dpstrNm: rows[selectedRow]?.dpstrNm ?? ''
    }
    setBody(data);
  }

  const deleteAccRow = (index: number) => {

    setRows((prevRows) => prevRows.filter((_, i) => i !== index)); // 선택된 index의 데이터 제거
  }

  const handleChildDataChange = (Row: any) => {
    
    let bankNm = bankCdItems.find((item) => item.value == Row.bankCd)?.label

    // Row 객체에 bankNm 속성을 추가
    const accRow = { ...Row, bankNm }
    
    setRows((prevRows) => [...prevRows, accRow]) // 기존 데이터에 새 데이터 추가
  }

  // 부모 컴포넌트가 호출할 수 있는 메서드 설정
  useImperativeHandle(forwardRef, () => ({
    childSaveClickHandler,
  }));

  // 자식 컴포넌트 이벤트 함수
  const childSaveClickHandler = async() => {
    try {
      let endpoint: string = 
      dataSeCd == 'RFID' ? `/fsm/par/pr/tr/updateAcnutPapersReqstRfid` : `/fsm/par/pr/tr/updateAcnutPapersReqstDealCnfirm`
    
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        alert(response.message)
      } else {
        // 데이터가 없거나 실패
        alert(response.message);
      }  
    }catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    }
  }

  return (
    <Box>
      <Box component="form" id="search-modal" onSubmit={searchData} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-vhclNo">
                차량번호
              </CustomFormLabel>
              <CustomTextField id="ft-vhclNo" name="vhclNo" value={params.vhclNo} onChange={handleSearchChange} fullWidth />
            </div>

            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-dpstrNm">
                예금주명
              </CustomFormLabel>
              <CustomTextField id="ft-dpstrNm" name="dpstrNm" value={params.dpstrNm} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
        </Box>
      </Box>
      <TableContainer style={{margin:'16px 0 2em 0', maxHeight: 300}}>
        <Table
          sx={{ minWidth: 500 }}
          aria-labelledby="tableTitle"
          size={'small'}
        >
          <caption>계좌 목록 조회 테이블</caption>
          <TableHead>
            <TableRow key={'thRow'}>
              {parPrAccTrHeadCells.map((headCell) => (
                <React.Fragment key={'th'+headCell.id}>

                <TableCell
                  align={'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                >
                <div className="table-head-text">
                      {headCell.label}
                </div>
                </TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
          {rows.map((row: any, index) => {
            return (
              <TableRow key={'tr'+index} selected={index === selectedRow}  onClick={() => handleRowClick(index)}>
                <TableCell>
                  {row.vhclNo}
                </TableCell>
                <TableCell>
                  {row.bankNm}
                </TableCell>
                <TableCell>
                  {row.dpstrNm}
                </TableCell>
                <TableCell>
                  {row.actno}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        </Table>
      </TableContainer>

      <TableContainer>
        <Box className="table-bottom-button-group" sx={{mb:2}}>
          <div className="button-right-align">
            <FormModal 
              buttonLabel={'신규등록'} 
              title={'계좌신규등록'} 
              formId='edit-modal'
              formLabel='저장'
              remoteFlag={remoteFlag}
              children={
                <EditModalContent
                  vhclNo={vhclNo}
                  bankCdItems={bankCdItems}
                  onAccDataChange={handleChildDataChange}
                  remoteClose={remoteClose}
              />}            
            />
            <Button variant="outlined" color="primary" onClick={() => deleteAccRow(selectedRow)}>계좌정보 삭제</Button>
          </div>
        </Box>

        <Table className="table table-bordered">
          <TableBody>
            <TableRow>
              <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                예금주명
              </div>
              </TableCell>
              <TableCell colSpan={4}>
                {rows[selectedRow]?.dpstrNm}
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                금융기관
              </div>
              </TableCell>
              <TableCell >
                {rows[selectedRow]?.bankNm}
              </TableCell>
              <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                계좌번호
              </div>
              </TableCell>
              <TableCell >
                {rows[selectedRow]?.actno}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
})

export default AccountModalContent;