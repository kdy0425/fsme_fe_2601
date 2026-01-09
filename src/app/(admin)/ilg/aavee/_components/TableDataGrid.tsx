import React, { useEffect, useState } from 'react';

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
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import { HeadCell } from 'table';
import { Row } from '../page';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import { brNoFormatter, getDateTimeString } from '@/utils/fsms/common/util';
import { SelectItem } from 'select';
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode';
type SupportedLocales = keyof typeof locales;

// 페이지 정보
type pageable = {
  pageNumber : number,
  pageSize : number,
  sort : string
}

// 테이블 caption
const tableCaption :string = ''

// 테이블 th 정의 기능에 사용하는 props 정의
interface EnhancedTableProps {
  numSelected: number;
  headCells: HeadCell[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof []) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: order;
  orderBy: string;
  rowCount: number;
}

// 테이블 th 정의 기능
function EnhancedTableHead(props: Readonly<EnhancedTableProps>) {
  const { onSelectAllClick, headCells, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof []) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow key={'thRow'}>
        <TableCell padding="checkbox">
          <CustomCheckbox
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            tabIndex={-1}
            inputProps={{
              'aria-labelledby': 'select all desserts',
            }}
          />
        </TableCell>
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
          <TableCell
            style={{whiteSpace:'nowrap'}}
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

// 테이블 상단 툴바 - 검색 결과 건수
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
  locgovItems: SelectItem[]
  headCells: HeadCell[]
  rows: Row[] // 목록 데이터
  totalRows: number // 총 검색 결과 수
  loading: boolean // 로딩 여부
  onPaginationModelChange: (page: number, pageSize: number) => void // 페이지 변경 핸들러 추가
  onSortModelChange: (sort: string) => void // 정렬 모델 변경 핸들러 추가
  onRowClick: (row: Row) => void // 행 클릭 핸들러 추가
  pageable: pageable  // 페이지 정보
}

type order = 'asc' | 'desc';

interface TableBottomToolbarProps {
  numSelected: number;
}

// 테이블 하단 툴바 - 체크박스 선택 건수
function TableBottomToolbar(props: TableBottomToolbarProps) {
  const { numSelected } = props;

  return (
    <div className="data-grid-bottom-toolbar">
      {numSelected > 0 ? (
        <div className="data-grid-select-count action">
          총 {numSelected}건 선택
        </div>
      ) : (
        <div className="data-grid-select-count">
          총 0건 선택
        </div>
      )}
    </div>
  );
}

const TableDataGrid: React.FC<ServerPaginationGridProps> = ({
    locgovItems,
    headCells,
    rows,
    totalRows,
    loading,
    onPaginationModelChange,
    onSortModelChange,
    onRowClick,
    pageable,
}) => {
  // 카드사
  const [cardCoItems, setCardCoItems] = useState<SelectItem[]>([]);
  // 사업자 구분
  const [bzmnSeCdItems, setBzmnSeCdItems] = useState<SelectItem[]>([]);
  // 유종 구분
  const [koiItems, setKoiItems] = useState<SelectItem[]>([]);
  // 거래 구분
  const [dlngSeCdItems, setDlngSeCdItems] = useState<SelectItem[]>([]);
  // 셀렉트 박스 선택
  const [selected, setSelected] = React.useState<readonly string[]>([]);


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

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.vhclNo);
      setSelected(newSelecteds);

      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // 페이지 변경시 사이즈를 유지하고 페이지 이동
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange(newPage,pageable.pageSize)
  };

  //페이지 사이즈 변경시 0 페이지로 이동
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPaginationModelChange(0,Number(event.target.value))
  };

  // MUI 그리드 한글화
  const locale : SupportedLocales ='koKR';
  const theme = useTheme();
  const themeWithLocale = React.useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  useEffect(() => {
    // 코드 파싱을 위한 item 세팅

    // 카드사 CCGC
    getCodesByGroupNm('CCGC').then((res) => {
      let itemArr:SelectItem[] = []
      if(res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      setCardCoItems(itemArr);
    });

    // 개인법인구분(택시) 706
    getCodesByGroupNm('706').then((res) => {
      let itemArr:SelectItem[] = []
      if(res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      setBzmnSeCdItems(itemArr);
    });

    // 카드사 CCGC
    getCodesByGroupNm('CCGC').then((res) => {
      let itemArr:SelectItem[] = []
      if(res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      setCardCoItems(itemArr);
    });

    // 유종 702
    getCodesByGroupNm('702').then((res) => {
      let itemArr:SelectItem[] = []
      if(res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      setKoiItems(itemArr);
    });

     // 거래유형 92F
     getCodesByGroupNm('92F').then((res) => {
      let itemArr:SelectItem[] = []
      if(res) {
        res.map((code: any) => {
          let item: SelectItem = {
            label: code['cdKornNm'],
            value: code['cdNm'],
          }

          itemArr.push(item)
        })
      }
      setDlngSeCdItems(itemArr);
    });
    
  }, [])


  const parseLocgovCd = (locgovCd: string) => {
    if(locgovCd) {
      let item = locgovItems.find(code => code.value === locgovCd);

      return item ? item['label'] : locgovCd;
    }
  }

  const parseBzmnSeCd = (bzmnSeCd: string) => {
    if(bzmnSeCd) {
      let item = bzmnSeCdItems.find(code => code.value === bzmnSeCd);

      return item ? item['label'] : bzmnSeCd;
    }
  }

  const parseKoiCd = (koiCd: string) => {
    if(koiCd) {
      let item = koiItems.find(code => code.value === koiCd);

      return item ? item['label'] : koiCd;
    }
  }
 
  
  return (
    // MUI 한글화 "ThemeProvider"
    <ThemeProvider theme={themeWithLocale}> 
      <div className="data-grid-wrapper">
        <Box className="table-bottom-button-group" style={{padding:'10px 0', marginTop: '0'}}>  
          <TableTopToolbar totalRows={totalRows} />
          <div className="button-right-align">
            <Button>기간별 조사대상 확정</Button>
            <Button>건별 조사대상 확정</Button>
            <Button variant="contained" color="success" style={{margin:'0 0 0 50px', marginTop: '0'}}>엑셀</Button>
          </div>
        </Box>
        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            size={'medium'}
          >
          <caption>
            {tableCaption}
          </caption>
            <EnhancedTableHead
              numSelected={selected.length}
              headCells={headCells}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {!loading ? 
                rows.length > 0 ? rows.map((row: any, index) => {
                  const isItemSelected = isSelected(row.vhclNo);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      key={'tr'+index} onClick={() => onRowClick(row)}                      
                      tabIndex={-1}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <CustomCheckbox
                          onClick={(event) => handleClick(event, row.vhclNo)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          key={row.vhclNo}
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {getDateTimeString(row.dlngYm, "date")?.dateString.slice(0,-1)}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {row.locgovNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {row.vhclNo}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {row.bzmnSeNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {brNoFormatter(row.brno)}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {row.bzentyNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap'}}>
                        {row.koiNm}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>
                        {Number(row.useLiter).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>
                        {Number(row.moliatAsstAmt).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell style={{whiteSpace:'nowrap', textAlign:'right'}}>
                        {row.useNmtm ?? 0}
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

        <TableBottomToolbar numSelected={selected.length} />
      </div>
    </ThemeProvider>
  );
};

export default TableDataGrid;
