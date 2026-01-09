'use client'
import React, { useState, useEffect, ReactNode } from 'react'
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { sendHttpRequest, sendSingleMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'
import { getJwtToken } from '@/utils/fsms/fsm/utils-imports'
import { prdvDtUploadHc } from '@/utils/fsms/headCells'
import { getFormatToday_yyyymm } from '@/utils/fsms/common/dateUtils'
import _ from 'lodash'

export interface CreateModalProps {
  onClose: () => void
  reload: () => void
}

type ErrorKey = 'prdvRt' | 'rmtAmt'

export interface DetailRow {
  locgovCd: string
  locgovNm: string
  prdvRt: string
  rmtAmt: string
  backgroundColor: string
  /* 에러 플래그 */
  prdvRtErr: boolean
  rmtAmtErr: boolean
  /* 태그 */
  prdvRtTag: ReactNode
  rmtAmtTag: ReactNode
}

// 합계 지자체인지 판별
export const isSumLocgovCd = (locgovCd: string): boolean => {
  const lastCd = locgovCd.substring(2, 5)
  return lastCd === '000' ? true : false
}

// 리스트에 배경색 설정
export const setBackgroundColor = (rows: any[]): any[] => {
  return rows.map(item => {
    if (isSumLocgovCd(item.locgovCd)) {
      return {
        ...item,
        backgroundColor: 'lightgrey'
      }
    }
    return item
  })
}

const formatNumber = (value: string | number): string => {
  if (!value) return ''
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
  if (isNaN(num)) return String(value)
  return num.toLocaleString('ko-KR')
}

const CreateModal = ({ onClose, reload }: CreateModalProps) => {
  
  const [loading, setLoading] = useState(false)
  const [tableRows, setTableRows] = useState<DetailRow[]>([])
  const [size, setSize] = useState<'sm' | 'lg'>('sm')
  const [isShow, setIsShow] = useState<boolean>(false)

  const [form, setForm] = useState({
    crtrYm: '',
  })

  // 화면 접속 시 기준일자 이번달로 설정
  useEffect(() => {
    const crtrYm = getFormatToday_yyyymm()
    setForm(prev => ({ ...prev, crtrYm }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // 샘플파일 다운로드
  const handleSampleDownload = async (): Promise<void> => {
    try {
      setLoading(true)

      const method = 'GET'
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'cache': 'no-store'
      }
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`

      const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}/fsm/sup/prdv/getRmtAmtSample`
      const options: RequestInit = { method, headers }

      const response = await fetch(endpoint, options)
      const responseData = await response.blob()
      const url = window.URL.createObjectURL(new Blob([responseData]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '집행정보등록 샘플.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('샘플파일 다운로드 실패 : ', error)
      alert('샘플파일 다운로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 엑셀 업로드 - 파일 선택 시
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files

    if (files) {
      const fileArray = Array.from(files)
      const fileName = fileArray[0].name
      const extension = fileName.substring(fileName.lastIndexOf('.'))

      if (fileArray.length > 1) {
        alert('첨부파일은 1개까지만 등록 가능합니다.')
        return
      }

      if (extension !== '.xlsx') {
        alert('첨부파일은 확장자 .xlsx만 업로드 가능합니다')
        return
      }

      // 파일 선택 후 자동으로 업로드 처리
      handleFileUpload(fileArray[0])
    }

    // 파일 선택 후 input 값 리셋
    event.target.value = ''
    // error 리스트 초기화
    setTableRows([])
    setIsShow(false)
    setSize('sm')
  }

  // 엑셀 업로드 - 데이터 화면에 표시
  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      setLoading(true)

      const endpoint = '/fsm/sup/prdv/excelFileToRmtAmtList'
      const response = await sendSingleMultipartFormDataRequest(
        'POST',
        endpoint,
        {},
        file,
        true
      )

      if (response && response.resultType === 'success' && response.data.length) {
        const temp: DetailRow[] = _.cloneDeep(response.data)
        
        // 업로드한 엑셀데이터중 셀 값 검증이 실패한 로우가 있는경우
        let isErr = false
        for (const item of temp) {
          isErr = item.prdvRtErr || item.rmtAmtErr
          if (isErr) {
            break
          }
        }
        
        // 에러여부에 따라 후 처리
        if (isErr) {
          handleError(temp)
        } else {
          handleConfirm(temp)
        }
      } else {
        alert('등록할 내역이 없거나, 등록에 실패했습니다.\n다시 시도해 주세요.')
      }
    } catch (error: any) {
      alert('파일 업로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 에러 리스트 처리
  const handleError = (row: DetailRow[]): void => {
    row.map(item => handleErrorRow(item))
    setTableRows(row)
    setIsShow(true)
    setSize('lg')
    let msg = '업로드한 엑셀파일의 값 중 잘못된 값이 존재하여 등록 불가능합니다.\n\n'
    msg += '[불가사유]\n'
    msg += '1. 시군별 행 셀의 값 또는 순서를 수정한 경우\n'
    msg += '2. 안분율이 빈 값인 경우\n'
    msg += '3. 안분액이 빈 값 또는 정수가 아닌 경우\n'
    msg += '4. 각 셀의 서식이 숫자가 아닌 경우'
    alert(msg)
  }

  // 에러로우 값 세팅
  const handleErrorRow = (item: DetailRow): DetailRow => {
    const itemArr: ErrorKey[] = ['prdvRt', 'rmtAmt']
    itemArr.forEach(v => {
      const color = item[`${v}Err`] ? '#f44336' : '#000'
      const displayValue = v === 'rmtAmt' && !item[`${v}Err`]
        ? formatNumber(item[v])  // ✅ 안분액 쉼표 포맷
        : item[v]
      item[`${v}Tag`] = <Box color={color}>{displayValue}</Box>
    })
    if (isSumLocgovCd(item.locgovCd)) {
      item.backgroundColor = 'lightgrey'
    }
    return item
  }

  // 셀 검증에 모두 성공시
  const handleConfirm = (row: DetailRow[]): void => {
    row.map(item => {
      item.prdvRtTag = <Box>{item.prdvRt}</Box>
      item.rmtAmtTag = <Box>{formatNumber(item.rmtAmt)}</Box>
      if (isSumLocgovCd(item.locgovCd)) {
        item.backgroundColor = 'lightgrey'
      }
    })
    setTableRows(row)
    setIsShow(true)
    setSize('lg')
  }

  // 저장 (화면에 표시된 데이터를 JSON으로 전송)
  const handleSubmit = async () => {
    if (!form.crtrYm) {
      alert('기준년월을 입력해주세요.')
      return
    }

    if (!tableRows.length) {
      alert('업로드된 엑셀 파일이 없습니다.')
      return
    }

    // 에러가 있는지 확인
    const hasError = tableRows.some(row => row.prdvRtErr || row.rmtAmtErr)
    if (hasError) {
      alert('엑셀 데이터에 오류가 있습니다.\n빨간색으로 표시된 셀을 확인해주세요.')
      return
    }

    if (!confirm('등록 하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)

      const body = {
        crtrYm: form.crtrYm.replace(/-/g, ''),
        saveList: tableRows
      }

      const endpoint = '/fsm/sup/prdv/saveData'
      const response = await sendHttpRequest('POST', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response.resultType === 'success') {
        alert('등록되었습니다.')
        reload()
        onClose()
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert('등록 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth={size}
      open={true}
      onClose={onClose}
    >
      <DialogContent>
        <Box className='table-bottom-button-group'>
          <CustomFormLabel className='input-label-display'>
            <h2 className='popup-title'>
              집행정보등록
            </h2>
          </CustomFormLabel>
          <div className='button-right-align'>
            <Button
              variant='contained'
              color='success'
              onClick={handleSampleDownload}
            >
              샘플파일 다운로드
            </Button>
            <Button
              variant='contained'
              color='success'
              component='label'
            >
              엑셀 업로드
              <input
                type='file'
                id='files'
                name='files'
                onChange={handleFileChange}
                hidden
              />
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={handleSubmit}
            >
              저장
            </Button>
            <Button
              variant='contained'
              color='dark'
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </Box>

        <Box className='sch-filter-box'>
          <div className='filter-form'>
            <div className='form-group'>
              <CustomFormLabel
                className='input-label-display'
                required
              >
                기간
              </CustomFormLabel>
              <CustomTextField
                type='month'
                name='crtrYm'
                value={form.crtrYm}
                onChange={handleChange}
                fullWidth
              />
            </div>
          </div>
        </Box>

        {/* 테이블영역 시작 */}
        {isShow && tableRows.length > 0 && (
          <Box mt={3}>
            <TableDataGrid
              headCells={prdvDtUploadHc}
              rows={tableRows}
              loading={false}
              caption='집행정보등록 내역'
            />
          </Box>
        )}

        {/* 로딩 */}
        {loading && (
          <LoadingBackdrop open={loading} />
        )}

      </DialogContent>
    </Dialog>
  )
}

export default CreateModal