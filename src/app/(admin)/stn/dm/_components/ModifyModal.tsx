import React, { useEffect, useState } from 'react'

import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { Row } from '../page'
import {
  sendHttpFileRequest,
  sendHttpRequest,
  sendMultipartFormDataRequest,
} from '@/utils/fsms/common/apiUtils'
import {
  rrNoFormatter,
} from '@/utils/fsms/common/util'
import {
  getDateFormatYMD,
  getFormatToday,
} from '@/utils/fsms/common/dateUtils'
import { formatDate } from '@/utils/fsms/common/convert'
import { DriverRow, DrModal } from '@/app/components/popup/DrModal'
import TrVhlModal from '@/app/components/popup/TrVhclModal'
import { isNumber, nowDate } from '@/utils/fsms/common/comm'
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox'
import { StatusType } from '@/types/message'

interface BsModifyModalProps {
  open: boolean
  handleClickClose: () => void
  row: Row | null
  type: 'I' | 'U'
  reload: () => void
}
type data = {
  vhclNo: string //차량번호
  vonrNm: string //소유자명
  flnm: string //운전자명
  rrno: string //운전자 주민등록번호
  ctrtBgngYmd: string //계약 시작일
  ctrtEndYmd: string //계약 종료일
  telno: string //연락처
  fileId: string //첨부파일 아이디

  [key: string]: string | number
}

export interface CustomFile {
  fileId?: string //파일아이디
  atchSn?: string //첨부일련번호
  rfrncGroupSn?: string //참조그룹일련번호
  physFileNm?: string //물리파일명
  lgcFileNm?: string //논리파일명
  fileSize?: string //파일사이즈
  uldFile?: string // 업로드파일
  rfrncId?: string // 참조아이디
  rgtrId?: string // 등록자아이디
  regDt?: string // 등록일시
  mdfrId?: string //수정자아이디
  mdfcnDt?: string //수정일자
}

