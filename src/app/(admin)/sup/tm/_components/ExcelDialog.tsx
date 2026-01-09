'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { ReactNode, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendSingleMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
// import ModifyModalContent, { ModalFormProps } from './ModifyModalContent';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'

interface ExcelDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  // selectedRow: Row;
  reloadFunc: () => void
  handleDetailCloseModal: () => void
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

export default function ExcelDialog(props: ExcelDialogProps) {
  const {
    title,
    //children
    size,
    open,
    handleDetailCloseModal,
    reloadFunc,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 수정 모드 상태 관리
  const [formData, setFormData] = useState<Row>() // 수정될 데이터를 관리하는 상태
  const [newFile, setNewFile] = useState<File>() // 신규 파일 상태

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    handleDetailCloseModal()
    // setIsEditMode(false); // 닫을 때 수정 모드 초기화
    // setNewFile(null); // 다이얼로그 닫을 때 파일 초기화
  }

  // 데이터 변경 핸들러
  const handleFormDataChange = (name: string, value: string) => {
    // setFormData((prev) => ({ ...prev, [name]: value }));
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      // Validate file size (10MB) and count (3 files maximum)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
      const MAX_FILES = 3
      const validFiles = fileArray.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`${file.name} 파일이 10MB를 초과하여 업로드할 수 없습니다.`)
          return false
        }
        setNewFile(file)
        return true
      })
      // const updatedFiles = [...newFiles, ...validFiles];
      // setNewFile(validFiles);
      // onFileChange(updatedFiles); // 부모로 파일 전달
    }
  }

  // 파일 다운로드 핸들러
  const fetchFilesDown = async () => {
    try {
      let endpoint: string = `/fsm/sup/tm/cm/getExcelFormmTxrvamtMng`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '세입액관리_엑셀업로드.xlsx')
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  // 파일 업로드 핸들러
  const fetchFilesUpload = async (): Promise<boolean> => {
    if (newFile == undefined) {
      alert('첨부된 파일이 없습니다.')
      return false
    }
    try {
      // 사용자 확인
      const userConfirm = confirm('업로드 하시겠습니까?');
      if (!userConfirm) {
          return false
      }
      
      let endpoint: string = `/fsm/sup/tm/cm/insertExcelTxrvamtMng`

      const file = newFile

      // 추가되는 파일만 전달
      const response = await sendSingleMultipartFormDataRequest(
        'POST',
        endpoint,
        {},
        file, // 추가 파일
        true, // JWT 사용 여부
      )


      if (response && response.resultType === 'success') {
        alert('엑셀 파일 등록이 완료 되었습니다. ')
        reloadFunc?.()
        handleClose()
        return true
      } else {
        alert('엑셀 파일 등록에 오류가 발생하였습니다. ')
        console.log('File upload Fail')
        return false
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      return false
    }
  }

  // 수정 내용 저장 핸들러
  // const handleSave = async () => {
  //     try {
  //         // 필수 값 체크
  //         if (!formData.leadCnCd || !formData.relateTaskSeCd || !formData.oriTtl || !formData.cn) {
  //             alert("필수 항목을 모두 입력해야 합니다.");
  //             return;
  //         }

  //         const userConfirm = confirm("수정된 내용을 저장하시겠습니까?");
  //         if (!userConfirm) return;

  //         const endpoint = `/fsm/sup/brd/dtl/updateBoardDtl`;

  //         // JSON 데이터
  //         const data = {
  //             bbsSn: formData.bbsSn,
  //             bbscttSn: formData.bbscttSn,
  //             leadCnCd: formData.leadCnCd,
  //             relateTaskSeCd: formData.relateTaskSeCd,
  //             ttl: formData.oriTtl,
  //             cn: formData.cn,
  //             popupNtcYn: formData.popupNtcYn,
  //             popupBgngYmd: formData.popupBgngYmd ? formData.popupBgngYmd.replace(/-/g, '')  : '',
  //             popupEndYmd: formData.popupEndYmd ?  formData.popupEndYmd.replace(/-/g, '')  : '',
  //             useYn: formData.useYn,
  //             ltrTrsmYn: formData.ltrTrsmYn,
  //             ltrCn: formData.ltrCn,
  //             ltrTtl: formData.ltrTtl,
  //         };

  //         // 추가되는 파일만 전달
  //         const response = await sendMultipartFormDataRequest(
  //             "PUT",
  //             endpoint,
  //             data,
  //             newFiles, // 추가 파일
  //             true // JWT 사용 여부
  //         );

  //         console.log(response)

  //         if (response?.resultType === "success") {
  //             alert("QnA 데이터가 수정되었습니다.");
  //             reloadFunc?.();
  //             handleClose();
  //         } else {
  //             console.error("Response fail:", response);
  //             alert(`QnA 데이터 수정 응답이 성공이 아닙니다. (${response?.message || "Unknown Error"})`);
  //             reloadFunc?.();
  //             handleClose();
  //         }
  //     } catch (error) {
  //         console.error("Error during update:", error);
  //         alert(`Error : QnA 데이터 수정에 실패했습니다. `);
  //         handleClose();
  //     }
  // };

  return (
    <React.Fragment>
      <Dialog
        fullWidth={false}
        maxWidth={size}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>
                {title}
                {isEditMode ? '수정' : null}
              </h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <>
                <Button
                  variant="contained"
                  onClick={fetchFilesUpload}
                  color="success"
                >
                  엑셀업로드
                </Button>
                <Button
                  variant="contained"
                  onClick={fetchFilesDown}
                  color="success"
                >
                  양식다운로드
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDetailCloseModal}
                  color="dark"
                >
                  취소
                </Button>
              </>
            </div>
          </Box>
          <Box
            id="form-modal"
            component="form"
            onSubmit={(e) => {
              e.preventDefault()
              setIsEditMode(false)
              alert('Form Submitted') // 실제 제출 로직 추가
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
              <Table
                className="table table-bordered"
                style={{ tableLayout: 'fixed', width: '100%' }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '120px', verticalAlign: 'middle' }}
                    >
                      엑셀업로드
                    </TableCell>
                    <TableCell style={{ textAlign: 'left' }}>
                      <input
                        type="file"
                        name="fileList"
                        onChange={handleFileChange}
                        style={{ display: 'block' }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
