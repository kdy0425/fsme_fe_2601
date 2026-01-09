import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { Row } from './BsPage'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
  sendSingleMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import { getCommCd } from '@/utils/fsms/common/comm'

interface ModalFormProps {
  data?: Row
  buttonLabel: string
  title?: string
  reloadFunc?: () => void
}

const BsnesSignModifyModal = (props: ModalFormProps) => {
  const { data, buttonLabel, title, reloadFunc } = props

  const [open, setOpen] = useState(false)
  // const {authInfo} = useContext(UserAuthContext);
  const [params, setParams] = useState<Row>({
    file: '',
    brno: '',
    fileSn: '',
  })

  // 수정 팝업일때 해당 row 내 데이터를 params에 바인딩
  useEffect(() => {
    if (data) {
      setParams(data)
    }
    if (data?.fileSn) {
      fetchFile()
    }
  }, [open])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setParams({
      file: '',
      brno: '',
      fileSn: '',
    })
    setUploadedFiles([])
    setOpen(false)
  }

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // 첨부된 파일 상태

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)

      // Validate file size (10MB), count (1 file maximum), and type (image only)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
      const MAX_FILES = 1

      const validFiles = fileArray.filter((file) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
          alert(
            `${file.name} 파일은 이미지 형식이 아니어서 업로드할 수 없습니다.`,
          )
          return false
        }
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

  // 파일 다운로드 핸들러
  const fetchFile = async () => {
    if (!data?.fileSn) return

    try {
      const endpoint = `/fsm/stn/bm/bs/getOneBsnesSign?fileSn=${data.fileSn}`
      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      const fileName = data?.bzentyNm || '직인파일'
      const file = new File([response], fileName, { type: response.type })

      setUploadedFiles([file])
    } catch (error) {
      console.error('파일 조회 중 에러:', error)
    }
  }

  const BsnesSignModifyModal = async () => {
    if (!data?.brno) return
    try {
      let endpoint: string = `/fsm/stn/bm/bs/updateBsnesSign`
      const userConfirm = confirm('버스 직인정보를 변경하시겠습니까?')
      if (userConfirm) {
        if (data.origFileNm != null && data.origFileNm !== '') {
          if (!confirm('저장된 이미지가 있습니다. 새로 등록 하시겠습니까?')) {
            return
          }
        }

        const fileToSend =
          uploadedFiles.length > 0 ? uploadedFiles[0] : undefined

        const response = await sendSingleMultipartFormDataRequest(
          'PUT',
          endpoint,
          {
            brno: data.brno,
          },
          fileToSend, // 이 부분에서 undefined
          true,
        )

        if (response && response.resultType === 'success') {
          alert(response.message)
          reloadFunc?.()
          setOpen(false)
        } else {
          alert(response.message)
        }
      } else {
        return
      }
    } catch (error) {
      console.log('Error modifying data:', error)
    } finally {
      setParams({
        file: '',
        brno: '',
        fileSn: '',
      })
      setUploadedFiles([])
    }
  }

  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <Box>
      <Button variant="contained" color="dark" onClick={handleClickOpen}>
        {buttonLabel}
      </Button>
      <Dialog
        fullWidth={false}
        maxWidth={'md'}
        open={open}
        //onClose={handleClose}
        PaperProps={{
          style: {
            width: '700px',
          },
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>{title}</h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => BsnesSignModifyModal()}
              >
                저장
              </Button>
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>

          {/* 모달팝업 내용 시작 */}
          <div id="alert-dialog-description1">
            {/* 테이블영역 시작 */}
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>직인 정보</caption>
                <colgroup>
                  <col style={{ width: '30%' }}></col>
                  <col style={{ width: '70%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    <th className="td-head" scope="row">
                      직인
                    </th>
                    <td colSpan={2}>
                      <Box
                        component="label"
                        htmlFor="file-upload"
                        sx={{
                          display: 'inline-block',
                          padding: '6px 13px',
                          backgroundColor: 'rgb(43, 47, 54)',
                          color: '#fff',
                          border: '1px solidrgb(42, 53, 71)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        직인첨부
                      </Box>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
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
                              {/* 미리보기 섹션 */}
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  marginRight: '10px',
                                }}
                              />
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
                      <Typography sx={{ mt: 1 }}>
                        ※ 직인은 1개만 등록 가능 합니다.
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BsnesSignModifyModal
