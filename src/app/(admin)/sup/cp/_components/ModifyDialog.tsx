'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { ReactNode, useState } from 'react';
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import { CustomFile, Row } from '../page';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';
import ModifyModalContent, { ModalFormProps } from './ModifyModalContent';

interface ModifyDialogProps {
    title: string;
    // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRow: Row;
    reloadFunc: () => void;
    handleDetailCloseModal: () => void;
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
        size, open,selectedRow, handleDetailCloseModal,reloadFunc } = props;
    const [isEditMode, setIsEditMode] = useState<boolean>(false); // 수정 모드 상태 관리
    const [formData, setFormData] = useState<Row>(selectedRow); // 수정될 데이터를 관리하는 상태
    const [newFiles, setNewFiles] = useState<File[]>([]); // 신규 파일 상태



    // 다이얼로그 닫기 핸들러
    const handleClose = () => {
        handleDetailCloseModal();
        setIsEditMode(false); // 닫을 때 수정 모드 초기화
        setNewFiles([]); // 다이얼로그 닫을 때 파일 초기화
    };

    // 수정 모드 토글
    const handleEditToggle = () => {
        setIsEditMode(!isEditMode); // 수정 모드 토글
    };
    // 데이터 변경 핸들러
    const handleFormDataChange = (name: string, value: string) => {
        if('popupNtcYn' === name){
            setFormData((prev) => ({ ...prev, ['popupEndYmd']: '',['popupBgngYmd']: '' }));
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleFileChange = (files: File[]) => {
        setNewFiles(files); // 자식으로부터 받은 파일들 업데이트
    };

    // 데이터 삭제 
    const deleteCode = async () => {
        if(selectedRow === undefined){
            return 
        }
        let endpoint: string = `/fsm/sup/notice/deleteBoardDtl?`+
        //`${formData.bbsSn ? 'bbsSn=' + formData.bbsSn : ''}`  +
        `${formData.bbscttSn ? 'bbscttSn=' + formData.bbscttSn : ''}` ;

        const userConfirm = confirm("공지사항을 삭제하시겠습니까?");
        if(userConfirm) {
            const response = await sendHttpRequest('DELETE', endpoint, null, true, {
                cache: 'no-store',
            })
            if (response && response.resultType === 'success') {
            alert('삭제되었습니다');
            reloadFunc?.();
            handleClose();
            }else {
            alert(response.message);
            }
        }
    }

    // 파일 다운로드 핸들러
    const fetchFilesDown = async (files : CustomFile) => {
        if(files == undefined){
            return 
        }
        try {
            let endpoint: string =
            `/fsm/sup/notice/file/`+files.bbscttSn+`/` +files.atchSn

            const response = await sendHttpFileRequest('GET', endpoint, null, true, {
            cache: 'no-store',
            })
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', files.lgcFileNm as string);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            // 에러시
            console.error('Error fetching data:', error)
        }
    }


    // 파일 다운로드 핸들러
    const fetchFilesDelete = async (files : CustomFile) :Promise<boolean> => {
        if(files == undefined){
            return  false;
        }
        try {
            let endpoint: string =
            `/fsm/sup/notice/file/deleteBoardFile?` +
            `${files.atchSn ? '&atchSn=' + files.atchSn : ''}` +
            `${files.bbscttSn ? '&bbscttSn=' + files.bbscttSn : ''}` 

            const response = await sendHttpRequest('DELETE', endpoint, null, true, {
                cache: 'no-store',
            })

            if (response && response.resultType === 'success') {
                console.log('File Delete Success')
                return true
            }else{
                console.log('File Delete Fail')
                return false
            }

        } catch (error) {
            // 에러시
            console.error('Error fetching data:', error)
            return false;
        }
    }

    // 수정 내용 저장 핸들러
    const handleSave = async () => {
        try {
            // 필수 값 체크
            if (!formData.leadCnCd || !formData.relateTaskSeCd || !formData.oriTtl || !formData.cn) {
                alert("필수 항목을 모두 입력해야 합니다.");
                return;
            }
    
            const userConfirm = confirm("수정된 내용을 저장하시겠습니까?");
            if (!userConfirm) return;
    
            const endpoint = `/fsm/sup/notice/updateBoardDtl`;
    
            // JSON 데이터
            const data = {
                bbsSn: formData.bbsSn,
                bbscttSn: formData.bbscttSn,
                leadCnCd: formData.leadCnCd,
                relateTaskSeCd: formData.relateTaskSeCd,
                ttl: formData.oriTtl,
                cn: formData.cn,
                popupNtcYn: formData.popupNtcYn,
                popupBgngYmd: formData.popupBgngYmd ? formData.popupBgngYmd.replace(/-/g, '')  : '',
                popupEndYmd: formData.popupEndYmd ?  formData.popupEndYmd.replace(/-/g, '')  : '',
                useYn: formData.useYn,
                ltrTrsmYn: formData.ltrTrsmYn,
                ltrCn: formData.ltrCn,
                ltrTtl: formData.ltrTtl,
            };
    
            // 추가되는 파일만 전달
            const response = await sendMultipartFormDataRequest(
                "PUT",
                endpoint,
                data,
                newFiles, // 추가 파일
                true // JWT 사용 여부
            );

            console.log(response)
    
            if (response?.resultType === "success") {
                alert("공지사항이 수정되었습니다.");
                // reloadFunc?.();
                handleEditToggle();
            } else {
                console.error("Response fail:", response);
                alert(`공지사항 수정 응답이 성공이 아닙니다. (${response?.message || "Unknown Error"})`);
                reloadFunc?.();
                handleClose();
            }
        } catch (error) {
            console.error("Error during update:", error);
            alert(`Error : 공지사항 수정에 실패했습니다. `);
            handleClose();
        }
    };


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
                <h2>{title}{isEditMode ? '수정' : null}</h2>
                </CustomFormLabel>
                <div className="button-right-align">
                {!isEditMode ? (
                    <>
                    <Button
                        variant="contained"
                        onClick={handleEditToggle}
                        color="primary"
                    >
                        수정
                    </Button>
                    </>
                ) : (
                    <>
                    <Button variant="contained" onClick={deleteCode} color="error">
                        삭제
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        color="primary"
                    >
                        저장
                    </Button>
                    </>
                )}
                <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
                </div>
            </Box>
            <Box
                id='form-modal'
                component='form'
                onSubmit={(e) => {
                e.preventDefault();
                setIsEditMode(false);
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
                <ModifyModalContent
                    isEditMode={isEditMode}
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onFileChange={handleFileChange}
                    onFileDown={fetchFilesDown}
                    onFileDelete={fetchFilesDelete} // 삭제 함수 추가 가능
                />
            </Box>
            </DialogContent>
        </Dialog>
        </React.Fragment>
    );
}