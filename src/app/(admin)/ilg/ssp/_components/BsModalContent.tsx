import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getToday } from '@/utils/fsms/common/comm'
import { CustomFormLabel, CustomTextField } from '@/utils/fsms/fsm/mui-imports'
import { Box, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getDateTimeString } from '../../../../../utils/fsms/common/util'
import { getForamtAddDay } from '@/utils/fsms/common/dateUtils'
import { Row } from './TrPage'
import VhclSearchModal, {
  VhclRow,
} from '@/app/components/bs/popup/VhclSearchModal'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

interface ModalProperties {
  data: Row | null
  reload: () => void
  type: 'CREATE' | 'UPDATE'
}

const BsModalContent = (props: ModalProperties) => {
  const { data, reload, type } = props

  const [params, setParams] = useState({
    hstrySn: '',
    vhclNo: '',
    brno: '',
    stopBgngYmd: '',
    stopEndYmd: '',
    stopRsnCn: '',
  })

  const [openVhclModal, setOpenVhclModal] = useState<boolean>(false)
  const [loadingBackdrop, setLoadingBackdrop] = useState(false)

  useEffect(() => {
    if (type == 'UPDATE' && data) {
      setParams((prev) => ({
        ...prev,
        hstrySn: String(Number(data.hstrySn)),
        vhclNo: data.vhclNo,
        brno: data.brno,
        stopBgngYmd:
          getDateTimeString(data.stopBgngYmd, 'date')?.dateString ?? '',
        stopEndYmd:
          getDateTimeString(data.stopEndYmd, 'date')?.dateString ?? '',
        stopRsnCn: data.stopRsnCn,
      }))
    }
  }, [type, data])

  const handleParamChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    if (name == 'stopBgngYmd') {
      if (value.replaceAll('-', '') < getToday()) {
        alert('지급정지시작일은 오늘날짜 이후여야 합니다.')
        return
      }
    }

    if (name == 'stopEndYmd') {
      if (!params.stopBgngYmd) {
        alert('지급정지시작일을 먼저 입력해야 합니다.')
        return
      } else if (value.replaceAll('-', '') < getToday()) {
        alert('지급정지종료일은 오늘날짜 이후여야 합니다.')
        return
      } else if (
        value.replaceAll('-', '') < params.stopBgngYmd.replaceAll('-', '')
      ) {
        alert('지급정지종료일은 지급정지시작일 이후여야 합니다.')
        return
      }
    }

    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const sendData = async () => {
    try {
      if (!params.vhclNo || !params.brno) {
        alert('차량정보를 선택해주세요.')
        return
      }

      if (!params.stopBgngYmd) {
        alert('지급정지시작일을 입력해주세요.')
        return
      }

      if (!params.stopEndYmd) {
        alert('지급정지종료일을 입력해주세요.')
        return
      }
      if (
        !confirm(
          type === 'CREATE'
            ? '차량정지정보를 등록하시겠습니까?'
            : '차량정지정보를 수정하시겠습니까?',
        )
      ) {
        return
      }
      setLoadingBackdrop(true)
      let endpoint: string =
        type == 'CREATE'
          ? `/fsm/ilg/ssp/bs/createSbsidyStopPymnt`
          : `/fsm/ilg/ssp/bs/updateSbsidyStopPymnt`

      let body = {
        ...params,
        stopBgngYmd: params.stopBgngYmd.replaceAll('-', ''),
        stopEndYmd: params.stopEndYmd.replaceAll('-', ''),
      }

      const response = await sendHttpRequest(
        type == 'CREATE' ? 'POST' : 'PUT',
        endpoint,
        body,
        true,
        {
          cache: 'no-store',
        },
      )

      if (response && response.resultType == 'success') {
        alert(response.message)
        reload()
      } else {
        console.log(response.message)
      }
    } catch (error) {
      console.error('Error ::: ', error)
    } finally {
      setLoadingBackdrop(false)
    }
  }

  const handleVhclRowClick = (row: VhclRow) => {
    setParams((prev) => ({
      ...prev,
      vhclNo: row.vhclNo,
      brno: row.brno,
    }))
    setOpenVhclModal(false)
  }

  const submitData = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    await sendData()
  }

  return (
    // <Box className="table-scrollable">
    <Box
      component="form"
      id="send-tr-modify"
      onSubmit={submitData}
      className="table-scrollable"
      style={{ minWidth: '1200px' }}
    >
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '16.5%' }}
            >
              차량번호
            </th>
            <td
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              <span>{params.vhclNo}</span>
              {type === 'CREATE' ? (
                <Button
                  sx={{ marginRight: '2%' }}
                  onClick={() => setOpenVhclModal(true)}
                  variant="contained"
                  color="dark"
                >
                  선택
                </Button>
              ) : (
                <></>
              )}
            </td>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '16.5%' }}
            >
              지급정지시작일
            </th>
            <td style={{ width: '16.5%' }}>
              <CustomTextField
                type="date"
                id="ft-stopBgngYmd"
                name="stopBgngYmd"
                value={params.stopBgngYmd}
                onChange={handleParamChange}
                fullWidth
                inputProps={{
                  min: getForamtAddDay(1),
                }}
              />
            </td>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '16.5%' }}
            >
              지급정지종료일
            </th>
            <td style={{ width: '16.5%' }}>
              <CustomTextField
                type="date"
                id="ft-stopEndYmd"
                name="stopEndYmd"
                value={params.stopEndYmd}
                onChange={handleParamChange}
                fullWidth
                inputProps={{
                  min: params.stopBgngYmd,
                }}
              />
            </td>
          </tr>
          <tr>
            <th
              className="td-head td-left"
              scope="row"
              style={{ width: '16.5%' }}
            >
              지급정지사유
            </th>
            <td colSpan={7}>
            <CustomFormLabel className="input-label-none" htmlFor="stopRsnCn">지급정지사유</CustomFormLabel>
              <textarea className="MuiTextArea-custom"
                id="stopRsnCn"
                name="stopRsnCn"
                value={params.stopRsnCn}
                onChange={handleParamChange}
                // multiline
                rows={5}
                // fullWidth
              />
            </td>
          </tr>
        </tbody>
      </table>
      <VhclSearchModal
        title={'차량번호 조회'}
        url={'/fsm/ilg/ssp/bs/getUserVhcle'}
        open={openVhclModal}
        onRowClick={handleVhclRowClick}
        onCloseClick={() => setOpenVhclModal(false)}
      />
      <LoadingBackdrop open={loadingBackdrop} />
    </Box>
  )
}

export default BsModalContent
