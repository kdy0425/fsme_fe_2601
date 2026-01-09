'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { ReactNode, useState } from 'react';
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { Row } from '../page';
import { formatDate } from '@/utils/fsms/common/convert'
interface FormDialogProps {
    buttonLabel: string;
    title: string;
    children: React.ReactNode;
    excelDownloadDetail: (selectedRow:Row)=>void;
    seletedRow: Row;
    size?: DialogProps['maxWidth'];
    onOpen?: () => void; // onOpen 프롭 추가
}


const FormDialog: React.FC<FormDialogProps> = ({ buttonLabel, title, children, excelDownloadDetail, seletedRow, size, onOpen }) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        if (onOpen) onOpen(); // 열기 전에 onOpen 호출
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const getAprvYmd = (dateString: string) => {
        return formatDate(dateString);
    }

    const getAprvTm = (dateString: string) => {
        return `${dateString.slice(0, 2)}:${dateString.slice(2, 4)}:${dateString.slice(4, 6)}`;
    }

return (
<>
    <Button variant="outlined" onClick={handleClickOpen}>
        {buttonLabel}
    </Button>
    <Dialog fullWidth={false} maxWidth={size} open={open} onClose={handleClose}>
        <DialogContent>
            <Box className="table-bottom-button-group">
                <h2>{title}</h2>
                <div className="button-right-align">
                    <Button onClick={() => excelDownloadDetail(seletedRow)} variant="contained" type="submit" form="form-modal" color="primary">
                    액셀
                    </Button>
                    <Button onClick={handleClose} variant="contained" color='dark'>취소</Button>
                </div>
            </Box>
            <div className="filter-form">
                <div className="form-group">
                    <CustomFormLabel
                        className="input-label-display"
                        htmlFor="ft-aprv-ymd"
                    >
                        승인일자
                    </CustomFormLabel>
                    <CustomTextField  name="aprvYmd"
                    value={seletedRow ? getAprvYmd(seletedRow.aprvYmd ?? '') : ''
                    }
                    type="text" id="ft-aprv-ymd" fullWidth disabled />
                </div>
                <div className="form-group">
                    <CustomFormLabel
                        className="input-label-display"
                        htmlFor="ft-aprv-tm"
                    >
                        승인시간
                    </CustomFormLabel>
                    <CustomTextField  name="aprvTm"
                    value={seletedRow ? getAprvTm(seletedRow.aprvTm ?? '') : ''
                    }
                    type="text" id="ft-aprv-tm" fullWidth disabled />
                </div>
                <div className="form-group">
                    <CustomFormLabel
                        className="input-label-display"
                        htmlFor="ft-card-number"

                    >
                    결제카드번호
                </CustomFormLabel>
                <CustomTextField  name="cardNo"
                    value={ seletedRow ? seletedRow.cardNo : ''
                    }
                    type="text" id="ft-card-number" fullWidth disabled />
                </div>
            </div>
            <Box id="form-modal" component="form" sx={{ display: 'flex', flexDirection: 'column', m: 'auto', width: 'full' }}>
                {children}
            </Box>
        </DialogContent>
    </Dialog>
</>
);
};

export default FormDialog;