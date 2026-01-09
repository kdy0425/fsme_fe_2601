'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { ReactNode, useState } from 'react';
import { CustomFormLabel, CustomRadio, CustomTextField, FormControlLabel, Grid, RadioGroup } from '@/utils/fsms/fsm/mui-imports';
import { Row } from '../page';
import { formatDate } from '@/utils/fsms/common/convert'
import { getExcelFile, getToday } from '@/utils/fsms/common/comm';
interface FormDialogProps {
    buttonLabel: string;
    title: string;
    size?: DialogProps['maxWidth'];
    parentClclnYm: string | undefined;
    parentLocgovCd: string | number;
    clclnYm: string | undefined;
    locgovCd: string | number;
}


const FormDialog: React.FC<FormDialogProps> = ({ buttonLabel, title, size, parentClclnYm, parentLocgovCd, clclnYm, locgovCd }) => {
    const [open, setOpen] = useState(false);
    const [radio, setRadio] = useState<string>()

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRadio = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target
        setRadio(value);
        
    }

    const excelDownload = async () => {
        let type = radio;

        let endpoint: string = '';

        if (type === "month") {
        endpoint = `/fsm/cal/csr/tr/getExcelCtprvnSbsidy?` +
            `${parentClclnYm ? '&clclnYm=' + parentClclnYm : ''}` +
            `${parentLocgovCd ? '&locgovCd=' + parentLocgovCd : ''}`;
        } else if (type === "card") {
        endpoint = `/fsm/cal/csr/tr/getExcelCtprvnSbsidyCard?` + 
            `${clclnYm ? '&clclnYm=' + clclnYm : ''}` + 
            `${locgovCd ? '&locgovCd=' + locgovCd : ''}`;
        }

        await  getExcelFile(endpoint, '시도별보조금청구내역_' + getToday() + '.xlsx');
    }

return (
<>
    <Button variant="contained" color="success" onClick={handleClickOpen}>
        {buttonLabel}
    </Button>
    <Dialog fullWidth={false} maxWidth={size} open={open} onClose={handleClose}>
        <DialogContent>
            <Box className="table-bottom-button-group">
                <h2>{title}</h2>
                <div className="button-right-align">
                    <Button onClick={() => excelDownload()} variant="contained" form="form-modal" color="primary">
                    저장
                    </Button>
                    <Button onClick={handleClose} variant="contained" color='dark'>취소</Button>
                </div>
            </Box>
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    m: 'auto', 
                    width: 'full' 
                }}
            >
                <div className="table-scrollable">
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td>데이터 선택</td>
                                <td>
                                <div className="form-group" style={{ width: "inherit" }}>
                                    <RadioGroup
                                        name="type"
                                        onChange={handleRadio}
                                        value={radio}
                                        className="mui-custom-radio-group"
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControlLabel 
                                                    value="month" 
                                                    control={<CustomRadio />} 
                                                    label="월 총계현황"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControlLabel 
                                                    value="card" 
                                                    control={<CustomRadio />} 
                                                    label="월 카드사 총계현황" 
                                                />
                                            </Grid>
                                        </Grid>
                                    </RadioGroup>
                                </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Box>
        </DialogContent>
    </Dialog>
</>
);
};

export default FormDialog;