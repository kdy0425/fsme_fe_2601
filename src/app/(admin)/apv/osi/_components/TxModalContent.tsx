import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Pageable2 } from 'table';
import { Row } from './TxPage';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { getDateRange, getFormatToday, getToday } from '@/utils/fsms/common/comm';
import { getExcelFile } from '@/utils/fsms/common/comm'
import { apvOsiDlngTxHeadCells } from '@/utils/fsms/headCells'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'


interface ModalProperties {
  type: 'M' | 'D' // M: 월별거래내역, D: 알별거래내역
  frcsBrno:string, // 가맹점 사업자번호
  excelDown:boolean|null, // 엑셀다운로드 실행여부
  onExcelDown: () => void
}

const TxModalContent = (props: ModalProperties) => {
  
  const { type, frcsBrno, excelDown, onExcelDown } = props;

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정
  const [rows, setRows] = useState<Row[]>([]) // 가져온 로우 데이터
  const [totalRows, setTotalRows] = useState(0) // 총 수
  const [loading, setLoading] = useState(false) // 로딩여부

  const [excelFlag, setExcelFlag] = useState<boolean>(false) // 조회조건 변경 시 엑셀기능 동작여부
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

  const [pageable, setPageable] = useState<Pageable2>({
    pageNumber: 1, // 페이지 번호는 1부터 시작
    pageSize: 10, // 기본 페이지 사이즈 설정
    totalPages: 1, // 정렬 기준
  })
  
  const [params, setParams] = useState({
    page: Number(1), // 페이지 번호는 1부터 시작
    size: Number(10), // 기본 페이지 사이즈 설정
    trauYmd: type == 'D' ? getDateRange('d', 30).endDate : getDateRange('d', 30).endDate.substring(0,7),
    vhclNo:''
  });

  const fetchData = async () => {
    setLoading(true)
    setExcelFlag(true)
    try {
      
      if(!params.trauYmd) {
        alert(type == 'M' ? '거래년월 항목은 필수입니다.' : '거래일자 항목은 필수입니다.')
        return;
      }

      let endpoint: string =
        `/fsm/apv/osi/tx/getAllOltStdrDelngDtlsTx?page=${params.page}&size=${params.size}` +
        `${'&frcsBrno=' + frcsBrno}`+
        `${params.trauYmd ? '&trauYmd=' + params.trauYmd.replaceAll('-', '') : ''}` +
        `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시

        if(response.data.content.length > 0) {
          response.data.content.map( (data: Row) => {
            data.trauYmd = data.trauYmd + data.dlngTm
          })
        }

        setRows(response.data.content)
        setTotalRows(response.data.totalElements)
        setPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      } else {
        // 데이터가 없거나 실패
        setRows([])
        setTotalRows(0)
        setPageable({
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        })
      }
    } catch (error) {
      // 에러시
      setRows([])
      setTotalRows(0)
      setPageable({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      })
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(excelDown) {
      excelDownload();
      onExcelDown(); // 엑셀다운로드 Flag 전환
    }    
  }, [excelDown])

  const excelDownload = async () => {

    if(rows.length == 0){
      alert('엑셀파일을 다운로드할 데이터가 없습니다.')
      return;
    }

    if(!excelFlag){
      alert('조회조건이 변경되었습니다. 검색 후 다운로드가 가능합니다.')
      return
    }

    try{
      setLoadingBackdrop(true)
      let endpoint: string =
      `/fsm/apv/osi/tx/getExcelOltStdrDelngDtlsTx` +
      `${'?frcsBrno=' + frcsBrno}`+
      `${params.trauYmd ? '&trauYmd=' + params.trauYmd.replaceAll('-', '') : ''}` +
      `${params.vhclNo ? '&vhclNo=' + params.vhclNo : ''}`

      await getExcelFile(endpoint, '가맹점' + (type == 'M' ? '월별' : '일별') + '거래내역' + '_'+getToday()+'.xlsx')
    }catch(error){
      console.error("ERROR :: ", error)
    }finally{
      setLoadingBackdrop(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExcelFlag(false) // 엑셀기능 동작여부
    const {name, value} = event.target
    setParams(prev => ({ ...prev, [name]: value }));
  }

  const handlePaginationModelChange = useCallback((page: number, pageSize: number) => {
    setParams((prev) => ({ ...prev, page: page, size: pageSize }));
    setFlag(prev => !prev);
  }, []);
  
  const handleAdvancedSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setParams((prev) => ({ ...prev, page:1, size:10 })) // 첫 페이지로 이동
    setFlag(prev => !prev)
  }
  
  useEffect(() => {
    setRows([])
    fetchData()
  }, [flag])

  return (
    <Box sx={{minHeight: 500}}>
      <LoadingBackdrop open={loadingBackdrop} />
      <Box component='form' id='send-search' onSubmit={handleAdvancedSearch} sx={{ mb:4 }}>
        <Box className="sch-filter-box">
          <div className="filter-form">
            <div className="form-group">
              <CustomFormLabel htmlFor="ft-frcsBrno" className="input-label-display" required>
                사업자등록번호
              </CustomFormLabel>
              <CustomTextField id="ft-frcsBrno" value={frcsBrno} disabled fullWidth />
            </div>
            
            <div className="form-group">
              {
                type == 'M' ?
                <>
                  <CustomFormLabel htmlFor="ft-trauYmd" className="input-label-display" required>
                    거래년월
                  </CustomFormLabel>
                  <CustomTextField id="ft-trauYmd" name="trauYmd" value={params.trauYmd ?? ""} onChange={handleSearchChange} type='month' fullWidth inputProps={{ max:getFormatToday().substring(0,7) }}/>
                </>
                :
                <>
                  <CustomFormLabel htmlFor="ft-trauYmd" className="input-label-display" required>
                    거래일자
                  </CustomFormLabel>
                  <CustomTextField id="ft-trauYmd" name="trauYmd" value={params.trauYmd ?? ""} onChange={handleSearchChange} type='date' fullWidth inputProps={{ max:getFormatToday() }}/>
                </>
              }
            </div>
            <div className="form-group">
              <CustomFormLabel htmlFor="ft-vhclNo" className="input-label-display">
                차량번호
              </CustomFormLabel>
              <CustomTextField htmlFor="ft-vhclNo" name="vhclNo" value={params.vhclNo ?? ""} onChange={handleSearchChange} fullWidth />
            </div>
          </div>
        </Box>
      </Box>
      <Box>
        <TableDataGrid 
          headCells={apvOsiDlngTxHeadCells} 
          rows={rows}
          totalRows={totalRows}
          loading={loading}
          pageable={pageable}
          onPaginationModelChange={handlePaginationModelChange}
          caption={type === 'M' ? "가맹점 월별거래내역조회 목록" : "가맹점 일별거래내역조회 목록"}
        />
      </Box>
    </Box>
  );
}

export default TxModalContent;