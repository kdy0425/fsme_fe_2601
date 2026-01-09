import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  TableContainer,
  TableHead,
} from '@mui/material'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { Table } from '@mui/material'
import { TableBody } from '@mui/material'
import { TableRow } from '@mui/material'
import { TableCell } from '@mui/material'
import React, { useState } from 'react'
import CustomCheckbox from '../forms/theme-elements/CustomCheckbox'
import { getCookie, setCookie } from '@/utils/fsms/common/util'
import { notiFile } from '@/store/popup/NoticeSlice'
import { sendHttpFileRequest } from '@/utils/fsms/common/apiUtils'

const NoticeModal = (prop: any) => {
  const { notiData } = prop
  const [open, setOpen] = useState<boolean>(true)
  const handleClose = () => {
    setOpen(false)
  }

  // 파일 다운로드 핸들러
  const onFileDown = async (files: notiFile) => {
    if (files == undefined) {
      return
    }
    try {
      let endpoint: string =
        `/fsm/sup/notice/file/` + files.bbscttSn + `/` + files.atchSn

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

  const changeCookie = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = event.target
    if (checked) {
      includeModalCookie('ignoreModal', notiData.bbscttSn)
      setOpen(false)
    } else {
      excludeModalCookie('ignoreModal', notiData.bbscttSn)
    }
  }

  const includeModalCookie = (name: string, value: number) => {
    /**
     * 1. name에 해당하는 cookie를 가져온다.
     * 1-1. 없으면 만든다.
     * 2. name cookie에 value 배열을 넣은 값을 세팅한다.
     * 3. cookie를 세팅한다. document.cookie = `......`
     */
    const cookie: Array<number> = getCookie(name)
    if (cookie == null) {
      setCookie(name, [value], 7)
    } else {
      if (cookie.includes(value)) {
        return
      }
      cookie.push(value)
      setCookie(name, cookie, 7)
    }
  }

  const excludeModalCookie = (name: string, value: number) => {
    const cookie: Array<number> = getCookie(name)
    if (cookie == null) {
      return
    } else {
      const findIdx = cookie.findIndex((cookieVal) => cookieVal === value)
      if (findIdx < 0) {
        return
      }
      cookie.splice(findIdx, 1)
      setCookie(name, cookie, 7)
    }
  }

  return (
    <>
      <Dialog fullWidth={false} maxWidth={'lg'} open={open} hideBackdrop={true}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>공지사항</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button color="dark" variant="contained" onClick={handleClose}>
                취소
              </Button>
            </div>
          </Box>
          <Box sx={{ maxWidth: 'fullWidth', margin: '0' }}>
            <TableContainer style={{ margin: '16px 0 1em 0' }}>
              <Table
                className="table table-bordered"
                aria-labelledby="tableTitle"
                style={{ tableLayout: 'fixed', width: '100%' }}
              >
                <caption>공지사항</caption>
                <TableHead style={{display:'none'}}>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    />
                    <TableCell
                      style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}
                    />
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    />
                    <TableCell
                      style={{ width: 'calc(50% - 150px)', textAlign: 'left' }}
                    />
                  </TableRow>
                </TableHead>
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
                      {notiData.leadCnNm}
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
                      {notiData.relateTaskSeNm}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    >
                      제목
                    </TableCell>
                    <TableCell colSpan={3} style={{ whiteSpace: 'nowrap' }}>
                      {notiData.ttl}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    >
                      내용
                    </TableCell>
                    <TableCell colSpan={3} style={{ whiteSpace: 'pre-wrap' }}>
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
                        {notiData.cn}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className="td-head"
                      style={{ width: '150px', verticalAlign: 'middle' }}
                    >
                      첨부파일
                    </TableCell>
                    {/* <TableCell>{JSON.stringify(notiData.fileList)}</TableCell> */}
                    <TableCell colSpan={3}>
                      {notiData.fileList?.map(
                        (file: notiFile, index: number) => {
                          return (
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
                          )
                        },
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <FormControlLabel
            label="일주일간 보여주지 않기"
            control={<CustomCheckbox onChange={changeCookie} />}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default React.memo(NoticeModal)
