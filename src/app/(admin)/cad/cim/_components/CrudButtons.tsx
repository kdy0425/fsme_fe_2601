import { Box, Button } from '@mui/material'
import { DetailRow } from '../page'
import { useEffect, useState } from 'react'
import FormDialog from '@/app/components/popup/FormDialog'
import ModalContent from './tr/ModalContent'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface propsInterface {
  rowIndex: number
  tabIndex: string
  detailInfo: DetailRow
  handleAdvancedSearch: () => void
  handleExcelDownload: () => void
  getData: () => void
}

export interface procInterface {
  vhclNo: string
  procGb: string
  vhclSttsCd: string
  crdcoCd: string
  cardNo: string
  chgRsnCn: string
  sendDataYn: string
  vonrRrno: string
}

const CrudButtons = (props: propsInterface) => {
  const {
    rowIndex,
    tabIndex,
    detailInfo,
    handleAdvancedSearch,
    handleExcelDownload,
    getData,
  } = props

  const userInfo = getUserInfo()

  const [remoteFlag, setRemoteFlag] = useState<boolean | undefined>(false)
  const [deleteRemoteFlag, setDeleteRemoteFlag] = useState<boolean>(false)
  const [recoverRemoteFlag, setRecoverRemoteFlag] = useState<boolean>(false)
  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)
  const [procData, setProcData] = useState<procInterface>({
    vhclNo: '',
    procGb: '',
    vhclSttsCd: '',
    crdcoCd: '',
    cardNo: '',
    chgRsnCn: '',
    sendDataYn: 'Y',
    vonrRrno: '',
  })

  const [roles, setRoles] = useState<string>()

  useEffect(() => {
    setRemoteFlag(undefined)
    setRoles(userInfo.roles[0])
  }, [rowIndex])

  // 복원(화물)
  const restoreHandle = (event: React.FormEvent) => {
    setRecoverRemoteFlag(true)
    event.preventDefault()
    if (detailInfo.rcvYn === 'N') {
      if (
        !confirm(
          '카드정보의 사업자번호와 차량정보의 사업자번호가 틀립니다.\n복원처리를 계속 진행하시겠습니까?',
        )
      ) {
        return
      }
    }

    if (!procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('복원변경사유를 입력해주세요.')
      return
    }

    if (
      procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 80
    ) {
      alert('복원변경사유를 80자리 이하로 입력해주시기 바랍니다.')
      return
    }

    let body = {
      vhclNo: detailInfo.vhclNo,
      procGb: 'R',
      vhclSttsCd: detailInfo.vhclSttsCd,
      crdcoCd: detailInfo.crdcoCd,
      cardNo: detailInfo.cardNo,
      chgRsnCn: procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      sendDataYn: procData.sendDataYn,
    }

    let endpoint: string = '/fsm/cad/cim/tr/restoreCardInfoMng'
    fetchData(endpoint, body)
  }

  // 말소(화물)
  const deletionHandle = (event: React.FormEvent) => {
    setDeleteRemoteFlag(true)
    event.preventDefault()
    if (!procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '')) {
      alert('말소변경사유를 입력해주세요.')
      return
    }

    if (
      procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 80
    ) {
      alert('말소변경사유를 80자리 이하로 입력해주시기 바랍니다.')
      return
    }

    let body = {
      vhclNo: detailInfo.vhclNo,
      procGb: 'S',
      vhclSttsCd: detailInfo.vhclSttsCd,
      crdcoCd: detailInfo.crdcoCd,
      cardNo: detailInfo.cardNo,
      chgRsnCn: procData.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
      sendDataYn: procData.sendDataYn,
    }

    let endpoint: string = '/fsm/cad/cim/tr/erasureCardInfoMng'
    fetchData(endpoint, body)
  }

  // 말소(버스)
  const deletionHandleForBus = async () => {
    if (detailInfo.cardSttsCd === '01') {
      alert('카드상태가 말소인 카드는 말소 시킬 수 없습니다.')
      return
    }

    const userConfirm = confirm('해당카드를 말소 처리하시겠습니까?')

    if (!userConfirm) {
      return
    } else {
      setLoadingBackdrop(true)
      try {
        let endpoint: string =
          `/fsm/cad/cim/bs/erasureCardInfoMng?` +
          `${detailInfo.brno ? '&brno=' + detailInfo.brno : ''}` +
          `${detailInfo.vhclNo ? '&vhclNo=' + detailInfo.vhclNo : ''}` +
          `${detailInfo.rrno ? '&rrno=' + detailInfo.rrno : ''}` +
          `${detailInfo.cardNo ? '&cardNo=' + detailInfo.cardNo : ''}`

        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success') {
          alert('말소처리 되었습니다.')
          getData()
        } else {
          alert(response.message)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingBackdrop(false)
      }
    }
  }

  const fetchData = async (endpoint: string, body: any) => {
    setLoadingBackdrop(true)
    try {
      setIsDataProcessing(true)
      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success') {
        alert(response.message)
        setIsDataProcessing(false)
        // setRemoteFlag(false)
        // setProcData((prev) => ({ ...prev, chgRsnCn: '', vonrRrno: '' }))
        getData()
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsDataProcessing(false)
      setLoadingBackdrop(false)
      closerHandler()
    }
  }

  const closerHandler = () => {
    setRemoteFlag(false)
    setDeleteRemoteFlag(false)
    setRecoverRemoteFlag(false)
    setProcData((prev) => ({
      ...prev,
      chgRsnCn: '',
      vonrRrno: '',
      sendDataYn: 'N',
    }))
  }

  return (
    <>
      <Box className="table-bottom-button-group">
        <div className="button-right-align">
          {/* 조회 */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdvancedSearch}
          >
            검색
          </Button>
          {/* 조건부 렌더링 */}
          {tabIndex === '0' ? (
            <>
              {roles === 'ADMIN' ? (
                <>
                  <Box
                    component="form"
                    onSubmit={restoreHandle}
                    id="restoreForm"
                  >
                    <FormDialog
                      size="lg"
                      buttonLabel="복원"
                      title="유류구매카드 복원 처리"
                      formLabel="저장"
                      formId="restoreForm"
                      remoteFlag={recoverRemoteFlag}
                      closeHandler={closerHandler}
                      children={
                        <ModalContent
                          procData={procData}
                          setProcData={setProcData}
                          isDataProcessing={isDataProcessing}
                        />
                      }
                    />
                  </Box>
                  <Box
                    component="form"
                    onSubmit={deletionHandle}
                    id="deletionForm"
                  >
                    <FormDialog
                      size="lg"
                      buttonLabel="말소"
                      title="유류구매카드 말소 처리"
                      formLabel="저장"
                      formId="deletionForm"
                      remoteFlag={deleteRemoteFlag}
                      closeHandler={closerHandler}
                      children={
                        <ModalContent
                          procData={procData}
                          setProcData={setProcData}
                          isDataProcessing={isDataProcessing}
                        />
                      }
                    />
                  </Box>
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              {tabIndex === '1' ? (
                <></>
              ) : (
                <>
                  {roles === 'ADMIN' ? (
                    <>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={deletionHandleForBus}
                      >
                        말소
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </>
          )}
          {/* 엑셀 */}
          <Button
            variant="contained"
            color="success"
            onClick={handleExcelDownload}
          >
            엑셀
          </Button>
        </div>
        <LoadingBackdrop open={loadingBackdrop} />
      </Box>
    </>
  )
}

export default CrudButtons
