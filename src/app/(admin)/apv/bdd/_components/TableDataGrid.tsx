import React, { useState } from 'react';

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
// MUI 그리드 한글화 import
import DetailDialog from '@/app/components/popup/DetailDialog';
import BlankCard from '@/app/components/shared/BlankCard';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import * as locales from '@mui/material/locale';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { HeadCell } from 'table';
import { Row } from '../page';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { brNoFormatter, dateTimeFormatter, getDateTimeString } from '@/utils/fsms/common/util';
type SupportedLocales = keyof typeof locales;

// 페이지 정보
type pageable = {
  pageNumber : number,
  pageSize : number,
  sort : string
}

interface VehicleHistory {
  bzentyNm?: string; // 업체명
  hstrySn: string; // 순번
  vhclNo: string; // 차량번호
  locgovNm: string; // 관할관청
  brno: string; // 사업자번호
  koiCd: string; // 유종코드
  vhclSeCd: string; // 
  dscntYn: string; // 할인여부코드
  locgovCd: string; // 관할관청코드
  vhclSttsCd: string; // 차량상태코드
  rfidYn: string; // RFID 차량 여부
  rgtrId: string; // 
  regDt: string;
  mdfrId: string;
  mdfcnDt: string;
  rfidNm: string; // RFID 차량 여부명
  vhclSttsNm: string; // 차량상태
  dscntNm: string; // 할인여부명
  dscntYnNm: string;
  koiNm: string; // 유종명
  vhclSeNm: string;
}

interface CardHistory {
  dlngDt:string;
  dlngYmd: string; // 거래일시
  dlngDate?: string;
  dlngTime?: string;
  brno: string; // 사업자번호
  cardNo: string; // 카드번호
  frcsNm: string; // 주유소명
  aprvAmt: string; // 승인금액
  fuelQty: string; // 연료량
  asstAmt: string; // 보조금
  ftxAsstAmt: string; // 유류세연동보조금
  opisAmt: string; // 유가연동보조금
  bzentyNm: string; // 업체명
  lbrctStleNm: string; // 주유형태
  koiNm: string; // 거래유종
  cardSeNm: string; // 카드구분
  crdcoNm: string; // 카드사
}

// 카드결제내역 내 headcells
const cardHistoryHeadCells: HeadCell[] = [
  {
    id: 'brno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
  },
  {
    id: 'bzentyNm',
    numeric: false,
    disablePadding: false,
    label: '업체명',
  },
  {
    id: 'dlngYmd',
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
    id: 'cardNo',
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
  },
  {
    id: 'asstAmt',
    numeric: false,
    disablePadding: false,
    label: '보조금',
  },
  {
    id: 'ftxAsstAmt',
    numeric: false,
    disablePadding: false,
    label: '유류세연동보조금',
  },
  {
    id: 'opisAmt',
    numeric: false,
    disablePadding: false,
    label: '유가연동보조금',
  },
]

const vehicleHistoryHeadCells: HeadCell[] = [
  {
    id: 'hstrySn',
    numeric: false,
    disablePadding: false,
    label: '순번',
  },
  {
    id: 'mdfcnDt',
    numeric: false,
    disablePadding: false,
    label: '변경일자',
  },
  {
    id: 'locgovNm',
    numeric: false,
    disablePadding: false,
    label: '관할관청',
  },
  {
    id: 'vhclSttsNm',
    numeric: false,
    disablePadding: false,
    label: '차량상태',
  },
  {
    id: 'koiNm',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'vhclSeNm',
    numeric: false,
    disablePadding: false,
    label: '면허업종',
  },
  {
    id: 'dscntYnNm',
    numeric: false,
    disablePadding: false,
    label: '할인여부',
  },
  {
    id: 'rfidNm',
    numeric: false,
    disablePadding: false,
    label: 'RFID차량여부',
  },
]

// 테이블 caption
const tableCaption :string = ''

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  headCells: HeadCell[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void;
  order: order;
  orderBy: string;
}

// 테이블 th 정의 기능
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { headCells, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof []) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow key={'thRow'}>
        {headCells.map((headCell) => (
          <React.Fragment key={'th'+headCell.id}>
          { headCell.sortAt ?
          <TableCell
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={createSortHandler(headCell.id)}
          >
          <div className="table-head-text">
            {headCell.label}
          </div>
          {orderBy === headCell.id ? (
            <Box component="span" sx={visuallyHidden}>
              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
            </Box>
            ) : null}
          </TableSortLabel>
          </TableCell>
          :
          <TableCell style={{whiteSpace:'nowrap'}}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
          >
          <div className="table-head-text">
                {headCell.label}
          </div>
          </TableCell>
          }
          </React.Fragment>
          ))}
        
      </TableRow>
    </TableHead>
  );
}

