import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react';
import { HeadCell } from 'table';
import { Row } from '../page';

import { brNoFormatter } from '@/utils/fsms/common/util'
import { formatDate } from '@/utils/fsms/common/convert'
const headCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자번호',
    format: 'brno',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
    align: 'td-left',
  },
  {
    id: 'vhclNo',
    numeric: false,
    disablePadding: false,
    label: '차량번호',
  },
  {
    id: 'vhclSeNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
  {
    id: 'dlngYmdtm',
    numeric: false,
    disablePadding: false,
    label: '거래일시',
  },
  {
    id: 'cardSeNm',
    numeric: false,
    disablePadding: false,
    label: '카드구분',
  },
  {
    id: 'crdcoNm',
    numeric: false,
    disablePadding: false,
    label: '카드사',
  },
  {
    id: 'cardNoS',
    numeric: false,
    disablePadding: false,
    label: '카드번호',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '주유소명',
  },
  {
    id: 'aprvAmt',
    numeric: false,
    disablePadding: false,
    label: '승인금액',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '거래유종',
  },
  {
    id: 'lbrctStleNm',
    numeric: false,
    disablePadding: false,
    label: '주유형태',
  },
  {
    id: 'fuelQty',
    numeric: false,
    disablePadding: false,
    label: '연료량',
    format: 'number',
    align: 'td-right,'
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'ftxAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'opisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금',
    format: 'number',
    align: 'td-right',
  },
  {
    id: 'splitYn',
    numeric: false,
    disablePadding: false,
    label: '분할결제여부',
  },
  {
    id: 'unsetlAmt',
    numeric: false,
    disablePadding: false,
    label: '미결제금액',
    format: 'number',
    align: 'td-right',
  },
];

const rows: Row[] = []

interface RegisterModalFormProps {
  rows: Row[] | [];
}

const RegisterModalForm : React.FC<RegisterModalFormProps> = ({
  rows,
}) => {
  const [params, setParams] = useState({
      vhclTonCd: "10톤이하", // 톤수
      koiCd: "LPG", // 유종
      crtrAplcnYmd: "", // 고시기준일
      crtrYear: "", // 기준년도
      avgUseLiter: "", // 월지급기준량
      limUseRt: "", // 한도비율
      crtrLimLiter: "" // 한도리터                // 정렬 기준 추가
  });

  return (
  <Box>
      <TableContainer style={{margin:'16px 0 4em 0'}}>
      <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="tableTitle"
          size={'small'}
      >
          <TableHead>
          <TableRow key={'thRow'}>
              {headCells.map((headCell) => (
              <React.Fragment key={'th'+headCell.id}>

              <TableCell
                  align={'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
              >
              <div className="table-head-text">
                      {headCell.label}
              </div>
              </TableCell>
              </React.Fragment>
              ))}
          </TableRow>
          </TableHead>
          <TableBody>
              {rows.map((row: any, index) => {
                  return (
                      <TableRow key={'tr' + index}>
                          {/* 만약에 index 안 될 경우 useRef 사용하자 */}
                          <TableCell style={{whiteSpace:'nowrap'}}>{brNoFormatter(row.brno)}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'left'}}>{row.bzentyNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.vhclNo}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.vhclSeNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{formatDate(row.dlngYmdtm)}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.cardSeNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.cadcoNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.cardNoS}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'left'}}>{row.frcsNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{row.aprvAmt.toLocaleString('ko-KR')}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.koiNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.lbrctStleNm}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{row.fuelQty.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{row.asstAmt.toLocaleString('ko-KR')}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{row.ftxAsstAmt.toLocaleString('ko-KR')}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{row.opisAmt.toLocaleString('ko-KR')}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap'}}>{row.splitYn}</TableCell>
                          <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>{row.unsetlAmt.toLocaleString('ko-KR')}</TableCell>
                      </TableRow>
                  )
              })}
          </TableBody>
      </Table>
      </TableContainer>
  </Box>
  );
}

export default RegisterModalForm;