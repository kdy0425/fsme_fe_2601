/* React */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* mui */
import { Box, Grid, Button } from '@mui/material'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import FormDialog from '@/app/components/popup/FormDialog'

/* _component */
import { RsnModalContent } from './ModalContent'

/* 공통 type */
import { HeadCell } from 'table' 

/* page에서 선언한 interface */
import { dealRow } from '../page';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel'

/* interface선언 */
interface DetailDataGridProps {
  headCells: HeadCell[],
  dealRow:dealRow[],
  setDealRow:(dealRow:dealRow[]) => void,
  loading:boolean,
  cardUseText:string,
  onCheckChange:(selected:string[], dealRow:dealRow[]) => void;
  handleDownLoad:() => void;
  rsnRef:any,
  aprvCd:string,
}

const DealDataGrid = (props:DetailDataGridProps) => {

  const { headCells, dealRow, setDealRow, loading, cardUseText, onCheckChange, handleDownLoad, rsnRef, aprvCd } = props;
  
  /* 상태관리 */
  const[open, setOpen] = useState<boolean>(false); // 모달오픈  
  const[chkCount, setChkCount] = useState<number>(0);

  /* useEffect */
  useEffect(() => {        
    if(dealRow) {

      let count = 0;

      dealRow.map((item) => {
        if(item.chk == '1') {
          count++;          
        }
      });

      setChkCount(count);
    }
  }, [dealRow]);

  /* 함수선언 */

  // 아이콘 클릭시 에러메세지 출력
  const handleClick = useCallback((row:dealRow, cellIndex:number) => {
    if(cellIndex == 0) {
      const errMsg = row.errMsg ? row.errMsg : '정상거래 입니다.';
      alert(errMsg);
    }
  }, []);

  // 지급거절사유 일괄등록
  const handleSubmit = (docmntAplyRsnCn:string) => {

    if (dealRow.length == 0) {
      alert('조회 후 이용부탁드립니다.');
      return false;
    }
  
    if(chkCount == dealRow.length) {
      alert('선택된 행이 없습니다.');
      return false;
    }

    const temp:dealRow[] = [];

    dealRow.map((item, index) => {

      let result = '';
      const docmntAplyRsnTag:React.ReactNode =  <><CustomFormLabel className="input-label-none" htmlFor={'tag' + index}>지급거절사유</CustomFormLabel>
                                                <input
                                                type='text'
                                                id={'tag' + index}
                                                ref={element => rsnRef.current[index] = element}
                                                onChange={(event) => rsnRef.current[index].value = event.target.value}
                                              /></>;

      if(item.chk == '1') {
        result = item.docmntAplyRsnCn;        
      } else {
        rsnRef.current[index].value = docmntAplyRsnCn;
        result = docmntAplyRsnCn;
      }

      temp.push({...item, docmntAplyRsnTag:docmntAplyRsnTag, docmntAplyRsnCn:result});
    });

    setDealRow(temp);
    return true;
  };

  return (
    <Grid container spacing={2} className="card-container">
      <Grid item xs={12} sm={12} md={12}>
        <BlankCard className="contents-card" title="거래내역">          
          <div style={{marginBottom:'10px'}}>
            {cardUseText ? (
              <div style={{marginBottom:'10px', color:'red'}}>{cardUseText}</div>
            ):null}
            <div className='data-table-toolbar'>
              <span>
                ( <span style={{color:'#00cc00'}}>● </span>: 정상, <span style={{color:'red'}}>● </span> : 서면신청 기간외 거래 )
              </span>
              <span>
                
                {/* 처리전 데이터만 버튼 show */}
                {aprvCd == '9' ? (                  
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setOpen(true)}
                  >
                    사유일괄등록
                  </Button>
                ) : null}

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleDownLoad}
                  style={{marginLeft:'10px'}}
                >
                  증빙자료
                </Button>
              </span>
            </div>
          </div>
          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={headCells}
              rows={dealRow}
              loading={loading}
              onRowClick={(row, index, cellIndex) => handleClick(row, cellIndex ?? 999)}
              onCheckChange={(selected:string[]) => onCheckChange(selected, dealRow)}
            />
          </Box>
        </BlankCard>
      </Grid>
      
      {open ? (
        <RsnModalContent
          open={open}
          setOpen={setOpen}
          handleSubmit={handleSubmit}
        />
      ) : null}

    </Grid>
  );
};

export default memo(DealDataGrid);