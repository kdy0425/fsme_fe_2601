import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { getUserInfo } from '@/utils/fsms/utils';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row } from '../page';
import { getDateTimeString } from '../../../../../utils/fsms/common/util';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { apvCoamUserTrHeadCells } from '@/utils/fsms/headCells'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm';
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface ResultRow {
  frcsBrno: string;
  bltSn: string;
  frcsNm: string;
  shFrcsCdNo: string;
  kbFrcsCdNo: string;
  wrFrcsCdNo: string;
  ssFrcsCdNo: string;
  hdFrcsCdNo: string;
  bltBgngYmd: string;
  bltEndYmd: string;
  bltSttsCd: string;
  bltSttsCdNm: string;
  bltRmvRsnCd: string;
  bltRmvRsnCdNm: string;
  bltRmvYmd: string;
  locgovCd: string;
  locgovNm: string;
  bltRsnCn: string;
  trsmYn: string;
  trsmDt: string;
  rgtrId: string;
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  crdcoCd: string;
  crdcoCdNm: string;
  frcsCdNo: string;
  cardNo: string;
  cardNoS: string;
  prcsSeCd: string;
  prcsSeCdNm: string;
  frstDlngYmd: string;
  lastDlngYmd: string;
  vhclNo: string;
  vonrBrno: string;
  vonrNm: string;
  vonrRrno: string;
  vonrRrnoS: string;
}

interface ModalProperties {
  data: Row
}

const UserSearchModalContent = (props: ModalProperties) => {
  const { data } = props;
  const [loading, setLoading] = useState<boolean>(false);  
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  // 회원정보
  const userInfo = getUserInfo();

  // 초기 데이터 로드
  useEffect(() => {
    fetchData()
  }, [data])

  const fetchData = async () => {
    setLoading(true)
    try {
      let endpoint: string = `/fsm/apv/coam/tr/getAllCousmOltUser?`
      + `${data.bltSn ? '&bltSn=' + data.bltSn : ''}`
      + `${data.frcsBrno ? '&frcsBrno=' + data.frcsBrno : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        setRows(response.data);
      }else {
        alert(response.message);
        setRows([]);
      }
    }catch(error) {
      console.error("Error :: ", error);
      setRows([]);
    }finally {
      setLoading(false);
    }
  }

  const excelDownload = async () => {
    if(rows.length == 0) {
      alert('검색된 결과가 없습니다.')
      return;
    }

    try{
      setLoadingBackdrop(true)
      let endpoint: string =
      `/fsm/apv/coam/tr/getExcelCousmOltUser?` +
      `${data.bltSn ? '&bltSn=' + data.bltSn : ''}` +
      `${data.frcsBrno ? '&frcsBrno=' + data.frcsBrno : ''}`

      await getExcelFile(endpoint, '특별관리주유소 이용자 목록' + '_'+getToday()+'.xlsx')

    }catch(error){
      console.error("ERROR :: ", error);
    }finally{
      setLoadingBackdrop(false)
    }
  }

  const handleSubmit = (event : React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    excelDownload();
  }



  return (
    <Box sx={{minWidth:1000}} component='form' id='excel-download' onSubmit={handleSubmit}>
      <LoadingBackdrop open={loadingBackdrop} />
      <TableContainer className="table-scrollable" sx={{mb: 4}}>
        <Table className="table table-bordered">
          <caption>상세 내용 시작</caption>
          <TableHead style={{display:'none'}}>
            <TableRow>
              <TableCell className='td-head td-left' sx={{width:'15%'}}></TableCell>
              <TableCell></TableCell>
              <TableCell className='td-head td-left' sx={{width:'15%'}}></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className='td-head td-left' sx={{width:'15%'}}>
                사업자등록번호
              </TableCell>
              <TableCell>
                {data.frcsBrno}
              </TableCell>
              <TableCell className='td-head td-left' sx={{width:'15%'}}>
                가맹점명
              </TableCell>
              <TableCell colSpan={3}>
                {data.frcsNm}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className='td-head td-left'>
                특별관리 시작일자
              </TableCell>
              <TableCell>
                {getDateTimeString(data.bltBgngYmd, 'date')?.dateString}
              </TableCell>
              <TableCell className='td-head td-left'>
                특별관리 종료일자
              </TableCell>
              <TableCell>
                {getDateTimeString(data.bltEndYmd, 'date')?.dateString}
              </TableCell>
              <TableCell className='td-head td-left'>
                상태
              </TableCell>
              <TableCell>
                {data.bltSttsCdNm}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableDataGrid 
        headCells={apvCoamUserTrHeadCells} 
        rows={rows} 
        totalRows={0} 
        loading={loading} 
        paging={false} 
        caption={"이용자 조회 목록"}
      />
    </Box>
  );
}

export default UserSearchModalContent;