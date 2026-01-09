import { CustomFormLabel, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, {useState, useEffect} from 'react';
import { HeadCell } from 'table';
import { Row } from '../page';
import { computeSlots } from '@mui/x-data-grid/internals';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { getDateTimeString } from '@/utils/fsms/common/util';
import {apvFddRtroactCanclTrHc} from '@/utils/fsms/headCells'

type Parameter = {
  vhclNo: string,
  aprvYmd: string
}

type Body = {
  crdcoCd: string,
  cardNo: string,
  aprvNo: string,
  aprvYmd: string,
  vhclNo: string,
}


interface ModalProperties {
  data: Row
  reload: () => void
}

const ModalContent02 = (props: ModalProperties) => {
  const {data, reload} = props;
  const [rows, setRows] = useState<Row[]>([]);

  const [params, setParams] = useState<Parameter>({
    vhclNo: '',
    aprvYmd: ''
  });
  const [body, setBody] = useState<Body[]>([])


  useEffect(() => {
    if(data){
      fetchData();

      setParams((prev) => ({
        ...prev, 
        vhclNo : data.vhclNo,
        aprvYmd: data.aprvYmd.substring(0,4)+'-'+data.aprvYmd.substring(4,6)
      }))
    }
  },[data])

  const fetchData = async () => {
    try {
      let endpoint: string = `/fsm/apv/fdd/tr/getAllRtroactCancl?`
      + `${data.vhclNo ? '&vhclNo=' + data.vhclNo : ''}`
      + `${data.aprvYmd ? '&aprvYmd=' + data.aprvYmd.replaceAll('-', '') : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        setRows(response.data.content);
      }else {
        alert(response.message);
      }
    }catch(error) {
      console.error("Error ::: ", error);
    }
  }

  const sendData = async () => {
    if(body.length < 1){
      alert('소급취소건을 선택해 주세요.')
      return;
    }

    const userConfirm = confirm('소급을 취소하시겠습니까?');

    if (!userConfirm) {
        return;
    }

    try {
      let endpoint: string = `/fsm/apv/fdd/tr/deleteRtroactCancl`

      const response = await sendHttpRequest('DELETE', endpoint, body, true, {
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

  const handleCheckChange = (selected:string[]) => {
    let selectedRows:Body[] = []; // index arr
    
    selected.map( (item) => {
        let index: number = Number(item.replace('tr', ''));
        selectedRows.push( 
          {
            vhclNo: rows[index].vhclNo,
            crdcoCd: rows[index].crdcoCd,
            cardNo: rows[index].cardNo,
            aprvNo: rows[index].aprvNo,
            aprvYmd: rows[index].aprvYmd,
          }
        )
      }
    )
    setBody(selectedRows);
  }

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
   
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const submitSearchForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await fetchData();
  }

  const submitSendForm = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await sendData();
  }

  return (
    <>
    <Box component="form" id='search-cancel' onSubmit={submitSearchForm} sx={{ mb: 2 }}>
      <Box className="sch-filter-box">
        <div className="filter-form">
          <div className="form-group">
            <CustomFormLabel className="input-label-display">
              차량번호
            </CustomFormLabel>
            <CustomTextField
              name="vhclNo"
              value={params.vhclNo}
              onChange={handleParamChange}
              disabled
            />
          </div>
          <div className="form-group">
            <CustomFormLabel className="input-label-display">
              거래년월
            </CustomFormLabel>
            <CustomTextField
              name="aprvYmd"
              type="month"
              disabled
              value={params.aprvYmd}
              onChange={handleParamChange}
            />
          </div>
        </div>
      </Box>
    </Box>
    
    <Box component='form' id='send-cancel' onSubmit={submitSendForm} sx={{ minWidth: '600px'}}>
      <TableDataGrid 
        headCells={apvFddRtroactCanclTrHc} 
        rows={rows} 
        loading={false}
        onCheckChange={handleCheckChange}
      />
    </Box>
    </>
  );
}

export default ModalContent02;