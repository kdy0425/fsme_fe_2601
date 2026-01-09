/* React */
import { useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통 type */
import { Pageable2, HeadCell } from 'table'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { trim } from 'lodash'
import { toQueryParameter } from '@/utils/fsms/utils'
import { isNumber } from '@/utils/fsms/common/comm'

/* interface 선언 */
const oilStationPopSearchTxHC: HeadCell[] = [
  {
    id: 'frcsBrno',
    numeric: false,
    disablePadding: false,
    label: '사업자등록번호',
    format: 'brno',
  },
  {
    id: 'frcsNm',
    numeric: false,
    disablePadding: false,
    label: '주유소명',
  },
  {
    id: 'frcsTelno',
    numeric: false,
    disablePadding: false,
    label: '전화번호',
    format: 'telno',
  },
  {
    id: 'frcsAddr',
    numeric: false,
    disablePadding: false,
    label: '주소',
  },
]

export interface OilStationSearchRow {
  frcsBrno: string
  frcsNm: string
  frcsTelno: string
  frcsAddr: string
}

type listSearchObj = {
  page: number
  size: number
  frcsBrno: string
}

interface propsInterface {
  open:boolean
  setOpen:React.Dispatch<React.SetStateAction<boolean>>
  rowClick:(row:OilStationSearchRow) => void
}

const TxOilStationModal = (props:propsInterface) => {
  
  const { open, setOpen, rowClick } = props;

  const [flag, setFlag] = useState<boolean|null>(null);
  const [rows, setRows] = useState<OilStationSearchRow[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState<number>(0) // 총 수
  const [loading, setLoading] = useState<boolean>(false) // 로딩여부
  const [params, setParams] = useState<listSearchObj>({ page: 1, size: 10, frcsBrno: '' });
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    let { key } = event
    if (key === 'Enter') {
      setFlag(prev => !prev);
    }
  };

  const setInitialState = () => {
    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    setParams((prev) => ({ ...prev, page:1, size:10 }));
  }

  useEffect(() => {
    if (flag !== null) {
      setInitialState();
      fetchData();
    }
  }, [flag])

  // Fetch를 통해 데이터 갱신
  const fetchData = async () => {
    
    setLoading(true)
    
    try {
      
      if (!trim(params.frcsBrno)) {
        alert('충전소 사업자등록번호를 입력해주세요')
        return
      }

      const searchObj = {
        page:params.page,
        size:params.size,
        frcsBrno:params.frcsBrno
      }

      const endpoint: string = '/fsm/apv/osi/tx/getAllOltStdrInfo' + toQueryParameter(searchObj);    
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

      if (response && response.resultType === 'success' && response.data.content.length != 0) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // 페이지 번호와 페이지 사이즈를 params에 업데이트
  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }));
    setFlag(prev => !prev)
  }, []);

  // 조회조건 값 변경시 호출되는 함수
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
    
    const { value } = event.target;

    if (isNumber(value)) {
      setParams((prev) => ({ ...prev, frcsBrno: value }));
    }    
  }

  const onRowClick = (row:OilStationSearchRow) => {
    rowClick(row);
    setOpen(false);
  }

  return (
    <Box>
      <Dialog
        fullWidth={false}
        maxWidth={'lg'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>주유소 조회</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() =>setFlag(prev => !prev)}
              >
                검색
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
            </div>
          </Box>

          {/* 모달 조회조건 시작 */}
          <Box sx={{ mb: 2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                  >
                    사업자등록번호
                  </CustomFormLabel>
                  <CustomTextField
                    name="frcsBrno"
                    value={params.frcsBrno}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    inputProps={{
                      maxLength:10
                    }}
                  />
                </div>
              </div>
            </Box>
          </Box>
          {/* 모달 조회조건 종료 */}

          <Box width={1000}>
            <TableDataGrid
              headCells={oilStationPopSearchTxHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={onRowClick} 
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TxOilStationModal
