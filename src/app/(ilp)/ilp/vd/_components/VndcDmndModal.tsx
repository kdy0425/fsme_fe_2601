// app/(ilp)/ilp/vd/_components/VndcDmndModal.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button, TableRow } from '@mui/material'
import {
  BoardContainer,
  LeftCell,
  RightCell,
  CustomTextArea,
} from '../../../_components/board/BoardComponents'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

type OpenType = 'UPDATE' | 'DELETE'

type Props = {
  open: boolean
  mode: OpenType                // <-- 부모에서 vndcMode 그대로 넘기기
  exmnNo: string                // 연번 (필수)
  vhclNo: string
  brno: string
  vonrNm: string
  vndcDmndCn?: string           // 소명요청내용 (부모에서 내려줌)
  onClose: () => void
  onReload?: () => void
  endpoints?: {
    update: string              // 엔드포인트
    delete: string
  }
}

const DEFAULT_ENDPOINTS = {
  update: '/ilp/vd/cm/updateVndcReq',
  delete: '/ilp/vd/cm/delVndcReq',
}

const headerCellSx = {
  px: 2,
  py: 1.25,
  fontWeight: 600,
  bgcolor: 'action.hover',
  borderRadius: '4px',
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
} as const

const VndcDmndModal: React.FC<Props> = ({
  open,
  mode,
  exmnNo,
  vhclNo,
  brno,
  vonrNm,
  vndcDmndCn,
  onClose,
  onReload,
  endpoints = DEFAULT_ENDPOINTS,
}) => {
  // 안전 폴백: 혹시 다른 값이 들어와도 UPDATE로 처리
  const currentMode: OpenType = mode === 'DELETE' ? 'DELETE' : 'UPDATE'
  const readOnly = currentMode === 'DELETE'
  const titleSuffix = currentMode === 'UPDATE' ? '수정' : '삭제'

  const [content, setContent] = useState<string>(vndcDmndCn ?? '')
  const [loading, setLoading] = useState(false)

  // 부모 프롭 기반으로 동기화
  useEffect(() => {
    if (open) setContent(vndcDmndCn ?? '')
  }, [open, vndcDmndCn])

  const validate = () => {
    if (!exmnNo?.trim()) return alert('연번이 없습니다.'), false
    if (currentMode === 'UPDATE' && !content?.trim())
      return alert('소명요청내용을 입력해 주세요.'), false
    return true
  }

  // 저장(UPDATE)
  const handleSave = async () => {
    if (!validate()) return
    if (!confirm('수정 하시겠습니까?')) return
    setLoading(true)
    try {
      const payload = { exmnNo, vndcDmndCn: content }
      const res = await sendHttpRequest('PUT', endpoints.update, payload, true, { cache: 'no-store' })
      if (res?.resultType === 'success') {
        alert('수정 되었습니다.')
        onReload?.()
        onClose()
      } else {
        alert(res?.message || '처리 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('요청 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 삭제(DELETE) → delYn: 'Y' 로 업데이트
  const handleSoftDelete = async () => {
    if (!exmnNo?.trim()) return alert('연번이 없습니다.')
    if (!confirm('삭제 처리 하시겠습니까?')) return
    setLoading(true)
    try {
      const payload = { exmnNo, delYn: 'Y' }
      const res = await sendHttpRequest('PUT', endpoints.delete, payload, true, { cache: 'no-store' })
      if (res?.resultType === 'success') {
        alert('삭제 처리 되었습니다.')
        onReload?.()
        onClose()
      } else {
        alert(res?.message || '삭제 처리 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('요청 처리 중 오류가 발생했습니다.')
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
            <h2>
              소명요청 <span>{titleSuffix}</span>
            </h2>
          </CustomFormLabel>
          <div className="button-right-align">
            {currentMode === 'UPDATE' && (
              <Button variant="contained" color="primary" onClick={handleSave}>
                저장
              </Button>
            )}
            <Button variant="contained" color="error" onClick={handleSoftDelete}>
              삭제
            </Button>
            <Button variant="contained" color="dark" onClick={onClose}>
              닫기
            </Button>
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
            <LeftCell isRequire title="소명요청내용" />
            <RightCell colSpan={3}>
              <label htmlFor="vndcDmndCn" className="sr-only"></label>
              {readOnly ? (
                <CustomTextArea>{content}</CustomTextArea>
              ) : (
                <textarea
                  className="MuiTextArea-custom"
                  id="vndcDmndCn"
                  name="vndcDmndCn"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={18}
                />
              )}
            </RightCell>
          </TableRow>
        </BoardContainer>

        {loading && <LoadingBackdrop open={loading} />}
      </DialogContent>
    </Dialog>
  )
}

export default VndcDmndModal
