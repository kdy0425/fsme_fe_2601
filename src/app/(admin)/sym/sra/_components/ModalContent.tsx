import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Row } from '../page';

interface ModalContentProps {
  data: Row;
  type: 'CREATE' | 'UPDATE'
  reload: () => void;
}

const ModalContent = (props : ModalContentProps) => {
  const { data, type, reload } = props;
  const [params, setParams] = useState<Row>(
    {
      dataSeCd: "",
      locgovCd: "", 
      crdcoCd: "",
      actno: "",
      bankCd: "",
      crdcoNm: "",
      delYn: "",
      ctpvCd: "",
      ctpvNm: "",
      locgovNm: "",
      dataSeNm: "",
      bankNm: ""
    }
  );

  useEffect(() => {
    if(data) {
      if(type === 'UPDATE') {
        setParams({
          ...params,
          dataSeCd: data.dataSeCd,
          dataSeNm: data.dataSeNm,
          ctpvCd: data.ctpvCd,
          ctpvNm: data.ctpvNm,
          locgovCd: data.locgovCd,
          locgovNm: data.locgovNm,
          bankCd: data.bankCd,
          crdcoCd: data.crdcoCd,
          actno: data.actno,
        });
      } else if(type === 'CREATE') {
        setParams({
          ...params,
          dataSeCd: data.dataSeCd,
          dataSeNm: data.dataSeNm,
          ctpvCd: data.ctpvCd,
          ctpvNm: data.ctpvNm,
          locgovCd: data.locgovCd,
          locgovNm: data.locgovNm
        })
      }
    }
  }, [data])

  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if(type === 'UPDATE') {      
      if(name === 'crdcoCd' || name === 'bankCd') {
        if(value === '') {
          return;
        }
      }

      setParams((prev) => ({ ...prev, [name]: value }));
    }else {
      setParams((prev) => ({ ...prev, [name]: value }));
    }
  }

  const checkDuplication = async ():Promise<boolean> => {
    try {
      let endpoint = `/fsm/sym/sra/cm/getSbsidyRcpmnyAcnutRegYn?dataSeCd=${params.dataSeCd}`
                  + `&locgovCd=${params.locgovCd}`
                  + `&crdcoCd=${params.crdcoCd}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store'
      })

      if(response && response.resultType === 'success' && response.data) {
        if(response.data.regYn === 'Y') {
          const userConfirm = confirm('이미 등록되어 있는 계좌정보가 있습니다 그래도 저장하시겠습니까?')
          return userConfirm;
        }else{
          return true;
        }
      }

      return false;
    }catch(error) {
      console.error(error);
      return false;
    }
  }

  const createSbsidyRcpmnyAcnut = async () => {
        if(!params.crdcoCd) {
          alert('카드사구분을 선택해주세요.')
          return;
        }
        if(!params.bankCd) {
          alert('거래은행을 선택해주세요.')
          return;
        }
        if(!params.actno) {
          alert('계좌번호를 입력해주세요.')
          return;
        }

        const isContinue:boolean = await checkDuplication();

        if(!isContinue) {
          return;
        }

        let endpoint: string =  `/fsm/sym/sra/cm/createSbsidyRcpmnyAcnut`;
  
        let body = {
          locgovCd: params.locgovCd,
          dataSeCd: params.dataSeCd,
          crdcoCd: params.crdcoCd,
          bankCd: params.bankCd,
          actno: params.actno
        }

        const userConfirm: boolean = confirm(
          type === 'CREATE' ? "보조금계좌정보를 신규로 등록하시겠습니까?" : "보조금계좌정보를 저장하시겠습니까?"
        );
  
        if(userConfirm) {
          const response = await sendHttpRequest('POST', endpoint, body, true, {
            cache: 'no-store'
          })
    
          if (response && response.resultType === 'success') {
            alert(response.message);
            reload();
          }
        } else {
          return;
        }

  }

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await createSbsidyRcpmnyAcnut();
  }

  return (
    <Box
      id='send-data'
      onSubmit={submitForm}
      component='form'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        m: 'auto',
        width: 'full',
      }}
    >
    <TableContainer style={{margin:'16px 0 2em 0'}}>
      <Table
        sx={{ minWidth: 600 }}
        className='table table-bordered'
        aria-labelledby="tableTitle"
        size={'small'}
      >
        <TableBody>
          <TableRow>
            <TableCell className='td-head td-left' style={{width:'150px', height:'3rem'}} align={'left'}>
              <span className="required-text">*</span>업종구분
            </TableCell>
            <TableCell  style={{width:'300px',textAlign:'left'}}>
              {params.dataSeNm}
            </TableCell>
            <TableCell className='td-head td-left' style={{width:'150px'}} align={'left'}>
              <span className="required-text">*</span>관할관청
            </TableCell>
            <TableCell style={{width:'300px',textAlign:'left'}}>
              {params.ctpvNm+" "+params.locgovNm}
            </TableCell>
          </TableRow>
          <TableRow> 
            <TableCell className='td-head td-left'>
              <span className="required-text">*</span>카드사구분
            </TableCell>
            <TableCell  style={{width:'300px',textAlign:'left'}}>
              <CustomFormLabel className="input-label-none" htmlFor={'sch-crdcoCd'}>카드사구분</CustomFormLabel>
              <CommSelect
                cdGroupNm={'023'}
                pName={'crdcoCd'}              
                pValue={params.crdcoCd}
                handleChange={handleParamChange}
                addText='선택'
                htmlFor={'sch-crdcoCd'}
              />
            </TableCell>
            <TableCell className='td-head td-left'>
              <span className="required-text">*</span>거래은행
            </TableCell>
            <TableCell style={{width:'300px',textAlign:'left'}}>
              <CustomFormLabel className="input-label-none" htmlFor={'sch-bankCd'}>거래은행</CustomFormLabel>
              <CommSelect
                cdGroupNm={'973'}
                pName={'bankCd'}
                pValue={params.bankCd}
                handleChange={handleParamChange}
                addText='선택'
                htmlFor={'sch-bankCd'}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='td-head td-left'>
              <span className="required-text">*</span>계좌번호
            </TableCell>
            <TableCell colSpan={3}>
              <CustomTextField id="ft-actno" type='number' name="actno" value={params.actno} onChange={handleParamChange} fullWidth />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
}

export default ModalContent;