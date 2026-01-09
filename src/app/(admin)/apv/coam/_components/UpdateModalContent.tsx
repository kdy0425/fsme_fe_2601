import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { getDateRange } from '@/utils/fsms/common/comm';
import { getDateTimeString } from '@/utils/fsms/common/util';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Row } from '../page';

interface ModalProperties {
  data: Row|null
  reloadFn?: () => void
}

const UpdateModalContent = (props: ModalProperties) => {
  const { data, reloadFn } = props;
  const [params, setParams] = useState({
    frcsBrno: "",
    bltSn: 0,
    bltBgngYmd: "",
    bltEndYmd: "",
    bltRsnCn: ""
  });

  useEffect(() => {
    if(data) {
      setParams({
        frcsBrno: data.frcsBrno,
        bltSn: data.bltSn,
        bltBgngYmd: getDateTimeString(data.bltBgngYmd, 'date')?.dateString ?? '', // 최소 오늘날짜 16일 이후
        bltEndYmd: getDateTimeString(data.bltEndYmd, 'date')?.dateString ?? '',
        bltRsnCn: data.bltRsnCn
      })
    }
  }, [data])

  function checkDate(startDate: string) {
    // 오늘 날짜
    const today = new Date();
  
    // 오늘로부터 16일 이후 날짜
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 16);
  
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

    // 입력 날짜가 오늘로부터 16일 이후보다 이전인지 확인
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
          if(!checkDate(value)) {
            alert("특별관리 발효(시작)일자는 오늘날짜로 부터 최소 16일 이후여야 합니다.")
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

  const sendData = async () => {
    
    try {
      const userConfirm = confirm('특별관리주유소 정보를 수정하시겠습니까?')
      if(!userConfirm) return;

      let endpoint: string = `/fsm/apv/coam/tr/updateCousmOlt`;

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
        bltSn: params.bltSn,
        bltBgngYmd: params.bltBgngYmd.replaceAll('-', ''),
        bltEndYmd: params.bltEndYmd.replaceAll('-', ''),
        bltRsnCn: params.bltRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      }

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
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


  return (
    <Box component='form' id='update-data' onSubmit={submitForm}>
      <TableContainer className="table-scrollable">
        <Table className="table table-bordered">
          <caption>상세 내용 시작</caption>
          <TableHead style={{display:'none'}}>
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
                특별관리 발효(시작)일자
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="ft-bltBgngYmd">시작일자</CustomFormLabel>
                <CustomTextField type="date" id="ft-bltBgngYmd" name="bltBgngYmd" value={params.bltBgngYmd} onChange={handleSearchChange} fullWidth/>
              </TableCell>
              <TableCell className='td-head td-left'>
                특별관리 종료일자
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="ft-bltEndYmd">종료일자</CustomFormLabel>
                <CustomTextField type="date" id="ft-bltEndYmd" name="bltEndYmd" value={params.bltEndYmd} onChange={handleSearchChange} fullWidth/>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='td-head td-left'>
                특별관리 사유
              </TableCell>
              <TableCell colSpan={3}>
                <CustomFormLabel className="input-label-none" htmlFor="sch-bltRsnCn">특별관리 사유</CustomFormLabel>
                <textarea className="MuiTextArea-custom"
                  id="sch-bltRsnCn" 
                  name="bltRsnCn" 
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
  );
}

export default UpdateModalContent;