'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { ReactNode, useState, useEffect } from 'react';
import { Row } from '../page';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';
import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';

// 시도코드, 관할관청 조회
import {
    CtpvSelect,
    LocgovSelect,
  } from '@/app/components/tx/commSelect/CommSelect'

interface ModifyDialogProps {
    title: string;
    // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    editMode: boolean;
    selectedRow: Row;
    reloadFunc: () => void;
    handleDetailCloseModal: () => void;
}

// 예산정보
export interface prpdvsInfo {
    crtrYear : string // 기준년도
    bgtFrmtNo : string // 순번
    ctpvCd: string //
    locgovCd: string //지자체코드
    // rtSeqNo : string // 차수
    bgtFrmtAmt : string // 예산액
    // bgtRt : string // 예산비율
  }


// selectedRow(Row)안에  fileList : File[]로 가짐
// export interface File {
//     atchSn?: string;  //첨부일련번호
//     bbscttSn?: string; //게시글일련번호
//     fileSize?: string; //파일용량
//     lgcFileNm?: string; //논리파일명
//     mdfcnDt?: string; //수정일시
//     mdfrId?: string; //수정자아이디
//     physFileNm?: string; // 물리파일명
//     regDt?: string; // 등록일시
//     rgtrId?: string;  // 등록자아이디
// }


