import React, { ReactNode, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
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
import { Row } from '../page';
import { SelectItem } from 'select';
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode';
import UserAuthContext from '@/app/components/context/UserAuthContext';
import { sendHttpFileRequest, sendHttpRequest, sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils';


// 신규 등록 모달창의 경우 당장에 받아야할 것들이 없음.
interface ModalFormProps {
  buttonLabel: string;
  title: string;
  size?: DialogProps['maxWidth'] | 'lg';
  reloadFunc: () => void;
  // data?: Row;
  // handleOpen?: () => any
  // handleClose?: () => any
}

const RegisterModalForm = (props: ModalFormProps) => {
  const {reloadFunc} = props;

  const [leadCnCode, setNotiCode] = useState<SelectItem[]>([])  //        공지구분 코드 
  const [relateTaskSeCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드 


  const [content, setContent] = useState<string>(''); // 게시글 내용 상태
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // 첨부된 파일 상태


  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setParams({
      bbsSn: "1", // 게시판일련번호
      relateTaskSeCd: "00", // 관련업무구분코드
      leadCnCd: "00", // 머릿글내용코드 = 머릿글 공지구분코드
      ttl: "", // 게시글제목
      cn: "", // 게시글내용
      popupNtcYn: "N", // 팝업공지여부
      popupBgngYmd: "", // 팝업시작일자
      popupEndYmd: "", // 팝업종료일자
      useYn: "", // 사용여부
      ltrTrsmYn: "", // 문자전송여부
      ltrCn: "", // 문자내용
      ltrTtl: "", // 문자제목
      files: [], // 첨부파일
    })
    setUploadedFiles([])


    setOpen(false);
  };



  const [params, setParams] = useState<Row>({
    bbsSn: "4", // 게시판일련번호
    relateTaskSeCd: "00", // 관련업무구분코드
    leadCnCd: "00", // 머릿글내용코드 = 머릿글 공지구분코드
    ttl: "", // 게시글제목
    cn: "", // 게시글내용
    popupNtcYn: "N", // 팝업공지여부
    popupBgngYmd: "", // 팝업시작일자
    popupEndYmd: "", // 팝업종료일자
    useYn: "", // 사용여부
    ltrTrsmYn: "", // 문자전송여부
    ltrCn: "", // 문자내용
    ltrTtl: "", // 문자제목
    files: [], // 첨부파일
  });

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
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

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정


  const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    if('popupNtcYn' === name){
      setParams((prev) => ({ ...prev, ['popupEndYmd']: '',['popupBgngYmd']: '' }));
    }


    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  
      if (validFiles.length + uploadedFiles.length > MAX_FILES) {
        alert(`첨부파일은 최대 ${MAX_FILES}개까지만 등록 가능합니다.`);
        return;
      }
  
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };


  const handleSaveNotice =  async (event: React.FormEvent) =>{
    event.preventDefault();
    event.stopPropagation();
    createNotice();
  }



  const createNotice = async () => {
    try {
      // 필수 값 확인
      if (!params.ttl) {
        alert('게시글 제목을 입력해야 합니다.');
        return;
      }
      if (!params.cn) {
        alert('게시글 내용을 입력해야 합니다.');
        return;
      }
      if (!params.popupNtcYn) {
        alert('팝업 공지 여부를 선택해야 합니다.');
        return;
      }
      if (!params.leadCnCd) {
        alert('구분을 선택해야 합니다.');
        return;
      }
      if (!params.relateTaskSeCd) {
        alert('관련 업무 구분 코드를 선택해야 합니다.');
        return;
      }

  
      // 사용자 확인
      const userConfirm = confirm('QnA 데이터를 등록하시겠습니까?');
      if (!userConfirm) {
        return;
      }

      const endpoint = '/fsm/sup/qna/createBoardDtl/';

      // FormData 생성
      const jsonData = {
        //bbsSn: '4', // 게시판일련번호
        relateTaskSeCd: params.relateTaskSeCd, // 관련업무구분코드
        leadCnCd: params.leadCnCd, // 머릿글내용코드 = 머릿글 공지구분코드
        ttl: params.ttl, // 게시글 제목
        cn: params.cn, // 게시글 내용
        popupNtcYn: params.popupNtcYn, // 팝업공지여부
        popupBgngYmd: params.popupBgngYmd ? params.popupBgngYmd.replace(/-/g, '')  : '', // 팝업 시작일자
        popupEndYmd: params.popupEndYmd ?  params.popupEndYmd.replace(/-/g, '')  : '',  // 팝업 종료일자
        useYn: params.useYn, // 사용여부
        ltrTrsmYn: params.ltrTrsmYn, // 문자전송여부
        ltrCn: params.ltrCn, // 문자내용
        ltrTtl: params.ltrTtl, // 문자제목
      };

      // 서버 요청
      const response = await sendMultipartFormDataRequest(
        'POST',
        endpoint,
        jsonData,
        uploadedFiles, // 첨부파일 배열
        true // JWT 사용 여부
      );



      // 응답 처리
      if (response?.resultType === 'success') {
        alert('QnA 데이터가 등록되었습니다.');
        handleClose();
        reloadFunc?.();
        
        console.log('Success Response:', response);
      } else {
        console.error('Response Error:', response);
        alert(`QnA 데이터 등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`);
        handleClose();
        reloadFunc?.();
      }
    } catch (error) {
       // error를 Error로 캐스팅
      //const errorMessage = (error as Error).message || '알 수 없는 오류가 발생했습니다.';
      alert(`Error : QnA 데이터 등록에 실패했습니다. `)
      handleClose();

    }
  };


  return (


    <React.Fragment>
    <Button variant="contained" onClick={handleClickOpen}>
      {props.buttonLabel}
    </Button>
    <Dialog
      fullWidth={false}
      maxWidth={props.size}
      open={open}
      onClose={handleClose}
    >
      <DialogContent>
      <Box className='table-bottom-button-group'>
        <CustomFormLabel className="input-label-display">
          <h2>{props.title}</h2>
        </CustomFormLabel>
        <div className=" button-right-align">
          <Button variant="contained" type='submit' form='form-modal' color="primary">저장</Button>
          <Button variant="contained" color="dark" onClick={handleClose}>취소</Button>
        </div>
      </Box>
        <Box
          id='form-modal'
          component='form'
          onSubmit={(e) => handleSaveNotice(e)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            m: 'auto',
            width: 'full',
          }}
        >
          <Box sx={{ maxWidth:'fullWidth' ,
            margin: '0 auto', // 중앙 정렬

          }}>
          <TableContainer style={{ margin: '16px 0 4em 0' }}>
            <Table  style={{ tableLayout: 'fixed', width: '100%' }}>
              <TableBody>
                <TableRow>
                  <TableCell style={{ width: '150px', verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>구분
                  </TableCell>
                  <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                    <CustomSelect
                      id="modal-select-comCdYn"
                      name="leadCnCd"
                      value={params.leadCnCd}
                      onChange={handleParamChange}
                      variant="outlined"
                      fullWidth
                    >
                      {leadCnCode.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </CustomSelect>
                  </TableCell>
                  <TableCell style={{ width: '150px',verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>업무구분
                  </TableCell>
                  <TableCell style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}>
                    <CustomSelect
                      id="modal-select-relateTaskSeCd"
                      name="relateTaskSeCd"
                      value={params.relateTaskSeCd}
                      onChange={handleParamChange}
                      variant="outlined"
                      fullWidth
                    >
                      {relateTaskSeCode.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </CustomSelect>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ width: '150px', verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>제목
                  </TableCell>
                  <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                    <CustomTextField
                      type="text"
                      id="modal-ttl"
                      name="ttl"
                      onChange={handleParamChange}
                      value={params.ttl}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ width: '150px', verticalAlign: 'middle' }}>
                  <span className="required-text" >*</span>내용
                  </TableCell>
                  <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                    <CustomFormLabel className="input-label-none" htmlFor="modal-cn">내용</CustomFormLabel>
                    <textarea className="MuiTextArea-custom"
                      // type="text"
                      id="modal-cn"
                      name="cn"
                      onChange={handleParamChange}
                      value={params.cn}
                      // fullWidth
                      // multiline
                      rows={20} // 
                      />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>첨부파일</TableCell>
                  <TableCell colSpan={3}>
                    <CustomFormLabel className="input-label-none" htmlFor="files">첨부파일</CustomFormLabel>
                    <input id="files"
                      type="file"
                      name="files"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'block' }}
                    />
                    {uploadedFiles.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {uploadedFiles.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '4px',
                              border: '1px solid #ddd',
                              marginBottom: '4px',
                              borderRadius: '4px',
                            }}
                          >
                            <span>{file.name}</span>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleFileRemove(index)}
                            >
                              삭제
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default RegisterModalForm;