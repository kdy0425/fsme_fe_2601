/* React */
import React, { useEffect, useState, useCallback } from 'react'

/* mui */
import { Box, Button } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { CustomFormLabel } from '@/utils/fsms/fsm/mui-imports'

/* 공통 component */
import TxVhclSearchModal from '@/app/components/tx/popup/VhclSearchModal'
import TrVhclSearchModal from '@/app/components/tr/popup/VhclSearchModal'
import CustomTextField from '@/components/forms/theme-elements/CustomTextField'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { getUserInfo } from '@/utils/fsms/utils'
import {
  getForamtAddDay,
  getDateFormatYMD,
  getToday,
} from '@/utils/fsms/common/dateUtils'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'

/* 부모 컴포넌트에서 선언한 interface */
import { detailInfoInterface } from '../page'
import { procInterface } from './CrudButtons'
import { brNoFormatter, rrNoFormatter } from '@/utils/fsms/common/util'
/* interface, type 선언 */
interface propsInterface {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  tabIndex: string
  procType: string
  detailInfo: detailInfoInterface
  handleAdvancedSearch: () => void
}

const ModalContent = (props: propsInterface) => {
  const {
    open,
    setOpen,
    tabIndex,
    procType,
    detailInfo,
    handleAdvancedSearch,
  } = props

  const userInfo = getUserInfo()

  /* 상태관리 */
  const [vhclSchOpen, setVhclSchOpen] = useState<boolean>(false) // 모달오픈용
  const [txtLength, setTxtLength] = useState<number>(0) // 지급거절사유 길이(최대 500)
  const [strDateFlag, setStrDateFlag] = useState<boolean>(false)
  const [endDateFlag, setEndDateFlag] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태
  const [procData, setProcData] = useState<procInterface>({
    vhclNo: '',
    vonrNm: '',
    vonrBrno: '',
    vonrRrno: '',
    vonrRrnoS: '',
    bgngYmd: '',
    endYmd: '',
    chgRsnCn: '',
    hstrySn: '',
    delYn: '',
    locgovCd: '',
    koiCd: '',
    brno: '',
    crno: '',
    vhclTonCd: '',
    vhclPsnCd: '',
    vonrRrnoSe: '',
  }) // 데이터 처리용

  useEffect(() => {
    if (open) {
      if (procType == 'update') {
        setProcData((prev) => ({
          ...prev,
          vhclNo: detailInfo.vhclNo,
          vonrNm: detailInfo.vonrNm,
          vonrBrno: detailInfo.vonrBrno,
          vonrRrno: detailInfo.vonrRrno,
          vonrRrnoS: detailInfo.vonrRrnoSe,
          bgngYmd: getDateFormatYMD(detailInfo.bgngYmd),
          endYmd: getDateFormatYMD(detailInfo.endYmd),
          chgRsnCn: detailInfo.chgRsnCn,
          hstrySn: detailInfo.hstrySn,
          brno: detailInfo.brno,
          delYn: detailInfo.delYn,
          locgovCd: detailInfo.locgovCd,
          vonrRrnoSe: detailInfo.vonrRrnoSe,
        }))

        setTxtLength((detailInfo.chgRsnCn ?? '').length)
      }

      setInputAvailable()
    }
  }, [open])

  // 모달 닫기버튼 클릭시
  const modalClose = useCallback(() => {
    setVhclSchOpen(false)
  }, [])

  // 모달 로우버튼 클릭시
  const modalRowClick = useCallback((row: any) => {
    if (tabIndex == '0') {
      setProcData((prev) => ({
        ...prev,
        vhclNo: row.vhclNo,
        vonrNm: row.vonrNm,
        vonrBrno: row.vonrBrno,
        vonrRrno: row.vonrRrno,
        vonrRrnoSe: row.vonrRrnoSecure,
        locgovCd: row.locgovCd,
        koiCd: row.koiCd,
        crno: row.crno,
        vhclTonCd: row.vhclTonCd,
        vhclPsnCd: row.vhclPsnCd,
      }))
    } else {
      setProcData((prev) => ({
        ...prev,
        vhclNo: row.vhclNo,
        vonrNm: row.rprsvNm,
        vonrBrno: row.brno,
        vonrRrno: row.rprsvRrno,
        vonrRrnoS: row.rprsvRrnoS,
        locgovCd: row.locgovCd,
        koiCd: row.koiCd,
        brno: row.brno,
      }))
    }
    modalClose()
  }, [])

  // 값 변경시
  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = event.target
    if (name == 'chgRsnCn' && value.length <= 30) {
      setTxtLength(value.length)
      setProcData((prev) => ({
        ...prev,
        chgRsnCn: value.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      }))
    } else {
      setProcData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const setInputAvailable = () => {
    const isAvailable = getIsAvailable()

    if (isAvailable) {
      if (procType == 'update') {
        if (detailInfo.bgngYmd <= getToday()) {
          setStrDateFlag(true)
        }

        if (Number(detailInfo.endYmd) <= Number(getToday())) {
          setEndDateFlag(true)
        }
      }
    } else {
      setStrDateFlag(true)
      setEndDateFlag(true)
    }
  }

  const getIsAvailable = () => {
    // 신규일때
    if (procType == 'insert') {
      return true
    }

    const role = userInfo.roles[0] // 권한코드
    const userLocgovCd = userInfo.locgovCd // 담당자 지자체코드
    const dataLocgovCd = detailInfo.locgovCd // 데이터 지자체코드

    console.log(role)
    console.log(userLocgovCd)
    console.log(dataLocgovCd)
    // 관리자 권한일때
    if (role == 'ADMIN') {
      return true
    }
    // 시도권한관리자
    if (
      role == 'CTPV' &&
      dataLocgovCd.substring(0, 2) == userLocgovCd.substring(0, 2)
    ) {
      return true
    }
    // 시도권한관리자2
    if (dataLocgovCd.substring(0, 2) == userLocgovCd.substring(0, 2)) {
      const instCd = dataLocgovCd.substring(2, 5)
      if (instCd == '000' || instCd == '001' || userLocgovCd == '11009') {
        // 시도담당 + 서울시 담당
        return true
      }
    }

    // 지자체담당자
    if (dataLocgovCd == userLocgovCd) {
      return true
    }
    // 제주특별자치도(50001) 담당자일 경우 제주시, 서귀포시 소속 차량도 수정할 수 있도록 조건 수정.
    if (dataLocgovCd == '50001' && '50' == dataLocgovCd.substring(0, 2)) {
      return true
    }
  }

  // 신규
  const insertHandle = () => {
    const commBody = {
      vhclNo: procData.vhclNo,
      vonrNm: procData.vonrNm,
      vonrBrno: procData.vonrBrno,
      vonrRrno: procData.vonrRrno,
      bgngYmd: procData.bgngYmd.replaceAll('-', ''),
      endYmd: procData.endYmd.replaceAll('-', ''),
      chgRsnCn: procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      locgovCd: procData.locgovCd,
      koiCd: procData.koiCd,
      rgtrId: userInfo.lgnId,
      mdfrId: userInfo.lgnId,
    }

    if (tabIndex == '0') {
      const trBody = {
        ...commBody,
        crno: procData.crno,
        vhclTonCd: procData.vhclTonCd,
        vhclPsnCd: procData.vhclPsnCd,
      }

      fetchData('/fsm/ilg/srp/tr/insertSbsidyRejectPymnt', trBody, 'POST')
    } else {
      const txBody = {
        ...commBody,
        brno: procData.brno.replaceAll('-', ''),
      }

      fetchData('/fsm/ilg/srp/tx/createSbsidyRejectPymntTx', txBody, 'POST')
    }
  }

  // 수정
  const updateHandle = () => {
    const commBody = {
      bgngYmd: procData.bgngYmd.replaceAll('-', ''),
      endYmd: procData.endYmd.replaceAll('-', ''),
      chgRsnCn: procData.chgRsnCn,//.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      mdfrId: userInfo.lgnId,
      vhclNo: procData.vhclNo,
      hstrySn: procData.hstrySn,
    }

    if (tabIndex == '0') {
      const trBody = {
        ...commBody,
        chgSeCd: '27',
        delYn: procData.delYn,
      }

      fetchData('/fsm/ilg/srp/tr/updateSbsidyRejectPymnt', trBody, 'PUT')
    } else {
      const txBody = {
        ...commBody,
        brno: procData.brno.replaceAll('-', ''),
      }

      fetchData('/fsm/ilg/srp/tx/updateSbsidyRejectPymntTx', txBody, 'PUT')
    }
  }

  const fetchData = async (
    endPoint: string,
    body: any,
    method: 'POST' | 'PUT',
  ) => {
    if (saveValidation()) {
      const msg = method == 'POST' ? '등록' : '수정'

      if (confirm(msg + ' 하시겠습니까?')) {
        try {
          setLoadingBackdrop(true)
          const response = await sendHttpRequest(method, endPoint, body, true, {
            cache: 'no-store',
          })

          if (response && response.resultType === 'success') {
            if (tabIndex === '0') {
              alert(response.data)
            } else {
              alert(msg + '되었습니다.')
            }

            setOpen(false)
            handleAdvancedSearch() // 재조회
          } else {
            alert(response.errors?.[0].reason)
          }
        } catch (error: any) {
          console.log('error', error)
        } finally {
          setLoadingBackdrop(false)
        }
      }
    }
  }

  // 신규 및 수정 벨리데이션
  const saveValidation = () => {
    if (!procData.vhclNo) {
      alert('차량을 선택 해주세요')
    } else if (!procData.vonrNm) {
      alert('소유자명 입력 해주세요')
    } else if (!procData.vonrBrno && tabIndex == '1') {
      // 사업자등록번호는 택시만 판별
      alert('사업자등록번호 입력 해주세요')
    } else if (!procData.bgngYmd) {
      alert('지급거절시작일 입력 해주세요')
    } else if (
      new Date(procData.bgngYmd) < new Date() &&
      (procType === 'insert' || (procType === 'update' && !strDateFlag))
    ) {
      alert('지급거절시작일은 오늘 이후로 등록해야합니다.')
    } else if (!procData.endYmd) {
      alert('지급거절종료일 입력 해주세요')
    } else if (
      new Date(procData.endYmd) <= new Date() &&
      (procType === 'insert' || (procType === 'update' && !endDateFlag))
    ) {
      alert('지급거절종료일은 오늘 이후로 등록해야합니다.')
    } else if (procData.bgngYmd >= procData.endYmd) {
      alert('종료일은 시작일과 같거나 빠를 수 없습니다.')
    } else if (!procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('거절사유를 입력 해주세요')
    } else if (
      procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 500
    ) {
      alert('거절사유를 500자리 이하로 입력해주시기 바랍니다.')
    } else {
      return true
    }
    return false
  }

  return (
    <React.Fragment>
      <Dialog fullWidth={false} maxWidth={'lg'} open={open} aria-modal={false}>
        <DialogContent>
          <Box className="table-bottom-button-group">
            <CustomFormLabel className="input-label-display">
              <h2>
                {procType === 'insert'
                  ? '보조금지급거절등록'
                  : '보조금지급거절수정'}
              </h2>
            </CustomFormLabel>
            <div className=" button-right-align">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (procType === 'insert') {
                    insertHandle()
                  } else {
                    updateHandle()
                  }
                }}
              >
                저장
              </Button>
              <Button
                variant="contained"
                color="dark"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              m: 'auto',
              width: 'full',
            }}
          >
            <Box marginBottom={2} sx={{ minWidth: 1100 }}>
              <div className="table-scrollable">
                <table className="table table-bordered">
                  <caption>보조금 지급거절 등록 및 수정</caption>
                  <colgroup>
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '21%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '21%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '21%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="td-head" scope="row">
                        차량번호
                      </th>
                      <td
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{procData.vhclNo}</span>
                        <span>
                          {procType == 'insert' ? (
                            tabIndex === '0' ? (
                              <Button
                                variant="contained"
                                color="dark"
                                onClick={() => setVhclSchOpen(true)}
                                sx={{ marginRight: '2%' }}
                              >
                                선택
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="dark"
                                onClick={() => setVhclSchOpen(true)}
                                sx={{ marginRight: '2%' }}
                              >
                                선택
                              </Button>
                            )
                          ) : null}
                        </span>
                      </td>
                      <th className="td-head" scope="row">
                        소유자명
                      </th>
                      <td>{procData.vonrNm}</td>
                      <th className="td-head" scope="row">
                        사업자등록번호
                      </th>
                      <td>{brNoFormatter(procData.vonrBrno)}</td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        주민등록번호
                      </th>
                      <td>
                        {rrNoFormatter(
                          procData.vonrRrnoSe
                            ? procData.vonrRrnoSe
                            : procData.vonrRrnoS,
                        )}
                      </td>
                      <th className="td-head" scope="row">
                        지급거절시작일
                      </th>
                      <td>
                        <CustomTextField
                          type="date"
                          id="ft-bgngYmd"
                          name="bgngYmd"
                          value={procData.bgngYmd}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => handleChange(event)}
                          inputProps={{
                            min: getForamtAddDay(1),
                          }}
                          fullWidth
                          disabled={strDateFlag}
                        />
                      </td>
                      <th className="td-head" scope="row">
                        지급거절종료일
                      </th>
                      <td>
                        <CustomTextField
                          type="date"
                          id="ft-endYmd"
                          name="endYmd"
                          value={procData.endYmd}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => handleChange(event)}
                          inputProps={{
                            min: getForamtAddDay(2),
                          }}
                          fullWidth
                          disabled={endDateFlag}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="td-head" scope="row">
                        지급거절사유
                      </th>
                      <td colSpan={5}>
                        <CustomFormLabel
                          className="input-label-none"
                          htmlFor="ft-chgRsnCn"
                        >
                          지급거절사유
                        </CustomFormLabel>
                        <textarea
                          style={{
                            width: '100%',
                            height: '100px',
                            resize: 'none',
                          }}
                          id="ft-chgRsnCn"
                          name="chgRsnCn"
                          value={procData.chgRsnCn}
                          onChange={(
                            event: React.ChangeEvent<HTMLTextAreaElement>,
                          ) => handleChange(event)}
                          className="MuiTextArea-custom"
                          maxLength={500}
                        />
                        <div
                          style={{
                            marginTop: '0.5%',
                            textAlign: 'right',
                            color: 'black',
                          }}
                        >
                          {txtLength}/500
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 차량검색 모달 */}
              {vhclSchOpen ? (
                <>
                  {tabIndex == '0' ? (
                    <TrVhclSearchModal
                      title="화물 차량번호 조회"
                      open={vhclSchOpen}
                      onRowClick={modalRowClick}
                      onCloseClick={modalClose}
                    />
                  ) : (
                    <TxVhclSearchModal
                      title="택시 차량번호 조회"
                      open={vhclSchOpen}
                      onRowClick={modalRowClick}
                      onCloseClick={modalClose}
                    />
                  )}
                </>
              ) : null}
            </Box>
          </Box>

          {/* 로딩 */}
          <LoadingBackdrop open={loadingBackdrop} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

export default ModalContent
