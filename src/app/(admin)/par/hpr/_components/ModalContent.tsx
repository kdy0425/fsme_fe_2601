import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, FormControlLabel, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Checkbox ,MenuItem} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { SelectItem } from 'select';
import { HeadCell } from 'table';
import { Row } from '../page';
//import FormModal from './FormModal';
import FormModal from '../_components/FormModal'
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



const headCells: HeadCell[] = [
  {
      id: 'requestDate',
      numeric: false,
      disablePadding: false,
      label: '처리상태',
  },
  {
      id: 'ownerIdBuisnessNumber',
      numeric: false,
      disablePadding: false,
      label: '충전월',
  },
  {
      id: 'companyName',
      numeric: false,
      disablePadding: false,
      label: '충전량',
  },
]


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
  data : Row[]
  vhclNo: string
  onAddBank: (row : Row[]) => void;
  remoteClose : () => void;
}


const EditModalContent = (props: EditContentProps) => {
  useEffect(() =>{
    setBody((prev) => ({...prev, bankCd : props.bankCdItems[0].value}))
  }, [])


  const {bankCdItems,data, vhclNo, onAddBank, remoteClose} = props
  //const {data, onAddBank, remoteClose} = props
  const [body, setBody] = useState({
    dpstrNm : '',
    bankCd : '',
    bankNm : '',
    actno : '',
  });

  const handleBodyChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target
    if(name == 'actno'){
      if(isNumber(value)){
        setBody(prev => ({ ...prev, [name]: value }));    
      }
    }else{
      setBody(prev => ({ ...prev, [name]: value }));
    }
  }

  const updateData = (e: React.FormEvent) => {
    e.preventDefault()    
    e.stopPropagation()
    
    if(body.actno != '' && body.dpstrNm != '' && body.bankCd != ''){
      if(bankCdItems != null){
        const item = bankCdItems.find(test => test.value == body.bankCd);
        const bankNm = item?.label;

        let temp : any = {
          "vhclNo" : vhclNo  
          , "actno" : body.actno
          , "dpstrNm" : body.dpstrNm
          , "bankCd" : body.bankCd
          , "bankNm" : bankNm
          , "checked" : false
        }
        data?.push(temp)
      }
    
      if(data != null ){
        alert('신규 계좌 정보가 등록되었습니다.')
        onAddBank(data)
        remoteClose();
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
                id="ft-select-02"
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
                {/* <CommSelect                
                    cdGroupNm='973'                   
                    pValue={body.bankCd}          
                    handleChange={handleBodyChange} 
                    pName='bankCd'                                      
                    htmlFor={'sch-bankCd'}           
                    addText='- 전체 -'      
                  /> */}
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
  remoteClose: () => void
  reload: () => void
  locgovCd: string
}

const ConfirmModalContent = (props: ModalContentProps) => {
  const {bankCdItems, reload} = props;
  const [row, setRow] = useState<Row>();
  const [accountRow, setAccountRow] = useState<any>();
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>(undefined);
  const [params, setParams] = useState({
    vhclNo : '',
    corpNm : '',
    crno : '',
    crnoS : '',
    vonrBrno : '',
    bizSeCd : '',
    koiCd : '',
    vhclTonCd : '',
    dpstrNm : '',
    aplyYm : '',
    useLiter : ''
  });
  const [flag, setFlag] = useState<boolean>(true);
  const [vhclFlag, setVhclFlag] = useState<boolean>(false);

  // 충전월 충전량 state
  const [liters, setLiters] = useState<Row[]>([]);
  

  // 충전정보 체크박스 state
  const [checkedRows, setCheckedRows] = useState<Row[]>([]);
  const [checkedRow, setCheckedRow] = useState<Row|undefined>();

  const [selected, setSelected] = React.useState<readonly string[]>([])

  // 계좌정보
  const [selectAccount, setSelectAccount] = useState<Row>();
  const [accountRows, setAccountRows] = useState<Row[]>([]);

  const remoteClose = () => {
    setRemoteFlag(false);
  }



  // 첫 화면 진입 시
  useEffect(() => {
    //fetchAccountData();
    const dateRange = getDateRange('m', 10)
    let startDate = dateRange.endDate
    let useLiter = '';
    setParams((prev) => ({...prev , aplyYm : startDate, useLiter : useLiter}))
  }, [])

  useEffect(() =>{
    setRemoteFlag(true);
  },[remoteFlag])


  // 체크된 애들만 liter 배열에 넣어줌
  useEffect(() => {
    const temp = liters.filter((item) => item.checked)
    setRow((prev: any) => ({...prev, liter : temp}))
  },[liters])

  useEffect(() => {
    setRow((prev : any) => ({...prev, vhclNo: params.vhclNo}))
  }, [params.vhclNo])

  // 차량 검색 후 계좌 정보 있으면 첫행 조회
  useEffect(() =>{
    if(accountRows.length > 0){
      handleBankListRowClick(0);
    }
  },[accountRows])


  // 차량 조회 버튼 클릭 이벤트
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if(params.vhclNo === ''){
      setFlag(true)
      setAccountRows([])
      setParams((prev) => ({ ...prev, vhclNo: params.vhclNo })) 
      alert('차량번호를 입력해주세요.')
      return
    }else if(params.vhclNo.length !== 9){
      setFlag(true)
      setAccountRows([])
      setParams((prev) => ({ ...prev, vhclNo: params.vhclNo })) 
      alert('유효한 차량번호가 아닙니다. 다시 입력해주세요.')
      return
    }else{
      setParams((prev) => ({ ...prev, vhclNo: params.vhclNo })) 
      setVhclFlag(false);
      fetchData();
    }
  }


  // 차량정보 입력 이벤트
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target
    const regex = /[\-~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g

    if(name == 'crnoS' || name == 'vonrBrno'){
      if(isNumber(value)){
          setParams(prev => ({ ...prev, [name]: value.replaceAll(regex, '') }));  
          setRow((prev: any) => ({...prev, [name]:value.replaceAll(regex, '')}));
        }
    }else if(name == 'vhclNo'){
      setVhclFlag(true);
      setParams(prev => ({ ...prev, [name]: value.replaceAll(regex,'').replaceAll(' ','') }));
      setRow((prev: any) => ({...prev, [name]:value.replaceAll(regex,'').replaceAll(' ','')}))
    }
    // else if(name == 'corpNm'){
    //   setParams(prev => ({ ...prev, [name]: value.replaceAll(regex2,'').replaceAll(' ','') }));  
    //   setRow((prev: any) => ({...prev, [name]:value.replaceAll(regex3,'').replaceAll(' ','')}))
    // }
    else if(name =='useLiter'){
      let formattValue = value
      var pattern = /^(?!\.)\d{1,7}(\.\d{0,2})?$/;

      if (/^0{2,}/.test(value)) {
        formattValue = formattValue.slice(0, -1); // 마지막 문자 삭제
      }

      if(!pattern.test(formattValue)){
        formattValue = formattValue.slice(0,-1)
      }
      setParams(prev => ({ ...prev, [name]: formattValue }));  
      setRow((prev: any) => ({...prev, [name]:formattValue}));
    }else{
      setParams(prev => ({ ...prev, [name]: value }));  
      setRow((prev: any) => ({...prev, [name]:value}))
    }
  }




  const isSelected = (index : string) => selected.indexOf(index) !== -1
  

  // 전체 충전정보 체크박스 클릭
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 체크
    if (event.target.checked) {
      const newSelecteds = liters.map((row,index) => (rowGetId(row, index.toString())) ) // 신청 일련번호를 넣어줌 

      const temp = liters.map((item, index) => ({...item, checked : true}))

      setLiters(temp);
      setSelected(newSelecteds)
      setCheckedRows(liters) // 모든 Row들을 선택된 상태로 설정
      return
    }else{ //언체크
      const temp = liters.map((item, index) => ({...item, checked : false}))

      setLiters(temp)
      setSelected([])
      setCheckedRows([]) // 선택된 Row들을 초기화
      return 
    }
  }


  // 단일 충전정보 체크박스 클릭  React.MouseEvent<unknown>
  const handleClick = (event: any, name: string, flag: boolean, row: Row, index : number) => {
    const selectedIndex = selected.indexOf(name)

    let newSelected: readonly string[] = []
    let newSelectedRows: any[] = []

    const temp:Row[] = liters.slice();
    temp.splice(index, 1, {...temp[index], checked:!flag});
    setLiters(temp);
    
    let data : any = []
    data ={
      "aplyYm" : row?.aplyYm,
      "useLiter" : row?.useLiter,
      "checked" : !flag
    }

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
      newSelectedRows = newSelectedRows.concat(checkedRows, data)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
      newSelectedRows = newSelectedRows.concat(checkedRows.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
      newSelectedRows = newSelectedRows.concat(checkedRows.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
      newSelectedRows = newSelectedRows.concat(
        checkedRows.slice(0, selectedIndex),
        checkedRows.slice(selectedIndex + 1),
      )
    }
    

    setSelected(newSelected)
    setCheckedRows(newSelectedRows)
    setCheckedRow(row)
    
  }



  // 충전월, 충전량 추가
  const handleLitersAddRow = (e: React.FormEvent) => {
    if(flag){
      alert('차량 조회 후 이용해주시기 바랍니다.')
      return
    }else if(!params.useLiter){
      alert('충전량을 입력해주시기 바랍니다.')
      return
    }else{
        let data : any;
        data = {
          aplyYm : params.aplyYm.replace('-',''),
          useLiter : params.useLiter.substring(params.useLiter.length -1, params.useLiter.length) 
          === '.' ? params.useLiter.slice(0, params.useLiter.length-1) : params.useLiter,
          checked : false
        }

        if(data.useLiter !== '0' && data.useLiter !== '0.0' && data.useLiter !== '0.00'){
          setLiters((prev) => [...prev, data])
          const dateRange = getDateRange('m', 0);
          const startDate = dateRange.startDate;
          setParams((prev) => ({ ...prev, aplyYm: startDate, useLiter: '' }))
        }else{
          alert('충전량은 0(kg)일 수 없습니다. 다시 등록해주세요.')
          return
        }
    }
  }


  // 충전월, 충전량 삭제
  const handleLitersDeleteRow = (e: React.FormEvent) => {
    if(liters.length == 0){
      return
    }else{

      const temp :Row[] = liters.filter((item) => !item.checked);
      setLiters(temp);
      setSelected([])
      setCheckedRow(undefined)
      setCheckedRows([])
    }
  }
  


  // 계좌정보 클릭시
  const handleBankListRowClick = (index: number) => {
    setSelectedRow(index);
    //setAccountRow(accountRows?.[index])
    setRow((prev: any) => ({...prev , 
      bankCd : accountRows?.[index].bankCd
      , dpstrNm : accountRows?.[index].dpstrNm 
      , actno : accountRows?.[index].actno
      , bankNm : accountRows?.[index].bankNm
    }))
  }

  // 신규 계좌 등록
  const onAddBank = (row :Row[]) =>{
    //setRow((prev) => ({...prev , row}))
    if(row){
      setAccountRows(row);
      handleBankListRowClick(0);
    }
  }


  // 계좌정보 삭제
  const handleBankDelete = (rowIndex: number) =>{
    if(accountRows.length !== 1){
      if(rowIndex >= 0){
        if(confirm('계좌 정보를 삭제 하시겠습니까?')){
          const temp = accountRows?.filter((item,index) => rowIndex !== index)
          setAccountRows(temp);
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

  


  // 차량 조회
  const fetchData = async () => {
    setRow(undefined)
    setAccountRows([])

    try {
      let endpoint: string =
      `/fsm/par/hpr/tr/getHydroVhcle?vhclNo=${params.vhclNo ? params.vhclNo : ''}`
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data.content) {
        // 데이터 조회 성공시
        if(response.data.content[0] != null){
          setFlag(false)
          setRow(response.data.content[0])

          if(response.data.content[0].bankList != null){
            const accountRows = response.data.content[0].bankList;
            setAccountRows(accountRows);
          }

          if(response.data.content[0].gubun === 'carnet'){
            if(response.data.content[0].koiCd !== 'H'){
              alert('현재 자망에서 조회한 차량의 유종은 수소가 아닙니다.')
            }
          }else if(response.data.content[0].gubun === 'hydroReq'){
            alert('최근에 등록한 지급신청 정보를 불러왔습니다.\n신청월 당시의 톤수를 확인하고 진행해주시기 바랍니다.')
          }
        }else{
          alert('차량정보가 없습니다.\n지급신청정보를 직접입력해주세요.')
          setRow((prev : any) => ({...prev, vhclNo: params.vhclNo}))
          setFlag(false)
        }
      } else {
        // 데이터가 없거나 실패
        //setRow(undefined)
        setFlag(true)
      }  
    }catch (error) {
    // 에러시
    console.error('Error fetching data:', error)
    setFlag(true)
    }finally{
      setLiters([])
      setAccountRow(undefined)
    }
  }


  const saveFunc = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await saveData();
    // reloadFn?.();
  }

  
  const saveData = async () => {

    if(vhclFlag){
      alert('차량번호가 변경되었습니다. 다시 검색 후 등록해주시기 바랍니다.')
      return
    }

    if(!row?.vhclNo || params.vhclNo === ''){
      alert('차량번호를 입력해주세요.')
      return
    }

    if (!row?.bizSeCd) {
      alert('사업자구분을 입력해주세요.')
      return
    }
    
    if (!row?.crnoS) {
      alert('법인등록번호를 입력해주세요.')
      return
    }
    
    if (!row?.corpNm) {
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
    
    if(selectedRow === -1){
      alert('계좌정보를 선택해주세요.')
      return
    }

    if(checkedRows.length < 1 ){
      alert('등록할 충전정보가 없습니다. 충전정보를 등록해주세요.')
      return 
    }
  
    if(!row.bankCd){
      alert('금융기관이 없습니다.')
      return
    }

    if(!row.dpstrNm){
      alert('예금주명이 없습니다.')
      return
    }

    if(!row.actno){
      alert('계좌번호가 없습니다.')
      return
    }

    if(!(confirm('수소서면신청을 등록하시겠습니까?'))){
      return
    }
  
    let endpoint: string =`/fsm/par/hpr/tr/createHydroPaper`

    let jsonData = {
      vhclNo: row.vhclNo,
      bizSeCd: row.bizSeCd,
      crno: row.crnoS,
      corpNm: row.corpNm,
      vonrBrno: row.vonrBrno,
      koiCd: 'H',
      vhclTonCd: row.vhclTonCd,


      locgovCd: props.locgovCd, // 검색조건의 관할관청코드

      bankCd : row.bankCd,  // 선택된 은행관련 정보
      actno : row.actno,
      dpstrNm : row.dpstrNm,
      useLitYm : row.liter
      // useLitYm: checkedRows.map((row) => ({
      //   aplyYm: row.aplyYm,
      //   useLiter: row.useLiter,
      // }))// 충전월 + 충전량
    }


    try {
        const response = await sendHttpRequest('POST',endpoint, jsonData,true,{cache: 'no-store'})
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
    <Box component="form" id="post" onSubmit={saveFunc} sx={{mb:2}}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <CustomTextField  name="vhclNo"
                    value={flag == true ? row?.vhclNo : params.vhclNo}
                    onChange={handleSearchChange} type="text" id="sch-vhclNo"  style={{ width: '100%' }}
                    inputProps= {{maxLength : 9}} />
                    <Button variant="contained" onClick={(event) => handleAdvancedSearch(event)} color="dark">
                      검색
                    </Button>
                    </Box>
                  </TableCell>
                  
                  <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                    <div className="table-head-text">
                      소유자명
                    </div>
                  </TableCell>
                  <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                    <CustomTextField  name="corpNm"
                    value={row?.corpNm ?? ''}
                    onChange={handleSearchChange} type="text" id="sch-corpNm"  disabled={flag} style={{ width: '100%' }} 
                    inputProps={{maxLength:50}}/>
                  </TableCell>
                  <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                    <div className="table-head-text">
                      법인등록번호
                    </div>
                  </TableCell>
                  <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                    <CustomTextField  name="crnoS"
                    value={row?.crnoS}
                    onChange={handleSearchChange} type="text" id="sch-crno" disabled={flag}  style={{ width: '100%' }} inputProps={{maxLength: 13}}/>
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
                    onChange={handleSearchChange} type="text" id="sch-vonrBrno"  disabled={flag} style={{ width: '100%' }} inputProps={{maxLength : 13}} />
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
                      onChange={handleSearchChange}
                      name="bizSeCd"
                      //aria-disabled={true}
                      //aria-checked={params.bizSeCd == '2'}
                    >
                      {/* checked={params.bizSeCd == '2'} */}
                    <FormControlLabel
                      control={<CustomRadio id="chk_01" name="bizSeCd" value="1" />}
                      label="직영"
                      disabled={flag}
                    />
                    <FormControlLabel
                      control={<CustomRadio id="chk_02" name="bizSeCd" value="2" />}
                      label="위수탁"
                      disabled={flag}
                    />
                    <FormControlLabel
                      control={<CustomRadio id="chk_03" name="bizSeCd" value="3"  />}
                      label="용달"
                      disabled={flag}
                    />
                    <FormControlLabel
                      control={<CustomRadio id="chk_04" name="bizSeCd" value="4"  />}
                      label="개별"
                      disabled={flag}
                    />
                    <FormControlLabel
                      control={<CustomRadio id="chk_05" name="bizSeCd" value="5"  />}
                      label="일반"
                      disabled={flag}
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
                    {'수소'}
                    {/* <CustomTextField  name="koiCd"
                    // value=   {row?.koiCd =='H' ? '수소 ' : ''}
                    value={'수소'}
                    type="text" id="sch-koiCd" disabled={true} style={{ width: '100%' }} /> */}
                  </TableCell>
                  <TableCell className="td-head td-middle" scope="row" style={{ width: '100px' }}>
                    <div className="table-head-text">
                      톤수
                    </div>
                  </TableCell>
                  <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
				    <CustomFormLabel className="input-label-none" htmlFor="sch-vhclTonCd">톤수</CustomFormLabel>
                    <CommSelect                
                      cdGroupNm='971'                   
                      pValue={row?.vhclTonCd ?? ''}          
                      handleChange={handleSearchChange} 
                      pName='vhclTonCd'                                      
                      htmlFor={'sch-vhclTonCd'}           
                      addText='- 전체 -'      
                      pDisabled={flag}          
                    />
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
   			  <caption>충전 정보 테이블</caption>
              <EnhancedTableHead
                headCells={headCells}
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
                rowCount={liters.length}
              />
              <TableBody>
              { 
                  liters.length > 0 ? (
                      liters.map((item, index) => {
                        const ins = index.toString()
                        const isItemSelected = isSelected(ins)
                        const labelId = `enhanced-table-checkbox-${index}`

                        return (
                          <TableRow
                            hover
                            key={`tr${index}`}
                            //onClick={(event) => handleChecked(isItemSelected, index)}
                            onClick={(event) => handleClick(event, rowGetId(item,ins), isItemSelected, item, index)}                          
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            selected={isItemSelected}
                          >
                            <TableCell className="td-body td-center" padding="checkbox" style={{ width: '60px' }}>
							  <CustomFormLabel className="input-label-none" htmlFor={'tr' + index}>선택</CustomFormLabel>
							  <CustomCheckbox
							    id={'tr' + index}
                                checked={isItemSelected}
                                inputProps={{
                                  'aria-labelledby': labelId,
                                }}
                                //onClick={(event) => handleChecked(isItemSelected, index)}
                              />
                            </TableCell>
                            <TableCell className="td-body td-center" scope="row" style={{ width: '100px' }}>
                            <div className="table-body-text">
                              {/* {formatDate(item.aplyYm)} */}
                              {/* {'정산요청'} */}
                              {item.aplySttsCd  ?? '정산요청'}
                            </div>
                          </TableCell>
                        
                          <TableCell className="td-body td-center" scope="row" style={{ width: '100px' }}>
                            <div className="table-body-text">
                            {formatDate(item.aplyYm)}
                            </div>
                          </TableCell>
                          <TableCell className="td-body td-right" scope="row" style={{ width: '100px'}}>
                                <div className="table-body-text">
                                {item.useLiter}
                                </div>
                          </TableCell>
                          </TableRow>
                        )
                        })
                    ) : 
                    (
                      <TableRow>
                      <TableCell className="td-body" scope="row" style={{ width: '60px', height: '47px'}}>
                        <div className="td-center">
                              
                        </div>
                      </TableCell>
                      <TableCell className="td-body" scope="row" style={{ width: '112px', height: '34px'}}>
                      <div className="td-center">
                              
                              </div>
                      </TableCell>
                      <TableCell className="td-body" scope="row" style={{ width: '112px', height: '34px'}}>
                      <div className="td-center">
                              
                              </div>
                      </TableCell>
                      <TableCell className="td-body" scope="row" style={{ width: '112px', height: '34px'}}>
                      <div className="td-center">
                              
                      </div>
                      </TableCell>
                      </TableRow>
                    )
              }
              </TableBody>
            </Table>      
          </TableContainer>


          {/* 충전정보를 등록  */}
          <Box className="table-bottom-button-group" sx={{mb:2}}>
          <div className="button-right-align">
            <Button variant="outlined" color="primary" onClick={(event) => handleLitersAddRow(event)}>
              등록
            </Button>
            <Button 
            variant="outlined" color="primary" onClick={(event) => handleLitersDeleteRow(event)}>
              삭제
            </Button>
          </div>
          </Box>

          {/* inputProps={{max: params.endDt}} */}
          <TableContainer>
            
            <Table className="table table-bordered" >
              <TableBody>
                <TableRow>
                  <TableCell className="td-head td-left" scope="row" style={{ width: '100px' }}>
                    <div className="table-head-text">
                      충전월
                    </div>
                  </TableCell>
                  <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                  <CustomTextField type="month" id="ft-aplyYm" name="aplyYm"  onChange={handleSearchChange}  value={params.aplyYm}  fullWidth />
                  </TableCell>
                  <TableCell className="td-head td-left" scope="row" style={{ width: '100px' }}>
                    <div className="table-head-text">
                      충전량(kg)
                    </div>
                  </TableCell>
                  <TableCell className="td-body" scope="row" style={{ width: '20%' }}>
                    <CustomTextField  name="useLiter"
                    value={params.useLiter}
                    onChange={handleSearchChange} type="text"
                    id="sch-useLiter"   style={{ width: '100%' }} default="0"/>
                  </TableCell>
                  <TableCell className="td-head" scope="row" style={{ width: '100px' }}>

                  </TableCell>
                  <TableCell className="td-body" scope="row" style={{ width: '100px' }}>

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
                  accountRows.length > 0? 
                  (
                    accountRows.map((row: any, index) => 
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
                  flag={flag}
                  remoteFlag={remoteFlag}
                  children={
                    <EditModalContent
                      bankCdItems={bankCdItems}
                      data={accountRows}
                      vhclNo= {params.vhclNo}
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
                    {row?.dpstrNm}
                  </TableCell>
                </TableRow>
                <TableRow>
                <TableCell className="td-head" scope="row" style={{ width: '100px' }}>
                  <div className="table-head-text td-middle">
                    금융기관
                  </div>
                  </TableCell>
                  <TableCell style={{width: '400px'}}>
                    {row?.bankNm}
                  </TableCell>
                  <TableCell className="td-head" scope="row" style={{ width: 'px' }}>
                  <div className="table-head-text td-middle">
                    계좌번호
                  </div>
                  </TableCell>
                  <TableCell style={{width: '400px'}}>
                    {row?.actno}
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