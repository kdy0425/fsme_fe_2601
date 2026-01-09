import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { apvCoamChainTrHeadCells } from '@/utils/fsms/headCells'
import { Row } from '../page';
import TableDataGrid from '../_components/CustomTableDataGrid'
import { styled } from '@mui/material/styles'
import { getUserInfo } from '@/utils/fsms/utils'

interface ModalProperties {
  reloadFn?: () => void
}

const RegisterModalContent = (props: ModalProperties) => {
  const { reloadFn } = props;
  const [flag, setFlag] = useState<boolean>(false); // 데이터 갱신을 위한 플래그 설정
  const [params, setParams] = useState({
    frcsBrno: "",
    frcsNm: "",
    telNo: "",
    daddr: "",
    bltBgngYmd: generateDateRange().startDate, // 최소 오늘날짜 3개월 이후
    bltEndYmd: generateDateRange().endDate, // 최소 시작일짜 3년 이후
    bltRsnCn: ""
  });

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
  }, [flag])

  function generateDateRange() {
    // 오늘 날짜
    const today = new Date();
  
    // 3개월 이후 날짜
    const startDate = new Date();
    startDate.setMonth(today.getMonth() + 3);
  
    // startDate로부터 3년 이후 날짜
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 3);
  
    // yyyy-mm-dd 형식으로 변환하는 함수
    function formatDate(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  
    // JSON 반환
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  }

  function checkDate1(startDate: string) {
    // 오늘 날짜
    const today = new Date();
  
    // 오늘로부터 3개월 이후 날짜
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 3);
  
    // 입력된 날짜를 Date 객체로 변환
    const enteredDate = new Date(startDate);

    // 날짜를 기준으로 시분초를 00:00:00으로 통일
    function setToStartOfDay(date: Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 날짜만 비교하기 위해 시분초 제거
    const normalizedToday = setToStartOfDay(today);
    const normalizedFutureDate = setToStartOfDay(futureDate);
    const normalizedEnteredDate = setToStartOfDay(enteredDate);

    // 입력 날짜가 오늘로부터 3개월 이후보다 이전인지 확인
    if (normalizedEnteredDate < normalizedFutureDate) {
      return false;
    }else {
      return true;
    }
  }

  function checkDate2(endDate: string) {
    // 오늘 날짜
    const today = new Date();

    // 시작일 : 3개월 이후 날짜
    const startDate = new Date(params.bltBgngYmd);
  
    // 시작일부터 3년 이후 날짜
    const futureDate = new Date(params.bltBgngYmd);
    futureDate.setFullYear(startDate.getFullYear() + 3);
  
    // 입력된 날짜를 Date 객체로 변환
    const enteredDate = new Date(endDate);

    // 날짜를 기준으로 시분초를 00:00:00으로 통일
    function setToStartOfDay(date: Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 날짜만 비교하기 위해 시분초 제거
    const normalizedToday = setToStartOfDay(today);
    const normalizedFutureDate = setToStartOfDay(futureDate);
    const normalizedEnteredDate = setToStartOfDay(enteredDate);

    // 입력 날짜가 시작일자로부터 3년 이후보다 이전인지 확인
    if (normalizedEnteredDate < normalizedFutureDate) {
      return false;
    }else {
      return true;
    }
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    if (name === 'bltBgngYmd' || name === 'bltEndYmd') {
      const otherDateField =
        name === 'bltBgngYmd' ? 'bltEndYmd' : 'bltBgngYmd'
      const otherDate = params[otherDateField]

      if (isValidDateRange(name, value, otherDate)) {
        if(name == 'bltBgngYmd') {
          if(!checkDate1(value)) {
            alert("특별관리 발효(시작)일자는 오늘날짜로 부터 최소 3개월 이후로 설정하셔야 합니다.\n\n특별관리주유소 발효시 유예기간은 최소 3개월입니다.")
            return;
          }
        }

        if(name == 'bltEndYmd') {
          if(!checkDate2(value)) {
            alert("특별관리 기간은 시작일로부터 최소 3년입니다.\n\n해당 주유(충전)소의 부정수급 가담적발시 특별관리기간은 다음과 같습니다.\n\n- 1회 적발시 3년\n- 2회이상 적발시 5년\n- 1회 위반으로 정지된 날부터 5년 내에 적발시 영구정지")
            return;
          }
        }
        setParams((prev) => ({ ...prev, [name]: value }))
      } else {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
      }
    } else {
      setParams((prev) => ({ ...prev, [name]: value }))
    }
  }

  // 시작일과 종료일 비교
  const isValidDateRange = (
    changedField: string,
    changedValue: string,
    otherValue: string | undefined,
  ): boolean => {
    if (!otherValue) return true

    const changedDate = new Date(changedValue)
    const otherDate = new Date(otherValue)

    if (changedField === 'bltBgngYmd') {
      return changedDate <= otherDate
    } else {
      return changedDate >= otherDate
    }
  }

  const fetchData = async () => {
    try {
      if(!params.frcsBrno.replaceAll('-', '')) {
        alert('사업자등록번호를 입력해주세요.')
        return;
      }

      let endpoint: string = `/fsm/apv/coam/tr/getAllChain?frcsBrno=${params.frcsBrno.replaceAll('-', '')}`
      + `${params.frcsNm ? '&frcsNm=' + params.frcsNm : ''}`
      + `${params.telNo ? '&telNo=' + params.telNo : ''}`
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
              if(res.shFrcsCdNo) res.color = 'red'
              shArr.push(res); 
              break;
            case '004' : // 국민
              //res.kbFrcsCdNo = '1234567890'  // test
              if(res.kbFrcsCdNo) res.color = 'red'
              kbArr.push(res);
              break;
            case '020' : // 우리
              if(res.wrFrcsCdNo) res.color = 'red'
              wrArr.push(res);
              break;
            case '365' : // 삼성
              if(res.ssFrcsCdNo) res.color = 'red'
              ssArr.push(res);
              break;
            case '367' : // 현대
              if(res.hdFrcsCdNo) res.color = 'red'
              hdArr.push(res);
            default : break;
          }
        })

        setShRows(shArr);
        setKbRows(kbArr);
        setWrRows(wrArr);
        setSsRows(ssArr);
        setHdRows(hdArr);
      }
    }catch(error) {
      console.error("Error :: ", error);
    }
  }

  const sendData = async () => {
    try {
      const userConfirm = confirm('특별관리주유소 정보를 등록하시겠습니까?')
      if(!userConfirm) return;

      let endpoint: string = `/fsm/apv/coam/tr/createCousmOlt`;

      // 선택 상태 확인
      const selectedStates = [shSelected, kbSelected, wrSelected, ssSelected, hdSelected];

      // 각 선택 값에 따라 가맹점번호 반환
      const getFrcsCdNo = (selected: number, rows: any[]) => {
        return selected > -1 ? rows[selected]?.frcsCdNo : ''
      }

      // 선택 값 중 가맹점명 반환
      const getFrcsNm = () => {
        if (shSelected > -1) return shRows[shSelected]?.frcsNm
        if (kbSelected > -1) return kbRows[kbSelected]?.frcsNm
        if (wrSelected > -1) return wrRows[wrSelected]?.frcsNm
        if (ssSelected > -1) return ssRows[ssSelected]?.frcsNm
        if (hdSelected > -1) return hdRows[hdSelected]?.frcsNm
      }

      if(selectedStates.every((selected) => selected === -1)) {
        alert('선택된 주유(충전)소가 없습니다.')
        return;
      }

      if(!params.bltBgngYmd.replaceAll('-', '')) {
        alert('특별관리 발효(시작)일자는 필수입력항목 입니다.')
        return;
      }

      if(!params.bltEndYmd.replaceAll('-', '')) {
        alert('특별관리 종료일자는 필수입력항목 입니다.')
        return;
      }
      
      if(!params.bltRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
        alert('특별관리 사유를 입력해주세요.')
        return;
      }

      if(params.bltRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
        alert('특별관리 사유를 30자리 이하로 입력해주시기 바랍니다.')
        return
      }
      
      // 요청 데이터 생성
      const body = {
        frcsBrno: params.frcsBrno.replaceAll('-', ''),
        frcsNm: getFrcsNm(),
        shFrcsCdNo: getFrcsCdNo(shSelected, shRows),
        kbFrcsCdNo: getFrcsCdNo(kbSelected, kbRows),
        wrFrcsCdNo: getFrcsCdNo(wrSelected, wrRows),
        ssFrcsCdNo: getFrcsCdNo(ssSelected, ssRows),
        hdFrcsCdNo: getFrcsCdNo(hdSelected, hdRows),
        bltBgngYmd: params.bltBgngYmd.replaceAll('-', ''),
        bltEndYmd: params.bltEndYmd.replaceAll('-', ''),
        bltRsnCn: params.bltRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        locgovCd: userInfo.locgovCd
      }

      const response = await sendHttpRequest('POST', endpoint, body, true, {
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
      // 특별관리 주유소 등록된 데이터인지 확인
      if(shRows[selected].shFrcsCdNo){
        alert('이미 특별관리주유소로 등록된 충전(주유)소 입니다.')
        setShCheck(prev => !prev)
        return;
      }
      // 선택한 rowIndex
      setShSelected(selected);
    }else{
      setShSelected(-1);
    }
  }
  const handleKBCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      if(kbRows[selected].kbFrcsCdNo){
        alert('이미 특별관리주유소로 등록된 충전(주유)소 입니다.')
        setKbCheck(prev => !prev)
        return;
      }
      setKbSelected(selected);
    }else{
      setKbSelected(-1);
    }
  }
  const handleWRCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      if(wrRows[selected].wrFrcsCdNo){
        alert('이미 특별관리주유소로 등록된 충전(주유)소 입니다.')
        setWrCheck(prev => !prev)
        return;
      }
      setWrSelected(selected);
    }else {
      setWrSelected(-1);
    }
  }
  const handleSSCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      if(ssRows[selected].ssFrcsCdNo){
        alert('이미 특별관리주유소로 등록된 충전(주유)소 입니다.')
        setSsCheck(prev => !prev)
        return;
      }
      setSsSelected(selected);
    }else {
      setSsSelected(-1);
    }
  }
  const handleHDCheckChange = (selected:number, isChecked:boolean) => {
    if(isChecked && selected > -1) {
      if(hdRows[selected].hdFrcsCdNo){
        alert('이미 특별관리주유소로 등록된 충전(주유)소 입니다.')
        setHdCheck(prev => !prev)
        return;
      }
      setHdSelected(selected);
    }else{
      setHdSelected(-1);
    }
  }

  const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 14,
    },
  }));

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
              <CustomFormLabel className="input-label-display" htmlFor="ft-telNo">전화번호</CustomFormLabel>
              <CustomTextField
                id="ft-telNo"
                name="telNo"
                value={params.telNo}
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
          headCells={apvCoamChainTrHeadCells} 
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
          headCells={apvCoamChainTrHeadCells} 
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
          headCells={apvCoamChainTrHeadCells} 
          rows={wrRows} 
          loading={false}
          onCheckChange={handleWRCheckChange}
          isCheck={wrCheck}
          caption={"우리 가맹점정보 목록 조회"}
        />

        <CustomFormLabel className="input-label-display">
          <h3>삼성 가맹점정보</h3>
        </CustomFormLabel>
        <TableDataGrid 
          headCells={apvCoamChainTrHeadCells} 
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
          headCells={apvCoamChainTrHeadCells} 
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
            <caption>상세 내용 시작</caption>
            <TableHead style={{display: 'none'}}>
              <TableRow>
                <TableCell className='td-head td-left'></TableCell>
                <TableCell></TableCell>
                <TableCell className='td-head td-left'></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className='td-head td-left'>
                  <LightTooltip  title={'특별관리주유소는 지정시점 이후 유예기간 3개월을 거쳐 발효되게 되며 발효 시 해당 주유소를 이용하는 주유거래에 대해서는 보조금이 지급되지 않습니다.'} arrow>
                    <span style={{ cursor: 'help' }}>
                      특별관리 발효(시작)일자
                    </span>
                  </LightTooltip >
                </TableCell>
                <TableCell>
                  <CustomFormLabel className="input-label-none" htmlFor="ft-bltBgngYmd">시작일자</CustomFormLabel>
                  <CustomTextField
                    type="date"
                    name="bltBgngYmd"
                    id="ft-bltBngnYmd"
                    value={params.bltBgngYmd}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                </TableCell>
                <TableCell className='td-head td-left'>
                  특별관리 종료일자
                </TableCell>
                <TableCell>
                  <CustomFormLabel className="input-label-none" htmlFor="ft-bltEndYmd">종료일자</CustomFormLabel>
                  <CustomTextField
                    type="date"
                    name="bltEndYmd"
                    id="ft-bltEndYmd"
                    value={params.bltEndYmd}
                    onChange={handleSearchChange}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='td-head td-left'>
                  특별관리 사유
                </TableCell>
                <TableCell colSpan={3}>
                  <CustomFormLabel className="input-label-none" htmlFor="sch-bltRsnCn">특별관리 사유</CustomFormLabel>
                  <textarea className="MuiTextArea-custom"
                    name="bltRsnCn"
                    id="sch-bltRsnCn"
                    value={params.bltRsnCn}
                    // multiline 
                    rows={5}
                    onChange={handleSearchChange}
                    // fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default RegisterModalContent;