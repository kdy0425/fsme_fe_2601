/* React */
import React, { ReactNode, useState } from 'react'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomTextField, CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import TableDataGrid from '@/app/components/tables/CommDataGrid2'

/* 공통js */
import { sendSingleMultipartFormDataRequest } from '@/utils/fsms/common/apiUtils'
import { getJwtToken } from '@/utils/fsms/fsm/utils-imports'
import _ from 'lodash'

/* redux-toolkit */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '@/store/store'
import { handleRateModal, handleSetList } from '@/store/popup/PrdvMngSlice'

/* prdvJs */
import { isSumLocgovCd, excelPrecision } from '../prdvJs'

/* type */
import { supPmHcfhNeedRateHC } from '@/utils/fsms/headCells'

type ErrorKey = 'locgovNm' | 'totHcfhGiveExpcAmt' | 'bsHcfhGiveExpcAmt' | 'txHcfhGiveExpcAmt' | 'trHcfhGiveExpcAmt'

type Row = {
  locgovCd: string
  locgovNm: string
  totHcfhGiveExpcAmt: string
  bsHcfhGiveExpcAmt: string
  txHcfhGiveExpcAmt: string
  trHcfhGiveExpcAmt: string
  dbHcfhNeedRate: string
  hcfhNeedRate: string
  backgroundColor: string
  /* 에러 플래그 */
  locgovNmErr: boolean
  totHcfhGiveExpcAmtErr: boolean
  bsHcfhGiveExpcAmtErr: boolean
  txHcfhGiveExpcAmtErr: boolean
  trHcfhGiveExpcAmtErr: boolean
  /* 태그 */
  locgovNmTag: ReactNode
  totHcfhGiveExpcAmtTag: ReactNode
  bsHcfhGiveExpcAmtTag: ReactNode
  txHcfhGiveExpcAmtTag: ReactNode
  trHcfhGiveExpcAmtTag: ReactNode
}

