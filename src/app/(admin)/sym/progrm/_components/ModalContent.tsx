import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import { SelectItem } from 'select';
import { Row } from '../page';


interface ModalContentProps {
  data?: Row;
  type: 'CREATE' | 'UPDATE'
  reload: () => void;
}

const ModalContent = (props : ModalContentProps) => {
  const { data, type, reload } = props;
  const [httpMethodItems, setHttpMethodItems] = useState<SelectItem[]>([]);
  const [useYnItems, setUseYnItems] = useState<SelectItem[]>([]);
  
  const [params, setParams] = useState<Row>({
    prgrmCdSn: "",
    prgrmNm: "",
    urlAddr: "",
    httpDmndMethNm: "",
    useYn: "",
    prhibtRsnCn: "",
    useNm: ""
  });

  useEffect(() => {
    // HTTP요청메소드 코드그룹 세팅
    getCodesByGroupNm('787').then((res) => {
      if(res) {
        let httpMethodCodes: SelectItem[] = [];

        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm']
          } 

          httpMethodCodes.push(item);
        })

        setHttpMethodItems(httpMethodCodes);
      }
    })

    // 사용여부 코드그룹 세팅
    getCodesByGroupNm('103').then((res) => {
      if(res) {
        let useYnCodes: SelectItem[] = [];

        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm']
          } 

          useYnCodes.push(item);
        })
        setUseYnItems(useYnCodes);
      }
    })
  }, [])

  // select item 불러온 뒤 초기값 세팅
  useEffect(() => {
    if(type === 'CREATE') {
      if(httpMethodItems.length > 0) {
        setParams((prev) => ({...prev, httpDmndMethNm: httpMethodItems[0].value}));
      }
      
      if(useYnItems.length > 0) {
        setParams((prev) => ({...prev, useYn: useYnItems[0].value}));
      }
    }
  }, [httpMethodItems, useYnItems])

  useEffect(() => {
    if(data && type === 'UPDATE') {
      setParams(data);
    }
  }, [data])

  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setParams((prev) => ({...prev, [name]: value}));
  }

  const createProgrm = async () => {
    try {
      let endpoint: string = `/fsm/sym/progrm/cm/createProgrm`
      let body = {
        prgrmNm: params.prgrmNm,
        urlAddr: params.urlAddr,
        useYn: params.useYn,
        prhibtRsnCn: params.prhibtRsnCn,
        httpDmndMethNm: params.httpDmndMethNm
      }

      if(!params.prgrmNm || params.prgrmNm == '') {
        alert('프로그램명은 필수값입니다.');
        return;
      }

      if(!params.urlAddr || params.urlAddr == '') {
        alert("URL주소는 필수값입니다.");
        return;
      }

      const userConfirm = confirm("프로그램을 저장하시겠습니까?");

      if(userConfirm) {
        const response = await sendHttpRequest('POST', endpoint, body, true, {
          cache: "no-store",
        })

        if(response && response.resultType === 'success') {
          alert("프로그램이 저장되었습니다.");
          reload();
        }
      }


    }catch(error) {
      console.error('Error creating data:', error)
    }
  }

  const updateProgrm = async () => {
      try {
        let endpoint: string = `/fsm/sym/progrm/cm/updateProgrm`
        let body = {
          prgrmCdSn: params.prgrmCdSn,
          prgrmNm: params.prgrmNm,
          urlAddr: params.urlAddr,
          useYn: params.useYn,
          prhibtRsnCn: params.prhibtRsnCn,
          httpDmndMethNm: params.httpDmndMethNm
        }
  
        if(!params.prgrmNm || params.prgrmNm == '') {
          alert('프로그램명은 필수값입니다.');
          return;
        }
  
        if(!params.urlAddr || params.urlAddr == '') {
          alert("URL주소는 필수값입니다.");
          return;
        }
  
        const userConfirm = confirm("프로그램을 저장하시겠습니까?");
  
        if(userConfirm) {
          const response = await sendHttpRequest('PUT', endpoint, body, true, {
            cache: "no-store",
          })
  
          if(response && response.resultType === 'success') {
            alert("프로그램이 저장되었습니다.");
            reload();
          }
        }
  
  
      }catch(error) {
        console.error('Error creating data:', error)
      }
    }

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if(type === 'CREATE') {
      await createProgrm();
    }else if (type === 'UPDATE') {
      await updateProgrm();
    }

  }

  return (
    <Box component={'form'} id='send-data' onSubmit={submitForm}>
      <TableContainer>
        <Table className='table table-bordered'>
          <TableBody>
          <TableRow>
            <TableCell className='td-head td-left' style={{ minWidth:'200px', width:'25%'}}>
              <span className="required-text">*</span>프로그램명
            </TableCell>
            <TableCell colSpan={3}>
              <CustomTextField id="ft-prgrNm" name="prgrmNm" value={params.prgrmNm} onChange={handleParamChange} required fullWidth />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='td-head td-left' >
              <span className="required-text" >*</span>URL주소
            </TableCell>
            <TableCell colSpan={3}>
              <CustomTextField id="ft-urlAddr" name="urlAddr" value={params.urlAddr} onChange={handleParamChange} required fullWidth />
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className='td-head td-left'>
              HTTP요청메소드명
            </TableCell>
            <TableCell style={{ minWidth:'200px', width:'25%'}}>
              <CustomFormLabel className="input-label-none" htmlFor={'sch-httpDmndMethNm'}>HTTP요청메소드명</CustomFormLabel>
              <select
                id="sch-httpDmndMethNm"
                name="httpDmndMethNm"
                className="custom-default-select"
                value={params.httpDmndMethNm}
                onChange={handleParamChange}
                style={{width:'100%'}}
              >
                {httpMethodItems.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell className='td-head td-left' style={{ minWidth:'200px', width:'25%'}}>
              사용여부
            </TableCell>
            <TableCell style={{ minWidth:'200px', width:'25%'}}>
              <CustomFormLabel className="input-label-none" htmlFor={'sch-useYn'}>사용여부</CustomFormLabel>
              <select
                id="sch-useYn"
                name="useYn"
                className="custom-default-select"
                value={params.useYn}
                onChange={handleParamChange}
                style={{width:'100%'}}
              >
                 {useYnItems.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='td-head td-left'>
              미사용사유
            </TableCell>
            <TableCell colSpan={3}>
              <CustomTextField id="ft-prhibtRsnCn" name="prhibtRsnCn" value={params.prhibtRsnCn} onChange={handleParamChange} fullWidth />
            </TableCell>
          </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box> 
  );
}

export default ModalContent;