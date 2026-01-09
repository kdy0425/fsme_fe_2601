// app/(ilp)/ilp/vd/_components/VndcDmndDataModal.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button, TableRow } from '@mui/material'
import {
  BoardContainer,
  LeftCell,
  RightCell,
} from '../../../_components/board/BoardComponents'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { sendHttpRequest, sendHttpFileRequest } from '@/utils/fsms/common/apiUtils'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'

type OpenType = 'CREATE' | 'UPDATE'

type ServerFile = {
  atchSn: string
  lgcFileNm: string
}

type Props = {
  open: boolean
  mode: OpenType
  exmnNo: string
  vhclNo: string
  brno: string
  vonrNm: string
  vndcNo?: string
  vndcCn?: string
  onClose: () => void
  onReload?: () => void
  endpoints?: {
    getDetail?: string
    create?: string
    update?: string
    delete?: string
    deleteFile?: string
    download?: (atchSn: string, exmnNo: string, vndcNo: string) => string
  }
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result)) // data:...;base64,.... 포함
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const mapNewFilesToDto = async (files: File[]) => {
  return Promise.all(
    files.map(async (f) => ({
      lgcFileNm: f.name,
      physFileNm: f.name,
      fileSize: f.size,
      uldFileBase64: await fileToBase64(f),
    })),
  )
}

const DEFAULT_ENDPOINTS: Required<NonNullable<Props['endpoints']>> = {
  getDetail: '/ilp/vdd/cm/getVndcFiles',
  create: '/ilp/vdd/cm/createVndcData',
  update: '/ilp/vdd/cm/updateVndcData',
  delete: '/ilp/vdd/cm/delVndcData',
  deleteFile: '/ilp/vdd/cm/delVndcFile',
  download: (atchSn: string, exmnNo: string, vndcNo: string) =>
    `/ilp/vdd/cm/getVddFileDownload?exmnNo=${encodeURIComponent(exmnNo)}&vndcNo=${encodeURIComponent(vndcNo)}&atchSn=${encodeURIComponent(atchSn)}`,
}