interface CardHistoryProps {
  data?: CardHistory,
  // headCells: HeadCell[]
}

function CardHistoryTable(props: CardHistoryProps) {
  const { data } = props;
  return(
    <>
    <Box className="sch-filter-box">
      <div className="filter-form">
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            승인일자
          </CustomFormLabel>
          <CustomTextField  type="date" value={data?.dlngDate} disabled fullWidth />
        </div>
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            승인시간
          </CustomFormLabel>
          <CustomTextField  type="time" value={data?.dlngTime} disabled fullWidth />
        </div>
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            결제카드번호
          </CustomFormLabel>
          <CustomTextField value={data?.cardNo} disabled fullWidth/>
        </div>
      </div>
    </Box>
    <TableContainer>
      <Table
        sx={{ minWidth: '750px' }}
        aria-labelledby="tableTitle"
        size={'medium'}
      >
        <EnhancedTableHead 
          headCells={cardHistoryHeadCells} 
          onRequestSort={() => {}} 
          order={'desc'} 
          orderBy={''}        
        />
        <TableBody>
          <TableRow>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.brno ? brNoFormatter(data.brno) : ''}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.bzentyNm}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {dateTimeFormatter(String(data?.dlngDt))}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.cardSeNm}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.crdcoNm}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.cardNo}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.frcsNm}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap', textAlign: 'right'}}>
              {data?.aprvAmt}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.koiNm}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap'}}>
              {data?.lbrctStleNm}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap', textAlign: 'right'}}>
              {Number(data?.fuelQty).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap', textAlign: 'right'}}>
              {data?.asstAmt}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap', textAlign: 'right'}}>
              {data?.ftxAsstAmt}
            </TableCell>
            <TableCell style={{whiteSpace:'nowrap', textAlign: 'right'}}>
              {data?.opisAmt}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    </>
  )
}

interface VehicleHistoryProps {
  datas: VehicleHistory[];
  bzentyNm: string;
}

function VehicleHistoryTable(props: VehicleHistoryProps) {
  const { datas, bzentyNm } = props;

  return(
    <>
    <Box className="sch-filter-box">
      <div className="filter-form">
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            차량번호
          </CustomFormLabel>
          <CustomTextField value={datas[0]?.vhclNo} disabled fullWidth />
        </div>
        <div className="form-group">
          <CustomFormLabel className="input-label-display">
            업체명
          </CustomFormLabel>
          <CustomTextField value={bzentyNm} disabled fullWidth />
        </div>
      </div>
    </Box>
    <TableContainer>
      <Table
        sx={{ minWidth: '750px' }}
        aria-labelledby="tableTitle"
        size={'medium'}
      >
        <EnhancedTableHead 
          headCells={vehicleHistoryHeadCells} 
          onRequestSort={() => {}} 
          order={'desc'} 
          orderBy={''}        
        />
        <TableBody>
          {datas.map((data: any, index) => {
             return (
             <TableRow id={'vehicle_row_' + index} >
              <TableCell style={{whiteSpace:'nowrap'}}>
                {Number(data?.hstrySn)}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.mdfcnDt}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.locgovNm}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.vhclSttsNm}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.koiNm}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.vhclSeNm}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.dscntNm}
              </TableCell>
              <TableCell style={{whiteSpace:'nowrap'}}>
                {data?.rfidNm}
              </TableCell>
            </TableRow>
           )
          })}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  )
}

// 검색 결과 건수 툴바
function TableTopToolbar(props:Readonly<{totalRows:number}>) {
  return (
    <div className="data-grid-top-toolbar">
      <div className="data-grid-search-count">
        검색 결과 <span className="search-count">{props.totalRows}</span>건
      </div>
    </div>
  );
}

// TableDataGrid의 props 정의
interface ServerPaginationGridProps {
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  pageable: pageable  // 페이지 정보
  fetchData: () => void
  excelDownload: () => void
}

