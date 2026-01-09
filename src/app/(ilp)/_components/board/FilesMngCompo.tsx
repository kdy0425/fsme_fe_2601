/* react */
import React, { useState, memo, SetStateAction, Dispatch } from 'react'

/* 공통 component */
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* mui component */
import { TableCell, Box, Button } from '@mui/material'

/* 게시판 타입 */
import { dwBoardAtt } from './type'

/* 게시판 정보 */
import { boardPathObj } from './boardInfo'

/* 공통 js */
import { sendHttpFileRequest, sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* redux-toolkit */
import { useSelector } from '@/store/hooks'

type propsType = {
  extFileList: dwBoardAtt[]
  setExtFileList: Dispatch<SetStateAction<dwBoardAtt[]>>
  newFileList: File[]
  setNewFileList: Dispatch<SetStateAction<File[]>>
}

const FilesMngCompo = (props: propsType) => {

  const { extFileList, setExtFileList, newFileList, setNewFileList } = props

  // redux-toolkit
  const { boardType, openType } = useSelector(state => state.IlpBoard)

  // 로딩
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false)

  // 등록, 수정시 파일선택
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

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
        return true
      })
      if (validFiles.length + newFileList.length > MAX_FILES) {
        alert(`첨부파일은 최대 ${MAX_FILES}개까지만 등록 가능합니다.`)
        return
      }
      const updatedFiles = [...newFileList, ...validFiles]
      setNewFileList(updatedFiles)
    }
  }

  // 신규 파일 삭제 핸들러
  const handleNewFileRemove = (index: number): void => {

    const updatedFiles = newFileList.filter((_, i) => i !== index)
    setNewFileList(updatedFiles)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // 등록된 파일 삭제 핸들러
  const handleExistingFileRemove = async (file: dwBoardAtt): Promise<void> => {
    if (confirm('삭제 하시겠습니까?')) {
      const isDeleted = await onFileDelete(file)
      if (isDeleted) {
        setExtFileList((prevFiles) => prevFiles.filter((existingFile) => existingFile.atchSn !== file.atchSn))
        alert('파일이 성공적으로 삭제되었습니다.')
      } else {
        alert('파일 삭제에 실패했습니다.')
      }
    }
  }

  // 등록된 파일 삭제
  const onFileDelete = async (files: dwBoardAtt): Promise<boolean> => {

    if (!files) {
      return false
    }

    let flag = false

    try {

      setLoadingBackdrop(true)

      const path = boardPathObj[boardType]
      const url = path + '/deleteBoardFile'
      const deleteObj = { atchSn: files.atchSn, bbscttSn: files.bbscttSn }
      const response = await sendHttpRequest('DELETE', url, deleteObj, true, { cache: 'no-store' })

      if (response && response.resultType === 'success') {
        flag = true
      } else {
        alert('파일삭제 실패했습니다.')
      }
    } catch (error) {
      // 에러시
      console.error('Error fetching data:', error)
    } finally {
      setLoadingBackdrop(false)
      return flag
    }
  }

  // 파일 다운로드 핸들러
  const onFileDown = async (files: dwBoardAtt): Promise<void> => {

    if (!files) {
      return
    }

    try {

      setLoadingBackdrop(true)

      const path = boardPathObj[boardType]
      const endpoint = path + `/file/${files.bbscttSn}/${files.atchSn}`
      const response = await sendHttpFileRequest('GET', endpoint, null, true, { cache: 'no-store' })
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
      setLoadingBackdrop(false)
    }
  }

  return (
    <>
      <TableCell className="td-head">
        첨부파일
      </TableCell>
      <TableCell colSpan={3}>
        <CustomFormLabel
          className="input-label-none"
          htmlFor="files"
        >
          첨부파일
        </CustomFormLabel>

        {/* 등록, 수정 시 파일등록 가능 */}
        {openType !== 'VIEW' ? (
          <input
            id="files"
            type="file"
            name="fileList"
            multiple
            onChange={handleFileChange}
            style={{ display: 'block' }}
          />
        ) : null}

        <Box sx={{ mt: 1 }}>
          {/* 기존 파일 */}
          {extFileList.map((file, index) => (
            <Box key={`existing-${index}`} sx={sx}>
              <span>{file.lgcFileNm}</span>
              {openType !== 'VIEW' ? (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleExistingFileRemove(file)}
                >
                  삭제
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => onFileDown(file)}
                >
                  다운로드
                </Button>
              )}
            </Box>
          ))}

          {/* 신규 파일 */}
          {newFileList.map((file, index) => (
            <Box key={`new-${index}`} sx={sx}>
              <span>{file.name}</span>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleNewFileRemove(index)}
              >
                삭제
              </Button>
            </Box>
          ))}
        </Box>
        {/* 로딩 */}
        {loadingBackdrop && (
          <LoadingBackdrop open={loadingBackdrop} />
        )}
      </TableCell>
    </>
  )
}

export default memo(FilesMngCompo)

const sx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px',
  border: '1px solid #ddd',
  marginBottom: '4px',
  borderRadius: '4px',
}