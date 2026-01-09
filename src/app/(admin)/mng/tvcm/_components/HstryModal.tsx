/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* mui component */
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'

/* 공통 component */
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통 type, interface */
import { HeadCell, Pageable2 } from 'table'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* util/interface.ts */
import { HstryModalProps, vhclHstryRow, bsnesHstryRow, cardHstryRow } from '../util/interface'

/* util/headCells.ts */
import { vhclHeadCells, bsnesHeadCells, cardHeadCells } from '../util/headCells'

const HstryModal = (props: HstryModalProps) => {
  
  const { open, setOpen, hstryModalData, hstryType } = props
  
  const [headerText, setHeaderText] = useState<string>('');
  const [headCell, setHeadCell] = useState<HeadCell[]>([]);

  const [hstryRows, setHstryRows] = useState<vhclHstryRow[]|bsnesHstryRow[]|cardHstryRow[]>([]);
  const [totalHstryRows, setTotalHstryRows] = useState<number>(0);
  const [hstryPageable, setHstryPageable] = useState<Pageable2>({ pageNumber:1, pageSize:10, totalPages:1 });
  const [hstryLoading, setHstryLoading] = useState<boolean>(false);

  useEffect(() => {

    if (open) {

      let tempHeaderCell:HeadCell[] = [];

      if (hstryType === 'vhcl') {
        tempHeaderCell = vhclHeadCells.slice();
        setHeaderText('차량 이력조회');
      } else if (hstryType === 'bsnes') {
        tempHeaderCell = bsnesHeadCells.slice();
        setHeaderText('사업자 이력조회');
      } else if (hstryType === 'card') {
        tempHeaderCell = cardHeadCells.slice();
        setHeaderText('카드 이력조회');
      } else {
        alert('이력 구분이 잘못되었습니다.');
        setOpen(false)
      }

      tempHeaderCell.unshift(
        {
          id: 'hstrySn',
          numeric: false,
          disablePadding: false,
          label: '이력순번',
          format: 'number'
        },
        {
          id: 'chgRsnNm',
          numeric: false,
          disablePadding: false,
          label: '변경사유',
        },
      );

      setHeadCell(tempHeaderCell);
      getHstryData(1, 10);
    }
  }, [open]);

  // 이력 목록 가져오기
  const getHstryData = async (page:number, pageSize:number) => {
    
    try {

      setHstryLoading(true);

      const searchObj = {
        ...hstryModalData
        , page:page
        , size:pageSize
      }

      let endpoint = '';

      if (hstryType === 'vhcl') {
        endpoint = '/fsm/mng/tvcm/cm/getAllVhcleHistoryMng' + toQueryParameter(searchObj)
      } else if (hstryType === 'bsnes') {
        endpoint = '/fsm/mng/tvcm/cm/getAllBsnesHistoryMng' + toQueryParameter(searchObj)
      } else {
        endpoint = '/fsm/mng/tvcm/cm/getAllCardHistoryMng' + toQueryParameter(searchObj)
      }
      
      const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

      if (response && response.resultType === 'success' && response.data.content.length != 0) {        
        setHstryRows(response.data.content)
        setTotalHstryRows(response.data.totalElements)
        setHstryPageable({
          pageNumber: response.data.pageable.pageNumber + 1,
          pageSize: response.data.pageable.pageSize,
          totalPages: response.data.totalPages,
        })
      }
    } catch (error) {
      console.log(error);
    } finally {
      setHstryLoading(false);
    }
  };

  // 페이징 이벤트
  const handlePaginationModelChange = useCallback((page:number, pageSize:number) => {
    getHstryData(page, pageSize);
  }, []);

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'lg'} open={open}>
        <DialogContent>

          {/* 모달헤더 시작 */}
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2>{headerText}</h2>
            </CustomFormLabel>

            <div className='button-right-align'>
              <Button variant='contained' color='dark' onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          <Box>
            <TableDataGrid
              headCells={headCell}
              rows={hstryRows}
              totalRows={totalHstryRows}
              loading={hstryLoading}
              pageable={hstryPageable}
              onPaginationModelChange={handlePaginationModelChange}
              caption={headerText}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default HstryModal