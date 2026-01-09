/* React */
import React, { useEffect, useState, useCallback, SetStateAction } from 'react';

/* mui */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { CommTextField } from '@/app/components/tx/commTextField/CommTextFiled';

/* 공통 interface */
import { parCprLocgovHC } from '@/utils/fsms/headCells';
import { Pageable2 } from 'table'
import { locgovListInterface } from './DetailDataGrid';

/* 공통 js */
import { toQueryParameter } from '@/utils/fsms/utils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { trim } from 'lodash'

/* interface 선언 */
interface RsnPropInterface {
  open:boolean,
  setOpen:React.Dispatch<SetStateAction<boolean>>
  handleSubmit:(docmntAplyRsnCn:string) => boolean
}

interface LocPropInterface {
  searchFlag:boolean,
  updateLocgovCd:(row:any) => void,
}

export const RsnModalContent = (props:RsnPropInterface) => {
  
  const { open, setOpen, handleSubmit } = props;

  /* 상태관리 */
  const[txtLength, setTxtLength] = useState<number>(0);
  const[docmntAplyRsnCn, setDocmntAplyRsnCn] = useState<string>(''); // 사유

  const handleChange = (val:string) => {    
    if(val.length <= 100) {
      setTxtLength(val.length);
      setDocmntAplyRsnCn(val);
    }    
  }

  const handleClick = () => {

    if (!docmntAplyRsnCn) {
      alert('작성된 내용이 없습니다');
      return;
    }

    const rst = handleSubmit(docmntAplyRsnCn);

    if (rst) {
      setOpen(false);
    }
  }

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>지급거절사유 일괄등록</h2>
            </CustomFormLabel>

            {/* 버튼 */}
            <div className=" button-right-align">
              <Button variant="contained" color="primary" onClick={handleClick}>
                등록
              </Button>

              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          <div className="table-scrollable">
            <table className="table table-bordered">
              <caption>지급거절사유 일괄등록</caption>
              <colgroup>
                <col style={{ width:'120px'}} />
                <col style={{ width:'auto'}} />
              </colgroup>
              <tbody>
                <tr>
                  <th className="td-head" scope="row">지급거절사유</th>
                  <td>
                    <CustomFormLabel className="input-label-none" htmlFor="ft-docmntAplyRsnCn">지급거절사유</CustomFormLabel>
                    <CustomTextField
                      id="ft-docmntAplyRsnCn"
                      fullWidth
                      name="docmntAplyRsnCn"
                      maxLength={100}
                      value={docmntAplyRsnCn}
                      onChange={(event:React.ChangeEvent<HTMLInputElement>) => handleChange(event.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{marginTop:15, textAlign:'right', color:'black'}}>
            {txtLength}/100
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export const LocgovModalContent = (props:LocPropInterface) => {
  
  const { searchFlag, updateLocgovCd } = props;
  
  /* 상태관리 */
  const[locgovNm, setLocgovNm] = useState<string>(''); // 조회조건
  const[rows, setRows] = useState<locgovListInterface[]>([]); // 조회데이터
  const[totalRows, setTotalRows] = useState<number>(0); // 조회데이터 총 갯수
  const[loading, setLoading] = useState<boolean>(false); // 로딩여부
  const[pageable, setPageable] = useState<Pageable2>({ pageNumber: 1, pageSize: 10, totalPages: 1 }); // 페이징객체

  useEffect(() => {
    // 조회클릭시
    getAllLocgovList(1, 10);
  }, [searchFlag]);

  // 카드사 서면신청내역 가져오기
  const getAllLocgovList = async (page:number, pageSize:number) => {

    setLoading(true);
    
    try {
      const searchObj = {
        page:page,
        size:pageSize,
        locgovNm:trim(locgovNm)
      };
      
      const endpoint = '/fsm/par/cpr/cm/getAllLocgovList' + toQueryParameter(searchObj);
      const response = await sendHttpRequest('GET', endpoint, null, true, {cache: 'no-store'});

      if (response && response.resultType === 'success' && response.data) {
        // 데이터 조회 성공시
        setRows(response.data.content);
        setTotalRows(response.data.totalElements);
        setPageable({
          pageNumber:response.data.pageable.pageNumber + 1,
          pageSize:response.data.pageable.pageSize,
          totalPages:response.data.totalPages,
        });
      } else {
        // 데이터가 없거나 실패
        setRows([]);          
        setTotalRows(0);
        setPageable({ pageNumber:1, pageSize:10, totalPages:1 });
      }
    } catch (error) {
      // 에러시
      console.log(error);
      setRows([]);
      setTotalRows(0);
      setPageable({ pageNumber:1, pageSize:10, totalPages:1 });
    } finally {
      setLoading(false)
    }
  };

  // 페이징변경시
  const handlePaginationModelChange = useCallback((page:number, pageSize:number) => {
    getAllLocgovList(page, pageSize);
  }, []);

  // 지자체명 변경시
  const handleSearchChange = useCallback((event:React.ChangeEvent<HTMLInputElement>) => {
    setLocgovNm(event.target.value);
  }, []);

  return (
    <Box sx={{ minWidth: 850}}>
      <Box component="form" onSubmit={() => null} sx={{ mb: 2 }}>
        <Box className="sch-filter-box">
          {/* 지자체명 조회조건 */}
          <CommTextField
            type={'locgovNm'} 
            handleChange={handleSearchChange}
          />
        </Box>
        <Box style={{marginTop:'15px'}}>
          <TableDataGrid
            headCells={parCprLocgovHC}
            rows={rows}
            totalRows={totalRows}
            loading={loading}
            pageable={pageable}
            onPaginationModelChange={handlePaginationModelChange}
            onRowDoubleClick={updateLocgovCd}
            onRowClick={updateLocgovCd}
          />
        </Box>
      </Box>
    </Box>
  );
};