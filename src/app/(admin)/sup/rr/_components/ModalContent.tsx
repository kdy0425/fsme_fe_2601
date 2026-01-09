import React, { ReactNode, useContext, useEffect, useState } from 'react'
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
} from '@mui/material'
import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { Row } from '../page'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'

// 로그인 유저 정보
import { getUserInfo } from '@/utils/fsms/utils'

// 신규 등록 모달창의 경우 당장에 받아야할 것들이 없음.
interface ModalFormProps {
  buttonLabel: string
  title: string
  size?: DialogProps['maxWidth'] | 'lg'
  reloadFunc: () => void
  // data?: Row;
  // handleOpen?: () => any
  // handleClose?: () => any
}

const RegisterModalForm = (props: ModalFormProps) => {
  const { reloadFunc } = props

  const [leadCnCode, setNotiCode] = useState<SelectItem[]>([]) //        공지구분 코드
  const [relateTaskSeCode, setWorkCode] = useState<SelectItem[]>([]) //         업무구분 코드

  const [content, setContent] = useState<string>('') // 게시글 내용 상태
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // 첨부된 파일 상태

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setParams({
      // bbsSn: "1", // 게시판일련번호
      rtroactDmndNm: '', // 소급요청명
      taskSeCd: '', // 업무구분코드
      rtroactDmndSeCd: '', // 소급요청구분코드
      locgovCd: '', // 지자체코드
      rtroactDmndCn: '', // 소급요청내용
      files: [], // 첨부파일
    })
    setUploadedFiles([])

    setOpen(false)
  }

  const [params, setParams] = useState<Row>({
    // bbsSn: "1", // 게시판일련번호
    rtroactDmndNm: '', // 소급요청명
    taskSeCd: '', // 업무구분코드
    rtroactDmndSeCd: '', // 소급요청구분코드
    locgovCd: '', // 지자체코드
    rtroactDmndCn: '', // 소급요청내용
    files: [], // 첨부파일
  })

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {}, [])

  const [flag, setFlag] = useState<boolean>(false) // 데이터 갱신을 위한 플래그 설정

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target

    if ('popupNtcYn' === name) {
      setParams((prev) => ({
        ...prev,
        ['popupEndYmd']: '',
        ['popupBgngYmd']: '',
      }))
    }

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setContent(event.target.value)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    setContent(event.target.value)
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
        return true
      })

      if (validFiles.length + uploadedFiles.length > MAX_FILES) {
        alert(`첨부파일은 최대 ${MAX_FILES}개까지만 등록 가능합니다.`)
        return
      }

      setUploadedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleFileRemove = (index: number) => {
    setContent('')
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSaveNotice = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()
    createNotice()
  }

  const userInfo = getUserInfo()

  const createNotice = async () => {
    try {
      // 필수 값 확인
      if (!params.rtroactDmndNm) {
        alert('소급요청명 제목을 입력해야 합니다.')
        return
      }
      if (params.rtroactDmndNm.length > 30) {
        alert('소급요청 제목을 30자 이내로 작성해주시기 바랍니다.')
        return
      }

      if (!params.rtroactDmndCn) {
        alert('게시글 내용을 입력해야 합니다.')
        return
      }
      if (!params.rtroactDmndSeCd) {
        alert('소급요청 구분을 선택해야 합니다.')
        return
      }
      if (!params.taskSeCd) {
        alert('업무구분 코드를 선택해야 합니다.')
        return
      }

      // 사용자 확인
      const userConfirm = confirm('소급요청 데이터를 등록하시겠습니까?')
      if (!userConfirm) {
        return
      }

      const endpoint = '/fsm/sup/rr/createRtroactReq'

      // FormData 생성
      const jsonData = {
        rtroactDmndNm: params.rtroactDmndNm, // 소급요청명
        taskSeCd: params.taskSeCd, // 업무구분코드
        rtroactDmndSeCd: params.rtroactDmndSeCd, // 소급요청구분코드
        locgovCd: userInfo.locgovCd, // 지자체코드
        rtroactDmndCn: params.rtroactDmndCn, // 소급요청내용
      }

      // 서버 요청
      const response = await sendMultipartFormDataRequest(
        'POST',
        endpoint,
        jsonData,
        uploadedFiles, // 첨부파일 배열
        true, // JWT 사용 여부
      )

      // 응답 처리
      if (response?.resultType === 'success') {
        alert('소급요청 데이터가 등록되었습니다.')
        setContent('')
        handleClose()
        reloadFunc?.()

        console.log('Success Response:', response)
      } else {
        console.error('Response Error:', response)
        alert(
          `소급요청 데이터 등록 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
        setContent('')
        handleClose()
        reloadFunc?.()
      }
    } catch (error) {
      // error를 Error로 캐스팅
      //const errorMessage = (error as Error).message || '알 수 없는 오류가 발생했습니다.';
      alert(`Error : 소급요청 데이터 등록에 실패했습니다. `)
      setContent('')
      handleClose()
    }
  }

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
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{props.title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                type="submit"
                form="form-modal"
                color="primary"
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box
            id="form-modal"
            component="form"
            onSubmit={(e) => handleSaveNotice(e)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <Box
              sx={{
                maxWidth: 'fullWidth',
                margin: '0 auto', // 중앙 정렬
              }}
            >
              <TableContainer style={{ margin: '16px 0 4em 0' }}>
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>업무구분
                      </TableCell>
                      <TableCell
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CommSelect
                          cdGroupNm="801"
                          pValue={params.taskSeCd}
                          handleChange={handleParamChange}
                          pName="taskSeCd"
                          htmlFor={'sch-taskSeCd'}
                          // addText='전체'
                        />
                      </TableCell>
                      <TableCell
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>소급요청구분
                      </TableCell>
                      <TableCell
                        style={{
                          width: 'calc(50% - 150px)',
                          textAlign: 'left',
                        }}
                      >
                        <CommSelect
                          cdGroupNm="769"
                          pValue={params.rtroactDmndSeCd}
                          handleChange={handleParamChange}
                          pName="rtroactDmndSeCd"
                          htmlFor={'sch-rtroactDmndSeCd'}
                          // addText='전체'
                          // width='200px'
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>소급요청명
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-rtroactDmndNm"
                        >
                          소급요청명
                        </CustomFormLabel>
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <CustomTextField
                          type="text"
                          id="modal-rtroactDmndNm"
                          name="rtroactDmndNm"
                          onChange={handleParamChange}
                          value={params.rtroactDmndNm}
                          inputProps={{ maxLength: 30 }}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ width: '150px', verticalAlign: 'middle' }}
                      >
                        <span className="required-text">*</span>소급요청내용
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="modal-rtroactDmndCn"
                        >
                          소급요청내용
                        </CustomFormLabel>
                      </TableCell>
                      <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                        <textarea
                          id="modal-rtroactDmndCn"
                          name="rtroactDmndCn"
                          onChange={handleParamChange}
                          value={params.rtroactDmndCn}
                          className="MuiTextArea-custom"
                          rows={20}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>첨부파일</TableCell>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="modal-files"
                      >
                        첨부파일
                      </CustomFormLabel>
                      <TableCell colSpan={3}>
                        <input
                          id="modal-files"
                          type="file"
                          name="files"
                          value={content}
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
  )
}

export default RegisterModalForm
