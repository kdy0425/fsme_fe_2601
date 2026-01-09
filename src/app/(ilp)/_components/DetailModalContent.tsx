import React, { useContext, useEffect, useState } from 'react'
import {
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
import { Box } from '@mui/material'

import {
  CustomFormLabel,
  CustomRadio,
  CustomSelect,
  CustomTextField,
} from '@/utils/fsms/fsm/mui-imports'
import { CustomFile, Row } from './NoticeDetailDialog'
import { SelectItem } from 'select'
import { getCodesByGroupNm } from '@/utils/fsms/common/code/getCode'
import UserAuthContext from '@/app/components/context/UserAuthContext'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getDateTimeString } from '@/utils/fsms/common/util'
export interface ModalFormProps {
  formData: Row
  //파일 관련 메서드들 요소 주성 메서드 주석처리
  // onFormDataChange: (name: string, value: string) => void;
  // onFileChange: (files: File[]) => void;
  onFileDown: (file: CustomFile) => void
  // onFileDelete: (file: CustomFile) => Promise<boolean>
}

//'[공지][전체] 2024년 11월 청구내역(2024년 10월 사용내역) 게시 안내' -> 공지 구분, 업무 구분 으로 분할한다.
function extractBracketContentsAndRest(text: string) {
  const regex = /\[([^\]]+)]/g // Match content within square brackets
  const matches = []
  let match
  let restOfString = text

  while ((match = regex.exec(text)) !== null) {
    matches.push(`[${match[1]}]`)
    restOfString = restOfString.replace(match[0], '').trim() // Remove matched content from the rest of the string
  }

  return {
    matches, // Array of bracketed contents
    restOfString, // Remaining string without brackets
  }
}

const ModifyModalContent: React.FC<ModalFormProps> = ({
  formData,
  //파일 관련 수정 메서드들 주석처리
  // onFormDataChange,
  // onFileChange,
  onFileDown,
  // onFileDelete,
}) => {
  const [leadCnCode, setNotiCode] = useState<SelectItem[]>([])
  const [relateTaskSeCode, setWorkCode] = useState<SelectItem[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<CustomFile[]>(
    formData.fileList || [],
  )

  useEffect(() => {
    const fetchCodes = async () => {
      const noti: SelectItem[] = []
      const work: SelectItem[] = []
      const notiRes = await getCodesByGroupNm('112')
      const workRes = await getCodesByGroupNm('117')
      notiRes?.forEach((code: any) =>
        noti.push({ label: code['cdKornNm'], value: code['cdNm'] }),
      )
      workRes?.forEach((code: any) =>
        work.push({ label: code['cdKornNm'], value: code['cdNm'] }),
      )
      setNotiCode(noti)
      setWorkCode(work)
    }
    fetchCodes()
  }, [])

  // const handleParamChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //     if (!false) return;
  //     const { name, value } = event.target;
  //     onFormDataChange(name, value);
  // };

  const { matches, restOfString } = extractBracketContentsAndRest(
    formData.ttl as string,
  )

  return (
    <Box sx={{ maxWidth: 'fullWidth', margin: '0 auto' }}>
      <TableContainer style={{ margin: '16px 0 4em 0' }}>
        <Table
          className="table table-bordered"
          aria-labelledby="tableTitle"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <TableBody>
            <TableRow>
              <TableCell
                className="td-head"
                style={{ width: '150px', verticalAlign: 'middle' }}
              >
                공지구분
              </TableCell>
              <TableCell
                style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}
              >
                {
                  matches[0] // 첫 번째 값 ([공지])
                }
              </TableCell>
              <TableCell
                className="td-head"
                style={{ width: '150px', verticalAlign: 'middle' }}
              >
                업무구분
              </TableCell>
              <TableCell
                style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}
              >
                {
                  matches[1] // 두 번째 값 ([전체])
                }
              </TableCell>
            </TableRow>
            {/* 팝업관련 일단 주석처리 {false ?  
                        <TableRow>
                            <TableCell style={{ width: '150px', verticalAlign: 'middle' }}>
                                팝업여부
                            </TableCell>
                            <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                                <Box display="flex" alignItems="center">
                                    <RadioGroup
                                                row
                                                id="modal-radio-useYn"
                                                name="popupNtcYn"
                                                value={formData.popupNtcYn}
                                                onChange={handleParamChange}
                                                className="mui-custom-radio-group"
                                                style={{ marginRight: '16px' }}
                                            >
                                            <FormControlLabel
                                                control={<CustomRadio id="chk_Y" name="popupNtcYn" value="Y" />}
                                                label="사용"
                                            />
                                            <FormControlLabel
                                                control={<CustomRadio id="chk_N" name="popupNtcYn" value="N" />}
                                                label="미사용"
                                            />
                                    </RadioGroup>
                                    {formData.popupNtcYn === 'Y' && (
                                    <Box display="flex" alignItems="center">
                                        <CustomTextField
                                            type="date"
                                            id="ft-date-start"
                                            name="popupBgngYmd"
                                            value={getDateTimeString(formData.popupBgngYmd as string,'date')?.dateString ?? ''}
                                            onChange={handleParamChange}
                                            disabled={!false}
                                            style={{ marginRight: '8px' }}
                                            />
                                        ~
                                        <CustomTextField
                                            type="date"
                                            id="ft-date-end"
                                            name="popupEndYmd"
                                            value={getDateTimeString(formData.popupEndYmd  as string,'date')?.dateString ?? ''}
                                            onChange={handleParamChange}
                                            disabled={!false}
                                            style={{ marginRight: '8px' }}
                                            />
                                    </Box>
                                    )}
                                </Box>
                        </TableCell>
                        </TableRow>
                        :  null} */}

            <TableRow>
              <TableCell
                className="td-head"
                style={{ width: '150px', verticalAlign: 'middle' }}
              >
                제목
              </TableCell>

              <TableCell colSpan={3} style={{ textAlign: 'left' }}>
                {restOfString}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                className="td-head"
                style={{ width: '150px', verticalAlign: 'middle' }}
              >
                내용
              </TableCell>
              <TableCell colSpan={3} style={{ textAlign: 'left' }}>
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
                  {formData.cn}
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="td-head">첨부파일</TableCell>
              <TableCell colSpan={3}>
                <Box sx={{ mt: 1 }}>
                  {/* 기존 파일 */}
                  {existingFiles.map((file, index) => (
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
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => onFileDown(file)}
                      >
                        다운로드
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
  )
}
export default ModifyModalContent