const BsModifyModal = (props: BsModifyModalProps) => {
  const { open, handleClickClose, row, type, reload } = props
  const [vhclOpen, setVhclOpen] = useState(false)
  const [DrOpen, setDrOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // 첨부된 파일 상태
  const [existingFiles, setExistingFiles] = useState<CustomFile[]>([])
  const [isLicenseOk, setIsLicenseOk] = useState<boolean>(false)
  const [isKotsaOk, setIsKotsaOk] = useState<boolean>(false)

  const [data, setData] = useState<data>({
    vhclNo: '', //차량번호
    vonrNm: '', //소유자명
    flnm: '', //운전자명
    rrno: '', //운전자 주민등록번호
    ctrtBgngYmd: '', //계약 시작일
    ctrtEndYmd: '', //계약 종료일
    telno: '', //연락처
    fileId: '', //첨부파일 아이디
  })

  // 파일 다운로드 핸들러
  const fetchFilesDown = async (files: CustomFile) => {
    if (files == undefined) {
          return
    }

    try {
      let endpoint: string =
        `/fsm/stn/dm/tr/getDrverFileDownload?` +
        `physFileNm=${files.physFileNm}` +
        `&lgcFileNm=${files.lgcFileNm}`

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
    } finally {
    }
  }

  useEffect(() => {
    if (row && type === 'U') {
      setData({
        vhclNo: row.vhclNo, //차량번호
        vonrNm: row.vonrNm, //소유자명
        flnm: row.flnm, //운전자명
        rrno: row.rrno, //운전자 주민등록번호
        rrnoSecure: row.rrnoSecure, //운전자 주민등록번호(별표)
        ctrtBgngYmd: row.ctrtBgngYmd, //계약 시작일
        ctrtEndYmd: row.ctrtEndYmd, //계약 종료일
        telno: row.telno, //연락처
        fileId: row.fileId, //첨부파일 아이디
      })
    } else {
      setData({
        vhclNo: '', //차량번호
        vonrNm: '', //소유자명
        flnm: '', //운전자명
        rrno: '', //운전자 주민등록번호
        rrnoSecure: '', //운전자 주민등록번호(별표)
        ctrtBgngYmd: '', //계약 시작일
        ctrtEndYmd: '', //계약 종료일
        telno: '', //연락처
        fileId: '', //첨부파일 아이디
      })
      setExistingFiles([])
      setUploadedFiles([])
      setIsKotsaOk(false)
      setIsLicenseOk(false)
    }
  }, [open])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    if (name === 'telno') {
      if (isNumber(value, []))
        setData((prev: any) => ({ ...prev, [name]: value }))

      return
    } else {
      setData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const setVhcl = (vhclRow: any) => {
    setData((prev) => ({
      ...prev,
      vonrNm: vhclRow.vonrNm, // 소유자명
      vhclNo: vhclRow.vhclNo, //차량번호
      // vonrRrnoSecure: vhclRow.vonrRrnoSecure,
    }))
  }

  // 데이터를 초기화하고 닫는다.
  const handleClose = () => {
    setData({
      vhclNo: '', //차량번호
      vonrNm: '', //소유자명
      flnm: '', //운전자명
      rrno: '', //운전자 주민등록번호
      rrnoSecure: '', //운전자 주민등록번호(별표)
      ctrtBgngYmd: '', //계약 시작일
      ctrtEndYmd: '', //계약 종료일
      telno: '', //연락처
      fileId: '', //첨부파일 아이디
    })

    setExistingFiles([])
    setUploadedFiles([])
    handleClickClose()
  }

  const setDriver = (driverRow: DriverRow) => {
    setData((prev) => ({
      ...prev,
      rrno: driverRow.rrno ?? '',
    }))
  }

  useEffect(() => {
    fetchFilesData()
  }, [data.fileId])

  const fetchFilesData = async () => {
    try {
      // 검색 조건에 맞는 endpoint 생성
      let endpoint: string =
        `/fsm/stn/dm/tr/getDrverFileList?fileId=` + data.fileId

      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success' && response.data) {
        setExistingFiles(response.data.fileList)
      } else {
        // 빈 파일
        setExistingFiles([])
      }
    } catch (error) {
      // 에러시
      alert(error)
    } finally {
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)

      // Validate file size (10MB) and count (3 files maximum)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
      const MAX_FILES = 1000000

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
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))

    // Clear the value of the file input field
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleDeleteFile = async (file: CustomFile) => {
    const isDeleted = await fetchFilesDelete(file) // 삭제 결과를 boolean으로 받음
    if (isDeleted) {
      setExistingFiles((prevFiles) =>
        prevFiles.filter((existingFile) => existingFile.atchSn !== file.atchSn),
      )
      alert('파일이 성공적으로 삭제되었습니다.')
    } else {
      alert('파일 삭제에 실패했습니다.')
    }
  }

  // 파일 다운로드 핸들러
  const fetchFilesDelete = async (files: CustomFile): Promise<boolean> => {
    if (files == undefined) {
      return false
    }
    try {
      let endpoint: string = `/fsm/stn/dm/tr/deleteFile`

      const response = await sendHttpRequest(
        'DELETE',
        endpoint,
        {
          atchSn: files.atchSn,
          physFileNm: files.physFileNm,
          fileId: data.fileId,
        },
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType === 'success') {
        return true
      } else {
        return false
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
      return false
    }
  }

  const saveData = async () => {
    if (!data.vhclNo) {
      alert('차량을 선택해주세요.')
      return
    }
    if (!data.flnm) {
      alert('운전자명을 입력해주세요.')
      return
    }
    if (type === 'I' && !data.rrno) {
      alert('운전자 주민등록번호를 선택해주세요.')
      return
    }
    if(type==='I' && data.rrno.replaceAll('-', '').replaceAll(' ', '').replaceAll(/\t/g,'').length !== 13){
      alert('운전자 주민등록번호는 13자리 숫자로 구성되어야 합니다.')
      return
    }
    if (!data.ctrtBgngYmd) {
      alert('계약 시작일자를 입력해주세요.')
      return
    }
    if (!data.ctrtEndYmd) {
      alert('계약 종료일자를 입력해주세요.')
      return
    }

    if (type === 'U') {
      if (
        data.ctrtEndYmd < getDateFormatYMD(data.ctrtBgngYmd) ||
        data.ctrtEndYmd < getFormatToday()
      ) {
        alert('계약 종료일자는 오늘일자 또는 계약 시작일 이후여야 합니다.')
        return
      }
    }

    if (type === 'I') {
      if (!isLicenseOk) {
        alert('운전자 운전면허 미 확인 시 운전자를 등록하실 수 없습니다.')
        return
      }

      if (!isKotsaOk) {
        alert('운전자 운수종사 자격 미 확인 시 운전자를 등록하실 수 없습니다.')
        return
      }
    }

    if (
      !confirm(
        type === 'I'
          ? '운전자정보를 등록하시겠습니까?'
          : '운전자정보를 수정하시겠습니까?',
      )
    ) {
      return
    }
    let endpoint: string =
      type === 'I'
        ? `/fsm/stn/dm/tr/insertDrverMng`
        : `/fsm/stn/dm/tr/updateDrverMng`

    let jsonData = {
      vhclNo: data.vhclNo,
      flnm: data.flnm,
      rrno: data.rrno,
      ctrtBgngYmd: data.ctrtBgngYmd.replaceAll('-', ''),
      ctrtEndYmd: data.ctrtEndYmd.replaceAll('-', ''),
      telno: data.telno,
    }

    try {
      const response = await sendMultipartFormDataRequest(
        type === 'I' ? 'POST' : 'PUT',
        endpoint,
        jsonData,
        uploadedFiles,
        true,
        {
          cache: 'no-store',
        },
      )
      if (response && response.resultType === 'success') {
        alert(response.message)
        handleClose()
        reload()
      } else {
        alert(response.message)
      }
    } catch (error : StatusType | any) {
      alert(error.errors[0].reason);
    }
  }

  const isUpdate = type === 'U' // 예: 조건이 업데이트 상태인지 확인

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'lg'} open={open} PaperProps={{}}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>운전자{type === 'U' ? '수정' : '등록'}</h2>
            </CustomFormLabel>

            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={saveData}>
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
                <caption>사업자 정보 테이블 요약</caption>
                <colgroup>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '23%' }}></col>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '16%' }}></col>
                  <col style={{ width: '15%' }}></col>
                  <col style={{ width: '16%' }}></col>
                </colgroup>
                <tbody>
                  <tr>
                    {type === 'U' ? (
                      <th className="td-head" scope="row">
                        차량번호
                      </th>
                    ) : (
                      <th className="td-head" scope="row">
                        <span className="required-text">*</span>차량번호
                      </th>
                    )}
                    <td>
                      <div
                        className="form-group button-right-align"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {data.vhclNo}
                        {type === 'U' ? (
                          <></>
                        ) : (
                          <>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                width: '100%',
                              }}
                            >
                              <Button
                                style={{ float: 'right' }}
                                onClick={() => setVhclOpen(true)}
                                variant="contained"
                                color="dark"
                              >
                                선택
                              </Button>
                            </Box>
                            <TrVhlModal
                              onCloseClick={() => setVhclOpen(false)}
                              onRowClick={setVhcl}
                              title="차량번호 검색"
                              url="/fsm/stn/dm/tr/getUserVhcle"
                              open={vhclOpen}
                              clickClose={true}
                            />
                          </>
                        )}
                      </div>
                    </td>
                    <th className="td-head" scope="row">
                      소유자명
                    </th>
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {data.vonrNm}
                      </div>
                    </td>
                    {type === 'U' ? (
                      <th className="td-head" scope="row">
                        운전자명
                      </th>
                    ) : (
                      <th className="td-head" scope="row">
                        <span className="required-text">*</span>운전자명
                      </th>
                    )}
                    <td>
                      <div className="form-group" style={{ width: '100%' }}>
                        {!isUpdate ? (
                          <>
                            <CustomFormLabel
                              className="input-label-none"
                              htmlFor="ft-flnm"
                            >
                              운전자명
                            </CustomFormLabel>
                            <CustomTextField
                              type="text"
                              id="ft-flnm"
                              name="flnm"
                              value={data.flnm}
                              onChange={handleParamChange}
                              disabled={isUpdate}
                              fullWidth
                              inputProps={{ maxLength: 50 }}
                            />
                          </>
                        ) : (
                          data.flnm
                        )}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    {type === 'U' ? (
                      <th className="td-head" scope="row">
                        운전자 주민등록번호
                      </th>
                    ) : (
                      <th className="td-head" scope="row">
                        <span className="required-text">*</span>운전자 주민등록번호
                      </th>
                    )}
                    <td>
                      <div
                        className="form-group"
                        style={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        {type === 'U' ? (
                          <>{rrNoFormatter(String(data.rrnoSecure ?? ''))}</>
                        ) : (
                          <>
                            {rrNoFormatter(String(data.rrno ?? ''))}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                width: '100%',
                              }}
                            >
                              <Button
                                onClick={() => setDrOpen(true)}
                                variant="contained"
                                color="dark"
                              >
                                선택
                              </Button>
                            </Box>
                            <DrModal
                              onCloseClick={() => setDrOpen(false)}
                              onRowClick={setDriver}
                              title="운전자정보 검색"
                              url="/fsm/stn/dm/tr/getUserDrver"
                              open={DrOpen}
                            />
                          </>
                        )}
                      </div>
                    </td>
                    {type === 'U' ? (
                      <th>계약 시작일</th>
                    ) : (
                      <th>
                        <span className="required-text">*</span>계약 시작일
                      </th>
                    )}
                    <td>
                      {!isUpdate ? (
                        <>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="ft-date-start"
                            required
                          >
                            계약 시작일
                          </CustomFormLabel>
                          <CustomTextField
                            type="date"
                            id="ft-date-start"
                            name="ctrtBgngYmd"
                            value={formatDate(data.ctrtBgngYmd)}
                            onChange={handleParamChange}
                            inputProps={{
                              max: data.ctrtEndYmd
                            }}
                            fullWidth
                          />
                        </>
                      ) : (
                        formatDate(data.ctrtBgngYmd)
                      )}
                    </td>
                    {type === 'U' ? (
                      <th>계약 종료일</th>
                    ) : (
                      <th>
                        <span className="required-text">*</span>계약 종료일
                      </th>
                    )}
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-date-end"
                        required
                      >
                        계약 종료일
                      </CustomFormLabel>
                      <CustomTextField
                        type="date"
                        id="ft-date-end"
                        name="ctrtEndYmd"
                        value={formatDate(data.ctrtEndYmd)}
                        onChange={handleParamChange}
                        inputProps={{
                          min: getFormatToday().replaceAll('-', '') > data.ctrtBgngYmd ? getFormatToday() : data.ctrtBgngYmd
                        }}
                        fullWidth
                      />
                    </td>
                  </tr>

                  <tr>
                    <th className="td-head" scope="row">
                      연락처
                    </th>
                    <td>
                      <CustomFormLabel
                        className="input-label-none"
                        htmlFor="ft-telno"
                      >
                        연락처
                      </CustomFormLabel>
                      <CustomTextField
                        id="ft-telno"
                        name="telno"
                        value={data.telno?.replaceAll('-', '')}
                        onChange={handleParamChange}
                        placeholder="연락처 입력 (예: 01012345678)"
                        inputProps={{
                          min: data.telno,
                          maxLength: 13,
                        }}
                        fullWidth
                      />
                    </td>
                    {isUpdate ? (
                      <>
                        <th className="td-head" scope="row"></th>
                        <td>
                          <div
                            className="form-group"
                            style={{ width: '100%' }}
                          ></div>
                        </td>
                        <th className="td-head" scope="row"></th>
                        <td>
                          <div
                            className="form-group"
                            style={{ width: '100%' }}
                          ></div>
                        </td>
                      </>
                    ) : (
                      <>
                        <th className="td-head" scope="row">
                          운전면허 자격확인
                        </th>
                        <td>
                          <div className="form-group" style={{ width: '100%' }}>
                            <CustomCheckbox
                              value={isLicenseOk}
                              onChange={() => setIsLicenseOk((prev) => !prev)}
                            />
                          </div>
                        </td>
                        <th className="td-head" scope="row">
                          운수종사 자격확인
                        </th>
                        <td>
                          <div className="form-group" style={{ width: '100%' }}>
                            <CustomCheckbox
                              value={isKotsaOk}
                              onChange={() => setIsKotsaOk((prev) => !prev)}
                            />
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  <tr>
                    <th>첨부파일</th>

                    <td colSpan={5}>
                      {!isUpdate ? (
                        <>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="files"
                          >
                            첨부파일
                          </CustomFormLabel>
                          <input
                            type="file"
                            id="files"
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
                        </>
                      ) : (
                        <>
                          <CustomFormLabel
                            className="input-label-none"
                            htmlFor="files"
                          >
                            첨부파일
                          </CustomFormLabel>
                          <input
                            type="file"
                            id="files"
                            name="files"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'block' }}
                            // disabled
                          />
                          <Box sx={{ mt: 1 }}>
                            {/* 기존 파일 */}
                            {Array.isArray(existingFiles) &&
                              existingFiles.map((file, index) => (
                                <Box
                                  key={`existing-${index}`}
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
                                  <span>{file.lgcFileNm}</span>
                                  <span>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      onClick={() => fetchFilesDown(file)}
                                    >
                                      다운로드
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="error"
                                      size="small"
                                      onClick={() => handleDeleteFile(file)}
                                    >
                                      삭제
                                    </Button>
                                  </span>
                                </Box>
                              ))}
                            {/* 신규 파일 */}
                            {uploadedFiles.map((file, index) => (
                              <Box
                                key={`new-${index}`}
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
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 테이블영역 끝 */}
          </div>
          {/* 모달팝업 내용 끝 */}
          <div style={{ color: 'red', fontWeight: 'bold', padding: 5 }}>
            계약시작일자부터 운전자 등록일자까지 지급거절된 주유내역에 대해
            자동소급 지급됨
          </div>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
export default BsModifyModal
