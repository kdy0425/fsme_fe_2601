import { useDispatch, useSelector } from '@/store/hooks'
import {
  clearAdmdspNotieInfo,
  closeAdmdspNotieModal,
} from '@/store/popup/AdmdspNotieSlice'
import { AppState } from '@/store/store'
import {
  Box,
  Dialog,
  DialogContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import {
  getDateCustomFormatYMD,
  getDateFormatYMDKor,
} from '@/utils/fsms/common/dateUtils'
import { getToday, openReport } from '@/utils/fsms/common/comm'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import { usePathname } from 'next/navigation'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { setIsdSearchTrue } from '@/store/page/IsdSlice'
import { callRefetch } from '@/types/fsms/common/ilgData'

type params = {
  [key: string]: string
}

const AdmdspNotieModal = () => {
  const pathname = usePathname()
  const pageUrl = pathname.split('/')[2]

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [params, setParams] = useState<params>({
    exmnNo: '',
    admdspNotieVhclNo: '', //행정처분통지서차량번호
    admdspNotieVonrNm: '', //행정처분통지서소유자명
    admdspNotieDspsTtl: '', //행정처분통지서처분제목
    admdspNotieAddr: '', //행정처분통지서주소
    admdspNotieDspsRsnCn: '', //행정처분통지서처분사유내용
    admdspNotieLglBssCn: '', //행정처분통지서법적근거내용
    admdspNotieClmProcssCn: '', //행정처분통지서청구절차내용
    admdspNotieClmPrdCn: '', //행정처분통지서청구기간내용
    admdspNotieDspsDt: '', //행정처분통지서처분일자
    admdspNotieMdfcnYmd: '', //행정처분통지서수정일자
    admdspNotieRgnMayerNm: '', //행정처분통지서지역시장명
    admdspNotieAdmdspSeNm: '', //행정처분통지서처분내용
  })

  const validationInfo: params = {
    admdspNotieDspsTtl: '처분제목',
    admdspNotieAddr: '주소',
    admdspNotieDspsRsnCn: '처분이유',
    admdspNotieLglBssCn: '법적근거',
    admdspNotieClmProcssCn: '처분절차',
    admdspNotieClmPrdCn: '청구기간',
    admdspNotieRgnMayerNm: '지역시장명',
  }

  const admdspNotieInfo = useSelector(
    (state: AppState) => state.AdmdspNotieInfo,
  )
  const today = getToday()
  const dispatch = useDispatch()

  useEffect(() => {
    if (admdspNotieInfo.ANModalOpen) {
      setInitialState()
    }
  }, [admdspNotieInfo.ANModalOpen])

  const setInitialState = () => {
    const {
      bfdnDspsTtlAN,
      bfdnAddrAN,
      bfdnDspsRsnCnAN,
      bfdnLglBssCnAN,
      admdspNotieDspsTtlAN,
      admdspNotieAddrAN,
      admdspNotieDspsRsnCnAN,
      admdspNotieLglBssCnAN,
      admdspNotieClmPrdCnAN,
      admdspNotieMdfcnYmdAN,
      admdspNotieClmProcssCnAN,
      admdspNotieRgnMayerNmAN,
      vonrNmAN,
      admdspSeNmAN,
      vhclNoAN,
      dspsDtAN,
      exmnNoAN,
    } = admdspNotieInfo

    if (!admdspNotieMdfcnYmdAN) {
      setParams((prev) => ({
        ...prev,
        admdspNotieMdfcnYmd: today,
      }))
    } else if (!!admdspNotieMdfcnYmdAN && admdspNotieMdfcnYmdAN != today) {
      if (
        confirm(
          '작성된 통지서가 있습니다. 통지서 작성날짜를 오늘로 변경하시겠습니까?',
        )
      ) {
        setParams((prev) => ({
          ...prev,
          admdspNotieMdfcnYmd: today,
        }))
      } else {
        setParams((prev) => ({
          ...prev,
          admdspNotieMdfcnYmd: admdspNotieMdfcnYmdAN,
        }))
      }
    }

    setParams((prev) => ({
      ...prev,
      exmnNo: exmnNoAN,
      admdspNotieDspsDt: dspsDtAN,
      admdspNotieVhclNo: vhclNoAN,
      admdspNotieVonrNm: vonrNmAN,
      admdspNotieAdmdspSeNm: admdspSeNmAN,
      ...(bfdnDspsTtlAN
        ? { admdspNotieDspsTtl: bfdnDspsTtlAN }
        : { admdspNotieDspsTtl: admdspNotieDspsTtlAN }),
      ...(bfdnAddrAN
        ? { admdspNotieAddr: bfdnAddrAN }
        : { admdspNotieAddr: admdspNotieAddrAN }),
      ...(bfdnDspsRsnCnAN
        ? { admdspNotieDspsRsnCn: bfdnDspsRsnCnAN.replaceAll(/\n/g, '').replaceAll(/\t/g, '') }
        : { admdspNotieDspsRsnCn: admdspNotieDspsRsnCnAN.replaceAll(/\n/g, '').replaceAll(/\t/g, '') }),
      ...(bfdnLglBssCnAN
        ? { admdspNotieLglBssCn: bfdnLglBssCnAN }
        : { admdspNotieLglBssCn: admdspNotieLglBssCnAN }),
      ...(!admdspNotieClmPrdCnAN
        ? {
            admdspNotieClmPrdCn: `행정심판의 청구는 처분이 있음을 안 날로부터 90일 이내,
처분이 있은 날로부터 180일 이내로 하여야 하고,
행정소송의 제기는 처분이 있음을 안 날로부터 90일 이내,
처분이 있은 날로부터 1년 이내에 제기할 수 있습니다.`,
          }
        : { admdspNotieClmPrdCn: admdspNotieClmPrdCnAN }),
      ...(admdspNotieClmProcssCnAN
        ? { admdspNotieClmProcssCn: admdspNotieClmProcssCnAN }
        : { admdspNotieClmProcssCn: '' }),
      ...(admdspNotieRgnMayerNmAN
        ? { admdspNotieRgnMayerNm: admdspNotieRgnMayerNmAN }
        : { admdspNotieRgnMayerNm: '' }),
    }))
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleTextareaChange = (val:string) => {
    setParams((prev) => ({ ...prev, admdspNotieLglBssCn: val }))
  }

  const handleClickClose = () => {
    dispatch(clearAdmdspNotieInfo())
  }

  const makeReportString = () => {
    let paramObj = { ...params }
    const retObj = { admdspNotie: paramObj }
    return JSON.stringify(retObj)
  }

  const handlePrint = async () => {
    if (!validation()) return

    if (!confirm('통지서 출력을 위해 정보를 등록하시겠습니까?')) {
      return
    }

    try {
      setIsDataProcessing(true)
      let endpoint: string = `/fsm${pathname}/tr/createAdmdspNotie`
      const response = await sendHttpRequest('PUT', endpoint, params, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        openReport('admdspNotie', makeReportString())
        dispatch(clearAdmdspNotieInfo())
        if (pathname.indexOf('isd') > 0) {
          dispatch(setIsdSearchTrue())
        } else {
          callRefetch(pageUrl, dispatch)
        }
      } else {
        // 데이터가 없거나 실패
        alert(response.message)
        return
      }
    } catch (error) {
      alert(error)
      return
    } finally {
      setIsDataProcessing(false)
    }
  }

  const validation = () => {
    const keys = Object.keys(validationInfo)
    for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
      const key = keys[keyIdx]
      if (key === 'exmnNo') continue
      if (!params[`${key}`]) {
        alert(`${validationInfo[key]} 정보를 입력해주세요.`)
        return false
      }
    }
    return true
  }

  return (
    <Box>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={admdspNotieInfo.ANModalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return
          }
        }}
      >
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>행정처분 통지서</h2>
            </CustomFormLabel>
            <div className="button-right-align">
              <Button variant="contained" color="primary" onClick={handlePrint}>
                출력
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClickClose()}
              >
                닫기
              </Button>
            </div>
          </Box>

          <Box>
            <TableContainer>
              <Table className="table table-bordered">
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="td-head"
                      style={{ width: '20%' }}
                    >
                      처분의 제목
                    </TableCell>
                    <TableCell colSpan={6}>
                      <CustomTextField
                        type="text"
                        id="ft-admdspNotieDspsTtl"
                        name="admdspNotieDspsTtl"
                        value={params.admdspNotieDspsTtl || ''}
                        onChange={handleSearchChange}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell rowSpan={3} className="td-head">
                      당사자
                    </TableCell>
                    <TableCell className="td-head" style={{ width: '10%' }}>
                      성명
                    </TableCell>
                    <TableCell colSpan={6}>
                      {params.admdspNotieVonrNm}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="td-head">차량번호</TableCell>
                    <TableCell colSpan={6}>
                      {params.admdspNotieVhclNo}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="td-head">주소</TableCell>
                    <TableCell colSpan={6}>
                      <CustomTextField
                        type="text"
                        id="ft-admdspNotieAddr"
                        name="admdspNotieAddr"
                        value={params.admdspNotieAddr || ''}
                        onChange={handleSearchChange}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="td-head">
                      처 분 이 유
                    </TableCell>
                    <TableCell colSpan={6}>
                      <CustomTextField
                        type="text"
                        id="ft-admdspNotieDspsRsnCn"
                        name="admdspNotieDspsRsnCn"
                        value={params.admdspNotieDspsRsnCn || ''}
                        onChange={handleSearchChange}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="td-head">
                      처 분 내 용
                    </TableCell>
                    <TableCell colSpan={6}>
                      {params.admdspNotieAdmdspSeNm}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="td-head">
                      법 적 근 거
                    </TableCell>
                    <TableCell colSpan={6} height={'110px'}>
                      <CustomFormLabel className="input-label-none" htmlFor="ft-admdspNotieLglBssCn">법 적 근 거</CustomFormLabel>
                      <textarea
                        id="ft-admdspNotieLglBssCn"
                        name="admdspNotieLglBssCn"
                        value={params.admdspNotieLglBssCn || ''}
                        onChange={(e) => handleTextareaChange(e.target.value)}
                        className="MuiTextArea-custom"
                        style={{
                          height: '100%', width: '100%', resize: 'none'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="td-head">
                      처 분 일 자
                    </TableCell>
                    <TableCell colSpan={6}>
                      {getDateCustomFormatYMD(params.admdspNotieDspsDt, '.')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={8}>
                      이 행정처분에 대하여 이의가 있을 경우 행정심판법 제27조에
                      의거 행정심판을 청구하거나, 행정소송법 제 20조에 의거
                      행정소송을 제기할 수 있습니다.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="td-head">
                      처 분 절 차
                    </TableCell>
                    <TableCell
                      style={{ display: 'flex', alignItems: 'center' }}
                      colSpan={8}
                    >
                      행정심판의 청구는 처분청 또는{' '}
                      <span style={{ margin: '0px 5px' }}>
                        <CustomTextField
                          type="text"
                          id="ft-admdspNotieClmProcssCn"
                          name="admdspNotieClmProcssCn"
                          value={params.admdspNotieClmProcssCn || ''}
                          onChange={handleSearchChange}
                        />
                      </span>{' '}
                      에 하여야 하고,{'\n'}행정소송의 제기는 관할행정법원에
                      하여야 합니다.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="td-head">
                      청 구 기 간
                    </TableCell>
                    <TableCell colSpan={6} height={'110px'}>
                      <CustomFormLabel className="input-label-none" htmlFor='ft-admdspNotieClmPrdCn'>청 구 기 간간</CustomFormLabel>
                      <textarea
                        id="ft-admdspNotieClmPrdCn"
                        name="admdspNotieClmPrdCn"
                        value={params.admdspNotieClmPrdCn || ''}
                        onChange={(e) => handleTextareaChange(e.target.value)}
                        className="MuiTextArea-custom"
                        style={{
                          height: '100%', width: '100%', resize: 'none'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div
                        style={{
                          padding: '30px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            padding: '20px 0',
                            fontWeight: 'bold',
                            fontSize: '30px',
                          }}
                        >
                          {getDateFormatYMDKor(params.admdspNotieMdfcnYmd)}
                        </div>
                        <div>
                          <CustomTextField
                            type="text"
                            id="ft-admdspNotieRgnMayerNm"
                            name="admdspNotieRgnMayerNm"
                            value={params.admdspNotieRgnMayerNm || ''}
                            onChange={handleSearchChange}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
    </Box>
  )
}

export default AdmdspNotieModal
