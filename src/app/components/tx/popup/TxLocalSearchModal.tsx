/* React */
import { SetStateAction, useCallback, useEffect, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* interface */
import { localSearchHC } from '@/utils/fsms/headCells'
import { Pageable2 } from 'table'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

interface propsInterface {
  open:boolean
  setOpen:React.Dispatch<SetStateAction<boolean>>
  rowClick:(row:LocalSearchRow) => boolean
}

export interface LocalSearchRow {
  ctpvCd:string
  sggCd:string
  ctpvNm:string
  locgovNm:string
  locgovCd:string
}

interface listSearchObj {
  page:number
  size:number
  locgovNm:string
}

const TxLocalSearchModal = (props:propsInterface) => {

  const { open, setOpen, rowClick } = props;

  const [flag, setFlag] = useState<boolean|null>(null)
  const [rows, setRows] = useState<LocalSearchRow[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<listSearchObj>({ page:1, size:10, locgovNm:'' })
  const [pageable, setPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 })

  useEffect(() => {
    if (flag !== null) {
      fetchData()
    }
  }, [flag])

  const fetchData = async () => {
    
    if (!params.locgovNm) {
      alert('지자체명을 입력 해주세요');
      return;
    }

    setRows([])
    setTotalRows(0)
    setPageable({ pageNumber:1, pageSize:10, totalPages:1 })
    setLoading(true)
    
    try {
      
      const endpoint = '/fsm/stn/ltmm/tr/pop/getLocgovInfo' + toQueryParameter(params)        
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache:'no-store' })

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaginationModelChange = useCallback((page:number, pageSize:number) => {
    setParams((prev) => ({ ...prev, page:page, size:pageSize }));
    setFlag(prev => !prev)
  }, []);

  const handleSearchChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]:value }));
  }

  const handleRowClick = useCallback((row:LocalSearchRow) => {
    if (rowClick(row)) {
      setOpen(false)
    };
  }, []);

  const handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();
      setFlag(prev => !prev);
    }
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지자체 조회</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={() => setFlag(prev => !prev)}>
                검색
              </Button>
              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                취소
              </Button>
            </div>
          </Box>

          <Box sx={{ mb:2 }}>
            <Box className="sch-filter-box">
              <div className="filter-form">
                <div className="form-group">
                  <CustomFormLabel
                    className="input-label-display"
                    required={true}
                    htmlFor="ft-locgovNm"
                  >
                    지자체명
                  </CustomFormLabel>
                  <CustomTextField
                    id="ft-locgovNm"
                    name="locgovNm"
                    value={params.locgovNm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </Box>
          </Box>
          <Box>
            <TableDataGrid
              headCells={localSearchHC} // 테이블 헤더 값
              rows={rows} // 목록 데이터
              totalRows={totalRows} // 총 로우 수
              loading={loading} // 로딩여부
              onRowClick={handleRowClick} // 행 클릭 핸들러 추가
              onPaginationModelChange={handlePaginationModelChange} // 페이지 , 사이즈 변경 핸들러 추가
              pageable={pageable} // 현재 페이지 / 사이즈 정보
              caption={"관할관청 목록 조회"}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TxLocalSearchModal;
