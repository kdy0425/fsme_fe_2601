'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { ReactNode, useEffect, useState } from 'react';
import { CustomFormLabel, CustomRadio, CustomTextField, FormControlLabel, Grid, RadioGroup } from '@/utils/fsms/fsm/mui-imports';
import { SelectItem } from 'select';
import { openReport } from '@/utils/fsms/common/comm';
interface FormDialogProps {
    buttonLabel: string;
    title: string;
    size?: DialogProps['maxWidth'];
    crfName?: string;
    crfData?: string;
    selectedRow: any
}
import {
    CtpvSelect,
    LocgovSelect,
    CommSelect,
  } from '@/app/components/tx/commSelect/CommSelect'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

const FormDialog: React.FC<FormDialogProps> = ({ buttonLabel, title, size, selectedRow }) => {
    const [open, setOpen] = useState(false);
    const [radio, setRadio] = useState<string>()
    const [crdcoCd, setCrdcoCd] = useState<string>()
    const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 로딩상태

    useEffect(() => {
        setRadio("S")
    },[])

    const handleClickOpen = () => {
        setRadio("S")
        setOpen(true);
    };

    const handleClose = () => {
        setRadio("S")
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

    
 // Fetch를 통해 데이터 갱신
  const fetchOutputData = async () => {
    
    if(selectedRow == undefined){
      alert('출력할 대상이 없습니다.')
      return;
    }

    if(crdcoCd == 'ITS'){
        alert('카드사를 선택해주세요.')
        return
    }

    setLoadingBackdrop(true)
    try {
      // 검색 조건에 맞는 endpoint 생성
      const url = radio === 'S' ? `/fsm/cal/sr/tr/getAllSbsidyRqestReport?`: `/fsm/cal/sr/tr/getEachSbsidyRqestReport?`

      let endpoint: string =
        url +
        `${crdcoCd ? '&crdcoCd=' + crdcoCd : ''}` +
        `${selectedRow.clclnYm ? '&clclnYm=' + selectedRow.clclnYm : ''}` +
        `${selectedRow.locgovCd ? '&locgovCd=' + selectedRow.locgovCd : ''}`

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        const row : any = response.data.content
        if(response.data.content[0] == undefined){
            alert('출력할 보조금 청구내역 데이터가 없습니다.')
        }else{
            // const jsonData = { eachSbsidyTr: row }
            
            // handleReport(
            // radio === 'S' ? 'allSbsidyTr' : 'eachSbsidyTr',
            // JSON.stringify(jsonData),
            // )
            
            const jsonData = { eachSbsidyTr: row }
            var crfName;
            var crfData;
            if (Array.isArray(row) && row.length === 1) {
                crfName = radio === 'S' ? 'allSbsidyTr' : 'eachSbsidyTr';
                crfData = JSON.stringify(jsonData);
            }else{
                crfName = radio === 'S' ? 'allCardSbsidyTr' : 'allEachSbsidyTr';
                crfData = JSON.stringify(jsonData)
            }
            handleReport(crfName, crfData)
        }
      } else {
        // 데이터가 없거나 실패
        alert('출력할 대상이 없습니다..')
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
  
    } finally {
        setLoadingBackdrop(false)
    }
  }

    // 클립리포트 호출출
    const handleReport = (crfName?: string, crfData?: string) => {
        openReport(crfName, crfData)
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
                    <Button 
                    //onClick={() => handleReport(crfName, crfData)} 
                    onClick={fetchOutputData}
                    variant="contained" form="form-modal" color="primary">
                    다음
                    </Button>
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
                    <LoadingBackdrop open={loadingBackdrop} />
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td rowSpan={2}>청구서 선택</td>
                                <td>
                                    <div className="form-group" style={{ width: 'inherit' }}>
                                        {/* <select
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
                                        </select> */}
                                        <CustomFormLabel className="input-label-none" htmlFor="sch-crdcoCd">카드사목록</CustomFormLabel>
                                        <CommSelect                
                                        cdGroupNm='023'                    // 필수 O, 가져올 코드 그룹명    
                                        pValue={crdcoCd||''}             // 필수 O, 화면 조회조건의 상태관리 변수를 기재해주시면 됩니다
                                        handleChange={handleSelect}   // 필수 O, 화면 내부 공통으로 사용중인 조회조건 함수를 기재해주시면 됩니다
                                        pName='crdcoCd'                     // 필수 O, 공통코드같은 경우는 필히 name값을 기재해주셔야합니다
                                        /* width */                         // 필수 X, default 100% ** 특정 width 값이 필요하신 경우 기재해주시면 됩니다
                                        htmlFor={'sch-crdcoCd'}             // 필수 X, 조회조건으로 사용시 focus를 위해 htmlFor의 값을 기재해주시면 됩니다
                                        addText='전체'                  // 필수 X, 조회조건 제일 최상단에 배치할 값
                                        />
                                    </div>
                                </td>
                            </tr>
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
                                                        control={<CustomRadio id="sum" name="sum" value="S" />} 
                                                        label="합산 청구 서식"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControlLabel 
                                                        value="fuel" 
                                                        control={<CustomRadio id="koi" name="koi" value="K"/>} 
                                                        label="유종별 청구 서식" 
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