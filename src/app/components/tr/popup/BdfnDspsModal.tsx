import { useDispatch, useSelector } from '@/store/hooks'
import {
  clearBfdnDspsTypeInfo,
  closeBfdnDspsModal,
} from '@/store/popup/BfdnDspsSlice'
import { AppState } from '@/store/store'
import {
  Button,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Dialog,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { getDateCustomFormatYMD, getToday } from '@/utils/fsms/common/dateUtils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { usePathname } from 'next/navigation'
import { LoadingBackdrop } from '../../loading/LoadingBackdrop'
import { openReport } from '@/utils/fsms/common/comm'
import { callRefetch } from '@/types/fsms/common/ilgData'

type params = {
  [key: string]: string
}

const BdfnDspsModal = () => {
  const pathname = usePathname()

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [params, setParams] = useState<params>({
    exmnNo: '',
    bfdnDspsTtl: '', //사전처분통지서처분제목
    bfdnVhclNo: '', //사전처분통지서차량정보
    bfdnVonrNm: '', //사전처분통지서 수신자정보
    bfdnAddr: '', //사전처분통지서주소
    bfdnDspsRsnCn: '', //사전처분통지서처분사유내용
    bfdnDspsCn: '', //사전처분통지서처분내용
    bfdnLglBssCn: '', //사전처분통지서법적근거내용
    bfdnSbmsnOfficInstNm: '', //사전처분통지서제출처기관명
    bfdnSbmsnOfficDeptNm: '', //사전처분통지서제출처부서명
    bfdnSbmsnOfficPicNm: '', //사전처분통지서제출처담당자명
    bfdnSbmsnOfficAddr: '', //사전처분통지서제출처주소
    bfdnSbmsnOfficTelno: '', //사전처분통지서제출처전화번호
    bfdnSbmsnOfficFxno: '', //사전처분통지서제출처팩스번호
    bfdnSbmsnTermCn: '', //사전처분통지서제출기한내용
    bfdnRgnMayerNm: '', //사전처분통지서지역시장명
    bfdnMdfcnYmd: '', //사전처분통지서수정일자
  })

  const validationInfo: params = {
    bfdnDspsTtl: '처분의 제목',
    bfdnVhclNo: '차량정보',
    bfdnVonrNm: '수신자정보',
    bfdnAddr: '주소',
    bfdnDspsRsnCn: '처분의 원인이 되는 사실',
    bfdnDspsCn: '처분하고자 하는 내용',
    bfdnLglBssCn: '법적근거 및 조문내용',
    bfdnSbmsnOfficInstNm: '제출처기관명',
    bfdnSbmsnOfficDeptNm: '제출처부서명',
    bfdnSbmsnOfficPicNm: '제출처담당자명',
    bfdnSbmsnOfficAddr: '제출처주소',
    bfdnSbmsnOfficTelno: '제출처전화번호',
    bfdnSbmsnOfficFxno: '제출처팩스번호',
    bfdnSbmsnTermCn: '제출기한내용',
    bfdnRgnMayerNm: '지역시장명',
    bfdnMdfcnYmd: '수정일자',
  }

  const bdfnDspsInfo = useSelector((state: AppState) => state.BfdnDspsInfo)
  const today = getToday()
  const dispatch = useDispatch()
  const pageUrl = pathname.split('/')[2]

  useEffect(() => {
    if (bdfnDspsInfo.BDModalOpen) {
      setInitialState()
    }
  }, [bdfnDspsInfo.BDModalOpen])

  const setInitialState = () => {
    // setParams(params)
    const {
      exmnNoBD,
      vhclNoBD,
      vonrNmBD,
      bfdnMdfcnYmdBD,
      bfdnDspsTtlBD,
      bfdnAddrBD,
      bfdnDspsRsnCnBD,
      bfdnDspsCnBD,
      bfdnLglBssCnBD,
      bfdnSbmsnOfficInstNmBD,
      bfdnSbmsnOfficDeptNmBD,
      bfdnSbmsnOfficPicNmBD,
      bfdnSbmsnOfficAddrBD,
      bfdnSbmsnOfficTelnoBD,
      bfdnSbmsnOfficFxnoBD,
      bfdnSbmsnTermCnBD,
      bfdnRgnMayerNmBD,
    } = bdfnDspsInfo

    let obj = {
      exmnNo: exmnNoBD,
      bfdnVhclNo: vhclNoBD,
      bfdnVonrNm: vonrNmBD,
    }

    if (!bfdnMdfcnYmdBD) {
      setParams((prev) => ({
        ...prev,
        ...obj,
        bfdnMdfcnYmd: today,
      }))
    } else {
      if (bfdnMdfcnYmdBD !== today) {
        if (
          confirm(
            '작성된 통지서가 있습니다. 통지서 작성날짜를 오늘로 변경하시겠습니까?',
          )
        ) {
          setParams((prev) => ({
            ...prev,
            ...obj,
            bfdnMdfcnYmd: today,
          }))
        } else {
          setParams((prev) => ({
            ...prev,
            ...obj,
            bfdnMdfcnYmd: bdfnDspsInfo.bfdnMdfcnYmdBD,
          }))
        }
      } else {
        setParams((prev) => ({
          ...prev,
          ...obj,
          bfdnMdfcnYmd: bdfnDspsInfo.bfdnMdfcnYmdBD,
        }))
      }
    }

    setParams((prev) => ({
      ...prev,
      ...(bfdnDspsTtlBD ? { bfdnDspsTtl: bfdnDspsTtlBD } : { bfdnDspsTtl: '' }),
      ...(bfdnAddrBD ? { bfdnAddr: bfdnAddrBD } : { bfdnAddr: '' }),
      ...(bfdnDspsRsnCnBD
        ? { bfdnDspsRsnCn: bfdnDspsRsnCnBD.replaceAll(/\n/g, '').replaceAll(/\t/g, '') }
        : { bfdnDspsRsnCn: '' }),
      ...(bfdnDspsCnBD ? { bfdnDspsCn: bfdnDspsCnBD } : { bfdnDspsCn: '' }),
      ...(bfdnLglBssCnBD
        ? { bfdnLglBssCn: bfdnLglBssCnBD.replaceAll(/\n/g, '').replaceAll(/\t/g, '') }
        : { bfdnLglBssCn: '' }),
      ...(bfdnSbmsnOfficInstNmBD
        ? { bfdnSbmsnOfficInstNm: bfdnSbmsnOfficInstNmBD }
        : { bfdnSbmsnOfficInstNm: '' }),
      ...(bfdnSbmsnOfficDeptNmBD
        ? { bfdnSbmsnOfficDeptNm: bfdnSbmsnOfficDeptNmBD }
        : { bfdnSbmsnOfficDeptNm: '' }),
      ...(bfdnSbmsnOfficPicNmBD
        ? { bfdnSbmsnOfficPicNm: bfdnSbmsnOfficPicNmBD }
        : { bfdnSbmsnOfficPicNm: '' }),
      ...(bfdnSbmsnOfficAddrBD
        ? { bfdnSbmsnOfficAddr: bfdnSbmsnOfficAddrBD }
        : { bfdnSbmsnOfficAddr: '' }),
      ...(bfdnSbmsnOfficTelnoBD
        ? { bfdnSbmsnOfficTelno: bfdnSbmsnOfficTelnoBD }
        : { bfdnSbmsnOfficTelno: '' }),
      ...(bfdnSbmsnOfficFxnoBD
        ? { bfdnSbmsnOfficFxno: bfdnSbmsnOfficFxnoBD }
        : { bfdnSbmsnOfficFxno: '' }),
      ...(bfdnSbmsnTermCnBD
        ? { bfdnSbmsnTermCn: bfdnSbmsnTermCnBD }
        : { bfdnSbmsnTermCn: '' }),
      ...(bfdnRgnMayerNmBD
        ? { bfdnRgnMayerNm: bfdnRgnMayerNmBD }
        : { bfdnRgnMayerNm: '' }),
    }))
  }

  const handleClickClose = () => {
    dispatch(closeBfdnDspsModal())
    dispatch(clearBfdnDspsTypeInfo())
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const makeReportString = () => {
    let paramObj = { ...params }
    const retObj = { bdfnDsps: paramObj }
    return JSON.stringify(retObj)
  }

  const handlePrint = async () => {
    if (!validation()) return

    if (!confirm('통지서 출력을 위해 정보를 등록하시겠습니까?')) {
      return
    }

    try {
      setIsDataProcessing(true)
      let endpoint: string = `/fsm${pathname}/tr/createBfdnDsps`
      const response = await sendHttpRequest('PUT', endpoint, params, true, {
        cache: 'no-store',
      })
      if (response && response.resultType === 'success') {
        const { resultType, data, status } = response
        alert(data)
        if (String(status).split('')[0] != '2') {
          return
        }
        openReport('bdfnDsps', makeReportString())
        callRefetch(pageUrl, dispatch)
        dispatch(clearBfdnDspsTypeInfo())
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
    const keys = Object.keys(params)
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
        open={bdfnDspsInfo.BDModalOpen}
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
              <h2>처분 사전 통지서</h2>
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
            <div>
              <div style={{ margin: '5px 0px 5px 0px' }}>
                시행일 : {getDateCustomFormatYMD(params.bfdnMdfcnYmd, '.')}
              </div>
              <div style={{ margin: '5px 0px 5px 0px' }}>
                {' '}
                수신자 : {params.bfdnVonrNm} 차주 귀하
              </div>
            </div>
            <div>
              <TableContainer>
                <Table className="table table-bordered">
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={8}>
                        「행정절차법」 제21조 제1항에 따라 우리 기관이 하고자
                        하는 처분의 내용을 통지하오니 의견을 제출하여 주시기
                        바랍니다.
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head" style={{ width: '15%' }}>
                        예정된 처분의 제목
                      </TableCell>
                      <TableCell colSpan={7}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnDspsTtl"
                          name="bfdnDspsTtl"
                          value={params.bfdnDspsTtl}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell rowSpan={3} className="td-head">
                        당사자
                      </TableCell>
                      <TableCell
                        colSpan={1}
                        className="td-head"
                        style={{ width: '10%' }}
                      >
                        성명(명칭)
                      </TableCell>
                      <TableCell colSpan={6}>{params.bfdnVonrNm}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={1} className="td-head">
                        차량번호
                      </TableCell>
                      <TableCell colSpan={6}>{params.bfdnVhclNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={1} className="td-head">
                        주소
                      </TableCell>
                      <TableCell colSpan={6}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnAddr"
                          name="bfdnAddr"
                          value={params.bfdnAddr}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={1} className="td-head">
                        처분의 원인이 되는 사실
                      </TableCell>
                      <TableCell colSpan={7}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnDspsRsnCn"
                          name="bfdnDspsRsnCn"
                          value={params.bfdnDspsRsnCn}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={1} className="td-head">
                        처분하고자 하는 내용
                      </TableCell>
                      <TableCell colSpan={7}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnDspsCn"
                          name="bfdnDspsCn"
                          value={params.bfdnDspsCn}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={1} className="td-head">
                        법적근거 및 조문내용
                      </TableCell>
                      <TableCell colSpan={7}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnLglBssCn"
                          name="bfdnLglBssCn"
                          value={params.bfdnLglBssCn}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell rowSpan={4} className="td-head">
                        의견제출
                      </TableCell>
                      <TableCell rowSpan={3} className="td-head">
                        제출처
                      </TableCell>
                      <TableCell className="td-head" style={{ width: '7%' }}>
                        기관명
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnSbmsnOfficInstNm"
                          name="bfdnSbmsnOfficInstNm"
                          value={params.bfdnSbmsnOfficInstNm}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell className="td-head" style={{ width: '7%' }}>
                        부서명
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnSbmsnOfficDeptNm"
                          name="bfdnSbmsnOfficDeptNm"
                          value={params.bfdnSbmsnOfficDeptNm}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell className="td-head" style={{ width: '7%' }}>
                        담당자
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnSbmsnOfficPicNm"
                          name="bfdnSbmsnOfficPicNm"
                          value={params.bfdnSbmsnOfficPicNm}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell rowSpan={2} className="td-head">
                        주소
                      </TableCell>
                      <TableCell rowSpan={2} colSpan={3} height={'110px'}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnSbmsnOfficAddr"
                          name="bfdnSbmsnOfficAddr"
                          value={params.bfdnSbmsnOfficAddr}
                          onChange={handleSearchChange}
                          fullWidth
                          sx={{
                            height: '100%',
                            '& .MuiInputBase-root': {
                              height: '100%',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell className="td-head">전화번호</TableCell>
                      <TableCell>
                        <CustomTextField
                          type="tel"
                          id="ft-bfdnSbmsnOfficTelno"
                          name="bfdnSbmsnOfficTelno"
                          value={params.bfdnSbmsnOfficTelno}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head">팩스번호</TableCell>
                      <TableCell>
                        <CustomTextField
                          type="tel"
                          id="ft-bfdnSbmsnOfficFxno"
                          name="bfdnSbmsnOfficFxno"
                          value={params.bfdnSbmsnOfficFxno}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="td-head">제출기한</TableCell>
                      <TableCell colSpan={6}>
                        <CustomTextField
                          type="text"
                          id="ft-bfdnSbmsnTermCn"
                          name="bfdnSbmsnTermCn"
                          value={params.bfdnSbmsnTermCn}
                          onChange={handleSearchChange}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div style={{ fontWeight: 'bold' }}>
                          {`<의견제출시 유의사항>`}
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span>1.</span>
                          <span>
                            귀하는 앞쪽의 사항에 대하여 구술ㆍ정보통신망 또는
                            별지 제11호 서식에 의한 서면으로 의견 제출을 할 수
                            있으며, 주장을 입증할 증거자료를 함께 제출할 수
                            있습니다. 다만, 정보통신망을 이용하여 의견을
                            제출하고자 하는 경우에는 미리 의견제출 기관으로
                            알려주시고, 의견을 제출한 후에 의견의 도달여부를
                            담당자에게 확인하여 주시기 바랍니다.
                          </span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span>2.</span>
                          <span>
                            의견제출 기한 내에 의견을 제출하지 아니하는 경우에는
                            의견이 없는 것으로 간주합니다.
                          </span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span>3.</span>
                          <span>
                            귀하께서 행정청에 출석하여 의견진술을 하고자 하는
                            경우에는 행정청에 미리 그 사실을 알려주십시오.
                          </span>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <span>4.</span>
                          <span>
                            그 밖에 궁금한 사항이 있으시면 의견제출 기관으로
                            문의하시기 바랍니다.
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <CustomTextField
                            type="text"
                            id="ft-bfdnRgnMayerNm"
                            name="bfdnRgnMayerNm"
                            value={params.bfdnRgnMayerNm}
                            onChange={handleSearchChange}
                            style={{ width: '30%', margin: '15px 0 15px 0' }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Box>
        </DialogContent>
        <LoadingBackdrop open={isDataProcessing} />
      </Dialog>
    </Box>
  )
}

export default BdfnDspsModal
