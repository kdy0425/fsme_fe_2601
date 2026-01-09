'use client'
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
} from '@mui/material'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import React, { ReactNode, useState, useEffect, useContext } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { CustomFile, Row } from '../page'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import ModifyModalContent, { ModalFormProps } from './ModifyModalContent'
import {
  CtpvSelect,
  LocgovSelect,
  CommSelect,
} from '@/app/components/tx/commSelect/CommSelect'
import UserAuthContext, {
  UserAuthInfo,
} from '@/app/components/context/UserAuthContext'
import { getUserInfo } from '@/utils/fsms/utils'

interface ModifyDialogProps {
  title: string
  // children: React.ReactElement<ModalFormProps>; // ModalFormProps 타입의 ReactElement
  size?: DialogProps['maxWidth'] | 'lg'
  open: boolean
  selectedRow: Row
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
  const [rjctModalFlag, setRjctModalFlag] = useState(false)
  const [completeFlag, setCompleteFlag] = useState(false);

  const { authInfo } = useContext(UserAuthContext)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // 관리자여부
  const [isMinistry, setIsMinistry] = useState<boolean | null>(null) // 국토부 담당자여부
  const [isWriter, setIsWriter] = useState<boolean>(false) // 작성자 여부

  useEffect(() => {
    // authInfo에서 roles의 첫 번째 값이 "Admin"인지 확인
    if ('roles' in authInfo && Array.isArray(authInfo.roles)) {
      setIsAdmin(authInfo.roles.includes('ADMIN'))
      setIsMinistry(authInfo.roles.includes('MOLIT'))
    }
    if (formData.rgtrId === userInfo.lgnId) {
      setIsWriter(true)
    }
  }, [authInfo])

  // 회원정보
  const userInfo = getUserInfo()