const headerCellSx = {
  px: 2, py: 1.25, fontWeight: 600, bgcolor: 'action.hover',
  borderRadius: '4px', minHeight: 40, display: 'flex', alignItems: 'center',
} as const

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const VndcDmndDataModal: React.FC<Props> = ({
  open,
  mode,
  exmnNo,
  vhclNo,
  brno,
  vonrNm,
  vndcNo = '',
  vndcCn = '',
  onClose,
  onReload,
  endpoints = {},
}) => {
  const ep = { ...DEFAULT_ENDPOINTS, ...endpoints }
  const openMode: OpenType = mode
  const titleSuffix = openMode === 'CREATE' ? '등록' : '수정'

  // 본문 상태는 vndcCn만 사용
  const [content, setContent] = useState<string>(vndcCn ?? '')

  const [extFiles, setExtFiles] = useState<ServerFile[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setContent(vndcCn ?? '')
    setNewFiles([])

    if (openMode === 'UPDATE' && exmnNo && vndcNo) {
      (async () => {
        setLoading(true)
        try {
          const url = `${ep.getDetail}?exmnNo=${encodeURIComponent(exmnNo)}&vndcNo=${encodeURIComponent(vndcNo)}`
          const res = await sendHttpRequest('GET', url, null, true, { cache: 'no-store' })
          if (res?.resultType === 'success') {
            const raw = res.data
            const list = Array.isArray(raw) ? raw : (raw?.files ?? [])
            setExtFiles(Array.isArray(list) ? list : [])
          } else {
            alert(res?.message || '첨부파일을 불러오지 못했습니다.')
            setExtFiles([])
          }
        } finally {
          setLoading(false)
        }
      })()
    } else {
      setExtFiles([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exmnNo, vndcNo])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        alert(`${f.name} 은(는) 10MB를 초과합니다.`)
        return false
      }
      return true
    })
    setNewFiles((prev) => [...prev, ...valid])
    e.currentTarget.value = ''
  }
  const removeNewFile = (idx: number) => setNewFiles((p) => p.filter((_, i) => i !== idx))
  
  const validate = () => {
    if (!exmnNo?.trim()) return alert('연번이 없습니다.'), false
    if (openMode === 'CREATE' && !content?.trim()) {
      alert('소명등록내용을 입력해 주세요.')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    if (!confirm(openMode === 'CREATE' ? '등록하시겠습니까?' : '수정하시겠습니까?')) return

    setLoading(true)
    try {
      const method: 'POST' | 'PUT' = openMode === 'CREATE' ? 'POST' : 'PUT'
      const url = openMode === 'CREATE' ? ep.create : ep.update

      const payload: any = {
        exmnNo,
        vndcCn: content,
      }

      if (openMode === 'UPDATE') {
        payload.vndcNo = vndcNo
      }
      // 두 모드 공통: 새 파일이 있으면 files 세팅
      if (newFiles.length > 0) {
        const filesPayload = await mapNewFilesToDto(newFiles)
        if (filesPayload.length) payload.files = filesPayload
      }

      // JSON
      const res = await sendHttpRequest(method, url, payload, true, { cache: 'no-store' })

      if (res?.resultType === 'success') {
        alert(openMode === 'CREATE' ? '저장되었습니다.' : '수정되었습니다.')
        onReload?.()
        onClose()
      } else {
        alert(res?.message || '처리 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (openMode !== 'UPDATE') return
    if (!confirm('삭제 처리 하시겠습니까?')) return
    setLoading(true)
    try {
      const res = await sendHttpRequest(
        'PUT',
        ep.delete,
        { exmnNo, vndcNo},
        true,
        { cache: 'no-store' },
      )
      if (res?.resultType === 'success') {
        alert('삭제 처리 되었습니다.')
        onReload?.()
        onClose()
      } else {
        alert(res?.message || '삭제 처리 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  //파일 다운로드
  const handleExistingFileDownload = async (file: ServerFile) => {
    try {
      setLoading(true)
      //const url = (endpoints?.download || DEFAULT_ENDPOINTS.download)(String(file.atchSn))
      const url = ep.download(String(file.atchSn), exmnNo, vndcNo)
      const blob = await sendHttpFileRequest('GET', url, null, true, { cache: 'no-store' })
      const objectUrl = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = objectUrl
      a.setAttribute('download', file.lgcFileNm || 'download')
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (e) {
      console.error(e)
      alert('파일 다운로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 기존 파일 즉시 삭제 (성공 시 목록에서 제거)
  const handleExistingFileRemove = async (file: ServerFile) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return
    setLoading(true)
    try {
    const url = ep.deleteFile 
    const res = await sendHttpRequest('PUT', url, { atchSn: file.atchSn, exmnNo, vndcNo }, true, { cache: 'no-store' })
      if (res?.resultType === 'success') {
        setExtFiles(prev => prev.filter(x => String(x.atchSn) !== String(file.atchSn)))
        alert('파일이 삭제되었습니다.')
      } else {
        alert(res?.message || '파일 삭제에 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogContent>
        {/* 헤더 & 버튼 */}
        <Box className="table-bottom-button-group">
          <CustomFormLabel className="input-label-display">
            <h2>소명자료 <span>{titleSuffix}</span></h2>
          </CustomFormLabel>
          <div className="button-right-align">
            <Button variant="contained" color="primary" onClick={handleSave}>저장</Button>
            {openMode === 'UPDATE' && (
              <Button variant="contained" color="error" onClick={handleDelete}>삭제</Button>
            )}
            <Button variant="contained" color="dark" onClick={onClose}>닫기</Button>
          </div>
        </Box>

        {/* 본문 */}
        <BoardContainer>
          <TableRow>
            <LeftCell isRequire title="연번" />
            <RightCell>
              {exmnNo || '-'}
            </RightCell>
            <LeftCell isRequire={false} title="차량번호" />
            <RightCell>
              {vhclNo || '-'}
            </RightCell>
          </TableRow>
          <TableRow>
            <LeftCell isRequire={false} title="사업자번호" />
            <RightCell>
              {brno || '-'}
            </RightCell>
            <LeftCell isRequire={false} title="업체명" />
            <RightCell>
              {vonrNm || '-'}
            </RightCell>
          </TableRow>  

          <TableRow>
            <LeftCell isRequire title="소명자료등록내용" />
              
            <RightCell colSpan={3}>
              <label htmlFor="vndcCn" className="sr-only"></label>
              <textarea
                className="MuiTextArea-custom"
                id="vndcCn"
                name="vndcCn"          
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
              />
            </RightCell>
          </TableRow>

          {/* 첨부파일 영역 */}
          <TableRow>
            <LeftCell isRequire title="첨부파일" />
            <RightCell colSpan={3}>
              <label htmlFor="lgcFileNm" className="sr-only"></label>
              <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
                {/* 기존 파일 (UPDATE) */}
                {openMode === 'UPDATE' && (
                  <>
                    {extFiles?.length ? (
                      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {extFiles.map((f) => {
                          const sn = String(f.atchSn)
                          return (
                            <Box
                              key={sn}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1, 
                                width: '100%',
                              }}
                            >
                              {/* 텍스트 필드가 남는 폭 전부 차지 + overflow 방지 */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <CustomTextField
                                  id="lgcFileNm"
                                  value={f.lgcFileNm}
                                  disabled
                                  size="small"
                                  fullWidth
                                />
                              </Box>

                              {/* 오른쪽 버튼 묶음 */}
                              <Box sx={{ display: 'flex', gap: 1, ml: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleExistingFileDownload(f)}
                                >
                                  다운로드
                                </Button>

                                {ep?.deleteFile && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleExistingFileRemove(f)}
                                  >
                                    삭제
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          )
                        })}
                      </Box>
                    ) : (
                      <span style={{ color: '#888' }}>기존 첨부없음</span>
                    )}
                  </>
                )}

                {/* 신규 추가 
                {openMode === 'CREATE' && (*/}
                {(
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* 네이티브 input은 숨기고 */}
                    <input
                      id="vndc-files"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />

                    {/* 버튼은 MUI로 표시 */}
                    <label htmlFor="vndc-files">
                      <Button variant="outlined" size="small" component="span">
                        파일 선택
                      </Button>
                    </label>

                    {/* 선택 상태 안내 (선택된 파일 없음 / N개 선택됨 등) */}
                    <span style={{ color: '#666' }}>
                      {newFiles.length ? `${newFiles.length}개 선택됨` : '선택된 파일 없음'}
                    </span>
                  </Box>
                )}
                {/* 신규 파일 목록 */}
                {newFiles.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {newFiles.map((f, idx) => (
                      <Box key={`new-${idx}`} sx={{ display:'flex', justifyContent:'space-between', p:'4px', border:'1px solid #ddd', mb:'4px', borderRadius:'4px' }}>
                        <span>{f.name}</span>
                        <Button variant="contained" color="error" size="small" onClick={() => removeNewFile(idx)}>제거</Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </RightCell>
          </TableRow>
        </BoardContainer>

        {loading && <LoadingBackdrop open={loading} />}
      </DialogContent>
    </Dialog>
  )
}

export default VndcDmndDataModal