type order = 'asc' | 'desc';

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    headCells,
    rows,
    totalRows,
    loading,
    onPaginationModelChange,
    onSortModelChange,
    pageable,
    fetchData,
    excelDownload
}) => {

  const [cardHistoryOpen, setCardHistoryOpen] = useState<boolean>(false);
  const [vehicleHistoryOpen, setVehicleHistoryOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<Row>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>();
  
  const [cardHistoryData, setCardHistoryData] = useState<CardHistory>();
  const [vehicleHistoryData, setVehicleHistoryData] = useState<VehicleHistory[]>();

  // 쿼리스트링의 sort 값이 컬럼명,정렬 구조로 되어있어 분해하여 테이블에 적용
  let order : order = 'desc'; 
  let orderBy : string = '';
  if (pageable.sort !== ''){
    let sort = pageable.sort.split(','); 
    orderBy = sort[0];
    order = sort[1] == 'desc'? 'desc' : 'asc';
  }

  // sort 정렬 변경시 정렬 기준으로 데이터 다시 로드
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof []) => {
    const isAsc = orderBy === property && order === 'asc';
    onSortModelChange(String(property)+','+ (isAsc ? 'desc' : 'asc'))
  };

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange(newPage,pageable.pageSize)
  };

  //페이지 사이즈 변경시 0 페이지로 이동
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPaginationModelChange(0,Number(event.target.value))
  };

  // 행 클릭시 해당 데이터 set
  const onRowClick = (row: Row, index: number) => {
    setSelectedRow(row);
    setSelectedIndex(index);
  }

  // 카드결제내역 조회
  const getCardHistory = async () => {
    try {
      let endpoint = `/fsm/apv/bdd/bs/getAllBusStlmDtls?` + 
      `&cardNo=${selectedRow?.cardNoEncpt}`+
      `&aprvNo=${selectedRow?.aprvNo}`+
      `&dlngYmd=${selectedRow?.dlngYmd}`;

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store'
      })

      if(response && response.resultType === 'success' && response.data) {
        let res: CardHistory = response.data[0];

        // 승인일자 년월일시분초 쪼개서 formatting
        let date = res.dlngDt;

        let year = date.substring(0,4);
        let month = date.substring(4,6);
        let day = date.substring(6,8);

        let hour = date.substring(8,10);
        let minute = date.substring(10,12);
        let seconds = date.substring(12,14);

        let dateString = year+"-"+month+"-"+day;
        let timeString = hour+":"+minute+":"+seconds;

        res.dlngDate = dateString;
        res.dlngTime = timeString;

        // 금액 천단위 콤마
        res.aprvAmt = Number(res.aprvAmt).toLocaleString('ko-KR');
        res.asstAmt = Number(res.asstAmt).toLocaleString('ko-KR');
        res.opisAmt = Number(res.opisAmt).toLocaleString('ko-KR');
        res.ftxAsstAmt = Number(res.ftxAsstAmt).toLocaleString('ko-KR');
        
        setCardHistoryData(res);
      }

    }catch(error) {
      console.error("ERROR ::: ", error);
    }
  }

  // 차량이력조회
  const getVehicleHistory = async () => {
    try {
      let endpoint = `/fsm/apv/bdd/bs/getAllVhcleMngHis?` + 
      `&vhclNo=${selectedRow?.vhclNo}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store'
      })

      if(response && response.resultType === 'success' && response.data) {
        setVehicleHistoryData(response.data)
      }
    }catch(error) {
      console.error("ERROR ::: " , error);
    }
  }

  const openCardHistory = async () => {
    if(!selectedRow) {
      alert("조회할 데이터를 선택해주세요.");
      return;
    }

    if(selectedRow?.stlmNm === '미결제') {
      alert("미결제내역으로 카드결제내역을 확인하실 수 없습니다.");
      return;
    }
    getCardHistory();
    setCardHistoryOpen(true);
  }

  const closeCardHistory = () => {
    setCardHistoryOpen(false);
  }

  const openVehicleHistory = async () => {
    if(!selectedRow) {
      alert("조회할 데이터를 선택해주세요.");
      return;
    }

    getVehicleHistory();
    setVehicleHistoryOpen(true);
  }

  const closeVehicleHistory = () => {
    setVehicleHistoryOpen(false);
  }

  // 보조금 정산 상태에 따라 글자 색상 변경 표시
  const setRowTextColor = (asstAmtClclnCd: string) => {
    let color: string = '';

    switch(asstAmtClclnCd) { // 0 ~ 9
      case '0': color='black'; 
      break;
      case '1': color='green';
      break;
      case '2': color='red';
      break;
      case '3': color='purple';
      break;
      case '4': color='fuchsia';
      break;
      case '5': color='teal';
      break;
      case '6': color='deepskyblue';
      break;
      case '7': color='brown';
      break;
      case '8': color='chartreuse';
      break;
      case '9': color='red';
      break;
      default: return color;
    }

    return color;
  }

  // MUI 그리드 한글화
  const locale : SupportedLocales ='koKR';
  const theme = useTheme();
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}>
      <Box className="table-bottom-button-group">
          <div className="button-right-align">
            <Button variant="contained" onClick={() => fetchData()} color="primary">
              검색
            </Button>
            <Button variant="contained" onClick={() => excelDownload()} color="primary">
              엑셀
            </Button>
            <Button onClick={openCardHistory}>카드결제내역</Button>
            <DetailDialog 
              title= '카드결제내역'
              isOpen={cardHistoryOpen}
              handleClickClose={closeCardHistory}
              size={'xl'}
              children={<CardHistoryTable data={cardHistoryData} />} 
            />
            <Button onClick={openVehicleHistory}>차량이력조회</Button>
            <DetailDialog 
              title= '차량이력조회'
              isOpen={vehicleHistoryOpen}
              handleClickClose={closeVehicleHistory}
              size={'lg'}
              children={<VehicleHistoryTable datas={vehicleHistoryData || []} bzentyNm={selectedRow?.bzentyNm || ''} />} 
            />
          </div>
        </Box>
      <div className="data-grid-wrapper">
        <TableTopToolbar totalRows={totalRows} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'small'}
          >
          <caption>
            {tableCaption}
          </caption>
            <EnhancedTableHead
              headCells={headCells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  return (
                    <TableRow key={'tr'+index} hover onClick={() => onRowClick(row, index)} selected={index == selectedIndex}>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.asstAmtClclnNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.cnptSeNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.locgovNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {brNoFormatter(row.brno)}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.bzentyNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.vhclNo}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.vhclSeNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {dateTimeFormatter(row.dlngDt)}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.dlngSeNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.cardSeNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.crdcoNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.cardNo}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.frcsNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd), textAlign:'right'}}>
                        {row.aprvAmt.toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.koiNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.lbrctStleNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd), textAlign:'right'}}>
                        {row.fuelQty.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd), textAlign:'right'}}>
                        {row.asstAmt.toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd), textAlign:'right'}}>
                        {row.ftxAsstAmt.toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd), textAlign:'right'}}>
                        {row.opisAmt.toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.stlmNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.imgRecog1VhclNo}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.imgRecog2VhclNo}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd)}}>
                        {row.vcf}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', color: setRowTextColor(row.asstAmtClclnCd), textAlign:'right'}}>
                        {Number(row.crctBfeFuelQty).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                }) : 
                <TableRow key={'tr0'}>
                  <TableCell colSpan={headCells.length} className='td-center'><p>자료가 없습니다. 다른 검색조건을 선택해주세요.</p></TableCell>
                </TableRow>
              : 
              <TableRow key={'tr0'}>
                <TableCell colSpan={headCells.length} className='td-center'><p> </p></TableCell>
              </TableRow>
            }
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* <CustomFormLabel className="input-label-none" htmlFor="tablePagination" >페이지</CustomFormLabel> */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={pageable.pageSize}
          page={pageable.pageNumber}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
      <Box style={{display:'flex', alignItems: 'center', justifyContent:'space-around', padding:'1rem 1rem'}}>
          <span>■ 일반거래</span>
          <span style={{color: 'red'}}>■ 취소거래</span>
          <span style={{color: 'blue'}}>■ 취소된원거래</span>
          <span style={{color: 'green'}}>■ 대체카드거래</span>
          <span style={{color: 'purple'}}>■ 보조금지급정지/휴지</span>
          <span style={{color: 'fuchsia'}}>■ 유종없음</span>
          <span style={{color: 'teal'}}>■ 유종불일치</span>
          <span style={{color: 'deepskyblue'}}>■ 1시간이내재주유</span>
          <span style={{color: 'brown'}}>■ 1일4회이상주유</span>
          <span style={{color: 'chartreuse'}}>■ 사용리터없음</span>
      </Box>
    </ThemeProvider>
  );
};

export default TableDataGrid;