export default function ModifyDialog(props: ModifyDialogProps) {
    const { title, 
        //children
        size, open, editMode, selectedRow, handleDetailCloseModal,reloadFunc } = props;
    const [isEditMode, setIsEditMode] = useState<boolean>(editMode); // 수정 모드 상태 관리
    const [formData, setFormData] = useState<Row>(selectedRow); // 수정될 데이터를 관리하는 상태
    const [fristBgtFrmtAmt, setFristBgtFrmtAmt] = useState<number>(0); // 수정될 데이터를 관리하는 상태
    const [calcPrep, setCalcPrep] = useState<number>(0); // 수정될 데이터를 관리하는 상태
    

    // 다이얼로그 닫기 핸들러
    const handleClose = () => {
        handleDetailCloseModal();
        setIsEditMode(false); // 닫을 때 수정 모드 초기화
    };

    // 수정 모드 토글
    const handleEditToggle = () => {
        setIsEditMode(!isEditMode); // 수정 모드 토글
    };
    // 데이터 변경 핸들러
    const handleFormDataChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 수정 내용 저장 핸들러
    const handleSave = async () => {
        try {
            // 필수 값 확인
            // if (!formData.crtrYear) {
            //     alert('기준년도를 입력해야 합니다.');
            //     return;
            // }
            // if (!formData.locgovCd) {
            //     alert('지자체 정보를 선택해야 합니다.');
            //     return;
            // }
            if (!formData.bgtFrmtAmt) {
                alert('예산액을 입력해야 합니다.');
                return;
            }

        
            // 사용자 확인
            let userConfirm = true;
            let endpoint = '';
            if(isEditMode){
                userConfirm = confirm('예산변경시 예산액이 변경되며, 예산변경내역에 등록됩니다. 예산정보를 변경하시겠습니까?');
                endpoint = '/fsm/sup/bm/cm/changeBudgetMng';
            }else{      
                userConfirm = confirm('예산정보를 수정하시겠습니까?');
                endpoint = '/fsm/sup/bm/cm/updateBudgetMng';          
            }
            if (!userConfirm) {
                return;
            }

            

            // FormData 생성
            const jsonData = {
                crtrYear: formData.crtrYear, // 
                locgovCd: formData.locgovCd, // 
                bgtFrmtAmt: formData.bgtFrmtAmt, // 
                bgtFrmtNo: formData.bgtFrmtNo,
            };
    
            // 추가되는 파일만 전달
            const response = await sendHttpRequest(
                "PUT",
                endpoint,
                jsonData,
                true // JWT 사용 여부
            );

            reloadFunc?.();
            handleClose();
    
            if (response?.resultType === "success") {
                if(isEditMode){
                    alert("예산정보가 변경되었습니다.");
                }else{
                    alert("예산정보가 수정되었습니다.");
                }
                
                // reloadFunc?.();
                handleEditToggle();
            } else {
                console.error("Response fail:", response);
                alert(`예산정보 수정 응답이 성공이 아닙니다. (${response?.message || "Unknown Error"})`);
                reloadFunc?.();
                handleClose();
            }
        } catch (error) {
            console.error("Error during update:", error);
            alert(`Error : 예산정보 수정에 실패했습니다. `);
            handleClose();
        }
    };

    useEffect(() => {
        if(formData.bgtFrmtAmt){
            setFristBgtFrmtAmt(Number(formData.bgtFrmtAmt));
        }
        setCalcPrep(0);
        
    }, [fristBgtFrmtAmt]);

    useEffect(() => {
        // console.log(formData)

        let calcPrepTmep = 0;
        if(formData.bgtFrmtAmt){
            calcPrepTmep =  Number(formData.bgtFrmtAmt) - fristBgtFrmtAmt;
        }
        setCalcPrep(calcPrepTmep);
    }, [formData]);


    return (
        <React.Fragment>
        <Dialog
            fullWidth={false}
            maxWidth={size}
            open={open}
            onClose={handleClose}
        >
            <DialogContent>
            <Box className='table-bottom-button-group'>
                <CustomFormLabel className="input-label-display">
                <h2>{title}</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                    <>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        color="primary"
                    >
                        저장
                    </Button>
                    </>
                <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
                </div>
            </Box>
            <Box
                id='form-modal'
                component='form'
                onSubmit={(e) => {
                e.preventDefault();
                // setIsEditMode(false);
                alert('Form Submitted'); // 실제 제출 로직 추가
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: 'full',
                }}
            >
                {/* 수정 모드 전달 */}
                <TableContainer style={{ margin: '16px 0 4em 0' }}>
                    <Table  className="table table-bordered" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableBody>
                        <TableRow>
                        <TableCell className="td-head" style={{ width: '120px', verticalAlign: 'middle' }}>
                        <span className="required-text" >*</span>기준년도
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                            <CustomTextField
                                type="number"
                                id="modal-crtrYear"
                                name="crtrYear"
                                // onChange={handleFormDataChange}
                                value={Number(formData.crtrYear)}
                                disabled={true}
                                placeholder="숫자만 입력 가능합니다."
                                fullWidth
                            />
                        </TableCell>
                        </TableRow>
                        {/* <TableRow>
                        <TableCell className="td-head" style={{ width: '120px', verticalAlign: 'middle' }}>
                        <span className="required-text" >*</span>시도
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                            <CustomTextField
                                type="text"
                                id="modal-ctpvNm"
                                name="ctpvNm"
                                // onChange={handleParamChange}
                                value={formData.ctpvNm}
                                disabled={true}
                                fullWidth
                            />
                        </TableCell>
                        </TableRow> */}
                        <TableRow>
                        <TableCell className="td-head" style={{ width: '150px',verticalAlign: 'middle' }}>
                        <span className="required-text" >*</span>지자체
                        </TableCell>
                        <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                            <CustomTextField
                                type="text"
                                id="modal-locgovNm"
                                name="locgovNm"
                                // onChange={handleParamChange}
                                value={formData.locgovNm}
                                disabled={true}
                                fullWidth
                            />
                        </TableCell>
                        </TableRow>
                        <TableRow>
                        <TableCell className="td-head" style={{ width: '120px', verticalAlign: 'middle' }}>
                        <span className="required-text" >*</span>예산액(원)
                        </TableCell>
                        <TableCell style={{ textAlign: 'left' }}>
                            <CustomTextField
                                type="number"
                                id="modal-bgtFrmtAmt"
                                name="bgtFrmtAmt"
                                onChange={handleFormDataChange}
                                value={formData.bgtFrmtAmt}
                                placeholder="숫자만 입력 가능합니다."
                                fullWidth
                            />
                        </TableCell>
                        </TableRow>
                        {isEditMode ? 
                            <TableRow>
                            <TableCell className="td-head" style={{ width: '150px',verticalAlign: 'middle' }}>
                            <span className="required-text" >*</span>증감액
                            </TableCell>
                            <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                                <CustomTextField
                                    type="number"
                                    id="modal-bgtRt"
                                    name="bgtRt"
                                    onChange={handleFormDataChange}
                                    value={calcPrep}
                                    disabled={true}
                                    fullWidth
                                />
                            </TableCell>
                            </TableRow>
                        : ''}
                    
                    </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            </DialogContent>
        </Dialog>
        </React.Fragment>
    );
}