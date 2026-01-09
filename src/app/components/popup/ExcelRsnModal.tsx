/* react */
import { useState, useEffect } from 'react'

/* next */
import { usePathname } from 'next/navigation'

/* mui component */
import { Box, Button, Dialog, DialogContent } from '@mui/material'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import { CommSelect } from '@/app/components/tx/commSelect/CommSelect'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { getJwtToken, sendHttpRequest } from '@/utils/fsms/fsm/utils-imports'
import { getUserInfo } from '@/utils/fsms/utils'

/* type */
import { excelRsnModalInfoType } from '@/app/app'

type prosType = {
  open: boolean
  close: () => void
  excelRsnModalInfo: excelRsnModalInfoType
}

type paramsType = {
  inqRsnCd: string
  inqRsnCn: string
}

const ExcelRsnModal = (props: prosType) => {

  const { open, close, excelRsnModalInfo } = props

  const mode = excelRsnModalInfo.mode ?? 'server' // server/client 모드 결정 (기본은 server로 처리)
  const pathname = usePathname()
  const userInfo = getUserInfo()

  const [params, setParams] = useState<paramsType>({ inqRsnCd: '', inqRsnCn: '' })
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [show, setShow] = useState<boolean>(false)
  const [methNm, setMethNm] = useState<string>('')
  const [inqNocs, setInqNocs] = useState<number>()
  const [RESPONSE, setRESPONSE] = useState<Response>()

  useEffect(() => {
    if (open) {
      if (mode === 'client' && excelRsnModalInfo.onConfirm) {
        clientMode()
      } else {
        serverMode()
      }
    }
  }, [open])

  // 클라이언트 처리
  const clientMode = (): void => {    
    if (excelRsnModalInfo.privacyObj) {
      // 개인정보 포함인 경우, 사유저장용 기본값 세팅      
      setInqNocs(1)  // 건수
      // 개인정보가 포함일경우 사유작성
      setShow(true)
    } else {
      // 개인정보가 미포함일경우 콜백 호출
      clientModeCallBack()
    }
  }

  // 클라이언트 콜백
  const clientModeCallBack = (): void => {
    try {
      setLoadingBackdrop(true)
      // 필요하면 사유만 넘기고, 목적코드도 같이 쓰고 싶으면 params 전체 넘겨도 됨
      excelRsnModalInfo.onConfirm?.(params.inqRsnCn)
    } catch (error) {
      console.error('클라이언트 엑셀 처리 실패 : ', error)
    } finally {
      setLoadingBackdrop(false)
      close()
    }
  }

  // 서버용 처리(엑셀 다운로드 파일 및 정보를 가져옴)
  const serverMode = async (): Promise<void> => {
    
    try {

      setLoadingBackdrop(true)
      const method = 'GET'
      const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data', ...{ cache: 'no-store' } }
      const jwtToken = await getJwtToken()
      headers['Authorization'] = `Bearer ${jwtToken}`

      const endpoint = `${process.env.NEXT_PUBLIC_API_DOMAIN}${excelRsnModalInfo.endpoint}`
      const options: RequestInit = { method, headers }

      // 엑셀파일 다운로드 정보
      const response = await fetch(endpoint, options)

      const tempMethNm = response.headers.get('prgrmNm') ?? '' // T_EXCEL_FORM 의 엑셀 구분값
      let tempInqNocs: number = Number(response.headers.get('listSize'))
      tempInqNocs = isNaN(tempInqNocs) ? 0 : tempInqNocs // 개인정보 조회 갯수
      const privacyYN = response.headers.get('privacyYN') ?? 'N' // 개인정보 포함여부

      // T_EXCEL_FORM 의 엑셀 구분값 없을경우
      if (!tempMethNm.trim()) {
        throw new Error()
      }

      setMethNm(tempMethNm)
      setInqNocs(tempInqNocs)
      setRESPONSE(response)
      
      if (privacyYN === 'Y') {
        setShow(true)
      } else {
        serverModeCallBack(response)
      }
    } catch (error) {
      alert('엑셀다운로드 정보 조회 실패 하였습니다.')
      close()
      console.error('엑셀다운로드 정보 조회 실패', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  // 서버용 콜백
  const serverModeCallBack = async (response?: Response): Promise<void> => {
    
    try {

      if (!response) {
        throw new Error()
      }

      setLoadingBackdrop(true)

      const responseData = await response.blob()
      const url = window.URL.createObjectURL(new Blob([responseData]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', excelRsnModalInfo.name)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      alert('엑셀파일 다운로드 실패 하였습니다.')
      console.error('엑셀파일 다운로드 실패', error)
    } finally {
      close()
      setLoadingBackdrop(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const save = async (): Promise<void> => {

    if (!params.inqRsnCd) {
      alert('자료 요청 목적을 선택해 주세요.')
      return
    }

    if (!params.inqRsnCn.trim()) {
      alert('자료 요청 사유를 입력해 주세요.')
      return
    }

    if (!confirm('자료 요청 목적을 저장하시겠습니까?')) {
      return
    }

    let flag = false

    try {
      // 사유저장
      flag = await saveExcelDwnldRsn()
    } catch (error) {
      alert('자료 요청 저장에 실패했습니다.')
      console.error('자료 요청 저장에 실패', error)
      close()
    }

    if (flag) {
      // 사유저장 성공시 콜백 호출    
      if (mode === 'client') {
        clientModeCallBack()
      } else {
        serverModeCallBack(RESPONSE)
      }
    }    
  }

  // 사유저장
  const saveExcelDwnldRsn = async (): Promise<boolean> => {

    const endPoint = '/fsm/sup/iidm/cm/createExcelIndvInfoDownloadMng'
    const body = {
      urlAddr: pathname,
      methNm: methNm,
      locgovCd: userInfo.locgovCd,
      inqNocs: inqNocs,
      inqRsnCd: params.inqRsnCd,
      inqRsnCn: params.inqRsnCn,
      privacyObj: mode === 'client' ? excelRsnModalInfo.privacyObj : null
    }

    const response = await sendHttpRequest('POST', endPoint, body, true, { cache: 'no-store' })    
    if (!(response && response.resultType === 'success')) {
      console.error('response 오류', response)
      throw new Error()
    } else {
      return true
    }
  }

  return (
    <Box>
      {show && (
        <Dialog
          fullWidth={true}
          maxWidth={'sm'}
          open={open}
        >
          <DialogContent>
            <Box className='table-bottom-button-group'>
              <CustomFormLabel className='input-label-display'>
                <h2>자료 요청 목적</h2>
              </CustomFormLabel>
              <div className=' button-right-align'>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={save}
                >
                  확인
                </Button>
                <Button
                  variant='contained'
                  color='dark'
                  onClick={close}
                >
                  닫기
                </Button>
              </div>
            </Box>

            <div id='alert-dialog-description1'>
              <div className='table-scrollable'>
                <table className='table table-bordered'>
                  <caption>자료 요청 목적</caption>
                  <colgroup>
                    <col style={{ width: '25%' }}></col>
                    <col style={{ width: '75%' }}></col>
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className='td-head' scope='row'>
                        요청 목적
                      </th>
                      <td>
                        <div className='form-group' style={{ width: '100%' }}>
                          <CustomFormLabel
                            className='input-label-none'
                            htmlFor='sch-inqRsnCd'
                          >
                            탈락유형
                          </CustomFormLabel>
                          <CommSelect
                            cdGroupNm='230'
                            pValue={params.inqRsnCd}
                            handleChange={handleSearchChange}
                            pName='inqRsnCd'
                            htmlFor={'sch-inqRsnCd'}
                            addText='- 선택 -'
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className='td-head' scope='row'>
                        요청 사유
                      </th>
                      <td>
                        <CustomFormLabel
                          className='input-label-none'
                          htmlFor='ft-inqRsnCn'
                        >
                          요청 사유
                        </CustomFormLabel>
                        <CustomTextField
                          id='ft-inqRsnCn'
                          fullWidth
                          name='inqRsnCn'
                          value={params.inqRsnCn}
                          onChange={handleSearchChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* 로딩 */}
      <LoadingBackdrop open={loadingBackdrop} />
    </Box>
  )
}

export default ExcelRsnModal