import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    MenuItem,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';
import { CustomFormLabel, CustomRadio, CustomSelect, CustomTextField } from '@/utils/fsms/fsm/mui-imports';
import { CustomFile, Row } from '../page';
import { SelectItem } from 'select';
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode';
import UserAuthContext from '@/app/components/context/UserAuthContext';
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils';
import { getDateTimeString } from '@/utils/fsms/common/util';
import { formatDate } from '@/utils/fsms/common/convert';
import { CtpvSelect, LocgovSelect, CommSelect } from '@/app/components/tx/commSelect/CommSelect';

export interface ModalFormProps {
    isEditMode: boolean;
    formData: Row;
    onFormDataChange: (name: string, value: string) => void;
    onFileChange: (files: File[]) => void;
    onFileDown: (file: CustomFile) => void;
    onFileDelete: (file: CustomFile) => Promise<boolean>
}

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
const ModifyModalContent: React.FC<ModalFormProps> = ({
    isEditMode,
    formData,
    onFormDataChange,
    onFileChange,
    onFileDown,
    onFileDelete
}) => {
    const [leadCnCode, setNotiCode] = useState<SelectItem[]>([]);
    const [relateTaskSeCode, setWorkCode] = useState<SelectItem[]>([]);
    const [existingFiles, setExistingFiles] = useState<CustomFile[]>(formData.fileList || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    // 상태정보 (R요청, E완료, P진행, D반려)
    const prcsSttsCd = formData.prcsSttsCd;

    useEffect(() => {
        const fetchCodes = async () => {
            const noti: SelectItem[] = [];
            const work: SelectItem[] = [];
            const notiRes = await getCodesByGroupNm('115');
            const workRes = await getCodesByGroupNm('117');
            notiRes?.forEach((code: any) => noti.push({ label: code['cdKornNm'], value: code['cdNm'] }));
            workRes?.forEach((code: any) => work.push({ label: code['cdKornNm'], value: code['cdNm'] }));
            setNotiCode(noti);
            setWorkCode(work);
        };
        fetchCodes();
    }, []);

    const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!isEditMode) return;
        const { name, value } = event.target;
        onFormDataChange(name, value);
    };
   // 신규 파일 삭제 핸들러
    const handleFileRemove = (index: number) => {
        const updatedFiles = newFiles.filter((_, i) => i !== index);
        setNewFiles(updatedFiles);
        onFileChange(updatedFiles); // 부모로 업데이트된 파일 목록 전달

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };
    const handleDeleteFile = async (file: CustomFile) => {
        const isDeleted = await onFileDelete(file); // 삭제 결과를 boolean으로 받음
        if (isDeleted) {
            setExistingFiles((prevFiles) =>
                prevFiles.filter((existingFile) => existingFile.atchSn !== file.atchSn)
            );
            alert('파일이 성공적으로 삭제되었습니다.');
        } else {
            alert('파일 삭제에 실패했습니다.');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isEditMode) return;
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files);
            // Validate file size (10MB) and count (3 files maximum)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            const MAX_FILES = 3;
            const validFiles = fileArray.filter((file) => {
                if (file.size > MAX_FILE_SIZE) {
                    alert(`${file.name} 파일이 10MB를 초과하여 업로드할 수 없습니다.`);
                    return false;
                }
                return true;
            });
            if (validFiles.length + newFiles.length > MAX_FILES) {
                alert(`첨부파일은 최대 ${MAX_FILES}개까지만 등록 가능합니다.`);
                return;
            }
            const updatedFiles = [...newFiles, ...validFiles];
            setNewFiles(updatedFiles);
            onFileChange(updatedFiles); // 부모로 파일 전달
        }
    };

    return (
        <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
            <TableContainer style={{ margin: '16px 0 4em 0' }}>
                <Table className="table table-bordered" aria-labelledby="tableTitle" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                            {isEditMode ? <span className="required-text" >*</span> : null}업무구분
                            </TableCell>
                            <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                                <CustomFormLabel className="input-label-none" htmlFor="taskSeCd">
                                    업무구분
                                </CustomFormLabel>
                                <CommSelect                
                                    cdGroupNm='801'
                                    pValue={formData.taskSeCd}
                                    handleChange={handleParamChange}
                                    pName='taskSeCd'
                                    pDisabled={!isEditMode}
                                    htmlFor={'taskSeCd'}
                                    // addText='전체'
                                />
                            </TableCell>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                            {isEditMode ? <span className="required-text" >*</span> : null}소급요청구분
                            </TableCell>
                            <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                                <CustomFormLabel className="input-label-none" htmlFor="rtroactDmndSeCd">
                                    소급요청구분명
                                </CustomFormLabel>
                                <CommSelect
                                    cdGroupNm='769'
                                    pValue={formData.rtroactDmndSeCd}
                                    handleChange={handleParamChange}
                                    pName='rtroactDmndSeCd'
                                    pDisabled={!isEditMode}
                                    htmlFor={'rtroactDmndSeCd'}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                등록일자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formatDate(formData.regYmd)}
                            </TableCell>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                처리상태
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.prcsSttsCdNm}
                            </TableCell>
                        </TableRow>
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                신청자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.rgtrId}({formData.rgtrNm})
                            </TableCell>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                지자체
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.locgovNm}
                            </TableCell>
                        </TableRow>
                        {prcsSttsCd === 'P' || prcsSttsCd === 'E' ? (
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                접수자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.clrId}({formData.clrNm})
                            </TableCell>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                접수일자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formatDate(formData.rcptPrcsDt)}
                            </TableCell>
                        </TableRow>) : null}
                        {prcsSttsCd === 'E' ? (
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                처리자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.prcrId}({formData.prcrNm})
                            </TableCell>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                완료일자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formatDate(formData.taskPrcsDt)}
                            </TableCell>
                        </TableRow>) : null}
                        {prcsSttsCd === 'D' ? (
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                반려자
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.rjctTrprId}({formData.rjctTrprNm})
                            </TableCell>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                반려일시
                            </TableCell>
                            <TableCell  style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formatDate(formData.rjctPrcsDt)}
                            </TableCell>
                        </TableRow>) : null}
                        {prcsSttsCd === 'D' ? (
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                반려사유
                            </TableCell>
                            <TableCell colSpan={3} style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.rjctRsn}
                            </TableCell>
                        </TableRow>) : null}
                        {prcsSttsCd === 'E' ? (
                        <TableRow style={ !isEditMode ? {display:'table-row'} : {display:'none'} }>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                                완료사유
                            </TableCell>
                            <TableCell colSpan={3} style={{ textAlign: 'left', paddingLeft:'20px' }}>
                                {formData.rjctRsn}
                            </TableCell>
                        </TableRow>) : null}
                        
                        <TableRow>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                            {isEditMode ? <span className="required-text" >*</span> : null}소급요청명
                            <CustomFormLabel className="input-label-none" htmlFor="modal-rtroactDmndNm">소급요청명</CustomFormLabel>
                            </TableCell>
                            
                            <TableCell colSpan={3} style={!isEditMode ? { textAlign: 'left', paddingLeft:'20px' } :
                                { textAlign: 'left' }}>
                            {!isEditMode ?
                                    formData.rtroactDmndNm :
                                    
                                <CustomTextField
                                    type="text"
                                    id="modal-rtroactDmndNm"
                                    name="rtroactDmndNm"
                                    onChange={handleParamChange}
                                    value={formData.rtroactDmndNm ?? ''}
                                    inputProps={{ maxLength: 50 }}
                                    disabled={!isEditMode}
                                    fullWidth
                                />
                            }
                            </TableCell>
                       
                        </TableRow>
                        <TableRow>
                            <TableCell className="td-head" style={{ width: '150px', verticalAlign: 'middle' }}>
                            {isEditMode ? <span className="required-text" >*</span> : null}소급요청내용
                            </TableCell>
                            <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                            <CustomFormLabel className="input-label-none" htmlFor="modal-rtroactDmndCn">내용</CustomFormLabel>
                            {!isEditMode ? (
                                 <div
                                 style={{
                                     whiteSpace: 'pre-line', // 줄바꿈 유지
                                     width: '100%', // CustomTextField와 동일한 폭
                                     minHeight: '400px', // CustomTextField와 동일한 높이
                                     border: '1px solid #ccc', // 일관된 테두리
                                     borderRadius: '4px', // CustomTextField와 같은 테두리
                                     padding: '8px', // CustomTextField와 같은 내부 여백
                                     boxSizing: 'border-box', // 패딩 포함
                                 }}
                             >
                                    {formData.rtroactDmndCn}
                                </div>
                            ) :
                                
								<textarea className="MuiTextArea-custom"
                                    // type="text"
                                    id="modal-rtroactDmndCn"
                                    name="rtroactDmndCn"
                                    onChange={handleParamChange}
                                    value={formData.rtroactDmndCn ?? ''}
                                    disabled={!isEditMode}
                                    // fullWidth
                                    // multiline
                                    rows={20} //  
                                    />
                            }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="td-head">첨부파일</TableCell>
                            <TableCell colSpan={3}>
                            <CustomFormLabel className="input-label-none" htmlFor="files">첨부파일</CustomFormLabel>
                                {isEditMode && (
                                    <input id="files"
                                        type="file"
                                        name="fileList"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{ display: 'block' }}
                                    />
                                )}
                                <Box sx={{ mt: 1 }}>
                                    {/* 기존 파일 */}
                                    {existingFiles.map((file, index) => (
                                        <Box key={`existing-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px', border: '1px solid #ddd', marginBottom: '4px', borderRadius: '4px' }}>
                                            <span>{file.lgcFileNm}</span>
                                            {isEditMode ? (
                                                <Button variant="contained" color="error" size="small" onClick={() => handleDeleteFile(file)}>
                                                    삭제
                                                </Button>
                                            ) : null} 
                                            {!isEditMode ? (
                                                <Button variant="contained" color="primary" size="small" onClick={() => onFileDown(file)}>
                                                    다운로드
                                                </Button>
                                            ) : null} 
                                        </Box>
                                    ))}
                                    {/* 신규 파일 */}
                                    {newFiles.map((file, index) => (
                                        <Box key={`new-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px', border: '1px solid #ddd', marginBottom: '4px', borderRadius: '4px' }}>
                                            <span>{file.name}</span>
                                            <Button variant="contained" color="error" size="small" onClick={() => handleFileRemove(index)}>
                                                삭제
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
export default ModifyModalContent;
