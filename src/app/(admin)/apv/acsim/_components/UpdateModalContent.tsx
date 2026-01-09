import AddrSearchModal, { AddrRow } from '@/app/components/popup/AddrSearchModal2';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Row } from '../page';

interface ModalProperties {
  data: Row
  reloadFn?: () => void
}

const UpdateModalContent = (props: ModalProperties) => {
  const { data, reloadFn } = props;

  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false);

  const [body, setBody] = useState({
    aogIdntySysIdSn: 0,
    frcsBrno:"",
    shFrcsCdNo:"",
    wrFrcsCdNo:"",
    kbFrcsCdNo:"",
    ssFrcsCdNo:"",
    hdFrcsCdNo:"",
    rprsvNm:"",
    frcsTlphonDddCd:"",
    telno:"",
    zip:"",
    daddr:"",
    frcsNm:"",
    // aplcntMbtlnum: "",
    // idfrNm: "",
    // idntyYmd: "",
  });

  useEffect(() => {
    if(data) {
      setBody((prev) => ({
        ...prev,
        aogIdntySysIdSn:data.aogIdntySysIdSn,
        frcsBrno:data.frcsBrno.replaceAll('-', ''),
        shFrcsCdNo:data.shFrcsCdNo,
        wrFrcsCdNo:data.wrFrcsCdNo,
        kbFrcsCdNo:data.kbFrcsCdNo,
        ssFrcsCdNo:data.ssFrcsCdNo,
        hdFrcsCdNo:data.hdFrcsCdNo,
        rprsvNm:data.rprsvNm,
        frcsTlphonDddCd:data.frcsTlphonDddCd,
        telno:data.telno,
        zip:data.zip.replaceAll('-', ''),
        daddr:data.daddr,
        frcsNm:data.frcsNm,
        // aplcntMbtlnum:data.aplcntMbtlnum,
        // idfrNm:data.idfrNm,
        // idntyYmd:data.idntyYmd
      }))
    }
  }, [data])

  const handleBodyChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
   
    setBody((prev) => ({ ...prev, [name]: value }))
  }

  const sendData = async () => {
    try {
      let endpoint: string = `/fsm/apv/acsim/tr/updateAogCnfirmSysInstlMng`;

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

      const userConfirm = confirm('주유량확인시스템 주유소 정보를 수정하시겠습니까?')
      if(!userConfirm) return;

      let formData = {
        ...body,
        rprsvNm:body.rprsvNm,
        zip:body.zip.replaceAll('-', ''),
        daddr:body.daddr,
        frcsNm:body.frcsNm,
      }

      const response = await sendHttpRequest('PUT', endpoint, formData, true, {
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

  const getAddress = (row: AddrRow, daddr: string) => {
    setBody((prev) => ({
      ...prev,
      zip: row.zipNo,
      daddr: `${row.roadAddr} ${daddr}`
    }))

    setAddrModalOpen(false)
  }
 
  return (
    <Box component='form' id='update-data' onSubmit={submitForm}>
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
                    value={body.frcsBrno} 
                    onChange={handleBodyChange} 
                    inputProps={{
                      inputMode: 'text',
                      maxLength: 20,
                      readOnly: true, 
                      disabled: true,
                    }} 
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
                    value={body.frcsNm} 
                    onChange={handleBodyChange} 
                    inputProps={{
                      inputMode: 'text',
                      maxLength: 100,
                      readOnly: true, 
                      disabled: true,
                    }} 
                    readOnly
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
                      type="text" 
                      name="frcsTlphonDddCd" 
                      if="frcsTlphonDddCd"
                      value={body.frcsTlphonDddCd} 
                      onChange={handleBodyChange} 
                      style={{width:'1rem'}}
                      required
                    />
                    <CustomFormLabel className="input-label-none" htmlFor="telno"></CustomFormLabel>
                    <CustomTextField 
                      type="text" 
                      name="telno" 
                      id="telno"
                      value={body.telno} 
                      onChange={handleBodyChange} 
                      required
                    />
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='td-head td-left'>
                  대표자명
                </TableCell>
                <TableCell>
                  <CustomFormLabel className='input-label-none' htmlFor="rprsvNm">대표자명</CustomFormLabel>
                  <CustomTextField 
                    name="rprsvNm"
                    id="rprsvNm"
                    value={body.rprsvNm}
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
                      id="zip"
                      value={body.zip}
                      onClick={() => setAddrModalOpen(true)}
                      onChange={handleBodyChange}
                      inputProps={{
                        readOnly: true,
                        maxLength: 6,
                      }}
                      readOnly
                    />
                    <CustomFormLabel className="input-label-none" htmlFor="daddr">상세주소</CustomFormLabel>
                    <CustomTextField
                      name='daddr'
                      id="daddr"
                      value={body.daddr}
                      onClick={() => setAddrModalOpen(true)}
                      onChange={handleBodyChange}
                      inputProps={{
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
  );
}

export default UpdateModalContent;