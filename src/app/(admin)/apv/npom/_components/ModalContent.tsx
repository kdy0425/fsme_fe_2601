import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { telnoFormatter, getFormatToday } from '@/utils/fsms/common/comm'
import { brNoFormatter } from '@/utils/fsms/common/util'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Table, TableBody, TableCell, TableRow, Button, TableHead } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SelectItem } from 'select'
import { apvNpomInstlPosTrHeadCells } from '@/utils/fsms/headCells'
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { Row } from '../page'
import { CtpvSelect, LocgovSelect } from '@/app/components/tx/commSelect/CommSelect'
import AddrSearchModal, { AddrRow } from '@/app/components/popup/AddrSearchModal2';

interface Parameter {
  frcsBrno: string;
  frcsNm: string;
  daddr: string;
  instlYn: string;
  posCoNm: string;
  posNm: string;
  instlYmd: string;
  xcrd: string;
  ycrd: string;
  locgovCd: string;
  ornCmpnyNm: string;
  frcsTelnoCn: string;
  salsSeNm: string;
  stopBgngYmd: string;
  stopEndYmd: string;
  [key: string] : string | number;
}

interface ModalProperties {
  frcsBrno: string
  daddr: string
  newOltSn: number
  reloadFn?: () => void
}

const salsSeNmItems: SelectItem[] = [
  {
    value: '영업',
    label: '영업'
  },
  {
    value: '휴업',
    label: '휴업'
  },
  {
    value: '영업취소',
    label: '영업취소'
  },
  {
    value: '영업정지',
    label: '영업정지'
  },
  {
    value: '폐업',
    label: '폐업'
  },
  {
    value: '확인불가',
    label: '확인불가'
  },
]

const instlYnItems: SelectItem[] = [
  {
    value: 'Y',
    label: '설치'
  },
  {
    value: 'N',
    label: '미설치'
  },
]

