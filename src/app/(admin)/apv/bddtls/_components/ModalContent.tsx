import { CustomFormLabel, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Box, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, {useState, useEffect} from 'react';
import { HeadCell } from 'table';


const headCells: HeadCell[] = [
  {
    id: 'mnfctrNm',
    numeric: false,
    disablePadding: false,
    label: '제작사명',
  },
  {
    id: 'vhclNm',
    numeric: false,
    disablePadding: false,
    label: '차명',
  },
  {
    id: 'frmNm',
    numeric: false,
    disablePadding: false,
    label: '형식',
  },
  {
    id: 'yridnw',
    numeric: false,
    disablePadding: false,
    label: '연식',
  },
  {
    id: 'dtaMngNo',
    numeric: false,
    disablePadding: false,
    label: '제원관리번호',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '탱크용량',
  },
  {
    id: 'vhclTonNm',
    numeric: false,
    disablePadding: false,
    label: '톤수',
  },
];

interface Row {
  mnfctrNm: string;
  vhclNm: string;
  frmNm: string;
  yridnw: string;
  dtaMngNo: string;
  tnkCpcty: string;
  vhclTonNm: string;
}

const rows : Row[] = [
  {
    // id: uniqueId(),
    mnfctrNm: "Volvo", // 제작사명
    vhclNm: "FM 카고", // 차명
    frmNm: "FM64R1HA", // 형식
    yridnw: "2017", // 연식
    dtaMngNo: "01120000703023317", // 제원관리번호
    tnkCpcty: "", // 탱크용량
    vhclTonNm: "1톤이하" // 톤수
  },
 
]

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

type ModalProps = {
  data: Row[]
}

const tonData = [ // 코드그룹 /fsm/cmm/cmmn/cm/getAllCmmnCd [971]
  {
    value: '',
    label: '전체',
  },
  {
    value: '01',
    label: '1톤이하',
  },
  {
    value: '03',
    label: '3톤이하',
  },
  {
    value: '05',
    label: '5톤이하',
  },
  {
    value: '08',
    label: '8톤이하',
  },
  {
    value: '10',
    label: '10톤이하',
  },
]
const makerData = [
  {
    value: '',
    label: '전체',
  },
  {
    value: 'Volvo',
    label: 'Volvo',
  },
  {
    value: '다임러',
    label: '다임러',
  },
  {
    value: '만트럭버스코리아',
    label: '만트럭버스코리아',
  },
  {
    value: '스카니아',
    label: '스카니아',
  },
  {
    value: '쌍용',
    label: '쌍용',
  },
  {
    value: '이베코',
    label: '이베코',
  },
  {
    value: '타타대우',
    label: '타타대우',
  },
  {
    value: '한국지엠',
    label: '한국지엠',
  },
  {
    value: '현대/기아',
    label: '현대/기아',
  },
]

const RegisterModalForm = () => {
  const [params, setParams] = useState({
    mnfctrNm: "", // 제작사명
    vhclNm: "", // 차명
    frmNm: "", // 형식
    yridnw: "", // 제원관리번호
    vhclTonNm: "", // 톤수
    // 정렬 기준 추가
  });
  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  
  // 검색시 검색 조건에 맞는 데이터 갱신 및 1페이지로 이동
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 })) // 첫 페이지로 이동
    setFlag(!flag)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = event.target

    setParams(prev => ({ ...prev, [name]: value }));
  }

  return (
    <Box>
      <TableContainer style={{margin:'16px 0 4em 0'}}>
        <Box component="form" onSubmit={handleAdvancedSearch} sx={{ mb: 2 }}>
          <Box className="sch-filter-box">
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-mnfctrNm"
                >
                  제작사명
                </CustomFormLabel>
                <select
                  id="ft-mnfctrNm-select-02"
                  className="custom-default-select"
                  name="mnfctrNm"
                  value={params.mnfctrNm}
                  onChange={handleSearchChange}
                  style={{ width: '100%' }}
                >
                  {makerData.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-car-name">차명</CustomFormLabel>
                <CustomTextField type="text" value={params.vhclNm} id="ft-car-name" fullWidth />
              </div>
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-car-frmNm">형식</CustomFormLabel>
                <CustomTextField type="text" value={params.frmNm} id="ft-car-frmNm" fullWidth />
              </div>
            </div><hr></hr>
            <div className="filter-form">
              <div className="form-group">
                <CustomFormLabel className="input-label-display" htmlFor="ft-car-name">제원관리번호</CustomFormLabel>
                <CustomTextField type="text" value={params.yridnw} id="ft-car-name" fullWidth />
              </div>
              <div className="form-group">
                <CustomFormLabel
                  className="input-label-display"
                  htmlFor="ft-tons"
                >
                  톤수
                </CustomFormLabel>
                <select
                  id="ft-tons-select-02"
                  className="custom-default-select"
                  name="vhclTonNm"
                  value={params.vhclTonNm}
                  onChange={handleSearchChange}
                  // style={{ width: '100%' }}
                >
                  {tonData.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Box>
        </Box>

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
                  {row.mnfctrNm}
                </TableCell>
                <TableCell>
                  {row.vhclNm}
                </TableCell>
                <TableCell>
                  {row.frmNm}
                </TableCell>
                <TableCell>
                  {row.yridnw}
                </TableCell>
                <TableCell>
                  {row.dtaMngNo}
                </TableCell>
                <TableCell>
                  {row.tnkCpcty}
                </TableCell>
                <TableCell>
                  {row.vhclTonNm}
                </TableCell>
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