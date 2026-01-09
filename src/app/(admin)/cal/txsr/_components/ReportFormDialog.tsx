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
import { SelectItem } from 'select';
interface FormDialogProps {
    buttonLabel: string;
    title: string;
    size?: DialogProps['maxWidth'];
    //crdcoCdItems: SelectItem[];
}


const FormDialog: React.FC<FormDialogProps> = ({ buttonLabel, title, size }) => {
    const [open, setOpen] = useState(false);
    const [radio, setRadio] = useState<string>()
    const [crdcoCd, setCrdcoCd] = useState<string>()

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

    const handleSelect = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target
        setCrdcoCd(value);
    }

    const handleReport = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_DOMAIN}/ClipReport5/report.jsp?crfName=&crfData=`, "report", "width=900,height=700");
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
                    <Button variant="contained" color="secondary" onClick={handleReport}>출력</Button>
                    <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
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

{/*
                            <tr>
                                <td rowSpan={2}>청구서 선택</td>
                                <td>
                                    <div className="form-group" style={{ width: 'inherit' }}>
                                        <select
                                            id="ft-select-01"
                                            className="custom-default-select"
                                            name="crdcoCd"
                                            value={crdcoCd}
                                            onChange={handleSelect}
                                            style={{ width: '100%' }}
                                        >

                                            {crdcoCdItems.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}

                                        </select>
                                    </div>
                                </td>
                            </tr>
*/}

                            <tr>
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
                                                        value="total" 
                                                        control={<CustomRadio />} 
                                                        label="택시 유가보조금 청구서 출력"
                                                    />
                                                </Grid>
{/*
                                                <Grid item xs={12}>
                                                    <FormControlLabel 
                                                        value="fuel" 
                                                        control={<CustomRadio />} 
                                                        label="유종별 청구 서식" 
                                                    />
                                                </Grid>
*/}
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