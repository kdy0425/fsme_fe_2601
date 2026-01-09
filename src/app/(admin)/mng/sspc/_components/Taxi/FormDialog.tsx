'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { useEffect, useState } from 'react';
import { HistoryRow, Row } from './page';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import TableDataGrid from '@/app/components/tables/CommDataGrid2';
import { mngSspcHstryGridHC } from '@/utils/fsms/headCells';

interface FormDialogProps {
    detail: Row;
    size?: DialogProps['maxWidth'];
    open: boolean
    handleClose: () => void
}


const FormDialog: React.FC<FormDialogProps> = ({ detail, size, open, handleClose }) => {

    const [historyRow, setHistoryRow] = useState<HistoryRow[]>([])

    useEffect(() => {
        fetchHistoryData(detail)
    }, [open])

    const fetchHistoryData = async (row: Row) => {
        try {
            let endpoint: string =
                `/fsm/mng/sspc/tr/getSbsidyStopChmngmtHstry?` +
                `${row.vhclNo ? '&vhclNo=' + row.vhclNo : ''}`
        
            const response = await sendHttpRequest('GET', endpoint, null, true, {
                cache: 'no-store',
            })
        
            if (response && response.resultType === 'success' && response.data) {
                setHistoryRow(response.data)
            } else {
                setHistoryRow([])
            }
        } catch (error) {
          setHistoryRow([])
        }
    }

return (
<>
    <Dialog fullWidth={false} maxWidth={size} open={open} onClose={handleClose}>
        <DialogContent>
            <Box className="table-bottom-button-group">
                <h2>보조금지급정지 변경이력</h2>
                <div className="button-right-align">
                    <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
                </div>
            </Box>
            <Box
                sx={{
                display: 'flex',
                flexDirection: 'column',
                m: 'auto',
                width: 'full',
                }}
            >
            <TableDataGrid
                headCells={mngSspcHstryGridHC}
                rows={historyRow}
                loading={false}
                paging={false}
            />
          </Box>
        </DialogContent>
    </Dialog>
</>
);
};

export default FormDialog;