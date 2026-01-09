import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getToday } from '@/utils/fsms/common/comm'
import { getDateFormatYMD } from '@/utils/fsms/common/dateUtils'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  brNoFormatter,
  rrNoFormatter,
} from '../../../../../utils/fsms/common/util'
import { Row } from './TrPage'
import moment from 'moment'

interface ModalProperties {
  data: Row
  reload: () => void
}

const TrModalContent = (props: ModalProperties) => {
  const { data, reload } = props

  const [isDataProcessing, setIsDataProcessing] = useState<boolean>(false)
  const [isBgngPassed, setIsBgngPassed] = useState<boolean>(false)
  const [isEndPassed, setIsEndPassed] = useState<boolean>(false)

  const [params, setParams] = useState({
    hstrySn: '',
    vhclNo: '',
    vonrNm: '',
    vonrBrno: '',
    vonrRrno: '',
    vonrRrnoSecure: '',
    bgngYmd: '',
    endYmd: '',
    chgRsnCn: '',
  })

  useEffect(() => {
    if (data) {
      if (new Date(getDateFormatYMD(data.bgngYmd)) < new Date()) {
        setIsBgngPassed(true)
      }

      if (new Date(getDateFormatYMD(data.endYmd)) < new Date()) {
        setIsEndPassed(true)
      }

      setParams((prev) => ({
        ...prev,
        hstrySn: data.hstrySn,
        vhclNo: data.vhclNo,
        vonrNm: data.vonrNm,
        vonrBrno: data.vonrBrno,
        vonrRrno: data.vonrRrno,
        vonrRrnoSecure: data.vonrRrnoSecure,
        bgngYmd: getDateFormatYMD(data.bgngYmd),
        endYmd: getDateFormatYMD(data.endYmd),
        chgRsnCn: data.chgRsnCn,
      }))
    }
  }, [data])

  const handleParamChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const validation = (): boolean => {
    let { bgngYmd, endYmd } = params

    if (!bgngYmd) {
      alert('지급정지시작일을 입력해야 합니다.')
      return false
    }
    if (!isBgngPassed) {
      if (bgngYmd.replaceAll('-', '') < getToday()) {
        alert('지급정지시작일은 오늘날짜 이후여야 합니다.')
        return false
      }
    }

    if (!endYmd) {
      alert('지급정지종료일을 입력해야 합니다.')
      return false
    }
    if (!isEndPassed) {
      if (endYmd.replaceAll('-', '') < getToday()) {
        alert('지급정지종료일은 오늘날짜 이후여야 합니다.')
        return false
      }
    }
    if (bgngYmd.replaceAll('-', '') < bgngYmd.replaceAll('-', '')) {
      alert('지급정지종료일은 지급정지시작일 이후여야 합니다.')
      return false
    }

    if(params.chgRsnCn.replaceAll(/\n/g, '').replaceAll(/\t/g, '').length > 60){
      alert('지급정지사유를 60자리 이하로 입력해주시기 바랍니다.')
      return false
    }

    return true
  }

  const sendData = async () => {
    if (!validation()) return

    if (!confirm('지급정지 정보를 변경하시겠습니까?')) {
      return
    }

    try {
      let endpoint: string = `/fsm/ilg/ssp/tr/updateSbsidyStopPymnt`

      let body = {
        hstrySn: params.hstrySn,
        vhclNo: params.vhclNo,
        chgRsnCn: params.chgRsnCn,//.replaceAll(/\n/g, '').replaceAll(/\t/g, ''),
        bgngYmd: params.bgngYmd.replaceAll('-', ''),
        endYmd: params.endYmd.replaceAll('-', ''),
      }

      setIsDataProcessing(true)

      const response = await sendHttpRequest('PUT', endpoint, body, true, {
        cache: 'no-store',
      })

      if (response && response.resultType == 'success') {
        alert(response.message)
      } else {
        console.log(response.message)
      }
    } catch (error) {
      console.error('Error ::: ', error)
    } finally {
      setIsDataProcessing(false)
      reload()
    }
  }

  const modifyTrData = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    await sendData()
  }

  return (
    // <Box className="table-scrollable">
    <Box
      component="form"
      id="send-tr-modify"
      onSubmit={modifyTrData}
      className="table-scrollable"
      style={{ minWidth: '1200px' }}
    >
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              차량번호
            </th>
            <td>{params.vhclNo}</td>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              소유자명
            </th>
            <td>{params.vonrNm}</td>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              주민등록번호
            </th>
            <td>{rrNoFormatter(params.vonrRrnoSecure)}</td>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              사업자등록번호
            </th>
            <td>{brNoFormatter(params.vonrBrno)}</td>
          </tr>
          <tr>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              지급정지시작일
            </th>
            <td style={{ width: '12.5%' }}>
              <CustomTextField
                type="date"
                id="ft-bgngYmd"
                name="bgngYmd"
                value={params.bgngYmd}
                disabled={isBgngPassed}
                onChange={handleParamChange}
                fullWidth
              />
            </td>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              지급정지종료일
            </th>
            <td style={{ width: '12.5%' }}>
              <CustomTextField
                type="date"
                id="ft-endYmd"
                name="endYmd"
                value={params.endYmd}
                disabled={isEndPassed}
                onChange={handleParamChange}
                fullWidth
              />
            </td>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}></th>
            <td style={{ width: '12.5%' }}></td>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}></th>
            <td style={{ width: '12.5%' }}></td>
          </tr>
          <tr>
            <th className="td-head" scope="row" style={{ width: '12.5%' }}>
              지급정지사유
            </th>
            <td colSpan={7}>
              <CustomFormLabel className="input-label-none" htmlFor="chgRsnCn">
                지급정지사유
              </CustomFormLabel>
              <textarea
                className="MuiTextArea-custom"
                id="chgRsnCn"
                name="chgRsnCn"
                value={params.chgRsnCn}
                onChange={handleParamChange}
                // multiline
                rows={5}
                // fullWidth
              />
            </td>
          </tr>
        </tbody>
      </table>
      <LoadingBackdrop open={isDataProcessing} />
    </Box>
  )
}

export default TrModalContent
