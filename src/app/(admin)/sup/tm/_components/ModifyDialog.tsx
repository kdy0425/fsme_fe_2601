'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { ReactNode, useState, useEffect } from 'react'
import { Row } from '../page'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'

// 시도코드, 관할관청 조회
import {
  CtpvSelect,
  LocgovSelect,
} from '@/app/components/tx/commSelect/CommSelect'

interface ModifyDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  selectedRow: Row
  reloadFunc: () => void
  handleDetailCloseModal: () => void
}

// 세입정보
export interface prpdvsInfo {
  crtrYm: string // 기준년도
  anlrveAmtNo: string //세입번호
  ctpvCd: string //
  locgovCd: string //지자체코드
  anlrveAmt: string // 세입액
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
  const {
    title,
    //children
    size,
    open,
    selectedRow,
    handleDetailCloseModal,
    reloadFunc,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false) // 수정 모드 상태 관리
  const [formData, setFormData] = useState<Row>(selectedRow) // 수정될 데이터를 관리하는 상태
  const [newFiles, setNewFiles] = useState<File[]>([]) // 신규 파일 상태

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    handleDetailCloseModal()
    setIsEditMode(false) // 닫을 때 수정 모드 초기화
    setNewFiles([]) // 다이얼로그 닫을 때 파일 초기화
  }

  // 수정 모드 토글
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode) // 수정 모드 토글
  }
  // 데이터 변경 핸들러
  const handleFormDataChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (files: File[]) => {
    setNewFiles(files) // 자식으로부터 받은 파일들 업데이트
  }

  // 수정 내용 저장 핸들러
  const handleSave = async () => {
    try {
      // 필수 값 확인
      if (!formData.locgovCd) {
        alert('지자체 정보를 선택해야 합니다.')
        return
      }
      if (!formData.anlrveAmt) {
        alert('세입액을 입력해야 합니다.')
        return
      }

      // 사용자 확인
      const userConfirm = confirm('세입정보를 수정하시겠습니까?')
      if (!userConfirm) {
        return
      }

      const endpoint = '/fsm/sup/tm/cm/updateTxrvamtMng'

      // FormData 생성
      const jsonData = {
        crtrYm: formData.crtrYm, //
        anlrveAmtNo: formData.anlrveAmtNo, //
        locgovCd: formData.locgovCd, //
        anlrveAmt: formData.anlrveAmt, //
      }

      // 추가되는 파일만 전달
      const response = await sendHttpRequest(
        'PUT',
        endpoint,
        jsonData,
        true, // JWT 사용 여부
      )

      console.log(response)
      reloadFunc?.()
      handleClose()

      if (response?.resultType === 'success') {
        alert('세입정보가 수정되었습니다.')
        // reloadFunc?.();
        handleEditToggle()
      } else {
        console.error('Response fail:', response)
        alert(
          `세입정보 수정 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
        reloadFunc?.()
        handleClose()
      }
    } catch (error) {
      console.error('Error during update:', error)
      alert(`Error : 세입정보 수정에 실패했습니다. `)
      handleClose()
    }
  }

  useEffect(() => {
    // console.log(formData)
  }, [formData])

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
                      <span className="required-text">*</span>기준년월
                    </TableCell>
                    <TableCell style={{ textAlign: 'left' }}>
                      <CustomTextField
                        type="number"
                        id="modal-crtrYm"
                        name="crtrYm"
                        // onChange={handleFormDataChange}
                        value={Number(formData.crtrYm)}
                        disabled={true}
                        placeholder="숫자만 입력 가능합니다."
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '120px', verticalAlign: 'middle' }}
                    >
                      <span className="required-text">*</span>시도
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
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    >
                      <span className="required-text">*</span>지자체
                    </TableCell>
                    <TableCell
                      style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}
                    >
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
                    <TableCell
                      className="td-head"
                      style={{ width: '120px', verticalAlign: 'middle' }}
                    >
                      <span className="required-text">*</span>세입액(원)
                    </TableCell>
                    <TableCell style={{ textAlign: 'left' }}>
                      <CustomTextField
                        type="number"
                        id="modal-amt"
                        name="anlrveAmt"
                        onChange={handleFormDataChange}
                        value={formData.anlrveAmt}
                        placeholder="숫자만 입력 가능합니다."
                        fullWidth
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