const RegisterModalForm = (props: ModalProperties) => {
  const { frcsBrno, daddr, newOltSn, reloadFn } = props;
  const [newPosRows, setNewPosRows] = useState<Row>(); // 신규포스주유소 정보
  const [posRows, setPosRows] = useState<Row[]>([]); // 포스설치주유소 정보
  const [params, setParams] = useState<Parameter>({
    frcsBrno: frcsBrno,
    frcsNm: '',
    daddr: '',
    instlYn: 'N',
    posCoNm: '',
    posNm: '',
    instlYmd: getFormatToday(),
    xcrd: '',
    ycrd: '',
    ctpvCd: '',
    locgovCd: '',
    ornCmpnyNm: '',
    frcsTelnoCn: '',
    salsSeNm: '영업',
    stopBgngYmd: '',
    stopEndYmd: '',
  });
  const [addrModalOpen, setAddrModalOpen] = useState<boolean>(false);

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
      
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const getAddress = (row: AddrRow, daddr: string) => {
    setParams((prev) => ({
      ...prev,
      zip: row.zipNo,
      daddr: `${row.roadAddr} ${daddr}`
    }))

    setAddrModalOpen(false)
  }

  // 신규주유소 대상 조회
  const fetchData = async () => {
    try {
      let endpoint: string = `/fsm/apv/npom/tr/getNewPosInstl?newOltSn=${newOltSn}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if(response && response.resultType == 'success' && response.data) {
        setNewPosRows(response.data)
        await getAllPosInstl();
      }else{
        alert(response.message);
      }

    }catch(error) {
      console.error('Error ::: ', error);
    }
  }

  // 포스설치 주유소 조회
  const getAllPosInstl = async () => {
    try {
      let endpoint: string = `/fsm/apv/npom/tr/getAllPosInstl?` +
      `${frcsBrno ? '&frcsBrno=' + frcsBrno.replaceAll('-', '') : ''}`
  
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if(response && response.resultType == 'success' && response.data) {
        setPosRows(response.data);
      }else {
        alert(response.message);
      }
    }catch(error) {
      console.error("Fetch Data Error :: ", error);
      setPosRows([]);
    }
  }

  const sendData = async () => {
    try {
      let endpoint: string = `/fsm/apv/npom/tr/createNewPosOltMng`

      if(!params.frcsNm) {
        alert('가맹점명을 필수로 입력해야 합니다.')
        return;
      }
      if(!params.frcsTelnoCn) {
        alert('연락처를 필수로 입력해야 합니다.')
        return;
      }  
      if(!params.daddr) {
        alert('주소를 필수로 입력해야 합니다.')
        return;
      }
      if(!params.instlYmd.replaceAll('-', '')) {
        alert('설치일자를 필수로 입력해야 합니다.')
        return;
      }
      if(!params.locgovCd) {
        alert('관할관청을 필수로 입력해야 합니다.')
        return;
      }

      const userConfirm = confirm('입력하신 내용으로 신규 주유소 등록을 진행하시겠습니까?')
      if(!userConfirm) return;

      let body = {
        "newOltSn": newOltSn,
        "frcsBrno": params.frcsBrno.replaceAll('-', ''),
        "frcsNm": params.frcsNm,
        "daddr": params.daddr,
        "instlYn": params.instlYn,
        "posCoNm": params.posCoNm,
        "posNm": params.posNm,
        "instlYmd": params.instlYmd.replaceAll('-', ''),
        "xcrd": params.xcrd,
        "ycrd": params.ycrd,
        "locgovCd": params.locgovCd,
        "ornCmpnyNm": params.ornCmpnyNm,
        "frcsTelnoCn": params.frcsTelnoCn,
        "salsSeNm": params.salsSeNm,
        "stopBgngYmd": params.stopBgngYmd,
        "stopEndYmd": params.stopEndYmd,
      }

      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store'
      })

      if(response && response.resultType == 'success') {
        alert(response.message);
        reloadFn?.()
      }else {
        alert(response.message);
      }
      
    }catch(error) {
      console.error("ERROR ::: ", error);
    }
  }

  const sendFormData = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    await sendData();
  }

  useEffect(() => {
    if(frcsBrno) {
      fetchData();
    }
  }, [frcsBrno])

  useEffect(() => {
    setParams((prev) => ({ ...prev, 
      "frcsBrno": frcsBrno,
      "frcsNm": newPosRows?.oltNm ?? '',
      "daddr": newPosRows?.daddr ?? '',
      "frcsTelnoCn": newPosRows?.telno ?? '',
    }))  
  }, [newPosRows])

  return (
    <>
    <Box className="sch-filter-box" sx={{ minWidth: 1000, mb: 2 }}>
      <div className="filter-form">
        <div className="form-group">
          <CustomFormLabel className="input-label-display" htmlFor="ft-modal-frcsBrno" required>
            사업자등록번호
          </CustomFormLabel>
          <CustomTextField id="ft-modal-frcsBrno" name="frcsBrno" value={frcsBrno} onChange={handleParamChange} readOnly inputProps={{readOnly: true}} fullWidth/>
        </div>
      </div>
    </Box>
          
    <Box style={{marginBottom: 50}}>
      <TableDataGrid 
        headCells={apvNpomInstlPosTrHeadCells}
        rows={posRows}
        loading={false}
        paging={false} 
        caption={"가맹점 목록 조회"}
        />
    </Box>

    <Box component='form' id='frcs-sendData' onSubmit={sendFormData} style={{marginBottom: 50}}>
      <Table className="table table-bordered">
        <TableBody>
          <caption>상세 목록 조회</caption>
          <TableHead style={{display:'none'}}>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableRow>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              사업자등록번호
            </TableCell>
            <TableCell>
              {brNoFormatter(frcsBrno)}
            </TableCell>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              가맹점명
            </TableCell>
            <TableCell colSpan={3}>
              <CustomFormLabel className="input-label-none" htmlFor="ft-frcsNm">가맹점명</CustomFormLabel>
              <CustomTextField 
                name='frcsNm'
                id="ft-frcsNm"
                value={params?.frcsNm}
                onChange={handleParamChange}
                inputProps={{
                  inputMode: 'text',
                  maxLength: 100,
                }}
                required
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              주소
            </TableCell>
            <TableCell colSpan={3}>
              <CustomFormLabel className="input-label-none" htmlFor="ft-daddr">주소</CustomFormLabel>
              <CustomTextField
                name='daddr'
                id="ft-daddr"
                value={params?.daddr}
                onClick={() => setAddrModalOpen(true)}
                onChange={handleParamChange}
                inputProps={{
                  inputMode: 'text',
                  maxLength: 200,
                  readOnly: true
                }}
                sx={{width:'80%'}}
                readOnly
                required
              />
              <Button variant='outlined' onClick={() => setAddrModalOpen(true)}>선택</Button>
            </TableCell>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              연락처
            </TableCell>
            <TableCell>
              <CustomFormLabel className="input-label-none" htmlFor="ft-frcsTelnoCn">연락처</CustomFormLabel>
              <CustomTextField id="fr-frcsTelnoCn" name='frcsTelnoCn' value={telnoFormatter(params?.frcsTelnoCn)} onChange={handleParamChange} fullWidth required />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              설치구분
            </TableCell>
            <TableCell style={{width: ''}}>
              <CustomFormLabel className="input-label-none" htmlFor="sch-instlYn">설치구분</CustomFormLabel>
              <select
                id="sch-instlYn"
                className="custom-default-select"
                name="instlYn"
                value={params?.instlYn}
                onChange={handleParamChange}
                style={{ width: '100%' }}
              >
                {instlYnItems.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              설치일자
            </TableCell>
            <TableCell>
              <CustomFormLabel className="input-label-none" htmlFor="date-instlYmd">설치일자</CustomFormLabel>
              <CustomTextField type="date" id="date-instlYmd" name='instlYmd' value={params.instlYmd} onChange={handleParamChange} fullWidth required />
            </TableCell>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap',}}>
              정유사
            </TableCell>
            <TableCell>
              <CustomFormLabel className="input-label-none" htmlFor="sch-ornCmpnyNm">정유사</CustomFormLabel>
              <CommSelect                
                cdGroupNm='175'
                pValue={params.ornCmpnyNm}
                handleChange={handleParamChange}
                pName='ornCmpnyNm'
                htmlFor={'sch-ornCmpnyNm'}
              />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap', width:'12.5%'}}>
              영업여부
            </TableCell>
            <TableCell>
              <CustomFormLabel className="input-label-none" htmlFor="sch-salsSeNm">영업여부</CustomFormLabel>
              <select
                id="select-salsSeNm"
                className="custom-default-select"
                name="salsSeNm"
                value={params?.salsSeNm}
                onChange={handleParamChange}
              >
                {salsSeNmItems.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell className="td-head td-left" scope="row" style={{whiteSpace:'nowrap', width:'12.5%'}}>
              관할관청
            </TableCell>
            <TableCell colSpan={3}>
              <div style={{display:'inline-flex', gap:'4px'}}>
                <CustomFormLabel className="input-label-none" htmlFor="sch-ctpv">시도명</CustomFormLabel>
                <CtpvSelect
                  pValue={params.ctpvCd}
                  handleChange={handleParamChange}
                  htmlFor={'sch-ctpv'}
                  width='auto'
                />
                <CustomFormLabel className="input-label-none" htmlFor="sch-locgov">관할관청</CustomFormLabel>
                <LocgovSelect
                  ctpvCd={params.ctpvCd}
                  pValue={params.locgovCd}
                  handleChange={handleParamChange}
                  htmlFor={'sch-locgov'}
                  width='auto'
                />
              </div>
            </TableCell>
          </TableRow>
          </TableBody>
        </Table>
    </Box>
    <AddrSearchModal 
      open={addrModalOpen}
      onCloseClick={() => setAddrModalOpen(false)}        
      onSaveClick={getAddress}
    />
    </>
  )
}

export default RegisterModalForm
