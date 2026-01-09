import { CommSelect } from '@/app/components/tx/commSelect/CommSelect';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Row } from '../page';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';

interface ModalProperties {
  data: Row
  reloadFn?: () => void
}

const DeleteModalForm = (props: ModalProperties) => {
  const { data, reloadFn } = props;

  const [params, setParams] = useState({
      aogIdntySysIdSn: 0,
      delRsnCd:""
  })

  useEffect(() => {
    setParams((prev) => ({...prev, aogIdntySysIdSn: data.aogIdntySysIdSn}))
  }, [data])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target

    setParams(prev => ({ ...prev, [name]: value }));
  }

  const sendData = async () => {
    try {
      const userConfirm = confirm('삭제하시겠습니까?');

      if(userConfirm) {
        let endpoint: string = `/fsm/apv/acsim/tr/deleteAogCnfirmSysInstlMng`;
  
        let formData = {
          ...params,
        }
  
        const response = await sendHttpRequest('DELETE', endpoint, formData, true, {
          cache: 'no-store'
        })
  
        if(response && response.resultType == 'success') {
          alert(response.message);
        }else{
          alert(response.message);
        }
      }
    }catch(error) {
      console.error("ERROR :: ", error);
    }
  }

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await sendData();
    reloadFn?.();
  }

  return (
    <Box component="form" id="delete-data" onSubmit={submitForm}>
      <TableContainer className="table-scrollable">
        <Table className="table table-bordered">
          <TableBody>
            <TableRow>
              <TableCell className='td-head td-left' style={{whiteSpace:'nowrap', width:'100px'}}>
                삭제사유
              </TableCell>
              <TableCell>
                <CustomFormLabel className="input-label-none" htmlFor="sch-delRsnCd">삭제사유</CustomFormLabel>
                <CommSelect 
                  cdGroupNm={'084'} 
                  pValue={params.delRsnCd} 
                  handleChange={handleSearchChange} 
                  pName={'delRsnCd'}
                  htmlFor={"sch-delRsnCd"}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DeleteModalForm;