  // 상태정보 (R요청, E완료, P진행, D반려)
  const prcsSttsCd = formData.prcsSttsCd

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
  const handleFormDataChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    console.log(formData.rjctRsn)
  }

  //반려사유 저장용
  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    // if (!isEditMode) return;
    const { name, value } = event.target
    handleFormDataChange(name, value)
  }

  const handleFileChange = (files: File[]) => {
    setNewFiles(files) // 자식으로부터 받은 파일들 업데이트
  }

  // 반려모달 닫기
  const closeRjctModal = () => {
    setRjctModalFlag(false)
    setFormData((prev) => ({ ...prev, ['rjctRsn']: ''}));
  }

  const closeCompleteModal = () =>{
    setCompleteFlag(false);
    setFormData((prev) => ({ ...prev, ['rjctRsn']: ''}));
  }

  // 반려모달 닫기
  const openRjctModal = () => {
    setRjctModalFlag(true)
  }

  // 완료모달 닫기
  const openCompleteModal = () => {
    setCompleteFlag(true)
  }

  // 데이터 삭제
  const deleteCode = async () => {
    if (selectedRow === undefined) {
      return
    }
    let endpoint: string = `/fsm/sup/rr/deleteRtroactReq?`
    // `${formData.rtroactDmndTsid ? 'rtroactDmndTsid=' + formData.rtroactDmndTsid : ''}`;

    // JSON 데이터
    const data = {
      rtroactDmndTsid: formData.rtroactDmndTsid, //소급요청식별번호
    }

    const userConfirm = confirm('소급요청 데이터를 삭제하시겠습니까?')
    if (userConfirm) {
      const response = await sendHttpRequest('DELETE', endpoint, data, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert('삭제되었습니다')
        reloadFunc?.()
        handleClose()
      } else {
        alert(response.message)
      }
    }
  }

  // 파일 다운로드 핸들러
  const fetchFilesDown = async (files: CustomFile) => {
    if (files == undefined) {
      return
    }
    try {
      let endpoint: string =
        `/fsm/sup/rr/getDownloadRtroactFile?` +
        `${files.atchSn ? 'atchSn=' + files.atchSn : ''}` +
        `${files.rfrncGroupSn ? '&rfrncGroupSn=' + files.rfrncGroupSn : ''}` +
        `${files.physFileNm ? '&physFileNm=' + files.physFileNm : ''}` +
        `${files.lgcFileNm ? '&lgcFileNm=' + files.lgcFileNm : ''}` +
        `${files.rfrncId ? '&rfrncId=' + files.rfrncId : ''}`

      const response = await sendHttpFileRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', files.lgcFileNm as string)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    }
  }

  // 첨부 파일 삭제
  const fetchFilesDelete = async (files: CustomFile): Promise<boolean> => {
    if (files == undefined) {
      return false
    }
    try {
      let endpoint: string = `/fsm/sup/rr/deleteRtroactFile?`

      const data = {
        atchSn: files.atchSn,
        physFileNm: files.physFileNm,
        rfrncId: files.rfrncId,
      }

      const response = await sendHttpRequest('DELETE', endpoint, data, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        // alert("첨부파일이 삭제되었습니다.");
        console.log('File Delete Success')
        return true
      } else {
        console.log('File Delete Fail')
        return false
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      return false
    }
  }

  // 수정 내용 저장 핸들러
  const handleSave = async () => {
    try {
      // 필수 값 체크
      if (
        !formData.rtroactDmndNm ||
        !formData.taskSeCd ||
        !formData.rtroactDmndSeCd ||
        !formData.rtroactDmndSeCd
      ) {
        alert('필수 항목을 모두 입력해야 합니다.')
        return
      }

      if (formData.rtroactDmndNm.length >= 50) {
        alert('제목은 50자 이하로 입력해주시기 바랍니다.')
        return
      }

      const userConfirm = confirm('수정된 내용을 저장하시겠습니까?')
      if (!userConfirm) return

      const endpoint = `/fsm/sup/rr/updateRtroactReq`

      // JSON 데이터
      const data = {
        rtroactDmndTsid: formData.rtroactDmndTsid, //소급요청식별번호
        rtroactDmndNm: formData.rtroactDmndNm, // 소급요청명
        taskSeCd: formData.taskSeCd, // 업무구분코드
        rtroactDmndSeCd: formData.rtroactDmndSeCd, // 소급요청구분코드
        locgovCd: formData.locgovCd, // 지자체코드
        rtroactDmndCn: formData.rtroactDmndCn, // 소급요청내용
      }

      // 추가되는 파일만 전달
      const response = await sendMultipartFormDataRequest(
        'PUT',
        endpoint,
        data,
        newFiles, // 추가 파일
        true, // JWT 사용 여부
      )

      console.log(response)

      if (response?.resultType === 'success') {
        alert('소급요청 데이터가 수정되었습니다.')
        reloadFunc?.()
        handleClose()
      } else {
        console.error('Response fail:', response)
        alert(
          `소급요청 데이터 수정 응답이 성공이 아닙니다. (${response?.message || 'Unknown Error'})`,
        )
        reloadFunc?.()
        handleClose()
      }
    } catch (error) {
      console.error('Error during update:', error)
      alert(`Error : 소급요청 데이터 수정에 실패했습니다. `)
      handleClose()
    }
  }

  // 소급요청 접수
  const updateRect = async () => {
    if (selectedRow === undefined) {
      return
    }
    let endpoint: string = `/fsm/sup/rr/updateRtroactReqRcpt`

    const jsonData = {
      rtroactDmndTsid: formData.rtroactDmndTsid,
    }

    const userConfirm = confirm('해당 소급요청건을 접수하시겠습니까?')
    if (userConfirm) {
      const response = await sendHttpRequest('PUT', endpoint, jsonData, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert('접수되었습니다')
        reloadFunc?.()
        handleClose()
      } else {
        alert(response.message)
      }
    }
  }

  // 소급요청 완료
  const updateComplete = async () => {
    if (selectedRow === undefined) {
      return
    }
    let endpoint: string = `/fsm/sup/rr/updateRtroactReqComplete`

    const jsonData = {
      rtroactDmndTsid: formData.rtroactDmndTsid,
      rjctRsn: formData.rjctRsn,
    }

    const userConfirm = confirm('해당 소급요청건을 완료하시겠습니까?')
    if (userConfirm) {
      const response = await sendHttpRequest('PUT', endpoint, jsonData, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert('완료되었습니다')
        reloadFunc?.()
        handleClose()
      } else {
        alert(response.message)
      }
    }
  }

  // 소급요청 반려
  const updateRjct = async () => {
    if (selectedRow === undefined) {
      return
    }
    let endpoint: string = `/fsm/sup/rr/updateRtroactReqRjct`

    const jsonData = {
      rtroactDmndTsid: formData.rtroactDmndTsid,
      rjctRsn: formData.rjctRsn,
    }

    const userConfirm = confirm('해당 소급요청건을 반려하시겠습니까?')
    if (userConfirm) {
      const response = await sendHttpRequest('PUT', endpoint, jsonData, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        alert('반려되었습니다')
        reloadFunc?.()
        handleClose()
      } else {
        alert(response.message)
      }
    }
  }

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
              {prcsSttsCd !== 'E' && prcsSttsCd !== 'D' ? (
                !isEditMode ? (
                  isAdmin ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={
                          prcsSttsCd === 'R' ? updateRect : openCompleteModal //updateComplete
                        }
                        color="primary"
                      >
                        {prcsSttsCd === 'R' ? '접수' : '완료'}
                      </Button>
                      {/* <Button variant="contained" onClick={updateComplete} color="primary">
                            완료
                        </Button> */}
                      <Button
                        variant="contained"
                        onClick={openRjctModal}
                        color="primary"
                      >
                        반려
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleEditToggle}
                        color="primary"
                      >
                        수정
                      </Button>
                      <Button
                        variant="contained"
                        onClick={deleteCode}
                        color="error"
                      >
                        삭제
                      </Button>
                    </>
                  ) : // isMinistry || isWriter ?
                  prcsSttsCd === 'R' && isWriter ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={handleEditToggle}
                        color="primary"
                      >
                        수정
                      </Button>
                      <Button
                        variant="contained"
                        onClick={deleteCode}
                        color="error"
                      >
                        삭제
                      </Button>
                    </>
                  ) : (
                    <></>
                  )
                ) : (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      color="primary"
                    >
                      저장
                    </Button>
                  </>
                )
              ) : null}
              <Button variant="contained" color="dark" onClick={handleClose}>
                취소
              </Button>
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
            <ModifyModalContent
              isEditMode={isEditMode}
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onFileChange={handleFileChange}
              onFileDown={fetchFilesDown}
              onFileDelete={fetchFilesDelete} // 삭제 함수 추가 가능
            />

            {/* 반려 모달 */}
            <div>
              {rjctModalFlag && (
                <Dialog
                  fullWidth={false}
                  // maxWidth={"lg"}
                  open={rjctModalFlag}
                  onClose={closeRjctModal}
                >
                  <DialogContent>
                    <Box className="table-bottom-button-group">
                      <CustomFormLabel className="input-label-display">
                        <h2>소급반려 사유등록</h2>
                      </CustomFormLabel>
                      <div className="button-right-align">
                        <Button
                          variant="contained"
                          onClick={updateRjct}
                          color="primary"
                        >
                          소급반려
                        </Button>
                        <Button onClick={closeRjctModal}>취소</Button>
                      </div>
                    </Box>
                    <Box
                      id="form-modal"
                      component="form"
                      onSubmit={(e) => {
                        e.preventDefault()
                      }}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        m: 'auto',
                        width: 'auto',
                      }}
                    >
                      <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                        <TableContainer style={{ margin: '16px 0 0 0' }}>
                          <Table
                            className="table table-bordered"
                            aria-labelledby="tableTitle"
                            style={{ tableLayout: 'fixed', width: '100%' }}
                          >
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  className="td-head"
                                  style={{
                                    width: '120px',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <span className="required-text">*</span>
                                  소급반려사유
                                </TableCell>
                                <TableCell>
                                  <CustomFormLabel
                                    className="input-label-none"
                                    htmlFor="modal-rjctRsn"
                                  >
                                    소급반려사유
                                  </CustomFormLabel>
                                  <textarea
                                    className="MuiTextArea-custom"
                                    // type="text"
                                    id="modal-rjctRsn"
                                    name="rjctRsn"
                                    onChange={handleParamChange}
                                    value={formData.rjctRsn}
                                    // fullWidth
                                    // multiline
                                    rows={3} //
                                  />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div>
              {completeFlag && (
                <Dialog
                  fullWidth={false}
                  // maxWidth={"lg"}
                  open={completeFlag}
                  onClose={closeCompleteModal}
                >
                  <DialogContent>
                    <Box className="table-bottom-button-group">
                      <CustomFormLabel className="input-label-display">
                        <h2>소급완료 사유등록</h2>
                      </CustomFormLabel>
                      <div className="button-right-align">
                        <Button
                          variant="contained"
                          onClick={updateComplete}
                          color="primary"
                        >
                          소급완료
                        </Button>
                        <Button onClick={closeCompleteModal}>취소</Button>
                      </div>
                    </Box>
                    <Box
                      id="form-modal"
                      component="form"
                      onSubmit={(e) => {
                        e.preventDefault()
                      }}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        m: 'auto',
                        width: 'auto',
                      }}
                    >
                      <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
                        <TableContainer style={{ margin: '16px 0 0 0' }}>
                          <Table
                            className="table table-bordered"
                            aria-labelledby="tableTitle"
                            style={{ tableLayout: 'fixed', width: '100%' }}
                          >
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  className="td-head"
                                  style={{
                                    width: '120px',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <span className="required-text">*</span>
                                  소급완료사유
                                </TableCell>
                                <TableCell>
                                  <CustomFormLabel
                                    className="input-label-none"
                                    htmlFor="modal-rjctRsn"
                                  >
                                    소급완료사유
                                  </CustomFormLabel>
                                  <textarea
                                    className="MuiTextArea-custom"
                                    // type="text"
                                    id="modal-rjctRsn"
                                    name="rjctRsn"
                                    onChange={handleParamChange}
                                    value={formData.rjctRsn}
                                    // fullWidth
                                    // multiline
                                    rows={3} //
                                  />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}
