'use client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React, { ReactNode, useState } from 'react';
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';
import ModifyModalContent from './DetailModalContent';

interface ModifyDialogProps {
    title: string;
    // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
    size?: DialogProps['maxWidth'] | 'lg';
    open: boolean;
    selectedRow: Row;
    handleDetailCloseModal: () => void;
}


export interface CustomFile {
    atchSn?: string;  //첨부일련번호
    bbscttSn?: string; //게시글일련번호
    fileSize?: string; //파일용량
    lgcFileNm?: string; //논리파일명
    mdfcnDt?: string; //수정일시
    mdfrId?: string; //수정자아이디
    physFileNm?: string; // 물리파일명
    regDt?: string; // 등록일시
    rgtrId?: string;  // 등록자아이디
}  
export interface Row {
    bbsSn?: string; // 게시판일련번호
    bbscttSn?: string; // 게시글일련번호
    relateTaskSeCd?: string; // 관련업무구분코드
    leadCnCd?: string; // 머릿글내용코드    // 공지사항 코드임.
    inclLocgovCd?: string; // 포함지자체코드
    locgovNm?: string; // 포함지자체명
    userNm?: string; // 작성자명
    userInfo?: string; // 지자체명_작성자명
    oriTtl?: string; // 게시글제목
    ttl?: string; // 분류_게시글제목
    cn?: string; // 게시글내용
    popupNtcYn?: string; // 팝업공지여부
    popupBgngYmd?: string; // 팝업시작일자
    popupEndYmd?: string; // 팝업종료일자
    oriInqCnt?: number; // 실제조회수
    fileCount?: string;
    inqCnt?: number; // 조회수
    useYn?: string; // 사용여부
    ltrTrsmYn?: string; // 문자전송여부
    ltrCn?: string; // 문자내용
    ltrTtl?: string; // 문자제목
    msgSendOrder?: string; // 문자전송요청여부
    rgtrId?: string; // 등록자아이디
    regDt?: string; // 등록일시
    mdfrId?: string; // 수정자아이디
    mdfcnDt?: string; // 수정일시\
    //신규 등록시 
    fileList? : [CustomFile] | [] // 첨부파일 
    files?: [File] | [];
}





export default function ModifyDialog(props: ModifyDialogProps) {
    const { title, 
        //children
        size, open,selectedRow, handleDetailCloseModal } = props;
    const [isEditMode, setIsEditMode] = useState<boolean>(false); // 수정 모드 상태 관리
    const [formData, setFormData] = useState<Row>(selectedRow); // 수정될 데이터를 관리하는 상태
    const [newFiles, setNewFiles] = useState<File[]>([]); // 신규 파일 상태



    // 다이얼로그 닫기 핸들러
    const handleClose = () => {
        handleDetailCloseModal();
        setIsEditMode(false); // 닫을 때 수정 모드 초기화
        setNewFiles([]); // 다이얼로그 닫을 때 파일 초기화
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


    // // 파일 다운로드 핸들러
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
                <Button onClick={handleClose} variant="contained" color="dark" >취소</Button>
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
                    formData={formData}
                    //파일 수정 및 요소 변경 요소들 관련 주석처리
                    //onFormDataChange={handleFormDataChange}
                    //onFileChange={handleFileChange}
                     onFileDown={fetchFilesDown}
                    //onFileDelete={fetchFilesDelete} // 삭제 함수 추가 가능
                />
            </Box>
            </DialogContent>
        </Dialog>
        </React.Fragment>
    );
}