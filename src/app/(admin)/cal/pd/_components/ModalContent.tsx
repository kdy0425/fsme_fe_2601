import { CustomFormLabel, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, {useState, useEffect} from 'react';
import { HeadCell } from 'table';
import { Row } from '../page';


const headCells: HeadCell[] = [
  {
    id: 'vhclTonCd',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
  {
    id: 'koiCd',
    numeric: false,
    disablePadding: false,
    label: '유종',
  },
  {
    id: 'crtrAplcnYmd',
    numeric: false,
    disablePadding: false,
    label: '고시기준일',
  },
  {
    id: 'crtrYear',
    numeric: false,
    disablePadding: false,
    label: '기준년도',
  },
  {
    id: 'avgUseLiter',
    numeric: false,
    disablePadding: false,
    label: '월지급기준량(L)',
  },
  {
    id: 'limUseRt',
    numeric: false,
    disablePadding: false,
    label: '한도비율(%)',
  },
  {
    id: 'crtrLimLiter',
    numeric: false,
    disablePadding: false,
    label: '한도리터(L)',
  },
];

const rows : Row[] = []


const selectYear = [ // 올해 기준 +-5년 으로 목록 뽑아내는 함수필요
  {value: 2019, label: 2019},
  {value: 2020, label: 2020},
  {value: 2021, label: 2021},
  {value: 2022, label: 2022},
  {value: 2023, label: 2023},
  {value: 2024, label: 2024},
  {value: 2025, label: 2025},
  {value: 2026, label: 2026},
  {value: 2027, label: 2027},
  {value: 2028, label: 2028},
  {value: 2029, label: 2029},
]

const RegisterModalForm = () => {
  const [params, setParams] = useState({
    vhclTonCd: "10톤이하", // 톤수
    koiCd: "LPG", // 유종
    crtrAplcnYmd: "", // 고시기준일
    crtrYear: "", // 기준년도
    avgUseLiter: "", // 월지급기준량
    limUseRt: "", // 한도비율
    crtrLimLiter: "" // 한도리터                // 정렬 기준 추가
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target

    setParams(prev => ({ ...prev, [name]: value }));
  }

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
              <TableRow key={'tr'+index}>
                <TableCell>
                  {row.vhclTonCd}
                </TableCell>
                <TableCell>
                  {row.koiCd}
                </TableCell>
                <TableCell>
                  {row.crtrAplcnYmd}
                </TableCell>
                <TableCell>
                  {row.crtrYear}
                </TableCell>
                <TableCell>
                  {row.avgUseLiter}
                </TableCell>
                <TableCell>
                  {row.limUseRt}
                </TableCell>
                <TableCell>
                  {row.crtrLimLiter}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        </Table>
      </TableContainer>

    <div className="data-grid-top-toolbar">
        <h4>등록</h4>
    </div>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
              <div className="table-head-text td-left">
                고시기준일
              </div>
              </TableCell>
              <TableCell >
                <CustomTextField type="date" name="crtrAplcnYmd" id="ft-date-start" fullWidth /> 
              </TableCell>
              <TableCell>
              <div className="table-head-text td-left">
                기준년도
              </div>
              </TableCell>
              <TableCell >
                <CustomSelect
                id="searchSelect"
                name="crtrYear"
                value={params.crtrYear}
                onChange={handleSearchChange}
                fullWidth
                variant="outlined"
                title="종류"
                >
                  {selectYear.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </CustomSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
              <div className="table-head-text td-left">
                월지급기준량(L)
              </div>
              </TableCell>
              <TableCell >
                <CustomTextField id="searchValue"  name="avgUseLiter" onChange={handleSearchChange} value={params.avgUseLiter} fullWidth title="검색어"/>
              </TableCell>
              <TableCell>
              <div className="table-head-text td-left">
                한도비율(%)
              </div>
              </TableCell>
              <TableCell >
                <CustomTextField id="searchValue"  name="limUseRt" onChange={handleSearchChange} value={params.limUseRt} fullWidth title="검색어"/>
              </TableCell>
              <TableCell>
              <div className="table-head-text td-left">
                한도리터(L)
              </div>
              </TableCell>
              <TableCell >
                <CustomTextField id="searchValue"  name="crtrLimLiter" onChange={handleSearchChange} value={params.crtrLimLiter} fullWidth title="검색어"/>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default RegisterModalForm;