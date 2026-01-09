import { CustomFormLabel, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, {useState, useEffect} from 'react';
import { HeadCell } from 'table';
import { Row } from '../page';
import { computeSlots } from '@mui/x-data-grid/internals';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';

interface ModalProperties {
  data: Row[]
  reload: () => void
}


const ModalContent01 = (props: ModalProperties) => {
  const {data, reload} = props;
  const [params, setParams] = useState({
    crdcoCd: "",
    cardNo: "",
    cardSeCd: "",
    aprvNo: "",
    locgovCd: "",
    vonrRrno: "",
    vonrNm: "",
    vhclNo: "",
    aprvYmd: "",
    aprvTm: "",
    aprvRtrcnYn: "",
    rtroactRsnCn: "",
  });
  const [body, setBody] = useState<Row[]>([]);

  useEffect(() => {
    const temp = data.filter((item,index) => (item.rtroactYn == 'N'))
    setBody(temp);
  }, [])


  const sendData = async () => {

    const userConfirm = confirm('소급요청을 등록하시겠습니까?');

    if (!userConfirm) {
        return;
    }

    try {
      let endpoint: string = `/fsm/apv/fdd/tr/createRtroactRequst`

      if(!params.rtroactRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
        alert('소급사유는 필수로 입력해야 합니다.');
        return;
      }

      if(params.rtroactRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 30){
        alert('소급사유를 30자리 이하로 입력해주시기 바랍니다.')
        return
      }

      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
        reload()
      }else {
        alert(response.message);
      }

    }catch(error) {
      console.error("ERROR ::: " , error);
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target

    setParams(prev => ({ ...prev, [name]: value }));
    setBody(prevItem => 
      prevItem.map(item => ({...item, rtroactRsnCn : value.replaceAll(/\n/g, '').replaceAll(/\t/g, '')}))
    );
  }

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await sendData();
  }

  return (
    <Box component='form' id='send-data' onSubmit={submitForm} sx={{ minWidth: '500px'}}>
        <Table className="table table-bordered">
          <TableBody>
            <TableRow>
            <TableCell className="td-head" scope="row" style={{whiteSpace:'nowrap',}}>
                소급사유
              </TableCell>
              <TableCell >
                <CustomFormLabel className="input-label-none" htmlFor="rtroactRsnCn">소급사유</CustomFormLabel>
                <textarea className="MuiTextArea-custom"
                  id="rtroactRsnCn"  
                  name="rtroactRsnCn" 
                  onChange={handleSearchChange} 
                  value={params.rtroactRsnCn} 
                  // multiline 
                  rows={5}
                  // fullWidth
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
    </Box>
  );
}

export default ModalContent01;