const HcfhNeedRateModal = () => {

  // redux-toolkit
  const { hcfhNeedRateOpen } = useSelector((state: AppState) => state.PrdvMng)
  const dispatch = useDispatch()

  const [uploadedFiles, setUploadedFiles] = useState<File>() // 첨부된 파일 상태
  const [loadingBackdrop, setLoadingBackdrop] = useState<boolean>(false) // 저장시 로딩상태
  const [errorRows, setErrorRows] = useState<Row[]>([]) // 에러로우 타입
  const [size, setSize] = useState<'sm' | 'lg'>('sm') // 모달사이즈
  const [isShow, setIsShow] = useState<boolean>(false)

  // 모달 close
  const handleClose = (): void => {
    dispatch(handleRateModal({ name: 'hcfhNeedRateOpen', open: false }))
  }

  // 샘플파일 다운로드
  const getHcfhNeedRateSample = async (): Promise<void> => {

    try {

      setLoadingBackdrop(true)

      const method = 'GET'
      const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data', ...{ cache: 'no-store' } }
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`

      const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}/fsm/sup/pm/cm/getHcfhNeedRateSample`
      const options: RequestInit = { method, headers }

      // 엑셀파일 다운로드 정보
      const response = await fetch(endpoint, options)
      const responseData = await response.blob()
      const url = window.URL.createObjectURL(new Blob([responseData]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '향후 요구율 등록 샘플.xlsx')
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      console.error('엑셀파일 다운로드 실패 : ', error)
    } finally {
      close()
      setLoadingBackdrop(false)
    }
  }

  // 엑셀 업로드
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

    const files = event.target.files

    if (files) {

      const fileArray = Array.from(files)
      const fineName = fileArray[0].name
      const extension = fineName.substring(fineName.lastIndexOf('.'))

      if (fileArray.length > 1) {
        alert('첨부파일은 1개까지만 등록 가능합니다.')
        return
      }

      if (extension !== '.xlsx') {
        alert('첨부파일은 확장자 .xlsx만 업로드 가능합니다')
        return
      }

      setUploadedFiles(fileArray[0])
    }

    // 파일 선택 후 input 값 리셋
    event.target.value = ''
    // error 리스트 초기화
    setErrorRows([])
    setIsShow(false)
    setSize('sm')
  }

  // 등록
  const handleSelect = async (): Promise<void> => {

    if (!uploadedFiles) {
      alert('파일을 등록해 주세요.')
      return
    }

    try {

      setLoadingBackdrop(true)

      const endpoint = '/fsm/sup/pm/cm/exelFileToHcfhNeedRateList'
      const response = await sendSingleMultipartFormDataRequest('POST', endpoint, {}, uploadedFiles ?? undefined, true)

      if (response && response.resultType === 'success' && response.data.length) {
        const temp: Row[] = _.cloneDeep(response.data)
        // 업로드한 엑셀데이터중 셀 값 검증이 실패한 로우가 있는경우 Grid로 해당 셀 빨갛게 표시
        let isErr = false
        for (const item of temp) {
          isErr = item.locgovNmErr || item.totHcfhGiveExpcAmtErr || item.bsHcfhGiveExpcAmtErr || item.txHcfhGiveExpcAmtErr || item.trHcfhGiveExpcAmtErr
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
    } catch (error) {
      alert('파일 업로드 중 오류가 발생했습니다.')
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 에러 리스트 처리
  const handleError = (row: Row[]): void => {
    row.map(item => handleErrorRow(item))
    setErrorRows(row)
    setIsShow(true)
    setSize('lg')
    let msg = '업로드한 엑셀파일의 값 중 잘못된 값이 존재하여 등록 불가능합니다.\n\n'
    msg += '[불가사유]\n'
    msg += '1. 시군별 행 셀의 값 또는 순서를 수정한 경우\n'
    msg += '2. 각 소요예상액 행 셀의 값이 빈 값 또는 정수가 아닌경우\n'
    msg += '3. 각 소요예상액 행 셀의 서식이 숫자가 아닌경우\n\n'
    msg += '잘못된 값은 하단 그리드의 빨간색으로 표기된 부분을 통해 확인 가능합니다.'
    alert(msg)
  }

  // 에러로우 값 세팅
  const handleErrorRow = (item: Row): Row => {
    const itemArr: ErrorKey[] = ['locgovNm', 'totHcfhGiveExpcAmt', 'bsHcfhGiveExpcAmt', 'txHcfhGiveExpcAmt', 'trHcfhGiveExpcAmt']
    itemArr.forEach(v => {
      const color = item[`${v}Err`] ? '#f44336' : '#000'
      item[`${v}Tag`] = <Box color={color}>{item[`${v}`]}</Box>
      if (isSumLocgovCd(item.locgovCd)) {
        item.backgroundColor = 'lightgrey'
      }
    })
    return item
  }

  // 셀 검증에 모두 성공시
  const handleConfirm = (row: Row[]): void => {
    // 누계 집행액
    const total = Number(row[0].totHcfhGiveExpcAmt)
    row.map(item => {
      // 비율 계산
      const rate = Number(item.totHcfhGiveExpcAmt) / total
      item.dbHcfhNeedRate = excelPrecision(rate)
      item.hcfhNeedRate = (rate * 100).toFixed(2)
      if (isSumLocgovCd(item.locgovCd)) {
        item.backgroundColor = 'lightgrey'
      }
    })
    dispatch(handleSetList({ name: 'hcfhNeedRateList', list: row }))
    handleClose()
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={size}
        open={hcfhNeedRateOpen}
      >
        <DialogContent>
          <Box className='table-bottom-button-group'>
            <CustomFormLabel className='input-label-display'>
              <h2 className='popup-title'>
                향후 요구율 등록
              </h2>
            </CustomFormLabel>
            <div className='button-right-align'>
              <Button
                variant='contained'
                color='success'
                onClick={getHcfhNeedRateSample}
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
                  multiple
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSelect}
              >
                등록
              </Button>
              <Button
                variant='contained'
                color='dark'
                onClick={handleClose}
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
                  htmlFor='sch-file'
                  required
                >
                  파일명
                </CustomFormLabel>
                <CustomTextField
                  id='sch-file'
                  fullWidth
                  value={uploadedFiles?.name}
                  inputProps={{
                    readOnly: true
                  }}
                  readOnly
                />
              </div>
            </div>
          </Box>

          {/* 테이블영역 시작 */}
          {isShow && (
            <Box mt={2}>
              <TableDataGrid
                headCells={supPmHcfhNeedRateHC}
                rows={errorRows}
                loading={false}
                caption={'최근4년 집행실적 조회 목록'}
              />
            </Box>
          )}

          {/* 로딩 */}
          {loadingBackdrop && (
            <LoadingBackdrop open={loadingBackdrop} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default HcfhNeedRateModal