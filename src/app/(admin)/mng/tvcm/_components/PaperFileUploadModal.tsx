/* React */
import React, { useEffect, useState } from 'react'

/* mui component */
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button, Dialog, DialogContent } from '@mui/material'

/* 공통 js */
import { sendMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* util/interface.ts */
import { PaperFileUploadModalProps } from '../util/interface'

const PaperFileUploadModal = (props:PaperFileUploadModalProps) => {
  
  const { open, setOpen } = props
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // 첨부된 파일 상태
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
  const [sortFlag, setSortFlag] = useState<boolean|null>(null);

  useEffect(() => {
    if (sortFlag != null) {      
      handleSort()      
    }
  }, [sortFlag])

  const handleClick = async () => {

    if (fileValidate()) {
    
      if (confirm('파일을 저장 하시겠습니까?')) {

        try {
          
          setLoadingBackdrop(true);
          const response = await sendMultipartFormDataRequest('POST', '/fsm/mng/tvcm/cm/insertPapersFiles', {}, uploadedFiles, true, { cache: 'no-store' })

          if (response && response.resultType === 'success') {
            alert(response.message)
            setOpen(false)
          } else {
            alert(response.message)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoadingBackdrop(true);
        }
      }
    }
  }

  const fileValidate = () => {

    if(uploadedFiles.length == 0){
      alert("파일을 첨부해주세요.")
      return;
    }
    
    const fileNameArray:string[] = [];
    
    uploadedFiles.map((item) => {
      fileNameArray.push(item.name);
    });

    let result = true;

    for (let i=0; i<fileNameArray.length; i++) {
      if (fileNameArray.lastIndexOf(fileNameArray[i]) !== i) {
        alert('동일한 파일명이 존재합니다.\n파일명 : ' + fileNameArray[i]);
        result = false
        break;
      }      
    }
    
    return result;
  };

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
      
      // 기존 파일과 새로운 파일을 합쳐서 상태 업데이트
      setUploadedFiles((prev) => [...prev, ...validFiles])
    }

    // 파일 선택 후 input 값 리셋
    event.target.value = ''
  }

  const handleFileRemove = (index: number) => {
    // 선택된 파일을 제거하고 상태 업데이트
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSort = () => {

    let temp = uploadedFiles.slice();

    if (!sortFlag) { // 오름차순
      temp = temp.sort((asc, desc) => asc.name.length - desc.name.length);
    } else { // 내림차순
      temp = temp.sort((asc, desc) => desc.name.length - asc.name.length);
    }

    setUploadedFiles(temp);
  };

  return (
    <Box>
      <Dialog fullWidth={true} maxWidth={'sm'} open={open}>
        <DialogContent>
          {/* 모달헤더 시작 */}
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>서면신청 파일업로드</h2>
            </CustomFormLabel>

            <div className="button-right-align">
              
              <Button variant="contained" color="success" component="label">
                파일선택
                <input
                  type="file"
                  id="files"
                  name="files"
                  multiple
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              
              <Button variant="contained" color="primary" onClick={() => setSortFlag(prev => !prev)}>
                정렬
              </Button>

              <Button variant="contained" color="primary" onClick={handleClick}>
                저장
              </Button>

              <Button variant="contained" color="dark" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </Box>

          <div id="alert-dialog-description1">
            <div className="table-scrollable">
              <table className="table table-bordered">
                <caption>서면신청 파일업로드</caption>
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '80%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <th>첨부파일</th>
                    <td>
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
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />

        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default PaperFileUploadModal