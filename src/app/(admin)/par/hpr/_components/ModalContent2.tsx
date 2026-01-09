import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, FormControlLabel, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Checkbox ,MenuItem} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { SelectItem } from 'select';
import { HeadCell } from 'table';
import { Row } from '../page';
//import FormModal from './FormModal';
import FormModal from './FormModal'
import { styled } from '@mui/material/styles';
import {
  getNumtoWon,
  formatDate,
  formBrno,
} from '@/utils/fsms/common/convert'
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import {
  getFormatToday,
  getToday,
  getDateRange,
} from '@/utils/fsms/common/dateUtils'
import { copy } from '@amcharts/amcharts4/.internal/core/utils/Array';
import { listeners } from 'process';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { getCommCd} from '@/utils/fsms/common/comm'
// 경로
import { isNumber } from '@/utils/fsms/common/comm';
import { NewspaperOutlined } from '@mui/icons-material';
import {
  rrNoFormatter
} from '@/utils/fsms/common/util'


function rowGetId(item : Row, index : string){
  return index
}

// 체크박스 전체
interface EnhancedTableProps {
  headCells: HeadCell[]
  numSelected: number
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  rowCount: number
}


function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    headCells,
    onSelectAllClick,
    numSelected,
    rowCount,
  } = props
  return (
    <TableHead>
      <TableRow>
        <TableCell className="td-head td-middle" padding="checkbox" style={{width:'60px'}}>
          <CustomFormLabel className="input-label-none" htmlFor="chkAll">전체선택</CustomFormLabel>
          <CustomCheckbox
            id="chkAll"
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            tabIndex={-1}
            inputProps={{
              'aria-labelledby': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
        <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            style={{width:'112px'}}
        >
              <div className="table-head-text">{headCell.label}</div>
        </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}


// 신규계좌등록
interface EditContentProps {
  bankCdItems: SelectItem[]
  accountRows?: Row[]
  data? : Row
  onAddBank: (row : Row[]) => void;
  remoteClose : () => void;
}


const EditModalContent = (props: EditContentProps) => {
  const {bankCdItems,accountRows,data, onAddBank, remoteClose} = props

  useEffect(() =>{
    setBody((prev) => ({...prev, bankCd : bankCdItems[0].value}))
  }, [])

  const [body, setBody] = useState({
    dpstrNm : '',
    bankCd : '',
    bankNm : '',
    actno : '',
  });

  const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target
    setBody(prev => ({ ...prev, [name]: value }));
  }

  const updateData = (e: React.FormEvent) => {
    e.preventDefault()    
    e.stopPropagation()
    
    if(body.actno != '' && body.dpstrNm != '' && body.bankCd != ''){
      
      if(bankCdItems != null){
        const index = bankCdItems.findIndex(test => test.value == body.bankCd);
        const bankNm = bankCdItems[index].label;
        let temp : any = {
          "vhclNo" : data?.vhclNo
          , "actno" : body.actno
          , "dpstrNm" : body.dpstrNm
          , "bankCd" : body.bankCd
          , "bankNm" : bankNm
          , "checked" : false
        }
        //accountRows((prev) => [({...prev, temp})]);
        accountRows?.push(temp)
      }

  
      if(accountRows){
        onAddBank(accountRows)
        remoteClose();
        alert('신규 계좌 정보가 등록되었습니다.')
      }        
    }else{
      alert('계좌 정보를 다시 입력해주세요.')
    }
  }
  


  return (
    <Box component="form" id="edit-modal" onSubmit={updateData} sx={{mb:2}}>
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
                <CustomTextField id="dpstrNm" name="dpstrNm" value={body.dpstrNm} onChange={handleBodyChange}
                inputProps={{maxLength:50}}/>
              </TableCell>
            </TableRow>
            <TableRow>
            <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                금융기관
              </div>
              </TableCell>
              <TableCell >
                <CustomFormLabel className="input-label-none" htmlFor="sch-bankCd">금융기관</CustomFormLabel>
                <select
                id="sch-bankCd"
                className="custom-default-select"
                name="bankCd"
                value={body.bankCd}
                onChange={handleBodyChange}
                style={{ width: '100%' }}
              >
              {bankCdItems?.map((option) => (
                <option key={option.value} value={option.value} label={option.label}>
                  {option.label}
                </option>
              ))}
                </select>
              </TableCell>
              <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
              <div className="table-head-text td-left">
                계좌번호
              </div>
              </TableCell>
              <TableCell >
                <CustomTextField id="actno" name="actno" value={body.actno} onChange={handleBodyChange}
                inputProps={{maxLength:25}}/>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}


interface ModalContentProps {
  bankCdItems: SelectItem[]
  vhclTonCdItems?: SelectItem[]
  data : Row | undefined
  reload: () =>void
  remoteClose: () => void 
}

const ConfirmModalContent = (props: ModalContentProps) => {
  const {bankCdItems,data, vhclTonCdItems} = props;
  const [row, setRow] = useState<Row>();
  const [accountRow, setAccountRow] = useState<any>();
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>(undefined);
  const [params, setParams] = useState({
    vhclNo : '',
    corpNm : '',
    crnoS : '',
    vonrBrno : '',
    bizSeCd : '',
    koiCd : '',
    dpstrNm : '',
    aplyYm : '',
    useLiter : ''
  });
  const [flag, setFlag] = useState<boolean>(true);

  // 충전월 충전량 state
  const [liters, setLiters] = useState<Row[]>([]);
  

  // 충전정보 체크박스 state
  const [checkedRows, setCheckedRows] = useState<Row[]>([]);
  const [checkedRow, setCheckedRow] = useState<Row|undefined>();

  const [selected, setSelected] = React.useState<readonly string[]>([])

  // 계좌정보
  const [selectAccount, setSelectAccount] = useState<Row>();
  const [accountRows, setAccountRows] = useState<any[]>();

  const remoteClose = () => {
    setRemoteFlag(false);
  }


  // 첫 화면 진입 시
  useEffect(() => {
    const dateRange = getDateRange('m', 0)
    let startDate = dateRange.startDate
    let useLiter = '0';
    if(data != null){
      setRow(data);
      setLiters((prev: any) => [({...prev , aplySttsCd : data?.aplySttsCd , aplyYm: data?.aplyYm, useLiter : data?.useLiter})])
      setAccountRows((prev)=> [(
        {...prev 
        , vhclNo : data?.vhclNo
        , bankNm : data?.bankNm 
        , bankCd : data?.bankCd
        , dpstrNm : data?.dpstrNm
        , actno : data?.actno})])
      setAccountRow(data)
    }
    setParams((prev) => ({...prev , aplyYm : startDate, useLiter : useLiter}))
    setSelectedRow(0);
  }, [])

  useEffect(()=>{
    if((accountRows && accountRows?.length >= 1) && (selectedRow >= 0)){
      setRow((prev : any) => ({
        ...prev 
        , bankNm : accountRows?.[selectedRow].bankNm 
        , bankCd : accountRows?.[selectedRow].bankCd
        , dpstrNm : accountRows?.[selectedRow].dpstrNm
        , actno : accountRows?.[selectedRow].actno})
      )
    }else{
      setRow((prev : any) => ({
        ...prev
        , bankNm : undefined
        , bankCd : undefined
        , dpstrNm : undefined
        , actno : undefined})
      )
    }
  },[accountRow])


  useEffect(() =>{
    setRemoteFlag(true);
  },[remoteFlag])


  // // 체크된 애들만 liter 배열에 넣어줌
  // useEffect(() => {
  //   const temp = liters.filter((item) => item.checked)
  //   setRow((prev : any) => ({...prev, liter : temp}))
  // },[liters])





  // // 차량 조회 버튼 클릭 이벤트
  // const handleAdvancedSearch = (event: React.FormEvent) => {
  //   event.preventDefault()
  //   setParams((prev) => ({ ...prev, vhclNo: params.vhclNo })) // 첫 페이지로 이동
  //   //fetchData();
  // }


  // 차량정보 입력 이벤트
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g
    if(name == 'crnoS' || name =='vonrBrno'){
      if(isNumber(value)){
        setRow((prev : any) => ({...prev, [name]:value.replaceAll(regex, '')}))
      }
    }else if(name =='useLiter'){
      let formattValue = value
      var pattern = /^(?!\.)\d{1,7}(\.\d{0,2})?$/;
      if (/^0{2,}/.test(value)) {
        formattValue = formattValue.slice(0, -1); // 마지막 문자 삭제
      }
      if(!pattern.test(formattValue)){
        formattValue = formattValue.slice(0,-1)
      }
      setRow((prev : any) => ({...prev, [name]:formattValue}))
    }else{
      setRow((prev : any) => ({...prev, [name]:value}))
    }
  }


  // 계좌정보 클릭시
  const handleBankListRowClick = (index: number) => {
    setSelectedRow(index);
    setAccountRow(accountRows?.[index])
  }

  // 신규 계좌 등록
  const onAddBank = (row :Row[]) =>{
    if(row){
      setAccountRows(row);
      handleBankListRowClick(0);
    }
  }


  // 계좌정보 삭제
  const handleBankDelete = (rowIndex: number) =>{
    if(accountRows?.length != 1){
      if(rowIndex >= 0){
        if(confirm('계좌 정보를 삭제 하시겠습니까?')){
          const temp = accountRows?.filter((item,index) => rowIndex !== index)
          setAccountRows(temp);
          //setAccountRow(undefined)
          handleBankListRowClick(0);
        }
      }else{
        alert('삭제할 계좌 정보를 선택해주세요.')
        return
      }
    }else{
      alert('최소 1개의 계좌 정보는 있어야 합니다.')
      return
    }
    
  }

    const updateFunc = async (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      await updateData();
    }

    const updateData = async () => {
      if(!row){
        alert('Row 데이터가 없습니다.')
        return 
      }

  
      // 필수값 검증
      if (!row.vhclNo || row.vhclNo === '') {
        alert('차량번호를 입력해주세요.')
        return
      }
      if (!row.bizSeCd) {
        alert('사업자구분을 입력해주세요.')
        return
      }
      
      if (!row.crno) {
        alert('법인등록번호를 입력해주세요.')
        return
      }
      
      if (!row.corpNm) {
        alert('소유자명을 입력해주세요.')
        return
      }
      
      if (!row.vonrBrno) {
        alert('사업자등록번호를 입력해주세요.')
        return
      }
      
      if (!row.vhclTonCd || row.vhclTonCd == '*') {
        alert('톤수를 입력해주세요.')
        return
      }

      if(!row.useLiter){
        alert('충전량(kg)을 입력해주세요.')
        return
      }

      if(row.useLiter == '0' || row.useLiter == '0.0' || row.useLiter == '0.00' || row.useLiter == '0.'){
        alert('충전량은 0(kg) 일 수 없습니다.')
        return 
      }

      if(row.useLiter.endsWith('.')){
        row.useLiter = row.useLiter.replaceAll('.','');
      }

      if(!accountRows || accountRows.length < 1 || !accountRow){
        alert('계좌정보를 선택해주세요.')
        return
      }

      if(!confirm('수소서면신청 정보를 수정하시겠습니까?')){
        return
      }

      let endpoint: string =`/fsm/par/hpr/tr/updateHydroPaper`
  
      let jsonData = {
        vhclNo: row.vhclNo,
        aplyYm: row.aplyYm,
        useLiter: row.useLiter,
        aplySn: row.aplySn,
        aplySeCd: row.aplySeCd,
        corpNm: row.corpNm,
        crno: row.crno.replaceAll('-', ''),
        vonrBrno: row.vonrBrno.replaceAll('-', ''),
        bizSeCd: row.bizSeCd,
        vhclTonCd: row.vhclTonCd,
        koiCd: 'H',


        bankCd : accountRow.bankCd,  // 선택된 은행관련 정보
        dpstrNm : accountRow.dpstrNm,
        actno : accountRow.actno,
  
  
      }
      
  
      try {
          const response = await sendHttpRequest('PUT',endpoint, jsonData,true,{cache: 'no-store'})
          if (response && response.resultType === 'success') {
            alert(response.message)
            props.reload();
            props.remoteClose();
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.log('error가 발생했습니다.')
          alert(error)
      }
    }


  return (
    <Box component="form" id="put" onSubmit={updateFunc} sx={{mb:2}}>
    <Box style={{minWidth: 1100}}>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h3>신청자정보</h3>
          </CustomFormLabel>
        </Box>

        <TableContainer>
          <Table className="table table-bordered" >
            <TableBody>
              <TableRow>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    차량번호
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="vhclNo"
                  value={row?.vhclNo ?? ''}
                  onChange={handleSearchChange} type="text" id="sch-vhclNo" disabled style={{ width: '100%' }} />
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    소유자명
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="corpNm"
                  value={row?.corpNm ?? ''}
                  onChange={handleSearchChange} type="text" id="sch-corpNm"  disabled={!flag} style={{ width: '100%' }} 
                  inputProps={{maxLength: 50}}/>
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    법인등록번호
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="crnoS"
                    value={row?.crnoS}
                    onChange={handleSearchChange} type="text" id="sch-crno" style={{ width: '100%' }} inputProps={{maxLength: 13}}/>

                  {/* <CustomTextField  name="crnoS"
                  value={row?.crnoS?.length === 13 ? rrNoFormatter(row?.crnoS ?? '') : row?.crnoS ?? ''}
                  onChange={handleSearchChange} type="text" id="sch-crno" disabled={!flag}  style={{ width: '100%' }} 
                  inputProps={{maxLength : 14}}/> */}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    사업자등록번호
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="vonrBrno"
                  value={row?.vonrBrno}
                  onChange={handleSearchChange} type="text" id="sch-vonrBrno"  disabled={!flag} style={{ width: '100%' }} 
                  inputProps={{maxLength : 13}}/>
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    사업구분
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }} colSpan={3}>
                  <RadioGroup
                    row
                    id="chk"
                    className="mui-custom-radio-group"
                    value={row?.bizSeCd ?? ''}
                    //onChange={() => {}}
                    onChange={handleSearchChange}
                    name="bizSeCd"
                  >
                  <FormControlLabel
                    control={<CustomRadio id="chk_01" name="bizSeCd" value="1"/>}
                    label="직영"
                    //disabled={row?.bizSeCd != '1'}
                  />
                  <FormControlLabel
                    control={<CustomRadio id="chk_02" name="bizSeCd" value="2" />}
                    label="위수탁"
                    //disabled={row?.bizSeCd != '2'}
                  />
                  <FormControlLabel
                    control={<CustomRadio id="chk_03" name="bizSeCd" value="3"/>}
                    label="용달"
                    //disabled={row?.bizSeCd != '3'}
                  />
                  <FormControlLabel
                    control={<CustomRadio id="chk_04" name="bizSeCd" value="4"  />}
                    label="개별"
                    //disabled={row?.bizSeCd != '4'}
                  />
                  <FormControlLabel
                    control={<CustomRadio id="chk_05" name="bizSeCd" value="5"  />}
                    label="일반"
                    //disabled={row?.bizSeCd != '5'}
                  />
                </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    유종
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="koiCd"
                  value={row?.koiCd =='H' ? '수소' : ''}
                   type="text" id="sch-koiCd" disabled style={{ width: '100%' }} />
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    톤수
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomFormLabel className="input-label-none" htmlFor="sch-vhclTonCd">톤수</CustomFormLabel>
                  <select
                      id="sch-vhclTonCd"
                      className="custom-default-select"
                      name="vhclTonCd"
                      value={row?.vhclTonCd === '' ? data?.vhclTonCd : row?.vhclTonCd}
                      onChange={handleSearchChange}
                      style={{ width: '100%' }}
                    >
                    {vhclTonCdItems?.map((option) => (
                      <option key={option.value} value={option.value} label={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* <CommSelect                
                    cdGroupNm='971'                   
                    //pValue={row?.vhclTonCd === '' ? data?.vhclTonCd ??'': row?.vhclTonCd ??''}          
                    pValue={row?.vhclTonCd ?? ''}          
                    defaultValue={row?.vhclTonCd}          
                    handleChange={handleSearchChange} 
                    pName='vhclTonCd'                                      
                    htmlFor={'sch-vhclTonCd'}           
                    addText='- 전체 -'      
                    pDisabled={false}          
                  /> */}
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>      
        </TableContainer>

        




        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h3>충전정보</h3>
          </CustomFormLabel>
        </Box>
        <TableContainer>
          <Table className="table table-bordered" >
            <TableBody>
              <TableRow>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                  충전월
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="aplyYm"
                  value={formatDate(row?.aplyYm) ?? ''}
                  onChange={handleSearchChange} type="month" id="sch-aplyYm"   style={{ width: '100%' }} />
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                  충전량(kg)
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField  name="useLiter"
                  value={row?.useLiter ?? ''}
                  onChange={handleSearchChange} type="text" id="sch-useLiter" style={{ width: '100%' }} />
                </TableCell>
                <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text">
                    
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                
                </TableCell>
                </TableRow>
                </TableBody>

          </Table>      
        </TableContainer>

        <Box className='table-bottom-button-group'>
          <CustomFormLabel className="input-label-display">
            <h3>계좌정보</h3>
          </CustomFormLabel>
        </Box>
        <TableContainer>
          <Table className="table table-bordered" >
            <TableBody>
              <TableRow>
                <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
                <div className="table-head-text td-middle">
                  차량번호
                </div>
                </TableCell>
                <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
                <div className="table-head-text td-middle">
                  금융기관
                </div>
                </TableCell>
                <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
                <div className="table-head-text td-middle">
                  예금주명
                </div>
                </TableCell>
                <TableCell className="td-head" scope="row" style={{ width: '130px' }}>
                <div className="table-head-text td-middle">
                  계좌번호
                </div>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableBody>
            {
                accountRows?.length??0 > 0? 
                (
                  accountRows?.map((row: any, index) => (
                  <TableRow key={'tr'+index} selected={index === selectedRow}  onClick={() => handleBankListRowClick(index)}>
                    <TableCell className="td-body" scope="row" style={{ width: '100px', height: '34px'}}>
                      <div className="td-center">
                        {row?.vhclNo}
                      </div>
                    </TableCell>
                    <TableCell className="td-body" scope="row" style={{ width: '100px', height: '34px'}}>
                      <div className="td-center">
                        {row?.bankNm}
                      </div>
                    </TableCell>
                    <TableCell className="td-body" scope="row" style={{ width: '100px', height: '34px' }}>
                      <div className="td-center">
                        {row?.dpstrNm}
                      </div>
                    </TableCell>
                    <TableCell className="td-body" scope="row" style={{ width: '130px', height: '34px' }}>
                      <div className="td-center">
                        {row?.actno}
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                )
              ) : 
              (
                <TableRow>
                <TableCell className="td-body" scope="row" style={{ width: '100px', height: '34px'}}>
                  <div className="td-center">
                        
                  </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '100px', height: '34px'}}>
                <div className="td-center">
                        
                        </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '100px', height: '34px'}}>
                <div className="td-center">
                        
                        </div>
                </TableCell>
                <TableCell className="td-body" scope="row" style={{ width: '130px', height: '34px'}}>
                <div className="td-center">
                        
                        </div>
                </TableCell>
                </TableRow>
              )
            }
            </TableBody>
          </Table>      
        </TableContainer>
        



        <TableContainer>
          <Box className="table-bottom-button-group" sx={{mb:3}}>
            <div className="button-right-align">
              <FormModal 
                buttonLabel={'신규등록'} 
                title={'계좌신규등록'} 
                formId='edit-modal'
                formLabel='저장'
                remoteFlag={remoteFlag}
                children={
                  <EditModalContent
                    bankCdItems={bankCdItems}
                    accountRows={accountRows}
                    data={row}
                    onAddBank={onAddBank}
                    remoteClose={remoteClose}       
                  />}            
              />
              <Button variant='outlined' onClick={() => handleBankDelete(selectedRow)}>계좌정보 삭제</Button>
            </div>
          </Box>
          <Table className="table table-bordered">
            <TableBody>
              <TableRow>
                <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
                <div className="table-head-text td-middle">
                  예금주명
                </div>
                </TableCell>
                <TableCell colSpan={4}>
                  {accountRow?.dpstrNm}
                </TableCell>
              </TableRow>
              <TableRow>
              <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
                <div className="table-head-text td-middle">
                  금융기관
                </div>
                </TableCell>
                <TableCell style={{width: '400px'}}>
                  {accountRow?.bankNm}
                </TableCell>
                <TableCell className="td-head" scope="row" style={{ width: 'px' }}>
                <div className="table-head-text td-middle">
                  계좌번호
                </div>
                </TableCell>
                <TableCell style={{width: '400px'}}>
                  {accountRow?.actno}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
    </Box>
    </Box>
  );
}

export default ConfirmModalContent;