import AddrSearchModal, { AddrRow } from '@/app/components/popup/AddrSearchModal2';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { apvAcsimChainTrHeadCells } from '@/utils/fsms/headCells';
import { getUserInfo } from '@/utils/fsms/utils';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Row } from '../page';
import TableDataGrid from './CustomTableDataGrid';

interface ModalProperties {
  reloadFn?: () => void
}

const RegisterModalContent = (props: ModalProperties) => {
  const { reloadFn } = props;
  const [flag, setFlag] = useState<boolean>(false); // 데이터 갱신을 위한 플래그 설정
  const [params, setParams] = useState({
    frcsBrno: "",
    frcsNm: "",
    frcsTlphonDddCd:"",
    telno: "",
    zip:"",
    daddr: "",
  });

  const [body, setBody] = useState({
    frcsBrno: "",
    shFrcsCdNo: "",
    wrFrcsCdNo: "",
    kbFrcsCdNo: "",
    ssFrcsCdNo: "",
    hdFrcsCdNo: "",
    rprsvNm: "",
    frcsTlphonDddCd: "",
    telno: "",
    zip: "",
    daddr: "",
    frcsNm: "",
    locgovCd: "",
  })

  const [shRows, setShRows] = useState<Row[]>([]); // 신한
  const [kbRows, setKbRows] = useState<Row[]>([]); // 국민
  const [wrRows, setWrRows] = useState<Row[]>([]); // 우리
  const [ssRows, setSsRows] = useState<Row[]>([]); // 삼성
  const [hdRows, setHdRows] = useState<Row[]>([]); // 현대

  const [shSelected, setShSelected] = useState<number>(-1);
  const [kbSelected, setKbSelected] = useState<number>(-1);
  const [wrSelected, setWrSelected] = useState<number>(-1);
  const [ssSelected, setSsSelected] = useState<number>(-1);
  const [hdSelected, setHdSelected] = useState<number>(-1);

  // 각 Grid의 체크해제를 위한 state
  const [shCheck, setShCheck] = useState<boolean>(false);
  const [kbCheck, setKbCheck] = useState<boolean>(false);
  const [wrCheck, setWrCheck] = useState<boolean>(false);
  const [ssCheck, setSsCheck] = useState<boolean>(false);
  const [hdCheck, setHdCheck] = useState<boolean>(false);
  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false);

  // 회원정보
  const userInfo = getUserInfo();

  // 초기 데이터 로드
  useEffect(() => {
    setFlag(prev => !prev)
  }, [])

  // 초기화
  useEffect(() => {
    // 체크해제
    setShCheck(prev => !prev)
    setKbCheck(prev => !prev)
    setWrCheck(prev => !prev)
    setSsCheck(prev => !prev)
    setHdCheck(prev => !prev)
    // 선택정보 clear
    setShSelected(-1)
    setKbSelected(-1)
    setWrSelected(-1)
    setSsSelected(-1)
    setHdSelected(-1)
    // 재조회시 입력란 clear
    setBody((prev) => {
      return Object.fromEntries(
        Object.entries(prev).map(([key]) => [key, ""]) // 값 초기화
      ) as typeof prev; // 타입 캐스팅
    });
  }, [flag])

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }
  const handleBodyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setBody((prev) => ({ ...prev, [name]: value }))
  }

  const fetchData = async () => {
    try {

      if(!params.frcsBrno) {
        alert('사업자등록번호를 입력해주세요.')
        return;
      }

      let endpoint: string = `/fsm/apv/acsim/tr/getAllChain?frcsBrno=${params.frcsBrno.replaceAll('-', '')}`
      + `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}`
      + `${params.telno ? '&telno=' + params.telno : ''}`
      + `${params.daddr ? '&daddr=' + params.daddr : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        let shArr:Row[] = [];
        let kbArr:Row[] = [];
        let wrArr:Row[] = [];
        let ssArr:Row[] = [];
        let hdArr:Row[] = [];

        response.data.map((res: Row) => {
          let crdcoCd = res.crdcoCd
          res.daddrFull = '(' + res.zip + ') ' + res.daddr;

          switch(crdcoCd) {
            case '088' : // 신한
              if(res.shFrcsCdNo) res.color = 'blue'
              shArr.push(res); 
              break;
            case '004' : // 국민
              if(res.kbFrcsCdNo) res.color = 'blue'
              kbArr.push(res);
              break;
            case '020' : // 우리
              if(res.wrFrcsCdNo) res.color = 'blue'  
              wrArr.push(res);
              break;
            case '365' : // 삼성
              if(res.ssFrcsCdNo) res.color = 'blue'
              ssArr.push(res);
              break;
            case '367' : // 현대
              if(res.hdFrcsCdNo) res.color = 'blue'
              hdArr.push(res);
            default : break;
          }
        })

        setShRows(shArr);
        setKbRows(kbArr);
        setWrRows(wrArr);
        setSsRows(ssArr);
        setHdRows(hdArr);
      }else{
        alert(response.message);
      }
    }catch(error) {
      console.error("Error :: ", error);
    }
  }

  const sendData = async () => {
    try {

      if(!body.frcsBrno.replaceAll('-', '')) {
        alert('사업자등록번호를 필수로 입력해야 합니다.')
        return;
      }
      if(!body.frcsNm) {
        alert('가맹점명을 필수로 입력해야 합니다.')
        return;
      }
      if(!body.frcsTlphonDddCd) {
        alert('연락처의 지역번호를 필수로 입력해야 합니다.')
        return;
      }
      if(!body.telno) {
        alert('연락처를 필수로 입력해야 합니다.')
        return;
      }
      if(!body.rprsvNm) {
        alert('대표자명을 필수로 입력해야 합니다.')
        return;
      }
      if(!body.daddr) {
        alert('상세주소를 필수로 입력해야 합니다.')
        return;
      }

      const userConfirm = confirm('주유량확인시스템 주유소 정보를 등록하시겠습니까?')
      if(!userConfirm) return;

      let endpoint: string = `/fsm/apv/acsim/tr/createAogCnfirmSysInstlMng`;

      // 선택 상태 확인
      const selectedStates = [shSelected, kbSelected, wrSelected, ssSelected, hdSelected];

      // 각 선택 값에 따라 가맹점번호 반환
      const getFrcsCdNo = (selected: number, rows: any[]) => {
        return selected > -1 ? rows[selected]?.frcsCdNo : ''
      }

      if(selectedStates.every((selected) => selected === -1)) {
        alert('선택된 주유(충전)소가 없습니다.')
        return;
      }
      
      // 요청 데이터 생성
      const formData = {
        ...body,
        frcsNm:body.frcsNm,
        rprsvNm:body.rprsvNm,
        zip:body.zip.replaceAll('-', ''),
        daddr:body.daddr,
        shFrcsCdNo: getFrcsCdNo(shSelected, shRows),
        kbFrcsCdNo: getFrcsCdNo(kbSelected, kbRows),
        wrFrcsCdNo: getFrcsCdNo(wrSelected, wrRows),
        ssFrcsCdNo: getFrcsCdNo(ssSelected, ssRows),
        hdFrcsCdNo: getFrcsCdNo(hdSelected, hdRows),
        locgovCd: userInfo.locgovCd
      }

      const response = await sendHttpRequest('POST', endpoint, formData, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
        reloadFn?.();
      }else{
        alert(response.message);
      }

    }catch(error) {
      console.error("ERROR :: ", error);
    }
  }

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await sendData();
  }

  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    fetchData()
    setFlag(prev => !prev)
  }

  const handleSHCheckChange = (selected:number, isChecked:boolean) => {
    // 체크여부 및 index 확인
    if(isChecked && selected > -1) {
      const row = shRows[selected]
      // 특별관리 주유소 등록된 데이터인지 확인
      if(shRows[selected].shFrcsCdNo){
        alert('이미 주유량확인시스템 정보가 등록된 가맹점번호입니다')
        setShCheck(prev => !prev)
        return;
      }
      // 선택한 rowIndex
      setShSelected(selected);

      setBody((prev) => ({
        ...prev,
        frcsBrno: row.frcsBrno,
        frcsNm: row.frcsNm,
        frcsTlphonDddCd: row.frcsTlphonDddCd,
        telno: row.telno,
        rprsvNm: row.rprsvNm,
        zip: row.zip,
        daddr: row.daddr,
      }))
    }else{
      setShSelected(-1);
    }
  }
  const handleKBCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      const row = kbRows[selected];

      if(row.kbFrcsCdNo){
        alert('이미 주유량확인시스템 정보가 등록된 가맹점번호입니다')
        setKbCheck(prev => !prev)
        return;
      }
      setKbSelected(selected);

      setBody((prev) => ({
        ...prev,
        frcsBrno: row.frcsBrno.replaceAll('-', ''),
        frcsNm: row.frcsNm,
        frcsTlphonDddCd: row.frcsTlphonDddCd,
        telno: row.telno,
        rprsvNm: row.rprsvNm,
        zip: row.zip,
        daddr: row.daddr,
      }))
    }else{
      setKbSelected(-1);
    }
  }
  const handleWRCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      const row = wrRows[selected];
      if(wrRows[selected].wrFrcsCdNo){
        alert('이미 주유량확인시스템 정보가 등록된 가맹점번호입니다')
        setWrCheck(prev => !prev)
        return;
      }
      setWrSelected(selected);

      setBody((prev) => ({
        ...prev,
        frcsBrno: row.frcsBrno.replaceAll('-', ''),
        frcsNm: row.frcsNm,
        frcsTlphonDddCd: row.frcsTlphonDddCd,
        telno: row.telno,
        rprsvNm: row.rprsvNm,
        zip: row.zip,
        daddr: row.daddr,
      }))
    }else {
      setWrSelected(-1);
    }
  }
  const handleSSCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      const row = ssRows[selected]
      if(ssRows[selected].ssFrcsCdNo){
        alert('이미 주유량확인시스템 정보가 등록된 가맹점번호입니다')
        setSsCheck(prev => !prev)
        return;
      }
      setSsSelected(selected);

      setBody((prev) => ({
        ...prev,
        frcsBrno: row.frcsBrno.replaceAll('-', ''),
        frcsNm: row.frcsNm,
        frcsTlphonDddCd: row.frcsTlphonDddCd,
        telno: row.telno,
        rprsvNm: row.rprsvNm,
        zip: row.zip,
        daddr: row.daddr,
      }))
    }else {
      setSsSelected(-1);
    }
  }
  const handleHDCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      const row = hdRows[selected]
      if(hdRows[selected].hdFrcsCdNo){
        alert('이미 주유량확인시스템 정보가 등록된 가맹점번호입니다')
        setHdCheck(prev => !prev)
        return;
      }
      setHdSelected(selected);

      setBody((prev) => ({
        ...prev,
        frcsBrno: row.frcsBrno.replaceAll('-', ''),
        frcsNm: row.frcsNm,
        frcsTlphonDddCd: row.frcsTlphonDddCd,
        telno: row.telno,
        rprsvNm: row.rprsvNm,
        zip: row.zip,
        daddr: row.daddr,
      }))
    }else{
      setHdSelected(-1);
    }
  }

  const getAddress = (row: AddrRow, daddr: string) => {
    setBody((prev) => ({
      ...prev,
      zip: row.zipNo,
      daddr: `${row.roadAddr ?? ""} ${daddr ?? ""}`
    }))

    setAddrModalOpen(false)
  }

  
  return (
    <Box sx={{minWidth:1000}}>
      <Box component="form" id="search-data" onSubmit={handleAdvancedSearch} sx={{ mb: 1 }}>
        <Box className="sch-filter-box" sx={{ mt: 1 }}>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsBrno" required>
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField 
                id="ft-frcsBrno" 
                name="frcsBrno" 
                value={params.frcsBrno}
                onChange={handleSearchChange} 
                inputProps={{
                  inputMode: 'text',
                  maxLength: 20,
                }} 
                fullWidth 
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-frcsNm">가맹점명</CustomFormLabel>
              <CustomTextField
                id="ft-frcsNm"
                name="frcsNm"
                value={params.frcsNm}
                onChange={handleSearchChange}
                inputProps={{
                  inputMode: 'text',
                  maxLength: 100,
                }} 
                fullWidth
              />
            </div>
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-telno">연락처</CustomFormLabel>
              <CustomTextField
                id="ft-telno"
                name="telno"
                value={params.telno}
                onChange={handleSearchChange}
                fullWidth
              />
            </div>
          </div>
          <hr></hr>
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel className="input-label-display" htmlFor="ft-daddr">주소</CustomFormLabel>
              <CustomTextField
                id="ft-daddr"
                name="daddr"
                value={params.daddr}
                onChange={handleSearchChange}
                inputProps={{
                  inputMode: 'text',
                  maxLength: 200,
                }} 
                fullWidth
              />
            </div>
          </div>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <CustomFormLabel className="input-label-display">
          <h3>신한 가맹점정보</h3>
        </CustomFormLabel>
        <TableDataGrid 
          headCells={apvAcsimChainTrHeadCells} 
          rows={shRows} 
          loading={false}
          onCheckChange={handleSHCheckChange}
          isCheck={shCheck}
          caption={"신한 가맹점정보 목록 조회"}
        />

        <CustomFormLabel className="input-label-display">
          <h3>KB 가맹점정보</h3>
        </CustomFormLabel>
        <TableDataGrid 
          headCells={apvAcsimChainTrHeadCells} 
          rows={kbRows} 
          loading={false}
          onCheckChange={handleKBCheckChange}
          isCheck={kbCheck}
          caption={"KB 가맹점정보 목록 조회"}
        />
        
        <CustomFormLabel className="input-label-display">
          <h3>우리 가맹점정보</h3>
        </CustomFormLabel>
        <TableDataGrid 
          headCells={apvAcsimChainTrHeadCells} 
          rows={wrRows} 
          loading={false}
          onCheckChange={handleWRCheckChange}
          isCheck={wrCheck}
          caption={"우리리 가맹점정보 목록 조회"}
        />

        <CustomFormLabel className="input-label-display">
          <h3>삼성 가맹점정보</h3>
        </CustomFormLabel>
        <TableDataGrid 
          headCells={apvAcsimChainTrHeadCells} 
          rows={ssRows} 
          loading={false}
          onCheckChange={handleSSCheckChange}
          isCheck={ssCheck}
          caption={"삼성 가맹점정보 목록 조회"}
        />

        <CustomFormLabel className="input-label-display">
          <h3>현대 가맹점정보</h3>
        </CustomFormLabel>
        <TableDataGrid 
          headCells={apvAcsimChainTrHeadCells} 
          rows={hdRows} 
          loading={false}
          onCheckChange={handleHDCheckChange}
          isCheck={hdCheck}
          caption={"현대 가맹점정보 목록 조회"}
        />
      </Box>

      <Box component="form" id="register-data" onSubmit={submitForm}>
        <TableContainer className="table-scrollable">
          <Table className="table table-bordered">
            <TableBody>
              <TableRow>
                <TableCell className='td-head td-left' style={{whiteSpace:'nowrap', width:'100px'}}>
                  사업자등록번호
                </TableCell>
                <TableCell>
                  <CustomFormLabel className="input-label-none" htmlFor="frcsBrno">사업자등록번호</CustomFormLabel>
                  <CustomTextField 
                    name="frcsBrno"
                    id="frcsBrno"
                    value={body.frcsBrno || ""} 
                    onChange={handleBodyChange} 
                    readOnly
                    fullWidth
                  />
                </TableCell>
                <TableCell className='td-head td-left' style={{whiteSpace:'nowrap', width:'100px'}}>
                  가맹점명
                </TableCell>
                <TableCell>
                  <CustomFormLabel className="input-label-none" htmlFor="frcsNm">가맹점명</CustomFormLabel>
                  <CustomTextField 
                    name="frcsNm" 
                    id="frcsNm"
                    value={body.frcsNm || ""} 
                    onChange={handleBodyChange}
                    inputProps={{
                      inputMode: 'text',
                      maxLength: 100,
                    }} 
                    fullWidth
                    />
                </TableCell>
                <TableCell className='td-head td-left' style={{whiteSpace:'nowrap', width:'100px'}}>
                  연락처
                </TableCell>
                <TableCell>
                <div style={{display: 'flex', gap: '8px'}} >
                  <CustomFormLabel className="input-label-none" htmlFor="frcsTlphonDddCd">연락처</CustomFormLabel>
                  <CustomTextField 
                    name="frcsTlphonDddCd" 
                    id="frcsTlphonDddCd"
                    value={body.frcsTlphonDddCd || ""} 
                    onChange={handleBodyChange} 
                    style={{width:'1rem'}}
                  />
                  <CustomFormLabel className="input-label-none" htmlFor="telno">전화번호</CustomFormLabel>
                  <CustomTextField  
                    name="telno" 
                    id="telno"
                    value={body.telno || ""} 
                    onChange={handleBodyChange} 
                  />
                </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='td-head td-left'>
                  대표자명
                </TableCell>
                <TableCell>
                  <CustomFormLabel className="input-label-none" htmlFor="rprsvNm">대표자명</CustomFormLabel>
                  <CustomTextField
                    name="rprsvNm" 
                    id="rprsvNm"
                    value={body.rprsvNm || ""} 
                    onChange={handleBodyChange} 
                    inputProps={{
                      inputMode: 'text',
                      maxLength: 50,
                    }}
                    required
                    fullWidth
                  />
                </TableCell>
                <TableCell className='td-head td-left'>
                </TableCell>
                <TableCell>
                </TableCell>
                <TableCell className='td-head td-left'>
                </TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='td-head td-left'>
                  상세주소
                </TableCell>
                <TableCell colSpan={5}>
                  <div style={{display: 'flex', gap: '8px'}} >
                    <CustomFormLabel className="input-label-none" htmlFor="zip">우편번호</CustomFormLabel>
                    <CustomTextField 
                      name='zip'
                      id='zip'
                      value={body.zip || ""}
                      onClick={() => setAddrModalOpen(true)}
                      onChange={handleBodyChange}
                      inputProps={{
                        inputMode: 'text',
                        readOnly: true,
                        maxLength: 6,
                      }}
                      readOnly 
                      />
                    <CustomFormLabel className='input-label-none' htmlFor="daddr">주소</CustomFormLabel>
                    <CustomTextField 
                      name='daddr'
                      id="daddr"
                      value={body.daddr || ""}
                      onClick={() => setAddrModalOpen(true)}
                      onChange={handleBodyChange}
                      inputProps={{
                        inputMode: 'text',
                        readOnly: true,
                        maxLength: 200,
                      }}
                      sx={{width:'50%'}}
                      readOnly 
                    />
                    <Button onClick={() => setAddrModalOpen(true)}>선택</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <AddrSearchModal 
          open={addrModalOpen}
          onSaveClick={getAddress} 
          onCloseClick={() => setAddrModalOpen(false)}        
        />
      </Box>
    </Box>
  );
}

export default RegisterModalContent;